# 📋 需求规范文档

本目录包含所有功能需求规范书(FRS)和技术需求文档。

## 🔎 索引与指引（权威）
- 总 Hub（聚合导航页）：[04-aggregated-hub-sqlite.md](./04-aggregated-hub-sqlite.md)
- Glossary（术语表）：[05-glossary-requirements.md](./05-glossary-requirements.md)
- 内部超链接联动内容系统（HowTo/FAQ/案例）：[06-internal-linking-content-system.md](./06-internal-linking-content-system.md)

## 📚 主要文档

### [01-mvp-goals.md](./01-mvp-goals.md) 🎯
MVP 核心目标与功能清单，定义项目的最小可行产品范围。

### [02-functional-specs.md](./02-functional-specs.md) 📊
功能需求规范总览，包含所有功能模块的概要描述。

### [03-technical-architecture.md](./03-technical-architecture.md) 🏗️
技术架构设计，包含系统架构、技术栈选型和部署方案。

### [04-deployment-cloudflare.md](./04-deployment-cloudflare.md) ☁️
Cloudflare 部署策略，包含 Pages + Workers + R2 的完整部署方案。

### [05-api-routes.md](./05-api-routes.md) 🔌
API 路由设计，定义所有 API 接口的规范和契约。

### [06-nextjs-architecture.md](./06-nextjs-architecture.md) ⚛️
Next.js 架构设计，包含 SSG/SSR 策略和优化方案。

### [07-nextjs-runtime-decision.md](./07-nextjs-runtime-decision.md) ⚡
Next.js 运行时决策，Edge Runtime vs Node Runtime 的选择策略。

### [08-hub-and-seo.md](./08-hub-and-seo.md) 🔍
Hub 页面与 SEO 策略，内容聚合和搜索引擎优化方案。

## 🧮 计算器模块

### [calculators/](./calculators/) 目录
包含所有统计计算器的详细功能规范：

- [01-mean-calculator.md](./calculators/01-mean-calculator.md) - 均值计算器
- [02-standard-deviation.md](./calculators/02-standard-deviation.md) - 标准差计算器  
- [03-weighted-mean.md](./calculators/03-weighted-mean.md) - 加权均值计算器
- [04-gpa-calculator.md](./calculators/04-gpa-calculator.md) - GPA 计算器

## 📖 阅读指南

### 新团队成员推荐顺序
1. MVP 目标 → 功能规范 → 技术架构
2. 选择感兴趣的计算器模块深入了解
3. 查看对应的验收测试: [../03-acceptance/](../03-acceptance/)

### 产品经理关注重点
- MVP 目标和功能规范
- Hub 页面和 SEO 策略
- 各计算器的用户体验设计

### 开发人员关注重点  
- 技术架构和 API 设计
- Next.js 架构决策
- 部署方案和运行时选择

### 运维人员关注重点
- Cloudflare 部署策略
- 监控和日志方案
- 性能优化配置

## 🔄 文档状态

- 🟢 **已完成**: 基础架构文档
- 🟡 **进行中**: 详细 API 规范
- 🔴 **待更新**: SEO 策略细节

## 🔗 相关文档

- [验收测试](../03-acceptance/) - 对应的 BDD 测试用例
- [架构设计](../04-architecture/) - 详细的系统设计
- [开发文档](../05-development/) - 实现指南
