# UI组件系统架构

id: ARCH-UI-SYSTEM-001
---
id: ARCH-UI-SYSTEM-001
owner: @product-owner
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

定义 Stat Tools 的UI组件系统架构，确保组件的可复用性、一致性和可维护性，为开发团队提供清晰的组件开发规范。

## 技术栈选择

### 核心技术
```json
{
  "framework": "React 19",
  "styling": "Tailwind CSS 3.x",
  "components": "Headless UI + 自定义组件",
  "icons": "@heroicons/react",
  "forms": "React Hook Form + Zod",
  "animations": "Framer Motion (可选)",
  "testing": "@testing-library/react"
}
```

### 选择理由

**React 19**
- Server Components支持，性能优异
- 并发特性，用户体验流畅  
- 生态成熟，社区支持好

**Tailwind CSS**
- 原子化CSS，快速开发
- 响应式设计内置
- 与Next.js完美集成
- 生产构建优化

**Headless UI**
- 无障碍性内置
- 无样式约束，完全可定制
- 与Tailwind完美搭配
- React Hook Form兼容

## 组件层次架构

```
┌─────────────────────────────────────────┐
│                Pages                    │
│  /mean-calculator, /hub, /about         │
├─────────────────────────────────────────┤
│              Layouts                    │
│  AppLayout, CalculatorLayout            │
├─────────────────────────────────────────┤
│             Templates                   │
│  CalculatorTemplate, HubTemplate        │
├─────────────────────────────────────────┤
│             Organisms                   │
│  Calculator, Header, Footer, Sidebar    │
├─────────────────────────────────────────┤
│             Molecules                   │
│  InputGroup, ResultCard, StepList       │
├─────────────────────────────────────────┤
│              Atoms                      │
│  Button, Input, Label, Icon, Badge      │
├─────────────────────────────────────────┤
│             Tokens                      │
│  colors, spacing, typography, shadows   │
└─────────────────────────────────────────┘
```

## 组件分类详细说明

### 1. Tokens (设计令牌)
基础设计变量，定义在 Tailwind 配置中：

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#eff6ff',
          500: '#3b82f6',
          900: '#1e3a8a'
        },
        success: {
          50: '#f0fdf4',
          500: '#22c55e',
          900: '#14532d'
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          900: '#78350f'
        },
        error: {
          50: '#fef2f2',
          500: '#ef4444',
          900: '#7f1d1d'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif']
      },
      spacing: {
        18: '4.5rem',
        88: '22rem'
      }
    }
  }
}
```

### 2. Atoms (原子组件)
最基础的UI组件，不可再分：

#### Button 组件
```typescript
// components/ui/Button.tsx
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  children: React.ReactNode
  onClick?: () => void
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  children,
  onClick
}) => {
  const baseClasses = 'font-medium rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2'
  
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600 focus:ring-gray-500',
    outline: 'border-2 border-primary-500 text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    ghost: 'text-primary-500 hover:bg-primary-50 focus:ring-primary-500',
    danger: 'bg-error-500 text-white hover:bg-error-600 focus:ring-error-500'
  }
  
  const sizeClasses = {
    xs: 'px-2 py-1 text-xs',
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
    xl: 'px-6 py-3 text-base'
  }
  
  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={disabled || loading}
      onClick={onClick}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <LoadingSpinner size="sm" />
          {children}
        </div>
      ) : children}
    </button>
  )
}
```

#### Input 组件  
```typescript
// components/ui/Input.tsx
interface InputProps {
  label?: string
  placeholder?: string
  error?: string
  helper?: string
  required?: boolean
  disabled?: boolean
  type?: 'text' | 'number' | 'email' | 'password'
  value?: string
  onChange?: (value: string) => void
}

export const Input: React.FC<InputProps> = ({
  label,
  placeholder,
  error,
  helper,
  required = false,
  disabled = false,
  type = 'text',
  value,
  onChange
}) => {
  const inputClasses = `
    w-full px-3 py-2 border rounded-lg transition-colors
    focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent
    disabled:bg-gray-50 disabled:text-gray-500 disabled:cursor-not-allowed
    ${error ? 'border-error-500 focus:ring-error-500' : 'border-gray-300'}
  `
  
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-error-500 ml-1">*</span>}
        </label>
      )}
      
      <input
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className={inputClasses}
        aria-describedby={error ? 'input-error' : helper ? 'input-helper' : undefined}
      />
      
      {error && (
        <p id="input-error" className="text-sm text-error-500 flex items-center gap-1">
          <ExclamationTriangleIcon className="w-4 h-4" />
          {error}
        </p>
      )}
      
      {!error && helper && (
        <p id="input-helper" className="text-sm text-gray-500">
          {helper}
        </p>
      )}
    </div>
  )
}
```

### 3. Molecules (分子组件)
由原子组件组合而成的复合组件：

#### NumberInput 组件
```typescript
// components/ui/NumberInput.tsx
interface NumberInputProps {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  error?: string
  min?: number
  max?: number
  step?: number
}

