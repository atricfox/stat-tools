import Database from 'better-sqlite3';
import { BaseMigration } from '../../src/lib/migration/base';
import fs from 'fs/promises';
import path from 'path';
import {
    EnhancedContentMigration,
    MigrationResult,
    MigrationItemResult,
    ContentParser,
    FAQItem,
    HowToItem,
    CaseItem
} from '../../scripts/lib/content-migration-framework';

/**
 * Content-Specific Migration
 * 具体内容类型的迁移实现
 */
export class ContentSpecificMigration extends BaseMigration {
    private contentDir: string;
    private migrationFramework: EnhancedContentMigration;

    constructor() {
        super();
        this.contentDir = path.join(process.cwd(), 'content');
    }

    protected getDatabaseConnection(): Database.Database {
        const { getDatabase } = require('../../src/lib/db/client');
        return getDatabase();
    }

    getName(): string {
        return 'Content-Specific Migration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return 'Migrate specific content types with enhanced validation';
    }

    protected async executeMigration(db: Database.Database): Promise<void> {
        console.log('🚀 开始执行具体内容类型迁移...');

        // 创建迁移框架实例
        this.migrationFramework = new EnhancedContentMigration(db);

        // Phase 1: FAQ迁移
        await this.executeFAQMigration(db);

        // Phase 2: How-to迁移
        await this.executeHowToMigration(db);

        // Phase 3: Case迁移
        await this.executeCaseMigration(db);

        // Phase 4: 生成迁移报告
        await this.generateMigrationReport();

        console.log('✅ 具体内容类型迁移完成');
    }

    private async executeFAQMigration(db: Database.Database): Promise<void> {
        console.log('❓ 执行FAQ迁移...');

        return this.migrationFramework.migrateWithMonitoring('FAQ Migration', async () => {
            const faqData = await this.loadFAQData();
            const results: MigrationItemResult[] = [];

            for (const faqItem of faqData) {
                const result = await this.migrateFAQItem(db, faqItem);
                results.push(result);
            }

            const migrationResult: MigrationResult = {
                success: true,
                totalItems: faqData.length,
                migratedItems: results.filter(r => r.success).length,
                errors: results.filter(r => !r.success).map(r => r.error || 'Unknown error'),
                details: results
            };

            this.logMigrationResults('FAQ', migrationResult);
            return migrationResult;
        });
    }

    private async loadFAQData(): Promise<FAQItem[]> {
        const faqPath = path.join(this.contentDir, 'faq', 'statistics-faq.json');
        const faqContent = await fs.readFile(faqPath, 'utf-8');
        const faqData = JSON.parse(faqContent);
        return ContentParser.parseFAQ(faqData);
    }

