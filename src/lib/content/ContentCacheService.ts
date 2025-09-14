/**
 * Content Cache Service
 * 内容缓存服务，提供高性能的内容访问和缓存策略
 */

import { contentAdapter } from './DatabaseContentAdapter';
import type { ContentItem } from './ContentService';

// 缓存配置接口
export interface CacheConfig {
    enabled: boolean;
    ttl: number; // 缓存过期时间（毫秒）
    maxSize: number; // 最大缓存条目数
    strategy: 'lru' | 'fifo' | 'lfu'; // 缓存策略
}

// 缓存条目接口
interface CacheEntry<T> {
    data: T;
    timestamp: number;
    accessCount: number;
    lastAccessed: number;
}

/**
 * 内容缓存服务
 */
export class ContentCacheService {
    private cache = new Map<string, CacheEntry<any>>();
    private config: CacheConfig;
    private cleanupInterval: NodeJS.Timeout | null = null;

    constructor(config: Partial<CacheConfig> = {}) {
        this.config = {
            enabled: true,
            ttl: 5 * 60 * 1000, // 5分钟
            maxSize: 1000,
            strategy: 'lru',
            ...config
        };

        // 启动定期清理
        this.startCleanupInterval();
    }

    /**
     * 生成缓存键
     */
    private generateKey(method: string, ...args: any[]): string {
        return `${method}:${args.map(arg =>
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        ).join(':')}`;
    }

    /**
     * 检查缓存是否过期
     */
    private isExpired(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp > this.config.ttl;
    }

    /**
     * 检查缓存是否已满
     */
    private isFull(): boolean {
        return this.cache.size >= this.config.maxSize;
    }

    /**
     * 根据策略清理缓存
     */
    private evict(): void {
        if (!this.isFull()) return;

        const entries = Array.from(this.cache.entries());
        let keyToRemove: string;

        switch (this.config.strategy) {
            case 'lru': // 最近最少使用
                keyToRemove = entries.reduce((oldest, [key, entry]) =>
                    entry.lastAccessed < oldest[1].lastAccessed ? [key, entry] : oldest
                )[0];
                break;

            case 'fifo': // 先进先出
                keyToRemove = entries[0][0];
                break;

            case 'lfu': // 最不经常使用
                keyToRemove = entries.reduce((least, [key, entry]) =>
                    entry.accessCount < least[1].accessCount ? [key, entry] : least
                )[0];
                break;

            default:
                keyToRemove = entries[0][0];
        }

        this.cache.delete(keyToRemove);
    }

    /**
     * 清理过期缓存
     */
    private cleanup(): void {
        const now = Date.now();
        for (const [key, entry] of this.cache.entries()) {
            if (this.isExpired(entry)) {
                this.cache.delete(key);
            }
        }
    }

    /**
     * 启动定期清理
     */
    private startCleanupInterval(): void {
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, this.config.ttl / 2); // 每半TTL时间清理一次
    }

    /**
     * 停止定期清理
     */
    private stopCleanupInterval(): void {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
    }

    /**
     * 获取缓存数据
     */
    get<T>(method: string, ...args: any[]): T | null {
        if (!this.config.enabled) return null;

        const key = this.generateKey(method, ...args);
        const entry = this.cache.get(key);

        if (!entry) return null;

        if (this.isExpired(entry)) {
            this.cache.delete(key);
            return null;
        }

        // 更新访问信息
        entry.accessCount++;
        entry.lastAccessed = Date.now();

        return entry.data;
    }

    /**
     * 设置缓存数据
     */
    set<T>(method: string, args: any[], data: T): void {
        if (!this.config.enabled) return;

        const key = this.generateKey(method, ...args);

        // 如果缓存已满，先清理
        if (this.isFull()) {
            this.evict();
        }

        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            accessCount: 1,
            lastAccessed: Date.now()
        });
    }

    /**
     * 删除缓存数据
     */
    delete(method: string, ...args: any[]): void {
        const key = this.generateKey(method, ...args);
        this.cache.delete(key);
    }

    /**
     * 清空缓存
     */
    clear(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计信息
     */
    getStats() {
        const now = Date.now();
        let expired = 0;
        let valid = 0;

        for (const entry of this.cache.values()) {
            if (this.isExpired(entry)) {
                expired++;
            } else {
                valid++;
            }
        }

        return {
            total: this.cache.size,
            valid,
            expired,
            hitRate: this.calculateHitRate(),
            memoryUsage: process.memoryUsage().heapUsed
        };
    }

    /**
     * 计算缓存命中率（需要外部跟踪）
     */
    private calculateHitRate(): number {
        // 这里可以实现命中率计算逻辑
        return 0; // 简化实现
    }

    /**
     * 预热缓存
     */
    async warmup(): Promise<void> {
        try {
            // 预热热门内容
            const popularContent = contentAdapter.getPopularContent(20);
            popularContent.forEach(item => {
                this.set('getContentItem', [item.id], item);
                this.set('getContentItemBySlug', [item.slug, item.type], item);
            });

            // 预热最新内容
            const latestContent = contentAdapter.getLatestContent(20);
            latestContent.forEach(item => {
                this.set('getContentItem', [item.id], item);
            });

            console.log(`Cache warmed up with ${popularContent.length + latestContent.length} items`);
        } catch (error) {
            console.error('Failed to warm up cache:', error);
        }
    }

    /**
     * 销毁缓存服务
     */
    destroy(): void {
        this.stopCleanupInterval();
        this.clear();
    }
}

