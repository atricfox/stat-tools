# StatCal 数据迁移详细实施计划

## 📋 执行摘要

基于技术架构文档，本计划详细描述了将 StatCal 项目从 JSON 文件数据存储迁移到 SQLite3 数据库的完整实施方案。迁移旨在提升性能、数据完整性和可扩展性，为未来功能扩展奠定基础。

**预估时间：** 8-11 天
**风险等级：** 中等
**关键成功指标：** 数据完整性 100%、性能提升 ≥ 30%、零停机时间

---

## 🎯 项目目标

### 主要目标
- **性能优化：** 通过数据库索引和查询优化提升数据访问速度
- **数据完整性：** 实现数据库级别的约束和验证
- **可扩展性：** 为用户数据、分析功能等未来扩展做准备
- **维护性：** 简化数据备份、恢复和管理流程

### 技术目标
- 迁移约 100-200 条记录，包括术语表、计算器、内容项等
- 实现全文搜索功能（FTS5）
- 保持现有 API 接口兼容性
- 建立数据备份和恢复机制

---

## 📅 详细时间表

### 第 1 周：准备阶段 (3 天)

#### 第 1 天：环境准备
- **上午 (9:00-12:00)**
  - [ ] 安装 `better-sqlite3` 和相关依赖项
  - [ ] 创建开发环境数据库配置
  - [ ] 设置数据库连接池

- **下午 (13:30-17:30)**
  - [ ] 创建迁移脚本目录结构
  - [ ] 建立开发数据库实例
  - [ ] 准备测试数据集

#### 第 2 天：架构验证
- **上午 (9:00-12:00)**
  - [ ] 验证数据库架构设计
  - [ ] 创建表结构 SQL 脚本
  - [ ] 设置索引和 FTS5 虚拟表

- **下午 (13:30-17:30)**
  - [ ] 审查数据关系设计
  - [ ] 确认外键约束配置
  - [ ] 性能基线测试

#### 第 3 天：脚本开发
- **上午 (9:00-12:00)**
  - [ ] 开发数据库连接管理模块
  - [ ] 创建迁移基类和工具函数
  - [ ] 设置错误处理和日志记录

- **下午 (13:30-17:30)**
  - [ ] 编写数据验证脚本
  - [ ] 创建回滚机制
  - [ ] 单元测试框架搭建

### 第 2 周：实施阶段 (5 天)

#### 第 4 天：计算器迁移
- **上午 (9:00-12:00)**
  - [ ] 实现计算器分组迁移脚本
  - [ ] 迁移计算器工具数据
  - [ ] 验证分组关系完整性

- **下午 (13:30-17:30)**
  - [ ] 测试计算器数据访问
  - [ ] 性能基准测试
  - [ ] 修复发现的问题

#### 第 5 天：术语表迁移
- **上午 (9:00-12:00)**
  - [ ] 实现术语表迁移脚本
  - [ ] 处理分类和关系数据
  - [ ] 迁移相关链接信息

- **下午 (13:30-17:30)**
  - [ ] 验证术语关系完整性
  - [ ] 测试全文搜索功能
  - [ ] 优化搜索性能

#### 第 6 天：内容迁移
- **上午 (9:00-12:00)**
  - [ ] 实现内容类型迁移
  - [ ] 迁移操作指南和步骤
  - [ ] 处理元数据信息

- **下午 (13:30-17:30)**
  - [ ] 迁移主题数据和关系
  - [ ] 验证内容链接完整性
  - [ ] 内容搜索测试

#### 第 7 天：服务层集成
- **上午 (9:00-12:00)**
  - [ ] 更新数据访问服务层
  - [ ] 实现数据库查询服务
  - [ ] 集成缓存机制

- **下午 (13:30-17:30)**
  - [ ] 更新 API 端点
  - [ ] 保持向后兼容性
  - [ ] 接口性能测试

#### 第 8 天：优化和测试
- **上午 (9:00-12:00)**
  - [ ] 数据库性能优化
  - [ ] 查询优化和索引调整
  - [ ] 缓存策略实现

- **下午 (13:30-17:30)**
  - [ ] 全面端到端测试
  - [ ] 性能对比测试
  - [ ] 问题修复和优化

### 第 3 周：部署阶段 (3 天)

#### 第 9 天：预部署准备
- **上午 (9:00-12:00)**
  - [ ] 创建生产环境迁移脚本
  - [ ] 数据备份和验证
  - [ ] 部署流程测试

