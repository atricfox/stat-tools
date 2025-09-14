# Content文件夹JSON数据迁移详细实施计划

## 📋 迁移概览

### 目标数据源
- **FAQ数据**: `content/faq/statistics-faq.json` (4个FAQ项)
- **How-to数据**: `content/howto/` (4个指南)
  - `calculate-gpa.json`
  - `calculate-mean-step-by-step.json`
  - `calculate-median.json`
  - `calculate-standard-deviation.json`
- **Case数据**: `content/cases/improving-gpa-strategy.json` (1个案例)

### 迁移复杂度评估
- **数据总量**: 9个内容项 + 丰富的元数据和关系数据
- **内容类型**: 3种不同的数据结构 (FAQ数组/How-to对象/Case对象)
- **关系复杂度**: 工具关联、术语关联、内容间关系
- **预计工时**: 5天完成完整迁移

---

## 🗓️ 详细实施时间表

### Day 1: 数据库架构准备 (今日)
**时间安排**: 9:00-17:00
**目标**: 完成数据库架构更新，准备迁移环境

#### 上午 (9:00-12:00)
- [ ] 备份现有数据库
- [ ] 执行表结构ALTER操作
- [ ] 创建新的关系表
- [ ] 创建元数据表

#### 下午 (13:00-17:00)
- [ ] 添加索引优化
- [ ] 验证架构更新
- [ ] 创建迁移基类
- [ ] 准备测试环境

### Day 2: 核心迁移类开发
**时间安排**: 9:00-17:00
**目标**: 完成核心迁移框架和工具类

#### 上午 (9:00-12:00)
- [ ] 创建增强版BaseMigration类
- [ ] 实现内容解析器
- [ ] 开发数据验证器
- [ ] 实现关系映射器

#### 下午 (13:00-17:00)
- [ ] 开发性能监控器
- [ ] 创建迁移报告生成器
- [ ] 编写单元测试
- [ ] 集成测试框架

### Day 3: 内容数据迁移实现
**时间安排**: 9:00-17:00
**目标**: 完成3种内容类型的迁移实现

#### 上午 (9:00-12:00)
- [ ] 实现FAQ数据迁移
- [ ] 实现How-to数据迁移
- [ ] 迁移步骤数据
- [ ] 处理SEO元数据

#### 下午 (13:00-17:00)
- [ ] 实现Case数据迁移
- [ ] 迁移案例详细信息
- [ ] 处理工具关联数据
- [ ] 迁移术语关联数据

### Day 4: 关系数据和服务层更新
**时间安排**: 9:00-17:00
**目标**: 完成关系迁移和服务层增强

#### 上午 (9:00-12:00)
- [ ] 迁移内容间关系
- [ ] 迁移工具关系
- [ ] 迁移术语关系
- [ ] 验证关系完整性

#### 下午 (13:00-17:00)
- [ ] 更新ContentService
- [ ] 添加新的查询方法
- [ ] 实现缓存策略
- [ ] 更新API接口

### Day 5: 测试、优化和部署
**时间安排**: 9:00-17:00
**目标**: 完整测试和性能优化

#### 上午 (9:00-12:00)
- [ ] 单元测试覆盖
- [ ] 集成测试
- [ ] 性能基准测试
- [ ] 数据完整性验证

#### 下午 (13:00-17:00)
- [ ] 执行生产迁移
- [ ] 监控迁移过程
- [ ] 性能优化调整
- [ ] 文档更新

---

## 🔧 技术实施细节

### Phase 1: 数据库架构更新脚本

