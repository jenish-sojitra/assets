/* eslint @typescript-eslint/no-explicit-any: 0 */ // --> OFF

import type NumberUnit from '@exodus/currency'
import type KeyIdentifier from '@exodus/key-identifier'
import type { AccountState, Tx, TxSet, WalletAccount } from '@exodus/models'
import type BN from 'bn.js'

import type { AssetMeta } from './asset-meta.js'
import type { CreateFeeMonitorApi } from './fee-monitor.js'
import type { Extendable, FreeForm, RequireOnly, WithRequired, XOR } from './helpers.js'
import type { HistoryMonitor } from './history-monitor.js'
import type { Logger } from './logger.js'
import type { MoveFunds } from './move-funds.js'
import type { Signer } from './signer.js'

type WalletAccountLike = WalletAccount | string

type WalletCompatibilityMode =
  | 'phantom'
  | 'metamask'
  | 'trust'
  | 'mathwallet'
  | 'ordinals86'
  | 'ordinals84'
  // Hack to allow any string without breaking intelisense
  | (string & NonNullable<unknown>)

export type CreateHistoryMonitorApi = (args: {
  asset: BaseAsset
  runner: () => void
  yieldToUI: () => void
  logger: Logger
}) => HistoryMonitor

export type IdentifiableTx = RequireOnly<Tx, 'txId'>

export type ApiFeatures = {
  accountState?: boolean
  customTokens?: boolean
  feeMonitor?: boolean
  feesApi?: boolean
  isMaxFeeAsset?: boolean
  isTestnet?: boolean
  nfts?: boolean
  noHistory?: boolean
  signWithSigner?: boolean
  signMessageWithSigner?: boolean
}

export type BalanceFieldName =
  | 'total'
  | 'balance'
  | 'spendable'
  | 'spendableBalance'
  | 'unconfirmedSent'
  | 'unconfirmedReceived'
  | 'unspendable'
  | 'walletReserve'
  | 'networkReserve'
  | 'staking'
  | 'staked'
  | 'stakable'
  | 'unstaking'
  | 'unstaked'
  | 'rewards'
  | 'frozen'

export type Balances = Record<BalanceFieldName, NumberUnit>

export type UnsignedTxPayload<NumberValue = BN | string> = Extendable<{
  txData: Extendable<{
    to: string
    amount: NumberValue
    fee: NumberValue
    gasPrice: NumberValue
    gasLimit: NumberValue
    nonce: NumberValue
  }>
  txMeta: Extendable<{
    assetName: string
  }>
}>

export type SignTransactionParams = Extendable<{
  assetName: string
  unsignedTx: UnsignedTxPayload
  walletAccount: WalletAccountLike
}>

export type HardwareDeviceSignTransactionParams = Extendable<{
  assetName: string
  signableTransaction: Buffer
  derivationPaths: string[]
}>

export type HardwareDevice = Extendable<{
  signTransaction: (tx: HardwareDeviceSignTransactionParams) => Promise<void>
}>

export type WalletAccountParams = Extendable<{
  asset: AbstractAsset
  accountState: AccountState
  txLog: TxSet
}>

export type GetActivityTxsParams = Extendable<{ txs: Tx[] }>

export type GetDefaultAddressPathParams = Extendable<{
  walletAccount: WalletAccountLike
  compatibilityMode?: WalletCompatibilityMode
}>

export type GetKeyIdentifierParams = Extendable<{
  purpose: number
  accountIndex: number
  chainIndex?: number
  addressIndex?: number
  compatibilityMode?: WalletCompatibilityMode
}>

export type GetSupportedPurposesParams = Extendable<{
  compatibilityMode?: WalletCompatibilityMode
  isMultisig?: boolean
}>

export type SignHardwareTxParams = Extendable<{
  unsignedTx: UnsignedTxPayload
  accountIndex: number
  hardwareDevice: HardwareDevice
}>

/** Purpose -> BIP32 instance */
export type HDKeysMap = Record<number, unknown>

export type SignTxParams = Extendable<{
  unsignedTx?: UnsignedTxPayload
  accountIndex?: number
  txHex?: string
  partialSign?: boolean
  hdkeys?: HDKeysMap
}> &
  XOR<{ privateKey: string }, { signer: Signer }>

