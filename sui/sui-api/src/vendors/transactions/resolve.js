import { vendorLib } from '@exodus/sui-lib'

import { suiClientResolveTransactionPlugin } from '../experimental/transports/json-rpc-resolver.js'
import { Inputs } from './Inputs.js'

const { bcs } = vendorLib

function needsTransactionResolution(data, options) {
  if (
    data.inputs.some((input) => {
      return input.UnresolvedObject || input.UnresolvedPure
    })
  ) {
    return true
  }

  // eslint-disable-next-line sonarjs/prefer-single-boolean-return
  if (
    !options.onlyTransactionKind &&
    (!data.gasConfig.price || !data.gasConfig.budget || !data.gasConfig.payment)
  ) {
    return true
  }

  return false
}

async function resolveTransactionPlugin(transactionData, options, next) {
  normalizeRawArguments(transactionData)
  if (!needsTransactionResolution(transactionData, options)) {
    await validate(transactionData)
    return next()
  }

  const client = getClient(options)
  const plugin =
    client.core?.resolveTransactionPlugin() ?? suiClientResolveTransactionPlugin(client)
  return plugin(transactionData, options, async () => {
    await validate(transactionData)
    await next()
  })
}

function validate(transactionData) {
  transactionData.inputs.forEach((input, index) => {
    if (input.$kind !== 'Object' && input.$kind !== 'Pure') {
      throw new Error(
        `Input at index ${index} has not been resolved.  Expected a Pure or Object input, but found ${JSON.stringify(
          input
        )}`
      )
    }
  })
}

function getClient(options) {
  if (!options.client) {
    throw new Error(
      `No sui client passed to Transaction#build, but transaction data was not sufficient to build offline.`
    )
  }

  return options.client
}

function normalizeRawArguments(transactionData) {
  for (const command of transactionData.commands) {
    switch (command.$kind) {
      case 'SplitCoins':
        command.SplitCoins.amounts.forEach((amount) => {
          normalizeRawArgument(amount, bcs.U64, transactionData)
        })
        break
      case 'TransferObjects':
        normalizeRawArgument(command.TransferObjects.address, bcs.Address, transactionData)
        break
    }
  }
}

function normalizeRawArgument(arg, schema, transactionData) {
  if (arg.$kind !== 'Input') {
    return
  }

  const input = transactionData.inputs[arg.Input]
  if (input.$kind !== 'UnresolvedPure') {
    return
  }

  // eslint-disable-next-line @exodus/mutable/no-param-reassign-prop-only
  transactionData.inputs[arg.Input] = Inputs.Pure(schema.serialize(input.UnresolvedPure.value))
}

export { needsTransactionResolution, resolveTransactionPlugin }