```sql
-- 增强content_items表
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS difficulty TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS featured BOOLEAN DEFAULT FALSE;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 0;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS industry TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS target_tool TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS seo_meta_description TEXT;
ALTER TABLE content_items ADD COLUMN IF NOT EXISTS seo_keywords TEXT;

-- 内容关系表
CREATE TABLE IF NOT EXISTS content_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_content_id INTEGER NOT NULL,
    to_content_id INTEGER NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('similar', 'prerequisite', 'follow_up')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (from_content_id) REFERENCES content_items(id) ON DELETE CASCADE,
    FOREIGN KEY (to_content_id) REFERENCES content_items(id) ON DELETE CASCADE,
    UNIQUE(from_content_id, to_content_id, relationship_type)
);

-- 工具关系表
CREATE TABLE IF NOT EXISTS content_tool_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER NOT NULL,
    tool_url TEXT NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('target', 'mentioned', 'used')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
    UNIQUE(content_id, tool_url, relationship_type)
);

-- 术语关系表
CREATE TABLE IF NOT EXISTS content_term_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER NOT NULL,
    term_slug TEXT NOT NULL,
    relationship_type TEXT NOT NULL CHECK (relationship_type IN ('explained', 'mentioned', 'related')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE,
    UNIQUE(content_id, term_slug, relationship_type)
);

-- 案例详细信息表
CREATE TABLE IF NOT EXISTS case_details (
    content_id INTEGER PRIMARY KEY,
    problem TEXT,
    solution TEXT,
    results JSON, -- JSON数组
    lessons JSON, -- JSON数组
    tools_used JSON, -- JSON数组
    background TEXT,
    challenge TEXT,
    approach JSON, -- JSON对象
    results_detail JSON, -- JSON对象
    key_insights JSON, -- JSON数组
    recommendations JSON, -- JSON数组
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- SEO元数据表
CREATE TABLE IF NOT EXISTS seo_metadata (
    content_id INTEGER PRIMARY KEY,
    meta_description TEXT,
    keywords TEXT, -- JSON数组格式
    og_title TEXT,
    og_description TEXT,
    og_image TEXT,
    twitter_card TEXT,
    FOREIGN KEY (content_id) REFERENCES content_items(id) ON DELETE CASCADE
);

-- How-to步骤表
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
);
```

### Phase 2: 性能优化索引

```sql
-- 新增索引
CREATE INDEX IF NOT EXISTS idx_content_featured ON content_items(featured, priority);
CREATE INDEX IF NOT EXISTS idx_content_difficulty ON content_items(difficulty);
CREATE INDEX IF NOT EXISTS idx_content_industry ON content_items(industry);
CREATE INDEX IF NOT EXISTS idx_content_target_tool ON content_items(target_tool);
CREATE INDEX IF NOT EXISTS idx_content_seo_meta ON content_items(seo_meta_description);

-- 关系表索引
CREATE INDEX IF NOT EXISTS idx_content_relationships_from ON content_relationships(from_content_id);
CREATE INDEX IF NOT EXISTS idx_content_relationships_to ON content_relationships(to_content_id);
CREATE INDEX IF NOT EXISTS idx_content_relationships_type ON content_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_content_tool_relationships ON content_tool_relationships(content_id);
CREATE INDEX IF NOT EXISTS idx_content_tool_relationships_type ON content_tool_relationships(relationship_type);
CREATE INDEX IF NOT EXISTS idx_content_term_relationships ON content_term_relationships(content_id);
CREATE INDEX IF NOT EXISTS idx_content_term_relationships_type ON content_term_relationships(relationship_type);

-- 步骤表索引
CREATE INDEX IF NOT EXISTS idx_howto_steps_content ON howto_steps(content_id);
CREATE INDEX IF NOT EXISTS idx_howto_steps_order ON howto_steps(step_order);
```

### Phase 3: 核心迁移类设计

