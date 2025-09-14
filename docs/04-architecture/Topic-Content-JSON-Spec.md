# 主题外置内容 JSON 规范与图标白名单（草案）

状态：提案（待评审）  
用途：为主题 Hub（如 `/gpa/`、`/descriptive-statistics/`）的“选择指南（Guides）/FAQ”提供外置可维护的数据源，降低代码改动频率。

存放路径建议：`data/topics/{topic}.json`（例：`data/topics/gpa.json`）

## 1. 文件结构与字段定义
```json
{
  "guides": [
    { "title": "string", "text": "string", "icon": "string?", "href": "string?" }
  ],
  "faqs": [
    { "q": "string", "a": "string", "href": "string?" }
  ]
}
```

字段说明：
- guides[].title（必填）：卡片标题（≤ 40 字为宜）
- guides[].text（必填）：卡片副文案（≤ 80 字为宜）
- guides[].icon（可选）：图标名（见“图标白名单”）；未知名回退默认图标
- guides[].href（可选）：点击卡片跳转的站内 URL（支持 `/how-to/*`、`/faq/*`、`/calculator/*`、`/statistics-calculators/*`、`/gpa/` 等）
- faqs[].q（必填）：问题文案
- faqs[].a（必填）：答案文案（简明，尽量结构化）
- faqs[].href（可选）：“查看详情”链接（如跳到详细 FAQ 或 HowTo）

注意：
- 文案中避免 HTML；如需强调使用 Markdown 的 `*`/`_` 等轻量标记，前端视需要转义/渲染。
- href 必须为站内绝对路径，便于链接检查与 SEO 归一。

## 2. 命名与主题 ID 对齐
- 文件名 `{topic}.json` 必须与 `topics.ts` 中的 `id/route` 一致（如 `gpa`、`descriptive-statistics`）。
- 允许仅提供 guides 或 faqs，另一个可为空；页面会采用“外置优先，缺省回退内置默认”的策略。

## 3. 图标白名单（lucide 名称）
为保证一致性与可访问性，Guides 卡片的 icon 仅允许以下白名单（如需新增请在评审后扩充）：
- `graduation-cap`：学业/成绩相关（GPA）
- `calendar`：学期/时间线
- `bar-chart-3`：描述性统计/图表
- `sigma`：标准差/方差/公式指引
- `trending-up`：增长/趋势（保留）
- `dice-1`：概率/分布（保留）
- 未在白名单内的值将使用默认图标（如 `book-open`）。

规范：
- 图标名需小写短横线风格（lucide 风格）。
- 大面积插画/图片请遵循延迟加载策略与尺寸规范（另行评审）。

## 4. 校验与上线要求
- 语法：必须为合法 JSON，UTF-8 编码。
- 链接检查：`href` 必须通过站内链接检查脚本（200/存在）；不通过则 CI 警告或阻断（视开关）。
- 长度与可读性：标题与副文案长度在建议范围内；避免过度营销术语。
- i18n：当前英文主线，中文仅作为内部文档示例；后续多语言方案另行定义。

## 5. 版本管理与回滚
- 与代码同仓版本管理；每次修改通过 PR 评审。
- 重大修改（如挪动主题、替换大量链接）需在 PR 描述中附影响面说明与回滚策略。

## 6. 示例
```json
{
  "guides": [
    { "title": "Weighted vs Unweighted", "text": "多数高中用 4.0 非加权；有加权课则参考学校政策。", "icon": "graduation-cap", "href": "/how-to/calc-weighted-gpa" },
    { "title": "Semester vs Cumulative", "text": "学期只看当期；累计 GPA 聚合已修课程。", "icon": "calendar" }
  ],
  "faqs": [
    { "q": "是否支持 4.0/4.3/4.5 标尺？", "a": "工具支持常见标尺选择。", "href": "/faq/gpa-scales" },
    { "q": "能混合加权/非加权课程？", "a": "请先按学校政策确认；必要时拆分计算后再合并。" }
  ]
}
```

---

验收（DoD）
- JSON 校验通过；图标名在白名单内或回退默认。
- 链接检查通过（无 Error 级断链）。
- 页面正确显示外置内容并保留统一视觉交互；事件按规范上报。