export const NumberInput: React.FC<NumberInputProps> = ({
  label,
  value,
  onChange,
  placeholder = "输入数字...",
  error,
  min,
  max,
  step = 1
}) => {
  const handleIncrement = () => {
    const num = parseFloat(value || '0') + step
    if (max === undefined || num <= max) {
      onChange(num.toString())
    }
  }
  
  const handleDecrement = () => {
    const num = parseFloat(value || '0') - step
    if (min === undefined || num >= min) {
      onChange(num.toString())
    }
  }
  
  return (
    <div className="space-y-1">
      <Label required>{label}</Label>
      
      <div className="relative">
        <Input
          type="number"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          error={error}
          min={min}
          max={max}
          step={step}
        />
        
        <div className="absolute right-1 top-1 flex flex-col">
          <Button
            variant="ghost"
            size="xs"
            onClick={handleIncrement}
            className="px-1 py-0.5 h-4"
          >
            <ChevronUpIcon className="w-3 h-3" />
          </Button>
          <Button
            variant="ghost"
            size="xs"
            onClick={handleDecrement}
            className="px-1 py-0.5 h-4"
          >
            <ChevronDownIcon className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  )
}
```

#### ResultCard 组件
```typescript
// components/ui/ResultCard.tsx
interface ResultCardProps {
  title: string
  value: string | number
  description?: string
  unit?: string
  variant?: 'default' | 'success' | 'warning' | 'error'
  copyable?: boolean
}

export const ResultCard: React.FC<ResultCardProps> = ({
  title,
  value,
  description,
  unit,
  variant = 'default',
  copyable = false
}) => {
  const [copied, setCopied] = useState(false)
  
  const variantClasses = {
    default: 'bg-white border-gray-200',
    success: 'bg-success-50 border-success-200',
    warning: 'bg-warning-50 border-warning-200',
    error: 'bg-error-50 border-error-200'
  }
  
  const handleCopy = async () => {
    await navigator.clipboard.writeText(value.toString())
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }
  
  return (
    <div className={`p-6 rounded-lg border ${variantClasses[variant]}`}>
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        {copyable && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleCopy}
            className="text-gray-500"
          >
            {copied ? (
              <CheckIcon className="w-4 h-4" />
            ) : (
              <ClipboardIcon className="w-4 h-4" />
            )}
          </Button>
        )}
      </div>
      
      <div className="flex items-baseline gap-1 mb-2">
        <span className="text-3xl font-bold text-gray-900">{value}</span>
        {unit && <span className="text-sm text-gray-500">{unit}</span>}
      </div>
      
      {description && (
        <p className="text-sm text-gray-600">{description}</p>
      )}
    </div>
  )
}
```

### 4. Organisms (组织组件)
复杂的功能模块：

#### CalculatorForm 组件
```typescript
// components/organisms/CalculatorForm.tsx
interface CalculatorFormProps {
  type: 'mean' | 'stddev' | 'weighted-mean' | 'gpa'
  onCalculate: (data: any) => void
  loading?: boolean
}

export const CalculatorForm: React.FC<CalculatorFormProps> = ({
  type,
  onCalculate,
  loading = false
}) => {
  // 表单逻辑实现...
  
  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">{getTitle(type)}</h2>
          <p className="text-gray-600">{getDescription(type)}</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {renderFormFields(type)}
          
          <div className="flex gap-3">
            <Button
              type="submit"
              loading={loading}
              className="flex-1"
            >
              计算
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
            >
              重置
            </Button>
          </div>
        </form>
      </div>
    </Card>
  )
}
```

## 响应式设计策略

### 断点定义
```javascript
// Tailwind断点
const breakpoints = {
  sm: '640px',   // 手机横屏
  md: '768px',   // 平板
  lg: '1024px',  // 小桌面
  xl: '1280px',  // 桌面
  '2xl': '1536px' // 大桌面
}
```

### 响应式组件实现
```typescript
// 响应式工具Hook
const useResponsive = () => {
  const [breakpoint, setBreakpoint] = useState<string>('sm')
  
  useEffect(() => {
    const updateBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 1536) setBreakpoint('2xl')
      else if (width >= 1280) setBreakpoint('xl')
      else if (width >= 1024) setBreakpoint('lg')
      else if (width >= 768) setBreakpoint('md')
      else setBreakpoint('sm')
    }
    
    updateBreakpoint()
    window.addEventListener('resize', updateBreakpoint)
    return () => window.removeEventListener('resize', updateBreakpoint)
  }, [])
  
  return { breakpoint, isMobile: breakpoint === 'sm' }
}