- **下午 (13:30-17:30)**
  - [ ] 回滚方案验证
  - [ ] 监控配置设置
  - [ ] 团队部署演练

#### 第 10 天：生产部署
- **晚上 22:00-02:00 (低流量时段)**
  - [ ] 执行完整数据备份
  - [ ] 运行生产环境迁移脚本
  - [ ] 验证数据完整性
  - [ ] 启动新服务实例
  - [ ] 执行健康检查

#### 第 11 天：监控和优化
- **全天**
  - [ ] 系统性能监控
  - [ ] 错误日志分析
  - [ ] 用户反馈收集
  - [ ] 必要的性能调整

---

## 🛠️ 详细实施步骤

### 1. 环境准备阶段

#### 1.1 依赖项安装
```bash
# 安装核心依赖
npm install better-sqlite3@^9.6.0
npm install drizzle-orm@^0.30.10

# 安装开发依赖
npm install -D @types/sqlite@^3.1.11
```

#### 1.2 项目结构创建
```
src/
├── lib/
│   ├── db/
│   │   ├── client.ts           # 数据库连接管理
│   │   ├── services/           # 数据服务层
│   │   │   ├── calculatorService.ts
│   │   │   ├── glossaryService.ts
│   │   │   └── contentService.ts
│   │   └── utils/              # 数据库工具函数
│   └── migration/              # 迁移相关
├── scripts/
│   ├── migrate-data.ts         # 主迁移脚本
│   ├── backup-db.ts            # 备份脚本
│   └── migrations/             # 具体迁移文件
└── tests/
    └── integration/            # 集成测试
```

#### 1.3 数据库初始化
```typescript
// scripts/init-db.ts
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

export function initializeDatabase(dbPath: string): Database.Database {
    const db = new Database(dbPath);

    // 启用外键约束
    db.pragma('foreign_keys = ON');

    // 性能优化配置
    db.pragma('journal_mode = WAL');
    db.pragma('synchronous = NORMAL');
    db.pragma('cache_size = 1000');
    db.pragma('temp_store = MEMORY');

    return db;
}
```

### 2. 数据迁移阶段

#### 2.1 计算器数据迁移
```typescript
// scripts/migrations/002-calculators.ts
export async function migrateCalculators(db: Database.Database) {
    console.log('开始迁移计算器数据...');

    // 读取原始数据
    const calculatorsData = JSON.parse(
        fs.readFileSync('data/calculators.json', 'utf8')
    );

    // 迁移分组
    for (const group of calculatorsData.groups) {
        const result = db.prepare(`
            INSERT OR REPLACE INTO calculator_groups
            (group_name, display_name, sort_order)
            VALUES (?, ?, ?)
        `).run(group.group_name, group.display_name, group.sort_order);

        console.log(`迁移分组: ${group.group_name} (ID: ${result.lastInsertRowid})`);
    }

    // 迁移计算器
    for (const group of calculatorsData.groups) {
        const groupId = db.prepare(`
            SELECT id FROM calculator_groups WHERE group_name = ?
        `).get(group.group_name);

        for (const item of group.items) {
            const result = db.prepare(`
                INSERT OR REPLACE INTO calculators
                (group_id, name, url, description, is_hot, is_new, sort_order)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `).run(
                groupId.id,
                item.name,
                item.url,
                item.description,
                item.is_hot ? 1 : 0,
                item.is_new ? 1 : 0,
                item.sort_order
            );

            console.log(`迁移计算器: ${item.name} (ID: ${result.lastInsertRowid})`);
        }
    }

    console.log('计算器数据迁移完成');
}
```

