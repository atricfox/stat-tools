#!/usr/bin/env tsx

/**
 * 术语表数据迁移脚本
 * 迁移术语表数据从 JSON 到 SQLite 数据库，包括分类和关系数据
 */

import { BaseMigration, MigrationResult } from '../../src/lib/migration/base';
import Database from 'better-sqlite3';
import { getDatabase } from '../../src/lib/db/client';
import fs from 'fs';
import path from 'path';

interface GlossaryTerm {
    slug: string;
    title: string;
    shortDescription: string;
    definition: string;
    misconceptions: string[];
    relatedTools: string[];
    relatedHubs: string[];
    seeAlso: string[];
    updated: string;
    categories: string[];
    firstLetter: string;
}

interface Category {
    id: number;
    name: string;
    display_name: string;
    description?: string;
}

export class GlossaryMigration extends BaseMigration {
    private glossaryData: any;

    constructor() {
        super();
        this.glossaryData = this.loadGlossaryData();
    }

    protected getDatabaseConnection(): Database.Database {
        return getDatabase();
    }

    getName(): string {
        return 'GlossaryMigration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return '迁移术语表数据从 JSON 到 SQLite 数据库，包括分类和关系数据';
    }

    /**
     * 加载术语表数据
     */
    private loadGlossaryData(): any {
        const filePath = path.join(process.cwd(), 'data', 'glossary.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * 验证数据格式
     */
    private validateData(): void {
        if (!this.glossaryData || !Array.isArray(this.glossaryData.terms)) {
            throw new Error('无效的术语表数据格式：缺少 terms 数组');
        }

        this.glossaryData.terms.forEach((term: any, index: number) => {
            const requiredFields = ['slug', 'title', 'definition'];
            for (const field of requiredFields) {
                if (!term[field]) {
                    throw new Error(`术语 ${index} 缺少必需字段: ${field}`);
                }
            }

            if (!term.slug.match(/^[a-z0-9-]+$/)) {
                this.logger.logWarning(`术语 slug 格式不规范: ${term.slug}`);
            }
        });

        this.logger.log('✅ 术语表数据验证通过');
    }

    /**
     * 迁移分类数据
     */
    private async migrateCategories(): Promise<Map<string, number>> {
        return this.safeExecute('迁移术语分类', async () => {
            const categoryMap = new Map<string, number>();
            const uniqueCategories = new Set<string>();

            // 收集所有唯一的分类
            this.glossaryData.terms.forEach((term: GlossaryTerm) => {
                term.categories.forEach(category => {
                    uniqueCategories.add(category);
                });
            });

            // 为每个分类创建显示名称
            const categoryDisplayNames: Record<string, string> = {
                'central-tendency': 'Central Tendency',
                'descriptive-statistics': 'Descriptive Statistics',
                'dispersion': 'Dispersion',
                'academic': 'Academic',
                'grading': 'Grading',
                'inferential-statistics': 'Inferential Statistics',
                'estimation': 'Estimation',
                'position-measures': 'Position Measures',
                'error-analysis': 'Error Analysis',
                'measurement': 'Measurement'
            };

            // 插入分类
            for (const categoryName of uniqueCategories) {
                const result = this.db.prepare(`
                    INSERT OR IGNORE INTO categories (name, display_name, description)
                    VALUES (?, ?, ?)
                `).run(
                    categoryName,
                    categoryDisplayNames[categoryName] || categoryName,
                    `Category for ${categoryName} related terms`
                );

                // 获取分类 ID
                const category = this.db.prepare(`
                    SELECT id FROM categories WHERE name = ?
                `).get(categoryName);

                if (category) {
                    categoryMap.set(categoryName, category.id);
                    this.logger.log(`迁移分类: ${categoryName} (ID: ${category.id})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${categoryMap.size} 个术语分类`);
            return categoryMap;
        });
    }

    /**
     * 迁移术语数据
     */
    private async migrateTerms(categoryMap: Map<string, number>): Promise<Map<string, number>> {
        return this.safeExecute('迁移术语数据', async () => {
            const termMap = new Map<string, number>();
            const terms = this.glossaryData.terms;

            for (const term of terms) {
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO glossary_terms
                    (slug, title, short_description, definition, first_letter, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?)
                `).run(
                    term.slug,
                    term.title,
                    term.shortDescription,
                    term.definition,
                    term.firstLetter,
                    term.updated || new Date().toISOString()
                );

                // 获取术语 ID
                const dbTerm = this.db.prepare(`
                    SELECT id FROM glossary_terms WHERE slug = ?
                `).get(term.slug);

                if (dbTerm) {
                    termMap.set(term.slug, dbTerm.id);
                    this.logger.log(`迁移术语: ${term.title} (ID: ${dbTerm.id})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${termMap.size} 个术语`);
            return termMap;
        });
    }

    /**
     * 迁移术语分类关系
     */
    private async migrateTermCategories(termMap: Map<string, number>, categoryMap: Map<string, number>): Promise<void> {
        return this.safeExecute('迁移术语分类关系', async () => {
            let relationshipCount = 0;

            for (const term of this.glossaryData.terms) {
                const termId = termMap.get(term.slug);
                if (!termId) continue;

                for (const categoryName of term.categories) {
                    const categoryId = categoryMap.get(categoryName);
                    if (!categoryId) continue;

                    const result = this.db.prepare(`
                        INSERT OR IGNORE INTO term_categories (term_id, category_id)
                        VALUES (?, ?)
                    `).run(termId, categoryId);

                    if (result.changes > 0) {
                        relationshipCount++;
                    }
                }
            }

            this.logger.log(`✅ 已迁移 ${relationshipCount} 个术语分类关系`);
        });
    }

    /**
     * 迁移术语关系 (seeAlso)
     */
    private async migrateTermRelationships(termMap: Map<string, number>): Promise<void> {
        return this.safeExecute('迁移术语关系', async () => {
            let relationshipCount = 0;

            for (const term of this.glossaryData.terms) {
                const fromTermId = termMap.get(term.slug);
                if (!fromTermId) continue;

                for (const relatedSlug of term.seeAlso) {
                    const toTermId = termMap.get(relatedSlug);
                    if (!toTermId) {
                        this.logger.logWarning(`找不到相关术语: ${relatedSlug}`);
                        continue;
                    }

                    const result = this.db.prepare(`
                        INSERT OR IGNORE INTO term_relationships (from_term_id, to_term_id, relationship_type)
                        VALUES (?, ?, 'see_also')
                    `).run(fromTermId, toTermId);

                    if (result.changes > 0) {
                        relationshipCount++;
                    }
                }
            }

            this.logger.log(`✅ 已迁移 ${relationshipCount} 个术语关系`);
        });
    }

    /**
     * 创建或更新 FTS5 虚拟表用于全文搜索
     */
    private async setupFTS5(): Promise<void> {
        return this.safeExecute('设置 FTS5 全文搜索', async () => {
            // 删除现有的 FTS5 表（如果存在）
            this.db.exec('DROP TABLE IF EXISTS glossary_fts');

            // 创建 FTS5 虚拟表
            this.db.exec(`
                CREATE VIRTUAL TABLE glossary_fts USING fts5(
                    title,
                    short_description,
                    definition,
                    content='glossary_terms',
                    content_rowid='id'
                )
            `);

            // 插入数据到 FTS5 表
            this.db.exec(`
                INSERT INTO glossary_fts(rowid, title, short_description, definition)
                SELECT id, title, short_description, definition FROM glossary_terms
            `);

            // 创建触发器以保持 FTS5 表同步
            this.db.exec(`
                CREATE TRIGGER glossary_fts_insert AFTER INSERT ON glossary_terms BEGIN
                    INSERT INTO glossary_fts(rowid, title, short_description, definition)
                    VALUES (new.id, new.title, new.short_description, new.definition);
                END;
            `);

            this.db.exec(`
                CREATE TRIGGER glossary_fts_delete AFTER DELETE ON glossary_terms BEGIN
                    DELETE FROM glossary_fts WHERE rowid = old.id;
                END;
            `);

            this.db.exec(`
                CREATE TRIGGER glossary_fts_update AFTER UPDATE ON glossary_terms BEGIN
                    DELETE FROM glossary_fts WHERE rowid = old.id;
                    INSERT INTO glossary_fts(rowid, title, short_description, definition)
                    VALUES (new.id, new.title, new.short_description, new.definition);
                END;
            `);

            this.logger.log('✅ FTS5 全文搜索设置完成');
        });
    }

    /**
     * 执行迁移
     */
    async migrate(): Promise<MigrationResult> {
        this.logger.log(`🚀 开始 ${this.getName()} 迁移...`);

        try {
            // 验证数据
            await this.validateData();

            // 执行迁移步骤
            const categoryMap = await this.migrateCategories();
            const termMap = await this.migrateTerms(categoryMap);
            await this.migrateTermCategories(termMap, categoryMap);
            await this.migrateTermRelationships(termMap);
            await this.setupFTS5();

            // 验证迁移结果
            const isValid = await this.validate();

            if (!isValid) {
                throw new Error('迁移验证失败');
            }

            this.logger.logComplete(this.stats);
            return {
                success: true,
                message: '术语表数据迁移成功完成',
                stats: this.stats
            };
        } catch (error) {
            this.logger.logError('迁移失败', error, 0);
            return {
                success: false,
                message: error.message,
                stats: this.stats,
                error
            };
        }
    }

    /**
     * 验证迁移结果
     */
    async validate(): Promise<boolean> {
        return this.safeExecute('验证术语表迁移', async () => {
            const terms = this.glossaryData.terms;

            // 验证术语数量
            const dbTermCount = this.getRecordCount('glossary_terms');
            if (dbTermCount !== terms.length) {
                throw new Error(`术语数量不匹配: 期望 ${terms.length}, 实际 ${dbTermCount}`);
            }

            // 验证每个术语
            for (const term of terms) {
                const dbTerm = this.db.prepare(`
                    SELECT * FROM glossary_terms WHERE slug = ?
                `).get(term.slug);

                if (!dbTerm) {
                    throw new Error(`找不到术语: ${term.slug}`);
                }

                if (dbTerm.title !== term.title) {
                    throw new Error(`术语标题不匹配: ${term.slug}`);
                }

                // 验证分类关系
                for (const categoryName of term.categories) {
                    const categoryRelation = this.db.prepare(`
                        SELECT COUNT(*) as count FROM term_categories tc
                        JOIN categories c ON tc.category_id = c.id
                        WHERE tc.term_id = ? AND c.name = ?
                    `).get(dbTerm.id, categoryName);

                    if (categoryRelation.count === 0) {
                        throw new Error(`术语 ${term.slug} 缺少分类: ${categoryName}`);
                    }
                }
            }

            // 验证 FTS5 搜索功能
            const testSearch = this.db.prepare(`
                SELECT COUNT(*) as count FROM glossary_fts WHERE glossary_fts MATCH 'mean'
            `).get();

            if (testSearch.count === 0) {
                throw new Error('FTS5 全文搜索功能验证失败');
            }

            this.logger.log(`✅ 验证通过: ${terms.length} 个术语，全文搜索正常`);
            return true;
        });
    }

    /**
     * 回滚迁移
     */
    async rollback(): Promise<boolean> {
        this.logger.log('🔄 开始回滚术语表迁移...');

        try {
            return this.safeExecute('回滚术语表迁移', async () => {
                // 删除 FTS5 表和触发器
                this.db.exec('DROP TRIGGER IF EXISTS glossary_fts_insert');
                this.db.exec('DROP TRIGGER IF EXISTS glossary_fts_delete');
                this.db.exec('DROP TRIGGER IF EXISTS glossary_fts_update');
                this.db.exec('DROP TABLE IF EXISTS glossary_fts');

                // 删除关系数据
                const relationshipCount = this.getRecordCount('term_relationships');
                this.db.exec('DELETE FROM term_relationships');
                this.logger.log(`已删除 ${relationshipCount} 个术语关系`);

                // 删除分类关系
                const categoryRelationCount = this.getRecordCount('term_categories');
                this.db.exec('DELETE FROM term_categories');
                this.logger.log(`已删除 ${categoryRelationCount} 个术语分类关系`);

                // 删除术语数据
                const termCount = this.getRecordCount('glossary_terms');
                this.db.exec('DELETE FROM glossary_terms');
                this.logger.log(`已删除 ${termCount} 个术语`);

                // 删除分类数据
                const categoryCount = this.getRecordCount('categories');
                this.db.exec('DELETE FROM categories');
                this.logger.log(`已删除 ${categoryCount} 个分类`);

                // 验证回滚
                const remainingTerms = this.getRecordCount('glossary_terms');
                const remainingCategories = this.getRecordCount('categories');
                const remainingRelations = this.getRecordCount('term_relationships');

                if (remainingTerms > 0 || remainingCategories > 0 || remainingRelations > 0) {
                    throw new Error('回滚不完整，仍有残留数据');
                }

                this.logger.log('✅ 术语表迁移回滚成功');
                return true;
            });
        } catch (error) {
            this.logger.logError('回滚失败', error, 0);
            return false;
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new GlossaryMigration();

    try {
        const result = await migration.migrate();

        if (result.success) {
            console.log('\n🎉 术语表迁移成功完成！');
            console.log(`📊 迁移统计: ${result.stats.getSuccessCount()} 个操作成功`);
            process.exit(0);
        } else {
            console.log('\n💥 术语表迁移失败:', result.message);
            process.exit(1);
        }
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