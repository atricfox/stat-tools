# Sprint 14 计划 — Legal Pages（About Us / Privacy Policy / Terms of Service）

状态: 提案（待评审）  
周期: 5–7 个工作日（1–1.5 周）  
协作: 产品 / 前端 / SEO / 内容 / 法务

上游文档:
- 需求: `docs/02-requirements/legal-about-us.md`, `docs/02-requirements/legal-privacy-policy.md`, `docs/02-requirements/legal-terms-of-service.md`
- 设计系统: `docs/04-architecture/06-design-system.md`
- 事件: `docs/04-architecture/Event-Dictionary.md`
- 链接检查: `docs/04-architecture/Link-Checker-Design.md`
- 测试清单: `docs/05-development/testing/Internal-Linking-Test-Checklist.md`

## 1) 目标与范围（Scope）
- 落地 3 个法务/品牌页面：`/about`、`/privacy-policy`、`/terms-of-service`（英文内容）。
- 统一 SEO/结构化（`WebPage + BreadcrumbList`）、sitemap lastmod、A11y 与移动端体验。
- 支持 MDX + Frontmatter、目录 ToC（隐私/条款）、更新时间与版本展示；事件埋点。

不在范围：
- CMS 对接、多语言（仅预留）；复杂历史版本系统（仅指引）。

## 2) 关键交付物（Deliverables）
- 页面路由（Next.js App Router）与渲染：`/about`、`/privacy-policy`、`/terms-of-service`
- MDX 内容骨架（Frontmatter+章节）与 ToC
- 结构化数据：`WebPage + BreadcrumbList`
- sitemap 集成（lastmod from Frontmatter.updated）
- 事件：`legal_toc_click`、`legal_contact_click`、`legal_version_view`

## 3) 用户故事（US）与验收标准（AC）

### US-LEGAL-001 About Us（品牌页）
- AC:
  - [ ] H1/Title/Meta/Canonical 正确，Hero 段落+CTA 可见；
  - [ ] JSON‑LD: `WebPage + BreadcrumbList`；
  - [ ] 联系方式可见（邮箱/表单/GitHub），更新时间与版本展示；
  - [ ] 事件：`legal_contact_click`、`legal_version_view`。

### US-LEGAL-002 Privacy Policy（隐私政策）
- AC:
  - [ ] 结构清晰，ToC 与锚点可用（移动端折叠）；
  - [ ] JSON‑LD: `WebPage + BreadcrumbList`（聚合/详情概念不适用）；
  - [ ] Title/Meta 含 Privacy Policy 关键词；
  - [ ] 联系方式、更新时间与版本展示；
  - [ ] 事件：`legal_toc_click`、`legal_contact_click`、`legal_version_view`。

### US-LEGAL-003 Terms of Service（服务条款）
- AC:
  - [ ] 分节可读，ToC 与锚点可用；
  - [ ] JSON‑LD: `WebPage + BreadcrumbList`；
  - [ ] Title/Meta 覆盖服务条款关键词；
  - [ ] 联系方式、更新时间与版本展示；
  - [ ] 事件：`legal_toc_click`、`legal_contact_click`、`legal_version_view`。

## 4) 技术任务（TECH）
- TECH-LEGAL-01 路由与渲染：`app/about|privacy-policy|terms-of-service/page.tsx`（Server Component）
- TECH-LEGAL-02 MDX 内容骨架与 Frontmatter：`content/legal/*.mdx`（about/privacy/terms）
- TECH-LEGAL-03 ToC 与锚点：生成目录组件（移动端可折叠）
- TECH-LEGAL-10 LegalLayout：三栏/双栏/单列栅格布局（≥1280 三栏；≥1024 双栏；<1024 单列）
- TECH-LEGAL-11 RightRail 侧栏：ContactCard（邮箱/表单/社媒/GitHub）、MetaBar（版本/更新时间）、QuickLinks
- TECH-LEGAL-04 Metadata/JSON‑LD：`generateMetadata()` 与 `WebPage + BreadcrumbList`
- TECH-LEGAL-05 sitemap 集成：lastmod from Frontmatter.updated（fallback mtime）
- TECH-LEGAL-06 事件埋点：`legal_toc_click`、`legal_contact_click`、`legal_version_view`（自动合并 UTM）
- TECH-LEGAL-07 A11y/性能：焦点环、对比度、懒加载、CLS≈0
- TECH-LEGAL-08 单元/集成测试：渲染/ToC/JSON‑LD/事件；sitemap lastmod 快照
- TECH-LEGAL-09 文档：内容写作指引（与 `content-copy-cheatsheet.md` 对齐）、上线检查单

