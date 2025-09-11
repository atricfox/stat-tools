# 统计工具网站 Hub 与术语表（Glossary）需求说明

## 摘要
- 首期范围：总 Hub + 主题 Hub（GPA、Descriptive Statistics）+ 术语表（含 confidence-interval）。
- 定位：纯导航型 Hub（不内嵌计算器）；总 Hub 首屏热门工具显示 4 个。
- 商业：仅启用原生广告位（联盟在第二阶段接入）。
- SEO：Hub 使用 CollectionPage/ItemList/FAQ/Breadcrumb；术语表使用 DefinedTerm；构建清晰的中心辐射内链。

## 目标与原则
- 目标：最大化商业与 SEO 价值，同时保证“最快找到正确工具”的用户体验。
- 原则：
  - 纯导航：Hub 不嵌入代表性计算器，聚焦分发与选择。
  - Topical Authority：总 Hub → 主题 Hub → 工具页（Spoke）内链闭环，术语与 Hub/工具双向链接。
  - 技术 SEO：结构化数据完整、稳定的 URL 层级、最小 JS、良好核心指标（LCP/CLS/INP）。

## 信息架构与 URL
- 总 Hub（全站目录）：`/statistics-calculators/`
  - 必显链接：`/calculator/mean`、`/calculator/weighted-mean`、`/calculator/gpa`、`/calculator/standard-deviation`
- 主题 Hub（首批）：
  - GPA Hub：`/gpa/`（GPA、Unweighted GPA、Cumulative GPA、Final Grade、Semester Grade）
  - Descriptive Hub：`/descriptive-statistics/`（Mean、Median、Weighted Mean、Standard Deviation、Range、Percent Error）
- 工具页（既有保留）：`/calculator/*`（如 `/calculator/gpa`, `/calculator/mean`, `/calculator/standard-deviation`）
- 术语表：
  - 总览：`/glossary/`
  - 详情：`/glossary/[slug]`
  - 首批术语（11 个）：`mean`、`median`、`mode`、`standard-deviation`、`variance`、`range`、`weighted-average`、`gpa`、`sample-vs-population`、`z-score`、`confidence-interval`

## 页面模块（纯导航取向）
- 总 Hub `/statistics-calculators/`
  - H1 + 副文案（<50 字，承诺“快速找到合适的统计工具”）。
  - 热门工具卡组（4 个）：Mean、Weighted Mean、GPA、Standard Deviation。
  - 主题分区卡片：Descriptive Statistics、Academic（GPA）。
  - 工具目录（ItemList）：按任务/热度排序，首屏显示 Top 6，其余展开/惰性加载。
  - FAQ：聚焦“如何选择/最常见路径”，3–5 条。
  - Breadcrumb：全站层级可见。
  - 原生广告：列表第 3/8 项后插位；首屏无广告；移动端底部轻粘性提示（不遮挡主 CTA）。

- GPA Hub `/gpa/`
  - 子工具链接：`/calculator/gpa`、`/calculator/unweighted-gpa`、`/calculator/cumulative-gpa`、`/calculator/final-grade`、`/calculator/semester-grade`。
  - 选择指南（小卡片）：Weighted vs Unweighted、Semester vs Cumulative（极简图文，<60 字）。
  - FAQ：3–4 条（例：是否支持 4.0/4.3/4.5 标尺）。
  - Breadcrumb + 返回总 Hub。

- Descriptive Hub `/descriptive-statistics/`
  - 子工具链接：`/calculator/mean`、`/calculator/median`、`/calculator/weighted-mean`、`/calculator/standard-deviation`、`/calculator/range`、`/calculator/percent-error`。
  - 选择指南（小卡片）：均值/中位数/众数适用、样本 vs 总体（指向标准差工具页完成选择）。
  - FAQ：3–4 条。
  - Breadcrumb + 返回总 Hub。

- 术语表
  - `/glossary/`：A–Z 或分组列表 + 站内搜索，术语间交叉链接。
  - `/glossary/[slug]`：简定义（80–150 字）+ 常见误区（1–2 条）+ “去使用相关工具”按钮 + 相关术语列表。

## 结构化数据（JSON‑LD）
- 总 Hub、主题 Hub：
  - `WebSite`、`Organization`（全站一次注入）。
  - `BreadcrumbList`（强化层级）。
  - `CollectionPage` + `ItemList`（列出工具项：`name/url/description/position`）。
  - `FAQPage`（来自真实搜索意图与站内搜索）。
