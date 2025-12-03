import { asset } from '@exodus/bsc-meta'

export const name = '_bnb'
export const displayName = 'Binance Coin'
export const ticker = `${name}_BNB`
export const displayTicker = 'BNB'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = ['bsc']
