# 术语表（Glossary）需求说明（独立）

## 1. 摘要与目标
- 为统计学核心术语提供统一的简明解释页面，服务于用户教育与 Topical Authority。
- 以术语页与工具页/主题 Hub 的双向内链提升导航效率与 SEO 关联度。

## 2. 范围与信息架构
- 术语总览：`/glossary/`（A–Z 或分组列表 + 站内搜索，术语间交叉链接）。
- 术语详情：`/glossary/[slug]`（每个术语一页）。
- 首批术语（示例 11 个）：`mean`、`median`、`mode`、`standard-deviation`、`variance`、`range`、`weighted-average`、`gpa`、`sample-vs-population`、`z-score`、`confidence-interval`。

## 3. 页面内容与模块
- `/glossary/`
  - A–Z/分组列表，支持站内搜索，术语间交叉链接。
  - 可选热门术语区与“去相关主题/工具”引导。
- `/glossary/[slug]`
  - 简定义：80–150 字，直击应用语境。
  - 常见误区：1–2 条。
  - “去使用相关工具”按钮（链接到 `/calculator/*`）。
  - 相关术语列表（同类或对比概念）。

## 4. 结构化数据
- `/glossary/[slug]`：使用 `DefinedTerm`（`name/termCode/description`）。
  - 通过 `about/mentions` 指向相关主题 Hub 与工具 URL。
- `/glossary/`：`CollectionPage` + `ItemList`（术语清单）。
- 面包屑：`BreadcrumbList`（Home → Glossary → {Term}）。

## 5. 内链规范
- 术语页 ↔ 工具页/主题 Hub：正文锚文本与 `about/mentions` 保持一致（如“标准差 Standard Deviation”）。
- 统一锚文本/标题规范，避免权重稀释与关键词同质化。

## 6. 实现映射（Next.js）
- 路由：`app/glossary/page.tsx`、`app/glossary/[slug]/page.tsx`
- 数据：新增 `src/lib/glossaryData.ts`（`name/slug/brief/relatedTools/relatedHubs/relatedTerms`）。
- SEO 注入：扩展 `StructuredDataProvider` 支持 `DefinedTerm` 模板，通过 `generateMetadata()` 注入。

## 7. 事件与度量
- 事件：`glossary_click`、`glossary_to_tool_click`、`faq_expand`（如有）、`ad_impression`/`ad_click`（如有）。
- KPI：自然流量/CTR、术语→工具跳转率、FAQ 展开率、会话 RPM、广告曝光/点击率（如有）。

## 8. 验收标准（DoD）
- `/glossary/` 可浏览/搜索全部术语；
- `/glossary/[slug]` 展示定义、误区、到工具与相关术语的链接；
- 注入 `DefinedTerm`/`CollectionPage`/`ItemList`/`BreadcrumbList` JSON‑LD；
- 与工具页/主题 Hub 的双向内链落位且锚文本一致；
- 事件可在 GA4 中观测；核心指标达标（LCP/CLS/INP）。

## 9. 风险与对策
- 关键词同质化：Glossary 只做概念解释与导航，不承载工具使用教学；工具页承载深度内容。
- 规模扩张：先首批核心术语，后续按主题扩展并建立命名与 slug 规范。

