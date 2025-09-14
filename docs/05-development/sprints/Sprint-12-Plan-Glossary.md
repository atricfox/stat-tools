# Sprint 12 计划 — Glossary（术语表）

状态: 提案（待评审）  
周期: 10 个工作日（2 周）  
主题负责人: 产品 / 前端 / SEO / 内容 协同  
上游文档: 
- 需求: docs/02-requirements/05-glossary-requirements.md（权威）
- 架构: docs/04-architecture/Glossary-Sitemap-Lastmod-Integration.md
- 设计系统: docs/04-architecture/06-design-system.md
- 事件: docs/04-architecture/Event-Dictionary.md
- 链接检查: docs/04-architecture/Link-Checker-Design.md
- 测试清单: docs/05-development/testing/Internal-Linking-Test-Checklist.md

## 1) 目标与范围（Scope）
- 搭建 Glossary 总览 `/glossary/`（A–Z + 搜索）与术语详情 `/glossary/[slug]`（定义/误区/相关 CTA）。
- 结构化：列表页 `CollectionPage + ItemList + BreadcrumbList`；详情页 `DefinedTerm + BreadcrumbList`。
- Sitemap/lastmod：详情 `lastmod = updated || fileTime`；列表 `lastmod = max(updated)`。
- 内链：术语 ↔ 工具页/主题 Hub 双向互链；集成 Link Checker 防断链。
- A11y/性能：移动优先、键盘可达、首屏直出、懒加载插图；首屏不投广告。

不在范围：CMS 对接、多语言（仅预留）。

## 2) 关键交付物（Deliverables）
- 页面：`/glossary/`、`/glossary/[slug]`（Definition/误区/ToolCTA/TopicCTA/SeeAlso/RelatedLinks）
- 结构化数据：列表 `CollectionPage+ItemList+BreadcrumbList`；详情 `DefinedTerm+BreadcrumbList`
- Sitemap：合并 Glossary 列表与全部详情；`lastmod` 合规
- 事件：`glossary_click`、`glossary_to_tool_click`、`search_use`
- 链接质量：Link Checker 报告（无 Error 级断链）
- 文档：内容字段契约与发布流程

## 3) 用户故事（US）与验收标准（AC）

### US-GLOS-001 总览页（A–Z + 搜索）
- AC:
  - [ ] `/glossary/` 展示 A–Z 索引与搜索，移动端横向可滑；
  - [ ] 术语按首字母分组，TermCard 含标题+一行简述；
  - [ ] 搜索空态可用（图标+提示+“查看全部术语”）。

### US-GLOS-002 详情页（定义/误区/相关入口）
- AC:
  - [ ] `/glossary/[slug]` 展示 80–150 字定义、1–2 条误区，CTA 直达相关工具与主题 Hub；
  - [ ] SeeAlso：相关术语 4–8 个；
  - [ ] 侧栏/页尾 RelatedLinks：4–6 条（工具/主题优先）。

### US-GLOS-003 结构化数据与 SEO
- AC:
  - [ ] 列表页注入 `CollectionPage+ItemList+BreadcrumbList`；
  - [ ] 详情页注入 `DefinedTerm+BreadcrumbList`，`about/mentions` 指向工具/主题；
  - [ ] GSC 无结构化数据告警。

### US-GLOS-004 Sitemap/lastmod 与 robots
- AC:
  - [ ] 详情 `lastmod = term.updated || fileTime`；列表 `lastmod = max(terms.updated)`；
  - [ ] 站点地图含 `/glossary/` 与全部 `/glossary/[slug]` 节点；robots.txt 含 Sitemap 行。

### US-GLOS-005 链接质量与事件
- AC:
  - [ ] Link Checker 报告无 Error 级断链；
  - [ ] 事件 `glossary_click`/`glossary_to_tool_click`/`search_use` 载荷正确，自动合并 UTM。

