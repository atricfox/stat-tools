#!/usr/bin/env tsx

/**
 * Content Enhancement Migration
 * 增强内容数据库架构，支持更丰富的内容类型和关系
 * 基于Content文件夹JSON数据迁移技术方案
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';

/**
 * Content Enhancement Migration
 * 增强内容数据库架构，支持更丰富的内容类型和关系
 */
export class ContentEnhancementMigration extends BaseMigration {
    constructor() {
        super();
    }

    protected getDatabaseConnection(): Database.Database {
        const { getDatabase } = require('../../src/lib/db/client');
        return getDatabase();
    }

    getName(): string {
        return 'Content Enhancement';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Enhance content database schema for rich content types and relationships';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('🔧 开始增强内容数据库架构...');

        // Phase 1: 增强content_items表
        await this.enhanceContentItemsTable(db);

        // Phase 2: 创建关系表
        await this.createRelationshipTables(db);

        // Phase 3: 创建元数据表
        await this.createMetadataTables(db);

        // Phase 4: 创建步骤表
        await this.createStepsTable(db);

        // Phase 5: 创建性能优化索引
        await this.createOptimizationIndexes(db);

        console.log('✅ 内容数据库架构增强完成');
    }

    private async enhanceContentItemsTable(db: Database.Database): Promise<void> {
        console.log('📊 增强content_items表...');

        const columnsToAdd = [
            { name: 'difficulty', type: 'TEXT', default: null },
            { name: 'featured', type: 'BOOLEAN', default: 'FALSE' },
            { name: 'priority', type: 'INTEGER', default: '0' },
            { name: 'industry', type: 'TEXT', default: null },
            { name: 'target_tool', type: 'TEXT', default: null },
            { name: 'seo_meta_description', type: 'TEXT', default: null },
            { name: 'seo_keywords', type: 'TEXT', default: null },
            { name: 'tags', type: 'TEXT', default: null } // JSON格式存储标签数组
        ];

        for (const column of columnsToAdd) {
            try {
                // SQLite的ALTER TABLE语法，使用IF NOT EXISTS需要特殊处理
                const existingColumns = db.prepare("PRAGMA table_info(content_items)").all() as any[];
                const columnExists = existingColumns.some(col => col.name === column.name);

                if (!columnExists) {
                    if (column.default) {
                        db.exec(`ALTER TABLE content_items ADD COLUMN ${column.name} ${column.type} DEFAULT ${column.default}`);
                    } else {
                        db.exec(`ALTER TABLE content_items ADD COLUMN ${column.name} ${column.type}`);
                    }
                    console.log(`  ✓ 添加列: ${column.name}`);
                } else {
                    console.log(`  ⚠️ 列 ${column.name} 已存在，跳过`);
                }
            } catch (error) {
                console.warn(`  ⚠️ 列 ${column.name} 添加失败: ${error.message}`);
            }
        }

        // 验证列添加成功
        const columns = db.prepare("PRAGMA table_info(content_items)").all() as any[];
        const columnNames = columns.map(col => col.name);
        console.log(`  📋 content_items表当前列数: ${columnNames.length}`);
    }

    private async createRelationshipTables(db: Database.Database): Promise<void> {
        console.log('🔗 创建关系表...');

        // 内容关系表
        db.exec(`
            CREATE TABLE IF NOT EXISTS content_relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                from_content_id INTEGER NOT NULL,
                to_content_id INTEGER NOT NULL,
                relationship_type TEXT NOT NULL CHECK (relationship_type IN ('similar', 'prerequisite', 'follow_up')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (from_content_id) REFERENCES content_items(id) ON DELETE CASCADE,
                FOREIGN KEY (to_content_id) REFERENCES content_items(id) ON DELETE CASCADE,
                UNIQUE(from_content_id, to_content_id, relationship_type)
            )
        `);
        console.log('  ✓ 创建content_relationships表');

        // 工具关系表
        db.exec(`
            CREATE TABLE IF NOT EXISTS content_tool_relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id INTEGER NOT NULL,
                tool_url TEXT NOT NULL,
                relationship_type TEXT NOT NULL CHECK (relationship_type IN ('target', 'mentioned', 'used')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
                UNIQUE(content_id, tool_url, relationship_type)
            )
        `);
        console.log('  ✓ 创建content_tool_relationships表');

        // 术语关系表
        db.exec(`
            CREATE TABLE IF NOT EXISTS content_term_relationships (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id INTEGER NOT NULL,
                term_slug TEXT NOT NULL,
                relationship_type TEXT NOT NULL CHECK (relationship_type IN ('explained', 'mentioned', 'related')),
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
                UNIQUE(content_id, term_slug, relationship_type)
            )
        `);
        console.log('  ✓ 创建content_term_relationships表');
    }

