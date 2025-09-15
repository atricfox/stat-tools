#!/usr/bin/env tsx

/**
 * Content Service Unit Tests - Sprint 15
 * 内容服务单元测试，基于TDD原则测试内容管理核心功能
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { ContentService, contentService } from '../content';
import Database from 'better-sqlite3';
import fs from 'node:fs/promises';
import path from 'node:path';

// 测试数据库路径
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test-content-service.db');

describe('ContentService - Sprint 15 TDD Tests', () => {
    let testDb: Database.Database;
    let service: ContentService;

    beforeEach(async () => {
        // 创建测试数据库
        await fs.mkdir(path.dirname(TEST_DB_PATH), { recursive: true });
        testDb = new Database(TEST_DB_PATH);

        // 设置测试数据库架构
        setupTestDatabase(testDb);

        // 插入测试数据
        insertTestData(testDb);

        // 创建新的服务实例用于测试
        service = new ContentService();
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

    describe(' getContentTypes', () => {
        it('should return all content types', async () => {
            const types = await service.getContentTypes();
            expect(Array.isArray(types)).toBe(true);
            expect(types.length).toBeGreaterThan(0);
            expect(types[0]).toHaveProperty('id');
            expect(types[0]).toHaveProperty('type_name');
            expect(types[0]).toHaveProperty('display_name');
        });

        it('should return types ordered by display_name', async () => {
            const types = await service.getContentTypes();
            for (let i = 1; i < types.length; i++) {
                expect(types[i].display_name >= types[i - 1].display_name).toBe(true);
            }
        });
    });

    describe(' getContentItems', () => {
        it('should return content items with default options', async () => {
            const result = await service.getContentItems();
            expect(result).toHaveProperty('items');
            expect(result).toHaveProperty('types');
            expect(result).toHaveProperty('total');
            expect(result).toHaveProperty('page');
            expect(result).toHaveProperty('pageSize');
            expect(result).toHaveProperty('totalPages');

            expect(Array.isArray(result.items)).toBe(true);
            expect(Array.isArray(result.types)).toBe(true);
            expect(typeof result.total).toBe('number');
        });

        it('should filter by type name', async () => {
            const result = await service.getContentItems({ typeName: 'glossary' });
            expect(result.items.every(item => item.type?.type_name === 'glossary')).toBe(true);
        });

        it('should filter by status', async () => {
            const result = await service.getContentItems({ status: 'published' });
            expect(result.items.every(item => item.status === 'published')).toBe(true);
        });

        it('should handle pagination', async () => {
            const result1 = await service.getContentItems({ page: 1, pageSize: 2 });
            const result2 = await service.getContentItems({ page: 2, pageSize: 2 });

            expect(result1.items.length).toBeLessThanOrEqual(2);
            expect(result2.items.length).toBeLessThanOrEqual(2);
            expect(result1.page).toBe(1);
            expect(result2.page).toBe(2);
        });

        it('should sort by different fields', async () => {
            const titleAsc = await service.getContentItems({ sortBy: 'title', sortOrder: 'ASC' });
            const titleDesc = await service.getContentItems({ sortBy: 'title', sortOrder: 'DESC' });

            if (titleAsc.items.length > 1) {
                expect(titleAsc.items[0].title <= titleAsc.items[1].title).toBe(true);
                expect(titleDesc.items[0].title >= titleDesc.items[1].title).toBe(true);
            }
        });
    });

    describe(' getContentItemById', () => {
        it('should return content item by ID', async () => {
            const item = await service.getContentItemById(1);
            expect(item).toBeTruthy();
            expect(item?.id).toBe(1);
            expect(item?.title).toBe('Test Glossary Term');
        });

        it('should return null for non-existent ID', async () => {
            const item = await service.getContentItemById(999);
            expect(item).toBeNull();
        });

        it('should include metadata', async () => {
            const item = await service.getContentItemById(1);
            expect(item).toHaveProperty('metadata');
            expect(typeof item?.metadata).toBe('object');
        });

        it('should include type information', async () => {
            const item = await service.getContentItemById(1);
            expect(item).toHaveProperty('type');
            expect(item?.type).toHaveProperty('type_name');
            expect(item?.type).toHaveProperty('display_name');
        });
    });

    describe(' getContentItemBySlug', () => {
        it('should return content item by slug', async () => {
            const item = await service.getContentItemBySlug('test-glossary-term');
            expect(item).toBeTruthy();
            expect(item?.slug).toBe('test-glossary-term');
        });

        it('should return null for non-existent slug', async () => {
            const item = await service.getContentItemBySlug('non-existent-slug');
            expect(item).toBeNull();
        });
    });

    describe(' getContentByType', () => {
        it('should return glossary content', async () => {
            const result = await service.getContentByType('glossary');
            expect(result.items.every(item => item.type?.type_name === 'glossary')).toBe(true);
        });

        it('should return FAQ content', async () => {
            const result = await service.getContentByType('faq');
            expect(result.items.every(item => item.type?.type_name === 'faq')).toBe(true);
        });
    });

    describe(' searchContent', () => {
        it('should return search results for existing terms', async () => {
            const results = await service.searchContent('test');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            results.forEach(result => {
                expect(result).toHaveProperty('item');
                expect(result).toHaveProperty('score');
                expect(typeof result.score).toBe('number');
            });
        });

        it('should return empty array for no matches', async () => {
            const results = await service.searchContent('nonexistentterm123');
            expect(results).toEqual([]);
        });

        it('should respect search limit', async () => {
            const results1 = await service.searchContent('test', 5);
            const results2 = await service.searchContent('test', 10);

            expect(results1.length).toBeLessThanOrEqual(5);
            expect(results2.length).toBeLessThanOrEqual(10);
        });

        it('should rank results by relevance', async () => {
            const results = await service.searchContent('test');
            for (let i = 1; i < results.length; i++) {
                expect(results[i].score <= results[i - 1].score).toBe(true);
            }
        });
    });

    describe(' getRelatedContent', () => {
        it('should return related content based on tags', async () => {
            const related = await service.getRelatedContent(1, 3);
            expect(Array.isArray(related)).toBe(true);
            expect(related.length).toBeLessThanOrEqual(3);

            // Verify it doesn't include the original content
            related.forEach(item => {
                expect(item.id).not.toBe(1);
            });
        });

        it('should return empty array for content with no tags', async () => {
            const related = await service.getRelatedContent(999, 5);
            expect(related).toEqual([]);
        });
    });

    describe(' getHowToSteps', () => {
        it('should return steps for how-to content', async () => {
            const steps = await service.getHowToSteps(2);
            expect(Array.isArray(steps)).toBe(true);

            if (steps.length > 0) {
                expect(steps[0]).toHaveProperty('id');
                expect(steps[0]).toHaveProperty('content_id');
                expect(steps[0]).toHaveProperty('step_order');
                expect(steps[0]).toHaveProperty('name');
                expect(steps[0]).toHaveProperty('description');
            }
        });

        it('should return empty array for non-how-to content', async () => {
            const steps = await service.getHowToSteps(1);
            expect(steps).toEqual([]);
        });

        it('should return steps ordered by step_order', async () => {
            const steps = await service.getHowToSteps(2);
            for (let i = 1; i < steps.length; i++) {
                expect(steps[i].step_order > steps[i - 1].step_order).toBe(true);
            }
        });
    });

    describe(' getStatistics', () => {
        it('should return comprehensive statistics', async () => {
            const stats = await service.getStatistics();
            expect(stats).toHaveProperty('totalItems');
            expect(stats).toHaveProperty('totalTypes');
            expect(stats).toHaveProperty('publishedItems');
            expect(stats).toHaveProperty('typeCounts');
            expect(stats).toHaveProperty('averageReadingTime');

            expect(typeof stats.totalItems).toBe('number');
            expect(typeof stats.totalTypes).toBe('number');
            expect(typeof stats.publishedItems).toBe('number');
            expect(Array.isArray(stats.typeCounts)).toBe(true);
            expect(typeof stats.averageReadingTime).toBe('number');
        });

        it('should calculate correct counts', async () => {
            const stats = await service.getStatistics();
            expect(stats.totalItems).toBeGreaterThan(0);
            expect(stats.publishedItems).toBeLessThanOrEqual(stats.totalItems);
            expect(stats.typeCounts.length).toBeGreaterThan(0);
        });
    });

    describe(' clearContentCache', () => {
        it('should clear content-related cache without errors', () => {
            expect(() => {
                service.clearContentCache();
            }).not.toThrow();
        });
    });

    describe(' Caching Behavior', () => {
        it('should cache query results', async () => {
            // First call should cache the result
            const result1 = await service.getContentItems();

            // Second call should use cached result
            const result2 = await service.getContentItems();

            expect(result1).toEqual(result2);
        });

        it('should have different cache keys for different options', async () => {
            const result1 = await service.getContentItems({ typeName: 'glossary' });
            const result2 = await service.getContentItems({ typeName: 'faq' });

            // Results should be different due to different filter options
            expect(result1.items.some(item => item.type?.type_name === 'glossary')).toBe(true);
            expect(result2.items.some(item => item.type?.type_name === 'faq')).toBe(true);
        });
    });
});

/**
 * 设置测试数据库架构
 */
