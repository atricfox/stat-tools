# Next.js 运行时决策（Edge vs Node）

id: FRS-NEXTJS-RUNTIME-001
---
id: FRS-NEXTJS-RUNTIME-001
owner: @product-owner
acceptance: docs/acceptance/nextjs-runtime-decision.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 目的

本文件为单一可验证交付物，收敛并明确 MVP（Next.js-only、Cloudflare 部署）下的运行时决策：哪些 API/功能应在 Edge Runtime（Pages Functions / Workers）执行，哪些应在 Node Runtime（Server-side / 后端）执行，理由、限制与验收标准。目的是避免实现时反复返工并保证 SEO、性能与合规。 

请 Review: Accept / Comment / Modify。通过后我会基于本决策生成对应 API 的详细 FRS 与部署示例。

## 约束与前提（MVP 范围）

1. 技术栈：Next.js 全栈（SSG/ISR + client calc + Next API routes / Pages Functions）。
2. 部署目标：Cloudflare Pages + Pages Functions / Workers；R2 用作对象存储，KV/Durable Objects 用于短链与轻量状态。 
3. 计算位置：核心计算优先在客户端完成；后端仅作验证、导出、短链与审计。 
4. 合规：不在 analytics/log 中发送 raw_input；导出/保存需要用户同意。 

## 运行时对比（简要）

| 维度 | Edge Runtime (Workers / Pages Functions) | Node Runtime (Next.js API Routes / Server) |
|---:|---|---|
| 启动延迟 | 极低（边缘） | 可能有冷启动 (serverless) 或更高延迟 |
| 可用 API | Web 标准 API (Fetch, Web Crypto, Streams) | Node 原生 API、第三方 Node 模块完整可用 |
| 权限/功能 | 可访问 R2, KV, Durable Objects (通过绑定) | 可访问任意云服务与本地 Node 模块 |
| 适合场景 | 轻量校验、短链解析、签名 URL、rate limiting | 重计算、复杂 CSV 生成（native 库）、外部队列整合 |
| 限制 | 不支持某些 Node 内建模块（fs, child_process 等） | 资源较高，运维与成本不同 |


## 路由与运行时映射（推荐）

下面列出 MVP 典型 API 路由并给出建议运行时与原因（每行为单一决策点，可独立验收）。

| 路由 | 推荐运行时 | 说明 / 验收标准 |
|---:|---|---|
| POST `/api/mean` | Edge (Pages Function / Worker) | 轻量校验/返回 mean/count/sum/steps；目标 P95 latency ≤ 50ms；不在日志中记录 raw_input（只记录 input_count）。|
| POST `/api/weighted-mean` | Edge | 同上，解析 pairs 并返回 weighted_mean；P95 ≤ 80ms。|
| POST `/api/gpa` | Edge（若需复杂 mapping 可落回 Node） | 大多数 mapping 为轻量转换，适合 Edge。若需要使用 heavy Node 库或 CSV 批量导出，使用 Node 路由。|
| POST `/api/stddev` | Edge | 仅数值解析与简单统计，适合 Edge。|
| POST `/api/export/csv` | Node (long-running task) or Edge -> enqueue to Worker | 导出可能涉及较大内存/stream 操作：推荐 Edge 接收请求并把任务入队（Durable Task /外部队列），实际生成由短时 Node worker 或后台 Job 完成并写入 R2。验收：导出任务返回 taskId，即刻响应 ≤ 200ms，最终下载链接（signed R2 URL）7 days expiry。|
| GET `/s/{shortId}` | Edge + KV | 短链解析在 KV，响应 301 或渲染短链页面；P95 ≤ 30ms。|
| GET `/api/export/status?taskId=` | Edge | 返回任务状态（queued/processing/done/failed），不包含内容。|

说明：以上为 MVP 推荐分层，实际可先将所有路由用 Edge 实现并在遇到限制时迁移到 Node。每个迁移/回退需在 `specs/FRS/` 中记录并更新文档。

