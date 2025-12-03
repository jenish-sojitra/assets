import { testAssetsAndTokens } from '@exodus/assets-meta-testing'

import combinedAssetList from '../index.js'

combinedAssetList.forEach((asset) => {
  describe(`Combined asset tests for ${asset?.name}`, () => {
    testAssetsAndTokens({
      asset,
      dirname: import.meta.dirname,
    })
  })
})
