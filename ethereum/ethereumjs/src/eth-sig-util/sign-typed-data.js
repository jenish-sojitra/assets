import { hashSync } from '@exodus/crypto/hash'
import { ecdsaSignHashSync } from '@exodus/crypto/secp256k1'

import { rawEncode, solidityPack } from '../abi/index.js'
import { bufferToHex } from '../util/index.js'
import { legacyToBuffer } from './utils.js'

/**
 * Represents the version of `signTypedData` being used.
 *
 * V1 is based upon [an early version of EIP-712](https://github.com/ethereum/EIPs/pull/712/commits/21abe254fe0452d8583d5b132b1d7be87c0439ca)
 * that lacked some later security improvements, and should generally be neglected in favor of
 * later versions.
 *
 * V3 is based on EIP-712, except that arrays and recursive data structures are not supported.
 *
 * V4 is based on EIP-712, and includes full support of arrays and recursive data structures.
 */
export const SignTypedDataVersion = { V1: 'V1', V3: 'V3', V4: 'V4' }

/**
 * Validate that the given value is a valid version string.
 *
 * @param version - The version value to validate.
 * @param allowedVersions - A list of allowed versions. If omitted, all versions are assumed to be
 * allowed.
 */
function validateVersion(version, allowedVersions) {
  if (!Object.keys(SignTypedDataVersion).includes(version)) {
    throw new Error(`Invalid version: '${version}'`)
  } else if (allowedVersions && !allowedVersions.includes(version)) {
    const ok = allowedVersions.join(', ')
    throw new Error(`SignTypedDataVersion not allowed: '${version}'. Allowed versions are: ${ok}`)
  }
}

const keccak = (arg) => hashSync('keccak256', legacyToBuffer(arg), 'buffer') // processes 0x-prefixed strings as hexes

function rawEncodePairs(pairs) {
  const types = pairs.map(([t]) => t)
  const values = pairs.map(([, v]) => v)
  return rawEncode(types, values)
}

/**
 * Encode a single field.
 *
 * @param types - All type definitions.
 * @param name - The name of the field to encode.
 * @param type - The type of the field being encoded.
 * @param value - The value to encode.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns Encoded representation of the field.
 */
function encodeField(types, name, type, value, version) {
  validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4])

  if (types[type] !== undefined) {
    const encoded =
      version === SignTypedDataVersion.V4 && value == null // eslint-disable-line no-eq-null
        ? '0x0000000000000000000000000000000000000000000000000000000000000000'
        : keccak(encodeData(type, value, types, version))
    return ['bytes32', encoded]
  }

  if (value === undefined) throw new Error(`missing value for field ${name} of type ${type}`)
  if (type === 'bytes') return ['bytes32', keccak(value)]
  if (type === 'string') {
    // convert string to buffer - prevents ethUtil from interpreting strings like '0xabcd' as hex
    return ['bytes32', keccak(typeof value === 'string' ? Buffer.from(value, 'utf8') : value)]
  }

  if (type.lastIndexOf(']') === type.length - 1) {
    if (version === SignTypedDataVersion.V3) {
      throw new Error('Arrays are unimplemented in encodeData; use V4 extension')
    }

    const parsedType = type.slice(0, type.lastIndexOf('['))
    const typeValuePairs = value.map((item) => encodeField(types, name, parsedType, item, version))
    return ['bytes32', keccak(rawEncodePairs(typeValuePairs))]
  }

  return [type, value]
}

/**
 * Encodes an object by encoding and concatenating each of its members.
 *
 * @param primaryType - The root type.
 * @param data - The object to encode.
 * @param types - Type definitions for all types included in the message.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns An encoded representation of an object.
 */
function encodeData(primaryType, data, types, version) {
  validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4])
  const pairs = [['bytes32', hashType(primaryType, types)]]

  for (const field of types[primaryType]) {
    if (version === SignTypedDataVersion.V3 && data[field.name] === undefined) continue
    pairs.push(encodeField(types, field.name, field.type, data[field.name], version))
  }

  return rawEncodePairs(pairs)
}

/**
 * Encodes the type of an object by encoding a comma delimited list of its members.
 *
 * @param primaryType - The root type to encode.
 * @param types - Type definitions for all types included in the message.
 * @returns An encoded representation of the primary type.
 */
function encodeType(primaryType, types) {
  let result = ''
  const unsortedDeps = findTypeDependencies(primaryType, types)
  unsortedDeps.delete(primaryType)

  const deps = [primaryType, ...[...unsortedDeps].sort()]
  for (const type of deps) {
    const children = types[type]
    if (!children) throw new Error(`No type definition specified: ${type}`)
    // eslint-disable-next-line sonarjs/no-nested-template-literals
    result += `${type}(${children.map(({ name, type: t }) => `${t} ${name}`).join(',')})`
  }

  return result
}

/**
 * Finds all types within a type definition object.
 *
 * @param primaryType - The root type.
 * @param types - Type definitions for all types included in the message.
 * @param results - The current set of accumulated types.
 * @returns The set of all types found in the type definition.
 */