```typescript
// 增强版迁移基类
export abstract class EnhancedContentMigration extends BaseMigration {
    protected performanceMonitor: PerformanceMonitor;
    protected relationshipMapper: RelationshipMapper;
    protected contentValidator: ContentValidator;

    constructor() {
        super();
        this.performanceMonitor = new PerformanceMonitor();
        this.relationshipMapper = new RelationshipMapper(this.db);
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
}

// 内容解析器
export class ContentParser {
    static parseFAQ(jsonData: any): FAQItem[] {
        return jsonData.items.map((item: any) => ({
            id: item.id,
            slug: item.slug,
            frontmatter: item.frontmatter,
            question: item.question,
            answer: item.answer,
            relatedQuestions: item.relatedQuestions || []
        }));
    }

    static parseHowTo(jsonData: any): HowToItem {
        return {
            frontmatter: jsonData.frontmatter,
            steps: jsonData.steps || [],
            content: jsonData.content || ''
        };
    }

    static parseCase(jsonData: any): CaseItem {
        return {
            frontmatter: jsonData.frontmatter,
            content: jsonData.content
        };
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
    }

    private async mapToolRelationships(
        contentId: number,
        tools: string[],
        relationshipType: string
    ): Promise<void> {
        for (const toolUrl of tools) {
            this.db.prepare(`
                INSERT OR IGNORE INTO content_tool_relationships
                (content_id, tool_url, relationship_type)
                VALUES (?, ?, ?)
            `).run(contentId, toolUrl, relationshipType);
        }
    }

    private async mapTermRelationships(
        contentId: number,
        terms: string[],
        relationshipType: string
    ): Promise<void> {
        for (const termSlug of terms) {
            this.db.prepare(`
                INSERT OR IGNORE INTO content_term_relationships
                (content_id, term_slug, relationship_type)
                VALUES (?, ?, ?)
            `).run(contentId, termSlug, relationshipType);
        }
    }
}
```

### Phase 4: 具体迁移实现

```typescript
// FAQ数据迁移
export class FAQMigration extends EnhancedContentMigration {
    async migrate(): Promise<MigrationResult> {
        return this.migrateWithMonitoring('FAQ Migration', async () => {
            const faqData = await this.loadFAQData();
            const results: MigrationItemResult[] = [];

            for (const faqItem of faqData) {
                const result = await this.migrateFAQItem(faqItem);
                results.push(result);
            }

            return {
                success: true,
                totalItems: faqData.length,
                migratedItems: results.filter(r => r.success).length,
                errors: results.filter(r => !r.success).map(r => r.error),
                details: results
            };
        });
    }

    private async migrateFAQItem(faqItem: FAQItem): Promise<MigrationItemResult> {
        try {
            // 验证数据
            if (!await this.validateAndLog(faqItem, 'faq')) {
                return { success: false, error: 'Validation failed' };
            }

            // 插入主内容
            const contentId = await this.insertContentItem(faqItem);

            // 迁移关系
            await this.relationshipMapper.mapContentRelationships(
                contentId,
                faqItem.frontmatter.related,
                'faq'
            );

            // 迁移SEO元数据
            await this.migrateSEOMetadata(contentId, faqItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async insertContentItem(faqItem: FAQItem): Promise<number> {
        const result = this.db.prepare(`
            INSERT OR REPLACE INTO content_items (
                slug, title, type, summary, content, status,
                category, priority, featured, created_at, updated_at,
                difficulty, reading_time
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
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
            null, // FAQ没有难度
            this.calculateReadingTime(faqItem.answer)
        );

        return result.lastInsertRowid as number;
    }
}

// How-to数据迁移
export class HowToMigration extends EnhancedContentMigration {
    async migrate(): Promise<MigrationResult> {
        return this.migrateWithMonitoring('How-to Migration', async () => {
            const howToFiles = await this.loadHowToFiles();
            const results: MigrationItemResult[] = [];

            for (const [fileName, howToData] of Object.entries(howToFiles)) {
                const result = await this.migrateHowToItem(howToData);
                results.push({ ...result, fileName });
            }

            return {
                success: true,
                totalItems: howToFiles.length,
                migratedItems: results.filter(r => r.success).length,
                errors: results.filter(r => !r.success).map(r => r.error),
                details: results
            };
        });
    }

