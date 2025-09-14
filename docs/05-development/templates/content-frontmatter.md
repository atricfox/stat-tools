# 内容 Frontmatter 模板（HowTo / FAQ / 案例 / 专题页）

通用字段（所有类型可用）：
- `type`: howto | faq | case | tool
- `slug`: 页面唯一标识（URL 片段）
- `title`: 页面标题（H1）
- `summary`: 简短摘要（用于列表/相关内容）
- `tags`: ["standard-deviation", "descriptive-stats"]
- `related`: 关联内容的 slug 列表（可跨类型）
- `mentions`: 正文会提及/链接的关键术语或页面 slug
- `seo`: { title, description, canonical? }

## HowTo 示例（how-to/standard-deviation-basics.mdx）
```yaml
---
type: howto
slug: standard-deviation-basics
title: 标准差计算步骤指南（入门）
summary: 手把手带你完成样本与总体的标准差计算与理解。
tags: ["standard-deviation", "descriptive-stats"]
related:
  - sd-common-mistakes
  - sd-real-world-case-1
  - calculator-standard-deviation
mentions:
  - calculator-standard-deviation
  - faq-sd-sample-vs-population
seo:
  title: 标准差计算步骤指南（入门）
  description: 用 3 步完成标准差计算，支持样本与总体两种场景，附常见误区与工具直达。
---
```
（正文建议：步骤卡片/折叠、公式说明、工具直达按钮，支持 URL 预填参数）

## FAQ 示例（faq/standard-deviation.mdx）
```yaml
---
type: faq
slug: standard-deviation
title: 标准差常见问题（FAQ）
summary: 汇总标准差在学习与实际应用中的高频问题。
tags: ["standard-deviation", "descriptive-stats"]
related:
  - standard-deviation-basics
  - calculator-standard-deviation
seo:
  title: 标准差常见问题（FAQ）
  description: 標準差常见问题汇总，含样本/总体区分、与方差关系、常犯错误与选择指南。
---
```
（正文建议：折叠问答块；答案中包含到 HowTo/工具/案例的锚文本内链）

## 案例示例（cases/sd-real-world-case-1.mdx）
```yaml
---
type: case
slug: sd-real-world-case-1
title: 用标准差分析电商退货率波动（案例）
summary: 通过标准差衡量退货率波动，定位波动异常并制定优化策略。
tags: ["standard-deviation", "ecommerce"]
related:
  - standard-deviation-basics
  - calculator-standard-deviation
seo:
  title: 用标准差分析电商退货率波动（案例）
  description: 电商退货率的统计波动分析案例，涉及样本/总体区分、实操与策略。
---
```
（正文建议：场景背景、过程分步、结果解读、试算 CTA、相关 FAQ 链接）

## 工具专题页补充（tool 元数据）
若部分工具专题页采用 MDX/元数据维护，可使用：
```yaml
---
type: tool
slug: calculator-standard-deviation
title: 标准差计算器
summary: 在线计算样本或总体标准差，含步骤说明与解读。
tags: ["standard-deviation", "descriptive-stats"]
related:
  - standard-deviation-basics
  - faq-standard-deviation
seo:
  title: 标准差计算器 - 在线工具
  description: 支持样本/总体、含步骤 HowTo 与常见问题，适合学习与实战。
---
```
（正文建议：结果区下方提供 HowTo 引导；底部聚合相关 HowTo/FAQ/案例）

## 事件埋点建议（与 GA4 对齐）
- HowTo：`howto_step_expand`, `howto_tool_cta_click`（带 `tool_slug`, `prefill`）
- FAQ：`faq_expand`, `faq_to_howto_click`, `faq_to_tool_click`
- 案例：`case_to_tool_click`, `related_link_click`（带 `from_type`/`to_type`）

