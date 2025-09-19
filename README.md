# Stat Tools - 部署与开发说明

这是 Stat Tools 仓库的快速启动与部署说明，支持 Vercel 零配置部署以及本地开发环境配置。

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript 5.1+
- **部署**: Vercel 零配置部署 / 本地开发
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

## 🚀 Vercel 部署指南

Vercel 是 Next.js 的官方推荐部署平台，提供零配置部署、全球 CDN、自动 HTTPS 等特性，是部署 Next.js 应用的最佳选择。

### 📋 前置条件

- [ ] GitHub 账号
- [ ] Vercel 账号（可使用 GitHub 登录）
- [ ] 项目代码已推送到 GitHub 仓库

### 🔧 第一步：准备项目

#### 1.1 检查项目结构

确保项目根目录包含以下文件：

```bash
stat-tools/
├── package.json          # 依赖配置
├── next.config.js       # Next.js 配置
├── vercel.json          # Vercel 配置（已创建）
├── src/                 # 源代码
├── data/                # 数据库文件（本地）
└── migrations/          # 数据库迁移文件
```

#### 1.2 验证 package.json 脚本

确保以下脚本存在：

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "typecheck": "tsc --noEmit"
  }
}
```

### 🌐 第二步：Vercel 账号设置

#### 2.1 注册 Vercel 账号

1. **访问 Vercel 官网**
   - 打开 https://vercel.com
   - 点击 "Sign Up"

2. **使用 GitHub 登录**
   - 选择 "Continue with GitHub"
   - 授权 Vercel 访问您的 GitHub 账号
   - 完成注册流程

#### 2.2 安装 Vercel CLI（可选）

```bash
# 全局安装 Vercel CLI
npm install -g vercel

# 验证安装
vercel --version

# 登录 Vercel
vercel login
```

### 📱 第三步：从 GitHub 部署

#### 3.1 在 Vercel 控制台创建项目

1. **导入 GitHub 仓库**
   - 登录 Vercel 控制台：https://vercel.com/dashboard
   - 点击 "New Project"
   - 选择 "Import Git Repository"
   - 找到并选择 `stat-tools` 仓库
   - 点击 "Import"

2. **项目基本配置**
   - **Project Name**: `stat-tools` 或自定义名称
   - **Framework Preset**: 自动检测为 "Next.js"
   - **Root Directory**: `/`（保持默认）
   - **Build Command**: `npm run build`（自动检测）
   - **Output Directory**: `.next`（自动检测）
   - **Install Command**: `npm install`（自动检测）

#### 3.2 配置环境变量

在部署前配置必要的环境变量：

1. **展开 "Environment Variables" 部分**

2. **添加生产环境变量**

   | 变量名 | 值 | 环境 |
   |--------|-----|------|
   | `NODE_ENV` | `production` | Production |
   | `NEXT_TELEMETRY_DISABLED` | `1` | All |
   | `DATABASE_URL` | `file:./data/statcal.db` | All |

   > **注意**：Vercel 是无服务器环境，我们需要适配数据库配置

3. **点击 "Deploy" 开始部署**

### ⚙️ 第四步：数据库适配 Vercel

由于 Vercel 是无服务器环境，项目已经创建了适配文件：

- `src/lib/db/vercel-db.ts` - Vercel 专用数据库工具
- 更新了 `src/lib/db/db-utils.ts` - 自动检测 Vercel 环境

### 🚀 第五步：首次部署

#### 5.1 触发部署

点击 "Deploy" 按钮开始首次部署：

1. **构建过程监控**
   - Vercel 会自动检测 Next.js 项目
   - 执行 `npm install` 安装依赖
   - 运行 `npm run build` 构建项目
   - 部署到全球 CDN

2. **部署状态检查**
   ```bash
   # 部署过程包含以下阶段：
   ✅ 克隆代码仓库
   ✅ 安装项目依赖
   ✅ 运行 Next.js 构建
   ✅ 优化静态资源
   ✅ 部署到全球边缘网络
   ✅ 生成预览 URL
   ```

#### 5.2 验证部署

1. **获取部署 URL**
   - 部署成功后，Vercel 会提供访问链接
   - 格式通常为：`https://stat-tools-xxx.vercel.app`

