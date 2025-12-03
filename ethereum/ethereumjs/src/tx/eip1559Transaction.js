import { BN } from 'bn.js'
import * as rlp from 'rlp'

import { bnToHex, bnToUnpaddedBuffer, keccak256 } from '../util/extra.js'
import { toBuffer } from '../util/index.js'
import { BaseTransaction } from './baseTransaction.js'
import { AccessLists } from './util.js'

const TRANSACTION_TYPE = 2
const TRANSACTION_TYPE_BUFFER = Buffer.from(TRANSACTION_TYPE.toString(16).padStart(2, '0'), 'hex')

/**
 * A const defining secp256k1n/2
 */
const N_DIV_2 = new BN('7fffffffffffffffffffffffffffffff5d576e7357a4501ddfe92f46681b20a0', 16)

/**
 * Typed transaction with a new gas fee market mechanism
 *
 * - TransactionType: 2
 * - EIP: [EIP-1559](https://eips.ethereum.org/EIPS/eip-1559)
 */
export default class FeeMarketEIP1559Transaction extends BaseTransaction {
  chainId
  accessList
  AccessListJSON
  maxPriorityFeePerGas
  maxFeePerGas

  common

  /**
   * The default HF if the tx type is active on that HF
   * or the first greater HF where the tx is active.
   */
  DEFAULT_HARDFORK = 'london'

  /**
   * EIP-2930 alias for `r`
   *
   * @deprecated use `r` instead
   */
  get senderR() {
    return this.r
  }

  /**
   * EIP-2930 alias for `s`
   *
   * @deprecated use `s` instead
   */
  get senderS() {
    return this.s
  }

  /**
   * EIP-2930 alias for `v`
   *
   * @deprecated use `v` instead
   */
  get yParity() {
    return this.v
  }

  /**
   * Instantiate a transaction from a data dictionary.
   *
   * Format: { chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
   * accessList, v, r, s }
   *
   * Notes:
   * - `chainId` will be set automatically if not provided
   * - All parameters are optional and have some basic default values
   */
  static fromTxData(txData, opts = {}) {
    return new FeeMarketEIP1559Transaction(txData, opts)
  }

  /**
   *
   * If the buffer is v 0x02, a EIP-1559 tx buffer
   *
   * @param serialized buffer
   * @returns boolean if the buffer starts with 0x02
   */
  static isEip1559SerializedTx(serialized) {
    return serialized.slice(0, 1).equals(TRANSACTION_TYPE_BUFFER)
  }

  /**
   * Instantiate a transaction from the serialized tx.
   *
   * Format: `0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
   * accessList, signatureYParity, signatureR, signatureS])`
   */
  static fromSerializedTx(serialized, opts = {}) {
    if (!this.isEip1559SerializedTx(serialized)) {
      throw new Error(
        `Invalid serialized tx input: not an EIP-1559 transaction (wrong tx type, expected: ${TRANSACTION_TYPE}, received: ${serialized
          .slice(0, 1)
          .toString('hex')}`
      )
    }

    const values = rlp.decode(serialized.slice(1))

    if (!Array.isArray(values)) {
      throw new TypeError('Invalid serialized tx input: must be array')
    }

    return FeeMarketEIP1559Transaction.fromValuesArray(values, opts)
  }

  /**
   * Instantiate a transaction from the serialized tx.
   * (alias of {@link FeeMarketEIP1559Transaction.fromSerializedTx})
   *
   * Note: This means that the Buffer should start with 0x01.
   *
   * @deprecated this constructor alias is deprecated and will be removed
   * in favor of the {@link FeeMarketEIP1559Transaction.fromSerializedTx} constructor
   */
  static fromRlpSerializedTx(serialized, opts = {}) {
    return FeeMarketEIP1559Transaction.fromSerializedTx(serialized, opts)
  }

