import { asset } from '@exodus/matic-meta'

export const name = '_matic'
export const displayName = 'Polygon'
export const ticker = `${name}_MATIC`
export const displayTicker = 'POL'
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
  'matic', // MATICNATIVE
  'pol_ethereum_e5c9fadc', // POL on Ethereum
]
