import { asset, tokens } from '../index.js'

describe(`Specific info for ${asset?.name}`, () => {
  it(`specific asset info`, () => {
    expect(asset.name).toBe('ton')
    expect(asset.ticker).toBe('TON')
    expect(asset.displayTicker).toBe('TON')
    expect(asset.units.TON).toBe(9)
    expect(asset.assetType).toBe('TON_LIKE')
  })

  for (const token of tokens) {
    it(`specific token info for ${token.name || ''} `, () => {
      expect(token.assetType).toBe('TON_TOKEN')
      expect(token.mintAddress).toBeDefined()
      expect(typeof token.mintAddress).toBe('string')
    })
  }

  // check that these urls exist!
  expect(
    asset.blockExplorer.addressUrl('UQAV_wIqLWY_I_etw0lN0wirX5ytS_2yHdlI4DKy230lsNhQ')
  ).toEqual('https://tonscan.org/address/UQAV_wIqLWY_I_etw0lN0wirX5ytS_2yHdlI4DKy230lsNhQ')
  expect(asset.blockExplorer.txUrl('sNYOOdcWjssznM3NWs13ToJTZ/9xIOgBA/uoiEG8YWY=')).toEqual(
    'https://tonscan.org/tx/sNYOOdcWjssznM3NWs13ToJTZ%2F9xIOgBA%2FuoiEG8YWY%3D'
  )
})
