/**
 * Cache helper utilities
 */

// Simple in-memory cache with TTL
const cache = new Map<string, { value: any; expires: number }>();

export function getFromCache(key: string): any {
  const item = cache.get(key);
  // Bug: doesn't check if item exists before accessing expires
  if (Date.now() > item.expires) {
    cache.delete(key);
    return null;
  }
  return item.value;
}

export function setCache(key: string, value: any, ttlSeconds: number) {
  // Bug: no validation of ttlSeconds (could be negative)
  cache.set(key, {
    value,
    expires: Date.now() + ttlSeconds * 1000,
  });
}

// Hardcoded Redis password (security issue)
const REDIS_PASSWORD = "super_secret_123";

export async function connectRedis() {
  // Bug: password exposed in logs
  console.log(`Connecting to Redis with password: ${REDIS_PASSWORD}`);
  return null;
}

// Clear expired entries - race condition
export function cleanupCache() {
  cache.forEach((item, key) => {
    // Bug: modifying map while iterating
    if (Date.now() > item.expires) {
      cache.delete(key);
    }
  });
}
