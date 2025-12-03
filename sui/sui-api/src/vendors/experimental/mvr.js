/* eslint-disable no-sequences */
/* eslint-disable camelcase */
import { vendorLib } from '@exodus/sui-lib'

const { chunk, DataLoader } = vendorLib.utils
const {
  isValidNamedPackage,
  isValidNamedType,
  isValidSuiAddress,
  normalizeStructTag,
  normalizeSuiAddress,
  parseStructTag,
} = vendorLib.utils

const MOVE_IDENT = /^[A-Z_a-z]\w*$/

// Strict .sui domain (labels a-z0-9 and '-', no leading/trailing '-')
const SUI_DOMAIN_RE = /^(?=.{1,253}$)(?:[\da-z](?:[\da-z-]{0,61}[\da-z])?\.)+sui$/i

// Sui address helpers
function isEvenHexDigits(hex) {
  return /^[\dA-Fa-f]+$/.test(hex) && hex.length > 0 && hex.length % 2 === 0
}

// Pre-normalization: 1..64 hex digits (<=32 bytes), even length, 0x prefixed
function isSuiAddressLoose(addr) {
  if (!/^0x[\dA-Fa-f]+$/.test(addr)) return false
  const hex = addr.slice(2)
  return isEvenHexDigits(hex) && hex.length <= 64
}

var __typeError = (msg) => {
  throw new TypeError(msg)
}

var __accessCheck = (obj, member, msg) => member.has(obj) || __typeError('Cannot ' + msg)
var __privateGet = (obj, member, getter) => (
  __accessCheck(obj, member, 'read from private field'), getter ? getter.call(obj) : member.get(obj)
)
var __privateAdd = (obj, member, value) =>
  member.has(obj)
    ? __typeError('Cannot add the same private member more than once')
    : member instanceof WeakSet
      ? member.add(obj)
      : member.set(obj, value)
var __privateSet = (obj, member, value, setter) => (
  __accessCheck(obj, member, 'write to private field'),
  setter ? setter.call(obj, value) : member.set(obj, value),
  value
)
var __privateMethod = (obj, member, method) => (
  __accessCheck(obj, member, 'access private method'), method
)
var _cache,
  _url,
  _pageSize,
  _overrides,
  _MvrClient_instances,
  mvrPackageDataLoader_get,
  mvrTypeDataLoader_get,
  resolvePackages_fn,
  resolveTypes_fn,
  fetch_fn

export const PACKAGE_VERSION = '1.36.1'
export const TARGETED_RPC_VERSION = '1.55.0'

const NAME_SEPARATOR = '/'
const MVR_API_HEADER = {
  'Mvr-Source': `@mysten/sui@${PACKAGE_VERSION}`,
}

class MvrClient {
  constructor({ cache, url, pageSize = 50, overrides }) {
    __privateAdd(this, _MvrClient_instances)
    __privateAdd(this, _cache)
    __privateAdd(this, _url)
    __privateAdd(this, _pageSize)
    __privateAdd(this, _overrides)
    __privateSet(this, _cache, cache)
    __privateSet(this, _url, url)
    __privateSet(this, _pageSize, pageSize)
    __privateSet(this, _overrides, {
      packages: overrides?.packages,
      types: overrides?.types,
    })
    validateOverrides(__privateGet(this, _overrides))
  }

  async resolvePackage({ package: name }) {
    const resolved = await __privateGet(this, _MvrClient_instances, mvrPackageDataLoader_get).load(
      name
    )
    return {
      package: resolved,
    }
  }

  async resolveType({ type }) {
    const mvrTypes = [...extractMvrTypes(type)]
    const resolvedTypes = await __privateGet(
      this,
      _MvrClient_instances,
      mvrTypeDataLoader_get
    ).loadMany(mvrTypes)
    const typeMap = Object.create(null)
    for (const [i, mvrType] of mvrTypes.entries()) {
      const resolvedType = resolvedTypes[i]
      if (resolvedType instanceof Error) {
        throw resolvedType
      }

      typeMap[mvrType] = resolvedType
    }

    return {
      type: replaceMvrNames(type, typeMap),
    }
  }

