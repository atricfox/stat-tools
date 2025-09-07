# VPS + Coolify 部署指南

id: FRS-DEPLOY-VPS-001
---
id: FRS-DEPLOY-VPS-001
owner: @product-owner
acceptance: docs/03-acceptance/03-deployment.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

版本：1.0

目标：提供完整的部署流程，将 Stat Tools Next.js 应用部署到 VPS 服务器上的 Coolify 平台，实现简化的生产级部署。

适用场景：适合需要完全控制部署环境、避免供应商锁定、可预测成本的团队。Coolify 提供类似 PaaS 的部署体验，但运行在自己的服务器上。

---

## 先决条件

- VPS 服务器（推荐 2 GB RAM，20GB 存储，Ubuntu 22.04 LTS）
- 已安装和配置的 Coolify 实例
- GitHub 仓库包含 Next.js 项目代码
- 域名并能配置 DNS 记录
- 本地已配置 Node.js 20+ 开发环境

## 系统拓扑

- VPS 服务器（计算资源和存储）
- Coolify（部署和管理平台）
- Docker 容器（Next.js 应用运行环境）
- Nginx/Traefik（反向代理和 SSL 终结）
- 本地文件系统（临时文件存储）
- Cron 任务（定期清理和维护）

## Coolify 访问权限配置

### 服务器访问
1. **SSH 密钥配置**：确保本地开发机器能通过 SSH 密钥访问 VPS
2. **Coolify 管理员账户**：使用管理员权限访问 Coolify Web 界面
3. **GitHub 集成**：在 Coolify 中配置 GitHub OAuth 或 Personal Access Token

### 权限最小化原则
- Coolify 仅需要读取 GitHub 仓库的权限
- 服务器上的应用容器运行在非特权用户下
- 环境变量和敏感配置通过 Coolify 安全存储

### 密钥管理
- GitHub Personal Access Token 存储在 Coolify 中
- SSL 证书由 Coolify 自动管理（Let's Encrypt）
- 应用环境变量通过 Coolify 界面安全配置

## Coolify 应用部署步骤

### 1. 创建新应用
1. 在 Coolify 控制台点击 "New Resource" -> "Application"
2. 选择 "Public Repository" 并输入 GitHub 仓库 URL
3. 配置基本信息：
   - 应用名称：`stat-tools`
   - 分支：`main`
   - 构建包：Node.js

### 2. 构建配置
```dockerfile
# Dockerfile (项目根目录)
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine AS builder
WORKDIR /app
COPY . .
COPY --from=deps /app/node_modules ./node_modules
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV production
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

COPY --from=builder --chown=nextjs:nodejs /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

USER nextjs
EXPOSE 3000
ENV PORT 3000
CMD ["npm", "start"]
```

### 3. 环境变量配置
在 Coolify 应用设置中添加：
```text
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
NODE_ENV=production
PORT=3000
# 其他必要的环境变量
```

## 文件存储配置

### 1. 容器存储挂载
在 Coolify 中配置持久存储：
```yaml
# docker-compose.yml 片段
volumes:
  - ./data/exports:/app/data/exports
  - ./data/logs:/app/data/logs
```

### 2. 临时文件管理
```javascript
// lib/fileManager.js
import path from 'path'
import fs from 'fs/promises'

const EXPORT_DIR = process.env.EXPORT_DIR || '/app/data/exports'
const MAX_FILE_AGE = 24 * 60 * 60 * 1000 // 24小时

export async function saveExportFile(filename, data) {
  const filePath = path.join(EXPORT_DIR, filename)
  await fs.writeFile(filePath, data)
  return filePath
}

export async function generateDownloadToken(filename) {
  const token = crypto.randomUUID()
  const expires = Date.now() + (60 * 60 * 1000) // 1小时有效
  // 存储 token 映射（可使用内存或文件）
  return { token, expires, filename }
}

export async function cleanupOldFiles() {
  const files = await fs.readdir(EXPORT_DIR)
  const now = Date.now()
  
  for (const file of files) {
    const filePath = path.join(EXPORT_DIR, file)
    const stats = await fs.stat(filePath)
    
    if (now - stats.mtime.getTime() > MAX_FILE_AGE) {
      await fs.unlink(filePath)
      console.log(`清理过期文件: ${file}`)
    }
  }
}
```

