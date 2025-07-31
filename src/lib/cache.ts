// lib/cache.ts

const cache = new Map<string, { timestamp: number; data: any }>();
const DEFAULT_CACHE_DURATION = 10 * 60_000; // 10 dakika

export const getCache = (key: string, duration = DEFAULT_CACHE_DURATION) => {
  const item = cache.get(key);
  if (item && Date.now() - item.timestamp <= duration) {
    return item.data;
  }
  return null;
};

export const setCache = (key: string, data: any) => {
  cache.set(key, {
    timestamp: Date.now(),
    data,
  });
};
