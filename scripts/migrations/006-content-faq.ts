#!/usr/bin/env tsx

/**
 * FAQ Content Migration
 * 迁移Content文件夹中的FAQ数据到增强的数据库架构
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import fs from 'fs/promises';
import path from 'path';

/**
 * FAQ Content Migration
 * 迁移FAQ数据到增强的数据库架构
 */
export class ContentFAQMigration extends BaseMigration {
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
        return 'FAQ Content Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate FAQ content from JSON files to enhanced database schema';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('📝 开始迁移FAQ数据...');

        // 验证content目录
        await this.validateContentDirectory();

        // Phase 1: 迁移FAQ数据
        await this.migrateFAQData(db);

        // Phase 2: 验证数据完整性
        await this.validateDataIntegrity(db);

        console.log('✅ FAQ数据迁移完成');
    }

    private async validateContentDirectory(): Promise<void> {
        try {
            await fs.access(this.contentDir);
            console.log('  ✓ Content目录存在');

            const faqPath = path.join(this.contentDir, 'faq');
            await fs.access(faqPath);
            console.log('  ✓ FAQ目录存在');
        } catch (error) {
            throw new Error(`Content目录验证失败: ${error.message}`);
        }
    }

    private async migrateFAQData(db: Database.Database): Promise<void> {
        console.log('❓ 迁移FAQ数据...');

        const faqPath = path.join(this.contentDir, 'faq', 'statistics-faq.json');
        const faqContent = await fs.readFile(faqPath, 'utf-8');
        const faqData = JSON.parse(faqContent);

        if (!faqData.items || !Array.isArray(faqData.items)) {
            throw new Error('FAQ数据格式错误: 缺少items数组');
        }

        console.log(`  📊 发现 ${faqData.items.length} 个FAQ项`);

        for (const faqItem of faqData.items) {
            try {
                await this.migrateFAQItem(db, faqItem);
                console.log(`  ✓ 迁移FAQ: ${faqItem.frontmatter?.title || faqItem.slug}`);
            } catch (error) {
                console.error(`  ❌ 迁移FAQ失败: ${faqItem.slug} - ${error.message}`);
            }
        }
    }

    private async migrateFAQItem(db: Database.Database, faqItem: any): Promise<number> {
        const frontmatter = faqItem.frontmatter || {};

        // 获取内容类型ID
        const typeResult = db.prepare(`
            SELECT id FROM content_types WHERE type_name = 'faq'
        `).get() as { id: number };

        if (!typeResult) {
            throw new Error('找不到faq内容类型');
        }

        // 检查是否已存在该FAQ项
        const existingItem = db.prepare('SELECT id FROM content_items WHERE slug = ? AND type_id = ?').get(faqItem.slug, typeResult.id);

        let contentId: number;
        if (existingItem) {
            // 更新现有记录
            db.prepare(`
                UPDATE content_items SET
                    title = ?, summary = ?, content = ?, status = ?,
                    reading_time = ?, updated_at = ?, difficulty = ?,
                    featured = ?, priority = ?, industry = ?, target_tool = ?,
                    seo_meta_description = ?, seo_keywords = ?, tags = ?
                WHERE id = ?
            `).run(
                frontmatter.title,
                frontmatter.summary,
                faqItem.answer,
                frontmatter.status || 'published',
                this.calculateReadingTime(faqItem.answer),
                new Date().toISOString(),
                null, // difficulty
                frontmatter.featured ? 1 : 0,
                frontmatter.priority || 0,
                null, // industry
                null, // target_tool
                null, // seo_meta_description
                null, // seo_keywords
                JSON.stringify(frontmatter.tags || []),
                existingItem.id
            );
            contentId = existingItem.id;
            console.log(`  ✓ 更新FAQ: ${faqItem.slug}`);
        } else {
            // 插入新记录
            const result = db.prepare(`
                INSERT INTO content_items (
                    type_id, slug, title, summary, content, status,
                    reading_time, created_at, updated_at, difficulty, featured,
                    priority, industry, target_tool, seo_meta_description,
                    seo_keywords, tags
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                typeResult.id,
                faqItem.slug,
                frontmatter.title,
                frontmatter.summary,
                faqItem.answer,
                frontmatter.status || 'published',
                this.calculateReadingTime(faqItem.answer),
                frontmatter.created || new Date().toISOString(),
                frontmatter.updated || new Date().toISOString(),
                null, // difficulty
                frontmatter.featured ? 1 : 0,
                frontmatter.priority || 0,
                null, // industry
                null, // target_tool
                null, // seo_meta_description
                null, // seo_keywords
                JSON.stringify(frontmatter.tags || [])
            );
            contentId = result.lastInsertRowid as number;
            console.log(`  ✓ 创建FAQ: ${faqItem.slug}`);
        }

        // 迁移关系数据
        await this.migrateRelationships(db, contentId, frontmatter);

        // 迁移SEO元数据
        await this.migrateSEOMetadata(db, contentId, frontmatter);

        return contentId;
    }

    private async migrateRelationships(db: Database.Database, contentId: number, frontmatter: any): Promise<void> {
        const related = frontmatter.related || {};

        // 工具关系
        if (related.tools && Array.isArray(related.tools)) {
            for (const tool of related.tools) {
                const relationshipType = this.getToolRelationshipType(tool, frontmatter.type);
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

        // How-to关系
        if (related.howto && Array.isArray(related.howto)) {
            for (const howToSlug of related.howto) {
                await this.migrateContentRelationship(db, contentId, howToSlug, 'prerequisite');
            }
        }

        // Case关系
        if (related.cases && Array.isArray(related.cases)) {
            for (const caseSlug of related.cases) {
                await this.migrateContentRelationship(db, contentId, caseSlug, 'similar');
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
        // FAQ可能没有SEO数据，但为了完整性，我们创建基本记录
        db.prepare(`
            INSERT OR REPLACE INTO seo_metadata (
                content_id, meta_description, keywords,
                og_title, og_description, og_image, twitter_card
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        `).run(
            contentId,
            frontmatter.summary || null, // 使用summary作为meta description
            JSON.stringify(frontmatter.tags || []), // 使用tags作为keywords
            frontmatter.title || null, // 使用title作为og_title
            frontmatter.summary || null, // 使用summary作为og_description
            null, // og_image
            null  // twitter_card
        );
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private getToolRelationshipType(toolUrl: string, contentType: string): string {
        // FAQ中提到的工具通常是'explained'关系
        return 'explained';
    }

    private async validateDataIntegrity(db: Database.Database): Promise<void> {
        console.log('🔍 验证FAQ数据完整性...');

        // 检查FAQ项总数
        const faqCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'faq'
        `).get() as any;
        console.log(`  📊 FAQ项总数: ${faqCount.count}`);

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

        console.log('✅ FAQ数据完整性验证完成');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚FAQ数据迁移...');

        // 删除FAQ类型的内容数据
        try {
            const result = db.prepare(`
                DELETE FROM content_items
                WHERE type_id = (SELECT id FROM content_types WHERE type_name = 'faq')
            `).run();
            console.log(`  ✓ 删除FAQ数据: ${result.changes} 条`);
        } catch (error) {
            console.warn(`  ⚠️ 删除FAQ数据失败: ${error.message}`);
        }

        // 其他表的数据会通过外键级联删除
        console.log('  ✓ 相关关系和元数据已通过外键约束自动删除');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证FAQ迁移...');

        // 验证FAQ项
        const faqCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'faq'
        `).get() as any;

        if (faqCount.count === 0) {
            console.error('  ❌ 没有迁移任何FAQ数据');
            return false;
        }

        console.log(`  ✓ FAQ: ${faqCount.count} 项`);

        // 验证数据质量
        const nullSlugs = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'faq' AND ci.slug IS NULL
        `).get() as any;

        if (nullSlugs.count > 0) {
            console.error(`  ❌ 发现 ${nullSlugs.count} 个FAQ项缺少slug`);
            return false;
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
                LEFT JOIN content_types ct ON ci.type_id = ct.id
                WHERE ci.id IS NULL OR ct.type_name != 'faq'
            `).get() as any;

            if (invalidRelations.count > 0) {
                console.error(`  ❌ ${rel.name} 中有 ${invalidRelations.count} 个无效的FAQ关系`);
                return false;
            }
        }

        console.log('✅ FAQ迁移验证完成');
        return true;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new ContentFAQMigration();

    try {
        console.log('🚀 开始FAQ内容迁移...');

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

        console.log('\n🎉 FAQ内容迁移成功完成！');
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