2. **功能测试**
   - 访问主页验证加载正常
   - 测试计算器功能：`/calculator/mean`
   - 检查页面响应速度和 SEO

### 🔧 第六步：配置自定义域名

#### 6.1 添加域名

1. **在 Vercel 项目设置中**
   - 进入项目 → "Settings" → "Domains"
   - 点击 "Add Domain"
   - 输入您的域名：`thestatscalculator.com`

2. **DNS 配置**
   ```bash
   # 方法1: CNAME 记录（推荐）
   CNAME  www  cname.vercel-dns.com
   
   # 方法2: A 记录
   A      @    76.76.19.61
   AAAA   @    2606:4700:90:0:f22e:fbec:5bed:a9b9
   ```

3. **SSL 证书**
   - Vercel 自动提供 SSL 证书
   - 支持自动续期

#### 6.2 域名验证

```bash
# 验证 DNS 配置
nslookup thestatscalculator.com

# 检查 SSL 证书
curl -I https://thestatscalculator.com
```

### 🔄 第七步：自动化部署

#### 7.1 Git 集成

Vercel 自动监听 GitHub 仓库变化：

1. **推送到 main 分支**
   ```bash
   git add .
   git commit -m "feat: 添加新功能"
   git push origin main
   ```

2. **自动触发部署**
   - 每次推送代码自动触发构建
   - 支持预览部署（PR 分支）
   - 生产部署（main 分支）

#### 7.2 部署预览

```bash
# 创建功能分支进行预览
git checkout -b feature/new-calculator
# 修改代码...
git push origin feature/new-calculator
# Vercel 会为此分支创建预览部署
```

### 📊 第八步：监控和分析

#### 8.1 Vercel Analytics

1. **启用分析**
   - 在项目设置中启用 "Analytics"
   - 查看页面访问量和性能指标

2. **速度洞察**
   - 监控 Core Web Vitals
   - 页面加载时间分析
   - 用户体验指标

#### 8.2 日志和调试

```bash
# 使用 Vercel CLI 查看日志
vercel logs

# 查看特定部署的日志
vercel logs [deployment-url]
```

### 🛠️ 故障排查指南

#### 常见问题及解决方案

1. **构建失败**
   ```bash
   # 检查 build 日志
   # 确保所有依赖正确安装
   # 验证 TypeScript 类型检查通过
   ```

2. **数据库相关错误**
   ```bash
   # Vercel 使用内存数据库
   # 确保 vercel-db.ts 正常工作
   # 检查迁移文件路径
   ```

3. **环境变量问题**
   ```bash
   # 在 Vercel 项目设置中检查环境变量
   # 确保 production 环境变量正确设置
   ```

4. **域名访问问题**
   ```bash
   # 检查 DNS 配置
   dig thestatscalculator.com
   
   # 验证 SSL 证书
   openssl s_client -connect thestatscalculator.com:443
   ```

### 📚 进阶配置

#### 设置 GitHub Actions CI/CD

创建 `.github/workflows/vercel-deploy.yml`：

```yaml
name: Vercel Deployment

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint
      - run: npm run typecheck
      - run: npm run build
      - run: npm test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v4
      - uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
          vercel-args: '--prod'
```

#### 性能优化配置

更新 `vercel.json`：

```json
{
  "functions": {
    "app/api/**": {
      "maxDuration": 30
    }
  },
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ],
  "redirects": [
    {
      "source": "/calculator",
      "destination": "/statistics-calculators",
      "permanent": true
    }
  ]
}
```

### 🎯 部署检查清单

完成部署后，请验证以下项目：

