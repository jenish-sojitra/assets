import { payments } from 'bitcoinjs-lib'

function isPaymentFactory(payment) {
  return (script, eccLib) => {
    try {
      payment({ output: script }, { eccLib })
      return true
    } catch {
      return false
    }
  }
}

const isP2WPKH = isPaymentFactory(payments.p2wpkh)
const isP2TR = isPaymentFactory(payments.p2tr)
const isP2PKH = isPaymentFactory(payments.p2pkh)
const isP2MS = isPaymentFactory(payments.p2ms)
const isP2PK = isPaymentFactory(payments.p2pk)
const isP2WSHScript = isPaymentFactory(payments.p2wsh)
const isP2SHScript = isPaymentFactory(payments.p2sh)

const types = {
  P2WPKH: 'witnesspubkeyhash',
  P2PKH: 'pubkeyhash',
  P2MS: 'multisig',
  P2PK: 'pubkey',
  P2WSH: 'witnessscripthash',
  P2SH: 'scripthash',
  P2TR: 'taproot',
  NONSTANDARD: 'nonstandard',
}

const outputFactory = () => (script) => {
  if (isP2WPKH(script)) return types.P2WPKH
  if (isP2TR(script)) return types.P2TR
  if (isP2PKH(script)) return types.P2PKH
  if (isP2MS(script)) return types.P2MS
  if (isP2PK(script)) return types.P2PK
  if (isP2WSHScript(script)) return types.P2WSH
  if (isP2SHScript(script)) return types.P2SH

  return types.NONSTANDARD
}

export const scriptClassify = {
  types,
  outputFactory,
}
