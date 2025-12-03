export const name = '_weth'
export const displayName = 'Wrapped Ether'
export const ticker = `${name}_WETH`
export const displayTicker = 'WETH'
export const units = {
  [`${name}_base`]: 0,
  [ticker]: 8,
}
export const assetType = 'MULTI_NETWORK_ASSET'
export const info = {
  description:
    'WETH is the wrapped version of ETH that refers to the ERC-20 compatible version of Ether. Wrapping ETH does not affect its value, 1 ETH is always 1 WETH.',
  website: 'https://weth.io/',
}
export const primaryColor = '#FF58A2'
export const gradientColors = ['#EC9CC6', '#ED1E79']
export const chainBadgeColors = gradientColors

export const combinedAssetNames = [
  'weth',
  'weth_matic',
  'weth_goerli',
  'weth_ethereumarbone_c53d6bd0',
]
