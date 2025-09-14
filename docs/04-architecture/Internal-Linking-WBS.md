# 内部超链接内容系统 实现清单与 WBS（草案）

状态：提案（待评审）  
范围：docs/02-requirements/06-internal-linking-content-system.md 对应的技术落地与排期。

## 0. 总览
- 目标：落地 HowTo / FAQ / 案例 三类内容的 MDX 渲染、内容图（related/mentions）、相关推荐、JSON‑LD、事件与站点地图。
- 输出：三类详情页 + 聚合页、相关链接组件、内容索引（轻搜索，可选）、链接检查 CI、预填跳转白名单。
- 不在本阶段：具体内容撰写、CMS 对接、多语言（仅预留）。

## 1) 阶段与里程碑
- Phase A（基础能力，1.5 周）
  - 目录/Frontmatter 契约、路由与 SSG、Breadcrumb、RelatedLinks（基于 related/tags）、HowTo/FAQ/Case JSON‑LD、基础事件
- Phase B（增强与质量，1 周）
  - 内链自动化（Glossary 关键词受控链接）、内容索引+轻搜索（Fuse.js）、链接检查 CI、sitemap/lastmod 接入
- Phase C（转化与优化，0.5–1 周）
  - 预填白名单/映射、A/B（入口位置/数量）、聚合页筛选/分页（如必要）
- Phase D（演进方向，占位）
  - CMS 对接、多语言、内容工作台（预览/校验工具）

> 估时为开发工作日，不含评审与内容产出；多人并行可压缩。

## 2) 模块 WBS（按阶段）

### Phase A — 基础能力（预计 7–8 天）
1. 内容目录与 Frontmatter
   - 输入：docs/05-development/templates/content-frontmatter.md
   - 产出：`content/howto|faq|cases` 目录结构与解析器（frontmatter + excerpt）
   - 依赖：无
   - 风控：frontmatter 不规范 → 增加 Zod 校验；提供示例文件
   - 估时：1d
2. 路由与 SSG/ISR
   - 输入：内容索引（构建期）
   - 产出：`/how-to/[slug]`、`/faq/[slug]`、`/cases/[slug]` 及聚合页
   - 依赖：Next.js 路由规范
   - 风控：生成量大 → 分页/分段渲染；ISR=7–14d 或按需 revalidate
   - 估时：2d
3. 组件与布局
   - 输入：设计规范（文档），主题样式
   - 产出：HowToSteps（可折叠）、FAQList（折叠）、CaseLayout、RelatedLinks、Breadcrumbs、CTA（工具直达）
   - 依赖：现有 UI 库/样式
   - 风控：无障碍与响应式 → 使用既有组件规范
   - 估时：2d
4. JSON‑LD 注入
   - 输入：前述内容结构
   - 产出：HowTo/FAQ/Article + BreadcrumbList 的 server 注入
   - 依赖：StructuredDataProvider（或页面内注入）
   - 风控：字段超长或缺失 → 限长与必填校验
   - 估时：1d
5. 事件基础上报
   - 输入：Event-Dictionary（docs/04-architecture/Event-Dictionary.md）
   - 产出：howto_step_expand / howto_tool_cta_click / faq_expand / related_link_click 上报
   - 依赖：`trackEvent()` 封装与 Consent Mode
   - 风控：去抖与参数校验 → 统一 util
   - 估时：1d

### Phase B — 增强与质量（预计 5 天）
6. 内链自动化（受控 Glossary 关键词）
   - 输入：Glossary 关键词表；停用词表；频率与位置规则
   - 产出：正文自动加链（首个出现，频率限制），可配置停用词
   - 依赖：渲染流程（MDX AST 或后处理）
   - 风控：误链风险 → 白名单 + 单测 + 预览
   - 估时：2d
7. 内容索引与轻搜索
   - 输入：内容索引（title/summary/tags/slug/type/updated）
   - 产出：聚合页前端搜索（Fuse.js），≤500 条；或主题内筛选
   - 依赖：构建期产出 JSON 索引
   - 风控：bundle 体积 → 索引拆分或延迟加载
   - 估时：1d
