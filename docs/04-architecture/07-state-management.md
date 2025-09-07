# 状态管理架构

id: ARCH-STATE-MGMT-001
---
id: ARCH-STATE-MGMT-001
owner: @product-owner
acceptance: docs/03-acceptance/04-architecture.feature
version: 1.0
created: 2025-09-05
status: Draft
reviewers: []
---

## 目的

定义 Stat Tools 的状态管理策略，确保应用状态的可预测性、可维护性和性能优化，为不同场景选择合适的状态管理方案。

## 状态管理策略概览

### 分层状态管理
```
┌─────────────────────────────────────────────┐
│            Server State                     │
│  • API响应缓存  • 远程数据同步               │
├─────────────────────────────────────────────┤
│            Global State                     │
│  • 主题设置  • 用户偏好  • 应用配置           │
├─────────────────────────────────────────────┤
│            Local State                      │
│  • 表单数据  • 组件状态  • UI状态             │
├─────────────────────────────────────────────┤
│            Derived State                    │
│  • 计算结果  • 格式化数据  • 统计信息         │
└─────────────────────────────────────────────┘
```

### 技术选型

| 状态类型 | 技术方案 | 使用场景 | 理由 |
|----------|----------|----------|------|
| 组件本地状态 | React useState/useReducer | 表单输入、UI切换 | 简单、性能好 |
| 跨组件共享 | React Context + useContext | 主题、语言设置 | 避免prop drilling |
| 复杂全局状态 | Zustand | 用户偏好、计算历史 | 轻量、易用 |
| 表单状态 | React Hook Form | 计算器表单 | 性能优异、验证完善 |
| 服务端状态 | TanStack Query (可选) | API缓存 | 专业的服务端状态管理 |

## 本地状态管理

### useState Hook
用于简单的组件内状态：

```typescript
// 简单状态示例
const NumberInput: React.FC = () => {
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)
  
  const handleChange = (newValue: string) => {
    setValue(newValue)
    
    // 验证逻辑
    if (isNaN(Number(newValue))) {
      setError('请输入有效数字')
    } else {
      setError(null)
    }
  }
  
  return (
    <Input
      value={value}
      onChange={handleChange}
      error={error}
    />
  )
}
```

### useReducer Hook
用于复杂的状态逻辑：

```typescript
// 计算器状态定义
interface CalculatorState {
  numbers: number[]
  precision: number
  ignoreNonNumeric: boolean
  result: CalculationResult | null
  loading: boolean
  error: string | null
}

type CalculatorAction = 
  | { type: 'SET_NUMBERS'; payload: number[] }
  | { type: 'SET_PRECISION'; payload: number }
  | { type: 'TOGGLE_IGNORE_NON_NUMERIC' }
  | { type: 'CALCULATE_START' }
  | { type: 'CALCULATE_SUCCESS'; payload: CalculationResult }
  | { type: 'CALCULATE_ERROR'; payload: string }
  | { type: 'RESET' }

// Reducer函数
const calculatorReducer = (
  state: CalculatorState, 
  action: CalculatorAction
): CalculatorState => {
  switch (action.type) {
    case 'SET_NUMBERS':
      return { ...state, numbers: action.payload, error: null }
      
    case 'SET_PRECISION':
      return { ...state, precision: action.payload }
      
    case 'TOGGLE_IGNORE_NON_NUMERIC':
      return { ...state, ignoreNonNumeric: !state.ignoreNonNumeric }
      
    case 'CALCULATE_START':
      return { ...state, loading: true, error: null }
      
    case 'CALCULATE_SUCCESS':
      return { 
        ...state, 
        loading: false, 
        result: action.payload,
        error: null 
      }
      
    case 'CALCULATE_ERROR':
      return { 
        ...state, 
        loading: false, 
        result: null,
        error: action.payload 
      }
      
    case 'RESET':
      return initialState
      
    default:
      return state
  }
}

// 使用示例
const MeanCalculator: React.FC = () => {
  const [state, dispatch] = useReducer(calculatorReducer, initialState)
  
  const handleCalculate = async () => {
    dispatch({ type: 'CALCULATE_START' })
    
    try {
      const result = await calculateMean(state.numbers, state.precision)
      dispatch({ type: 'CALCULATE_SUCCESS', payload: result })
    } catch (error) {
      dispatch({ type: 'CALCULATE_ERROR', payload: error.message })
    }
  }
  
  return (
    <div>
      <NumberArrayInput 
        value={state.numbers}
        onChange={(numbers) => dispatch({ type: 'SET_NUMBERS', payload: numbers })}
      />
      <Button onClick={handleCalculate} loading={state.loading}>
        计算
      </Button>
      {state.result && <ResultCard result={state.result} />}
      {state.error && <ErrorMessage message={state.error} />}
    </div>
  )
}
```

