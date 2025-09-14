#!/usr/bin/env tsx

/**
 * 内容数据迁移脚本
 * 迁移 FAQ、How-to、Cases 和 Topics 内容从 JSON 到 SQLite 数据库
 */

import { BaseMigration, MigrationResult } from '../../src/lib/migration/base';
import Database from 'better-sqlite3';
import { getDatabase } from '../../src/lib/db/client';
import fs from 'fs';
import path from 'path';

interface ContentItem {
    id: string;
    slug: string;
    frontmatter: any;
    question?: string;
    answer?: string;
    steps?: any[];
    content?: string;
}

interface HowToStep {
    id: string;
    step_order: number;
    step_id: string;
    name: string;
    description: string;
    tip?: string;
    warning?: string;
}

export class ContentMigration extends BaseMigration {
    private contentData: Map<string, ContentItem[]> = new Map();
    private topicData: any[] = [];

    constructor() {
        super();
        this.loadContentData();
    }

    protected getDatabaseConnection(): Database.Database {
        const db = getDatabase();
        db.exec('PRAGMA foreign_keys = OFF');
        return db;
    }

    getName(): string {
        return 'ContentMigration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return '迁移 FAQ、How-to、Cases 和 Topics 内容从 JSON 到 SQLite 数据库';
    }

