# 开发者指南

id: DEV-GUIDE-001
---
id: DEV-GUIDE-001
owner: @dev-team
acceptance: docs/03-acceptance/05-development.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

为 Stat Tools 项目的开发者提供全面的开发指南，包括环境搭建、开发工作流、代码规范、测试策略和部署流程。

## 快速开始

### 环境要求

- **Node.js**: >= 20.x LTS
- **npm**: >= 10.x
- **Git**: >= 2.x
- **VS Code**: 推荐IDE（配置文件已包含）

### 本地环境搭建

```bash
# 1. 克隆仓库
git clone https://github.com/your-org/stat-tools.git
cd stat-tools

# 2. 安装依赖
npm install

# 3. 环境变量配置
npm run setup:env

# 4. 启动开发服务器
npm run dev

# 5. 访问应用
open http://localhost:3000
```

### 开发工具配置

```json
// .vscode/settings.json (已包含)
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative",
  "tailwindCSS.includeLanguages": {
    "typescript": "javascript",
    "typescriptreact": "javascript"
  }
}
```

### 推荐VS Code扩展

```json
// .vscode/extensions.json (已包含)
{
  "recommendations": [
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "bradlc.vscode-tailwindcss",
    "ms-playwright.playwright",
    "ms-vscode.vscode-typescript-next"
  ]
}
```

## 项目结构

```
stat-tools/
├── docs/                    # 项目文档
├── src/                     # 源代码
│   ├── app/                # Next.js App Router页面
│   ├── components/         # React组件
│   │   ├── ui/            # 基础UI组件
│   │   ├── forms/         # 表单组件
│   │   └── calculators/   # 计算器组件
│   ├── lib/               # 工具函数和配置
│   ├── hooks/             # 自定义React Hooks
│   ├── types/             # TypeScript类型定义
│   └── workers/           # Cloudflare Workers
├── tests/                  # 测试文件
│   ├── unit/              # 单元测试
│   ├── integration/       # 集成测试
│   └── e2e/               # 端到端测试
├── public/                # 静态资源
└── scripts/               # 构建和工具脚本
```

## 开发工作流

> 相关安全与部署指引：请同时阅读《[CSP/Nonce 运维与灰度发布指南](./03-csp-nonce-rollout.md)》，确保在预发/生产环境按 Report-Only → 强制 的流程逐步推进，并在开发中遵循 `next/script + nonce` 的实现规范。

### Git工作流

我们采用 **Git Flow** 简化版本：

```bash
# 主要分支
main        # 生产分支，自动部署
develop     # 开发分支，集成测试

# 功能分支命名规范
feature/calculator-mean      # 新功能
bugfix/calculation-error     # Bug修复
hotfix/security-patch        # 紧急修复
docs/update-readme          # 文档更新
```

### 开发流程

1. **创建功能分支**
```bash
git checkout develop
git pull origin develop
git checkout -b feature/your-feature-name
```

2. **开发和测试**
```bash
# 频繁提交，保持小的变更集
git add .
git commit -m "feat: add mean calculator validation"

# 运行测试确保质量
npm test
npm run typecheck
npm run lint
```

3. **推送和创建PR**
```bash
git push origin feature/your-feature-name
# 在GitHub创建Pull Request到develop分支
```

4. **代码审查和合并**
- 至少一个团队成员审查
- 所有CI检查通过
- 合并到develop分支

5. **发布准备**
```bash
# develop分支测试完毕后合并到main
git checkout main
git merge develop
git push origin main
# 自动触发生产部署
```

### 提交信息规范