    private async migrateHowToItem(howToItem: HowToItem): Promise<MigrationItemResult> {
        try {
            if (!await this.validateAndLog(howToItem, 'howto')) {
                return { success: false, error: 'Validation failed' };
            }

            const contentId = await this.insertHowToContent(howToItem);

            // 迁移步骤
            await this.migrateSteps(contentId, howToItem.steps);

            // 迁移关系
            await this.relationshipMapper.mapContentRelationships(
                contentId,
                howToItem.frontmatter.related,
                'howto'
            );

            // 迁移mentions关系
            if (howToItem.frontmatter.mentions) {
                await this.relationshipMapper.mapContentRelationships(
                    contentId,
                    howToItem.frontmatter.mentions,
                    'mentions'
                );
            }

            // 迁移SEO元数据
            await this.migrateSEOMetadata(contentId, howToItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async migrateSteps(contentId: number, steps: any[]): Promise<void> {
        for (let i = 0; i < steps.length; i++) {
            const step = steps[i];
            this.db.prepare(`
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
}

// Case数据迁移
export class CaseMigration extends EnhancedContentMigration {
    async migrate(): Promise<MigrationResult> {
        return this.migrateWithMonitoring('Case Migration', async () => {
            const caseData = await this.loadCaseData();
            const result = await this.migrateCaseItem(caseData);

            return {
                success: result.success,
                totalItems: 1,
                migratedItems: result.success ? 1 : 0,
                errors: result.success ? [] : [result.error],
                details: [result]
            };
        });
    }

    private async migrateCaseItem(caseItem: CaseItem): Promise<MigrationItemResult> {
        try {
            if (!await this.validateAndLog(caseItem, 'case')) {
                return { success: false, error: 'Validation failed' };
            }

            const contentId = await this.insertCaseContent(caseItem);

            // 迁移案例详细信息
            await this.migrateCaseDetails(contentId, caseItem);

            // 迁移关系
            await this.relationshipMapper.mapContentRelationships(
                contentId,
                caseItem.frontmatter.related,
                'case'
            );

            // 迁移SEO元数据
            await this.migrateSEOMetadata(contentId, caseItem.frontmatter);

            return { success: true, id: contentId };

        } catch (error) {
            return { success: false, error: error.message };
        }
    }

    private async migrateCaseDetails(contentId: number, caseItem: CaseItem): Promise<void> {
        const frontmatter = caseItem.frontmatter;

        this.db.prepare(`
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
}
```

### Phase 5: 服务层增强

```typescript
// 增强内容服务
export class EnhancedContentService extends ContentService {
    // 新增方法
    async getContentWithFullDetails(id: number): Promise<ContentWithFullDetails> {
        const cacheKey = `content_full_${id}`;
        return this.queryWithCache(cacheKey, async () => {
            const content = await this.getContentById(id);
            if (!content) throw new Error('Content not found');

            const [relationships, tools, terms, seo] = await Promise.all([
                this.getContentRelationships(id),
                this.getRelatedTools(id),
                this.getRelatedTerms(id),
                this.getSEOMetadata(id)
            ]);

            // 根据类型获取详细信息
            let details: any = {};
            if (content.type === 'howto') {
                details.steps = await this.getHowToSteps(id);
            } else if (content.type === 'case') {
                details.caseDetails = await this.getCaseDetails(id);
            }

            return {
                ...content,
                relationships,
                relatedTools: tools,
                relatedTerms: terms,
                seo,
                details
            };
        }, 30 * 60 * 1000); // 30分钟缓存
    }

    async getContentRelationships(id: number): Promise<ContentRelationship[]> {
        return this.db.prepare(`
            SELECT cr.*, ci.title as related_title, ci.type as related_type
            FROM content_relationships cr
            JOIN content_items ci ON cr.to_content_id = ci.id
            WHERE cr.from_content_id = ?
            ORDER BY cr.relationship_type, ci.title
        `).all(id);
    }

    async getRelatedTools(id: number): Promise<RelatedTool[]> {
        return this.db.prepare(`
            SELECT tool_url, relationship_type
            FROM content_tool_relationships
            WHERE content_id = ?
            ORDER BY relationship_type, tool_url
        `).all(id);
    }

    async getRelatedTerms(id: number): Promise<RelatedTerm[]> {
        return this.db.prepare(`
            SELECT ctr.term_slug, ctr.relationship_type, t.title as term_title
            FROM content_term_relationships ctr
            LEFT JOIN glossary_terms t ON ctr.term_slug = t.slug
            WHERE ctr.content_id = ?
            ORDER BY ctr.relationship_type, t.title
        `).all(id);
    }

    async searchContentAdvanced(options: AdvancedSearchOptions): Promise<ContentSearchResult> {
        const conditions: string[] = ['ci.status = "published"'];
        const params: any[] = [];

        // 高级搜索条件
        if (options.difficulty) {
            conditions.push('ci.difficulty = ?');
            params.push(options.difficulty);
        }

        if (options.industry) {
            conditions.push('ci.industry = ?');
            params.push(options.industry);
        }

        if (options.featured !== undefined) {
            conditions.push('ci.featured = ?');
            params.push(options.featured ? 1 : 0);
        }

        if (options.targetTool) {
            conditions.push('ci.target_tool = ?');
            params.push(options.targetTool);
        }

        if (options.tags && options.tags.length > 0) {
            const tagConditions = options.tags.map(() => 'ci.tags LIKE ?');
            conditions.push(`(${tagConditions.join(' OR ')})`);
            options.tags.forEach(tag => params.push(`%"${tag}"%`));
        }

        const whereClause = conditions.join(' AND ');

        // 获取总数
        const countQuery = `
            SELECT COUNT(*) as total
            FROM content_items ci
            WHERE ${whereClause}
        `;
        const { total } = this.db.prepare(countQuery).get(...params);

        // 获取分页数据
        const dataQuery = `
            SELECT ci.*,
                   CASE
                       WHEN ci.type = 'howto' THEN (SELECT COUNT(*) FROM howto_steps hs WHERE hs.content_id = ci.id)
                       ELSE 0
                   END as step_count
            FROM content_items ci
            WHERE ${whereClause}
            ORDER BY ${this.getOrderByClause(options.sortBy, options.sortOrder)}
            LIMIT ? OFFSET ?
        `;

        params.push(options.limit, options.offset);
        const items = this.db.prepare(dataQuery).all(...params);

        return {
            items,
            total,
            page: Math.floor(options.offset / options.limit) + 1,
            pageSize: options.limit,
            hasNext: options.offset + options.limit < total
        };
    }
}
```

### Phase 6: 数据验证和测试

```typescript
// 数据验证器
export class ContentDataValidator {
    async validateMigrationIntegrity(): Promise<ValidationResult> {
        const results = {
            contentCount: 0,
            relationshipsCount: 0,
            toolRelationshipsCount: 0,
            termRelationshipsCount: 0,
            stepsCount: 0,
            caseDetailsCount: 0,
            seoMetadataCount: 0,
            errors: [] as string[]
        };

        // 验证内容项
        results.contentCount = this.db.prepare('SELECT COUNT(*) FROM content_items').get().count;

        // 验证关系数据
        results.relationshipsCount = this.db.prepare('SELECT COUNT(*) FROM content_relationships').get().count;
        results.toolRelationshipsCount = this.db.prepare('SELECT COUNT(*) FROM content_tool_relationships').get().count;
        results.termRelationshipsCount = this.db.prepare('SELECT COUNT(*) FROM content_term_relationships').get().count;

        // 验证扩展数据
        results.stepsCount = this.db.prepare('SELECT COUNT(*) FROM howto_steps').get().count;
        results.caseDetailsCount = this.db.prepare('SELECT COUNT(*) FROM case_details').get().count;
        results.seoMetadataCount = this.db.prepare('SELECT COUNT(*) FROM seo_metadata').get().count;

        // 验证数据完整性
        this.validateContentItems(results);
        this.validateRelationships(results);
        this.validateSEOData(results);

        return results;
    }

    private validateContentItems(results: ValidationResult): void {
        // 检查必需字段
        const missingRequired = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM content_items
            WHERE slug IS NULL OR title IS NULL OR type IS NULL
        `).get().count;

        if (missingRequired > 0) {
            results.errors.push(`${missingRequired} content items missing required fields`);
        }

        // 检查slug唯一性
        const duplicateSlugs = this.db.prepare(`
            SELECT slug, COUNT(*) as count
            FROM content_items
            GROUP BY slug
            HAVING COUNT(*) > 1
        `).all();

        if (duplicateSlugs.length > 0) {
            results.errors.push(`Duplicate slugs found: ${duplicateSlugs.map(d => d.slug).join(', ')}`);
        }
    }

    private validateRelationships(results: ValidationResult): void {
        // 验证外键完整性
        const invalidContentRelationships = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM content_relationships cr
            LEFT JOIN content_items ci ON cr.to_content_id = ci.id
            WHERE ci.id IS NULL
        `).get().count;

        if (invalidContentRelationships > 0) {
            results.errors.push(`${invalidContentRelationships} invalid content relationships`);
        }
    }
}

// 性能测试
export class MigrationPerformanceTester {
    async runPerformanceTests(): Promise<PerformanceReport> {
        const report: PerformanceReport = {
            contentQueryTimes: [],
            relationshipQueryTimes: [],
            searchQueryTimes: [],
            averageResponseTime: 0,
            cacheHitRate: 0
        };

        // 测试内容查询性能
        for (let i = 0; i < 100; i++) {
            const start = Date.now();
            await this.contentService.getContentById(Math.floor(Math.random() * 10) + 1);
            report.contentQueryTimes.push(Date.now() - start);
        }

        // 测试关系查询性能
        for (let i = 0; i < 50; i++) {
            const start = Date.now();
            await this.contentService.getContentRelationships(Math.floor(Math.random() * 10) + 1);
            report.relationshipQueryTimes.push(Date.now() - start);
        }

        // 测试搜索性能
        for (let i = 0; i < 30; i++) {
            const start = Date.now();
            await this.contentService.searchContent({
                query: 'statistical',
                limit: 10,
                offset: 0
            });
            report.searchQueryTimes.push(Date.now() - start);
        }

        // 计算平均响应时间
        const allTimes = [
            ...report.contentQueryTimes,
            ...report.relationshipQueryTimes,
            ...report.searchQueryTimes
        ];
        report.averageResponseTime = allTimes.reduce((a, b) => a + b, 0) / allTimes.length;

        return report;
    }
}
```

---

## 📊 成功指标和验证标准

### 技术指标
- **数据完整性**: 100% 内容项成功迁移
- **关系完整性**: 95%+ 关系映射正确
- **查询性能**: <2ms 响应时间
- **缓存命中率**: >80%
- **错误率**: <0.5%

### 业务指标
- **内容丰富度**: SEO元数据覆盖率 100%
- **搜索准确性**: 相关性提升 40%+
- **用户体验**: 页面加载时间 <100ms
- **SEO表现**: 结构化数据完整性 100%

### 测试覆盖率
- **单元测试**: >90%
- **集成测试**: >80%
- **端到端测试**: 关键路径 100%

---

## 🚀 部署和监控计划

### 部署策略
1. **预发布环境**: 完整迁移和测试
2. **蓝绿部署**: 零停机时间迁移
3. **回滚机制**: 快速恢复能力
4. **监控告警**: 实时性能监控

### 监控指标
- **数据库性能**: 查询响应时间、连接数、缓存命中率
- **API性能**: 响应时间、错误率、吞吐量
- **用户体验**: 页面加载时间、交互响应时间
- **业务指标**: 内容访问量、搜索使用率、用户停留时间

---

**文档版本**: 1.0
**创建日期**: 2025-09-13
**预计工期**: 5天
**技术负责人**: 开发团队
**优先级**: 高