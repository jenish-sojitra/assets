export const name = '_thegraph'
export const displayName = 'The Graph'
export const ticker = `${name}_GRT`
export const displayTicker = 'GRT'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description: 'The Graph is an indexing protocol for querying networks like Ethereum and IPFS.',
  reddit: 'https://reddit.com/r/thegraph',
  twitter: 'https://twitter.com/graphprotocol',
  website: 'https://thegraph.com/',
  telegram: 'https://t.me/graphprotocol',
}
export const primaryColor = '#33A0FF'
export const gradientColors = ['#33A0FF', '#5919D9']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = ['thegraph', 'thegraph_solana']
