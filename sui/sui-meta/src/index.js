import { createMetaDef } from '@exodus/asset'
import { UnitType } from '@exodus/currency'

const name = 'sui'
const displayName = 'Sui'
const ticker = 'SUI'
const displayTicker = ticker
const displayNetworkTicker = displayTicker
const displayNetworkName = displayName
const baseAssetName = name
const primaryColor = '#4DA2FF'
const gradientColors = ['#C0E6FF', '#FFFFFF']
const chainBadgeColors = ['#4DA2FF', '#C0E6FF']

const units = {
  mist: 0,
  SUI: 9,
}
const currency = UnitType.create(units)

const assetType = 'SUI_LIKE'
const tokenAssetType = 'SUI_TOKEN'

const blockExplorer = {
  addressUrl: (address) => `https://www.suiscan.xyz/mainnet/account/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://www.suiscan.xyz/mainnet/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Sui is an innovative layer-1 blockchain platform crafted to meet the demands of global adoption, providing a secure, robust, and scalable development environment. Rooted in a unique object-centric data model and fortified by the trusted Move programming language, Sui is engineered to tackle the inefficiencies found in current blockchain frameworks.',
  twitter: 'https://x.com/SuiNetwork',
  website: 'https://sui.io/',
}

const assetParams = {
  assetType,
  baseAssetName,
  blockExplorer,
  chainBadgeColors,
  currency,
  displayName,
  displayNetworkName,
  displayNetworkTicker,
  displayTicker,
  gradientColors,
  tokenAssetType,
  info,
  name,
  primaryColor,
  ticker,
  units,
}

export const { asset, tokens, assetsList } = createMetaDef({
  assetParams,
})

export default [asset, ...tokens]
