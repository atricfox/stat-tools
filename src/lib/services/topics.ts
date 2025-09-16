import { BaseService } from './base';

export interface Topic {
    id: number;
    slug: string;
    title: string;
    description?: string;
    created_at: string;
    updated_at: string;
}

export interface TopicGuide {
    id: number;
    topic_id: number;
    title: string;
    description?: string;
    icon?: string;
    href?: string;
    sort_order: number;
}

export interface TopicFAQ {
    id: number;
    topic_id: number;
    question: string;
    answer: string;
    href?: string;
    sort_order: number;
}

export interface TopicWithDetails extends Topic {
    guides?: TopicGuide[];
    faqs?: TopicFAQ[];
    calculatorGroups?: string[];
}

export interface TopicsQueryOptions {
    search?: string;
    sortBy?: 'title' | 'created_at' | 'sort_order';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
}

export interface TopicsResult {
    topics: TopicWithDetails[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * 主题数据服务
 * 提供主题、指南和FAQ的数据访问接口
 */
export class TopicsService extends BaseService {
    private defaultCacheTTL = 20 * 60 * 1000; // 20分钟

    constructor() {
        super();
        this.defaultCacheTTL = 20 * 60 * 1000;
    }

    /**
     * 获取所有主题
     */
    async getTopics(options: TopicsQueryOptions = {}): Promise<TopicsResult> {
        const {
            search,
            sortBy = 'title',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 20
        } = options;

        const cacheKey = this.generateCacheKey('topics:list', JSON.stringify(options));

        return this.queryWithCache(cacheKey, async () => {
            // 构建WHERE条件
            let whereClause = '';
            let params: any[] = [];

            if (search) {
                whereClause = 'WHERE title LIKE ? OR description LIKE ?';
                params.push(`%${search}%`, `%${search}%`);
            }

            // 构建完整查询
            const countQuery = `
                SELECT COUNT(*) as count
                FROM topics
                ${whereClause}
            `;

            const dataQuery = `
                SELECT
                    id,
                    slug,
                    title,
                    description,
                    created_at,
                    updated_at
                FROM topics
                ${whereClause}
                ${this.buildOrderByClause(sortBy, sortOrder)}
            `;

            const result = await this.paginatedQuery<Topic>({
                query: dataQuery,
                countQuery,
                page,
                pageSize,
                params
            });

            // 为每个主题获取详细信息
            const topicsWithDetails = await Promise.all(
                result.data.map(async (topic) => ({
                    ...topic,
                    guides: await this.getTopicGuides(topic.id),
                    faqs: await this.getTopicFAQs(topic.id),
                    calculatorGroups: await this.getTopicCalculatorGroups(topic.id)
                }))
            );

            return {
                topics: topicsWithDetails,
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages
            };
        }, search ? this.defaultCacheTTL / 3 : this.defaultCacheTTL); // 搜索结果缓存时间较短
    }

    /**
     * 根据ID获取主题
     */
    async getTopicById(id: number): Promise<TopicWithDetails | null> {
        const cacheKey = this.generateCacheKey('topics:byId', id);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    id,
                    slug,
                    title,
                    description,
                    created_at,
                    updated_at
                FROM topics
                WHERE id = ?
            `;

            const topic = this.db.prepare(query).get(id) as Topic || null;
            if (!topic) return null;

            // 获取详细信息
            const [guides, faqs, calculatorGroups] = await Promise.all([
                this.getTopicGuides(id),
                this.getTopicFAQs(id),
                this.getTopicCalculatorGroups(id)
            ]);

            return {
                ...topic,
                guides,
                faqs,
                calculatorGroups
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 根据slug获取主题
     */
    async getTopicBySlug(slug: string): Promise<TopicWithDetails | null> {
        const cacheKey = this.generateCacheKey('topics:bySlug', slug);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    id,
                    slug,
                    title,
                    description,
                    created_at,
                    updated_at
                FROM topics
                WHERE slug = ?
            `;

            const topic = this.db.prepare(query).get(slug) as Topic || null;
            if (!topic) return null;

            // 获取详细信息
            const [guides, faqs, calculatorGroups] = await Promise.all([
                this.getTopicGuides(topic.id),
                this.getTopicFAQs(topic.id),
                this.getTopicCalculatorGroups(topic.id)
            ]);

            return {
                ...topic,
                guides,
                faqs,
                calculatorGroups
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 获取主题指南
     */
    async getTopicGuides(topicId: number): Promise<TopicGuide[]> {
        const cacheKey = this.generateCacheKey('topics:guides', topicId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    topic_id,
                    title,
                    description,
                    icon,
                    href,
                    sort_order
                FROM topic_guides
                WHERE topic_id = ?
                ORDER BY sort_order ASC
            `;

            return this.db.prepare(query).all(topicId) as TopicGuide[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取主题FAQ
     */
    async getTopicFAQs(topicId: number): Promise<TopicFAQ[]> {
        const cacheKey = this.generateCacheKey('topics:faqs', topicId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    topic_id,
                    question,
                    answer,
                    href,
                    sort_order
                FROM topic_faqs
                WHERE topic_id = ?
                ORDER BY sort_order ASC
            `;

            return this.db.prepare(query).all(topicId) as TopicFAQ[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取主题关联的计算器分组
     */
    async getTopicCalculatorGroups(topicId: number): Promise<string[]> {
        const cacheKey = this.generateCacheKey('topics:calculatorGroups', topicId);

        return this.queryWithCache(cacheKey, () => {
            // DEPRECATED: content_metadata has been removed in slim schema.
            // Fallback strategy: try to read from slim_content_details.details.related_calculator_groups
            // or from slim_content.tags if present.
            try {
                const row = this.db.prepare(`
                    SELECT sc.tags as tags, scd.details as details
                    FROM slim_content sc
                    LEFT JOIN slim_content_details scd ON scd.content_id = sc.id
                    WHERE sc.id = ?
                `).get(topicId) as any;
                if (!row) return [];
                // Try details.related_calculator_groups
                if (row.details) {
                    try {
                        const details = JSON.parse(row.details);
                        if (Array.isArray(details?.related_calculator_groups)) {
                            return details.related_calculator_groups as string[];
                        }
                    } catch {}
                }
                // Try tags (if encoded)
                if (row.tags) {
                    try {
                        const tags = JSON.parse(row.tags);
                        if (Array.isArray(tags)) {
                            return tags.filter((t: any) => typeof t === 'string');
                        }
                    } catch {}
                }
                return [];
            } catch (e) {
                console.warn('[DEPRECATED] getTopicCalculatorGroups relies on removed content_metadata; returning empty list.');
                return [];
            }
        }, this.defaultCacheTTL);
    }

    /**
     * 搜索主题
     */
    async searchTopics(query: string, limit = 10): Promise<TopicWithDetails[]> {
        const cacheKey = this.generateCacheKey('topics:search', query, limit);

        return this.queryWithCache(cacheKey, async () => {
            const searchQuery = `
                SELECT
                    id,
                    slug,
                    title,
                    description,
                    created_at,
                    updated_at
                FROM topics
                WHERE title LIKE ? OR description LIKE ?
                ORDER BY
                    CASE
                        WHEN title LIKE ? THEN 1
                        WHEN description LIKE ? THEN 2
                        ELSE 3
                    END,
                    title ASC
                LIMIT ?
            `;

            const searchTerm = `%${query}%`;
            const results = this.db.prepare(searchQuery).all(searchTerm, searchTerm, searchTerm, searchTerm, limit);

            // 为每个结果获取详细信息
            return await Promise.all(
                results.map(async (row: any) => {
                    const [guides, faqs, calculatorGroups] = await Promise.all([
                        this.getTopicGuides(row.id),
                        this.getTopicFAQs(row.id),
                        this.getTopicCalculatorGroups(row.id)
                    ]);

                    return {
                        id: row.id,
                        slug: row.slug,
                        title: row.title,
                        description: row.description,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        guides,
                        faqs,
                        calculatorGroups
                    };
                })
            );
        }, this.defaultCacheTTL / 3); // 搜索结果缓存时间较短
    }

    /**
     * 获取所有主题（简化版，用于导航）
     */
    async getAllTopicsSimple(): Promise<Pick<Topic, 'id' | 'slug' | 'title'>[]> {
        const cacheKey = this.generateCacheKey('topics:simple');

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    slug,
                    title
                FROM topics
                ORDER BY title ASC
            `;

            return this.db.prepare(query).all() as Pick<Topic, 'id' | 'slug' | 'title'>[];
        }, this.defaultCacheTTL);
    }

    /**
     * 根据计算器分组获取相关主题
     */
    async getTopicsByCalculatorGroup(groupName: string): Promise<TopicWithDetails[]> {
        const cacheKey = this.generateCacheKey('topics:byGroup', groupName);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT DISTINCT
                    t.id,
                    t.slug,
                    t.title,
                    t.description,
                    t.created_at,
                    t.updated_at
                FROM topics t
                JOIN content_metadata cm ON t.id = cm.content_id
                WHERE cm.meta_key = 'related_calculator_groups'
                AND cm.meta_value LIKE ('%' || ? || '%')
                ORDER BY t.title ASC
            `;

            const results = this.db.prepare(query).all(`%${groupName}%`);

            // 为每个结果获取详细信息
            return await Promise.all(
                results.map(async (row: any) => {
                    const [guides, faqs, calculatorGroups] = await Promise.all([
                        this.getTopicGuides(row.id),
                        this.getTopicFAQs(row.id),
                        this.getTopicCalculatorGroups(row.id)
                    ]);

                    return {
                        id: row.id,
                        slug: row.slug,
                        title: row.title,
                        description: row.description,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        guides,
                        faqs,
                        calculatorGroups
                    };
                })
            );
        }, this.defaultCacheTTL);
    }

    /**
     * 获取主题统计信息
     */
    async getStatistics(): Promise<{
        totalTopics: number;
        totalGuides: number;
        totalFAQs: number;
        topicWithMostGuides: TopicWithDetails | null;
        topicWithMostFAQs: TopicWithDetails | null;
    }> {
        const cacheKey = this.generateCacheKey('topics:stats');

        return this.queryWithCache(cacheKey, async () => {
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM topics) as total_topics,
                    (SELECT COUNT(*) FROM topic_guides) as total_guides,
                    (SELECT COUNT(*) FROM topic_faqs) as total_faqs
            `;

            const stats = this.db.prepare(statsQuery).get();

            // 获取指南最多的主题
            const topicWithMostGuidesQuery = `
                SELECT t.id, COUNT(tg.id) as guide_count
                FROM topics t
                LEFT JOIN topic_guides tg ON t.id = tg.topic_id
                GROUP BY t.id
                ORDER BY guide_count DESC
                LIMIT 1
            `;

            const topGuidesTopic = this.db.prepare(topicWithMostGuidesQuery).get();
            const topicWithMostGuides = topGuidesTopic ? await this.getTopicById(topGuidesTopic.id) : null;

            // 获取FAQ最多的主题
            const topicWithMostFAQsQuery = `
                SELECT t.id, COUNT(tf.id) as faq_count
                FROM topics t
                LEFT JOIN topic_faqs tf ON t.id = tf.topic_id
                GROUP BY t.id
                ORDER BY faq_count DESC
                LIMIT 1
            `;

            const topFAQsTopic = this.db.prepare(topicWithMostFAQsQuery).get();
            const topicWithMostFAQs = topFAQsTopic ? await this.getTopicById(topFAQsTopic.id) : null;

            return {
                totalTopics: stats.total_topics,
                totalGuides: stats.total_guides,
                totalFAQs: stats.total_faqs,
                topicWithMostGuides,
                topicWithMostFAQs
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 获取推荐主题（基于当前主题）
     */
    async getRecommendedTopics(currentTopicId: number, limit = 3): Promise<TopicWithDetails[]> {
        const cacheKey = this.generateCacheKey('topics:recommended', currentTopicId, limit);

        return this.queryWithCache(cacheKey, async () => {
            // 获取当前主题的分组
            const currentGroups = await this.getTopicCalculatorGroups(currentTopicId);
            if (currentGroups.length === 0) {
                // 如果没有分组关联，返回最新的主题
                const recentQuery = `
                    SELECT id, slug, title, description, created_at, updated_at
                    FROM topics
                    WHERE id != ?
                    ORDER BY updated_at DESC
                    LIMIT ?
                `;

                const recentTopics = this.db.prepare(recentQuery).all(currentTopicId, limit);

                return await Promise.all(
                    recentTopics.map(async (row: any) => {
                        const [guides, faqs, calculatorGroups] = await Promise.all([
                            this.getTopicGuides(row.id),
                            this.getTopicFAQs(row.id),
                            this.getTopicCalculatorGroups(row.id)
                        ]);

                        return {
                            id: row.id,
                            slug: row.slug,
                            title: row.title,
                            description: row.description,
                            created_at: row.created_at,
                            updated_at: row.updated_at,
                            guides,
                            faqs,
                            calculatorGroups
                        };
                    })
                );
            }

            // 基于相同分组推荐其他主题
            const recommendations: TopicWithDetails[] = [];
            for (const group of currentGroups) {
                const relatedTopics = await this.getTopicsByCalculatorGroup(group);
                for (const topic of relatedTopics) {
                    if (topic.id !== currentTopicId && !recommendations.find(t => t.id === topic.id)) {
                        recommendations.push(topic);
                        if (recommendations.length >= limit) break;
                    }
                }
                if (recommendations.length >= limit) break;
            }

            return recommendations;
        }, this.defaultCacheTTL);
    }

    /**
     * 清除主题相关缓存
     */
    clearTopicsCache(): void {
        this.clearCache('topics');
    }
}

// 导出单例实例
export const topicsService = new TopicsService();
