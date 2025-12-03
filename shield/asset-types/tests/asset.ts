/* eslint-disable @typescript-eslint/no-unused-vars, @exodus/import/no-unresolved */
import { SignTxParams, UnsignedTxPayload } from '../src/asset.js'
import { Signer } from '../src/signer.js'

const signer = null as unknown as Signer
const unsignedTx = null as unknown as UnsignedTxPayload
const privateKey = '0x1234567890abcdef'

// works with signer only
const s1: SignTxParams = {
  unsignedTx,
  signer,
}

// works with private key only
const s2: SignTxParams = {
  unsignedTx,
  privateKey,
}

// @ts-expect-error can only provide signer or private key, not both
const s3: SignTxParams = {
  unsignedTx,
  privateKey,
  signer,
}

// @ts-expect-error should provide either signer or private key
const s3: SignTxParams = {
  unsignedTx,
}
