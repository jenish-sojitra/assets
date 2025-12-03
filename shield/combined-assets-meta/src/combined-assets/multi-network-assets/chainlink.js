export const name = '_chainlink'
export const displayName = 'Chainlink'
export const ticker = `${name}_LINK`
export const displayTicker = 'LINK'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 6,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'Blockchain-based smart contracts currently can’t connect to the outside world in a decentralized way. Using a network of decentralized data oracles, Chainlink aims to connect smart contracts to real-world data and payment systems.',
  reddit: 'https://www.reddit.com/r/Chainlink/',
  twitter: 'https://twitter.com/chainlink',
  website: 'https://chain.link/',
  telegram: 'https://t.me/chainlinkofficial',
}
export const primaryColor = '#3FA0F1'
export const gradientColors = ['#3FA0F1', '#295ADA']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = [
  'chainlink',
  'link_matic_0fc0671d',
  'link_ethereumarbone_63f7deae',
]
