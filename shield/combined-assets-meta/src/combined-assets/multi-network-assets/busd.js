export const name = '_busd'
export const displayName = 'Binance USD'
export const ticker = `${name}_BUSD`
export const displayTicker = 'BUSD'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'Stablecoin, issued in partnership with Binance. BUSD is 100% backed by U.S. dollars held in FDIC-insured U.S. banks.',
  twitter: 'https://twitter.com/paxosglobal',
  website: 'https://www.paxos.com/busd/',
}
export const primaryColor = '#FFC200'
export const gradientColors = ['#FFC200', '#CC9B00']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = ['busd', 'busd_bsc']
