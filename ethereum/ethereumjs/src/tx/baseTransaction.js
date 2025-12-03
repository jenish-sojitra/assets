import { BN } from 'bn.js'

import { Chain, Common, Hardfork } from '../common/common.js'
import { Address, ecsign, MAX_INTEGER, splitSignature, TWO_POW256 } from '../util/extra.js'
import { toBuffer } from '../util/index.js'
import { Capability } from './types.js'

/**
 * This base class will likely be subject to further
 * refactoring along the introduction of additional tx types
 * on the Ethereum network.
 *
 * It is therefore not recommended to use directly.
 */
export class BaseTransaction {
  _type

  nonce
  gasLimit
  to
  value
  data

  v
  r
  s

  common

  /**
   * List of tx type defining EIPs,
   * e.g. 1559 (fee market) and 2930 (access lists)
   * for FeeMarketEIP1559Transaction objects
   */
  activeCapabilities = []

  /**
   * The default chain the tx falls back to if no Common
   * is provided and if the chain can't be derived from
   * a passed in chainId (only EIP-2718 typed txs) or
   * EIP-155 signature (legacy txs).
   */
  DEFAULT_CHAIN = Chain.Mainnet

  /**
   * The default HF if the tx type is active on that HF
   * or the first greater HF where the tx is active.
   */
  DEFAULT_HARDFORK = Hardfork.Istanbul

  constructor(txData) {
    const { nonce, gasLimit, to, value, data, v, r, s, type } = txData
    this._type = new BN(toBuffer(type)).toNumber()

    const toB = toBuffer(to === '' ? '0x' : to)
    const vB = toBuffer(v === '' ? '0x' : v)
    const rB = toBuffer(r === '' ? '0x' : r)
    const sB = toBuffer(s === '' ? '0x' : s)

    this.nonce = new BN(toBuffer(nonce === '' ? '0x' : nonce))
    this.gasLimit = new BN(toBuffer(gasLimit === '' ? '0x' : gasLimit))
    this.to = toB.length > 0 ? new Address(toB) : undefined
    this.value = new BN(toBuffer(value === '' ? '0x' : value))
    this.data = toBuffer(data === '' ? '0x' : data)

    this.v = vB.length > 0 ? new BN(vB) : undefined
    this.r = rB.length > 0 ? new BN(rB) : undefined
    this.s = sB.length > 0 ? new BN(sB) : undefined

    this._validateCannotExceedMaxInteger({
      nonce: this.nonce,
      gasLimit: this.gasLimit,
      value: this.value,
      r: this.r,
      s: this.s,
    })
  }

  /**
   * Alias for {@link BaseTransaction.type}
   *
   * @deprecated Use `type` instead
   */
  get transactionType() {
    return this.type
  }

  /**
   * Returns the transaction type.
   *
   * Note: legacy txs will return tx type `0`.
   */
  get type() {
    return this._type
  }

  /**
   * Checks if a tx type defining capability is active
   * on a tx, for example the EIP-1559 fee market mechanism
   * or the EIP-2930 access list feature.
   *
   * Note that this is different from the tx type itself,
   * so EIP-2930 access lists can very well be active
   * on an EIP-1559 tx for example.
   *
   * This method can be useful for feature checks if the
   * tx type is unknown (e.g. when instantiated with
   * the tx factory).
   *
   * See `Capabilites` in the `types` module for a reference
   * on all supported capabilities.
   */
  supports(capability) {
    return this.activeCapabilities.includes(capability)
  }

  /**
   * The minimum amount of gas the tx must have (DataFee + TxFee + Creation Fee)
   */
  getBaseFee() {
    const fee = this.getDataFee().addn(this.common.param('gasPrices', 'tx'))
    if (this.common.gteHardfork('homestead') && this.toCreationAddress()) {
      fee.iaddn(this.common.param('gasPrices', 'txCreation'))
    }

    return fee
  }

  /**
   * The amount of gas paid for the data in this tx
   */
  getDataFee() {
    const txDataZero = this.common.param('gasPrices', 'txDataZero')
    const txDataNonZero = this.common.param('gasPrices', 'txDataNonZero')

    let cost = 0
    for (let i = 0; i < this.data.length; i++) {
      this.data[i] === 0 ? (cost += txDataZero) : (cost += txDataNonZero)
    }

    return new BN(cost)
  }

  /**
   * If the tx's `to` is to the creation address
   */
  toCreationAddress() {
    return this.to === undefined || this.to.buf.length === 0
  }

  isSigned() {
    const { v, r, s } = this
    if (this.type === 0) return Boolean(v && r && s)
    return Boolean(v !== undefined && r && s)
  }