## 表单状态管理

### React Hook Form 集成
统一的表单状态管理方案：

```typescript
// 表单类型定义
interface MeanCalculatorForm {
  numbersInput: string
  precision: number
  ignoreNonNumeric: boolean
}

// Zod验证Schema
const meanCalculatorSchema = z.object({
  numbersInput: z.string()
    .min(1, '请输入至少一个数字')
    .refine(val => {
      const numbers = parseNumbers(val)
      return numbers.length > 0
    }, '请输入有效的数字'),
  precision: z.number()
    .min(0, '精度不能小于0')
    .max(10, '精度不能超过10'),
  ignoreNonNumeric: z.boolean()
})

// 表单Hook
const useMeanCalculatorForm = () => {
  const form = useForm<MeanCalculatorForm>({
    resolver: zodResolver(meanCalculatorSchema),
    defaultValues: {
      numbersInput: '',
      precision: 2,
      ignoreNonNumeric: true
    }
  })
  
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  
  const onSubmit = async (data: MeanCalculatorForm) => {
    setIsCalculating(true)
    
    try {
      const numbers = parseNumbers(data.numbersInput)
      const calculationResult = await calculateMean(numbers, data.precision)
      setResult(calculationResult)
    } catch (error) {
      form.setError('numbersInput', {
        type: 'manual',
        message: error.message
      })
    } finally {
      setIsCalculating(false)
    }
  }
  
  const reset = () => {
    form.reset()
    setResult(null)
  }
  
  return {
    form,
    result,
    isCalculating,
    onSubmit: form.handleSubmit(onSubmit),
    reset
  }
}

// 组件使用
const MeanCalculator: React.FC = () => {
  const { form, result, isCalculating, onSubmit, reset } = useMeanCalculatorForm()
  
  return (
    <FormProvider {...form}>
      <form onSubmit={onSubmit} className="space-y-6">
        <FormField
          name="numbersInput"
          render={({ field, fieldState }) => (
            <Input
              {...field}
              label="输入数字 (逗号分隔)"
              placeholder="1,2,3,4,5"
              error={fieldState.error?.message}
            />
          )}
        />
        
        <FormField
          name="precision"
          render={({ field }) => (
            <NumberInput
              {...field}
              label="小数位数"
              min={0}
              max={10}
            />
          )}
        />
        
        <FormField
          name="ignoreNonNumeric"
          render={({ field }) => (
            <Switch
              {...field}
              label="忽略非数字值"
            />
          )}
        />
        
        <div className="flex gap-3">
          <Button type="submit" loading={isCalculating}>
            计算
          </Button>
          <Button type="button" variant="outline" onClick={reset}>
            重置
          </Button>
        </div>
        
        {result && <ResultCard result={result} />}
      </form>
    </FormProvider>
  )
}
```

## 全局状态管理

### React Context 方案
用于主题、语言等全局设置：