- 术语表：
  - `/glossary/[slug]`：`DefinedTerm`（`name/termCode/description`），并通过 `about/mentions` 指向相关 Hub 与工具 URL。
  - `/glossary/`：`CollectionPage` + `ItemList`（术语清单）。

## 实现映射（Next.js）
- 路由：
  - 总 Hub：`app/statistics-calculators/page.tsx`
  - 主题 Hub：`app/gpa/page.tsx`、`app/descriptive-statistics/page.tsx`
  - 术语表：`app/glossary/page.tsx`、`app/glossary/[slug]/page.tsx`
- 组件复用：
  - Hub：`UnifiedHub`（配置为纯导航：`showSearch=false`、`showFilters=false`、`defaultView='categories'`、热门=4）。
  - 主题过滤：基于 `toolsDataManager.filterTools()` 显示所属工具；补充“选择指南”小卡片与 FAQ。
  - SEO 注入：扩展 `StructuredDataProvider` 支持 `CollectionPage`、`ItemList`、`DefinedTerm` 模板；通过 `generateMetadata()` 注入。
- 数据：新增 `src/lib/glossaryData.ts`（`name/slug/brief/relatedTools/relatedHubs/relatedTerms`）。

## 商业与合规
- 原生广告：
  - 仅 Hub 页面投放；首屏不展示；列表第 3/8 项后插卡；曝光惰性加载与曝光/点击埋点。
  - 控制密度与可见性阈值，避免打断主任务路径。
- 联盟（第二阶段）：
  - 预留“精选课程/教材”区位，默认隐藏，待接入后按主题精准露出。

## 内链规范
- 工具页 → 所属主题 Hub（固定段落“更多此类工具”）。
- 主题 Hub → 子工具（`ItemList`）+ 返回总 Hub；横向仅链接强相关兄弟工具，避免权重稀释。
- 术语页 ↔ 工具页/主题 Hub（`about/mentions` 与正文锚文本一致）。
- 统一锚文本/标题（如“标准差 Standard Deviation”、“样本 vs 总体”）。

## 事件与度量
- 事件：`hub_tool_click`、`hub_filter_use`（如启用）、`faq_expand`、`ad_impression`、`ad_click`、`glossary_click`。
- KPI：Hub→工具 CTR、自然流量/CTR、会话 RPM、FAQ 展开率、术语→工具跳转率、广告曝光/点击率。
- A/B：热门工具排序（热门 vs 任务优先）、主题 Hub 是否展示“选择指南”卡片、热门卡数量（4 已定，后续可试 6）、广告卡位（3/8 vs 4/9）。

## 验收对齐
- 存在 `/statistics-calculators/`，展示 mean、weighted-mean、gpa、standard-deviation 链接。
- 服务端注入 HowTo/FAQ/CollectionPage/ItemList/Breadcrumb 等 JSON‑LD。
- 站点地图含 Hub→Spoke 清单；robots 允许抓取；canonical 正确；核心指标达标。

## 交付计划（两阶段）
- Sprint A（总 Hub + 两主题 Hub）
  - 新建 3 个页面路由、接入 `UnifiedHub`、热门卡组=4。
  - 注入 `CollectionPage/ItemList/Breadcrumb/FAQ`。
  - 原生广告占位与曝光/点击埋点。
- Sprint B（术语表 + SEO 完整化）
  - `glossaryData.ts` + `/glossary/*` 两个页面。
  - `DefinedTerm` 模板、Hub/工具 ↔ 术语内链落位；Search Console 结构化数据校验微调。

## 风险与对策
- 关键词同质化：Hub 只做选择与导航；深度解释在工具页；canonical 精确；锚文本一致。
- 广告干扰：密度限制+首屏不投放；曝光阈值；监控跳出率变化与回退机制。
- 主题稀释：Descriptive Hub 仅包含描述性统计工具，避免引入推理统计工具。

## 决策记录（已确认）
- 采用“总 Hub + 主题 Hub”为首期范围；首批主题：GPA 与 Descriptive Statistics。
- Hub 纯导航，不内嵌代表性计算器。
- Descriptive Hub URL 使用 `/descriptive-statistics/`。
- 总 Hub 首屏热门工具显示 4 个。
- 术语表首批纳入 `confidence-interval`。
- 广告与联盟优先级：先启用原生广告位；联盟在第二阶段接入。

## 附录：术语首批清单
- mean
- median
- mode
- standard-deviation
- variance
- range
- weighted-average
- gpa
- sample-vs-population
- z-score
- confidence-interval

