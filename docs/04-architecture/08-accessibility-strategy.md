# 无障碍性策略

id: ARCH-A11Y-STRATEGY-001
---
id: ARCH-A11Y-STRATEGY-001
owner: @product-owner
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

确保 Stat Tools 为所有用户提供无障碍的体验，包括使用辅助技术的用户。遵循 WCAG 2.1 AA 标准，打造包容性的统计计算工具。

## 无障碍性原则

### WCAG 2.1 四大原则

#### 1. 可感知 (Perceivable)
- 信息和UI组件必须以用户能感知的方式呈现
- 提供文本替代、字幕、高对比度等

#### 2. 可操作 (Operable)  
- UI组件和导航必须是可操作的
- 支持键盘导航、避免癫痫诱发、提供足够时间

#### 3. 可理解 (Understandable)
- 信息和UI操作必须是可理解的
- 文本可读、功能可预测、错误提示清晰

#### 4. 健壮性 (Robust)
- 内容必须足够健壮，能被各种用户代理解释
- 兼容辅助技术、语义化标记

## 技术实现标准

### WCAG 2.1 AA 合规检查清单

#### 感知性 (Perceivable)

**1.1 文本替代**
- [ ] 所有图像都有有意义的alt文本
- [ ] 装饰性图像使用空alt=""或CSS背景
- [ ] 图标按钮有aria-label或屏幕阅读器文本

```typescript
// ✅ 正确的图标按钮实现
<button aria-label="计算均值" className="p-2">
  <CalculatorIcon className="w-5 h-5" aria-hidden="true" />
</button>

// ✅ 正确的信息图像
<img 
  src="/charts/mean-distribution.png" 
  alt="正态分布图显示均值为50，标准差为10的数据分布"
  className="w-full h-auto"
/>

// ✅ 装饰性图像
<div 
  className="bg-cover bg-center h-32"
  style={{ backgroundImage: 'url(/decorative-pattern.png)' }}
  role="presentation"
/>
```

**1.2 基于时间的媒体**
- [ ] 视频提供字幕和音频描述
- [ ] 音频提供文字转录

**1.3 适应性**
- [ ] 内容可以在不丢失信息的情况下以不同方式呈现
- [ ] 支持缩放至200%而不影响功能
- [ ] 支持竖屏和横屏方向

```css
/* 响应式设计确保适应性 */
.calculator-container {
  @apply container mx-auto px-4;
  @apply max-w-4xl;
}

@media (max-width: 640px) {
  .calculator-grid {
    @apply grid-cols-1 gap-4;
  }
}

@media (min-width: 1024px) {
  .calculator-grid {
    @apply grid-cols-2 gap-8;
  }
}
```

**1.4 可辨别性**
- [ ] 颜色对比度符合AA标准 (4.5:1 for normal text, 3:1 for large text)
- [ ] 不仅依靠颜色传达信息
- [ ] 音频控制可用
- [ ] 文本可缩放至200%

```typescript
// 颜色对比度配置
const colorContrast = {
  // 正常文本 - 4.5:1 对比度
  normalText: {
    light: { bg: '#ffffff', text: '#1f2937' }, // 16.94:1
    dark: { bg: '#1f2937', text: '#f9fafb' }   // 16.94:1
  },
  
  // 大文本 - 3:1 对比度  
  largeText: {
    light: { bg: '#f3f4f6', text: '#374151' }, // 7.07:1
    dark: { bg: '#374151', text: '#f3f4f6' }   // 7.07:1
  },
  
  // 非文本元素 - 3:1 对比度
  interactive: {
    primary: '#2563eb',   // 与白色对比 4.52:1
    success: '#059669',   // 与白色对比 4.07:1
    error: '#dc2626'      // 与白色对比 5.74:1
  }
}

// 多感官信息传达
const StatusIndicator: React.FC<{ status: 'success' | 'error' | 'warning' }> = ({ status }) => {
  const config = {
    success: {
      color: 'text-success-600',
      icon: CheckCircleIcon,
      text: '成功'
    },
    error: {
      color: 'text-error-600', 
      icon: XCircleIcon,
      text: '错误'
    },
    warning: {
      color: 'text-warning-600',
      icon: ExclamationTriangleIcon,
      text: '警告'
    }
  }
  
  const { color, icon: Icon, text } = config[status]
  
  return (
    <div className={`flex items-center gap-2 ${color}`}>
      <Icon className="w-5 h-5" aria-hidden="true" />
      <span className="font-medium">{text}</span>
      {/* 不仅依靠颜色，还使用图标和文字 */}
    </div>
  )
}
```

