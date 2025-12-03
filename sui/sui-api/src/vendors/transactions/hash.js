import { hashSync } from '@exodus/crypto/hash'

function hashTypedData(typeTag, data) {
  // eslint-disable-next-line unicorn/prefer-code-point
  const typeTagBytes = [...`${typeTag}::`].map((e) => e.charCodeAt(0))
  const dataWithTag = new Uint8Array(typeTagBytes.length + data.length)
  dataWithTag.set(typeTagBytes)
  dataWithTag.set(data, typeTagBytes.length)
  return hashSync('blake2b256', dataWithTag)
}

export { hashTypedData }
