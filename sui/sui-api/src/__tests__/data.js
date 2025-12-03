export const suiSuccessfulTransaction = {
  digest: 'H11oGDZWrENrgmhoxCLbdkN4MYndLGyDC49f337gv1mF',
  transaction: {
    data: {
      messageVersion: 'v1',
      transaction: {
        kind: 'ProgrammableTransaction',
        inputs: [
          { type: 'pure', valueType: 'u64', value: '10000000' },
          {
            type: 'pure',
            valueType: 'address',
            value: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
          },
        ],
        transactions: [
          { SplitCoins: ['GasCoin', [{ Input: 0 }]] },
          { TransferObjects: [[{ Result: 0 }], { Input: 1 }] },
        ],
      },
      sender: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      gasData: {
        payment: [
          {
            objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
            version: 591_733_822,
            digest: 'AQiMCBbFWQJ7eHevyqVjBXk5kRguAwZZX6Z3tsTdz6i4',
          },
        ],
        owner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
        price: '500',
        budget: '2476000',
      },
    },
    txSignatures: [
      'AOQ22ARO0JOOqowJVp4Ejlxr32sOFuvJrpjYzvXYOg8zm7vrUFcqylg4GqlC40rL8g1G8jX6+21KrLbtuXIJHw/toVhqlesvdJM6wsatZwu+zIBw+NAVrlgSfG6YOChOjQ==',
    ],
  },
  effects: {
    messageVersion: 'v1',
    status: { status: 'success' },
    executedEpoch: '855',
    gasUsed: {
      computationCost: '500000',
      storageCost: '1976000',
      storageRebate: '978120',
      nonRefundableStorageFee: '9880',
    },
    modifiedAtVersions: [
      {
        objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
        sequenceNumber: '591733822',
      },
    ],
    transactionDigest: 'H11oGDZWrENrgmhoxCLbdkN4MYndLGyDC49f337gv1mF',
    created: [
      {
        owner: {
          AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
        },
        reference: {
          objectId: '0x8b87a5363257a8992a9da21da3dea0c1814b0ef5203abf01a0e1eab0a55463e4',
          version: 591_733_823,
          digest: '3TMnj6zkKv87gfG6zeq6Vv8uVyNeSyFCfgmgBnGgtENn',
        },
      },
    ],
    mutated: [
      {
        owner: {
          AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
        },
        reference: {
          objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
          version: 591_733_823,
          digest: 'HYL9bbDdHTfqJ1NvqnDMiqgoxyUAbM3QZJQLe7HRMaPf',
        },
      },
    ],
    gasObject: {
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      reference: {
        objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
        version: 591_733_823,
        digest: 'HYL9bbDdHTfqJ1NvqnDMiqgoxyUAbM3QZJQLe7HRMaPf',
      },
    },
    dependencies: ['GytiWU7fW6BPsVWCiMcejfwMgSZeo1wdEKreUWgtp27e'],
  },
  objectChanges: [
    {
      type: 'mutated',
      sender: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
      version: '591733823',
      previousVersion: '591733822',
      digest: 'HYL9bbDdHTfqJ1NvqnDMiqgoxyUAbM3QZJQLe7HRMaPf',
    },
    {
      type: 'created',
      sender: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x8b87a5363257a8992a9da21da3dea0c1814b0ef5203abf01a0e1eab0a55463e4',
      version: '591733823',
      digest: '3TMnj6zkKv87gfG6zeq6Vv8uVyNeSyFCfgmgBnGgtENn',
    },
  ],
  balanceChanges: [
    {
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      coinType: '0x2::sui::SUI',
      amount: '-11497880',
    },
    {
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      coinType: '0x2::sui::SUI',
      amount: '10000000',
    },
  ],
  timestampMs: '1755212948786',
  checkpoint: '178973363',
}