#### 可操作性 (Operable)

**2.1 键盘可访问性**
- [ ] 所有功能都可以通过键盘访问
- [ ] 焦点顺序逻辑且可见
- [ ] 可以用键盘退出焦点陷阱

```typescript
// 键盘导航支持
const Calculator: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null)
  const calculateButtonRef = useRef<HTMLButtonElement>(null)
  
  const handleKeyDown = (e: KeyboardEvent) => {
    // Enter键提交表单
    if (e.key === 'Enter' && e.target === inputRef.current) {
      e.preventDefault()
      calculateButtonRef.current?.click()
    }
    
    // Escape键重置表单
    if (e.key === 'Escape') {
      handleReset()
    }
  }
  
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])
  
  return (
    <form className="space-y-4">
      <Input
        ref={inputRef}
        label="输入数字"
        placeholder="1,2,3,4,5"
        aria-describedby="input-help"
      />
      
      <p id="input-help" className="text-sm text-gray-600">
        输入用逗号分隔的数字，按Enter键开始计算
      </p>
      
      <div className="flex gap-3">
        <Button
          ref={calculateButtonRef}
          type="button"
          onClick={handleCalculate}
          aria-keyshortcuts="Enter"
        >
          计算 (Enter)
        </Button>
        
        <Button
          type="button"
          variant="outline"
          onClick={handleReset}
          aria-keyshortcuts="Escape"
        >
          重置 (Esc)
        </Button>
      </div>
    </form>
  )
}

// 焦点管理Hook
const useFocusManagement = () => {
  const trapRef = useRef<HTMLDivElement>(null)
  
  const trapFocus = useCallback((e: KeyboardEvent) => {
    if (e.key !== 'Tab') return
    
    const focusableElements = trapRef.current?.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    )
    
    if (!focusableElements || focusableElements.length === 0) return
    
    const firstElement = focusableElements[0] as HTMLElement
    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement
    
    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault()
        lastElement.focus()
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault() 
        firstElement.focus()
      }
    }
  }, [])
  
  return { trapRef, trapFocus }
}
```

**2.2 无癫痫和身体反应**
- [ ] 避免每秒闪烁3次以上的内容
- [ ] 提供动画控制选项

```css
/* 尊重用户动画偏好 */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 安全的动画实现 */
.safe-pulse {
  animation: safe-pulse 2s ease-in-out infinite;
}

@keyframes safe-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.8; }
  /* 避免完全消失，减少视觉冲击 */
}
```

**2.3 导航**
- [ ] 用户不会被困在子部分中
- [ ] 可以跳过重复内容
- [ ] 页面有标题，标题描述主题或目的

```typescript
// 跳过链接组件
const SkipLinks: React.FC = () => (
  <div className="sr-only focus:not-sr-only">
    <a 
      href="#main-content"
      className="absolute top-4 left-4 bg-blue-600 text-white p-2 rounded z-50"
    >
      跳到主要内容
    </a>
    <a
      href="#calculator-form" 
      className="absolute top-4 left-32 bg-blue-600 text-white p-2 rounded z-50"
    >
      跳到计算器
    </a>
  </div>
)

// 页面结构
const CalculatorPage: React.FC = () => (
  <div>
    <SkipLinks />
    
    <header>
      <nav aria-label="主要导航">
        {/* 导航内容 */}
      </nav>
    </header>
    
    <main id="main-content">
      <h1>均值计算器</h1>
      <section id="calculator-form" aria-labelledby="calculator-heading">
        <h2 id="calculator-heading">输入数据</h2>
        {/* 计算器表单 */}
      </section>
    </main>
  </div>
)
```

