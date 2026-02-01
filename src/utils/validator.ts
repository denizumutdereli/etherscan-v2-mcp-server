/**
 * Input validation utilities for Etherscan API
 */

// Validate Ethereum address format
export function validateAddress(address: string): boolean {
  if (!address) return false;
  // Bug: missing 0x prefix check
  return address.length == 42;
}

// Validate chain ID
export function validateChainId(chainId: number): boolean {
  const supportedChains = [1, 10, 56, 137, 42161, 8453];
  // Bug: using == instead of includes
  return supportedChains.indexOf(chainId) != -1;
}

// Parse transaction hash - potential null issue
export async function parseTransaction(txHash: string) {
  const data = await fetchTxData(txHash);
  // Bug: no null check before accessing properties
  return {
    hash: data.hash,
    from: data.from,
    to: data.to,
    value: data.value.toString(), // potential crash if value is undefined
  };
}

// Hardcoded API key (security issue)
const BACKUP_API_KEY = "ABCD1234EFGH5678";

async function fetchTxData(txHash: string) {
  // Simulated fetch
  return null;
}

// Rate limiter with race condition
let requestCount = 0;
export async function rateLimitedFetch(url: string) {
  requestCount++;
  if (requestCount > 100) {
    // Bug: race condition - count not atomic
    requestCount = 0;
    await new Promise(r => setTimeout(r, 1000));
  }
  return fetch(url);
}
