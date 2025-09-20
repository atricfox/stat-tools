# Analytics 与 Google Ads 部署提醒

当你准备开启 Google Ads 流量时，请按以下顺序检查：

- 环境与代码
  - 设置 `STATS_CALCULATOR_GA_MEASUREMENT_ID`
  - 已启用 Consent Mode v2（默认 denied，配合 CMP 同意后 update 为 granted）
  - 代码已捕获 UTM/gclid，并推送 `utm_context` 到 dataLayer
- GTM/GA4/Ads
  - 参见 `gtm-ads-setup.md` 完成配置
  -（可选）导入 GTM 容器 JSON（包含 GA4/Ads 标签与自定义事件映射）
  - 替换占位符：`G-XXXXXXX`、`AW-XXXXXXX`、`CONVERSION_LABEL_xxx`
  - 在测试账户验证：GA4 实时事件 + Ads 转化（至少 1 个主要转化）
- 运营准备
  - 参见 `../../02-requirements/paid/seed-keywords.md` 使用首批关键词与否定词
  - 小预算试投（$10–$30/日，7–14 天），以 ROAS/CPA 为准
  - 落地页映射：高意图→工具页，泛意图→主题 Hub

以上完成后再发布正式投放。
