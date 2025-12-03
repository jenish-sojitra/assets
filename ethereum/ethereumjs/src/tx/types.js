/**
 * Can be used in conjunction with Transaction.supports
 * to query on tx capabilities
 */
export const Capability = {
  /**
   * Tx supports EIP-155 replay protection
   * See: [155](https://eips.ethereum.org/EIPS/eip-155) Replay Attack Protection EIP
   */
  EIP155ReplayProtection: 155,

  /**
   * Tx supports EIP-1559 gas fee market mechansim
   * See: [1559](https://eips.ethereum.org/EIPS/eip-1559) Fee Market EIP
   */
  EIP1559FeeMarket: 1559,

  /**
   * Tx is a typed transaction as defined in EIP-2718
   * See: [2718](https://eips.ethereum.org/EIPS/eip-2718) Transaction Type EIP
   */
  EIP2718TypedTransaction: 2718,

  /**
   * Tx supports access list generation as defined in EIP-2930
   * See: [2930](https://eips.ethereum.org/EIPS/eip-2930) Access Lists EIP
   */
  EIP2930AccessLists: 2930,
}
