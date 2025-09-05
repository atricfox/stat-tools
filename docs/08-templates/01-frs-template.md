---
# Template for a single-module FRS
# Required YAML header keys: id, owner, acceptance, version, created, status, reviewers, tags
---

# {Module Title}

> 版本：{version}

## 一、简要说明

- 功能：{short description}
- 目标用户：{target audience}
- 本文档为单模块 FRS，包含界面行为、API 契约、埋点、测试用例、合规与完整性检查。

## 二、高层计划与可验证交付物

1. 本文件：`specs/FRS/{slug}.md`
2. API JSON 示例（成功/错误）。
3. 事件埋点对照（GA4）。
4. 测试用例列表。
5. 合规性快速检查表。

## 三、验收标准（Acceptance Criteria）

- 功能层面的可验证条目（用 Gherkin 场景映射）。

## 四、事件埋点（GA4 映射）

- 参考 `specs/FRS/events/ga4-events.json`。

## 五、数据字段与存储（Data Model）

...
