# GPA Calculator 功能需求规格说明书（FRS）

---
id: FRS-GPA-001
owner: @product-owner
acceptance: docs/acceptance/gpa-calculator.feature
version: 0.1
---

> 版本：0.1

## 一、简要说明

- 功能：GPA Calculator 页面 `/gpa-calculator`，用于根据成绩与学分计算学期/累计加权平均绩点（GPA）。
- 目标用户：英文市场的学生与教务人员，需将成绩按课程学分转换为 GPA 并查看分步骤说明。
- 本文档为单模块 FRS，包含界面行为、API 契约、埋点、测试用例、合规与完整性检查。

## 二、高层计划与可验证交付物

1. 本文件：`specs/FRS/gpa-calculator.md`（本交付物）。
2. API JSON 示例（成功/错误）。
3. 事件埋点对照（使用已存在的 GA4 事件模型，tool="gpa"）。
4. 测试用例列表（至少 8 条）。
5. 合规性快速检查表（GCP / 21 CFR / GDPR / 中国法）。

请 Review / Accept / Comment，在我继续下一个模块前完成审核。

## 三、范围与假设

1. 支持常见 GPA 制度映射（4.0、4.3、4.5 等）和自定义映射表。 
2. 支持输入形式：`score:credit` 列表、双列粘贴（成绩/学分）、上传 CSV（可选）。
3. 支持转换规则如分数→绩点映射（可选选择 A-F、百分制到绩点映射）。
4. 计算主要在客户端进行；提供可选后端 API（POST `/api/gpa`）用于校验与导出。
5. 默认不记录可识别个人数据；导出/保存需用户显式同意。

## 四、用户故事

1. 作为学生，我希望粘贴所有课程分数与学分，得到学期 GPA 并看到转换规则与步骤。 
2. 作为教务，我希望能切换绩点制度（4.0 / 4.3 / custom）并导出 CSV 报表。

## 五、输入 / 输出 契约（API 示例）

- API: `POST /api/gpa`
- 描述: 验证并返回 GPA 计算结果、明细及可导出报表（服务器端可用于批处理或导出）。

请求示例 (JSON):

```json
{
  "entries": [
    {"score": 90, "credit": 3},
    {"score": 85, "credit": 4},
    {"score": 78, "credit": 2}
  ],
  "scale": "4.0",
  "mapping": "default", 
  "precision": 2,
  "export_csv": false
}
```

成功响应示例 (200):

```json
{
  "gpa": 3.45,
  "total_credits": 9,
  "weighted_points": 31.05,
  "precision": 2,
  "details": [
    {"score":90, "credit":3, "point":4.0, "weighted_point":12.0},
    {"score":85, "credit":4, "point":3.5, "weighted_point":14.0},
    {"score":78, "credit":2, "point":2.55, "weighted_point":5.05}
  ],
  "timestamp": "2025-09-05T09:00:00Z"
}
```

错误响应示例 (400):

```json
{
  "error_code": "INVALID_ENTRIES",
  "message": "No valid score:credit entries parsed.",
  "field": "entries"
}
```

## 六、页面 UI 行为规范（关键交互）

1. 顶部：标题、简短说明、绩点制度选择器（4.0 / 4.3 / 4.5 / custom）。
2. 主输入区：支持三种输入形式：
   a. `score:credit` 逗号或换行分隔；
   b. 双列粘贴（成绩列 + 学分列）；
   c. CSV 上传（可选）。
3. 参数区：选择 `scale`、自定义映射编辑（若选 custom）、precision、忽略空行。
4. 计算按钮：点击或回车触发，显示 loading → 结果区；支持自动保存为临时 session（localStorage）供用户恢复。 
5. 结果区：显示 GPA（大号字体）、总学分、加权绩点总和、逐课明细表（可展开每一行的转换说明）。
6. 操作：Copy result、Export CSV（若 export_csv=true 则后端返回 CSV）、Share link（带参数短 URL）、Report error。
7. 错误提示：例如 "No valid entries found — paste scores and credits like 90:3 or paste two columns."，并提供示例格式。 

### UML 伪流程

- User -> WebPage: submits entries or CSV
- WebPage: parseEntries(raw_input) -> entries[]
- if entries.empty -> showError
- else -> map scores to points (using scale/mapping)
- compute gpa = sum(point_i * credit_i) / sum(credit_i)
- render Result and emit GA4 `calc_execute` event

## 七、验收标准（Acceptance Criteria）

功能：

1. 支持输入/解析三种形式并能正确生成 `entries[]`。
2. 支持 4.0/4.3/4.5/自定义映射；映射逻辑需可审计（显示转换规则）。
3. 计算结果与数学库/参考实现一致，`precision` 生效。

SEO/URL：

