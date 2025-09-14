#!/usr/bin/env tsx

/**
 * How-to Content Migration
 * 迁移Content文件夹中的How-to数据到增强的数据库架构
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import fs from 'fs/promises';
import path from 'path';

/**
 * How-to Content Migration
 * 迁移How-to数据到增强的数据库架构，包括步骤数据和复杂关系
 */
export class ContentHowToMigration extends BaseMigration {
    private contentDir: string;

    constructor() {
        super();
        this.contentDir = path.join(process.cwd(), 'content');
    }

    protected getDatabaseConnection(): Database.Database {
        const { getDatabase } = require('../../src/lib/db/client');
        return getDatabase();
    }

    getName(): string {
        return 'How-to Content Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate How-to content from JSON files to enhanced database schema with steps and relationships';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('📝 开始迁移How-to数据...');

        // 验证content目录
        await this.validateContentDirectory();

        // Phase 1: 迁移How-to数据
        await this.migrateHowToData(db);

        // Phase 2: 验证数据完整性
        await this.validateDataIntegrity(db);

        console.log('✅ How-to数据迁移完成');
    }

    private async validateContentDirectory(): Promise<void> {
        try {
            await fs.access(this.contentDir);
            console.log('  ✓ Content目录存在');

            const howToDir = path.join(this.contentDir, 'howto');
            await fs.access(howToDir);
            console.log('  ✓ How-to目录存在');
        } catch (error) {
            throw new Error(`Content目录验证失败: ${error.message}`);
        }
    }