#### 2.2 术语表数据迁移
```typescript
// scripts/migrations/003-glossary.ts
export async function migrateGlossary(db: Database.Database) {
    console.log('开始迁移术语表数据...');

    const glossaryData = JSON.parse(
        fs.readFileSync('data/glossary.json', 'utf8')
    );

    // 创建唯一分类集合
    const allCategories = new Set<string>();
    glossaryData.terms.forEach(term => {
        term.categories.forEach(cat => allCategories.add(cat));
    });

    // 迁移分类
    for (const category of allCategories) {
        const displayName = category
            .replace(/-/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());

        db.prepare(`
            INSERT OR IGNORE INTO categories (name, display_name)
            VALUES (?, ?)
        `).run(category, displayName);
    }

    // 迁移术语
    for (const term of glossaryData.terms) {
        // 插入术语
        const termResult = db.prepare(`
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

        const termId = termResult.lastInsertRowid;

        // 链接分类
        for (const category of term.categories) {
            const categoryId = db.prepare(`
                SELECT id FROM categories WHERE name = ?
            `).get(category);

            if (categoryId) {
                db.prepare(`
                    INSERT OR IGNORE INTO term_categories (term_id, category_id)
                    VALUES (?, ?)
                `).run(termId, categoryId.id);
            }
        }

        // 处理"参见"关系
        for (const relatedTerm of term.seeAlso || []) {
            const relatedId = db.prepare(`
                SELECT id FROM glossary_terms WHERE slug = ?
            `).get(relatedTerm);

            if (relatedId) {
                db.prepare(`
                    INSERT OR IGNORE INTO term_relationships
                    (from_term_id, to_term_id, relationship_type)
                    VALUES (?, ?, 'see_also')
                `).run(termId, relatedId.id);
            }
        }

        // 链接相关工具
        for (const toolUrl of term.relatedTools || []) {
            const calculator = db.prepare(`
                SELECT id FROM calculators WHERE url = ?
            `).get(toolUrl);

            if (calculator) {
                db.prepare(`
                    INSERT OR IGNORE INTO term_calculator_links (term_id, calculator_id)
                    VALUES (?, ?)
                `).run(termId, calculator.id);
            }
        }
    }

    console.log('术语表数据迁移完成');
}
```

#### 2.3 服务层更新
```typescript
// src/lib/db/services/calculatorService.ts
export class CalculatorService {
    private db: Database.Database;

    constructor() {
        this.db = getDatabase();
    }

    async getCalculatorGroups(): Promise<CalculatorGroup[]> {
        return this.db.all(`
            SELECT g.*,
                   json_group_array(
                       json_object(
                           'id', c.id,
                           'name', c.name,
                           'url', c.url,
                           'description', c.description,
                           'is_hot', c.is_hot,
                           'is_new', c.is_new,
                           'sort_order', c.sort_order
                       )
                   ) as items
            FROM calculator_groups g
            LEFT JOIN calculators c ON g.id = c.group_id
            GROUP BY g.id
            ORDER BY g.sort_order
        `);
    }

    async getCalculatorsByCategory(category: string): Promise<Calculator[]> {
        return this.db.all(`
            SELECT c.* FROM calculators c
            JOIN calculator_groups g ON c.group_id = g.id
            WHERE g.group_name = ?
            ORDER BY c.sort_order
        `, [category]);
    }
}
```

### 3. 性能优化阶段

#### 3.1 缓存实现
```typescript
// src/lib/db/cache.ts
import NodeCache from 'node-cache';

const cache = new NodeCache({
    stdTTL: 300, // 5分钟缓存
    checkperiod: 60,
    useClones: false
});

export class CacheManager {
    static get<T>(key: string): T | undefined {
        return cache.get<T>(key);
    }

    static set<T>(key: string, value: T, ttl?: number): boolean {
        return cache.set(key, value, ttl);
    }

    static del(key: string): number {
        return cache.del(key);
    }

    static flush(): void {
        cache.flushAll();
    }
}

// 在服务中使用缓存
export class CachedCalculatorService extends CalculatorService {
    async getCalculatorGroups(): Promise<CalculatorGroup[]> {
        const cacheKey = 'calculator_groups';
        const cached = CacheManager.get<CalculatorGroup[]>(cacheKey);

        if (cached) {
            return cached;
        }

        const result = await super.getCalculatorGroups();
        CacheManager.set(cacheKey, result);
        return result;
    }
}
```

#### 3.2 搜索功能实现
```typescript
// src/lib/db/services/searchService.ts
export class SearchService {
    async searchContent(query: string, limit: number = 20): Promise<SearchResult[]> {
        return this.db.all(`
            SELECT
                'glossary' as type,
                g.id,
                g.title,
                g.short_description as description,
                g.slug
            FROM glossary_terms g
            JOIN content_search cs ON g.id = cs.rowid
            WHERE cs.content MATCH ?

            UNION ALL

            SELECT
                'content' as type,
                c.id,
                c.title,
                c.summary as description,
                c.slug
            FROM content_items c
            JOIN content_search cs ON c.id = cs.rowid
            WHERE cs.content MATCH ?

            LIMIT ?
        `, [query, query, limit]);
    }

