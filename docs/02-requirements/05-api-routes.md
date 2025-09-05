# API 路由详尽 FRS（MVP 核心）

id: FRS-API-ROUTES-001
---
id: FRS-API-ROUTES-001
owner: @product-owner
acceptance: docs/acceptance/api-routes-frs.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1
> 版本：0.1

目的：为 MVP 阶段的两个核心后端接口（轻量计算与导出任务）提供可执行、可验证的规格，便于开发、测试与合规审查。每一节都以“极小可验证交付物”为导向。

本文件覆盖：
- POST `/api/mean`（即时校验/返回 mean） — 推荐运行时：Edge (Pages Function / Worker)。
- POST `/api/export/csv`（异步导出任务） — 推荐运行时：Edge 入队 + 后台处理（Node 或 Worker 执行写入 R2）。

请 Review: Accept / Comment / Modify。

---

## 概要清单（Checklist）

1. API 契约（请求/响应 JSON 示例）。
2. 错误码表与前端友好信息。 
3. Rate-limiting 策略与 429 行为。 
4. 运行时映射（Edge vs Node）与降级策略。 
5. 日志/合规字段（禁止 raw_input）。
6. 自动化测试与 E2E 流程（包含负载/恢复场景）。

---

## 一、POST /api/mean

用途：对前端提交的数值数组做服务器端校验并返回计算结果（可选）。客户端仍可本地计算，此接口用于双重验证、记录交互或作为受控环境下的计算服务。

运行时建议：Edge（Pages Function / Worker）。

契约：

- 路径：`POST /api/mean`
- 请求头：
  - Content-Type: application/json
  - Authorization: (可选) Bearer <token> — 仅用于受限管理 API

请求体示例：

```json
{
  "numbers": [90, 85, 78, 92],
  "precision": 2,
  "ignore_non_numeric": true
}
```

成功响应 200 示例：

```json
{
  "mean": 86.25,
  "count": 4,
  "sum": 345,
  "precision": 2,
  "steps": ["Parsed values: [90,85,78,92]","Sum = 345","Mean = 345 / 4 = 86.25"]
}
```

错误响应举例：

```json
{ "error_code": "INVALID_INPUT", "message": "No numeric values parsed." }
```

错误码表：

| error_code | HTTP | 场景 | 前端提示 |
|---:|---:|---|---|
| INVALID_INPUT | 400 | 无有效数值 | "No numeric values found — enter numbers separated by commas or new lines." |
| TOO_LARGE_INPUT | 400 | 超出项数上限（默认 50k） | "Input too large — reduce entries." |
| RATE_LIMIT | 429 | 触发速率限制 | "Too many requests — try again later." |
| SERVER_ERROR | 500 | 服务器异常 | "Something went wrong — try again later." |

行为与限制：

1. 最大输入长度（默认）：50,000 个数值；超过返回 TOO_LARGE_INPUT。此值可配置。 
2. Edge 实现需尽量避免内存拷贝；采用流式解析（如需要）。
3. 日志仅记录：anonymous_id (或 缩短 hash)、tool="mean", input_count, precision, event="calc_execute"。禁止记录 raw_input 或 numbers[].

Rate-limit（可验证规则）：

- 默认：100 requests / minute / IP。超过返回 429 + error_code RATE_LIMIT。实现可以用 Durable Object 或平台速率限制。验证：压力测试需触发 429。 

安全与合规点：

1. 在未获得用户 consent 前不发送 GA4 事件（或只发送本地/聚合事件）。
2. 若记录 debug raw_input，必须：获得用户同意、加密存储并记录访问日志与理由。 

测试用例（极小集合，自动化）：

1. Happy path：numbers=[1,2,3,4] → mean 2.5。
2. Mixed non-numeric：numbers includes "foo" + ignore_non_numeric true → parse and compute.
3. Empty input → INVALID_INPUT。
4. Big input（50k）→ 成功或 TOO_LARGE_INPUT。
5. Rate limit test → 429 returned when超过阈值。

验收标准：

- 接口文档存在且示例可用；通过 5 个单元/集成测试；压力测试触发 429；日志审计确认不含 raw_input。 

---

## 二、POST /api/export/csv

用途：接收导出请求（例如用户希望把当前计算（含参数）导出为 CSV），异步处理并将导出文件写入 R2，最终返回短期下载链接。

