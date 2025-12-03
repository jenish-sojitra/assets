import { isHexString } from 'ethjs-util'
import assert from 'minimalistic-assert'

/**
 * Throws if a string is not hex prefixed
 * @param {string} input string to check hex prefix of
 */
export const assertIsHexString = function (input) {
  assert(isHexString(input), 'This method only supports 0x-prefixed hex strings')
}

/**
 * Throws if input is not a buffer
 * @param {Buffer} input value to check
 */
export const assertIsBuffer = function (input) {
  assert(Buffer.isBuffer(input), 'This method only supports Buffer')
}

/**
 * Throws if input is not an array
 * @param {number[]} input value to check
 */
export const assertIsArray = function (input) {
  assert(Array.isArray(input), 'This method only supports number arrays')
}

/**
 * Throws if input is not a string
 * @param {string} input value to check
 */
export const assertIsString = function (input) {
  assert(typeof input === 'string', 'This method only supports strings')
}
