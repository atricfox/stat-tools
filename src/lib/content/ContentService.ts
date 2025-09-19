/**
 * Enhanced Content Service (slim schema)
 * 现在直接基于 slim_content/slim_content_details 提供数据
 */

import Database from 'better-sqlite3';
import { getDb } from '../db/db-utils';

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

export interface SEOMetadata {
    contentId: number;
    metaDescription?: string;
    keywords: string[];
    ogTitle?: string;
    ogDescription?: string;
    ogImage?: string;
    twitterCard?: string;
}

export interface ContentRelationship {
    id: number;
    fromContentId: number;
    toContentId: number;
    relationshipType: string;
    createdAt: string;
}

export interface ToolRelationship {
    id: number;
    contentId: number;
    toolUrl: string;
    relationshipType: string;
    createdAt: string;
}

export interface TermRelationship {
    id: number;
    contentId: number;
    termSlug: string;
    relationshipType: string;
    createdAt: string;
}

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

export interface ContentStats {
    totalItems: number;
    byType: Record<string, number>;
    byDifficulty: Record<string, number>;
    byIndustry: Record<string, number>;
    totalRelationships: number;
    totalSteps: number;
}

export class ContentService {
    private db: Database.Database;

    constructor() {
        this.db = getDb();
    }

    getContentItem(id: number): ContentItem | null {
        const row = this.db.prepare(`SELECT * FROM slim_content WHERE id = ?`).get(id) as any;
        if (!row) return null;
        return this.rowToItem(row);
    }

    getContentItemBySlug(slug: string, type?: string): ContentItem | null {
        let sql = `SELECT * FROM slim_content WHERE slug = ?`;
        const params: any[] = [slug];
        if (type) { sql += ' AND type = ?'; params.push(type); }
        const row = this.db.prepare(sql).get(...params) as any;
        return row ? this.rowToItem(row) : null;
    }

    queryContent(options: ContentQueryOptions = {}): ContentItem[] {
        const { type, tags, difficulty, industry, featured, limit = 20, offset = 0, sortBy = 'updated', sortOrder = 'desc' } = options;
        let where = 'WHERE 1=1';
        const params: any[] = [];
        if (type) { where += ' AND sc.type = ?'; params.push(type); }
        if (difficulty) { where += ' AND sc.difficulty = ?'; params.push(difficulty); }
        if (industry) { where += ' AND sc.industry = ?'; params.push(industry); }
        if (featured !== undefined) { where += ' AND sc.featured = ?'; params.push(featured ? 1 : 0); }
        if (tags && tags.length) {
            const cond = tags.map(() => 'sc.tags LIKE ?').join(' OR ');
            where += ` AND (${cond})`;
            tags.forEach(t => params.push(`%"${t}"%`));
        }
        const orderCol = sortBy === 'created' ? 'created_at' : sortBy === 'title' ? 'title' : 'updated_at';
        const rows = this.db.prepare(`
            SELECT sc.* FROM slim_content sc
            ${where}
            ORDER BY sc.${orderCol} ${sortOrder.toUpperCase()}
            LIMIT ? OFFSET ?
        `).all(...params, limit, offset) as any[];
        return rows.map(r => this.rowToItem(r));
    }

    getHowToSteps(contentId: number): HowToStep[] {
        const row = this.db.prepare(`SELECT details FROM slim_content_details WHERE content_id = ?`).get(contentId) as any;
        const details = row?.details ? JSON.parse(row.details) : {};
        const steps = Array.isArray(details.steps) ? details.steps : [];
        return steps.map((s: any, i: number) => ({
            id: contentId * 100000 + (i + 1),
            contentId,
            stepId: s.stepId || String(i + 1),
            name: s.name || '',
            description: s.description || '',
            tip: s.tip,
            warning: s.warning,
            stepOrder: s.stepOrder ?? (i + 1)
        }));
    }

    getCaseDetails(contentId: number): CaseDetail | null {
        const row = this.db.prepare(`SELECT details FROM slim_content_details WHERE content_id = ?`).get(contentId) as any;
        const details = row?.details ? JSON.parse(row.details) : {};
        const cd = details.case;
        if (!cd) return null;
        const parseMaybeJson = (val: any, def: any) => {
            if (val == null) return def;
            if (typeof val === 'string') { try { return JSON.parse(val); } catch { return def; } }
            return val;
        };
        return {
            contentId,
            problem: cd.problem,
            solution: cd.solution,
            results: parseMaybeJson(cd.results, []),
            lessons: parseMaybeJson(cd.lessons, []),
            toolsUsed: parseMaybeJson(cd.toolsUsed, []),
            background: cd.background,
            challenge: cd.challenge,
            approach: parseMaybeJson(cd.approach, {}),
            resultsDetail: parseMaybeJson(cd.resultsDetail, {}),
            keyInsights: parseMaybeJson(cd.keyInsights, []),
            recommendations: parseMaybeJson(cd.recommendations, [])
        };
    }

    getSEOMetadata(contentId: number): SEOMetadata | null {
        // 精简版暂不维护单独 SEO 表，返回 null
        return null;
    }

