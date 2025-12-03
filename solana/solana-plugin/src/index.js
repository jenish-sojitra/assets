import assetList from '@exodus/solana-meta'

import { createSolanaAssetFactory } from './create-asset.js'

export * from './create-asset.js' // for solanatestnet and solanadevnet

const createAsset = createSolanaAssetFactory({ assetList })

const defaultExport = { createAsset }

export default defaultExport
