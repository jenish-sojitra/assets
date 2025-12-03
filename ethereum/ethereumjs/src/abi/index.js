import BN from 'bn.js'
import { isHexPrefixed, stripHexPrefix } from 'ethjs-util'

import { setLengthRight as setLengthRightRaw, toBuffer, zeros } from '../util/bytes.js'
import { setLengthLeft as setLengthLeftRaw } from '../util/extra.js'

// This operates in a ethereumjs-util@6.2.1 compatible way
const setLengthRight = (value, size) => setLengthRightRaw(toBuffer(value), size)
const setLengthLeft = (value, size) => setLengthLeftRaw(toBuffer(value), size)

// Convert from short to canonical names
// FIXME: optimise or make this nicer?
function elementaryName(name) {
  if (name.startsWith('int[')) return 'int256' + name.slice(3)
  if (name === 'int') return 'int256'
  if (name.startsWith('uint[')) return 'uint256' + name.slice(4)
  if (name === 'uint') return 'uint256'
  if (name.startsWith('fixed[')) return 'fixed128x128' + name.slice(5)
  if (name === 'fixed') return 'fixed128x128'
  if (name.startsWith('ufixed[')) return 'ufixed128x128' + name.slice(6)
  if (name === 'ufixed') return 'ufixed128x128'
  return name
}

// Parse N from type<N>
const parseTypeN = (type) => parseInt(/^\D+(\d+)$/.exec(type)[1], 10)

// Parse N,M from type<N>x<M>
function parseTypeNxM(type) {
  const tmp = /^\D+(\d+)x(\d+)$/.exec(type)
  return [parseInt(tmp[1], 10), parseInt(tmp[2], 10)]
}

// Parse N in type[<N>] where "type" can itself be an array type.
function parseTypeArray(type) {
  if (!type.endsWith(']') || !type.includes('[')) return null
  const size = type.slice(type.lastIndexOf('[') + 1, -1)
  return size === '' ? 'dynamic' : parseInt(size, 10)
}

function parseNumber(arg) {
  if (typeof arg === 'string') {
    if (isHexPrefixed(arg)) return new BN(stripHexPrefix(arg), 16)
    return new BN(arg, 10)
  }

  if (typeof arg === 'number') return new BN(arg)
  if (arg.toArray) return arg // assume this is a BN for the moment, replace with BN.isBN soon
  throw new Error('Argument is not a number')
}

// Encodes a single item (can be dynamic array)
// @returns: Buffer
function encodeSingle(type, arg) {
  if (type === 'address') return encodeSingle('uint160', parseNumber(arg))
  if (type === 'bool') return encodeSingle('uint8', arg ? 1 : 0)
  if (type === 'string') return encodeSingle('bytes', Buffer.from(arg, 'utf8'))

  if (isArray(type)) {
    // this part handles fixed-length ([2]) and variable length ([]) arrays
    // NOTE: we catch here all calls to arrays, that simplifies the rest
    if (arg.length === undefined) throw new Error('Not an array?')
    const size = parseTypeArray(type)
    if (size !== 'dynamic' && size !== 0 && arg.length > size) {
      throw new Error('Elements exceed array size: ' + size)
    }

    const ret = []
    type = type.slice(0, type.lastIndexOf('['))
    if (typeof arg === 'string') arg = JSON.parse(arg)
    for (const i in arg) ret.push(encodeSingle(type, arg[i]))
    if (size === 'dynamic') ret.unshift(encodeSingle('uint256', arg.length))
    return Buffer.concat(ret)
  }

  if (type === 'bytes') {
    arg = Buffer.from(arg)
    const ret = Buffer.concat([encodeSingle('uint256', arg.length), arg])
    return arg.length % 32 === 0 ? ret : Buffer.concat([ret, zeros(32 - (arg.length % 32))])
  }

  if (type.startsWith('bytes')) {
    const size = parseTypeN(type)
    if (size < 1 || size > 32) throw new Error('Invalid bytes<N> width: ' + size)
    return setLengthRight(arg, 32)
  }

  if (type.startsWith('uint')) {
    const size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) throw new Error('Invalid uint<N> width: ' + size)
    const num = parseNumber(arg)
    const len = num.bitLength()
    if (len > size) throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + len)
    if (num < 0) throw new Error('Supplied uint is negative')
    return num.toArrayLike(Buffer, 'be', 32)
  }

  if (type.startsWith('int')) {
    const size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) throw new Error('Invalid int<N> width: ' + size)
    const num = parseNumber(arg)
    const len = num.bitLength()
    if (len > size) throw new Error('Supplied int exceeds width: ' + size + ' vs ' + len)
    return num.toTwos(256).toArrayLike(Buffer, 'be', 32)
  }

  if (type.startsWith('ufixed')) {
    const size = parseTypeNxM(type)
    const num = parseNumber(arg)
    if (num < 0) throw new Error('Supplied ufixed is negative')
    return encodeSingle('uint256', num.mul(new BN(2).pow(new BN(size[1]))))
  }

  if (type.startsWith('fixed')) {
    const size = parseTypeNxM(type)
    return encodeSingle('int256', parseNumber(arg).mul(new BN(2).pow(new BN(size[1]))))
  }

  throw new Error('Unsupported or invalid type: ' + type)
}

