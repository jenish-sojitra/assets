import { Transaction as BitcoinTransaction } from 'bitcoinjs-lib'
import { BufferReader, BufferWriter } from 'bitcoinjs-lib/src/bufferutils.js'
import * as types from 'bitcoinjs-lib/src/types.js'

const isBigUint = (value) => typeof value === 'bigint' && value >= BigInt(0)
export function valueToBuffer(value) {
  if (typeof value === 'number' && Number.isSafeInteger(value)) return valueToBuffer(BigInt(value))
  if (isBigUint(value)) {
    const buffer = Buffer.alloc(8)
    buffer.writeBigInt64LE(value)
    return buffer
  }

  throw new Error(`Unexpected value: ${typeof value}`)
}

const bitcoinTransactionFromBuffer = BitcoinTransaction.fromBuffer // need to cache it as code in psbt.js overwites it temporary
export class Transaction extends BitcoinTransaction {
  static fromBuffer(...args) {
    const { readUInt64 } = BufferReader.prototype
    // Only .value uses readUInt64 here, we temporary overwrite it to return BigInt
    BufferReader.prototype.readUInt64 = function () {
      return this.readSlice(8).readBigInt64LE(0)
    }

    try {
      const tx = bitcoinTransactionFromBuffer(...args)
      Object.setPrototypeOf(tx, Transaction.prototype) // Dogecoin fix: uses Dogecoin Transaction here
      return tx
    } finally {
      BufferReader.prototype.readUInt64 = readUInt64 // restore
    }
  }

  addOutput(scriptPubKey, value) {
    types.typeforce(types.tuple(types.Buffer, isBigUint), arguments) // Dogecoin fix: value is a BigInt here
    // Add the output and return the output's index
    return this.outs.push({ script: scriptPubKey, value }) - 1
  }

  clone() {
    const tx = super.clone()
    Object.setPrototypeOf(tx, Transaction.prototype) // Dogecoin fix: uses Dogecoin Transaction here
    return tx
  }

  hashForWitnessV1() {
    throw new Error('Dogecoin does not have segwit') // Implementation is incompatible with BigInt values, but we don't need it
  }

  hashForWitnessV0() {
    throw new Error('Dogecoin does not have segwit') // Implementation is incompatible with BigInt values, but we don't need it
  }

  __toBuffer(...args) {
    const { writeUInt64 } = BufferWriter.prototype
    // Only .value uses writeUInt64 here, we temporary overwrite it to support BigInt
    BufferWriter.prototype.writeUInt64 = function (value) {
      return this.writeSlice(valueToBuffer(value))
    }

    try {
      return super.__toBuffer(...args)
    } finally {
      BufferWriter.prototype.writeUInt64 = writeUInt64 // restore
    }
  }
}
