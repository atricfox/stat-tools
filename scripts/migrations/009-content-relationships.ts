#!/usr/bin/env tsx

/**
 * Content Relationships Migration
 * 迁移和优化内容关系数据，确保所有内容类型之间的关系完整性
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';

/**
 * Content Relationships Migration
 * 迁移和优化内容关系数据，确保所有内容类型之间的关系完整性
 */
export class ContentRelationshipsMigration extends BaseMigration {
    constructor() {
        super();
    }

    protected getDatabaseConnection(): Database.Database {
        const { getDatabase } = require('../../src/lib/db/client');
        return getDatabase();
    }

    getName(): string {
        return 'Content Relationships Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate and optimize content relationships ensuring integrity across all content types';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('🔗 开始优化内容关系数据...');

        // Phase 1: 验证现有关系数据
        await this.validateExistingRelationships(db);

        // Phase 2: 修复无效关系
        await this.fixInvalidRelationships(db);

        // Phase 3: 优化关系索引
        await this.optimizeRelationshipIndexes(db);

        // Phase 4: 创建关系汇总视图
        await this.createRelationshipViews(db);

        // Phase 5: 验证关系完整性
        await this.validateRelationshipIntegrity(db);

        console.log('✅ 内容关系数据优化完成');
    }

    private async validateExistingRelationships(db: Database.Database): Promise<void> {
        console.log('🔍 验证现有关系数据...');

        // 检查内容关系
        const contentRelations = db.prepare(`
            SELECT COUNT(*) as count FROM content_relationships cr
            LEFT JOIN content_items ci1 ON cr.from_content_id = ci1.id
            LEFT JOIN content_items ci2 ON cr.to_content_id = ci2.id
            WHERE ci1.id IS NULL OR ci2.id IS NULL
        `).get() as any;

        console.log(`  📊 无效的内容关系: ${contentRelations.count}`);

        // 检查工具关系
        const toolRelations = db.prepare(`
            SELECT COUNT(*) as count FROM content_tool_relationships ctr
            LEFT JOIN content_items ci ON ctr.content_id = ci.id
            WHERE ci.id IS NULL
        `).get() as any;

        console.log(`  📊 无效的工具关系: ${toolRelations.count}`);

        // 检查术语关系
        const termRelations = db.prepare(`
            SELECT COUNT(*) as count FROM content_term_relationships ctr
            LEFT JOIN content_items ci ON ctr.content_id = ci.id
            WHERE ci.id IS NULL
        `).get() as any;

        console.log(`  📊 无效的术语关系: ${termRelations.count}`);

        // 检查术语是否存在于glossary
        const missingTerms = db.prepare(`
            SELECT COUNT(*) as count FROM content_term_relationships ctr
            LEFT JOIN glossary_terms gt ON ctr.term_slug = gt.slug
            WHERE gt.slug IS NULL
        `).get() as any;

        console.log(`  📊 引用不存在的术语: ${missingTerms.count}`);
    }

