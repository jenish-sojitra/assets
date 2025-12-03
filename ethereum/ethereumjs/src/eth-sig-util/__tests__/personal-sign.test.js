// from @metamask/eth-sig-util@4.0.1, with some lint + added a string 'hello world' test

import { personalSign } from '../personal-sign.js'

const privateKey = Buffer.from(
  '4af1bceebf7f3634ec3cff8a2c38e51178d5d4ce585c52d6043e5e2cc3418bb0',
  'hex'
)

describe('personalSign', () => {
  const helloWorldSignature =
    '0x90a938f7457df6e8f741264c32697fc52f9a8f867c52dd70713d9d2d472f2e415d9c94148991bbe1f4a1818d1dff09165782749c877f5cf1eff4ef126e55714d1c'
  const helloWorldMessage = `0x${Buffer.from('Hello, world!').toString('hex')}`

  it('should sign a message', () => {
    expect(personalSign({ privateKey, data: helloWorldMessage })).toBe(helloWorldSignature)
  })

  // same but in string format
  it('should sign a string message', () => {
    expect(personalSign({ privateKey, data: 'Hello, world!' })).toBe(helloWorldSignature)
  })

  const testCases = [
    {
      testLabel: 'personalSign - kumavis fml manual test I',
      // "hello world"
      message: '0x68656c6c6f20776f726c64',
      signature:
        '0xce909e8ea6851bc36c007a0072d0524b07a3ff8d4e623aca4c71ca8e57250c4d0a3fc38fa8fbaaa81ead4b9f6bd03356b6f8bf18bccad167d78891636e1d69561b',
      key: Buffer.from('6969696969696969696969696969696969696969696969696969696969696969', 'hex'),
    },
    {
      testLabel: 'personalSign - as previous but string to test fromBuffer',
      message: 'hello world',
      signature:
        '0xce909e8ea6851bc36c007a0072d0524b07a3ff8d4e623aca4c71ca8e57250c4d0a3fc38fa8fbaaa81ead4b9f6bd03356b6f8bf18bccad167d78891636e1d69561b',
      key: Buffer.from('6969696969696969696969696969696969696969696969696969696969696969', 'hex'),
    },
    {
      testLabel: 'personalSign - kumavis fml manual test II',
      // some random binary message from parity's test
      message: '0x0cc175b9c0f1b6a831c399e26977266192eb5ffee6ae2fec3ad71c777531578f',
      signature:
        '0x9ff8350cc7354b80740a3580d0e0fd4f1f02062040bc06b893d70906f8728bb5163837fd376bf77ce03b55e9bd092b32af60e86abce48f7b8d3539988ee5a9be1c',
      key: Buffer.from('6969696969696969696969696969696969696969696969696969696969696969', 'hex'),
    },
    {
      testLabel: 'personalSign - kumavis fml manual test III',
      // random binary message data and pk from parity's test
      // https://github.com/ethcore/parity/blob/5369a129ae276d38f3490abb18c5093b338246e0/rpc/src/v1/tests/mocked/eth.rs#L301-L317
      // note: their signature result is incorrect (last byte moved to front) due to a parity bug
      message: '0x0cc175b9c0f1b6a831c399e26977266192eb5ffee6ae2fec3ad71c777531578f',
      signature:
        '0xa2870db1d0c26ef93c7b72d2a0830fa6b841e0593f7186bc6c7cc317af8cf3a42fda03bd589a49949aa05db83300cdb553116274518dbe9d90c65d0213f4af491b',
      key: Buffer.from('4545454545454545454545454545454545454545454545454545454545454545', 'hex'),
    },
  ]

  for (const { testLabel, message, signature, key } of testCases) {
    it(testLabel, () => {
      const signed = personalSign({ privateKey: key, data: message })
      expect(signed).toBe(signature)
    })
  }

  describe('validation', () => {
    describe('personalSign', () => {
      it('should throw if passed null data', () => {
        expect(() => personalSign({ privateKey, data: null })).toThrow('Missing data parameter')
      })

      it('should throw if passed undefined data', () => {
        expect(() => personalSign({ privateKey, data: undefined })).toThrow(
          'Missing data parameter'
        )
      })

      it('should throw if passed a null private key', () => {
        expect(() => personalSign({ privateKey: null, data: helloWorldMessage })).toThrow(
          'Missing privateKey parameter'
        )
      })

      it('should throw if passed an undefined private key', () => {
        expect(() => personalSign({ privateKey: undefined, data: helloWorldMessage })).toThrow(
          'Missing privateKey parameter'
        )
      })
    })
  })
})
