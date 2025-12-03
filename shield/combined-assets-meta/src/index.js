import { createCombined } from '@exodus/assets'

import rawAssetsList from './combined-assets/index.js'

const combinedAssetList = rawAssetsList.map((assetDef) => createCombined(assetDef))

export default combinedAssetList