/**
 * 带缓存的内容服务包装器
 */
export class CachedContentService {
    private cache: ContentCacheService;

    constructor(cacheConfig?: Partial<CacheConfig>) {
        this.cache = new ContentCacheService(cacheConfig);
    }

    /**
     * 获取内容项（带缓存）
     */
    getContentItem(id: number): ContentItem | null {
        const cached = this.cache.get<ContentItem>('getContentItem', id);
        if (cached !== null) return cached;

        const item = contentAdapter.getContentItem(id);
        if (item) {
            this.cache.set('getContentItem', [id], item);
        }
        return item;
    }

    /**
     * 根据slug获取内容项（带缓存）
     */
    getContentItemBySlug(slug: string, type?: string): ContentItem | null {
        const cached = this.cache.get<ContentItem>('getContentItemBySlug', slug, type);
        if (cached !== null) return cached;

        const item = contentAdapter.getContentItemBySlug(slug, type);
        if (item) {
            this.cache.set('getContentItemBySlug', [slug, type], item);
        }
        return item;
    }

    /**
     * 查询内容（带缓存）
     */
    queryContent(options: any = {}): ContentItem[] {
        const cacheKey = JSON.stringify(options);
        const cached = this.cache.get<ContentItem[]>('queryContent', cacheKey);
        if (cached !== null) return cached;

        const items = contentAdapter.queryContent(options);
        this.cache.set('queryContent', [cacheKey], items);
        return items;
    }

    /**
     * 搜索内容（带缓存，但缓存时间较短）
     */
    searchContent(query: string, options: any = {}): ContentItem[] {
        const cacheKey = `${query}:${JSON.stringify(options)}`;
        const cached = this.cache.get<ContentItem[]>('searchContent', cacheKey);
        if (cached !== null) return cached;

        const items = contentAdapter.searchContent(query, options);
        // 搜索结果缓存时间较短
        this.cache.set('searchContent', [cacheKey], items);
        return items;
    }

    /**
     * 获取相关内容（带缓存）
     */
    getRelatedContent(contentId: number, limit: number = 5): ContentItem[] {
        const cached = this.cache.get<ContentItem[]>('getRelatedContent', contentId, limit);
        if (cached !== null) return cached;

        const items = contentAdapter.getRelatedContent(contentId, limit);
        this.cache.set('getRelatedContent', [contentId, limit], items);
        return items;
    }

    /**
     * 获取内容统计（带缓存，缓存时间较长）
     */
    getContentStats(): any {
        const cached = this.cache.get<any>('getContentStats');
        if (cached !== null) return cached;

        const stats = contentAdapter.getContentStats();
        this.cache.set('getContentStats', [], stats);
        return stats;
    }

    /**
     * 获取热门内容（带缓存）
     */
    getPopularContent(limit: number = 5): ContentItem[] {
        const cached = this.cache.get<ContentItem[]>('getPopularContent', limit);
        if (cached !== null) return cached;

        const items = contentAdapter.getPopularContent(limit);
        this.cache.set('getPopularContent', [limit], items);
        return items;
    }

    /**
     * 获取最新内容（带缓存，缓存时间较短）
     */
    getLatestContent(limit: number = 5): ContentItem[] {
        const cached = this.cache.get<ContentItem[]>('getLatestContent', limit);
        if (cached !== null) return cached;

        const items = contentAdapter.getLatestContent(limit);
        this.cache.set('getLatestContent', [limit], items);
        return items;
    }

    /**
     * 清除特定内容的缓存
     */
    clearContentCache(contentId: number): void {
        // 获取内容项以确定slug和type
        const item = contentAdapter.getContentItem(contentId);
        if (item) {
            this.cache.delete('getContentItem', contentId);
            this.cache.delete('getContentItemBySlug', item.slug, item.type);
            this.cache.delete('getRelatedContent', contentId);
        }
    }

    /**
     * 清除所有缓存
     */
    clearAllCache(): void {
        this.cache.clear();
    }

    /**
     * 获取缓存统计
     */
    getCacheStats() {
        return this.cache.getStats();
    }

    /**
     * 预热缓存
     */
    async warmupCache(): Promise<void> {
        return this.cache.warmup();
    }

    /**
     * 销毁服务
     */
    destroy(): void {
        this.cache.destroy();
    }
}

// 导出缓存服务实例
export const contentCacheService = new ContentCacheService();
export const cachedContentService = new CachedContentService();