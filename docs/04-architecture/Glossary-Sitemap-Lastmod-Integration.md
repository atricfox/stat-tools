# Glossary 接入 sitemap/lastmod 技术清单（草案）

状态：提案（待评审）  
范围：`/glossary/` 与 `/glossary/[slug]` 的站点地图与更新时间接入，不涉及页面样式。

## 1. 目标
- 将 Glossary（术语表）纳入站点地图，提供稳定可抓取的 URL 与正确的 lastmod。
- 确保与现有的总 Hub、主题 Hub、计算器页共存，避免结构化与索引冲突。

## 2. 数据契约（建议）
- 术语项（Term）：
  ```json
  {
    "slug": "standard-deviation",
    "title": "Standard Deviation",
    "updated": "2025-09-10T12:00:00Z",
    "relatedTools": ["/calculator/standard-deviation"],
    "relatedHubs": ["/descriptive-statistics/"]
  }
  ```
- 字段说明：
  - `updated`：ISO-8601 时间戳，作为 lastmod 的权威来源。
  - `relatedTools`/`relatedHubs`：用于内链与校验的引用（可选）。
- 列表页：有聚合视图，无需 `updated`，其 lastmod 取所有术语的最大 `updated`。

## 3. lastmod 来源优先级
1) Term.updated（ISO-8601）  
2) 文件 Git 提交时间（可选，CI 可读）  
3) 文件 mtime（本地构建回退）

## 4. 生成规则（与现有 sitemap 合并）
- 生成节点：
  - `/glossary/`（列表页）：`lastmod = max(terms.updated)`
  - `/glossary/[slug]`（详情页）：`lastmod = term.updated || fileTime`
- 合并策略：
  - 与 `/statistics-calculators/`、主题 Hub、`/calculator/*` 在同一 sitemap 输出；按固定优先级（priority）赋值。
  - 去重与 URL 规范：全部绝对路径；避免重复节点。
- 失败与容错：
  - 缺失 `updated` 时回退 fileTime，并记录警告（不阻塞）。
  - 数据不可解析时跳过该项并记录错误（可配置为 fail-fast）。

## 5. 结构化数据与 robots
- 详情页：
  - `DefinedTerm`（`name/termCode/description`）；
  - `about/mentions` 指向相关工具与主题 Hub；
  - `BreadcrumbList`：Home → Glossary → {Term}。
- 列表页：`CollectionPage` + `ItemList`（术语清单）。
- robots：确保 `robots.txt` 存在 `Sitemap:` 行；允许抓取 Glossary 路由。

## 6. 链接检查与质量保障
- 检查范围：
  - `relatedTools`：是否为站内工具页且存在；
  - `relatedHubs`：是否为总 Hub/主题 Hub 且存在；
  - 详情页正文内链接（若使用 MDX/富文本）：是否 200/存在。
- 结果分级：
  - Error：断链（应阻断 CI 或标为必修复）。
  - Warn：缺少 `updated`，或引用但非关键路径。

## 7. CI 集成建议
- 步骤：
  1) 解析 Glossary 数据（JSON/TS/MDX Frontmatter）并产出术语清单；
  2) 校验字段与链接；
  3) 生成 sitemap 节点（并快照比对变化：新增/删除/lastmod 变动）；
  4) 输出报告作为构件。
- 开关：
  - `GLOSSARY_CHECK_STRICT=true` 时断链直接 fail；否则仅警告。

## 8. 风险与对策
- 时间戳不规范：提供校验与自动修正（回退 fileTime），并在 PR 报告中提示。
- 规模扩张：按主题拆分术语文件，sitemap 可分页；或使用 index sitemap。
- 内链与内容重叠：Glossary 只做定义与导航，避免与工具/HowTo 的内容重复。

## 9. 验收（DoD）
- sitemap 中包含 `/glossary/` 与全部 `/glossary/[slug]`；
- lastmod 来源于 `updated`（或合理回退），非固定时间；
- 结构化数据（DefinedTerm、CollectionPage、BreadcrumbList）校验通过；
- 链接检查报告无 Error 级断链；robots.txt 含 Sitemap 行。

