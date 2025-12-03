import { ecdsaSignHashSync } from '@exodus/crypto/secp256k1'

import { keccak256 } from './hash.js'
import { assertIsBuffer } from './helpers.js'
import { toType, TypeOutput } from './types.js'

/**
 * Returns the ECDSA signature of a message hash.
 */
/* eslint-disable no-redeclare */
export function ecsign(hash, privateKey, chainId) {
  const { signature, recovery } = ecdsaSignHashSync({
    hash,
    privateKey,
    recovery: true,
    extraEntropy: null, // TODO: can we flip this to true?
  })
  return splitSignature(signature, recovery, chainId)
}

/* eslint-disable no-redeclare */
export function splitSignature(signature, recovery, chainId) {
  const r = Buffer.from(signature.slice(0, 32))
  const s = Buffer.from(signature.slice(32, 64))

  if (!chainId || typeof chainId === 'number') {
    // return legacy type ECDSASignature (deprecated in favor of ECDSASignatureBuffer to handle large chainIds)
    if (chainId && !Number.isSafeInteger(chainId)) {
      throw new Error(
        'The provided number is greater than MAX_SAFE_INTEGER (please use an alternative input type)'
      )
    }

    const v = chainId ? recovery + (chainId * 2 + 35) : recovery + 27
    return { r, s, v }
  }

  const chainIdBN = toType(chainId, TypeOutput.BN)
  const v = chainIdBN.muln(2).addn(35).addn(recovery).toArrayLike(Buffer)
  return { r, s, v }
}

/**
 * Returns the keccak-256 hash of `message`, prefixed with the header used by the `eth_sign` RPC call.
 * The output of this function can be fed into `ecsign` to produce the same signature as the `eth_sign`
 * call for a given `message`, or fed to `ecrecover` along with a signature to recover the public key
 * used to produce the signature.
 */
export const hashPersonalMessage = function (message) {
  assertIsBuffer(message)
  const prefix = Buffer.from(`\u0019Ethereum Signed Message:\n${message.length.toString()}`, 'utf8')
  return keccak256(Buffer.concat([prefix, message]))
}
