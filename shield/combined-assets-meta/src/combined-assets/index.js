// MULTI_NETWORK_ASSET
import * as oneinch from './multi-network-assets/1inch.js'
import * as aave from './multi-network-assets/aave.js'
import * as audius from './multi-network-assets/audius.js'
import * as avalanchec from './multi-network-assets/avalanchec.js'
import * as axieinfinity from './multi-network-assets/axieinfinity.js'
import * as bittorrent from './multi-network-assets/bittorrent.js'
import * as bnb from './multi-network-assets/bnb.js'
import * as busd from './multi-network-assets/busd.js'
import * as cardano from './multi-network-assets/cardano.js'
import * as chainlink from './multi-network-assets/chainlink.js'
import * as dai from './multi-network-assets/dai.js'
import * as ethereum from './multi-network-assets/ethereum.js'
import * as fantom from './multi-network-assets/fantom.js'
import * as gmt from './multi-network-assets/gmt.js'
import * as litecoin from './multi-network-assets/litecoin.js'
import * as polygon from './multi-network-assets/polygon.js'
import * as sandbox from './multi-network-assets/sandbox.js'
import * as shibainu from './multi-network-assets/shibainu.js'
import * as smoothlovepotion from './multi-network-assets/smoothlovepotion.js'
import * as tetherusd from './multi-network-assets/tetherusd.js'
import * as thegraph from './multi-network-assets/thegraph.js'
import * as uniswap from './multi-network-assets/uniswap.js'
import * as usdcoin from './multi-network-assets/usdcoin.js'
import * as wbtc from './multi-network-assets/wbtc.js'
import * as weth from './multi-network-assets/weth.js'

const rawAssetsList = [
  aave,
  audius,
  avalanchec,
  axieinfinity,
  bittorrent,
  bnb,
  busd,
  cardano,
  chainlink,
  dai,
  ethereum,
  fantom,
  gmt,
  litecoin,
  oneinch,
  polygon,
  sandbox,
  shibainu,
  smoothlovepotion,
  tetherusd,
  thegraph,
  uniswap,
  usdcoin,
  wbtc,
  weth,
  // `assetDef` is an ESM `Module` which is typeof object but lodash.cloneDeep
  // does not treat it well, so shallow copy into an actual object.
].map((asset) => ({ ...asset }))

export default rawAssetsList
