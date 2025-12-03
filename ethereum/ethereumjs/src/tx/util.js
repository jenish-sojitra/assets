import { setLengthLeft } from '../util/extra.js'
import { bufferToHex, toBuffer } from '../util/index.js'

function isAccessListBuffer(input) {
  return input.length === 0 || Array.isArray(input[0])
}

function isAccessList(input) {
  return !isAccessListBuffer(input) // This is exactly the same method, except the output is negated.
}

export const AccessLists = {
  getAccessListData(accessList) {
    let AccessListJSON
    let bufferAccessList
    if (accessList && isAccessList(accessList)) {
      AccessListJSON = accessList
      const newAccessList = []

      for (const item of accessList) {
        const addressBuffer = toBuffer(item.address)
        const storageItems = []
        for (let index = 0; index < item.storageKeys.length; index++) {
          storageItems.push(toBuffer(item.storageKeys[index]))
        }

        newAccessList.push([addressBuffer, storageItems])
      }

      bufferAccessList = newAccessList
    } else {
      bufferAccessList = accessList ?? []
      // build the JSON
      const json = []
      for (const data of bufferAccessList) {
        const address = bufferToHex(data[0])
        const storageKeys = []
        for (let item = 0; item < data[1].length; item++) {
          storageKeys.push(bufferToHex(data[1][item]))
        }

        const jsonItem = {
          address,
          storageKeys,
        }
        json.push(jsonItem)
      }

      AccessListJSON = json
    }

    return {
      AccessListJSON,
      accessList: bufferAccessList,
    }
  },

  verifyAccessList(accessList) {
    for (const accessListItem of accessList) {
      const address = accessListItem[0]
      const storageSlots = accessListItem[1]
      if (accessListItem[2] !== undefined) {
        throw new Error(
          'Access list item cannot have 3 elements. It can only have an address, and an array of storage slots.'
        )
      }

      if (address.length !== 20) {
        throw new Error('Invalid EIP-2930 transaction: address length should be 20 bytes')
      }

      for (const storageSlot_ of storageSlots) {
        if (storageSlot_.length !== 32) {
          throw new Error('Invalid EIP-2930 transaction: storage slot length should be 32 bytes')
        }
      }
    }
  },

  getAccessListJSON(accessList) {
    const accessListJSON = []
    for (const item of accessList) {
      const JSONItem = {
        address: '0x' + setLengthLeft(item[0], 20).toString('hex'),
        storageKeys: [],
      }
      const storageSlots = item[1]
      for (const storageSlot of storageSlots) {
        JSONItem.storageKeys.push('0x' + setLengthLeft(storageSlot, 32).toString('hex'))
      }

      accessListJSON.push(JSONItem)
    }

    return accessListJSON
  },

  getDataFeeEIP2930(accessList, common) {
    const accessListStorageKeyCost = common.param('gasPrices', 'accessListStorageKeyCost')
    const accessListAddressCost = common.param('gasPrices', 'accessListAddressCost')

    let slots = 0
    for (const item of accessList) {
      const storageSlots = item[1]
      slots += storageSlots.length
    }

    const addresses = accessList.length
    return addresses * accessListAddressCost + slots * accessListStorageKeyCost
  },
}
