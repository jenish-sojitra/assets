import type NumberUnit from '@exodus/currency'

export type FeeMonitor = {
  start: () => Promise<void>
  stop: () => Promise<void>
  tick: () => Promise<void>
}

export type FeeDataValue = number | string | NumberUnit

export type FeeData = Record<string, FeeDataValue>

export type CreateFeeMonitorApi = (params: {
  updateFee: (assetName: string, feeDataToUpdate: FeeData) => Promise<void>
}) => FeeMonitor
