import combinedAssetList from '../index.js'

combinedAssetList.forEach((asset) => {
  describe(`Combined asset tests for ${asset?.name}`, () => {
    it(`isCombined`, () => {
      expect(asset.isCombined).toBe(true)
    })
    it(`combinedAssetNames`, () => {
      expect(Array.isArray(asset.combinedAssetNames)).toBeTruthy()
      expect(asset.combinedAssetNames.length > 0).toBeTruthy()
    })
  })
})