### 3. 定期清理任务
```bash
# 在 Coolify 中配置 Cron Job 或在应用中实现
# 每小时清理一次过期文件
0 * * * * node /app/scripts/cleanup.js
```

## API 路由实现

### 1. 导出 API 实现
```javascript
// pages/api/export/csv.js
import { saveExportFile, generateDownloadToken } from '../../../lib/fileManager'
import { validateExportRequest } from '../../../lib/validation'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    // 验证请求
    const { data, filename } = validateExportRequest(req.body)
    
    // 生成 CSV 内容
    const csvContent = generateCSV(data)
    
    // 保存文件
    const savedPath = await saveExportFile(filename, csvContent)
    
    // 生成下载令牌
    const { token, expires } = await generateDownloadToken(filename)
    
    res.status(200).json({
      success: true,
      download_url: `/api/download/${token}`,
      expires_at: new Date(expires).toISOString()
    })
  } catch (error) {
    console.error('Export error:', error)
    res.status(500).json({ error: 'Export failed' })
  }
}
```

### 2. 下载 API 实现
```javascript
// pages/api/download/[token].js
import { validateDownloadToken, getFilePath } from '../../../lib/fileManager'
import fs from 'fs'
import path from 'path'

export default async function handler(req, res) {
  const { token } = req.query
  
  try {
    // 验证令牌
    const fileInfo = await validateDownloadToken(token)
    if (!fileInfo) {
      return res.status(404).json({ error: 'File not found or expired' })
    }
    
    // 检查文件是否存在
    const filePath = getFilePath(fileInfo.filename)
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found' })
    }
    
    // 设置响应头
    res.setHeader('Content-Type', 'text/csv')
    res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.filename}"`)
    
    // 流式传输文件
    const fileStream = fs.createReadStream(filePath)
    fileStream.pipe(res)
  } catch (error) {
    console.error('Download error:', error)
    res.status(500).json({ error: 'Download failed' })
  }
}
```

### 3. 统计计算 API
```javascript
// pages/api/mean.js
import { validateNumbers, calculateMean } from '../../lib/calculations'

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  try {
    const { numbers, precision = 2 } = req.body
    
    // 输入验证
    const validNumbers = validateNumbers(numbers)
    if (validNumbers.length === 0) {
      return res.status(400).json({ error: 'No valid numbers provided' })
    }
    
    // 计算结果
    const result = calculateMean(validNumbers, precision)
    
    res.status(200).json({
      success: true,
      result: {
        mean: result.mean,
        count: result.count,
        sum: result.sum,
        steps: result.steps
      }
    })
  } catch (error) {
    console.error('Calculation error:', error)
    res.status(500).json({ error: 'Calculation failed' })
  }
}
```

### 4. 健康检查端点
```javascript
// pages/api/health.js
export default function handler(req, res) {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: process.env.npm_package_version || '1.0.0'
  })
}
```

### 5. Rate Limiting 中间件
```javascript
// lib/rateLimiter.js
const requests = new Map() // 生产环境可使用 Redis

export function createRateLimiter(windowMs = 60000, maxRequests = 100) {
  return (req, res, next) => {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress
    const now = Date.now()
    const windowStart = now - windowMs
    
    // 清理过期记录
    if (!requests.has(ip)) {
      requests.set(ip, [])
    }
    
    const userRequests = requests.get(ip).filter(time => time > windowStart)
    
    if (userRequests.length >= maxRequests) {
      return res.status(429).json({ error: 'Too many requests' })
    }
    
    userRequests.push(now)
    requests.set(ip, userRequests)
    
    next()
  }
}
```

## 日志与监控

### 1. 应用日志配置
```javascript
// lib/logger.js
class Logger {
  constructor() {
    this.isProduction = process.env.NODE_ENV === 'production'
  }
  
