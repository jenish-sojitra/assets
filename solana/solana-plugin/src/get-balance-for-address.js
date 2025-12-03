import assert from 'minimalistic-assert'

const isEmptyAccountInfo = (obj) => {
  return !obj || Object.keys(obj).length === 0
}

export const createGetBalanceForAddress = ({ api, asset }) => {
  assert(api, 'api is required')
  assert(asset, 'asset is required')
  return async (address) => {
    const accountInfo = await api.getAccountInfo(address)

    if (isEmptyAccountInfo(accountInfo)) {
      return asset.currency.ZERO
    }

    return asset.currency.baseUnit(accountInfo.lamports)
  }
}