- [ ] ✅ 应用正常访问（主域名和 www）
- [ ] ✅ HTTPS 证书有效且自动续期
- [ ] ✅ 所有计算器功能正常工作
- [ ] ✅ 页面 SEO 元数据正确
- [ ] ✅ 响应速度良好（< 3秒）
- [ ] ✅ 移动端适配正常
- [ ] ✅ 自动部署正常工作
- [ ] ✅ 环境变量配置正确
- [ ] ✅ 错误页面正常显示
- [ ] ✅ Analytics 数据收集正常

### 💰 成本说明

**Vercel 免费计划限制：**
- 100GB 带宽/月
- 100 次部署/天
- 无服务器函数执行时间：10 秒
- 适合个人项目和小型应用

**升级到 Pro 计划：**
- 1TB 带宽/月
- 无限部署
- 60 秒函数执行时间
- 高级分析功能

### 📞 支持资源

- **Vercel 官方文档**: https://vercel.com/docs
- **Next.js 部署指南**: https://nextjs.org/docs/deployment
- **Vercel 社区**: https://github.com/vercel/vercel/discussions
- **Vercel Discord**: https://vercel.com/discord

---

**恭喜！** 您已经成功将 Stat Tools 部署到 Vercel 平台。应用现在享有全球 CDN 加速、自动 HTTPS、无服务器架构等企业级特性。

## 🔄 增量更新工作流

### 🎯 Vercel 部署特点

#### **无需手动数据库迁移**
- Vercel 无服务器环境每次函数调用都是全新实例
- `src/lib/db/vercel-db.ts` 自动初始化内存数据库
- 迁移文件在每次冷启动时自动执行

#### **完全自动化增量部署**
- 任何代码修改推送到 GitHub 自动触发部署
- 1-2 分钟内新版本全球上线
- 支持预览部署（PR 分支）和生产部署（main 分支）

### 📝 常见更新场景

#### **1. 内容更新**（最常见）

更新 FAQ、教程、案例研究等内容：

```bash
# 修改内容文件
edit migrations/006_seed_faq_content.sql
edit migrations/007_seed_howto_content.sql
edit migrations/008_seed_case_studies.sql

# 提交并推送
git add .
git commit -m "update: 更新FAQ和教程内容"
git push origin main

# ✅ Vercel 自动部署，内容立即更新
```

#### **2. 新增计算器功能**

添加新的统计计算器：

```bash
# 1. 更新数据库配置
edit migrations/003_seed_calculator_data.sql
# 添加新计算器到相应分组

# 2. 创建计算器页面
create src/app/calculator/new-tool/page.tsx
create src/components/calculator/NewToolCalculator.tsx

# 3. 添加相关文档
edit migrations/006_seed_faq_content.sql
# 添加相关FAQ

# 4. 提交部署
git add .
git commit -m "feat: 新增置信区间计算器"
git push origin main
```

#### **3. 数据库结构调整**

添加新表或修改现有结构：

```bash
# 创建新迁移文件
create migrations/009_add_user_preferences.sql

# 内容示例：
echo "-- Migration 009: Add User Preferences
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_session TEXT UNIQUE NOT NULL,
  favorite_calculators TEXT DEFAULT '[]',
  theme_preference TEXT DEFAULT 'light',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);" > migrations/009_add_user_preferences.sql

# 更新应用代码以使用新表
edit src/lib/db/user-preferences.ts

# 提交部署
git add .
git commit -m "feat: 添加用户偏好设置功能"
git push origin main
```

#### **4. 词汇表更新**

添加新的统计学术语：

```bash
# 在现有文件中添加新术语
edit migrations/004_seed_glossary_terms.sql

# 或创建新的词汇表迁移
create migrations/009_additional_glossary_terms.sql

git commit -m "update: 扩展统计学词汇表"
git push origin main
```

### 🚀 推荐工作流

#### **开发-测试-部署循环**

```bash
# 1. 本地开发和测试
npm run dev
# 在 http://localhost:3000 验证功能

# 2. 代码质量检查
npm run lint
npm run typecheck
npm run build

# 3. 提交代码
git add .
git commit -m "type: 简洁描述变更内容"

# 4. 推送到 GitHub
git push origin main

# 5. 监控部署
# 访问 https://vercel.com/dashboard 查看部署状态
# 新版本通常在 1-2 分钟内上线
```