    async getSearchSuggestions(query: string, limit: number = 5): Promise<string[]> {
        return this.db.all(`
            SELECT DISTINCT title
            FROM (
                SELECT title FROM glossary_terms WHERE title LIKE ?
                UNION
                SELECT title FROM content_items WHERE title LIKE ?
            )
            LIMIT ?
        `, [`${query}%`, `${query}%`, limit]).map(row => row.title);
    }
}
```

---

## ⚠️ 风险评估和缓解策略

### 1. 数据完整性风险

**风险描述：** 迁移过程中可能导致数据丢失或损坏

**缓解措施：**
- 迁移前创建完整数据备份
- 实施数据验证脚本，确保迁移前后数据一致性
- 使用事务确保原子性操作
- 保持原始 JSON 文件至少 1 个月

**应急方案：**
```bash
# 快速回滚到原始状态
cp backups/pre-migration-data.zip data/
# 恢复服务配置为使用 JSON 文件
```

### 2. 性能下降风险

**风险描述：** 新的数据库访问模式可能影响性能

**缓解措施：**
- 迁移前建立性能基线
- 实施查询优化和索引策略
- 使用缓存减少数据库访问
- 监控关键性能指标

**监控指标：**
- API 响应时间 (< 200ms)
- 数据库查询时间 (< 50ms)
- 内存使用量 (< 500MB)
- 错误率 (< 0.1%)

### 3. 服务中断风险

**风险描述：** 迁移过程可能导致服务不可用

**缓解措施：**
- 在低流量时段执行迁移（凌晨 2-4 点）
- 实施蓝绿部署策略
- 准备快速回滚机制
- 设置健康检查端点

**部署窗口：**
- **时间：** 凌晨 2:00 - 4:00
- **预计停机时间：** < 5 分钟
- **回滚时间：** < 2 分钟

---

## 🧪 测试和验证方案

### 1. 数据完整性测试

#### 1.1 记录数量验证
```typescript
// tests/data-verification.test.ts
describe('数据完整性验证', () => {
    test('计算器记录数量一致', () => {
        const jsonCount = getJsonCalculatorCount();
        const dbCount = getDbCalculatorCount();
        expect(jsonCount).toBe(dbCount);
    });

    test('术语表记录数量一致', () => {
        const jsonCount = getJsonGlossaryCount();
        const dbCount = getDbGlossaryCount();
        expect(jsonCount).toBe(dbCount);
    });
});
```

#### 1.2 关系完整性测试
```typescript
// tests/relationship-verification.test.ts
describe('关系完整性验证', () => {
    test('所有术语都有有效分类', async () => {
        const invalidRelations = await db.all(`
            SELECT t.id, t.title
            FROM glossary_terms t
            LEFT JOIN term_categories tc ON t.id = tc.term_id
            WHERE tc.term_id IS NULL
        `);
        expect(invalidRelations).toHaveLength(0);
    });

    test('所有计算器都有有效分组', async () => {
        const invalidRelations = await db.all(`
            SELECT c.id, c.name
            FROM calculators c
            LEFT JOIN calculator_groups g ON c.group_id = g.id
            WHERE c.group_id IS NULL
        `);
        expect(invalidRelations).toHaveLength(0);
    });
});
```

### 2. 性能测试

#### 2.1 负载测试
```typescript
// tests/performance.test.ts
describe('性能测试', () => {
    test('计算器分组查询性能', async () => {
        const startTime = Date.now();
        await calculatorService.getCalculatorGroups();
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(100); // < 100ms
    });

    test('搜索性能', async () => {
        const startTime = Date.now();
        await searchService.searchContent('统计');
        const duration = Date.now() - startTime;
        expect(duration).toBeLessThan(200); // < 200ms
    });
});
```

#### 2.2 并发测试
```typescript
// tests/concurrency.test.ts
describe('并发测试', () => {
    test('并发读取性能', async () => {
        const promises = Array(100).fill(0).map(() =>
            calculatorService.getCalculatorGroups()
        );

        const startTime = Date.now();
        await Promise.all(promises);
        const duration = Date.now() - startTime;

        expect(duration).toBeLessThan(1000); // 100个并发请求 < 1s
    });
});
```

### 3. 集成测试

#### 3.1 API 兼容性测试
```typescript
// tests/api-compatibility.test.ts
describe('API 兼容性测试', () => {
    test('计算器 API 返回格式一致', async () => {
        const oldApiResponse = await getOldApiResponse('/api/calculators');
        const newApiResponse = await getNewApiResponse('/api/calculators');

        expect(newApiResponse.data).toEqual(oldApiResponse.data);
        expect(newApiResponse.status).toBe(200);
    });
});
```

---

## 📊 部署和监控计划

### 1. 部署清单

#### 部署前检查
- [ ] 完整数据备份已完成
- [ ] 所有测试通过
- [ ] 回滚脚本已准备
- [ ] 监控系统已配置
- [ ] 团队成员已就位
- [ ] 部署窗口已确认

#### 部署步骤
1. **备份执行 (22:00)**
   ```bash
   ./scripts/backup-db.ts
   ```

2. **数据库迁移 (22:15)**
   ```bash
   ./scripts/migrate-data.ts --production
   ```

3. **服务重启 (22:30)**
   ```bash
   pm2 restart statcal
   ```

4. **健康检查 (22:35)**
   ```bash
   curl -f https://statcal.com/health || exit 1
   ```

5. **数据验证 (22:40)**
   ```bash
   ./scripts/verify-data.ts
   ```

### 2. 监控指标

#### 关键指标监控
- **系统指标：** CPU、内存、磁盘使用率
- **应用指标：** 响应时间、错误率、吞吐量
- **数据库指标：** 查询时间、连接数、缓存命中率
- **业务指标：** 用户活跃度、功能使用率

#### 告警配置
```yaml
# monitoring/alerts.yml
alerts:
  - name: "高响应时间"
    condition: "response_time_p95 > 500ms"
    severity: "warning"

  - name: "高错误率"
    condition: "error_rate > 1%"
    severity: "critical"

  - name: "数据库连接问题"
    condition: "db_connections > 80%"
    severity: "critical"

  - name: "内存使用过高"
    condition: "memory_usage > 80%"
    severity: "warning"
