const mainnet = require('./mainnet.json')
const ropsten = require('./ropsten.json')
const rinkeby = require('./rinkeby.json')
const kovan = require('./kovan.json')
const goerli = require('./goerli.json')
const calaveras = require('./calaveras.json')

function _getInitializedChains(customChains) {
  const names = {
    '1': 'mainnet',
    '3': 'ropsten',
    '4': 'rinkeby',
    '42': 'kovan',
    '5': 'goerli',
    '123': 'calaveras',
  }
  const chains = {
    mainnet,
    ropsten,
    rinkeby,
    kovan,
    goerli,
    calaveras,
  }
  if (customChains) {
    for (const chain of customChains) {
      const name = chain.name
      names[chain.chainId.toString()] = name
      chains[name] = chain
    }
  }

  chains['names'] = names
  return chains
}

module.exports = { _getInitializedChains }
