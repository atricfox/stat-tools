# Stat Tools - 部署与开发说明

这是 Stat Tools 仓库的快速启动与部署说明，聚焦于 Cloudflare 首发（Pages + Workers + R2）以及如何在 CI 中使用 `wrangler` 发布 Worker。

## 技术栈

- **前端**: Next.js 15 + React 19 + TypeScript 5.1+
- **部署**: Cloudflare Pages + Workers + R2
- **运行时**: Node.js 20+ (开发), Edge Runtime (生产)
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

# 运行 Worker 单元测试
npm run test:worker

# 监听模式运行单元测试
npm run test:worker:watch
```

### 6. Worker 本地调试（可选）

```bash
# 需要安装 wrangler
npm install -g @cloudflare/wrangler

# 本地运行 Worker
npx wrangler dev src/workers/signed-url/index.mjs --env dev
```

## Cloudflare 部署（概要）

步骤概览：

1. 在 Cloudflare 控制台创建 Pages 项目并连接 GitHub 仓库。
2. 在 Cloudflare 控制台创建 R2 bucket（记录 bucket 名称）。
3. 在仓库中设置 GitHub Secrets：`CF_API_TOKEN`, `CF_ACCOUNT_ID`, （可选）`SIGN_SECRET`。
4. 在项目中使用 `wrangler publish` 发布 Worker 或通过 GitHub Actions 自动发布（仓库已包含 workflow 示例）。

### 重要的 GitHub Secrets

- `CF_API_TOKEN` — Cloudflare API Token（最小权限，包含 Workers 发布与 R2 权限，按需最小化）。
- `CF_ACCOUNT_ID` — Cloudflare Account ID（用于某些自动化操作）。
- `SIGN_SECRET` — Worker 用于 HMAC 的秘密（建议通过 `wrangler secret put SIGN_SECRET` 单独注入，而不是作为 GitHub Secret）。

设置 Secrets（在 GitHub 仓库页面）：

1. 打开仓库 → Settings → Secrets and variables → Actions → New repository secret。
2. 添加以下 secrets：

```text
CF_API_TOKEN
CF_PAGES_TOKEN
CF_ACCOUNT_ID
CF_PAGES_PROJECT
SIGN_SECRET (optional)
```

使用 gh CLI 添加（示例）:

```bash
# install gh: https://github.com/cli/cli#installation
gh auth login
gh secret set CF_API_TOKEN --body "<your-cf-api-token>"
gh secret set CF_PAGES_TOKEN --body "<your-pages-token>"
gh secret set CF_ACCOUNT_ID --body "<your-account-id>"
gh secret set CF_PAGES_PROJECT --body "<your-pages-project-name>"
# Optional: store SIGN_SECRET if you want CI to inject it into the worker
gh secret set SIGN_SECRET --body "<your-sign-secret>"
```

安全建议：

- 对于 `SIGN_SECRET`，更安全的方式是通过 `wrangler secret put` 手动注入到 Worker，以防 CI 日志或意外暴露。在需要由 CI 管理时，请把 `SIGN_SECRET` 标记为 Protected 并仅允许在受信任的分支/工作流中使用。 

### 使用 wrangler 部署（手动）

1. 登录 wrangler：

```bash
wrangler login
```

2. 在 `wrangler.toml` 中设置 `account_id` 与 `r2_buckets.export_bucket.bucket_name`，或使用 dashboard 创建绑定。

3. 设置 Worker secret（跨 shell 示例）：

在 macOS / Linux (bash / zsh)：

```bash
echo -n "your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

在 Windows PowerShell：

```powershell
[System.Text.Encoding]::UTF8.GetBytes("your-very-secure-secret") | wrangler secret put SIGN_SECRET
```

在 Windows cmd（简单示例，注意可能会包含换行）：

```cmd
echo|set /p="your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

4. 发布：

```bash
wrangler publish --name stat-tools-worker

