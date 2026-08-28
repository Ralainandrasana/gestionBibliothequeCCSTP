const tableCache = new Map();

const CACHE_RETENTION_MS = 5 * 60 * 1000;
const CACHE_FRESH_MS = 30 * 1000;
const MAX_CACHE_ENTRIES = 40;

export function createTableCacheKey(endpoint, params) {
  return JSON.stringify([endpoint, params]);
}

export function getTableCache(key) {
  const entry = tableCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.createdAt > CACHE_RETENTION_MS) {
    tableCache.delete(key);
    return null;
  }
  return entry;
}

export function isTableCacheFresh(entry) {
  return Boolean(entry) && Date.now() - entry.createdAt <= CACHE_FRESH_MS;
}

export function setTableCache(key, value) {
  tableCache.delete(key);
  tableCache.set(key, { ...value, createdAt: Date.now() });

  while (tableCache.size > MAX_CACHE_ENTRIES) {
    tableCache.delete(tableCache.keys().next().value);
  }
}

export function invalidateTableCache(endpoint) {
  for (const key of tableCache.keys()) {
    if (!endpoint || key.startsWith(`["${endpoint}",`)) tableCache.delete(key);
  }
}

export function clearTableCache() {
  tableCache.clear();
}
