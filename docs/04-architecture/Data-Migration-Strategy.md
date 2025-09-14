# 数据迁移策略：JSON 到 SQLite3

## 概述

本文档概述了将 `data/` 目录中的所有 JSON 数据文件迁移到 SQLite3 数据库的策略。

## 当前数据结构分析

### 1. 数据文件清单

| 文件 | 描述 | 关键字段 | 关系 |
|------|-------------|------------|---------------|
| `calculators.json` | 计算器分组和工具 | groups, items | 多对多：工具与分组 |
| `glossary.json` | 统计术语和定义 | terms | 自引用：seeAlso |
| `content-index.json` | 内容搜索索引 | content items | 链接到所有内容类型 |
| `topics/*.json` | 主题特定指南和常见问题 | guides, faqs | 链接到工具/内容 |
| `content/howto/*.json` | 操作指南内容 | frontmatter, steps | 链接到工具、术语 |

### 2. 数据量评估

- **术语表**: 约 20 个术语
- **计算器**: 约 15 个工具，分 4 个组
- **操作指南**: 约 4 个带步骤的指南
- **主题**: 多个主题文件，包含指南/常见问题
- **预估总记录数**: 约 100-200 条记录

## 建议的数据库架构

### 核心表

```sql
-- 计算器分组
CREATE TABLE calculator_groups (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 计算器/工具
CREATE TABLE calculators (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    group_id INTEGER REFERENCES calculator_groups(id),
    name TEXT NOT NULL,
    url TEXT UNIQUE NOT NULL,
    description TEXT,
    is_hot BOOLEAN DEFAULT FALSE,
    is_new BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 术语表术语
CREATE TABLE glossary_terms (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    short_description TEXT,
    definition TEXT NOT NULL,
    first_letter CHAR(1),
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 用于组织内容的分类
CREATE TABLE categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 术语-分类关系
CREATE TABLE term_categories (
    term_id INTEGER REFERENCES glossary_terms(id),
    category_id INTEGER REFERENCES categories(id),
    PRIMARY KEY (term_id, category_id)
);

-- 内容类型（操作指南、常见问题、案例）
CREATE TABLE content_types (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL
);

-- 内容项（操作指南、常见问题、案例研究）
CREATE TABLE content_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type_id INTEGER REFERENCES content_types(id),
    slug TEXT NOT NULL,
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT,
    status TEXT DEFAULT 'published',
    reading_time INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(type_id, slug)
);

-- 内容元数据
CREATE TABLE content_metadata (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id),
    meta_key TEXT NOT NULL,
    meta_value TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 操作指南步骤
CREATE TABLE howto_steps (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id),
    step_order INTEGER NOT NULL,
    step_id TEXT NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    tip TEXT,
    warning TEXT,
    UNIQUE(content_id, step_order)
);

-- 主题中心
CREATE TABLE topics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 主题-指南关系
CREATE TABLE topic_guides (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER REFERENCES topics(id),
    title TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    href TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 主题-常见问题关系
CREATE TABLE topic_faqs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    topic_id INTEGER REFERENCES topics(id),
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    href TEXT,
    sort_order INTEGER DEFAULT 0
);

-- 关系/链接表
CREATE TABLE term_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_term_id INTEGER REFERENCES glossary_terms(id),
    to_term_id INTEGER REFERENCES glossary_terms(id),
    relationship_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_term_id, to_term_id, relationship_type)
);

CREATE TABLE content_relationships (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_content_id INTEGER REFERENCES content_items(id),
    to_content_id INTEGER REFERENCES content_items(id),
    relationship_type TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(from_content_id, to_content_id, relationship_type)
);

CREATE TABLE content_calculator_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id),
    calculator_id INTEGER REFERENCES calculators(id),
    link_type TEXT DEFAULT 'related',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(content_id, calculator_id, link_type)
);

CREATE TABLE term_calculator_links (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    term_id INTEGER REFERENCES glossary_terms(id),
    calculator_id INTEGER REFERENCES calculators(id),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(term_id, calculator_id)
);

-- 全文搜索索引
CREATE VIRTUAL TABLE content_search USING fts5(
    title,
    content,
    tokenize='porter unicode61'
);

-- 维护搜索索引的触发器
CREATE TRIGGER content_search_insert
AFTER INSERT ON content_items
BEGIN
    INSERT INTO content_search (rowid, title, content)
    VALUES (new.id, new.title, new.content);
END;

CREATE TRIGGER content_search_delete
AFTER DELETE ON content_items
BEGIN
    DELETE FROM content_search WHERE rowid = old.id;
END;

CREATE TRIGGER content_search_update
AFTER UPDATE ON content_items
BEGIN
    DELETE FROM content_search WHERE rowid = old.id;
    INSERT INTO content_search (rowid, title, content)
    VALUES (new.id, new.title, new.content);
END;
```

