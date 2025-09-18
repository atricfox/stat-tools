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

## 🚀 Coolify + GitHub 完整部署指南

Coolify 是一个开源的自托管 PaaS 平台，类似于 Heroku 或 Vercel，但可以部署在自己的服务器上。本指南将从零开始详细说明部署流程。

### 📋 前置条件检查清单

在开始部署之前，请确保您具备以下条件：

- [ ] 一台运行 Ubuntu 20.04+ / CentOS 8+ 的服务器（至少 2GB RAM，20GB 存储）
- [ ] 服务器的 root 权限或 sudo 权限
- [ ] 域名（可选，可使用 IP 地址）
- [ ] GitHub 账号和要部署的仓库访问权限

### 🔧 第一步：在服务器上安装 Coolify

#### 1.1 连接到您的服务器

```bash
# 通过 SSH 连接到您的服务器
ssh root@YOUR_SERVER_IP
# 或者如果您使用非 root 用户
ssh username@YOUR_SERVER_IP
```

#### 1.2 更新系统包

```bash
# Ubuntu/Debian 系统
sudo apt update && sudo apt upgrade -y

# CentOS/RHEL 系统
sudo yum update -y
```

#### 1.3 安装 Docker

```bash
# Ubuntu/Debian 系统
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# 将当前用户添加到 docker 组（可选）
sudo usermod -aG docker $USER

# 启动并启用 Docker 服务
sudo systemctl start docker
sudo systemctl enable docker

# 验证安装
docker --version
```

#### 1.4 安装 Coolify

```bash
# 下载并运行 Coolify 安装脚本
curl -fsSL https://get.coolify.io -o get-coolify.sh
sudo sh get-coolify.sh

# 或者使用一键安装命令
curl -fsSL https://get.coolify.io | sudo bash
```

#### 1.5 验证 Coolify 安装

```bash
# 检查 Coolify 容器是否运行
docker ps | grep coolify

# 检查服务状态
systemctl status coolify
```

### 🌐 第二步：初始化 Coolify 设置

#### 2.1 访问 Coolify 界面

1. 打开浏览器，访问：`http://YOUR_SERVER_IP:8000`
2. 如果有域名，可以访问：`http://your-domain.com:8000`

#### 2.2 完成初始设置

1. **创建管理员账号**
   - 邮箱：输入您的邮箱地址
   - 用户名：选择一个管理员用户名
   - 密码：设置强密码（至少 8 位，包含数字和特殊字符）

2. **服务器设置**
   - 点击 "Servers" → "Add Server"
   - 选择 "This Server (localhost)"
   - 验证连接是否成功

3. **配置域名（可选但推荐）**
   - 进入 "Settings" → "Instance Settings"
   - 设置 "Instance FQDN"：`https://your-coolify-domain.com`
   - 如果没有域名，可以先使用 IP：`http://YOUR_SERVER_IP:8000`

### 🔗 第三步：连接 GitHub 仓库

#### 3.1 设置 GitHub 应用

1. **在 Coolify 中创建 GitHub 应用**
   - 进入 "Sources" → "Add Source"
   - 选择 "GitHub"
   - 点击 "Create GitHub App"

2. **在 GitHub 上授权应用**
   - Coolify 会自动跳转到 GitHub
   - 选择要授权的账号或组织
   - 选择仓库权限（可以选择所有仓库或特定仓库）
   - 点击 "Install & Authorize"

3. **验证连接**
   - 返回 Coolify，确认 GitHub 连接显示为 "Connected"
   - 在 "Sources" 页面应该能看到您的 GitHub 账号

#### 3.2 测试仓库访问

```bash
# 在 Coolify 服务器上测试 Git 克隆（可选验证步骤）
git clone https://github.com/YOUR_USERNAME/stat-tools.git /tmp/test-clone
ls /tmp/test-clone
rm -rf /tmp/test-clone
```

### 📱 第四步：创建新应用项目

#### 4.1 创建项目

1. **进入项目管理**
   - 点击左侧菜单 "Projects"
   - 点击 "Create Project"
   - 项目名称：`stat-tools`
   - 描述：`Statistics Calculator Tools`
   - 点击 "Create"

#### 4.2 添加应用

1. **创建新应用**
   - 在项目页面点击 "New Resource"
   - 选择 "Application"

