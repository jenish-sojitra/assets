export const getBalances = ({ asset, accountState }) => {
  const isBaseAsset = asset.name === asset.baseAssetName

  if (isBaseAsset) {
    return {
      total: accountState.utxos.value,
      spendable: accountState.utxos.value,
    }
  }

  if (accountState.tokenUtxos[asset.name]) {
    return {
      total: accountState.tokenUtxos[asset.name].value,
      spendable: accountState.tokenUtxos[asset.name].value,
    }
  }

  return {
    total: asset.currency.ZERO,
    spendable: asset.currency.ZERO,
  }
}
