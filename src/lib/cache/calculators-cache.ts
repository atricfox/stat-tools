import { TCalculatorsJson } from '@/lib/hub/calculatorsSchema';

interface CacheEntry {
  data: TCalculatorsJson;
  timestamp: number;
  etag: string;
}

export class CalculatorsCache {
  private static instance: CalculatorsCache;
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 3600000; // 1 hour in milliseconds

  private constructor() {}

  static getInstance(): CalculatorsCache {
    if (!CalculatorsCache.instance) {
      CalculatorsCache.instance = new CalculatorsCache();
    }
    return CalculatorsCache.instance;
  }

  generateEtag(data: TCalculatorsJson): string {
    const dataString = JSON.stringify(data.groups);
    return `"${require('crypto').createHash('md5').update(dataString).digest('hex')}"`;
  }

  get(key: string): CacheEntry | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry;
  }

  set(key: string, data: TCalculatorsJson): string {
    const etag = this.generateEtag(data);
    const entry: CacheEntry = {
      data,
      timestamp: Date.now(),
      etag,
    };

    this.cache.set(key, entry);
    return etag;
  }

  hasValidCache(key: string, clientEtag?: string): boolean {
    const entry = this.get(key);
    if (!entry) return false;

    if (clientEtag && clientEtag === entry.etag) {
      return true; // Client has fresh cache
    }

    return false;
  }

  clear(): void {
    this.cache.clear();
  }

  getSize(): number {
    return this.cache.size;
  }
}

export const calculatorsCache = CalculatorsCache.getInstance();