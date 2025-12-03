import { UtxoCollection } from '@exodus/models'
import assert from 'minimalistic-assert'

import { Transaction } from './vendors/transactions/index.js'

export const createUnsignedTxFactory = ({ assetClientInterface, serverApi }) => {
  assert(assetClientInterface, 'assetClientInterface is required')
  return async ({
    asset,
    senderAddress,
    recipientAddress,
    amount,
    gasBudget,
    walletAccount,
    buildOptions = Object.create(null),
  }) => {
    const accountState = await assetClientInterface.getAccountState({
      assetName: asset.baseAssetName,
      walletAccount,
    })

    const txb = new Transaction()

    txb.setGasBudget(BigInt(gasBudget))

    if (asset.name === asset.baseAssetName) {
      txb.transferObjects([txb.splitCoins(txb.gas, [amount])], txb.pure.address(recipientAddress))
      txb.setSender(senderAddress)

      return {
        txData: await txb.build({ client: serverApi.client, ...buildOptions }),
        txMeta: Object.create(null),
      }
    }

    const usedCoins = (
      accountState.tokenUtxos[asset.name] ||
      UtxoCollection.createEmpty({ currency: asset.currency })
    ).toArray()

    usedCoins.reverse()

    const coinObjectIds = usedCoins.map((coin) => coin.coinObjectId)

    const [inputCoin, ...rest] = coinObjectIds
    if (rest.length > 0) {
      txb.mergeCoins(inputCoin, rest)
    }

    const [coin] = txb.splitCoins(inputCoin, [amount])

    txb.transferObjects([coin], txb.pure.address(recipientAddress))
    txb.setSender(senderAddress)

    return {
      txData: await txb.build({ client: serverApi.client, ...buildOptions }),
      txMeta: Object.create(null),
    }
  }
}
