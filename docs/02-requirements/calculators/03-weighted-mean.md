# Weighted Mean Calculator 功能需求规格说明书（FRS）

id: FRS-WM-001
id: FRS-WM-001
owner: @product-owner
acceptance: docs/acceptance/weighted-mean-calculator.feature
version: 0.1
created: 2025-09-05
status: Draft
reviewers: []
---

> 版本：0.1

## 一、简要说明

- 功能：Weighted Mean Calculator（加权平均）页面 `/weighted-mean-calculator`。
- 目标用户：英文市场的学生/分析人员，需根据权重计算平均值的场景（如课程学分、样本加权等）。
- 本文件为单模块 FRS，包含界面行为、API 契约、埋点、测试用例、合规与完整性检查。

## 二、高层计划与可验证交付物

1. 本文件：`specs/FRS/weighted-mean-calculator.md`（本交付物）。
2. API JSON 示例（成功/错误）。
3. 事件埋点对照（使用已存在的 GA4 事件模型，tool="weighted_mean"）。
4. 测试用例列表（至少 8 条）。
5. 合规性快速检查表（GCP / 21 CFR / GDPR / 中国法）。

请 Review / Accept / Comment，在我继续下一个模块前完成审核。

## 三、范围与假设

1. 支持以并行列或两栏输入：一列为值 (x)，一列为权重 (w)，或以逗号分隔的 `value:weight` 形式。 
2. 支持忽略权重为 0 或缺失项的策略（toggle）。
3. 默认客户端计算；提供可选后端验证 API（POST `/api/weighted-mean`）。
4. 不保存用户原始个人数据；事件为脱敏/聚合为主。

## 四、用户故事

1. 作为学生，我希望输入成绩与学分，得到加权平均并看到计算步骤（便于核验）。
2. 作为研究人员，我需要在 URL 中编码参数以便复现计算配置。

## 五、输入 / 输出 契约（API 示例）

- API: `POST /api/weighted-mean`
- 描述: 服务端验证并返回计算结果（客户端可离线计算）。

请求示例 (JSON):

```json
{
  "raw_input": "90:3, 85:4, 78:2, 92:1",
  "pairs": [[90,3],[85,4],[78,2],[92,1]],
  "precision": 2,
  "ignore_zero_weights": true
}
```

成功响应示例 (200):

```json
{
  "weighted_mean": 85.78,
  "sum_weighted_values": 343.12,
  "sum_weights": 4,
  "precision": 2,
  "steps": [
    "Parsed pairs: [[90,3],[85,4],[78,2],[92,1]]",
    "Weighted sum = 90*3 + 85*4 + 78*2 + 92*1 = 343.12",
    "Sum weights = 3+4+2+1 = 10",
    "Weighted mean = 343.12 / 10 = 34.312 (example placeholder)"
  ],
  "formula": "weighted_mean = sum(x_i * w_i) / sum(w_i)",
  "timestamp": "2025-09-05T08:00:00Z"
}
```

错误响应示例 (400):

```json
{
  "error_code": "INVALID_PAIRS",
  "message": "No valid value:weight pairs parsed from input.",
  "field": "raw_input"
}
```

## 六、页面 UI 行为规范（关键交互）

1. 顶部：标题、简单场景说明（何时使用加权平均）。
2. 主输入区：支持三种输入形式：
   a. 双列粘贴（值列 + 权重列）；
   b. `value:weight` 逗号分隔；
   c. 两个并行文本框（values / weights），长度需一致。
3. 参数区：Precision、Ignore zero weights (toggle)、Missing weight behaviour（zero / ignore / error）。
4. 计算按钮：触发时显示 loading → 结果区。
5. 结果区：显示 weighted_mean、sum_weights、sum_weighted_values、可折叠步骤与可复制公式。若 sum_weights == 0 则显示错误提示。
6. 操作：Copy result、Copy steps、Share link（URL 带参数）、Report error。
7. 错误提示示例："Weights sum to zero — please check your weights or choose 'Treat missing weights as zero'."。

### UML 伪流程

- User -> WebPage: submits raw_input or pairs
- WebPage: parsePairs(raw_input) -> pairs[]
- if pairs.empty or sum_weights==0 -> showError
- else -> weighted_mean = sum(x_i*w_i)/sum(w_i)
- render Result and emit GA4 `calc_execute` event

## 七、验收标准（Acceptance Criteria）

功能：

1. 支持三种输入格式且能正确解析。
2. 当 `ignore_zero_weights=true` 时，权重 0 项被忽略；否则按设定策略处理。
3. 计算结果与数学库一致并受 `precision` 控制。