## 4) 技术任务（TECH）
- TECH-GLOS-01 数据契约与样例：术语 JSON/TS（`slug/title/updated/relatedTools/relatedHubs`）
- TECH-GLOS-02 `/glossary/` A–Z 列表 + 搜索（前缀匹配，空态）
- TECH-GLOS-03 `/glossary/[slug]` 详情：DefinitionBlock/误区/ToolCTA/TopicCTA/SeeAlso/RelatedLinks
- TECH-GLOS-04 Schema 注入：列表 `CollectionPage+ItemList`、详情 `DefinedTerm+BreadcrumbList`
- TECH-GLOS-05 Sitemap 集成：读取术语 `updated` 生成 lastmod；合并到现有 sitemap
- TECH-GLOS-06 事件上报：`glossary_click`（term_slug、to）、`glossary_to_tool_click`（term_slug、tool_slug）
- TECH-GLOS-07 Link Checker 集成：related 链接/正文链接校验（CI 输出报告）
- TECH-GLOS-08 A11y/性能：焦点环、对比度、懒加载插图、首屏直出、CLS≈0
- TECH-GLOS-09 内容指南与上线流程：字段规范、命名/slug、updated 规则、审校流程

## 5) 测试与验证（Testing）
- 参考：docs/04-architecture/Link-Checker-Design.md、docs/05-development/testing/Internal-Linking-Test-Checklist.md
- 关键检查：
  - [ ] JSON‑LD 快照（列表/详情）；
  - [ ] Sitemap 节点与 lastmod；
  - [ ] 事件载荷（mock gtag）与 GA4 DebugView 抽查；
  - [ ] Link Checker 报告；
  - [ ] A11y（axe）与 CLS/LCP 抽样。

## 6) 日程与任务分解（1–8 小时粒度）

| 任务ID | 描述 | 估时(h) | 负责人 | 依赖 | 检查点 |
|--------|------|---------|--------|------|--------|
| T001 | 术语数据契约与样例（JSON/TS） | 6 | FE/内容 | 无 | Day1 |
| T002 | `/glossary/` A–Z 列表 + 搜索 | 8 | FE | T001 | Day2 |
| T003 | `/glossary/[slug]` 详情 UI（Definition/误区/CTA/SeeAlso） | 8 | FE | T002 | Day3 |
| T004 | JSON‑LD 注入（列表/详情） | 4 | FE | T002–T003 | Day3 |
| T005 | Sitemap 集成（lastmod from updated） | 6 | FE | T001 | Day4 |
| T006 | 事件上报与校验（`glossary_click`、`glossary_to_tool_click`、`search_use`） | 6 | FE | T002–T003 | Day4 |
| T007 | Link Checker 规则与报告集成 | 6 | FE/DevOps | T001 | Day5 |
| T008 | A11y/性能优化（焦点/懒加载/CLS） | 6 | FE | 并行 | Day5 |
| T009 | 单元/集成测试（JSON‑LD/事件/渲染） | 8 | FE | T002–T008 | Day6 |
| T010 | 内容指南与发布流程文档 | 4 | 产品/内容 | T001–T009 | Day6 |
| T011 | 预演与回归（含 GSC 检查点） | 6 | FE/SEO | 全部 | Day7 |

缓冲/回旋：2 天（Day8–Day9）用于修复与设计回调；Day10 演示与评审。

## 7) 完成定义（DoD）
- [ ] `/glossary/` 与 `/glossary/[slug]` 正常渲染与交互；
- [ ] JSON‑LD 注入无 GSC 警告；
- [ ] Sitemap/lastmod 正确；robots.txt 含 Sitemap 行；
- [ ] 事件与 UTM 合并验证通过；
- [ ] A11y 快速审计通过；CLS≈0、首屏不投广告；
- [ ] Link Checker 无 Error 级断链；
- [ ] 文档与指引更新；
- [ ] 评审通过并部署到预览环境。