  log(level, message, data = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...data
    }
    
    if (this.isProduction) {
      console.log(JSON.stringify(logEntry))
    } else {
      console.log(`[${level.toUpperCase()}] ${message}`, data)
    }
  }
  
  info(message, data) { this.log('info', message, data) }
  warn(message, data) { this.log('warn', message, data) }
  error(message, data) { this.log('error', message, data) }
}

export const logger = new Logger()
```

### 2. Coolify 监控配置
在 Coolify 中启用：
- 容器健康检查
- 资源使用监控（CPU、内存、磁盘）
- 自动重启策略
- 日志轮转和保留策略

### 3. 告警设置
```javascript
// lib/monitoring.js
export function setupHealthCheck(app) {
  app.get('/health', (req, res) => {
    const healthcheck = {
      uptime: process.uptime(),
      message: 'OK',
      timestamp: Date.now(),
      env: process.env.NODE_ENV,
      memory: process.memoryUsage()
    }
    
    try {
      res.status(200).send(healthcheck)
    } catch (error) {
      healthcheck.message = error
      res.status(503).send(healthcheck)
    }
  })
}
```

## CI/CD 配置（GitHub Actions）

### 自动化部署流程
```yaml
# .github/workflows/deploy.yml
name: Deploy to VPS

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run type check
        run: npm run typecheck
      
      - name: Run linting
        run: npm run lint
      
      - name: Build application
        run: npm run build
      
      - name: Run E2E tests (optional)
        run: |
          npx playwright install --with-deps
          npx playwright test

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Deploy to Coolify
        run: |
          # Coolify 会自动检测到 Git 推送并触发部署
          echo "Deployment triggered via Git push"
          
      - name: Health Check
        run: |
          sleep 60  # 等待部署完成
          curl -f ${{ secrets.APP_URL }}/health || exit 1
```

### Coolify Webhook 配置
在 Coolify 应用设置中：
1. 启用 "Auto Deploy" 功能
2. 配置 GitHub Webhook（Coolify 自动生成）
3. 设置部署分支为 `main`
4. 配置构建命令和启动命令

## DNS 与自定义域
## 环境变量和密钥管理

### 1. Coolify 环境变量设置
在 Coolify 应用配置中添加以下环境变量：

```bash
# 应用配置
NODE_ENV=production
PORT=3000
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# 文件管理
EXPORT_DIR=/app/data/exports
MAX_FILE_AGE_MS=86400000

# 安全配置
TOKEN_SECRET=your-very-secure-token-secret
RATE_LIMIT_WINDOW_MS=60000
RATE_LIMIT_MAX_REQUESTS=100

# 其他必要配置
TZ=UTC
```

### 2. GitHub Secrets 配置
使用 GitHub CLI 设置 CI/CD 所需的密钥：

```bash
# 认证 GitHub CLI
gh auth login

# 设置应用 URL（用于健康检查）
gh secret set APP_URL --body "https://your-domain.com"

# 设置其他必要的密钥
gh secret set COOLIFY_WEBHOOK_SECRET --body "your-webhook-secret"
```

### 3. 密钥安全原则
- 所有敏感信息通过 Coolify 环境变量管理
- GitHub Secrets 仅用于 CI/CD 流程
- 定期轮换密钥和令牌
- 使用强随机生成的密钥

## DNS 和域名配置

### 1. DNS 记录配置
在域名提供商处添加 A 记录：
```
类型: A
名称: @ (或 www)
值: YOUR_VPS_IP_ADDRESS
TTL: 300
```

### 2. Coolify 域名绑定
1. 在 Coolify 应用设置中添加自定义域名
2. 选择 "Generate Let's Encrypt Certificate"
3. Coolify 将自动：
   - 配置 Nginx/Traefik 反向代理
   - 申请和安装 SSL 证书
   - 设置 HTTP 到 HTTPS 重定向

### 3. SSL 证书管理
Coolify 自动处理：
- Let's Encrypt 证书申请
- 证书自动续期
- HTTPS 强制重定向
- HSTS 头部设置

## 安全配置

### 1. 应用安全头部
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googletagmanager.com; style-src 'self' 'unsafe-inline'"
          }
        ]
      }
    ]
  }
}
```

