import { AccountState, UtxoCollection } from '@exodus/models'
import { asset } from '@exodus/sui-meta'

export const createBasicAccountState = () => {
  return class SuiAccountState extends AccountState {
    static defaults = {
      utxos: UtxoCollection.createEmpty({ currency: asset.currency }),
      tokenUtxos: Object.create(null),
    }
  }
}
