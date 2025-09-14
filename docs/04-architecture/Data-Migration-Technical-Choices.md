# 数据迁移：技术选择和依赖项

## 数据库技术栈

### 1. SQLite3 选择理由

**为什么选择 SQLite3？**

✅ **优势：**
- 无服务器，零配置
- 单文件数据库（易于备份/迁移）
- 内置全文搜索（FTS5）
- 符合 ACID 标准
- 对我们的数据规模（<10K 记录）具有出色的读取性能
- 无额外的基础设施成本
- 通过 `better-sqlite3` 提供 TypeScript 支持

❌ **限制：**
- 有限的写入并发性（对读密集型的 statcal 不是问题）
- 无内置复制（使用文件备份）
- 有限的用户管理（此应用不需要）

### 2. 库依赖项

```json
{
  "dependencies": {
    "better-sqlite3": "^9.6.0",      // Node.js 快速 SQLite3 驱动程序
    "sqlite": "^5.1.1",             // 备选：纯 JavaScript 驱动程序
    "sqlite3": "^5.1.6"             // 传统选项（较慢）
  },
  "devDependencies": {
    "@types/sqlite": "^3.1.11",    // TypeScript 定义
    "knex": "^3.1.0",               // 查询构建器（可选）
    "prisma": "^5.10.2",            // ORM（备选方案）
    "drizzle-orm": "^0.30.10"       // 轻量级 ORM（推荐）
  }
}
```

**推荐：** 使用 `better-sqlite3` + `drizzle-orm`

### 3. 迁移工具选项

#### 选项 A：自定义迁移脚本
```typescript
// scripts/migrate-data.ts
import Database from 'better-sqlite3';
import fs from 'fs';

export class DataMigrator {
    private db: Database.Database;

    constructor(dbPath: string) {
        this.db = new Database(dbPath);
        // 启用外键
        this.db.pragma('foreign_keys = ON');
    }

    async migrateAll() {
        await this.createSchema();
        await this.migrateCalculators();
        await this.migrateGlossary();
        await this.migrateContent();
        await this.createIndexes();
    }
}
```

**优点：**
- 对迁移过程的完全控制
- 无额外依赖
- 可以处理复杂的数据转换
- 易于调试和测试

**缺点：**
- 需要编写更多代码
- 需要手动处理边缘情况

#### 选项 B：基于 ORM 的迁移
```typescript
// 使用 Drizzle ORM
import { drizzle } from 'drizzle-orm/better-sqlite3';
import { migrate } from 'drizzle-orm/better-sqlite3/migrator';

const db = drizzle(sqlite);
await migrate(db, { migrationsFolder: 'drizzle' });
```

**优点：**
- 类型安全的模式定义
- 内置迁移系统
- 自动回滚支持

**缺点：**
- 学习曲线
- 对复杂迁移的灵活性较差

**推荐：** 从自定义脚本开始，考虑为未来的维护使用 Drizzle

## 实施架构

### 1. 数据库连接管理

```typescript
// src/lib/db/client.ts
import Database from 'better-sqlite3';
import path from 'path';

let dbInstance: Database.Database | null = null;

export function getDatabase(): Database.Database {
    if (dbInstance) return dbInstance;

    const dbPath = process.env.NODE_ENV === 'production'
        ? '/app/data/statcal.db'
        : path.join(process.cwd(), 'data', 'statcal.db');

    dbInstance = new Database(dbPath);

    // 性能优化
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('synchronous = NORMAL');
    dbInstance.pragma('cache_size = 1000');

    return dbInstance;
}

// 关闭时关闭连接
process.on('SIGINT', () => {
    dbInstance?.close();
    process.exit(0);
});
```

### 2. 服务层模式

```typescript
// src/lib/db/services/
export class DataService {
    protected db: Database.Database;

    constructor() {
        this.db = getDatabase();
    }
}

// 特定服务
export class CalculatorService extends DataService {
    async getCalculatorsByGroup() { /* ... */ }
}

export class GlossaryService extends DataService {
    async searchTerms(query: string) { /* ... */ }
}

export class ContentService extends DataService {
    async getHowToGuide(slug: string) { /* ... */ }
}
```

