import tape from '@exodus/test/tape'
import { BN } from 'bn.js'

import { Address } from '../extra.js'
import { bufferToHex, bufferToInt, toBuffer } from '../index.js'
import {
  addHexPrefix,
  baToJSON,
  fromSigned,
  isZeroAddress,
  setLengthLeft,
  setLengthRight,
  toUnsigned,
  unpadArray,
  unpadBuffer,
  unpadHexString,
  zeroAddress,
  zeros,
} from '../util.js'

describe('zeros function', function () {
  tape('should produce lots of 0s', function (st) {
    const z60 = zeros(30)
    const zs60 = '000000000000000000000000000000000000000000000000000000000000'
    st.equal(z60.toString('hex'), zs60)
    st.end()
  })
})

describe('zero address', function () {
  tape('should generate a zero address', function (st) {
    st.equal(zeroAddress(), '0x0000000000000000000000000000000000000000')
    st.end()
  })
})

describe('is zero address', function () {
  tape('should return true when a zero address is passed', function (st) {
    st.equal(isZeroAddress('0x0000000000000000000000000000000000000000'), true)
    st.end()
  })

  tape('should return false when the address is not equal to zero', function (st) {
    const nonZeroAddress = '0x2f015c60e0be116b1f0cd534704db9c92118fb6a'
    st.equal(isZeroAddress(nonZeroAddress), false)
    st.end()
  })

  tape('should return false when address is not hex-prefixed', function (st) {
    st.equal(isZeroAddress('0000000000000000000000000000000000000000'), false)
    st.end()
  })
})

describe('unpadBuffer', function () {
  tape('should unpad a Buffer', function (st) {
    const buf = toBuffer('0x0000000006600')
    const r = unpadBuffer(buf)
    st.ok(r.equals(toBuffer('0x6600')))
    st.end()
  })
  tape('should throw if input is not a Buffer', function (st) {
    st.throws(function () {
      unpadBuffer('0000000006600')
    })
    st.end()
  })
})

describe('unpadArray', function () {
  tape('should unpad an Array', function (st) {
    const arr = [0, 0, 0, 1]
    const r = unpadArray(arr)
    st.deepEqual(r, [1])
    st.end()
  })
  tape('should throw if input is not an Array', function (st) {
    st.throws(function () {
      unpadArray(toBuffer([0, 0, 0, 1]))
    })
    st.end()
  })
})

describe('unpadHexString', function () {
  tape('should unpad a hex prefixed string', function (st) {
    const str = '0x0000000006600'
    const r = unpadHexString(str)
    st.equal(r, '6600')
    st.end()
  })
  tape('should throw if input is not hex-prefixed', function (st) {
    st.throws(function () {
      unpadHexString('0000000006600')
    })
    st.end()
  })
})

describe('setLengthLeft', function () {
  tape('should left pad a Buffer', function (st) {
    const buf = Buffer.from([9, 9])
    const padded = setLengthLeft(buf, 3)
    st.equal(padded.toString('hex'), '000909')
    st.end()
  })
  tape('should left truncate a Buffer', function (st) {
    const buf = Buffer.from([9, 0, 9])
    const padded = setLengthLeft(buf, 2)
    st.equal(padded.toString('hex'), '0009')
    st.end()
  })
  tape('should throw if input is not a Buffer', function (st) {
    st.throws(function () {
      setLengthLeft([9, 9], 3)
    })
    st.end()
  })
})

describe('setLengthRight', function () {
  tape('should right pad a Buffer', function (st) {
    const buf = Buffer.from([9, 9])
    const padded = setLengthRight(buf, 3)
    st.equal(padded.toString('hex'), '090900')
    st.end()
  })
  tape('should right truncate a Buffer', function (st) {
    const buf = Buffer.from([9, 0, 9])
    const padded = setLengthRight(buf, 2)
    st.equal(padded.toString('hex'), '0900')
    st.end()
  })
  tape('should throw if input is not a Buffer', function (st) {
    st.throws(function () {
      setLengthRight([9, 9], 3)
    })
    st.end()
  })
})

describe('bufferToHex', function () {
  tape('should convert a buffer to hex', function (st) {
    const buf = Buffer.from('5b9ac8', 'hex')
    const hex = bufferToHex(buf)
    st.equal(hex, '0x5b9ac8')
    st.end()
  })
  tape('empty buffer', function (st) {
    const buf = Buffer.alloc(0)
    const hex = bufferToHex(buf)
    st.strictEqual(hex, '0x')
    st.end()
  })
})

