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
                SELECT id, type_name, display_name
                FROM content_types_static
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
            // 构建WHERE条件（基于 slim_content + content_types_static）
            let whereClause = 'WHERE 1=1';
            let params: any[] = [];
            if (status) { whereClause += ' AND sc.status = ?'; params.push(status); }
            if (typeId) { whereClause += ' AND cts.id = ?'; params.push(typeId); }
            if (typeName) { whereClause += ' AND sc.type = ?'; params.push(typeName); }
            if (search) {
                const like = `%${search}%`;
                whereClause += ' AND (sc.title LIKE ? OR sc.summary LIKE ? OR sc.content LIKE ?)';
                params.push(like, like, like);
            }
            if (tags && tags.length > 0) {
                const cond = tags.map(() => 'sc.tags LIKE ?').join(' OR ');
                whereClause += ` AND (${cond})`;
                tags.forEach(t => params.push(`%"${t}"%`));
            }

            const countQuery = `
                SELECT COUNT(*) as count
                FROM slim_content sc
                JOIN content_types_static cts ON cts.type_name = sc.type
                ${whereClause}
            `;

            const dataQuery = `
                SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name
                FROM slim_content sc
                JOIN content_types_static cts ON cts.type_name = sc.type
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
                SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name
                FROM slim_content sc
                JOIN content_types_static cts ON cts.type_name = sc.type
                WHERE sc.id = ?
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
                SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name
                FROM slim_content sc
                JOIN content_types_static cts ON cts.type_name = sc.type
                WHERE sc.slug = ?
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
            const row = this.db.prepare(`SELECT * FROM slim_content WHERE id = ?`).get(contentId) as any;
            if (!row) return {} as Record<string, any>;
            let tags: any = [];
            try { tags = JSON.parse(row.tags || '[]'); } catch { tags = []; }
            const metadata: Record<string, any> = {};
            metadata.tags = tags;
            if (row.difficulty) metadata.difficulty = row.difficulty;
            if (row.industry) metadata.industry = row.industry;
            if (row.target_tool) metadata.target_tool = row.target_tool;
            return metadata;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取How-to步骤
     */
    async getHowToSteps(contentId: number): Promise<HowToStep[]> {
        const cacheKey = this.generateCacheKey('content:howto:steps', contentId);

        return this.queryWithCache(cacheKey, () => {
            const row = this.db.prepare(`SELECT details FROM slim_content_details WHERE content_id = ?`).get(contentId) as any;
            const details = row?.details ? JSON.parse(row.details) : {};
            const steps = Array.isArray(details.steps) ? details.steps : [];
            return steps.map((s: any, idx: number) => ({
                id: contentId * 100000 + (idx + 1),
                content_id: contentId,
                step_order: s.stepOrder ?? (idx + 1),
                step_id: s.stepId || String(idx + 1),
                name: s.name || '',
                description: s.description || '',
                tip: s.tip,
                warning: s.warning
            })) as HowToStep[];
        }, this.defaultCacheTTL);
    }

    /**
     * 搜索内容
     */
    async searchContent(query: string, limit = 20): Promise<SearchResult[]> {
        const cacheKey = this.generateCacheKey('content:search', query, limit);

        return this.queryWithCache(cacheKey, async () => {
            const useFts = process.env.USE_FTS_SEARCH === '1' || process.env.CONTENT_SEARCH_MODE === 'fts';
            let results: any[] = [];

            if (useFts) {
                try {
                    const ftsQuery = `
                        SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name,
                               content_search.rank as score
                        FROM content_search
                        JOIN slim_content sc ON content_search.rowid = sc.id
                        JOIN content_types_static cts ON cts.type_name = sc.type
                        WHERE content_search MATCH ?
                        ORDER BY content_search.rank DESC, sc.title ASC
                        LIMIT ?
                    `;
                    results = this.db.prepare(ftsQuery).all(query, limit) as any[];
                } catch (e) {
                    // fall back to LIKE below
                }
            }

            if (!results || results.length === 0) {
                const like = `%${query}%`;
                const likeQuery = `
                    SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name,
                           1.0 as score
                    FROM slim_content sc
                    JOIN content_types_static cts ON cts.type_name = sc.type
                    WHERE sc.title LIKE ? OR sc.summary LIKE ? OR sc.content LIKE ?
                    ORDER BY sc.updated_at DESC, sc.title ASC
                    LIMIT ?
                `;
                results = this.db.prepare(likeQuery).all(like, like, like, limit) as any[];
            }

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

            // 基于 tags 的简单相似：同类型 + tags 包含首个标签（slim 模型）
            const like = `%"${tags[0]}"%`;
            const relatedQuery = `
                SELECT sc.*, cts.id as type_id, cts.type_name, cts.display_name as type_display_name
                FROM slim_content sc
                JOIN content_types_static cts ON cts.type_name = sc.type
                WHERE sc.id != ?
                AND sc.type = (SELECT type FROM slim_content WHERE id = ?)
                AND sc.tags LIKE ?
                ORDER BY sc.updated_at DESC
                LIMIT ?
            `;

            const results = this.db.prepare(relatedQuery).all(contentId, contentId, like, limit);

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
                    (SELECT COUNT(*) FROM slim_content) as total_items,
                    (SELECT COUNT(*) FROM content_types_static) as total_types,
                    (SELECT COUNT(*) FROM slim_content WHERE status = 'published') as published_items,
                    (SELECT AVG(reading_time) FROM slim_content WHERE reading_time IS NOT NULL) as avg_reading_time
            `;

            const stats = this.db.prepare(statsQuery).get();

            const typeCountsQuery = `
                SELECT
                    cts.id,
                    cts.type_name,
                    cts.display_name,
                    COUNT(sc.id) as item_count
                FROM content_types_static cts
                LEFT JOIN slim_content sc ON cts.type_name = sc.type
                GROUP BY cts.id
                ORDER BY cts.display_name ASC
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