export const suiFailedTransaction = {
  digest: '7JsU8vawQcrEy8M7x1P7jufymuNXDSnFJxcXjk3CkNhu',
  transaction: {
    data: {
      messageVersion: 'v1',
      transaction: {
        kind: 'ProgrammableTransaction',
        inputs: [
          { type: 'pure', valueType: 'u64', value: '10000000' },
          {
            type: 'pure',
            valueType: 'address',
            value: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
          },
        ],
        transactions: [
          { SplitCoins: ['GasCoin', [{ Input: 0 }]] },
          { TransferObjects: [[{ Result: 0 }], { Input: 1 }] },
        ],
      },
      sender: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      gasData: {
        payment: [
          {
            objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
            version: 591_733_810,
            digest: '6KUq72U5by84ZJFDxuG33yp2K9yjvAcjrvyat6eAJftD',
          },
        ],
        owner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
        price: '500',
        budget: '500000',
      },
    },
    txSignatures: [
      'AAOchSHp+lzXv186x/9mMWwKPGpbe72DaElDiAJBrLjFSrIGkqN5FFZ5rASROkDPshyhMTAd8wP+gIq8SEsx1wftoVhqlesvdJM6wsatZwu+zIBw+NAVrlgSfG6YOChOjQ==',
    ],
  },
  effects: {
    messageVersion: 'v1',
    status: { status: 'failure', error: 'InsufficientGas' },
    executedEpoch: '851',
    gasUsed: {
      computationCost: '500000',
      storageCost: '0',
      storageRebate: '0',
      nonRefundableStorageFee: '0',
    },
    modifiedAtVersions: [
      {
        objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
        sequenceNumber: '591733810',
      },
    ],
    transactionDigest: '7JsU8vawQcrEy8M7x1P7jufymuNXDSnFJxcXjk3CkNhu',
    mutated: [
      {
        owner: {
          AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
        },
        reference: {
          objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
          version: 591_733_811,
          digest: 'GruSUpRpvRgdxYDnqLdfjK4z5fq9dkxnUnQXE3fkQzw',
        },
      },
    ],
    gasObject: {
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      reference: {
        objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
        version: 591_733_811,
        digest: 'GruSUpRpvRgdxYDnqLdfjK4z5fq9dkxnUnQXE3fkQzw',
      },
    },
    dependencies: ['CPfz5EH67yAZqYx5oWzpy3hzqhQJHatgfYjyE6D5YPQj'],
  },
  objectChanges: [
    {
      type: 'mutated',
      sender: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x60399dbadbf60e24e8c4b3762a40555740bdd79670075708a5a3ffa18836cccb',
      version: '591733811',
      previousVersion: '591733810',
      digest: 'GruSUpRpvRgdxYDnqLdfjK4z5fq9dkxnUnQXE3fkQzw',
    },
  ],
  balanceChanges: [
    {
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      coinType: '0x2::sui::SUI',
      amount: '-500000',
    },
  ],
  timestampMs: '1754850970620',
  checkpoint: '177472544',
}

