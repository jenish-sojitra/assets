import BN from 'bn.js'

/**
 * The max integer that this VM can handle
 */
export const MAX_INTEGER = new BN(
  'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff',
  16
)

/**
 * 2^256
 */
export const TWO_POW256 = new BN(
  '10000000000000000000000000000000000000000000000000000000000000000',
  16
)

/**
 * Keccak-256 hash of null
 */
export const KECCAK256_NULL_S = 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'

/**
 * Keccak-256 hash of null
 */
export const KECCAK256_NULL = Buffer.from(KECCAK256_NULL_S, 'hex')

/**
 * Keccak-256 hash of the RLP of null
 */
export const KECCAK256_RLP_S = '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'

/**
 * Keccak-256 hash of the RLP of null
 */
export const KECCAK256_RLP = Buffer.from(KECCAK256_RLP_S, 'hex')
