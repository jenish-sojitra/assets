/* eslint-disable camelcase */

import { vendorLib } from '@exodus/sui-lib'

import { Experimental_CoreClient } from '../core.js'
import { suiClientResolveTransactionPlugin } from './json-rpc-resolver.js'

const { bcs } = vendorLib

export class JSONRpcTransport extends Experimental_CoreClient {
  #jsonRpcClient

  constructor({ jsonRpcClient, mvr }) {
    super({ network: jsonRpcClient.network, base: jsonRpcClient, mvr })
    this.#jsonRpcClient = jsonRpcClient
  }

  async getCoins(options) {
    const coins = await this.#jsonRpcClient.getCoins({
      owner: options.address,
      coinType: options.coinType,
      limit: options.limit,
      cursor: options.cursor,
      signal: options.signal,
    })

    return {
      objects: coins.data.map((coin) => {
        return {
          id: coin.coinObjectId,
          version: coin.version,
          digest: coin.digest,
          balance: coin.balance,
          type: `0x2::coin::Coin<${coin.coinType}>`,
          content: Promise.resolve(
            Coin.serialize({
              id: coin.coinObjectId,
              balance: {
                value: coin.balance,
              },
            }).toBytes()
          ),
          owner: {
            $kind: 'ObjectOwner',
            ObjectOwner: options.address,
          },
        }
      }),
      hasNextPage: coins.hasNextPage,
      cursor: coins.nextCursor ?? null,
    }
  }

  async getBalance(options) {
    const balance = await this.#jsonRpcClient.getBalance({
      owner: options.address,
      coinType: options.coinType,
      signal: options.signal,
    })

    return {
      balance: {
        coinType: balance.coinType,
        balance: balance.totalBalance,
      },
    }
  }

  async getAllBalances(options) {
    const balances = await this.#jsonRpcClient.getAllBalances({
      owner: options.address,
      signal: options.signal,
    })

    return {
      balances: balances.map((balance) => ({
        coinType: balance.coinType,
        balance: balance.totalBalance,
      })),
      hasNextPage: false,
      cursor: null,
    }
  }

  async getReferenceGasPrice(options) {
    const referenceGasPrice = await this.#jsonRpcClient.getReferenceGasPrice({
      signal: options?.signal,
    })
    return {
      referenceGasPrice: String(referenceGasPrice),
    }
  }

  resolveTransactionPlugin() {
    return suiClientResolveTransactionPlugin(this.#jsonRpcClient)
  }
}

const Balance = bcs.struct('Balance', {
  value: bcs.u64(),
})

const Coin = bcs.struct('Coin', {
  id: bcs.Address,
  balance: Balance,
})
