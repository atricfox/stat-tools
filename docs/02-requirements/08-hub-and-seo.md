# Hub 页面与 SEO / JSON-LD 模板说明

id: FRS-HUB-SEO-001
---
id: FRS-HUB-SEO-001
owner: @product-owner
acceptance: docs/acceptance/hub-and-seo.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 目的

该文档为 Hub 页面（`/statistics-calculators/`）与工具页的 SEO 与结构化数据规范，包含：

- URL 与 meta 模板规范
- JSON-LD 模板（HowTo / FAQPage / BreadcrumbList / Organization）示例
- sitemap / robots / hreflang 策略
- SSR/SSG 与缓存建议（性能与 CWV）
- 合规性（GDPR / 中国网络安全法 / GCP 部署 注意点）

请在 Review / Accept / Comment 之前确认是否需要把示例 JSON-LD 注入方式改为纯后端 SSR 或混合渲染。

## 交付清单（本步骤可验证交付物）

1. `specs/FRS/hub-and-seo.md`（本文件）。
2. JSON-LD 模板示例（HowTo / FAQ / Breadcrumb / Organization）。
3. URL 规范与 sitemap 规则表。
4. SEO 验收标准（GSC / Lighthouse / CWV 指标）。

## 一、URL 与 Meta 模板

| 类型 | 模板示例 | 说明 |
|---:|---|---|
| Hub 页 | `/statistics-calculators/` | 汇总首发工具，内部链接至各工具页（集群中心） |
| 工具页 | `/{tool-slug}` 例如 `/mean-calculator` | 简洁、可读、含关键字（英文），避免下划线与多级路径 |
| 参数化状态 | `/{tool-slug}?input=...&precision=2` | 用于复现页面状态，canonical 指向裸 URL（避免索引参数） |

Meta 模板（per-tool）：

- title: `{Tool Name} — Free {short purpose} Calculator | Stat Tools`
- meta description: `Quickly calculate {tool short desc}. Paste numbers, get step-by-step explanation and copyable formula.`
- canonical: point to canonical URL without transient params; use `rel=canonical` in head.

注意：为避免参数导致重复收录，canonical 应指向不带用户数据的 URL（保留 UTM / tracking via GSC）。若需要参数化示例页面（share links），使用 `link rel="alternate"` 或 short links 服务。

## 二、结构化数据（JSON-LD）模板

原则：仅暴露对搜索引擎有意义、且不包含 PII 的信息；JSON-LD 由服务器端 SSR 注入为首选方式（确保 GSC 抓取稳定）。

1) HowTo（用于首屏步骤 + Step-by-step 折叠）

示例模板（工具页通用替换字段：{title},{description},{step_list},{url}）

```json
{
  "@context": "https://schema.org",
  "@type": "HowTo",
  "name": "{title}",
  "description": "{description}",
  "url": "{url}",
  "step": [
    { "@type": "HowToStep", "name": "Step 1", "text": "Paste numbers or upload CSV." },
    { "@type": "HowToStep", "name": "Step 2", "text": "Set precision and options." },
    { "@type": "HowToStep", "name": "Step 3", "text": "Click Calculate and review results." }
  ]
}
```

2) FAQPage（常见问题，利于 Rich Snippet）

示例模板：

```json
{
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "How do I enter numbers?",
      "acceptedAnswer": { "@type": "Answer", "text": "You can paste numbers separated by commas, new lines or spaces." }
    }
  ]
}
```

3) BreadcrumbList

示例模板：

```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    { "@type": "ListItem", "position": 1, "name": "Home", "item": "https://example.com/" },
    { "@type": "ListItem", "position": 2, "name": "Statistics Calculators", "item": "https://example.com/statistics-calculators/" },
    { "@type": "ListItem", "position": 3, "name": "Mean Calculator", "item": "https://example.com/mean-calculator" }
  ]
}
```

4) Organization（站点级别）

