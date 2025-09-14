/**
 * Enhanced Content Service
 * 基于数据库的内容服务层，支持增强的内容类型和关系
 */

import Database from 'better-sqlite3';
import { getDatabase } from '../db/client';

// 内容项接口
export interface ContentItem {
    id: number;
    type: string;
    slug: string;
    title: string;
    summary: string;
    content: string;
    status: string;
    readingTime: number;
    createdAt: string;
    updatedAt: string;
    difficulty?: string;
    featured: boolean;
    priority: number;
    industry?: string;
    targetTool?: string;
    tags: string[];
    seoMetaDescription?: string;
    seoKeywords: string[];
}

// How-to步骤接口
export interface HowToStep {
    id: number;
    contentId: number;
    stepId: string;
    name: string;
    description: string;
    tip?: string;
    warning?: string;
    stepOrder: number;
}

// 案例详细信息接口
export interface CaseDetail {
    contentId: number;
    problem?: string;
    solution?: string;
    results: string[];
    lessons: string[];
    toolsUsed: string[];
    background?: string;
    challenge?: string;
    approach: any;
    resultsDetail: any;
    keyInsights: string[];
    recommendations: string[];
}

// SEO元数据接口
export interface SEOMetadata {
    contentId: number;
    metaDescription?: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
}

// 内容关系接口
export interface ContentRelationship {
    id: number;
    fromContentId: number;
    toContentId: number;
    relationshipType: string;
    createdAt: string;
}

// 工具关系接口
export interface ToolRelationship {
    id: number;
    contentId: number;
    toolUrl: string;
    relationshipType: string;
    createdAt: string;
}

// 术语关系接口
export interface TermRelationship {
    id: number;
    contentId: number;
    termSlug: string;
    relationshipType: string;
    createdAt: string;
}

// 内容查询选项
export interface ContentQueryOptions {
    type?: string;
    tags?: string[];
    difficulty?: string;
    industry?: string;
    featured?: boolean;
    limit?: number;
    offset?: number;
    sortBy?: 'created' | 'updated' | 'title' | 'priority';
    sortOrder?: 'asc' | 'desc';
}

// 内容统计信息
export interface ContentStats {
    totalItems: number;
    byType: Record<string, number>;
    byDifficulty: Record<string, number>;
    byIndustry: Record<string, number>;
    totalRelationships: number;
    totalSteps: number;
}

/**
 * 增强的内容服务类
 */
export class ContentService {
    private db: Database.Database;

    constructor() {
        this.db = getDatabase();
    }

    /**
     * 获取内容项
     */
    getContentItem(id: number): ContentItem | null {
        const item = this.db.prepare(`
            SELECT
                ci.*,
                ct.type_name as type,
                sm.meta_description as seo_meta_description,
                sm.keywords as seo_keywords
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE ci.id = ?
        `).get(id) as any;

        if (!item) return null;

        return {
            id: item.id,
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            status: item.status,
            readingTime: item.reading_time,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            difficulty: item.difficulty,
            featured: item.featured,
            priority: item.priority,
            industry: item.industry,
            targetTool: item.target_tool,
            tags: JSON.parse(item.tags || '[]'),
            seoMetaDescription: item.seo_meta_description,
            seoKeywords: JSON.parse(item.seo_keywords || '[]')
        };
    }

    /**
     * 根据slug获取内容项
     */
    getContentItemBySlug(slug: string, type?: string): ContentItem | null {
        let query = `
            SELECT
                ci.*,
                ct.type_name as type,
                sm.meta_description as seo_meta_description,
                sm.keywords as seo_keywords
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE ci.slug = ?
        `;
        const params: any[] = [slug];

        if (type) {
            query += ' AND ct.type_name = ?';
            params.push(type);
        }

        const item = this.db.prepare(query).get(...params) as any;

        if (!item) return null;

        return {
            id: item.id,
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            status: item.status,
            readingTime: item.reading_time,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            difficulty: item.difficulty,
            featured: item.featured,
            priority: item.priority,
            industry: item.industry,
            targetTool: item.target_tool,
            tags: JSON.parse(item.tags || '[]'),
            seoMetaDescription: item.seo_meta_description,
            seoKeywords: JSON.parse(item.seo_keywords || '[]')
        };
    }

