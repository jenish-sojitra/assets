import * as abi from '../index.js'

test('array size bug of ethereumjs-abi', () => {
  expect(() => abi.solidityPack(['bytes1[1][2]'], [[[1, 2]]])).toThrow()
  expect(abi.solidityPack(['bytes1[2][1]'], [[[42, 43]]])).toStrictEqual(Buffer.from([42, 43]))
})