## 设计准则（执行时必须遵守）

1. 不在任何日志或 analytics 事件中直接写入 `raw_input` 或可识别的数值序列。只记录 `input_count`, `tool`, `precision`, `event`。 
2. Error responses 必须以 `{ error_code, message }` 返回，message 为 Plain English，避免泄露堆栈或敏感信息。 
3. 所有 API 在 Edge 上需要做速率限制（per IP / per anonymous id），建议初始阈值 100 req/min。实现可使用 Durable Object 或 Edge Middleware。 
4. JSON-LD 与页面元信息必须在 getStaticProps/getServerSideProps 中注入（SSG/SSR），避免客户端延迟注入导致 GSC 抓取失败。 

## 限制与降级策略（必须可验证）

1. Edge 限制：若实现依赖 Node 本地模块（如 native CSV 库、某些 crypto），应记录并切换到 Node 路由。 
2. 超大导出：若单次导出 > 50MB，应采用异步后台任务（chunked stream）并通知用户；Edge 仅负责入队与返回 taskId。 
3. 当 Edge 承载任务失败率高于阈值（Error rate > 1%）时，应自动回退到 Node 后端或限流。 

## 安全、合规与可观测性要求（每项为验收点）

1. 日志策略：结构化日志包含 `{ timestamp, anonymous_id, tool, input_count, event, error_code }`；默认保留 90 天，敏感日志需加密并严格限权。 
2. Consent：在未获得用户同意前不发送 GA4 事件（或者仅发送本地/聚合事件）。
3. 审计：所有导出事件须记录同意票据并存储（加密）供法务审计（保留期 1 year 或按法务指示）。
4. 监控：Edge 路由需暴露 latency/error metrics 至监控平台（Cloudflare Metrics / Logpush 或 Sentry）。

## API 路由示例（伪码）

POST /api/mean (Edge function)

Request (JSON):

```json
{ "numbers": [90,85,78,92], "precision": 2 }
```

Response (200):

```json
{ "mean": 86.25, "count": 4, "sum": 345, "steps": ["sum=345","mean=345/4=86.25"] }
```

Error (400):

```json
{ "error_code": "INVALID_INPUT", "message": "No numeric values parsed." }
```

POST /api/export/csv (Edge enqueues task)

Request:

```json
{ "tool": "mean", "params": { "numbers": [ ... ] }, "consent": true }
```

Response (202):

```json
{ "taskId": "abc123", "status": "queued" }
```

Later GET /api/export/status?taskId=abc123 → { status:"done", downloadUrl: "https://..." }

## 验收标准（每条为可验证项）

1. 所有 Edge 路由在负载模拟下 P95 latency 符合文档中声明值（例如 `/api/mean` P95 ≤ 50ms）。验证：合成测试与负载脚本报告。 
2. 导出流程在 95% 测试用例下能成功返回 signed R2 URL（在 30s 内完成）。验证：E2E 测试。 
3. 日志中不含 `raw_input`（人工/脚本审计）。验证：审计脚本扫描日志字段。 
4. rate limiting 在异常流量下触发并返回 429；验证：压力测试触发 429。 

## 迁移与回退策略（简单流程）

1. 首先在测试域上部署 Edge 版本并对比响应头/内容与原实现（head、JSON-LD、canonical）。 
2. 在低量真实流量上做灰度（按地理或随机采样），监控错误/性能指标。 
3. 若达到回退阈值（5xx > 0.5% 或 LCP 上升 > 20%），立即切换回旧流量并排查问题。 

## 下一步（最小可验证交付物）

1. 我可以把上述内容写入 `specs/FRS/nextjs-runtime-decision.md`（已完成）。
2. 可选：我现在为每个 Edge 路由生成详细 FRS（`specs/FRS/api-routes-frs.md`），包括示例请求/响应、错误码、合规点与 E2E 测试脚本（请选择）。

---

请 Review: Accept / Comment - <修改点> / Modify - <下一交付物：B/C>。