  /**
   * Create a transaction from a values array.
   *
   * Format: `[chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
   * accessList, signatureYParity, signatureR, signatureS]`
   */
  static fromValuesArray(values, opts = {}) {
    if (values.length !== 9 && values.length !== 12) {
      throw new Error(
        'Invalid EIP-1559 transaction. Only expecting 9 values (for unsigned tx) or 12 values (for signed tx).'
      )
    }

    const [
      chainId,
      nonce,
      maxPriorityFeePerGas,
      maxFeePerGas,
      gasLimit,
      to,
      value,
      data,
      accessList,
      v,
      r,
      s,
    ] = values

    return new FeeMarketEIP1559Transaction(
      {
        chainId: new BN(chainId),
        nonce,
        maxPriorityFeePerGas,
        maxFeePerGas,
        gasLimit,
        to,
        value,
        data,
        accessList: accessList ?? [],
        v: v === undefined ? undefined : new BN(v), // EIP2930 supports v's with value 0 (empty Buffer)
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
    const { chainId, accessList, maxFeePerGas, maxPriorityFeePerGas } = txData

    this.common = this._getCommon(opts.common, chainId)
    this.chainId = this.common.chainIdBN()

    if (!this.common.isActivatedEIP(1559)) {
      throw new Error('EIP-1559 not enabled on Common')
    }

    this.activeCapabilities = [...this.activeCapabilities, 1559, 2718, 2930]

    // Populate the access list fields
    const accessListData = AccessLists.getAccessListData(accessList ?? [])
    this.accessList = accessListData.accessList
    this.AccessListJSON = accessListData.AccessListJSON
    // Verify the access list format.
    AccessLists.verifyAccessList(this.accessList)

    this.maxFeePerGas = new BN(toBuffer(maxFeePerGas === '' ? '0x' : maxFeePerGas))
    this.maxPriorityFeePerGas = new BN(
      toBuffer(maxPriorityFeePerGas === '' ? '0x' : maxPriorityFeePerGas)
    )

    this._validateCannotExceedMaxInteger(
      {
        maxFeePerGas: this.maxFeePerGas,
        maxPriorityFeePerGas: this.maxPriorityFeePerGas,
      },
      256
    )

    if (this.maxFeePerGas.lt(this.maxPriorityFeePerGas)) {
      throw new Error(
        'maxFeePerGas cannot be less than maxPriorityFeePerGas (The total must be the larger of the two)'
      )
    }

    if (this.v && !this.v.eqn(0) && !this.v.eqn(1)) {
      throw new Error('The y-parity of the transaction should either be 0 or 1')
    }

    if (this.common.gteHardfork('homestead') && this.s?.gt(N_DIV_2)) {
      throw new Error(
        'Invalid Signature: s-values greater than secp256k1n/2 are considered invalid'
      )
    }

    const freeze = opts?.freeze ?? true
    if (freeze) {
      Object.freeze(this)
    }
  }

  /**
   * The amount of gas paid for the data in this tx
   */
  getDataFee() {
    const cost = super.getDataFee()
    cost.iaddn(AccessLists.getDataFeeEIP2930(this.accessList, this.common))
    return cost
  }

  /**
   * The up front amount that an account must have for this transaction to be valid
   * @param baseFee The base fee of the block (will be set to 0 if not provided)
   */
  getUpfrontCost(baseFee = new BN(0)) {
    const inclusionFeePerGas = BN.min(this.maxPriorityFeePerGas, this.maxFeePerGas.sub(baseFee))
    const gasPrice = inclusionFeePerGas.add(baseFee)
    return this.gasLimit.mul(gasPrice).add(this.value)
  }

  /**
   * Returns a Buffer Array of the raw Buffers of the EIP-1559 transaction, in order.
   *
   * Format: `[chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
   * accessList, signatureYParity, signatureR, signatureS]`
   *
   * Use {@link FeeMarketEIP1559Transaction.serialize} to add to block data for {@link Block.fromValuesArray}.
   */
  raw() {
    return [
      bnToUnpaddedBuffer(this.chainId),
      bnToUnpaddedBuffer(this.nonce),
      bnToUnpaddedBuffer(this.maxPriorityFeePerGas),
      bnToUnpaddedBuffer(this.maxFeePerGas),
      bnToUnpaddedBuffer(this.gasLimit),
      this.to === undefined ? Buffer.from([]) : this.to.buf,
      bnToUnpaddedBuffer(this.value),
      this.data,
      this.accessList,
      this.v === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.v),
      this.r === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.r),
      this.s === undefined ? Buffer.from([]) : bnToUnpaddedBuffer(this.s),
    ]
  }