使用 [Conventional Commits](https://conventionalcommits.org/) 规范：

```bash
# 格式：<type>(<scope>): <description>
feat(calculator): add weighted mean calculation
fix(ui): resolve button alignment issue  
docs(readme): update installation instructions
style(components): format code with prettier
refactor(hooks): simplify state management logic
test(calculator): add unit tests for mean function
chore(deps): update next.js to v15
```

### 代码审查检查清单

- [ ] **功能正确性**：代码实现符合需求
- [ ] **代码质量**：遵循项目编码规范
- [ ] **性能考虑**：没有明显的性能问题
- [ ] **安全性**：没有安全漏洞或敏感信息泄露
- [ ] **测试覆盖**：包含适当的测试用例
- [ ] **文档更新**：相关文档已更新
- [ ] **类型安全**：TypeScript类型定义正确
- [ ] **无障碍性**：符合可访问性标准

## 编码规范

### TypeScript/JavaScript

```typescript
// ✅ 好的实践
interface CalculationResult {
  value: number
  steps: string[]
  metadata: {
    timestamp: Date
    precision: number
  }
}

const calculateMean = (numbers: number[]): CalculationResult => {
  if (numbers.length === 0) {
    throw new Error('Numbers array cannot be empty')
  }
  
  const sum = numbers.reduce((acc, num) => acc + num, 0)
  const mean = sum / numbers.length
  
  return {
    value: Number(mean.toFixed(2)),
    steps: [
      `Sum: ${sum}`,
      `Count: ${numbers.length}`,
      `Mean: ${sum} ÷ ${numbers.length} = ${mean}`
    ],
    metadata: {
      timestamp: new Date(),
      precision: 2
    }
  }
}

// ❌ 避免的写法
function calc(nums) {  // 缺少类型定义
  let s = 0            // 变量名不清晰
  for(var i=0;i<nums.length;i++){  // 格式不规范
    s+=nums[i]         // 缺少空格
  }
  return s/nums.length // 缺少错误处理
}
```

### React组件

```typescript
// ✅ 推荐的组件写法
interface CalculatorProps {
  title: string
  onCalculate: (result: CalculationResult) => void
  defaultPrecision?: number
}

export const Calculator: React.FC<CalculatorProps> = ({
  title,
  onCalculate,
  defaultPrecision = 2
}) => {
  const [numbers, setNumbers] = useState<number[]>([])
  const [isCalculating, setIsCalculating] = useState(false)
  
  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsCalculating(true)
    
    try {
      const result = await calculateMean(numbers)
      onCalculate(result)
    } catch (error) {
      console.error('Calculation failed:', error)
      // 处理错误
    } finally {
      setIsCalculating(false)
    }
  }
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h2 className="text-xl font-semibold">{title}</h2>
      {/* 组件内容 */}
    </form>
  )
}

// 导出类型以便其他组件使用
export type { CalculatorProps }
```

### CSS/Tailwind

```typescript
// ✅ 推荐的样式写法
const buttonVariants = {
  primary: 'bg-blue-500 hover:bg-blue-600 text-white',
  secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-900',
  danger: 'bg-red-500 hover:bg-red-600 text-white'
}

const Button: React.FC<ButtonProps> = ({ variant = 'primary', ...props }) => (
  <button
    className={`
      px-4 py-2 rounded-md font-medium transition-colors
      focus:outline-none focus:ring-2 focus:ring-offset-2
      disabled:opacity-50 disabled:cursor-not-allowed
      ${buttonVariants[variant]}
    `}
    {...props}
  />
)

// ❌ 避免内联样式和魔法数字
<button style={{backgroundColor: '#3b82f6', padding: '8px 16px'}}>
```

### 文件命名规范

```
components/
├── ui/
│   ├── Button.tsx          # PascalCase for components
│   ├── Input.tsx
│   └── index.ts           # Barrel exports
├── forms/
│   ├── CalculatorForm.tsx
│   └── ValidationError.tsx
└── calculators/
    ├── MeanCalculator.tsx
    └── StandardDeviationCalculator.tsx

hooks/
├── useCalculation.ts      # camelCase with 'use' prefix
├── useFormValidation.ts
└── index.ts

lib/
├── calculations.ts        # camelCase for utilities
├── validation.ts
└── constants.ts

types/
├── calculator.ts          # camelCase for type files
├── api.ts
└── index.ts               # Re-export all types
```

## 测试策略

### 测试金字塔

```
    ╭─────────────╮
   ╱  E2E Tests   ╲     10% - 完整用户流程
  ╱  (Playwright) ╲
 ╱─────────────────╲
╱ Integration Tests ╲   20% - API和组件集成
╲ (Testing Library) ╱
 ╲─────────────────╱
  ╲  Unit Tests   ╱     70% - 函数和组件逻辑
   ╲   (Jest)    ╱
    ╲───────────╱
```

### 单元测试

```typescript
// tests/unit/calculations.test.ts
import { calculateMean } from '@/lib/calculations'

describe('calculateMean', () => {
  it('should calculate mean correctly for positive numbers', () => {
    const result = calculateMean([1, 2, 3, 4, 5])
    
    expect(result.value).toBe(3)
    expect(result.steps).toHaveLength(3)
    expect(result.metadata.precision).toBe(2)
  })
  
  it('should throw error for empty array', () => {
    expect(() => calculateMean([])).toThrow('Numbers array cannot be empty')
  })
  
  it('should handle decimal precision', () => {
    const result = calculateMean([1, 2], 3)
    expect(result.value).toBe(1.5)
  })
})
```

### 组件测试

```typescript
// tests/unit/components/Calculator.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Calculator } from '@/components/calculators/Calculator'

describe('Calculator Component', () => {
  const mockOnCalculate = jest.fn()
  
  beforeEach(() => {
    mockOnCalculate.mockClear()
  })
  
  it('should render title correctly', () => {
    render(<Calculator title="Mean Calculator" onCalculate={mockOnCalculate} />)
    expect(screen.getByText('Mean Calculator')).toBeInTheDocument()
  })
  
  it('should call onCalculate when form is submitted', async () => {
    render(<Calculator title="Test" onCalculate={mockOnCalculate} />)
    
    // 模拟用户输入
    const input = screen.getByLabelText(/numbers/i)
    fireEvent.change(input, { target: { value: '1,2,3' } })
    
    // 模拟提交
    const submitButton = screen.getByRole('button', { name: /calculate/i })
    fireEvent.click(submitButton)
    
    // 验证回调被调用
    await waitFor(() => {
      expect(mockOnCalculate).toHaveBeenCalledWith(
        expect.objectContaining({
          value: 2,
          steps: expect.any(Array)
        })
      )
    })
  })
  
  it('should show loading state during calculation', async () => {
    // 模拟异步计算
    const slowCalculate = jest.fn().mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({ value: 1 }), 100))
    )
    
    render(<Calculator title="Test" onCalculate={slowCalculate} />)
    
    fireEvent.click(screen.getByRole('button', { name: /calculate/i }))
    
    expect(screen.getByText(/calculating/i)).toBeInTheDocument()
  })
})
```

### E2E测试

```typescript
// tests/e2e/calculator.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Mean Calculator', () => {
  test('should calculate mean correctly', async ({ page }) => {
    await page.goto('/calculators/mean')
    
    // 验证页面加载
    await expect(page.locator('h1')).toContainText('Mean Calculator')
    
    // 输入数据
    await page.fill('[data-testid=numbers-input]', '10,20,30,40,50')
    await page.click('[data-testid=calculate-button]')
    
    // 验证结果
    await expect(page.locator('[data-testid=result-value]')).toContainText('30')
    await expect(page.locator('[data-testid=result-steps]')).toBeVisible()
  })
  
  test('should handle invalid input gracefully', async ({ page }) => {
    await page.goto('/calculators/mean')
    
    await page.fill('[data-testid=numbers-input]', 'invalid,input')
    await page.click('[data-testid=calculate-button]')
    
    // 验证错误提示
    await expect(page.locator('[data-testid=error-message]')).toContainText(
      'Please enter valid numbers'
    )
  })
  
  test('should be accessible', async ({ page }) => {
    await page.goto('/calculators/mean')
    
    // 键盘导航测试
    await page.keyboard.press('Tab')
    await expect(page.locator('[data-testid=numbers-input]')).toBeFocused()
    
    // 屏幕阅读器标签测试
    await expect(page.locator('label[for=numbers-input]')).toBeVisible()
  })
})
```

### 测试运行命令

```bash
# 单元测试
npm run test              # 运行所有单元测试
npm run test:watch        # 监听模式
npm run test:coverage     # 生成覆盖率报告

# E2E测试
npm run test:e2e          # 运行所有E2E测试
npm run test:e2e:headed   # 可视化模式
npm run test:e2e:debug    # 调试模式

# 所有测试
npm run test:all          # 运行所有类型的测试
```

## 性能优化

### Core Web Vitals优化

```typescript
// 1. 代码分割 - 动态导入
const Calculator = dynamic(() => import('@/components/Calculator'), {
  loading: () => <CalculatorSkeleton />
})

// 2. 图片优化 - Next.js Image组件
import Image from 'next/image'

<Image
  src="/calculator-hero.png"
  alt="Statistical Calculator"
  width={800}
  height={400}
  priority // 关键图片预加载
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,..."
/>

// 3. 字体优化 - 预加载关键字体
// next.config.js
module.exports = {
  experimental: {
    optimizeFonts: true
  }
}

// 4. 预加载关键资源
<link rel="preload" href="/api/calculator-data" as="fetch" />
```

### 状态管理优化

```typescript
// 1. 使用useMemo缓存计算结果
const calculationResult = useMemo(() => {
  if (numbers.length === 0) return null
  return calculateMean(numbers, precision)
}, [numbers, precision])

// 2. 使用useCallback避免不必要的重渲染
const handleCalculate = useCallback((newNumbers: number[]) => {
  setNumbers(newNumbers)
}, [])

// 3. 组件级别的代码分割
const HeavyChart = lazy(() => import('@/components/HeavyChart'))

// 4. 虚拟化长列表
import { FixedSizeList as List } from 'react-window'

const VirtualizedResults = ({ items }) => (
  <List
    height={400}
    itemCount={items.length}
    itemSize={50}
    itemData={items}
  >
    {Row}
  </List>
)
```

### Bundle分析和优化

```bash
# 1. Bundle分析
npm run analyze          # 生成bundle分析报告

# 2. 查看各个页面的大小
npm run build           # 构建后显示页面大小统计

# 3. 检查未使用的依赖
npm run depcheck        # 查找未使用的依赖

# 4. 优化建议
# - 移除未使用的依赖
# - 使用动态导入分割代码
# - 优化第三方库的导入方式
```

## 无障碍性开发

### 基本原则

```typescript
// 1. 语义化HTML
<main role="main">
  <section aria-labelledby="calculator-heading">
    <h1 id="calculator-heading">Mean Calculator</h1>
    <form role="form" aria-label="Number input form">
      <label htmlFor="numbers-input">
        Enter numbers (comma-separated)
      </label>
      <input
        id="numbers-input"
        type="text"
        aria-describedby="input-help"
        aria-required="true"
      />
      <p id="input-help">Example: 1,2,3,4,5</p>
    </form>
  </section>
</main>

// 2. 键盘导航支持
const handleKeyDown = (event: React.KeyboardEvent) => {
  if (event.key === 'Enter' && event.ctrlKey) {
    handleCalculate()
  }
}

// 3. 屏幕阅读器公告
const [announcement, setAnnouncement] = useState('')

const announceResult = (result: string) => {
  setAnnouncement(`Calculation complete. Result is ${result}`)
  // 清除公告以便下次使用
  setTimeout(() => setAnnouncement(''), 1000)
}

return (
  <div>
    <div role="status" aria-live="polite" className="sr-only">
      {announcement}
    </div>
    {/* 组件内容 */}
  </div>
)
```

### 可访问性测试

```typescript
// 使用axe-core进行自动化测试
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

test('should not have accessibility violations', async () => {
  const { container } = render(<Calculator />)
  const results = await axe(container)
  expect(results).toHaveNoViolations()
})

// 手动测试检查清单
/*
□ Tab键导航顺序正确
□ 所有交互元素可以用键盘访问
□ 焦点指示器清晰可见
□ 表单字段有正确的标签
□ 错误信息与相关字段关联
□ 颜色不是唯一的信息传达方式
□ 图片有有意义的alt文本
□ 页面有正确的标题层次
*/
```

## 调试技巧

### 开发工具配置

```typescript
// 1. React Developer Tools
// 安装浏览器扩展：React Developer Tools

// 2. 调试Hook
const useDebugValue = (value: any, formatter?: (value: any) => any) => {
  React.useDebugValue(value, formatter)
}

// 使用示例
const useCalculation = (numbers: number[]) => {
  const result = useMemo(() => calculateMean(numbers), [numbers])
  
  // 在React DevTools中显示调试信息
  useDebugValue({ numbers, result }, 
    ({ numbers, result }) => `${numbers.length} numbers → ${result?.value}`
  )
  
  return result
}

// 3. 条件断点
const debugCalculation = (numbers: number[]) => {
  // 只在特定条件下触发断点
  if (numbers.length > 100) {
    debugger
  }
  return calculateMean(numbers)
}
```

### 日志和监控

```typescript
// 1. 结构化日志
const logger = {
  debug: (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[DEBUG] ${message}`, data)
    }
  },
  
  error: (message: string, error?: Error, context?: any) => {
    console.error(`[ERROR] ${message}`, { error, context })
    
    // 发送到错误监控服务
    if (process.env.NODE_ENV === 'production') {
      // Sentry.captureException(error, { extra: context })
    }
  }
}

