# Mean Calculator 功能需求规格说明书（FRS）

---
id: FRS-MEAN-001
owner: @product-owner
acceptance: docs/acceptance/mean-calculator.feature
version: 0.1
created: 2025-09-05
status: Done
reviewers: []
---

> 版本：0.1

## 一、简要说明

- 功能：Mean Calculator（算术平均值）页面 `/mean-calculator`。
- 目标用户：面向英文市场、非资深但需统计计算的用户。
- 本文档为单模块 FRS，包含界面行为、API 契约、埋点、测试用例、合规与完整性检查。

## 二、高层计划与可验证交付物

1. 本文件：`/mean-calculator` 功能规格（FRS - 单模块）。
2. API JSON 示例（成功/错误）。
3. GA4 事件表（最小事件集）。
4. 测试用例列表（8 条）。
5. 合规性快速检查表（GCP / 21 CFR / GDPR / 中国法）。

请在我完成后 Review / Accept / Comment。

## 三、范围与假设

1. 仅实现算术均值（mean）；weighted mean、GPA 等作为后续模块。 
2. 计算主要在客户端执行；提供可选后端验证 API（POST `/api/mean`）。
3. 页面为英文模板，支持 URL 参数复现（state in URL）。
4. 默认不存储用户个人可识别信息；仅记录脱敏/聚合事件（可配置）。

## 四、用户故事

1. 作为学生，我想粘贴成绩并得到平均分与计算步骤，以便理解结果来源。
2. 作为研究助理，我希望参数能编码在 URL 中以便复用与分享。

## 五、输入 / 输出 契约（API 示例）

- API: `POST /api/mean`
- 描述: 服务端验证并返回计算结果（客户端可离线计算）。

请求示例 (JSON):

```json
{
  "raw_input": "90, 85, 78, 92",
  "numbers": [90,85,78,92],
  "precision": 2,
  "ignore_non_numeric": true,
  "treat_missing_as": "ignore"
}
```

成功响应示例 (200):

```json
{
  "mean": 86.25,
  "count": 4,
  "sum": 345,
  "precision": 2,
  "steps": [
    "Parsed values: [90,85,78,92]",
    "Sum = 345",
    "Mean = 345 / 4 = 86.25"
  ],
  "formula": "mean = sum(x)/n",
  "timestamp": "2025-09-05T08:00:00Z"
}
```

错误响应示例 (400):

```json
{
  "error_code": "INVALID_INPUT",
  "message": "No numeric values parsed from input.",
  "field": "raw_input"
}
```

## 六、页面 UI 行为规范（关键交互）

1. 页面顶部：标题、简短说明（Plain English）、面包屑返回总 Hub（聚合导航页）（`/statistics-calculators/`）。
2. 主输入区（首屏可见）：大文本框，支持逗号、换行、空格、制表符、中文逗号。
   - 占位文本示例："Enter numbers (comma, newline or space separated) — e.g. 12, 15, 20"。
3. 参数区：Precision (0–10)、Ignore non-numeric (toggle)、Treat missing as (ignore/zero)。
4. 计算按钮（primary）：点击或回车触发，显示 loading state → 结果区。
5. 结果区：显示 mean（大号字体）、count、sum、可折叠 Step-by-step（Plain English），并提供公式复制按钮。
6. 操作按钮：Copy result、Copy steps、Share link（生成带参数短 URL）、Report error。
7. 错误提示：Plain English 且可操作；焦点管理使屏幕阅读器可察觉（aria-live）。
8. JSON-LD：服务器端 SSR 注入 HowTo / FAQ（优先保证 GSC 无警告）。

### UML 伪流程

- User -> WebPage: submits raw_input
- WebPage: parseInput(raw_input) -> numbers[]
- if numbers.empty -> showError
- else -> mean = sum(numbers)/len(numbers)
- render Result (mean, steps)
- emit GA4 `calc_execute` event

## 七、验收标准（Acceptance Criteria）

功能：

1. 支持逗号、换行、空格、制表符、中文逗号作为分隔符。
2. `precision` 参数正确生效（四舍五入到指定小数位）。
3. `ignore_non_numeric=true` 时忽略非数值条目；否则展示错误提示。
4. 计算结果与参考数学库一致，浮点误差在合理范围内。

SEO/结构化数据：

5. 页面包含有效 JSON-LD（HowTo/FAQ），GSC 无 schema 警告。
6. URL 可携带参数并能重建页面状态（例如 `/mean-calculator?input=90,85,78,92&precision=2`）。

性能/可用性：

7. 首屏（mobile）LCP ≤ 2000ms（首版目标）；首次计算感知 < 500ms（客户端），若调用后端 server response ≤ 300ms。
8. 页面支持键盘操作完成所有核心交互（A11y 基线）。

测试覆盖：

9. 单元测试覆盖公式主路径与至少 5 个边界用例。
10. CI 在 PR 阶段运行 lint + unit tests + 基本 accessibility 检查。

监测/埋点：

11. GA4 能记录 `calc_execute`、`calc_error`、`copy_result`、`expand_steps`、`share_link` 等事件。

安全/隐私：

12. 所有页面通过 HTTPS；记录的日志不包含可识别个人数据，或必须脱敏/加密。

## 八、GA4 / 事件埋点表（最小事件集）