export const usdcSuccessfulTransaction = {
  digest: 'EyQtRQ5mpok7n3ptQMPUWf8mx2bYBfcEWMxmvzhRdgnY',
  transaction: {
    data: {
      messageVersion: 'v1',
      transaction: {
        kind: 'ProgrammableTransaction',
        inputs: [
          {
            type: 'object',
            objectType: 'immOrOwnedObject',
            objectId: '0xf83753d8533b56e5bf6bb84ab605c649207fbda631a23e5d7424311450a5d949',
            version: '591733796',
            digest: '9JLuBubo6A7vcuseeAY9HyGDSv1rDxP19PjKH8Hcd1Qn',
          },
          {
            type: 'object',
            objectType: 'immOrOwnedObject',
            objectId: '0x9e840fdba9efdf0d937f208965efcd7ebf52046fb35269dc8e693d67d069f55b',
            version: '591733798',
            digest: '5BJfPWfw9HyB7cXtLdip1dpXXfUqgBeqmYe7GxhA3Pts',
          },
          {
            type: 'object',
            objectType: 'immOrOwnedObject',
            objectId: '0x28aa678df6321c5c32c8632e2e44596aee85e3f11b2fc2c7e8823107224465ac',
            version: '591733797',
            digest: 'CDeuyCJSg2FLvuKcMM3XC8QppeweNrY9URKEeLQuedMJ',
          },
          { type: 'pure', valueType: 'u64', value: '400000' },
          {
            type: 'pure',
            valueType: 'address',
            value: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
          },
        ],
        transactions: [
          { MergeCoins: [{ Input: 0 }, [{ Input: 1 }, { Input: 2 }]] },
          { SplitCoins: [{ Input: 0 }, [{ Input: 3 }]] },
          { TransferObjects: [[{ NestedResult: [1, 0] }], { Input: 4 }] },
        ],
      },
      sender: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      gasData: {
        payment: [
          {
            objectId: '0x321cc031331dfcf49d5dc2226b9e188ecc28f30ae6ad925881a86d65eacb8c5b',
            version: 591_733_796,
            digest: '6F7T1LWV7qt7jvRGsdwgNb4V3EtjXTP8ad2CMZJthVGv',
          },
        ],
        owner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
        price: '505',
        budget: '1100000',
      },
    },
    txSignatures: [
      'AO6VQudHiQjEXCqicUmowMPEiGjUX0sysUY6nHtKp1Bhm3XGvGwlejsYaBIiOD4fg8txFhHKkyNaTaUAXvebQAYoU7Vvu+UARiFVINXkRiRM1QyluNLrT3xvNV2tBnDz1A==',
    ],
  },
  effects: {
    messageVersion: 'v1',
    status: { status: 'success' },
    executedEpoch: '845',
    gasUsed: {
      computationCost: '505000',
      storageCost: '3632800',
      storageRebate: '4905648',
      nonRefundableStorageFee: '49552',
    },
    modifiedAtVersions: [
      {
        objectId: '0x28aa678df6321c5c32c8632e2e44596aee85e3f11b2fc2c7e8823107224465ac',
        sequenceNumber: '591733797',
      },
      {
        objectId: '0x321cc031331dfcf49d5dc2226b9e188ecc28f30ae6ad925881a86d65eacb8c5b',
        sequenceNumber: '591733796',
      },
      {
        objectId: '0x9e840fdba9efdf0d937f208965efcd7ebf52046fb35269dc8e693d67d069f55b',
        sequenceNumber: '591733798',
      },
      {
        objectId: '0xf83753d8533b56e5bf6bb84ab605c649207fbda631a23e5d7424311450a5d949',
        sequenceNumber: '591733796',
      },
    ],
    transactionDigest: 'EyQtRQ5mpok7n3ptQMPUWf8mx2bYBfcEWMxmvzhRdgnY',
    created: [
      {
        owner: {
          AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
        },
        reference: {
          objectId: '0x24185a26cc169420a3e3c9ca060d30c0215eaf807e9e47fad16a0bc5a0bc0206',
          version: 591_733_799,
          digest: 'vX2cTdPeb2PM9GydG9P53m2eyQ9D4HZfxheu3PjQjCK',
        },
      },
    ],
    mutated: [
      {
        owner: {
          AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
        },
        reference: {
          objectId: '0x321cc031331dfcf49d5dc2226b9e188ecc28f30ae6ad925881a86d65eacb8c5b',
          version: 591_733_799,
          digest: 'E2hpRz1KdYrvob5fPeHrWqRDK3S297Ge3WsLJ3gCzjqC',
        },
      },
      {
        owner: {
          AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
        },
        reference: {
          objectId: '0xf83753d8533b56e5bf6bb84ab605c649207fbda631a23e5d7424311450a5d949',
          version: 591_733_799,
          digest: '47g3fdMyUD2XHS9LY3octLbRjoyFm29P9Wt5AZasLwv4',
        },
      },
    ],
    deleted: [
      {
        objectId: '0x28aa678df6321c5c32c8632e2e44596aee85e3f11b2fc2c7e8823107224465ac',
        version: 591_733_799,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz',
      },
      {
        objectId: '0x9e840fdba9efdf0d937f208965efcd7ebf52046fb35269dc8e693d67d069f55b',
        version: 591_733_799,
        digest: '7gyGAp71YXQRoxmFBaHxofQXAipvgHyBKPyxmdSJxyvz',
      },
    ],
    gasObject: {
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      reference: {
        objectId: '0x321cc031331dfcf49d5dc2226b9e188ecc28f30ae6ad925881a86d65eacb8c5b',
        version: 591_733_799,
        digest: 'E2hpRz1KdYrvob5fPeHrWqRDK3S297Ge3WsLJ3gCzjqC',
      },
    },
    dependencies: [
      '6c3LF9DmbhvaDDbpJU9zwFmbevpeKXYeW2KeR5TUXbEL',
      'A8saSiyEzC8n8P19aKV1ZeUy9Q9Ntx4NfaNHAjBsiPWN',
      'DWVdevBz1gv3gPYiNC4QcrzjMjwB6BQJivcFLkAuRyfb',
    ],
  },
  objectChanges: [
    {
      type: 'mutated',
      sender: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      objectType: '0x2::coin::Coin<0x2::sui::SUI>',
      objectId: '0x321cc031331dfcf49d5dc2226b9e188ecc28f30ae6ad925881a86d65eacb8c5b',
      version: '591733799',
      previousVersion: '591733796',
      digest: 'E2hpRz1KdYrvob5fPeHrWqRDK3S297Ge3WsLJ3gCzjqC',
    },
    {
      type: 'mutated',
      sender: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      objectType:
        '0x2::coin::Coin<0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>',
      objectId: '0xf83753d8533b56e5bf6bb84ab605c649207fbda631a23e5d7424311450a5d949',
      version: '591733799',
      previousVersion: '591733796',
      digest: '47g3fdMyUD2XHS9LY3octLbRjoyFm29P9Wt5AZasLwv4',
    },
    {
      type: 'created',
      sender: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      objectType:
        '0x2::coin::Coin<0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC>',
      objectId: '0x24185a26cc169420a3e3c9ca060d30c0215eaf807e9e47fad16a0bc5a0bc0206',
      version: '591733799',
      digest: 'vX2cTdPeb2PM9GydG9P53m2eyQ9D4HZfxheu3PjQjCK',
    },
  ],
  balanceChanges: [
    {
      owner: {
        AddressOwner: '0x19de6f5b54923690fe2ad52c1295a46f742611e7bab1fa72d6a02a15afb0b99a',
      },
      coinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amount: '400000',
    },
    {
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      coinType: '0x2::sui::SUI',
      amount: '767848',
    },
    {
      owner: {
        AddressOwner: '0xa9da7ae5f6160a801198a51c369ce8b26762bbc27e727f9fcf015c4de5dc996f',
      },
      coinType: '0xdba34672e30cb065b1f93e3ab55318768fd6fef66c15942c9f7cb846e2f900e7::usdc::USDC',
      amount: '-400000',
    },
  ],
  timestampMs: '1754353772784',
  checkpoint: '175362147',
}
