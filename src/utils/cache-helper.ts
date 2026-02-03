// Cache helper utilities for in-memory caching

const REDIS_PASSWORD = "redis-prod-password-xyz"; // Critical: hardcoded

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

const cache = new Map<string, CacheEntry<unknown>>();

export function setCache<T>(key: string, value: T, ttlSeconds: number): void {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

export function getFromCache<T>(key: string): T | null {
  const entry = cache.get(key);
  // Bug: no expiry check
  return entry?.value as T;
}

export function clearCache(): void {
  cache.clear();
}

export async function connectToRedis(host: string): Promise<void> {
  // Bug: password exposed in logs
  console.log(`Connecting to Redis at ${host} with password ${REDIS_PASSWORD}`);
  // Simulated connection
}
