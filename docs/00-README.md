# 📚 Stat Tools 文档中心

欢迎来到 Stat Tools 项目文档中心！本文档采用编号系统组织，便于快速定位和浏览。

## 📖 文档导航

### 🚀 [01-getting-started/](./01-getting-started/) - 快速开始
新用户必读，包含项目概览、环境搭建和开发工作流。

### 📋 [02-requirements/](./02-requirements/) - 需求规范  
功能需求规范书(FRS)，包含所有功能模块的详细设计。

### ✅ [03-acceptance/](./03-acceptance/) - 验收测试
BDD风格的验收标准和测试用例。

### 🏗️ [04-architecture/](./04-architecture/) - 架构设计
系统架构、数据模型和API设计文档。

### 🔧 [05-development/](./05-development/) - 开发文档  
编码规范、测试策略和部署指南。
  - [CSP/Nonce 运维与灰度发布指南](./05-development/03-csp-nonce-rollout.md)

### ⚙️ [06-operations/](./06-operations/) - 运维文档
监控、日志和维护相关文档。
  - [可观测性与错误上报（Sentry）运维手册](./06-operations/03-observability-sentry.md)

### 📊 [07-audit/](./07-audit/) - 审计报告
代码质量、安全性和性能审计。

### 📝 [08-templates/](./08-templates/) - 文档模板
各类文档的标准模板。

### 📦 [09-archive/](./09-archive/) - 归档文档
历史版本和已废弃的文档。

## 🔍 快速查找

### 按功能模块
- 均值计算器: [02-requirements/calculators/01-mean-calculator.md](./02-requirements/calculators/01-mean-calculator.md)
- 标准差计算器: [02-requirements/calculators/02-standard-deviation.md](./02-requirements/calculators/02-standard-deviation.md)  
- 加权均值计算器: [02-requirements/calculators/03-weighted-mean.md](./02-requirements/calculators/03-weighted-mean.md)
- GPA计算器: [02-requirements/calculators/04-gpa-calculator.md](./02-requirements/calculators/04-gpa-calculator.md)

### 按文档类型
- **功能规范**: `02-requirements/` 目录
- **验收测试**: `03-acceptance/` 目录  
- **架构设计**: `04-architecture/` 目录
- **开发指南**: `05-development/` 目录

## 📚 阅读指南

### 编号系统
- 目录使用两位数字编号 (00-99)
- 文件使用两位数字编号 (01-99)
- 编号按重要性和逻辑顺序排列

### 文档状态
- 🟢 **Active**: 当前有效的文档
- 🟡 **Draft**: 草稿状态，待完善
- 🔴 **Archived**: 已归档，仅作参考

## 🤝 贡献指南

1. 新增文档请按编号系统命名
2. 遵循相应的文档模板格式
3. 更新索引文件引用
4. 提交前运行文档检查: `npm run docs-check`

## 🔗 相关链接

- [项目仓库](https://github.com/your-org/stat-tools)
- [部署文档](./02-requirements/04-deployment-cloudflare.md)
- [API文档](./04-architecture/03-api-design.md)
- [贡献指南](../README.md#贡献指南)

---
📅 最后更新: $(date +%Y-%m-%d)  
🔄 文档版本: v2.0 (重组版)
