// from https://github.com/ethereumjs/ethereumjs-abi/blob/master/test/index.js, supported subset

import assert from 'assert'
import BN from 'bn.js'

import * as abi from '../index.js'

// Homebrew tests

describe('encoding negative int32', function () {
  it('should equal', function () {
    var a = abi.rawEncode(['int32'], [-2]).toString('hex')
    var b = 'fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffe'
    assert.strict.equal(a, b)
  })
})

describe('encoding negative int256', function () {
  it('should equal', function () {
    var a = abi
      .rawEncode(
        ['int256'],
        [new BN('-19999999999999999999999999999999999999999999999999999999999999', 10)]
      )
      .toString('hex')
    var b = 'fffffffffffff38dd0f10627f5529bdb2c52d4846810af0ac000000000000001'
    assert.strict.equal(a, b)
  })
})

describe('encoding string >32bytes', function () {
  it('should equal', function () {
    var a = abi
      .rawEncode(
        ['string'],
        [
          ' hello world hello world hello world hello world  hello world hello world hello world hello world  hello world hello world hello world hello world hello world hello world hello world hello world',
        ]
      )
      .toString('hex')
    var b =
      '000000000000000000000000000000000000000000000000000000000000002000000000000000000000000000000000000000000000000000000000000000c22068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c64202068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c64202068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c642068656c6c6f20776f726c64000000000000000000000000000000000000000000000000000000000000'
    assert.strict.equal(a, b)
  })
})

describe('encoding uint32 response', function () {
  it('should equal', function () {
    var a = abi.rawEncode(['uint32'], [42]).toString('hex')
    var b = '000000000000000000000000000000000000000000000000000000000000002a'
    assert.strict.equal(a, b)
  })
})

describe('encoding string response (unsupported)', function () {
  it('should equal', function () {
    var a = abi.rawEncode(['string'], ['a response string (unsupported)']).toString('hex')
    var b =
      '0000000000000000000000000000000000000000000000000000000000000020000000000000000000000000000000000000000000000000000000000000001f6120726573706f6e736520737472696e672028756e737570706f727465642900'
    assert.strict.equal(a, b)
  })
})

describe('encoding', function () {
  it('should work for uint256', function () {
    var a = abi.rawEncode(['uint256'], [1]).toString('hex')
    var b = '0000000000000000000000000000000000000000000000000000000000000001'
    assert.strict.equal(a, b)
  })
  it('should work for uint', function () {
    var a = abi.rawEncode(['uint'], [1]).toString('hex')
    var b = '0000000000000000000000000000000000000000000000000000000000000001'
    assert.strict.equal(a, b)
  })
  it('should work for int256', function () {
    var a = abi.rawEncode(['int256'], [-1]).toString('hex')
    var b = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    assert.strict.equal(a, b)
  })
  it('should work for string and uint256[2]', function () {
    var a = abi.rawEncode(['string', 'uint256[2]'], ['foo', [5, 6]]).toString('hex')
    var b =
      '0000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000000500000000000000000000000000000000000000000000000000000000000000060000000000000000000000000000000000000000000000000000000000000003666f6f0000000000000000000000000000000000000000000000000000000000'
    assert.strict.equal(a, b)
  })
})

describe('encoding bytes33', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode('fail', ['bytes33'], [''])
    }, Error)
  })
})

describe('encoding uint0', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode('fail', ['uint0'], [1])
    }, Error)
  })
})

describe('encoding uint257', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode('fail', ['uint257'], [1])
    }, Error)
  })
})

describe('encoding int0', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode(['int0'], [1])
    }, Error)
  })
})

describe('encoding int257', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode(['int257'], [1])
    }, Error)
  })
})

describe('encoding uint[2] with [1,2,3]', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode(['uint[2]'], [[1, 2, 3]])
    }, Error)
  })
})

describe('encoding uint8 with 9bit data', function () {
  it('should fail', function () {
    assert.throws(function () {
      abi.rawEncode(['uint8'], [new BN(1).iushln(9)])
    }, Error)
  })
})

