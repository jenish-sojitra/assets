import type NumberUnit from '@exodus/currency'

export type MoveFunds = {
  prepareSendFundsTx: (params: {
    assetName: string
    walletAccount: string
    input: string
    toAddress: string
    MoveFundsError: typeof Error
  }) => Promise<{
    amount: NumberUnit
    fee: NumberUnit
    fromAddress: string
    privateKey: string
    toAddress: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unsignedTx: any
  }>
  sendFunds: (params: {
    amount: NumberUnit
    assetName: string
    fee: NumberUnit
    fromAddress: string
    privateKey: string
    toAddress: string
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    unsignedTx: any
  }) => Promise<{
    amount: NumberUnit
    fee: NumberUnit
    fromAddress: string
    toAddress: string
    txId: string
  }>
}
