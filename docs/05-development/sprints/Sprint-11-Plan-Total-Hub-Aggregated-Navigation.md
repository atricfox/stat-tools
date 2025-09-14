# Sprint 11 计划 — 统计计算器总 Hub（聚合导航页）

状态: 提案（待评审）  
周期: 10 个工作日（2 周）  
主题负责人: 产品/前端/SEO 协同  
上游文档: 
- 需求: docs/02-requirements/04-aggregated-hub-sqlite.md（权威）
- 架构: docs/04-architecture/Topic-Hub-Design-Spec.md
- 设计系统: docs/04-architecture/06-design-system.md
- 事件: docs/04-architecture/Event-Dictionary.md
- 数据管线: docs/05-development/data-pipeline/README.md

## 1. 目标与范围（Scope）
- 以 sqlite3 为事实源，导出 `data/calculators.json`，在 `/statistics-calculators/` 渲染“总 Hub（聚合导航页）”。
- 主题 Hub（`/gpa/`、`/descriptive-statistics/`）统一外观到 `UnifiedHub`，并接入外置 Guide/FAQ 内容。
- SEO/Schema：CollectionPage + ItemList + BreadcrumbList；`sitemap` 的 `lastmod` 接入 `calculators.json`。
- 事件：`hub_tool_click`、`search_use`、`ad_*`、UTM 贯通；Consent Mode v2 默认 denied。
- A11y 与性能：首屏直出、CLS≈0、键盘可达；首屏不投广告、固定占位延迟加载。

不在本次范围：
- CMS 对接、多语言、更多主题拓展（仅保留占位能力）。

## 2. 关键交付物（Deliverables）
- 页面：`/statistics-calculators/`（总 Hub）、`/gpa/`、`/descriptive-statistics/`（统一样式）
- 数据产物：`data/calculators.json`（groups + lastmod）
- 结构化数据：总 Hub/主题 Hub 的 JSON‑LD 注入（CollectionPage/ItemList/BreadcrumbList）
- sitemap：从 `calculators.json` 读取 `lastmod` 并覆盖相关节点
- 事件：`hub_tool_click`、`search_use`、`ad_impression`、`ad_click` 上报（自动合并 UTM）
- 文档：开发与运营指引更新（数据管线/Analytics/Design 对齐）

## 3. 用户故事（US）与验收标准（AC）

### US-THUB-001 总 Hub 列表与搜索
- AC:
  - [ ] `/statistics-calculators/` 服务端渲染所有分组与工具卡片；
  - [ ] 搜索框支持名称/描述过滤；空态可用；
  - [ ] JSON‑LD: CollectionPage + ItemList + BreadcrumbList 注入无警告；
  - [ ] 事件：`search_use`、`hub_tool_click` 正确上报（含 position/group_name）。

### US-THUB-002 主题 Hub 统一样式与引导
- AC:
  - [ ] `/gpa/`、`/descriptive-statistics/` 由 `UnifiedHub` 统一渲染（allowedToolUrls 过滤）；
  - [ ] 顶部展现选择指南（GuideCards）与 FAQ（折叠）；
  - [ ] JSON‑LD 与总 Hub 一致（面包屑含主题）；
  - [ ] 返回总 Hub 链接；空分类显示友好提示；
  - [ ] 事件：`guide_card_click`、`faq_expand`。

### US-THUB-003 数据导出与 sitemap lastmod
- AC:
  - [ ] `scripts/export-calculators` 可导出校验通过的 `data/calculators.json`；
  - [ ] `sitemap.ts` 从 `calculators.json.lastmod` 写入 `/statistics-calculators/`、主题 Hub、`/calculator/*` 的 `lastmod`；
  - [ ] robots.txt 包含 Sitemap 行（保持现有策略）。

### US-THUB-004 广告占位与性能
- AC:
  - [ ] 列表第 3/8 项后固定占位，首屏不上广告；
  - [ ] CLS≈0；LCP/INP 基线达标；
  - [ ] 事件：`ad_impression`（进入视口）/`ad_click` 上报。

### US-THUB-005 A11y 与可用性
- AC:
  - [ ] 键盘可达：搜索、Tabs、Card、FAQ 折叠；
  - [ ] 焦点可见；对比度符合 WCAG AA；
  - [ ] 分区锚点“#”可复制，移动端长按提示。

