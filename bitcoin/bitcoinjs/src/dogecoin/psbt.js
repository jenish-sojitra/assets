/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */

import { Psbt as PsbtBase } from 'bip174'
import { Psbt as PsbtBitcoin, Transaction as TransactionBitcoin } from 'bitcoinjs-lib'

import { Transaction } from './transaction.js'

export class Psbt extends PsbtBitcoin {
  static fromBuffer(buffer, opts = {}) {
    const psbtBase = PsbtBase.fromBuffer(buffer, transactionFromBuffer)
    const psbt = new Psbt(opts, psbtBase)
    checkTxForDupeIns(psbt.__CACHE.__TX, psbt.__CACHE)
    return psbt
  }

  constructor(opts = {}, data = new PsbtBase(new PsbtTransaction())) {
    super(opts, data)
  }

  clone() {
    // TODO: more efficient cloning
    const res = Psbt.fromBuffer(this.data.toBuffer())
    res.opts = JSON.parse(JSON.stringify(this.opts))
    return res
  }

  addInput(inputData) {
    const { fromBuffer } = TransactionBitcoin // save
    try {
      TransactionBitcoin.fromBuffer = Transaction.fromBuffer
      return super.addInput(inputData) // calls Transaction.fromBuffer
    } finally {
      TransactionBitcoin.fromBuffer = fromBuffer // restore
    }
  }

  extractTransaction(disableFeeCheck) {
    if (!this.data.inputs.every(isFinalized)) throw new Error('Not finalized')
    const c = this.__CACHE
    if (!disableFeeCheck) {
      checkFees(this, c, this.opts)
    }

    if (c.__EXTRACTED_TX) return c.__EXTRACTED_TX
    const tx = c.__TX.clone()
    inputFinalizeGetAmts(this.data.inputs, tx, c, true)
    return tx
  }

  getFeeRate() {
    return getTxCacheValue('__FEE_RATE', 'fee rate', this.data.inputs, this.__CACHE)
  }

  getFee() {
    return getTxCacheValue('__FEE', 'fee', this.data.inputs, this.__CACHE)
  }
}

const transactionFromBuffer = (buffer) => new PsbtTransaction(buffer)

class PsbtTransaction {
  constructor(buffer = Buffer.from([2, 0, 0, 0, 0, 0, 0, 0, 0, 0])) {
    this.tx = Transaction.fromBuffer(buffer) // Dogecoin fix: uses Dogecoin Transaction here
    checkTxEmpty(this.tx)
    Object.defineProperty(this, 'tx', {
      enumerable: false,
      writable: true,
    })
  }

  getInputOutputCounts() {
    return {
      inputCount: this.tx.ins.length,
      outputCount: this.tx.outs.length,
    }
  }

  addInput(input) {
    if (
      input.hash === undefined ||
      input.index === undefined ||
      (!Buffer.isBuffer(input.hash) && typeof input.hash !== 'string') ||
      typeof input.index !== 'number'
    ) {
      throw new Error('Error adding input.')
    }

    const hash =
      typeof input.hash === 'string' ? Buffer.from(input.hash, 'hex').reverse() : input.hash
    this.tx.addInput(hash, input.index, input.sequence)
  }

  addOutput(output) {
    if (
      output.script === undefined ||
      output.value === undefined ||
      !Buffer.isBuffer(output.script) ||
      !Buffer.isBuffer(output.value) // Dogecoin fix: value is a buffer here
    ) {
      throw new Error('Error adding output.')
    }

    this.tx.addOutput(output.script, output.value.readBigInt64LE(0))
  }

  toBuffer() {
    return this.tx.toBuffer()
  }
}

function isFinalized(input) {
  return !!input.finalScriptSig || !!input.finalScriptWitness
}

function checkFees(psbt, cache, opts) {
  const feeRate = cache.__FEE_RATE || psbt.getFeeRate()
  const vsize = cache.__EXTRACTED_TX.virtualSize()
  const satoshis = feeRate * vsize
  if (feeRate >= opts.maximumFeeRate) {
    throw new Error(
      `Warning: You are paying around ${(satoshis / 1e8).toFixed(8)} in ` +
        `fees, which is ${feeRate} satoshi per byte for a transaction ` +
        `with a VSize of ${vsize} bytes (segwit counted as 0.25 byte per ` +
        `byte). Use setMaximumFeeRate method to raise your threshold, or ` +
        `pass true to the first arg of extractTransaction.`
    )
  }
}

