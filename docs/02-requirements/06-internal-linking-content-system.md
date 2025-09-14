# 内部超链接联动内容系统需求（HowTo + 工具专题页 + FAQ + 案例）

## 1. 产品目标
- 搭建以统计知识与实用工具为核心、结构化且强联动的内容体系。
- 用户从概念、步骤、工具、答疑到案例形成闭环，每一步可通过内部超链接无缝跳转。
- 极致 SEO 友好：规范 JSON‑LD、统一锚文本、中心辐射的内链网络。

## 2. 信息架构与内容类型
### 2.1 工具专题页（Spoke）
- 内容：单一主题（如“标准差计算器”）的主页面，含工具交互区、主题简介、HowTo/FAQ/案例推荐区、相关工具推荐。
- 要求：
  - 结果区下方突出 HowTo 入口（如“小白看不懂？查看标准差步骤指南”）。
  - 底部聚合与本主题强相关的 HowTo/FAQ/案例（内部链接）。
  - 使用 `next/link` 跳转，兼容 SSG/ISR，组件化复用推荐区。

### 2.2 HowTo 步骤页
- 内容：针对具体统计问题的操作步骤、公式讲解、输入输出样例；关键名词均有内部超链直达工具/FAQ/案例/专题页。
- 要求：
  - 步骤以编号/卡片/流程呈现，可折叠；全文/卡片末尾提供工具直达锚点与 FAQ 关联锚点。
  - 支持“跳转并填充”工具页（URL 参数预填）。
  - 提供上下篇推荐（同类 HowTo）、返回专题页/聚合页链路。

### 2.3 FAQ 问答页
- 内容：主题高频问题，答案简明结构化；每题可加标签与 Related 入口直达 HowTo/工具/案例。
- 要求：
  - 支持折叠、全文搜索、锚点跳转到关联内容。
  - 答案中的步骤/工具名用锚文本内链。
  - 可后台持续补充，内容改动自动增量更新。

### 2.4 案例页（Case Study）
- 内容：真实场景的统计流程、参数输入、结果分析与反思，配图可选。
- 要求：
  - 正文嵌入相关 HowTo、FAQ、工具链接；关键结论处提供“用本工具试算/相关 FAQ”。
  - 标签化管理，以便在相关页面自动推荐展示。

## 3. 内链规范与落地细化
- 全站主要内容均通过内部超链互联，锚文本使用语义化短语（如“标准差计算步骤指南”）而非“点这里”。
- 工具 ↔ HowTo、FAQ ↔ 案例双向互链，任意入口均可回到核心应用（提升“主题岛效应”）。
- 跳转采用 `next/link` 与 Markdown 链接，相关推荐组件以结构化数据驱动（related/tags）。
- 与现有 `src/lib/internalLinks.ts` 与 `src/lib/seo/InternalLinkOptimizer.ts` 对齐，新增内容类型的规则在落地时补充。

## 4. 数据结构与内容管理
- 采用 MD/MDX + Frontmatter 结构化内容；字段含 slug、type、title、summary、tags、related、mentions、cta、seo 等。
- 内容变更触发 ISR/SSG 增量重建；提供链接检查脚本确保内链无 404。
- 前后端对齐的 Frontmatter 模板见：`docs/05-development/templates/content-frontmatter.md`。

## 5. 页面与组件层级
- 统一布局：头部导航、面包屑、主内容区、相关内容区、页脚。
- 推荐组件：`ToolCalculator`、`HowToSteps`、`FAQList`、`CaseStudy`、`RelatedLinks`、`Breadcrumbs`。
- 模块复用：专题页底部“相关 HowTo/FAQ/案例”与各内容页侧栏“相关链接”共用 `RelatedLinks`。

## 6. SEO 与结构化数据
- HowTo：`HowTo` + `HowToStep`（含 name、text、tool、estimatedCost=0）。
- FAQ：聚合页 `/faq/` 使用 `FAQPage`（多问多答）；FAQ 详情页 `/faq/[slug]` 仅使用 `WebPage` + `BreadcrumbList`（不再标注 `FAQPage`，避免策略风险与重复标注）。
- 案例：`Article` 或 `CreativeWork`（含 headline、datePublished、author）。
- 工具专题页：保持工具页现有策略，必要时增加 `HowTo` 的简化片段或 `ItemList` 指向步骤文档。
- Breadcrumb：全类型页面注入 `BreadcrumbList`。
- 内链 JSON‑LD：在 HowTo 的 `tool`、`about/mentions` 中添加专题页与工具页 URL。

## 7. 事件与度量（对齐 GA4/UTM）
- 事件建议：
  - `howto_step_expand`、`howto_tool_cta_click`（带 `tool_slug`、`prefill=yes/no`）；
  - `faq_expand`、`faq_to_howto_click`、`faq_to_tool_click`；
  - `case_to_tool_click`、`related_link_click`（带 `from_type`/`to_type`）。
- 所有事件自动合并 UTM 参数（已在 `trackEvent` 合并）。
- KPI：HowTo → 工具跳转率、FAQ 展开率、相关链接 CTR、带参预填转化率、会话滚动深度分布。

## 8. 实现映射（Next.js）
- 路由建议：
  - HowTo：`app/how-to/[slug]/page.tsx`（或 `app/learn/how-to/[slug]`）
  - FAQ：`app/faq/[slug]/page.tsx` + `app/faq/page.tsx`（聚合）
  - 案例：`app/cases/[slug]/page.tsx` + `app/cases/page.tsx`（聚合）
  - 工具专题页：保留现有 `/calculator/*`，专题页底部接入推荐区。
- 数据加载：内容目录 `content/{howto|faq|cases}` 下的 MDX，构建时读取 Frontmatter 聚合；生成静态页 + JSON‑LD。
- 关联关系：根据 Frontmatter 的 `related`、`tags` 与 `mentions` 建立内容图；可扩展到 `src/lib/internalLinks.ts`。

## 9. 验收标准（DoD）
- 四类页面均可生成，具备面包屑、相关链接区和对应 JSON‑LD；
- 工具页结果区出现“步骤指南”显著入口；
- HowTo 页支持步骤折叠、工具直达与（可选）参数预填跳转；
- FAQ 可折叠与全文搜索，问题可直达 HowTo/工具/案例；
- 案例页含关键结论的“试算/相关 FAQ”跳转；
- GA4 能观测上述事件，UTM 贯通；核心指标达标（LCP/CLS/INP）。

## 10. 交付计划
- Sprint A：内容模型与模板（Frontmatter）、基础路由与渲染、相关链接组件；
- Sprint B：内链自动化（根据 related/tags 规则）、FAQ 搜索与锚点、HowTo 预填跳转；
- Sprint C：内容图完善、A/B（入口位置/推荐排序）、多语言与 CMS 对接。

## 11. 风险与对策
- 关键词同质化：HowTo/FAQ/案例各司其职，避免重复长文；统一锚文本规范；
- 内容规模增长：以 Frontmatter 为中心的结构化，配合脚本校验与增量重建；
- 预填跳转：限制可传递参数白名单，防止 URL 注入与跟踪污染。
