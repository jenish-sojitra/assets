import tape from '@exodus/test/tape'
import { BN } from 'bn.js'

import { ecsign } from '../extra.js'
import { hashPersonalMessage } from '../index.js'

const echash = Buffer.from(
  '82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28',
  'hex'
)
const ecprivkey = Buffer.from(
  '3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1',
  'hex'
)
const chainId = 3 // ropsten

describe('ecsign', function () {
  const t = { test: tape }

  t.test('should produce a signature', function (st) {
    const sig = ecsign(echash, ecprivkey)
    st.ok(
      sig.r.equals(
        Buffer.from('99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9', 'hex')
      )
    )
    st.ok(
      sig.s.equals(
        Buffer.from('129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66', 'hex')
      )
    )
    st.equal(sig.v, 27)
    st.end()
  })

  t.test('should produce a signature for Ropsten testnet', function (st) {
    const sig = ecsign(echash, ecprivkey, chainId)
    st.ok(
      sig.r.equals(
        Buffer.from('99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9', 'hex')
      )
    )
    st.ok(
      sig.s.equals(
        Buffer.from('129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66', 'hex')
      )
    )
    st.equal(sig.v, 41)
    st.end()
  })

  t.test('should produce a signature for chainId=150', function (st) {
    const expectedSigR = Buffer.from(
      '99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9',
      'hex'
    )
    const expectedSigS = Buffer.from(
      '129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66',
      'hex'
    )
    const expectedSigV = Buffer.from('014f', 'hex')

    const sig = ecsign(echash, ecprivkey, 150)
    st.ok(sig.r.equals(expectedSigR))
    st.ok(sig.s.equals(expectedSigS))
    st.equal(sig.v, 150 * 2 + 35)

    let sigBuffer = ecsign(echash, ecprivkey, new BN(150))
    st.ok(sigBuffer.r.equals(expectedSigR))
    st.ok(sigBuffer.s.equals(expectedSigS))
    st.ok(sigBuffer.v.equals(expectedSigV))

    sigBuffer = ecsign(echash, ecprivkey, Buffer.from([150]))
    st.ok(sigBuffer.v.equals(expectedSigV))

    sigBuffer = ecsign(echash, ecprivkey, '0x96')
    st.ok(sigBuffer.v.equals(expectedSigV))

    st.throws(function () {
      ecsign(echash, ecprivkey, '96')
    })
    st.end()
  })

  t.test(
    'should produce a signature for a high number chainId greater than MAX_SAFE_INTEGER',
    function (st) {
      const chainIDBuffer = Buffer.from('796f6c6f763378', 'hex')
      const expectedSigR = Buffer.from(
        '99e71a99cb2270b8cac5254f9e99b6210c6c10224a1579cf389ef88b20a1abe9',
        'hex'
      )
      const expectedSigS = Buffer.from(
        '129ff05af364204442bdb53ab6f18a99ab48acc9326fa689f228040429e3ca66',
        'hex'
      )
      const expectedSigV = Buffer.from('f2ded8deec6713', 'hex')

      let sigBuffer = ecsign(echash, ecprivkey, new BN(chainIDBuffer))
      st.ok(sigBuffer.r.equals(expectedSigR))
      st.ok(sigBuffer.s.equals(expectedSigS))
      st.ok(sigBuffer.v.equals(expectedSigV))

      sigBuffer = ecsign(echash, ecprivkey, chainIDBuffer)
      st.ok(sigBuffer.v.equals(expectedSigV))

      sigBuffer = ecsign(echash, ecprivkey, '0x' + chainIDBuffer.toString('hex'))
      st.ok(sigBuffer.v.equals(expectedSigV))

      const chainIDNumber = parseInt(chainIDBuffer.toString('hex'), 16)
      st.throws(() => {
        // If we would use a number for the `chainId` parameter then it should throw.
        // (The numbers are too high to perform arithmetic on)
        ecsign(echash, ecprivkey, chainIDNumber)
      })
      st.end()
    }
  )
})

describe('hashPersonalMessage', function () {
  const t = { test: tape }

  t.test('should produce a deterministic hash', function (st) {
    const h = hashPersonalMessage(Buffer.from('Hello world'))
    st.ok(
      h.equals(
        Buffer.from('8144a6fa26be252b86456491fbcd43c1de7e022241845ffea1c3df066f7cfede', 'hex')
      )
    )
    st.end()
  })
  t.test('should throw if input is not a buffer', function (st) {
    try {
      hashPersonalMessage([0, 1, 2, 3, 4])
    } catch (err) {
      st.ok(err.message.includes('This method only supports Buffer'))
    }

    st.end()
  })
})
