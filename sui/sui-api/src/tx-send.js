import { UtxoCollection } from '@exodus/models'
import { coinTypes, objectTypes, toCoinType } from '@exodus/sui-lib'
import assert from 'minimalistic-assert'

import { getFeeAmount } from './transform-tx.js'

const deriveNewUtxos = ({ mutatedObject, balanceChange, deletedObjects, utxos, asset }) => {
  const utxoArray = utxos.toArray()

  const deletedObjectIds = new Set(deletedObjects.map(({ objectId }) => objectId))
  const deleted = utxoArray.filter((utxo) => deletedObjectIds.has(utxo.coinObjectId))

  const deletedBalance = deleted.reduce((acc, utxo) => {
    return acc.add(utxo.value)
  }, asset.currency.baseUnit(0))

  const mutated = utxoArray.find((utxo) => utxo.coinObjectId === mutatedObject.objectId)

  const newMutatedBalance = mutated.value
    .add(deletedBalance)
    .add(asset.currency.baseUnit(balanceChange))

  const newMutated = {
    ...mutated,
    version: mutatedObject.version,
    digest: mutatedObject.digest,
    value: newMutatedBalance,
  }

  const unaffectedObjects = utxoArray.filter(
    (utxo) =>
      utxo.coinObjectId !== mutatedObject.objectId && !deletedObjectIds.has(utxo.coinObjectId)
  )

  return {
    utxos: UtxoCollection.fromArray([...unaffectedObjects, newMutated], {
      currency: asset.currency,
    }),
  }
}

const getObjectAndBalanceChangesByType = ({
  objectChanges,
  balanceChanges,
  ownerAddress,
  asset,
}) => {
  const ownerBalanceChangesByType = balanceChanges.reduce((acc, change) => {
    const { owner, coinType, amount } = change
    if (owner?.AddressOwner !== ownerAddress) {
      return acc
    }

    acc[coinType] = amount

    return acc
  }, Object.create(null))

  const wasBaseAssetSent = asset.name === asset.baseAssetName

  const ownerObjectChangesByType = objectChanges.reduce((acc, change) => {
    const { owner, objectType, type } = change

    if (!acc[objectType]) {
      acc[objectType] = {
        created: [],
        mutated: [],
        deleted: [],
      }
    }

    switch (type) {
      case 'mutated':
        if (owner?.AddressOwner !== ownerAddress) {
          return acc
        }

        acc[objectType].mutated.push(change)
        break
      case 'created':
        if (owner?.AddressOwner !== ownerAddress) {
          return acc
        }

        acc[objectType].created.push(change)
        break
      case 'deleted':
        acc[objectType].deleted.push(change)
        break
    }

    return acc
  }, Object.create(null))

  const baseObjectsMutated = ownerObjectChangesByType[objectTypes.Base]?.mutated

  if (
    !baseObjectsMutated ||
    baseObjectsMutated.length !== 1 ||
    !ownerBalanceChangesByType[coinTypes.Base]
  ) {
    // expect to have 1 mutated object at point because coins were merged
    throw new Error('In-decidable state change')
  }

  if (!wasBaseAssetSent) {
    const assetId = asset.assetId
    const coinType = toCoinType(assetId)

    const assetObjectsMutated = ownerObjectChangesByType[coinType]?.mutated

    if (
      !assetObjectsMutated ||
      assetObjectsMutated.length !== 1 ||
      !ownerBalanceChangesByType[assetId]
    ) {
      // expect to have 1 mutated object at point because coins were merged
      throw new Error('In-decidable state change')
    }
  }

  return {
    ownerObjectChangesByType,
    ownerBalanceChangesByType,
  }
}

const updateAccountStateAfterSend = async ({
  aci,
  asset,
  walletAccount,
  ownerAddress,
  result,
  amount,
  recipientAddress,
}) => {
  const { feeAsset, currency: assetCurrency, name: assetName } = asset
  const { objectChanges, balanceChanges, digest, effects } = result
  const { gasUsed } = effects
  const wasBaseAssetSent = assetName === asset.baseAssetName

  const fee = getFeeAmount({ gasUsed, feeAsset })

  const accountState = await aci.getAccountState({
    assetName: asset.baseAssetName,
    walletAccount,
  })

  const tx = {
    txId: digest,
    confirmations: 0,
    coinName: assetName,
    coinAmount: amount.abs().negate(),
    feeAmount: fee,
    feeCoinName: feeAsset.name,
    selfSend: false,
    to: recipientAddress,
    data: Object.create(null),
    currencies: { [assetName]: assetCurrency, [feeAsset.name]: feeAsset.currency },
  }

  const { ownerObjectChangesByType, ownerBalanceChangesByType } = getObjectAndBalanceChangesByType({
    objectChanges,
    balanceChanges,
    ownerAddress,
    asset,
  })

  const newAccountState = Object.create(null)

  const newBaseUtxos = deriveNewUtxos({
    mutatedObject: ownerObjectChangesByType[objectTypes.Base].mutated[0],
    balanceChange: ownerBalanceChangesByType[coinTypes.Base],
    deletedObjects: ownerObjectChangesByType[objectTypes.Base].deleted,
    utxos: accountState.utxos,
    asset: asset.baseAsset,
  })

  newAccountState.utxos = newBaseUtxos.utxos

  if (!wasBaseAssetSent) {
    const coinType = toCoinType(asset.assetId)
    const newTokenUtxos = deriveNewUtxos({
      mutatedObject: ownerObjectChangesByType[coinType].mutated[0],
      balanceChange: ownerBalanceChangesByType[asset.assetId],
      deletedObjects: ownerObjectChangesByType[coinType].deleted,
      utxos: accountState.tokenUtxos[asset.name],
      asset,
    })

    newAccountState.tokenUtxos = { [asset.name]: newTokenUtxos.utxos }
  }

  let batch = aci.createOperationsBatch()

  batch = await aci.updateAccountStateBatch({
    assetName: asset.baseAssetName,
    walletAccount,
    newData: {
      utxos: newAccountState.utxos,
      tokenUtxos: {
        ...accountState.tokenUtxos,
        ...(newAccountState.tokenUtxos && newAccountState.tokenUtxos[asset.name]
          ? { [asset.name]: newAccountState.tokenUtxos[asset.name] }
          : Object.create(null)),
      },
    },
    batch,
  })

  batch = await aci.updateTxLogAndNotifyBatch({ assetName, walletAccount, txs: [tx], batch })

  await aci.executeOperationsBatch(batch)
}

export const txSendFactory = ({ assetClientInterface: aci, serverApi, createUnsignedTx }) => {
  assert(aci, 'assetClientInterface is required')

  return async ({
    asset,
    walletAccount,
    address: recipientAddress,
    amount,
    gasBudget,
    feeOpts,
  }) => {
    const { name: assetName } = asset

    const senderAddress = await aci.getReceiveAddress({ assetName, walletAccount })

    const unsignedTx = await createUnsignedTx({
      asset,
      senderAddress,
      recipientAddress,
      amount: amount.toBaseString(),
      serverApi,
      gasBudget: gasBudget || feeOpts.gasBudget,
      walletAccount,
    })

    const { plainTx } = await aci.signTransaction({ assetName, unsignedTx, walletAccount })

    const result = await serverApi.broadcastTx(plainTx)

    await updateAccountStateAfterSend({
      aci,
      asset,
      walletAccount,
      ownerAddress: senderAddress,
      result,
      amount,
      recipientAddress,
    })
    return { txId: result.digest }
  }
}
