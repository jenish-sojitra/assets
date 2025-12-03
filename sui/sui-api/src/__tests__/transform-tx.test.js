import { processAssets } from '@exodus/assets-testing'
import { UnitType } from '@exodus/currency'
import _assets from '@exodus/sui-meta'
import lodash from 'lodash'

import { transformTransactions } from '../transform-tx.js'
import {
  suiFailedTransaction,
  suiSuccessfulTransaction,
  usdcSuccessfulTransaction,
} from './data.js'

const { keyBy } = lodash

const assets = processAssets(keyBy(_assets, 'name'))

describe('transformTx', () => {
  const suiAsset = assets.sui
  const receiverAddress = '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f'
  const senderAddress = '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a'

  const suiTransactionResults = [suiSuccessfulTransaction, suiFailedTransaction]

  test('should transform a successful transaction for receiver', () => {
    const transactions = transformTransactions({
      transactionResults: suiTransactionResults,
      address: receiverAddress,
      asset: suiAsset,
      feeAsset: suiAsset,
    })

    expect(transactions).toHaveLength(2)
    expect(transactions.at(0)).toEqual({
      txId: suiTransactionResults.at(0).digest,
      date: new Date(parseInt(suiTransactionResults.at(0).timestampMs, 10)),
      selfSend: false,
      confirmations: 1,
      error: false,
      from: [senderAddress],
      data: Object.create(null),
      currencies: { sui: suiAsset.currency },
      coinName: 'sui',
      coinAmount: suiAsset.currency.baseUnit(10_000_000),
    })

    expect(transactions.at(1)).toEqual({
      txId: suiTransactionResults.at(1).digest,
      date: new Date(parseInt(suiTransactionResults.at(1).timestampMs, 10)),
      selfSend: false,
      confirmations: 1,
      error: 'InsufficientGas',
      from: [senderAddress],
      data: Object.create(null),
      currencies: { sui: suiAsset.currency },
      coinName: 'sui',
      coinAmount: suiAsset.currency.baseUnit(10_000_000),
    })
  })

  test('should transform a successful transaction for sender', () => {
    const transactions = transformTransactions({
      transactionResults: suiTransactionResults,
      address: senderAddress,
      asset: suiAsset,
      feeAsset: suiAsset,
    })

    expect(transactions).toHaveLength(2)
    expect(transactions.at(0)).toEqual({
      txId: suiTransactionResults.at(0).digest,
      date: new Date(parseInt(suiTransactionResults.at(0).timestampMs, 10)),
      selfSend: false,
      confirmations: 1,
      error: false,
      to: receiverAddress,
      feeAmount: suiAsset.currency.baseUnit(1_497_880),
      feeCoinName: 'sui',
      data: Object.create(null),
      currencies: { sui: suiAsset.currency },
      coinName: 'sui',
      coinAmount: suiAsset.currency.baseUnit(10_000_000).negate(),
    })

    expect(transactions.at(1)).toEqual({
      txId: suiTransactionResults.at(1).digest,
      date: new Date(parseInt(suiTransactionResults.at(1).timestampMs, 10)),
      selfSend: false,
      confirmations: 1,
      error: 'InsufficientGas',
      to: receiverAddress,
      feeAmount: suiAsset.currency.baseUnit(500_000),
      feeCoinName: 'sui',
      data: Object.create(null),
      currencies: { sui: suiAsset.currency },
      coinName: 'sui',
      coinAmount: suiAsset.currency.baseUnit(10_000_000).negate(),
    })
  })

  test('should transform successfully for usdc', () => {
    const usdcAsset = {
      assetId: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      assetType: 'SUI_TOKEN',
      baseAsset: suiAsset,
      baseAssetName: 'sui',
      bip44: 2_147_484_432,
      currency: UnitType.create({ base: 0, USDC: 6 }),
      name: 'usdc',
    }

    const transactions = transformTransactions({
      transactionResults: [usdcSuccessfulTransaction],
      address: receiverAddress,
      asset: usdcAsset,
      feeAsset: suiAsset,
    })

    expect(transactions).toHaveLength(1)
    expect(transactions.at(0)).toEqual({
      txId: usdcSuccessfulTransaction.digest,
      date: new Date(parseInt(usdcSuccessfulTransaction.timestampMs, 10)),
      selfSend: false,
      confirmations: 1,
      error: false,
      coinName: 'usdc',
      coinAmount: usdcAsset.currency.baseUnit(-400_000),
      data: Object.create(null),
      currencies: { sui: suiAsset.currency, usdc: usdcAsset.currency },
      to: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      feeAmount: suiAsset.currency.baseUnit(0),
      feeCoinName: 'sui',
    })
  })
})
