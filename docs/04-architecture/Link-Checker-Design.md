# 链接检查脚本设计（规范 + 伪流程）— 草案

状态：提案（待评审）  
用途：在 CI 中对站内链接进行静态与半动态校验，提前发现断链/错误锚点/越权外链，保障内容质量与 SEO。

## 1. 目标与范围
- 目标：构建前发现链接问题；输出机器可读报告与简明人类摘要；支持“严格/宽松”两种策略。
- 覆盖范围：
  - 主题外置 JSON：`data/topics/*.json` 中的 `guides[].href`、`faqs[].href`
  - Glossary 数据源：术语的 `relatedTools`、`relatedHubs`，以及正文内链接（若使用 MDX/富文本）
  - MDX 内容：`content/{howto|faq|cases}/**/*.mdx` Frontmatter 中 `related`、`mentions`，正文 Markdown 链接
  - 代码层面“已知路由清单”（可选）：`/calculator/*`、`/statistics-calculators/`、`/gpa/`、`/descriptive-statistics/`、`/glossary/*`

## 2. 规范与规则
- 链接规范：
  - 一律使用站内绝对路径（`/path`），避免协议与域名耦合；外链需进入 allowlist。
  - 禁止在可索引页使用 `#` 空锚；若为页面内锚点，需验证存在对应 `id`/`name`。
- 允许/拒绝：
  - allowlist：如 `https://accounts.google.com`（登录等特殊用途）
  - denylist：`mailto:`、`javascript:`、`data:`、明显广告/跟踪域名（团队维护）
- 严重级别：
  - Error：404/410/5xx、越权外链、锚点不存在、明显拼写错误（检测模式）
  - Warn：301/302（可改为最终 URL）、缺少终端路径末尾斜杠的规范问题、未在站点地图中

## 3. 输入与解析
- 主题 JSON：读取并解析 `guides[].href` 与 `faqs[].href`
- Glossary：读取术语集合，拼接详情页 URL `/glossary/{slug}`；解析 `related*` 链接
- MDX：解析 Frontmatter（YAML）与 Markdown AST，提取链接
- 路由清单：静态配置或从 Next routes 生成（如不易获取则使用已知前缀匹配）

## 4. 校验策略
- 站内路由存在性：
  - 静态匹配：与“已知前缀 + 路由枚举（可选）”比对
  - 半动态：若本地 dev server 可用，HEAD/GET 请求校验 200（CI 环境可跳过或 mock）
- 页面内锚点：构建 HTML 结构不可得时，采用“锚点声明文件”或“选择器规则”校验；否则降级为 Warn
- 外链：
  - 不允许除 allowlist 以外的外链；
  - 允许外链时仅做语法与域名检查，不做可达性请求（除非网络策略允许）

## 5. 伪流程
```text
collect_targets():
  links = []
  for file in data/topics/*.json:
    parse JSON, push guides[].href, faqs[].href into links
  for term in glossary source:
    links += term.relatedTools + term.relatedHubs + "/glossary/" + term.slug
  for mdx in content/**.mdx:
    parse frontmatter.related + frontmatter.mentions + markdown links
  return dedup(links)

validate(link):
  if isExternal(link):
    if domain not in allowlist -> Error
    else -> Warn (optional) or Skip
  else:
    if not link.startsWith('/') -> Error
    if hasHash(link):
      base, hash = split
      if base not in knownRoutes and not serverCheck(base): -> Error
      if !anchorKnown(hash) -> Warn/Error (configurable)
    else:
      if base not in knownRoutes and not serverCheck(base): -> Error

run():
  links = collect_targets()
  results = []
  for link in links: results += validate(link)
  print human summary (counts by severity/type)
  write results.json for CI artifact
  if STRICT and has Error -> exit 1
```

## 6. 输出格式
- 机器可读（JSON）：
```json
{
  "summary": { "errors": 2, "warnings": 5, "checked": 128 },
  "issues": [
    { "severity": "error", "type": "not_found", "file": "data/topics/gpa.json", "link": "/faq/gpa-scale", "hint": "Did you mean /faq/gpa-scales?" },
    { "severity": "warn", "type": "redirect", "file": "content/howto/sd.mdx", "link": "/calculator/stddev", "target": "/calculator/standard-deviation" }
  ]
}
```
- 人类摘要（文本）：
  - Errors: 2（not_found x1, external_disallowed x1）
  - Warnings: 5（redirect x3, anchor_missing x2）
  - Top offenders: data/topics/gpa.json（2）、content/howto/sd.mdx（1）

## 7. CI 集成
- 触发条件：修改 `data/topics/**`、`content/**`、Glossary 数据源、路由文件、sitemap 生成逻辑
- 步骤：
  1) 拉取代码、安装依赖；
  2) 运行链接收集与校验；
  3) 输出 `link-check-report.json` 与文本摘要到 Job 日志；
  4) 若 `GLOSSARY_CHECK_STRICT=true` 或 `LINK_CHECK_STRICT=true`，遇 Error 直接失败。

## 8. 性能与稳定性
- 去重 + 并发校验（限制并发数，如 10）；
- 在 CI 无网络/不稳定环境下，禁用真实网络请求，仅做静态前缀/路由匹配；
- 可缓存前次通过的链接哈希（可选）。

## 9. 可配置项
- 环境变量：`LINK_CHECK_STRICT`、`ALLOWED_EXTERNALS`（逗号分隔）、`ENABLE_SERVER_CHECK`、`SERVER_BASE`
- 忽略清单：`link-check.ignore`（glob + 正则），匹配后跳过但计数
- 锚点声明：`anchors.map.json`（路由 → 允许的锚点集合），用于校验页面内锚点

## 10. 风险与对策
- 假阳/假阴：提供“严格/宽松”模式；不可用时不阻塞构建（给出清晰警告）。
- 链接规模增长：分模块执行（topics / glossary / mdx），并允许只校验改动文件（变更集模式）。
- 维护成本：规范在文档中固定，尽量减少脚本内硬编码；域名白名单集中配置。

---

验收（DoD）
- PR 的链接检查任务可运行并输出报告；
- 错误级别问题能阻断合并（在严格模式下）；
- 报告可清晰定位文件与建议修复路径；
- 团队认可并采纳在默认 CI 流程中执行。