function setupTestDatabase(db: Database.Database): void {
    // 创建内容类型表
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // 创建内容项表
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_id INTEGER NOT NULL,
            slug TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            content TEXT,
            status TEXT DEFAULT 'published',
            reading_time INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            difficulty TEXT,
            featured BOOLEAN DEFAULT FALSE,
            priority INTEGER DEFAULT 0,
            industry TEXT,
            target_tool TEXT,
            tags TEXT DEFAULT '[]',
            seo_meta_description TEXT,
            seo_keywords TEXT,
            FOREIGN KEY (type_id) REFERENCES content_types(id),
            UNIQUE(slug, type_id)
        )
    `);

    // 创建内容元数据表
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER NOT NULL,
            meta_key TEXT NOT NULL,
            meta_value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
            UNIQUE(content_id, meta_key)
        )
    `);

    // 创建How-to步骤表
    db.exec(`
        CREATE TABLE IF NOT EXISTS howto_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER NOT NULL,
            step_order INTEGER NOT NULL,
            step_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            tip TEXT,
            warning TEXT,
            FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
            UNIQUE(content_id, step_id)
        )
    `);

    // 创建全文搜索虚拟表
    db.exec(`
        CREATE VIRTUAL TABLE IF NOT EXISTS content_search
        USING FTS5(title, summary, content, content=content_items)
    `);

    // 创建触发器保持全文搜索同步
    db.exec(`
        CREATE TRIGGER IF NOT EXISTS content_search_insert
        AFTER INSERT ON content_items BEGIN
            INSERT INTO content_search(rowid, title, summary, content)
            VALUES (new.id, new.title, new.summary, new.content);
        END
    `);

    db.exec(`
        CREATE TRIGGER IF NOT EXISTS content_search_delete
        AFTER DELETE ON content_items BEGIN
            DELETE FROM content_search WHERE rowid = old.id;
        END
    `);

    db.exec(`
        CREATE TRIGGER IF NOT EXISTS content_search_update
        AFTER UPDATE ON content_items BEGIN
            DELETE FROM content_search WHERE rowid = old.id;
            INSERT INTO content_search(rowid, title, summary, content)
            VALUES (new.id, new.title, new.summary, new.content);
        END
    `);
}

