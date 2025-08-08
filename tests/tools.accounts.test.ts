import { createHandleToolCall } from "../src/tools";

class MockClient {
  accountBalance = jest.fn();
  accountTxList = jest.fn();
  accountInternalTxList = jest.fn();
  accountTokenTx = jest.fn();
}

describe("Etherscan V2 Accounts tools", () => {
  const client = new MockClient() as any;
  const handle = createHandleToolCall(client);

  test("account balance caches per tag", async () => {
    client.accountBalance.mockResolvedValue({ status: "1", result: "100" });
    const res = await handle("ethv2_account_balance", { chainid: 1, address: "0xabc", tag: "latest" });
    expect(res.result).toBe("100");
  });

  test("txlist includes pagination params", async () => {
    client.accountTxList.mockResolvedValue({ status: "1", result: [] });
    await handle("ethv2_account_txlist", { chainid: 1, address: "0xabc", page: 1, offset: 100, sort: "asc" });
    expect(client.accountTxList).toHaveBeenCalledWith(1, "0xabc", undefined, undefined, 1, 100, "asc");
  });
});


