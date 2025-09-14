# Sprint 12 — Glossary Issues

| ID   | Title                         | Description                                                                                 | Acceptance Criteria                                                    | Labels                     | Est.(h) | Depends On |
|------|-------------------------------|---------------------------------------------------------------------------------------------|------------------------------------------------------------------------|----------------------------|---------|------------|
| T001 | 术语数据契约与样例（JSON/TS)   | 定义术语结构(slug/title/updated/relatedTools/relatedHubs)并提供2–3个样例；updated为ISO；slug规范 | 契约文档化；样例可被路由与sitemap读取                                   | Glossary;Data;Spec        | 6       |            |
| T002 | /glossary/ A–Z 列表 + 搜索     | A–Z索引条(Sticky/横滑)、术语分组、搜索过滤；空态提示与返回入口                                 | A–Z跳转/搜索正常；移动端可滑；空态显示                                 | Glossary;UI;Search        | 8       | T001       |
| T003 | /glossary/[slug] 详情 UI       | Definition(80–150)/误区1–2条/ToolCTA/TopicCTA/SeeAlso/RelatedLinks                          | UI符合设计；CTA正确；SeeAlso 4–8；RelatedLinks 4–6                    | Glossary;UI               | 8       | T002       |
| T004 | JSON‑LD 注入（列表/详情)        | 列表：CollectionPage+ItemList+Breadcrumb；详情：DefinedTerm+Breadcrumb                       | 快照稳定；GSC无结构化告警                                             | Glossary;SEO;Schema       | 4       | T002;T003  |
| T005 | Sitemap 集成（lastmod=updated) | 术语updated生成详情/列表lastmod并合并sitemap                                                | 节点与lastmod正确；robots.txt无变化                                   | Glossary;Sitemap          | 6       | T001       |
| T006 | 事件（glossary_* / search_use) | glossary_click/ glossary_to_tool_click/ search_use 上报与校验                                 | mock gtag正确；DebugView可见                                          | Glossary;Analytics        | 6       | T002;T003  |
| T007 | Link Checker 规则与报告        | 校验relatedTools/relatedHubs与正文链接；输出JSON报告；STRICT开关                             | CI无Error断链；忽略清单可用                                            | Glossary;CI               | 6       | T001       |
| T008 | A11y/性能优化                  | 焦点环/键盘可达/对比度；插图懒加载；首屏直出；CLS≈0                                         | axe通过；CLS≈0；移动端良好                                            | Glossary;A11y;Performance | 6       |            |
| T009 | 单元/集成测试                  | JSON‑LD快照；事件载荷；渲染与搜索交互                                                        | CI通过；覆盖关键流                                                   | Glossary;Testing          | 8       | T002;T008  |
| T010 | 内容指南与发布流程文档         | 字段规范/slug/updated/发布流程；发布校验清单                                                | 内容团队可独立更新；PR流程清晰                                        | Glossary;Docs             | 4       | T001;T009  |
| T011 | 预演与回归（含 GSC 检查）      | 预览演示；GSC检查结构化与索引；关键路径回归                                                 | 预演通过；GSC无新告警；关键路径无阻断                                 | Glossary;Review           | 6       | ALL        |

