# Cloudflare 首发部署清单（Pages + R2 + Workers）

id: FRS-DEPLOY-CF-001
---
id: FRS-DEPLOY-CF-001
owner: @product-owner
acceptance: docs/acceptance/deployment-cloudflare.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

版本：0.1

目标：提供一组可执行步骤与权限清单，使 Stat Tools 能在 Cloudflare Pages 上首发，并使用 R2 存放导出文件、Workers/Pages Functions 处理短链与导出签名 URL、KV/Durable Objects 管理小元数据。

注意：本清单假设项目为 Next.js（framework-only），构建产物由 `npm run build` 生成。Pages Functions 与 Workers 可复用大部分 Node/JS 逻辑，但边缘环境对部分 Node 栈可能有限制（例如原生 fs /部分二进制依赖）。

---

## 先决条件

- 一个 Cloudflare 账户并拥有要部署的域名（或使用 Cloudflare 提供的 pages.dev 子域）。
- GitHub 仓库（或其他被 Cloudflare Pages 支持的 Git 提供商）。
- Cloudflare API Token（后述权限最小化说明）。
- 本地已配置 Node.js 开发环境以构建 Next.js 项目。

## 高层拓扑

- Cloudflare Pages（托管 statics / Next.js 构建）
- Cloudflare CDN（edge 缓存）
- Pages Functions / Workers（API 验证、CSV 导出控制、短链解析、签名 URL 生成）
- R2（导出文件对象存储）
- KV / Durable Objects（小规模元数据、rate-limiting 或短链映射）
- Logpush -> 外部日志目标（S3 / Datadog / LogDNA）

## 最小权限与 API Token（建议）

为 CI / Pages 创建两个最小权限的 API Token：

1. Pages Deployment Token（用于自动部署）
  - 权限：Account.Pages Read, Account.Pages Write
  - 用途：GitHub Actions 在构建完成后触发 Pages 部署。

2. Workers / R2 管理 Token（用于在 CI 或运维脚本中部署/管理 Workers 与 R2）
  - 权限：Zone.Workers Scripts, Account.R2: Read/Write（根据需要最小化）
  - 用途：在 CI 中使用 `wrangler` 发布 Workers 或 R2 绑定。生产环境建议只在受控运维账户或手动操作下使用。

生成 Token：Cloudflare 控制台 -> My Profile -> API Tokens -> Create Token。

保密：把 Token 存入 GitHub 仓库 Secrets（如 `CF_PAGES_TOKEN`, `CF_API_TOKEN`）。

## Cloudflare Pages - 快速部署步骤

1. 在 Cloudflare Pages 控制台点击 Create a project，连接 GitHub 仓库。
2. 设置构建设置：

```text
Framework preset: Next.js
Build command: npm run build
Build output directory: .next
```

3. 在 Environment Variables 中添加必要变量（例）：

```text
NEXT_PUBLIC_GA_MEASUREMENT_ID
CF_R2_BUCKET_NAME
# 仅 server-side secrets 不加 NEXT_PUBLIC 前缀
CF_API_TOKEN (存于 GitHub Actions Secrets)
```

4. 可选：启用 Deploy previews（对每个 PR 自动构建预览）。

## R2（导出文件）配置

1. 在 Cloudflare 控制台 -> R2 -> Create bucket（记录 bucket 名称）。
2. 在 Workers/Pages Functions 中绑定 R2：在 Pages 项目设置的 Functions 或在 wrangler.toml 中声明绑定。示例（wrangler）:

```toml
name = "stat-tools-worker"
type = "javascript"

[r2_buckets]
export_files = { binding = "EXPORT_BUCKET", bucket_name = "my-export-bucket" }
```

3. 推荐策略：导出文件写入 R2 并由 Worker 返回预签名 URL（短期有效，如 7 天）。签名 URL 可通过 Workers 使用帐户密钥或自签名策略实现。

## 生成签名 URL（Worker 示例概念）

下面是一个简化的示例：Worker 接收导出请求、在 R2 写入对象，然后返回一个基于时间戳与 HMAC 的签名链接（生产建议使用 Cloudflare 的 R2 signed URLs 或受支持库）：

```js
// ...伪代码
import crypto from 'crypto'

async function handler(req) {
  // 写入 R2
  await EXPORT_BUCKET.put(key, body)

  // 生成签名 token（简单 HMAC 示例，不是生产级）
  const expires = Date.now() + 7*24*60*60*1000
  const token = crypto.createHmac('sha256', SECRET).update(key + ':' + expires).digest('hex')
  const url = `https://example.r2.cloudflarestorage.com/${key}?expires=${expires}&token=${token}`
  return new Response(JSON.stringify({ url }), { status: 200 })
}
```

注意：上例为简化逻辑。建议使用 Cloudflare 推荐方式生成预签名 URL 或把真实下载流量通过 Workers 代理并在代理层验证签名。

## Pages Functions / Workers - API 路由建议

- `/api/mean`：server-side validation（轻量），返回 { mean, steps }。
- `/api/export/csv`：接收导出请求（需用户确认），生成文件写入 R2 并返回签名 URL。
- `/s/:short`：短链解析（可存于 KV 或 Durable Object），解析并重定向到 R2 签名 URL 或直接流式响应。

实现要点：

- 在边缘做大部分验证/计算。若运算或依赖不兼容，提供退回到 Node 运行时的路径（例如将该路由迁移到 Cloud Run / Vercel Serverless）。
- 对于长时间运行或 CPU 密集型任务（大文件生成），考虑异步任务流：将导出任务放到队列/外部 worker，然后通过 webhook /轮询完成。

## KV / Durable Objects 使用指南

- KV：适合小对象、非强一致性数据（例如 short -> objectKey 映射）。
- Durable Objects：适合需要强一致性或协同状态的场景（例如短链计数器、rate-limiter）。

## 日志与监控

- 启用 Cloudflare Logpush 将请求日志与自定义字段推送到 S3 / Datadog / LogDNA。
- 在应用中输出结构化日志（JSON），字段示例: event, tool, anonymized_id, input_count, error_code。
- 可选：集成 Sentry（通过 SDK 在边缘或 server-side 捕获异常）。

## CI (GitHub Actions) - Pages + Playwright 示例片段

在 `.github/workflows/deploy.yml` 中使用下面的简化示例：

```yaml
name: CI
on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install
        run: npm ci
      - name: Build
        run: npm run build
      - name: Install Playwright browsers (optional)
        run: npx playwright install --with-deps
      - name: Run Playwright tests (optional)
        run: npx playwright test --reporter=list
      - name: Deploy to Cloudflare Pages
        uses: cloudflare/pages-action@v1
        with:
          apiToken: ${{ secrets.CF_PAGES_TOKEN }}
          accountId: ${{ secrets.CF_ACCOUNT_ID }}
          projectName: "your-pages-project-name"

