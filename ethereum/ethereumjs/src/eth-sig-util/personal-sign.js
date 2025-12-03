import { ecdsaSignHashSync } from '@exodus/crypto/secp256k1'

import { hashPersonalMessage } from '../util/signature.js'
import { legacyToBuffer } from './utils.js'

// Where possible, avoid using this method in favor of hashPersonalMessage() and buffer signing

/**
 * Create an Ethereum-specific signature for a message.
 *
 * This function is equivalent to the `eth_sign` Ethereum JSON-RPC method as specified in EIP-1417,
 * as well as the MetaMask's `personal_sign` method.
 *
 * @param privateKey - The key to sign with.
 * @param data - The hex data to sign.
 * @returns The '0x'-prefixed hex encoded signature.
 */
export function personalSign({ privateKey, data }) {
  if (data === null || data === undefined) throw new Error('Missing data parameter')
  if (!privateKey) throw new Error('Missing privateKey parameter')
  const message = legacyToBuffer(data)
  const msgHash = hashPersonalMessage(message)
  const { signature, recovery } = ecdsaSignHashSync({
    hash: msgHash,
    privateKey,
    recovery: true,
    extraEntropy: null, // TODO: can we flip this to true?
  })
  return `0x${Buffer.concat([signature, Buffer.from([recovery + 27])]).toString('hex')}`
}
