# Stat Tools - 部署与开发说明

这是 Stat Tools 仓库的快速启动与部署说明，支持 Coolify 自建平台部署以及传统 Docker/Node.js 部署方式。

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript 5.1+
- **部署**: Coolify 自建平台 / Docker / Node.js
- **数据库**: SQLite (本地文件)
- **运行时**: Node.js 20+
- **测试**: Playwright (E2E + API 测试)

## 🚀 快速上手指南

### 前置要求
- Node.js 20+
- npm 最新版本
- Git

### 1. 克隆与安装

```bash
# 克隆仓库
git clone <repository-url>
cd stat-tools

# 安装依赖
npm install

# 生成 lockfile（如果不存在）
npm install --package-lock-only
```

### 2. 环境变量配置

```bash
# 快速创建环境变量文件
npm run setup:env

# 或手动复制
cp .env.example .env.local

# 编辑 .env.local 填入实际值
```

### 3. 开发环境启动

```bash
# 启动 Next.js 开发服务器
npm run dev

# 访问 http://localhost:3000
```

### 4. 代码质量工具

```bash
# 代码格式化
npm run format

# 代码检查
npm run lint

# 类型检查
npm run typecheck

# 文档检查
npm run docs-check
```

### 5. 测试

```bash
# 运行 E2E 测试
npm test

# 运行单元测试（如有）
npm run test:unit

# 监听模式运行单元测试
npm run test:watch
```

### 6. 构建生产版本

```bash
# 构建生产版本
npm run build

# 本地测试生产版本
npm start
```

## 文档与 Sprint 索引

- 需求与架构位于 `docs/` 目录。
- Sprint 计划：
  - Sprint 11 — Total Hub（Aggregated Navigation）：`docs/05-development/sprints/Sprint-11-Plan-Total-Hub-Aggregated-Navigation.md`
  - Sprint 12 — Glossary：`docs/05-development/sprints/Sprint-12-Plan-Glossary.md`（Issues: CSV/MD 同目录）
  - Sprint 13 — Internal Linking（HowTo + FAQ + Cases）：`docs/05-development/sprints/Sprint-13-Plan-Internal-Linking.md`（Issues: CSV/MD 同目录）
  - Sprint 14 — Legal Pages（About / Privacy / Terms）：`docs/05-development/sprints/Sprint-14-Plan-Legal-Pages.md`（Issues: CSV/MD 同目录）

## Coolify 部署指南

Coolify 是一个开源的自托管 PaaS 平台，类似于 Heroku 或 Vercel，但可以部署在自己的服务器上。

### 前置条件

- 已安装并配置好 Coolify 平台
- 已连接 GitHub/GitLab 仓库
- 服务器至少 2GB 内存

### Coolify 部署步骤

#### 1. 创建新应用

1. 登录 Coolify 控制台
2. 点击 "New Resource" → "Application"
3. 选择 "Node.js" 作为构建包
4. 连接您的 Git 仓库

#### 2. 配置环境变量

在 Coolify 应用设置中添加以下环境变量：

```bash
NODE_ENV=production
DATABASE_PATH=/data/statcal.db
NEXT_TELEMETRY_DISABLED=1
```

#### 3. 配置构建设置

在 Build 配置中：

- **Base Directory**: `/`
- **Build Command**: `npm ci && npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm ci`

#### 4. 配置运行设置

- **Start Command**: `npm start`
- **Port**: `3000`
- **Health Check Path**: `/api/health`

#### 5. 配置持久化存储

为 SQLite 数据库配置持久化存储：

1. 在 Coolify 中创建 Volume
2. 挂载路径: `/data`
3. 这将确保数据库在重新部署时不会丢失

#### 6. 部署应用

1. 点击 "Deploy" 按钮
2. 等待构建和部署完成
3. Coolify 会自动分配域名或使用自定义域名

### Docker 部署（可选）

如果您的 Coolify 支持 Docker Compose，可以使用以下配置：

```yaml
# docker-compose.yml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - DATABASE_PATH=/data/statcal.db
    volumes:
      - ./data:/data
    restart: unless-stopped
```

### Dockerfile 配置

```dockerfile
# Dockerfile
FROM node:20-alpine

WORKDIR /app

# 复制依赖文件
COPY package*.json ./

# 安装依赖
RUN npm ci --only=production

# 复制源代码
COPY . .

# 构建应用
RUN npm run build

# 创建数据目录
RUN mkdir -p /data

# 运行数据库迁移
RUN npm run db:migrate:slim

EXPOSE 3000

CMD ["npm", "start"]
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|---------|
| `NODE_ENV` | 运行环境 | `production` |
| `DATABASE_PATH` | SQLite 数据库路径 | `/data/statcal.db` |
| `PORT` | 应用端口 | `3000` |
| `NEXT_PUBLIC_SITE_URL` | 网站 URL | 自动检测 |

### 备份与恢复

#### 备份数据库

```bash
# 进入 Coolify 服务器
ssh your-server

