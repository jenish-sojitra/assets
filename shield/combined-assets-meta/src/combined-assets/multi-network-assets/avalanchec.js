import { asset } from '@exodus/avalanchec-meta'

export const name = '_avalanchec'
export const displayName = 'Avalanche'
export const ticker = `${name}_AVAXC`
export const displayTicker = 'AVAX'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 18,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = asset.info
export const primaryColor = asset.primaryColor
export const gradientColors = asset.gradientColors
export const chainBadgeColors = asset.chainBadgeColors

export const combinedAssetNames = ['avalanchec', 'avax_bsc_6383077e']
