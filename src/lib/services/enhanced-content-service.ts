import { BaseService } from './base';

export interface ContentTag {
    id: number;
    tagName: string;
    tagSlug: string;
    tagCategory: 'topic' | 'difficulty' | 'audience' | 'format' | 'calculator';
    description?: string;
    colorCode: string;
    usageCount: number;
    isFeatured: boolean;
    createdAt: string;
}

export interface ContentItemTag {
    contentId: number;
    tagId: number;
    relevanceScore: number;
    assignedAt: string;
    assignedBy: string;
    tag: ContentTag;
}

export interface QualityMetric {
    id: number;
    contentId: number;
    metricType: 'readability' | 'completeness' | 'accuracy' | 'seo' | 'engagement' | 'technical';
    score: number;
    maxScore: number;
    evaluationMethod: 'system' | 'manual' | 'automated';
    evaluationDate: string;
    evaluator: string;
    notes?: string;
    improvementSuggestions?: string;
}

export interface ContentRelationshipEnhanced {
    id: number;
    fromContentId: number;
    toContentId: number;
    relationshipType: 'prerequisite' | 'follow_up' | 'alternative' | 'related' | 'example' | 'reference';
    relationshipStrength: number;
    displayContext?: string;
    sortOrder: number;
    isBidirectional: boolean;
    isFeatured: boolean;
    createdAt: string;
    createdBy: string;
    relatedContent?: {
        id: number;
        slug: string;
        title: string;
        summary?: string;
        contentType: string;
    };
}

export interface StructuredData {
    id: number;
    contentId: number;
    schemaType: 'Article' | 'HowTo' | 'FAQ' | 'QAPage' | 'EducationalOrganization' | 'WebPage';
    structuredData: string; // JSON string
    isActive: boolean;
    generatedAt: string;
    lastUpdated: string;
    validationStatus: 'pending' | 'valid' | 'invalid' | 'warning';
    validationErrors?: string;
}

export interface EnhancedContentItem {
    // 基础内容信息 (来自现有content_items表)
    id: number;
    typeId: number;
    slug: string;
    title: string;
    summary?: string;
    content: string;
    status: string;
    readingTime?: number;
    
    // 现有扩展字段
    difficulty?: string;
    featured: boolean;
    priority: number;
    industry?: string;
    targetTool?: string;
    seoMetaDescription?: string;
    seoKeywords?: string;
    tags?: string; // JSON string from existing field
    
    createdAt: string;
    updatedAt: string;
    
    // 增强字段 (来自新表)
    enhancedTags: ContentTag[];
    qualityMetrics: QualityMetric[];
    relationships: ContentRelationshipEnhanced[];
    structuredData: StructuredData[];
    
    // 计算字段
    averageQualityScore: number;
    tagCount: number;
    relationshipCount: number;
}

export interface ContentListOptions {
    typeId?: number;
    status?: string;
    difficulty?: string;
    featured?: boolean;
    tagIds?: number[];
    search?: string;
    sortBy?: 'title' | 'created_at' | 'updated_at' | 'quality_score' | 'priority';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
}

export interface ContentListResult {
    items: EnhancedContentItem[];
    pagination: {
        total: number;
        page: number;
        pageSize: number;
        totalPages: number;
    };
    filters: {
        availableTags: ContentTag[];
        availableTypes: Array<{ id: number; name: string; displayName: string }>;
    };
}

/**
 * 增强的内容服务类
 * 在现有ContentService基础上添加新功能，保持向后兼容
 */
export class EnhancedContentService extends BaseService {
    private defaultCacheTTL = 15 * 60 * 1000; // 15分钟

    constructor() {
        super();
    }

