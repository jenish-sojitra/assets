import * as secp256k1 from '@exodus/crypto/secp256k1'
import BN from 'bn.js'
import { stripHexPrefix } from 'ethjs-util'
import assert from 'minimalistic-assert'
import * as rlp from 'rlp'

import { bufferToHex, toBuffer, zeros } from './bytes.js'
import { KECCAK256_NULL, KECCAK256_RLP } from './constants.js'
import { keccak256, rlphash } from './hash.js'
import { assertIsBuffer, assertIsHexString, assertIsString } from './helpers.js'
import { bnToUnpaddedBuffer, toType, TypeOutput } from './types.js'

export class Account {
  nonce
  balance
  stateRoot
  codeHash

  static fromAccountData(accountData) {
    const { nonce, balance, stateRoot, codeHash } = accountData

    return new Account(
      nonce ? new BN(toBuffer(nonce)) : undefined,
      balance ? new BN(toBuffer(balance)) : undefined,
      stateRoot ? toBuffer(stateRoot) : undefined,
      codeHash ? toBuffer(codeHash) : undefined
    )
  }

  static fromRlpSerializedAccount(serialized) {
    const values = rlp.decode(serialized)

    if (!Array.isArray(values)) {
      throw new TypeError('Invalid serialized account input. Must be array')
    }

    return this.fromValuesArray(values)
  }

  static fromValuesArray(values) {
    const [nonce, balance, stateRoot, codeHash] = values

    return new Account(new BN(nonce), new BN(balance), stateRoot, codeHash)
  }

  /**
   * This constructor assigns and validates the values.
   * Use the static factory methods to assist in creating an Account from varying data types.
   */
  constructor(
    nonce = new BN(0),
    balance = new BN(0),
    stateRoot = KECCAK256_RLP,
    codeHash = KECCAK256_NULL
  ) {
    this.nonce = nonce
    this.balance = balance
    this.stateRoot = stateRoot
    this.codeHash = codeHash

    this._validate()
  }

  _validate() {
    if (this.nonce.lt(new BN(0))) {
      throw new Error('nonce must be greater than zero')
    }

    if (this.balance.lt(new BN(0))) {
      throw new Error('balance must be greater than zero')
    }

    if (this.stateRoot.length !== 32) {
      throw new Error('stateRoot must have a length of 32')
    }

    if (this.codeHash.length !== 32) {
      throw new Error('codeHash must have a length of 32')
    }
  }

  /**
   * Returns a Buffer Array of the raw Buffers for the account, in order.
   */
  raw() {
    return [
      bnToUnpaddedBuffer(this.nonce),
      bnToUnpaddedBuffer(this.balance),
      this.stateRoot,
      this.codeHash,
    ]
  }

  /**
   * Returns the RLP serialization of the account as a `Buffer`.
   */
  serialize() {
    return rlp.encode(this.raw())
  }

  /**
   * Returns a `Boolean` determining if the account is a contract.
   */
  isContract() {
    return !this.codeHash.equals(KECCAK256_NULL)
  }

  /**
   * Returns a `Boolean` determining if the account is empty complying to the definition of
   * account emptiness in [EIP-161](https://eips.ethereum.org/EIPS/eip-161):
   * "An account is considered empty when it has no code and zero nonce and zero balance."
   */
  isEmpty() {
    return this.balance.isZero() && this.nonce.isZero() && this.codeHash.equals(KECCAK256_NULL)
  }
}

/**
 * Checks if the address is a valid. Accepts checksummed addresses too.
 */
export const isValidAddress = function (hexAddress) {
  try {
    assertIsString(hexAddress)
  } catch {
    return false
  }

  return /^0x[\dA-Fa-f]{40}$/.test(hexAddress)
}

/**
 * Returns a checksummed address.
 *
 * If a eip1191ChainId is provided, the chainId will be included in the checksum calculation. This
 * has the effect of checksummed addresses for one chain having invalid checksums for others.
 * For more details see [EIP-1191](https://eips.ethereum.org/EIPS/eip-1191).
 *
 * WARNING: Checksums with and without the chainId will differ. As of 2019-06-26, the most commonly
 * used variation in Ethereum was without the chainId. This may change in the future.
 */
export const toChecksumAddress = function (hexAddress, eip1191ChainId) {
  assertIsHexString(hexAddress)
  const address = stripHexPrefix(hexAddress).toLowerCase()

  let prefix = ''
  if (eip1191ChainId) {
    const chainId = toType(eip1191ChainId, TypeOutput.BN)
    prefix = chainId.toString() + '0x'
  }

  const hash = keccak256(Buffer.from(prefix + address, 'utf8')).toString('hex')
  let ret = '0x'

  // eslint-disable-next-line unicorn/no-for-loop
  for (let i = 0; i < address.length; i++) {
    if (parseInt(hash[i], 16) >= 8) {
      ret += address[i].toUpperCase()
    } else {
      ret += address[i]
    }
  }

  return ret
}