    /**
     * 查询内容列表
     */
    queryContent(options: ContentQueryOptions = {}): ContentItem[] {
        const {
            type,
            tags,
            difficulty,
            industry,
            featured,
            limit = 20,
            offset = 0,
            sortBy = 'updated',
            sortOrder = 'desc'
        } = options;

        let whereClause = '';
        const params: any[] = [];

        if (type) {
            whereClause += ' AND ct.type_name = ?';
            params.push(type);
        }

        if (difficulty) {
            whereClause += ' AND ci.difficulty = ?';
            params.push(difficulty);
        }

        if (industry) {
            whereClause += ' AND ci.industry = ?';
            params.push(industry);
        }

        if (featured !== undefined) {
            whereClause += ' AND ci.featured = ?';
            params.push(featured);
        }

        if (tags && tags.length > 0) {
            const tagConditions = tags.map(() => 'ci.tags LIKE ?').join(' OR ');
            whereClause += ` AND (${tagConditions})`;
            tags.forEach(tag => params.push(`%"${tag}"%`));
        }

        const orderClause = ` ORDER BY ci.${sortBy === 'created' ? 'created_at' : sortBy === 'title' ? 'title' : 'updated_at'} ${sortOrder.toUpperCase()}`;

        const query = `
            SELECT
                ci.*,
                ct.type_name as type,
                sm.meta_description as seo_meta_description,
                sm.keywords as seo_keywords
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE 1=1 ${whereClause}
            ${orderClause}
            LIMIT ? OFFSET ?
        `;

        params.push(limit, offset);

        const items = this.db.prepare(query).all(...params) as any[];

        return items.map(item => ({
            id: item.id,
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            status: item.status,
            readingTime: item.reading_time,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            difficulty: item.difficulty,
            featured: item.featured,
            priority: item.priority,
            industry: item.industry,
            targetTool: item.target_tool,
            tags: JSON.parse(item.tags || '[]'),
            seoMetaDescription: item.seo_meta_description,
            seoKeywords: JSON.parse(item.seo_keywords || '[]')
        }));
    }

    /**
     * 获取How-to步骤
     */
    getHowToSteps(contentId: number): HowToStep[] {
        const steps = this.db.prepare(`
            SELECT * FROM howto_steps
            WHERE content_id = ?
            ORDER BY step_order
        `).all(contentId) as any[];

        return steps.map(step => ({
            id: step.id,
            contentId: step.content_id,
            stepId: step.step_id,
            name: step.name,
            description: step.description,
            tip: step.tip,
            warning: step.warning,
            stepOrder: step.step_order
        }));
    }

    /**
     * 获取案例详细信息
     */
    getCaseDetails(contentId: number): CaseDetail | null {
        const details = this.db.prepare(`
            SELECT * FROM case_details
            WHERE content_id = ?
        `).get(contentId) as any;

        if (!details) return null;

        return {
            contentId: details.content_id,
            problem: details.problem,
            solution: details.solution,
            results: JSON.parse(details.results || '[]'),
            lessons: JSON.parse(details.lessons || '[]'),
            toolsUsed: JSON.parse(details.tools_used || '[]'),
            background: details.background,
            challenge: details.challenge,
            approach: JSON.parse(details.approach || '{}'),
            resultsDetail: JSON.parse(details.results_detail || '{}'),
            keyInsights: JSON.parse(details.key_insights || '[]'),
            recommendations: JSON.parse(details.recommendations || '[]')
        };
    }