### Sentry 配置（Pages 与 Workers）

生产建议启用服务端错误上报（Sentry）：

1) 使用脚本快速配置（推荐）

```bash
# 交互式注入 SIGN_SECRET、SENTRY_DSN，并可选配置 Pages 变量
scripts/setup-secrets.sh
```

2) 手动命令

Cloudflare Pages：

```bash
# Server-side secret
wrangler pages project secret put SENTRY_DSN --project-name "$CF_PAGES_PROJECT"

# Public variables (optional)
wrangler pages project variable put NEXT_PUBLIC_SENTRY_DSN --project-name "$CF_PAGES_PROJECT" --value "$YOUR_PUBLIC_DSN"
wrangler pages project variable put NEXT_PUBLIC_ENVIRONMENT --project-name "$CF_PAGES_PROJECT" --value "production"
```

Cloudflare Workers：

```bash
echo -n "$YOUR_SENTRY_DSN" | wrangler secret put SENTRY_DSN --env production
```

提示：DSN 不应写入版本库/配置文件，必须使用 `wrangler secret put` 或 Pages Secret 注入。
```

### CI / GitHub Actions（已包含示例）

仓库包含 `.github/workflows/deploy-wrangler.yml`，当你在仓库 Secrets 中设置 `CF_API_TOKEN` 后，push 到 `main` 会自动触发构建并执行 `wrangler publish`。

在 CI 中如果需要运行 Playwright E2E，请确保在 workflow 中运行：

```bash
npx playwright install --with-deps
npx playwright test
```

## Next.js 15 重要特性

本项目采用 Next.js 15，主要特性包括：

- **React 19 支持**: 自动集成最新的 React 19 特性
- **App Router**: 默认使用 App Router 架构
- **Turbopack**: 更快的开发构建体验
- **Server Components**: 支持 React Server Components
- **Edge Runtime**: 兼容 Cloudflare Pages Functions

## 环境要求

- **Node.js**: 20.x 或更高版本
- **npm**: 最新版本
- **Cloudflare Account**: 用于部署

## 📁 项目结构

```
stat-tools/
├── .github/workflows/     # GitHub Actions CI/CD
├── docs/                 # 项目文档
│   ├── acceptance/       # BDD 验收测试规范
│   └── audit/           # 仓库健康审计报告
├── specs/FRS/           # 功能需求规范文档
├── src/
│   └── workers/         # Cloudflare Workers 代码
│       └── signed-url/  # 签名 URL 服务
├── tests/               # 测试文件
│   ├── *.spec.ts        # Playwright E2E 测试
│   └── ci-smoke.sh      # CI 烟雾测试脚本
├── scripts/             # 构建和部署脚本
├── package.json         # 项目依赖和脚本
├── tsconfig.json        # TypeScript 配置
├── vitest.config.ts     # 单元测试配置
├── wrangler.toml        # Cloudflare Worker 配置
└── .eslintrc.json       # 代码检查规则
```

## 🤝 贡献指南

### 提交代码前检查清单

- [ ] 运行 `npm run lint` 通过代码检查
- [ ] 运行 `npm run format` 格式化代码
- [ ] 运行 `npm run typecheck` 通过类型检查
- [ ] 运行 `npm test` 通过所有测试
- [ ] 运行 `npm run test:worker` 通过单元测试
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
- `src/workers/signed-url/` — Worker 示例与 README，包含 R2 写入与签名 URL 的示例实现
- `docs/audit/` — 仓库健康状况审计报告

## 支持

如果需要我可以：

- 将 `wrangler.toml` 中的占位符替换为你的真实 `account_id` 与 `bucket_name`；
- 把 CI workflow 扩展为在成功部署后自动设置 Worker secrets（需要你把 secrets 存入 GitHub）；
- 在项目中集成更完善的签名 URL（使用 Cloudflare 推荐方法）和测试用例。