## 4. 技术任务（TECH）
- TECH-THUB-01 sqlite3 → JSON 导出校验（URL 前缀、排序稳定、lastmod 聚合）
- TECH-THUB-02 `/statistics-calculators/` SSR 列表 + JSON‑LD + 空态/骨架屏
- TECH-THUB-03 `UnifiedHub` 主题适配（allowedToolUrls / filterPredicate）与统计口径
- TECH-THUB-04 主题页外置内容装载（`data/topics/*.json`）与图标白名单
- TECH-THUB-05 `sitemap.ts` 接入 calculators.json.lastmod
- TECH-THUB-06 事件上报与 UTM 合并校验（`hub_tool_click`、`search_use`、`ad_*`）
- TECH-THUB-07 A11y/性能检查与修复（焦点环、tab 顺序、CLS/LCP）
- TECH-THUB-08 文档更新（数据管线/Analytics/设计系统落地点）

## 5. 测试与验证（Testing）
- 参考: docs/05-development/testing/Internal-Linking-Test-Checklist.md（结构化/事件/内链/性能/A11y）
- 关键检查:
  - [ ] JSON‑LD 快照；
  - [ ] 事件载荷（mock gtag）；
  - [ ] sitemap `lastmod` 值与导出一致；
  - [ ] CLS/LCP 抽样；
  - [ ] A11y 快速审计（axe）

## 6. 日程与任务分解（1–8 小时粒度）

| 任务ID | 描述 | 估时(h) | 负责人 | 依赖 | 检查点 |
|--------|------|---------|--------|------|--------|
| T001 | 导出校验完善（URL 前缀/排序/lastmod） | 6 | FE | sqlite 种子 | Day1 |
| T002 | 总 Hub SSR + 搜索 + 空态/骨架 | 8 | FE | T001 | Day2 |
| T003 | 总 Hub JSON‑LD 注入（CollectionPage/ItemList/Breadcrumb） | 4 | FE | T002 | Day2 |
| T004 | 主题 Hub 统一样式（`UnifiedHub` 过滤） | 6 | FE | T002 | Day3 |
| T005 | 外置 Guide/FAQ 读取与图标白名单 | 4 | FE | T004 | Day3 |
| T006 | sitemap 接入 calculators.json.lastmod | 4 | FE | T001 | Day3 |
| T007 | 事件上报核对（`hub_tool_click`/`search_use`/`ad_*`） | 6 | FE | T002 | Day4 |
| T008 | A11y/性能优化（焦点环/CLS/懒加载） | 6 | FE | 并行 | Day4 |
| T009 | 单元/集成测试（JSON‑LD、事件、渲染） | 8 | FE | T002–T008 | Day5 |
| T010 | 文档更新（README/指引/设计标注） | 4 | FE | T001–T009 | Day6 |
| T011 | 预演与回归（含 GSC 检查点） | 6 | FE/SEO | 全部 | Day7 |

缓冲/回旋：2 天（Day8–Day9）留给跨端修复与设计回调；Day10 演示与评审。

## 7. 完成定义（DoD）
- [ ] `/statistics-calculators/`、`/gpa/`、`/descriptive-statistics/` 正常渲染与交互；
- [ ] JSON‑LD 注入无 GSC 警告；sitemap.lastmod 正确；
- [ ] 事件与 UTM 合并验证通过；
- [ ] A11y 快速审计通过；CLS≈0、首屏不投广告；
- [ ] 文档与指引更新；
- [ ] 评审通过并部署到预览环境。

## 8. 风险与对策
- 导出数据质量：导出脚本 fail-fast + 报警；
- Schema 回归：加入 JSON‑LD 快照测试；
- CLS/性能抖动：固定占位/懒加载；
- 事件口径偏差：统一 util + 字段校验；
- 设计对齐：以 06-design-system 为准，组件变更提前评审。

## 9. Sprint 看板条目列表（Issue 文案）

- T001 导出校验完善（URL 前缀/排序/lastmod）
  - 描述：完善 sqlite3 → JSON 导出校验：`/calculator/*` 前缀校验、分组/组内排序稳定（sort_order→name）、`lastmod` 聚合为最大 `updated_at`。输出 `data/calculators.json`，失败 fail-fast（CI 早失败）。
  - 验收：`calculators.json` 生成且 schema 校验通过；错误时明确记录坏记录 ID。
  - 依赖/预估：依赖种子数据；6h  
  - 参考：docs/05-development/data-pipeline/README.md

