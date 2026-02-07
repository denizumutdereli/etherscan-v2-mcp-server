/**
 * Utility helpers for Etherscan V2 MCP Server
 */

/**
 * Format wei to ether string with specified decimal places
 */
export function weiToEther(wei: string, decimals: number = 4): string {
  const value = BigInt(wei);
  const divisor = BigInt(10 ** 18);
  const whole = value / divisor;
  const fraction = value % divisor;
  const fractionStr = fraction.toString().padStart(18, "0").slice(0, decimals);
  return `${whole}.${fractionStr}`;
}

/**
 * Validate Ethereum address format
 */
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Truncate address for display: 0x1234...abcd
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!isValidAddress(address)) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}
