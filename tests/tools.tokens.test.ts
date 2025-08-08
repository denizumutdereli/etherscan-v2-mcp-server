import { createHandleToolCall } from "../src/tools";

class MockClient {
  tokenSupply = jest.fn();
  tokenBalance = jest.fn();
  tokenHolderList = jest.fn();
  tokenNftTx = jest.fn();
  token1155Tx = jest.fn();
}

describe("Etherscan V2 Tokens tools", () => {
  const client = new MockClient() as any;
  const handle = createHandleToolCall(client);

  test("token supply routes correctly", async () => {
    client.tokenSupply.mockResolvedValue({ status: "1", result: "1000000" });
    const res = await handle("ethv2_token_supply", { chainid: 1, contractaddress: "0xToken" });
    expect(res.result).toBe("1000000");
  });

  test("token balance routes correctly", async () => {
    client.tokenBalance.mockResolvedValue({ status: "1", result: "42" });
    const res = await handle("ethv2_token_balance", { chainid: 1, contractaddress: "0xToken", address: "0xUser", tag: "latest" });
    expect(res.result).toBe("42");
  });

  test("holders list uses pagination", async () => {
    client.tokenHolderList.mockResolvedValue({ status: "1", result: [] });
    await handle("ethv2_token_holderlist", { chainid: 1, contractaddress: "0xToken", page: 1, offset: 100 });
    expect(client.tokenHolderList).toHaveBeenCalledWith(1, "0xToken", 1, 100);
  });
});


