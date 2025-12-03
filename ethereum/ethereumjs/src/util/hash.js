import { hashSync } from '@exodus/crypto/hash'
import * as rlp from 'rlp'

import { assertIsBuffer } from './helpers.js'

/**
 * Creates Keccak-256 hash of the input, alias for keccak(a, 256).
 * @param a The input data (Buffer)
 */
export const keccak256 = function (a) {
  assertIsBuffer(a)
  return hashSync('keccak256', a, 'buffer')
}

/**
 * Creates SHA-3 hash of the RLP encoded version of the input.
 * @param a The input data
 */
export const rlphash = function (a) {
  return hashSync('keccak256', rlp.encode(a), 'buffer')
}
