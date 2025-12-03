import { BN } from 'bn.js'
import * as rlp from 'rlp'

import { bnToHex, bnToUnpaddedBuffer, rlphash, unpadBuffer } from '../util/extra.js'
import { toBuffer } from '../util/index.js'
import { BaseTransaction } from './baseTransaction.js'
import { Capability } from './types.js'

const TRANSACTION_TYPE = 0

/**
 * An Ethereum non-typed (legacy) transaction
 */
export default class Transaction extends BaseTransaction {
  gasPrice
  common

  /**
   * Instantiate a transaction from a data dictionary.
   *
   * Format: { nonce, gasPrice, gasLimit, to, value, data, v, r, s }
   *
   * Notes:
   * - All parameters are optional and have some basic default values
   */
  static fromTxData(txData, opts = {}) {
    return new Transaction(txData, opts)
  }

  /**
   * Instantiate a transaction from the serialized tx.
   *
   * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
   */
  static fromSerializedTx(serialized, opts = {}) {
    const values = rlp.decode(serialized)

    if (!Array.isArray(values)) {
      throw new TypeError('Invalid serialized tx input. Must be array')
    }

    return this.fromValuesArray(values, opts)
  }

  /**
   * Instantiate a transaction from the serialized tx.
   * (alias of {@link Transaction.fromSerializedTx})
   *
   * @deprecated this constructor alias is deprecated and will be removed
   * in favor of the {@link Transaction.fromSerializedTx} constructor
   */
  static fromRlpSerializedTx(serialized, opts = {}) {
    return Transaction.fromSerializedTx(serialized, opts)
  }

  /**
   * Create a transaction from a values array.
   *
   * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
   */
  static fromValuesArray(values, opts = {}) {
    // If length is not 6, it has length 9. If v/r/s are empty Buffers, it is still an unsigned transaction
    // This happens if you get the RLP data from `raw()`
    if (values.length !== 6 && values.length !== 9) {
      throw new Error(
        'Invalid transaction. Only expecting 6 values (for unsigned tx) or 9 values (for signed tx).'
      )
    }

    const [nonce, gasPrice, gasLimit, to, value, data, v, r, s] = values

    return new Transaction(
      {
        nonce,
        gasPrice,
        gasLimit,
        to,
        value,
        data,
        v,
        r,
        s,
      },
      opts
    )
  }

  /**
   * This constructor takes the values, validates them, assigns them and freezes the object.
   *
   * It is not recommended to use this constructor directly. Instead use
   * the static factory methods to assist in creating a Transaction object from
   * varying data types.
   */
  constructor(txData, opts = {}) {
    super({ ...txData, type: TRANSACTION_TYPE })

    this.common = this.#validateTxV(this.v, opts.common)

    this.gasPrice = new BN(toBuffer(txData.gasPrice === '' ? '0x' : txData.gasPrice))

    this._validateCannotExceedMaxInteger({ gasPrice: this.gasPrice })

    if (this.common.gteHardfork('spuriousDragon')) {
      if (this.isSigned()) {
        // EIP155 spec:
        // If block.number >= 2,675,000 and v = CHAIN_ID * 2 + 35 or v = CHAIN_ID * 2 + 36
        // then when computing the hash of a transaction for purposes of signing or recovering
        // instead of hashing only the first six elements (i.e. nonce, gasprice, startgas, to, value, data)
        // hash nine elements, with v replaced by CHAIN_ID, r = 0 and s = 0.
        const v = this.v
        const chainIdDoubled = this.common.chainIdBN().muln(2)

        // v and chain ID meet EIP-155 conditions
        if (v.eq(chainIdDoubled.addn(35)) || v.eq(chainIdDoubled.addn(36))) {
          this.activeCapabilities.push(Capability.EIP155ReplayProtection)
        }
      } else {
        this.activeCapabilities.push(Capability.EIP155ReplayProtection)
      }
    }

    const freeze = opts?.freeze ?? true
    if (freeze) {
      Object.freeze(this)
    }
  }