## 迁移策略

### 第一阶段：数据库设置

1. **数据库初始化**
   - 创建 SQLite 数据库文件
   - 创建所有表及正确的关系
   - 设置性能索引
   - 创建 FTS5 虚拟表用于搜索

2. **种子初始数据**
   - 插入内容类型（'howto', 'faq', 'case'）
   - 插入默认分类
   - 设置初始计算器分组

### 第二阶段：数据迁移脚本

为每种数据类型创建迁移脚本：

1. **计算器迁移**
```typescript
// migrate-calculators.ts
export async function migrateCalculators(db: Database) {
    const calculatorsData = JSON.parse(fs.readFileSync('data/calculators.json', 'utf8'));

    // 先迁移分组
    for (const group of calculatorsData.groups) {
        await db.run(`
            INSERT OR REPLACE INTO calculator_groups
            (group_name, display_name, sort_order)
            VALUES (?, ?, ?)
        `, [group.group_name, group.display_name, group.sort_order]);
    }

    // 迁移计算器
    for (const group of calculatorsData.groups) {
        for (const item of group.items) {
            const groupId = await db.get(`
                SELECT id FROM calculator_groups WHERE group_name = ?
            `, [group.group_name]);

            await db.run(`
                INSERT OR REPLACE INTO calculators
                (group_id, name, url, description, is_hot, is_new, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [
                groupId.id,
                item.name,
                item.url,
                item.description,
                item.is_hot,
                item.is_new,
                item.sort_order
            ]);
        }
    }
}
```

2. **术语表迁移**
```typescript
// migrate-glossary.ts
export async function migrateGlossary(db: Database) {
    const glossaryData = JSON.parse(fs.readFileSync('data/glossary.json', 'utf8'));

    // 如果分类不存在则创建
    const allCategories = new Set<string>();
    glossaryData.terms.forEach(term => {
        term.categories.forEach(cat => allCategories.add(cat));
    });

    for (const cat of allCategories) {
        await db.run(`
            INSERT OR IGNORE INTO categories (name, display_name)
            VALUES (?, ?)
        `, [cat, cat.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())]);
    }

    // 迁移术语
    for (const term of glossaryData.terms) {
        await db.run(`
            INSERT OR REPLACE INTO glossary_terms
            (slug, title, short_description, definition, first_letter, updated_at)
            VALUES (?, ?, ?, ?, ?, ?)
        `, [
            term.slug,
            term.title,
            term.shortDescription,
            term.definition,
            term.firstLetter,
            term.updated
        ]);

        // 获取术语 ID
        const termId = await db.get(`
            SELECT id FROM glossary_terms WHERE slug = ?
        `, [term.slug]);

        // 链接分类
        for (const category of term.categories) {
            const categoryId = await db.get(`
                SELECT id FROM categories WHERE name = ?
            `, [category]);

            if (categoryId) {
                await db.run(`
                    INSERT OR IGNORE INTO term_categories (term_id, category_id)
                    VALUES (?, ?)
                `, [termId.id, categoryId.id]);
            }
        }

        // 处理关系
        // 相关术语（seeAlso）
        for (const relatedTerm of term.seeAlso || []) {
            const relatedId = await db.get(`
                SELECT id FROM glossary_terms WHERE slug = ?
            `, [relatedTerm]);

            if (relatedId) {
                await db.run(`
                    INSERT OR IGNORE INTO term_relationships
                    (from_term_id, to_term_id, relationship_type)
                    VALUES (?, ?, 'see_also')
                `, [termId.id, relatedId.id]);
            }
        }

        // 相关工具
        for (const toolUrl of term.relatedTools || []) {
            const calculator = await db.get(`
                SELECT id FROM calculators WHERE url = ?
            `, [toolUrl]);

            if (calculator) {
                await db.run(`
                    INSERT OR IGNORE INTO term_calculator_links (term_id, calculator_id)
                    VALUES (?, ?)
                `, [termId.id, calculator.id]);
            }
        }
    }
}
```

### 第三阶段：内容迁移

1. **操作指南内容迁移**
2. **常见问题内容迁移**
3. **案例研究迁移**
4. **主题数据迁移**

### 第四阶段：服务层更新

更新服务以使用数据库而不是 JSON 文件：

1. **数据访问层**
```typescript
// src/lib/db/services/calculatorService.ts
export class CalculatorService {
    async getCalculatorGroups(): Promise<CalculatorGroup[]> {
        const db = getDatabase();
        return db.all(`
            SELECT g.*,
                   json_group_array(
                       json_object('id', c.id, 'name', c.name, 'url', c.url,
                                  'description', c.description, 'is_hot', c.is_hot,
                                  'is_new', c.is_new, 'sort_order', c.sort_order)
                   ) as items
            FROM calculator_groups g
            LEFT JOIN calculators c ON g.id = c.group_id
            GROUP BY g.id
            ORDER BY g.sort_order
        `);
    }
}
```

2. **缓存策略**
   - 为频繁访问的数据实现 Redis 或内存缓存
   - 数据更新时缓存失效

3. **搜索实现**
   - 使用 SQLite FTS5 进行全文搜索
   - 实现相关性排序

## 迁移的好处

### 1. 性能改进
- 通过适当索引更快地访问数据
- 减少内存使用（无需加载整个 JSON 文件）
- 更好的查询优化

### 2. 数据完整性
- 数据库级别的模式验证
- 外键约束
- 原子事务

### 3. 可扩展性
- 更容易添加新的数据关系
- 更好地支持复杂查询
- 为未来功能做好准备（用户数据、分析）

### 4. 维护
- 结构化数据迁移
- 更容易的数据备份
- 更好的工具支持

## 实施计划

### 第 1 周：准备
- [ ] 审查并最终确定架构设计
- [ ] 设置开发数据库
- [ ] 创建迁移脚本结构
- [ ] 设置测试数据

### 第 2 周：实施
- [ ] 创建数据库初始化脚本
- [ ] 实现计算器迁移
- [ ] 实现术语表迁移
- [ ] 实现内容迁移

### 第 3 周：集成
- [ ] 更新服务层
- [ ] 实现缓存
- [ ] 更新 API 端点
- [ ] 测试和验证

### 第 4 周：部署
- [ ] 创建生产环境迁移脚本
- [ ] 备份现有数据
- [ ] 执行迁移
- [ ] 监控和优化

## 风险缓解

1. **数据丢失风险**
   - 保持 JSON 文件作为备份
   - 创建回滚脚本
   - 使用数据副本测试迁移

2. **停机风险**
   - 在低流量时段执行迁移
   - 如果可能使用蓝绿部署

3. **性能风险**
   - 迁移前后进行基准测试
   - 根据需要添加索引
   - 监控查询性能

## 后续步骤

1. **审查此架构设计**并提供反馈
2. **决定迁移方法**（手动脚本 vs 自动化工具）
3. **根据流量模式安排迁移窗口**
4. **为可能出现的问题准备回滚策略**