示例模板：

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Stat Tools",
  "url": "https://example.com",
  "logo": "https://example.com/logo.png",
  "sameAs": ["https://twitter.com/yourhandle"]
}
```

插入位置与方法：

1. 优先 SSR 注入到页面 head（避免客户端延迟导致 GSC 抓取失败）。
2. 若使用 SSG（静态生成），在构建时生成对应 JSON-LD。对需要参数化的 share 链接，使用短链服务并在短链指向的页面注入静态 JSON-LD。

注意事项：

- JSON-LD 不应包含用户 raw_input 或任何 PII。仅包含 generic steps、title、url、示例数据。 
- 使用 GSC 的 URL Inspection 检查 Rich Results。若出现警告，根据 GSC 指引修复（通常是必填字段缺失或格式错误）。

## 三、sitemap / robots / hreflang 策略

1. sitemap.xml：列出 Hub 与工具页，优先级设置（hub 0.8，工具页 0.6–0.7），每天/每周更新频率视发布频率而定。不要在 sitemap 中包含带有用户私有参数的 URL（如 input 值）。
2. robots.txt：允许爬取 Hub 与工具页；阻止抓取测试环境路径；示例：

```
User-agent: *
Disallow: /admin/
Allow: /
Sitemap: https://example.com/sitemap.xml
```
3. hreflang / x-default：

- 英文为主站：在 head 中使用 `<link rel="alternate" hreflang="en" href="https://example.com/mean-calculator" />`。
- 若未来支持多区域，请添加 `x-default` 指向地区选择页。

## 四、SEO 与 CWV（性能）建议

1. 渲染策略：工具页首屏 SSR/SSG（首要内容与 JSON-LD）+ 客户端 hydration 负责交互。避免初次渲染等待大型 JS 包。 
2. 资源控制：延迟加载第三方脚本（analytics/ad）、使用 critical CSS inline、压缩图片与字体。 
3. CDN/Edge：静态资源与 SSG 页面放置在 CDN（带缓存控制），API 使用 edge functions（低延迟）。
4. Lighthouse/CWV 目标：LCP ≤ 2000ms（mobile），CLS ≤ 0.1，INP/FID 合理（或使用 INP 替代 FID）。

## 五、监测与埋点对齐（SEO + Analytics）

1. 建议事件与 GSC 联动：在 GA4 埋点中传入 `page_path` 与 `tool` 参数，便于将行为与 Search Console 的展示/点击关联分析（按 Google 限制匿名化处理）。
2. 埋点在用户触发重要交互时发送（calc_execute, copy_result, expand_steps, share_link）。避免将 raw_input 发送到 GA4（PII 风险）。

## 六、合规、隐私与 GCP 部署注意点

合规原则：最小化数据收集、用户同意、可删除/导出。以下为实现层面的建议：

1. GDPR：
   - 不将 raw_input 或用户成绩作为默认上报项至 GA4 / 后端。若需要调试，先做脱敏/哈希，并记录同意。  
   - 提供 Data Subject Access Request (DSAR) 的联系与流程文档（后续子文档）。

2. 中国网络安全法：
   - 若目标含中国用户并涉及跨境，需要数据出境评估与本地化策略（可能需本地缓存或 CDN 节点）。

3. GCP 部署要点：
   - 使用 Cloud Storage / CDN 托管静态 SSG 页面，Cloud Run / Cloud Functions 用于 API，Cloud KMS 管理密钥。 
   - 日志导出到 Logging（受限访问），并设置日志保留期与审计。 
   - IAM 策略最小权限：分析团队只读事件汇总，不能访问原始 raw_input（若保存则加密存储并限权）。

## 七、验收标准（SEO / 合规 / 性能）

1. Hub 与首发工具页被 Google 索引并在 GSC 中显示（至少被抓取且无结构化数据警告）。
2. JSON-LD 验证通过（使用 Google Rich Results Test / GSC），无 schema 错误或必填字段缺失。 
3. Lighthouse CI 基线：LCP ≤ 2000ms（mobile）、CLS ≤ 0.1、基本无可见阻塞渲染的第三方脚本。 
4. GA4 不含 raw_input 或 PII；事件能正确反映 `calc_execute`/`copy_result` 等行为。

## 八、实施步骤（最小化步骤 + 明确交付物）

1. Implement: 在 `specs/FRS/` 下新增 `seo-templates.md`（交付：JSON-LD 模板文件）—— 1 人日。
2. Implement: 为 Hub 与每个工具页 SSR 注入 JSON-LD（交付：部署 PR + GSC 验证截图）—— 1–2 人日。
3. Verify: 在 GSC 中逐页使用 URL Inspection 验证 Rich Results（交付：GSC 验证表）。

## 九、下一步（请选择一项）

1. Review: Accept — 我将把 JSON-LD 模板另存为 `specs/FRS/seo-templates.json` 并生成工具页示例（mean, stddev）。
2. Review: Comment - <修改点>。
3. Review: Modify - <先产出 Hub 页线框或 sitemap 示例>。

请以 “Review: Accept” 或 “Review: Comment - …” 或 “Review: Modify - …” 来继续。