2. **选择构建方式**
   - 选择 "Build from source code"
   - 点击 "Continue"

3. **配置源代码**
   - **Source**: 选择您的 GitHub 连接
   - **Repository**: 选择 `stat-tools` 仓库
   - **Branch**: 选择 `main`（或您的主分支）
   - **Build Pack**: 选择 "Node.js"
   - 点击 "Continue"

#### 4.3 基本应用设置

1. **应用信息**
   - **Name**: `stat-tools-app`
   - **Description**: `Statistics Calculator Application`
   - **Domain**: 留空（稍后配置）或输入自定义域名

2. **端口设置**
   - **Port**: `3000`
   - **Expose Port**: 启用
   - 点击 "Create Application"

### ⚙️ 第五步：详细配置应用

#### 5.1 环境变量配置

1. **进入环境变量设置**
   - 在应用页面点击 "Environment Variables" 标签页
   - 点击 "Add Variable"

2. **添加必需的环境变量**

   | 变量名 | 值 | 说明 |
   |--------|-----|------|
   | `NODE_ENV` | `production` | Node.js 环境 |
   | `PORT` | `3000` | 应用端口 |
   | `DATABASE_PATH` | `/data/statcal.db` | 数据库文件路径 |
   | `NEXT_TELEMETRY_DISABLED` | `1` | 禁用 Next.js 遥测 |
   | `NEXT_PUBLIC_SITE_URL` | `https://your-domain.com` | 网站公开 URL |

3. **保存环境变量**
   - 逐一添加每个环境变量
   - 每次添加后点击 "Save"

#### 5.2 构建配置

1. **进入构建设置**
   - 点击 "Build" 标签页

2. **配置构建命令**
   - **Install Command**: `npm ci`
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`

3. **高级构建设置**
   - **Base Directory**: `/`（根目录）
   - **Publish Directory**: `.next`
   - **Node.js Version**: `20` 或 `latest`

#### 5.3 持久化存储配置

1. **创建存储卷**
   - 点击 "Storages" 标签页
   - 点击 "Add Storage"
   - **Name**: `database-storage`
   - **Mount Path**: `/data`
   - **Host Path**: `/var/lib/coolify/applications/[app-id]/data`
   - 点击 "Add Storage"

2. **验证存储设置**
   - 确保存储卷显示为 "Active"
   - 这将确保数据库文件在重新部署时不会丢失

#### 5.4 域名配置（可选但推荐）

1. **添加自定义域名**
   - 点击 "Domains" 标签页
   - 点击 "Add Domain"
   - 输入您的域名：`your-stat-tools-domain.com`
   - 启用 "HTTPS" （推荐）
   - 点击 "Add Domain"

2. **DNS 配置**
   ```bash
   # 在您的 DNS 提供商处添加 A 记录
   # 类型: A
   # 名称: @ (或子域名)
   # 值: YOUR_SERVER_IP
   # TTL: 300
   ```

3. **SSL 证书**
   - Coolify 会自动为您的域名申请 Let's Encrypt SSL 证书
   - 等待几分钟让证书生效

### 🚀 第六步：部署应用

#### 6.1 首次部署

1. **开始部署**
   - 在应用主页点击 "Deploy" 按钮
   - 或者使用快捷键组合触发部署

2. **监控部署过程**
   - 点击 "Logs" 标签页查看实时部署日志
   - 部署过程大约需要 3-5 分钟

3. **部署阶段说明**
   ```bash
   # 部署过程包含以下阶段：
   ✅ 克隆仓库代码
   ✅ 安装 Node.js 依赖 (npm ci)
   ✅ 运行构建命令 (npm run build)
   ✅ 创建容器镜像
   ✅ 启动应用容器
   ✅ 健康检查
   ```

#### 6.2 验证部署成功

1. **检查应用状态**
   - 应用状态应显示为 "Running"（绿色）
   - CPU 和内存使用率应显示正常值

2. **访问应用**
   - 如果配置了域名：`https://your-domain.com`
   - 如果使用 IP：`http://YOUR_SERVER_IP:PORT`
   - 应该能看到 Stat Tools 主页

3. **测试功能**
   - 访问计算器页面：`/calculator/mean`
   - 检查数据库连接是否正常
   - 测试几个基本功能

### 🔄 第七步：设置自动部署

