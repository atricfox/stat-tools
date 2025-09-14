# HowTo / FAQ / Case 文案模板速查（与 Frontmatter 对齐）

用途：为内容团队提供快速撰写模板（配合 `docs/05-development/templates/content-frontmatter.md`）。本表仅列内容要点与长度建议。

## HowTo（/how-to/[slug]）
- 标题（H1）：动作+对象+场景（≤ 60 字）
- 摘要（Summary）：一句话说明适用与输出（≤ 120 字）
- 步骤（Steps，建议 3–6 步）：
  1. 步骤名（≤ 18 字）+ 一句话说明（≤ 80 字）
  2. ……
- 公式/说明（可选）：精炼要点（≤ 120 字），避免与步骤重复
- 工具 CTA 文案：动词开头+结果导向（例如“用标准差计算器试算样本SD”）
- 相关链接（RelatedLinks）：显式 related 优先，其次 tags/mentions

Frontmatter 示例关键点：
- type=howto、slug、title、summary、tags[]、related[]、mentions[]、updated（ISO）
- （可选）prefill：允许的工具参数映射（白名单）

## FAQ（/faq/[slug]）
- 问题（H1）：用户口吻 + 关键词（≤ 80 字）
- 答案（正文）：
  - 直给答案（≤ 150 字）
  - 视需要附“查看详细步骤”或“使用工具”链接
- 相关链接：HowTo/工具优先；避免与问题重复堆砌

Frontmatter 关键点：
- type=faq、slug、title（可与问题一致）、summary（可选）、tags[]、related[]、mentions[]、updated（ISO）
- Schema 策略：详情页仅 WebPage + BreadcrumbList；聚合页使用 FAQPage

## 案例（/cases/[slug]）
- 标题（H1）：场景 + 行为 + 目标（≤ 70 字）
- 概要（Summary）：一句话概述背景与结论（≤ 140 字）
- 正文结构：
  1. 场景背景（≤ 120 字）
  2. 过程分步（可 3–5 小段，每段 ≤ 120 字）
  3. 结果解读（≤ 140 字）
  4. 反思/注意事项（≤ 120 字）
- 结论区 CTA：用本工具试算（明确工具名） + 相关 FAQ
- 插图/图表：统一风格，延迟加载，Caption（≤ 80 字）与来源

Frontmatter 关键点：
- type=case、slug、title、summary、tags[]、related[]、mentions[]、updated（ISO）

## 术语（Glossary，供交叉引用）
- 定义：80–150 字，直击应用语境
- 常见误区：1–2 条短句
- 相关入口：指向工具/主题/相关术语（chips 简短）

## 写作建议（通用）
- 语言：Plain English/Plain Chinese，短句优先，避免专业堆砌
- 长度控制：正文段落 ≤ 120–150 字，步骤名 ≤ 18 字
- 锚文本：语义化（“标准差计算步骤指南”），避免“点这里”
- 一致性：术语用 Glossary 规范；单位与符号统一
- SEO：标题含关键词但不过度；避免与工具页完全重复

