import tape from '@exodus/test/tape'
import { BN } from 'bn.js'
import * as rlp from 'rlp' // eslint-disable-line camelcase

import { intToBuffer } from '../index.js'
import { getKeys, intToHex, isHexString } from '../util.js'

describe('External BN export', () => {
  tape('should use a BN function correctly', (st) => {
    const a = new BN('dead', 16)
    const b = new BN('101010', 2)
    const result = a.add(b)
    st.equal(result.toString(10), '57047')
    st.end()
  })

  tape('should throw on exceptions', (st) => {
    // should not allow 0 input
    st.throws(() => {
      new BN(1).egcd(new BN('0'))
    }, /^Error: Assertion failed$/)
    st.end()
  })

  tape('should not accept an unsafe integer', (st) => {
    const num = Math.pow(2, 53)
    st.throws(() => {
      return new BN(num, 10)
    }, /^Error: Assertion failed$/)
    st.end()
  })

  tape('should throw error with num eq 0x4000000', (st) => {
    st.throws(function () {
      new BN(0).iaddn(0x4_00_00_00)
    }, /^Error: Assertion failed$/)
    st.end()
  })
})

describe('External rlp export', () => {
  tape('should use a rlp function correctly', (st) => {
    const nestedList = [[], [[]], [[], [[]]]]
    const encoded = rlp.encode(nestedList)
    const decoded = rlp.decode(encoded)
    st.deepEqual(nestedList, decoded)
    st.end()
  })

  tape('should throw on exceptions', (st) => {
    // bad values: wrong encoded a zero
    const val = Buffer.from(
      'f9005f030182520894b94f5374fce5edbc8e2a8697c15331677e6ebf0b0a801ca098ff921201554726367d2be8c804a7ff89ccf285ebc57dff8ae4c44b9c19ac4aa08887321be575c8095f789dd4c743dfe42c1820f9231f98a962b210e3ac2452a3',
      'hex'
    )
    let result
    try {
      result = rlp.decode(val)
    } catch {
      // pass
    }

    st.equal(result, undefined)

    // bad values: invalid length
    const a = Buffer.from(
      'f86081000182520894b94f5374fce5edbc8e2a8697c15331677e6ebf0b0a801ca098ff921201554726367d2be8c804a7ff89ccf285ebc57dff8ae4c44b9c19ac4aa08887321be575c8095f789dd4c743dfe42c1820f9231f98a962b210e3ac2452a3',
      'hex'
    )

    let res
    try {
      res = rlp.decode(a)
    } catch {
      // pass
    }

    st.equal(res, undefined)
    st.end()
  })
})

describe('External ethjsUtil export', () => {
  tape('should use ethjsUtil functions correctly', (st) => {
    // should convert intToHex
    st.equal(intToHex(new BN(0).toNumber()), '0x0')

    // should convert intToHex
    const i = 6_003_400
    const hex = intToHex(i)
    st.equal(hex, '0x5b9ac8')

    // should convert a int to a buffer
    const j = 6_003_400
    const buf = intToBuffer(j)
    st.equal(buf.toString('hex'), '5b9ac8')
    st.end()
  })

  tape('should handle exceptions and invalid inputs', (st) => {
    // should throw when invalid abi
    st.throws(() => getKeys([], 3289), Error)

    // should detect invalid length hex string
    st.equal(isHexString('0x0', 2), false)
    st.end()
  })
})
