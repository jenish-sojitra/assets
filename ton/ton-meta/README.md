# @exodus/ton-meta &middot; [![npm version](https://img.shields.io/badge/npm-public-blue.svg?style=flat)](https://www.npmjs.com/package/@exodus/ton-meta)

The **ton-meta** package provides a collection of metadata for Ton blockchain assets. This metadata includes visual elements (such as logos, primary colors, and gradient schemes),
display names, tickers, blockchain explorer URLs, and descriptive information.

---

## Installation

Install the package via `yarn`:

```bash
yarn add @exodus/ton-meta
```

## Usage

Below is an example of how to import and use the metadata:

```javascript
import assetList from '@exodus/ton-meta'

const tonAsset = assetList.find((asset) => asset.name === 'ton')

console.log(tonAsset)
```

You can use this metadata to display asset information in your application, such as logos, colors, and explorer URLs.

## License

This project is licensed under the MIT License.
You are free to use, modify, and distribute this software under the terms of the MIT License.
For more details, see the [LICENSE](LICENSE) file.
