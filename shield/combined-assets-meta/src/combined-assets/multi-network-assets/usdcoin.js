export const name = '_usdcoin'
export const displayName = 'USDC'
export const ticker = `${name}_USDC`
export const displayTicker = 'USDC'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'USDC is a token designed as a stablecoin issued by Circle and Coinbase. Each unit of USDC is backed by a unit of US Dollar in audited bank accounts in order to ensure 1 USDC is always equal to 1 USD.',
  reddit: 'https://www.reddit.com/r/USDC/',
  twitter: 'https://twitter.com/centre_io',
  website: 'https://www.centre.io/usdc',
}
export const primaryColor = '#3E90E8'
export const gradientColors = ['#3E90E8', '#2775CA']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = [
  'usdcoin',
  'usdcoin_algorand',
  'usdcoin_solana',
  'usdcoin_bsc',
  'usdc_tronmainnet_a4452102',
  'usdc_matic_0a883d9b',
  'usdc_avalanchec_185c8bd7',
  'usdc_ethereumarbone_2e1129c4',
  'usdc_optimism_68bb70cd',
  'usdc_basemainnet_b5a52617',
]
