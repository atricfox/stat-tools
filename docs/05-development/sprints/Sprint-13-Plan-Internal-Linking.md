# Sprint 13 计划 — 内部超链接联动内容系统（HowTo + 工具专题页 + FAQ + 案例）

状态: 提案（待评审）  
周期: 10 个工作日（2 周）  
协作: 产品 / 前端 / SEO / 内容 / 数据

上游文档:
- 需求: docs/02-requirements/06-internal-linking-content-system.md（权威）
- 架构: docs/04-architecture/Internal-Linking-WBS.md、docs/04-architecture/Link-Checker-Design.md
- 事件: docs/04-architecture/Event-Dictionary.md
- 设计系统: docs/04-architecture/06-design-system.md
- 测试清单: docs/05-development/testing/Internal-Linking-Test-Checklist.md

## 1) 目标与范围（Scope）
- 搭建 HowTo、FAQ、案例（Case）三类内容页（MDX + Frontmatter），并在工具页底部接入“相关内容”推荐区。
- 统一 JSON‑LD（HowTo/FAQPage-聚合/Article + BreadcrumbList）、内链规范、事件口径与 A11y/性能基线。
- 内容图（related/tags/mentions）用于推荐与站内联动；Link Checker 确保无断链。
- 预填跳转（HowTo → 工具）白名单与安全策略；不在本期接入 CMS/多语言（预留）。

## 2) 关键交付物（Deliverables）
- 路由与页面：`/how-to/[slug]`、`/faq/[slug]` + `/faq/`、`/cases/[slug]` + `/cases/`
- 工具页底部“相关内容”区（Related HowTo/FAQ/Cases）
- 内容索引（轻搜索，可选）与推荐逻辑（related > tags > mentions）
- 结构化数据：HowTo、FAQ聚合为 FAQPage、案例 Article/CreativeWork + BreadcrumbList
- 事件：howto_step_expand、howto_tool_cta_click、faq_expand、faq_to_*、case_to_tool_click、related_link_click、search_use
- Link Checker 报告（无 Error 级断链）与 A11y/性能达标

## 3) 用户故事（US）与验收标准（AC）

### US-IL-001 HowTo 详情页
- AC:
  - [ ] H1 + 摘要；步骤组件可折叠（默认全收起）；深链 `#step-n` 自动展开并滚动对齐；
  - [ ] 步骤末尾与侧栏/页尾提供“去工具试算”CTA（预填白名单）；
  - [ ] RelatedLinks 4–6 条；JSON‑LD: HowTo + HowToStep + BreadcrumbList；事件 `howto_step_expand`/`howto_tool_cta_click`。

### US-IL-002 FAQ（聚合 + 详情）
- AC:
  - [ ] `/faq/`：折叠列表 + 搜索；JSON‑LD: FAQPage + BreadcrumbList；
  - [ ] `/faq/[slug]`：单问正文 + RelatedLinks；`WebPage + BreadcrumbList`（不标注 FAQPage）；
  - [ ] 事件：faq_expand、faq_to_howto_click、faq_to_tool_click。

### US-IL-003 案例（Case）详情与聚合
- AC:
  - [ ] 详情：场景/过程/结果/反思；结论区“用本工具试算”CTA + “相关 FAQ”；
  - [ ] 插图/图表默认样式与懒加载；JSON‑LD: Article/CreativeWork + BreadcrumbList；
  - [ ] 事件：case_to_tool_click、related_link_click。

### US-IL-004 工具页底部“相关内容”
- AC:
  - [ ] 底部展示 ≤6 条（建议 2/2/2 类分布）；移动端默认 4 条 + 展开；
  - [ ] 排序：显式 related > tags ≥2 > mentions > 最近更新，类型打散；
  - [ ] 事件：related_link_click（from_type=tool）。

### US-IL-005 内容索引/搜索 与 Link Checker
- AC:
  - [ ] 内容索引（title/summary/tags/slug/type/updated）生成与轻搜索（≤500 条）；
  - [ ] Link Checker 报告无 Error 断链；变更集模式/忽略清单可用。

