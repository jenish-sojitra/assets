export const name = '_wbtc'
export const displayName = 'Wrapped Bitcoin'
export const ticker = `${name}_WBTC`
export const displayTicker = 'WBTC'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'WBTC brings the power of Bitcoin together with the perks of the Ethereum network. Wrapped Bitcoin is backed 1:1 with Bitcoin.',
  twitter: 'https://twitter.com/WrappedBTC',
  website: 'https://wbtc.network/',
}
export const primaryColor = '#8958AB'
export const gradientColors = ['#8958AB', '#3D2F52']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = ['wbtc', 'wbtc_matic_298d6ace']