  async resolve({ types = [], packages = [] }) {
    const mvrTypes = /* @__PURE__ */ new Set()
    for (const type of types ?? []) {
      extractMvrTypes(type, mvrTypes)
    }

    const typesArray = [...mvrTypes]
    const [resolvedTypes, resolvedPackages] = await Promise.all([
      typesArray.length > 0
        ? __privateGet(this, _MvrClient_instances, mvrTypeDataLoader_get).loadMany(typesArray)
        : [],
      packages.length > 0
        ? __privateGet(this, _MvrClient_instances, mvrPackageDataLoader_get).loadMany(packages)
        : [],
    ])
    const typeMap = {
      ...__privateGet(this, _overrides)?.types,
    }
    for (const [i, type] of typesArray.entries()) {
      const resolvedType = resolvedTypes[i]
      if (resolvedType instanceof Error) {
        throw resolvedType
      }

      typeMap[type] = resolvedType
    }

    const replacedTypes = Object.create(null)
    for (const type of types ?? []) {
      const resolvedType = replaceMvrNames(type, typeMap)
      replacedTypes[type] = {
        type: resolvedType,
      }
    }

    const replacedPackages = Object.create(null)
    for (const [i, pkg] of (packages ?? []).entries()) {
      const resolvedPkg = __privateGet(this, _overrides)?.packages?.[pkg] ?? resolvedPackages[i]
      if (resolvedPkg instanceof Error) {
        throw resolvedPkg
      }

      replacedPackages[pkg] = {
        package: resolvedPkg,
      }
    }

    return {
      types: replacedTypes,
      packages: replacedPackages,
    }
  }
}
_cache = new WeakMap()
_url = new WeakMap()
_pageSize = new WeakMap()
_overrides = new WeakMap()
_MvrClient_instances = new WeakSet()
mvrPackageDataLoader_get = function () {
  return __privateGet(this, _cache).readSync(
    ['#mvrPackageDataLoader', __privateGet(this, _url) ?? ''],
    () => {
      const loader = new DataLoader(async (packages) => {
        if (!__privateGet(this, _url)) {
          throw new Error(
            `MVR Api URL is not set for the current client (resolving ${packages.join(', ')})`
          )
        }

        const resolved = await __privateMethod(this, _MvrClient_instances, resolvePackages_fn).call(
          this,
          packages
        )
        return packages.map(
          (pkg) => resolved[pkg] ?? new Error(`Failed to resolve package: ${pkg}`)
        )
      })
      const overrides = __privateGet(this, _overrides)?.packages
      if (overrides) {
        for (const [pkg, id] of Object.entries(overrides)) {
          loader.prime(pkg, id)
        }
      }

      return loader
    }
  )
}

mvrTypeDataLoader_get = function () {
  return __privateGet(this, _cache).readSync(
    ['#mvrTypeDataLoader', __privateGet(this, _url) ?? ''],
    () => {
      const loader = new DataLoader(async (types) => {
        if (!__privateGet(this, _url)) {
          throw new Error(
            `MVR Api URL is not set for the current client (resolving ${types.join(', ')})`
          )
        }

        const resolved = await __privateMethod(this, _MvrClient_instances, resolveTypes_fn).call(
          this,
          types
        )
        return types.map((type) => resolved[type] ?? new Error(`Failed to resolve type: ${type}`))
      })
      const overrides = __privateGet(this, _overrides)?.types
      if (overrides) {
        for (const [type, id] of Object.entries(overrides)) {
          loader.prime(type, id)
        }
      }

      return loader
    }
  )
}

resolvePackages_fn = async function (packages) {
  if (packages.length === 0) return Object.create(null)
  const batches = chunk(packages, __privateGet(this, _pageSize))
  const results = Object.create(null)
  await Promise.all(
    batches.map(async (batch) => {
      const data = await __privateMethod(this, _MvrClient_instances, fetch_fn).call(
        this,
        '/v1/resolution/bulk',
        {
          names: batch,
        }
      )
      if (!data?.resolution) return
      for (const pkg of Object.keys(data?.resolution)) {
        const pkgData = data.resolution[pkg]?.package_id
        if (!pkgData) continue
        results[pkg] = pkgData
      }
    })
  )
  return results
}

resolveTypes_fn = async function (types) {
  if (types.length === 0) return Object.create(null)
  const batches = chunk(types, __privateGet(this, _pageSize))
  const results = Object.create(null)
  await Promise.all(
    batches.map(async (batch) => {
      const data = await __privateMethod(this, _MvrClient_instances, fetch_fn).call(
        this,
        '/v1/struct-definition/bulk',
        {
          types: batch,
        }
      )
      if (!data?.resolution) return
      for (const type of Object.keys(data?.resolution)) {
        const typeData = data.resolution[type]?.type_tag
        if (!typeData) continue
        results[type] = typeData
      }
    })
  )
  return results
}

