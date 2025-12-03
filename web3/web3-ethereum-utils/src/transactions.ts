import { getEthereumJsTxByTransactionBuffer } from '@exodus/ethereum-lib'
import SolidityContract from '@exodus/solidity-contract'

import type { EthTransaction } from './types.js'
import type { ApprovalBalanceChange } from '@exodus/web3-types'

export function getTransactionId({
  chainId,
  serializedTransaction,
}: {
  chainId: number
  serializedTransaction: Buffer
  eip1559Enabled?: boolean
}): string {
  const transaction = getEthereumJsTxByTransactionBuffer({
    chainId,
    transactionBuffer: serializedTransaction,
  })

  return `0x${transaction.hash().toString('hex')}`
}

export function getDisplayDetails(willApprove: ApprovalBalanceChange[]) {
  let title = 'Approve Transaction?'
  const isApproveTransaction = willApprove.length

  if (isApproveTransaction) {
    const tokenName = willApprove[0].unitName
    // Don't change the title if 'tokenName' is undefined
    title = tokenName ? `Approve ${tokenName} Transactions?` : title
  }

  return { title }
}

export const isSimpleTransfer = (transaction: EthTransaction) => {
  // Transaction shouldn't provide any parameters to a smart contract.
  return ['0x', null, undefined].includes(transaction.data)
}

export const getTxFeeDetails = (transaction: EthTransaction) => {
  const maxFeePerGas = transaction.maxFeePerGas
  const gasPrice = transaction.gasPrice
  const gasLimit = transaction.gas

  return {
    gasLimit,
    maxFeePerGas,
    gasPrice,
  }
}

export function decodeRecipientAddresses(
  transaction: EthTransaction,
): string[] {
  try {
    if (!transaction.to) {
      return []
    }

    if (isSimpleTransfer(transaction)) {
      return [transaction.to]
    }

    const token = SolidityContract.erc20(transaction.to)
    const { method, values } = token.decodeInput(transaction.data)

    if (method === 'transfer') {
      return [values[0]]
    }

    return []
  } catch {
    return []
  }
}
