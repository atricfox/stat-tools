---
id: DEV-SEC-CSP-ROLL-001
owner: @security-lead
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-07
status: Active
reviewers: [@fe-lead, @ops-lead]
---

# CSP/Nonce 运维与灰度发布指南

本文档定义前端 CSP 策略（含 nonce）在各环境的配置、灰度流程与排障指南，确保在不影响业务的前提下逐步从 Report-Only 过渡到强制模式。

## 1. 实施概览

- 实施方式：Next.js 中间件为每次请求生成 `nonce` 并注入响应头；页面通过 `next/script` 使用 `nonce` 渲染 JSON-LD 等脚本。
- 头部策略：
  - Staging/Preview/Dev 环境：`Content-Security-Policy-Report-Only`
  - Production 环境：`Content-Security-Policy`
- 环境切换：通过环境变量控制
  - `NEXT_PUBLIC_ENVIRONMENT=staging|preview|development` → Report-Only
  - 其他（如 `production`）→ 强制

相关代码：

- `src/middleware.ts`：生成 `nonce`、设置 CSP 与基础安全头
- `src/app/layout.tsx`：读取 `x-csp-nonce` 并在 `<Script nonce=...>` 中使用

## 2. CSP 策略模板

默认指令（由中间件生成）：

```
default-src 'self';
script-src 'self' 'nonce-<dynamic>';
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
font-src 'self' data:;
connect-src 'self';
frame-ancestors 'none';
base-uri 'self';
form-action 'self'
```

注意：`style-src 'unsafe-inline'` 初期保留以兼容 Tailwind/Next 样式标签；后续可通过 style nonce/hash 或特定优化移除。

## 3. 环境配置

Cloudflare Pages / 环境变量：

```
NEXT_PUBLIC_ENVIRONMENT=staging   # 预发/预览
NEXT_PUBLIC_ENVIRONMENT=production # 生产
```

> 提示：可通过 Pages 项目设置不同环境变量，或在部署脚本中注入。

## 4. 灰度发布流程（建议）

1) 预发启用 Report-Only
- 将 `NEXT_PUBLIC_ENVIRONMENT=staging`，验证功能无回归。
- 观察 24–48 小时 CSP 报告（如配置 `report-uri`/`report-to`）。

2) 小流量强制
- 在生产以 10% 流量开启强制（平台路由/流量分配），其余仍 Report-Only。
- 监控错误率、CSP 违例、Sentry/Otel 指标。

3) 全量强制
- 所有流量切换至强制；保留 Report-Only 一段时间用于新路径观察（可并存）。

## 5. 开发与代码要求

- 禁止使用内联 `<script>`，统一改用 `next/script` 并使用中间件生成的 `nonce`。
- 禁止在运行时拼接注入用户输入到脚本内容。
- 第三方脚本引入需评估：优先通过 `self` 托管；必要时在 `script-src` 白名单内最小化放行源（需提出变更申请）。

示例（JSON-LD）：

```tsx
// src/app/layout.tsx 片段
<Script id="ld-json-home" type="application/ld+json" nonce={nonce}
  dangerouslySetInnerHTML={{ __html: JSON.stringify({...}) }} />
```

## 6. 测试与 CI

- A11y：Playwright + axe，在测试上下文使用 `bypassCSP: true` 注入脚本检测（仅测试会话）。
- Bundle 预算：在 `next build` 之后执行体积检查，防止意外引入大型第三方脚本。

相关文件：
- `.github/workflows/deploy-wrangler.yml`：构建后执行预算检查与 a11y 测试
- `tests/playwright.config.ts`：`contextOptions: { bypassCSP: true }`

## 7. 排障指南（Troubleshooting）

常见症状与处理：

- 白屏或关键组件不渲染：
  - 检查浏览器控制台 CSP 违例信息（Blocked by Content Security Policy）。
  - 确认涉及脚本是否使用了 `next/script` 与 `nonce`。

- 第三方资源被阻止：
  - 评估是否必须引入；若必须，提出安全变更单，将源加入最小白名单。

- 测试环境脚本注入失败：
  - 确认 Playwright `bypassCSP` 已开启；或在测试中改为通过 `addScriptTag({ path })` 引入。

## 8. 变更与回滚

- 变更：通过 PR 修改中间件策略或白名单，需 Sec/FE/Ops 三方审批。
- 回滚：将生产 `NEXT_PUBLIC_ENVIRONMENT` 临时切换为 `staging`（等效 Report-Only），并恢复上一次稳定策略。

## 9. 后续优化

- 移除 `style-src 'unsafe-inline'`，改为 nonce/hash。
- 对接 `report-uri`/`report-to` 到收集端，建立可视化告警。
- 增加 `upgrade-insecure-requests`（如无混合内容）。

