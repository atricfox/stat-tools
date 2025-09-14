#!/usr/bin/env tsx

/**
 * Case Content Migration
 * 迁移Content文件夹中的Case数据到增强的数据库架构
 */

import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import fs from 'fs/promises';
import path from 'path';

/**
 * Case Content Migration
 * 迁移Case数据到增强的数据库架构，包括案例详细信息
 */
export class ContentCaseMigration extends BaseMigration {
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
        return 'Case Content Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate Case content from JSON files to enhanced database schema with case details';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('📝 开始迁移Case数据...');

        // 验证content目录
        await this.validateContentDirectory();

        // Phase 1: 迁移Case数据
        await this.migrateCaseData(db);

        // Phase 2: 验证数据完整性
        await this.validateDataIntegrity(db);

        console.log('✅ Case数据迁移完成');
    }

    private async validateContentDirectory(): Promise<void> {
        try {
            await fs.access(this.contentDir);
            console.log('  ✓ Content目录存在');

            const casesDir = path.join(this.contentDir, 'cases');
            await fs.access(casesDir);
            console.log('  ✓ Cases目录存在');
        } catch (error) {
            throw new Error(`Content目录验证失败: ${error.message}`);
        }
    }

    private async migrateCaseData(db: Database.Database): Promise<void> {
        console.log('📋 迁移Case数据...');

        const casesDir = path.join(this.contentDir, 'cases');
        const files = await fs.readdir(casesDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        console.log(`  📊 发现 ${jsonFiles.length} 个Case文件`);

        for (const file of jsonFiles) {
            try {
                const filePath = path.join(casesDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const caseData = JSON.parse(content);

                await this.migrateCaseItem(db, caseData);
                console.log(`  ✓ 迁移Case: ${caseData.frontmatter?.title}`);
            } catch (error) {
                console.error(`  ❌ 迁移Case失败: ${file} - ${error.message}`);
                // 继续处理其他文件，不因为一个文件失败而终止整个迁移
            }
        }
    }

    private async migrateCaseItem(db: Database.Database, caseItem: any): Promise<number> {
        const frontmatter = caseItem.frontmatter || {};

        // 获取内容类型ID
        const typeResult = db.prepare(`
            SELECT id FROM content_types WHERE type_name = 'case'
        `).get() as { id: number };

        if (!typeResult) {
            throw new Error('找不到case内容类型');
        }

        // 检查是否已存在该Case项
        const existingItem = db.prepare('SELECT id FROM content_items WHERE slug = ? AND type_id = ?').get(frontmatter.slug, typeResult.id);

        let contentId: number;
        if (existingItem) {
            // 更新现有记录
            contentId = await this.updateCaseItem(db, existingItem.id, caseItem);
            console.log(`  ✓ 更新Case: ${frontmatter.slug}`);
        } else {
            // 插入新记录
            contentId = await this.insertCaseItem(db, typeResult.id, caseItem);
            console.log(`  ✓ 创建Case: ${frontmatter.slug}`);
        }

        try {
            // 迁移Case详细信息
            await this.migrateCaseDetails(db, contentId, caseItem);
        } catch (error) {
            console.warn(`  ⚠️ Case详细信息迁移失败: ${error.message}`);
        }

        try {
            // 迁移关系数据
            await this.migrateRelationships(db, contentId, frontmatter);
        } catch (error) {
            console.warn(`  ⚠️ 关系数据迁移失败: ${error.message}`);
        }

        try {
            // 迁移mentions关系
            if (frontmatter.mentions) {
                await this.migrateMentions(db, contentId, frontmatter.mentions);
            }
        } catch (error) {
            console.warn(`  ⚠️ Mentions数据迁移失败: ${error.message}`);
        }

        try {
            // 迁移SEO元数据
            await this.migrateSEOMetadata(db, contentId, frontmatter);
        } catch (error) {
            console.warn(`  ⚠️ SEO元数据迁移失败: ${error.message}`);
        }

        return contentId;
    }

    private async insertCaseItem(db: Database.Database, typeId: number, caseItem: any): Promise<number> {
        const frontmatter = caseItem.frontmatter || {};
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
            this.generateCaseContent(caseItem),
            frontmatter.status || 'published',
            frontmatter.readingTime || this.calculateReadingTime(caseItem.content),
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            frontmatter.difficulty || 'intermediate',
            frontmatter.featured || false,
            frontmatter.priority || 0,
            frontmatter.industry || null,
            null, // target_tool
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || []),
            JSON.stringify(frontmatter.tags || [])
        );

        return result.lastInsertRowid as number;
    }

    private async updateCaseItem(db: Database.Database, contentId: number, caseItem: any): Promise<number> {
        const frontmatter = caseItem.frontmatter || {};
        const seo = frontmatter.seo || {};

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
            this.generateCaseContent(caseItem),
            frontmatter.status || 'published',
            frontmatter.readingTime || this.calculateReadingTime(caseItem.content),
            new Date().toISOString(),
            frontmatter.difficulty || 'intermediate',
            frontmatter.featured || false,
            frontmatter.priority || 0,
            frontmatter.industry || null,
            null, // target_tool
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || []),
            JSON.stringify(frontmatter.tags || []),
            contentId
        );

        return contentId;
    }

    private generateCaseContent(caseItem: any): string {
        const frontmatter = caseItem.frontmatter || {};
        const content = caseItem.content || {};

        let generatedContent = `
# ${frontmatter.title}

## 问题背景
${frontmatter.problem || ''}

## 解决方案
${frontmatter.solution || ''}

## 实施过程
`;

        // 添加实施步骤
        if (content.approach && typeof content.approach === 'object') {
            Object.keys(content.approach).forEach((stepKey, index) => {
                const step = content.approach[stepKey];
                generatedContent += `\n### ${index + 1}. ${step.title}\n${step.description}\n`;
            });
        }

        // 添加详细结果
        if (content.results_detail && typeof content.results_detail === 'object') {
            generatedContent += '\n## 详细结果\n';
            Object.keys(content.results_detail).forEach(period => {
                const periodData = content.results_detail[period];
                generatedContent += `\n### ${period}\n`;
                generatedContent += `学期GPA: ${periodData.semester_gpa}\n`;
                generatedContent += `累计GPA: ${periodData.cumulative_gpa}\n`;
                generatedContent += '课程成绩: ' + (periodData.courses || []).join(', ') + '\n';
            });
        }

        // 添加关键洞察
        if (content.key_insights && Array.isArray(content.key_insights)) {
            generatedContent += '\n## 关键洞察\n';
            content.key_insights.forEach(insight => {
                generatedContent += `- ${insight}\n`;
            });
        }

        // 添加建议
        if (content.recommendations && Array.isArray(content.recommendations)) {
            generatedContent += '\n## 建议\n';
            content.recommendations.forEach(recommendation => {
                generatedContent += `- ${recommendation}\n`;
            });
        }

        // 添加经验教训
        if (frontmatter.lessons && Array.isArray(frontmatter.lessons)) {
            generatedContent += '\n## 经验教训\n';
            frontmatter.lessons.forEach(lesson => {
                generatedContent += `- ${lesson}\n`;
            });
        }

        return generatedContent.trim();
    }

    private async migrateCaseDetails(db: Database.Database, contentId: number, caseItem: any): Promise<void> {
        const frontmatter = caseItem.frontmatter || {};
        const content = caseItem.content || {};

        // 清除现有详细信息
        db.prepare('DELETE FROM case_details WHERE content_id = ?').run(contentId);

        // 插入或更新案例详细信息
        try {
            db.prepare(`
                INSERT OR REPLACE INTO case_details (
                    content_id, problem, solution, results, lessons,
                    tools_used, background, challenge, approach,
                    results_detail, key_insights, recommendations
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                contentId,
                frontmatter.problem || null,
                frontmatter.solution || null,
                JSON.stringify(frontmatter.results || []),
                JSON.stringify(frontmatter.lessons || []),
                JSON.stringify(frontmatter.toolsUsed || []),
                content.background || null,
                content.challenge || null,
                JSON.stringify(content.approach || {}),
                JSON.stringify(content.results_detail || {}),
                JSON.stringify(content.key_insights || []),
                JSON.stringify(content.recommendations || [])
            );
        } catch (error) {
            console.warn(`  ⚠️ 案例详细信息插入失败: ${error.message}`);
            // 插入基本的案例信息
            db.prepare(`
                INSERT OR REPLACE INTO case_details (
                    content_id, problem, solution, results, lessons,
                    tools_used, background, challenge
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `).run(
                contentId,
                frontmatter.problem || null,
                frontmatter.solution || null,
                JSON.stringify(frontmatter.results || []),
                JSON.stringify(frontmatter.lessons || []),
                JSON.stringify(frontmatter.toolsUsed || []),
                content.background || null,
                content.challenge || null
            );
        }
    }

    private async migrateRelationships(db: Database.Database, contentId: number, frontmatter: any): Promise<void> {
        const related = frontmatter.related || {};

        // 工具关系
        if (related.tools && Array.isArray(related.tools)) {
            for (const tool of related.tools) {
                const relationshipType = this.getToolRelationshipType(tool, frontmatter.industry);
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

        // How-to关系
        if (related.howto && Array.isArray(related.howto)) {
            for (const howToSlug of related.howto) {
                await this.migrateContentRelationship(db, contentId, howToSlug, 'related');
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

    private calculateReadingTime(content: any): number {
        const wordsPerMinute = 200;
        let textContent = '';

        if (typeof content === 'string') {
            textContent = content;
        } else if (typeof content === 'object') {
            // 对于复杂的content对象，计算所有文本字段
            const extractText = (obj: any): string => {
                let result = '';
                for (const [key, value] of Object.entries(obj)) {
                    if (typeof value === 'string') {
                        result += value + ' ';
                    } else if (typeof value === 'object' && value !== null) {
                        result += extractText(value) + ' ';
                    }
                }
                return result;
            };
            textContent = extractText(content);
        }

        const wordCount = textContent.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private getToolRelationshipType(toolUrl: string, industry?: string): string {
        // Case研究中工具通常是'used'关系
        return 'used';
    }

    private conceptToTermSlug(concept: string): string | null {
        // 简单的概念到术语slug映射
        const mapping: Record<string, string> = {
            'grade-point-average': 'gpa',
            'academic-planning': 'gpa',
            'course-selection': 'gpa',
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
        console.log('🔍 验证Case数据完整性...');

        // 检查Case项总数
        const caseCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'case'
        `).get() as any;
        console.log(`  📊 Case项总数: ${caseCount.count}`);

        // 检查详细信息数据
        const detailsCount = db.prepare('SELECT COUNT(*) as count FROM case_details').get() as any;
        console.log(`  📊 case_details: ${detailsCount.count} 个案例详细信息`);

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

        console.log('✅ Case数据完整性验证完成');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚Case数据迁移...');

        // 删除Case类型的内容数据
        try {
            const result = db.prepare(`
                DELETE FROM content_items
                WHERE type_id = (SELECT id FROM content_types WHERE type_name = 'case')
            `).run();
            console.log(`  ✓ 删除Case数据: ${result.changes} 条`);
        } catch (error) {
            console.warn(`  ⚠️ 删除Case数据失败: ${error.message}`);
        }

        // 其他表的数据会通过外键级联删除
        console.log('  ✓ 相关详细信息、关系和元数据已通过外键约束自动删除');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证Case迁移...');

        // 验证Case项
        const caseCount = db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'case'
        `).get() as any;

        if (caseCount.count === 0) {
            console.error('  ❌ 没有迁移任何Case数据');
            return false;
        }

        console.log(`  ✓ Case: ${caseCount.count} 项`);

        // 验证详细信息数据
        const detailsCount = db.prepare('SELECT COUNT(*) as count FROM case_details').get() as any;
        if (detailsCount.count > 0) {
            console.log(`  ✓ 案例详细信息: ${detailsCount.count} 个`);
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
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidRelations.count > 0) {
                console.warn(`  ⚠️ ${rel.name} 中有 ${invalidRelations.count} 个关系引用了不存在的内容项（可能稍后添加）`);
            }
        }

        console.log('✅ Case迁移验证完成');
        return true;
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new ContentCaseMigration();

    try {
        console.log('🚀 开始Case内容迁移...');

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

        console.log('\n🎉 Case内容迁移成功完成！');
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