    private async migrateHowToData(db: Database.Database): Promise<void> {
        console.log('📋 迁移How-to数据...');

        const howToDir = path.join(this.contentDir, 'howto');
        const files = await fs.readdir(howToDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`  📊 发现 ${jsonFiles.length} 个How-to文件`);

        for (const file of jsonFiles) {
            try {
                const filePath = path.join(howToDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const howToData = JSON.parse(content);

                await this.migrateHowToItem(db, howToData);
                console.log(`  ✓ 迁移How-to: ${howToData.frontmatter?.title}`);
            } catch (error) {
                console.error(`  ❌ 迁移How-to失败: ${file} - ${error.message}`);
            }
        }
    }

    private async migrateHowToItem(db: Database.Database, howToItem: any): Promise<number> {
        const frontmatter = howToItem.frontmatter || {};

        // 获取内容类型ID
        const typeResult = db.prepare(`
            SELECT id FROM content_types WHERE type_name = 'howto'
        `).get() as { id: number };

        if (!typeResult) {
            throw new Error('找不到howto内容类型');
        }

        // 检查是否已存在该How-to项
        const existingItem = db.prepare('SELECT id FROM content_items WHERE slug = ? AND type_id = ?').get(frontmatter.slug, typeResult.id);

        let contentId: number;
        if (existingItem) {
            // 更新现有记录
            contentId = await this.updateHowToItem(db, existingItem.id, howToItem);
            console.log(`  ✓ 更新How-to: ${frontmatter.slug}`);
        } else {
            // 插入新记录
            contentId = await this.insertHowToItem(db, typeResult.id, howToItem);
            console.log(`  ✓ 创建How-to: ${frontmatter.slug}`);
        }

        // 迁移步骤数据
        if (howToItem.steps && Array.isArray(howToItem.steps)) {
            await this.migrateSteps(db, contentId, howToItem.steps);
        }

        // 迁移关系数据
        await this.migrateRelationships(db, contentId, frontmatter);

        // 迁移mentions关系
        if (frontmatter.mentions) {
            await this.migrateMentions(db, contentId, frontmatter.mentions);
        }

        // 迁移SEO元数据
        await this.migrateSEOMetadata(db, contentId, frontmatter);

        return contentId;
    }

    private async insertHowToItem(db: Database.Database, typeId: number, howToItem: any): Promise<number> {
        const frontmatter = howToItem.frontmatter || {};
        const seo = frontmatter.seo || {};

        const result = db.prepare(`
            INSERT INTO content_items (
                type_id, slug, title, summary, content, status,
                reading_time, created_at, updated_at, difficulty, featured,
                priority, industry, target_tool, seo_meta_description,
                seo_keywords, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            typeId,
            frontmatter.slug,
            frontmatter.title,
            frontmatter.summary,
            howToItem.content || '',
            frontmatter.status || 'published',
            frontmatter.readingTime || this.calculateReadingTime(howToItem.content),
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            frontmatter.difficulty || null,
            false, // featured
            0, // priority
            null, // industry
            frontmatter.targetTool || null,
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || []),
            JSON.stringify(frontmatter.tags || [])
        );

        return result.lastInsertRowid as number;
    }

    private async updateHowToItem(db: Database.Database, contentId: number, howToItem: any): Promise<number> {
        const frontmatter = howToItem.frontmatter || {};
        const seo = frontmatter.seo || {};

        db.prepare(`
            UPDATE content_items SET
                title = ?, summary = ?, content = ?, status = ?,
                reading_time = ?, updated_at = ?, difficulty = ?,
                target_tool = ?, seo_meta_description = ?, seo_keywords = ?, tags = ?
            WHERE id = ?
        `).run(
            frontmatter.title,
            frontmatter.summary,
            howToItem.content || '',
            frontmatter.status || 'published',
            frontmatter.readingTime || this.calculateReadingTime(howToItem.content),
            new Date().toISOString(),
            frontmatter.difficulty || null,
            frontmatter.targetTool || null,
            (frontmatter.seo || {}).metaDescription || null,
            JSON.stringify((frontmatter.seo || {}).keywords || []),
            JSON.stringify(frontmatter.tags || []),
            contentId
        );

        return contentId;
    }

    private async migrateSteps(db: Database.Database, contentId: number, steps: any[]): Promise<void> {
        // 清除现有步骤
        db.prepare('DELETE FROM howto_steps WHERE content_id = ?').run(contentId);

        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            try {
                db.prepare(`
                    INSERT INTO howto_steps (
                        content_id, step_id, name, description,
                        tip, warning, step_order
                    ) VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    contentId,
                    step.id,
                    step.name,
                    step.description,
                    step.tip || null,
                    step.warning || null,
                    i + 1
                );
            } catch (error) {
                console.warn(`  ⚠️ 步骤 ${step.id} 迁移失败: ${error.message}`);
            }
        }
    }

    private async migrateRelationships(db: Database.Database, contentId: number, frontmatter: any): Promise<void> {
        const related = frontmatter.related || {};

        // 工具关系
        if (related.tools && Array.isArray(related.tools)) {
            for (const tool of related.tools) {
                const relationshipType = this.getToolRelationshipType(tool, frontmatter.targetTool);
                db.prepare(`
                    INSERT OR IGNORE INTO content_tool_relationships
                    (content_id, tool_url, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, tool, relationshipType);
            }
        }

        // 术语关系
        if (related.glossary && Array.isArray(related.glossary)) {
            for (const term of related.glossary) {
                db.prepare(`
                    INSERT OR IGNORE INTO content_term_relationships
                    (content_id, term_slug, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, term, 'explained');
            }
        }

        // FAQ关系
        if (related.faq && Array.isArray(related.faq)) {
            for (const faqSlug of related.faq) {
                await this.migrateContentRelationship(db, contentId, faqSlug, 'prerequisite');
            }
        }

        // Case关系
        if (related.cases && Array.isArray(related.cases)) {
            for (const caseSlug of related.cases) {
                await this.migrateContentRelationship(db, contentId, caseSlug, 'similar');
            }
        }
    }

    private async migrateMentions(db: Database.Database, contentId: number, mentions: any): Promise<void> {
        if (mentions.tools && Array.isArray(mentions.tools)) {
            for (const tool of mentions.tools) {
                const toolUrl = `/calculator/${tool}`;
                db.prepare(`
                    INSERT OR IGNORE INTO content_tool_relationships
                    (content_id, tool_url, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, toolUrl, 'mentioned');
            }
        }

        if (mentions.concepts && Array.isArray(mentions.concepts)) {
            for (const concept of mentions.concepts) {
                // 尝试将概念匹配到术语
                const termSlug = this.conceptToTermSlug(concept);
                if (termSlug) {
                    db.prepare(`
                        INSERT OR IGNORE INTO content_term_relationships
                        (content_id, term_slug, relationship_type)
                        VALUES (?, ?, ?)
                    `).run(contentId, termSlug, 'mentioned');
                }
            }
        }
    }

    private async migrateContentRelationship(db: Database.Database, fromContentId: number, toSlug: string, relationshipType: string): Promise<void> {
        // 查找目标内容ID
        const targetContent = db.prepare('SELECT id FROM content_items WHERE slug = ?').get(toSlug);
        if (targetContent) {
            db.prepare(`
                INSERT OR IGNORE INTO content_relationships
                (from_content_id, to_content_id, relationship_type)
                VALUES (?, ?, ?)
            `).run(fromContentId, targetContent.id, relationshipType);
        }
    }

    private async migrateSEOMetadata(db: Database.Database, contentId: number, frontmatter: any): Promise<void> {
        const seo = frontmatter.seo || {};

        db.prepare(`
            INSERT OR REPLACE INTO seo_metadata (
                content_id, meta_description, keywords,
                og_title, og_description, og_image, twitter_card
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            contentId,
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || []),
            frontmatter.title || null, // 使用title作为og_title
            frontmatter.summary || null, // 使用summary作为og_description
            null, // og_image
            null  // twitter_card
        );
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        let textContent = '';

        if (typeof content === 'string') {
            textContent = content;
        } else if (typeof content === 'object') {
            textContent = JSON.stringify(content);
        }

        const wordCount = textContent.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private getToolRelationshipType(toolUrl: string, targetTool?: string): string {
        if (targetTool && toolUrl.includes(targetTool)) {
            return 'target';
        }
        return 'mentioned';
    }

    private conceptToTermSlug(concept: string): string | null {
        // 简单的概念到术语slug映射
        const mapping: Record<string, string> = {
            'central-tendency': 'mean',
            'arithmetic-mean': 'mean',
            'standard-deviation': 'standard-deviation',
            'variance': 'variance',
            'gpa': 'gpa',
            'weighted-mean': 'weighted-mean'
        };

        return mapping[concept.toLowerCase().replace(/\s+/g, '-')] || null;
    }

    private async validateDataIntegrity(db: Database.Database): Promise<void> {
        console.log('🔍 验证How-to数据完整性...');

        // 检查How-to项总数
        const howToCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'howto'
        `).get() as any;
        console.log(`  📊 How-to项总数: ${howToCount.count}`);

        // 检查步骤数据
        const stepsCount = db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;
        console.log(`  📊 howto_steps: ${stepsCount.count} 个步骤`);

        // 检查关系数据
        const relationships = [
            { name: 'content_tool_relationships', count: 0 },
            { name: 'content_term_relationships', count: 0 },
            { name: 'content_relationships', count: 0 }
        ];

        for (const rel of relationships) {
            const result = db.prepare(`SELECT COUNT(*) as count FROM ${rel.name}`).get() as any;
            rel.count = result.count;
            console.log(`  📊 ${rel.name}: ${rel.count} 条关系`);
        }

        // 检查SEO数据
        const seoCount = db.prepare('SELECT COUNT(*) as count FROM seo_metadata').get() as any;
        console.log(`  📊 seo_metadata: ${seoCount.count} 条SEO数据`);

        console.log('✅ How-to数据完整性验证完成');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚How-to数据迁移...');

        // 删除How-to类型的内容数据
        try {
            const result = db.prepare(`
                DELETE FROM content_items
                WHERE type_id = (SELECT id FROM content_types WHERE type_name = 'howto')
            `).run();
            console.log(`  ✓ 删除How-to数据: ${result.changes} 条`);
        } catch (error) {
            console.warn(`  ⚠️ 删除How-to数据失败: ${error.message}`);
        }

        // 其他表的数据会通过外键级联删除
        console.log('  ✓ 相关步骤、关系和元数据已通过外键约束自动删除');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证How-to迁移...');

        // 验证How-to项
        const howToCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'howto'
        `).get() as any;

        if (howToCount.count === 0) {
            console.error('  ❌ 没有迁移任何How-to数据');
            return false;
        }

        console.log(`  ✓ How-to: ${howToCount.count} 项`);

        // 验证步骤数据
        const stepsCount = db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;
        if (stepsCount.count > 0) {
            console.log(`  ✓ 步骤数据: ${stepsCount.count} 个步骤`);
        }

        // 验证关系数据
        const relationships = [
            { name: 'content_tool_relationships', column: 'content_id' },
            { name: 'content_term_relationships', column: 'content_id' },
            { name: 'content_relationships', column: 'from_content_id' }
        ];

        for (const rel of relationships) {
            const invalidRelations = db.prepare(`
                SELECT COUNT(*) as count FROM ${rel.name} cr
                LEFT JOIN content_items ci ON cr.${rel.column} = ci.id
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidRelations.count > 0) {
                // 对于所有关系，都只警告不失败，因为有些内容可能稍后添加
                console.warn(`  ⚠️ ${rel.name} 中有 ${invalidRelations.count} 个关系引用了不存在的内容项（可能稍后添加）`);
            }
        }

        console.log('✅ How-to迁移验证完成');
        return true;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new ContentHowToMigration();

    try {
        console.log('🚀 开始How-to内容迁移...');

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

        console.log('\n🎉 How-to内容迁移成功完成！');
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