#### 7.1 配置 GitHub Webhooks

1. **在 Coolify 中启用自动部署**
   - 进入应用设置
   - 点击 "Source" 标签页
   - 启用 "Auto Deploy on Push"
   - 选择触发分支：`main`

2. **验证 Webhook**
   - 在 GitHub 仓库设置中检查 Webhooks
   - 应该有一个指向 Coolify 的 webhook

#### 7.2 测试自动部署

1. **推送代码变更**
   ```bash
   # 在本地进行小的代码修改
   echo "# 测试自动部署" >> README.md
   git add .
   git commit -m "test: 测试自动部署功能"
   git push origin main
   ```

2. **监控自动部署**
   - 在 Coolify 中查看部署是否自动触发
   - 检查部署日志确认成功

### 🔍 第八步：监控和维护

#### 8.1 设置监控

1. **启用健康检查**
   - 在应用设置中配置健康检查端点
   - 路径：`/api/health`
   - 间隔：30 秒

2. **配置警报（可选）**
   - 设置邮件通知
   - 配置 Slack/Discord 集成

#### 8.2 日常维护

1. **查看日志**
   ```bash
   # 在 Coolify 界面查看实时日志
   # 或通过 SSH 直接查看容器日志
   docker logs $(docker ps | grep stat-tools | awk '{print $1}')
   ```

2. **数据备份**
   ```bash
   # 备份数据库
   sudo cp /var/lib/coolify/applications/*/data/statcal.db /backup/statcal-$(date +%Y%m%d).db
   ```

### 🛠️ 故障排查指南

#### 常见问题及解决方案

1. **构建失败 - 依赖安装问题**
   ```bash
   # 检查 package.json 和 package-lock.json
   # 确保 Node.js 版本兼容（需要 20+）
   # 在构建设置中尝试清除缓存
   ```

2. **应用启动失败 - 端口冲突**
   ```bash
   # 检查端口配置是否为 3000
   # 确保没有其他服务占用该端口
   lsof -i :3000
   ```

3. **数据库连接失败**
   ```bash
   # 检查存储卷挂载是否正确
   # 验证 DATABASE_PATH 环境变量
   # 检查文件权限
   sudo ls -la /var/lib/coolify/applications/*/data/
   ```

4. **域名访问问题**
   ```bash
   # 检查 DNS 记录
   nslookup your-domain.com
   
   # 检查 SSL 证书
   curl -I https://your-domain.com
   ```

5. **内存不足**
   ```bash
   # 检查服务器内存使用
   free -h
   
   # 在 Coolify 中增加内存限制
   # 或升级服务器配置
   ```

### 📚 进阶配置

#### 设置 CI/CD 流水线

创建 `.github/workflows/coolify-deploy.yml`：

```yaml
name: Deploy to Coolify

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
      - name: Deploy to Coolify
        run: echo "Deployment triggered by webhook"
        # Coolify 会通过 webhook 自动部署
```

#### 性能优化设置

```bash
# 在 Coolify 中配置资源限制
CPU_LIMIT=1000m
MEMORY_LIMIT=1Gi
MEMORY_REQUEST=512Mi

# 启用应用缓存
CACHE_TTL=3600
USE_MEMORY_CACHE=true
```

### 🎯 部署检查清单

完成部署后，请按照以下清单验证：

- [ ] ✅ 应用状态显示为 "Running"
- [ ] ✅ 域名可以正常访问（如果配置了域名）
- [ ] ✅ SSL 证书有效（HTTPS 正常）
- [ ] ✅ 主页正常加载
- [ ] ✅ 计算器功能正常工作
- [ ] ✅ 数据库连接正常
- [ ] ✅ 自动部署配置正确
- [ ] ✅ 日志记录正常
- [ ] ✅ 健康检查通过
- [ ] ✅ 备份策略已设置

### 📞 支持资源

如果遇到问题，可以参考以下资源：

- **Coolify 官方文档**: https://coolify.io/docs
- **Coolify 社区论坛**: https://discord.gg/coolify
- **GitHub Issues**: https://github.com/coollabsio/coolify/issues
- **Next.js 部署文档**: https://nextjs.org/docs/deployment

---

**恭喜！** 您已经成功将 Stat Tools 部署到 Coolify 平台。应用现在可以通过自动化流程持续部署和更新。

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