// 响应式布局组件
export const ResponsiveGrid: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  )
}
```

## 主题系统

### 颜色主题
```javascript
// 主题配置
export const themes = {
  light: {
    background: 'white',
    foreground: 'gray-900',
    primary: 'blue-500',
    secondary: 'gray-500',
    success: 'green-500',
    warning: 'yellow-500',
    error: 'red-500'
  },
  dark: {
    background: 'gray-900',
    foreground: 'white',
    primary: 'blue-400',
    secondary: 'gray-400',
    success: 'green-400',
    warning: 'yellow-400',
    error: 'red-400'
  }
}
```

### 主题切换
```typescript
// 主题上下文
const ThemeContext = createContext<{
  theme: 'light' | 'dark'
  toggleTheme: () => void
}>({
  theme: 'light',
  toggleTheme: () => {}
})

// 主题提供者
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    localStorage.setItem('theme', newTheme)
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}
```

## 性能优化

### 代码分割
```typescript
// 懒加载组件
const Calculator = lazy(() => import('./Calculator'))
const ResultsPanel = lazy(() => import('./ResultsPanel'))

// 使用Suspense包装
export const CalculatorPage = () => (
  <Suspense fallback={<CalculatorSkeleton />}>
    <Calculator />
    <ResultsPanel />
  </Suspense>
)
```

### 组件优化
```typescript
// 使用memo优化重渲染
export const ExpensiveComponent = memo<Props>(({ data, onAction }) => {
  // 组件实现
}, (prevProps, nextProps) => {
  // 自定义比较逻辑
  return prevProps.data.id === nextProps.data.id
})

// 使用useMemo缓存计算
const MeanCalculator = ({ numbers }) => {
  const result = useMemo(() => {
    return calculateMean(numbers)
  }, [numbers])
  
  return <ResultCard value={result} />
}
```

## 测试策略

### 单元测试
```typescript
// 组件测试示例
describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByRole('button')).toHaveTextContent('Click me')
  })
  
  it('handles click events', () => {
    const onClick = jest.fn()
    render(<Button onClick={onClick}>Click me</Button>)
    
    fireEvent.click(screen.getByRole('button'))
    expect(onClick).toHaveBeenCalledTimes(1)
  })
  
  it('shows loading state', () => {
    render(<Button loading>Loading</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
    expect(screen.getByText('Loading')).toBeInTheDocument()
  })
})
```

### 视觉回归测试
```typescript
// Storybook + Chromatic
export default {
  title: 'UI/Button',
  component: Button,
  argTypes: {
    variant: {
      control: { type: 'select' },
      options: ['primary', 'secondary', 'outline', 'ghost', 'danger']
    }
  }
}

export const Primary = {
  args: {
    children: 'Button',
    variant: 'primary'
  }
}
```

## 组件文档规范

### 组件文档模板
```typescript
/**
 * Button - 通用按钮组件
 * 
 * @description 支持多种样式变体的按钮组件，内置加载状态和无障碍支持
 * 
 * @example
 * ```tsx
 * <Button variant="primary" size="md" onClick={handleClick}>
 *   点击我
 * </Button>
 * ```
 * 
 * @param variant - 按钮样式变体
 * @param size - 按钮尺寸
 * @param disabled - 是否禁用
 * @param loading - 是否显示加载状态  
 * @param children - 按钮内容
 * @param onClick - 点击回调函数
 */
```

## 开发工具链

### 开发依赖
```json
{
  "devDependencies": {
    "@storybook/react": "^7.0.0",
    "@testing-library/react": "^14.0.0",
    "@types/react": "^18.0.0",
    "chromatic": "^6.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0"
  }
}
```

### 构建脚本
```json
{
  "scripts": {
    "storybook": "storybook dev -p 6006",
    "build-storybook": "storybook build",
    "test:components": "jest --testPathPattern=components",
    "chromatic": "npx chromatic"
  }
}
```

## 维护指南

### 组件添加流程
1. 创建组件文件和类型定义
2. 编写单元测试
3. 创建 Storybook 故事
4. 添加文档和使用示例
5. 代码审查和集成测试

### 版本管理
- 遵循语义化版本控制
- 破坏性变更需要详细的迁移指南
- 定期清理废弃组件

---

**维护责任人**：前端架构师
**审查周期**：季度评估，重大变更时更新