```typescript
// 应用设置类型
interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  language: 'en' | 'zh' | 'auto'
  defaultPrecision: number
  autoSave: boolean
}

// Context定义
interface AppContextType {
  settings: AppSettings
  updateSettings: (updates: Partial<AppSettings>) => void
  resetSettings: () => void
}

const AppContext = createContext<AppContextType | null>(null)

// Provider组件
export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings>(() => {
    // 从localStorage恢复设置
    const saved = localStorage.getItem('app-settings')
    return saved ? JSON.parse(saved) : defaultSettings
  })
  
  const updateSettings = useCallback((updates: Partial<AppSettings>) => {
    setSettings(prev => {
      const newSettings = { ...prev, ...updates }
      localStorage.setItem('app-settings', JSON.stringify(newSettings))
      return newSettings
    })
  }, [])
  
  const resetSettings = useCallback(() => {
    setSettings(defaultSettings)
    localStorage.removeItem('app-settings')
  }, [])
  
  // 主题切换效果
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'dark') {
      root.classList.add('dark')
    } else if (settings.theme === 'light') {
      root.classList.remove('dark')
    } else {
      // system theme
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches
      root.classList.toggle('dark', isDark)
    }
  }, [settings.theme])
  
  const value = useMemo(() => ({
    settings,
    updateSettings,
    resetSettings
  }), [settings, updateSettings, resetSettings])
  
  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  )
}

// Hook使用
export const useAppSettings = () => {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error('useAppSettings must be used within AppProvider')
  }
  return context
}
```

### Zustand 方案 (可选)
用于更复杂的全局状态：

```typescript
// 计算历史状态
interface CalculationHistory {
  id: string
  type: 'mean' | 'stddev' | 'weighted-mean' | 'gpa'
  input: any
  result: any
  timestamp: number
}

interface HistoryState {
  items: CalculationHistory[]
  maxItems: number
  addItem: (item: Omit<CalculationHistory, 'id' | 'timestamp'>) => void
  removeItem: (id: string) => void
  clearHistory: () => void
  getItemsByType: (type: CalculationHistory['type']) => CalculationHistory[]
}

// Zustand store
export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      items: [],
      maxItems: 50,
      
      addItem: (item) => set((state) => {
        const newItem: CalculationHistory = {
          ...item,
          id: nanoid(),
          timestamp: Date.now()
        }
        
        const newItems = [newItem, ...state.items].slice(0, state.maxItems)
        return { items: newItems }
      }),
      
      removeItem: (id) => set((state) => ({
        items: state.items.filter(item => item.id !== id)
      })),
      
      clearHistory: () => set({ items: [] }),
      
      getItemsByType: (type) => get().items.filter(item => item.type === type)
    }),
    {
      name: 'calculation-history',
      storage: createJSONStorage(() => localStorage)
    }
  )
)

// 使用示例
const HistoryPanel: React.FC = () => {
  const { items, removeItem, clearHistory } = useHistoryStore()
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">计算历史</h3>
        <Button variant="outline" onClick={clearHistory}>
          清除全部
        </Button>
      </div>
      
      {items.map((item) => (
        <HistoryItem 
          key={item.id} 
          item={item} 
          onRemove={() => removeItem(item.id)}
        />
      ))}
    </div>
  )
}
```

## 派生状态管理

### useMemo优化
计算密集型派生状态：

```typescript
// 统计汇总Hook
const useStatisticsSummary = (numbers: number[]) => {
  const summary = useMemo(() => {
    if (numbers.length === 0) return null
    
    const sorted = [...numbers].sort((a, b) => a - b)
    const sum = numbers.reduce((acc, num) => acc + num, 0)
    const mean = sum / numbers.length
    
    const variance = numbers.reduce((acc, num) => {
      return acc + Math.pow(num - mean, 2)
    }, 0) / numbers.length
    
    const stdDev = Math.sqrt(variance)
    
    return {
      count: numbers.length,
      sum,
      mean,
      median: sorted[Math.floor(sorted.length / 2)],
      min: sorted[0],
      max: sorted[sorted.length - 1],
      variance,
      standardDeviation: stdDev,
      range: sorted[sorted.length - 1] - sorted[0]
    }
  }, [numbers])
  
  return summary
}

// 使用示例
const StatisticsDashboard: React.FC<{ numbers: number[] }> = ({ numbers }) => {
  const summary = useStatisticsSummary(numbers)
  
  if (!summary) return <p>请输入数字查看统计信息</p>
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <StatCard label="总数" value={summary.count} />
      <StatCard label="均值" value={summary.mean.toFixed(2)} />
      <StatCard label="中位数" value={summary.median} />
      <StatCard label="标准差" value={summary.standardDeviation.toFixed(2)} />
    </div>
  )
}
```

### 自定义Hook抽象
复用派生状态逻辑：

