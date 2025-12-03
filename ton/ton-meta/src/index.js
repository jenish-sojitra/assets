import { createMetaDef } from '@exodus/asset'
import { UnitType } from '@exodus/currency'

const name = 'ton'
const displayName = 'Toncoin'
const ticker = 'TON'
const displayTicker = ticker
const displayNetworkTicker = displayTicker
const displayNetworkName = displayName
const baseAssetName = name
const primaryColor = '#0098EA'
const gradientColors = ['#0098EA', '#C0E6FF']
const chainBadgeColors = ['#0098EA', '#C0E6FF']

const units = {
  nanoton: 0,
  TON: 9,
}
const currency = UnitType.create(units)

const assetType = 'TON_LIKE'
const tokenAssetType = 'TON_TOKEN'

const blockExplorer = {
  addressUrl: (address) => `https://tonscan.org/address/${encodeURIComponent(address)}`,
  txUrl: (txId) => `https://tonscan.org/tx/${encodeURIComponent(txId)}`,
}
const info = {
  description:
    'Toncoin (TON) is the native cryptocurrency of the decentralized layer-1 blockchain, The Open Network (TON). The TON blockchain is open-sourced and supported by many network contributors, including the Switzerland-based non-profit organization, the TON Foundation.',
  twitter: 'https://twitter.com/ton_blockchain',
  website: 'https://ton.org/',
  telegram: 'https://t.me/tonblockchain',
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

export default assetsList