function checkTxEmpty(tx) {
  const isEmpty = tx.ins.every(
    (input) =>
      input.script && input.script.length === 0 && input.witness && input.witness.length === 0
  )
  if (!isEmpty) {
    throw new Error('Format Error: Transaction ScriptSigs are not empty')
  }
}

function checkTxForDupeIns(tx, cache) {
  tx.ins.forEach((input) => {
    checkTxInputCache(cache, input)
  })
}

function checkTxInputCache(cache, input) {
  const key = Buffer.from(input.hash).reverse().toString('hex') + ':' + input.index
  if (cache.__TX_IN_CACHE[key]) throw new Error('Duplicate input detected.')
  cache.__TX_IN_CACHE[key] = 1
}

function getTxCacheValue(key, name, inputs, c) {
  if (!inputs.every(isFinalized)) throw new Error(`PSBT must be finalized to calculate ${name}`)
  if (key === '__FEE_RATE' && c.__FEE_RATE) return c.__FEE_RATE
  if (key === '__FEE' && c.__FEE) return c.__FEE
  let tx
  let mustFinalize = true
  if (c.__EXTRACTED_TX) {
    tx = c.__EXTRACTED_TX
    mustFinalize = false
  } else {
    tx = c.__TX.clone()
  }

  inputFinalizeGetAmts(inputs, tx, c, mustFinalize)
  if (key === '__FEE_RATE') return c.__FEE_RATE
  if (key === '__FEE') return c.__FEE
}

function addNonWitnessTxCache(cache, input, inputIndex) {
  cache.__NON_WITNESS_UTXO_BUF_CACHE[inputIndex] = input.nonWitnessUtxo
  const tx = Transaction.fromBuffer(input.nonWitnessUtxo)
  cache.__NON_WITNESS_UTXO_TX_CACHE[inputIndex] = tx
  const self = cache
  const selfIndex = inputIndex
  delete input.nonWitnessUtxo
  Object.defineProperty(input, 'nonWitnessUtxo', {
    enumerable: true,
    get() {
      const buf = self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex]
      const txCache = self.__NON_WITNESS_UTXO_TX_CACHE[selfIndex]
      if (buf !== undefined) {
        return buf
      }

      const newBuf = txCache.toBuffer()
      self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = newBuf
      return newBuf
    },
    set(data) {
      self.__NON_WITNESS_UTXO_BUF_CACHE[selfIndex] = data
    },
  })
}

function safeNumber(bigint) {
  const num = Number(bigint)
  if (!Number.isSafeInteger(num) || BigInt(num) !== bigint) {
    throw new Error('Overflow, result can not fit into a Number')
  }

  return num
}

const _0n = BigInt(0)

function inputFinalizeGetAmts(inputs, tx, cache, mustFinalize) {
  // Dogecoin fix: sum using BigInt
  let inputAmount = _0n
  inputs.forEach((input, idx) => {
    if (mustFinalize && input.finalScriptSig) tx.ins[idx].script = input.finalScriptSig
    if (mustFinalize && input.finalScriptWitness) {
      throw new Error('Dogecoin does not have segwit') // Removed some logic to make code lighter
    }

    if (input.witnessUtxo) {
      inputAmount += BigInt(input.witnessUtxo.value)
    } else if (input.nonWitnessUtxo) {
      const nwTx = nonWitnessUtxoTxFromCache(cache, input, idx)
      const vout = tx.ins[idx].index
      const out = nwTx.outs[vout]
      inputAmount += BigInt(out.value)
    }
  })

  const outputAmount = tx.outs.reduce((total, o) => total + BigInt(o.value), _0n)
  const fee = inputAmount - outputAmount
  if (fee < _0n) throw new Error('Outputs are spending more than Inputs')

  const bytes = tx.virtualSize()
  cache.__FEE = safeNumber(fee)
  cache.__EXTRACTED_TX = tx
  cache.__FEE_RATE = safeNumber(fee / BigInt(bytes))
}

function nonWitnessUtxoTxFromCache(cache, input, inputIndex) {
  const c = cache.__NON_WITNESS_UTXO_TX_CACHE
  if (!c[inputIndex]) {
    addNonWitnessTxCache(cache, input, inputIndex)
  }

  return c[inputIndex]
}