  /**
   * Returns a Buffer Array of the raw Buffers of the legacy transaction, in order.
   *
   * Format: `[nonce, gasPrice, gasLimit, to, value, data, v, r, s]`
   *
   * For an unsigned legacy tx this method returns the the empty Buffer values
   * for the signature parameters `v`, `r` and `s`. For an EIP-155 compliant
   * representation have a look at {@link Transaction.getMessageToSign}.
   */
  raw() {
    return [
      bnToUnpaddedBuffer(this.nonce),
      bnToUnpaddedBuffer(this.gasPrice),
      bnToUnpaddedBuffer(this.gasLimit),
      this.to === undefined ? Buffer.from([]) : this.to.buf,
      bnToUnpaddedBuffer(this.value),
      this.data,
      this.v === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.v),
      this.r === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.r),
      this.s === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.s),
    ]
  }

  /**
   * Returns the serialized encoding of the legacy transaction.
   *
   * Format: `rlp([nonce, gasPrice, gasLimit, to, value, data, v, r, s])`
   *
   * For an unsigned legacy tx this method uses the empty Buffer values
   * for the signature parameters `v`, `r` and `s` for encoding. For an
   * EIP-155 compliant representation use {@link Transaction.getMessageToSign}.
   */
  serialize() {
    return rlp.encode(this.raw())
  }

  #getMessageToSign() {
    const values = [
      bnToUnpaddedBuffer(this.nonce),
      bnToUnpaddedBuffer(this.gasPrice),
      bnToUnpaddedBuffer(this.gasLimit),
      this.to === undefined ? Buffer.from([]) : this.to.buf,
      bnToUnpaddedBuffer(this.value),
      this.data,
    ]

    if (this.supports(Capability.EIP155ReplayProtection)) {
      values.push(toBuffer(this.common.chainIdBN()))
      values.push(unpadBuffer(toBuffer(0))) // eslint-disable-line unicorn/no-array-push-push
      values.push(unpadBuffer(toBuffer(0))) // eslint-disable-line unicorn/no-array-push-push
    }

    return values
  }

  /**
   * Returns the serialized unsigned tx (hashed or raw), which can be used
   * to sign the transaction (e.g. for sending to a hardware wallet).
   *
   * Note: the raw message message format for the legacy tx is not RLP encoded
   * and you might need to do yourself with:
   *
   * ```javascript
   * import * as rlp from 'rlp'
   * const message = tx.getMessageToSign(false)
   * const serializedMessage = rlp.encode(message) // use this for the HW wallet input
   * ```
   *
   * @param hashMessage - Return hashed message if set to true (default: true)
   */
  getMessageToSign(hashMessage = true) {
    const message = this.#getMessageToSign()
    if (hashMessage) {
      return rlphash(message)
    }

    return message
  }

  /**
   * The up front amount that an account must have for this transaction to be valid
   */
  getUpfrontCost() {
    return this.gasLimit.mul(this.gasPrice).add(this.value)
  }

  /**
   * Computes a sha3-256 hash of the serialized tx.
   *
   * This method can only be used for signed txs (it throws otherwise).
   * Use {@link Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
   */
  hash() {
    return rlphash(this.raw())
  }

  /**
   * Process the v, r, s values from the `sign` method of the base transaction.
   */
  _processSignature(v, r, s) {
    const vBN = new BN(v)
    if (this.supports(Capability.EIP155ReplayProtection)) {
      vBN.iadd(this.common.chainIdBN().muln(2).addn(8))
    }

    const opts = {
      common: this.common,
    }

    return Transaction.fromTxData(
      {
        nonce: this.nonce,
        gasPrice: this.gasPrice,
        gasLimit: this.gasLimit,
        to: this.to,
        value: this.value,
        data: this.data,
        v: vBN,
        r: new BN(r),
        s: new BN(s),
      },
      opts
    )
  }

  /**
   * Returns an object with the JSON representation of the transaction.
   */
  toJSON() {
    return {
      nonce: bnToHex(this.nonce),
      gasPrice: bnToHex(this.gasPrice),
      gasLimit: bnToHex(this.gasLimit),
      to: this.to === undefined ? undefined : this.to.toString(),
      value: bnToHex(this.value),
      data: '0x' + this.data.toString('hex'),
      v: this.v === undefined ? undefined : bnToHex(this.v),
      r: this.r === undefined ? undefined : bnToHex(this.r),
      s: this.s === undefined ? undefined : bnToHex(this.s),
    }
  }

  /**
   * Validates tx's `v` value
   */
  #validateTxV(v, common) {
    let chainIdBN
    // No unsigned tx and EIP-155 activated and chain ID included
    if (
      v !== undefined &&
      !v.eqn(0) &&
      (!common || common.gteHardfork('spuriousDragon')) &&
      !v.eqn(27) &&
      !v.eqn(28)
    ) {
      if (common) {
        const chainIdDoubled = common.chainIdBN().muln(2)
        const isValidEIP155V = v.eq(chainIdDoubled.addn(35)) || v.eq(chainIdDoubled.addn(36))

        if (!isValidEIP155V) {
          throw new Error(
            `Incompatible EIP155-based V ${v.toString()} and chain id ${common
              .chainIdBN()
              .toString()}. See the Common parameter of the Transaction constructor to set the chain id.`
          )
        }
      } else {
        // Derive the original chain ID
        let numSub
        if (v.subn(35).isEven()) {
          numSub = 35
        } else {
          numSub = 36
        }

        // Use derived chain ID to create a proper Common
        chainIdBN = v.subn(numSub).divn(2)
      }
    }

    return this._getCommon(common, chainIdBN)
  }
}
