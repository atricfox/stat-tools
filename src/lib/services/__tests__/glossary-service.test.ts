#!/usr/bin/env tsx

/**
 * Glossary Service Unit Tests - Sprint 15
 * 术语表服务单元测试，基于TDD原则测试术语管理核心功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { GlossaryService, glossaryService } from '../glossary';
import Database from 'better-sqlite3';
import fs from 'node:fs/promises';
import path from 'node:path';

// 测试数据库路径
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test-glossary-service.db');

describe('GlossaryService - Sprint 15 TDD Tests', () => {
    let testDb: Database.Database;
    let service: GlossaryService;

    beforeEach(async () => {
        // 创建测试数据库
        await fs.mkdir(path.dirname(TEST_DB_PATH), { recursive: true });
        testDb = new Database(TEST_DB_PATH);

        // 设置测试数据库架构
        setupTestDatabase(testDb);

        // 插入测试数据
        insertTestData(testDb);

        // 创建新的服务实例用于测试
        service = new GlossaryService();
        // 私有设置数据库连接（通过访问私有属性）
        (service as any).db = testDb;
    });

    afterEach(async () => {
        // 清理测试数据库
        if (testDb) {
            testDb.close();
        }
        try {
            await fs.unlink(TEST_DB_PATH);
        } catch (error) {
            // 文件可能已不存在
        }
    });

    describe('getCategories', () => {
        it('should return all categories', async () => {
            const categories = await service.getCategories();
            expect(Array.isArray(categories)).toBe(true);
            expect(categories.length).toBeGreaterThan(0);
            expect(categories[0]).toHaveProperty('id');
            expect(categories[0]).toHaveProperty('name');
            expect(categories[0]).toHaveProperty('display_name');
        });

        it('should return categories ordered by display_name', async () => {
            const categories = await service.getCategories();
            for (let i = 1; i < categories.length; i++) {
                expect(categories[i].display_name >= categories[i - 1].display_name).toBe(true);
            }
        });
    });

    describe('getTerms', () => {
        it('should return terms with default options', async () => {
            const result = await service.getTerms();
            expect(result).toHaveProperty('terms');
            expect(result).toHaveProperty('categories');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('pageSize');
            expect(result).toHaveProperty('totalPages');

            expect(Array.isArray(result.terms)).toBe(true);
            expect(Array.isArray(result.categories)).toBe(true);
            expect(typeof result.total).toBe('number');
        });

        it('should filter by category ID', async () => {
            const result = await service.getTerms({ categoryId: 1 });
            expect(result.terms.every(term =>
                term.categories?.some(cat => cat.id === 1)
            )).toBe(true);
        });

        it('should filter by category name', async () => {
            const result = await service.getTerms({ categoryName: 'statistics' });
            expect(result.terms.every(term =>
                term.categories?.some(cat => cat.name === 'statistics')
            )).toBe(true);
        });

        it('should filter by first letter', async () => {
            const result = await service.getTerms({ firstLetter: 'M' });
            expect(result.terms.every(term => term.first_letter === 'M')).toBe(true);
        });

        it('should handle search functionality', async () => {
            const result = await service.getTerms({ search: 'mean' });
            expect(result.terms.length).toBeGreaterThan(0);
            result.terms.forEach(term => {
                const searchTerm = 'mean';
                const searchLower = searchTerm.toLowerCase();
                expect(
                    term.title.toLowerCase().includes(searchLower) ||
                    term.definition.toLowerCase().includes(searchLower) ||
                    (term.short_description && term.short_description.toLowerCase().includes(searchLower))
                ).toBe(true);
            });
        });

        it('should handle pagination', async () => {
            const result1 = await service.getTerms({ page: 1, pageSize: 2 });
            const result2 = await service.getTerms({ page: 2, pageSize: 2 });

            expect(result1.terms.length).toBeLessThanOrEqual(2);
            expect(result2.terms.length).toBeLessThanOrEqual(2);
            expect(result1.page).toBe(1);
            expect(result2.page).toBe(2);
        });

        it('should sort by different fields', async () => {
            const titleAsc = await service.getTerms({ sortBy: 'title', sortOrder: 'ASC' });
            const titleDesc = await service.getTerms({ sortBy: 'title', sortOrder: 'DESC' });

            if (titleAsc.terms.length > 1) {
                expect(titleAsc.terms[0].title <= titleAsc.terms[1].title).toBe(true);
                expect(titleDesc.terms[0].title >= titleDesc.terms[1].title).toBe(true);
            }
        });
    });

    describe('getTermById', () => {
        it('should return term by ID', async () => {
            const term = await service.getTermById(1);
            expect(term).toBeTruthy();
            expect(term?.id).toBe(1);
            expect(term?.title).toBe('Mean');
        });

        it('should return null for non-existent ID', async () => {
            const term = await service.getTermById(999);
            expect(term).toBeNull();
        });

        it('should include categories', async () => {
            const term = await service.getTermById(1);
            expect(term).toHaveProperty('categories');
            expect(Array.isArray(term?.categories)).toBe(true);
        });
    });

    describe('getTermBySlug', () => {
        it('should return term by slug', async () => {
            const term = await service.getTermBySlug('mean');
            expect(term).toBeTruthy();
            expect(term?.slug).toBe('mean');
        });

        it('should return null for non-existent slug', async () => {
            const term = await service.getTermBySlug('non-existent-slug');
            expect(term).toBeNull();
        });
    });

    describe('getTermCategories', () => {
        it('should return categories for a term', async () => {
            const categories = await service.getTermCategories(1);
            expect(Array.isArray(categories)).toBe(true);
            expect(categories.length).toBeGreaterThan(0);
            expect(categories[0]).toHaveProperty('id');
            expect(categories[0]).toHaveProperty('name');
            expect(categories[0]).toHaveProperty('display_name');
        });

        it('should return empty array for term with no categories', async () => {
            const categories = await service.getTermCategories(999);
            expect(categories).toEqual([]);
        });
    });

    describe('getTermRelationships', () => {
        it('should return relationships for a term', async () => {
            const relationships = await service.getTermRelationships(1);
            expect(Array.isArray(relationships)).toBe(true);
            if (relationships.length > 0) {
                expect(relationships[0]).toHaveProperty('from_term_id');
                expect(relationships[0]).toHaveProperty('to_term_id');
                expect(relationships[0]).toHaveProperty('relationship_type');
            }
        });
    });

    describe('searchTerms', () => {
        it('should return search results for existing terms', async () => {
            const results = await service.searchTerms('mean');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            results.forEach(result => {
                expect(result).toHaveProperty('term');
                expect(result).toHaveProperty('score');
                expect(result).toHaveProperty('matchedFields');
                expect(typeof result.score).toBe('number');
            });
        });

        it('should return empty array for no matches', async () => {
            const results = await service.searchTerms('nonexistentterm123');
            expect(results).toEqual([]);
        });

        it('should respect search limit', async () => {
            const results1 = await service.searchTerms('mean', 5);
            const results2 = await service.searchTerms('mean', 10);

            expect(results1.length).toBeLessThanOrEqual(5);
            expect(results2.length).toBeLessThanOrEqual(10);
        });

        it('should rank results by relevance', async () => {
            const results = await service.searchTerms('mean');
            for (let i = 1; i < results.length; i++) {
                expect(results[i].score <= results[i - 1].score).toBe(true);
            }
        });

        it('should identify matched fields correctly', async () => {
            const results = await service.searchTerms('mean');
            if (results.length > 0) {
                const result = results[0];
                expect(Array.isArray(result.matchedFields)).toBe(true);
                expect(result.matchedFields.length).toBeGreaterThan(0);
                result.matchedFields.forEach(field => {
                    expect(['title', 'short_description', 'definition']).toContain(field);
                });
            }
        });
    });

    describe('getFirstLetters', () => {
        it('should return first letters with counts', async () => {
            const letters = await service.getFirstLetters();
            expect(Array.isArray(letters)).toBe(true);
            expect(letters.length).toBeGreaterThan(0);

            letters.forEach(letter => {
                expect(letter).toHaveProperty('letter');
                expect(letter).toHaveProperty('count');
                expect(typeof letter.count).toBe('number');
                expect(letter.count).toBeGreaterThan(0);
            });
        });

        it('should return letters ordered alphabetically', async () => {
            const letters = await service.getFirstLetters();
            for (let i = 1; i < letters.length; i++) {
                expect(letters[i].letter >= letters[i - 1].letter).toBe(true);
            }
        });
    });

    describe('getRelatedTerms', () => {
        it('should return related terms based on relationships', async () => {
            const related = await service.getRelatedTerms(1, 3);
            expect(Array.isArray(related)).toBe(true);
            expect(related.length).toBeLessThanOrEqual(3);

            // Verify it doesn't include the original term
            related.forEach(term => {
                expect(term.id).not.toBe(1);
            });
        });

        it('should return empty array for term with no relationships', async () => {
            const related = await service.getRelatedTerms(999, 5);
            expect(related).toEqual([]);
        });
    });

    describe('getStatistics', () => {
        it('should return comprehensive statistics', async () => {
            const stats = await service.getStatistics();
            expect(stats).toHaveProperty('totalTerms');
            expect(stats).toHaveProperty('totalCategories');
            expect(stats).toHaveProperty('totalRelationships');
            expect(stats).toHaveProperty('letterCounts');
            expect(stats).toHaveProperty('categoryCounts');

            expect(typeof stats.totalTerms).toBe('number');
            expect(typeof stats.totalCategories).toBe('number');
            expect(typeof stats.totalRelationships).toBe('number');
            expect(Array.isArray(stats.letterCounts)).toBe(true);
            expect(Array.isArray(stats.categoryCounts)).toBe(true);
        });

        it('should calculate correct counts', async () => {
            const stats = await service.getStatistics();
            expect(stats.totalTerms).toBeGreaterThan(0);
            expect(stats.totalCategories).toBeGreaterThan(0);
            expect(stats.letterCounts.length).toBeGreaterThan(0);
            expect(stats.categoryCounts.length).toBeGreaterThan(0);
        });

        it('should include category details in counts', async () => {
            const stats = await service.getStatistics();
            if (stats.categoryCounts.length > 0) {
                const categoryCount = stats.categoryCounts[0];
                expect(categoryCount).toHaveProperty('category');
                expect(categoryCount).toHaveProperty('count');
                expect(categoryCount.category).toHaveProperty('id');
                expect(categoryCount.category).toHaveProperty('name');
                expect(categoryCount.category).toHaveProperty('display_name');
            }
        });
    });

    describe('clearGlossaryCache', () => {
        it('should clear glossary-related cache without errors', () => {
            expect(() => {
                service.clearGlossaryCache();
            }).not.toThrow();
        });
    });

    describe('Caching Behavior', () => {
        it('should cache query results', async () => {
            // First call should cache the result
            const result1 = await service.getTerms();

            // Second call should use cached result
            const result2 = await service.getTerms();

            expect(result1).toEqual(result2);
        });

        it('should have different cache keys for different options', async () => {
            const result1 = await service.getTerms({ categoryId: 1 });
            const result2 = await service.getTerms({ firstLetter: 'M' });

            // Results should be different due to different filter options
            expect(result1.terms.some(term =>
                term.categories?.some(cat => cat.id === 1)
            )).toBe(true);
            expect(result2.terms.every(term => term.first_letter === 'M')).toBe(true);
        });
    });
});

/**
 * 设置测试数据库架构
 */
