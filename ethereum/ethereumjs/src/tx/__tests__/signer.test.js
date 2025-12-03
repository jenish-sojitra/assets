import { ecdsaSignHash } from '@exodus/crypto/secp256k1'
import tape from '@exodus/test/tape'

import { Chain, Common, Hardfork } from '../../common/common.js'
import { FeeMarketEIP1559Transaction, Transaction } from '../index.js'
import { Capability } from '../types.js'
import loadFixture from './load-fixture.cjs'

describe('[BaseTransaction with signer]', function () {
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

  t.test('signWithSigner()', async function (st) {
    for (const txType of txTypes) {
      let i = 0
      for (const tx of txType.txs) {
        const { privateKey } = txType.fixtures[i++]

        if (privateKey) {
          const signer = async (buffer) => {
            const { signature, recovery: recid } = await ecdsaSignHash({
              privateKey: Buffer.from(privateKey, 'hex'),
              hash: buffer,
              recovery: true,
            })
            /*
            console.log(`${privateKey}`, {
              signature: Buffer.from(s.signature).toString('hex'),
              buffer: buffer.toString('hex'),
              recid: s.recid,
            })
            */
            return { signature, recid }
          }

          st.ok(await tx.signWithSigner(signer), `${txType.name}: should sign tx`)
        }

        st.throws(
          () => tx.sign(Buffer.from('invalid')),
          `${txType.name}: should fail with invalid PK`
        )
      }
    }

    st.end()
  })
})
