/* eslint-disable camelcase */

import { Experimental_BaseClient } from './client.js'
import { MvrClient } from './mvr.js'

const DEFAULT_MVR_URLS = {
  mainnet: 'https://mainnet.mvr.mystenlabs.com',
  testnet: 'https://testnet.mvr.mystenlabs.com',
}

class Experimental_CoreClient extends Experimental_BaseClient {
  constructor(options) {
    super(options)
    this.core = this
    this.mvr = new MvrClient({
      cache: this.cache.scope('core.mvr'),
      url: options.mvr?.url ?? DEFAULT_MVR_URLS[this.network],
      pageSize: options.mvr?.pageSize,
      overrides: options.mvr?.overrides,
    })
  }
}
export { Experimental_CoreClient }