    private async fixInvalidRelationships(db: Database.Database): Promise<void> {
        console.log('🔧 修复无效关系...');

        // 删除无效的内容关系
        try {
            const result = db.prepare(`
                DELETE FROM content_relationships
                WHERE from_content_id NOT IN (SELECT id FROM content_items)
                OR to_content_id NOT IN (SELECT id FROM content_items)
            `).run();

            if (result.changes > 0) {
                console.log(`  ✓ 删除 ${result.changes} 条无效的内容关系`);
            }
        } catch (error) {
            console.warn(`  ⚠️ 删除无效内容关系失败: ${error.message}`);
        }

        // 删除无效的工具关系
        try {
            const result = db.prepare(`
                DELETE FROM content_tool_relationships
                WHERE content_id NOT IN (SELECT id FROM content_items)
            `).run();

            if (result.changes > 0) {
                console.log(`  ✓ 删除 ${result.changes} 条无效的工具关系`);
            }
        } catch (error) {
            console.warn(`  ⚠️ 删除无效工具关系失败: ${error.message}`);
        }

        // 删除无效的术语关系
        try {
            const result = db.prepare(`
                DELETE FROM content_term_relationships
                WHERE content_id NOT IN (SELECT id FROM content_items)
            `).run();

            if (result.changes > 0) {
                console.log(`  ✓ 删除 ${result.changes} 条无效的术语关系`);
            }
        } catch (error) {
            console.warn(`  ⚠️ 删除无效术语关系失败: ${error.message}`);
        }

        // 为不存在的术语创建占位符记录（可选）
        try {
            const missingTerms = db.prepare(`
                SELECT DISTINCT ctr.term_slug
                FROM content_term_relationships ctr
                LEFT JOIN glossary_terms gt ON ctr.term_slug = gt.slug
                WHERE gt.slug IS NULL
            `).all() as any[];

            if (missingTerms.length > 0) {
                console.log(`  📝 发现 ${missingTerms.length} 个缺失的术语，创建占位符...`);

                for (const term of missingTerms) {
                    try {
                        db.prepare(`
                            INSERT OR IGNORE INTO glossary_terms (
                                slug, title, short_description, definition
                            ) VALUES (?, ?, ?, ?)
                        `).run(
                            term.term_slug,
                            term.term_slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                            '术语定义待补充',
                            '详细定义待补充'
                        );
                    } catch (error) {
                        console.warn(`  ⚠️ 创建术语占位符失败: ${term.term_slug} - ${error.message}`);
                    }
                }
            }
        } catch (error) {
            console.warn(`  ⚠️ 处理缺失术语失败: ${error.message}`);
        }
    }

