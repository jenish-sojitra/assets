import { asset } from '@exodus/litecoin-meta'

export const name = '_litecoin'
export const displayName = 'Litecoin'
export const ticker = `${name}_LTC`
export const displayTicker = 'LTC'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = ['litecoin']