```

说明：在 CI 中运行 Playwright 需要安装浏览器依赖（`npx playwright install --with-deps`）。若 CI 运行失败可把 E2E 设为可选步骤，仅在特定分支或手动触发时运行。

## DNS 与自定义域
## 设置 Secrets（wrangler 与 GitHub CLI 示例）

在本地或 CI 中管理 secrets 有两种常见方式：

- 通过 `wrangler secret put` 注入到 Worker（适用于单独管理 Worker secrets，不放入 GitHub Secrets）。
- 通过 GitHub 仓库 Secrets（适用于 CI 流程访问，例如 `CF_API_TOKEN`、`CF_PAGES_TOKEN` 等）。

跨 shell 示例（用于本地执行 `wrangler secret put SIGN_SECRET`）：

macOS / Linux (bash / zsh):

```bash
echo -n "your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

Windows PowerShell:

```powershell
[System.Text.Encoding]::UTF8.GetBytes("your-very-secure-secret") | wrangler secret put SIGN_SECRET
```

Windows cmd (注意可能会包含换行)：

```cmd
echo|set /p="your-very-secure-secret" | wrangler secret put SIGN_SECRET
```

使用 `gh` CLI 在 GitHub 中添加仓库 Secrets（示例）：

```bash
gh auth login
gh secret set CF_API_TOKEN --body "<your-cf-api-token>"
gh secret set CF_PAGES_TOKEN --body "<your-pages-token>"
gh secret set CF_ACCOUNT_ID --body "<your-account-id>"
gh secret set CF_PAGES_PROJECT --body "<your-pages-project-name>"
# Optional: store SIGN_SECRET if you want CI to inject it into the worker
gh secret set SIGN_SECRET --body "<your-sign-secret>"
```

安全建议：优先使用 `wrangler secret put` 为 Worker 注入高敏感度密钥（例如 `SIGN_SECRET`）；将 CI 访问用的 token（例如 `CF_API_TOKEN`、`CF_PAGES_TOKEN`）保存在 GitHub Secrets，并限制对这些 Secret 的使用与访问范围。

## DNS 与自定义域
1. 在 Cloudflare 注册或将域名加入 Cloudflare。
2. 在 Pages 项目中添加自定义域并完成 DNS 验证（CNAME / ALIAS）。
3. 启用自动 TLS（Cloudflare 管理证书）。

## 安全与合规要点（Cloudflare 视角）

- 使用 Cloudflare Access 或 Workers 验证保护管理界面/内部端点（如需要）。
- CSP、HSTS、同源策略在边缘返回合适头部（Pages/Worker 层注入）。
- 日志脱敏：不要把 raw_input 写入日志或外部 Logpush（仅记录摘要/哈希）。

## 运行时兼容性与回退

- 若在 Workers/Pages Functions 中遇到不兼容的库（例如大型原生依赖），考虑：
  1) 把该路由迁移到一个 Node 运行时（Cloud Run / Vercel Serverless）。
  2) 在 Workers 中实现一个代理到后端的轻量适配层。

## 迁移与回滚策略

- 每次部署都保留 history（Pages 自动管理）。若新部署导致回归，可快速回滚到上一个成功的 Pages 部署。对于 R2 对象和短链变更，保持向后兼容格式及 TTL 策略。

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

## 开发与本地调试建议

- 本地开发：`npm run dev`（Next.js dev server）并在 `wrangler dev` 或 `miniflare` 中运行 Workers 用于集成本地调试。示例：

```bash
# 在本地启动 Next.js
npm run dev

# 在另一个终端使用 wrangler 本地运行 Worker（需安装 wrangler）
npx wrangler dev --local
```

## 参考链接（必读）

- Cloudflare Pages docs: https://developers.cloudflare.com/pages/
- Cloudflare Workers docs: https://developers.cloudflare.com/workers/
- R2 docs: https://developers.cloudflare.com/r2/
- Logpush docs: https://developers.cloudflare.com/logs/logpush/

---

如需，我可以：

- 生成 `wrangler.toml` 与示例 `worker` 代码片段以便直接部署 R2 绑定；
- 或把上面的 GitHub Actions workflow 细化为可直接复制的完整文件（并设置 secrets 列表）。

请选择下一步（Create wrangler.toml / Add full CI workflow / Finish）。
