import { DEFAULT_GAS_BUDGET } from '@exodus/sui-lib'

export const getFeeFactory =
  ({ asset }) =>
  ({ feeData, feeOpts }) => {
    return {
      fee: asset.feeAsset.currency.baseUnit(DEFAULT_GAS_BUDGET),
      gasBudget: DEFAULT_GAS_BUDGET,
    }
  }