## 4) 技术任务（TECH）
- TECH-IL-01 MDX 目录与 Frontmatter 校验（Zod）：type/slug/title/summary/tags/related/mentions/seo/updated
- TECH-IL-02 HowToSteps/FAQList/CaseLayout/RelatedLinks 组件与布局（A11y）
- TECH-IL-03 JSON‑LD 注入：HowTo/FAQPage(聚合)/Article + BreadcrumbList
- TECH-IL-04 预填白名单与 URL 参数映射（工具页参数解码一致）
- TECH-IL-05 推荐器：related > tags > mentions > updated（打散类型）
- TECH-IL-06 内容索引与轻搜索（Fuse.js 可选）
- TECH-IL-07 事件上报实现与校验（与 UTM 自动合并）
- TECH-IL-08 Link Checker 接入与 CI 报告
- TECH-IL-09 A11y/性能（焦点环、懒加载、CLS≈0），首屏不投广告
- TECH-IL-10 单元/集成测试与回归（JSON‑LD、事件、渲染/搜索/推荐）
- TECH-IL-11 文档与上线流程（内容指南、预填白名单、测试清单）

## 5) 测试与验证（Testing）
- 结构化：HowTo/FAQ聚合/案例 + BreadcrumbList；FAQ 详情不得输出 FAQPage（构建/测试校验）
- 事件：mock gtag 载荷断言；GA4 DebugView 抽查
- 内链与导航：CTA/RelatedLinks 与“返回”路径正确
- 搜索与空态：聚合页搜索正常；空态提示
- A11y/性能：axe 通过；CLS≈0；插图/图表懒加载
- Link Checker：无 Error 断链；变更集模式

## 6) 日程与任务分解（≤8h 粒度）

| 任务ID | 描述 | 估时(h) | 负责人 | 依赖 | 检查点 |
|--------|------|---------|--------|------|--------|
| T001 | MDX 目录与 Frontmatter 校验（Zod） | 6 | FE | 无 | Day1 |
| T002 | HowToSteps/FAQList/CaseLayout/RelatedLinks 组件 | 8 | FE | T001 | Day2 |
| T003 | JSON‑LD 注入（HowTo/FAQ聚合/案例 + Breadcrumb） | 6 | FE | T002 | Day3 |
| T004 | 预填白名单与 URL 参数映射 | 6 | FE | T001 | Day3 |
| T005 | 推荐器（related/tags/mentions/updated） | 6 | FE | T002 | Day4 |
| T006 | 内容索引与轻搜索（可选） | 6 | FE | T001 | Day4 |
| T007 | 事件上报与校验 | 6 | FE | T002–T003 | Day4 |
| T008 | Link Checker 接入与 CI 报告 | 6 | FE/DevOps | T001 | Day5 |
| T009 | A11y/性能（焦点/懒加载/CLS） | 6 | FE | 并行 | Day5 |
| T010 | 单元/集成测试（JSON‑LD/事件/渲染/搜索/推荐） | 8 | FE | T002–T009 | Day6 |
| T011 | 文档与上线流程 | 4 | 产品/内容 | T001–T010 | Day6 |
| T012 | 预演与回归（含 GSC 检查） | 6 | FE/SEO | 全部 | Day7 |

缓冲/回旋：2 天（Day8–Day9）用于修复与设计回调；Day10 演示与评审。

## 7) 完成定义（DoD）
- [ ] 四类页面/区块渲染与交互可用；
- [ ] JSON‑LD 无 GSC 警告；FAQ 详情无 FAQPage Schema；
- [ ] 事件与 UTM 合并验证通过；
- [ ] Link Checker 无 Error 断链；
- [ ] A11y 快速审计通过；CLS≈0；首屏不投广告；
- [ ] 文档更新；预览评审通过。

## 8) 风险与对策
- 文案/结构化冲突：长度限制与校验；
- 断链：CI Link Checker + 变更集模式；
- 推荐质量：权重与打散策略可配；
- 预填安全：严格白名单；
- 设计一致性：遵循 06-design-system；变更前评审。

## 9) Sprint 看板条目列表（Issue 文案）
- 见同目录 `Sprint-13-Internal-Linking-Issues.(csv|md)`
