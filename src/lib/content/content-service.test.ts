#!/usr/bin/env tsx

/**
 * Content Service Unit Tests
 * 内容服务单元测试，确保服务层的功能完整性和正确性
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { contentService } from './ContentService';
import { contentAdapter } from './DatabaseContentAdapter';
import { cachedContentService } from './ContentCacheService';
import Database from 'better-sqlite3';
import { getDatabase } from '../../db/client';
import fs from 'node:fs/promises';
import path from 'node:path';

// 测试数据库路径
const TEST_DB_PATH = path.resolve(process.cwd(), 'data', 'test-statcal.db');

describe('ContentService', () => {
    let testDb: Database.Database;

    beforeEach(async () => {
        // 创建测试数据库
        await fs.mkdir(path.dirname(TEST_DB_PATH), { recursive: true });
        testDb = new Database(TEST_DB_PATH);

        // 设置测试数据库架构
        setupTestDatabase(testDb);

        // 插入测试数据
        insertTestData(testDb);
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

    describe('getContentItem', () => {
        it('should return content item by ID', () => {
            const item = contentService.getContentItem(1);
            expect(item).toBeTruthy();
            expect(item?.id).toBe(1);
            expect(item?.title).toBe('Test FAQ Item');
        });

        it('should return null for non-existent ID', () => {
            const item = contentService.getContentItem(999);
            expect(item).toBeNull();
        });
    });

    describe('getContentItemBySlug', () => {
        it('should return content item by slug and type', () => {
            const item = contentService.getContentItemBySlug('test-faq', 'faq');
            expect(item).toBeTruthy();
            expect(item?.slug).toBe('test-faq');
            expect(item?.type).toBe('faq');
        });

        it('should return null for non-existent slug', () => {
            const item = contentService.getContentItemBySlug('non-existent', 'faq');
            expect(item).toBeNull();
        });
    });

    describe('queryContent', () => {
        it('should return content items with default options', () => {
            const items = contentService.queryContent();
            expect(Array.isArray(items)).toBe(true);
            expect(items.length).toBeGreaterThan(0);
        });

        it('should filter by type', () => {
            const items = contentService.queryContent({ type: 'faq' });
            expect(items.every(item => item.type === 'faq')).toBe(true);
        });

        it('should filter by tags', () => {
            const items = contentService.queryContent({ tags: ['statistics'] });
            expect(items.every(item => item.tags.includes('statistics'))).toBe(true);
        });

        it('should respect limit and offset', () => {
            const items1 = contentService.queryContent({ limit: 5 });
            const items2 = contentService.queryContent({ limit: 3, offset: 2 });

            expect(items1.length).toBe(5);
            expect(items2.length).toBe(3);
            expect(items2[0].id).toBe(items1[2].id);
        });

        it('should sort by different fields', () => {
            const byTitle = contentService.queryContent({ sortBy: 'title', sortOrder: 'asc' });
            const byUpdated = contentService.queryContent({ sortBy: 'updated', sortOrder: 'desc' });

            // 验证排序
            for (let i = 1; i < byTitle.length; i++) {
                expect(byTitle[i].title >= byTitle[i - 1].title).toBe(true);
            }

            for (let i = 1; i < byUpdated.length; i++) {
                expect(new Date(byUpdated[i].updatedAt).getTime() <= new Date(byUpdated[i - 1].updatedAt).getTime()).toBe(true);
            }
        });
    });

    describe('searchContent', () => {
        it('should return relevant search results', () => {
            const results = contentService.searchContent('mean median');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBeGreaterThan(0);

            // 验证搜索结果相关性
            results.forEach(result => {
                const content = (result.title + ' ' + result.summary + ' ' + result.content).toLowerCase();
                expect(content.includes('mean') || content.includes('median')).toBe(true);
            });
        });

        it('should handle empty search query', () => {
            const results = contentService.searchContent('');
            expect(results).toEqual([]);
        });

        it('should respect search limit', () => {
            const results1 = contentService.searchContent('test', { limit: 5 });
            const results2 = contentService.searchContent('test', { limit: 10 });

            expect(results1.length).toBeLessThanOrEqual(5);
            expect(results2.length).toBeLessThanOrEqual(10);
        });
    });

    describe('getRelatedContent', () => {
        it('should return related content items', () => {
            const related = contentService.getRelatedContent(1, 3);
            expect(Array.isArray(related)).toBe(true);
            expect(related.length).toBeLessThanOrEqual(3);

            // 验证不包含自身
            related.forEach(item => {
                expect(item.id).not.toBe(1);
            });
        });

        it('should return empty array for content with no relationships', () => {
            const related = contentService.getRelatedContent(999, 5);
            expect(related).toEqual([]);
        });
    });

    describe('getHowToSteps', () => {
        it('should return steps for How-to content', () => {
            const steps = contentService.getHowToSteps(2);
            expect(Array.isArray(steps)).toBe(true);

            if (steps.length > 0) {
                expect(steps[0]).toHaveProperty('stepId');
                expect(steps[0]).toHaveProperty('name');
                expect(steps[0]).toHaveProperty('description');
                expect(steps[0]).toHaveProperty('stepOrder');
            }
        });

        it('should return empty array for non-How-to content', () => {
            const steps = contentService.getHowToSteps(1); // FAQ item
            expect(steps).toEqual([]);
        });
    });

    describe('getCaseDetails', () => {
        it('should return case details for case study content', () => {
            const details = contentService.getCaseDetails(3);
            if (details) {
                expect(details).toHaveProperty('contentId');
                expect(details).toHaveProperty('results');
                expect(details).toHaveProperty('lessons');
                expect(Array.isArray(details.results)).toBe(true);
                expect(Array.isArray(details.lessons)).toBe(true);
            }
        });

        it('should return null for non-case content', () => {
            const details = contentService.getCaseDetails(1); // FAQ item
            expect(details).toBeNull();
        });
    });

    describe('getContentStats', () => {
        it('should return content statistics', () => {
            const stats = contentService.getContentStats();
            expect(stats).toHaveProperty('totalItems');
            expect(stats).toHaveProperty('byType');
            expect(stats).toHaveProperty('totalRelationships');
            expect(stats).toHaveProperty('totalSteps');

            expect(typeof stats.totalItems).toBe('number');
            expect(typeof stats.byType).toBe('object');
            expect(typeof stats.totalRelationships).toBe('number');
            expect(typeof stats.totalSteps).toBe('number');
        });
    });

    describe('getPopularContent', () => {
        it('should return popular content items', () => {
            const popular = contentService.getPopularContent(5);
            expect(Array.isArray(popular)).toBe(true);
            expect(popular.length).toBeLessThanOrEqual(5);

            // 验证按优先级排序
            for (let i = 1; i < popular.length; i++) {
                expect(popular[i].priority <= popular[i - 1].priority).toBe(true);
            }
        });
    });

    describe('getLatestContent', () => {
        it('should return latest content items', () => {
            const latest = contentService.getLatestContent(5);
            expect(Array.isArray(latest)).toBe(true);
            expect(latest.length).toBeLessThanOrEqual(5);

            // 验证按更新时间排序
            for (let i = 1; i < latest.length; i++) {
                expect(new Date(latest[i].updatedAt).getTime() <= new Date(latest[i - 1].updatedAt).getTime()).toBe(true);
            }
        });
    });
});

describe('DatabaseContentAdapter', () => {
    beforeEach(async () => {
        // 创建测试数据库
        await fs.mkdir(path.dirname(TEST_DB_PATH), { recursive: true });
        const testDb = new Database(TEST_DB_PATH);
        setupTestDatabase(testDb);
        insertTestData(testDb);
        testDb.close();
    });

    afterEach(async () => {
        try {
            await fs.unlink(TEST_DB_PATH);
        } catch (error) {
            // 文件可能已不存在
        }
    });

    describe('DataSource Switching', () => {
        it('should use database by default', () => {
            const item = contentAdapter.getContentItem(1);
            expect(item).toBeTruthy();
        });

        it('should allow switching to filesystem fallback', () => {
            contentAdapter.setDataSource(false);

            // 这应该触发文件系统回退（返回null，因为我们没有测试文件）
            const item = contentAdapter.getContentItem(1);
            // 由于没有测试文件，预期返回null
            expect(item).toBeNull();

            // 恢复数据库模式
            contentAdapter.setDataSource(true);
        });
    });

    describe('Interface Compliance', () => {
        it('should implement all required methods', () => {
            expect(typeof contentAdapter.getContentItem).toBe('function');
            expect(typeof contentAdapter.getContentItemBySlug).toBe('function');
            expect(typeof contentAdapter.queryContent).toBe('function');
            expect(typeof contentAdapter.searchContent).toBe('function');
            expect(typeof contentAdapter.getRelatedContent).toBe('function');
            expect(typeof contentAdapter.getContentStats).toBe('function');
            expect(typeof contentAdapter.getPopularContent).toBe('function');
            expect(typeof contentAdapter.getLatestContent).toBe('function');
            expect(typeof contentAdapter.getHowToSteps).toBe('function');
            expect(typeof contentAdapter.getCaseDetails).toBe('function');
        });
    });
});

describe('ContentCacheService', () => {
    beforeEach(async () => {
        // 清空缓存
        cachedContentService.clearAllCache();
    });

    describe('Caching Behavior', () => {
        it('should cache and retrieve content items', () => {
            // 第一次查询（未缓存）
            const item1 = cachedContentService.getContentItem(1);
            expect(item1).toBeTruthy();

            // 第二次查询（应该从缓存获取）
            const item2 = cachedContentService.getContentItem(1);
            expect(item2).toEqual(item1);

            // 验证缓存统计
            const stats = cachedContentService.getCacheStats();
            expect(stats.total).toBeGreaterThan(0);
        });

        it('should clear specific content cache', () => {
            // 先缓存一些内容
            cachedContentService.getContentItem(1);
            cachedContentService.getContentItem(2);

            let stats = cachedContentService.getCacheStats();
            const initialCount = stats.total;

            // 清除特定内容的缓存
            cachedContentService.clearContentCache(1);

            stats = cachedContentService.getCacheStats();
            expect(stats.total).toBeLessThan(initialCount);
        });

        it('should clear all cache', () => {
            // 先缓存一些内容
            cachedContentService.getContentItem(1);
            cachedContentService.queryContent({ limit: 10 });

            // 清空所有缓存
            cachedContentService.clearAllCache();

            const stats = cachedContentService.getCacheStats();
            expect(stats.total).toBe(0);
        });
    });

    describe('Cache Statistics', () => {
        it('should provide cache statistics', () => {
            const stats = cachedContentService.getCacheStats();
            expect(stats).toHaveProperty('total');
            expect(stats).toHaveProperty('valid');
            expect(stats).toHaveProperty('expired');
            expect(stats).toHaveProperty('memoryUsage');

            expect(typeof stats.total).toBe('number');
            expect(typeof stats.valid).toBe('number');
            expect(typeof stats.expired).toBe('number');
            expect(typeof stats.memoryUsage).toBe('number');
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
            FOREIGN KEY (type_id) REFERENCES content_types(id),
            UNIQUE(slug, type_id)
        )
    `);

    // 创建SEO元数据表
    db.exec(`
        CREATE TABLE IF NOT EXISTS seo_metadata (
            content_id INTEGER PRIMARY KEY,
            meta_description TEXT,
            keywords TEXT DEFAULT '[]',
            og_title TEXT,
            og_description TEXT,
            og_image TEXT,
            twitter_card TEXT,
            FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
        )
    `);

    // 创建How-to步骤表
    db.exec(`
        CREATE TABLE IF NOT EXISTS howto_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER NOT NULL,
            step_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            tip TEXT,
            warning TEXT,
            step_order INTEGER NOT NULL,
            FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
            UNIQUE(content_id, step_id)
        )
    `);

    // 创建案例详情表
    db.exec(`
        CREATE TABLE IF NOT EXISTS case_details (
            content_id INTEGER PRIMARY KEY,
            problem TEXT,
            solution TEXT,
            results TEXT DEFAULT '[]',
            lessons TEXT DEFAULT '[]',
            tools_used TEXT DEFAULT '[]',
            background TEXT,
            challenge TEXT,
            approach TEXT DEFAULT '{}',
            results_detail TEXT DEFAULT '{}',
            key_insights TEXT DEFAULT '[]',
            recommendations TEXT DEFAULT '[]',
            FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
        )
    `);

    // 创建内容关系表
    db.exec(`
        CREATE TABLE IF NOT EXISTS content_relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_content_id INTEGER NOT NULL,
            to_content_id INTEGER NOT NULL,
            relationship_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (from_content_id) REFERENCES content_items(id) ON DELETE CASCADE,
            FOREIGN KEY (to_content_id) REFERENCES content_items(id) ON DELETE CASCADE
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

    insertType.run('faq', 'FAQ', '常见问题解答');
    insertType.run('howto', 'How-to', '操作指南');
    insertType.run('case', 'Case Study', '案例研究');

    // 插入测试内容项
    const insertContent = db.prepare(`
        INSERT OR IGNORE INTO content_items
        (type_id, slug, title, summary, content, status, difficulty, featured, priority, tags)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    // FAQ 测试数据
    insertContent.run(
        1, 'test-faq', 'Test FAQ Item', 'This is a test FAQ item',
        'Test FAQ content for unit testing', 'published', 'beginner', 1, 10,
        JSON.stringify(['statistics', 'test'])
    );

    // How-to 测试数据
    insertContent.run(
        2, 'test-howto', 'Test How-to Item', 'This is a test how-to item',
        'Test How-to content for unit testing', 'published', 'intermediate', 0, 5,
        JSON.stringify(['tutorial', 'guide'])
    );

    // Case 测试数据
    insertContent.run(
        3, 'test-case', 'Test Case Study', 'This is a test case study',
        'Test case content for unit testing', 'published', 'advanced', 1, 8,
        JSON.stringify(['case study', 'example'])
    );

    // 插入SEO元数据
    const insertSEO = db.prepare(`
        INSERT OR IGNORE INTO seo_metadata (content_id, meta_description, keywords)
        VALUES (?, ?, ?)
    `);

    insertSEO.run(1, 'Test FAQ meta description', JSON.stringify(['test', 'faq', 'statistics']));
    insertSEO.run(2, 'Test How-to meta description', JSON.stringify(['test', 'tutorial', 'guide']));
    insertSEO.run(3, 'Test Case meta description', JSON.stringify(['test', 'case', 'example']));

    // 插入How-to步骤
    const insertStep = db.prepare(`
        INSERT OR IGNORE INTO howto_steps (content_id, step_id, name, description, step_order)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertStep.run(2, 'step1', 'Step 1', 'First step description', 1);
    insertStep.run(2, 'step2', 'Step 2', 'Second step description', 2);

    // 插入案例详情
    const insertCaseDetails = db.prepare(`
        INSERT OR REPLACE INTO case_details (content_id, problem, solution, results, lessons)
        VALUES (?, ?, ?, ?, ?)
    `);

    insertCaseDetails.run(
        3,
        'Test problem description',
        'Test solution description',
        JSON.stringify(['Result 1', 'Result 2']),
        JSON.stringify(['Lesson 1', 'Lesson 2'])
    );

    // 插入内容关系
    const insertRelationship = db.prepare(`
        INSERT OR IGNORE INTO content_relationships (from_content_id, to_content_id, relationship_type)
        VALUES (?, ?, ?)
    `);

    insertRelationship.run(1, 2, 'related');
    insertRelationship.run(2, 3, 'related');
}