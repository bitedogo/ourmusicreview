/** TTL 메모리 캐시 */

export interface TtlCache<T> {
  get(key: string): T | undefined;
  set(key: string, value: T): void;
  clear(): void;
  readonly size: number;
}

export function createTtlCache<T>(ttlMs: number, maxEntries = 500): TtlCache<T> {
  if (ttlMs <= 0 || maxEntries <= 0) {
    throw new Error("ttlMs와 maxEntries는 0보다 커야 합니다.");
  }
  const store = new Map<string, { value: T; expiresAt: number }>();

  return {
    get(key) {
      const entry = store.get(key);
      if (!entry) return undefined;
      if (entry.expiresAt < Date.now()) {
        store.delete(key);
        return undefined;
      }
      store.delete(key);
      store.set(key, entry);
      return entry.value;
    },
    set(key, value) {
      store.delete(key);
      store.set(key, { value, expiresAt: Date.now() + ttlMs });
      while (store.size > maxEntries) {
        const oldestKey = store.keys().next().value as string | undefined;
        if (oldestKey === undefined) break;
        store.delete(oldestKey);
      }
    },
    clear() {
      store.clear();
    },
    get size() {
      return store.size;
    },
  };
}
