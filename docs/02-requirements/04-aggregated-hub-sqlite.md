# 统计计算器总 Hub（聚合导航页）需求文档（sqlite3）

> 术语约定：
> - “总 Hub（聚合导航页）”：全量入口页 `/statistics-calculators/`。
> - “主题 Hub”：如 `/gpa/`、`/descriptive-statistics/` 等按主题聚合的入口页。
> - “Glossary”：独立术语体系，不归入 Hub，见 `05-glossary-requirements.md`。

## 1. 产品目标与定位
- 实现“全部统计计算器单页、多分组聚合导航”页（以下简称“聚合导航页”），在一个 URL 下高效分发到所有工具。
- 兼顾 SEO（Topical Authority + 内链中心辐射）与用户体验（最快找到正确工具）。
- 由 sqlite3 持久化存储工具清单，支持脚本/后台增删改、排序、分组与标签管理；前端静态化/SSR 渲染。
- 与主题 Hub 策略对齐：聚合导航页为“总 Hub”，主题 Hub 与工具页互相内链（Glossary 相关请见独立文档“05-glossary-requirements”）。

## 2. 范围与导航信息架构
- URL：`/statistics-calculators/`（总 Hub/聚合导航页，单页、无分页）。
- 主题 Hub：`/gpa/`、`/descriptive-statistics/`（后续可复用同一数据源做分组视图）。
- 工具页（既有保留）：`/calculator/*`（如 `/calculator/mean`、`/calculator/standard-deviation`）。
- 术语表：另见独立文档“05-glossary-requirements”。
- 内链策略：
  - 聚合导航页 → 工具页（主 CTA）；
  - 聚合导航页 → 主题 Hub（分组区块“查看主题”）；
  -（可选）与术语互链：规范见“05-glossary-requirements”。

## 3. 数据模型（sqlite3）
- 表：calculator（必选）
```sql
CREATE TABLE calculator (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  group_name TEXT,
  is_hot INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  sort_order INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
```
- 表：group_meta（可选）
```sql
CREATE TABLE group_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  sort_order INTEGER
);
```
- 备注：可后续扩展多语言字段、热度统计字段、展示样式字段、广告位配置等。

## 4. 数据流与生成流程
- 维护方式：
  - A. 轻管理后台/脚本（CI 触发）维护 sqlite3；
  - B. 构建时导出 JSON（如 `data/calculators.json`，含分组聚合与 lastmod），供 Next.js 生成静态页面；
  - C. 或运行时通过简易 API Route 读取 sqlite3（低 QPS 下可用）。
- 构建策略：
  - 优先 SSG（静态化）+ 增量再生成；数据更新后触发重建。
  - 首屏渲染“热门 + 若干分组”，其余分组惰性加载（不影响 SEO 的 HTML 基础内容）。

## 5. 前台功能（聚合导航页）
- 顶部搜索：name/description 模糊匹配，高亮匹配词；回车跳对应卡片/锚点。
- 分组聚合：按 `group_name` 分块渲染；支持分组锚点与顶部 Tab 快捷切换。
- 卡片内容：名称、简介、进入按钮、标签（热门/新上新）。
- 推荐：`is_hot`、`is_new` 提升权重/置顶；移动端优化卡片栅格与快捷分组切换。
- 主题入口：在相关分组区块提供“去主题 Hub”按钮（如 GPA、Descriptive Statistics）。

### 5.1 主题 Hub 页面模块（细化要求）
- GPA Hub `/gpa/`
  - 子工具链接：`/calculator/gpa`、`/calculator/unweighted-gpa`、`/calculator/cumulative-gpa`、`/calculator/final-grade`、`/calculator/semester-grade`。
  - 选择指南（小卡片）：Weighted vs Unweighted、Semester vs Cumulative（极简图文，<60 字）。
  - FAQ：3–4 条（例：是否支持 4.0/4.3/4.5 标尺）。
  - 面包屑：Home → Statistics Calculators → GPA。

- Descriptive Statistics Hub `/descriptive-statistics/`
  - 子工具链接：`/calculator/mean`、`/calculator/median`、`/calculator/weighted-mean`、`/calculator/standard-deviation`、`/calculator/range`、`/calculator/percent-error`。
  - 选择指南（小卡片）：均值/中位数/众数适用、样本 vs 总体（指向标准差工具页完成选择）。
  - FAQ：3–4 条。
  - 面包屑：Home → Statistics Calculators → Descriptive Statistics。

## 6. SEO 与结构化数据（总 Hub/主题 Hub）
- 基础：唯一 H1（如“统计计算器大全/导航”），分组为 H2，卡片标题 H3/H4；可访问性语义标签。
- Meta：自动拼接 title/description（含核心关键词与主分组名）；canonical 指向 `/statistics-calculators/`。
- JSON‑LD：
  - 总 Hub与主题 Hub均使用 `CollectionPage` + `ItemList`（列出工具项 `name/url/description/position`）。
  - `BreadcrumbList`（Home → Statistics Calculators → {Topic}）。
  - FAQ（3–5 条，聚焦“如何选择/常见路径/工具差异”）。