### 2. 服务器安全
- 定期更新 VPS 系统和 Docker
- 配置防火墙只开放必要端口（22, 80, 443）
- 使用非 root 用户运行应用
- 启用自动安全更新

### 3. 数据保护
- 不在日志中记录用户敏感数据
- 临时文件定期清理
- 使用 HTTPS 强制传输加密
- 实施适当的 Rate Limiting

## 故障恢复和备份

### 1. 自动重启策略
Coolify 配置：
- 容器健康检查间隔：30秒
- 失败重试次数：3次
- 重启策略：always
- 优雅关闭超时：30秒

### 2. 备份策略
```bash
# 数据备份脚本
#!/bin/bash
BACKUP_DIR="/home/backup/stat-tools"
DATE=$(date +"%Y%m%d_%H%M%S")

# 备份应用数据
mkdir -p $BACKUP_DIR
tar -czf $BACKUP_DIR/data_$DATE.tar.gz /path/to/app/data

# 备份 Coolify 配置
docker exec coolify-db pg_dump coolify > $BACKUP_DIR/coolify_config_$DATE.sql

# 清理 7 天前的备份
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### 3. 监控告警
```javascript
// lib/monitoring.js
export function setupMonitoring() {
  // 内存使用监控
  setInterval(() => {
    const memUsage = process.memoryUsage()
    const memUsagePercent = (memUsage.heapUsed / memUsage.heapTotal) * 100
    
    if (memUsagePercent > 90) {
      logger.warn('High memory usage detected', { memUsagePercent })
    }
  }, 60000) // 每分钟检查
  
  // 错误率监控
  let errorCount = 0
  let requestCount = 0
  
  setInterval(() => {
    const errorRate = errorCount / requestCount
    if (errorRate > 0.05) { // 错误率超过 5%
      logger.error('High error rate detected', { errorRate, errorCount, requestCount })
    }
    errorCount = 0
    requestCount = 0
  }, 300000) // 每 5 分钟重置
}
```

### 4. 回滚策略
在 Coolify 中执行回滚：
1. 进入应用的 "Deployments" 页面
2. 选择上一个稳定版本
3. 点击 "Redeploy" 按钮
4. 监控健康检查确认回滚成功

也可以通过 Git 回滚：
```bash
# 回滚到上一个 commit
git revert HEAD
git push origin main
# Coolify 将自动部署回滚版本
```

## 错误处理与回滚建议（wrangler / Pages）

目标：在 CI 自动化部署或手动发布后尽快检测回归，并能在发现问题时迅速回滚到已知良好版本。

1) 部署前准备（减少回滚频率）

- 在 `main` 分支外先在 preview 环境部署（Deploy Previews / staging），运行完整 E2E 与性能 smoke tests。只有在 preview 通过时才合并到 `main`。
- 在 CI 中将构建产物与构建元数据（commit SHA、build timestamp）保存为 artifact，便于追踪与回滚。

2) 自动化 smoke test（强烈推荐）

- 在 CI 的部署阶段后立即运行一次轻量 smoke test（例如访问关键页面、调用 `/api/mean` 示例请求、检查导出端点返回 200）。
- 如果 smoke test 失败，则让 CI 报错并阻止后续步骤（例如不更新 `production` 标签或不标记部署为成功）。

示例（pseudo-CI step）:

```bash
# run health check
curl -f https://your-production-domain/health || exit 1
# call a sample API
curl -s -X POST https://your-production-domain/api/mean -H "Content-Type: application/json" -d '{"numbers":[1,2,3]}' | grep 'mean' || exit 1
```

3) 回滚方法（手动/半自动）

- Cloudflare Pages: 在 Pages 控制台的 Deployments 列表中选择上一个成功的部署并点击 Restore（这是最简单的回滚方式）。
- Workers: 通过重新发布上一个已知良好 commit/tag 来回滚。基本步骤：

```bash
# 在本地或 CI 环境中
git fetch --all --tags
git checkout <previous-good-sha-or-tag>
npm ci
npm run build
# 使用 wrangler 重新发布上一版本
wrangler publish --env production
```

4) 自动化回滚（可选、高级）

- 保持一个 `production` Git tag 指向当前生产版本。部署新版本前把新的 commit 存储为 `pending`，在 smoke tests 成功后移动 `production` 标签到新 commit；如果 smoke tests 失败，CI 可以自动重新 checkout `production` 指向的 commit 并执行 `wrangler publish`。
- 注意：自动化写 tag/force-push 以及在 CI 中执行 `wrangler secret put` 需要保护好仓库与 Secrets 的权限配置（建议仅在受限的保护分支与受控 runner 中执行）。

5) 数据/对象层面的恢复策略

- R2 对象通常是不可变的（新导出会写入新的 key）。若需要恢复到旧文件，直接重新发布旧版本或通过已知旧 key 重新生成签名链接。
- 对于 KV / Durable Objects 的重要元数据，保持变更的审计日志与备份（例如周期性把关键 KV 数据导出到外部存储）。

6) 监控与告警

- 在部署后的 15-30 分钟内，紧盯关键指标（错误率、LCP、API 95th latency）。若指标超阈，触发 Pager 或 Slack 通知并启动回滚流程。

小结：首选在 CI 中做好 preview->smoke->promote 的流水线，减少手动回滚；对于紧急情况，使用 Cloudflare Pages 控制台快速回滚，或通过重新发布上一个 commit 来恢复 Workers。

## 本地开发环境

### 1. 开发环境搭建
```bash
# 克隆项目
git clone <repository-url>
cd stat-tools