#### 可理解性 (Understandable)

**3.1 可读性**
- [ ] 页面语言可识别
- [ ] 文本部分的语言可识别

```html
<!-- 页面语言声明 -->
<html lang="zh-CN">
  <head>
    <title>统计计算器 - Stat Tools</title>
  </head>
  <body>
    <p>这是中文内容。</p>
    <p lang="en">This is English content.</p>
  </body>
</html>
```

**3.2 可预测性**  
- [ ] 组件获得焦点时不会引起上下文变化
- [ ] 改变设置不会引起意外的上下文变化
- [ ] 导航机制一致

```typescript
// 可预测的表单行为
const PredictableForm: React.FC = () => {
  const [numbers, setNumbers] = useState('')
  const [autoCalculate, setAutoCalculate] = useState(false)
  
  // 明确的用户操作，不会自动触发
  const handleCalculateClick = () => {
    // 只在用户明确操作时计算
    calculate()
  }
  
  // 提供明确的提示
  const handleAutoCalculateToggle = (enabled: boolean) => {
    setAutoCalculate(enabled)
    
    if (enabled) {
      // 明确告知用户行为变化
      announce('已开启自动计算，输入变化时将自动计算结果')
    } else {
      announce('已关闭自动计算，需要手动点击计算按钮')
    }
  }
  
  return (
    <form>
      <Input
        value={numbers}
        onChange={setNumbers}
        label="输入数字"
        aria-describedby="input-behavior"
      />
      
      <p id="input-behavior" className="text-sm text-gray-600">
        {autoCalculate ? '输入时自动计算' : '需要手动点击计算'}
      </p>
      
      <Switch
        checked={autoCalculate}
        onChange={handleAutoCalculateToggle}
        label="自动计算"
        aria-describedby="auto-calc-help"
      />
      
      <p id="auto-calc-help" className="text-sm text-gray-600">
        开启后，输入数字时会自动显示计算结果
      </p>
      
      {!autoCalculate && (
        <Button onClick={handleCalculateClick}>
          计算
        </Button>
      )}
    </form>
  )
}
```

**3.3 输入辅助**
- [ ] 错误被识别并用文本描述
- [ ] 提供标签或指令
- [ ] 错误建议可用

```typescript
// 全面的错误处理
const ValidationError: React.FC<{ 
  errors: string[]
  suggestions?: string[]
}> = ({ errors, suggestions = [] }) => (
  <div role="alert" aria-live="polite" className="mt-2">
    {errors.map((error, index) => (
      <div key={index} className="flex items-start gap-2 text-error-600">
        <ExclamationTriangleIcon className="w-4 h-4 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium">{error}</p>
          {suggestions[index] && (
            <p className="text-sm text-gray-600 mt-1">
              建议：{suggestions[index]}
            </p>
          )}
        </div>
      </div>
    ))}
  </div>
)

// 智能表单验证
const useFormValidation = (value: string) => {
  const [errors, setErrors] = useState<string[]>([])
  const [suggestions, setSuggestions] = useState<string[]>([])
  
  useEffect(() => {
    const newErrors: string[] = []
    const newSuggestions: string[] = []
    
    if (!value.trim()) {
      newErrors.push('请输入至少一个数字')
      newSuggestions.push('例如：1,2,3,4,5')
    } else {
      const parts = value.split(',')
      const invalidParts = parts.filter(part => isNaN(Number(part.trim())))
      
      if (invalidParts.length > 0) {
        newErrors.push(`发现 ${invalidParts.length} 个无效数字`)
        newSuggestions.push(`检查这些值：${invalidParts.join(', ')}`)
      }
      
      const validNumbers = parts.filter(part => !isNaN(Number(part.trim())))
      if (validNumbers.length < 2) {
        newErrors.push('至少需要2个有效数字才能计算')
        newSuggestions.push('添加更多数字，用逗号分隔')
      }
    }
    
    setErrors(newErrors)
    setSuggestions(newSuggestions)
  }, [value])
  
  return { errors, suggestions, isValid: errors.length === 0 }
}
```