- 内链：分组→工具页；聚合导航页↔主题 Hub；（Glossary 互链另见 05）；锚文本统一（如“标准差 Standard Deviation”）。
- Sitemap：包含聚合导航页、主题 Hub、工具页；`lastmod` 来自 sqlite 的 `updated_at` 聚合。（Glossary 见 05）

## 7. 广告与推荐位（与业务对齐）
- 站内原生广告：列表第 3/8 项后插卡；首屏不展示；惰性加载 + 曝光/点击埋点。
- Google Ads（可择期启用）：满足正向 ROAS/CPA 时启动小预算验证；落地页映射规则：
  - 高意图词 → 具体工具页；泛意图词 → 主题 Hub。
- 合规：Consent Mode v2 默认 denied，同意后 update；隐私与 Cookie 披露。

## 8. 性能与体验
- 采用 SSG/SSR + 缓存；首屏关键内容直出；其它分组惰性加载。
- 使用 IntersectionObserver、代码拆分与资源预取；保持 CLS≈0、良好 LCP/INP。
- 不加载未配置的 GA/GTM；广告脚本延迟、非阻塞。

## 9. Next.js 实现映射（本仓）
- 路由：
  - 聚合导航页：`app/statistics-calculators/page.tsx`
  - 主题 Hub（既有）：`app/gpa/page.tsx`、`app/descriptive-statistics/page.tsx`
-（Glossary 实现另见 05）
- 组件：
  - 复用 `src/components/hub/UnifiedHub.tsx`（配置为纯导航：`showSearch=true`、`showFilters=false`、`defaultView='categories'`、热门=4/6 可配）；或新增轻量 `AggregatedHub` 适配 sqlite 数据结构。
- 数据：
  - 构建导出：`scripts/export-calculators.ts` 读取 sqlite，输出 `data/calculators.json`；
  - 页面加载：服务端读取 JSON 注入；生成 `CollectionPage/ItemList/FAQ/Breadcrumb` JSON‑LD（复用 `StructuredDataProvider`）。
- 事件：
  - `hub_tool_click`、`faq_expand`、`ad_impression`、`ad_click`、`search_use`；
  - 已接入的 GA4/UTM：`utm_session_start`、事件参数自动合并 UTM；后续可配置 Google Ads 转化。（Glossary 事件另见 05）

## 10. 后台/数据维护（MVP）
- 维护入口可先用脚本（CSV/JSON → sqlite 导入）+ CI 触发构建；
- 字段维护：名称、简介、URL、分组、热门/新上新、排序；可一键批量设置分组显示顺序（`group_meta.sort_order`）。
- 数据更新后自动重建站点（SSG）并更新 sitemap。

## 11. 验收标准（DoD）
- 访问 `/statistics-calculators/`：单页列出全部计算器，分组清晰；搜索可用；热门/新上新可视化。
- 服务端注入 `CollectionPage/ItemList/Breadcrumb/FAQ` JSON‑LD；
- 内链：聚合导航页 → 工具页与主题 Hub；
- SEO：canonical 正确、站点地图含导航页，`lastmod` 合理；核心指标达标（LCP/CLS/INP）。
- 事件：点击卡片/FAQ 展开可见 GA4 事件；UTM 会话识别与事件参数带 UTM。
- 广告：原生广告位占位与曝光/点击埋点（可先占位后启用）。

## 12. 交付计划
- Sprint A（聚合导航页 MVP）
  - 数据导出脚本 + `data/calculators.json`；
  - `app/statistics-calculators/page.tsx` 页面渲染（搜索、分组、热门标签）；
  - 基础 SEO（JSON‑LD、Breadcrumb、FAQ）与事件埋点；sitemap 更新。
- Sprint B（主题联动 + 优化）
  - 与 `/gpa/`、`/descriptive-statistics/` 的联动展示；选择指南卡片；
  - 懒加载与性能优化、A/B（热门排序/卡片数/FAQ 位置）。
- Sprint C（后台与付费验证，可选）
  - 轻后台/接口维护 sqlite；小预算投放验证与转化配置（GTM/Ads）。

## 13. 风险与对策
- 分组/关键词同质化：聚合页只做选择与导航；深度解释在工具页；统一锚文本与 canonical。
- 数据一致性：以 sqlite 为单一事实源，导出 JSON 做版本化；构建失败回滚；
- 付费流量质量：严格否定词与地域/设备优化；不达标及时止损。

## 14. 附录
- 示例导出 JSON 结构
```json
{
  "groups": [
    {
      "group_name": "均值·加权平均",
      "display_name": "Means & Weighted Averages",
      "sort_order": 1,
      "items": [
        { "name": "Mean Calculator", "url": "/calculator/mean", "description": "Compute arithmetic mean", "is_hot": 1, "is_new": 0, "sort_order": 1 },
        { "name": "Weighted Mean Calculator", "url": "/calculator/weighted-mean", "description": "Compute weighted average", "is_hot": 0, "is_new": 0, "sort_order": 2 }
      ]
    }
  ],
  "lastmod": "2025-01-01T00:00:00Z"
}
```
- 示例分组建议：
  - 均值·加权平均；中位数·众数·极差；方差·标准差；Z 分数；置信区间；GPA/成绩类；描述性统计汇总。
