import crypto from "crypto";
import NodeCache from "node-cache";

let cacheInstance: NodeCache | null = null;

/** Shared in-memory cache for public read endpoints only. */
export function getCacheService(): NodeCache {
  if (!cacheInstance) {
    cacheInstance = new NodeCache({ stdTTL: 60, checkperiod: 30, useClones: false });
  }
  return cacheInstance;
}

export function cacheGet<T>(key: string): T | undefined {
  return getCacheService().get<T>(key);
}

export function cacheSet(key: string, value: unknown, ttlSeconds: number): void {
  getCacheService().set(key, value, ttlSeconds);
}

export function cacheDel(key: string): void {
  getCacheService().del(key);
}

export function cacheDelByPrefix(prefix: string): void {
  const cache = getCacheService();
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.del(key);
  }
}

export function hashQueryKey(input: Record<string, unknown>): string {
  const raw = JSON.stringify(input, Object.keys(input).sort());
  return crypto.createHash("md5").update(raw).digest("hex");
}
