import Database from 'better-sqlite3';

/**
 * 内容迁移框架核心类和工具
 */

// 数据类型定义
export interface FAQItem {
    id: string;
    slug: string;
    frontmatter: any;
    question: string;
    answer: string;
    relatedQuestions?: string[];
}

export interface HowToItem {
    frontmatter: any;
    steps: any[];
    content: string;
}

export interface CaseItem {
    frontmatter: any;
    content: any;
}

export interface MigrationResult {
    success: boolean;
    totalItems: number;
    migratedItems: number;
    errors: string[];
    details: MigrationItemResult[];
}

export interface MigrationItemResult {
    success: boolean;
    id?: number;
    error?: string;
    fileName?: string;
}

export interface MigrationMetrics {
    startTime: number;
    endTime: number;
    duration: number;
    totalItems: number;
    successCount: number;
    errorCount: number;
    averageItemTime: number;
}

// 性能监控器
export class PerformanceMonitor {
    private metrics: Map<string, number> = new Map();
    private operations: Map<string, { start: number; end?: number }> = new Map();

    start(operation: string): void {
        this.operations.set(operation, { start: Date.now() });
    }

    end(operation: string): void {
        const op = this.operations.get(operation);
        if (op && !op.end) {
            op.end = Date.now();
            const duration = op.end - op.start;
            const current = this.metrics.get(operation) || 0;
            this.metrics.set(operation, current + duration);
        }
    }

    error(operation: string, error: Error): void {
        console.error(`Operation failed: ${operation}`, error);
        this.end(operation);
    }

    getMetrics(): Map<string, number> {
        return new Map(this.metrics);
    }

    getOperationTime(operation: string): number {
        return this.metrics.get(operation) || 0;
    }

    reset(): void {
        this.metrics.clear();
        this.operations.clear();
    }
}

// 内容验证器
export class ContentValidator {
    private errors: string[] = [];

    async validate(data: any, type: string): Promise<boolean> {
        this.errors = [];

        switch (type) {
            case 'faq':
                return this.validateFAQ(data);
            case 'howto':
                return this.validateHowTo(data);
            case 'case':
                return this.validateCase(data);
            default:
                this.errors.push(`Unknown content type: ${type}`);
                return false;
        }
    }

    private validateFAQ(data: FAQItem): boolean {
        if (!data.id || typeof data.id !== 'string') {
            this.errors.push('FAQ missing or invalid id');
        }

        if (!data.slug || typeof data.slug !== 'string') {
            this.errors.push('FAQ missing or invalid slug');
        }

        if (!data.frontmatter || typeof data.frontmatter !== 'object') {
            this.errors.push('FAQ missing frontmatter');
        }

        if (!data.question || typeof data.question !== 'string') {
            this.errors.push('FAQ missing or invalid question');
        }

        if (!data.answer || typeof data.answer !== 'string') {
            this.errors.push('FAQ missing or invalid answer');
        }

        return this.errors.length === 0;
    }

    private validateHowTo(data: HowToItem): boolean {
        if (!data.frontmatter || typeof data.frontmatter !== 'object') {
            this.errors.push('How-to missing frontmatter');
        }

        if (!data.frontmatter.slug || typeof data.frontmatter.slug !== 'string') {
            this.errors.push('How-to missing or invalid slug');
        }

        if (!data.steps || !Array.isArray(data.steps)) {
            this.errors.push('How-to missing or invalid steps');
        } else {
            data.steps.forEach((step, index) => {
                if (!step.id || typeof step.id !== 'string') {
                    this.errors.push(`Step ${index + 1} missing or invalid id`);
                }
                if (!step.name || typeof step.name !== 'string') {
                    this.errors.push(`Step ${index + 1} missing or invalid name`);
                }
                if (!step.description || typeof step.description !== 'string') {
                    this.errors.push(`Step ${index + 1} missing or invalid description`);
                }
            });
        }

        return this.errors.length === 0;
    }

    private validateCase(data: CaseItem): boolean {
        if (!data.frontmatter || typeof data.frontmatter !== 'object') {
            this.errors.push('Case missing frontmatter');
        }

        if (!data.frontmatter.slug || typeof data.frontmatter.slug !== 'string') {
            this.errors.push('Case missing or invalid slug');
        }

        if (!data.content || typeof data.content !== 'object') {
            this.errors.push('Case missing or invalid content');
        }

        return this.errors.length === 0;
    }

    getErrors(): string[] {
        return [...this.errors];
    }

    hasErrors(): boolean {
        return this.errors.length > 0;
    }
}

// 关系映射器
export class RelationshipMapper {
    constructor(private db: Database.Database) {}

    async mapContentRelationships(
        contentId: number,
        relationships: any,
        type: string
    ): Promise<void> {
        if (!relationships) return;

        // 映射工具关系
        if (relationships.tools) {
            await this.mapToolRelationships(contentId, relationships.tools, type);
        }

        // 映射术语关系
        if (relationships.glossary) {
            await this.mapTermRelationships(contentId, relationships.glossary, 'related');
        }

        // 映射FAQ关系
        if (relationships.faq) {
            await this.mapContentToContentRelationships(contentId, relationships.faq, 'similar');
        }

        // 映射How-to关系
        if (relationships.howto) {
            await this.mapContentToContentRelationships(contentId, relationships.howto, 'prerequisite');
        }

        // 映射Case关系
        if (relationships.cases) {
            await this.mapContentToContentRelationships(contentId, relationships.cases, 'similar');
        }
    }

