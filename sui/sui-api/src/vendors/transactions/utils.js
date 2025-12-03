import { vendorLib } from '@exodus/sui-lib'

const { normalizeSuiAddress } = vendorLib.utils

function getIdFromCallArg(arg) {
  if (typeof arg === 'string') {
    return normalizeSuiAddress(arg)
  }

  if (arg.Object) {
    if (arg.Object.ImmOrOwnedObject) {
      return normalizeSuiAddress(arg.Object.ImmOrOwnedObject.objectId)
    }

    if (arg.Object.Receiving) {
      return normalizeSuiAddress(arg.Object.Receiving.objectId)
    }

    return normalizeSuiAddress(arg.Object.SharedObject.objectId)
  }

  if (arg.UnresolvedObject) {
    return normalizeSuiAddress(arg.UnresolvedObject.objectId)
  }

  return void 0
}

export { getIdFromCallArg }
// # sourceMappingURL=utils.js.map
