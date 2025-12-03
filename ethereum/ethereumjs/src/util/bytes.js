import BN from 'bn.js'
import { intToBuffer, isHexPrefixed, isHexString, padToEven, stripHexPrefix } from 'ethjs-util'
import assert from 'minimalistic-assert'

import { assertIsArray, assertIsBuffer, assertIsHexString } from './helpers.js'

/**
 * Returns a buffer filled with 0s.
 * @param bytes the number of bytes the buffer should be
 */
export const zeros = function (bytes) {
  return Buffer.alloc(bytes)
}

/**
 * Pads a `Buffer` with zeros till it has `length` bytes.
 * Truncates the beginning or end of input if its length exceeds `length`.
 * @param msg the value to pad (Buffer)
 * @param length the number of bytes the output should be
 * @param right whether to start padding form the left or right
 * @returns (Buffer)
 */
const setLength = function (msg, length, right) {
  const buf = zeros(length)
  if (right) {
    if (msg.length < length) {
      msg.copy(buf)
      return buf
    }

    return msg.slice(0, length)
  }

  if (msg.length < length) {
    msg.copy(buf, length - msg.length)
    return buf
  }

  return msg.slice(-length)
}

/**
 * Left Pads a `Buffer` with leading zeros till it has `length` bytes.
 * Or it truncates the beginning if it exceeds.
 * @param msg the value to pad (Buffer)
 * @param length the number of bytes the output should be
 * @returns (Buffer)
 */
export const setLengthLeft = function (msg, length) {
  assertIsBuffer(msg)
  return setLength(msg, length, false)
}

/**
 * Right Pads a `Buffer` with trailing zeros till it has `length` bytes.
 * it truncates the end if it exceeds.
 * @param msg the value to pad (Buffer)
 * @param length the number of bytes the output should be
 * @returns (Buffer)
 */
export const setLengthRight = function (msg, length) {
  assertIsBuffer(msg)
  return setLength(msg, length, true)
}

/**
 * Trims leading zeros from a `Buffer`, `String` or `Number[]`.
 * @param a (Buffer|Array|String)
 * @returns (Buffer|Array|String)
 */
const stripZeros = function (a) {
  let first = a[0]
  while (a.length > 0 && first.toString() === '0') {
    a = a.slice(1)
    first = a[0]
  }

  return a
}

/**
 * Trims leading zeros from a `Buffer`.
 * @param a (Buffer)
 * @returns (Buffer)
 */
export const unpadBuffer = function (a) {
  assertIsBuffer(a)
  return stripZeros(a)
}

/**
 * Trims leading zeros from an `Array` (of numbers).
 * @param a (number[])
 * @returns (number[])
 */
export const unpadArray = function (a) {
  assertIsArray(a)
  return stripZeros(a)
}

/**
 * Trims leading zeros from a hex-prefixed `String`.
 * @param a (String)
 * @returns (String)
 */
export const unpadHexString = function (a) {
  assertIsHexString(a)
  a = stripHexPrefix(a)
  return stripZeros(a)
}

/**
 * Attempts to turn a value into a `Buffer`.
 * Inputs supported: `Buffer`, `String` (hex-prefixed), `Number`, null/undefined, `BN` and other objects
 * with a `toArray()` or `toBuffer()` method.
 * @param v the value
 */
export const toBuffer = function (v) {
  if (v === null || v === undefined) {
    return Buffer.alloc(0)
  }

  if (Buffer.isBuffer(v)) {
    return Buffer.from(v)
  }

  if (Array.isArray(v) || v instanceof Uint8Array) {
    return Buffer.from(v)
  }

  if (typeof v === 'string') {
    assert(
      isHexString(v),
      'Cannot convert string to buffer. toBuffer only supports 0x-prefixed hex strings'
    )
    return Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
  }

  if (typeof v === 'number') {
    return intToBuffer(v)
  }

  if (BN.isBN(v)) {
    return v.toArrayLike(Buffer)
  }

  if (v.toArray) {
    // converts a BN to a Buffer
    return Buffer.from(v.toArray())
  }

  if (v.toBuffer) {
    return Buffer.from(v.toBuffer())
  }

  throw new Error('invalid type')
}

/**
 * Converts a `Buffer` to a `Number`.
 * @param buf `Buffer` object to convert
 * @throws If the input number exceeds 53 bits.
 */
export const bufferToInt = function (buf) {
  return new BN(toBuffer(buf)).toNumber()
}

/**
 * Converts a `Buffer` into a `0x`-prefixed hex `String`.
 * @param buf `Buffer` object to convert
 */
export const bufferToHex = function (buf) {
  buf = toBuffer(buf)
  return '0x' + buf.toString('hex')
}

/**
 * Interprets a `Buffer` as a signed integer and returns a `BN`. Assumes 256-bit numbers.
 * @param num Signed integer value
 */
export const fromSigned = function (num) {
  return new BN(num).fromTwos(256)
}

/**
 * Converts a `BN` to an unsigned integer and returns it as a `Buffer`. Assumes 256-bit numbers.
 * @param num
 */
export const toUnsigned = function (num) {
  return Buffer.from(num.toTwos(256).toArray())
}

/**
 * Adds "0x" to a given `String` if it does not already start with "0x".
 */
export const addHexPrefix = function (str) {
  if (typeof str !== 'string') {
    return str
  }

  return isHexPrefixed(str) ? str : '0x' + str
}

/**
 * Converts a `Buffer` or `Array` to JSON.
 * @param ba (Buffer|Array)
 * @returns (Array|String|null)
 */
export const baToJSON = function (ba) {
  if (Buffer.isBuffer(ba)) {
    return `0x${ba.toString('hex')}`
  }

  if (Array.isArray(ba)) {
    const array = []
    for (const element of ba) {
      array.push(baToJSON(element))
    }

    return array
  }
}
