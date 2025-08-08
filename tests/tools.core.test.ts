import { createHandleToolCall } from "../src/tools";

class MockClient {
  getBlockNumberByTime = jest.fn();
  txReceiptStatus = jest.fn();
  gasOracle = jest.fn();
  getLogs = jest.fn();
}

describe("Etherscan V2 Core tools", () => {
  const client = new MockClient() as any;
  const handle = createHandleToolCall(client);

  test("block by time routes params", async () => {
    client.getBlockNumberByTime.mockResolvedValue({ status: "1", result: "0xabc" });
    await handle("ethv2_block_by_time", { chainid: 1, timestamp: 1700000000, closest: "before" });
    expect(client.getBlockNumberByTime).toHaveBeenCalledWith(1, 1700000000, "before");
  });

  test("logs enforces pagination (no aggregation)", async () => {
    client.getLogs.mockResolvedValue({ status: "1", result: [] });
    await handle("ethv2_logs_getLogs", { chainid: 1, address: "0xabc", page: 1, offset: 100 });
    expect(client.getLogs).toHaveBeenCalled();
  });
});


