import type KeyIdentifier from '@exodus/key-identifier'

// move to hydra!

export type SignatureEncoding = 'raw' | 'der' | 'sig' | 'sig|rec' | 'rec|sig' | 'sig,rec'

type BaseSignParams = {
  keyId?: KeyIdentifier
}

export type SignatureType = 'ed25519' | 'ecdsa' | 'schnorr'

export type EcdsaSignParams<Enc extends SignatureEncoding> = {
  signatureType: 'ecdsa'
  data: Buffer
  ecOptions?: { canoncial?: boolean }
  extraEntropy?: Buffer
  enc: Enc
} & BaseSignParams

export type SchnorrSignParams = {
  signatureType: 'schnorr'
  data: Buffer
  extraEntropy?: Buffer
  tweak?: Buffer
} & BaseSignParams

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EncodedEcdsaSignature<Enc extends SignatureEncoding> = Enc extends 'der' ? Buffer : any

export type Ed25519SignParams = {
  signatureType: 'ed25519'
  data: Buffer
} & BaseSignParams

export type SignParams<Enc extends SignatureEncoding> =
  | EcdsaSignParams<Enc>
  | Ed25519SignParams
  | SchnorrSignParams

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SignReturnValue<T extends SignParams<any>> =
  T extends EcdsaSignParams<infer Enc> ? EncodedEcdsaSignature<Enc> : Buffer

export type GetPublicKeyParams = {
  keyId?: KeyIdentifier
}

export interface Signer {
  getPublicKey(params?: GetPublicKeyParams): Promise<Buffer>
  sign<Enc extends SignatureEncoding>(
    signParams: SignParams<Enc>
  ): Promise<SignReturnValue<typeof signParams>>
}