    /**
     * 加载内容数据
     */
    private loadContentData(): void {
        // 加载 FAQ 数据
        const faqPath = path.join(process.cwd(), 'content', 'faq', 'statistics-faq.json');
        if (fs.existsSync(faqPath)) {
            const faqData = JSON.parse(fs.readFileSync(faqPath, 'utf8'));
            this.contentData.set('faq', faqData.items);
            this.logger.log(`加载 ${faqData.items.length} 个 FAQ 项目`);
        }

        // 加载 How-to 数据
        const howToFiles = fs.readdirSync(path.join(process.cwd(), 'content', 'howto'));
        howToFiles.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(process.cwd(), 'content', 'howto', file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!this.contentData.has('howto')) {
                    this.contentData.set('howto', []);
                }
                this.contentData.get('howto')!.push(data);
            }
        });
        this.logger.log(`加载 ${this.contentData.get('howto')?.length || 0} 个 How-to 项目`);

        // 加载 Cases 数据
        const casesFiles = fs.readdirSync(path.join(process.cwd(), 'content', 'cases'));
        casesFiles.forEach(file => {
            if (file.endsWith('.json')) {
                const filePath = path.join(process.cwd(), 'content', 'cases', file);
                const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
                if (!this.contentData.has('cases')) {
                    this.contentData.set('cases', []);
                }
                this.contentData.get('cases')!.push(data);
            }
        });
        this.logger.log(`加载 ${this.contentData.get('cases')?.length || 0} 个 Cases 项目`);

        // 检查是否有 Topics 数据
        const topicsPath = path.join(process.cwd(), 'data', 'topics.json');
        if (fs.existsSync(topicsPath)) {
            this.topicData = JSON.parse(fs.readFileSync(topicsPath, 'utf8'));
            this.logger.log(`加载 ${this.topicData.length} 个 Topics`);
        }
    }

    /**
     * 验证数据格式
     */
    private validateData(): void {
        this.contentData.forEach((items, type) => {
            items.forEach((item, index) => {
                // For FAQ items, slug is at root level
                // For How-to and Cases, slug is in frontmatter
                let slug;
                if (type === 'faq') {
                    slug = item.slug;
                } else {
                    slug = item.frontmatter?.slug;
                }

                if (!slug) {
                    throw new Error(`${type} 项目 ${index} 缺少必需字段: slug`);
                }

                const frontmatter = item.frontmatter;
                const fmRequiredFields = ['title', 'type', 'summary'];
                for (const field of fmRequiredFields) {
                    if (!frontmatter[field]) {
                        throw new Error(`${type} 项目 ${slug} 的 frontmatter 缺少必需字段: ${field}`);
                    }
                }
            });
        });

        this.logger.log('✅ 内容数据验证通过');
    }

    /**
     * 迁移内容类型
     */
    private async migrateContentTypes(): Promise<Map<string, number>> {
        return this.safeExecute('迁移内容类型', async () => {
            const typeMap = new Map<string, number>();
            const contentTypes = [
                { type: 'faq', display: 'FAQ' },
                { type: 'howto', display: 'How-To Guide' },
                { type: 'case', display: 'Case Study' }
            ];

            for (const contentType of contentTypes) {
                const result = this.db.prepare(`
                    INSERT OR IGNORE INTO content_types (type_name, display_name)
                    VALUES (?, ?)
                `).run(contentType.type, contentType.display);

                const type = this.db.prepare(`
                    SELECT id FROM content_types WHERE type_name = ?
                `).get(contentType.type);

                if (type) {
                    typeMap.set(contentType.type, type.id);
                    this.logger.log(`迁移内容类型: ${contentType.display} (ID: ${type.id})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${typeMap.size} 个内容类型`);
            return typeMap;
        });
    }

    /**
     * 迁移 FAQ 内容
     */
    private async migrateFAQ(typeMap: Map<string, number>): Promise<Map<string, number>> {
        return this.safeExecute('迁移 FAQ 内容', async () => {
            const contentMap = new Map<string, number>();
            const faqItems = this.contentData.get('faq') || [];

            for (const item of faqItems) {
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO content_items
                    (type_id, slug, title, summary, content, status, reading_time, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    typeMap.get('faq'),
                    item.slug,
                    item.frontmatter.title,
                    item.frontmatter.summary,
                    item.answer || '',
                    item.frontmatter.status || 'published',
                    this.calculateReadingTime(item.answer || ''),
                    item.frontmatter.created,
                    item.frontmatter.updated
                );

                const content = this.db.prepare(`
                    SELECT id FROM content_items WHERE slug = ?
                `).get(item.slug);

                if (content) {
                    contentMap.set(item.slug, content.id);
                    this.logger.log(`迁移 FAQ: ${item.frontmatter.title} (ID: ${content.id})`);

                    // 迁移元数据
                    await this.migrateContentMetadata(content.id, item.frontmatter);
                }
            }

            this.logger.log(`✅ 已迁移 ${contentMap.size} 个 FAQ 项目`);
            return contentMap;
        });
    }

    /**
     * 迁移 How-to 内容
     */
    private async migrateHowTo(typeMap: Map<string, number>): Promise<Map<string, number>> {
        return this.safeExecute('迁移 How-to 内容', async () => {
            const contentMap = new Map<string, number>();
            const howtoItems = this.contentData.get('howto') || [];

            for (const item of howtoItems) {
                const slug = item.frontmatter.slug;
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO content_items
                    (type_id, slug, title, summary, content, status, reading_time, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    typeMap.get('howto'),
                    slug,
                    item.frontmatter.title,
                    item.frontmatter.summary,
                    typeof item.content === 'string' ? item.content : JSON.stringify(item.content || {}),
                    item.frontmatter.status || 'published',
                    item.frontmatter.reading_time || this.calculateReadingTime(item.content || ''),
                    item.frontmatter.created,
                    item.frontmatter.updated
                );

                const content = this.db.prepare(`
                    SELECT id FROM content_items WHERE slug = ?
                `).get(slug);

                if (content) {
                    contentMap.set(slug, content.id);
                    this.logger.log(`迁移 How-to: ${item.frontmatter.title} (ID: ${content.id})`);

                    // 迁移步骤
                    await this.migrateHowToSteps(content.id, item.steps || []);

                    // 迁移元数据
                    await this.migrateContentMetadata(content.id, item.frontmatter);
                }
            }

            this.logger.log(`✅ 已迁移 ${contentMap.size} 个 How-to 项目`);
            return contentMap;
        });
    }

    /**
     * 迁移 Cases 内容
     */
    private async migrateCases(typeMap: Map<string, number>): Promise<Map<string, number>> {
        return this.safeExecute('迁移 Cases 内容', async () => {
            const contentMap = new Map<string, number>();
            const caseItems = this.contentData.get('cases') || [];

            for (const item of caseItems) {
                const slug = item.frontmatter.slug;
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO content_items
                    (type_id, slug, title, summary, content, status, reading_time, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `).run(
                    typeMap.get('case'),
                    slug,
                    item.frontmatter.title,
                    item.frontmatter.summary,
                    typeof item.content === 'string' ? item.content : JSON.stringify(item.content || {}),
                    item.frontmatter.status || 'published',
                    item.frontmatter.reading_time || this.calculateReadingTime(item.content || ''),
                    item.frontmatter.created,
                    item.frontmatter.updated
                );

                const content = this.db.prepare(`
                    SELECT id FROM content_items WHERE slug = ?
                `).get(slug);

                if (content) {
                    contentMap.set(slug, content.id);
                    this.logger.log(`迁移 Case: ${item.frontmatter.title} (ID: ${content.id})`);

                    // 迁移元数据
                    await this.migrateContentMetadata(content.id, item.frontmatter);
                }
            }

            this.logger.log(`✅ 已迁移 ${contentMap.size} 个 Cases 项目`);
            return contentMap;
        });
    }

    /**
     * 迁移 How-to 步骤
     */
    private async migrateHowToSteps(contentId: number, steps: any[]): Promise<void> {
        return this.safeExecute(`迁移 How-to 步骤`, async () => {
            for (let i = 0; i < steps.length; i++) {
                const step = steps[i];
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO howto_steps
                    (content_id, step_order, step_id, name, description, tip, warning)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                `).run(
                    contentId,
                    i + 1,
                    step.id,
                    step.name,
                    step.description,
                    step.tip || null,
                    step.warning || null
                );
            }
        });
    }

    /**
     * 迁移内容元数据
     */
    private migrateContentMetadata(contentId: number, frontmatter: any): void {
        try {
            const metadataFields = [
                'tags', 'category', 'priority', 'featured', 'difficulty',
                'targetTool', 'prefillParams', 'prerequisites', 'outcomes',
                'seo', 'mentions', 'relatedQuestions'
            ];

            for (const field of metadataFields) {
                if (frontmatter[field] !== undefined && frontmatter[field] !== null) {
                    let value;
                    if (typeof frontmatter[field] === 'object') {
                        value = JSON.stringify(frontmatter[field]);
                    } else if (typeof frontmatter[field] === 'boolean') {
                        value = frontmatter[field] ? '1' : '0';
                    } else {
                        value = String(frontmatter[field]);
                    }

                    this.db.prepare(`
                        INSERT OR REPLACE INTO content_metadata (content_id, meta_key, meta_value)
                        VALUES (?, ?, ?)
                    `).run(contentId, field, value);
                }
            }
        } catch (error) {
            this.logger.logWarning(`迁移内容元数据失败: ${error.message}`);
        }
    }

    /**
     * 计算阅读时间（分钟）
     */
    private calculateReadingTime(content: any): number {
        const wordsPerMinute = 200;
        let textContent = '';

        if (typeof content === 'string') {
            textContent = content;
        } else if (typeof content === 'object') {
            // Convert object to JSON string for word count
            textContent = JSON.stringify(content);
        } else {
            return 5; // Default reading time
        }

        const wordCount = textContent.split(/\s+/).length;
        return Math.ceil(wordCount / wordsPerMinute);
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
            const typeMap = await this.migrateContentTypes();
            await this.migrateFAQ(typeMap);
            await this.migrateHowTo(typeMap);
            await this.migrateCases(typeMap);

            // 验证迁移结果
            const isValid = await this.validate();

            if (!isValid) {
                throw new Error('迁移验证失败');
            }

            this.logger.logComplete(this.stats);
            return {
                success: true,
                message: '内容数据迁移成功完成',
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
        return this.safeExecute('验证内容迁移', async () => {
            let totalItems = 0;

            // 验证内容类型
            const typeCount = this.getRecordCount('content_types');
            if (typeCount < 3) {
                throw new Error(`内容类型数量不足: 期望至少 3 个，实际 ${typeCount}`);
            }

            // 验证内容项目
            this.contentData.forEach((items, type) => {
                totalItems += items.length;
            });

            const dbItemCount = this.getRecordCount('content_items');
            if (dbItemCount !== totalItems) {
                throw new Error(`内容项目数量不匹配: 期望 ${totalItems}, 实际 ${dbItemCount}`);
            }

            // 验证 How-to 步骤
            const howtoItems = this.contentData.get('howto') || [];
            let totalSteps = 0;
            howtoItems.forEach(item => {
                totalSteps += (item.steps || []).length;
            });

            const dbStepCount = this.getRecordCount('howto_steps');
            if (dbStepCount !== totalSteps) {
                throw new Error(`How-to 步骤数量不匹配: 期望 ${totalSteps}, 实际 ${dbStepCount}`);
            }

            this.logger.log(`✅ 验证通过: ${typeCount} 个类型, ${dbItemCount} 个内容项目, ${dbStepCount} 个步骤`);
            return true;
        });
    }

    /**
     * 回滚迁移
     */
    async rollback(): Promise<boolean> {
        this.logger.log('🔄 开始回滚内容迁移...');

        try {
            return this.safeExecute('回滚内容迁移', async () => {
                // 删除元数据
                const metadataCount = this.getRecordCount('content_metadata');
                this.db.exec('DELETE FROM content_metadata');
                this.logger.log(`已删除 ${metadataCount} 个内容元数据`);

                // 删除 How-to 步骤
                const stepCount = this.getRecordCount('howto_steps');
                this.db.exec('DELETE FROM howto_steps');
                this.logger.log(`已删除 ${stepCount} 个 How-to 步骤`);

                // 删除内容项目
                const contentCount = this.getRecordCount('content_items');
                this.db.exec('DELETE FROM content_items');
                this.logger.log(`已删除 ${contentCount} 个内容项目`);

                // 删除内容类型
                const typeCount = this.getRecordCount('content_types');
                this.db.exec('DELETE FROM content_types');
                this.logger.log(`已删除 ${typeCount} 个内容类型`);

                // 验证回滚
                const remainingItems = this.getRecordCount('content_items');
                const remainingTypes = this.getRecordCount('content_types');

                if (remainingItems > 0 || remainingTypes > 0) {
                    throw new Error('回滚不完整，仍有残留数据');
                }

                this.logger.log('✅ 内容迁移回滚成功');
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
    const migration = new ContentMigration();

    try {
        const result = await migration.migrate();

        if (result.success) {
            console.log('\n🎉 内容迁移成功完成！');
            console.log(`📊 迁移统计: ${result.stats.getSuccessCount()} 个操作成功`);
            process.exit(0);
        } else {
            console.log('\n💥 内容迁移失败:', result.message);
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