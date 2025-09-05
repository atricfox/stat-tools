# Standard Deviation Calculator 功能需求规格说明书（FRS）

id: FRS-STDDEV-001
---
id: FRS-STDDEV-001
owner: @product-owner
acceptance: docs/acceptance/standard-deviation-calculator.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 一、简要说明

- 功能：Standard Deviation / Variance Calculator 页面 `/standard-deviation-calculator`，支持样本/总体两种公式切换并输出解释与计算步骤。
- 目标用户：英文市场的学生、研究人员与非专职统计人员，需快速计算离散程度并理解含义。
- 本文档为单模块 FRS，包含界面行为、API 契约、埋点、测试用例、合规与完整性检查。

## 二、高层计划与可验证交付物

1. 本文件：`specs/FRS/standard-deviation-calculator.md`（本交付物）。
2. API JSON 示例（成功/错误）。
3. 事件埋点对照（使用现有 GA4 事件模型，tool="stddev"）。
4. 测试用例列表（至少 8 条）。
5. 合规性快速检查表（GCP / 21 CFR / GDPR / 中国法）。

请 Review / Accept / Comment，在我继续下一个模块前完成审核。

## 三、范围与假设

1. 支持计算方差（variance）与标准差（stddev），并在 UI 上允许切换计算类型（sample/population）。
2. 支持批量输入（逗号/换行/空格/中文逗号），以及数值数组或 summary 输入（mean + n + variance）。
3. 客户端优先计算；提供可选后端验证 API（POST `/api/stddev`）。
4. 不持久化原始输入，事件为脱敏/聚合为主。

## 四、用户故事

1. 作为学生，我想输入一组数据并得到标准差与解释，以便理解数据的离散程度。
2. 作为分析师，我希望能选择样本或总体公式并获得相应的步骤与公式说明。

## 五、输入 / 输出 契约（API 示例）

- API: `POST /api/stddev`
- 描述: 验证并返回 variance/stddev 结果、中间步骤与可选的置信区间预估（如需要）。

请求示例 (JSON):

```json
{
  "raw_input": "10, 12, 23, 23, 16, 23, 21, 16",
  "numbers": [10,12,23,23,16,23,21,16],
  "formula": "sample",
  "output": "stddev", // or "variance"
  "precision": 2,
  "ignore_non_numeric": true
}
```

成功响应示例 (200):

```json
{
  "n": 8,
  "mean": 18.0,
  "variance": 33.14,
  "stddev": 5.75,
  "formula": "sample",
  "steps": [
    "Parsed values: [10,12,23,23,16,23,21,16]",
    "Mean = 18",
    "Sum squared deviations = 265.14",
    "Sample variance = 265.14 / (8-1) = 37.877... (example)"
  ],
  "precision": 2,
  "timestamp": "2025-09-05T10:00:00Z"
}
```

错误响应示例 (400):

```json
{
  "error_code": "INVALID_INPUT",
  "message": "At least two numeric values are required for sample variance.",
  "field": "numbers"
}
```

## 六、页面 UI 行为规范（关键交互）

1. 顶部：标题、简短说明（什么时候用样本/总体公式的 Plain English 指引）。
2. 主输入区：大文本框，支持常见分隔符与数组粘贴；显示 parsed preview（首 10 项）。
3. 参数区：Formula (sample | population)、Output (stddev | variance)、Precision、Ignore non-numeric。
4. 计算按钮：点击或回车触发，显示 loading → 结果区。
5. 结果区：显示 n、mean、variance、stddev（按用户选择显示）、可折叠 Step-by-step 与公式复制。
6. 操作：Copy result、Copy steps、Share link（URL 带参数）、Report error、Toggle sample/population 快速切换并实时更新数值。
7. 错误提示：若样本数不足或解析失败显示可操作提示（如 "Need at least two values for sample variance."）。

### UML 伪流程

- User -> WebPage: submits raw_input
- WebPage: parseInput(raw_input) -> numbers[]
- validate numbers (count, numeric)
- if invalid -> showError and emit `calc_error`
- compute mean, variance/stddev according to formula
- render Result and emit `calc_execute`

## 七、验收标准（Acceptance Criteria）

功能：

1. 支持常见分隔符解析并正确处理非数值项（基于设置）。
2. 在 `formula=sample` 时，n>=2 为合格；在 `population` 时 n>=1 可计算。
3. 输出与参考实现一致（浮点误差可接受），`precision` 生效。

SEO/URL：

4. 页面支持 URL 参数复现（例如 `/standard-deviation-calculator?input=1,2,3,4&formula=sample`）。

