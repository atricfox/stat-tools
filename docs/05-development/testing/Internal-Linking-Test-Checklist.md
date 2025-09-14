# 内部超链接内容系统 测试清单（草案）

状态：提案（待评审）  
范围：HowTo / FAQ / 案例 / 工具专题页底部推荐区；含 Schema/事件/内链/性能。

## 1. 结构化数据（Schema）
- [ ] HowTo 详情：注入 `HowTo` + `HowToStep` + `BreadcrumbList`
- [ ] FAQ 聚合：注入 `FAQPage` + `BreadcrumbList`
- [ ] FAQ 详情：仅注入 `WebPage` + `BreadcrumbList`（不得出现 `FAQPage`）
- [ ] 案例详情：注入 `Article` 或 `CreativeWork` + `BreadcrumbList`
- [ ] 工具专题页：保持既有策略，不与 HowTo/FAQ 重复标注

校验方式：
- 单元/集成测试中快照比对 JSON‑LD（正则断言不得含有 `"@type":"FAQPage"` 于 `/faq/[slug]`）
- Search Console 富结果/结构化数据报告无告警

## 2. 内链与导航
- [ ] HowTo → 工具 CTA 存在且可点击；可选“预填”正确传参（白名单外丢弃）
- [ ] FAQ → HowTo/工具内链存在；点击跳转正确
- [ ] 案例结论区 → 工具/FAQ 入口存在
- [ ] RelatedLinks：各类型详情侧栏/页尾呈现 4–6 条，显式 related 优先
- [ ] 工具页底部推荐：桌面 ≤6 条（2/2/2 分布优先），移动默认 4 条 + 展开

## 3. 事件与归因（GA4/UTM）
- [ ] howto_step_expand 触发，含 howto_slug、step
- [ ] howto_tool_cta_click 触发，含 tool_slug、prefill
- [ ] faq_expand / faq_to_howto_click / faq_to_tool_click 触发
- [ ] case_to_tool_click / related_link_click 触发（from_type/to_type/to）
- [ ] search_use（聚合页）触发，含 query、results_count
- [ ] 所有事件均自动合并 UTM 参数（utm_*、gclid）

校验方式：
- 本地 e2e/集成测试中 mock gtag 断言事件载荷；GA4 DebugView 人工抽查

## 4. 搜索与空态
- [ ] FAQ/HowTo/Cases 聚合页搜索可工作；移动端键盘交互正常
- [ ] 搜索无结果空态（图标 + 提示 + “查看全部”）显示正确
- [ ] 主题页分类下为空：出现提示并提供回到总 Hub 该分类的链接

## 5. 可访问性（A11y）
- [ ] Steps/FAQ 折叠：aria-expanded/aria-controls 正确；键盘可达（Enter/Space）
- [ ] 焦点可见：focus-ring 样式统一；Tab 顺序正确
- [ ] 对比度：正文/链接/按钮满足 WCAG AA（抽查）

## 6. 性能与稳定
- [ ] 首屏直出 HTML，CLS≈0；广告占位固定高（非首屏）
- [ ] 插图/图表懒加载；超大图不阻塞首屏
- [ ] 构建生成的内容索引/相关性计算无超时；页面水合无严重告警

## 7. 链接质量（CI + 本地）
- [ ] topics JSON/Glossary/MDX 的站内链接通过 Link Checker（无 Error 级断链）
- [ ] 锚点链接有效（#step-n、A–Z 索引等）
- [ ] 外链受控在 allowlist 内（若有）

## 8. sitemap/lastmod
- [ ] HowTo/FAQ/Case 详情与聚合页正确纳入 sitemap
- [ ] lastmod 来源 Frontmatter.updated 或 mtime；格式合法（ISO）

## 9. 回归专项（防策略跑偏）
- [ ] FAQ 详情页不得输出 `FAQPage`（构建/测试双重校验）
- [ ] HowTo 步骤默认“全收起”；锚点直达自动展开
- [ ] 工具页底部推荐数量与分布遵循策略（显式 related 优先）

---

备注：与以下文档配套执行：
- 需求：docs/02-requirements/06-internal-linking-content-system.md
- 事件：docs/04-architecture/Event-Dictionary.md
- 链接检查：docs/04-architecture/Link-Checker-Design.md
- WBS：docs/04-architecture/Internal-Linking-WBS.md（Phase B 含 Schema 校验项）