# 备份数据库
cp /var/lib/coolify/applications/[app-id]/data/statcal.db /backups/statcal-$(date +%Y%m%d).db
```

#### 恢复数据库

```bash
# 恢复数据库
cp /backups/statcal-20240101.db /var/lib/coolify/applications/[app-id]/data/statcal.db
```

### 故障排查

1. **查看日志**
   - 在 Coolify 控制台查看应用日志
   - 或通过 SSH: `docker logs [container-id]`

2. **数据库权限问题**
   ```bash
   # 修复权限
   chown -R 1000:1000 /data
   ```

3. **内存不足**
   - 增加服务器内存
   - 或在 Coolify 中配置内存限制

### 性能优化

1. **启用缓存**
   ```bash
   CACHE_TTL=3600
   USE_MEMORY_CACHE=true
   ```

2. **配置 CDN**
   - 使用 Cloudflare 或其他 CDN 服务
   - 配置静态资源缓存

3. **数据库优化**
   ```bash
   # 定期优化数据库
   npm run db:optimize
   ```

### CI/CD 配置（GitHub Actions）

创建 `.github/workflows/deploy.yml`：

```yaml
name: Deploy to Coolify

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '20'
      - run: npm ci
      - run: npm run test
      - run: npm run build
      # Coolify 会自动通过 webhook 触发部署
```

## 数据库（瘦身方案）

项目已切换到精简版 SQLite 架构，所有 DDL 通过 migrations 管理，运行期不再创建/修改表结构。

- 核心表：`slim_content`、`slim_content_details`、`calculator_groups`、`calculators`、`glossary_terms`、`content_types_static`
- 兼容视图用于过渡：`v_content_items_legacy`、`v_howto_steps_from_details`、`v_case_details_from_details`
- 全文索引（可选）：`content_search`（FTS5）

常用命令：

```bash
# 迁移（幂等，可重复执行）
npm run db:migrate:slim

# 注入最小演示内容
npm run db:seed:content

# 重建全文索引（可选）
npm run db:fts:refresh
```

启用 FTS 搜索（可选）：

```bash
# 设置环境变量（任一即可）
export USE_FTS_SEARCH=1
# 或
export CONTENT_SEARCH_MODE=fts
```

注意事项：
- `initializeDatabase()` 仅负责打开连接与 PRAGMA，DDL 必须通过 `migrations/`。
- 首次启用 FTS 前建议先执行 `npm run db:fts:refresh`。
- 旧的增强内容服务已移除：`src/lib/services/enhanced-content*.ts`。

## Next.js 15 重要特性

本项目采用 Next.js 15，主要特性包括：

- **React 19 支持**: 自动集成最新的 React 19 特性
- **App Router**: 默认使用 App Router 架构
- **Turbopack**: 更快的开发构建体验
- **Server Components**: 支持 React Server Components
- **Edge Runtime**: 兼容边缘运行时

## 环境要求

- **Node.js**: 20.x 或更高版本
- **npm**: 最新版本
- **Coolify**: 自建 PaaS 平台（或 Docker）

## 📁 项目结构

```
stat-tools/
├── .github/workflows/     # GitHub Actions CI/CD
├── docs/                 # 项目文档
│   ├── acceptance/       # BDD 验收测试规范
│   └── audit/           # 仓库健康审计报告
├── specs/FRS/           # 功能需求规范文档
├── src/                 # 源代码
│   ├── app/             # Next.js App Router
│   ├── components/      # React 组件
│   └── lib/             # 工具库和服务
├── tests/               # 测试文件
│   ├── *.spec.ts        # Playwright E2E 测试
│   └── ci-smoke.sh      # CI 烟雾测试脚本
├── scripts/             # 构建和部署脚本
├── migrations/          # 数据库迁移文件
├── data/                # SQLite 数据库文件（本地）
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 配置
├── next.config.js       # Next.js 配置
├── Dockerfile           # Docker 容器配置
└── .eslintrc.json       # 代码检查规则
```

## 🤝 贡献指南

### 提交代码前检查清单

- [ ] 运行 `npm run lint` 通过代码检查
- [ ] 运行 `npm run format` 格式化代码
- [ ] 运行 `npm run typecheck` 通过类型检查
- [ ] 运行 `npm test` 通过所有测试
- [ ] 运行 `npm run test:unit` 通过单元测试（如有）
- [ ] 更新相关文档

### Git 工作流

```bash
# 创建功能分支
git checkout -b feature/your-feature-name

# 提交代码
git add .
git commit -m "feat: 添加新功能描述"

# 推送分支
git push origin feature/your-feature-name

# 创建 Pull Request
```

### 目录说明

- `specs/FRS/` — 产品需求与部署说明文档
- `tests/` — Playwright 测试模板与说明
- `src/` — Next.js 应用源代码
- `migrations/` — SQLite 数据库迁移脚本
- `docs/audit/` — 仓库健康状况审计报告

## 支持

### Coolify 相关资源

- [Coolify 官方文档](https://coolify.io/docs)
- [Coolify GitHub](https://github.com/coollabsio/coolify)
- [Coolify 社区](https://discord.gg/coolify)

### 常见问题

如遇到部署问题，请检查：

1. Node.js 版本是否为 20+
2. 数据库路径权限是否正确
3. 环境变量是否正确配置
4. 内存是否充足（建议 2GB+）