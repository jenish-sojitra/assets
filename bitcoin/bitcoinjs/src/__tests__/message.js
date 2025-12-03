// Based on https://github.com/bitcoinjs/bitcoinjs-message

import { hashSync } from '@exodus/crypto/hash'
import { recoverPublicKey } from '@noble/secp256k1'
import bech32 from 'bech32'
import bs58check from 'bs58check'

import { magicHash } from '../message.js'

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)',
}

function decodeSignature(buffer) {
  if (buffer.length !== 65) throw new Error('Invalid signature length')

  const flagByte = buffer.readUInt8(0) - 27
  if (flagByte > 15 || flagByte < 0) {
    throw new Error('Invalid signature parameter')
  }

  return {
    compressed: !!(flagByte & 12),
    segwitType:
      flagByte & 8 ? (flagByte & 4 ? SEGWIT_TYPES.P2WPKH : SEGWIT_TYPES.P2SH_P2WPKH) : null,
    recovery: flagByte & 3,
    signature: buffer.slice(1),
  }
}

function segwitRedeemHash(publicKey) {
  // return hashSync('p2sh-hash160', publicKey)
  const redeemScript = [Buffer.from('0014', 'hex'), hashSync('hash160', publicKey)]
  return hashSync('hash160', redeemScript)
}

function decodeBech32(address) {
  const result = bech32.decode(address)
  const data = bech32.fromWords(result.words.slice(1))
  return Buffer.from(data)
}

export function verify(message, address, signature, messagePrefix, checkSegwitAlways) {
  if (!Buffer.isBuffer(signature)) signature = Buffer.from(signature, 'base64')

  const parsed = decodeSignature(signature)

  if (checkSegwitAlways && !parsed.compressed) {
    throw new Error(
      'checkSegwitAlways can only be used with a compressed pubkey signature flagbyte'
    )
  }

  const hash = magicHash(message, messagePrefix)
  const publicKey = recoverPublicKey(hash, parsed.signature, parsed.recovery, parsed.compressed)
  const publicKeyHash = hashSync('hash160', publicKey)
  let actual, expected

  if (parsed.segwitType) {
    if (parsed.segwitType === SEGWIT_TYPES.P2SH_P2WPKH) {
      actual = segwitRedeemHash(publicKey)
      expected = Buffer.from(bs58check.decode(address).slice(1))
    } else {
      // parsed.segwitType === SEGWIT_TYPES.P2WPKH
      // must be true since we only return null, P2SH_P2WPKH, or P2WPKH
      // from the decodeSignature function.
      actual = publicKeyHash
      expected = decodeBech32(address)
    }
  } else {
    if (checkSegwitAlways) {
      try {
        expected = decodeBech32(address)
        // if address is bech32 it is not p2sh
        return expected.compare(publicKeyHash) === 0
      } catch {
        const redeemHash = segwitRedeemHash(publicKey)
        expected = Buffer.from(bs58check.decode(address).slice(1))
        // base58 can be p2pkh or p2sh-p2wpkh
        return expected.compare(publicKeyHash) === 0 || expected.compare(redeemHash) === 0
      }
    } else {
      actual = publicKeyHash
      expected = Buffer.from(bs58check.decode(address).slice(1))
    }
  }

  return expected.compare(actual) === 0
}
