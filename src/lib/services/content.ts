import { BaseService } from './base';

export interface ContentType {
    id: number;
    type_name: string;
    display_name: string;
}

export interface ContentItem {
    id: number;
    type_id: number;
    slug: string;
    title: string;
    summary?: string;
    content: string;
    status: string;
    reading_time?: number;
    created_at: string;
    updated_at: string;
    type?: ContentType;
    metadata?: Record<string, any>;
}

export interface HowToStep {
    id: number;
    content_id: number;
    step_order: number;
    step_id: string;
    name: string;
    description: string;
    tip?: string;
    warning?: string;
}

export interface ContentMetadata {
    id: number;
    content_id: number;
    meta_key: string;
    meta_value: string;
    created_at: string;
}

export interface ContentQueryOptions {
    typeId?: number;
    typeName?: string;
    status?: string;
    search?: string;
    tags?: string[];
    sortBy?: 'title' | 'created_at' | 'updated_at' | 'reading_time';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
}

export interface ContentResult {
    items: ContentItem[];
    types: ContentType[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SearchResult {
    item: ContentItem;
    score: number;
    snippet?: string;
}

/**
 * 内容数据服务
 * 提供内容项、类型和元数据的数据访问接口
 */
export class ContentService extends BaseService {
    private defaultCacheTTL = 12 * 60 * 1000; // 12分钟

    constructor() {
        super();
        this.defaultCacheTTL = 12 * 60 * 1000;
    }

    /**
     * 获取所有内容类型
     */
    async getContentTypes(): Promise<ContentType[]> {
        const cacheKey = this.generateCacheKey('content:types');

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    type_name,
                    display_name
                FROM content_types
                ORDER BY display_name ASC
            `;

            return this.db.prepare(query).all() as ContentType[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取内容列表（支持分页和过滤）
     */
    async getContentItems(options: ContentQueryOptions = {}): Promise<ContentResult> {
        const {
            typeId,
            typeName,
            status = 'published',
            search,
            tags,
            sortBy = 'title',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 20
        } = options;

        const cacheKey = this.generateCacheKey('content:items', JSON.stringify(options));

        return this.queryWithCache(cacheKey, async () => {
            // 构建WHERE条件
            const conditions: Record<string, any> = {};
            if (typeId) conditions.type_id = typeId;
            if (status) conditions.status = status;

            let whereClause = '';
            let params: any[] = [];

            if (Object.keys(conditions).length > 0) {
                const where = this.buildWhereClause(conditions);
                whereClause = where.clause;
                params = where.params;
            }

            // 处理类型名称
            if (typeName) {
                const typeCondition = whereClause ? 'AND' : 'WHERE';
                whereClause += ` ${typeCondition} ct.type_name = ?`;
                params.push(typeName);
            }

            // 处理搜索
            if (search) {
                // 使用FTS5搜索
                const searchCondition = whereClause ? 'AND' : 'WHERE';
                whereClause += ` ${searchCondition} ci.id IN (
                    SELECT rowid FROM content_search
                    WHERE content_search MATCH ?
                )`;
                params.push(search);
            }

            // 处理标签搜索
            if (tags && tags.length > 0) {
                const tagCondition = whereClause ? 'AND' : 'WHERE';
                const tagPlaceholders = tags.map(() => '?').join(', ');
                whereClause += ` ${tagCondition} ci.id IN (
                    SELECT DISTINCT content_id FROM content_metadata
                    WHERE meta_key = 'tags' AND meta_value LIKE ('%' || ? || '%')
                )`;
                params.push(tags[0]); // 简化的标签搜索
            }

            // 构建完整查询
            const countQuery = `
                SELECT COUNT(DISTINCT ci.id) as count
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                ${whereClause}
            `;

            const dataQuery = `
                SELECT
                    ci.id,
                    ci.type_id,
                    ci.slug,
                    ci.title,
                    ci.summary,
                    ci.content,
                    ci.status,
                    ci.reading_time,
                    ci.created_at,
                    ci.updated_at,
                    ct.type_name,
                    ct.display_name as type_display_name
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                ${whereClause}
                ${this.buildOrderByClause(sortBy, sortOrder)}
            `;

            const result = await this.paginatedQuery<any>({
                query: dataQuery,
                countQuery,
                page,
                pageSize,
                params
            });

            // 转换结果格式并添加元数据
            const items = await Promise.all(
                result.data.map(async (row) => {
                    const item: ContentItem = {
                        id: row.id,
                        type_id: row.type_id,
                        slug: row.slug,
                        title: row.title,
                        summary: row.summary,
                        content: row.content,
                        status: row.status,
                        reading_time: row.reading_time,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        type: {
                            id: row.type_id,
                            type_name: row.type_name,
                            display_name: row.type_display_name
                        },
                        metadata: await this.getContentMetadata(row.id)
                    };

                    return item;
                })
            );

            // 获取所有内容类型（用于前端）
            const types = await this.getContentTypes();

            return {
                items,
                types,
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages
            };
        }, search ? this.defaultCacheTTL / 3 : this.defaultCacheTTL); // 搜索结果缓存时间较短
    }

    /**
     * 根据ID获取内容项
     */
    async getContentItemById(id: number): Promise<ContentItem | null> {
        const cacheKey = this.generateCacheKey('content:item:byId', id);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    ci.id,
                    ci.type_id,
                    ci.slug,
                    ci.title,
                    ci.summary,
                    ci.content,
                    ci.status,
                    ci.reading_time,
                    ci.created_at,
                    ci.updated_at,
                    ct.type_name,
                    ct.display_name as type_display_name
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                WHERE ci.id = ?
            `;

            const row = this.db.prepare(query).get(id);
            if (!row) return null;

            const item: ContentItem = {
                id: row.id,
                type_id: row.type_id,
                slug: row.slug,
                title: row.title,
                summary: row.summary,
                content: row.content,
                status: row.status,
                reading_time: row.reading_time,
                created_at: row.created_at,
                updated_at: row.updated_at,
                type: {
                    id: row.type_id,
                    type_name: row.type_name,
                    display_name: row.type_display_name
                },
                metadata: await this.getContentMetadata(row.id)
            };

            return item;
        }, this.defaultCacheTTL);
    }