性能/可用性：

5. 客户端计算在 n<10000 时应响应 <200ms（典型）；大规模数据需降级/后台计算策略。

测试覆盖：

6. 单元测试覆盖解析、计算、边界与错误路径；CI 在 PR 阶段跑通。

监测/埋点：

7. GA4 记录 `calc_execute`、`calc_error`、`copy_result`、`share_link` 等事件，tool 字段使用 `stddev`，并记录 `formula` 参数。

安全/隐私：

8. 默认不保存 raw_input；事件脱敏；HTTPS 强制。

## 八、事件埋点（GA4 映射）

遵循 `specs/FRS/events/ga4-events.json`，示例 `calc_execute` payload:

```json
{
  "event": "calc_execute",
  "params": {
    "tool": "stddev",
    "input_count": 8,
    "formula": "sample",
    "output": "stddev",
    "precision": 2
  }
}
```

## 九、数据字段与存储（Data Model）

| 字段 | 类型 | 来源 | 说明 | 保留期建议 |
|---:|---|---|---|---:|
| raw_input | string | 前端 | 用户原始输入（默认不记录） | 7 days (若记录需合规) |
| numbers | number[] | 前端/后端 | 解析后的数值 | 不保存或短期缓存 |
| mean | number | 计算中间值 | 中间结果 | N/A |
| variance | number | 计算结果 | 方差值 | N/A |
| stddev | number | 计算结果 | 标准差值 | N/A |
| event_logs | json | GA4/Logging | 交互事件 | 遵守合规 |

## 十、错误码与用户提示

| 错误码 | HTTP | 场景 | user-facing message |
|---:|---|---|---|
| INVALID_INPUT | 400 | 解析失败或无数值 | "No numeric values found — enter numbers separated by commas or new lines." |
| INSUFFICIENT_VALUES | 400 | 样本公式数不足 | "Need at least two values for sample variance." |
| TOO_LARGE_INPUT | 400 | 超过大小限制 | "Input too large — consider uploading a CSV or using background processing." |

## 十一、测试用例（至少 8 条）

1. 正常数组："10,12,23,23,16,23,21,16" → 正确 mean/variance/stddev。 
2. 单值与总体公式："5" + formula=population → variance=0, stddev=0。
3. 样本最小值不足："5" + formula=sample → INSUFFICIENT_VALUES。
4. 包含非数值："1,foo,3" + ignore_non_numeric=true → 成功解析并计算。
5. 大数据集（10k）性能与内存检测（降级或后台任务验证）。
6. 精度测试：非常小/大的数值与 precision 控制。
7. URL 参数复现：`/standard-deviation-calculator?input=1,2,3,4&formula=sample` 自动计算。
8. Sharing/Copy 操作触发相应 GA4 事件。

## 十二、可访问性要点

1. 输入/控件有 ARIA 标签并可键盘操作。
2. 错误通过 `aria-live` 通知屏幕阅读器。

## 十三、性能与运维指标（NFR）

| 指标 | 目标 (首版) | 测试方法 |
|---:|---|---|
| Client calc latency (n<10000) | < 200 ms | 单元/性能测试 |
| Server response (api) | ≤ 300 ms (95th) | Serverless perf test |
| Error rate | < 1% | SLO + Alerts |

## 十四、安全与隐私控制（概要）

1. HTTPS 强制；CSP 限定第三方脚本加载。
2. 输入校验与白名单解析防注入攻击。
3. 日志脱敏与按需加密；记录访问者同意用于调试的明确标记。

## 十五、合规性快速检查表

| 合规项 | 覆盖章节 | 状态 | 需补充 |
|---:|---|---:|---|
| GCP | 部署/运维 | Partial | 指定 IAM、KMS、日志保留与地区策略 |
| GDPR | 隐私 | Partial | DSAR、用户同意记录、数据最小化策略 |
| 中国网络安全法 | 隐私/跨境 | Partial | 如服务中国用户需出境评估与本地化策略 |
| 21 CFR Part 11 | 条件适用 | Deferred | 若含受监管数据需额外审计与签名控制 |

## 十六、交付清单（本步骤）

1. `specs/FRS/standard-deviation-calculator.md`（本文件）。
2. API JSON 示例。
3. 事件埋点示例（GA4 payload）。
4. 测试用例列表。
5. 合规性快速检查表。

---

请 Review: Accept / Comment - <修改点> / Modify - <优先项>，我将继续产出 Hub 页面与 JSON-LD 模板（推荐下一步以保证 SEO）。
