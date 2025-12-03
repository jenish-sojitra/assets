# Combined Assets

Combined assets are a type of pseudo asset that link to an array of "real" assets. The linking is done using the `combinedAssetNames` property of a combined asset. All combined assets have a property `isCombined` set to true. These two properties are the only deviation from normal asset properties. There can be many types of combined assets. The type is determined by the `assetType` property. The only type currently in use is the `MULTI_NETWORK_ASSET` type.

The metadata for a `MULTI_NETWORK_ASSET` combined asset looks like:

```javascript
export const name = '_1inch'
export const ticker = `${name}_1INCH`
export const displayName = '1inch'
export const displayTicker = '1INCH'
export const units = { [`${name}_base`]: 0, [ticker]: 18 }
export const assetType = 'MULTI_NETWORK_ASSET'
export const combinedAssetNames = ['oneinch', '1inch_bsc_61c44543']
```

To add a new "real" asset to the list of `1inch` combined assets, just add it to the `combinedAssetNames` array. The first item in this array has a special meaning, as it is used as a default (sometimes called "primary") asset. Do not change the first item unless the intention is to change the default.

## Getting Started

```sh
yarn
```

## Tests

```sh
yarn test
yarn test --watch
```

## Publish

```sh
yarn build
NPM_CONFIG_OTP=123456 yarn release
NPM_CONFIG_OTP=123456 yarn release from-package # if 2FA token timeout, re-publish with current version in package.json
```
