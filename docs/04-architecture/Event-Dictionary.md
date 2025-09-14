# 事件字典（GA4/UTM 对齐）— 草案

状态：提案（待评审）  
范围：总 Hub（聚合导航页）、主题 Hub、工具页、Glossary、HowTo/FAQ/案例、广告与归因。

通用规则：
- 统一使用 `trackEvent(name, params)`（自动合并 UTM：utm_source/medium/campaign/term/content/gclid）。
- 同意模式：Consent Mode v2 默认 denied；CMP 同意后更新；未同意时事件可匿名采集（建模）。
- 命名风格：小写下划线分隔；参数使用明确的 key、类型约束与取值范围。

## 1. Hub/主题 Hub
- hub_tool_click
  - 必填：tool_slug:string（不含 `/calculator/` 前缀）、group_name:string、position:int
  - 可选：context:string（如 `topic_gpa`/`topic_descriptive`）
- search_use
  - 必填：query:string、results_count:int
- faq_expand
  - 必填：topic_id?:string、question:string
- guide_card_click
  - 必填：topic_id:string、guide_title:string
  - 可选：href:string
- category_empty_view
  - 必填：topic_id:string、category_id:string

## 2. 工具页（Calculator）
- calc_execute
  - 必填：tool:string、input_count:int
  - 可选：precision:int、ignore_non_numeric:boolean、source:string
- calc_error
  - 必填：error_code:string
  - 可选：message:string
- calculator_result_view（Ads 转化候选）
  - 必填：tool:string
  - 可选：result_present:boolean、duration_ms:int
- copy_result
  - 必填：tool:string、copy_type:string("value"|"steps")
- expand_steps
  - 必填：tool:string

## 3. Glossary
- glossary_click（术语列表/详情点击某链接）
  - 必填：term_slug:string、to:string（目标路径）
- glossary_to_tool_click（Ads 转化候选）
  - 必填：term_slug:string、tool_slug:string

## 4. HowTo/FAQ/案例
- howto_step_expand
  - 必填：howto_slug:string、step:int
- howto_tool_cta_click
  - 必填：howto_slug:string、tool_slug:string
  - 可选：prefill:boolean
- faq_to_howto_click
  - 必填：faq_slug:string、howto_slug:string
- faq_to_tool_click
  - 必填：faq_slug:string、tool_slug:string
- case_to_tool_click
  - 必填：case_slug:string、tool_slug:string
- related_link_click
  - 必填：from_type:string("howto"|"faq"|"case"|"tool"|"hub")、to_type:string、to:string

## 5. 广告与占位
- ad_impression
  - 必填：slot:int（如 3/8）、position:int（列表中序）
- ad_click
  - 必填：slot:int、position:int

## 6. 归因/Ads（由 Attribution + GTM）
- utm_session_start（首次捕获 UTM/gclid）
  - 自动参数：utm_source/utm_medium/utm_campaign/utm_term/utm_content/gclid
- ads_campaign_click（如从广告着陆页标识）
  - 必填：campaign:string、term?:string
- gads_conversion（Google Ads 转化同步占位）
  - 必填：conversion_name:string
  - 可选：value:number、currency:string

## 7. 导航与通用
- breadcrumb_click
  - 必填：from:string、to:string
- lazy_component_load
  - 必填：component:string

## 8. 参数规范与校验
- string：≤ 128 字符，避免 PII；枚举型给出值域。
- int：非负整数；duration 以毫秒计数。
- boolean：true/false。
- 校验：在触发前做最小校验；失败不阻塞页面主流程。

## 9. 报表与口径建议
- 归因维度：默认带 UTM；报表按 utm_source/medium/campaign 切片。
- 转化路径：建议将 `calculator_result_view` 与 `glossary_to_tool_click` 作为主要/辅助转化事件。
- 主题对比：使用 `context`（topic_*）与 `topic_id` 维度对比主题表现。

## 10. 变更流程
- 新增/修改事件前在本文件提 PR，评审后再落地；
- 严格避免事件名变更导致历史报表断裂；如需升级，采用新的事件名并提供映射说明。

