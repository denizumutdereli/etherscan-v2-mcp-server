import { createClient, RedisClientType } from "redis";

type JsonValue = any;

class InMemoryCache {
  private store = new Map<string, { exp: number; val: JsonValue }>();
  async get(key: string) { const e = this.store.get(key); if (!e) return null; if (Date.now() > e.exp) { this.store.delete(key); return null; } return e.val; }
  async set(key: string, val: JsonValue, ttl: number) { this.store.set(key, { exp: Date.now() + ttl * 1000, val }); }
}

export class Cache {
  private redis: RedisClientType | null = null;
  private memory = new InMemoryCache();
  private ready = false;
  async init() {
    if (this.ready) return;
    try {
      const host = process.env.REDIS_HOST; const port = process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT, 10) : undefined; const password = process.env.REDIS_PASSWORD;
      if (host) { this.redis = createClient({ socket: { host, port }, password }); this.redis.on("error", () => {}); await this.redis.connect(); }
    } catch { this.redis = null; } finally { this.ready = true; }
  }
  private async getRedis(key: string) { if (!this.redis) return null; try { const raw = await this.redis.get(key); return raw ? JSON.parse(raw) : null; } catch { return null; } }
  private async setRedis(key: string, val: JsonValue, ttl: number) { if (!this.redis) return; try { await this.redis.setEx(key, ttl, JSON.stringify(val)); } catch {} }
  async getOrSetJSON<T = JsonValue>(key: string, ttl: number, fetcher: () => Promise<T>): Promise<T> { await this.init(); const c = (await this.getRedis(key)) ?? (await this.memory.get(key)); if (c) return c as T; const v = await fetcher(); await this.setRedis(key, v, ttl); await this.memory.set(key, v, ttl); return v; }
}

export const cache = new Cache();


