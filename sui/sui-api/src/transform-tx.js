const parseTransaction = ({ transaction, asset }) => {
  const { data } = transaction
  const {
    sender,
    transaction: { inputs },
  } = data

  const recipient = inputs.find(
    (input) => input.type === 'pure' && input.valueType === 'address'
  )?.value

  const amount = inputs.find((input) => input.type === 'pure' && input.valueType === 'u64')?.value

  return {
    from: sender,
    to: recipient,
    coinAmount: amount ? asset.currency.baseUnit(amount) : asset.currency.ZERO,
  }
}

export const getGasBudget = ({ gasUsed, feeAsset }) => {
  // gas_budget >= max{computation_fees,total_gas_fees}

  const { currency } = feeAsset

  const totalFee = getFeeAmount({ gasUsed, feeAsset })

  const computationAndStorageFee = currency
    .baseUnit(gasUsed.computationCost)
    .add(currency.baseUnit(gasUsed.storageCost))

  if (computationAndStorageFee.gt(totalFee)) {
    return computationAndStorageFee
  }

  return totalFee
}

export const getFeeAmount = ({ gasUsed, feeAsset }) => {
  const { currency } = feeAsset
  return currency
    .baseUnit(gasUsed.computationCost)
    .add(currency.baseUnit(gasUsed.storageCost))
    .sub(currency.baseUnit(gasUsed.storageRebate))
    .clampLowerZero()
}

const parseConfirmations = ({ effects }) => {
  const { status, gasObject } = effects

  if (!status?.status || !gasObject?.reference?.version) {
    return {
      confirmations: 0,
      error: 0,
    }
  }

  return {
    confirmations: 1,
    error: status.status === 'failure' ? status.error : false,
  }
}

export function transformTransactions({ transactionResults, address, feeAsset, asset }) {
  if (transactionResults.length === 0) return []
  return transactionResults.map((transactionResult) => {
    const { effects, transaction, timestampMs } = transactionResult
    const { gasUsed } = effects

    const { from, to, coinAmount } = parseTransaction({ transaction, asset })
    const { confirmations, error } = parseConfirmations({ effects })
    const wasSend = from === address
    const args = Object.create(null)

    if (wasSend) {
      args.to = to
      args.feeAmount = getFeeAmount({ gasUsed, feeAsset })
      args.feeCoinName = feeAsset.name
      args.coinAmount = coinAmount.negate()
    } else {
      args.from = [from]
      args.coinAmount = coinAmount
    }

    return {
      txId: transactionResult.digest,
      date: new Date(parseInt(timestampMs, 10)),
      selfSend: wasSend && from === to,
      confirmations,
      error,
      data: Object.create(null),
      currencies: {
        [asset.name]: asset.currency,
        [feeAsset.name]: feeAsset.currency,
      },
      coinName: asset.name,
      ...args,
    }
  })
}
