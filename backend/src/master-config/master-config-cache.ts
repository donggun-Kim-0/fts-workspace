import { MasterConfig } from '@prisma/client';

const DEFAULT_TTL_MS = 60_000;

type CacheEntry<T> = {
  data: T;
  expiresAt: number;
};

export class MasterConfigCache {
  private readonly store = new Map<string, CacheEntry<unknown>>();
  private readonly ttlMs: number;

  constructor(ttlMs = DEFAULT_TTL_MS) {
    this.ttlMs = ttlMs;
  }

  get<T>(key: string): T | null {
    const entry = this.store.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.store.delete(key);
      return null;
    }
    return entry.data as T;
  }

  set<T>(key: string, data: T): void {
    this.store.set(key, {
      data,
      expiresAt: Date.now() + this.ttlMs,
    });
  }

  invalidateAll(): void {
    this.store.clear();
  }

  cacheKey(category: string | undefined, activeOnly: boolean): string {
    return `list:${category ?? 'ALL'}:${activeOnly ? 'active' : 'all'}`;
  }

  formOptionsKey(): string {
    return 'form-options:v1';
  }
}

export type CachedMasterConfigList = MasterConfig[];
