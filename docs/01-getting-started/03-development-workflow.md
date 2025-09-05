# 🔄 开发工作流程

## 📋 开发流程概览

本项目采用现代化的开发工作流，确保代码质量和团队协作效率。

## 🌲 Git 工作流

### 分支策略

```
main (生产分支)
├── develop (开发分支)
├── feature/calculator-mean (功能分支)
├── bugfix/api-validation (修复分支)
└── hotfix/security-patch (热修复分支)
```

### 分支命名规范

- `feature/功能名称` - 新功能开发
- `bugfix/问题描述` - Bug 修复
- `hotfix/紧急修复` - 生产环境紧急修复
- `docs/文档更新` - 文档相关更新
- `chore/维护任务` - 构建、依赖更新等

### 提交流程

```bash
# 1. 创建功能分支
git checkout -b feature/new-calculator

# 2. 开发过程中定期提交
git add .
git commit -m "feat: 添加新计算器基础结构"

# 3. 推送到远程
git push origin feature/new-calculator

# 4. 创建 Pull Request
gh pr create --title "feat: 新增统计计算器" --body "..."
```

## ✅ 提交规范 (Conventional Commits)

### 提交消息格式

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### 类型说明

- `feat`: 新功能
- `fix`: Bug 修复  
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动
- `ci`: CI 配置文件和脚本的变动

### 示例

```bash
feat(calculator): 添加均值计算功能

- 实现基础算术平均数计算
- 添加输入验证
- 包含单元测试覆盖

Closes #123
```

## 🔍 代码质量检查

### 自动化检查 (Pre-commit Hooks)

每次提交时自动运行：

1. **ESLint**: 代码规范检查
2. **Prettier**: 代码格式化
3. **TypeScript**: 类型检查
4. **lint-staged**: 只检查暂存文件

### 手动质量检查

```bash
# 完整的质量检查套件
npm run typecheck  # TypeScript 类型检查
npm run lint       # ESLint 检查并修复
npm run format     # Prettier 格式化
npm run test:worker # 单元测试
npm test           # E2E 测试
npm run docs-check # 文档检查
```

## 🧪 测试策略

### 测试层次

```
E2E Tests (Playwright)     ←── 用户场景
    ↑
API Tests                  ←── 接口功能
    ↑  
Unit Tests (Vitest)       ←── 核心逻辑
```

### 测试命令

```bash
# 单元测试
npm run test:worker        # Worker 单元测试
npm run test:worker:watch  # 监听模式
npm run test:coverage      # 覆盖率报告

# E2E 测试
npm test                   # 完整 E2E 测试
npm test -- --headed       # 有界面模式
npm test -- --debug        # 调试模式
```

### 测试覆盖率要求

- **单元测试**: ≥80%
- **分支覆盖**: ≥80%
- **函数覆盖**: ≥80%

## 🚀 部署流程

### 自动部署

```
Push to main → GitHub Actions → Build & Test → Deploy
```

### 部署环境

- **开发环境**: 每次推送到 `develop` 分支
- **预发环境**: 每次推送到 `main` 分支
- **生产环境**: 创建 Release Tag

### 手动部署

```bash
# Cloudflare Worker
npx wrangler publish --env production

# 环境变量设置
npm run setup:secrets
```

## 📝 开发检查清单

### 开发前

- [ ] 拉取最新代码 `git pull origin main`
- [ ] 创建功能分支 `git checkout -b feature/xxx`
- [ ] 确认开发环境正常 `npm run dev`

### 开发中

- [ ] 遵循编码规范
- [ ] 编写单元测试
- [ ] 及时提交代码
- [ ] 定期同步主分支

### 提交前

- [ ] 运行完整测试套件
- [ ] 检查代码覆盖率
- [ ] 更新相关文档
- [ ] 遵循提交消息规范

### PR 创建

- [ ] 填写完整的 PR 描述
- [ ] 关联相关 Issue
- [ ] 请求代码审查
- [ ] 确保 CI 通过

## 🔧 开发工具配置

### IDE 设置

推荐 VS Code 设置 (`.vscode/settings.json`):

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

### 调试配置

```json
{
  "name": "Next.js Debug",
  "type": "node",
  "request": "launch",
  "program": "${workspaceFolder}/node_modules/.bin/next",
  "args": ["dev"],
  "env": {
    "NODE_OPTIONS": "--inspect"
  }
}
```

## 📊 性能监控

### 本地性能检查

```bash
# 构建分析
npm run build
npm run analyze  # 如果配置了 bundle analyzer

# Lighthouse 审计
npx lighthouse http://localhost:3000
```

### 生产环境监控

- Cloudflare Analytics
- Core Web Vitals 跟踪
- 错误监控 (如 Sentry)

## 🔗 相关文档

- [代码规范](../05-development/01-coding-standards.md)
- [测试策略](../05-development/02-testing-strategy.md)
- [部署指南](../05-development/03-deployment-guide.md)
- [故障排除](../05-development/04-troubleshooting.md)