```typescript
// 数字解析Hook
const useNumberParser = (input: string, ignoreNonNumeric: boolean = true) => {
  const result = useMemo(() => {
    if (!input.trim()) {
      return { numbers: [], errors: [] }
    }
    
    const parts = input.split(',').map(part => part.trim())
    const numbers: number[] = []
    const errors: string[] = []
    
    parts.forEach((part, index) => {
      const num = Number(part)
      if (isNaN(num)) {
        if (!ignoreNonNumeric) {
          errors.push(`位置 ${index + 1}: "${part}" 不是有效数字`)
        }
      } else {
        numbers.push(num)
      }
    })
    
    return { numbers, errors }
  }, [input, ignoreNonNumeric])
  
  return result
}

// 验证Hook  
const useInputValidation = (numbers: number[], minCount: number = 1) => {
  const validation = useMemo(() => {
    const errors: string[] = []
    
    if (numbers.length < minCount) {
      errors.push(`至少需要 ${minCount} 个数字`)
    }
    
    if (numbers.some(num => !isFinite(num))) {
      errors.push('包含无效数字 (无穷大或NaN)')
    }
    
    return {
      isValid: errors.length === 0,
      errors
    }
  }, [numbers, minCount])
  
  return validation
}

// 组合使用
const SmartNumberInput: React.FC = () => {
  const [input, setInput] = useState('')
  const [ignoreNonNumeric, setIgnoreNonNumeric] = useState(true)
  
  const { numbers, errors: parseErrors } = useNumberParser(input, ignoreNonNumeric)
  const { isValid, errors: validationErrors } = useInputValidation(numbers, 2)
  const summary = useStatisticsSummary(numbers)
  
  const allErrors = [...parseErrors, ...validationErrors]
  
  return (
    <div className="space-y-4">
      <Input
        value={input}
        onChange={setInput}
        placeholder="1,2,3,4,5"
        error={allErrors[0]}
      />
      
      <Switch
        checked={ignoreNonNumeric}
        onChange={setIgnoreNonNumeric}
        label="忽略非数字值"
      />
      
      {numbers.length > 0 && (
        <div className="p-4 bg-gray-50 rounded-lg">
          <p>解析到 {numbers.length} 个数字: {numbers.join(', ')}</p>
        </div>
      )}
      
      {summary && <StatisticsDashboard numbers={numbers} />}
      
      <Button disabled={!isValid}>
        计算 ({numbers.length} 个数字)
      </Button>
    </div>
  )
}
```

## 服务端状态管理 (可选)

### TanStack Query集成
用于API数据缓存和同步：

```typescript
// API函数
const calculateMeanAPI = async (data: { numbers: number[]; precision: number }) => {
  const response = await fetch('/api/mean', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  })
  
  if (!response.ok) {
    throw new Error('计算失败')
  }
  
  return response.json()
}

// Query Hook
const useMeanCalculation = (numbers: number[], precision: number, enabled: boolean = false) => {
  return useQuery({
    queryKey: ['mean', numbers, precision],
    queryFn: () => calculateMeanAPI({ numbers, precision }),
    enabled: enabled && numbers.length > 0,
    staleTime: 5 * 60 * 1000, // 5分钟
    cacheTime: 10 * 60 * 1000  // 10分钟
  })
}

// 使用示例
const ServerMeanCalculator: React.FC = () => {
  const [numbers, setNumbers] = useState<number[]>([])
  const [precision, setPrecision] = useState(2)
  const [shouldCalculate, setShouldCalculate] = useState(false)
  
  const { data, isLoading, error } = useMeanCalculation(
    numbers, 
    precision, 
    shouldCalculate
  )
  
  const handleCalculate = () => {
    setShouldCalculate(true)
  }
  
  return (
    <div>
      {/* Input组件 */}
      
      <Button onClick={handleCalculate} loading={isLoading}>
        计算
      </Button>
      
      {error && <ErrorMessage message={error.message} />}
      {data && <ResultCard result={data} />}
    </div>
  )
}
```

## 状态持久化

