# 技术架构方案（文档）

id: FRS-TECH-ARCH-001
---
id: FRS-TECH-ARCH-001
owner: @product-owner
acceptance: docs/acceptance/technical-architecture.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 目的

本文件为仅文档交付：定义 Stat Tools MVP 的技术架构方案，覆盖前端/后端选型、部署拓扑、数据流、API 契约摘要、性能与安全 SLO、合规控制点，以及下一步最小可交付工作清单（每项为单一可验证交付物）。

请在我完成后 Review: Accept / Comment / Modify。下一步按你选择的最小交付物执行。

## 先决条件与约束（来自 MVP 核心目标）

1. 目标市场：英文全球用户，需移动优先的优秀 CWV（LCP ≤2s、CLS ≤0.1）。
2. 首发工具：Mean, Weighted Mean, GPA, StdDev, CI for Mean（首发 5 页）。
3. 必须保证计算正确性、可读的英文解释、SEO（JSON-LD）与 GA4 事件链路。 
4. 合规边界：GDPR + 中国网络安全法 + GCP 推荐部署；21 CFR Part 11 仅在处理受监管数据时生效（当前假设不适用）。

## 单页交付策略（小步快交）

每个交付物应为“单一可验证输出”：

1. 单模块 FRS（已开始） — 文件位于 `specs/FRS/*.md`。
2. SEO 模板 JSON（HowTo/FAQ/Breadcrumb/Organization 示例） — 文件 `specs/FRS/seo-templates.json`（建议下一步）。
3. 部署文档（GCP IAM/KMS/Logging） — `specs/FRS/deployment.md`。

## 总体架构选型（推荐 — Cloudflare-first, Next.js-only）

| 层级 | 推荐技术/服务 | 说明 |
|---:|---|---|
| Frontend | Next.js + TypeScript (SSG/SSR) | 使用 Next.js（仅使用 Next.js 框架，无额外后端平台）实现页面渲染与 JSON-LD 注入。对可静态化页面使用 SSG/ISR，需保留少量 SSR/Server-side props 用于 SEO 动态注入。|
| UI | React + Tailwind CSS | 轻量、可维护，便于无障碍与暗色模式实现。|
| Edge / CDN | Cloudflare Pages + Cloudflare CDN | 首发部署到 Cloudflare Pages，利用边缘缓存与低延迟分发提升全球 LCP。|
| API | Cloudflare Pages Functions / Workers (Edge) | 小型验证、计算和 CSV 导出控制由 Pages Functions / Workers 提供；可根据需要回退到 Node 运行时（在 Cloudflare Worker 不适合的场景）。|
| Storage | Cloudflare R2 + Durable Objects / KV | 导出文件和短链使用 R2；轻量元数据或短期计数可用 KV 或 Durable Objects。|
| Secrets & Keys | Cloudflare Pages Environment Variables / Workers Secrets | 使用 Cloudflare 内置机密管理（环境变量/Secrets）并限制控制台访问。|
| Logging/Monitoring | Cloudflare Logpush + Sentry (optional) | 使用 Logpush 将结构化日志送到外部仓库（例如 Datadog / LogDNA / S3），并在需要时接入 Sentry 以捕获异常与堆栈。|
| Analytics | GA4 (privacy-first config) | 前端仅发送摘要事件（input_count, tool, precision）；可选 server-side tagging 在受控环境中发送经过脱敏的事件。|

推荐理由（简短）：基于最新讨论，把首发部署目标锁定为 Cloudflare（Pages + Workers）能最小化运维、加速全球边缘体验，并保留 Next.js 的 SEO 能力。对于小体量的计算/导出工作，Pages Functions/Workers 在边缘即可满足延迟需求；R2 提供 S3 兼容的对象存储用于短期导出。

## 部署拓扑（文本 UML 伪图)

- User -> Cloudflare CDN/Pages Edge -> Next.js (SSG/SSR 页面)
- Edge Functions (Pages Functions / Workers) <- API 请求 (验证、导出、短链解析)
- 导出文件 -> R2 -> 生成受限短期 URL（signed URL）
- 元数据/小状态 -> KV / Durable Objects
- 日志 -> Cloudflare Logpush -> 外部日志存储（Datadog/LogDNA/S3）
- Secrets -> Cloudflare Pages / Workers Secrets

## 数据流与隐私控制要点

1. 浏览器优先本地计算（local-first）。默认不把 raw_input 发送到后端或 analytics。后端/analytics 只接收事件摘要（input_count, tool, precision, anonymized_id）。
2. 导出/保存需用户显式同意；导出文件上传到 R2 并通过 Workers 生成短期签名 URL（建议 7 天或更短），导出事件记录仅包含元数据（不包含文件内容或敏感数值）。
3. 调试原始输入仅在用户同意下进行，且必须先脱敏/哈希；日志访问受 Cloudflare Logpush 目标与外部存储的访问控制与加密约束。

合规控制点（GDPR/CN）：

- 在 UI 展示隐私通知并在采集 analytics 前尊重 consent（cookie banner / consent modal）。
- 维护数据处理矩阵（谁能访问 raw_input / 导出文件），并把它写入 `specs/FRS/gdpr-dsar-and-data-matrix.md`。

## API 契约摘要（快速可用片段）