8. 链接检查 CI（参见 Link-Checker-Design）
   - 输入：topics JSON、Glossary 数据、MDX frontmatter/正文
   - 产出：`link-check-report.json` + 文本摘要；STRICT 开关
   - 依赖：CI 环境；可能无网络 → 使用静态匹配
   - 风控：误报 → 忽略清单与变更集模式
   - 估时：1d
9. sitemap/lastmod 接入
   - 输入：Frontmatter.updated / mtime；现有 sitemap 生成
   - 产出：三类详情/聚合节点；正确 lastmod；合并到现有 sitemap
   - 依赖：sitemap.ts
   - 风控：时间格式不合法 → 解析 + 回退
   - 估时：1d
10. Schema 校验（FAQ 详情页不输出 FAQPage）
   - 输入：SEO 策略（FAQ 聚合=FAQPage，详情=WebPage+BreadcrumbList）
   - 产出：构建/测试环节校验 JSON‑LD，确保 `/faq/[slug]` 未注入 `FAQPage`
   - 依赖：JSON‑LD 注入实现与测试工具
   - 风控：回归误标注 → 加入快照/断言；CI 报告
   - 估时：0.5d

### Phase C — 转化与优化（预计 3–5 天）
10. 预填白名单/映射
    - 输入：HowTo frontmatter prefill 映射；工具参数白名单
    - 产出：受控的工具预填 URL 跳转；异常参数丢弃
    - 依赖：工具页参数解析
    - 风控：注入/污染 → 严格白名单
    - 估时：1.5d
11. A/B 能力（入口位置/数量）
    - 输入：实验配置（环境变量/本地配置）
    - 产出：在主题/工具页切换 HowTo 入口位置/数量；上报对比
    - 依赖：事件口径
    - 风控：实验污染 → 采样/灰度
    - 估时：1d
12. 聚合页筛选/分页（可选）
    - 输入：内容量增长
    - 产出：聚合页筛选器/分页
    - 依赖：索引/数据
    - 风控：SEO（分页 canonical/prev/next）
    - 估时：0.5–1.5d

### Phase D — 演进方向（占位，无估时）
13. CMS 对接（Contentful/Sanity/Strapi）
14. 多语言（lang/translations）
15. 内容工作台（预览、校验、链接报告可视化）

## 3) 角色与依赖
- 前端：路由/组件/JSON‑LD/事件/搜索/预填
- 内容：Frontmatter 规范、HowTo/FAQ/Case 写作、关键词/停用词
- SEO：Schema 校验、sitemap/robots、索引策略
- 数据：事件口径校验、看板搭建
- 运维/CI：Link Checker、sitemap 构建、预览部署

## 4) 风险清单与对策
- 链接与内链质量：CI 检查 + 严格/宽松开关 + 变更集模式
- SEO 冲突：HowTo 仅在工具页或 HowTo 页标注，避免重复；FAQ 列表与详情去重
- 性能：索引体积控制；组件懒加载；SSR 直出 + 轻水合
- 合规：Consent Mode v2；事件避免 PII；外链 rel=nofollow（必要时）

## 5) 入口/出口定义（每阶段）
- Phase A 入口：模板与目录结构就绪；出口：三类页面可访问、JSON‑LD 注入、事件可观测
- Phase B 入口：A 阶完成；出口：自动内链上线、链接检查进入 CI、sitemap 更新、聚合页可搜索
- Phase C 入口：B 阶完成；出口：预填跳转合规可用、实验能力上线、聚合页具备筛选/分页（如启用）

## 6) 里程碑与评审
- M1（A 完成）：页面与 JSON‑LD 校验通过、事件入库、首批内容上线
- M2（B 完成）：链接报告稳定、GSC 无结构化告警、搜索可用
  （含 Schema 校验通过：FAQ 详情未输出 FAQPage）
- M3（C 完成）：CTA 转化提升评估、A/B 报告

---

备注：本 WBS 与以下文档配套使用：
- 需求：docs/02-requirements/06-internal-linking-content-system.md
- 事件：docs/04-architecture/Event-Dictionary.md
- 链接检查：docs/04-architecture/Link-Checker-Design.md
- 主题内容：docs/04-architecture/Topic-Content-JSON-Spec.md
