import type { UnitType } from '@exodus/currency'

export type GradientCoords = {
  x1: string
  y1: string
  x2: string
  y2: string
}

export type Info = {
  description?: string
  reddit?: string
  twitter?: string
  website?: string
  telegram?: string
}

export type BlockExplorer = {
  txUrl: (txId: string) => Promise<string>
  addressUrl: (address: string) => Promise<string>
}

export type AssetMeta = {
  assetType: string
  baseAssetName: string
  blockExplorer: BlockExplorer
  chainBadgeColors: string[]
  currency: UnitType
  displayNetworkName: string
  displayNetworkTicker: string
  displayTicker: string
  gradientColors: string[]
  gradientCoords: GradientCoords
  tokenAssetType?: string
  info?: Info
  primaryColor: string
  displayName: string
  name: string
  ticker: string
  decimals?: number
  mintAddress?: string
  units: Record<string, number>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any // allow additional chain specific properties
}