    /**
     * 获取增强的内容项详情
     */
    async getEnhancedContentById(id: number): Promise<EnhancedContentItem | null> {
        const cacheKey = this.generateCacheKey('enhanced-content:detail', id);

        return this.queryWithCache(cacheKey, async () => {
            // 获取基础内容信息
            const contentQuery = `
                SELECT 
                    ci.*,
                    ct.type_name,
                    ct.display_name as type_display_name
                FROM content_items ci
                JOIN content_types ct ON ci.type_id = ct.id
                WHERE ci.id = ?
            `;

            const content = this.db.prepare(contentQuery).get(id) as any;
            if (!content) return null;

            // 并行获取增强数据
            const [enhancedTags, qualityMetrics, relationships, structuredData] = await Promise.all([
                this.getContentTags(id),
                this.getQualityMetrics(id),
                this.getContentRelationships(id),
                this.getStructuredData(id)
            ]);

            // 计算平均质量分数
            const averageQualityScore = qualityMetrics.length > 0 
                ? Math.round(qualityMetrics.reduce((sum, m) => sum + m.score, 0) / qualityMetrics.length)
                : 0;

            return {
                id: content.id,
                typeId: content.type_id,
                slug: content.slug,
                title: content.title,
                summary: content.summary,
                content: content.content,
                status: content.status,
                readingTime: content.reading_time,
                difficulty: content.difficulty,
                featured: Boolean(content.featured),
                priority: content.priority || 0,
                industry: content.industry,
                targetTool: content.target_tool,
                seoMetaDescription: content.seo_meta_description,
                seoKeywords: content.seo_keywords,
                tags: content.tags,
                createdAt: content.created_at,
                updatedAt: content.updated_at,
                
                enhancedTags,
                qualityMetrics,
                relationships,
                structuredData,
                
                averageQualityScore,
                tagCount: enhancedTags.length,
                relationshipCount: relationships.length
            } as EnhancedContentItem;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取内容的标签
     */
    async getContentTags(contentId: number): Promise<ContentTag[]> {
        const query = `
            SELECT 
                ct.*,
                cit.relevance_score,
                cit.assigned_at,
                cit.assigned_by
            FROM content_tags ct
            JOIN content_item_tags cit ON ct.id = cit.tag_id
            WHERE cit.content_id = ?
            ORDER BY cit.relevance_score DESC, ct.tag_name ASC
        `;

        return this.db.prepare(query).all(contentId).map((row: any) => ({
            id: row.id,
            tagName: row.tag_name,
            tagSlug: row.tag_slug,
            tagCategory: row.tag_category,
            description: row.description,
            colorCode: row.color_code,
            usageCount: row.usage_count,
            isFeatured: Boolean(row.is_featured),
            createdAt: row.created_at
        })) as ContentTag[];
    }

    /**
     * 为内容添加标签
     */
    async addContentTag(contentId: number, tagId: number, relevanceScore = 5): Promise<void> {
        const query = `
            INSERT OR REPLACE INTO content_item_tags (content_id, tag_id, relevance_score, assigned_at)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP)
        `;
        
        this.db.prepare(query).run(contentId, tagId, relevanceScore);
        
        // 更新标签使用计数 (触发器会自动处理)
        
        // 清除相关缓存
        this.clearCache(`enhanced-content:${contentId}`);
        this.clearCache('enhanced-content:list');
    }

    /**
     * 移除内容标签
     */
    async removeContentTag(contentId: number, tagId: number): Promise<void> {
        const query = `DELETE FROM content_item_tags WHERE content_id = ? AND tag_id = ?`;
        this.db.prepare(query).run(contentId, tagId);
        
        // 清除缓存
        this.clearCache(`enhanced-content:${contentId}`);
        this.clearCache('enhanced-content:list');
    }

    /**
     * 获取内容的质量评估
     */
    async getQualityMetrics(contentId: number): Promise<QualityMetric[]> {
        const query = `
            SELECT *
            FROM content_quality_metrics
            WHERE content_id = ?
            ORDER BY evaluation_date DESC
        `;

        return this.db.prepare(query).all(contentId).map((row: any) => ({
            id: row.id,
            contentId: row.content_id,
            metricType: row.metric_type,
            score: row.score,
            maxScore: row.max_score,
            evaluationMethod: row.evaluation_method,
            evaluationDate: row.evaluation_date,
            evaluator: row.evaluator,
            notes: row.notes,
            improvementSuggestions: row.improvement_suggestions
        })) as QualityMetric[];
    }

    /**
     * 记录质量评估
     */
    async recordQualityMetric(
        contentId: number,
        metricType: QualityMetric['metricType'],
        score: number,
        evaluationMethod = 'system',
        evaluator = 'system',
        notes?: string,
        improvementSuggestions?: string
    ): Promise<void> {
        const query = `
            INSERT INTO content_quality_metrics 
            (content_id, metric_type, score, evaluation_method, evaluator, notes, improvement_suggestions)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;
        
        this.db.prepare(query).run(
            contentId, metricType, score, evaluationMethod, evaluator, notes, improvementSuggestions
        );
        
        // 清除缓存
        this.clearCache(`enhanced-content:${contentId}`);
    }

    /**
     * 获取内容关联关系
     */
    async getContentRelationships(contentId: number): Promise<ContentRelationshipEnhanced[]> {
        const query = `
            SELECT 
                cre.*,
                ci.slug as related_slug,
                ci.title as related_title,
                ci.summary as related_summary,
                ct.display_name as related_type
            FROM content_relationships_enhanced cre
            JOIN content_items ci ON cre.to_content_id = ci.id
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE cre.from_content_id = ? AND ci.status = 'published'
            ORDER BY cre.relationship_strength DESC, cre.sort_order ASC
        `;

        return this.db.prepare(query).all(contentId).map((row: any) => ({
            id: row.id,
            fromContentId: row.from_content_id,
            toContentId: row.to_content_id,
            relationshipType: row.relationship_type,
            relationshipStrength: row.relationship_strength,
            displayContext: row.display_context,
            sortOrder: row.sort_order,
            isBidirectional: Boolean(row.is_bidirectional),
            isFeatured: Boolean(row.is_featured),
            createdAt: row.created_at,
            createdBy: row.created_by,
            relatedContent: {
                id: row.to_content_id,
                slug: row.related_slug,
                title: row.related_title,
                summary: row.related_summary,
                contentType: row.related_type
            }
        })) as ContentRelationshipEnhanced[];
    }

    /**
     * 创建内容关联
     */
    async createContentRelationship(
        fromContentId: number,
        toContentId: number,
        relationshipType: ContentRelationshipEnhanced['relationshipType'],
        relationshipStrength = 5,
        displayContext?: string,
        isBidirectional = false
    ): Promise<void> {
        const query = `
            INSERT INTO content_relationships_enhanced 
            (from_content_id, to_content_id, relationship_type, relationship_strength, display_context, is_bidirectional)
            VALUES (?, ?, ?, ?, ?, ?)
        `;
        
        this.db.prepare(query).run(
            fromContentId, toContentId, relationshipType, relationshipStrength, displayContext, isBidirectional
        );
        
        // 如果是双向关系，创建反向关联
        if (isBidirectional) {
            this.db.prepare(query).run(
                toContentId, fromContentId, relationshipType, relationshipStrength, displayContext, true
            );
        }
        
        // 清除缓存
        this.clearCache(`enhanced-content:${fromContentId}`);
        if (isBidirectional) {
            this.clearCache(`enhanced-content:${toContentId}`);
        }
    }

    /**
     * 获取结构化数据
     */
    async getStructuredData(contentId: number): Promise<StructuredData[]> {
        const query = `
            SELECT *
            FROM content_structured_data
            WHERE content_id = ? AND is_active = 1
            ORDER BY schema_type
        `;

        return this.db.prepare(query).all(contentId).map((row: any) => ({
            id: row.id,
            contentId: row.content_id,
            schemaType: row.schema_type,
            structuredData: row.structured_data,
            isActive: Boolean(row.is_active),
            generatedAt: row.generated_at,
            lastUpdated: row.last_updated,
            validationStatus: row.validation_status,
            validationErrors: row.validation_errors
        })) as StructuredData[];
    }

    /**
     * 更新结构化数据
     */
    async updateStructuredData(
        contentId: number,
        schemaType: StructuredData['schemaType'],
        structuredData: object
    ): Promise<void> {
        const query = `
            INSERT OR REPLACE INTO content_structured_data 
            (content_id, schema_type, structured_data, last_updated, validation_status)
            VALUES (?, ?, ?, CURRENT_TIMESTAMP, 'pending')
        `;
        
        this.db.prepare(query).run(contentId, schemaType, JSON.stringify(structuredData));
        
        // 清除缓存
        this.clearCache(`enhanced-content:${contentId}`);
    }

    /**
     * 获取增强的内容列表
     */
    async getEnhancedContentList(options: ContentListOptions = {}): Promise<ContentListResult> {
        const {
            typeId,
            status = 'published',
            difficulty,
            featured,
            tagIds = [],
            search,
            sortBy = 'updated_at',
            sortOrder = 'DESC',
            page = 1,
            pageSize = 20
        } = options;

        const cacheKey = this.generateCacheKey('enhanced-content:list', JSON.stringify(options));

        return this.queryWithCache(cacheKey, async () => {
            // 构建查询条件
            let whereClause = 'WHERE 1=1';
            let joinClause = '';
            const params: any[] = [];

            if (status) {
                whereClause += ' AND ci.status = ?';
                params.push(status);
            }

            if (typeId) {
                whereClause += ' AND ci.type_id = ?';
                params.push(typeId);
            }

            if (difficulty) {
                whereClause += ' AND ci.difficulty = ?';
                params.push(difficulty);
            }

            if (featured !== undefined) {
                whereClause += ' AND ci.featured = ?';
                params.push(featured ? 1 : 0);
            }

            // 标签过滤
            if (tagIds.length > 0) {
                joinClause += ' JOIN content_item_tags cit ON ci.id = cit.content_id';
                whereClause += ` AND cit.tag_id IN (${tagIds.map(() => '?').join(', ')})`;
                params.push(...tagIds);
            }

            // 搜索功能
            if (search) {
                joinClause += ' JOIN content_search cs ON ci.id = cs.rowid';
                whereClause += ' AND cs MATCH ?';
                params.push(search);
            }

            // 基础查询
            const baseQuery = `
                FROM content_items ci
                JOIN content_types ct ON ci.type_id = ct.id
                ${joinClause}
                ${whereClause}
            `;

            // 计数查询
            const countQuery = `SELECT COUNT(DISTINCT ci.id) as count ${baseQuery}`;
            const countResult = this.db.prepare(countQuery).get(...params) as { count: number };

            // 数据查询
            const dataQuery = `
                SELECT DISTINCT
                    ci.*,
                    ct.type_name,
                    ct.display_name as type_display_name,
                    (SELECT AVG(score) FROM content_quality_metrics WHERE content_id = ci.id) as avg_quality_score,
                    (SELECT COUNT(*) FROM content_item_tags WHERE content_id = ci.id) as tag_count,
                    (SELECT COUNT(*) FROM content_relationships_enhanced WHERE from_content_id = ci.id) as relationship_count
                ${baseQuery}
                ORDER BY ci.${sortBy} ${sortOrder}
                LIMIT ? OFFSET ?
            `;

            params.push(pageSize, (page - 1) * pageSize);
            const dataResults = this.db.prepare(dataQuery).all(...params);

            // 获取每个内容的标签
            const items = await Promise.all(
                dataResults.map(async (item: any) => {
                    const enhancedTags = await this.getContentTags(item.id);
                    
                    return {
                        id: item.id,
                        typeId: item.type_id,
                        slug: item.slug,
                        title: item.title,
                        summary: item.summary,
                        content: item.content,
                        status: item.status,
                        readingTime: item.reading_time,
                        difficulty: item.difficulty,
                        featured: Boolean(item.featured),
                        priority: item.priority || 0,
                        industry: item.industry,
                        targetTool: item.target_tool,
                        seoMetaDescription: item.seo_meta_description,
                        seoKeywords: item.seo_keywords,
                        tags: item.tags,
                        createdAt: item.created_at,
                        updatedAt: item.updated_at,
                        
                        enhancedTags,
                        qualityMetrics: [], // 列表页不加载详细质量数据
                        relationships: [], // 列表页不加载关联数据
                        structuredData: [], // 列表页不加载结构化数据
                        
                        averageQualityScore: Math.round(item.avg_quality_score || 0),
                        tagCount: item.tag_count || 0,
                        relationshipCount: item.relationship_count || 0
                    } as EnhancedContentItem;
                })
            );

            // 获取过滤器数据
            const [availableTags, availableTypes] = await Promise.all([
                this.getAvailableTags(),
                this.getAvailableContentTypes()
            ]);

            return {
                items,
                pagination: {
                    total: countResult.count,
                    page,
                    pageSize,
                    totalPages: Math.ceil(countResult.count / pageSize)
                },
                filters: {
                    availableTags,
                    availableTypes
                }
            };
        }, this.defaultCacheTTL / 2); // 列表数据缓存时间较短
    }

    /**
     * 获取可用标签
     */
    async getAvailableTags(): Promise<ContentTag[]> {
        const query = `
            SELECT *
            FROM content_tags
            ORDER BY is_featured DESC, usage_count DESC, tag_name ASC
        `;

        return this.db.prepare(query).all().map((row: any) => ({
            id: row.id,
            tagName: row.tag_name,
            tagSlug: row.tag_slug,
            tagCategory: row.tag_category,
            description: row.description,
            colorCode: row.color_code,
            usageCount: row.usage_count,
            isFeatured: Boolean(row.is_featured),
            createdAt: row.created_at
        })) as ContentTag[];
    }

    /**
     * 获取可用内容类型
     */
    async getAvailableContentTypes(): Promise<Array<{ id: number; name: string; displayName: string }>> {
        const query = `
            SELECT id, type_name as name, display_name
            FROM content_types
            ORDER BY display_name
        `;

        return this.db.prepare(query).all() as Array<{ id: number; name: string; displayName: string }>;
    }

    /**
     * 批量更新内容质量评分
     */
    async batchUpdateQualityScores(): Promise<{ updated: number; errors: string[] }> {
        const result = { updated: 0, errors: [] as string[] };

        try {
            // 获取所有已发布的内容
            const contents = this.db.prepare(`
                SELECT id, title, content, summary, seo_meta_description 
                FROM content_items 
                WHERE status = 'published'
            `).all();

            for (const content of contents) {
                try {
                    // 计算各项质量指标
                    const completenessScore = this.calculateCompletenessScore(content);
                    const readabilityScore = this.calculateReadabilityScore(content);
                    const seoScore = this.calculateSEOScore(content);

                    // 记录评估结果
                    await this.recordQualityMetric(content.id, 'completeness', completenessScore, 'automated', 'batch_update');
                    await this.recordQualityMetric(content.id, 'readability', readabilityScore, 'automated', 'batch_update');
                    await this.recordQualityMetric(content.id, 'seo', seoScore, 'automated', 'batch_update');

                    result.updated++;
                } catch (error) {
                    result.errors.push(`Content ${content.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
                }
            }

            // 清除相关缓存
            this.clearCache('enhanced-content');

        } catch (error) {
            result.errors.push(`Batch update failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }

        return result;
    }

    // 私有辅助方法
    private calculateCompletenessScore(content: any): number {
        let score = 40; // 基础分

        if (content.summary) score += 20;
        if (content.seo_meta_description) score += 15;
        if (content.content && content.content.length > 1000) score += 15;
        if (content.content && content.content.includes('##')) score += 10; // 有标题结构

        return Math.min(score, 100);
    }

    private calculateReadabilityScore(content: any): number {
        let score = 50; // 基础分

        if (content.content) {
            // 检查段落结构
            if (content.content.includes('\n\n')) score += 15;
            // 检查列表
            if (content.content.includes('- ') || content.content.includes('1. ')) score += 15;
            // 检查标题
            if (content.content.includes('##')) score += 20;
        }

        return Math.min(score, 100);
    }

    private calculateSEOScore(content: any): number {
        let score = 30; // 基础分

        if (content.seo_meta_description) score += 25;
        if (content.title && content.title.length <= 60) score += 20;
        if (content.title && content.title.length >= 30) score += 15;
        if (content.summary && content.summary.length <= 160) score += 10;

        return Math.min(score, 100);
    }

    /**
     * 清除增强内容相关缓存
     */
    clearEnhancedContentCache(): void {
        this.clearCache('enhanced-content');
    }
}

// 导出单例实例
export const enhancedContentService = new EnhancedContentService();