import Database from 'better-sqlite3';
import { getDatabase } from '../db/client';

/**
 * 数据库服务基类
 * 提供通用的数据库操作和缓存功能
 */
export abstract class BaseService {
    protected db: Database.Database;
    protected cache: Map<string, { data: any; timestamp: number; ttl: number }> = new Map();
    protected defaultCacheTTL: number = 5 * 60 * 1000; // 5分钟

    constructor() {
        this.db = getDatabase();
    }

    /**
     * 生成缓存键
     */
    protected generateCacheKey(prefix: string, ...params: any[]): string {
        return `${prefix}:${params.join(':')}`;
    }

    /**
     * 从缓存获取数据
     */
    protected getFromCache<T>(key: string): T | null {
        const cached = this.cache.get(key);
        if (!cached) return null;

        const now = Date.now();
        if (now - cached.timestamp > cached.ttl) {
            this.cache.delete(key);
            return null;
        }

        return cached.data as T;
    }

    /**
     * 设置缓存
     */
    protected setCache<T>(key: string, data: T, ttl?: number): void {
        this.cache.set(key, {
            data,
            timestamp: Date.now(),
            ttl: ttl || this.defaultCacheTTL
        });
    }

    /**
     * 清除缓存
     */
    protected clearCache(pattern?: string): void {
        if (pattern) {
            for (const key of this.cache.keys()) {
                if (key.startsWith(pattern)) {
                    this.cache.delete(key);
                }
            }
        } else {
            this.cache.clear();
        }
    }

    /**
     * 执行查询并缓存结果
     */
    protected async queryWithCache<T>(
        cacheKey: string,
        queryFn: () => T,
        ttl?: number
    ): Promise<T> {
        // 先尝试从缓存获取
        const cached = this.getFromCache<T>(cacheKey);
        if (cached !== null) {
            return cached;
        }

        // 执行查询
        const result = await queryFn();

        // 缓存结果
        this.setCache(cacheKey, result, ttl);

        return result;
    }

    /**
     * 批量查询
     */
    protected async batchQuery<T>(
        queries: Array<{
            key: string;
            queryFn: () => Promise<T>;
            ttl?: number;
        }>
    ): Promise<Map<string, T>> {
        const results = new Map<string, T>();

        // 先检查缓存
        const uncachedQueries: typeof queries = [];

        for (const query of queries) {
            const cached = this.getFromCache<T>(query.key);
            if (cached !== null) {
                results.set(query.key, cached);
            } else {
                uncachedQueries.push(query);
            }
        }

        // 执行未缓存的查询
        if (uncachedQueries.length > 0) {
            const queryResults = await Promise.allSettled(
                uncachedQueries.map(q => q.queryFn())
            );

            uncachedQueries.forEach((query, index) => {
                const result = queryResults[index];
                if (result.status === 'fulfilled') {
                    results.set(query.key, result.value);
                    this.setCache(query.key, result.value, query.ttl);
                } else {
                    console.error(`Query failed for key ${query.key}:`, result.reason);
                }
            });
        }

        return results;
    }

    /**
     * 事务执行
     */
    protected async executeTransaction<T>(callback: (db: Database.Database) => T): Promise<T> {
        try {
            return this.db.transaction(callback)();
        } catch (error) {
            console.error('Transaction failed:', error);
            throw error;
        }
    }

    /**
     * 安全执行数据库操作
     */
    protected async safeExecute<T>(
        operation: string,
        callback: () => Promise<T>
    ): Promise<T> {
        try {
            return await callback();
        } catch (error) {
            console.error(`Database operation failed: ${operation}`, error);
            throw new Error(`Database operation '${operation}' failed: ${error.message}`);
        }
    }

    /**
     * 分页查询
     */
    protected async paginatedQuery<T>({
        query,
        countQuery,
        page = 1,
        pageSize = 20,
        params = []
    }: {
        query: string;
        countQuery: string;
        page?: number;
        pageSize?: number;
        params?: any[];
    }): Promise<{
        data: T[];
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    }> {
        const offset = (page - 1) * pageSize;

        // 获取总数
        const totalResult = this.db.prepare(countQuery).get(...params);
        const total = totalResult.count;

        // 获取分页数据
        const paginatedQuery = `${query} LIMIT ? OFFSET ?`;
        const data = this.db.prepare(paginatedQuery).all(...params, pageSize, offset);

        return {
            data,
            total,
            page,
            pageSize,
            totalPages: Math.ceil(total / pageSize)
        };
    }

    /**
     * 构建WHERE条件
     */
    protected buildWhereClause(conditions: Record<string, any>): {
        clause: string;
        params: any[];
    } {
        const clauses: string[] = [];
        const params: any[] = [];

        Object.entries(conditions).forEach(([key, value]) => {
            if (value !== undefined && value !== null) {
                if (Array.isArray(value)) {
                    if (value.length > 0) {
                        const placeholders = value.map(() => '?').join(', ');
                        clauses.push(`${key} IN (${placeholders})`);
                        params.push(...value);
                    }
                } else if (typeof value === 'object') {
                    // 处理LIKE查询
                    Object.entries(value).forEach(([operator, val]) => {
                        switch (operator) {
                            case 'like':
                                clauses.push(`${key} LIKE ?`);
                                params.push(`%${val}%`);
                                break;
                            case 'startsWith':
                                clauses.push(`${key} LIKE ?`);
                                params.push(`${val}%`);
                                break;
                            case 'endsWith':
                                clauses.push(`${key} LIKE ?`);
                                params.push(`%${val}`);
                                break;
                            case 'gt':
                                clauses.push(`${key} > ?`);
                                params.push(val);
                                break;
                            case 'gte':
                                clauses.push(`${key} >= ?`);
                                params.push(val);
                                break;
                            case 'lt':
                                clauses.push(`${key} < ?`);
                                params.push(val);
                                break;
                            case 'lte':
                                clauses.push(`${key} <= ?`);
                                params.push(val);
                                break;
                            case 'ne':
                                clauses.push(`${key} != ?`);
                                params.push(val);
                                break;
                        }
                    });
                } else {
                    clauses.push(`${key} = ?`);
                    params.push(value);
                }
            }
        });

        return {
            clause: clauses.length > 0 ? `WHERE ${clauses.join(' AND ')}` : '',
            params
        };
    }

    /**
     * 构建排序子句
     */
    protected buildOrderByClause(sortBy?: string | string[], sortOrder: 'ASC' | 'DESC' = 'ASC'): string {
        if (!sortBy) return '';

        const sortFields = Array.isArray(sortBy) ? sortBy : [sortBy];
        const orderClauses = sortFields.map(field => `${field} ${sortOrder}`);

        return `ORDER BY ${orderClauses.join(', ')}`;
    }

    /**
     * 健康检查
     */
    async healthCheck(): Promise<{ status: 'healthy' | 'unhealthy'; details?: any }> {
        try {
            // 测试数据库连接
            this.db.prepare('SELECT 1').get();

            return {
                status: 'healthy',
                details: {
                    cacheSize: this.cache.size,
                    database: 'connected'
                }
            };
        } catch (error) {
            return {
                status: 'unhealthy',
                details: { error: error.message }
            };
        }
    }

    /**
     * 清理资源
     */
    cleanup(): void {
        this.cache.clear();
    }
}