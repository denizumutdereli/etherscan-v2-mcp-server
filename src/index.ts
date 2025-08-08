import cors from "@fastify/cors";
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { StreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/streamableHttp.js";
import { CallToolRequestSchema, GetPromptRequestSchema, ListPromptsRequestSchema, ListResourcesRequestSchema, ListToolsRequestSchema, ReadResourceRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import "dotenv/config";
import Fastify from "fastify";
import { randomUUID } from "node:crypto";
import { resources } from "./resources.js";
import { handleToolCall, tools } from "./tools.js";

class EtherscanV2MCPServer {
  private server: Server;
  private fastify: any;
  private transports: Record<string, StreamableHTTPServerTransport> = {};

  constructor() {
    this.server = new Server({ name: "etherscan-v2-mcp", version: "1.0.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });
    this.fastify = Fastify({ logger: { level: process.env.NODE_ENV === "production" ? "info" : "debug" } });

    this.setupToolHandlers();
    this.setupFastifyRoutes();
  }

  private setupToolHandlers() {
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
    this.server.setRequestHandler(ListResourcesRequestSchema, async () => ({ resources: resources.map(r => ({ uri: r.uri, name: r.name, description: r.description, mimeType: r.mimeType })) } as any));
    this.server.setRequestHandler(ReadResourceRequestSchema, async (req: any) => {
      const r = resources.find(x => x.uri === req.params?.uri);
      if (!r) return { contents: [], isError: true } as any;
      return { contents: [{ uri: r.uri, mimeType: r.mimeType, text: r.text }] } as any;
    });
    const promptName = "etherscan_v2_assistant";
    const promptDescription = "Guide for selecting and calling Etherscan V2 tools (pagination, filtering).";
    this.server.setRequestHandler(ListPromptsRequestSchema, async () => ({ prompts: [{ name: promptName, description: promptDescription }] } as any));
    this.server.setRequestHandler(GetPromptRequestSchema, async (request) => {
      if (request.params.name !== promptName) return { prompt: [] } as any;
      const system = [
        "You are an Etherscan V2 assistant for tool selection.",
        "- Always include chainid.",
        "- Use page/offset and small time windows (logs).",
        "- Never aggregate many pages; keep responses small.",
      ].join("\n");
      return { prompt: [{ role: "system", content: [{ type: "text", text: system }] }] } as any;
    });
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;
      try {
        const result = await handleToolCall(name, args);
        return { content: [{ type: "text", text: JSON.stringify(result) }] };
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
      }
    });
  }

  private setupFastifyRoutes() {
    this.fastify.register(cors, { origin: true, methods: ["GET", "POST", "OPTIONS"], allowedHeaders: ["Content-Type", "Authorization"] });
    this.fastify.get("/health", async () => ({ status: "ok", service: "etherscan-v2-mcp-server", timestamp: new Date().toISOString(), version: "1.0.0" }));
    this.fastify.get("/api/tools", async () => ({ tools }));
    this.fastify.all("/mcp", async (request: any, reply: any) => {
      try {
        const sessionIdHeader = request.headers["mcp-session-id"] as string | undefined;
        let transport: StreamableHTTPServerTransport | undefined;
        if (sessionIdHeader && this.transports[sessionIdHeader]) {
          transport = this.transports[sessionIdHeader];
        } else if (!sessionIdHeader && request.method === "POST") {
          transport = new StreamableHTTPServerTransport({
            sessionIdGenerator: () => randomUUID(),
            onsessioninitialized: (sid: string) => {
              this.transports[sid] = transport!;
              transport!.onclose = () => { if (sid) delete this.transports[sid]; };
            },
          });
          const sessionServer = new Server({ name: "etherscan-v2-mcp", version: "1.0.0" }, { capabilities: { tools: {}, resources: {}, prompts: {} } });
          sessionServer.setRequestHandler(ListToolsRequestSchema, async () => ({ tools }));
          sessionServer.setRequestHandler(CallToolRequestSchema, async (req) => {
            const { name, arguments: args } = req.params;
            try {
              const result = await handleToolCall(name, args);
              return { content: [{ type: "text", text: JSON.stringify(result) }] };
            } catch (error) {
              const message = error instanceof Error ? error.message : String(error);
              return { content: [{ type: "text", text: `Error: ${message}` }], isError: true };
            }
          });
          await sessionServer.connect(transport);
        } else if (request.method === "GET" && !sessionIdHeader) {
          reply.status(405).send({ jsonrpc: "2.0", error: { code: -32000, message: "Method Not Allowed: initialize the session with POST first." }, id: null });
          return;
        } else {
          reply.status(400).send({ jsonrpc: "2.0", error: { code: -32000, message: "Bad Request: No valid session ID provided" }, id: null });
          return;
        }
        reply.hijack();
        await transport.handleRequest(request.raw, reply.raw, request.body);
      } catch (error) {
        try {
          reply.raw.writeHead(500, { "Content-Type": "application/json" });
          reply.raw.end(JSON.stringify({ error: "Failed to handle MCP request" }));
        } catch {}
      }
    });
  }

  async runStdio() { const transport = new StdioServerTransport(); await this.server.connect(transport); console.error("Etherscan V2 MCP server running on stdio"); }
  async runHTTP() {
    const port = parseInt(process.env.PORT || "5009");
    const host = process.env.HOST || "0.0.0.0";
    await this.fastify.listen({ port, host });
    console.log(`🚀 Etherscan V2 MCP server running on http://${host}:${port}`);
  }
  async run() { if (process.argv.includes("--stdio")) await this.runStdio(); else await this.runHTTP(); }
}

const server = new EtherscanV2MCPServer();
server.run().catch((err) => { console.error("Server failed to start:", err); process.exit(1); });


