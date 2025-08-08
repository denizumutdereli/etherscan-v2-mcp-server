import type { Tool } from "@modelcontextprotocol/sdk/types.js";
import { EtherscanV2Client } from "./client.js";
import {
    AccountBalanceInput,
    AccountInternalTxListInput,
    AccountTokenTxInput,
    AccountTxListInput,
    asJsonSchema,
    BlockByTimeInput,
    ContractAbiInput,
    ContractSourceCodeInput,
    GasOracleInput,
    LogsInput,
    ProxyBlockNumberInput,
    ProxyGetBlockByNumberInput,
    ProxyGetTxByHashInput,
    Token1155TxInput,
    TokenBalanceInput,
    TokenHolderListInput,
    TokenNftTxInput,
    TokenSupplyInput,
    TxReceiptStatusInput,
    TxStatusInput,
} from "./schemas.js";

import { cache } from "./cache.js";

const defaultClient = new EtherscanV2Client();

export const tools: Tool[] = [
  { name: "ethv2_account_balance", description: "Get account balance by chainid/address/tag.", inputSchema: asJsonSchema(AccountBalanceInput) as any },
  { name: "ethv2_account_txlist", description: "List normal transactions for an address.", inputSchema: asJsonSchema(AccountTxListInput) as any },
  { name: "ethv2_account_txlistinternal", description: "List internal transactions for an address.", inputSchema: asJsonSchema(AccountInternalTxListInput) as any },
  { name: "ethv2_account_tokentx", description: "List ERC-20 token transfers for an address.", inputSchema: asJsonSchema(AccountTokenTxInput) as any },
  { name: "ethv2_block_by_time", description: "Get block number by timestamp.", inputSchema: asJsonSchema(BlockByTimeInput) as any },
  { name: "ethv2_tx_receipt_status", description: "Get receipt status for a tx hash.", inputSchema: asJsonSchema(TxReceiptStatusInput) as any },
  { name: "ethv2_tx_status", description: "Get transaction status for tx hash.", inputSchema: asJsonSchema(TxStatusInput) as any },
  { name: "ethv2_token_supply", description: "Get ERC token supply by contract address.", inputSchema: asJsonSchema(TokenSupplyInput) as any },
  { name: "ethv2_gas_oracle", description: "Get gas oracle (base/rapid/safe) for a chain.", inputSchema: asJsonSchema(GasOracleInput) as any },
  { name: "ethv2_contract_getabi", description: "Get verified contract ABI.", inputSchema: asJsonSchema(ContractAbiInput) as any },
  { name: "ethv2_contract_getsourcecode", description: "Get verified contract source code.", inputSchema: asJsonSchema(ContractSourceCodeInput) as any },
  { name: "ethv2_logs_getLogs", description: "Get logs by address/topics with pagination.", inputSchema: asJsonSchema(LogsInput) as any },
  { name: "ethv2_token_balance", description: "Get token balance for address.", inputSchema: asJsonSchema(TokenBalanceInput) as any },
  { name: "ethv2_account_tokennfttx", description: "Get ERC-721 NFT transfers for address.", inputSchema: asJsonSchema(TokenNftTxInput) as any },
  { name: "ethv2_account_token1155tx", description: "Get ERC-1155 transfers for address.", inputSchema: asJsonSchema(Token1155TxInput) as any },
  { name: "ethv2_token_holderlist", description: "Get token holder list (paginated).", inputSchema: asJsonSchema(TokenHolderListInput) as any },
  { name: "ethv2_proxy_blockNumber", description: "Proxy eth_blockNumber.", inputSchema: asJsonSchema(ProxyBlockNumberInput) as any },
  { name: "ethv2_proxy_getBlockByNumber", description: "Proxy eth_getBlockByNumber.", inputSchema: asJsonSchema(ProxyGetBlockByNumberInput) as any },
  { name: "ethv2_proxy_getTransactionByHash", description: "Proxy eth_getTransactionByHash.", inputSchema: asJsonSchema(ProxyGetTxByHashInput) as any },
  { name: "ethv2_stats_ethprice", description: "Stats: ETH price (per chain).", inputSchema: asJsonSchema(ProxyBlockNumberInput) as any },
  { name: "ethv2_stats_ethsupply", description: "Stats: ETH supply (per chain).", inputSchema: asJsonSchema(ProxyBlockNumberInput) as any },
  { name: "ethv2_nametag_by_address", description: "Get nametag by address (if supported).", inputSchema: asJsonSchema(ContractAbiInput) as any },
  { name: "ethv2_nl_query", description: "Natural language query for Etherscan V2 (plans minimal tool calls).", inputSchema: { type: "object", properties: { query: { type: "string", description: "User question (include chain and constraints)" }, chainid: { type: "number", description: "EVM chain ID" } }, required: ["query", "chainid"] } as any },
];