// 2. 性能监控
const measurePerformance = (name: string, fn: () => any) => {
  const start = performance.now()
  const result = fn()
  const end = performance.now()
  
  logger.debug(`Performance: ${name}`, {
    duration: end - start,
    timestamp: new Date().toISOString()
  })
  
  return result
}

// 使用示例
const result = measurePerformance('calculateMean', () => 
  calculateMean(largeNumberArray)
)
```

## 部署和发布

### 环境管理

```bash
# 开发环境变量 (.env.local)
NEXT_PUBLIC_APP_ENV=development
NEXT_PUBLIC_API_URL=http://localhost:3000/api
NEXT_PUBLIC_GA_MEASUREMENT_ID=

# 生产环境变量 (Cloudflare Pages)
NEXT_PUBLIC_APP_ENV=production
NEXT_PUBLIC_API_URL=https://stattools.com/api
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

### CI/CD流程

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      
      - run: npm ci
      - run: npm run typecheck
      - run: npm run lint
      - run: npm test
      - run: npm run build
      
      - name: E2E Tests
        run: |
          npx playwright install --with-deps
          npm run test:e2e
      
      - name: Upload test results
        if: failure()
        uses: actions/upload-artifact@v3
        with:
          name: test-results
          path: test-results/
```

### 发布检查清单

部署前确认：

- [ ] **功能测试**：所有功能正常工作
- [ ] **性能测试**：Core Web Vitals达标
- [ ] **安全检查**：无安全漏洞
- [ ] **无障碍性**：通过a11y测试
- [ ] **跨浏览器**：主要浏览器兼容
- [ ] **移动端**：响应式设计正常
- [ ] **错误处理**：异常情况处理完善
- [ ] **数据验证**：输入验证严格
- [ ] **日志监控**：监控和告警配置
- [ ] **回滚计划**：有问题时的回滚策略

## 故障排除

### 常见问题

#### 1. 构建失败
```bash
# 清除缓存
npm run clean
rm -rf node_modules package-lock.json
npm install

# 检查TypeScript错误
npm run typecheck

# 检查依赖版本冲突
npm ls
```

#### 2. 测试失败
```bash
# 更新测试快照
npm test -- -u

# 调试特定测试
npm test -- --testNamePattern="Calculator"

# 查看测试覆盖率
npm run test:coverage
```

#### 3. 性能问题
```bash
# 分析bundle大小
npm run analyze

# 检查内存泄漏
node --inspect-brk node_modules/.bin/next dev

# 性能分析
npm run build
npm run start
# 使用浏览器DevTools的Performance面板
```

#### 4. 部署问题
```bash
# 本地验证生产构建
npm run build
npm run start

# 检查环境变量
echo $NEXT_PUBLIC_API_URL

# 查看构建日志
# 在Cloudflare Pages控制台查看详细日志
```

### 获取帮助

- **团队内部**：在Slack #dev-help频道提问
- **文档搜索**：查看项目docs目录
- **Issue跟踪**：GitHub Issues记录问题
- **技术债务**：定期技术评审会议讨论

---

**维护责任人**：开发团队领导
**更新频率**：随项目演进持续更新
**培训计划**：新成员onboarding必读文档