#### 健壮性 (Robust)

**4.1 兼容性**
- [ ] 标记有效并正确使用
- [ ] 元素有完整的开始和结束标签
- [ ] 支持辅助技术

```typescript
// 语义化HTML结构
const CalculatorResults: React.FC<{ result: CalculationResult }> = ({ result }) => (
  <section aria-labelledby="results-heading" className="mt-8">
    <h2 id="results-heading" className="text-xl font-semibold mb-4">
      计算结果
    </h2>
    
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500 mb-1">
          均值
        </h3>
        <p className="text-2xl font-bold text-gray-900" aria-label={`均值为 ${result.mean}`}>
          {result.mean}
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500 mb-1">
          样本数量
        </h3>
        <p className="text-2xl font-bold text-gray-900" aria-label={`样本数量为 ${result.count}`}>
          {result.count}
        </p>
      </div>
      
      <div className="bg-white p-4 rounded-lg border">
        <h3 className="text-sm font-medium text-gray-500 mb-1">
          总和
        </h3>
        <p className="text-2xl font-bold text-gray-900" aria-label={`总和为 ${result.sum}`}>
          {result.sum}
        </p>
      </div>
    </div>
    
    <details className="mt-4" aria-labelledby="steps-heading">
      <summary 
        id="steps-heading"
        className="cursor-pointer text-blue-600 hover:text-blue-700"
      >
        查看计算步骤
      </summary>
      <ol className="mt-2 space-y-2 list-decimal list-inside" role="list">
        {result.steps.map((step, index) => (
          <li key={index} className="text-gray-700">
            {step}
          </li>
        ))}
      </ol>
    </details>
  </section>
)
```

## 辅助技术支持

### 屏幕阅读器优化

```typescript
// 屏幕阅读器友好的动态内容
const LiveRegion: React.FC<{ 
  message: string
  priority: 'polite' | 'assertive'
  role?: 'status' | 'alert'
}> = ({ message, priority, role = 'status' }) => (
  <div
    aria-live={priority}
    aria-atomic="true"
    role={role}
    className="sr-only"
  >
    {message}
  </div>
)

// 使用示例
const Calculator: React.FC = () => {
  const [announcement, setAnnouncement] = useState('')
  
  const announce = (message: string) => {
    setAnnouncement(message)
    // 清除announcement以便下次使用
    setTimeout(() => setAnnouncement(''), 1000)
  }
  
  const handleCalculate = async () => {
    announce('正在计算...')
    
    try {
      const result = await calculate()
      announce(`计算完成，均值为 ${result.mean}`)
    } catch (error) {
      announce(`计算失败：${error.message}`)
    }
  }
  
  return (
    <div>
      <LiveRegion message={announcement} priority="polite" />
      {/* 计算器UI */}
    </div>
  )
}
```

### 表格可访问性

```typescript
// 可访问的数据表格
const DataTable: React.FC<{ data: StatisticsData[] }> = ({ data }) => (
  <table role="table" aria-label="统计数据表格" className="w-full">
    <caption className="sr-only">
      包含 {data.length} 行统计数据，包括数值、频率和百分比
    </caption>
    
    <thead>
      <tr role="row">
        <th role="columnheader" scope="col" aria-sort="none" className="text-left p-2">
          数值
        </th>
        <th role="columnheader" scope="col" aria-sort="none" className="text-left p-2">
          频率
        </th>
        <th role="columnheader" scope="col" aria-sort="none" className="text-left p-2">
          百分比
        </th>
      </tr>
    </thead>
    
    <tbody>
      {data.map((row, index) => (
        <tr key={index} role="row">
          <td role="gridcell" className="p-2">
            {row.value}
          </td>
          <td role="gridcell" className="p-2">
            {row.frequency}
          </td>
          <td role="gridcell" className="p-2" aria-label={`${row.percentage}百分比`}>
            {row.percentage}%
          </td>
        </tr>
      ))}
    </tbody>
  </table>
)
```

## 测试策略

### 自动化可访问性测试