/**
 * Checks if the address is a valid checksummed address.
 *
 * See toChecksumAddress' documentation for details about the eip1191ChainId parameter.
 */
export const isValidChecksumAddress = function (hexAddress, eip1191ChainId) {
  return isValidAddress(hexAddress) && toChecksumAddress(hexAddress, eip1191ChainId) === hexAddress
}

/**
 * Generates an address of a newly created contract.
 * @param from The address which is creating this new address
 * @param nonce The nonce of the from account
 */
export const generateAddress = function (from, nonce) {
  assertIsBuffer(from)
  assertIsBuffer(nonce)
  const nonceBN = new BN(nonce)

  if (nonceBN.isZero()) {
    // in RLP we want to encode null in the case of zero nonce
    // read the RLP documentation for an answer if you dare
    return rlphash([from, null]).slice(-20)
  }

  // Only take the lower 160bits of the hash
  return rlphash([from, Buffer.from(nonceBN.toArray())]).slice(-20)
}

/**
 * Generates an address for a contract created using CREATE2.
 * @param from The address which is creating this new address
 * @param salt A salt
 * @param initCode The init code of the contract being created
 */
export const generateAddress2 = function (from, salt, initCode) {
  assertIsBuffer(from)
  assertIsBuffer(salt)
  assertIsBuffer(initCode)

  assert(from.length === 20)
  assert(salt.length === 32)

  const address = keccak256(
    Buffer.concat([Buffer.from('ff', 'hex'), from, salt, keccak256(initCode)])
  )

  return address.slice(-20)
}

/**
 * Checks if the private key satisfies the rules of the curve secp256k1.
 */
export const isValidPrivate = function (privateKey) {
  assert(privateKey instanceof Uint8Array, 'Expected private key to be an Uint8Array')
  assert(privateKey.length === 32, 'Expected private key to be an Uint8Array with length 32')
  return secp256k1.privateKeyIsValid({ privateKey })
}

/**
 * Checks if the public key satisfies the rules of the curve secp256k1
 * and the requirements of Ethereum.
 * @param publicKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
export const isValidPublic = function (publicKey, sanitize = false) {
  assertIsBuffer(publicKey)
  if (publicKey.length === 64) {
    // Convert to SEC1 for secp256k1
    return secp256k1.publicKeyIsValid({ publicKey: Buffer.concat([Buffer.from([4]), publicKey]) })
  }

  if (!sanitize) return false
  return secp256k1.publicKeyIsValid({ publicKey })
}

/**
 * Returns the ethereum address of a given public key.
 * Accepts "Ethereum public keys" and SEC1 encoded keys.
 * @param pubKey The two points of an uncompressed key, unless sanitize is enabled
 * @param sanitize Accept public keys in other formats
 */
export const pubToAddress = function (pubKey, sanitize = false) {
  assertIsBuffer(pubKey)
  if (sanitize && pubKey.length !== 64) {
    pubKey = secp256k1
      .publicKeyConvert({ publicKey: pubKey, compressed: false, format: 'buffer' })
      .subarray(1)
  }

  assert(pubKey.length === 64)
  // Only take the lower 160bits of the hash
  return keccak256(pubKey).slice(-20)
}

export const publicToAddress = pubToAddress

/**
 * Returns the ethereum public key of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
export const privateToPublic = function (privateKey) {
  assertIsBuffer(privateKey)
  // skip the type flag and use the X, Y points
  return secp256k1
    .privateKeyToPublicKey({ privateKey, compressed: false, format: 'buffer' })
    .subarray(1)
}

/**
 * Returns the ethereum address of a given private key.
 * @param privateKey A private key must be 256 bits wide
 */
export const privateToAddress = function (privateKey) {
  return publicToAddress(privateToPublic(privateKey))
}

/**
 * Converts a public key to the Ethereum format.
 */
export const importPublic = function (publicKey) {
  assertIsBuffer(publicKey)
  if (publicKey.length !== 64) {
    publicKey = secp256k1
      .publicKeyConvert({ publicKey, compressed: false, format: 'buffer' })
      .subarray(1)
  }

  return publicKey
}

/**
 * Returns the zero address.
 */
export const zeroAddress = function () {
  const addressLength = 20
  const addr = zeros(addressLength)
  return bufferToHex(addr)
}

/**
 * Checks if a given address is the zero address.
 */
export const isZeroAddress = function (hexAddress) {
  try {
    assertIsString(hexAddress)
  } catch {
    return false
  }

  const zeroAddr = zeroAddress()
  return zeroAddr === hexAddress
}