- T002 总 Hub SSR + 搜索 + 空态/骨架
  - 描述：在 `/statistics-calculators/` 服务端渲染分组与工具卡；接入搜索（名称/描述模糊）；空态与骨架屏。
  - 验收：可渲染与搜索；空态提示与“返回全部”按钮可用；回退数据可用。
  - 依赖/预估：依赖 T001；8h  
  - 参考：docs/02-requirements/04-aggregated-hub-sqlite.md

- T003 总 Hub JSON‑LD 注入（CollectionPage/ItemList/Breadcrumb）
  - 描述：注入 `CollectionPage + ItemList + BreadcrumbList` 到总 Hub；GSC 无告警。
  - 验收：JSON‑LD 快照稳定；Search Console 富结果检查无新告警。
  - 依赖/预估：依赖 T002；4h

- T004 主题 Hub 统一样式（UnifiedHub 过滤）
  - 描述：`/gpa/`、`/descriptive-statistics/` 统一用 `UnifiedHub` 渲染，使用 `allowedToolUrls` 过滤；保留全站分类 Tabs。
  - 验收：视觉与交互与总 Hub 一致；空分类显示友好提示；返回总 Hub 链接存在。
  - 依赖/预估：依赖 T002；6h  
  - 参考：docs/04-architecture/Topic-Hub-Design-Spec.md

- T005 外置 Guide/FAQ 读取与图标白名单
  - 描述：主题页读取 `data/topics/{topic}.json`；支持 icon 白名单（见 Topic-Content-JSON-Spec）；Guide/FAQ 展示与链接。
  - 验收：外置优先、内置回退；未知 icon 回退默认图标；链接通过 Link Checker。
  - 依赖/预估：依赖 T004；4h  
  - 参考：docs/04-architecture/Topic-Content-JSON-Spec.md

- T006 sitemap 接入 calculators.json.lastmod
  - 描述：`sitemap.ts` 从 `calculators.json.lastmod` 写入 `/statistics-calculators/`、主题 Hub、`/calculator/*` 的 `lastmod`。
  - 验收：站点地图节点 lastmod 与导出一致；robots.txt 保持 Sitemap 行。
  - 依赖/预估：依赖 T001；4h

- T007 事件上报核对（hub_tool_click/search_use/ad_*）
  - 描述：统一事件上报点；参数：`tool_slug/group_name/position/context`、`query/results_count`、`slot/position`；自动合并 UTM。
  - 验收：本地 mock gtag 断言载荷正确；GA4 DebugView 抽查可见。
  - 依赖/预估：依赖 T002；6h  
  - 参考：docs/04-architecture/Event-Dictionary.md

- T008 A11y/性能优化（焦点环/CLS/懒加载）
  - 描述：焦点环与键盘可达；广告固定占位延迟加载；首屏直出、CLS≈0；图标/插图懒加载。
  - 验收：axe 快速审计通过；CLS≈0；首屏不上广告。
  - 依赖/预估：并行；6h  
  - 参考：docs/04-architecture/06-design-system.md

- T009 单元/集成测试（JSON‑LD、事件、渲染）
  - 描述：JSON‑LD 快照；事件载荷测试（mock gtag）；渲染与搜索交互测试。
  - 验收：CI 通过；关键流覆盖（总 Hub/主题 Hub）。
  - 依赖/预估：依赖 T002–T008；8h  
  - 参考：docs/05-development/testing/Internal-Linking-Test-Checklist.md

- T010 文档更新（README/指引/设计标注）
  - 描述：更新数据管线、Analytics、Design 对齐与使用说明；补充 README 与指引链接。
  - 验收：文档可被新成员独立跟随；关键路径清晰。
  - 依赖/预估：依赖 T001–T009；4h

- T011 预演与回归（含 GSC 检查点）
  - 描述：预演流程；Search Console 检查结构化与收录；手动回归关键路径。
  - 验收：预演通过；GSC 无新告警；关键路径无阻断。
  - 依赖/预估：依赖全部；6h
