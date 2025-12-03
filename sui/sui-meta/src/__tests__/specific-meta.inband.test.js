import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('sui')
    expect(asset.ticker).toBe('SUI')
    expect(asset.displayTicker).toBe('SUI')
    expect(asset.units.SUI).toBe(9)
    expect(asset.assetType).toBe('SUI_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('SUI_TOKEN')
      expect(token.mintAddress).toBeDefined()
      expect(typeof token.mintAddress).toBe('string')
    })
  }

  // check that these urls exist!
  expect(
    asset.blockExplorer.addressUrl(
      '0x47a4cf551a9eaf5f01f98a6b963914c2daa625fb946cd1cb52b8c2bf35e7a995'
    )
  ).toEqual(
    'https://www.suiscan.xyz/mainnet/account/0x47a4cf551a9eaf5f01f98a6b963914c2daa625fb946cd1cb52b8c2bf35e7a995'
  )
  expect(asset.blockExplorer.txUrl('7Tn63fe1bcQuXBKcr6GLDb8vUGfMQffxRDbrw9tQYgLS')).toEqual(
    'https://www.suiscan.xyz/mainnet/tx/7Tn63fe1bcQuXBKcr6GLDb8vUGfMQffxRDbrw9tQYgLS'
  )
})