运行时建议：Edge 入队（立即响应 taskId），实际文件生成可由后台 Worker/Node 任务完成写入 R2。

契约：

- 路径：`POST /api/export/csv`
- 请求头：Content-Type: application/json

请求体示例：

```json
{
  "tool": "mean",
  "params": { "numbers": [90,85,78,92], "precision": 2 },
  "consent": true
}
```

响应 202（已入队）示例：

```json
{ "taskId": "task_abc123", "status": "queued" }
```

任务完成后客户端轮询或通过 webhook 获得：

GET /api/export/status?taskId=task_abc123 →

```json
{ "status": "done", "downloadUrl": "https://r2.example.com/bucket/obj.csv?sig=..." }
```

错误码表：

| error_code | HTTP | 场景 | 前端提示 |
|---:|---:|---|---|
| INVALID_CONSENT | 400 | 用户未同意导出 | "You must agree to export your data." |
| EXPORT_FAILED | 500 | 导出任务失败 | "Export failed — try again later." |
| RATE_LIMIT | 429 | 触发速率限制 | "Too many export requests — try later." |

实现细节与行为：

1. 入队：Edge 接收请求后做轻量校验（consent==true、params schema），写入任务队列（Durable Task / external queue），返回 taskId。Edge 响应需在 200ms–300ms 内完成。 
2. 后台 worker：异步取任务，执行 CSV 生成（stream to R2），生成后设置 task status 为 done 并写入 signed URL（7 days expire）。
3. 对大任务（预计文件 > 50MB）应采取 chunked generation 或禁止（返回 TOO_LARGE_INPUT）。

安全与合规点：

1. 导出前必须明确 `consent: true` 并在 audit log 中记录同意票据（hashed user id / timestamp）。
2. 下载链接为 signed URL，过期时间默认 7 天；不在日志中记录下载文件内容。 

Rate-limit：

- 导出接口默认限流更严格：10 requests / hour / anonymous_id（防止滥用）。压力测试需验证限流行为。 

测试用例（自动化）：

1. 成功流程：POST 导出 → 202 + taskId → 后端完成 → status=done + downloadUrl 可下载并内容有效。
2. 未同意导出：consent=false → INVALID_CONSENT。
3. 导出失败（模拟后端异常）→ EXPORT_FAILED 且 task 状态为 failed。
4. 下载链接过期验证（时间前移模拟）。

验收标准：

- 入队时延 < 300ms；后台在 95% 情形下完成导出并写入 signed URL（可在测试环境验证）；审计日志包含 consent 记录且被加密存储。 

---

## 三、Edge vs Node 映射总表（复用）

| 功能 | 推荐运行时 | 备注 |
|---:|---|---|
| /api/mean | Edge | 低延迟校验；P95 latency 目标小于 100ms |
| /api/weighted-mean | Edge | 同上 |
| /api/gpa | Edge | 若 mapping 非常复杂可落回 Node |
| /api/stddev | Edge | 轻量统计 |
| /api/export/csv | Edge 入队 + 后台 worker | Edge 做入队，后台生成文件并写 R2 |

若迁移到 Node：需在 `specs/FRS/deployment-cloudflare.md` 记录 Node 服务地址、auth、并更新 CI 流程。

---

## 四、监控/日志/合规快速清单（每项为验收点）

1. 日志字段：`{ timestamp, anonymous_id_hash, tool, input_count, event, error_code }` — 验收：随机抽样日志不含 numbers 或 raw_input。 
2. Metric：latency（p50,p95,p99）、error_rate、queue_depth（export） — 验收：仪表盘展示上述指标并设置告警阈值。 
3. Audit：导出事件包含 `consent_hash`, `timestamp`, `taskId` 且记录在加密存储中 — 验收：能导出 30 天内的 consent 记录样本。

---

## 五、交付物（本步骤）

1. 本文件：`specs/FRS/api-routes-frs.md`（已生成）。
2. 下一步建议（单一交付物）：
   - 生成 E2E 测试脚本模板（Playwright / Cypress），或
   - 生成 `wrangler.toml` 与 GitHub Actions 部署草案（Cloudflare）。

请回复：Review: Accept / Comment - <修改点> / Proceed - <choose next step: e2e or wrangler>。