describe('bufferToInt', function () {
  tape('should convert an int to hex', function (st) {
    const buf = Buffer.from('5b9ac8', 'hex')
    const i = bufferToInt(buf)
    st.equal(i, 6_003_400)
    st.equal(bufferToInt(Buffer.allocUnsafe(0)), 0)
    st.end()
  })
  tape('should convert empty input to 0', function (st) {
    st.equal(bufferToInt(Buffer.allocUnsafe(0)), 0)
    st.end()
  })
})

describe('fromSigned', function () {
  tape('should convert an unsigned (negative) buffer to a signed number', function (st) {
    const neg = '-452312848583266388373324160190187140051835877600158453279131187530910662656'
    const buf = Buffer.allocUnsafe(32).fill(0)
    buf[0] = 255

    st.equal(fromSigned(buf).toString(), neg)
    st.end()
  })
  tape('should convert an unsigned (positive) buffer to a signed number', function (st) {
    const neg = '452312848583266388373324160190187140051835877600158453279131187530910662656'
    const buf = Buffer.allocUnsafe(32).fill(0)
    buf[0] = 1

    st.equal(fromSigned(buf).toString(), neg)
    st.end()
  })
})

describe('toUnsigned', function () {
  tape('should convert a signed (negative) number to unsigned', function (st) {
    const neg = '-452312848583266388373324160190187140051835877600158453279131187530910662656'
    const hex = 'ff00000000000000000000000000000000000000000000000000000000000000'
    const num = new BN(neg)

    st.equal(toUnsigned(num).toString('hex'), hex)
    st.end()
  })

  tape('should convert a signed (positive) number to unsigned', function (st) {
    const neg = '452312848583266388373324160190187140051835877600158453279131187530910662656'
    const hex = '0100000000000000000000000000000000000000000000000000000000000000'
    const num = new BN(neg)

    st.equal(toUnsigned(num).toString('hex'), hex)
    st.end()
  })
})

describe('hex prefix', function () {
  const string = 'd658a4b8247c14868f3c512fa5cbb6e458e4a989'
  tape('should add', function (st) {
    st.equal(addHexPrefix(string), '0x' + string)
    st.end()
  })
  tape('should return on non-string input', function (st) {
    st.equal(addHexPrefix(1), 1)
    st.end()
  })
})

describe('toBuffer', function () {
  tape('should work', function (st) {
    // Buffer
    st.ok(toBuffer(Buffer.allocUnsafe(0)).equals(Buffer.allocUnsafe(0)))
    // Array
    st.ok(toBuffer([]).equals(Buffer.allocUnsafe(0)))
    // String
    st.ok(toBuffer('0x11').equals(Buffer.from([17])))
    st.equal(toBuffer('0x1234').toString('hex'), '1234')
    st.ok(toBuffer('0x').equals(Buffer.from([])))
    // Number
    st.ok(toBuffer(1).equals(Buffer.from([1])))
    // null
    st.ok(toBuffer(null).equals(Buffer.allocUnsafe(0)))
    // undefined
    st.ok(toBuffer().equals(Buffer.allocUnsafe(0)))
    // 'toBN'
    st.ok(toBuffer(new BN(1)).equals(Buffer.from([1])))
    // 'toArray'
    st.ok(
      toBuffer({
        toArray() {
          return [1]
        },
      }).equals(Buffer.from([1]))
    )
    st.end()
  })
  tape('should fail', function (st) {
    st.throws(function () {
      toBuffer({ test: 1 })
    })
    st.end()
  })

  tape('should fail with non 0x-prefixed hex strings', function (st) {
    st.throws(() => toBuffer('11'), '11')
    st.throws(() => toBuffer(''))
    st.throws(() => toBuffer('0xR'), '0xR')
    st.end()
  })

  tape(
    'should convert a TransformableToBuffer like the Address class (i.e. provides a toBuffer method)',
    function (st) {
      const str = '0x2f015c60e0be116b1f0cd534704db9c92118fb6a'
      const address = Address.fromString(str)
      const addressBuf = toBuffer(address)
      st.ok(addressBuf.equals(address.toBuffer()))
      st.end()
    }
  )
})

describe('baToJSON', function () {
  tape('should turn a array of buffers into a pure json object', function (st) {
    const ba = [Buffer.from([0]), Buffer.from([1]), [Buffer.from([2])]]
    st.deepEqual(baToJSON(ba), ['0x00', '0x01', ['0x02']])
    st.end()
  })
  tape('should turn a buffers into string', function (st) {
    st.deepEqual(baToJSON(Buffer.from([0])), '0x00')
    st.end()
  })
})
