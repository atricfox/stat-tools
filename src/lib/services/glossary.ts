import { BaseService } from './base';

export interface Category {
    id: number;
    name: string;
    display_name: string;
    description?: string;
    created_at: string;
}

export interface Term {
    id: number;
    slug: string;
    title: string;
    short_description?: string;
    definition: string;
    first_letter?: string;
    updated_at: string;
    created_at: string;
    categories?: Category[];
}

export interface TermRelationship {
    id: number;
    from_term_id: number;
    to_term_id: number;
    relationship_type: string;
    created_at: string;
}

export interface GlossaryQueryOptions {
    categoryId?: number;
    categoryName?: string;
    firstLetter?: string;
    search?: string;
    sortBy?: 'title' | 'created_at' | 'updated_at';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
}

export interface GlossaryResult {
    terms: Term[];
    categories: Category[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

export interface SearchSuggestion {
    term: Term;
    score: number;
    matchedFields: string[];
}

/**
 * 术语表数据服务
 * 提供术语、分类和关系的数据访问接口
 */
export class GlossaryService extends BaseService {
    private defaultCacheTTL = 15 * 60 * 1000; // 15分钟

    constructor() {
        super();
        this.defaultCacheTTL = 15 * 60 * 1000;
    }

    /**
     * 获取所有分类
     */
    async getCategories(): Promise<Category[]> {
        const cacheKey = this.generateCacheKey('glossary:categories');

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    name,
                    display_name,
                    description,
                    created_at
                FROM categories
                ORDER BY display_name ASC
            `;

            return this.db.prepare(query).all() as Category[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取术语列表（支持分页和过滤）
     */
    async getTerms(options: GlossaryQueryOptions = {}): Promise<GlossaryResult> {
        const {
            categoryId,
            categoryName,
            firstLetter,
            search,
            sortBy = 'title',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 20
        } = options;

        const cacheKey = this.generateCacheKey('glossary:terms', JSON.stringify(options));

        return this.queryWithCache(cacheKey, async () => {
            // 构建WHERE条件
            const conditions: Record<string, any> = {};
            if (firstLetter) conditions.first_letter = firstLetter;

            let whereClause = '';
            let params: any[] = [];
            let joinClause = '';

            if (Object.keys(conditions).length > 0) {
                const where = this.buildWhereClause(conditions);
                whereClause = where.clause;
                params = where.params;
            }

            // 处理分类过滤
            if (categoryId || categoryName) {
                joinClause = 'LEFT JOIN term_categories tc ON t.id = tc.term_id LEFT JOIN categories c ON tc.category_id = c.id';

                if (categoryId) {
                    const categoryCondition = whereClause ? 'AND' : 'WHERE';
                    whereClause += ` ${categoryCondition} tc.category_id = ?`;
                    params.push(categoryId);
                } else if (categoryName) {
                    const categoryCondition = whereClause ? 'AND' : 'WHERE';
                    whereClause += ` ${categoryCondition} c.name = ?`;
                    params.push(categoryName);
                }
            }

            // 处理搜索
            if (search) {
                // 使用FTS5搜索
                const searchCondition = whereClause ? 'AND' : 'WHERE';
                whereClause += ` ${searchCondition} t.id IN (
                    SELECT rowid FROM glossary_fts
                    WHERE glossary_fts MATCH ?
                )`;
                params.push(search);
            }

            // 构建完整查询
            const countQuery = `
                SELECT COUNT(DISTINCT t.id) as count
                FROM glossary_terms t
                ${joinClause}
                ${whereClause}
            `;

            const dataQuery = `
                SELECT DISTINCT
                    t.id,
                    t.slug,
                    t.title,
                    t.short_description,
                    t.definition,
                    t.first_letter,
                    t.updated_at,
                    t.created_at
                FROM glossary_terms t
                ${joinClause}
                ${whereClause}
                ${this.buildOrderByClause(sortBy, sortOrder)}
            `;

            const result = await this.paginatedQuery<Term>({
                query: dataQuery,
                countQuery,
                page,
                pageSize,
                params
            });

            // 为每个术语获取分类
            const termsWithCategories = await Promise.all(
                result.data.map(async (term) => ({
                    ...term,
                    categories: await this.getTermCategories(term.id)
                }))
            );

            // 获取所有分类（用于前端）
            const categories = await this.getCategories();

            return {
                terms: termsWithCategories,
                categories,
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages
            };
        }, search ? this.defaultCacheTTL / 3 : this.defaultCacheTTL); // 搜索结果缓存时间较短
    }

    /**
     * 根据ID获取术语
     */
    async getTermById(id: number): Promise<Term | null> {
        const cacheKey = this.generateCacheKey('glossary:term:byId', id);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    id,
                    slug,
                    title,
                    short_description,
                    definition,
                    first_letter,
                    updated_at,
                    created_at
                FROM glossary_terms
                WHERE id = ?
            `;

            const term = this.db.prepare(query).get(id) as Term || null;
            if (!term) return null;

            // 获取分类
            term.categories = await this.getTermCategories(id);

            return term;
        }, this.defaultCacheTTL);
    }

