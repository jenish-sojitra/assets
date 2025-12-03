/* eslint-disable @exodus/mutable/no-param-reassign-prop-only */
import { vendorLib } from '@exodus/sui-lib'

import { parse } from '../valibot.js'
import { Argument } from './data/internal.js'

const { toBase64, normalizeSuiObjectId } = vendorLib.utils

export const SuiCommands = {
  MoveCall(input) {
    const [pkg, mod = '', fn = ''] =
      'target' in input ? input.target.split('::') : [input.package, input.module, input.function]
    return {
      $kind: 'MoveCall',
      MoveCall: {
        package: pkg,
        module: mod,
        function: fn,
        typeArguments: input.typeArguments ?? [],
        arguments: input.arguments ?? [],
      },
    }
  },
  TransferObjects(objects, address) {
    return {
      $kind: 'TransferObjects',
      TransferObjects: {
        objects: objects.map((o) => parse(Argument, o)),
        address: parse(Argument, address),
      },
    }
  },
  SplitCoins(coin, amounts) {
    return {
      $kind: 'SplitCoins',
      SplitCoins: {
        coin: parse(Argument, coin),
        amounts: amounts.map((o) => parse(Argument, o)),
      },
    }
  },
  MergeCoins(destination, sources) {
    return {
      $kind: 'MergeCoins',
      MergeCoins: {
        destination: parse(Argument, destination),
        sources: sources.map((o) => parse(Argument, o)),
      },
    }
  },
  Publish({ modules, dependencies }) {
    return {
      $kind: 'Publish',
      Publish: {
        modules: modules.map((module) =>
          typeof module === 'string' ? module : toBase64(new Uint8Array(module))
        ),
        dependencies: dependencies.map((dep) => normalizeSuiObjectId(dep)),
      },
    }
  },
  Upgrade({ modules, dependencies, package: packageId, ticket }) {
    return {
      $kind: 'Upgrade',
      Upgrade: {
        modules: modules.map((module) =>
          typeof module === 'string' ? module : toBase64(new Uint8Array(module))
        ),
        dependencies: dependencies.map((dep) => normalizeSuiObjectId(dep)),
        package: packageId,
        ticket: parse(Argument, ticket),
      },
    }
  },
  MakeMoveVec({ type, elements }) {
    return {
      $kind: 'MakeMoveVec',
      MakeMoveVec: {
        type: type ?? null,
        elements: elements.map((o) => parse(Argument, o)),
      },
    }
  },
  Intent({ name, inputs = Object.create(null), data = Object.create(null) }) {
    return {
      $kind: '$Intent',
      $Intent: {
        name,
        inputs: Object.fromEntries(
          Object.entries(inputs).map(([key, value]) => [
            key,
            Array.isArray(value) ? value.map((o) => parse(Argument, o)) : parse(Argument, value),
          ])
        ),
        data,
      },
    }
  },
}
