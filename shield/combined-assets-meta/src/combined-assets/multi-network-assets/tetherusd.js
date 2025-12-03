export const name = '_tetherusd'
export const displayName = 'Tether USD'
export const ticker = `${name}_USDT`
export const displayTicker = 'USDT'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'Tether is a multi-chain stablecoin. Each USDT token is designed to be backed by a U.S. Dollar held in banking reserves.',
  reddit: 'https://www.reddit.com/r/Tether/',
  twitter: 'https://twitter.com/tether_to',
  website: 'https://tether.to/',
}
export const primaryColor = '#53AE94'
export const gradientColors = ['#53AE94', '#2E9175']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = [
  'tetherusd',
  'tetherusd_tron',
  'tetherusd_solana',
  'usdt_algorand_323d502d',
  'usdt_avalanchec_d80c1afa',
  'usdt_matic_86e249c1',
  'usdt_bsc_ddedf0f8',
  'tetherusd_goerli',
  'tetherusd_tezos',
  'usdt_ethereumarbone_efa95268',
  'usdt_optimism_26487766',
]
