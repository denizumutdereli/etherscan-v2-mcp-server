## Etherscan V2 MCP Server

Overview
Etherscan V2 MCP Server exposes a curated set of Etherscan V2 endpoints as Model Context Protocol (MCP) tools. It can run either as a streamable HTTP MCP endpoint or as a stdio MCP server. Native ESM is used throughout the project.

Key files:
* __Server__: `src/index.ts`
* __Tools__: `src/tools.ts`
* __Schemas__: `src/schemas.ts`
* __MCP Resources__: `src/resources.ts`

Requirements
* __Node.js__: 20+ (recommended 22+)
* __Package manager__: npm, yarn, or pnpm

Installation
```bash
npm i
```

Environment
Copy `.env.example` to `.env` and set values:
* __ETHERSCAN_API_KEY__: Your Etherscan (or supported explorer) API key.
* __ETHERSCAN_PRO__: optional, enable pro features if available.
* __OPENAI_API_KEY__: optional, enables simple NL routing for `ethv2_nl_query`.
* __REDIS_HOST__, __REDIS_PORT__, __REDIS_PASSWORD__: optional; if set, server uses Redis-backed cache; otherwise in-memory cache.
* __PORT__: default 5009.
* __HOST__: default 0.0.0.0.

Scripts
* __build__: `tsc`
* __dev__: `tsx src/index.ts`
* __start__: `node dist/index.js`
* __test__: `jest --passWithNoTests`

Run (HTTP MCP and REST info)
```bash
# Development (tsx)
npm run dev

# Production build
npm run build && npm start

# Stdio mode for MCP-aware clients
node dist/index.js --stdio
```

HTTP Endpoints (non-MCP)
* __GET `/health`__: basic liveness payload.
* __GET `/api/tools`__: returns the tool catalog with input JSON Schemas.
* __`/mcp`__: Streamable HTTP transport for MCP. Initialize the session with a POST first; persist the `mcp-session-id` header on subsequent requests in the same session.

MCP Resources
These are discoverable via MCP requests (not plain REST):
* __`etherscanv2://guide`__: Markdown guide on choosing tools and pagination strategies.
* __`etherscanv2://api-map`__: JSON map of categories ➜ tool names.

Caching
Responses are cached per-tool with small TTLs (e.g., 5–300s typical, longer for static metadata). If `REDIS_HOST` is set, Redis is used; otherwise, an in-memory fallback cache is used. See `src/tools.ts` for TTLs applied per tool.

Conventions
* Always include __`chainid`__ (EVM chain ID, e.g., 1/Ethereum, 10/Optimism, 42161/Arbitrum, 8453/Base).
* Use __pagination__ for list endpoints: `page` and `offset`. Do not aggregate many pages in a single call.
* For logs, use address/topic filters and `fromBlock`/`toBlock` windows.

Tool Catalog
Below are the tool names, purpose, and concise input schemas (see `src/schemas.ts` for authoritative definitions).

Accounts
* __ethv2_account_balance__ – Get account balance at a tag.
  - Input: `{ chainid: number, address: string, tag?: 'latest'|'earliest'|'pending' }`
* __ethv2_account_txlist__ – Normal txs for an address (paginated).
  - Input: `{ chainid, address, startblock?, endblock?, sort?: 'asc'|'desc', page?, offset? }`
* __ethv2_account_txlistinternal__ – Internal txs for an address (paginated).
  - Input: same as `ethv2_account_txlist`
* __ethv2_account_tokentx__ – ERC-20 transfers for an address (paginated; optional contract filter).
  - Input: `{ chainid, address, contractaddress?, sort?, page?, offset? }`

Blocks & Transactions
* __ethv2_block_by_time__ – Block number nearest to a timestamp.
  - Input: `{ chainid, timestamp: number, closest?: 'before'|'after' }`
* __ethv2_tx_receipt_status__ – Receipt status for a tx hash.
  - Input: `{ chainid, txhash: string }`
* __ethv2_tx_status__ – Transaction status for a tx hash.
  - Input: `{ chainid, txhash: string }`

Contracts
* __ethv2_contract_getabi__ – Verified contract ABI.
  - Input: `{ chainid, address }`
* __ethv2_contract_getsourcecode__ – Verified contract source code.
  - Input: `{ chainid, address }`

Logs
* __ethv2_logs_getLogs__ – Logs by address/topics (paginated; windowed).
  - Input: `{ chainid, address?, fromBlock?, toBlock?, topic0?, topic1?, topic2?, topic3?, page?, offset? }`

Tokens
* __ethv2_token_supply__ – Token supply by contract.
  - Input: `{ chainid, contractaddress }`
* __ethv2_token_balance__ – Token balance for address.
  - Input: `{ chainid, contractaddress, address, tag?: 'latest'|'earliest'|'pending' }`
* __ethv2_token_holderlist__ – Holder list for a token (paginated).
  - Input: `{ chainid, contractaddress, page?, offset? }`
* __ethv2_account_tokennfttx__ – ERC‑721 transfers for address (paginated; optional contract filter).
  - Input: `{ chainid, address, contractaddress?, sort?, page?, offset? }`
* __ethv2_account_token1155tx__ – ERC‑1155 transfers for address (paginated; optional contract filter).
  - Input: `{ chainid, address, contractaddress?, sort?, page?, offset? }`

Gas & Stats
* __ethv2_gas_oracle__ – Gas oracle (base/rapid/safe) per chain.
  - Input: `{ chainid }`
* __ethv2_stats_ethprice__ – ETH price per chain.
  - Input: `{ chainid }`
* __ethv2_stats_ethsupply__ – ETH supply per chain.
  - Input: `{ chainid }`

Proxy (JSON‑RPC)
* __ethv2_proxy_blockNumber__ – `eth_blockNumber`.
  - Input: `{ chainid }`
* __ethv2_proxy_getBlockByNumber__ – `eth_getBlockByNumber`.
  - Input: `{ chainid, tag: string /* hex or 'latest' */, boolean?: boolean /* include tx objects */ }`
* __ethv2_proxy_getTransactionByHash__ – `eth_getTransactionByHash`.
  - Input: `{ chainid, txhash }`

Nametags
* __ethv2_nametag_by_address__ – Address nametag (where supported).
  - Input: `{ chainid, address }`

Natural Language (optional)
* __ethv2_nl_query__ – Lightweight NL router for common intents.
  - Input: `{ chainid: number, query: string }`
  - Notes: looks for simple intents like gas, tx status, balance, logs; otherwise returns guidance.

Examples
List tools (REST):
```bash
curl http://localhost:5009/api/tools | jq
```

Get gas oracle via MCP (stdio example with `node --stdio` requires an MCP client). For a plain HTTP sanity check, you can quickly call the underlying client from a one-off script or use a tailored MCP client.

ESM Note
This project is native ESM (`"type": "module"`). Local imports include explicit `.js` extensions in source so that compiled output in `dist/` runs under Node ESM without resolution errors.

License
MIT