// Is a type dynamic?
// FIXME: handle all types? I don't think anything is missing now
const isDynamic = (t) => t === 'string' || t === 'bytes' || parseTypeArray(t) === 'dynamic'

// Is a type an array?
const isArray = (type) => type.endsWith(']')

// Encode a method/event with arguments
// @types an array of string type names
// @args  an array of the appropriate values
export function rawEncode(types, values) {
  const output = []
  const data = []
  let headLength = 0

  for (const type of types) {
    if (isArray(type)) {
      const size = parseTypeArray(type)
      headLength += size === 'dynamic' ? 32 : 32 * size
    } else {
      headLength += 32
    }
  }

  for (const [i, type_] of types.entries()) {
    const type = elementaryName(type_)
    const value = values[i]
    const cur = encodeSingle(type, value)

    // Use the head/tail method for storing dynamic data
    if (isDynamic(type)) {
      output.push(encodeSingle('uint256', headLength))
      data.push(cur)
      headLength += cur.length
    } else {
      output.push(cur)
    }
  }

  return Buffer.concat([...output, ...data])
}

function solidityHexValue(type, value, bitsize) {
  // pass in bitsize = null if use default bitsize
  if (isArray(type)) {
    const subType = type.slice(0, type.lastIndexOf('['))
    if (!isArray(subType)) {
      const arraySize = parseTypeArray(type)
      if (arraySize !== 'dynamic' && arraySize !== 0 && value.length > arraySize) {
        throw new Error('Elements exceed array size: ' + arraySize)
      }
    }

    return Buffer.concat(value.map((v) => solidityHexValue(subType, v, 256)))
  }

  if (type === 'bytes') return value
  if (type === 'string') return Buffer.from(value, 'utf8')
  if (type === 'bool') {
    const padding = new Uint8Array(bitsize ? bitsize / 8 - 1 : 0)
    return Buffer.concat([padding, new Uint8Array([value ? 1 : 0])])
  }

  if (type === 'address') {
    const bytesize = bitsize ? bitsize / 8 : 20
    return setLengthLeft(value, bytesize)
  }

  if (type.startsWith('bytes')) {
    const size = parseTypeN(type)
    if (size < 1 || size > 32) throw new Error('Invalid bytes<N> width: ' + size)
    return setLengthRight(value, size)
  }

  if (type.startsWith('uint')) {
    const size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) throw new Error('Invalid uint<N> width: ' + size)
    const num = parseNumber(value)
    const len = num.bitLength()
    if (len > size) throw new Error('Supplied uint exceeds width: ' + size + ' vs ' + len)
    return num.toArrayLike(Buffer, 'be', (bitsize || size) / 8)
  }

  if (type.startsWith('int')) {
    const size = parseTypeN(type)
    if (size % 8 || size < 8 || size > 256) throw new Error('Invalid int<N> width: ' + size)
    const num = parseNumber(value)
    const len = num.bitLength()
    if (len > size) throw new Error('Supplied int exceeds width: ' + size + ' vs ' + len)
    return num.toTwos(size).toArrayLike(Buffer, 'be', (bitsize || size) / 8)
  }

  // FIXME: support all other types
  throw new Error('Unsupported or invalid type: ' + type)
}

export function solidityPack(types, values) {
  if (types.length !== values.length) throw new Error('Number of types are not matching the values')
  return Buffer.concat(types.map((t, i) => solidityHexValue(elementaryName(t), values[i], null)))
}