    /**
     * 根据slug获取内容项
     */
    async getContentItemBySlug(slug: string): Promise<ContentItem | null> {
        const cacheKey = this.generateCacheKey('content:item:bySlug', slug);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    ci.id,
                    ci.type_id,
                    ci.slug,
                    ci.title,
                    ci.summary,
                    ci.content,
                    ci.status,
                    ci.reading_time,
                    ci.created_at,
                    ci.updated_at,
                    ct.type_name,
                    ct.display_name as type_display_name
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                WHERE ci.slug = ?
            `;

            const row = this.db.prepare(query).get(slug);
            if (!row) return null;

            const item: ContentItem = {
                id: row.id,
                type_id: row.type_id,
                slug: row.slug,
                title: row.title,
                summary: row.summary,
                content: row.content,
                status: row.status,
                reading_time: row.reading_time,
                created_at: row.created_at,
                updated_at: row.updated_at,
                type: {
                    id: row.type_id,
                    type_name: row.type_name,
                    display_name: row.type_display_name
                },
                metadata: await this.getContentMetadata(row.id)
            };

            return item;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取内容元数据
     */
    async getContentMetadata(contentId: number): Promise<Record<string, any>> {
        const cacheKey = this.generateCacheKey('content:metadata', contentId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    meta_key,
                    meta_value
                FROM content_metadata
                WHERE content_id = ?
                ORDER BY meta_key ASC
            `;

            const rows = this.db.prepare(query).all(contentId) as ContentMetadata[];

            const metadata: Record<string, any> = {};
            rows.forEach(row => {
                try {
                    metadata[row.meta_key] = JSON.parse(row.meta_value);
                } catch {
                    metadata[row.meta_key] = row.meta_value;
                }
            });

            return metadata;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取How-to步骤
     */
    async getHowToSteps(contentId: number): Promise<HowToStep[]> {
        const cacheKey = this.generateCacheKey('content:howto:steps', contentId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    content_id,
                    step_order,
                    step_id,
                    name,
                    description,
                    tip,
                    warning
                FROM howto_steps
                WHERE content_id = ?
                ORDER BY step_order ASC
            `;

            return this.db.prepare(query).all(contentId) as HowToStep[];
        }, this.defaultCacheTTL);
    }

    /**
     * 搜索内容
     */
    async searchContent(query: string, limit = 20): Promise<SearchResult[]> {
        const cacheKey = this.generateCacheKey('content:search', query, limit);

        return this.queryWithCache(cacheKey, async () => {
            // 使用FTS5搜索 - 简化版本避免snippet()函数参数问题
            const searchQuery = `
                SELECT
                    ci.id,
                    ci.type_id,
                    ci.slug,
                    ci.title,
                    ci.summary,
                    ci.content,
                    ci.status,
                    ci.reading_time,
                    ci.created_at,
                    ci.updated_at,
                    ct.type_name,
                    ct.display_name as type_display_name,
                    content_search.rank as score
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                JOIN content_search ON ci.id = content_search.rowid
                WHERE content_search MATCH ?
                ORDER BY content_search.rank DESC, ci.title ASC
                LIMIT ?
            `;

            const results = this.db.prepare(searchQuery).all(query, limit);

            const searchResults: SearchResult[] = await Promise.all(
                results.map(async (result: any) => ({
                    item: {
                        id: result.id,
                        type_id: result.type_id,
                        slug: result.slug,
                        title: result.title,
                        summary: result.summary,
                        content: result.content,
                        status: result.status,
                        reading_time: result.reading_time,
                        created_at: result.created_at,
                        updated_at: result.updated_at,
                        type: {
                            id: result.type_id,
                            type_name: result.type_name,
                            display_name: result.type_display_name
                        },
                        metadata: await this.getContentMetadata(result.id)
                    },
                    score: result.score
                }))
            );

            return searchResults;
        }, this.defaultCacheTTL / 3); // 搜索结果缓存时间较短
    }

    /**
     * 根据类型获取内容
     */
    async getContentByType(typeName: string, options: Omit<ContentQueryOptions, 'typeName'> = {}): Promise<ContentResult> {
        return this.getContentItems({ ...options, typeName });
    }

    /**
     * 获取FAQ内容
     */
    async getFAQs(options: Omit<ContentQueryOptions, 'typeName'> = {}): Promise<ContentResult> {
        return this.getContentItems({ ...options, typeName: 'faq' });
    }

    /**
     * 获取How-to内容
     */
    async getHowTos(options: Omit<ContentQueryOptions, 'typeName'> = {}): Promise<ContentResult> {
        return this.getContentItems({ ...options, typeName: 'howto' });
    }

    /**
     * 获取Case研究内容
     */
    async getCases(options: Omit<ContentQueryOptions, 'typeName'> = {}): Promise<ContentResult> {
        return this.getContentItems({ ...options, typeName: 'case' });
    }

    /**
     * 获取相关内容
     */
    async getRelatedContent(contentId: number, limit = 5): Promise<ContentItem[]> {
        const cacheKey = this.generateCacheKey('content:related', contentId, limit);

        return this.queryWithCache(cacheKey, async () => {
            // 获取当前内容的标签和分类
            const currentContent = await this.getContentItemById(contentId);
            if (!currentContent) return [];

            const tags = currentContent.metadata?.tags || [];
            if (tags.length === 0) return [];

            // 基于标签查找相关内容
            const relatedQuery = `
                SELECT DISTINCT
                    ci.id,
                    ci.type_id,
                    ci.slug,
                    ci.title,
                    ci.summary,
                    ci.content,
                    ci.status,
                    ci.reading_time,
                    ci.created_at,
                    ci.updated_at,
                    ct.type_name,
                    ct.display_name as type_display_name
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                LEFT JOIN content_metadata cm ON ci.id = cm.content_id
                WHERE cm.meta_key = 'tags'
                AND ci.id != ?
                AND cm.meta_value LIKE ('%' || ? || '%')
                ORDER BY ci.updated_at DESC
                LIMIT ?
            `;

            const results = this.db.prepare(relatedQuery).all(contentId, tags[0], limit);

            return await Promise.all(
                results.map(async (row: any) => ({
                    id: row.id,
                    type_id: row.type_id,
                    slug: row.slug,
                    title: row.title,
                    summary: row.summary,
                    content: row.content,
                    status: row.status,
                    reading_time: row.reading_time,
                    created_at: row.created_at,
                    updated_at: row.updated_at,
                    type: {
                        id: row.type_id,
                        type_name: row.type_name,
                        display_name: row.type_display_name
                    },
                    metadata: await this.getContentMetadata(row.id)
                }))
            );
        }, this.defaultCacheTTL);
    }

    /**
     * 获取统计信息
     */
    async getStatistics(): Promise<{
        totalItems: number;
        totalTypes: number;
        publishedItems: number;
        typeCounts: Array<{ type: ContentType; count: number }>;
        averageReadingTime: number;
    }> {
        const cacheKey = this.generateCacheKey('content:stats');

        return this.queryWithCache(cacheKey, () => {
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM content_items) as total_items,
                    (SELECT COUNT(*) FROM content_types) as total_types,
                    (SELECT COUNT(*) FROM content_items WHERE status = 'published') as published_items,
                    (SELECT AVG(reading_time) FROM content_items WHERE reading_time IS NOT NULL) as avg_reading_time
            `;

            const stats = this.db.prepare(statsQuery).get();

            const typeCountsQuery = `
                SELECT
                    ct.id,
                    ct.type_name,
                    ct.display_name,
                    COUNT(ci.id) as item_count
                FROM content_types ct
                LEFT JOIN content_items ci ON ct.id = ci.type_id
                GROUP BY ct.id
                ORDER BY ct.display_name ASC
            `;

            const typeCounts = this.db.prepare(typeCountsQuery).all();

            return {
                totalItems: stats.total_items,
                totalTypes: stats.total_types,
                publishedItems: stats.published_items,
                typeCounts: typeCounts.map(row => ({
                    type: {
                        id: row.id,
                        type_name: row.type_name,
                        display_name: row.display_name
                    },
                    count: row.item_count
                })),
                averageReadingTime: Math.round(stats.avg_reading_time || 0)
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 清除内容相关缓存
     */
    clearContentCache(): void {
        this.clearCache('content');
    }
}

// 导出单例实例
export const contentService = new ContentService();