### localStorage策略
```typescript
// 通用持久化Hook
const usePersistentState = <T>(key: string, defaultValue: T) => {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key)
      return stored ? JSON.parse(stored) : defaultValue
    } catch {
      return defaultValue
    }
  })
  
  const setPersistentState = useCallback((value: T | ((prev: T) => T)) => {
    setState(prev => {
      const newValue = typeof value === 'function' ? (value as (prev: T) => T)(prev) : value
      localStorage.setItem(key, JSON.stringify(newValue))
      return newValue
    })
  }, [key])
  
  return [state, setPersistentState] as const
}

// 使用示例
const Calculator: React.FC = () => {
  const [settings, setSettings] = usePersistentState('calculator-settings', {
    precision: 2,
    ignoreNonNumeric: true
  })
  
  // 组件逻辑...
}
```

## 性能优化

### 状态更新优化
```typescript
// 批量更新
const useBatchedUpdates = () => {
  const [updates, setUpdates] = useState<Record<string, any>>({})
  
  const batchUpdate = useCallback((key: string, value: any) => {
    setUpdates(prev => ({ ...prev, [key]: value }))
  }, [])
  
  const applyUpdates = useCallback(() => {
    // 批量应用更新
    Object.entries(updates).forEach(([key, value]) => {
      // 应用更新逻辑
    })
    setUpdates({})
  }, [updates])
  
  return { batchUpdate, applyUpdates }
}
```

### memo优化
```typescript
// 选择性重渲染
const ResultDisplay = memo<{ result: CalculationResult }>(
  ({ result }) => {
    return <ResultCard result={result} />
  },
  (prevProps, nextProps) => {
    // 自定义比较逻辑
    return prevProps.result.value === nextProps.result.value
  }
)
```

## 调试工具

### 开发工具集成
```typescript
// Redux DevTools支持 (Zustand)
const useHistoryStore = create<HistoryState>()(
  devtools(
    persist(/* ... */),
    { name: 'calculation-history' }
  )
)

// React DevTools Profiler
const ProfiledCalculator = () => (
  <Profiler
    id="Calculator"
    onRender={(id, phase, actualDuration) => {
      console.log({ id, phase, actualDuration })
    }}
  >
    <Calculator />
  </Profiler>
)
```

### 状态日志
```typescript
// 状态变更日志Hook
const useStateLogger = <T>(state: T, name: string) => {
  useEffect(() => {
    console.log(`[${name}] State updated:`, state)
  }, [state, name])
}

// 使用示例
const Calculator: React.FC = () => {
  const [numbers, setNumbers] = useState<number[]>([])
  
  useStateLogger(numbers, 'Calculator-Numbers')
  
  // ...
}
```

## 测试策略

### 状态测试
```typescript
// Hook测试
import { renderHook, act } from '@testing-library/react'
import { usePersistentState } from './usePersistentState'

describe('usePersistentState', () => {
  beforeEach(() => {
    localStorage.clear()
  })
  
  it('should persist state to localStorage', () => {
    const { result } = renderHook(() =>
      usePersistentState('test-key', 'initial')
    )
    
    act(() => {
      result.current[1]('updated')
    })
    
    expect(localStorage.getItem('test-key')).toBe('"updated"')
  })
})

// Zustand store测试
describe('HistoryStore', () => {
  it('should add items to history', () => {
    const store = useHistoryStore.getState()
    
    store.addItem({
      type: 'mean',
      input: [1, 2, 3],
      result: { mean: 2 }
    })
    
    expect(store.items).toHaveLength(1)
  })
})
```

## 最佳实践

### 状态设计原则
1. **单一数据源**：避免重复状态
2. **不可变更新**：使用不可变数据结构
3. **规范化数据**：复杂数据结构规范化存储
4. **最小化状态**：派生数据通过计算获得

### 状态更新模式
```typescript
// ✅ 好的模式：不可变更新
setState(prev => ({ ...prev, field: newValue }))

// ❌ 坏的模式：直接修改
state.field = newValue
setState(state)

// ✅ 好的模式：批量更新
setState(prev => ({
  ...prev,
  field1: value1,
  field2: value2
}))

// ❌ 坏的模式：多次更新
setState(prev => ({ ...prev, field1: value1 }))
setState(prev => ({ ...prev, field2: value2 }))
```

---

**维护责任人**：前端架构师
**审查周期**：每季度评估状态管理策略
**工具支持**：React DevTools + Redux DevTools