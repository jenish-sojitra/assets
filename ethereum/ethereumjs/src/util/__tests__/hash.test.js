import tape from '@exodus/test/tape'

import { keccak256, rlphash } from '../extra.js'
import { toBuffer } from '../index.js'

describe('keccak256', function () {
  tape('should produce a hash (keccak(a, 256) alias)', function (st) {
    const msg = '0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1'
    const r = '82ff40c0a986c6a5cfad4ddf4c3aa6996f1a7837f9c398e17e5de5cbd5a12b28'
    const hash = keccak256(toBuffer(msg))
    st.equal(hash.toString('hex'), r)
    st.end()
  })
})

describe('rlphash', function () {
  tape('should produce a keccak-256 hash of the rlp data', function (st) {
    const msg = '0x3c9229289a6125f7fdf1885a77bb12c37a8d3b4962d936f7e3084dece32a3ca1'
    const r = '33f491f24abdbdbf175e812b94e7ede338d1c7f01efb68574acd279a15a39cbe'
    const hash = rlphash(msg)
    st.equal(hash.toString('hex'), r)
    st.end()
  })
})