```typescript
// Jest + axe-core 测试
import { render } from '@testing-library/react'
import { axe, toHaveNoViolations } from 'jest-axe'

expect.extend(toHaveNoViolations)

describe('Calculator Accessibility', () => {
  test('should not have accessibility violations', async () => {
    const { container } = render(<Calculator />)
    const results = await axe(container)
    expect(results).toHaveNoViolations()
  })
  
  test('should support keyboard navigation', () => {
    const { getByRole } = render(<Calculator />)
    const input = getByRole('textbox', { name: /输入数字/i })
    const button = getByRole('button', { name: /计算/i })
    
    input.focus()
    expect(document.activeElement).toBe(input)
    
    fireEvent.keyDown(input, { key: 'Tab' })
    expect(document.activeElement).toBe(button)
  })
})

// Playwright E2E 可访问性测试
test('accessibility with screen reader', async ({ page }) => {
  await page.goto('/mean-calculator')
  
  // 使用 axe-playwright
  await injectAxe(page)
  const accessibilityScanResults = await checkA11y(page, null, {
    detailedReport: true,
    detailedReportOptions: { html: true }
  })
  
  expect(accessibilityScanResults.violations).toHaveLength(0)
})
```

### 手动测试检查清单

#### 键盘导航测试
- [ ] Tab键可以遍历所有交互元素
- [ ] Shift+Tab可以反向导航
- [ ] Enter/Space可以激活按钮和链接
- [ ] 箭头键可以导航菜单和选项卡
- [ ] Escape可以关闭模态框和下拉菜单

#### 屏幕阅读器测试
- [ ] 所有内容都能被屏幕阅读器朗读
- [ ] 语义化标记正确
- [ ] 表单标签和描述完整
- [ ] 错误信息清晰
- [ ] 动态内容变化能被感知

#### 视觉测试
- [ ] 200%缩放下功能完整
- [ ] 高对比度模式下可用
- [ ] 颜色盲用户能正常使用
- [ ] 焦点指示清晰可见

## 工具和资源

### 开发工具
```json
{
  "dependencies": {
    "@axe-core/react": "^4.7.0",
    "react-focus-lock": "^2.9.0",
    "react-aria-live": "^3.0.0"
  },
  "devDependencies": {
    "axe-playwright": "^1.2.0",
    "jest-axe": "^8.0.0",
    "@testing-library/jest-dom": "^6.0.0"
  }
}
```

### 浏览器扩展
- axe DevTools - 自动检测可访问性问题
- WAVE - Web可访问性评估工具
- Lighthouse - 包含可访问性审计
- Screen Reader - 模拟屏幕阅读器体验

### 在线工具
- WebAIM Contrast Checker - 颜色对比度检查
- WAVE Web Accessibility Evaluator - 在线可访问性评估
- axe Monitor - 持续可访问性监控

## 组织流程

### 设计阶段
1. **设计评审**：包含可访问性检查
2. **原型测试**：早期可访问性验证
3. **设计系统**：可访问的组件库

### 开发阶段
1. **编码标准**：强制可访问性要求
2. **代码审查**：包含a11y检查
3. **单元测试**：自动化可访问性测试

### 测试阶段
1. **自动化测试**：CI/CD集成axe测试
2. **手动测试**：键盘和屏幕阅读器测试
3. **用户测试**：真实用户反馈

### 维护阶段
1. **定期审查**：季度可访问性审查
2. **用户反馈**：收集无障碍体验反馈
3. **持续改进**：基于反馈优化体验

## 培训和文档

### 团队培训
- WCAG 2.1标准培训
- 辅助技术使用体验
- 可访问性测试方法
- 无障碍设计思维

### 开发文档
- 可访问性编码指南
- 组件a11y使用说明
- 测试用例模板
- 常见问题解决方案

## 监控和改进

### 性能指标
- 可访问性合规率
- 用户满意度评分
- 辅助技术兼容性
- 错误修复时间

### 持续改进
- 用户反馈收集
- 定期技术评估
- 工具和流程优化
- 团队技能提升

---

**维护责任人**：前端开发团队 + UX设计师
**审查周期**：每月检查，季度深度审查
**合规目标**：WCAG 2.1 AA级别 100%合规