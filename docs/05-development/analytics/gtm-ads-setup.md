# GTM + Google Ads 配置清单（含 Consent Mode v2）

适用范围：统计工具网站（总 Hub（聚合导航页）/主题 Hub/Glossary/工具页）。目标：保证 GA4 与 Google Ads 转化一致、UTM 归因可用、符合隐私合规（Consent Mode v2）。

## 后续工作（提醒）
- 准备好再投放时：生成并导入 GTM 容器 JSON（包含变量/触发器/标签，占位符需替换）。
- 替换占位符：`G-XXXXXXX`（GA4）、`AW-XXXXXXX` 与 `CONVERSION_LABEL_xxx`（Google Ads）。
- 发布前 checklist：
  - 在测试账户验证 GA4 实时与 Ads 转化回传；
  - 校验 Consent Mode（默认 denied → 同意后 granted）；
  - 设置否定词与地域/设备/时段策略；
  - 确认落地页映射与 UTM 规范。

## 1) 前置条件
- 环境变量：`NEXT_PUBLIC_GA_MEASUREMENT_ID` 已配置（如 `G-XXXXXXX`）。
- 代码：已内置 UTM 捕获与事件（`utm_session_start`、`utm_context` dataLayer 推送）。
- 隐私：Cookie Banner/同意管理工具（CMP）准备就绪。

## 2) Consent Mode v2
- 默认状态（在 `src/app/layout.tsx` 中）：
  - `ad_user_data=denied`、`ad_personalization=denied`、`ad_storage=denied`、`analytics_storage=denied`。
- 获得同意后（由 CMP 触发）：
  - 在页面上执行（示例）：
    ```js
    window.gtag?.('consent', 'update', {
      ad_user_data: 'granted',
      ad_personalization: 'granted',
      ad_storage: 'granted',
      analytics_storage: 'granted'
    })
    ```

## 3) GTM 容器建议
- 变量（Variables）
  - `JS - UTM Source/Medium/Campaign/Term/Content/GCLID`：通过 `dataLayer` 或从 `localStorage/sessionStorage` 读取。
  - `URL - Query`：备用读取 URL UTM。
- 触发器（Triggers）
  - `Custom Event - utm_context`：用于捕获代码推送的 UTM 事件。
  - `All Pages`：GA4 配置与基础事件。
- 标签（Tags）
  - `GA4 Configuration`：Measurement ID 使用 `G-XXXXXXX`。
  - `GA4 Event - utm_session_start`：映射 UTM 维度作为事件参数。
  - `Google Ads Conversion`：与网站主要转化映射（如下）。

## 4) Google Ads 转化建议
- 主要转化事件映射（站点事件 → Ads Conversion）：
  - `calculator_result_view` → `Conversion: Calculator Result`（页面完成计算并显示结果）。
  - `hub_tool_click` → `Conversion: Hub → Tool Click`（可选，若此跳转与后续计算高度相关）。
  - `glossary_to_tool_click` → `Conversion: Glossary → Tool Click`（可选）。
- Enhanced Conversions（选配）：
  - 若存在轻注册/邮件留资，可启用 hashed email/phone 作为增强转化。
- UTM 与 GCLID 归因：
  - 通过 `utm_context` 事件将 `utm_*` 与 `gclid` 注入，Ads 可通过自动标记或离线转化回传对齐。

## 5) GA4 维度与事件参数
- User Properties（通过代码自动设置）：
  - `utm_source`、`utm_medium`、`utm_campaign`、`utm_term`、`utm_content`、`gclid`。
- 事件参数：
  - 关键事件应同时携带上述 UTM 参数（代码已在 `trackEvent` 中自动合并）。

## 6) 测试清单
- Consent：未同意时不设置广告/分析存储；同意后状态更新为 `granted`。
- GA4 Realtime：能看到 `utm_session_start` 与其他核心事件；事件参数包含 UTM。
- Ads 转化：测试账户能收到至少一个主要转化回传。
- UTM 持久化：新开标签页能继承首次触发的 UTM 用户属性。

## 7) 运营指引
- 小预算试投：$10–$30/日，7–14 天评估 CPC/CTR/CVR/CPA/ROAS。
- 否定词维护：每 2–3 天清理不相关查询。
- 落地页优化：高意图词 → 直接工具页；泛意图词 → 主题 Hub。
