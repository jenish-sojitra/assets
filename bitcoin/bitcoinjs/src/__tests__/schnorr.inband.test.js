import * as ecc from '@exodus/crypto/tiny-secp256k1-compat'

import { vectors } from './bip-0340-vectors.js'

function runVector({ ecc }) {
  for (const vector of vectors) {
    test(`signs a message ${vector.index} ${vector.comment}`, async () => {
      const privateKey = vector.secretKey
      const message = vector.message
      const valid = vector.verificationResult
      const messageBuffer = Buffer.from(message, 'hex')
      if (privateKey) {
        const privateKeyBuffer = Buffer.from(privateKey, 'hex')
        const auxRandBuffer = Buffer.from(vector.aux, 'hex')
        const signature = ecc.signSchnorr(messageBuffer, privateKeyBuffer, auxRandBuffer)
        const signatureBuffer = Buffer.from(signature)
        expect(signatureBuffer.toString('hex').toLowerCase()).toEqual(
          vector.signature.toLowerCase()
        )
      }

      try {
        const result = ecc.verifySchnorr(
          Buffer.from(vector.message, 'hex'),
          Buffer.from(vector.publicKey, 'hex'),
          Buffer.from(vector.signature, 'hex')
        )
        expect(result).toEqual(true)
        expect(valid).toEqual(true)
      } catch {
        expect(valid).toEqual(false)
      }
    })
  }
}

describe('schnorr desktop', () => {
  runVector({ ecc })
})
