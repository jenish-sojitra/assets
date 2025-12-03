/* eslint-disable camelcase */
import { ClientCache } from './cache.js'

class Experimental_BaseClient {
  constructor({ network, base }) {
    this.network = network
    this.base = base ?? this
    this.cache = base?.cache ?? new ClientCache()
  }

  $extend(...registrations) {
    return Object.create(
      this,
      Object.fromEntries(
        registrations.map((registration) => {
          if ('experimental_asClientExtension' in registration) {
            const { name, register } = registration.experimental_asClientExtension()
            return [name, { value: register(this) }]
          }

          return [registration.name, { value: registration.register(this) }]
        })
      )
    )
  }
}
export { Experimental_BaseClient }
