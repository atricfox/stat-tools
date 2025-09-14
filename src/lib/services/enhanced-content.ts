import Database from 'better-sqlite3';
import { BaseService } from './base';

/**
 * 增强内容服务层
 * 支持新的内容数据结构和高级查询功能
 */

// 类型定义
export interface ContentWithFullDetails {
    id: number;
    slug: string;
    title: string;
    type: string;
    summary: string;
    content: string;
    status: string;
    category?: string;
    priority?: number;
    featured?: boolean;
    difficulty?: string;
    industry?: string;
    targetTool?: string;
    readingTime?: number;
    tags?: string[];
    createdAt: string;
    updatedAt: string;
    relationships?: ContentRelationship[];
    relatedTools?: RelatedTool[];
    relatedTerms?: RelatedTerm[];
    seo?: SEOMetadata;
    details?: ContentDetails;
}

export interface ContentRelationship {
    id: number;
    fromContentId: number;
    toContentId: number;
    relationshipType: string;
    relatedTitle?: string;
    relatedType?: string;
    createdAt: string;
}

export interface RelatedTool {
    toolUrl: string;
    relationshipType: string;
}

export interface RelatedTerm {
    termSlug: string;
    relationshipType: string;
    termTitle?: string;
}

export interface SEOMetadata {
    metaDescription?: string;
    keywords?: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
}

export interface ContentDetails {
    steps?: HowToStep[];
    caseDetails?: CaseDetails;
}

export interface HowToStep {
    id: number;
    stepId: string;
    name: string;
    description: string;
    tip?: string;
    warning?: string;
    stepOrder: number;
}

export interface CaseDetails {
    problem?: string;
    solution?: string;
    results?: any[];
    lessons?: any[];
    toolsUsed?: any[];
    background?: string;
    challenge?: string;
    approach?: any;
    resultsDetail?: any;
    keyInsights?: any[];
    recommendations?: any[];
}

export interface AdvancedSearchOptions {
    query?: string;
    type?: string;
    difficulty?: string;
    industry?: string;
    featured?: boolean;
    targetTool?: string;
    tags?: string[];
    category?: string;
    sortBy?: 'created_at' | 'updated_at' | 'title' | 'priority' | 'reading_time';
    sortOrder?: 'asc' | 'desc';
    limit?: number;
    offset?: number;
}

export interface ContentSearchResult {
    items: ContentWithFullDetails[];
    total: number;
    page: number;
    pageSize: number;
    hasNext: boolean;
}

export class EnhancedContentService extends BaseService {
    constructor(db: Database.Database) {
        super(db);
    }

    // 获取内容完整详情
    async getContentWithFullDetails(id: number): Promise<ContentWithFullDetails | null> {
        const cacheKey = `content_full_${id}`;
        return this.queryWithCache(cacheKey, async () => {
            const content = await this.getContentById(id);
            if (!content) return null;

            const [relationships, tools, terms, seo] = await Promise.all([
                this.getContentRelationships(id),
                this.getRelatedTools(id),
                this.getRelatedTerms(id),
                this.getSEOMetadata(id)
            ]);

            // 根据类型获取详细信息
            let details: ContentDetails = {};
            if (content.type === 'howto') {
                details.steps = await this.getHowToSteps(id);
            } else if (content.type === 'case') {
                details.caseDetails = await this.getCaseDetails(id);
            }

            return {
                id: content.id,
                slug: content.slug,
                title: content.title,
                type: content.type,
                summary: content.summary,
                content: content.content,
                status: content.status,
                category: content.category,
                priority: content.priority,
                featured: content.featured,
                difficulty: content.difficulty,
                industry: content.industry,
                targetTool: content.targetTool,
                readingTime: content.readingTime,
                tags: content.tags,
                createdAt: content.createdAt,
                updatedAt: content.updatedAt,
                relationships,
                relatedTools: tools,
                relatedTerms: terms,
                seo,
                details
            };
        }, 30 * 60 * 1000); // 30分钟缓存
    }