# 安装依赖
npm install

# 创建本地环境变量文件
cp .env.example .env.local

# 编辑环境变量
nano .env.local
```

### 2. 本地运行
```bash
# 开发模式
npm run dev

# 生产模式测试
npm run build
npm start

# 运行测试
npm test
npm run test:e2e
```

### 3. 本地调试工具
```javascript
// 开发环境专用的调试中间件
// middleware/debug.js
export function debugMiddleware(req, res, next) {
  if (process.env.NODE_ENV === 'development') {
    console.log(`${req.method} ${req.url}`, {
      body: req.body,
      query: req.query,
      headers: req.headers
    })
  }
  next()
}
```

## 参考资源

### 官方文档
- Coolify 文档: https://coolify.io/docs
- Next.js 部署指南: https://nextjs.org/docs/deployment
- Docker 最佳实践: https://docs.docker.com/develop/dev-best-practices/
- Let's Encrypt: https://letsencrypt.org/docs/

### 故障排除
#### 常见问题
1. **构建失败**: 检查 Node.js 版本和依赖版本兼容性
2. **SSL 证书问题**: 确认 DNS 解析正确，等待证书颁发
3. **健康检查失败**: 检查应用是否在配置的端口上监听
4. **文件权限问题**: 确认容器用户权限和挂载目录权限

#### 调试命令
```bash
# 查看应用日志
docker logs <container-id> --tail=100 -f

# 进入容器调试
docker exec -it <container-id> /bin/sh

# 检查健康状态
curl -f http://localhost:3000/health

# 检查证书状态
openssl s_client -connect your-domain.com:443 -servername your-domain.com
```

---

**部署完成后**：
1. 访问配置的域名验证部署成功
2. 运行健康检查确认所有 API 端点正常工作
3. 配置监控告警确保服务稳定运行
4. 定期检查和更新依赖以保持安全性
