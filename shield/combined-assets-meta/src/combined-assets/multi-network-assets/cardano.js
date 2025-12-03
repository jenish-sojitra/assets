import { asset } from '@exodus/cardano-meta'

export const name = '_cardano'
export const displayName = 'Cardano'
export const ticker = `${name}_ADA`
export const displayTicker = 'ADA'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 6,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = ['cardano', 'ada_bsc_db5f96ab']