## 8) 风险与对策
- 术语规模增长：索引/分页；让 Link Checker 仅校验变更集以控时；
- 时间戳不规范：`updated` 非法时回退 fileTime 并报警；
- 断链风险：CI 检查 + 严格/宽松开关；
- 事件口径偏差：集中封装与参数校验；
- 设计对齐：以 06-design-system 为准，组件变更提前评审。

## 9) Sprint 看板条目列表（Issue 文案）

- T001 术语数据契约与样例（JSON/TS）
  - 描述：定义术语结构（`slug/title/updated/relatedTools/relatedHubs`）与 2–3 个样例；约定 `updated` 为 ISO-8601；slug 命名规范。
  - 验收：契约文档化；样例可被路由与 sitemap 正确读取。
  - 依赖/预估：无；6h

- T002 `/glossary/` A–Z 列表 + 搜索
  - 描述：A–Z 索引条（Sticky/横滑）、术语按字母分组、搜索过滤；空态可用。
  - 验收：A–Z 跳转与搜索正常；移动端可滑；空态提示与“查看全部术语”。
  - 依赖/预估：依赖 T001；8h

- T003 `/glossary/[slug]` 详情 UI（Definition/误区/CTA/SeeAlso）
  - 描述：DefinitionBlock（80–150 字）、误区 1–2 条、ToolCTA/TopicCTA、SeeAlso Chips、RelatedLinks。
  - 验收：UI 符合设计；CTA 跳转正确；SeeAlso 4–8 条；RelatedLinks 4–6 条。
  - 依赖/预估：依赖 T002；8h

- T004 JSON‑LD 注入（列表/详情）
  - 描述：列表页注入 `CollectionPage+ItemList+BreadcrumbList`；详情页注入 `DefinedTerm+BreadcrumbList`。
  - 验收：快照稳定；GSC 无结构化告警。
  - 依赖/预估：依赖 T002–T003；4h

- T005 Sitemap 集成（lastmod from updated）
  - 描述：从术语数据 `updated` 生成详情/列表 lastmod 并合并到 sitemap。
  - 验收：sitemap 节点与 lastmod 正确；robots.txt 无变化。
  - 依赖/预估：依赖 T001；6h

- T006 事件上报与校验（glossary_* / search_use）
  - 描述：`glossary_click`（term_slug、to）、`glossary_to_tool_click`（term_slug、tool_slug）、`search_use`（query/results_count）。
  - 验收：mock gtag 载荷正确；GA4 DebugView 抽查可见。
  - 依赖/预估：依赖 T002–T003；6h

- T007 Link Checker 规则与报告集成
  - 描述：对 relatedTools/relatedHubs 与正文链接进行站内校验；输出 JSON 报告；STRICT 开关。
  - 验收：CI 报告无 Error 级断链；可配置忽略清单。
  - 依赖/预估：依赖 T001；6h

- T008 A11y/性能优化（焦点/懒加载/CLS）
  - 描述：焦点环、键盘可达、对比度；插图/图表懒加载；首屏直出；CLS≈0。
  - 验收：axe 审计通过；CLS≈0；移动端良好。
  - 依赖/预估：并行；6h

- T009 单元/集成测试（JSON‑LD/事件/渲染）
  - 描述：JSON‑LD 快照；事件载荷测试；渲染/搜索交互测试。
  - 验收：CI 通过；覆盖关键流。
  - 依赖/预估：依赖 T002–T008；8h

- T010 内容指南与发布流程文档
  - 描述：编写术语编写规范、命名/slug、更新流程（含 `updated` 字段）、发布校验清单。
  - 验收：内容团队可按文档独立更新；PR 审校流程清晰。
  - 依赖/预估：依赖 T001–T009；4h

- T011 预演与回归（含 GSC 检查点）
  - 描述：本地/预览演示；Search Console 检查结构化与索引；手动回归关键路径。
  - 验收：预演通过；GSC 无新告警；关键路径无阻断。
  - 依赖/预估：依赖全部；6h

