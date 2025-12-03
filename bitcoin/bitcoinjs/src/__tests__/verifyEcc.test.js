import * as secp256k1 from '@exodus/crypto/tiny-secp256k1-compat'
import { getEccLib, initEccLib } from 'bitcoinjs-lib/src/ecc_lib.js'

test('verify tiny-secp256k1-compat is a good ecc', () => {
  initEccLib(secp256k1)
  const eccLib = getEccLib()
  expect(eccLib).toBe(secp256k1)
})

test('verify raises an error', () => {
  expect(() => initEccLib({ ...secp256k1, isXOnlyPoint: () => false })).toThrow(
    'ecc library invalid'
  )
})
