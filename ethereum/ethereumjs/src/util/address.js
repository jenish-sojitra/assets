import BN from 'bn.js'
import assert from 'minimalistic-assert'

import {
  generateAddress,
  generateAddress2,
  isValidAddress,
  privateToAddress,
  pubToAddress,
} from './account.js'
import { toBuffer, zeros } from './bytes.js'

export class Address {
  buf

  constructor(buf) {
    assert(buf.length === 20, 'Invalid address length')
    this.buf = buf
  }

  /**
   * Returns the zero address.
   */
  static zero() {
    return new Address(zeros(20))
  }

  /**
   * Returns an Address object from a hex-encoded string.
   * @param str - Hex-encoded address
   */
  static fromString(str) {
    assert(isValidAddress(str), 'Invalid address')
    return new Address(toBuffer(str))
  }

  /**
   * Returns an address for a given public key.
   * @param pubKey The two points of an uncompressed key
   */
  static fromPublicKey(pubKey) {
    assert(Buffer.isBuffer(pubKey), 'Public key should be Buffer')
    const buf = pubToAddress(pubKey)
    return new Address(buf)
  }

  /**
   * Returns an address for a given private key.
   * @param privateKey A private key must be 256 bits wide
   */
  static fromPrivateKey(privateKey) {
    assert(Buffer.isBuffer(privateKey), 'Private key should be Buffer')
    const buf = privateToAddress(privateKey)
    return new Address(buf)
  }

  /**
   * Generates an address for a newly created contract.
   * @param from The address which is creating this new address
   * @param nonce The nonce of the from account
   */
  static generate(from, nonce) {
    assert(BN.isBN(nonce))
    return new Address(generateAddress(from.buf, nonce.toArrayLike(Buffer)))
  }

  /**
   * Generates an address for a contract created using CREATE2.
   * @param from The address which is creating this new address
   * @param salt A salt
   * @param initCode The init code of the contract being created
   */
  static generate2(from, salt, initCode) {
    assert(Buffer.isBuffer(salt))
    assert(Buffer.isBuffer(initCode))
    return new Address(generateAddress2(from.buf, salt, initCode))
  }

  /**
   * Is address equal to another.
   */
  equals(address) {
    return this.buf.equals(address.buf)
  }

  /**
   * Is address zero.
   */
  isZero() {
    return this.equals(Address.zero())
  }

  /**
   * True if address is in the address range defined
   * by EIP-1352
   */
  isPrecompileOrSystemAddress() {
    const addressBN = new BN(this.buf)
    const rangeMin = new BN(0)
    const rangeMax = new BN('ffff', 'hex')

    return addressBN.gte(rangeMin) && addressBN.lte(rangeMax)
  }

  /**
   * Returns hex encoding of address.
   */
  toString() {
    return '0x' + this.buf.toString('hex')
  }

  /**
   * Returns Buffer representation of address.
   */
  toBuffer() {
    return Buffer.from(this.buf)
  }
}