  /**
   * Returns the serialized encoding of the EIP-1559 transaction.
   *
   * Format: `0x02 || rlp([chainId, nonce, maxPriorityFeePerGas, maxFeePerGas, gasLimit, to, value, data,
   * accessList, signatureYParity, signatureR, signatureS])`
   *
   * Note that in contrast to the legacy tx serialization format this is not
   * valid RLP any more due to the raw tx type preceeding and concatenated to
   * the RLP encoding of the values.
   */
  serialize() {
    const base = this.raw()
    return Buffer.concat([TRANSACTION_TYPE_BUFFER, rlp.encode(base)])
  }

  /**
   * Returns the serialized unsigned tx (hashed or raw), which can be used
   * to sign the transaction (e.g. for sending to a hardware wallet).
   *
   * Note: in contrast to the legacy tx the raw message format is already
   * serialized and doesn't need to be RLP encoded any more.
   *
   * ```javascript
   * const serializedMessage = tx.getMessageToSign(false) // use this for the HW wallet input
   * ```
   *
   * @param hashMessage - Return hashed message if set to true (default: true)
   */
  getMessageToSign(hashMessage = true) {
    const base = this.raw().slice(0, 9)
    const message = Buffer.concat([TRANSACTION_TYPE_BUFFER, rlp.encode(base)])
    if (hashMessage) {
      return keccak256(message)
    }

    return message
  }

  /**
   * Computes a sha3-256 hash of the serialized tx.
   *
   * This method can only be used for signed txs (it throws otherwise).
   * Use {@link FeeMarketEIP1559Transaction.getMessageToSign} to get a tx hash for the purpose of signing.
   */
  hash() {
    if (!this.isSigned()) {
      throw new Error('Cannot call hash method if transaction is not signed')
    }

    return keccak256(this.serialize())
  }

  _processSignature(v, r, s) {
    const opts = {
      common: this.common,
    }

    return FeeMarketEIP1559Transaction.fromTxData(
      {
        chainId: this.chainId,
        nonce: this.nonce,
        maxPriorityFeePerGas: this.maxPriorityFeePerGas,
        maxFeePerGas: this.maxFeePerGas,
        gasLimit: this.gasLimit,
        to: this.to,
        value: this.value,
        data: this.data,
        accessList: this.accessList,
        v: new BN(v - 27), // This looks extremely hacky: ethereumjs-util actually adds 27 to the value, the recovery bit is either 0 or 1.
        r: new BN(r),
        s: new BN(s),
      },
      opts
    )
  }

  /**
   * Returns an object with the JSON representation of the transaction
   */
  toJSON() {
    const accessListJSON = AccessLists.getAccessListJSON(this.accessList)

    return {
      chainId: bnToHex(this.chainId),
      nonce: bnToHex(this.nonce),
      maxPriorityFeePerGas: bnToHex(this.maxPriorityFeePerGas),
      maxFeePerGas: bnToHex(this.maxFeePerGas),
      gasLimit: bnToHex(this.gasLimit),
      to: this.to === undefined ? undefined : this.to.toString(),
      value: bnToHex(this.value),
      data: '0x' + this.data.toString('hex'),
      accessList: accessListJSON,
      v: this.v === undefined ? undefined : bnToHex(this.v),
      r: this.r === undefined ? undefined : bnToHex(this.r),
      s: this.s === undefined ? undefined : bnToHex(this.s),
    }
  }
}
