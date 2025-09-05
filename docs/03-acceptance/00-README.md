# ✅ 验收测试规范

本目录包含所有功能的 BDD (行为驱动开发) 风格验收测试用例。

## 📋 测试文件清单

### 核心功能测试

#### [01-core-features.feature](./01-core-features.feature) 🎯
核心功能验收标准，覆盖基础的系统功能和用户流程。

#### [02-api-endpoints.feature](./02-api-endpoints.feature) 🔌
API 接口验收测试，确保所有 API 端点符合预期行为。

#### [03-deployment.feature](./03-deployment.feature) ☁️
部署流程验收测试，验证 Cloudflare 部署的各个环节。

#### [04-architecture.feature](./04-architecture.feature) 🏗️
架构功能验收测试，验证系统架构的各项特性。

#### [05-nextjs-architecture.feature](./05-nextjs-architecture.feature) ⚛️
Next.js 特定功能的验收标准，包含 SSR/SSG 等特性。

#### [06-hub-and-seo.feature](./06-hub-and-seo.feature) 🔍
Hub 页面和 SEO 相关功能的验收测试。

### 计算器模块测试

#### [calculators/](./calculators/) 目录
各个统计计算器的详细验收测试：

- [01-mean-calculator.feature](./calculators/01-mean-calculator.feature) - 均值计算器测试
- [02-standard-deviation.feature](./calculators/02-standard-deviation.feature) - 标准差计算器测试
- [03-weighted-mean.feature](./calculators/03-weighted-mean.feature) - 加权均值计算器测试
- [04-gpa-calculator.feature](./calculators/04-gpa-calculator.feature) - GPA 计算器测试

## 🧪 测试执行

### 自动化测试

```bash
# 运行所有验收测试
npm test

# 运行特定功能测试
npm test -- --grep "均值计算器"

# 生成测试报告
npm test -- --reporter=html
```

### 手动验收

每个 `.feature` 文件都可以作为手动测试的检查清单：

1. 按照 `Given-When-Then` 格式执行
2. 验证每个场景的预期结果
3. 记录测试结果和问题

## 📖 BDD 语法说明

### 基本结构

```gherkin
Feature: 功能名称
  描述该功能的目的和价值

  Background: 背景条件
    Given 通用的前置条件

  Scenario: 具体场景
    Given 给定条件
    When 执行操作  
    Then 预期结果
    And 额外条件
    But 例外情况
```

### 示例

```gherkin
Feature: 均值计算器
  作为用户，我希望能够计算数值列表的平均值

  Scenario: 计算简单数列的均值
    Given 我访问均值计算器页面
    When 我输入数值 "1,2,3,4,5"
    And 我点击"计算"按钮
    Then 我应该看到结果 "3"
    And 我应该看到计算步骤说明
```

## 🎯 验收标准

### 功能完整性
- [ ] 所有指定功能都已实现
- [ ] 错误处理符合预期
- [ ] 边界条件测试通过

### 性能标准
- [ ] 页面加载时间 < 2秒
- [ ] API 响应时间 < 500ms
- [ ] 计算结果准确性 99.99%

### 用户体验
- [ ] 界面响应迅速
- [ ] 错误信息清晰易懂
- [ ] 移动端适配良好

### 安全性
- [ ] 输入验证严格
- [ ] 没有敏感信息泄露
- [ ] HTTPS 强制使用

## 🔄 测试状态追踪

| 模块 | 自动化测试 | 手动验收 | 状态 |
|------|------------|----------|------|
| 均值计算器 | ✅ | ✅ | 🟢 完成 |
| 标准差计算器 | ✅ | ⏳ | 🟡 进行中 |
| 加权均值计算器 | ⏳ | ❌ | 🔴 待开始 |
| GPA计算器 | ❌ | ❌ | 🔴 待开始 |

## 🔗 相关文档

- [需求规范](../02-requirements/) - 功能需求详细描述
- [开发文档](../05-development/02-testing-strategy.md) - 测试策略
- [故障排除](../05-development/04-troubleshooting.md) - 常见问题解决