import { getAddress } from '../index.js'
// Or from '@exodus/ethers/utils/address.js'
// Or from '@exodus/ethereumjs/ethers5-address' (this lib)

test('icap', () => {
  const pairs = [
    ['XE48AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '0x027229cD68443E6db056521A0492492492492492'],
    ['XE243AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', '0x1C20e0bA2f10cDED6BE0B02B3492492492492492'],
  ]

  for (const [a, b] of pairs) {
    expect(getAddress(a)).toBe(b)
  }

  const invalid = [
    'XE47AAAAAAAAAAAAAAAAAAAAAAAAAAAAAA', // bad checksum
    'XE68TWJ4YIDKW7A8PN4G709KZMFOAOL3X8', // overflow
  ]

  for (const [a] of invalid) {
    expect(() => getAddress(a)).toThrow()
  }
})