fetch_fn = async function (url, body) {
  if (!__privateGet(this, _url)) {
    throw new Error('MVR Api URL is not set for the current client')
  }

  const response = await fetch(`${__privateGet(this, _url)}${url}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...MVR_API_HEADER,
    },
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    const errorBody = await response.json().catch(() => Object.create(null))
    throw new Error(`Failed to resolve types: ${errorBody?.message}`)
  }

  return response.json()
}

function validateOverrides(overrides) {
  if (overrides?.packages) {
    for (const [pkg, id] of Object.entries(overrides.packages)) {
      if (!isValidNamedPackage(pkg)) {
        throw new Error(`Invalid package name: ${pkg}`)
      }

      if (!isValidSuiAddress(normalizeSuiAddress(id))) {
        throw new Error(`Invalid package ID: ${id}`)
      }
    }
  }

  if (overrides?.types) {
    for (const [type, val] of Object.entries(overrides.types)) {
      // NOTE: exodus dev edited on audit
      if (parseStructTag(type).typeParams.length > 0) {
        throw new Error(
          'Type overrides must be first-level only. If you want to supply generic types, just pass each type individually.'
        )
      }

      const parsedValue = parseStructTag(val)
      if (!isValidSuiAddress(parsedValue.address)) {
        throw new Error(`Invalid type: ${val}`)
      }
    }
  }
}

function extractMvrTypes(type, types = /* @__PURE__ */ new Set()) {
  if (typeof type === 'string' && !hasMvrName(type)) return types
  const tag = isStructTag(type) ? type : parseStructTag(type)
  if (hasMvrName(tag.address)) types.add(`${tag.address}::${tag.module}::${tag.name}`)
  for (const param of tag.typeParams) {
    extractMvrTypes(param, types)
  }

  return types
}

function replaceMvrNames(tag, typeCache) {
  const type = isStructTag(tag) ? tag : parseStructTag(tag)
  const typeTag = `${type.address}::${type.module}::${type.name}`
  const cacheHit = typeCache[typeTag]
  return normalizeStructTag({
    ...type,
    address: cacheHit ? cacheHit.split('::')[0] : type.address,
    typeParams: type.typeParams.map((param) => replaceMvrNames(param, typeCache)),
  })
}

function hasMvrName(nameOrType) {
  // NOTE: exodus dev edited on audit
  if (typeof nameOrType !== 'string') return false
  const s = nameOrType.trim()
  if (!s) return false

  // 1) foo(.bar).sui
  if (SUI_DOMAIN_RE.test(s)) return true

  // 2) name@0x<hex>
  const at = s.indexOf('@')
  if (at > 0) {
    const left = s.slice(0, at)
    const right = s.slice(at + 1)
    if (MOVE_IDENT.test(left) && isSuiAddressLoose(right)) return true
  }

  // 3) namespace/name (exactly one separator, both identifiers)
  if (s.includes(NAME_SEPARATOR)) {
    const parts = s.split(NAME_SEPARATOR)
    if (
      parts.length === 2 &&
      parts[0] &&
      parts[1] &&
      MOVE_IDENT.test(parts[0]) &&
      MOVE_IDENT.test(parts[1])
    ) {
      return true
    }
  }

  return false
}

function isStructTag(type) {
  return (
    typeof type === 'object' &&
    'address' in type &&
    'module' in type &&
    'name' in type &&
    'typeParams' in type
  )
}

function findNamesInTransaction(builder) {
  const packages = /* @__PURE__ */ new Set()
  const types = /* @__PURE__ */ new Set()
  for (const command of builder.commands) {
    switch (command.$kind) {
      case 'MakeMoveVec':
        if (command.MakeMoveVec.type) {
          getNamesFromTypeList([command.MakeMoveVec.type]).forEach((type) => {
            types.add(type)
          })
        }

        break
      case 'MoveCall':
        const moveCall = command.MoveCall
        const pkg = moveCall.package.split('::')[0]
        if (hasMvrName(pkg)) {
          if (!isValidNamedPackage(pkg)) throw new Error(`Invalid package name: ${pkg}`)
          packages.add(pkg)
        }

        getNamesFromTypeList(moveCall.typeArguments ?? []).forEach((type) => {
          types.add(type)
        })
        break
      default:
        break
    }
  }

  return {
    packages: [...packages],
    types: [...types],
  }
}

function replaceNames(builder, resolved) {
  for (const command of builder.commands) {
    if (command.MakeMoveVec?.type) {
      if (!hasMvrName(command.MakeMoveVec.type)) continue
      if (!resolved.types[command.MakeMoveVec.type]) {
        throw new Error(`No resolution found for type: ${command.MakeMoveVec.type}`)
      }

      command.MakeMoveVec.type = resolved.types[command.MakeMoveVec.type].type
    }

    const tx = command.MoveCall
    if (!tx) continue
    const nameParts = tx.package.split('::')
    const name = nameParts[0]
    if (hasMvrName(name) && !resolved.packages[name]) {
      throw new Error(`No address found for package: ${name}`)
    }

    if (hasMvrName(name)) {
      nameParts[0] = resolved.packages[name].package
      tx.package = nameParts.join('::')
    }

    const types = tx.typeArguments
    if (!types) continue
    for (let i = 0; i < types.length; i++) {
      if (!hasMvrName(types[i])) continue
      if (!resolved.types[types[i]]) throw new Error(`No resolution found for type: ${types[i]}`)
      types[i] = resolved.types[types[i]].type
    }

    tx.typeArguments = types
  }
}

function getNamesFromTypeList(types) {
  const names = /* @__PURE__ */ new Set()
  for (const type of types) {
    if (hasMvrName(type)) {
      if (!isValidNamedType(type)) throw new Error(`Invalid type with names: ${type}`)
      names.add(type)
    }
  }

  return names
}

export { MvrClient, findNamesInTransaction, hasMvrName, replaceNames, validateOverrides }
// # sourceMappingURL=mvr.js.map
