# 系统功能需求规格说明书（FRS）总文档索引

id: FRS-INDEX-001
---
id: FRS-INDEX-001
owner: @product-owner
acceptance: docs/acceptance/frs-index.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 一、目的

本文件作为项目 FRS 的总索引与汇总，记录每个模块的状态、可验证交付物位置、合规与完整性检查摘要，以及下一步优先级。单模块的详细 FRS 存放于 `specs/FRS/` 目录（例如 `mean-calculator.md`）。

## 二、可验证交付物清单（每项为单一交付物）

1. `specs/FRS/mean-calculator.md` — 已完成（含 API 示例、埋点、测试用例、合规快速检查）。
2. `specs/FRS/weighted-mean-calculator.md` — 待创建。
3. `specs/FRS/gpa-calculator.md` — 待创建。
4. `specs/FRS/standard-deviation-calculator.md` — 待创建。
5. `specs/FRS/confidence-interval-mean.md` — 待创建。
6. `specs/FRS/frs-index.md`（本文件） — 总览与合规快检。

## 三、模块状态表

| 模块 | 文件路径 | 状态 | 主要交付物 |
|---:|---|---:|---|
| Mean Calculator | `specs/FRS/mean-calculator.md` | Done | 功能规格、API 示例、事件埋点、测试用例、合规模块 |
| Weighted Mean | `specs/FRS/weighted-mean-calculator.md` | Planned | 规格待产出 |
| GPA Calculator | `specs/FRS/gpa-calculator.md` | Planned | 规格待产出 |
| Standard Deviation | `specs/FRS/standard-deviation-calculator.md` | Planned | 规格待产出 |
| Confidence Interval (Mean) | `specs/FRS/confidence-interval-mean.md` | Planned | 规格待产出 |
| Hub 页 & Sitemap | `specs/FRS/hub-and-seo.md` | Planned | Hub 页面规范、JSON-LD 模板、sitemap 规范 |

## 四、总体合规与完整性快速检查（聚焦已完成/正在进行项）

| 项目 | 覆盖位置 | 状态 | 需补充项（行动点） |
|---:|---|---:|---|
| GCP 部署要点 | 部署/运维章节（待完善） | Partial | 明确 IAM、KMS、日志策略、VPC/网络边界；写入 `specs/FRS/deployment.md` |
| GDPR / 隐私 | Mean 模块（已列出建议） | Partial | 增加 DSAR 流程、数据处理矩阵、匿名化方案、用户同意(UI) 实现方式 |
| 中国网络安全法 | 合规章节（待完善） | Partial | 若目标含中国用户，需做数据出境评估及本地化策略说明 |
| 21 CFR Part 11 | 合规章节（条件适用） | Deferred/Conditional | 若业务涉及受监管数据，需专门编写审计与签名控制文档 |

备注：详细合规实施（例如 KMS key 命名、日志保留天数、DPIA 文档）将作为子交付物在 `specs/FRS/` 中独立说明。

## 五、FRS 版式与检验规则（团队须遵守）

1. 每个模块为单一可验证交付物（一个 Markdown 文件），包含：概览、输入/输出契约、UI 行为、验收标准、埋点表、测试用例、合规检查。 
2. 所有 API 示例遵循 JSON 结构化示例，必要时补充 OpenAPI 摘要。 
3. 合规检查必须包含：数据流向图、敏感数据清单、保留期、跨境传输策略、审计事件清单。

## 六、验收与 Review 流程（如何标记模块为 Done）

1. 作者提交模块 Markdown 文档并在文档顶部标注版本号。 
2. QA/PM 执行 Checklist：功能点、API 示例、埋点、测试用例是否齐全；合规快速检查是否已覆盖关键点。 
3. 进行一次轻量 Code Review（内容准确性）与一次内容 Review（PM/SEO/合规）。 
4. Reviewer 在 PR/Issue 中以 `Review: Accept` 标记通过，或 `Review: Comment - ...` 提出修改；通过后在模块表状态改为 Done。 

## 七、优先级与下一步（可执行任务）

有序列表：
1. 导出 GA4 事件表为 JSON/CSV 并放入 `specs/FRS/events/ga4-events.json`（高优先）。
2. 产出 `weighted-mean-calculator` 的单模块 FRS（与 Mean 模块结构一致）。
3. 产出 Hub 页面与 JSON-LD 模板文档（SEO 关键）。
4. 编写 `specs/FRS/deployment.md` 包含 GCP IAM/KMS/日志保留与备份策略（中优先）。

## 八、交付物索引（快速链接）

- Mean Calculator: `specs/FRS/mean-calculator.md` (Done)
- GA4 事件导出（路径待创建）： `specs/FRS/events/ga4-events.json`
- 其他模块（待创建）：见模块状态表

## 九、合规责任人建议

1. PM/Owner：负责最终签发 FRS 文档并协调 Reviewer。 
2. 安全负责人：负责安全控制与日志策略（GCP/KMS）。 
3. 法务/合规：负责 GDPR/中国网络安全法 与 21 CFR 评估（如适用）。

---

请 Review: Accept / Comment - <修改点> / Modify - <优先产出项>。一旦你 Accept，我会：

- 将 GA4 事件表导出为 JSON 并写入 `specs/FRS/events/ga4-events.json`（下一交付物），
- 并开始产出 `weighted-mean-calculator` 的 FRS（如果你同时确认）。