export type CommonAssetApi = {
  features: ApiFeatures
  getActivityTxs?: (params: GetActivityTxsParams) => Tx[]
  getBalances: (params: WalletAccountParams) => Balances
  getTxLogFilter?: (tx: Tx) => boolean
  hasFeature: (feature: keyof ApiFeatures) => boolean // @deprecated use api.features instead
}

export type EncondePublicOptions = Extendable<{ purpose?: number }>

export type KeyEncoder = {
  encodePrivate: (key: Buffer) => string
  encodePublic: (key: Buffer, options?: EncondePublicOptions) => string
}

export type AssetAddress = {
  validate: (address: string) => boolean
  resolvePurpose?: (address: string) => Promise<number>
}

export type Nft = Extendable<{ nftId: string }>

export type BaseTxSendParams<Options = FreeForm> = {
  address: string
  asset: TokenAsset | BaseAsset
  walletAccount: WalletAccountLike
  amount?: NumberUnit
  options?: Options
}

export type FundibleTokenTxSendParams = BaseTxSendParams & WithRequired<BaseTxSendParams, 'amount'>
export type NonFungibleTokenTxSendParams = BaseTxSendParams & { nft: Nft }

export type StrictTxSendParams = FundibleTokenTxSendParams | NonFungibleTokenTxSendParams

export type ExtendedTxSendParams = Extendable<
  StrictTxSendParams,
  {
    bumpTxId?: string
    customFee?: NumberUnit
    feeAmount?: NumberUnit
    feeOpts?: { [key: string]: any }
    isExchange?: boolean
    isSendAll?: boolean
    shouldLog?: boolean
  }
>

export type TxSendParams = StrictTxSendParams | ExtendedTxSendParams

export type SignMessageParams<M = string> = { message: M; signer: Signer }

export type AssetApi = CommonAssetApi & {
  addressHasHistory?: (address: string) => Promise<boolean>
  broadcastTx: (rawTx: Buffer) => Promise<any>
  createAccountState?: () => typeof AccountState
  createFeeMonitor: CreateFeeMonitorApi
  createHistoryMonitor: CreateHistoryMonitorApi
  defaultAddressPath: string
  getBalanceForAddress: (address: string) => NumberUnit
  getConfirmationsNumber: () => number
  getDefaultAddressPath?: (params: GetDefaultAddressPathParams) => string
  getFeeData: () => any
  getKeyIdentifier(params: GetKeyIdentifierParams): KeyIdentifier
  getSupportedPurposes?: (params?: GetSupportedPurposesParams) => number[]
  moveFunds?: MoveFunds
  signHardware?: (params: SignHardwareTxParams) => Promise<any>
  signMessage?<M = string>(params: SignMessageParams<M>): Promise<any>
  signTx(params: SignTxParams): Promise<any>
  sendTx(params: TxSendParams): Promise<IdentifiableTx>
  validateAssetId?: (assetId: string) => boolean
}

export type GetBalancesParams = {
  asset: AbstractAsset
  accountState: AccountState
  txLog: TxSet
}

export type TokenAssetApi = {
  getBalances: (params: GetBalancesParams) => Balances
}

export type AbstractAsset = AssetMeta & {
  baseAsset: BaseAsset
  feeAsset: AbstractAsset
  isBuiltIn?: boolean
  isCustomToken?: boolean
  isCombined?: boolean
  lifecycleStatus?: string
  keys: KeyEncoder
  address: AssetAddress
  toString(): string
}

export type CombinedAsset<A extends BaseAsset | TokenAsset = BaseAsset | TokenAsset> = AssetMeta & {
  isCombined: true
  combinedAssets: A[]
  combinedAssetNames: A['name'][]
}

export type BaseAsset = AbstractAsset & {
  api: AssetApi
}

export type TokenAsset = AbstractAsset & {
  assetId?: string
  api: CommonAssetApi
}

export type AddressOverrideCallbackParams<A extends BaseAsset = BaseAsset> = { asset: A }

export type CreateAddressParams<A extends BaseAsset = BaseAsset, C = unknown> = {
  assetClientInterface: any
  config: C
  overrideCallback?: (params: AddressOverrideCallbackParams) => A
}

export type AssetPlugin<A extends BaseAsset = BaseAsset, C = unknown> = {
  createAsset: (params: CreateAddressParams<A, C>) => A
}