### 3. 迁移脚本结构

```
scripts/
├── migrate-data.ts           # 主要迁移脚本
├── migrations/
│   ├── 001-create-schema.ts  # 数据库模式
│   ├── 002-calculators.ts    # 计算器数据
│   ├── 003-glossary.ts       # 术语表术语
│   ├── 004-content.ts        # 操作指南/常见问题/案例内容
│   └── 005-topics.ts         # 主题关系
└── utils/
    └── migration-helpers.ts  # 通用迁移工具
```

## 性能考虑

### 1. 索引策略

```sql
-- 关键性能索引
CREATE INDEX idx_glossary_terms_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_terms_title ON glossary_terms(title);
CREATE INDEX idx_content_items_slug ON content_items(slug);
CREATE INDEX idx_content_items_type ON content_items(type_id);
CREATE INDEX idx_calculators_url ON calculators(url);
CREATE INDEX idx_term_categories_term_id ON term_categories(term_id);
CREATE INDEX idx_content_search_content ON content_search(content);
```

### 2. 查询优化

- 对重复查询使用预处理语句
- 为批量操作实现读取事务
- 使用 `json_group_array` 进行嵌套 JSON 输出
- 缓存频繁访问的数据

### 3. 内存管理

- 数据库连接池
- 流式处理大型结果集
- 使用 `better-sqlite3` 同步 API 以获得更好性能

## 备份和恢复策略

### 1. 数据库备份

```typescript
// scripts/backup-db.ts
import fs from 'fs';
import path from 'path';

export async function backupDatabase() {
    const source = path.join(process.cwd(), 'data', 'statcal.db');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backup = path.join(process.cwd(), 'backups', `statcal-${timestamp}.db`);

    fs.copyFileSync(source, backup);
    console.log(`数据库已备份至：${backup}`);
}
```

### 2. 自动化备份

```yaml
# .github/workflows/backup.yml
name: 数据库备份
on:
  schedule:
    - cron: '0 2 * * *'  # 每天凌晨 2 点

jobs:
  backup:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: 备份数据库
        run: |
          mkdir -p backups
          cp data/statcal.db backups/statcal-${{ github.run_number }}.db
      - name: 上传备份
        uses: actions/upload-artifact@v3
        with:
          name: database-backup
          path: backups/
```

## 迁移时间估计

### 第一阶段：设置（2 天）
- 安装依赖项
- 创建迁移脚本结构
- 设置测试数据库

### 第二阶段：模式实施（1 天）
- 创建所有表和关系
- 设置索引和 FTS5

### 第三阶段：数据迁移（2-3 天）
- 为每种数据类型编写迁移脚本
- 使用示例数据进行测试
- 处理边缘情况

### 第四阶段：服务集成（2-3 天）
- 更新 API 端点以使用数据库
- 实现缓存
- 性能优化

### 第五阶段：测试和部署（2 天）
- 端到端测试
- 性能基准测试
- 生产环境部署

**预估总时间：** 8-11 天

## 回滚计划

### 1. 快速回滚
- 保持 JSON 文件作为备份
- 将服务层恢复为从 JSON 读取
- 只需要代码部署

### 2. 数据库回滚
```bash
# 从备份恢复
cp backups/statcal-backup-YYYY-MM-DD.db data/statcal.db
```

### 3. 迁移回退策略
- 实现功能标志以在 JSON/DB 之间切换
- 迁移后监控错误
- 保持 JSON 同步脚本以备紧急回退

## 建议

1. **从 better-sqlite3 开始**以获得最佳性能
2. **使用自定义迁移脚本**以获得完全控制
3. **在迁移前实施全面备份**
4. **考虑 Drizzle ORM** 用于未来的模式更改
5. **迁移后密切监控性能**
6. **保持 JSON 文件**作为备份至少 1 个月

## 待讨论的后续步骤

1. **迁移方法：** 自定义脚本 vs ORM？
2. **时间线：** 何时安排迁移？
3. **资源：** 谁将实施和测试？
4. **回滚标准：** 什么条件会触发回滚？
5. **监控：** 如何验证迁移后的成功？