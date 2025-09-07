---
id: OPS-OBS-SENTRY-001
owner: @ops-lead
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-07
status: Active
reviewers: [@security-lead, @fe-lead]
---

# 可观测性与错误上报（Sentry）运维手册

本文档说明如何在生产环境启用 Sentry 错误上报与 Trace 追踪、如何与 `requestId` 串联，以及运维侧的指标、告警与日常操作。

## 1. 配置与启用

环境变量（生产建议配置）：

```
SENTRY_DSN=<your-server-dsn>
NEXT_PUBLIC_SENTRY_DSN=<your-client-dsn-optional>
SENTRY_TRACES_SAMPLE_RATE=0.2            # 事务采样率（保守默认）
SENTRY_PROFILES_SAMPLE_RATE=0.0          # 性能剖析（默认关闭）
SENTRY_REPLAYS_SAMPLE_RATE=0.0           # 回放（默认关闭）
NEXT_PUBLIC_ENVIRONMENT=production
```

注：客户端 DSN 可选；如涉及隐私/合规，建议仅服务端上报，客户端逐步评估开启。

相关代码：

- `sentry.server.config.ts` / `sentry.client.config.ts`：Sentry 初始化
- `src/app/api/*/route.ts`：为 API 包装 span，并在异常时 `captureException`
- `src/lib/observability.ts`：生成 `requestId` 并结构化日志

### 1.1 Cloudflare Pages 环境变量配置（推荐 UI + CLI）

UI 操作（建议）：

1. Cloudflare Dashboard → Pages → 选择项目
2. Settings → Environment variables
3. Environment: 选择 `Production`（或 `Preview`/`Development`）
4. 添加变量：
   - `SENTRY_DSN = <your-server-dsn>`
   - （可选）`NEXT_PUBLIC_SENTRY_DSN = <your-client-dsn>`
   - `NEXT_PUBLIC_ENVIRONMENT = production`（或 `staging`/`preview`）
5. 保存并重新部署

CLI（可选，wrangler v3+）：

```bash
# 设置 Pages 项目 Secret（服务端可见）
wrangler pages project secret put SENTRY_DSN --project-name "$CF_PAGES_PROJECT"

# 设置环境变量（公开变量，如需）
wrangler pages project variable put NEXT_PUBLIC_SENTRY_DSN --project-name "$CF_PAGES_PROJECT" --value "$YOUR_PUBLIC_DSN"
wrangler pages project variable put NEXT_PUBLIC_ENVIRONMENT --project-name "$CF_PAGES_PROJECT" --value "production"
```

验证：部署后访问 `/api/mean`，制造一个错误（传入非法 body），在 Sentry 项目中应能看到异常事件，tag/attribute 含 `requestId`。

### 1.2 Cloudflare Workers Secret 注入（wrangler）

生产环境注入：

```bash
echo -n "$YOUR_SENTRY_DSN" | wrangler secret put SENTRY_DSN --env production
```

预发环境注入：

```bash
echo -n "$YOUR_STAGING_DSN" | wrangler secret put SENTRY_DSN --env staging
```

> 注意：`SENTRY_DSN` 不应出现在 `wrangler.toml` 的 `[vars]` 明文中，必须通过 `wrangler secret put` 注入。

附：批处理脚本模板（macOS/Linux）：

```bash
#!/usr/bin/env bash
set -euo pipefail

ENV=${1:-production}
read -s -p "Enter SENTRY_DSN for $ENV: " DSN; echo
printf "%s" "$DSN" | wrangler secret put SENTRY_DSN --env "$ENV"
echo "SENTRY_DSN set for $ENV."
```

## 2. requestId 串联 Trace

- API 在进入点创建 `requestId` 并：
  - 写入响应头 `x-request-id`
  - 作为 Sentry span 属性（attribute）/ tag 上报（名称：`requestId`）
  - 日志打印中包含 `requestId`

运维串联路径：