    // 获取内容关系
    async getContentRelationships(contentId: number): Promise<ContentRelationship[]> {
        const cacheKey = `content_relationships_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            return this.db.prepare(`
                SELECT cr.*, ci.title as related_title, ci.type as related_type
                FROM content_relationships cr
                JOIN content_items ci ON cr.to_content_id = ci.id
                WHERE cr.from_content_id = ?
                ORDER BY cr.relationship_type, ci.title
            `).all(contentId) as ContentRelationship[];
        }, 15 * 60 * 1000); // 15分钟缓存
    }

    // 获取关联工具
    async getRelatedTools(contentId: number): Promise<RelatedTool[]> {
        const cacheKey = `content_tools_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            return this.db.prepare(`
                SELECT tool_url, relationship_type
                FROM content_tool_relationships
                WHERE content_id = ?
                ORDER BY relationship_type, tool_url
            `).all(contentId) as RelatedTool[];
        }, 15 * 60 * 1000);
    }

    // 获取关联术语
    async getRelatedTerms(contentId: number): Promise<RelatedTerm[]> {
        const cacheKey = `content_terms_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            return this.db.prepare(`
                SELECT ctr.term_slug, ctr.relationship_type, t.title as term_title
                FROM content_term_relationships ctr
                LEFT JOIN glossary_terms t ON ctr.term_slug = t.slug
                WHERE ctr.content_id = ?
                ORDER BY ctr.relationship_type, t.title
            `).all(contentId) as RelatedTerm[];
        }, 15 * 60 * 1000);
    }

    // 获取SEO元数据
    async getSEOMetadata(contentId: number): Promise<SEOMetadata | null> {
        const cacheKey = `content_seo_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            const seo = this.db.prepare(`
                SELECT meta_description, keywords, og_title, og_description, og_image, twitter_card
                FROM seo_metadata
                WHERE content_id = ?
            `).get(contentId) as any;

            if (!seo) return null;

            return {
                metaDescription: seo.meta_description,
                keywords: seo.keywords ? JSON.parse(seo.keywords) : [],
                ogTitle: seo.og_title,
                ogDescription: seo.og_description,
                ogImage: seo.og_image,
                twitterCard: seo.twitter_card
            };
        }, 30 * 60 * 1000);
    }

    // 获取How-to步骤
    async getHowToSteps(contentId: number): Promise<HowToStep[]> {
        const cacheKey = `content_steps_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            return this.db.prepare(`
                SELECT id, step_id as stepId, name, description, tip, warning, step_order as stepOrder
                FROM howto_steps
                WHERE content_id = ?
                ORDER BY step_order
            `).all(contentId) as HowToStep[];
        }, 30 * 60 * 1000);
    }

    // 获取案例详情
    async getCaseDetails(contentId: number): Promise<CaseDetails | null> {
        const cacheKey = `content_case_${contentId}`;
        return this.queryWithCache(cacheKey, async () => {
            const details = this.db.prepare(`
                SELECT problem, solution, results, lessons, tools_used as toolsUsed,
                       background, challenge, approach, results_detail as resultsDetail,
                       key_insights as keyInsights, recommendations
                FROM case_details
                WHERE content_id = ?
            `).get(contentId) as any;

            if (!details) return null;

            return {
                problem: details.problem,
                solution: details.solution,
                results: details.results ? JSON.parse(details.results) : [],
                lessons: details.lessons ? JSON.parse(details.lessons) : [],
                toolsUsed: details.toolsUsed ? JSON.parse(details.toolsUsed) : [],
                background: details.background,
                challenge: details.challenge,
                approach: details.approach ? JSON.parse(details.approach) : {},
                resultsDetail: details.resultsDetail ? JSON.parse(details.resultsDetail) : {},
                keyInsights: details.keyInsights ? JSON.parse(details.keyInsights) : [],
                recommendations: details.recommendations ? JSON.parse(details.recommendations) : []
            };
        }, 30 * 60 * 1000);
    }

    // 高级搜索
    async searchContentAdvanced(options: AdvancedSearchOptions): Promise<ContentSearchResult> {
        const cacheKey = `content_search_${JSON.stringify(options)}`;
        return this.queryWithCache(cacheKey, async () => {
            const conditions: string[] = ['ci.status = "published"'];
            const params: any[] = [];

            // 构建搜索条件
            if (options.query) {
                conditions.push('(ci.title LIKE ? OR ci.summary LIKE ? OR ci.content LIKE ?)');
                const queryPattern = `%${options.query}%`;
                params.push(queryPattern, queryPattern, queryPattern);
            }

            if (options.type) {
                conditions.push('ci.type = ?');
                params.push(options.type);
            }

            if (options.difficulty) {
                conditions.push('ci.difficulty = ?');
                params.push(options.difficulty);
            }

            if (options.industry) {
                conditions.push('ci.industry = ?');
                params.push(options.industry);
            }

            if (options.featured !== undefined) {
                conditions.push('ci.featured = ?');
                params.push(options.featured ? 1 : 0);
            }

            if (options.targetTool) {
                conditions.push('ci.target_tool = ?');
                params.push(options.targetTool);
            }

            if (options.category) {
                conditions.push('ci.category = ?');
                params.push(options.category);
            }

            if (options.tags && options.tags.length > 0) {
                const tagConditions = options.tags.map(() => 'ci.tags LIKE ?');
                conditions.push(`(${tagConditions.join(' OR ')})`);
                options.tags.forEach(tag => params.push(`%"${tag}"%`));
            }

            const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

            // 获取总数
            const countQuery = `
                SELECT COUNT(*) as total
                FROM content_items ci
                ${whereClause}
            `;
            const { total } = this.db.prepare(countQuery).get(...params) as any;

            // 获取分页数据
            const limit = options.limit || 10;
            const offset = options.offset || 0;

            const dataQuery = `
                SELECT ci.*,
                       CASE
                           WHEN ci.type = 'howto' THEN (SELECT COUNT(*) FROM howto_steps hs WHERE hs.content_id = ci.id)
                           ELSE 0
                       END as step_count,
                       CASE
                           WHEN ci.type = 'case' THEN (SELECT 1 FROM case_details cd WHERE cd.content_id = ci.id)
                           ELSE 0
                       END as has_details
                FROM content_items ci
                ${whereClause}
                ORDER BY ${this.getOrderByClause(options.sortBy, options.sortOrder)}
                LIMIT ? OFFSET ?
            `;

            params.push(limit, offset);
            const items = this.db.prepare(dataQuery).all(...params);

            // 转换为完整格式
            const fullItems: ContentWithFullDetails[] = [];
            for (const item of items as any[]) {
                const fullItem = await this.getContentWithFullDetails(item.id);
                if (fullItem) {
                    fullItems.push(fullItem);
                }
            }

            return {
                items: fullItems,
                total,
                page: Math.floor(offset / limit) + 1,
                pageSize: limit,
                hasNext: offset + limit < total
            };
        }, 5 * 60 * 1000); // 5分钟缓存
    }

    // 获取推荐内容
    async getRecommendedContent(contentId: number, limit: number = 5): Promise<ContentWithFullDetails[]> {
        const cacheKey = `content_recommendations_${contentId}_${limit}`;
        return this.queryWithCache(cacheKey, async () => {
            // 获取当前内容
            const currentContent = await this.getContentById(contentId);
            if (!currentContent) return [];

            // 基于关系的推荐
            const relatedContent = this.db.prepare(`
                SELECT DISTINCT ci.*
                FROM content_relationships cr
                JOIN content_items ci ON cr.to_content_id = ci.id
                WHERE cr.from_content_id = ? AND ci.id != ? AND ci.status = 'published'
                UNION
                SELECT DISTINCT ci.*
                FROM content_relationships cr
                JOIN content_items ci ON cr.from_content_id = ci.id
                WHERE cr.to_content_id = ? AND ci.id != ? AND ci.status = 'published'
                ORDER BY ci.featured DESC, ci.priority DESC, ci.updated_at DESC
                LIMIT ?
            `).all(contentId, contentId, contentId, contentId, limit);

            // 转换为完整格式
            const recommendations: ContentWithFullDetails[] = [];
            for (const item of relatedContent as any[]) {
                const fullItem = await this.getContentWithFullDetails(item.id);
                if (fullItem) {
                    recommendations.push(fullItem);
                }
            }

            return recommendations;
        }, 10 * 60 * 1000); // 10分钟缓存
    }

    // 获取特色内容
    async getFeaturedContent(type?: string, limit: number = 10): Promise<ContentWithFullDetails[]> {
        const cacheKey = `content_featured_${type || 'all'}_${limit}`;
        return this.queryWithCache(cacheKey, async () => {
            const conditions: string[] = ['ci.featured = 1', 'ci.status = "published"'];
            const params: any[] = [];

            if (type) {
                conditions.push('ci.type = ?');
                params.push(type);
            }

            const whereClause = `WHERE ${conditions.join(' AND ')}`;

            const query = `
                SELECT ci.*
                FROM content_items ci
                ${whereClause}
                ORDER BY ci.priority DESC, ci.updated_at DESC
                LIMIT ?
            `;

            params.push(limit);
            const items = this.db.prepare(query).all(...params);

            // 转换为完整格式
            const featuredItems: ContentWithFullDetails[] = [];
            for (const item of items as any[]) {
                const fullItem = await this.getContentWithFullDetails(item.id);
                if (fullItem) {
                    featuredItems.push(fullItem);
                }
            }

            return featuredItems;
        }, 15 * 60 * 1000); // 15分钟缓存
    }

    // 获取内容统计
    async getContentStatistics(): Promise<{
        total: number;
        byType: Record<string, number>;
        byStatus: Record<string, number>;
        featuredCount: number;
        averageReadingTime: number;
    }> {
        const cacheKey = 'content_statistics';
        return this.queryWithCache(cacheKey, async () => {
            const stats = this.db.prepare(`
                SELECT
                    COUNT(*) as total,
                    type,
                    status,
                    SUM(featured) as featured_count,
                    AVG(reading_time) as avg_reading_time
                FROM content_items
                GROUP BY type, status
            `).all() as any[];

            const result = {
                total: 0,
                byType: {},
                byStatus: {},
                featuredCount: 0,
                averageReadingTime: 0
            };

            let totalReadingTime = 0;
            let contentCount = 0;

            for (const stat of stats) {
                result.total += stat.total;
                result.byType[stat.type] = (result.byType[stat.type] || 0) + stat.total;
                result.byStatus[stat.status] = (result.byStatus[stat.status] || 0) + stat.total;
                result.featuredCount += stat.featured_count || 0;

                if (stat.avg_reading_time) {
                    totalReadingTime += stat.avg_reading_time * stat.total;
                    contentCount += stat.total;
                }
            }

            result.averageReadingTime = contentCount > 0 ? totalReadingTime / contentCount : 0;

            return result;
        }, 5 * 60 * 1000); // 5分钟缓存
    }

    // 辅助方法
    private getOrderByClause(sortBy?: string, sortOrder?: string): string {
        const validSortColumns = [
            'created_at', 'updated_at', 'title', 'priority', 'reading_time',
            'featured', 'difficulty', 'industry'
        ];

        const column = validSortColumns.includes(sortBy || '') ? sortBy : 'updated_at';
        const order = sortOrder === 'asc' ? 'ASC' : 'DESC';

        return `ci.${column} ${order}`;
    }

    private async getContentById(id: number): Promise<any> {
        return this.db.prepare(`
            SELECT
                id, slug, title, type, summary, content, status,
                category, priority, featured, difficulty, industry,
                target_tool as targetTool, reading_time as readingTime, tags,
                created_at as createdAt, updated_at as updatedAt
            FROM content_items
            WHERE id = ?
        `).get(id);
    }
}