    /**
     * 根据slug获取术语
     */
    async getTermBySlug(slug: string): Promise<Term | null> {
        const cacheKey = this.generateCacheKey('glossary:term:bySlug', slug);

        return this.queryWithCache(cacheKey, async () => {
            const query = `
                SELECT
                    id,
                    slug,
                    title,
                    short_description,
                    definition,
                    first_letter,
                    updated_at,
                    created_at
                FROM glossary_terms
                WHERE slug = ?
            `;

            const term = this.db.prepare(query).get(slug) as Term || null;
            if (!term) return null;

            // 获取分类
            term.categories = await this.getTermCategories(term.id);

            return term;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取术语的分类
     */
    async getTermCategories(termId: number): Promise<Category[]> {
        const cacheKey = this.generateCacheKey('glossary:term:categories', termId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    c.id,
                    c.name,
                    c.display_name,
                    c.description,
                    c.created_at
                FROM categories c
                JOIN term_categories tc ON c.id = tc.category_id
                WHERE tc.term_id = ?
                ORDER BY c.display_name ASC
            `;

            return this.db.prepare(query).all(termId) as Category[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取术语的关系
     */
    async getTermRelationships(termId: number): Promise<TermRelationship[]> {
        const cacheKey = this.generateCacheKey('glossary:term:relationships', termId);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    from_term_id,
                    to_term_id,
                    relationship_type,
                    created_at
                FROM term_relationships
                WHERE from_term_id = ? OR to_term_id = ?
                ORDER BY relationship_type ASC, created_at DESC
            `;

            return this.db.prepare(query).all(termId, termId) as TermRelationship[];
        }, this.defaultCacheTTL);
    }

    /**
     * 搜索术语
     */
    async searchTerms(query: string, limit = 20): Promise<SearchSuggestion[]> {
        const cacheKey = this.generateCacheKey('glossary:search', query, limit);

        return this.queryWithCache(cacheKey, async () => {
            // 使用FTS5搜索
            const searchQuery = `
                SELECT
                    t.id,
                    t.slug,
                    t.title,
                    t.short_description,
                    t.definition,
                    t.first_letter,
                    t.updated_at,
                    t.created_at,
                    glossary_fts.rank as score
                FROM glossary_terms t
                JOIN glossary_fts ON t.id = glossary_fts.rowid
                WHERE glossary_fts MATCH ?
                ORDER BY glossary_fts.rank DESC, t.title ASC
                LIMIT ?
            `;

            const results = this.db.prepare(searchQuery).all(query, limit);

            // 分析匹配的字段
            const suggestions: SearchSuggestion[] = await Promise.all(
                results.map(async (result: any) => {
                    const matchedFields: string[] = [];
                    const searchTerm = query.toLowerCase();

                    if (result.title.toLowerCase().includes(searchTerm)) {
                        matchedFields.push('title');
                    }
                    if (result.short_description && result.short_description.toLowerCase().includes(searchTerm)) {
                        matchedFields.push('short_description');
                    }
                    if (result.definition.toLowerCase().includes(searchTerm)) {
                        matchedFields.push('definition');
                    }

                    return {
                        term: {
                            id: result.id,
                            slug: result.slug,
                            title: result.title,
                            short_description: result.short_description,
                            definition: result.definition,
                            first_letter: result.first_letter,
                            updated_at: result.updated_at,
                            created_at: result.created_at,
                            categories: await this.getTermCategories(result.id)
                        },
                        score: result.score,
                        matchedFields
                    };
                })
            );

            return suggestions;
        }, this.defaultCacheTTL / 3); // 搜索结果缓存时间较短
    }

    /**
     * 获取首字母索引
     */
    async getFirstLetters(): Promise<{ letter: string; count: number }[]> {
        const cacheKey = this.generateCacheKey('glossary:firstLetters');

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    first_letter as letter,
                    COUNT(*) as count
                FROM glossary_terms
                WHERE first_letter IS NOT NULL
                GROUP BY first_letter
                ORDER BY first_letter ASC
            `;

            return this.db.prepare(query).all() as { letter: string; count: number }[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取相关术语
     */
    async getRelatedTerms(termId: number, limit = 5): Promise<Term[]> {
        const cacheKey = this.generateCacheKey('glossary:related', termId, limit);

        return this.queryWithCache(cacheKey, async () => {
            // 获取关系中的术语ID
            const relationshipQuery = `
                SELECT DISTINCT
                    CASE
                        WHEN from_term_id = ? THEN to_term_id
                        ELSE from_term_id
                    END as related_term_id
                FROM term_relationships
                WHERE from_term_id = ? OR to_term_id = ?
                ORDER BY created_at DESC
                LIMIT ?
            `;

            const relatedIds = this.db.prepare(relationshipQuery).all(termId, termId, termId, limit)
                .map((row: any) => row.related_term_id);

            if (relatedIds.length === 0) return [];

            // 获取相关术语
            const placeholders = relatedIds.map(() => '?').join(', ');
            const termsQuery = `
                SELECT
                    id,
                    slug,
                    title,
                    short_description,
                    definition,
                    first_letter,
                    updated_at,
                    created_at
                FROM glossary_terms
                WHERE id IN (${placeholders})
                ORDER BY title ASC
            `;

            const terms = this.db.prepare(termsQuery).all(...relatedIds) as Term[];

            // 为每个术语获取分类
            return await Promise.all(
                terms.map(async (term) => ({
                    ...term,
                    categories: await this.getTermCategories(term.id)
                }))
            );
        }, this.defaultCacheTTL);
    }

    /**
     * 获取统计信息
     */
    async getStatistics(): Promise<{
        totalTerms: number;
        totalCategories: number;
        totalRelationships: number;
        letterCounts: Array<{ letter: string; count: number }>;
        categoryCounts: Array<{ category: Category; count: number }>;
    }> {
        const cacheKey = this.generateCacheKey('glossary:stats');

        return this.queryWithCache(cacheKey, async () => {
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM glossary_terms) as total_terms,
                    (SELECT COUNT(*) FROM categories) as total_categories,
                    (SELECT COUNT(*) FROM term_relationships) as total_relationships
            `;

            const stats = this.db.prepare(statsQuery).get();

            // 获取字母分布
            const letterCounts = await this.getFirstLetters();

            // 获取分类分布
            const categoryCountsQuery = `
                SELECT
                    c.id,
                    c.name,
                    c.display_name,
                    c.description,
                    c.created_at,
                    COUNT(tc.term_id) as term_count
                FROM categories c
                LEFT JOIN term_categories tc ON c.id = tc.category_id
                GROUP BY c.id
                ORDER BY c.display_name ASC
            `;

            const categoryCounts = this.db.prepare(categoryCountsQuery).all();

            return {
                totalTerms: stats.total_terms,
                totalCategories: stats.total_categories,
                totalRelationships: stats.total_relationships,
                letterCounts,
                categoryCounts: categoryCounts.map(row => ({
                    category: {
                        id: row.id,
                        name: row.name,
                        display_name: row.display_name,
                        description: row.description,
                        created_at: row.created_at
                    },
                    count: row.term_count
                }))
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 清除术语表相关缓存
     */
    clearGlossaryCache(): void {
        this.clearCache('glossary');
    }
}

// 导出单例实例
export const glossaryService = new GlossaryService();