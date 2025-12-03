import tape from '@exodus/test/tape'
import { BN } from 'bn.js'

import { Chain, Common, Hardfork } from '../../common/common.js'
import { bufferToHex } from '../../util/index.js'
import { FeeMarketEIP1559Transaction } from '../index.js'

const pKey = Buffer.from('4646464646464646464646464646464646464646464646464646464646464646', 'hex')

const common = new Common({
  chain: Chain.Mainnet,
  hardfork: Hardfork.London,
})

const txTypes = [
  {
    class: FeeMarketEIP1559Transaction,
    name: 'FeeMarketEIP1559Transaction',
    type: 2,
  },
]

const validAddress = Buffer.from('01'.repeat(20), 'hex')
const validSlot = Buffer.from('01'.repeat(32), 'hex')
const chainId = new BN(1)

describe('[FeeMarketEIP1559Transaction] -> EIP-2930 Compatibility', function () {
  const t = { test: tape }

  t.test('Initialization / Getter -> fromTxData()', function (t) {
    for (const txType of txTypes) {
      let tx = txType.class.fromTxData({}, { common })
      t.ok(tx, `should initialize correctly (${txType.name})`)

      tx = txType.class.fromTxData({
        chainId: 5,
      })
      t.ok(
        tx.common.chainIdBN().eqn(5),
        'should initialize Common with chain ID provided (supported chain ID)'
      )

      tx = txType.class.fromTxData({
        chainId: 99_999,
      })
      t.ok(
        tx.common.chainIdBN().eqn(99_999),
        'should initialize Common with chain ID provided (unsupported chain ID)'
      )

      const nonEIP2930Common = new Common({ chain: Chain.Mainnet, hardfork: Hardfork.Istanbul })
      t.throws(() => {
        txType.class.fromTxData({}, { common: nonEIP2930Common })
      }, `should throw on a pre-Berlin Harfork (EIP-2930 not activated) (${txType.name})`)

      t.throws(() => {
        txType.class.fromTxData(
          {
            chainId: chainId.addn(1),
          },
          { common }
        )
      }, `should reject transactions with wrong chain ID (${txType.name})`)

      t.throws(() => {
        txType.class.fromTxData(
          {
            v: 2,
          },
          { common }
        )
      }, `should reject transactions with invalid yParity (v) values (${txType.name})`)
    }

    t.end()
  })

  t.test('Initialization / Getter -> fromSerializedTx()', function (t) {
    for (const txType of txTypes) {
      try {
        txType.class.fromSerializedTx(Buffer.from([99]), {})
      } catch (e) {
        t.ok(e.message.includes('wrong tx type'), `should throw on wrong tx type (${txType.name})`)
      }

      try {
        // Correct tx type + RLP-encoded 5
        const serialized = Buffer.concat([Buffer.from([txType.type]), Buffer.from([5])])
        txType.class.fromSerializedTx(serialized, {})
      } catch (e) {
        t.ok(
          e.message.includes('must be array'),
          `should throw when RLP payload not an array (${txType.name})`
        )
      }

      try {
        // Correct tx type + RLP-encoded empty list
        const serialized = Buffer.concat([Buffer.from([txType.type]), Buffer.from('c0', 'hex')])
        txType.class.fromSerializedTx(serialized, {})
      } catch (e) {
        t.ok(
          e.message.includes('values (for unsigned tx)'),
          `should throw with invalid number of values (${txType.name})`
        )
      }
    }

    t.end()
  })

  t.test('Access Lists -> success cases', function (st) {
    for (const txType of txTypes) {
      const access = [
        {
          address: bufferToHex(validAddress),
          storageKeys: [bufferToHex(validSlot)],
        },
      ]
      const txn = txType.class.fromTxData(
        {
          accessList: access,
          chainId: 1,
        },
        { common }
      )

      // Check if everything is converted

      const BufferArray = txn.accessList
      const JSON = txn.AccessListJSON

      st.ok(BufferArray[0][0].equals(validAddress))
      st.ok(BufferArray[0][1][0].equals(validSlot))

      st.deepEqual(JSON, access, `should allow json-typed access lists (${txType.name})`)

      // also verify that we can always get the json access list, even if we don't provide one.

      const txnRaw = txType.class.fromTxData(
        {
          accessList: BufferArray,
          chainId: 1,
        },
        { common }
      )

      const JSONRaw = txnRaw.AccessListJSON

      st.deepEqual(JSONRaw, access, `should allow json-typed access lists (${txType.name})`)
    }

    st.end()
  })

  t.test('Access Lists -> error cases', function (st) {
    for (const txType of txTypes) {
      let accessList = [
        [
          Buffer.from('01'.repeat(21), 'hex'), // Address of 21 bytes instead of 20
          [],
        ],
      ]

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)

      accessList = [
        [
          validAddress,
          [
            Buffer.from('01'.repeat(31), 'hex'), // Slot of 31 bytes instead of 32
          ],
        ],
      ]

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)

      accessList = [[]] // Address does not exist

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)

      accessList = [[validAddress]] // Slots does not exist

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)

      accessList = [[validAddress, validSlot]] // Slots is not an array

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)

      accessList = [[validAddress, [], []]] // 3 items where 2 are expected

      st.throws(() => {
        txType.class.fromTxData({ chainId, accessList }, { common })
      }, txType.name)
    }

    st.end()
  })

  t.test('sign() / senderS(), senderR(), yParity()', function (t) {
    for (const txType of txTypes) {
      let tx = txType.class.fromTxData(
        {
          data: Buffer.from('010200', 'hex'),
          to: validAddress,
          accessList: [[validAddress, [validSlot]]],
          chainId,
        },
        { common }
      )

      tx = txType.class.fromTxData({}, { common })
      const signed = tx.sign(pKey)

      t.deepEqual(signed.senderR, signed.r, `should provide senderR() alias (${txType.name})`)
      t.deepEqual(signed.senderS, signed.s, `should provide senderS() alias (${txType.name})`)
      t.deepEqual(signed.yParity, signed.v, `should provide yParity() alias (${txType.name})`)

      t.deepEqual(
        tx.accessList,
        [],
        `should create and sign transactions without passing access list value (${txType.name})`
      )
      t.deepEqual(signed.accessList, [])

      tx = txType.class.fromTxData({}, { common })

      t.throws(() => {
        tx.hash()
      }, `should throw calling hash with unsigned tx (${txType.name})`)
    }

    t.end()
  })
})
