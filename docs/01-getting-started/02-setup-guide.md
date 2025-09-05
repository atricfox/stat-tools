# ⚙️ 环境搭建指南

## 📋 前置要求

- **Node.js**: 20.x 或更高版本
- **npm**: 最新版本  
- **Git**: 用于版本控制
- **Cloudflare账号**: 用于部署 (可选)

## 🚀 快速启动

### 1. 克隆项目

```bash
git clone <repository-url>
cd stat-tools
```

### 2. 安装依赖

```bash
npm install

# 生成 lockfile（如果不存在）
npm install --package-lock-only
```

### 3. 环境变量配置

```bash
# 快速创建环境变量文件
npm run setup:env

# 或手动复制模板
cp .env.example .env.local
```

编辑 `.env.local` 文件，配置必要的环境变量：

```env
# 基础配置
NEXT_PUBLIC_APP_NAME=Stat Tools
NEXT_PUBLIC_ENVIRONMENT=development

# Cloudflare配置 (部署时需要)
CF_ACCOUNT_ID=your-account-id
CF_API_TOKEN=your-api-token
```

### 4. 启动开发环境

```bash
# 启动 Next.js 开发服务器
npm run dev

# 访问 http://localhost:3000
```

## 🔧 开发工具配置

### VS Code 扩展推荐

创建 `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "ms-vscode.vscode-typescript-next",
    "bradlc.vscode-tailwindcss"
  ]
}
```

### Git Hooks

项目已配置 Husky + lint-staged，首次安装后会自动设置：

```bash
# 手动安装 hooks (通常自动执行)
npm run prepare
```

## 🧪 验证安装

### 运行测试套件

```bash
# 类型检查
npm run typecheck

# 代码检查
npm run lint

# 单元测试
npm run test:worker

# E2E 测试 (需要开发服务器运行)
npm test
```

### 检查文档

```bash
# 文档格式检查
npm run docs-check
```

## 🔧 Worker 本地调试

如需调试 Cloudflare Worker：

```bash
# 安装 wrangler CLI
npm install -g @cloudflare/wrangler

# 登录 Cloudflare
wrangler login

# 本地运行 Worker
npx wrangler dev src/workers/signed-url/index.mjs --env dev
```

## ⚠️ 常见问题

### Node.js 版本问题

确保使用 Node.js 20+：

```bash
node --version  # 应显示 v20.x.x
```

使用 nvm 管理 Node.js 版本：

```bash
nvm install 20
nvm use 20
```

### 依赖安装失败

清理缓存重新安装：

```bash
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

### 环境变量未生效

检查文件名是否正确：
- ✅ `.env.local`
- ❌ `.env.local.example`
- ❌ `env.local`

## 🔗 下一步

- [开发工作流](./03-development-workflow.md)
- [代码规范](../05-development/01-coding-standards.md)
- [部署指南](../05-development/03-deployment-guide.md)