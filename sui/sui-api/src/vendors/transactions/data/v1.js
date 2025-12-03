import { vendorLib } from '@exodus/sui-lib'

import {
  array,
  bigint,
  boolean,
  integer,
  is,
  lazy,
  literal,
  nullable,
  number,
  object,
  parse,
  pipe,
  string,
  union,
} from '../../valibot.js'
import { JsonU64, ObjectID, safeEnum, TransactionData } from './internal.js'

const { toBase64 } = vendorLib.utils
const { TypeTagSerializer } = vendorLib.bcs

const ObjectRef = object({
  digest: string(),
  objectId: string(),
  version: union([pipe(number(), integer()), string(), bigint()]),
})
const ObjectArg = safeEnum({
  ImmOrOwned: ObjectRef,
  Shared: object({
    objectId: ObjectID,
    initialSharedVersion: JsonU64,
    mutable: boolean(),
  }),
  Receiving: ObjectRef,
})
const NormalizedCallArg = safeEnum({
  Object: ObjectArg,
  Pure: array(pipe(number(), integer())),
})
const TypeTag = union([
  object({ bool: nullable(literal(true)) }),
  object({ u8: nullable(literal(true)) }),
  object({ u64: nullable(literal(true)) }),
  object({ u128: nullable(literal(true)) }),
  object({ address: nullable(literal(true)) }),
  object({ signer: nullable(literal(true)) }),
  object({ vector: lazy(() => TypeTag) }),
  object({ struct: lazy(() => StructTag) }),
  object({ u16: nullable(literal(true)) }),
  object({ u32: nullable(literal(true)) }),
  object({ u256: nullable(literal(true)) }),
])
const StructTag = object({
  address: string(),
  module: string(),
  name: string(),
  typeParams: array(TypeTag),
})

function transactionDataFromV1(data) {
  return parse(TransactionData, {
    version: 2,
    sender: data.sender ?? null,
    expiration: data.expiration
      ? 'Epoch' in data.expiration
        ? { Epoch: data.expiration.Epoch }
        : { None: true }
      : null,
    gasData: {
      owner: data.gasConfig.owner ?? null,
      budget: data.gasConfig.budget?.toString() ?? null,
      price: data.gasConfig.price?.toString() ?? null,
      payment:
        data.gasConfig.payment?.map((ref) => ({
          digest: ref.digest,
          objectId: ref.objectId,
          version: ref.version.toString(),
        })) ?? null,
    },
    inputs: data.inputs.map((input) => {
      if (input.kind === 'Input') {
        if (is(NormalizedCallArg, input.value)) {
          const value = parse(NormalizedCallArg, input.value)
          if (value.Object) {
            if (value.Object.ImmOrOwned) {
              return {
                Object: {
                  ImmOrOwnedObject: {
                    objectId: value.Object.ImmOrOwned.objectId,
                    version: String(value.Object.ImmOrOwned.version),
                    digest: value.Object.ImmOrOwned.digest,
                  },
                },
              }
            }

            if (value.Object.Shared) {
              return {
                Object: {
                  SharedObject: {
                    mutable: value.Object.Shared.mutable ?? null,
                    initialSharedVersion: value.Object.Shared.initialSharedVersion,
                    objectId: value.Object.Shared.objectId,
                  },
                },
              }
            }

            if (value.Object.Receiving) {
              return {
                Object: {
                  Receiving: {
                    digest: value.Object.Receiving.digest,
                    version: String(value.Object.Receiving.version),
                    objectId: value.Object.Receiving.objectId,
                  },
                },
              }
            }

            throw new Error('Invalid object input')
          }

          return {
            Pure: {
              bytes: toBase64(new Uint8Array(value.Pure)),
            },
          }
        }

        if (input.type === 'object') {
          return {
            UnresolvedObject: {
              objectId: input.value,
            },
          }
        }

        return {
          UnresolvedPure: {
            value: input.value,
          },
        }
      }

      throw new Error('Invalid input')
    }),
    commands: data.transactions.map((transaction) => {
      switch (transaction.kind) {
        case 'MakeMoveVec':
          return {
            MakeMoveVec: {
              type:
                'Some' in transaction.type
                  ? TypeTagSerializer.tagToString(transaction.type.Some)
                  : null,
              elements: transaction.objects.map((arg) => parseV1TransactionArgument(arg)),
            },
          }
        case 'MergeCoins': {
          return {
            MergeCoins: {
              destination: parseV1TransactionArgument(transaction.destination),
              sources: transaction.sources.map((arg) => parseV1TransactionArgument(arg)),
            },
          }
        }

        case 'MoveCall': {
          const [pkg, mod, fn] = transaction.target.split('::')
          return {
            MoveCall: {
              package: pkg,
              module: mod,
              function: fn,
              typeArguments: transaction.typeArguments,
              arguments: transaction.arguments.map((arg) => parseV1TransactionArgument(arg)),
            },
          }
        }

        case 'Publish': {
          return {
            Publish: {
              modules: transaction.modules.map((mod) => toBase64(Uint8Array.from(mod))),
              dependencies: transaction.dependencies,
            },
          }
        }

        case 'SplitCoins': {
          return {
            SplitCoins: {
              coin: parseV1TransactionArgument(transaction.coin),
              amounts: transaction.amounts.map((arg) => parseV1TransactionArgument(arg)),
            },
          }
        }

        case 'TransferObjects': {
          return {
            TransferObjects: {
              objects: transaction.objects.map((arg) => parseV1TransactionArgument(arg)),
              address: parseV1TransactionArgument(transaction.address),
            },
          }
        }

        case 'Upgrade': {
          return {
            Upgrade: {
              modules: transaction.modules.map((mod) => toBase64(Uint8Array.from(mod))),
              dependencies: transaction.dependencies,
              package: transaction.packageId,
              ticket: parseV1TransactionArgument(transaction.ticket),
            },
          }
        }
      }

      throw new Error(`Unknown transaction ${Object.keys(transaction)}`)
    }),
  })
}

function parseV1TransactionArgument(arg) {
  switch (arg.kind) {
    case 'GasCoin': {
      return { GasCoin: true }
    }

    case 'Result':
      return { Result: arg.index }
    case 'NestedResult': {
      return { NestedResult: [arg.index, arg.resultIndex] }
    }

    case 'Input': {
      return { Input: arg.index }
    }
  }
}

export { transactionDataFromV1 }
// # sourceMappingURL=v1.js.map
