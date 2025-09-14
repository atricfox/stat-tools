import { BaseService } from './base';

export interface CalculatorGroup {
    id: number;
    group_name: string;
    display_name: string;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface Calculator {
    id: number;
    group_id: number;
    name: string;
    url: string;
    description: string;
    is_hot: boolean;
    is_new: boolean;
    sort_order: number;
    created_at: string;
    updated_at: string;
}

export interface CalculatorWithGroup extends Calculator {
    group: CalculatorGroup;
}

export interface CalculatorsQueryOptions {
    groupId?: number;
    groupName?: string;
    isHot?: boolean;
    isNew?: boolean;
    search?: string;
    sortBy?: 'name' | 'sort_order' | 'created_at';
    sortOrder?: 'ASC' | 'DESC';
    page?: number;
    pageSize?: number;
}

export interface CalculatorsResult {
    calculators: CalculatorWithGroup[];
    groups: CalculatorGroup[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}

/**
 * 计算器数据服务
 * 提供计算器和分组的数据访问接口
 */
export class CalculatorsService extends BaseService {
    private defaultCacheTTL = 10 * 60 * 1000; // 10分钟

    constructor() {
        super();
        this.defaultCacheTTL = 10 * 60 * 1000;
    }

    /**
     * 获取所有计算器分组
     */
    async getGroups(): Promise<CalculatorGroup[]> {
        const cacheKey = this.generateCacheKey('calculators:groups');

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    group_name,
                    display_name,
                    sort_order,
                    created_at,
                    updated_at
                FROM calculator_groups
                ORDER BY sort_order ASC, display_name ASC
            `;

            return this.db.prepare(query).all() as CalculatorGroup[];
        }, this.defaultCacheTTL);
    }

    /**
     * 根据名称获取分组
     */
    async getGroupByName(groupName: string): Promise<CalculatorGroup | null> {
        const cacheKey = this.generateCacheKey('calculators:group:name', groupName);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    id,
                    group_name,
                    display_name,
                    sort_order,
                    created_at,
                    updated_at
                FROM calculator_groups
                WHERE group_name = ?
            `;

            const result = this.db.prepare(query).get(groupName);
            return result as CalculatorGroup || null;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取计算器列表（支持分页和过滤）
     */
    async getCalculators(options: CalculatorsQueryOptions = {}): Promise<CalculatorsResult> {
        const {
            groupId,
            groupName,
            isHot,
            isNew,
            search,
            sortBy = 'c.sort_order',
            sortOrder = 'ASC',
            page = 1,
            pageSize = 50
        } = options;

        const cacheKey = this.generateCacheKey('calculators:list', JSON.stringify(options));

        return this.queryWithCache(cacheKey, async () => {
            // 构建WHERE条件
            const conditions: Record<string, any> = {};
            if (groupId) conditions.group_id = groupId;
            if (isHot !== undefined) conditions.is_hot = isHot ? 1 : 0;
            if (isNew !== undefined) conditions.is_new = isNew ? 1 : 0;

            let whereClause = '';
            let params: any[] = [];

            if (Object.keys(conditions).length > 0) {
                const where = this.buildWhereClause(conditions);
                whereClause = where.clause;
                params = where.params;
            }

            // 处理搜索
            if (search) {
                const searchCondition = whereClause ? 'AND' : 'WHERE';
                whereClause += ` ${searchCondition} (c.name LIKE ? OR c.description LIKE ?)`;
                params.push(`%${search}%`, `%${search}%`);
            }

            // 处理分组名称
            if (groupName) {
                const groupCondition = whereClause ? 'AND' : 'WHERE';
                whereClause += ` ${groupCondition} cg.group_name = ?`;
                params.push(groupName);
            }

            // 构建完整查询
            const countQuery = `
                SELECT COUNT(*) as count
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                ${whereClause}
            `;

            const dataQuery = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                ${whereClause}
                ${this.buildOrderByClause(sortBy, sortOrder)}
            `;

            const result = await this.paginatedQuery<CalculatorWithGroup>({
                query: dataQuery,
                countQuery,
                page,
                pageSize,
                params
            });

            // 转换结果格式
            const calculators = result.data.map(calc => ({
                ...calc,
                group: {
                    id: calc.group_id,
                    group_name: calc.group_name,
                    display_name: calc.group_display_name,
                    sort_order: calc.group_sort_order,
                    created_at: calc.group_created_at,
                    updated_at: calc.group_updated_at
                }
            }));

            // 获取所有分组（用于前端）
            const groups = await this.getGroups();

            return {
                calculators,
                groups,
                total: result.total,
                page: result.page,
                pageSize: result.pageSize,
                totalPages: result.totalPages
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 根据ID获取计算器
     */
    async getCalculatorById(id: number): Promise<CalculatorWithGroup | null> {
        const cacheKey = this.generateCacheKey('calculators:byId', id);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                WHERE c.id = ?
            `;

            const result = this.db.prepare(query).get(id);
            if (!result) return null;

            return {
                ...result,
                group: {
                    id: result.group_id,
                    group_name: result.group_name,
                    display_name: result.group_display_name,
                    sort_order: result.group_sort_order,
                    created_at: result.group_created_at,
                    updated_at: result.group_updated_at
                }
            } as CalculatorWithGroup;
        }, this.defaultCacheTTL);
    }

    /**
     * 根据URL获取计算器
     */
    async getCalculatorByUrl(url: string): Promise<CalculatorWithGroup | null> {
        const cacheKey = this.generateCacheKey('calculators:byUrl', url);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                WHERE c.url = ?
            `;

            const result = this.db.prepare(query).get(url);
            if (!result) return null;

            return {
                ...result,
                group: {
                    id: result.group_id,
                    group_name: result.group_name,
                    display_name: result.group_display_name,
                    sort_order: result.group_sort_order,
                    created_at: result.group_created_at,
                    updated_at: result.group_updated_at
                }
            } as CalculatorWithGroup;
        }, this.defaultCacheTTL);
    }

    /**
     * 获取热门计算器
     */
    async getHotCalculators(limit = 6): Promise<CalculatorWithGroup[]> {
        const cacheKey = this.generateCacheKey('calculators:hot', limit);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                WHERE c.is_hot = 1
                ORDER BY c.sort_order ASC, c.name ASC
                LIMIT ?
            `;

            const results = this.db.prepare(query).all(limit);

            return results.map(result => ({
                ...result,
                group: {
                    id: result.group_id,
                    group_name: result.group_name,
                    display_name: result.group_display_name,
                    sort_order: result.group_sort_order,
                    created_at: result.group_created_at,
                    updated_at: result.group_updated_at
                }
            })) as CalculatorWithGroup[];
        }, this.defaultCacheTTL);
    }