    private async migrateFAQItem(db: Database.Database, faqItem: FAQItem): Promise<MigrationItemResult> {
        try {
            // 验证数据
            if (!await this.migrationFramework.validateAndLog(faqItem, 'faq')) {
                return { success: false, error: 'Validation failed' };
            }

            // 插入内容项
            const contentId = await this.insertFAQContent(db, faqItem);

            // 迁移关系
            await this.migrationFramework.relationshipMapper.mapContentRelationships(
                contentId,
                faqItem.frontmatter.related,
                'faq'
            );

            // 迁移SEO元数据
            await this.migrationFramework.migrateSEOMetadata(contentId, faqItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async insertFAQContent(db: Database.Database, faqItem: FAQItem): Promise<number> {
        const result = db.prepare(`
            INSERT OR REPLACE INTO content_items (
                slug, title, type, summary, content, status,
                category, priority, featured, created_at, updated_at,
                reading_time, tags, difficulty, industry, target_tool,
                seo_meta_description, seo_keywords
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            faqItem.slug,
            faqItem.frontmatter.title,
            'faq',
            faqItem.frontmatter.summary,
            faqItem.answer,
            faqItem.frontmatter.status || 'published',
            faqItem.frontmatter.category || 'General',
            faqItem.frontmatter.priority || 0,
            faqItem.frontmatter.featured || false,
            faqItem.frontmatter.created || new Date().toISOString(),
            faqItem.frontmatter.updated || new Date().toISOString(),
            this.migrationFramework.calculateReadingTime(faqItem.answer),
            JSON.stringify(faqItem.frontmatter.tags || []),
            null, // FAQ没有难度
            null, // FAQ没有行业
            null, // FAQ没有目标工具
            null, // FAQ没有SEO描述
            null  // FAQ没有SEO关键词
        );

        return result.lastInsertRowid as number;
    }

    private async executeHowToMigration(db: Database.Database): Promise<void> {
        console.log('📝 执行How-to迁移...');

        return this.migrationFramework.migrateWithMonitoring('How-to Migration', async () => {
            const howToFiles = await this.loadHowToFiles();
            const results: MigrationItemResult[] = [];

            for (const [fileName, howToData] of Object.entries(howToFiles)) {
                const result = await this.migrateHowToItem(db, howToData);
                results.push({ ...result, fileName });
            }

            const migrationResult: MigrationResult = {
                success: true,
                totalItems: howToFiles.length,
                migratedItems: results.filter(r => r.success).length,
                errors: results.filter(r => !r.success).map(r => r.error || 'Unknown error'),
                details: results
            };

            this.logMigrationResults('How-to', migrationResult);
            return migrationResult;
        });
    }

    private async loadHowToFiles(): Promise<Record<string, HowToItem>> {
        const howToDir = path.join(this.contentDir, 'howto');
        const files = await fs.readdir(howToDir);
        const jsonFiles = files.filter(f => f.endsWith('.json'));

        const result: Record<string, HowToItem> = {};

        for (const file of jsonFiles) {
            try {
                const filePath = path.join(howToDir, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const howToData = JSON.parse(content);
                result[file] = ContentParser.parseHowTo(howToData);
            } catch (error) {
                console.error(`Failed to load How-to file: ${file}`, error);
            }
        }

        return result;
    }

    private async migrateHowToItem(db: Database.Database, howToItem: HowToItem): Promise<MigrationItemResult> {
        try {
            if (!await this.migrationFramework.validateAndLog(howToItem, 'howto')) {
                return { success: false, error: 'Validation failed' };
            }

            const contentId = await this.insertHowToContent(db, howToItem);

            // 迁移步骤
            await this.migrateHowToSteps(db, contentId, howToItem.steps);

            // 迁移关系
            await this.migrationFramework.relationshipMapper.mapContentRelationships(
                contentId,
                howToItem.frontmatter.related,
                'howto'
            );

            // 迁移mentions关系
            if (howToItem.frontmatter.mentions) {
                await this.migrateMentions(db, contentId, howToItem.frontmatter.mentions);
            }

            // 迁移SEO元数据
            await this.migrationFramework.migrateSEOMetadata(contentId, howToItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async insertHowToContent(db: Database.Database, howToItem: HowToItem): Promise<number> {
        const frontmatter = howToItem.frontmatter;
        const seo = frontmatter.seo || {};

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
            howToItem.content,
            frontmatter.status || 'published',
            frontmatter.created || new Date().toISOString(),
            frontmatter.updated || new Date().toISOString(),
            frontmatter.readingTime || this.migrationFramework.calculateReadingTime(howToItem.content),
            JSON.stringify(frontmatter.tags || []),
            frontmatter.difficulty || null,
            frontmatter.targetTool || null,
            seo.metaDescription || null,
            JSON.stringify(seo.keywords || [])
        );

        return result.lastInsertRowid as number;
    }

    private async migrateHowToSteps(db: Database.Database, contentId: number, steps: any[]): Promise<void> {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            try {
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
            } catch (error) {
                console.warn(`Failed to migrate step ${step.id} for content ${contentId}`, error);
            }
        }
    }

    private async migrateMentions(db: Database.Database, contentId: number, mentions: any): Promise<void> {
        if (mentions.tools && Array.isArray(mentions.tools)) {
            for (const tool of mentions.tools) {
                try {
                    db.prepare(`
                        INSERT OR IGNORE INTO content_tool_relationships
                        (content_id, tool_url, relationship_type)
                        VALUES (?, ?, ?)
                    `).run(contentId, `/calculator/${tool}`, 'mentioned');
                } catch (error) {
                    console.warn(`Failed to migrate tool mention: ${tool}`, error);
                }
            }
        }

        if (mentions.concepts && Array.isArray(mentions.concepts)) {
            for (const concept of mentions.concepts) {
                try {
                    const termSlug = this.migrationFramework.conceptToTermSlug(concept);
                    if (termSlug) {
                        db.prepare(`
                            INSERT OR IGNORE INTO content_term_relationships
                            (content_id, term_slug, relationship_type)
                            VALUES (?, ?, ?)
                        `).run(contentId, termSlug, 'mentioned');
                    }
                } catch (error) {
                    console.warn(`Failed to migrate concept mention: ${concept}`, error);
                }
            }
        }
    }

    private async executeCaseMigration(db: Database.Database): Promise<void> {
        console.log('📋 执行Case迁移...');

        return this.migrationFramework.migrateWithMonitoring('Case Migration', async () => {
            const caseData = await this.loadCaseData();
            const result = await this.migrateCaseItem(db, caseData);

            const migrationResult: MigrationResult = {
                success: result.success,
                totalItems: 1,
                migratedItems: result.success ? 1 : 0,
                errors: result.success ? [] : [result.error || 'Unknown error'],
                details: [result]
            };

            this.logMigrationResults('Case', migrationResult);
            return migrationResult;
        });
    }

    private async loadCaseData(): Promise<CaseItem> {
        const casePath = path.join(this.contentDir, 'cases', 'improving-gpa-strategy.json');
        const caseContent = await fs.readFile(casePath, 'utf-8');
        const caseData = JSON.parse(caseContent);
        return ContentParser.parseCase(caseData);
    }

    private async migrateCaseItem(db: Database.Database, caseItem: CaseItem): Promise<MigrationItemResult> {
        try {
            if (!await this.migrationFramework.validateAndLog(caseItem, 'case')) {
                return { success: false, error: 'Validation failed' };
            }

            const contentId = await this.insertCaseContent(db, caseItem);

            // 迁移案例详细信息
            await this.migrateCaseDetails(db, contentId, caseItem);

            // 迁移关系
            await this.migrationFramework.relationshipMapper.mapContentRelationships(
                contentId,
                caseItem.frontmatter.related,
                'case'
            );

            // 迁移SEO元数据
            await this.migrationFramework.migrateSEOMetadata(contentId, caseItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async insertCaseContent(db: Database.Database, caseItem: CaseItem): Promise<number> {
        const frontmatter = caseItem.frontmatter;

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
            frontmatter.readingTime || this.migrationFramework.calculateReadingTime(JSON.stringify(caseItem.content)),
            JSON.stringify(frontmatter.tags || [])
        );

        return result.lastInsertRowid as number;
    }

    private async migrateCaseDetails(db: Database.Database, contentId: number, caseItem: CaseItem): Promise<void> {
        const frontmatter = caseItem.frontmatter;

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
                caseItem.content.background || null,
                caseItem.content.challenge || null,
                JSON.stringify(caseItem.content.approach || {}),
                JSON.stringify(caseItem.content.results_detail || {}),
                JSON.stringify(caseItem.content.key_insights || []),
                JSON.stringify(caseItem.content.recommendations || [])
            );
        } catch (error) {
            console.warn(`Failed to migrate case details for content ${contentId}`, error);
        }
    }

    private logMigrationResults(type: string, result: MigrationResult): void {
        console.log(`\n📊 ${type} Migration Results:`);
        console.log(`  总项目数: ${result.totalItems}`);
        console.log(`  成功迁移: ${result.migratedItems}`);
        console.log(`  失败项目: ${result.totalItems - result.migratedItems}`);

        if (result.errors.length > 0) {
            console.log('  错误列表:');
            result.errors.forEach((error, index) => {
                console.log(`    ${index + 1}. ${error}`);
            });
        }

        console.log(`  成功率: ${((result.migratedItems / result.totalItems) * 100).toFixed(1)}%`);
    }

    private async generateMigrationReport(): Promise<void> {
        const metrics = this.migrationFramework.getPerformanceMetrics();
        const report = this.migrationFramework.generateMigrationReport(metrics);

        console.log('\n' + report);

        // 保存报告到文件
        const reportPath = path.join(process.cwd(), 'migration-report.txt');
        await fs.writeFile(reportPath, report, 'utf-8');
        console.log(`\n📄 迁移报告已保存到: ${reportPath}`);
    }

    protected async rollback(db: Database.Database): Promise<void> {
        console.log('🔄 回滚具体内容迁移...');

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
        console.log('🔍 验证具体内容迁移...');

        let isValid = true;

        // 验证内容项
        const contentTypes = ['faq', 'howto', 'case'];
        let totalContent = 0;

        for (const type of contentTypes) {
            const count = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE type = ?').get(type) as any;
            totalContent += count.count;
            console.log(`  ✓ ${type}: ${count.count} 项`);

            if (count.count === 0) {
                console.warn(`  ⚠️ 没有找到 ${type} 类型内容`);
                isValid = false;
            }
        }

        if (totalContent === 0) {
            console.error('  ❌ 没有迁移任何内容数据');
            return false;
        }

        // 验证数据质量
        const nullSlugs = db.prepare('SELECT COUNT(*) as count FROM content_items WHERE slug IS NULL').get() as any;
        if (nullSlugs.count > 0) {
            console.error(`  ❌ 发现 ${nullSlugs.count} 个内容项缺少slug`);
            isValid = false;
        }

        // 验证步骤数据
        const stepsCount = db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;
        console.log(`  ✓ howto_steps: ${stepsCount.count} 个步骤`);

        // 验证案例数据
        const casesCount = db.prepare('SELECT COUNT(*) as count FROM case_details').get() as any;
        console.log(`  ✓ case_details: ${casesCount.count} 个案例详情`);

        // 验证关系数据
        const relationships = ['content_relationships', 'content_tool_relationships', 'content_term_relationships'];
        for (const rel of relationships) {
            const count = db.prepare(`SELECT COUNT(*) as count FROM ${rel}`).get() as any;
            console.log(`  ✓ ${rel}: ${count.count} 条关系`);

            const invalidRelations = db.prepare(`
                SELECT COUNT(*) as count FROM ${rel} cr
                LEFT JOIN content_items ci ON cr.content_id = ci.id
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidRelations.count > 0) {
                console.error(`  ❌ ${rel} 中有 ${invalidRelations.count} 个无效的关系`);
                isValid = false;
            }
        }

        console.log(`✅ 具体内容迁移验证${isValid ? '成功' : '失败'}`);
        return isValid;
    }
}