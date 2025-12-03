// Based on https://github.com/bitcoinjs/bitcoinjs-message

import { hashSync } from '@exodus/crypto/hash'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import varuint from 'varuint-bitcoin'

const SEGWIT_TYPES = {
  P2WPKH: 'p2wpkh',
  P2SH_P2WPKH: 'p2sh(p2wpkh)',
}

function encodeSignature(signature, recovery, compressed, segwitType) {
  if (segwitType === undefined) {
    if (compressed) recovery += 4
  } else {
    recovery += 8
    if (segwitType === SEGWIT_TYPES.P2WPKH) recovery += 4
  }

  return Buffer.concat([Buffer.alloc(1, recovery + 27), signature])
}

export function magicHash(message, messagePrefix) {
  messagePrefix = messagePrefix || '\u0018Bitcoin Signed Message:\n' // eslint-disable-line unicorn/prefer-default-parameters
  if (!Buffer.isBuffer(messagePrefix)) {
    messagePrefix = Buffer.from(messagePrefix, 'utf8')
  }

  if (!Buffer.isBuffer(message)) {
    message = Buffer.from(message, 'utf8')
  }

  const messageVISize = varuint.encodingLength(message.length)
  const buffer = Buffer.alloc(messagePrefix.length + messageVISize + message.length)
  messagePrefix.copy(buffer, 0)
  varuint.encode(message.length, buffer, messagePrefix.length)
  message.copy(buffer, messagePrefix.length + messageVISize)
  return hashSync('sha256', hashSync('sha256', buffer))
}

function prepareSign(messagePrefixArg, sigOptions) {
  if (typeof messagePrefixArg === 'object' && sigOptions === undefined) {
    sigOptions = messagePrefixArg
    messagePrefixArg = undefined
  }

  // TODO: can we flip default extraEntropy to true?
  let { segwitType, extraEntropy = null } = sigOptions || Object.create(null)
  if (segwitType && (typeof segwitType === 'string' || segwitType instanceof String)) {
    segwitType = segwitType.toLowerCase()
  }

  if (segwitType && segwitType !== SEGWIT_TYPES.P2SH_P2WPKH && segwitType !== SEGWIT_TYPES.P2WPKH) {
    throw new Error(
      'Unrecognized segwitType: use "' +
        SEGWIT_TYPES.P2SH_P2WPKH +
        '" or "' +
        SEGWIT_TYPES.P2WPKH +
        '"'
    )
  }

  return {
    messagePrefixArg,
    segwitType,
    extraEntropy,
  }
}

function isSigner(obj) {
  return obj && typeof obj.sign === 'function'
}

export function signSync(message, privateKey, compressed, messagePrefix, sigOptions) {
  const { messagePrefixArg, segwitType, extraEntropy } = prepareSign(messagePrefix, sigOptions)
  const hash = magicHash(message, messagePrefixArg)
  const { signature, recovery } = isSigner(privateKey)
    ? privateKey.sign(hash, extraEntropy || undefined)
    : secp256k1.ecdsaSignHashSync({ hash, privateKey, extraEntropy, recovery: true })
  return encodeSignature(signature, recovery, compressed, segwitType)
}

export async function signAsync(message, privateKey, compressed, messagePrefix, sigOptions) {
  const { messagePrefixArg, segwitType, extraEntropy } = prepareSign(messagePrefix, sigOptions)
  const hash = magicHash(message, messagePrefixArg)
  const { signature, recovery } = isSigner(privateKey)
    ? await privateKey.sign(hash, extraEntropy || undefined)
    : await secp256k1.ecdsaSignHash({ hash, privateKey, extraEntropy, recovery: true })
  return encodeSignature(signature, recovery, compressed, segwitType)
}