## 5) 测试与验证（Testing）
- 结构化：`WebPage + BreadcrumbList` 有效；Rich Results 无告警
- SEO：Title/Meta/Canonical 正确；sitemap lastmod 合法 ISO
- ToC/锚点：桌面/移动均可用；目录点击事件记录
- A11y：axe 快速审计通过；键盘可达；对比度 AA
- 性能：首屏直出、CLS≈0；插图懒加载

## 6) 任务分解（≤8h 粒度）

| 任务ID | 描述 | 估时(h) | 负责人 | 依赖 | 检查点 |
|--------|------|---------|--------|------|--------|
| T001 | 路由与渲染（3页） | 6 | FE | 无 | Day1 |
| T002 | MDX Frontmatter 与骨架（3个文件） | 6 | FE/内容 | T001 | Day1 |
| T003 | ToC 组件与锚点（隐私/条款） | 6 | FE | T001 | Day2 |
| T004 | Metadata 与 JSON‑LD 注入 | 4 | FE | T001 | Day2 |
| T005 | sitemap 集成（lastmod） | 4 | FE | T002 | Day2 |
| T006 | 事件埋点（toc/contact/version） | 4 | FE | T003–T004 | Day3 |
| T007 | A11y/性能优化 | 4 | FE | 并行 | Day3 |
| T008 | 单元/集成测试（渲染/ToC/JSON‑LD/lastmod/事件） | 6 | FE | T001–T007 | Day4 |
| T009 | 文档与上线检查单 | 4 | 产品/内容 | T001–T008 | Day4 |
| T010 | 预演与回归（含 GSC 检查） | 4 | FE/SEO | 全部 | Day5 |

追加子任务（UI 宽屏优化）

| 任务ID | 描述 | 估时(h) | 负责人 | 依赖 | 检查点 |
|--------|------|---------|--------|------|--------|
| T011 | LegalLayout 三栏/双栏/单列响应式实现 | 6 | FE | T001 | Day3 |
| T012 | RightRail 侧栏（ContactCard/MetaBar/QuickLinks） | 6 | FE | T001 | Day3 |
| T013 | ToC 粘性/高亮与移动折叠增强 | 4 | FE | T003 | Day3 |

缓冲：2 天用于修复与设计回调（如需要）。

## 7) 完成定义（DoD）
- [ ] 三页可访问，H1/Title/Meta/Canonical 正确；
- [ ] JSON‑LD 有效；sitemap.lastmod 正确；
- [ ] ToC/锚点与事件可用；
- [ ] A11y 审计通过；CLS≈0；移动端良好；
- [ ] 文档更新；预演通过并发布预览。

## 8) 风险与对策
- 文案/法务变更频繁 → Frontmatter `version/updated` 管理；变更走 PR；
- SEO/结构化冲突 → 仅注入 `WebPage + BreadcrumbList`，避免重复 `Organization`；
- 事件与同意 → 遵循 Consent Mode v2，未同意不激活 Analytics；
- 可读性 → 目录与分节，移动端合理行长与行距。

## 9) Sprint 看板条目列表（Issue 文案）
- 见同目录 `Sprint-14-Legal-Pages-Issues.(csv|md)`