```

### 3. 回滚计划

#### 快速回滚流程
1. **检测到问题 (23:00)**
2. **执行回滚脚本**
   ```bash
   ./scripts/rollback.sh
   ```
3. **重启原始服务**
   ```bash
   pm2 restart statcal-legacy
   ```
4. **验证服务恢复**
   ```bash
   curl -f https://statcal.com/health
   ```

#### 回滚脚本示例
```bash
#!/bin/bash
# scripts/rollback.sh

echo "开始回滚流程..."

# 停止新服务
pm2 stop statcal

# 恢复数据备份
cp backups/pre-migration-$(date +%Y-%m-%d).db data/statcal.db

# 重启旧服务（基于 JSON）
pm2 start statcal-legacy

# 验证服务
sleep 10
if curl -f https://statcal.com/health; then
    echo "回滚成功完成"
else
    echo "回滚失败，需要手动干预"
    exit 1
fi
```

---

## 📈 成功标准和后续计划

### 1. 成功标准

#### 技术指标
- [ ] 数据完整性 100%
- [ ] API 响应时间改善 ≥ 30%
- [ ] 搜索功能性能提升 ≥ 50%
- [ ] 系统稳定性 99.9%+
- [ ] 内存使用减少 ≥ 20%

#### 业务指标
- [ ] 用户满意度不下降
- [ ] 功能使用率保持稳定
- [ ] 加载时间明显改善
- [ ] 搜索准确性提升

### 2. 后续优化计划

#### 短期优化（迁移后 1 周）
- [ ] 性能监控和调优
- [ ] 用户反馈收集和处理
- [ ] 缓存策略优化
- [ ] 查询性能优化

#### 中期扩展（迁移后 1 月）
- [ ] 实现用户数据存储
- [ ] 添加使用统计功能
- [ ] 实现高级搜索功能
- [ ] 数据分析和报表功能

#### 长期规划（迁移后 3 月）
- [ ] 考虑数据库分片
- [ ] 实现读写分离
- [ ] 添加数据备份自动化
- [ ] 建立数据治理规范

---

## 📞 联系人和职责

### 核心团队
- **项目经理：** 负责整体协调和进度管理
- **技术负责人：** 负责技术决策和问题解决
- **数据库工程师：** 负责数据库设计和优化
- **前端工程师：** 负责 API 集成和测试
- **运维工程师：** 负责部署和监控

### 紧急联系
- **技术紧急联系人：** [电话/Slack]
- **运维紧急联系人：** [电话/Slack]
- **项目管理紧急联系人：** [电话/Slack]

---

*此计划将在项目执行过程中根据实际情况动态调整，确保项目成功交付。*