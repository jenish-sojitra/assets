import tape from '@exodus/test/tape'
import { BN } from 'bn.js'

import { Chain, Common, Hardfork } from '../../common/common.js'
import { toBuffer } from '../../util/index.js'
import { FeeMarketEIP1559Transaction, Transaction } from '../index.js'
import { Capability } from '../types.js'
import loadFixture from './load-fixture.cjs'

describe('[BaseTransaction]', function () {
  const t = { test: tape }

  // EIP-2930 is not enabled in Common by default (2021-03-06)
  const common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.London })

  const legacyFixtures = loadFixture('txs')
  const legacyTxs = []
  legacyFixtures.slice(0, 4).forEach(function (tx) {
    legacyTxs.push(Transaction.fromTxData(tx.data, { common }))
  })

  const eip1559Fixtures = loadFixture('eip1559txs')
  const eip1559Txs = []
  eip1559Fixtures.forEach(function (tx) {
    eip1559Txs.push(FeeMarketEIP1559Transaction.fromTxData(tx.data, { common }))
  })

  const zero = Buffer.alloc(0)
  const txTypes = [
    {
      class: Transaction,
      name: 'Transaction',
      type: 0,
      values: Array.from({ length: 6 }).fill(zero),
      txs: legacyTxs,
      fixtures: legacyFixtures,
      activeCapabilities: [],
      notActiveCapabilities: [
        Capability.EIP1559FeeMarket,
        Capability.EIP2718TypedTransaction,
        Capability.EIP2930AccessLists,
        9999,
      ],
    },
    {
      class: FeeMarketEIP1559Transaction,
      name: 'FeeMarketEIP1559Transaction',
      type: 2,
      values: [Buffer.from([1]), ...Array.from({ length: 8 }).fill(zero)],
      txs: eip1559Txs,
      fixtures: eip1559Fixtures,
      activeCapabilities: [
        Capability.EIP1559FeeMarket,
        Capability.EIP2718TypedTransaction,
        Capability.EIP2930AccessLists,
      ],
      notActiveCapabilities: [9999],
    },
  ]

  t.test('Initialization', function (st) {
    for (const txType of txTypes) {
      let tx = txType.class.fromTxData({}, { common })
      st.equal(
        tx.common.hardfork(),
        'london',
        `${txType.name}: should initialize with correct HF provided`
      )
      st.ok(Object.isFrozen(tx), `${txType.name}: tx should be frozen by default`)

      const initCommon = new Common({
        chain: Chain.Mainnet,
        hardfork: Hardfork.London,
      })
      tx = txType.class.fromTxData({}, { common: initCommon })
      st.equal(
        tx.common.hardfork(),
        'london',
        `${txType.name}: should initialize with correct HF provided`
      )

      initCommon.setHardfork(Hardfork.Byzantium)
      st.equal(
        tx.common.hardfork(),
        'london',
        `${txType.name}: should stay on correct HF if outer common HF changes`
      )

      tx = txType.class.fromTxData({}, { common, freeze: false })
      st.ok(
        !Object.isFrozen(tx),
        `${txType.name}: tx should not be frozen when freeze deactivated in options`
      )

      // Perform the same test as above, but now using a different construction method. This also implies that passing on the
      // options object works as expected.
      tx = txType.class.fromTxData({}, { common, freeze: false })
      const rlpData = tx.serialize()

      tx = txType.class.fromSerializedTx(rlpData, { common })
      st.equal(
        tx.type,
        txType.type,
        `${txType.name}: fromSerializedTx() -> should initialize correctly`
      )

      st.ok(Object.isFrozen(tx), `${txType.name}: tx should be frozen by default`)

      tx = txType.class.fromRlpSerializedTx(rlpData, { common })
      st.equal(
        tx.type,
        txType.type,
        `${txType.name}: fromRlpSerializedTx() (deprecated) -> should initialize correctly`
      )

      tx = txType.class.fromSerializedTx(rlpData, { common, freeze: false })
      st.ok(
        !Object.isFrozen(tx),
        `${txType.name}: tx should not be frozen when freeze deactivated in options`
      )

      tx = txType.class.fromValuesArray(txType.values, { common })
      st.ok(Object.isFrozen(tx), `${txType.name}: tx should be frozen by default`)

      tx = txType.class.fromValuesArray(txType.values, { common, freeze: false })
      st.ok(
        !Object.isFrozen(tx),
        `${txType.name}: tx should not be frozen when freeze deactivated in options`
      )
    }

    st.end()
  })

  t.test('serialize()', function (st) {
    for (const txType of txTypes) {
      txType.txs.forEach(function (tx) {
        st.ok(
          txType.class.fromSerializedTx(tx.serialize(), { common }),
          `${txType.name}: should do roundtrip serialize() -> fromSerializedTx()`
        )
        st.ok(
          txType.class.fromSerializedTx(tx.serialize(), { common }),
          `${txType.name}: should do roundtrip serialize() -> fromSerializedTx()`
        )
      })
    }

    st.end()
  })

  t.test('supports()', function (st) {
    for (const txType of txTypes) {
      txType.txs.forEach(function (tx) {
        for (const activeCapability of txType.activeCapabilities) {
          st.ok(
            tx.supports(activeCapability),
            `${txType.name}: should recognize all supported capabilities`
          )
        }

        for (const notActiveCapability of txType.notActiveCapabilities) {
          st.notOk(
            tx.supports(notActiveCapability),
            `${txType.name}: should reject non-active existing and not existing capabilities`
          )
        }
      })
    }

    st.end()
  })

  t.test('raw()', function (st) {
    for (const txType of txTypes) {
      txType.txs.forEach(function (tx) {
        st.ok(
          txType.class.fromValuesArray(tx.raw(), { common }),
          `${txType.name}: should do roundtrip raw() -> fromValuesArray()`
        )
      })
    }

    st.end()
  })

  t.test('sign()', function (st) {
    for (const txType of txTypes) {
      txType.txs.forEach(function (tx, i) {
        const { privateKey } = txType.fixtures[i]
        if (privateKey) {
          st.ok(tx.sign(Buffer.from(privateKey, 'hex')), `${txType.name}: should sign tx`)
        }

        st.throws(
          () => tx.sign(Buffer.from('invalid')),
          `${txType.name}: should fail with invalid PK`
        )
      })
    }

    st.end()
  })

  t.test('initialization with defaults', function (st) {
    const bufferZero = toBuffer('0x')
    const tx = Transaction.fromTxData({
      nonce: '',
      gasLimit: '',
      gasPrice: '',
      to: '',
      value: '',
      data: '',
      v: '',
      r: '',
      s: '',
    })
    st.equal(tx.v, undefined)
    st.equal(tx.r, undefined)
    st.equal(tx.s, undefined)
    st.equal(tx.to, undefined)
    st.isEquivalent(tx.value, new BN(bufferZero))
    st.isEquivalent(tx.data, bufferZero)
    st.isEquivalent(tx.gasPrice, new BN(bufferZero))
    st.isEquivalent(tx.gasLimit, new BN(bufferZero))
    st.isEquivalent(tx.nonce, new BN(bufferZero))

    st.end()
  })
})