| 事件名 | 触发条件 | 参数 (key:type) | 说明 |
|---:|---|---|---|
| page_view | 页面加载 | page_path:string | 标准页面视图 |
| calc_execute | 用户点击 Calculate 或回车 | tool:string="mean", input_count:int, precision:int, ignore_non_numeric:bool, source:string | 记录计算行为 |
| calc_error | 验证失败或计算失败 | error_code:string, message:string | 记录错误与提示 |
| copy_result | 用户复制结果 | tool:string, copy_type:string("value"|"steps") | 追踪复制率 |
| expand_steps | 用户展开步骤 | tool:string | 追踪学习参与 |
| share_link | 用户点击 Share | tool:string, share_type:string("url"|"social") | 追踪传播行为 |

事件示例（GA4 payload）:

```json
{
  "event": "calc_execute",
  "params": {
    "tool": "mean",
    "input_count": 4,
    "precision": 2,
    "ignore_non_numeric": true
  }
}
```

## 九、数据字段与存储（Data Model）

| 字段 | 类型 | 来源 | 说明 | 保留期建议 |
|---:|---|---|---|---:|
| raw_input | string | 前端 | 用户原始输入（可选记录，敏感需脱敏） | 7 days |
| parsed_numbers | number[] | 后端/前端 | 解析后的数值 | 不保存或短期缓存 |
| mean | number | 计算结果 | 计算值 | N/A（不长期存储） |
| event_logs | json | GA4/Logging | 交互事件 | 遵循合规（GDPR/法令） |

说明：默认不持久化 `raw_input` 与 `parsed_numbers`；若需调试记录，必须告知并脱敏。

## 十、错误码与用户提示

| 错误码 | HTTP | 场景 | user-facing message |
|---:|---:|---|---|
| INVALID_INPUT | 400 | 无解析到数值 | "No numeric values found — please enter numbers separated by commas or new lines." |
| TOO_LARGE_INPUT | 400 | 超过最大长度/条目数 | "Input too large — please reduce the number of entries." |
| SERVER_ERROR | 500 | 后端异常 | "Something went wrong — please try again later." |

## 十一、测试用例（初始 8 条）

1. 正常输入："1,2,3,4" → mean 2.5, count 4。
2. 混合分隔符："1\n2\t3,4" → 解析成功且结果正确。
3. 含非数值："1,foo,3" + `ignore_non_numeric=true` → parse [1,3] → mean 2。
4. 全非数值："a,b,c" → 返回 INVALID_INPUT。
5. 极小样本：单个数 "5" → mean 5, count 1。
6. 精度测试：1/3 序列，`precision=4`，检查四舍五入。
7. 大数组：10,000 个随机数 → 性能基线测试（客户端/服务端）。
8. URL 参数复现：访问 `/mean-calculator?input=1,2,3&precision=1` → 页面重建状态并自动计算。

## 十二、可访问性（A11y）检查要点

1. 输入框/按钮有 ARIA 标签并可聚焦。
2. 错误提示通过 `aria-live` 提示屏幕阅读器。
3. 色彩对比符合 WCAG AA。
4. 所有交互可用键盘完成。

## 十三、性能与运维指标（NFR）

| 指标 | 目标 (首版) | 测试方法 |
|---:|---|---|
| LCP (mobile) | ≤ 2000 ms | Lighthouse CI |
| TTFB | ≤ 500 ms | Synthetic tests |
| Client calc latency | ≤ 50 ms (typical, n<1000) | Unit/perf test |
| Server response | ≤ 300 ms (95th) | Serverless perf test |
| Error rate | < 1% | SLO + Alerts |

## 十四、安全与隐私控制（概要）

1. 强制 HTTPS + HSTS。
2. 最小化 CSP 中第三方脚本，延迟加载广告/analytics。
3. 输入严格校验与白名单化解析，防注入。
4. 日志脱敏：默认不记录 raw_input，若记录需加密并限制访问（KMS）。
5. 最小权限原则：分析/ops 权限通过 IAM 控制。
6. Rate limiting：防止滥用。

## 十五、合规性快速检查表

| 合规项 | 覆盖章节 | 状态 | 备注/需补充 |
|---:|---|---|---|
| GCP | 部署/运维、安全 | Partial | 需指定 IAM、KMS、日志保留、VPC 等实现细节 |
| 21 CFR Part 11 | 合规章节 | Deferred/Conditional | 若处理受监管数据需增加审计、电子签名等 |
| GDPR | 隐私/合规 | Partial | 需 DPIA、DSAR 流程、数据脱敏策略 |
| 中国网络安全法 | 隐私/跨境 | Partial | 若涉及中国用户需评估数据出境与本地化策略 |

## 十六、交付清单（本步骤）

1. 本文件：`specs/FRS/mean-calculator.md`（即本文件）。
2. API JSON 样例（含成功/错误示例）。
3. GA4 事件表（最小事件集）。
4. 测试用例列表（8 条）。
5. 合规性快速检查表。

## 十七、下一步建议

1. 将 GA4 事件表导出为 CSV/JSON 并加入 `specs/` 目录（用于前端开发埋点实现）。
2. 产出 `weighted-mean-calculator` / `gpa-calculator` 的相似单模块 FRS（逐一落地）。
3. 在 `specs/` 中新增 `frs-index.md` 以列出所有模块并跟踪 Review 状态。

---

请 Review: Accept / Comment / Modify，以决定下一步动作。