    private async mapToolRelationships(
        contentId: number,
        tools: string[],
        relationshipType: string
    ): Promise<void> {
        for (const toolUrl of tools) {
            try {
                this.db.prepare(`
                    INSERT OR IGNORE INTO content_tool_relationships
                    (content_id, tool_url, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, toolUrl, relationshipType);
            } catch (error) {
                console.warn(`Failed to map tool relationship: ${toolUrl}`, error);
            }
        }
    }

    private async mapTermRelationships(
        contentId: number,
        terms: string[],
        relationshipType: string
    ): Promise<void> {
        for (const termSlug of terms) {
            try {
                this.db.prepare(`
                    INSERT OR IGNORE INTO content_term_relationships
                    (content_id, term_slug, relationship_type)
                    VALUES (?, ?, ?)
                `).run(contentId, termSlug, relationshipType);
            } catch (error) {
                console.warn(`Failed to map term relationship: ${termSlug}`, error);
            }
        }
    }

    private async mapContentToContentRelationships(
        contentId: number,
        targetSlugs: string[],
        relationshipType: string
    ): Promise<void> {
        for (const targetSlug of targetSlugs) {
            try {
                // 查找目标内容ID
                const targetContent = this.db.prepare('SELECT id FROM content_items WHERE slug = ?').get(targetSlug);
                if (targetContent) {
                    this.db.prepare(`
                        INSERT OR IGNORE INTO content_relationships
                        (from_content_id, to_content_id, relationship_type)
                        VALUES (?, ?, ?)
                    `).run(contentId, targetContent.id, relationshipType);
                } else {
                    console.warn(`Target content not found for relationship: ${targetSlug}`);
                }
            } catch (error) {
                console.warn(`Failed to map content relationship: ${targetSlug}`, error);
            }
        }
    }
}

// 内容解析器
export class ContentParser {
    static parseFAQ(jsonData: any): FAQItem[] {
        if (!jsonData.items || !Array.isArray(jsonData.items)) {
            throw new Error('Invalid FAQ data format: missing items array');
        }

        return jsonData.items.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            frontmatter: item.frontmatter || {},
            question: item.question,
            answer: item.answer,
            relatedQuestions: item.relatedQuestions || []
        }));
    }

    static parseHowTo(jsonData: any): HowToItem {
        if (!jsonData.frontmatter) {
            throw new Error('Invalid How-to data format: missing frontmatter');
        }

        return {
            frontmatter: jsonData.frontmatter,
            steps: jsonData.steps || [],
            content: jsonData.content || ''
        };
    }

    static parseCase(jsonData: any): CaseItem {
        if (!jsonData.frontmatter) {
            throw new Error('Invalid Case data format: missing frontmatter');
        }

        if (!jsonData.content) {
            throw new Error('Invalid Case data format: missing content');
        }

        return {
            frontmatter: jsonData.frontmatter,
            content: jsonData.content
        };
    }
}

// 增强版迁移基类
export abstract class EnhancedContentMigration {
    protected db: Database.Database;
    protected performanceMonitor: PerformanceMonitor;
    protected relationshipMapper: RelationshipMapper;
    protected contentValidator: ContentValidator;

    constructor(db: Database.Database) {
        this.db = db;
        this.performanceMonitor = new PerformanceMonitor();
        this.relationshipMapper = new RelationshipMapper(db);
        this.contentValidator = new ContentValidator();
    }

    protected async migrateWithMonitoring<T>(
        operation: string,
        migrateFn: () => Promise<T>
    ): Promise<T> {
        this.performanceMonitor.start(operation);
        try {
            const result = await migrateFn();
            this.performanceMonitor.end(operation);
            return result;
        } catch (error) {
            this.performanceMonitor.error(operation, error);
            throw error;
        }
    }

    protected async validateAndLog(content: any, type: string): Promise<boolean> {
        const isValid = await this.contentValidator.validate(content, type);
        if (!isValid) {
            console.warn(`Validation failed for ${type} content:`,
                this.contentValidator.getErrors());
        }
        return isValid;
    }

    protected calculateReadingTime(content: string | object): number {
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

    protected async migrateSEOMetadata(
        contentId: number,
        frontmatter: any
    ): Promise<void> {
        const seo = frontmatter.seo || {};

        try {
            this.db.prepare(`
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
        } catch (error) {
            console.warn(`Failed to migrate SEO metadata for content ${contentId}`, error);
        }
    }

    protected conceptToTermSlug(concept: string): string | null {
        // 简单的概念到术语slug映射
        const mapping: Record<string, string> = {
            'mean': 'mean',
            'median': 'median',
            'standard-deviation': 'standard-deviation',
            'variance': 'variance',
            'gpa': 'gpa',
            'weighted-mean': 'weighted-mean',
            'central-tendency': 'central-tendency',
            'arithmetic-mean': 'arithmetic-mean',
            'grade-point-average': 'grade-point-average',
            'academic-planning': 'academic-planning'
        };

        return mapping[concept.toLowerCase().replace(/\s+/g, '-')] || null;
    }

    getPerformanceMetrics(): Map<string, number> {
        return this.performanceMonitor.getMetrics();
    }

    generateMigrationReport(metrics: Map<string, number>): string {
        let report = '📊 Migration Performance Report\n';
        report += '===============================\n\n';

        for (const [operation, time] of metrics.entries()) {
            report += `${operation}: ${time}ms\n`;
        }

        const totalTime = Array.from(metrics.values()).reduce((a, b) => a + b, 0);
        report += `\nTotal Migration Time: ${totalTime}ms (${(totalTime / 1000).toFixed(2)}s)\n`;

        return report;
    }
}