4. 页面可通过 URL 参数重建状态并自动计算（示例 `/gpa-calculator?input=90:3,85:4&scale=4.0`）。

性能/可用性：

5. 常规模型下（entries < 100）客户端计算延迟 < 100ms；CSV 上传/批量导出支持异步后端处理。

测试覆盖：

6. 单元测试覆盖解析、映射、边界用例；CI 在 PR 阶段跑通。

监测/埋点：

7. GA4 记录 `calc_execute`、`calc_error`、`export_csv`、`share_link` 等事件，tool 字段使用 `gpa`。

隐私/安全：

8. 不默认上传成绩数据；用户触发导出/保存才会发送到后端；所有导出需加同意步骤。

## 八、事件埋点（GA4 映射）

遵循 `specs/FRS/events/ga4-events.json`，示例 `calc_execute` payload:

```json
{
  "event": "calc_execute",
  "params": {
    "tool": "gpa",
    "entry_count": 6,
    "scale": "4.0",
    "precision": 2
  }
}
```

新增事件建议：

| 事件名 | 触发条件 | 参数 |
|---|---|---|
| export_csv | 用户点击导出 | tool:string="gpa", format:string="csv", entry_count:int |

## 九、数据字段与存储（Data Model）

| 字段 | 类型 | 来源 | 说明 | 保留期建议 |
|---:|---|---|---|---:|
| entries | [{score,credit}] | 前端/后端 | 解析后的成绩条目（默认不持久化） | 不保存或短期缓存 |
| gpa | number | 计算结果 | 计算出的绩点 | N/A |
| export_file | url/string | 后端 | 导出文件路径或临时链接（受限访问） | 7 days |
| event_logs | json | GA4/Logging | 交互事件 | 遵守合规 |

注意：任何导出或保存用户成绩需用户同意并在隐私策略中明确说明。

## 十、错误码与用户提示

| 错误码 | HTTP | 场景 | user-facing message |
|---:|---|---|---|
| INVALID_ENTRIES | 400 | 无合法 score:credit 条目 | "No valid score:credit entries — use 90:3 format or paste two columns." |
| MISMATCHED_COLUMNS | 400 | 两列长度不一致 | "Values and credits count mismatch — ensure each course has a credit." |
| EXPORT_FAILED | 500 | 导出失败 | "Export failed — try again or download later." |

## 十一、测试用例（至少 8 条）

1. 标准输入："90:3,85:4,78:2" → 解析并计算正确 GPA。
2. 双列粘贴：values 和 credits 列长度一致并正确计算。
3. CSV 上传：有效 CSV 解析并异步返回导出链接。
4. 自定义映射：用户提供 custom mapping，结果按映射计算。
5. 空行/缺失学分：根据策略（ignore/error/zero）处理并返回相应提示。
6. 大量条目（500+）性能测试与 UI 降级行为。
7. URL 参数复现：`/gpa-calculator?input=90:3,85:4&scale=4.0` 自动计算。
8. 导出流程：用户同意后导出触发 `export_csv` 事件并返回文件链接。

## 十二、可访问性要点

1. 输入/控件提供 ARIA 标签并可通过键盘操作。
2. 错误通过 `aria-live` 通知屏幕阅读器。

## 十三、性能与运维指标（NFR）

| 指标 | 目标 (首版) | 测试方法 |
|---:|---|---|
| Client calc latency (entries<100) | < 100 ms | 单元/性能测试 |
| CSV export async latency | < 30s | 后端任务队列测试 |
| Server response (api) | ≤ 300 ms (95th) | Serverless perf test |

## 十四、安全与隐私控制（概要）

1. HTTPS 强制；导出前需用户确认与同意。  
2. 导出文件使用短期受限链接并过期。  
3. 日志脱敏；成绩原文不默认上传。  
4. 最小权限原则与审计访问控制。

## 十五、合规性快速检查表

| 合规项 | 覆盖章节 | 状态 | 需补充 |
|---:|---|---:|---|
| GCP | 部署/运维 | Partial | 明确 IAM/KMS/日志保留与加密策略 |
| GDPR | 隐私/导出 | Partial | DSAR 流程、导出同意记录、DPIA（若处理敏感教育数据） |
| 中国网络安全法 | 隐私/跨境 | Partial | 如有中国用户需数据出境评估与本地化策略 |
| 21 CFR Part 11 | 条件适用 | Deferred | 若含受监管数据需额外审计与电子签名控制 |

## 十六、交付清单（本步骤）

1. `specs/FRS/gpa-calculator.md`（本文件）。
2. API JSON 示例。
3. 事件埋点示例（GA4 payload）。
4. 测试用例列表。
5. 合规性快速检查表。

---

请 Review: Accept / Comment - <修改点> / Modify - <优先项>，我将继续下一模块（如 `standard-deviation-calculator` 或 Hub 页面）。
