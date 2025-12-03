import BN from 'bn.js'
import { isHexString } from 'ethjs-util'

import { toBuffer, unpadBuffer } from './bytes.js'

/**
 * Convert BN to 0x-prefixed hex string.
 */
export function bnToHex(value) {
  return `0x${value.toString(16)}`
}

/**
 * Convert value from BN to an unpadded Buffer
 * (useful for RLP transport)
 * @param value value to convert
 */
export function bnToUnpaddedBuffer(value) {
  // Using `bn.toArrayLike(Buffer)` instead of `bn.toBuffer()`
  // for compatibility with browserify and similar tools
  return unpadBuffer(value.toArrayLike(Buffer))
}

/**
 * Type output options
 */
export const TypeOutput = {
  Number: 0,
  BN: 1,
  Buffer: 2,
  PrefixedHexString: 3,
}

/**
 * Convert an input to a specified type
 * @param input value to convert
 * @param outputType type to output
 */
export function toType(input, outputType) {
  if (typeof input === 'string' && !isHexString(input)) {
    throw new Error(`A string must be provided with a 0x-prefix`)
  } else if (typeof input === 'number' && !Number.isSafeInteger(input)) {
    // eslint-disable-next-line unicorn/prefer-type-error
    throw new Error(
      'The provided number is greater than MAX_SAFE_INTEGER (please use an alternative input type)'
    )
  }

  input = toBuffer(input)

  if (outputType === TypeOutput.Buffer) {
    return input
  }

  if (outputType === TypeOutput.BN) {
    return new BN(input)
  }

  if (outputType === TypeOutput.Number) {
    const bn = new BN(input)
    const max = new BN(Number.MAX_SAFE_INTEGER.toString())
    if (bn.gt(max)) {
      throw new Error(
        'The provided number is greater than MAX_SAFE_INTEGER (please use an alternative output type)'
      )
    }

    return bn.toNumber()
  }

  // outputType === TypeOutput.PrefixedHexString
  return `0x${input.toString('hex')}`
}
