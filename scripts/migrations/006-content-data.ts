import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import fs from 'fs/promises';
import path from 'path';

/**
 * Content Data Migration
 * 迁移Content文件夹中的JSON数据到增强的数据库架构
 */
export class ContentDataMigration extends BaseMigration {
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
        return 'Content Data Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate JSON content data to enhanced database schema';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('📁 开始迁移Content文件夹数据...');

        // 验证content目录
        await this.validateContentDirectory();

        // Phase 1: 迁移FAQ数据
        await this.migrateFAQData(db);

        // Phase 2: 迁移How-to数据
        await this.migrateHowToData(db);

        // Phase 3: 迁移Case数据
        await this.migrateCaseData(db);

        // Phase 4: 验证数据完整性
        await this.validateDataIntegrity(db);

        console.log('✅ Content数据迁移完成');
    }

    private async validateContentDirectory(): Promise<void> {
        try {
            await fs.access(this.contentDir);
            console.log('  ✓ Content目录存在');

            const dirs = ['faq', 'howto', 'cases'];
            for (const dir of dirs) {
                const dirPath = path.join(this.contentDir, dir);
                await fs.access(dirPath);
                console.log(`  ✓ ${dir}目录存在`);
            }
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

        // 插入内容项
        const result = db.prepare(`
            INSERT OR REPLACE INTO content_items (
                slug, title, type, summary, content, status,
                category, priority, featured, created_at, updated_at,
                reading_time, tags, difficulty, industry, target_tool,
                seo_meta_description, seo_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            faqItem.slug,
            frontmatter.title,
            'faq',
            frontmatter.summary,
            faqItem.answer,
            frontmatter.status || 'published',
            frontmatter.category || 'General',
            frontmatter.priority || 0,
            frontmatter.featured || false,
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            this.calculateReadingTime(faqItem.answer),
            JSON.stringify(frontmatter.tags || []),
            null, // FAQ没有难度
            null, // FAQ没有行业
            null, // FAQ没有目标工具
            null, // FAQ没有SEO描述
            null  // FAQ没有SEO关键词
        );

        const contentId = result.lastInsertRowid as number;

        // 迁移关系数据
        await this.migrateRelationships(db, contentId, frontmatter);

        // 迁移SEO元数据
        await this.migrateSEOMetadata(db, contentId, frontmatter);

        return contentId;
    }

    private async migrateHowToData(db: Database.Database): Promise<void> {
        console.log('📝 迁移How-to数据...');

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
        const seo = frontmatter.seo || {};

        // 插入内容项
        const result = db.prepare(`
            INSERT OR REPLACE INTO content_items (
                slug, title, type, summary, content, status,
                created_at, updated_at, reading_time, tags,
                difficulty, target_tool, seo_meta_description, seo_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            frontmatter.slug,
            frontmatter.title,
            'howto',
            frontmatter.summary,
            howToItem.content || '',
            frontmatter.status || 'published',
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            frontmatter.readingTime || this.calculateReadingTime(howToItem.content),
            JSON.stringify(frontmatter.tags || []),
            frontmatter.difficulty || null,
            frontmatter.targetTool || null,
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || [])
        );

        const contentId = result.lastInsertRowid as number;

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

    private async migrateSteps(db: Database.Database, contentId: number, steps: any[]): Promise<void> {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            db.prepare(`
                INSERT OR REPLACE INTO howto_steps (
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
        }
    }

    private async migrateMentions(db: Database.Database, contentId: number, mentions: any): Promise<void> {
        if (mentions.tools && Array.isArray(mentions.tools)) {
            for (const tool of mentions.tools) {
                db.prepare(`
                    INSERT OR IGNORE INTO content_tool_relationships
                    (content_id, tool_url, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, `/calculator/${tool}`, 'mentioned');
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

    private async migrateCaseData(db: Database.Database): Promise<void> {
        console.log('📋 迁移Case数据...');

        const casePath = path.join(this.contentDir, 'cases', 'improving-gpa-strategy.json');
        const caseContent = await fs.readFile(casePath, 'utf-8');
        const caseData = JSON.parse(caseContent);

        try {
            await this.migrateCaseItem(db, caseData);
            console.log(`  ✓ 迁移Case: ${caseData.frontmatter?.title}`);
        } catch (error) {
            console.error(`  ❌ 迁移Case失败: ${error.message}`);
        }
    }

    private async migrateCaseItem(db: Database.Database, caseItem: any): Promise<number> {
        const frontmatter = caseItem.frontmatter || {};

        // 插入内容项
        const result = db.prepare(`
            INSERT OR REPLACE INTO content_items (
                slug, title, type, summary, content, status,
                industry, created_at, updated_at, reading_time, tags
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            frontmatter.slug,
            frontmatter.title,
            'case',
            frontmatter.summary,
            JSON.stringify(caseItem.content),
            frontmatter.status || 'published',
            frontmatter.industry || null,
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            frontmatter.readingTime || this.calculateReadingTime(JSON.stringify(caseItem.content)),
            JSON.stringify(frontmatter.tags || [])
        );

        const contentId = result.lastInsertRowid as number;

        // 迁移案例详细信息
        await this.migrateCaseDetails(db, contentId, caseItem);

        // 迁移关系数据
        await this.migrateRelationships(db, contentId, frontmatter);

        // 迁移SEO元数据
        await this.migrateSEOMetadata(db, contentId, frontmatter);

        return contentId;
    }

    private async migrateCaseDetails(db: Database.Database, contentId: number, caseItem: any): Promise<void> {
        const frontmatter = caseItem.frontmatter || {};

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
            caseItem.content.background || null,
            caseItem.content.challenge || null,
            JSON.stringify(caseItem.content.approach || {}),
            JSON.stringify(caseItem.content.results_detail || {}),
            JSON.stringify(caseItem.content.key_insights || []),
            JSON.stringify(caseItem.content.recommendations || [])
        );
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
                `).run(contentId, term, 'related');
            }
        }

        // FAQ关系
        if (related.faq && Array.isArray(related.faq)) {
            for (const faqSlug of related.faq) {
                await this.migrateContentRelationship(db, contentId, faqSlug, 'similar');
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
            null, // Open Graph 标题
            null, // Open Graph 描述
            null, // Open Graph 图片
            null  // Twitter 卡片
        );
    }

    private calculateReadingTime(content: string): number {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
    }

    private conceptToTermSlug(concept: string): string | null {
        // 简单的概念到术语slug映射
        const mapping: Record<string, string> = {
            'mean': 'mean',
            'median': 'median',
            'standard-deviation': 'standard-deviation',
            'variance': 'variance',
            'gpa': 'gpa',
            'weighted-mean': 'weighted-mean'
        };

        return mapping[concept.toLowerCase().replace(/\s+/g, '-')] || null;
    }

    private getToolRelationshipType(toolUrl: string, contentType: string): string {
        if (toolUrl.includes(frontmatter.targetTool) || contentType === 'howto') {
            return 'target';
        }
        return 'mentioned';
    }

    private async validateDataIntegrity(db: Database.Database): Promise<void> {
        console.log('🔍 验证数据完整性...');

        // 检查内容项总数
        const contentCount = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE type IN ("faq", "howto", "case")').get() as any;
        console.log(`  📊 内容项总数: ${contentCount.count}`);

        // 检查关系数据
        const relationships = [
            { name: 'content_relationships', count: 0 },
            { name: 'content_tool_relationships', count: 0 },
            { name: 'content_term_relationships', count: 0 }
        ];

        for (const rel of relationships) {
            const result = db.prepare(`SELECT COUNT(*) as count FROM ${rel.name}`).get() as any;
            rel.count = result.count;
            console.log(`  📊 ${rel.name}: ${rel.count} 条关系`);
        }

        // 检查步骤数据
        const stepsCount = db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;
        console.log(`  📊 howto_steps: ${stepsCount.count} 个步骤`);

        // 检查案例数据
        const casesCount = db.prepare('SELECT COUNT(*) as count FROM case_details').get() as any;
        console.log(`  📊 case_details: ${casesCount.count} 个案例详情`);

        // 检查SEO数据
        const seoCount = db.prepare('SELECT COUNT(*) as count FROM seo_metadata').get() as any;
        console.log(`  📊 seo_metadata: ${seoCount.count} 条SEO数据`);

        console.log('✅ 数据完整性验证完成');
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚内容数据迁移...');

        // 删除迁移的内容数据
        const contentTypes = ['faq', 'howto', 'case'];

        for (const type of contentTypes) {
            try {
                const result = db.prepare('DELETE FROM content_items WHERE type = ?').run(type);
                console.log(`  ✓ 删除 ${type} 类型数据: ${result.changes} 条`);
            } catch (error) {
                console.warn(`  ⚠️ 删除 ${type} 数据失败: ${error.message}`);
            }
        }

        // 其他表的数据会通过外键级联删除
        console.log('  ✓ 相关关系和元数据已通过外键约束自动删除');
    }

    protected async validateMigration(db: Database.Database): Promise<boolean> {
        console.log('🔍 验证内容数据迁移...');

        // 验证内容项
        const contentTypes = ['faq', 'howto', 'case'];
        let totalContent = 0;

        for (const type of contentTypes) {
            const count = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE type = ?').get(type) as any;
            totalContent += count.count;
            console.log(`  ✓ ${type}: ${count.count} 项`);
        }

        if (totalContent === 0) {
            console.error('  ❌ 没有迁移任何内容数据');
            return false;
        }

        // 验证数据质量
        const nullSlugs = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE slug IS NULL').get() as any;
        if (nullSlugs.count > 0) {
            console.error(`  ❌ 发现 ${nullSlugs.count} 个内容项缺少slug`);
            return false;
        }

        // 验证关系数据
        const relationships = ['content_relationships', 'content_tool_relationships', 'content_term_relationships'];
        for (const rel of relationships) {
            const invalidRelations = db.prepare(`
                SELECT COUNT(*) as count FROM ${rel} cr
                LEFT JOIN content_items ci ON cr.content_id = ci.id
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidRelations.count > 0) {
                console.error(`  ❌ ${rel} 中有 ${invalidRelations.count} 个无效的关系`);
                return false;
            }
        }

        console.log('✅ 内容数据迁移验证完成');
        return true;
    }
}