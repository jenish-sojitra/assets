export const name = '_dai'
export const displayName = 'DAI'
export const ticker = `${name}_DAI`
export const displayTicker = 'DAI'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 18,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'Dai is an Ethereum-based stablecoin issued by MakerDAO the value of which is stable relative to the US Dollar. The value of Dai is stabilized through a system of vaults (where multiple forms of supported collateral are held in smart contracts), autonomous feedback mechanisms, and appropriately incentivized external actors.',
  reddit: 'https://www.reddit.com/r/MakerDAO/',
  twitter: 'https://twitter.com/MakerDAO',
  website: 'https://makerdao.com/dai/',
  telegram: 'https://t.me/makerdaoOfficial',
}
export const primaryColor = '#FBCC5F'
export const gradientColors = ['#FBCC5F', '#F9A606']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = ['mcd', 'dai_matic_845af41b', 'dai_optimism_6343ae93']
