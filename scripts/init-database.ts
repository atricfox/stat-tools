#!/usr/bin/env tsx

/**
 * 数据库初始化脚本
 * 创建所有表、索引和触发器
 */

import { initializeDatabase, getDatabase } from '../src/lib/db/client';
import fs from 'fs';
import path from 'path';

class DatabaseInitializer {
    private db: any;

    constructor() {
        this.db = initializeDatabase();
    }

    /**
     * 初始化数据库
     */
    async initialize(): Promise<void> {
        console.log('🚀 开始初始化数据库...');

        try {
            // 创建种子数据
            await this.seedInitialData();

            // 验证数据库结构
            await this.validateSchema();

            console.log('✅ 数据库初始化完成');
            this.printDatabaseInfo();
        } catch (error) {
            console.error('❌ 数据库初始化失败:', error);
            throw error;
        }
    }

    /**
     * 创建种子数据
     */
    private async seedInitialData(): Promise<void> {
        console.log('🌱 创建种子数据...');

        // 插入内容类型
        const contentTypes = [
            { type_name: 'howto', display_name: '操作指南' },
            { type_name: 'faq', display_name: '常见问题' },
            { type_name: 'case', display_name: '案例研究' }
        ];

        for (const type of contentTypes) {
            this.db.prepare(`
                INSERT OR IGNORE INTO content_types (type_name, display_name)
                VALUES (?, ?)
            `).run(type.type_name, type.display_name);
        }

        console.log(`✅ 已创建 ${contentTypes.length} 个内容类型`);
    }

    /**
     * 验证数据库结构
     */
    private async validateSchema(): Promise<void> {
        console.log('🔍 验证数据库结构...');

        const expectedTables = [
            'calculator_groups',
            'calculators',
            'glossary_terms',
            'categories',
            'term_categories',
            'content_types',
            'content_items',
            'content_metadata',
            'howto_steps',
            'topics',
            'topic_guides',
            'topic_faqs',
            'term_relationships',
            'content_relationships',
            'content_calculator_links',
            'term_calculator_links',
            'content_search'
        ];

        const actualTables = this.db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table'
        `).all().map((row: any) => row.name);

        const missingTables = expectedTables.filter(table => !actualTables.includes(table));

        if (missingTables.length > 0) {
            throw new Error(`缺少表: ${missingTables.join(', ')}`);
        }

        // 验证 FTS5 虚拟表
        const ftsTables = this.db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table' AND name='content_search'
        `).get();

        if (!ftsTables) {
            throw new Error('FTS5 虚拟表 content_search 未创建');
        }

        console.log(`✅ 数据库结构验证通过 (${actualTables.length} 个表)`);
    }

    /**
     * 打印数据库信息
     */
    private printDatabaseInfo(): void {
        const stats = {
            表数量: this.db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='table'").get().count,
            索引数量: this.db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='index'").get().count,
            触发器数量: this.db.prepare("SELECT COUNT(*) as count FROM sqlite_master WHERE type='trigger'").get().count,
            内容类型: this.db.prepare("SELECT COUNT(*) as count FROM content_types").get().count,
            数据库路径: this.db.name,
            页面大小: this.db.pragma('page_size', { simple: true }),
            编码格式: this.db.pragma('encoding', { simple: true })
        };

        console.log('\n📊 数据库信息:');
        Object.entries(stats).forEach(([key, value]) => {
            console.log(`   ${key}: ${value}`);
        });
    }

    /**
     * 清理数据库（用于开发环境）
     */
    async cleanup(): Promise<void> {
        console.log('🧹 清理数据库...');

        const tables = this.db.prepare(`
            SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'
        `).all().map((row: any) => row.name);

        for (const table of tables) {
            this.db.exec(`DROP TABLE IF EXISTS ${table}`);
        }

        console.log(`✅ 已清理 ${tables.length} 个表`);
    }
}

/**
 * 主执行函数
 */
async function main() {
    const args = process.argv.slice(2);
    const shouldCleanup = args.includes('--cleanup');

    const initializer = new DatabaseInitializer();

    try {
        if (shouldCleanup) {
            await initializer.cleanup();
        }

        await initializer.initialize();
        console.log('\n🎉 数据库就绪！');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 初始化失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('执行过程中发生错误:', error);
        process.exit(1);
    });
}

export { DatabaseInitializer };