/**
 * 插入测试数据
 */
function insertTestData(db: Database.Database): void {
    // 插入内容类型
    const insertType = db.prepare(`
        INSERT OR IGNORE INTO content_types (type_name, display_name, description)
        VALUES (?, ?, ?)
    `);

    insertType.run('glossary', 'Glossary', '统计术语表');
    insertType.run('faq', 'FAQ', '常见问题解答');
    insertType.run('howto', 'How-to', '操作指南');
    insertType.run('case', 'Case Study', '案例研究');

    // 插入测试内容项
    const insertContent = db.prepare(`
        INSERT OR IGNORE INTO content_items
        (type_id, slug, title, summary, content, status, reading_time)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    `);

    // Glossary 测试数据
    insertContent.run(
        1, 'test-glossary-term', 'Test Glossary Term', 'A test glossary term',
        'This is a detailed definition of a test glossary term for unit testing purposes.',
        'published', 5
    );

    // FAQ 测试数据
    insertContent.run(
        2, 'test-faq', 'Test FAQ Item', 'This is a test FAQ item',
        'Test FAQ content for unit testing',
        'published', 3
    );

    // How-to 测试数据
    insertContent.run(
        3, 'test-howto', 'Test How-to Guide', 'This is a test how-to guide',
        'Test How-to content for unit testing',
        'published', 10
    );

    // Case 测试数据
    insertContent.run(
        4, 'test-case', 'Test Case Study', 'This is a test case study',
        'Test case content for unit testing',
        'published', 8
    );

    // 插入内容元数据
    const insertMetadata = db.prepare(`
        INSERT OR IGNORE INTO content_metadata (content_id, meta_key, meta_value)
        VALUES (?, ?, ?)
    `);

    insertMetadata.run(1, 'difficulty', 'beginner');
    insertMetadata.run(1, 'tags', JSON.stringify(['statistics', 'test', 'definition']));
    insertMetadata.run(1, 'seo_description', 'Test glossary term meta description');
    insertMetadata.run(2, 'difficulty', 'beginner');
    insertMetadata.run(2, 'tags', JSON.stringify(['statistics', 'test', 'faq']));
    insertMetadata.run(2, 'seo_description', 'Test FAQ meta description');
    insertMetadata.run(3, 'difficulty', 'intermediate');
    insertMetadata.run(3, 'tags', JSON.stringify(['tutorial', 'guide', 'test']));
    insertMetadata.run(3, 'seo_description', 'Test How-to meta description');
    insertMetadata.run(4, 'difficulty', 'advanced');
    insertMetadata.run(4, 'tags', JSON.stringify(['case study', 'example', 'test']));
    insertMetadata.run(4, 'seo_description', 'Test Case meta description');

    // 插入How-to步骤
    const insertStep = db.prepare(`
        INSERT OR IGNORE INTO howto_steps (content_id, step_order, step_id, name, description)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertStep.run(3, 1, 'step1', 'Step 1', 'First step description');
    insertStep.run(3, 2, 'step2', 'Step 2', 'Second step description');
    insertStep.run(3, 3, 'step3', 'Step 3', 'Third step description');
}