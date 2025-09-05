# 📊 Stat Tools 项目概览

## 🎯 项目愿景

Stat Tools 是一个现代化的统计工具集合，专注于为英文市场用户提供高性能、易用的在线统计计算服务。

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 15 + React 19
- **语言**: TypeScript 5.1+
- **样式**: CSS-in-JS (推断)
- **构建**: Next.js 内置构建系统

### 后端技术
- **运行时**: Cloudflare Workers (Edge Runtime)
- **存储**: Cloudflare R2 (对象存储)
- **API**: RESTful APIs

### 开发工具
- **包管理**: npm
- **代码质量**: ESLint + Prettier
- **测试**: Playwright (E2E) + Vitest (单元测试)
- **CI/CD**: GitHub Actions
- **Git Hooks**: Husky + lint-staged

### 部署平台
- **静态托管**: Cloudflare Pages
- **边缘计算**: Cloudflare Workers
- **对象存储**: Cloudflare R2

## 🔧 核心特性

### 统计计算器
1. **均值计算器** - 计算数值数组的算术平均数
2. **标准差计算器** - 计算样本或总体标准差
3. **加权均值计算器** - 计算带权重的平均值
4. **GPA计算器** - 学术成绩点数计算

### 技术特性
- ✅ 服务端渲染 (SSR/SSG)
- ✅ 边缘计算优化
- ✅ 响应式设计
- ✅ SEO 优化
- ✅ PWA 支持 (规划中)

## 🏗️ 架构设计

```
用户 → Cloudflare CDN → Next.js Pages → API Routes
                                    ↓
                               Workers (计算逻辑)
                                    ↓
                                R2 存储 (导出文件)
```

## 🎯 MVP 目标

详见 [MVP 核心目标](../02-requirements/01-mvp-goals.md)

## 🔗 快速链接

- [环境搭建](./02-setup-guide.md)
- [开发工作流](./03-development-workflow.md)
- [技术架构详解](../02-requirements/03-technical-architecture.md)
- [部署指南](../02-requirements/04-deployment-cloudflare.md)