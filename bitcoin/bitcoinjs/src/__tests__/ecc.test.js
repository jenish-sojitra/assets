import { runVectorTests } from '@exodus/assets-testing'
import { privateKeyToPublicKey } from '@exodus/crypto/secp256k1'
import * as ecc from '@exodus/crypto/tiny-secp256k1-compat'

import { crypto } from '../index.js'
import { vectors } from './ecc-vectors.js'

const repeat = 2
describe(`desktop ecc vector tests`, () => {
  runVectorTests({
    asset: { name: 'ecc', ecc },
    vectors,
    api: 'ecc',
    skip: [
      'isPointCompressed',
      'pointAdd',
      'recover',
      'pointAddScalar',
      'pointMultiply',
      'privateSub',
      'signRecoverable',
      'verifyAsync',
      'xOnlyPointFromPoint',
      'xOnlyPointFromScalar',
    ],
    repeat,
  })
})

function signAndVerify(text, ecc) {
  const hash256 = crypto.hash256
  const key = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex')
  const pub = privateKeyToPublicKey({ privateKey: key })
  const msg = hash256(Buffer.from(text, 'ascii'))
  const sig = ecc.sign(msg, key)
  expect(ecc.verify(msg, pub, sig)).toEqual(true)
}

async function signAndVerifySchnorr(text, ecc) {
  const hash256 = crypto.hash256
  const key = Buffer.from('243F6A8885A308D313198A2E03707344A4093822299F31D0082EFA98EC4E6C89', 'hex')
  const pub = privateKeyToPublicKey({ privateKey: key }).slice(1)
  expect(Buffer.from(pub).toString('hex')).toEqual(
    '359805af09494a6015501a5f5ebadee846461f6191914596ed9856f7c7d59e06'
  )
  const msg = hash256(Buffer.from(text, 'ascii'))
  const sig = await ecc.signSchnorr(msg, key)
  expect(await ecc.verifySchnorr(msg, pub, sig)).toEqual(true)
}

test(`sign + verify, desktop`, () => {
  return signAndVerify('foo', ecc)
})

test(`sign + verify Schnorr, desktop`, () => {
  return signAndVerifySchnorr('foo', ecc)
})