    getContentRelationships(contentId: number): ContentRelationship[] { return []; }
    getToolRelationships(contentId: number): ToolRelationship[] { return []; }
    getTermRelationships(contentId: number): TermRelationship[] { return []; }

    searchContent(query: string, options: ContentQueryOptions = {}): ContentItem[] {
        const { limit = 20 } = options;
        if (!query || !query.trim()) return [];

        const useFts = process.env.USE_FTS_SEARCH === '1' || process.env.CONTENT_SEARCH_MODE === 'fts';

        if (useFts) {
            try {
                const rows = this.db.prepare(`
                    SELECT sc.* , content_search.rank as search_rank
                    FROM content_search
                    JOIN slim_content sc ON content_search.rowid = sc.id
                    WHERE content_search MATCH ?
                    ORDER BY content_search.rank DESC
                    LIMIT ?
                `).all(query, limit) as any[];
                if (rows && rows.length) return rows.map(r => this.rowToItem(r));
            } catch (e) {
                // Fallback to LIKE if FTS is unavailable
            }
        }

        const like = `%${query}%`;
        const rows = this.db.prepare(`
            SELECT * FROM slim_content sc
            WHERE sc.title LIKE ? OR sc.summary LIKE ? OR sc.content LIKE ?
            ORDER BY sc.updated_at DESC
            LIMIT ?
        `).all(like, like, like, limit) as any[];
        return rows.map(r => this.rowToItem(r));
    }

    getRelatedContent(contentId: number, limit: number = 5): ContentItem[] {
        // 精简版无关系表：先用同类型 + 共享标签的简单相似度
        const cur = this.getContentItem(contentId);
        if (!cur) return [];
        const firstTag = (cur.tags || [])[0];
        const like = firstTag ? `%"${firstTag}"%` : null;
        const rows = this.db.prepare(`
            SELECT * FROM slim_content sc
            WHERE sc.id != ? AND sc.type = ?
            ${like ? 'AND sc.tags LIKE ?' : ''}
            ORDER BY sc.updated_at DESC
            LIMIT ?
        `).all(...([contentId, cur.type] as any[]).concat(like ? [like, limit] : [limit])) as any[];
        return rows.map(r => this.rowToItem(r));
    }

    getContentStats(): ContentStats {
        const total = this.db.prepare(`SELECT COUNT(*) as c FROM slim_content`).get() as any;
        const byTypeRows = this.db.prepare(`SELECT type, COUNT(*) as c FROM slim_content GROUP BY type`).all() as any[];
        const byDiffRows = this.db.prepare(`SELECT difficulty, COUNT(*) as c FROM slim_content WHERE difficulty IS NOT NULL GROUP BY difficulty`).all() as any[];
        const byIndRows = this.db.prepare(`SELECT industry, COUNT(*) as c FROM slim_content WHERE industry IS NOT NULL GROUP BY industry`).all() as any[];
        const stepsSum = this.db.prepare(`
            SELECT COALESCE(SUM(json_array_length(json_extract(details, '$.steps'))), 0) as c
            FROM slim_content_details
        `).get() as any;
        return {
            totalItems: total.c || 0,
            byType: byTypeRows.reduce((a, r) => ({ ...a, [r.type]: r.c }), {} as Record<string, number>),
            byDifficulty: byDiffRows.reduce((a, r) => ({ ...a, [r.difficulty]: r.c }), {} as Record<string, number>),
            byIndustry: byIndRows.reduce((a, r) => ({ ...a, [r.industry]: r.c }), {} as Record<string, number>),
            totalRelationships: 0,
            totalSteps: stepsSum.c || 0
        };
    }

    getPopularContent(limit: number = 5): ContentItem[] {
        return this.queryContent({ limit, sortBy: 'priority', sortOrder: 'desc' });
    }

    getLatestContent(limit: number = 5): ContentItem[] {
        return this.queryContent({ limit, sortBy: 'updated', sortOrder: 'desc' });
    }

    getContentByType(type: string): ContentItem[] { return this.queryContent({ type }); }

    getHowToStepsBySlug(slug: string): HowToStep[] {
        const item = this.getContentItemBySlug(slug, 'howto');
        return item ? this.getHowToSteps(item.id) : [];
    }

    getCaseDetailsBySlug(slug: string): CaseDetail | null {
        const item = this.getContentItemBySlug(slug, 'case');
        return item ? this.getCaseDetails(item.id) : null;
    }

    private rowToItem(row: any): ContentItem {
        return {
            id: row.id,
            type: row.type,
            slug: row.slug,
            title: row.title,
            summary: row.summary,
            content: row.content,
            status: row.status,
            readingTime: row.reading_time,
            createdAt: row.created_at,
            updatedAt: row.updated_at,
            difficulty: row.difficulty,
            featured: !!row.featured,
            priority: row.priority,
            industry: row.industry,
            targetTool: row.target_tool,
            tags: JSON.parse(row.tags || '[]'),
            seoMetaDescription: undefined,
            seoKeywords: []
        };
    }
}

export const contentService = new ContentService();
