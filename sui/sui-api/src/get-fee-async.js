import { MIN_GAS_BUDGET } from '@exodus/sui-lib'
import assert from 'minimalistic-assert'

import { getFeeAmount, getGasBudget } from './transform-tx.js'

export const getFeeAsyncFactory = ({ assetClientInterface, serverApi, createUnsignedTx }) => {
  assert(assetClientInterface, 'assetClientInterface is required')

  return async ({
    asset,
    walletAccount,
    toAddress: recipientAddress,
    fromAddress: senderAddress,
    amount,
  }) => {
    const feeAsset = asset.feeAsset

    const { txData } = await createUnsignedTx({
      asset,
      senderAddress,
      walletAccount,
      recipientAddress: recipientAddress || senderAddress,
      amount: amount.toBaseString(),
      serverApi,
      gasBudget: MIN_GAS_BUDGET,
      buildOptions: {
        onlyTransactionKind: true,
      },
    })

    const simulation = await serverApi.client.devInspectTransactionBlock({
      sender: senderAddress,
      transactionBlock: txData,
    })

    const { gasUsed } = simulation.effects

    assert(
      gasUsed?.computationCost && gasUsed?.storageCost && gasUsed?.storageRebate,
      'Invalid simulation result'
    )

    const fee = getFeeAmount({
      feeAsset,
      gasUsed,
    })

    const baseAssetAccountState = await assetClientInterface.getAccountState({
      assetName: asset.baseAsset.name,
      walletAccount,
    })

    const gasBudget = getGasBudget({ gasUsed, feeAsset })

    const balance = baseAssetAccountState.utxos.value

    if (fee.lt(asset.feeAsset.currency.baseUnit(MIN_GAS_BUDGET))) {
      // sometimes we can receive a negative fee because of storage rebate
      // so we use the gas budget instead

      return {
        fee: gasBudget,
        gasBudget: gasBudget.toNumber(),
      }
    }

    if (gasBudget.gt(balance)) {
      // if the gas budget is greater than balance, allow to try to send with fee
      return {
        fee,
        gasBudget: fee.toNumber(),
      }
    }

    return {
      fee,
      gasBudget: gasBudget.toNumber(),
    }
  }
}
