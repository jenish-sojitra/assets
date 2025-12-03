/* eslint @typescript-eslint/no-explicit-any: 0 */ // --> OFF

export type HookEvent = ['start', 'stop', 'update', 'tick', 'tick-multiple-wallet-accounts']

export type HistoryMonitor = {
  start: (params?: any) => Promise<void>
  stop: () => Promise<void>
  addHook: (event: HookEvent, callback: (params: any) => Promise<void>) => void
  update: (args?: {
    walletAccount: string
    refresh?: boolean
    highPriority?: boolean
    assetName?: string
  }) => Promise<void>
}
