/**
 * Performance cache system for statistical calculations
 * Implements intelligent caching with memory management and performance monitoring
 */

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  accessCount: number;
  lastAccessed: number;
  computationTime: number;
  size: number; // Memory size estimate
}

export interface CacheStats {
  hits: number;
  misses: number;
  totalRequests: number;
  hitRate: number;
  memoryUsage: number;
  entryCount: number;
  averageAccessTime: number;
}

export interface CacheConfig {
  maxSize: number; // Maximum memory size in bytes
  maxEntries: number; // Maximum number of entries
  ttl: number; // Time to live in milliseconds
  cleanupInterval: number; // Cleanup interval in milliseconds
  compressionThreshold: number; // Compress entries larger than this
}

export class PerformanceCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    totalRequests: 0,
    hitRate: 0,
    memoryUsage: 0,
    entryCount: 0,
    averageAccessTime: 0
  };
  
  private config: CacheConfig;
  private cleanupTimer?: NodeJS.Timeout;
  private performanceObserver?: PerformanceObserver;
  
  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      maxSize: 50 * 1024 * 1024, // 50MB default
      maxEntries: 1000,
      ttl: 30 * 60 * 1000, // 30 minutes
      cleanupInterval: 5 * 60 * 1000, // 5 minutes
      compressionThreshold: 10 * 1024, // 10KB
      ...config
    };
    
    this.startCleanupTimer();
    this.initPerformanceMonitoring();
  }

  /**
   * Get cached value or compute if not exists
   */
  async getOrCompute<R extends T>(
    key: string, 
    computeFn: () => Promise<R> | R,
    options: { ttl?: number; priority?: 'low' | 'normal' | 'high' } = {}
  ): Promise<R> {
    const startTime = performance.now();
    this.stats.totalRequests++;

    // Check cache first
    const cached = this.get(key);
    if (cached !== null) {
      this.stats.hits++;
      this.updateHitRate();
      return cached as R;
    }

    // Cache miss - compute value
    this.stats.misses++;
    const computeStartTime = performance.now();
    
    try {
      const result = await computeFn();
      const computeEndTime = performance.now();
      const computationTime = computeEndTime - computeStartTime;
      
      // Store in cache
      this.set(key, result, { 
        ttl: options.ttl, 
        computationTime,
        priority: options.priority || 'normal'
      });
      
      this.updateHitRate();
      return result;
    } catch (error) {
      this.stats.misses--;
      throw error;
    }
  }

  /**
   * Get value from cache
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }
    
    // Check TTL
    if (this.isExpired(entry)) {
      this.cache.delete(key);
      this.updateMemoryUsage();
      return null;
    }
    
    // Update access statistics
    entry.lastAccessed = Date.now();
    entry.accessCount++;
    
    return entry.data;
  }

  /**
   * Set value in cache
   */
  set(
    key: string, 
    data: T, 
    options: { 
      ttl?: number; 
      computationTime?: number; 
      priority?: 'low' | 'normal' | 'high' 
    } = {}
  ): void {
    const now = Date.now();
    const size = this.estimateSize(data);
    
    const entry: CacheEntry<T> = {
      data,
      timestamp: now,
      accessCount: 1,
      lastAccessed: now,
      computationTime: options.computationTime || 0,
      size
    };

    // Check if we need to make space
    this.ensureCapacity(size);
    
    this.cache.set(key, entry);
    this.updateMemoryUsage();
    this.stats.entryCount = this.cache.size;
  }

  /**
   * Remove entry from cache
   */
  delete(key: string): boolean {
    const result = this.cache.delete(key);
    if (result) {
      this.updateMemoryUsage();
      this.stats.entryCount = this.cache.size;
    }
    return result;
  }

  /**
   * Clear entire cache
   */
  clear(): void {
    this.cache.clear();
    this.stats.memoryUsage = 0;
    this.stats.entryCount = 0;
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * Get cache configuration
   */
  getConfig(): CacheConfig {
    return { ...this.config };
  }

  /**
   * Update cache configuration
   */
  updateConfig(newConfig: Partial<CacheConfig>): void {
    this.config = { ...this.config, ...newConfig };
    
    // Restart cleanup timer if interval changed
    if (newConfig.cleanupInterval) {
      this.stopCleanupTimer();
      this.startCleanupTimer();
    }
  }

  /**
   * Force cleanup of expired entries
   */
  cleanup(): number {
    const startSize = this.cache.size;
    const now = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (this.isExpired(entry)) {
        this.cache.delete(key);
      }
    }
    
    this.updateMemoryUsage();
    this.stats.entryCount = this.cache.size;
    
    return startSize - this.cache.size;
  }

  /**
   * Get top accessed entries
   */
  getTopEntries(limit: number = 10): Array<{key: string; accessCount: number; size: number}> {
    return Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, accessCount: entry.accessCount, size: entry.size }))
      .sort((a, b) => b.accessCount - a.accessCount)
      .slice(0, limit);
  }

  /**
   * Export cache data for analysis
   */
  exportCacheData(): {
    entries: Array<{key: string; entry: CacheEntry<T>}>;
    stats: CacheStats;
    config: CacheConfig;
  } {
    return {
      entries: Array.from(this.cache.entries()).map(([key, entry]) => ({ key, entry })),
      stats: this.getStats(),
      config: this.getConfig()
    };
  }

  // Private methods

  private isExpired(entry: CacheEntry<T>): boolean {
    return Date.now() - entry.timestamp > this.config.ttl;
  }

  private estimateSize(data: T): number {
    try {
      // Rough estimation based on JSON serialization
      const jsonString = JSON.stringify(data);
      return new Blob([jsonString]).size;
    } catch {
      // Fallback for non-serializable data
      return 1024; // 1KB default
    }
  }

  private ensureCapacity(newEntrySize: number): void {
    // Check entry count limit
    while (this.cache.size >= this.config.maxEntries) {
      this.evictLeastRecentlyUsed();
    }
    
    // Check memory limit
    while (this.stats.memoryUsage + newEntrySize > this.config.maxSize) {
      this.evictLeastRecentlyUsed();
    }
  }

  private evictLeastRecentlyUsed(): void {
    if (this.cache.size === 0) return;
    
    let oldestKey: string | null = null;
    let oldestTime = Date.now();
    
    for (const [key, entry] of this.cache.entries()) {
      if (entry.lastAccessed < oldestTime) {
        oldestTime = entry.lastAccessed;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  private updateMemoryUsage(): void {
    this.stats.memoryUsage = Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private updateHitRate(): void {
    this.stats.hitRate = this.stats.totalRequests > 0 
      ? (this.stats.hits / this.stats.totalRequests) * 100 
      : 0;
  }

  private startCleanupTimer(): void {
    this.cleanupTimer = setInterval(() => {
      this.cleanup();
    }, this.config.cleanupInterval);
  }

  private stopCleanupTimer(): void {
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
      this.cleanupTimer = undefined;
    }
  }

  private initPerformanceMonitoring(): void {
    if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
      try {
        this.performanceObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (entry.name.startsWith('cache-')) {
              this.stats.averageAccessTime = entry.duration;
            }
          }
        });
        this.performanceObserver.observe({ entryTypes: ['measure'] });
      } catch (error) {
        console.warn('Performance monitoring not available:', error);
      }
    }
  }

  /**
   * Destructor - cleanup resources
   */
  destroy(): void {
    this.stopCleanupTimer();
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
    this.clear();
  }
}

// Singleton instances for different cache types
export const calculationCache = new PerformanceCache({
  maxSize: 20 * 1024 * 1024, // 20MB for calculations
  maxEntries: 500,
  ttl: 15 * 60 * 1000 // 15 minutes for calculation results
});

export const dataCache = new PerformanceCache({
  maxSize: 10 * 1024 * 1024, // 10MB for parsed data
  maxEntries: 200,
  ttl: 60 * 60 * 1000 // 1 hour for data parsing results
});

export const uiCache = new PerformanceCache({
  maxSize: 5 * 1024 * 1024, // 5MB for UI state
  maxEntries: 100,
  ttl: 10 * 60 * 1000 // 10 minutes for UI cache
});

export default PerformanceCache;