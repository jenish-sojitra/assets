import tape from '@exodus/test/tape'

import { MAX_INTEGER, TWO_POW256 } from '../extra.js'
import { KECCAK256_NULL, KECCAK256_NULL_S, KECCAK256_RLP, KECCAK256_RLP_S } from '../util.js'

describe('constants', function () {
  tape('should match constants', function (st) {
    st.equal(
      MAX_INTEGER.toString('hex'),
      'ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff'
    )

    st.equal(
      TWO_POW256.toString('hex'),
      '10000000000000000000000000000000000000000000000000000000000000000'
    )

    st.equal(KECCAK256_NULL_S, 'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470')

    st.equal(
      KECCAK256_NULL.toString('hex'),
      'c5d2460186f7233c927e7db2dcc703c0e500b653ca82273b7bfad8045d85a470'
    )

    st.equal(KECCAK256_RLP_S, '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421')

    st.equal(
      KECCAK256_RLP.toString('hex'),
      '56e81f171bcc55a6ff8345e692c0f86e5b48e01b996cadc001622fb5e363b421'
    )

    st.end()
  })
})
