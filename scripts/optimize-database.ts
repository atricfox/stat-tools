#!/usr/bin/env tsx

/**
 * 数据库性能优化脚本
 * 优化索引、查询性能和缓存策略
 */

import Database from 'better-sqlite3';
import { getDatabase } from '../src/lib/db/client';

class DatabaseOptimizer {
    private db: Database.Database;

    constructor() {
        this.db = getDatabase();
    }

    /**
     * 分析当前数据库性能
     */
    analyzePerformance(): void {
        console.log('🔍 分析数据库性能...\n');

        // 检查索引统计
        console.log('📊 索引统计:');
        const indexStats = this.db.prepare(`
            SELECT
                name,
                tbl_name as table_name,
                sql
            FROM sqlite_master
            WHERE type = 'index'
            AND name NOT LIKE 'sqlite_%'
            ORDER BY tbl_name, name
        `).all();

        console.log(`   总计: ${indexStats.length} 个索引`);
        const indexByTable = indexStats.reduce((acc: any, index: any) => {
            if (!acc[index.table_name]) acc[index.table_name] = [];
            acc[index.table_name].push(index.name);
            return acc;
        }, {});

        Object.entries(indexByTable).forEach(([table, indexes]) => {
            console.log(`   ${table}: ${(indexes as string[]).join(', ')}`);
        });

        // 检查表大小
        console.log('\n📈 表大小统计:');
        const tables = this.db.prepare(`
            SELECT name
            FROM sqlite_master
            WHERE type = 'table'
            AND name NOT LIKE 'sqlite_%'
            AND name NOT LIKE 'content_%' -- 排除FTS虚拟表
            ORDER BY name
        `).all() as { name: string }[];

        tables.forEach((table) => {
            try {
                const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${table.name}`).get() as { count: number };
                console.log(`   ${table.name}: ${count.count} 行`);
            } catch (error) {
                console.log(`   ${table.name}: 无法获取行数`);
            }
        });

        // 检查数据库大小
        const pageSize = this.db.prepare('PRAGMA page_size').get() as { 'page_size': number };
        const pageCount = this.db.prepare('PRAGMA page_count').get() as { 'page_count': number };
        const dbSizeMB = (pageSize.page_size * pageCount.page_count) / 1024 / 1024;
        console.log(`\n💾 数据库大小: ${dbSizeMB.toFixed(2)} MB`);
    }

    /**
     * 优化索引
     */
    optimizeIndexes(): void {
        console.log('⚡ 优化索引...\n');

        const indexesToAdd = [
            // 计算器相关索引
            'CREATE INDEX IF NOT EXISTS idx_calculators_group ON calculators(group_id, sort_order)',
            'CREATE INDEX IF NOT EXISTS idx_calculators_popularity ON calculators(popularity)',
            'CREATE INDEX IF NOT EXISTS idx_calculators_updated ON calculators(updated_at DESC)',

            // 术语表相关索引
            'CREATE INDEX IF NOT EXISTS idx_terms_category ON term_categories(category_id, term_id)',
            'CREATE INDEX IF NOT EXISTS idx_terms_letter ON glossary_terms(first_letter)',
            'CREATE INDEX IF NOT EXISTS idx_terms_updated ON glossary_terms(updated_at DESC)',

            // 内容相关索引
            'CREATE INDEX IF NOT EXISTS idx_content_type ON content_items(type_id, status)',
            'CREATE INDEX IF NOT EXISTS idx_content_updated ON content_items(updated_at DESC)',
            'CREATE INDEX IF NOT EXISTS idx_content_reading_time ON content_items(reading_time)',
            'CREATE INDEX IF NOT EXISTS idx_metadata_key ON content_metadata(meta_key, content_id)',

            // 主题相关索引
            'CREATE INDEX IF NOT EXISTS idx_topic_guides_sort ON topic_guides(topic_id, sort_order)',
            'CREATE INDEX IF NOT EXISTS idx_topic_faqs_sort ON topic_faqs(topic_id, sort_order)',
            'CREATE INDEX IF NOT EXISTS idx_topics_updated ON topics(updated_at DESC)',
        ];

        indexesToAdd.forEach((sql, index) => {
            try {
                this.db.exec(sql);
                console.log(`   ✅ 创建索引 ${index + 1}/${indexesToAdd.length}`);
            } catch (error) {
                console.log(`   ❌ 索引创建失败: ${error}`);
            }
        });

        console.log('\n   ✅ 索引优化完成');
    }

    /**
     * 优化数据库设置
     */
    optimizeSettings(): void {
        console.log('⚙️ 优化数据库设置...\n');

        const settings = [
            { setting: 'PRAGMA journal_mode = WAL', description: '启用WAL模式' },
            { setting: 'PRAGMA synchronous = NORMAL', description: '设置同步模式' },
            { setting: 'PRAGMA cache_size = -10000', description: '设置缓存大小为10MB' },
            { setting: 'PRAGMA temp_store = MEMORY', description: '临时存储使用内存' },
            { setting: 'PRAGMA mmap_size = 268435456', description: '内存映射256MB' },
            { setting: 'PRAGMA foreign_keys = ON', description: '启用外键约束' },
        ];

        settings.forEach(({ setting, description }) => {
            try {
                this.db.exec(setting);
                console.log(`   ✅ ${description}`);
            } catch (error) {
                console.log(`   ❌ 设置失败: ${error}`);
            }
        });

        // 分析索引使用情况
        console.log('\n📊 索引使用分析:');
        try {
            this.db.exec('ANALYZE');
            console.log('   ✅ 数据库分析完成');
        } catch (error) {
            console.log(`   ❌ 分析失败: ${error}`);
        }
    }

    /**
     * 清理和优化
     */
    cleanup(): void {
        console.log('🧹 清理数据库...\n');

        try {
            // 清理临时数据
            this.db.exec('VACUUM');
            console.log('   ✅ 数据库清理完成');
        } catch (error) {
            console.log(`   ❌ 清理失败: ${error}`);
        }
    }

    /**
     * 生成性能报告
     */
    generateReport(): void {
        console.log('\n📋 性能优化报告\n');

        // 获取数据库统计信息
        const stats = this.db.prepare(`
            SELECT
                (SELECT COUNT(*) FROM calculators) as calculators_count,
                (SELECT COUNT(*) FROM calculator_groups) as groups_count,
                (SELECT COUNT(*) FROM glossary_terms) as terms_count,
                (SELECT COUNT(*) FROM categories) as categories_count,
                (SELECT COUNT(*) FROM content_items) as content_count,
                (SELECT COUNT(*) FROM topics) as topics_count,
                (SELECT COUNT(*) FROM sqlite_master WHERE type = 'index' AND name NOT LIKE 'sqlite_%') as index_count
        `).get() as any;

        console.log('📊 数据统计:');
        console.log(`   计算器: ${stats.calculators_count} 个`);
        console.log(`   计算器分组: ${stats.groups_count} 个`);
        console.log(`   术语: ${stats.terms_count} 个`);
        console.log(`   分类: ${stats.categories_count} 个`);
        console.log(`   内容项: ${stats.content_count} 个`);
        console.log(`   主题: ${stats.topics_count} 个`);
        console.log(`   索引: ${stats.index_count} 个`);

        // 检查缓存效率
        console.log('\n⚡ 性能建议:');
        console.log('   1. 使用服务层缓存减少数据库查询');
        console.log('   2. 批量操作使用事务');
        console.log('   3. 大数据量查询使用分页');
        console.log('   4. 使用FTS5进行全文搜索');

        console.log('\n✅ 数据库优化完成！');
    }

    /**
     * 执行完整优化流程
     */
    async runOptimization(): Promise<void> {
        try {
            console.log('🚀 开始数据库性能优化...\n');

            this.analyzePerformance();
            console.log();

            this.optimizeIndexes();
            console.log();

            this.optimizeSettings();
            console.log();

            this.cleanup();
            console.log();

            this.generateReport();

        } catch (error) {
            console.error('\n❌ 优化过程中发生错误:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const optimizer = new DatabaseOptimizer();
    optimizer.runOptimization().catch(error => {
        console.error('优化过程中发生错误:', error);
        process.exit(1);
    });
}

export { DatabaseOptimizer };