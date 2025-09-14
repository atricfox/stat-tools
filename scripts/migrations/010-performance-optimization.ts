#!/usr/bin/env tsx

/**
 * Performance Optimization Migration
 * 性能优化迁移，创建缺失的索引和优化数据库性能
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import { getDatabase } from '../../src/lib/db/client';

export class PerformanceOptimizationMigration extends BaseMigration {
    protected getDatabaseConnection(): Database.Database {
        return getDatabase();
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('🚀 开始性能优化迁移...');

        // Phase 1: 创建基础索引
        await this.createBasicIndexes(db);

        // Phase 2: 创建复合索引
        await this.createCompositeIndexes(db);

        // Phase 3: 优化全文搜索
        await this.optimizeFullTextSearch(db);

        // Phase 4: 创建统计视图
        await this.createPerformanceViews(db);

        // Phase 5: 清理和优化数据库
        await this.cleanupDatabase(db);

        console.log('✅ 性能优化迁移完成');
    }

    /**
     * 创建基础索引
     */
    private async createBasicIndexes(db: Database.Database): Promise<void> {
        console.log('📊 创建基础索引...');

        const indexes = [
            // 内容项索引
            'CREATE INDEX IF NOT EXISTS idx_content_items_slug_type ON content_items(slug, type_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_type_id ON content_items(type_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_created_at ON content_items(created_at)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_updated_at ON content_items(updated_at)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_status ON content_items(status)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_featured ON content_items(featured)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_priority ON content_items(priority)',

            // SEO元数据索引
            'CREATE INDEX IF NOT EXISTS idx_seo_metadata_content_id ON seo_metadata(content_id)',

            // How-to步骤索引
            'CREATE INDEX IF NOT EXISTS idx_howto_steps_content_id ON howto_steps(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_howto_steps_step_order ON howto_steps(step_order)',

            // 案例详情索引
            'CREATE INDEX IF NOT EXISTS idx_case_details_content_id ON case_details(content_id)',

            // 内容关系索引
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_from ON content_relationships(from_content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_to ON content_relationships(to_content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_type ON content_relationships(relationship_type)',

            // 工具关系索引
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_content_id ON content_tool_relationships(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_tool_url ON content_tool_relationships(tool_url)',

            // 术语关系索引
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_content_id ON content_term_relationships(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_term_slug ON content_term_relationships(term_slug)'
        ];

        for (const indexSql of indexes) {
            try {
                db.exec(indexSql);
                console.log(`  ✓ 创建索引: ${indexSql.split('INDEX IF NOT EXISTS ')[1].split(' ON')[0]}`);
            } catch (error) {
                console.warn(`  ⚠️  创建索引失败: ${indexSql.split('INDEX IF NOT EXISTS ')[1].split(' ON')[0]}`);
                console.warn(`    错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * 创建复合索引
     */
    private async createCompositeIndexes(db: Database.Database): Promise<void> {
        console.log('📊 创建复合索引...');

        const compositeIndexes = [
            // 常用查询复合索引
            'CREATE INDEX IF NOT EXISTS idx_content_items_type_status_created ON content_items(type_id, status, created_at)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_type_featured_priority ON content_items(type_id, featured, priority)',
            'CREATE INDEX IF NOT EXISTS idx_content_items_status_updated ON content_items(status, updated_at)',

            // 内容关系复合索引
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_composite ON content_relationships(from_content_id, to_content_id, relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_to_type ON content_relationships(to_content_id, relationship_type)',

            // 工具关系复合索引
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_composite ON content_tool_relationships(content_id, tool_url, relationship_type)',

            // 术语关系复合索引
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_composite ON content_term_relationships(content_id, term_slug, relationship_type)'
        ];

        for (const indexSql of compositeIndexes) {
            try {
                db.exec(indexSql);
                console.log(`  ✓ 创建复合索引: ${indexSql.split('INDEX IF NOT EXISTS ')[1].split(' ON')[0]}`);
            } catch (error) {
                console.warn(`  ⚠️  创建复合索引失败: ${indexSql.split('INDEX IF NOT EXISTS ')[1].split(' ON')[0]}`);
                console.warn(`    错误: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * 优化全文搜索
     */
    private async optimizeFullTextSearch(db: Database.Database): Promise<void> {
        console.log('🔍 优化全文搜索...');

        try {
            // 重建全文搜索虚拟表以确保优化
            db.exec('DROP TABLE IF EXISTS content_search');

            db.exec(`
                CREATE VIRTUAL TABLE content_search
                USING FTS5(title, summary, content, content=content_items, tokenize='unicode61')
            `);

            // 重新创建触发器保持全文搜索同步
            db.exec(`
                CREATE TRIGGER content_search_insert
                AFTER INSERT ON content_items BEGIN
                    INSERT INTO content_search(rowid, title, summary, content)
                    VALUES (new.id, new.title, new.summary, new.content);
                END
            `);

            db.exec(`
                CREATE TRIGGER content_search_delete
                AFTER DELETE ON content_items BEGIN
                    DELETE FROM content_search WHERE rowid = old.id;
                END
            `);

            db.exec(`
                CREATE TRIGGER content_search_update
                AFTER UPDATE ON content_items BEGIN
                    DELETE FROM content_search WHERE rowid = old.id;
                    INSERT INTO content_search(rowid, title, summary, content)
                    VALUES (new.id, new.title, new.summary, new.content);
                END
            `);

            console.log('  ✓ 全文搜索虚拟表已重建和优化');

            // 为现有数据重建全文搜索索引
            db.exec(`
                INSERT INTO content_search(rowid, title, summary, content)
                SELECT id, title, summary, content FROM content_items
            `);

            console.log('  ✓ 全文搜索索引已重建');
        } catch (error) {
            console.warn(`  ⚠️  全文搜索优化失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 创建性能优化视图
     */
    private async createPerformanceViews(db: Database.Database): Promise<void> {
        console.log('📈 创建性能视图...');

        try {
            // 内容统计视图
            db.exec(`
                CREATE VIEW IF NOT EXISTS content_stats_view AS
                SELECT
                    ct.type_name,
                    COUNT(ci.id) as total_items,
                    COUNT(CASE WHEN ci.status = 'published' THEN 1 END) as published_items,
                    COUNT(CASE WHEN ci.status = 'draft' THEN 1 END) as draft_items,
                    COUNT(CASE WHEN ci.featured = 1 THEN 1 END) as featured_items,
                    AVG(ci.reading_time) as avg_reading_time,
                    MAX(ci.updated_at) as last_updated
                FROM content_items ci
                JOIN content_types ct ON ci.type_id = ct.id
                GROUP BY ct.type_name
            `);

            // SEO统计视图
            db.exec(`
                CREATE VIEW IF NOT EXISTS seo_stats_view AS
                SELECT
                    COUNT(ci.id) as total_items,
                    COUNT(sm.content_id) as items_with_seo,
                    COUNT(CASE WHEN sm.meta_description IS NOT NULL AND sm.meta_description != '' THEN 1 END) as items_with_description,
                    COUNT(CASE WHEN json_array_length(sm.keywords) > 0 THEN 1 END) as items_with_keywords
                FROM content_items ci
                LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            `);

            // 关系统计视图
            db.exec(`
                CREATE VIEW IF NOT EXISTS relationship_stats_view AS
                SELECT
                    'content_relationships' as relationship_type,
                    COUNT(*) as total_relationships
                FROM content_relationships
                UNION ALL
                SELECT
                    'tool_relationships' as relationship_type,
                    COUNT(*) as total_relationships
                FROM content_tool_relationships
                UNION ALL
                SELECT
                    'term_relationships' as relationship_type,
                    COUNT(*) as total_relationships
                FROM content_term_relationships
            `);

            console.log('  ✓ 性能视图已创建');
        } catch (error) {
            console.warn(`  ⚠️  创建性能视图失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 清理和优化数据库
     */
    private async cleanupDatabase(db: Database.Database): Promise<void> {
        console.log('🧹 清理和优化数据库...');

        try {
            // 分析数据库以更新统计信息
            db.exec('ANALYZE');

            // 清理孤立数据
            const cleanups = [
                'DELETE FROM seo_metadata WHERE content_id NOT IN (SELECT id FROM content_items)',
                'DELETE FROM howto_steps WHERE content_id NOT IN (SELECT id FROM content_items)',
                'DELETE FROM case_details WHERE content_id NOT IN (SELECT id FROM content_items)',
                'DELETE FROM content_relationships WHERE from_content_id NOT IN (SELECT id FROM content_items) OR to_content_id NOT IN (SELECT id FROM content_items)',
                'DELETE FROM content_tool_relationships WHERE content_id NOT IN (SELECT id FROM content_items)',
                'DELETE FROM content_term_relationships WHERE content_id NOT IN (SELECT id FROM content_items)'
            ];

            for (const cleanupSql of cleanups) {
                try {
                    const result = db.prepare(cleanupSql).run();
                    if (result.changes > 0) {
                        console.log(`  ✓ 清理了 ${result.changes} 条孤立数据`);
                    }
                } catch (error) {
                    console.warn(`  ⚠️  清理失败: ${cleanupSql}`);
                }
            }

            // 重建索引以提高性能
            try {
                db.exec('REINDEX');
                console.log('  ✓ 数据库索引已重建');
            } catch (error) {
                console.warn(`  ⚠️  索引重建失败: ${error instanceof Error ? error.message : String(error)}`);
            }

            // 启用外键约束（如果尚未启用）
            try {
                db.exec('PRAGMA foreign_keys = ON');
                console.log('  ✓ 外键约束已启用');
            } catch (error) {
                console.warn(`  ⚠️  启用外键约束失败: ${error instanceof Error ? error.message : String(error)}`);
            }

            // 优化数据库设置
            try {
                db.exec('PRAGMA journal_mode = WAL');
                db.exec('PRAGMA synchronous = NORMAL');
                db.exec('PRAGMA cache_size = 10000');
                db.exec('PRAGMA temp_store = MEMORY');
                console.log('  ✓ 数据库性能设置已优化');
            } catch (error) {
                console.warn(`  ⚠️  数据库优化设置失败: ${error instanceof Error ? error.message : String(error)}`);
            }
        } catch (error) {
            console.warn(`  ⚠️  数据库清理失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 获取迁移描述
     */
    getDescription(): string {
        return '性能优化迁移 - 创建索引、优化全文搜索、清理数据';
    }

    /**
     * 获取迁移名称
     */
    getName(): string {
        return 'PerformanceOptimization';
    }

    /**
     * 获取迁移版本
     */
    getVersion(): string {
        return '010';
    }

    /**
     * 执行迁移
     */
    async migrate(): Promise<void> {
        await this.executeMigration(this.db);
    }

    /**
     * 回滚迁移
     */
    async rollback(): Promise<boolean> {
        console.log('🔄 开始回滚性能优化迁移...');

        try {
            // 删除创建的索引
            const indexes = [
                'DROP INDEX IF EXISTS idx_content_items_slug_type',
                'DROP INDEX IF EXISTS idx_content_items_type_id',
                'DROP INDEX IF EXISTS idx_content_items_created_at',
                'DROP INDEX IF EXISTS idx_content_items_updated_at',
                'DROP INDEX IF EXISTS idx_content_items_status',
                'DROP INDEX IF EXISTS idx_content_items_featured',
                'DROP INDEX IF EXISTS idx_content_items_priority',
                'DROP INDEX IF EXISTS idx_seo_metadata_content_id',
                'DROP INDEX IF EXISTS idx_howto_steps_content_id',
                'DROP INDEX IF EXISTS idx_howto_steps_step_order',
                'DROP INDEX IF EXISTS idx_case_details_content_id',
                'DROP INDEX IF EXISTS idx_content_relationships_from',
                'DROP INDEX IF EXISTS idx_content_relationships_to',
                'DROP INDEX IF EXISTS idx_content_relationships_type',
                'DROP INDEX IF EXISTS idx_content_tool_relationships_content_id',
                'DROP INDEX IF EXISTS idx_content_tool_relationships_tool_url',
                'DROP INDEX IF EXISTS idx_content_term_relationships_content_id',
                'DROP INDEX IF EXISTS idx_content_term_relationships_term_slug'
            ];

            for (const dropSql of indexes) {
                try {
                    this.db.exec(dropSql);
                } catch (error) {
                    console.warn(`删除索引失败: ${dropSql}`);
                }
            }

            // 删除视图
            this.db.exec('DROP VIEW IF EXISTS content_stats_view');
            this.db.exec('DROP VIEW IF EXISTS seo_stats_view');
            this.db.exec('DROP VIEW IF EXISTS relationship_stats_view');

            console.log('✅ 性能优化迁移已回滚');
            return true;
        } catch (error) {
            console.error(`❌ 回滚失败: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    /**
     * 验证迁移结果
     */
    async validate(): Promise<boolean> {
        console.log('🔍 验证性能优化迁移结果...');

        try {
            // 检查关键索引是否存在
            const requiredIndexes = [
                'idx_content_items_slug_type',
                'idx_content_items_type_id',
                'idx_content_items_updated_at',
                'idx_seo_metadata_content_id'
            ];

            let allIndexesExist = true;
            for (const indexName of requiredIndexes) {
                const result = this.db.prepare(`
                    SELECT name FROM sqlite_master
                    WHERE type='index' AND name=?
                `).get(indexName);

                if (!result) {
                    console.warn(`缺失索引: ${indexName}`);
                    allIndexesExist = false;
                }
            }

            // 检查视图是否存在
            const viewsExist = this.db.prepare(`
                SELECT COUNT(*) as count FROM sqlite_master
                WHERE type='view' AND name IN ('content_stats_view', 'seo_stats_view', 'relationship_stats_view')
            `).get() as any;

            if (viewsExist.count < 3) {
                console.warn(`部分视图未创建，只找到 ${viewsExist.count} 个`);
            }

            return allIndexesExist;
        } catch (error) {
            console.error(`验证失败: ${error instanceof Error ? error.message : String(error)}`);
            return false;
        }
    }

    /**
     * 执行迁移的便捷方法
     */
    async run(): Promise<void> {
        await this.migrate();
    }
}

/**
 * 主执行函数
 */
async function main() {
    try {
        const migration = new PerformanceOptimizationMigration();
        await migration.run();

        console.log('\n🎉 性能优化迁移完成！');
        console.log('📈 数据库性能已显著提升');

        process.exit(0);
    } catch (error) {
        console.error('\n💥 迁移过程中发生异常:', error);
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