  /**
   * Signs a transaction.
   *
   * Note that the signed tx is returned as a new object,
   * use as follows:
   * ```javascript
   * const signedTx = tx.sign(privateKey)
   * ```
   */
  sign(privateKey) {
    if (privateKey.length !== 32) {
      throw new Error('Private key must be 32 bytes in length.')
    }

    // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
    // and want to recreate a signature (where EIP155 should be applied)
    // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
    // 2021-06-23
    let hackApplied = false
    if (
      this.type === 0 &&
      this.common.gteHardfork('spuriousDragon') &&
      !this.supports(Capability.EIP155ReplayProtection)
    ) {
      this.activeCapabilities.push(Capability.EIP155ReplayProtection)
      hackApplied = true
    }

    const msgHash = this.getMessageToSign(true)
    const { v, r, s } = ecsign(msgHash, privateKey)
    const tx = this._processSignature(v, r, s)

    // Hack part 2
    if (hackApplied) {
      const index = this.activeCapabilities.indexOf(Capability.EIP155ReplayProtection)
      if (index > -1) {
        this.activeCapabilities.splice(index, 1)
      }
    }

    return tx
  }

  /**
   * Signs a transaction.
   *
   * Note that the signed tx is returned as a new object,
   * use as follows:
   * ```javascript
   * const signer = (buffer: Buffer): Promise<{ signature, recid }>
   * const signedTx = await tx.sign(signer)
   * ```
   */
  signWithSigner(signer) {
    // Hack for the constellation that we have got a legacy tx after spuriousDragon with a non-EIP155 conforming signature
    // and want to recreate a signature (where EIP155 should be applied)
    // Leaving this hack lets the legacy.spec.ts -> sign(), verifySignature() test fail
    // 2021-06-23
    let hackApplied = false
    if (
      this.type === 0 &&
      this.common.gteHardfork('spuriousDragon') &&
      !this.supports(Capability.EIP155ReplayProtection)
    ) {
      this.activeCapabilities.push(Capability.EIP155ReplayProtection)
      hackApplied = true
    }

    const msgHash = this.getMessageToSign(true)

    const _processSignature = ({ signature, recid }) => {
      const { r, s, v } = splitSignature(signature, recid)

      const tx = this._processSignature(v, r, s)

      // Hack part 2
      if (hackApplied) {
        const index = this.activeCapabilities.indexOf(Capability.EIP155ReplayProtection)
        if (index > -1) {
          this.activeCapabilities.splice(index, 1)
        }
      }

      return tx
    }

    return signer(msgHash).then(({ signature, recid }) => _processSignature({ signature, recid }))
  }

  /**
   * Does chain ID checks on common and returns a common
   * to be used on instantiation
   *
   * @param common - {@link Common} instance from tx options
   * @param chainId - Chain ID from tx options (typed txs) or signature (legacy tx)
   */
  _getCommon(common, chainId) {
    // Chain ID provided
    if (chainId) {
      const chainIdBN = new BN(toBuffer(chainId))
      if (common) {
        if (!common.chainIdBN().eq(chainIdBN)) {
          throw new Error('The chain ID does not match the chain ID of Common')
        }

        // Common provided, chain ID does match
        // -> Return provided Common
        return common.copy()
      }

      if (Common.isSupportedChainId(chainIdBN)) {
        // No Common, chain ID supported by Common
        // -> Instantiate Common with chain ID
        return new Common({ chain: chainIdBN, hardfork: this.DEFAULT_HARDFORK })
      }

      // No Common, chain ID not supported by Common
      // -> Instantiate custom Common derived from DEFAULT_CHAIN
      return Common.forCustomChain(
        this.DEFAULT_CHAIN,
        {
          name: 'custom-chain',
          networkId: chainIdBN,
          chainId: chainIdBN,
        },
        this.DEFAULT_HARDFORK
      )
    }

    // No chain ID provided
    // -> return Common provided or create new default Common
    return (
      common?.copy() ?? new Common({ chain: this.DEFAULT_CHAIN, hardfork: this.DEFAULT_HARDFORK })
    )
  }

  _validateCannotExceedMaxInteger(values, bits = 53) {
    for (const [key, value] of Object.entries(values)) {
      if (bits === 53) {
        if (value?.gt(MAX_INTEGER)) {
          throw new Error(`${key} cannot exceed MAX_INTEGER, given ${value}`)
        }
      } else if (bits === 256) {
        if (value?.gte(TWO_POW256)) {
          throw new Error(`${key} must be less than 2^256, given ${value}`)
        }
      } else {
        throw new Error('unimplemented bits value')
      }
    }
  }
}