export function createHandleToolCall(client: EtherscanV2Client) {
  return async function handleToolCall(name: string, args: any) {
    switch (name) {
      case "ethv2_nl_query": {
        const { query, chainid } = args as { query: string; chainid: number };
        // Very light heuristic planner without external calls: route common intents
        const q = String(query).toLowerCase();
        if (q.includes("gas")) {
          return await cache.getOrSetJSON(`ethv2:nl:gas:${chainid}`, 10, () => client.gasOracle(chainid));
        }
        if (q.includes("tx status") || q.includes("status")) {
          const hash = (query.match(/0x[a-fA-F0-9]{64}/)?.[0]) || "";
          if (!hash) return { error: "Provide a transaction hash" } as any;
          return await cache.getOrSetJSON(`ethv2:nl:txstatus:${chainid}:${hash}`, 15, () => client.txReceiptStatus(chainid, hash));
        }
        if (q.includes("balance")) {
          const addr = (query.match(/0x[a-fA-F0-9]{40}/)?.[0]) || "";
          if (!addr) return { error: "Provide an address" } as any;
          return await cache.getOrSetJSON(`ethv2:nl:balance:${chainid}:${addr}`, 15, () => client.accountBalance(chainid, addr));
        }
        if (q.includes("logs")) {
          const addr = (query.match(/0x[a-fA-F0-9]{40}/)?.[0]) || undefined;
          return await cache.getOrSetJSON(`ethv2:nl:logs:${chainid}:${addr ?? ''}`, 15, () => client.getLogs(chainid, { address: addr, page: 1, offset: 100 }));
        }
        return { note: "No direct route. Use specific tools with parameters (address, topics, page/offset)." } as any;
      }
      case "ethv2_account_balance": {
        const input = AccountBalanceInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:balance:${input.chainid}:${input.address}:${input.tag}`, 15, () => client.accountBalance(input.chainid, input.address, input.tag));
      }
      case "ethv2_stats_ethprice": {
        const input = ProxyBlockNumberInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:stats:ethprice:${input.chainid}`, 60, () => client.statsEthPrice(input.chainid));
      }
      case "ethv2_stats_ethsupply": {
        const input = ProxyBlockNumberInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:stats:ethsupply:${input.chainid}`, 300, () => client.statsEthSupply(input.chainid));
      }
      case "ethv2_nametag_by_address": {
        const input = ContractAbiInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:nametag:${input.chainid}:${input.address}`, 3600, () => client.nametagByAddress(input.chainid, input.address));
      }
      case "ethv2_account_txlist": {
        const input = AccountTxListInput.parse(args);
        // paginate via page/offset and do not aggregate large pages
        return await cache.getOrSetJSON(
          `ethv2:txlist:${input.chainid}:${input.address}:${input.startblock ?? ''}:${input.endblock ?? ''}:${input.page}:${input.offset}:${input.sort ?? ''}`,
          15,
          () => client.accountTxList(input.chainid, input.address, input.startblock, input.endblock, input.page, input.offset, input.sort)
        );
      }
      case "ethv2_account_txlistinternal": {
        const input = AccountInternalTxListInput.parse(args);
        return await cache.getOrSetJSON(
          `ethv2:txlistinternal:${input.chainid}:${input.address}:${input.startblock ?? ''}:${input.endblock ?? ''}:${input.page}:${input.offset}:${input.sort ?? ''}`,
          15,
          () => client.accountInternalTxList(input.chainid, input.address, input.startblock, input.endblock, input.page, input.offset, input.sort)
        );
      }
      case "ethv2_account_tokentx": {
        const input = AccountTokenTxInput.parse(args);
        return await cache.getOrSetJSON(
          `ethv2:tokentx:${input.chainid}:${input.address}:${input.contractaddress ?? ''}:${input.page}:${input.offset}:${input.sort ?? ''}`,
          30,
          () => client.accountTokenTx(input.chainid, input.address, input.contractaddress, input.page, input.offset, input.sort)
        );
      }
      case "ethv2_block_by_time": {
        const input = BlockByTimeInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:blocktime:${input.chainid}:${input.timestamp}:${input.closest}`, 300, () => client.getBlockNumberByTime(input.chainid, input.timestamp, input.closest));
      }
      case "ethv2_tx_receipt_status": {
        const input = TxReceiptStatusInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:txstatus:${input.chainid}:${input.txhash}`, 30, () => client.txReceiptStatus(input.chainid, input.txhash));
      }
      case "ethv2_tx_status": {
        const input = TxStatusInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:getstatus:${input.chainid}:${input.txhash}`, 30, () => client.txStatus(input.chainid, input.txhash));
      }
      case "ethv2_token_supply": {
        const input = TokenSupplyInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:tokensupply:${input.chainid}:${input.contractaddress}`, 300, () => client.tokenSupply(input.chainid, input.contractaddress));
      }
      case "ethv2_gas_oracle": {
        const input = GasOracleInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:gasoracle:${input.chainid}`, 10, () => client.gasOracle(input.chainid));
      }
      case "ethv2_token_balance": {
        const input = TokenBalanceInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:tokenbalance:${input.chainid}:${input.contractaddress}:${input.address}:${input.tag}`, 15, () => client.tokenBalance(input.chainid, input.contractaddress, input.address, input.tag));
      }
      case "ethv2_account_tokennfttx": {
        const input = TokenNftTxInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:tokennfttx:${input.chainid}:${input.address}:${input.contractaddress ?? ''}:${input.page ?? ''}:${input.offset ?? ''}:${input.sort ?? ''}`, 30, () => client.tokenNftTx(input.chainid, input.address, input.contractaddress, input.page, input.offset, input.sort));
      }
      case "ethv2_account_token1155tx": {
        const input = Token1155TxInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:token1155tx:${input.chainid}:${input.address}:${input.contractaddress ?? ''}:${input.page ?? ''}:${input.offset ?? ''}:${input.sort ?? ''}`, 30, () => client.token1155Tx(input.chainid, input.address, input.contractaddress, input.page, input.offset, input.sort));
      }
      case "ethv2_token_holderlist": {
        const input = TokenHolderListInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:tokenholderlist:${input.chainid}:${input.contractaddress}:${input.page ?? ''}:${input.offset ?? ''}`, 300, () => client.tokenHolderList(input.chainid, input.contractaddress, input.page, input.offset));
      }
      case "ethv2_proxy_blockNumber": {
        const input = ProxyBlockNumberInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:proxy:blockNumber:${input.chainid}`, 5, () => client.proxyBlockNumber(input.chainid));
      }
      case "ethv2_proxy_getBlockByNumber": {
        const input = ProxyGetBlockByNumberInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:proxy:getBlockByNumber:${input.chainid}:${input.tag}:${input.boolean}`, 5, () => client.proxyGetBlockByNumber(input.chainid, input.tag, input.boolean));
      }
      case "ethv2_proxy_getTransactionByHash": {
        const input = ProxyGetTxByHashInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:proxy:getTxByHash:${input.chainid}:${input.txhash}`, 5, () => client.proxyGetTransactionByHash(input.chainid, input.txhash));
      }
      case "ethv2_contract_getabi": {
        const input = ContractAbiInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:getabi:${input.chainid}:${input.address}`, 86400, () => client.contractGetAbi(input.chainid, input.address));
      }
      case "ethv2_contract_getsourcecode": {
        const input = ContractSourceCodeInput.parse(args);
        return await cache.getOrSetJSON(`ethv2:getsourcecode:${input.chainid}:${input.address}`, 86400, () => client.contractGetSourceCode(input.chainid, input.address));
      }
      case "ethv2_logs_getLogs": {
        const input = LogsInput.parse(args);
        // Enforce pagination via page/offset; do not auto-aggregate logs
        return await cache.getOrSetJSON(
          `ethv2:logs:${input.chainid}:${input.address ?? ''}:${input.fromBlock ?? ''}:${input.toBlock ?? ''}:${input.topic0 ?? ''}:${input.topic1 ?? ''}:${input.topic2 ?? ''}:${input.topic3 ?? ''}:${input.page ?? ''}:${input.offset ?? ''}`,
          15,
          () => client.getLogs(input.chainid, { address: input.address, fromBlock: input.fromBlock, toBlock: input.toBlock, topic0: input.topic0, topic1: input.topic1, topic2: input.topic2, topic3: input.topic3, page: input.page, offset: input.offset })
        );
      }
    }
    throw new Error(`Unknown tool: ${name}`);
  };
}

export const handleToolCall = createHandleToolCall(defaultClient);


