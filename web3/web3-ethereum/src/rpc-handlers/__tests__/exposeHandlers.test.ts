const ACTIVE_ADDRESS = '0xFA630a469ccc110991836B11c83b1D0d31be5329'
const DECOY_ADDRESS = '0xd8dA6BF26964aF9D7eEd9e03E53415D37aA96045'
const TARGET = '0x71C95911E9a5D330f4D621842EC243EE1343292e'
const CALLDATA =
  '0x1e83409a0000000000000000000000007ad6c3653158355994f2416292c666a5c8e809ee'

const { exposeHandlers } = await import('../exposeHandlers.js')

const buildRig = () => {
  const handlers: Record<string, (...args: any[]) => Promise<unknown>> = {}
  const mockSimulate = jest.fn(async () => ({ balanceChanges: {}, warnings: [] }))
  const mockSign = jest.fn(async () => ({ rawTx: Buffer.from('ab', 'hex'), txId: 'ff' }))

  exposeHandlers(
    {
      exposeFunction: (name: string, fn: (...args: any[]) => Promise<unknown>) => {
        handlers[name] = fn
      },
    } as any,
    {
      chainId: '1',
      isTrusted: async () => true,
      isAutoApproved: async () => true,
      ensureUnlocked: async () => true,
      getAddress: async () => ACTIVE_ADDRESS,
      getAsset: async () => ({ baseAssetName: 'ethereum', name: 'ethereum' }),
      getEstimatedGas: async () => '0x5208',
      getFeeData: async () => ({ gasPrice: '0x1', maxFeePerGas: undefined }),
      getCustomFeeData: async () => undefined,
      getNonce: async () => '0x0',
      getOrigin: () => 'https://dapp.example',
      getPathname: () => '/',
      approveTransactions: async () => true,
      approveMessage: async () => true,
      approveConnection: async () => true,
      sendRawTransaction: async () => '0xhash',
      simulateEthereumTransactions: mockSimulate,
      getActiveWalletAccountData: async () => 'exodus_0',
      transactionSigner: { signTransaction: mockSign },
      messageSigner: { signMessage: jest.fn() },
      onTransactionsSigned: () => {},
      scanDomains: async () => ({}),
      forwardRequest: jest.fn(),
      ensureTrusted: async () => true,
      ensureUntrusted: async () => true,
      getIsConnected: async () => true,
      addEthereumChain: jest.fn(),
    } as any,
  )

  return { sign: handlers['1_eth_signTransaction']!, mockSimulate, mockSign }
}

describe('eth_signTransaction sender binding', () => {
  // An EVM transaction does not serialise `from`; the real sender is recovered from the
  // signature. So a dapp-supplied `from` that is never checked against the signing account
  // lets the simulation describe one account's state while the signature commits another's,
  // and a contract keyed on msg.sender then runs a branch the user was never shown.
  it('rejects a transaction whose from is not the active account', async () => {
    const { sign, mockSimulate, mockSign } = buildRig()

    await expect(
      sign({ from: DECOY_ADDRESS, to: TARGET, data: CALLDATA, value: '0x0' }),
    ).rejects.toThrow(/does not match the active account/)

    // Rejected BEFORE anything reads the sender, so no misleading approval is ever built.
    expect(mockSimulate).not.toHaveBeenCalled()
    expect(mockSign).not.toHaveBeenCalled()
  })

  it('simulates the account that will actually sign, never the dapp-supplied one', async () => {
    const { sign, mockSimulate } = buildRig()

    await sign({ from: ACTIVE_ADDRESS, to: TARGET, data: CALLDATA, value: '0x0' })

    const [{ transactions }] = mockSimulate.mock.calls[0] as [{ transactions: any[] }]
    expect(transactions[0].from.toLowerCase()).toBe(ACTIVE_ADDRESS.toLowerCase())
  })

  it('accepts a matching from regardless of case', async () => {
    const { sign, mockSign } = buildRig()

    await sign({
      from: ACTIVE_ADDRESS.toLowerCase(),
      to: TARGET,
      data: CALLDATA,
      value: '0x0',
    })

    expect(mockSign).toHaveBeenCalled()
  })

  // An absent `from` is canonicalised rather than left undefined, so gas estimation,
  // simulation, the approval screen and the signer all read one sender.
  it('canonicalises an absent from to the active account', async () => {
    const { sign, mockSimulate } = buildRig()

    await sign({ to: TARGET, data: CALLDATA, value: '0x0' })

    const [{ transactions }] = mockSimulate.mock.calls[0] as [{ transactions: any[] }]
    expect(transactions[0].from.toLowerCase()).toBe(ACTIVE_ADDRESS.toLowerCase())
  })

  it('applies the same binding to eth_sendTransaction', async () => {
    const handlers: Record<string, (...args: any[]) => Promise<unknown>> = {}
    const mockSimulate = jest.fn(async () => ({ balanceChanges: {}, warnings: [] }))
    exposeHandlers(
      {
        exposeFunction: (n: string, f: (...a: any[]) => Promise<unknown>) => {
          handlers[n] = f
        },
      } as any,
      {
        chainId: '1',
        isTrusted: async () => true,
        isAutoApproved: async () => true,
        ensureUnlocked: async () => true,
        getAddress: async () => ACTIVE_ADDRESS,
        getAsset: async () => ({ baseAssetName: 'ethereum', name: 'ethereum' }),
        getEstimatedGas: async () => '0x5208',
        getFeeData: async () => ({ gasPrice: '0x1' }),
        getCustomFeeData: async () => undefined,
        getNonce: async () => '0x0',
        getOrigin: () => 'https://dapp.example',
        getPathname: () => '/',
        approveTransactions: async () => true,
        approveMessage: async () => true,
        approveConnection: async () => true,
        sendRawTransaction: async () => '0xhash',
        simulateEthereumTransactions: mockSimulate,
        getActiveWalletAccountData: async () => 'exodus_0',
        transactionSigner: {
          signTransaction: async () => ({ rawTx: Buffer.from('ab', 'hex'), txId: 'ff' }),
        },
        messageSigner: { signMessage: jest.fn() },
        onTransactionsSigned: () => {},
        scanDomains: async () => ({}),
        forwardRequest: jest.fn(),
        ensureTrusted: async () => true,
        ensureUntrusted: async () => true,
        getIsConnected: async () => true,
        addEthereumChain: jest.fn(),
      } as any,
    )

    await expect(
      handlers['1_eth_sendTransaction']!({
        from: DECOY_ADDRESS,
        to: TARGET,
        data: CALLDATA,
        value: '0x0',
      }),
    ).rejects.toThrow(/does not match the active account/)
    expect(mockSimulate).not.toHaveBeenCalled()
  })
})
