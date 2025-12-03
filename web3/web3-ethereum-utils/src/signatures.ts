import { getEthereumJsTxByTransactionProps } from '@exodus/ethereum-lib'
import {
  SignTypedDataVersion,
  personalSign,
  signTypedData as ethSigUtilSignTypedData,
} from '@exodus/ethereumjs/eth-sig-util'
import assert from 'minimalistic-assert'

import type { EthTransactionParams } from './types.js'
import type {
  MessageTypes,
  TypedDataV1,
  TypedMessage,
} from '@exodus/ethereumjs/eth-sig-util'

export function signMessage(message: string, privateKey: Buffer): string {
  return personalSign({ privateKey, data: message })
}

export function signTypedData(
  typedData: TypedDataV1 | TypedMessage<MessageTypes>,
  privateKey: Buffer,
  version: SignTypedDataVersion = SignTypedDataVersion.V4,
): string {
  return ethSigUtilSignTypedData({ privateKey, data: typedData, version })
}

export function signTransaction(
  transactionParams: EthTransactionParams,
  privateKey: Buffer,
): Buffer {
  const { chainId, ...transactionProps } = transactionParams

  assert(
    typeof chainId === 'number',
    'signTransaction must be explicitly passed a chainId',
  )

  const transaction = getEthereumJsTxByTransactionProps({
    chainId,
    eip1559Enabled: Boolean(transactionProps.maxFeePerGas),
    transactionProps,
  })

  const signedTransaction = transaction.sign(privateKey)
  return signedTransaction.serialize()
}

export function hex0xStringToBuffer(hex: string): Buffer {
  // Remove the 0x
  const hexWithout0x = hex.startsWith('0x') ? hex.slice(2) : hex
  // Pad the value until even
  const hexWithLeadingZeros =
    hexWithout0x.length % 2 === 0 ? hexWithout0x : '0' + hexWithout0x
  // Finally  return the buffer
  return Buffer.from(hexWithLeadingZeros, 'hex')
}

export function bufferToHex0xString(buf: Buffer): string {
  if (!Buffer.isBuffer(buf)) {
    throw new Error('expected a buffer')
  }
  const hex = buf.toString('hex')

  if (typeof hex !== 'string') {
    throw new Error('expected hex string')
  }

  return '0x' + hex
}