    /**
     * 获取SEO元数据
     */
    getSEOMetadata(contentId: number): SEOMetadata | null {
        const metadata = this.db.prepare(`
            SELECT * FROM seo_metadata
            WHERE content_id = ?
        `).get(contentId) as any;

        if (!metadata) return null;

        return {
            contentId: metadata.content_id,
            metaDescription: metadata.meta_description,
            keywords: JSON.parse(metadata.keywords || '[]'),
            ogTitle: metadata.og_title,
            ogDescription: metadata.og_description,
            ogImage: metadata.og_image,
            twitterCard: metadata.twitter_card
        };
    }

    /**
     * 获取内容关系
     */
    getContentRelationships(contentId: number): ContentRelationship[] {
        const relationships = this.db.prepare(`
            SELECT * FROM content_relationships
            WHERE from_content_id = ? OR to_content_id = ?
            ORDER BY created_at
        `).all(contentId, contentId) as any[];

        return relationships.map(rel => ({
            id: rel.id,
            fromContentId: rel.from_content_id,
            toContentId: rel.to_content_id,
            relationshipType: rel.relationship_type,
            createdAt: rel.created_at
        }));
    }

    /**
     * 获取工具关系
     */
    getToolRelationships(contentId: number): ToolRelationship[] {
        const relationships = this.db.prepare(`
            SELECT * FROM content_tool_relationships
            WHERE content_id = ?
            ORDER BY created_at
        `).all(contentId) as any[];

        return relationships.map(rel => ({
            id: rel.id,
            contentId: rel.content_id,
            toolUrl: rel.tool_url,
            relationshipType: rel.relationship_type,
            createdAt: rel.created_at
        }));
    }

    /**
     * 获取术语关系
     */
    getTermRelationships(contentId: number): TermRelationship[] {
        const relationships = this.db.prepare(`
            SELECT * FROM content_term_relationships
            WHERE content_id = ?
            ORDER BY created_at
        `).all(contentId) as any[];

        return relationships.map(rel => ({
            id: rel.id,
            contentId: rel.content_id,
            termSlug: rel.term_slug,
            relationshipType: rel.relationship_type,
            createdAt: rel.created_at
        }));
    }

    /**
     * 搜索内容
     */
    searchContent(query: string, options: ContentQueryOptions = {}): ContentItem[] {
        const { limit = 20, ...otherOptions } = options;

        // 处理空查询
        if (!query || query.trim() === '') {
            return [];
        }

        // 使用全文搜索
        const searchQuery = `
            SELECT
                ci.*,
                ct.type_name as type,
                sm.meta_description as seo_meta_description,
                sm.keywords as seo_keywords,
                cs.rank as search_rank
            FROM content_search cs
            JOIN content_items ci ON cs.rowid = ci.id
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE content_search MATCH ?
            ORDER BY cs.rank DESC
            LIMIT ?
        `;

        const items = this.db.prepare(searchQuery).all(query, limit) as any[];

        return items.map(item => ({
            id: item.id,
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            status: item.status,
            readingTime: item.reading_time,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            difficulty: item.difficulty,
            featured: item.featured,
            priority: item.priority,
            industry: item.industry,
            targetTool: item.target_tool,
            tags: JSON.parse(item.tags || '[]'),
            seoMetaDescription: item.seo_meta_description,
            seoKeywords: JSON.parse(item.seo_keywords || '[]')
        }));
    }