    /**
     * 获取新计算器
     */
    async getNewCalculators(limit = 6): Promise<CalculatorWithGroup[]> {
        const cacheKey = this.generateCacheKey('calculators:new', limit);

        return this.queryWithCache(cacheKey, () => {
            const query = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                WHERE c.is_new = 1
                ORDER BY c.created_at DESC
                LIMIT ?
            `;

            const results = this.db.prepare(query).all(limit);

            return results.map(result => ({
                ...result,
                group: {
                    id: result.group_id,
                    group_name: result.group_name,
                    display_name: result.group_display_name,
                    sort_order: result.group_sort_order,
                    created_at: result.group_created_at,
                    updated_at: result.group_updated_at
                }
            })) as CalculatorWithGroup[];
        }, this.defaultCacheTTL);
    }

    /**
     * 搜索计算器
     */
    async searchCalculators(query: string, limit = 20): Promise<CalculatorWithGroup[]> {
        const cacheKey = this.generateCacheKey('calculators:search', query, limit);

        return this.queryWithCache(cacheKey, () => {
            const searchQuery = `
                SELECT
                    c.id,
                    c.group_id,
                    c.name,
                    c.url,
                    c.description,
                    c.is_hot,
                    c.is_new,
                    c.sort_order,
                    c.created_at,
                    c.updated_at,
                    cg.id as group_id,
                    cg.group_name,
                    cg.display_name as group_display_name,
                    cg.sort_order as group_sort_order,
                    cg.created_at as group_created_at,
                    cg.updated_at as group_updated_at
                FROM calculators c
                LEFT JOIN calculator_groups cg ON c.group_id = cg.id
                WHERE c.name LIKE ? OR c.description LIKE ?
                ORDER BY
                    CASE
                        WHEN c.name LIKE ? THEN 1
                        WHEN c.description LIKE ? THEN 2
                        ELSE 3
                    END,
                    c.sort_order ASC,
                    c.name ASC
                LIMIT ?
            `;

            const searchTerm = `%${query}%`;
            const results = this.db.prepare(searchQuery).all(searchTerm, searchTerm, searchTerm, searchTerm, limit);

            return results.map(result => ({
                ...result,
                group: {
                    id: result.group_id,
                    group_name: result.group_name,
                    display_name: result.group_display_name,
                    sort_order: result.group_sort_order,
                    created_at: result.group_created_at,
                    updated_at: result.group_updated_at
                }
            })) as CalculatorWithGroup[];
        }, this.defaultCacheTTL / 2); // 搜索结果缓存时间较短
    }

    /**
     * 获取统计信息
     */
    async getStatistics(): Promise<{
        totalCalculators: number;
        totalGroups: number;
        hotCalculators: number;
        newCalculators: number;
        groupCounts: Array<{ group: CalculatorGroup; count: number }>;
    }> {
        const cacheKey = this.generateCacheKey('calculators:stats');

        return this.queryWithCache(cacheKey, async () => {
            const statsQuery = `
                SELECT
                    (SELECT COUNT(*) FROM calculators) as total_calculators,
                    (SELECT COUNT(*) FROM calculator_groups) as total_groups,
                    (SELECT COUNT(*) FROM calculators WHERE is_hot = 1) as hot_calculators,
                    (SELECT COUNT(*) FROM calculators WHERE is_new = 1) as new_calculators
            `;

            const stats = this.db.prepare(statsQuery).get();

            const groupCountsQuery = `
                SELECT
                    cg.id,
                    cg.group_name,
                    cg.display_name,
                    cg.sort_order,
                    cg.created_at,
                    cg.updated_at,
                    COUNT(c.id) as calculator_count
                FROM calculator_groups cg
                LEFT JOIN calculators c ON cg.id = c.group_id
                GROUP BY cg.id
                ORDER BY cg.sort_order ASC
            `;

            const groupCounts = this.db.prepare(groupCountsQuery).all();

            return {
                totalCalculators: stats.total_calculators,
                totalGroups: stats.total_groups,
                hotCalculators: stats.hot_calculators,
                newCalculators: stats.new_calculators,
                groupCounts: groupCounts.map(row => ({
                    group: {
                        id: row.id,
                        group_name: row.group_name,
                        display_name: row.display_name,
                        sort_order: row.sort_order,
                        created_at: row.created_at,
                        updated_at: row.updated_at
                    },
                    count: row.calculator_count
                }))
            };
        }, this.defaultCacheTTL);
    }

    /**
     * 清除计算器相关缓存
     */
    clearCalculatorsCache(): void {
        this.clearCache('calculators');
    }
}

// 导出单例实例
export const calculatorsService = new CalculatorsService();