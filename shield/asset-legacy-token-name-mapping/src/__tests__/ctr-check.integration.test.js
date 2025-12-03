import { fetch } from '@exodus/fetch'

import oldToNewStyleTokenNames from '../index.js'

// Max limit is 50 tokens per request on tokens registry API endpoint
const CHUNK_SIZE = 50

const fetchTokensInfo = async (tokenNames) => {
  const response = await fetch('https://ctr.a.exodus.io/registry/tokens', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      tokenNames,
      lifecycleStatus: ['c', 'v', 'u', 'd'],
    }),
  })

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`)
  }

  return response.json()
}

const fetchAllTokensInfo = async (allTokenNames) => {
  const chunks = []
  for (let i = 0; i < allTokenNames.length; i += CHUNK_SIZE) {
    chunks.push(allTokenNames.slice(i, i + CHUNK_SIZE))
  }

  const results = []
  for (const chunk of chunks) {
    const data = await fetchTokensInfo(chunk)
    if (data.status !== 'OK') {
      throw new Error(`Failed to fetch tokens info: ${JSON.stringify(data)}`)
    }

    results.push(...data.tokens)
  }

  return results
}

describe('all mappings should be valid in CTR', () => {
  let newTokensMap

  let oldTokenMap

  beforeAll(async () => {
    const tokenNames = Object.values(oldToNewStyleTokenNames)
    const tokens = await fetchAllTokensInfo(tokenNames)
    newTokensMap = new Map(tokens.map((t) => [t.assetName, t]))
  })

  beforeAll(async () => {
    const tokenNames = Object.keys(oldToNewStyleTokenNames)
    const tokens = await fetchAllTokensInfo(tokenNames)
    oldTokenMap = new Map(tokens.map((t) => [t.assetName, t]))
  })

  for (const [oldName, newName] of Object.entries(oldToNewStyleTokenNames)) {
    test(oldName + ' -> ' + newName, () => {
      const token = newTokensMap.get(newName)
      if (token) {
        expect(token).toBeDefined()
        expect(token.assetName).toEqual(newName)
        // either dead or curated
        expect(['d', 'c'].includes(token.lifecycleStatus)).toEqual(true)
      } else {
        const oldToken = oldTokenMap.get(oldName) // before tron migration
        expect(oldToken).toBeDefined()
        expect(oldToken.assetName).toEqual(oldName)
        // only tron tokens are allwed to have old names on ctr, these are not curated yet
        expect(oldToken.baseAssetName).toEqual('tronmainnet')
        expect(['v', 'c'].includes(oldToken.lifecycleStatus)).toEqual(true)
      }
    })
  }
})