    private async createMetadataTables(db: Database.Database): Promise<void> {
        console.log('📝 创建元数据表...');

        // 案例详细信息表
        db.exec(`
            CREATE TABLE IF NOT EXISTS case_details (
                content_id INTEGER PRIMARY KEY,
                problem TEXT,
                solution TEXT,
                results JSON, -- 存储结果数组
                lessons JSON, -- 存储教训数组
                tools_used JSON, -- 存储使用的工具数组
                background TEXT,
                challenge TEXT,
                approach JSON, -- 存储方法步骤
                results_detail JSON, -- 存储详细结果
                key_insights JSON, -- 存储关键洞察
                recommendations JSON, -- 存储建议
                FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ 创建case_details表');

        // SEO元数据表
        db.exec(`
            CREATE TABLE IF NOT EXISTS seo_metadata (
                content_id INTEGER PRIMARY KEY,
                meta_description TEXT,
                keywords TEXT, -- JSON数组格式
                og_title TEXT,
                og_description TEXT,
                og_image TEXT,
                twitter_card TEXT,
                FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
            )
        `);
        console.log('  ✓ 创建seo_metadata表');
    }

    private async createStepsTable(db: Database.Database): Promise<void> {
        console.log('📋 创建步骤表...');

        db.exec(`
            CREATE TABLE IF NOT EXISTS howto_steps (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                content_id INTEGER NOT NULL,
                step_id TEXT NOT NULL,
                name TEXT NOT NULL,
                description TEXT NOT NULL,
                tip TEXT,
                warning TEXT,
                step_order INTEGER NOT NULL,
                created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
                UNIQUE(content_id, step_id)
            )
        `);
        console.log('  ✓ 创建howto_steps表');
    }

    private async createOptimizationIndexes(db: Database.Database): Promise<void> {
        console.log('⚡ 创建性能优化索引...');

        const indexes = [
            // 基础索引
            'CREATE INDEX IF NOT EXISTS idx_content_featured ON content_items(featured, priority)',
            'CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content_items(difficulty)',
            'CREATE INDEX IF NOT EXISTS idx_content_industry ON content_items(industry)',
            'CREATE INDEX IF NOT EXISTS idx_content_target_tool ON content_items(target_tool)',
            'CREATE INDEX IF NOT EXISTS idx_content_seo_meta ON content_items(seo_meta_description)',

            // 关系表索引
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_from ON content_relationships(from_content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_to ON content_relationships(to_content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_type ON content_relationships(relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships ON content_tool_relationships(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_type ON content_tool_relationships(relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships ON content_term_relationships(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_type ON content_term_relationships(relationship_type)',

            // 步骤表索引
            'CREATE INDEX IF NOT EXISTS idx_howto_steps_content ON howto_steps(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_howto_steps_order ON howto_steps(step_order)',

            // 元数据表索引
            'CREATE INDEX IF NOT EXISTS idx_case_details_content ON case_details(content_id)',
            'CREATE INDEX IF NOT EXISTS idx_seo_metadata_content ON seo_metadata(content_id)'
        ];

        for (const indexSql of indexes) {
            try {
                db.exec(indexSql);
            } catch (error) {
                console.warn(`  ⚠️ 索引创建失败: ${error.message}`);
            }
        }

        console.log('  ✓ 创建了所有优化索引');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚内容增强迁移...');

        // 删除索引
        const indexes = [
            'idx_content_featured', 'idx_content_difficulty', 'idx_content_industry',
            'idx_content_target_tool', 'idx_content_seo_meta', 'idx_content_relationships_from',
            'idx_content_relationships_to', 'idx_content_relationships_type',
            'idx_content_tool_relationships', 'idx_content_tool_relationships_type',
            'idx_content_term_relationships', 'idx_content_term_relationships_type',
            'idx_howto_steps_content', 'idx_howto_steps_order', 'idx_case_details_content',
            'idx_seo_metadata_content'
        ];

        for (const index of indexes) {
            try {
                db.exec(`DROP INDEX IF EXISTS ${index}`);
            } catch (error) {
                console.warn(`  ⚠️ 删除索引失败: ${index} - ${error.message}`);
            }
        }

        // 删除表
        const tables = [
            'howto_steps', 'seo_metadata', 'case_details',
            'content_term_relationships', 'content_tool_relationships',
            'content_relationships'
        ];

        for (const table of tables) {
            try {
                db.exec(`DROP TABLE IF EXISTS ${table}`);
                console.log(`  ✓ 删除表: ${table}`);
            } catch (error) {
                console.warn(`  ⚠️ 删除表失败: ${table} - ${error.message}`);
            }
        }

        // 删除新增列（SQLite不支持直接删除列，需要重建表）
        console.log('  ⚠️ 注意: SQLite不支持直接删除列，需要手动处理');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证内容增强迁移...');

        // 验证表是否存在
        const tables = [
            'content_relationships',
            'content_tool_relationships',
            'content_term_relationships',
            'case_details',
            'seo_metadata',
            'howto_steps'
        ];

        for (const table of tables) {
            try {
                const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`).get(table);
                if (!result) {
                    console.error(`  ❌ 表 ${table} 不存在`);
                    return false;
                }
                console.log(`  ✓ 表 ${table} 存在`);
            } catch (error) {
                console.error(`  ❌ 验证表 ${table} 失败: ${error.message}`);
                return false;
            }
        }

        // 验证索引
        const indexes = [
            'idx_content_featured', 'idx_content_difficulty',
            'idx_content_relationships_from', 'idx_howto_steps_content'
        ];

        for (const index of indexes) {
            try {
                const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='index' AND name=?`).get(index);
                if (!result) {
                    console.warn(`  ⚠️ 索引 ${index} 不存在`);
                } else {
                    console.log(`  ✓ 索引 ${index} 存在`);
                }
            } catch (error) {
                console.warn(`  ⚠️ 验证索引 ${index} 失败: ${error.message}`);
            }
        }

        console.log('✅ 内容增强迁移验证完成');
        return true;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new ContentEnhancementMigration();

    try {
        console.log('🚀 开始内容增强迁移...');

        // 创建备份
        const backupPath = migration.createBackup();
        console.log(`📦 创建备份: ${backupPath}`);

        // 执行迁移
        await migration.executeMigration(migration.getDatabaseConnection());

        // 验证迁移结果
        const isValid = await migration.validateMigration(migration.getDatabaseConnection());

        if (!isValid) {
            throw new Error('迁移验证失败');
        }

        console.log('\n🎉 内容增强迁移成功完成！');
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

// 导出类供其他模块使用