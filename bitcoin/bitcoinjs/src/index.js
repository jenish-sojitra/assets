import * as secp256k1 from '@exodus/crypto/tiny-secp256k1-compat'
import { getEccLib, initEccLib } from 'bitcoinjs-lib/src/ecc_lib.js'

try {
  getEccLib()
} catch (e) {
  if (!e.message.startsWith('No ECC Library provided.')) throw e
  initEccLib(secp256k1, { DANGER_DO_NOT_VERIFY_ECCLIB: true })
}

const eccLib = getEccLib() // should work now!

if (eccLib !== secp256k1) {
  throw new Error('Unexpected: multiple different secp256k1 implementations for bitcoin-js')
}

export * from 'bitcoinjs-lib'
export * as bip371 from 'bitcoinjs-lib/src/psbt/bip371.js'
export { witnessStackToScriptWitness } from 'bitcoinjs-lib/src/psbt/psbtutils.js'
export { scriptClassify } from './script-classify.js'
