// app/lib/kv-cache.server.ts
// 32 CONCEPT STORE — Cache helper Redis (Vercel Marketplace)

let redisClient: any = null;
let redisAvailable: boolean | null = null;
let connectPromise: Promise<any> | null = null;

async function getRedis() {
  if (redisAvailable === false) return null;
  if (redisClient && redisClient.isReady) return redisClient;
  if (connectPromise) return connectPromise;

  connectPromise = (async () => {
    try {
      const url = process.env.REDIS_URL || process.env.KV_URL;
      if (!url) {
        redisAvailable = false;
        console.warn("[redis] No REDIS_URL configured");
        return null;
      }
      const mod = await import("redis");
      const client = mod.createClient({ url });
      client.on("error", (err: any) => console.error("[redis] error:", err?.message));
      await client.connect();
      redisClient = client;
      redisAvailable = true;
      console.log("[redis] connected");
      return client;
    } catch (e) {
      console.warn("[redis] connect error:", (e as Error).message);
      redisAvailable = false;
      return null;
    } finally {
      connectPromise = null;
    }
  })();

  return connectPromise;
}

export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const r = await getRedis();
  if (!r) return null;
  try {
    const v = await r.get(key);
    if (v == null) return null;
    if (typeof v === "string") {
      try { return JSON.parse(v) as T; } catch { return v as any; }
    }
    return v as T;
  } catch (e) {
    console.warn("[redis] get error:", (e as Error).message);
    return null;
  }
}

export async function cacheSet(key: string, value: any, ttlSeconds: number): Promise<void> {
  const r = await getRedis();
  if (!r) return;
  try {
    const str = typeof value === "string" ? value : JSON.stringify(value);
    await r.set(key, str, { EX: ttlSeconds });
  } catch (e) {
    console.warn("[redis] set error:", (e as Error).message);
  }
}

export function hashKey(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h << 5) - h + s.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h).toString(36);
}

const RANDOM_SAMPLE_KEY = "gf:random-sample:v1";
const RANDOM_SAMPLE_TTL = 60 * 60 * 6;

export async function getCachedRandomSample(fetcher: () => Promise<any[]>): Promise<any[]> {
  const cached = await cacheGet<any[]>(RANDOM_SAMPLE_KEY);
  if (cached && Array.isArray(cached) && cached.length > 0) return cached;
  const fresh = await fetcher();
  await cacheSet(RANDOM_SAMPLE_KEY, fresh, RANDOM_SAMPLE_TTL);
  return fresh;
}

const COLLECTION_PICKS_TTL = 60 * 60 * 6;

export async function getCachedCollectionPicks<T>(collectionHandle: string, fetcher: () => Promise<T>): Promise<T> {
  const key = "gf:collection-picks:" + collectionHandle + ":v1";
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const fresh = await fetcher();
  await cacheSet(key, fresh, COLLECTION_PICKS_TTL);
  return fresh;
}

const SEARCH_CACHE_TTL = 60 * 60;

export async function getCachedSearch<T>(searchKey: string, fetcher: () => Promise<T>): Promise<T> {
  const key = "gf:search:" + hashKey(searchKey) + ":v1";
  const cached = await cacheGet<T>(key);
  if (cached) return cached;
  const fresh = await fetcher();
  await cacheSet(key, fresh, SEARCH_CACHE_TTL);
  return fresh;
}
