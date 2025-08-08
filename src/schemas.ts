import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";

export const asJsonSchema = (schema: z.ZodTypeAny) => zodToJsonSchema(schema, { $refStrategy: "none" });

export const Pagination = z.object({
  page: z.number().int().min(1).default(1).describe("Page number (1-based)."),
  offset: z.number().int().min(1).max(10000).default(100).describe("Items per page (1-10000)."),
});

export const ChainId = z.number().int().describe("EVM chain ID supported by Etherscan V2 (e.g., 1, 10, 42161, 8453). ");

export const AccountBalanceInput = z.object({
  chainid: ChainId,
  address: z.string().min(3).describe("Account address (0x...)."),
  tag: z.enum(["latest", "earliest", "pending"]).default("latest").describe("Block tag to query against."),
});

export const AccountTxListInput = z.object({
  chainid: ChainId,
  address: z.string().min(3).describe("Account address (0x...)."),
  startblock: z.number().int().optional().describe("Start block (inclusive)."),
  endblock: z.number().int().optional().describe("End block (inclusive)."),
  sort: z.enum(["asc", "desc"]).optional().describe("Sort order by block number."),
}).merge(Pagination);

export const AccountInternalTxListInput = AccountTxListInput;
export const AccountTokenTxInput = z.object({
  chainid: ChainId,
  address: z.string().min(3).describe("Account address (0x...)."),
  contractaddress: z.string().optional().describe("Optional token contract to filter (0x...)."),
  sort: z.enum(["asc", "desc"]).optional().describe("Sort order by block number."),
}).merge(Pagination);

export const BlockByTimeInput = z.object({
  chainid: ChainId,
  timestamp: z.number().int().describe("UNIX timestamp (seconds)."),
  closest: z.enum(["before", "after"]).default("before").describe("Whether to pick the nearest block before/after timestamp."),
});

export const TxReceiptStatusInput = z.object({ chainid: ChainId, txhash: z.string().min(3).describe("Transaction hash (0x...).") });
export const TxStatusInput = TxReceiptStatusInput;

export const TokenSupplyInput = z.object({ chainid: ChainId, contractaddress: z.string().min(3).describe("Token contract (0x...).") });

export const ContractAbiInput = z.object({ chainid: ChainId, address: z.string().min(3).describe("Contract address (0x...).") });
export const ContractSourceCodeInput = ContractAbiInput;

export const LogsInput = z.object({
  chainid: ChainId,
  address: z.string().optional().describe("Contract address (0x...)."),
  fromBlock: z.number().int().optional().describe("Start block (inclusive)."),
  toBlock: z.number().int().optional().describe("End block (inclusive)."),
  topic0: z.string().optional().describe("Topic 0 (hex)."),
  topic1: z.string().optional().describe("Topic 1 (hex)."),
  topic2: z.string().optional().describe("Topic 2 (hex)."),
  topic3: z.string().optional().describe("Topic 3 (hex)."),
  page: z.number().int().optional().describe("Page number (1-based)."),
  offset: z.number().int().optional().describe("Items per page."),
});

export const GasOracleInput = z.object({ chainid: ChainId });

// Tokens/balances
export const TokenBalanceInput = z.object({
  chainid: ChainId,
  contractaddress: z.string().min(3).describe("Token contract address (0x...)."),
  address: z.string().min(3).describe("Account address (0x...)."),
  tag: z.enum(["latest", "earliest", "pending"]).default("latest").describe("Block tag."),
});

export const TokenNftTxInput = z.object({
  chainid: ChainId,
  address: z.string().min(3).describe("Account address (0x...)."),
  contractaddress: z.string().optional().describe("Optional NFT contract (0x...)."),
  sort: z.enum(["asc", "desc"]).optional().describe("Sort order by block number."),
}).merge(Pagination);

export const Token1155TxInput = TokenNftTxInput;

export const TokenHolderListInput = z.object({
  chainid: ChainId,
  contractaddress: z.string().min(3).describe("Token contract address (0x...)."),
}).merge(Pagination);

// Proxy (JSON-RPC)
export const ProxyBlockNumberInput = z.object({ chainid: ChainId });
export const ProxyGetBlockByNumberInput = z.object({ chainid: ChainId, tag: z.string().describe("Block tag hex (e.g., 0xA) or 'latest'"), boolean: z.boolean().default(false).describe("If true, include full tx objects.") });
export const ProxyGetTxByHashInput = z.object({ chainid: ChainId, txhash: z.string().min(3).describe("Transaction hash (0x...).") });

// Stats
export const StatsEthPriceInput = z.object({ chainid: ChainId });
export const StatsEthSupplyInput = z.object({ chainid: ChainId });

// Nametags (if supported)
export const NametagByAddressInput = z.object({ chainid: ChainId, address: z.string().min(3).describe("Account address (0x...).") });

// Generic (catch-all)
export const GenericInput = z.object({
  chainid: ChainId,
  module: z.string().min(3),
  action: z.string().min(2),
  params: z.record(z.union([z.string(), z.number(), z.boolean()])).default({}).describe("Additional query parameters supported by the endpoint. Use page/offset for pagination."),
  cacheTtl: z.number().int().min(1).max(86400).default(30).describe("Cache TTL seconds (bounded)."),
});


