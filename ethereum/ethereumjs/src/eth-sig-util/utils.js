import { isHexString } from 'ethjs-util'

import { toBuffer } from '../util/bytes.js'

/**
 * WARNING
 *
 * legacyToBuffer() is ethereumjs-util@5.2.1 compatible
 * Which means that this method works on both 0x-prefixed strings, treating them as hex,
 * and all other strings, treating them as utf-8 input
 *
 * This matches deliberate behavior of @metamask/eth-sig-util
 */

/**
 * Convert a value to a Buffer. This function should be equivalent to the `toBuffer` function in
 * `ethereumjs-util@5.2.1`.
 *
 * @param value - The value to convert to a Buffer.
 * @returns The given value as a Buffer.
 */
export function legacyToBuffer(value) {
  return typeof value === 'string' && !isHexString(value) ? Buffer.from(value) : toBuffer(value)
}
