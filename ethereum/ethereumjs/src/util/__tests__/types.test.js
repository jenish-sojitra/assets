import tape from '@exodus/test/tape'
import { BN } from 'bn.js'

import { bnToHex, bnToUnpaddedBuffer, toType, TypeOutput } from '../extra.js'
import { bufferToHex, intToBuffer, toBuffer } from '../index.js'
import { intToHex } from '../util.js'

describe('toType', function () {
  const st = { test: tape }

  describe('from Number', function () {
    const num = 1000
    st.test('should convert to Number', function (st) {
      const result = toType(num, TypeOutput.Number)
      st.strictEqual(result, num)
      st.end()
    })
    st.test('should convert to BN', function (st) {
      const result = toType(num, TypeOutput.BN)
      st.ok(result.eq(new BN(num)))
      st.end()
    })
    st.test('should convert to Buffer', function (st) {
      const result = toType(num, TypeOutput.Buffer)
      st.ok(result.equals(intToBuffer(num)))
      st.end()
    })
    st.test('should convert to PrefixedHexString', function (st) {
      const result = toType(num, TypeOutput.PrefixedHexString)
      st.strictEqual(result, bufferToHex(new BN(num).toArrayLike(Buffer)))
      st.end()
    })
    st.test('should throw an error if greater than MAX_SAFE_INTEGER', function (st) {
      st.throws(() => {
        const num = Number.MAX_SAFE_INTEGER + 1
        toType(num, TypeOutput.BN)
      }, /^Error: The provided number is greater than MAX_SAFE_INTEGER \(please use an alternative input type\)$/)
      st.end()
    })
  })

  describe('from BN', function () {
    const num = new BN(1000)
    st.test('should convert to Number', function (st) {
      const result = toType(num, TypeOutput.Number)
      st.strictEqual(result, num.toNumber())
      st.end()
    })
    st.test('should convert to BN', function (st) {
      const result = toType(num, TypeOutput.BN)
      st.ok(result.eq(num))
      st.end()
    })
    st.test('should convert to Buffer', function (st) {
      const result = toType(num, TypeOutput.Buffer)
      st.ok(result.equals(num.toArrayLike(Buffer)))
      st.end()
    })
    st.test('should convert to PrefixedHexString', function (st) {
      const result = toType(num, TypeOutput.PrefixedHexString)
      st.strictEqual(result, bufferToHex(num.toArrayLike(Buffer)))
      st.end()
    })
    st.test(
      'should throw an error if converting to Number and greater than MAX_SAFE_INTEGER',
      function (st) {
        const num = new BN(Number.MAX_SAFE_INTEGER).addn(1)
        st.throws(() => {
          toType(num, TypeOutput.Number)
        }, /^Error: The provided number is greater than MAX_SAFE_INTEGER \(please use an alternative output type\)$/)
        st.end()
      }
    )
  })

  describe('from Buffer', function () {
    const num = intToBuffer(1000)
    st.test('should convert to Number', function (st) {
      const result = toType(num, TypeOutput.Number)
      st.ok(intToBuffer(result).equals(num))
      st.end()
    })
    st.test('should convert to BN', function (st) {
      const result = toType(num, TypeOutput.BN)
      st.ok(result.eq(new BN(num)))
      st.end()
    })
    st.test('should convert to Buffer', function (st) {
      const result = toType(num, TypeOutput.Buffer)
      st.ok(result.equals(num))
      st.end()
    })
    st.test('should convert to PrefixedHexString', function (st) {
      const result = toType(num, TypeOutput.PrefixedHexString)
      st.strictEqual(result, bufferToHex(num))
      st.end()
    })
  })

  describe('from HexPrefixedString', function () {
    const num = intToHex(1000)
    st.test('should convert to Number', function (st) {
      const result = toType(num, TypeOutput.Number)
      st.strictEqual(intToHex(result), num)
      st.end()
    })
    st.test('should convert to BN', function (st) {
      const result = toType(num, TypeOutput.BN)
      st.strictEqual(bnToHex(result), num)
      st.end()
    })
    st.test('should convert to Buffer', function (st) {
      const result = toType(num, TypeOutput.Buffer)
      st.ok(result.equals(toBuffer(num)))
      st.end()
    })
    st.test('should throw an error if is not 0x-prefixed', function (st) {
      st.throws(() => {
        toType('1', TypeOutput.Number)
      }, /^Error: A string must be provided with a 0x-prefix$/)
      st.end()
    })
  })
})

describe('bnToUnpaddedBuffer', function () {
  const t = { test: tape }

  t.test('should equal unpadded buffer value', function (st) {
    st.ok(bnToUnpaddedBuffer(new BN(0)).equals(Buffer.from([])))
    st.ok(bnToUnpaddedBuffer(new BN(100)).equals(Buffer.from('64', 'hex')))
    st.end()
  })
})