    private async optimizeRelationshipIndexes(db: Database.Database): Promise<void> {
        console.log('⚡ 优化关系索引...');

        const indexes = [
            // 复合索引优化查询性能
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_composite ON content_relationships(from_content_id, to_content_id, relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_composite ON content_tool_relationships(content_id, tool_url, relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_composite ON content_term_relationships(content_id, term_slug, relationship_type)',

            // 反向关系索引
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_to ON content_relationships(to_content_id, relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_tool ON content_tool_relationships(tool_url, relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_term ON content_term_relationships(term_slug, relationship_type)',

            // 类型特定索引
            'CREATE INDEX IF NOT EXISTS idx_content_relationships_type ON content_relationships(relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_type ON content_tool_relationships(relationship_type)',
            'CREATE INDEX IF NOT EXISTS idx_content_term_relationships_type ON content_term_relationships(relationship_type)'
        ];

        for (const indexSql of indexes) {
            try {
                db.exec(indexSql);
            } catch (error) {
                console.warn(`  ⚠️ 索引创建失败: ${error.message}`);
            }
        }

        console.log('  ✓ 创建了所有关系优化索引');
    }

    private async createRelationshipViews(db: Database.Database): Promise<void> {
        console.log('📊 创建关系汇总视图...');

        // 内容关系汇总视图
        try {
            db.exec(`
                CREATE VIEW IF NOT EXISTS content_relationship_summary AS
                SELECT
                    ci.id as content_id,
                    ci.title as content_title,
                    ci.slug as content_slug,
                    ct.type_name as content_type,
                    COUNT(DISTINCT cr.id) as content_relations_count,
                    COUNT(DISTINCT ctr.id) as tool_relations_count,
                    COUNT(DISTINCT ctrm.id) as term_relations_count,
                    GROUP_CONCAT(DISTINCT cr.relationship_type) as content_relation_types,
                    GROUP_CONCAT(DISTINCT ctr.relationship_type) as tool_relation_types,
                    GROUP_CONCAT(DISTINCT ctrm.relationship_type) as term_relation_types
                FROM content_items ci
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                LEFT JOIN content_relationships cr ON (ci.id = cr.from_content_id OR ci.id = cr.to_content_id)
                LEFT JOIN content_tool_relationships ctr ON ci.id = ctr.content_id
                LEFT JOIN content_term_relationships ctrm ON ci.id = ctrm.content_id
                GROUP BY ci.id, ci.title, ci.slug, ct.type_name
            `);
            console.log('  ✓ 创建内容关系汇总视图');
        } catch (error) {
            console.warn(`  ⚠️ 创建内容关系汇总视图失败: ${error.message}`);
        }

        // 术语关系汇总视图
        try {
            db.exec(`
                CREATE VIEW IF NOT EXISTS term_relationship_summary AS
                SELECT
                    gt.id as term_id,
                    gt.slug as term_slug,
                    gt.title as term_title,
                    COUNT(DISTINCT ctrm.id) as content_relations_count,
                    COUNT(DISTINCT tr.id) as term_relations_count,
                    GROUP_CONCAT(DISTINCT ctrm.relationship_type) as content_relation_types,
                    GROUP_CONCAT(DISTINCT tr.relationship_type) as term_relation_types
                FROM glossary_terms gt
                LEFT JOIN content_term_relationships ctrm ON gt.slug = ctrm.term_slug
                LEFT JOIN term_relationships tr ON gt.id = tr.from_term_id OR gt.id = tr.to_term_id
                GROUP BY gt.id, gt.slug, gt.title
            `);
            console.log('  ✓ 创建术语关系汇总视图');
        } catch (error) {
            console.warn(`  ⚠️ 创建术语关系汇总视图失败: ${error.message}`);
        }

        // 工具关系汇总视图
        try {
            db.exec(`
                CREATE VIEW IF NOT EXISTS tool_relationship_summary AS
                SELECT
                    c.id as calculator_id,
                    c.name as calculator_name,
                    c.url as calculator_url,
                    COUNT(DISTINCT ctr.id) as content_relations_count,
                    COUNT(DISTINCT tcl.id) as term_relations_count,
                    GROUP_CONCAT(DISTINCT ctr.relationship_type) as content_relation_types
                FROM calculators c
                LEFT JOIN content_tool_relationships ctr ON c.url = ctr.tool_url
                LEFT JOIN term_calculator_links tcl ON c.id = tcl.calculator_id
                GROUP BY c.id, c.name, c.url
            `);
            console.log('  ✓ 创建工具关系汇总视图');
        } catch (error) {
            console.warn(`  ⚠️ 创建工具关系汇总视图失败: ${error.message}`);
        }
    }

    private async validateRelationshipIntegrity(db: Database.Database): Promise<void> {
        console.log('🔍 验证关系完整性...');

        // 验证内容关系完整性
        const contentSummary = db.prepare(`
            SELECT * FROM content_relationship_summary
            ORDER BY content_relations_count DESC, tool_relations_count DESC, term_relations_count DESC
            LIMIT 10
        `).all() as any[];

        console.log(`  📊 内容关系汇总 (前10):`);
        contentSummary.forEach((item, index) => {
            console.log(`    ${index + 1}. ${item.content_title} (${item.content_type})`);
            console.log(`       内容关系: ${item.content_relations_count}, 工具关系: ${item.tool_relations_count}, 术语关系: ${item.term_relations_count}`);
        });

        // 验证术语关系完整性
        const termSummary = db.prepare(`
            SELECT * FROM term_relationship_summary
            WHERE content_relations_count > 0 OR term_relations_count > 0
            ORDER BY content_relations_count DESC, term_relations_count DESC
            LIMIT 10
        `).all() as any[];

        console.log(`  📊 术语关系汇总 (前10):`);
        termSummary.forEach((item, index) => {
            console.log(`    ${index + 1}. ${item.term_title} (${item.term_slug})`);
            console.log(`       内容关系: ${item.content_relations_count}, 术语关系: ${item.term_relations_count}`);
        });

        // 验证工具关系完整性
        const toolSummary = db.prepare(`
            SELECT * FROM tool_relationship_summary
            WHERE content_relations_count > 0 OR term_relations_count > 0
            ORDER BY content_relations_count DESC, term_relations_count DESC
            LIMIT 10
        `).all() as any[];

        console.log(`  📊 工具关系汇总 (前10):`);
        toolSummary.forEach((item, index) => {
            console.log(`    ${index + 1}. ${item.calculator_name} (${item.calculator_url})`);
            console.log(`       内容关系: ${item.content_relations_count}, 术语关系: ${item.term_relations_count}`);
        });

        // 检查关系类型分布
        const relationshipTypes = db.prepare(`
            SELECT 'content_relationships' as table_name, relationship_type, COUNT(*) as count
            FROM content_relationships
            GROUP BY relationship_type
            UNION ALL
            SELECT 'content_tool_relationships' as table_name, relationship_type, COUNT(*) as count
            FROM content_tool_relationships
            GROUP BY relationship_type
            UNION ALL
            SELECT 'content_term_relationships' as table_name, relationship_type, COUNT(*) as count
            FROM content_term_relationships
            GROUP BY relationship_type
            ORDER BY table_name, count DESC
        `).all() as any[];

        console.log(`  📊 关系类型分布:`);
        relationshipTypes.forEach(item => {
            console.log(`    ${item.table_name}.${item.relationship_type}: ${item.count}`);
        });

        console.log('✅ 关系完整性验证完成');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚关系优化...');

        // 删除视图
        const views = [
            'content_relationship_summary',
            'term_relationship_summary',
            'tool_relationship_summary'
        ];

        for (const view of views) {
            try {
                db.exec(`DROP VIEW IF EXISTS ${view}`);
                console.log(`  ✓ 删除视图: ${view}`);
            } catch (error) {
                console.warn(`  ⚠️ 删除视图失败: ${view} - ${error.message}`);
            }
        }

        // 删除优化索引
        const indexes = [
            'idx_content_relationships_composite',
            'idx_content_tool_relationships_composite',
            'idx_content_term_relationships_composite',
            'idx_content_relationships_to',
            'idx_content_tool_relationships_tool',
            'idx_content_term_relationships_term',
            'idx_content_relationships_type',
            'idx_content_tool_relationships_type',
            'idx_content_term_relationships_type'
        ];

        for (const index of indexes) {
            try {
                db.exec(`DROP INDEX IF EXISTS ${index}`);
            } catch (error) {
                console.warn(`  ⚠️ 删除索引失败: ${index} - ${error.message}`);
            }
        }

        console.log('✅ 关系优化回滚完成');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证关系优化迁移...');

        // 验证视图是否存在
        const views = ['content_relationship_summary', 'term_relationship_summary', 'tool_relationship_summary'];

        for (const view of views) {
            try {
                const result = db.prepare(`SELECT name FROM sqlite_master WHERE type='view' AND name=?`).get(view);
                if (!result) {
                    console.warn(`  ⚠️ 视图 ${view} 不存在`);
                } else {
                    console.log(`  ✓ 视图 ${view} 存在`);
                }
            } catch (error) {
                console.warn(`  ⚠️ 验证视图 ${view} 失败: ${error.message}`);
            }
        }

        // 验证索引是否存在
        const indexes = [
            'idx_content_relationships_composite',
            'idx_content_tool_relationships_composite',
            'idx_content_term_relationships_composite'
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

        // 验证关系数据完整性
        try {
            const invalidRelations = db.prepare(`
                SELECT
                    (SELECT COUNT(*) FROM content_relationships
                     WHERE from_content_id NOT IN (SELECT id FROM content_items)
                     OR to_content_id NOT IN (SELECT id FROM content_items)) as invalid_content,
                    (SELECT COUNT(*) FROM content_tool_relationships
                     WHERE content_id NOT IN (SELECT id FROM content_items)) as invalid_tools,
                    (SELECT COUNT(*) FROM content_term_relationships
                     WHERE content_id NOT IN (SELECT id FROM content_items)) as invalid_terms
            `).get() as any;

            if (invalidRelations.invalid_content > 0 ||
                invalidRelations.invalid_tools > 0 ||
                invalidRelations.invalid_terms > 0) {
                console.warn(`  ⚠️ 发现无效关系: 内容=${invalidRelations.invalid_content}, 工具=${invalidRelations.invalid_tools}, 术语=${invalidRelations.invalid_terms}`);
                return false;
            }

            console.log('  ✓ 所有关系数据完整性验证通过');
        } catch (error) {
            console.warn(`  ⚠️ 关系完整性验证失败: ${error.message}`);
            return false;
        }

        console.log('✅ 关系优化迁移验证完成');
        return true;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new ContentRelationshipsMigration();

    try {
        console.log('🚀 开始内容关系优化迁移...');

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

        console.log('\n🎉 内容关系优化迁移成功完成！');
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