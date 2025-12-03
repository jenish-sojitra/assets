import { asset } from '@exodus/ethereum-meta'

export const name = '_ethereum'
export const displayName = 'Ethereum'
export const ticker = `${name}_ETH`
export const displayTicker = 'ETH'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = [
  'ethereum',
  'optimism',
  'ethereumarbnova',
  'ethereumarbone',
  'aurora',
  'basemainnet',
]
