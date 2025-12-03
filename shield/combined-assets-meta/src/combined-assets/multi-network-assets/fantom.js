import { asset } from '@exodus/fantommainnet-meta'

export const name = '_fantom'
export const displayName = 'Fantom'
export const ticker = `${name}_FTM`
export const displayTicker = 'FTM'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = ['fantommainnet']
