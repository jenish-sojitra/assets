import { hash } from '@exodus/crypto/hash'
import { randomBytes } from '@exodus/crypto/randomBytes'
import * as secp256k1 from '@exodus/crypto/secp256k1'
import test from '@exodus/test/tape'
import bech32 from 'bech32'
import bs58check from 'bs58check'
import wif from 'wif'

import { address as bitcoinjsAddress } from '../index.js'
import * as message from '../message.js'
import loadFixture from './load-fixture.cjs'
import { verify } from './message.js'

function fromWIF(wifString) {
  const decoded = wif.decode(wifString)
  if (decoded.version !== 0x80) throw new Error('Invalid network version') // Bitcoin
  return decoded
}

const fixtures = loadFixture('message')

function getMessagePrefix(networkName) {
  return fixtures.networks[networkName]
}

fixtures.valid.magicHash.forEach((f) => {
  test('produces the magicHash for "' + f.message + '" (' + f.network + ')', (t) => {
    const actual = message.magicHash(f.message, getMessagePrefix(f.network))
    t.same(actual.toString('hex'), f.magicHash)
    t.end()
  })
})

fixtures.valid.sign.forEach((f) => {
  test('sign: ' + f.description, async (t) => {
    const pk = Buffer.from(BigInt(f.d).toString(16).padStart(64, '0'), 'hex')
    const signer = (hash, extraEntropy = null) =>
      secp256k1.ecdsaSignHashSync({ hash, privateKey: pk, extraEntropy, recovery: true })
    const signerAsync = async (hash, extraEntropy = null) =>
      secp256k1.ecdsaSignHash({ hash, privateKey: pk, extraEntropy, recovery: true })
    let signature = message.signSync(f.message, pk, false, getMessagePrefix(f.network))
    const signature2 = message.signSync(
      f.message,
      { sign: signer },
      false,
      getMessagePrefix(f.network)
    )
    const signature3 = await message.signAsync(
      f.message,
      { sign: signerAsync },
      false,
      getMessagePrefix(f.network)
    )
    const signature4 = await message.signAsync(
      f.message,
      { sign: signer },
      false,
      getMessagePrefix(f.network)
    )
    const signature5 = await message.signAsync(f.message, pk, false, getMessagePrefix(f.network))
    t.same(signature.toString('base64'), f.signature)
    t.same(signature2.toString('base64'), f.signature)
    t.same(signature3.toString('base64'), f.signature)
    t.same(signature4.toString('base64'), f.signature)
    t.same(signature5.toString('base64'), f.signature)

    if (f.compressed) {
      signature = message.signSync(f.message, pk, true, getMessagePrefix(f.network))
      t.same(signature.toString('base64'), f.compressed.signature)
    }

    if (f.segwit) {
      if (f.segwit.P2SH_P2WPKH) {
        signature = message.signSync(f.message, pk, true, getMessagePrefix(f.network), {
          segwitType: 'p2sh(p2wpkh)',
        })
        t.same(signature.toString('base64'), f.segwit.P2SH_P2WPKH.signature)
      }

      if (f.segwit.P2WPKH) {
        signature = message.signSync(f.message, pk, true, getMessagePrefix(f.network), {
          segwitType: 'p2wpkh',
        })
        t.same(signature.toString('base64'), f.segwit.P2WPKH.signature)
      }
    }

    t.end()
  })
})

fixtures.valid.verify.forEach((f) => {
  test('verifies a valid signature for "' + f.message + '" (' + f.network + ')', (t) => {
    t.true(verify(f.message, f.address, f.signature, getMessagePrefix(f.network)))

    if (f.network === 'bitcoin') {
      // defaults to bitcoin network
      t.true(verify(f.message, f.address, f.signature))
    }

    if (f.compressed) {
      t.true(
        verify(f.message, f.compressed.address, f.compressed.signature, getMessagePrefix(f.network))
      )
    }

    if (f.segwit) {
      if (f.segwit.P2SH_P2WPKH) {
        t.true(
          verify(
            f.message,
            f.segwit.P2SH_P2WPKH.address,
            f.segwit.P2SH_P2WPKH.signature,
            getMessagePrefix(f.network)
          )
        )
        t.true(
          verify(
            f.message,
            f.segwit.P2SH_P2WPKH.address,
            f.segwit.P2SH_P2WPKH.signature.replace(/^./, 'I'),
            getMessagePrefix(f.network),
            true
          )
        )
      }

      if (f.segwit.P2WPKH) {
        t.true(
          verify(
            f.message,
            f.segwit.P2WPKH.address,
            f.segwit.P2WPKH.signature,
            getMessagePrefix(f.network)
          )
        )
        t.true(
          verify(
            f.message,
            f.segwit.P2WPKH.address,
            f.segwit.P2WPKH.signature.replace(/^./, 'I'),
            getMessagePrefix(f.network),
            true
          )
        )
      }
    }

    t.end()
  })
})