// Tests for Solidity's tight packing
describe('solidity tight packing bool', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['bool'], [true])
    var b = '01'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))

    a = abi.solidityPack(['bool'], [false])
    b = '00'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing address', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['address'], [new BN('43989fb883ba8111221e89123897538475893837', 16)])
    var b = '43989fb883ba8111221e89123897538475893837'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing string', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['string'], ['test'])
    var b = '74657374'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing bytes', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['bytes'], [Buffer.from('123456', 'hex')])
    var b = '123456'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing bytes8', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['bytes8'], [Buffer.from('123456', 'hex')])
    var b = '1234560000000000'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing uint', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['uint'], [42])
    var b = '000000000000000000000000000000000000000000000000000000000000002a'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing uint16', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['uint16'], [42])
    var b = '002a'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing int', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['int'], [-42])
    var b = 'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffd6'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing int16', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['int16'], [-42])
    var b = 'ffd6'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing multiple arguments', function () {
  it('should equal', function () {
    var a = abi.solidityPack(
      ['bytes32', 'uint32', 'uint32', 'uint32', 'uint32'],
      [Buffer.from('123456', 'hex'), 6, 7, 8, 9]
    )
    var b =
      '123456000000000000000000000000000000000000000000000000000000000000000006000000070000000800000009'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing uint32[]', function () {
  it('should equal', function () {
    var a = abi.solidityPack(['uint32[]'], [[8, 9]])
    var b =
      '00000000000000000000000000000000000000000000000000000000000000080000000000000000000000000000000000000000000000000000000000000009'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing bool[][]', function () {
  it('should equal', function () {
    const a = abi.solidityPack(
      ['bool[][]'],
      [
        [
          [true, false],
          [false, true],
        ],
      ]
    )
    const b =
      '0000000000000000000000000000000000000000000000000000000000000001000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000001'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing address[]', function () {
  it('should equal', function () {
    const a = abi.solidityPack(
      ['address[]'],
      [[new BN('43989fb883ba8111221e89123897538475893837', 16)]]
    )
    const b = '00000000000000000000000043989fb883ba8111221e89123897538475893837'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing uint32[2]', function () {
  it('should equal', function () {
    const a = abi.solidityPack(['uint32[2]'], [[11, 12]])
    const b =
      '000000000000000000000000000000000000000000000000000000000000000b000000000000000000000000000000000000000000000000000000000000000c'
    assert.strict.equal(a.toString('hex'), b.toString('hex'))
  })
})

describe('solidity tight packing uint32[2] with wrong array length', function () {
  it('should throw', function () {
    assert.throws(function () {
      abi.solidityPack(['uint32[2]'], [[11, 12, 13]])
    })
  })
})

describe('utf8 handling', function () {
  it('should encode latin and extensions', function () {
    var a = abi.rawEncode(['string'], ['ethereum számítógép']).toString('hex')
    var b =
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000017657468657265756d20737ac3a16dc3ad74c3b367c3a970000000000000000000'
    assert.strict.equal(a, b)
  })
  it('should encode non-latin characters', function () {
    var a = abi.rawEncode(['string'], ['为什么那么认真？']).toString('hex')
    var b =
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000018e4b8bae4bb80e4b988e982a3e4b988e8aea4e79c9fefbc9f0000000000000000'
    assert.strict.equal(a, b)
  })
})

describe('encoding ufixed128x128', function () {
  it('should equal', function () {
    var a = abi.rawEncode(['ufixed128x128'], [1]).toString('hex')
    var b = '0000000000000000000000000000000100000000000000000000000000000000'
    assert.strict.equal(a, b)
  })
})

describe('encoding fixed128x128', function () {
  it('should equal', function () {
    var a = abi.rawEncode(['fixed128x128'], [-1]).toString('hex')
    var b = 'ffffffffffffffffffffffffffffffff00000000000000000000000000000000'
    assert.strict.equal(a, b)
  })
})

describe('encoding -1 as uint', function () {
  it('should throw', function () {
    assert.throws(function () {
      abi.rawEncode(['uint'], [-1])
    }, /^Error: Supplied uint is negative/)
  })
})

describe('encoding 256 bits as bytes', function () {
  it('should not leave trailing zeroes', function () {
    var a = abi.rawEncode(
      ['bytes'],
      [Buffer.from('ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 'hex')]
    )
    assert.strict.equal(
      a.toString('hex'),
      '00000000000000000000000000000000000000000000000000000000000000200000000000000000000000000000000000000000000000000000000000000020ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )
  })
})