    /**
     * 获取相关内容推荐
     */
    getRelatedContent(contentId: number, limit: number = 5): ContentItem[] {
        const query = `
            SELECT DISTINCT
                ci.*,
                ct.type_name as type,
                sm.meta_description as seo_meta_description,
                sm.keywords as seo_keywords,
                COUNT(*) as relevance_score
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE ci.id != ?
            AND (
                ci.id IN (
                    SELECT to_content_id FROM content_relationships WHERE from_content_id = ?
                    UNION
                    SELECT from_content_id FROM content_relationships WHERE to_content_id = ?
                )
                OR ci.id IN (
                    SELECT content_id FROM content_term_relationships
                    WHERE term_slug IN (
                        SELECT term_slug FROM content_term_relationships WHERE content_id = ?
                    )
                )
                OR ci.id IN (
                    SELECT content_id FROM content_tool_relationships
                    WHERE tool_url IN (
                        SELECT tool_url FROM content_tool_relationships WHERE content_id = ?
                    )
                )
            )
            GROUP BY ci.id
            ORDER BY relevance_score DESC, ci.updated_at DESC
            LIMIT ?
        `;

        const items = this.db.prepare(query).all(contentId, contentId, contentId, contentId, contentId, limit) as any[];

        return items.map(item => ({
            id: item.id,
            type: item.type,
            slug: item.slug,
            title: item.title,
            summary: item.summary,
            content: item.content,
            status: item.status,
            readingTime: item.reading_time,
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            difficulty: item.difficulty,
            featured: item.featured,
            priority: item.priority,
            industry: item.industry,
            targetTool: item.target_tool,
            tags: JSON.parse(item.tags || '[]'),
            seoMetaDescription: item.seo_meta_description,
            seoKeywords: JSON.parse(item.seo_keywords || '[]')
        }));
    }

    /**
     * 获取内容统计信息
     */
    getContentStats(): ContentStats {
        const totalItems = this.db.prepare('SELECT COUNT(*) as count FROM content_items').get() as any;

        const byType = this.db.prepare(`
            SELECT ct.type_name, COUNT(ci.id) as count
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            GROUP BY ct.type_name
        `).all() as any[];

        const byDifficulty = this.db.prepare(`
            SELECT difficulty, COUNT(*) as count
            FROM content_items
            WHERE difficulty IS NOT NULL
            GROUP BY difficulty
        `).all() as any[];

        const byIndustry = this.db.prepare(`
            SELECT industry, COUNT(*) as count
            FROM content_items
            WHERE industry IS NOT NULL
            GROUP BY industry
        `).all() as any[];

        const totalRelationships = this.db.prepare(`
            SELECT COUNT(*) as count FROM (
                SELECT id FROM content_relationships
                UNION ALL
                SELECT id FROM content_tool_relationships
                UNION ALL
                SELECT id FROM content_term_relationships
            )
        `).get() as any;

        const totalSteps = this.db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;

        return {
            totalItems: totalItems.count,
            byType: byType.reduce((acc, item) => ({ ...acc, [item.type_name]: item.count }), {}),
            byDifficulty: byDifficulty.reduce((acc, item) => ({ ...acc, [item.difficulty]: item.count }), {}),
            byIndustry: byIndustry.reduce((acc, item) => ({ ...acc, [item.industry]: item.count }), {}),
            totalRelationships: totalRelationships.count,
            totalSteps: totalSteps.count
        };
    }

    /**
     * 获取热门内容
     */
    getPopularContent(limit: number = 5): ContentItem[] {
        return this.queryContent({
            limit,
            sortBy: 'priority',
            sortOrder: 'desc'
        });
    }

    /**
     * 获取最新内容
     */
    getLatestContent(limit: number = 5): ContentItem[] {
        return this.queryContent({
            limit,
            sortBy: 'updated',
            sortOrder: 'desc'
        });
    }

    /**
     * 根据类型获取内容项
     */
    getContentByType(type: string): ContentItem[] {
        return this.queryContent({ type });
    }

    /**
     * 根据slug获取How-to步骤
     */
    getHowToStepsBySlug(slug: string): HowToStep[] {
        const contentItem = this.getContentItemBySlug(slug, 'howto');
        if (!contentItem) return [];

        return this.getHowToSteps(contentItem.id);
    }

    /**
     * 根据slug获取案例详情
     */
    getCaseDetailsBySlug(slug: string): CaseDetail | null {
        const contentItem = this.getContentItemBySlug(slug, 'case');
        if (!contentItem) return null;

        return this.getCaseDetails(contentItem.id);
    }
}

// 导出单例实例
export const contentService = new ContentService();