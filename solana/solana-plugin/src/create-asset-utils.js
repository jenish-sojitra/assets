import { SolanaClarityMonitor, SolanaMonitor } from '@exodus/solana-api'
import assert from 'minimalistic-assert'

export const createHistoryMonitorFactory = ({
  monitorType,
  assetClientInterface,
  interval,
  shouldUpdateBalanceBeforeHistory,
  ticksBetweenHistoryFetches,
  ticksBetweenStakeFetches,
  includeUnparsed,
  api,
  txsLimit,
}) => {
  assert(assetClientInterface, 'expected assetClientInterface')
  assert(monitorType, 'expected monitorType')
  assert(interval, 'expected monitor interval')
  assert(api, 'expected api server')

  return (args) => {
    let monitor
    switch (monitorType) {
      case 'clarity':
        monitor = new SolanaClarityMonitor({
          assetClientInterface,
          interval,
          shouldUpdateBalanceBeforeHistory,
          ticksBetweenHistoryFetches,
          ticksBetweenStakeFetches,
          includeUnparsed,
          api,
          txsLimit,
          ...args,
        })
        break
      case 'rpc':
        monitor = new SolanaMonitor({
          assetClientInterface,
          interval,
          shouldUpdateBalanceBeforeHistory,
          ticksBetweenHistoryFetches,
          ticksBetweenStakeFetches,
          includeUnparsed,
          api,
          txsLimit,
          ...args,
        })
        break
      default:
        throw new Error(`Monitor type ${monitorType} of solana is unknown`)
    }

    return monitor
  }
}