fixtures.invalid.signature.forEach((f) => {
  test('decode signature: throws on ' + f.hex, (t) => {
    t.throws(
      () => {
        verify(null, null, Buffer.from(f.hex, 'hex'), null)
      },
      new RegExp('^Error: ' + f.exception + '$')
    )
    t.end()
  })
})

fixtures.invalid.verify.forEach((f) => {
  test(f.description, (t) => {
    t.false(verify(f.message, f.address, f.signature, getMessagePrefix('bitcoin')))
    t.end()
  })
})

async function getAddress(publicKey, networkPubKeyHash = 0x00) {
  return bitcoinjsAddress.toBase58Check(await hash('hash160', publicKey), networkPubKeyHash)
}

fixtures.randomSig.forEach((f) => {
  test(f.description, async (t) => {
    const { privateKey, compressed } = fromWIF(f.wif)
    const publicKey = secp256k1.privateKeyToPublicKey({ privateKey, compressed })
    const address = await getAddress(publicKey)
    f.signatures.forEach((s) => {
      const signature = message.signSync(f.message, privateKey, compressed, {
        extraEntropy: Buffer.from(s.sigData, 'base64'),
      })
      t.true(verify(f.message, address, signature))
    })
    t.end()
  })
})

test('Check that compressed signatures can be verified as segwit', async (t) => {
  const privateKey = randomBytes(32)
  const publicKey = secp256k1.privateKeyToPublicKey({ privateKey })
  const publicKeyHash = await hash('hash160', publicKey)
  const p2shp2wpkhRedeemHash = await segwitRedeemHash(publicKeyHash)
  // get addresses (p2pkh, p2sh-p2wpkh, p2wpkh)
  const p2pkhAddress = await getAddress(publicKey)
  const p2shp2wpkhAddress = bs58check.encode(
    Buffer.concat([Buffer.from([5]), p2shp2wpkhRedeemHash])
  )
  const p2wpkhAddress = bech32.encode('bc', [0, ...bech32.toWords(publicKeyHash)])

  const msg = 'Sign me'
  const signature = message.signSync(msg, privateKey, true)

  // Make sure it verifies
  t.true(verify(msg, p2pkhAddress, signature))
  // Make sure it verifies even with checkSegwitAlways
  t.true(verify(msg, p2pkhAddress, signature, null, true))

  // Check segwit addresses with true
  t.true(verify(msg, p2shp2wpkhAddress, signature, null, true))
  t.true(verify(msg, p2wpkhAddress, signature, null, true))
  // Check segwit with false
  t.true(verify(msg, p2shp2wpkhAddress, signature) === false)
  t.throws(
    () => {
      verify(msg, p2wpkhAddress, signature)
    },
    /^[1-9A-HJ-NP-Za-km-z]+$/.test(p2wpkhAddress)
      ? /^Error: Invalid checksum$/
      : /^Error: Non-base58 character$/
  )

  const signatureUncompressed = message.signSync(msg, privateKey, false)
  t.throws(() => {
    verify(msg, p2shp2wpkhAddress, signatureUncompressed, null, true)
  }, new RegExp('^Error: checkSegwitAlways can only be used with a compressed pubkey signature flagbyte$'))

  t.end()
})

test('Check that invalid segwitType fails', (t) => {
  const { privateKey } = fromWIF('L3n3e2LggPA5BuhXyBetWGhUfsEBTFe9Y6LhyAhY2mAXkA9jNE56')

  t.throws(() => {
    message.signSync('Sign me', privateKey, true, { segwitType: 'XYZ' })
  }, new RegExp('Unrecognized segwitType: use "p2sh\\(p2wpkh\\)" or "p2wpkh"'))

  t.end()
})

test('Check that Buffers and wrapped Strings are accepted', (t) => {
  const { privateKey } = fromWIF('L3n3e2LggPA5BuhXyBetWGhUfsEBTFe9Y6LhyAhY2mAXkA9jNE56')

  // eslint-disable-next-line no-new-wrappers
  const sig = message.signSync(
    Buffer.from('Sign me', 'utf8'),
    privateKey,
    true,
    Buffer.from([1, 2, 3, 4]),
    { segwitType: new String('p2wpkh') } // eslint-disable-line unicorn/new-for-builtins, no-new-wrappers
  )
  t.equals(
    sig.toString('hex'),
    '276e5e5e75196dd93bba7b98f29f944156286d94cb34c376822c6ebc93e08d7b2d177e1f2215b2879caee53f39a376cf350ffdca70df4398a12d5b5adaf3b0f0bc'
  )

  t.end()
})

async function segwitRedeemHash(publicKeyHash) {
  const redeemScript = Buffer.concat([Buffer.from('0014', 'hex'), publicKeyHash])
  return hash('hash160', redeemScript)
}
