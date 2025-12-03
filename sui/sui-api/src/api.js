import { RPC_URL } from '@exodus/sui-lib'
import assert from 'minimalistic-assert'

import { SuiClient } from './vendors/client/index.js'

const getTextFromResponse = async (response) => {
  try {
    const responseBody = await response.text()
    return responseBody.slice(0, 100)
  } catch {
    return ''
  }
}

const fetchJson = async (url, fetchOptions) => {
  const response = await fetch(url, fetchOptions)

  if (!response.ok) {
    throw new Error(
      `${url} returned ${response.status}: ${
        response.statusText || 'Unknown Status Text'
      }. Body: ${await getTextFromResponse(response)}`
    )
  }

  return response.json()
}

export class SuiApi {
  constructor({ rpcUrl }) {
    this.setServer({ rpcUrl })
  }

  setServer({ rpcUrl = RPC_URL }) {
    this.rpcUrl = encodeURI(rpcUrl)
    this.client = new SuiClient({
      url: rpcUrl,
    })
  }

  handleJsonRPCResponse(response) {
    const result = response?.result
    const error = response?.error
    if (error || result === undefined) {
      const message = error?.message || error?.code || 'no result'
      throw new Error(`Bad rpc response: ${message}`)
    }

    return result
  }

  async request({ baseApiPath, path = '', method, body, headers = Object.create(null) }) {
    assert(typeof baseApiPath === 'string', 'expected string baseApiPath')

    const url = new URL(`${baseApiPath}${path}`)
    const fetchOptions = {
      method,
      headers: { ...this.getDefaultHeaders(), ...headers },
    }

    if (body) fetchOptions.body = JSON.stringify(body)
    const response = await fetchJson(url, fetchOptions)
    return this.handleJsonRPCResponse(response)
  }

  getDefaultHeaders() {
    return {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    }
  }

  // Transactions

  async getTransactionByHash({ hash }) {
    return this.request({
      baseApiPath: this.rpcUrl,
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'sui_getTransactionBlock',
        params: [
          hash,
          {
            showInput: true,
            showRawInput: false,
            showEffects: true,
            showEvents: false,
            showObjectChanges: true,
            showBalanceChanges: true,
            showRawEffects: false,
          },
        ],
      },
    })
  }

  async getAccountBalance({ address }) {
    return this.request({
      baseApiPath: this.rpcUrl,
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getBalance',
        params: [address],
      },
    })
  }

  async getAccountAllBalances({ address }) {
    return this.request({
      baseApiPath: this.rpcUrl,
      method: 'POST',
      body: {
        jsonrpc: '2.0',
        id: 1,
        method: 'suix_getAllBalances',
        params: [address],
      },
    })
  }

  async getTransactions({ txIds }) {
    return this.client.multiGetTransactionBlocks({
      digests: txIds,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showBalanceChanges: true,
        showInput: true,
      },
    })
  }

  async getAllCoins({ owner }) {
    const requestByCursor = async ({ cursor }) => {
      return this.client.getAllCoins({
        owner,
        cursor,
        limit: 100,
      })
    }

    const coins = []
    let cursor = null

    while (true) {
      const response = await requestByCursor({ cursor })
      coins.push(...response.data)
      if (!response.nextCursor || !response.hasNextPage) {
        break
      }

      cursor = response.nextCursor
    }

    return coins
  }

  async getCoins({ owner, coinType }) {
    const requestByCursor = async ({ cursor }) => {
      return this.client.getCoins({
        owner,
        coinType,
        cursor,
        limit: 100,
      })
    }

    const coins = []
    let cursor = null
    while (true) {
      const response = await requestByCursor({ cursor })
      coins.push(...response.data)
      if (!response.nextCursor || !response.hasNextPage) {
        break
      }

      cursor = response.nextCursor
    }

    return coins
  }

  async broadcastTx(plainTx) {
    return this.client.executeTransactionBlock({
      transactionBlock: plainTx.bytes,
      signature: plainTx.signature,
      options: {
        showEffects: true,
        showObjectChanges: true,
        showBalanceChanges: true,
      },
    })
  }
}