SEO/URL：

4. 页面支持 URL 参数重建状态（例如 `/weighted-mean-calculator?input=90:3,85:4&precision=2`）。

性能/可用性：

5. 客户端计算延迟（n<1000）应典型 <100ms；大批量（10k 对）需列为性能用例并给出 degrade 策略。

测试覆盖：

6. 单元测试覆盖解析逻辑、边界与精度；CI 在 PR 阶段跑通。

监测/埋点：

7. 使用 GA4 记录 `calc_execute`、`calc_error` 等事件，tool 字段使用 `weighted_mean`。

安全/隐私：

8. 不持久化原始输入；日志脱敏；HTTPS 必须。

## 八、事件埋点（GA4 映射）

事件遵循 `specs/FRS/events/ga4-events.json` 模式，示例 `calc_execute` payload:

```json
{
  "event": "calc_execute",
  "params": {
    "tool": "weighted_mean",
    "input_count": 4,
    "precision": 2,
    "ignore_zero_weights": true
  }
}
```

## 九、数据字段与存储（Data Model）

| 字段 | 类型 | 来源 | 说明 | 保留期建议 |
|---:|---|---|---|---:|
| raw_input | string | 前端 | 用户原始输入（默认不记录） | 7 days (若记录需合规说明) |
| pairs | [[number,number]] | 前端/后端 | 解析后的 (value, weight) 对 | 不保存或短期缓存 |
| weighted_mean | number | 计算结果 | 计算值 | N/A |
| event_logs | json | GA4/Logging | 用户交互事件 | 遵守合规 |

## 十、错误码与用户提示

| 错误码 | HTTP | 场景 | user-facing message |
|---:|---:|---|---|
| INVALID_PAIRS | 400 | 无合法对输入 | "No valid value:weight pairs found — use 12:3, 15:2 format or paste two columns." |
| ZERO_SUM_WEIGHTS | 400 | 权重和为 0 | "Sum of weights is zero — adjust weights or choose 'Treat missing weights as zero'." |
| TOO_LARGE_INPUT | 400 | 超过大小限制 | "Input too large — try reducing entries or use CSV upload." |

## 十一、测试用例（至少 8 条）

1. 标准对输入："90:3,85:4,78:2,92:1" → 解析正确且结果准确。
2. 双列粘贴：values="90\n85\n78" 与 weights="3\n4\n2" → 解析并计算。
3. 含缺失权重：values="90,85" weights="3" + Missing weight behaviour=ignore → 返回 INVALID_PAIRS 或按策略处理。
4. 权重全为 0：触发 ZERO_SUM_WEIGHTS 错误。
5. 非法格式："90-3,85-4" → INVALID_PAIRS。
6. 精度测试：large decimal values + precision control。
7. 大批量（10k 对）性能测试与降级行为验证。
8. URL 参数复现：`/weighted-mean-calculator?input=90:3,85:4&precision=1` → 页面重建并自动计算。

## 十二、可访问性要点

1. 输入区与按钮 ARIA 标注并支持键盘。
2. 错误通过 `aria-live` 报告给屏幕阅读器。

## 十三、性能与运维指标（NFR）

| 指标 | 目标 (首版) | 测试方法 |
|---:|---|---|
| Client calc latency (n<1000) | < 100 ms | 单元/性能测试 |
| Server response (if used) | ≤ 300 ms (95th) | Serverless perf test |
| Large batch degrade | 明确降级策略 | 流量/性能测试 |

## 十四、安全与隐私控制（概要）

1. HTTPS 强制。2. 日志脱敏/加密。3. 输入校验避免注入。4. 最小权限访问分析数据。

## 十五、合规性快速检查表

| 合规项 | 覆盖章节 | 状态 | 需补充 |
|---:|---|---:|---|
| GCP | 部署/运维 | Partial | 指定 IAM、KMS、日志保留策略 |
| GDPR | 隐私 | Partial | DSAR 流程、匿名化、同意管理 |
| 中国网络安全法 | 隐私/跨境 | Partial | 如需覆盖中国用户，补数据出境评估 |
| 21 CFR Part 11 | 条件适用 | Deferred | 若含受监管数据需额外文档 |

## 十六、交付清单（本步骤）

1. `specs/FRS/weighted-mean-calculator.md`（本文件）。
2. API JSON 示例。
3. 事件埋点示例（GA4 payload）。
4. 测试用例列表。
5. 合规性快速检查表。

---

请 Review: Accept / Comment - <修改点> / Modify - <优先项>，我将继续下一模块（如 `gpa-calculator` 或 Hub 页面）。