#### **提交消息规范**

```bash
# 新功能
git commit -m "feat: 添加新的统计计算器"

# 内容更新  
git commit -m "update: 更新FAQ和教程内容"

# 错误修复
git commit -m "fix: 修复标准差计算精度问题"

# 文档更新
git commit -m "docs: 完善部署指南"

# 性能优化
git commit -m "perf: 优化数据库查询性能"
```

### 🔧 高级更新场景

#### **批量内容更新**

```bash
# 1. 创建内容更新脚本
create scripts/update-content.ts

# 2. 批量更新多个迁移文件
npm run update-content

# 3. 验证更新
git diff migrations/

# 4. 提交所有更改
git add migrations/
git commit -m "update: 批量更新所有教育内容"
git push origin main
```

#### **A/B测试新功能**

```bash
# 1. 创建功能分支
git checkout -b feature/new-calculator-ui

# 2. 开发新功能
edit src/components/calculator/

# 3. 推送分支
git push origin feature/new-calculator-ui

# 4. Vercel 自动创建预览部署
# 访问预览URL测试新功能

# 5. 合并到主分支
git checkout main
git merge feature/new-calculator-ui
git push origin main
```

### 📊 部署监控和回滚

#### **监控部署状态**

1. **Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 查看部署历史和状态
   - 监控性能指标

2. **GitHub Integration**
   - PR 状态检查
   - 自动预览部署链接
   - 部署成功/失败通知

#### **快速回滚**

```bash
# 方法1: Git 回滚
git revert HEAD
git push origin main
# Vercel 自动部署回滚版本

# 方法2: Vercel Dashboard 回滚
# 在 Vercel Dashboard 中选择之前的部署
# 点击 "Promote to Production"
```

### ⚡ 性能优化建议

#### **开发效率**

1. **本地缓存**
   ```bash
   # 使用本地数据库文件加速开发
   cp data/statcal.db data/statcal-backup.db
   ```

2. **分支策略**
   ```bash
   # 小改动直接推送main分支
   # 大功能使用feature分支
   git checkout -b feature/major-update
   ```

3. **批量提交**
   ```bash
   # 相关修改一起提交，减少部署次数
   git add migrations/ src/components/
   git commit -m "feat: 完整实现新计算器功能"
   ```

#### **部署优化**

1. **构建缓存**
   - Vercel 自动缓存 node_modules
   - 利用 Next.js 增量构建特性

2. **内容优化**
   - 压缩图片和静态资源
   - 利用 Vercel CDN 全球分发

### 🎯 最佳实践总结

#### **✅ 推荐做法**

- 频繁小量提交，每次专注单一功能
- 本地充分测试后再推送
- 使用语义化提交消息
- 利用预览部署测试新功能
- 定期检查 Vercel 性能指标

#### **❌ 避免事项**

- 不要在生产分支直接实验
- 避免一次提交过多无关变更
- 不要忽略构建错误和警告
- 避免频繁强制推送(force push)

#### **🚨 紧急情况处理**

```bash
# 发现问题立即回滚
git revert HEAD --no-edit
git push origin main

# 或在 Vercel Dashboard 快速回滚到稳定版本
```

通过这个工作流，您可以高效地维护和扩展 Stat Tools 应用，享受 Vercel 平台提供的现代化部署体验！

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
- **Vercel**: 无服务器部署平台

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

### Vercel 相关资源

- [Vercel 官方文档](https://vercel.com/docs)
- [Vercel GitHub](https://github.com/vercel/vercel)
- [Vercel 社区](https://vercel.com/discord)

### 常见问题

如遇到部署问题，请检查：

1. Node.js 版本是否为 20+
2. Vercel 环境变量是否正确配置
3. 项目构建是否通过 TypeScript 检查
4. GitHub 仓库权限是否正确