function setupTestDatabase(db: Database.Database): void {
    // 创建分类表
    db.exec(`
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 创建术语表
    db.exec(`
        CREATE TABLE IF NOT EXISTS glossary_terms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            short_description TEXT,
            definition TEXT NOT NULL,
            first_letter CHAR(1),
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 创建术语-分类关系表
    db.exec(`
        CREATE TABLE IF NOT EXISTS term_categories (
            term_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            PRIMARY KEY (term_id, category_id),
            FOREIGN KEY (term_id) REFERENCES glossary_terms(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE CASCADE
        )
    `);

    // 创建术语关系表
    db.exec(`
        CREATE TABLE IF NOT EXISTS term_relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_term_id INTEGER NOT NULL,
            to_term_id INTEGER NOT NULL,
            relationship_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_term_id) REFERENCES glossary_terms(id) ON DELETE CASCADE,
            FOREIGN KEY (to_term_id) REFERENCES glossary_terms(id) ON DELETE CASCADE,
            UNIQUE(from_term_id, to_term_id, relationship_type)
        )
    `);

    // 创建全文搜索虚拟表
    db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS glossary_fts
        USING FTS5(title, short_description, definition, content=glossary_terms)
    `);

    // 创建触发器保持全文搜索同步
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS glossary_fts_insert
        AFTER INSERT ON glossary_terms BEGIN
            INSERT INTO glossary_fts(rowid, title, short_description, definition)
            VALUES (new.id, new.title, new.short_description, new.definition);
        END
    `);

    db.exec(`
        CREATE TRIGGER IF NOT EXISTS glossary_fts_delete
        AFTER DELETE ON glossary_terms BEGIN
            DELETE FROM glossary_fts WHERE rowid = old.id;
        END
    `);

    db.exec(`
        CREATE TRIGGER IF NOT EXISTS glossary_fts_update
        AFTER UPDATE ON glossary_terms BEGIN
            DELETE FROM glossary_fts WHERE rowid = old.id;
            INSERT INTO glossary_fts(rowid, title, short_description, definition)
            VALUES (new.id, new.title, new.short_description, new.definition);
        END
    `);
}

