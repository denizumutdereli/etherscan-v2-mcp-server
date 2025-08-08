export const resources = [
  {
    uri: "etherscanv2://guide",
    mimeType: "text/markdown",
    name: "Etherscan V2 Tooling Guide",
    description: "How to pick tools and parameters; pagination and rate-friendly usage",
    text: [
      "# Etherscan V2 Tooling Guide",
      "",
      "- Always include chainid (e.g., 1/Ethereum, 10/Optimism, 42161/Arbitrum, 8453/Base).",
      "- Use page/offset for lists; do not aggregate many pages in a single call.",
      "- For real-time endpoints (gas, balances), expect short TTL caches.",
      "- Logs: filter by address and topics; use fromBlock/toBlock windows and pagination.",
      "- Proxy JSON-RPC methods are exposed under proxy_* tools.",
    ].join("\n"),
  },
  {
    uri: "etherscanv2://api-map",
    mimeType: "application/json",
    name: "Etherscan V2 API Map",
    description: "High-level map of the exposed tools",
    text: JSON.stringify({
      accounts: ["account_balance", "account_txlist", "account_txlistinternal", "account_tokentx", "account_tokennfttx", "account_token1155tx"],
      blocks: ["block_by_time"],
      transactions: ["tx_receipt_status", "tx_status"],
      contracts: ["contract_getabi", "contract_getsourcecode"],
      logs: ["logs_getLogs"],
      tokens: ["token_supply", "token_holderlist", "token_balance"],
      gas: ["gas_oracle"],
      proxy: ["proxy_blockNumber", "proxy_getBlockByNumber", "proxy_getTransactionByHash"],
      stats: ["stats_ethprice", "stats_ethsupply"],
      nametags: ["nametag_by_address"],
    }, null, 2),
  },
];


