# 主题 Hub 统一样式与空态行为规范（草案）

状态：提案（待评审）  
范围：`/gpa/`、`/descriptive-statistics/` 等“主题 Hub”页面（不含 Glossary）

## 1. 目标与原则
- 统一使用同一视觉与交互（UnifiedHub），降低心智成本与维护成本。
- 主题页复用总 Hub 的组件与事件模型，仅通过“过滤视图”实现差异。
- 保留全站分类 Tabs，主题语境下只渲染与主题相关的内容，Tabs 不隐藏。

## 2. 组件与接口（不改代码行为，仅约定）
- 统一组件：`UnifiedHub`
- 主题适配参数：
  - `allowedToolUrls?: string[]` 仅渲染这些 URL 的工具（从 `calculators.json` 过滤得出）
  - `filterPredicate?: (tool) => boolean` 备用自定义过滤函数（如标签、权重）
- 建议配置（主题页默认）：
  - `showSearch=true`、`showFilters=false`、`defaultView='categories'`、`featuredSection=true`、`showBreadcrumb=false`

## 3. 分类 Tabs 与展示策略
- Tabs 数据：始终取“全站分类”（与总 Hub 一致）。
- 内容渲染：按 `allowedToolUrls`/`filterPredicate` 过滤后的集合进行；分类内若无条目，展示“空态”。
- 空态规范：
  - 文案：“该主题暂无此类工具”。
  - 二级动作（可选）：“前往总 Hub（聚合导航页）查看该分类”。
  - 可灰置当前 Tab 或保持可点击（保持一致性）。

## 4. 主题专属模块（指南/FAQ）
- 数据来源优先级：`data/topics/{topic}.json` > 主题内置默认。
- Guides 卡片字段：`{ title, text, icon?, href? }`
  - icon：受控白名单（lucide 名称），未知 icon 回退默认。
  - href：可跳转到 HowTo/FAQ/工具页，需通过链接检查脚本校验。
- FAQ 字段：`{ q, a, href? }`，支持折叠，`href` 指向详情。

## 5. 事件口径（GA4，自动合并 UTM）
- `hub_tool_click`: { tool_slug, group_name, position, context="topic_{id}" }
- `guide_card_click`: { topic_id, guide_title, href }
- `faq_expand`: { topic_id, question }
- `category_empty_view`: { topic_id, category_id }

说明：事件与总 Hub 口径保持一致，新增 context 与 topic_id 维度，便于对比不同主题的行为差异。

## 6. SEO 与 JSON‑LD
- 主题 Hub 页：
  - `CollectionPage` + 多个 `ItemList`（按分组渲染）
  - `BreadcrumbList`：Home → Statistics Calculators → {Topic}
  - FAQ（如有）仅在页面内容，不重复标注 HowTo（避免与工具/HowTo 冲突）
- canonical：指向主题路由（如 `/gpa/`）。

## 7. 数据依赖与校验
- 数据源：`data/calculators.json`（sqlite 导出，含 `groups[]` 与 `items[]`）。
- 过滤集合：从 `topics.ts` 的 `groupNames[]` 取匹配分组求并集 → 得到 `allowedToolUrls`。
- 质量校验：
  - `allowedToolUrls` 必须为 `/calculator/*` 前缀；无匹配时允许空集合但记录告警。
  - Guides/FAQ 中的 `href` 需通过链接检查脚本验证 200/存在。

## 8. 性能与体验
- SSR 直出主要内容；主题页关闭筛选器，减少水合开销。
- 图标与插画延迟加载；固定卡片高度或使用 skeleton，控制 CLS≈0。
- 首屏不投放广告，列表插位遵循总 Hub 策略（3/8）。

## 9. A/B 与可配置项（后续）
- 变量：Guides 卡片位置（上/下）、数量（2/3/4）、是否显示插画、Featured 区是否展示。
- 度量：`hub_tool_click`、`guide_card_click`、`faq_expand`、`category_empty_view` 的 CTR/分布。

## 10. 风险与对策
- 空态导致跳出：在空态处提供返回总 Hub 的路径，并保持搜索可用。
- 主题/分组映射变化：采用配置映射，避免 schema 变更，配合导出校验与告警。
- 事件膨胀：复用统一事件名，新增维度不改变 BI 下游模型。

---

验收（DoD，抽样）
- 主题页与总 Hub 视觉一致；Tabs 保留；空分类出现空态而非缺块。
- Guides/FAQ 可外置与热更新（ISR），链接经检查无 404。
- JSON‑LD 注入成功、canonical 正确、sitemap 有主题节点。

