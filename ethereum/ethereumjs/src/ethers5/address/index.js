import assert from 'minimalistic-assert'

import { toChecksumAddress } from '../../util/account.js'

const ibanLookup = Object.create(null)
for (let i = 0; i < 10; i++) ibanLookup[String(i)] = String(i)
for (let i = 0; i < 26; i++) ibanLookup[String.fromCharCode(65 + i)] = String(10 + i) // eslint-disable-line unicorn/prefer-code-point

function ibanChecksum(address) {
  address = address.toUpperCase()
  address = address.slice(4) + address.slice(0, 2) + '00'
  const expanded = [...address].map((c) => ibanLookup[c]).join('') // we already asserted alphabet
  return `${98 - Number(BigInt(expanded) % BigInt(97))}`.padStart(2, '0')
}

const big36 = (s) => [...s].reduce((a, c) => a * BigInt(36) + BigInt(parseInt(c, 36)), BigInt(0))

// hex or icap XE address to checksumed, throwing if input was checksumed with invalid checksum
export function getAddress(address) {
  assert(typeof address === 'string', 'invalid address')
  if (/^(0x)?[\da-fA-F]{40}$/u.test(address)) {
    // Missing the 0x prefix
    if (!address.startsWith('0x')) address = `0x${address}`
    const result = toChecksumAddress(address)
    // It is a checksummed address with a bad checksum
    if (/([A-F]\d*[a-f])|([a-f]\d*[A-F])/u.test(address)) {
      assert(result === address, 'bad address checksum')
    }

    return result
  }

  // Maybe ICAP? (we only support direct mode)
  if (/^XE\d{2}[\dA-Za-z]{30,31}$/u.test(address)) {
    // It is an ICAP address with a bad checksum
    assert(address.slice(2, 4) === ibanChecksum(address), 'bad icap checksum')
    const result = big36(address.slice(4)).toString(16)
    if (result.length > 40) throw new Error('bad icap address') // overflow
    return toChecksumAddress(`0x${result.padStart(40, '0')}`)
  }

  throw new Error('invalid address')
}