1) 用户报错/前端日志 → 记录 `x-request-id`
2) Sentry 事件页 → 搜索 `tag:requestId:<value>` 或在相关 Transaction 里查看 Attributes
3) 关联到 API 服务器日志（若接入集中日志），按 `requestId` 过滤

## 3. 采样与成本控制

- `SENTRY_TRACES_SAMPLE_RATE` 控制事务采样；生产建议从 0.1–0.3 起步，根据成本与洞察调整。
- 对高价值端点可在代码中提升采样（通过 `startSpan` 上下文控制），对低价值路径降采样。

## 4. 数据保护与隐私

- 默认不上传 PII；如需上传（如用户 ID），必须进行脱敏/哈希并获得合规批准。
- 客户端上报（`NEXT_PUBLIC_SENTRY_DSN`）需额外评审与告警策略，避免泄露敏感输入。

## 5. 仪表盘与告警

建议建立以下告警：

- Error Rate（5分钟滑窗）> 阈值（如 1%）
- P95/P99 Latency 超阈值
- 关键端点（/api/mean、/api/export/csv）异常增长

仪表盘建议与查询模板（Sentry Discover/Dashboards）：

- 概览（Errors Over Time）
  - Dataset: Errors
  - Query: `event.type:error`
  - Y-Axis: `count()`
  - Group by: `transaction`

- Error Rate by API
  - Dataset: Errors + Transactions（Dashboard 组合）
  - Query(Errors): `event.type:error transaction:/api/*`
  - Query(Transactions): `event.type:transaction transaction:/api/*`
  - 显示：Errors `count()` / Transactions `count()` 对比（或使用 Session-based Error Rate 小组件）

- P95 Latency by API Path
  - Dataset: Transactions
  - Query: `transaction:/api/*`
  - Y-Axis: `p95()`
  - Group by: `transaction`

- Top error_code by Path
  - Dataset: Errors
  - Query: `event.type:error has:error_code`
  - Columns: `error_code`, `transaction`, `count()`

- RequestId Trace Lookup（问题排障面板）
  - Dataset: Errors
  - Query: `event.type:error requestId:"<paste-request-id>"`
  - Columns: `id`, `timestamp`, `transaction`, `message`

告警模板（Metric Alerts）：

1) Error Rate > 1%（5 分钟窗口）

```
Type: Metric Alert (Errors/Transactions)
Condition: Error Rate above 1 for 5 min
Filter: transaction:/api/*
Action: Slack #alerts, Email on-call
```

2) P95 Latency > 500ms（关键 API）

```
Type: Metric Alert (Transactions)
Aggregate: p95()
Condition: Above 500ms for 5 min
Filter: transaction:/api/(mean|export/csv)
Action: Slack #perf-alerts
```

3) New Issue Spike（关键路径）

```
Type: Issue Alert
Condition: More than 5 events in 1 min
Filter: transaction:/api/* severity:error
Action: Create Jira issue + Slack #backend
```

## 6. 运行手册（Runbook）

告警触发后：

1) 在 Sentry 中按 `tag:requestId` 或 path 定位异常
2) 回放异常上下文（面包屑/堆栈/Span 时间线）
3) 在日志系统中按 `requestId` 查询完整链路
4) 快速缓解：
   - 回滚最近变更或降级流量
   - 标记已知问题（Issue）并指派负责人
5) 根因分析：
   - 关联最近发布、依赖升级、配置变更
   - 完成事后分析（Postmortem），沉淀到 ADR/文档

## 7. 预发与生产验证

- 预发（staging）：可使用独立 DSN 项目；观察错误聚合与 Trace 完整性
- 生产：逐步提高采样率；按成本与价值平衡

## 8. 安全与合规

- Sentry DSN 通过 Secrets 管理；严禁写入仓库明文
- 定期审查项目内的事件 Payload，确认未含敏感数据
- 配合 CSP/nonce 策略，确保 SDK 与页面脚本不被阻断