/**
 * 插入测试数据
 */
function insertTestData(db: Database.Database): void {
    // 插入分类
    const insertCategory = db.prepare(`
        INSERT OR IGNORE INTO categories (name, display_name, description)
        VALUES (?, ?, ?)
    `);

    insertCategory.run('statistics', 'Statistics', '统计学术语');
    insertCategory.run('probability', 'Probability', '概率论术语');
    insertCategory.run('analysis', 'Analysis', '数据分析术语');

    // 插入术语
    const insertTerm = db.prepare(`
        INSERT OR IGNORE INTO glossary_terms (slug, title, short_description, definition, first_letter)
        VALUES (?, ?, ?, ?, ?)
    `);

    // Mean 术语
    insertTerm.run(
        'mean', 'Mean', 'The average of a set of numbers',
        'The mean is the sum of all values divided by the number of values. It is the most common measure of central tendency.',
        'M'
    );

    // Median 术语
    insertTerm.run(
        'median', 'Median', 'The middle value in a sorted set of numbers',
        'The median is the value that separates the higher half from the lower half of a data sample.',
        'M'
    );

    // Standard Deviation 术语
    insertTerm.run(
        'standard-deviation', 'Standard Deviation', 'Measure of data spread',
        'Standard deviation measures the amount of variation or dispersion of a set of values.',
        'S'
    );

    // Variance 术语
    insertTerm.run(
        'variance', 'Variance', 'Square of standard deviation',
        'Variance measures how far each number in the set is from the mean.',
        'V'
    );

    // 插入术语-分类关系
    const insertTermCategory = db.prepare(`
        INSERT OR IGNORE INTO term_categories (term_id, category_id)
        VALUES (?, ?)
    `);

    insertTermCategory.run(1, 1); // Mean -> Statistics
    insertTermCategory.run(2, 1); // Median -> Statistics
    insertTermCategory.run(3, 1); // Standard Deviation -> Statistics
    insertTermCategory.run(4, 1); // Variance -> Statistics
    insertTermCategory.run(1, 3); // Mean -> Analysis
    insertTermCategory.run(2, 3); // Median -> Analysis

    // 插入术语关系
    const insertRelationship = db.prepare(`
        INSERT OR IGNORE INTO term_relationships (from_term_id, to_term_id, relationship_type)
        VALUES (?, ?, ?)
    `);

    insertRelationship.run(1, 2, 'related');     // Mean -> Median
    insertRelationship.run(1, 3, 'related');     // Mean -> Standard Deviation
    insertRelationship.run(3, 4, 'related');     // Standard Deviation -> Variance
    insertRelationship.run(2, 1, 'alternative'); // Median -> Mean
}