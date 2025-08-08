import axios, { AxiosInstance } from "axios";

export interface EtherscanV2ClientOptions {
  apiBase?: string; // https://api.etherscan.io/v2/api
  apiKey?: string;
}

export class EtherscanV2Client {
  private http: AxiosInstance;
  private apiKey: string | undefined;

  constructor(options?: EtherscanV2ClientOptions) {
    this.http = axios.create({ baseURL: options?.apiBase ?? "https://api.etherscan.io/v2/api" });
    this.apiKey = options?.apiKey ?? process.env.ETHERSCAN_API_KEY;
  }

  private async get<T = any>(params: Record<string, any>): Promise<T> {
    const finalParams = { ...params, apikey: this.apiKey };
    const { data } = await this.http.get("", { params: finalParams });
    return data as T;
  }

  async generic(module: string, action: string, params: Record<string, any>) {
    return this.get({ module, action, ...params });
  }

  // Accounts
  async accountBalance(chainid: number, address: string, tag: string = "latest") {
    return this.get({ chainid, module: "account", action: "balance", address, tag });
  }

  async accountTxList(chainid: number, address: string, startblock?: number, endblock?: number, page?: number, offset?: number, sort?: "asc"|"desc") {
    return this.get({ chainid, module: "account", action: "txlist", address, startblock, endblock, page, offset, sort });
  }

  async accountInternalTxList(chainid: number, address: string, startblock?: number, endblock?: number, page?: number, offset?: number, sort?: "asc"|"desc") {
    return this.get({ chainid, module: "account", action: "txlistinternal", address, startblock, endblock, page, offset, sort });
  }

  async accountTokenTx(chainid: number, address: string, contractaddress?: string, page?: number, offset?: number, sort?: "asc"|"desc") {
    return this.get({ chainid, module: "account", action: "tokentx", address, contractaddress, page, offset, sort });
  }

  // Blocks
  async getBlockNumberByTime(chainid: number, timestamp: number, closest: "before"|"after" = "before") {
    return this.get({ chainid, module: "block", action: "getblocknobytime", timestamp, closest });
  }

  // Transactions
  async txReceiptStatus(chainid: number, txhash: string) {
    return this.get({ chainid, module: "transaction", action: "gettxreceiptstatus", txhash });
  }

  async txStatus(chainid: number, txhash: string) {
    return this.get({ chainid, module: "transaction", action: "getstatus", txhash });
  }

  // Tokens
  async tokenSupply(chainid: number, contractaddress: string) {
    return this.get({ chainid, module: "stats", action: "tokensupply2", contractaddress });
  }
  async tokenBalance(chainid: number, contractaddress: string, address: string, tag: string = "latest") {
    return this.get({ chainid, module: "account", action: "tokenbalance", contractaddress, address, tag });
  }
  async tokenNftTx(chainid: number, address: string, contractaddress?: string, page?: number, offset?: number, sort?: "asc"|"desc") {
    return this.get({ chainid, module: "account", action: "tokennfttx", address, contractaddress, page, offset, sort });
  }
  async token1155Tx(chainid: number, address: string, contractaddress?: string, page?: number, offset?: number, sort?: "asc"|"desc") {
    return this.get({ chainid, module: "account", action: "token1155tx", address, contractaddress, page, offset, sort });
  }
  async tokenHolderList(chainid: number, contractaddress: string, page?: number, offset?: number) {
    return this.get({ chainid, module: "token", action: "tokenholderlist", contractaddress, page, offset });
  }

  // Contracts
  async contractGetAbi(chainid: number, address: string) {
    return this.get({ chainid, module: "contract", action: "getabi", address });
  }
  async contractGetSourceCode(chainid: number, address: string) {
    return this.get({ chainid, module: "contract", action: "getsourcecode", address });
  }

  // Logs
  async getLogs(chainid: number, params: { address?: string; fromBlock?: number; toBlock?: number; topic0?: string; topic1?: string; topic2?: string; topic3?: string; page?: number; offset?: number }) {
    return this.get({ chainid, module: "logs", action: "getLogs", ...params });
  }

  // Proxy
  async proxyBlockNumber(chainid: number) { return this.get({ chainid, module: "proxy", action: "eth_blockNumber" }); }
  async proxyGetBlockByNumber(chainid: number, tag: string, boolean: boolean) { return this.get({ chainid, module: "proxy", action: "eth_getBlockByNumber", tag, boolean }); }
  async proxyGetTransactionByHash(chainid: number, txhash: string) { return this.get({ chainid, module: "proxy", action: "eth_getTransactionByHash", txhash }); }

  // Stats (where available)
  async statsEthPrice(chainid: number) { return this.get({ chainid, module: "stats", action: "ethprice" }); }
  async statsEthSupply(chainid: number) { return this.get({ chainid, module: "stats", action: "ethsupply" }); }

  // Nametags (fallback to generic if action differs by chain)
  async nametagByAddress(chainid: number, address: string) { return this.get({ chainid, module: "nametags", action: "getaddressnametag", address }); }

  // Gas Tracker
  async gasOracle(chainid: number) {
    return this.get({ chainid, module: "gastracker", action: "gasoracle" });
  }
}


