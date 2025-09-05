# Next.js 全栈部署（Cloudflare 优化）技术架构

id: FRS-NEXTJS-ARCH-001
---
id: FRS-NEXTJS-ARCH-001
owner: @product-owner
acceptance: docs/acceptance/nextjs-cloudflare-architecture.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 目的

该文档为你指定“前期准备部署在 Cloudflare 上”后的技术架构说明（Next.js-only）。文档以极小可验证交付物为导向，给出渲染策略、边缘部署组件、数据存储/导出、CI/CD、性能与合规控制点，以及下一步明确可交付动作。

## 简短计划与可验证交付物（Checklist）

1. 本文件：`specs/FRS/nextjs-cloudflare-architecture.md`（已生成） — 验证：文件存在。
2. `wrangler.toml` 与 Cloudflare Pages 配置草案（下步可选） — 验证：生成示例文件。
3. `specs/FRS/deployment-cloudflare.md`（部署步骤与 GitHub Actions 示例）— 验证：文件存在并可执行步骤。

请在我完成后 Review: Accept / Comment / Modify，或指定下一步（例如：生成 `wrangler.toml` 示例）。

## 目标与约束

- 使用 Next.js（SSG/SSR 混合）实现前端 UI 与后端 API（Next.js API Routes 或 Workers）。
- 托管优先使用 Cloudflare Pages + Pages Functions / Workers；静态资源与边缘缓存通过 Cloudflare CDN。 
- 计算逻辑优先在客户端执行；导出与需要后端参与的功能走边缘 API。 
- 合规：避免将 raw_input 发送到 analytics；导出须用户同意并短期存储（R2）。

## 架构概览（高层）

- 用户 => Cloudflare CDN/Edge => Cloudflare Pages（Next.js 页面）：SSG/ISR/Pages Functions（必要时 SSR）
- API & server logic => Cloudflare Workers / Pages Functions（短延迟，边缘执行）
- 文件存储（导出） => Cloudflare R2（对象存储）
- 短链、轻量状态 => Workers KV / Durable Objects（按需）
- 日志/可观测 => Cloudflare Logpush -> 目标（S3/GCS/BigQuery）或第三方（Logflare/Sentry）

## 组件选型与职责

1. Cloudflare Pages (Next.js)
   - 用于部署 Next.js 应用（SSG/ISR 支持）。Pages 在构建或 ISR 更新时生成静态页面，Pages Functions 支持边缘 SSR。 
   - 优点：原生静态 + 边缘函数，低运维；缺点：对自定义运行时有一定限制（但对 Next.js 足够）。

2. Cloudflare Workers / Pages Functions
   - 用作 API 路由（短延迟），处理：CSV 导出触发、短链解析、轻量验证、rate limiting（配合 Durable Objects）。

3. Cloudflare R2
   - 存储导出文件（CSV）、静态资源备份（非 CDN 缓存），使用受限短期 URL（签名或短链）。

4. Workers KV / Durable Objects
   - KV：短链映射、配置项缓存； Durable Objects：可选的单实例状态（例如 rate limiter）。

5. CI/CD
   - GitHub Actions -> Cloudflare Pages Deploy（Next.js build），并可在成功后触发 Lighthouse CI 报告上传到 artifacts。Worker/Functions 的部署使用 Wrangler（或 Pages 内置）。

6. Secrets & Environment
   - Cloudflare Pages environment variables（发布时注入），对于 Worker secrets 使用 Wrangler secrets 或 Pages secrets。不要在前端暴露敏感 key。

7. Observability
   - Cloudflare Logpush 导出到 GCS/S3/BigQuery 或使用第三方（Sentry + Logflare）；关键是结构化日志并不包含 raw_input。

## 渲染与 SEO 策略（Cloudflare 场景下的实践）

1. 工具页采用 SSG（getStaticProps）生成 HTML 与 JSON-LD（HowTo/FAQ/Breadcrumb），保证 GSC 抓取时可见。 
2. 使用 ISR 更新文档或内容调整；对于需要参数化的 share 链接，使用短链指向带示例 JSON-LD 的静态页面（避免搜索引擎抓取带参数的用户数据）。
3. 对于需要 SSR 的少数页面（例如需要基于地理位置调整的内容），使用 Pages Functions 或在 edge 做轻量渲染。

## API 路由与边缘实现建议

建议采用 Cloudflare Workers / Pages Functions 替代传统后端（保持 Next.js 全栈一致）：

- POST /api/mean -> Worker / Pages Function：校验 payload（numbers[]）并返回结果（同时限制请求频率）。
- POST /api/export/csv -> Worker：接收请求，异步写入 R2（或触发 queue），返回 task id /短链（短期 URL）。
- GET /s/{shortId} -> Worker -> 解析 shortId (KV) -> 重定向到 canonical 或带参数的静态页面。 

注意：Next.js 的 API Routes 也可用于此，但把长时任务放在 Worker + R2 更节省资源并靠近用户边缘。

## 缓存策略与 CWV 优化

1. 静态页面：设置长期缓存并通过 CDN 缓存（Cache-Control: public, max-age=...），由 ISR 触发更新。
2. API 响应（计算类、非敏感）：可设置短时缓存（例如 30s–60s）以减轻边缘负载；对含用户具体输入的响应不要缓存。 
3. Critical 渲染资源：inline critical CSS，延迟第三方脚本，使用 next/image 与 Cloudflare Image Resizing（如启用）减少 LCP。 

## 安全、隐私与合规要点（Cloudflare 特有建议）

1. Consent：在页面首次可交互前呈现隐私/consent banner（阻止 GA4 在无同意下发送事件）。
2. 不将 raw_input 写入日志或发送到 GA4；仅发送抽象化事件（input_count, tool, precision）。
3. 日志导出：若需将 Cloudflare Logs 导出到 GCP（BigQuery），请在 Logpush 配置中选定字段并在目标端应用数据最小化策略。 
4. 数据驻留：Cloudflare 可配置 Logpush 目标地点；如需中国本地化，需评估 R2/Workers 的可用性与法规。 

## 运营与成本估算（粗略）

- Cloudflare Pages 主站部署成本：低（按用量）；Pages Functions / Workers 有执行次数费用（视流量）。
- R2 存储按存储量计费（适合短期导出文件）。
- 建议先用免费额度/低配进行 MVP 试验；监测热点 API 并调整 rate limit。

## 可验证交付物（下步建议，单项选择）

请选择其中一个单一可交付物，我会立刻创建：

1. `wrangler.toml` 示例 + `package.json` script 建议（用于 Cloudflare Worker 部署）。
2. `specs/FRS/deployment-cloudflare.md` — 详细部署步骤（GitHub Actions 工作流、Pages 配置、R2/KV 设置、Logpush 配置）。
3. `specs/FRS/seo-templates.json` — 把 JSON-LD 模板导出（mean/stddev 示例），便于直接在 `getStaticProps` 中引用。 

---

我已把 Next.js + Cloudflare 的架构文件写入 `specs/FRS/nextjs-cloudflare-architecture.md`。请选择 `Proceed 1` / `Proceed 2` / `Proceed 3` 或 `Modify - <自定义>`，我将继续并把选中的交付物写入仓库。
