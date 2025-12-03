import { BaseMonitor } from '@exodus/asset-lib'
import { SynchronizedTime } from '@exodus/basic-utils'
import { Address, UtxoCollection } from '@exodus/models'
import { coinTypes, RPC_URL } from '@exodus/sui-lib'
import lodash from 'lodash'
import assert from 'minimalistic-assert'
import ms from 'ms'

import { transformTransactions } from './transform-tx.js'

const { isEmpty, unionBy, zipObject } = lodash

export const UNCONFIRMED_TX_LIMIT = ms('5m')

export class SuiNoHistoryMonitor extends BaseMonitor {
  #serverApi

  constructor({ asset, serverApi, interval = ms('15s'), assetClientInterface, runner, logger }) {
    super({
      asset,
      interval,
      assetClientInterface,
      logger,
      runner,
    })
    assert(serverApi, 'Sui Node API Client is required!')

    this.#serverApi = serverApi
    this.assets = Object.create(null)
  }

  // public methods

  setServer(remoteConfig) {
    this.#serverApi.setServer({
      rpcUrl: remoteConfig?.rpcUrl || RPC_URL,
    })
  }

  async tick({ refresh, walletAccount }) {
    const assetName = this.asset.name
    this.assets = await this.aci.getAssetsForNetwork({ baseAssetName: assetName })

    const ourWalletAddress = await this.aci.getReceiveAddress({ assetName, walletAccount })

    const { utxos, tokenUtxos, unknownAssetIds } = await this.#getNewAccountState({
      address: ourWalletAddress,
    })

    if (unknownAssetIds.length > 0) {
      this.emit('unknown-tokens', unknownAssetIds)
    }

    let batch = this.aci.createOperationsBatch()

    batch = await this.aci.updateAccountStateBatch({
      assetName,
      walletAccount,
      newData: {
        utxos,
        tokenUtxos,
      },
      batch,
    })

    const { txsToRemoveByAsset, txLogItemsByAsset } = await this.#resolvePendingTransactions({
      assets: this.assets,
      walletAccount,
      ourWalletAddress,
      refresh,
    })

    for (const [assetName, txsToRemove] of Object.entries(txsToRemoveByAsset)) {
      batch = await this.aci.removeTxLogBatch({ assetName, walletAccount, txs: txsToRemove, batch })
    }

    for (const [assetName, txLogItems] of Object.entries(txLogItemsByAsset)) {
      batch = await this.aci.updateTxLogAndNotifyBatch({
        assetName,
        walletAccount,
        txs: txLogItems,
        batch,
        refresh,
      })
    }

    await this.aci.executeOperationsBatch(batch)
  }

  #checkPendingTransactions = ({ pendingTransactions, pendingTxsFromNode }) => {
    const txsToUpdate = []
    const txsToRemove = []
    const now = SynchronizedTime.now()

    if (isEmpty(pendingTransactions)) {
      return {
        txsToUpdate,
        txsToRemove,
      }
    }

    for (const tx of pendingTransactions) {
      const txFromNode = pendingTxsFromNode[tx.txId]
      if (txFromNode) {
        if (txFromNode.error === false) {
          txsToUpdate.push({ ...tx, error: false, confirmations: 1 })
        } else if (txFromNode.error === true) {
          txsToUpdate.push({ ...tx, confirmations: 1 })
        }
      } else {
        if (now - tx.date.getTime() > UNCONFIRMED_TX_LIMIT) {
          txsToRemove.push(tx)
        }
      }
    }

    return {
      txsToUpdate,
      txsToRemove,
    }
  }

  #getTransactionsFromNode = async ({ digests, ourWalletAddress, asset }) => {
    if (digests.length === 0) return []

    const transactions = await this.#serverApi.getTransactions({
      txIds: digests,
    })

    const parsedTxs = transformTransactions({
      transactionResults: transactions,
      address: ourWalletAddress,
      feeAsset: asset.feeAsset,
      asset,
    })

    const txIds = parsedTxs.map(({ txId }) => txId)

    return zipObject(txIds, parsedTxs)
  }

  #resolvePendingTransactions = async ({ assets, walletAccount, ourWalletAddress }) => {
    const txsToRemoveByAsset = Object.create(null)
    const txLogItemsByAsset = Object.create(null)

    for (const [assetName, asset] of Object.entries(assets)) {
      const { pendingTransactions } = await this.#getPendingTransactionsByAsset({
        assetName,
        walletAccount,
      })

      if (pendingTransactions.length === 0) continue

      const pendingTxsFromNode = await this.#getTransactionsFromNode({
        digests: pendingTransactions.map((tx) => tx.txId),
        asset,
        ourWalletAddress,
      })

      const { txsToUpdate: logItems, txsToRemove } = await this.#checkPendingTransactions({
        pendingTransactions,
        pendingTxsFromNode,
      })

      if (txsToRemove.length > 0) {
        txsToRemoveByAsset[assetName] = txsToRemove
      }

      if (logItems.length > 0) {
        txLogItemsByAsset[assetName] = logItems
      }
    }

    return { txsToRemoveByAsset, txLogItemsByAsset }
  }

  #getPendingTransactionsByAsset = async ({ assetName, walletAccount }) => {
    const { stale, unconfirmed } = await this.#deriveTransactionsToCheck({
      assetName,
      walletAccount,
    })

    const pendingTransactions = unionBy(Object.values(stale), Object.values(unconfirmed), 'tx.txId')

    return { pendingTransactions }
  }

  #deriveTransactionsToCheck = async ({ assetName, walletAccount }) => {
    const txLog = await this.aci.getTxLog({ assetName, walletAccount })
    const { stale, unconfirmed } = this.getUnconfirmed({
      txSet: txLog,
      staleTxAge: UNCONFIRMED_TX_LIMIT,
    })

    return {
      stale: stale.map((tx) => txLog.get(tx.txId)).filter(Boolean),
      unconfirmed: unconfirmed.map((txId) => txLog.get(txId)).filter(Boolean),
    }
  }

  #getNewAccountState = async ({ address }) => {
    const allCoins = await this.#serverApi.getAllCoins({
      owner: address,
    })

    const groupedCoins = allCoins.reduce((acc, coin) => {
      if (!acc[coin.coinType]) {
        acc[coin.coinType] = []
      }

      acc[coin.coinType].push(coin)
      return acc
    }, Object.create(null))

    const tokenUtxos = Object.create(null)
    let baseUtxos = UtxoCollection.createEmpty({
      currency: this.asset.currency,
    })

    const unknownAssetIds = new Set(
      Object.keys(groupedCoins).filter((coinType) => coinType !== coinTypes.Base)
    )

    for (const [assetName, asset] of Object.entries(this.assets)) {
      const isBaseAsset = asset.baseAssetName === asset.name
      if (isBaseAsset) {
        baseUtxos = this.#formatUtxos({
          address,
          coinType: coinTypes.Base,
          coins: groupedCoins[coinTypes.Base] || [],
          asset,
        })
        continue
      }

      if (!unknownAssetIds.delete(asset.assetId)) continue

      tokenUtxos[assetName] = this.#formatUtxos({
        address,
        coinType: asset.assetId,
        coins: groupedCoins[asset.assetId] || [],
        asset,
      })
    }

    return {
      utxos: baseUtxos,
      tokenUtxos,
      unknownAssetIds: [...unknownAssetIds],
    }
  }

  #formatUtxos = ({ coinType, coins, asset, address }) => {
    if (coins.length === 0) {
      return UtxoCollection.createEmpty({
        currency: asset.currency,
      })
    }

    const utxoItems = coins.map((coin) => {
      return {
        address: Address.create(address, { path: 'm/0/0' }),
        txId: coin.previousTransaction,
        digest: coin.digest,
        coinObjectId: coin.coinObjectId,
        version: coin.version,
        coinType,
        confirmations: 1,
        value: asset.currency.baseUnit(coin.balance),
      }
    })

    return UtxoCollection.fromArray(utxoItems, { currency: asset.currency })
  }
}

export const createSuiNoHistoryMonitor = (args) => new SuiNoHistoryMonitor(args)