function findTypeDependencies(primaryType, types, results = new Set()) {
  ;[primaryType] = primaryType.match(/^\w*/u)
  if (results.has(primaryType) || types[primaryType] === undefined) return results
  results.add(primaryType)
  for (const field of types[primaryType]) findTypeDependencies(field.type, types, results)
  return results
}

/**
 * Hashes an object.
 *
 * @param primaryType - The root type.
 * @param data - The object to hash.
 * @param types - Type definitions for all types included in the message.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns The hash of the object.
 */
function hashStruct(primaryType, data, types, version) {
  validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4])
  return keccak(encodeData(primaryType, data, types, version))
}

/**
 * Hashes the type of an object.
 *
 * @param primaryType - The root type to hash.
 * @param types - Type definitions for all types included in the message.
 * @returns The hash of the object type.
 */
const hashType = (primaryType, types) => keccak(encodeType(primaryType, types))

/**
 * Removes properties from a message object that are not defined per EIP-712.
 *
 * @param data - The typed message object.
 * @returns The typed message object with only allowed fields.
 */
function sanitizeData(data) {
  const sanitizedData = {}
  for (const key of ['types', 'primaryType', 'domain', 'message']) {
    if (data[key]) sanitizedData[key] = data[key]
  }

  if ('types' in sanitizedData) sanitizedData.types = { EIP712Domain: [], ...sanitizedData.types }
  return sanitizedData
}

/**
 * Hash a typed message according to EIP-712. The returned message starts with the EIP-712 prefix,
 * which is "1901", followed by the hash of the domain separator, then the data (if any).
 * The result is hashed again and returned.
 *
 * This function does not sign the message. The resulting hash must still be signed to create an
 * EIP-712 signature.
 *
 * @param typedData - The typed message to hash.
 * @param version - The EIP-712 version the encoding should comply with.
 * @returns The hash of the typed message.
 */
function eip712Hash(typedData, version) {
  validateVersion(version, [SignTypedDataVersion.V3, SignTypedDataVersion.V4])

  const { domain, types, primaryType, message } = sanitizeData(typedData)
  const parts = [Buffer.from('1901', 'hex'), hashStruct('EIP712Domain', domain, types, version)]

  // TODO: Validate that primaryType is a string
  if (primaryType !== 'EIP712Domain') parts.push(hashStruct(primaryType, message, types, version))

  return hashSync('keccak256', parts, 'buffer')
}

/**
 * A collection of utility functions used for signing typed data.
 */
export const TypedDataUtils = {
  encodeData,
  encodeType,
  findTypeDependencies,
  hashStruct,
  hashType,
  sanitizeData,
  eip712Hash,
}

/**
 * Generate the "V1" hash for the provided typed message.
 *
 * The hash will be generated in accordance with an earlier version of the EIP-712
 * specification. This hash is used in `signTypedData_v1`.
 *
 * @param typedData - The typed message.
 * @returns The '0x'-prefixed hex encoded hash representing the type of the provided message.
 */
export const typedSignatureHash = (typedData) => bufferToHex(_typedSignatureHash(typedData))

const soliditySHA3 = (types, values) => hashSync('keccak256', solidityPack(types, values), 'buffer')

/**
 * Generate the "V1" hash for the provided typed message.
 *
 * The hash will be generated in accordance with an earlier version of the EIP-712
 * specification. This hash is used in `signTypedData_v1`.
 *
 * @param typedData - The typed message.
 * @returns The hash representing the type of the provided message.
 */
function _typedSignatureHash(typedData) {
  const err = new Error('Expect argument to be non-empty array')
  if (typeof typedData !== 'object' || !('length' in typedData) || typedData.length === 0) throw err
  if (!typedData.every((e) => e.name)) throw err

  const data = typedData.map((e) => (e.type === 'bytes' ? legacyToBuffer(e.value) : e.value))
  const types = typedData.map((e) => e.type)
  const schema = typedData.map((e) => `${e.type} ${e.name}`)

  return soliditySHA3(
    ['bytes32', 'bytes32'],
    [
      soliditySHA3(Array.from({ length: typedData.length }).fill('string'), schema),
      soliditySHA3(types, data),
    ]
  )
}

/**
 * Sign typed data according to EIP-712. The signing differs based upon the `version`.
 *
 * @param options - The signing options.
 * @param options.privateKey - The private key to sign with.
 * @param options.data - The typed data to sign.
 * @param options.version - The signing version to use.
 * @returns The '0x'-prefixed hex encoded signature.
 */
export function signTypedData({ privateKey, data, version }) {
  validateVersion(version)
  if (data === null || data === undefined) throw new Error('Missing data parameter')
  if (!privateKey) throw new Error('Missing private key parameter')

  const messageHash =
    version === SignTypedDataVersion.V1
      ? _typedSignatureHash(data)
      : TypedDataUtils.eip712Hash(data, version)

  const { signature, recovery } = ecdsaSignHashSync({
    hash: messageHash,
    privateKey,
    recovery: true,
    extraEntropy: null, // TODO: can we flip this to true?
  })
  return `0x${Buffer.concat([signature, Buffer.from([recovery + 27])]).toString('hex')}`
}