说明：在 Next.js 中，API 可通过 Pages Functions/Workers 实现（例如 `/.netlify/functions` 样式的函数或 Cloudflare Pages Functions）。路由保持与 FRS 中指定的契约一致。

1) Mean API (server validation)

POST /api/mean

Request JSON (summary):

```json
{
  "numbers": [90,85,78,92],
  "precision": 2,
  "ignore_non_numeric": true
}
```

Response (200): { mean, count, sum, steps[], formula }

2) Weighted Mean API

POST /api/weighted-mean

Request summary:

```json
{ "pairs": [[90,3],[85,4]], "precision": 2 }
```

Response: { weighted_mean, sum_weights, steps[] }

错误处理原则：400 用于客户端可修复错误（INVALID_INPUT, TOO_LARGE_INPUT），500 为服务端错误。所有错误响应返回 error_code + message（Plain English，便于前端展示）。

## 性能 SLO / 可观测性

| 指标 | 首版目标 | 监测 & 告警 |
|---:|---:|---|
| LCP (mobile) | ≤ 2000 ms | Lighthouse CI + Synthetic tests（可在 CI 中运行 Lighthouse 或 PageSpeed），若 >2s 持续 5 次触发告警 |
| API 95th latency (edge functions) | ≤ 300 ms | 通过 Cloudflare Logs/Logpush 与外部指标系统监测；必要时将特定工作负载移回 Node 运行时。 |
| Error rate | < 1% | SLO + Alerting（外部监控） |

日志与审计：

1. 结构化日志（JSON）输出：event, user_anonymous_id, tool, input_count, error_code（如有）。不记录 raw_input。
2. 审计日志保留期：默认 90 天（外部存储策略）；敏感日志（若有）加密并按需保留（例如 7 天）。

## 安全配置要点

1. 强制 HTTPS + HSTS，CSP 限制第三方脚本域名。
2. 最小权限原则：Cloudflare 控制台与外部日志存储使用细粒度访问控制；CI 使用短期凭证。
3. Secrets 存放在 Cloudflare Pages / Workers Secrets，敏感值不在 repo 中明文出现。
4. Rate limiting（Edge 层）以防滥用，建议默认 100 req/min per IP，视业务可配置。

## 备选方案（若需更低成本或更快部署）

1. 全静态（pure SSG + client-side calc）：将所有工具以 SSG 编译成静态页面，客户端完成所有计算；优点部署最快、成本最低；缺点：无法做服务器端导出/批量工作（除非引入第三方服务）。
2. 使用 Vercel（Next.js 原生）或 AWS Amplify：适合不希望依赖 Cloudflare 的团队，但需评估成本与合规/数据驻留。

选择建议：基于当前讨论，首发采用 Cloudflare Pages + Workers（Next.js-only）。如遇边缘能力限制或第三方库兼容问题，再评估将部分后端迁移到 Node 运行时（例如 Cloud Run 或 Vercel Serverless）。

## 测试、CI 与 本地开发说明

- E2E: 使用 Playwright（已在 `tests/` 下放置模板测试）。在本地运行前请安装 dev 依赖（例如 `@playwright/test` 与 `@types/node`），并确保 Next.js 本地服务器可访问（默认为 http://localhost:3000）。测试模板与快速说明位于 `tests/README.md`。
- 性能回归: 在 CI 中集成 Lighthouse CI 或使用 PageSpeed API 测试关键页面（hub 与工具页）。
- CI/CD: 推荐 GitHub Actions 部署到 Cloudflare Pages；构建步骤包括：install -> build -> playwright (optional)-> deploy。可在 Actions 中使用 `npx playwright install --with-deps` 来安装浏览器以便在 CI 中运行 E2E。

## 下一步建议（基于最新决策）

1. 创建 `specs/FRS/seo-templates.json`（JSON-LD 示例）以便前端实现 getStaticProps 注入（建议优先）。
2. 补充 `specs/FRS/deployment-cloudflare.md`（Cloudflare Pages + R2 + Workers 的部署清单与权限步骤）。
3. 在 CI 中添加 Playwright 运行步骤（可选：将部分 E2E 定时跑在 Canary/preview 分支）。

请选择 `Proceed 1` / `Proceed 2` / `Proceed 3` 或 `Modify - <自定义项>`。

## 下一步（极小交付物）

请从以下选项中选择一个单一交付物，我将立即创建文档文件并提交：

1. `specs/FRS/seo-templates.json` — JSON-LD 模板与 mean/stddev 示例（建议优先）。
2. `specs/FRS/deployment.md` — GCP IAM/KMS/Logging/Backup 详单（合规必要）。
3. `specs/FRS/sitemap-and-robots.md` — sitemap 示例与 robots/hreflang 策略。（SEO 小步）
4. `specs/FRS/gdpr-dsar-and-data-matrix.md` — GDPR DSAR 流程与字段矩阵（法务用）。

回复 `Proceed 1` / `Proceed 2` / `Proceed 3` / `Proceed 4` 选择下一步，或 `Modify - <自定义项>`。

---

合规与完整性声明：

- 本文档覆盖架构决策、API 合约摘要、合规控制点（GDPR/CN）与运维建议；如需满足 21 CFR Part 11 或其他行业特定法规，需额外扩展审计与电子签名模块。 
- 当前假设：不保存 PII；若未来要保存需在 `gdpr-dsar-and-data-matrix.md` 中详细列出字段、保留期与访问控制。
