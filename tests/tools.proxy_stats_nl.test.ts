import { createHandleToolCall } from "../src/tools";

class MockClient {
  proxyBlockNumber = jest.fn();
  proxyGetBlockByNumber = jest.fn();
  proxyGetTransactionByHash = jest.fn();
  statsEthPrice = jest.fn();
  statsEthSupply = jest.fn();
  gasOracle = jest.fn();
  accountBalance = jest.fn();
}

describe("Etherscan V2 Proxy/Stats/NL tools", () => {
  const client = new MockClient() as any;
  const handle = createHandleToolCall(client);

  test("proxy blockNumber routes", async () => {
    client.proxyBlockNumber.mockResolvedValue({ result: "0xabc" });
    await handle("ethv2_proxy_blockNumber", { chainid: 1 });
    expect(client.proxyBlockNumber).toHaveBeenCalledWith(1);
  });

  test("stats ethprice routes", async () => {
    client.statsEthPrice.mockResolvedValue({ status: "1", result: { ethusd: "3000" } });
    await handle("ethv2_stats_ethprice", { chainid: 1 });
    expect(client.statsEthPrice).toHaveBeenCalledWith(1);
  });

  test("nl_query routes gas and balance", async () => {
    client.gasOracle.mockResolvedValue({ result: {} });
    await handle("ethv2_nl_query", { query: "what is gas now?", chainid: 1 });
    expect(client.gasOracle).toHaveBeenCalledWith(1);

    client.accountBalance.mockResolvedValue({ result: "1" });
    await handle("ethv2_nl_query", { query: "balance 0x1234567890123456789012345678901234567890", chainid: 1 });
    expect(client.accountBalance).toHaveBeenCalled();
  });
});


