# Unweighted GPA Calculator 技术规格

## 1. 功能概述

Unweighted GPA Calculator是一个专门用于计算标准非加权GPA的工具，不考虑课程难度系数，所有课程使用相同的4.0评分标准。该计算器基于现有GPA Calculator的成熟架构，进行简化和特化。

## 2. 核心功能特性

### 2.1 基础计算功能
- **标准4.0评分系统**: A=4.0, B=3.0, C=2.0, D=1.0, F=0.0
- **Plus/Minus支持**: A+=4.0, A-=3.7, B+=3.3, B-=2.7等
- **实时计算**: 输入变更时自动重新计算GPA
- **精度控制**: 支持1-4位小数精度设置

### 2.2 数据管理功能
- **课程CRUD操作**: 添加、编辑、删除课程
- **批量操作**: 清除所有数据、加载示例数据
- **数据验证**: 学分范围(0.5-10)、成绩有效性验证
- **错误处理**: 友好的错误提示和恢复机制

### 2.3 结果分析功能
- **统计指标**: 总GPA、总学分、总质量点数
- **成绩分布**: 各等级成绩的课程数量和百分比
- **学术状态**: 基于GPA的学术表现评估
- **可视化**: 成绩分布图表

### 2.4 导出和分享功能
- **多格式导出**: CSV、JSON、PDF格式
- **结果分享**: 复制、社交媒体分享
- **打印友好**: 优化的打印样式

## 3. 技术架构

### 3.1 组件架构
```
UnweightedGPACalculatorClient (主组件)
├── CalculatorLayout (布局容器)
├── UnweightedGPAControl (控制面板)
│   ├── GradingSystemSelector
│   ├── PrecisionControl
│   └── ActionButtons
├── UnweightedGPADataInput (数据输入)
├── UnweightedGPAResults (结果显示)
├── CalculationSteps (计算步骤)
└── HelpSection (帮助文档)
```

### 3.2 数据流架构
```
用户输入 → useUnweightedGPACalculation Hook → unweightedGpaCalculation.ts
                                                           ↓
UI组件 ← UnweightedGPAResult ← 计算结果 ← 核心算法
```

## 4. 数据结构设计

### 4.1 核心数据类型
```typescript
interface UnweightedCourse {
  id: string;
  courseName: string;
  credits: number;
  letterGrade: string;
  gradePoints: number; // 计算得出
  qualityPoints: number; // credits × gradePoints
}

interface UnweightedGPAResult {
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  courses: UnweightedCourse[];
  gradeDistribution: Record<string, {
    count: number;
    percentage: number;
    totalCredits: number;
  }>;
  academicStatus: {
    level: 'Excellent' | 'Good' | 'Satisfactory' | 'Poor';
    description: string;
    color: string;
  };
  calculationSteps: CalculationStep[];
  metadata: {
    gradingSystem: string;
    calculatedAt: Date;
    precision: number;
  };
}

interface UnweightedGradingSystem {
  id: string;
  name: string;
  description: string;
  scale: number; // 4.0
  mappings: Array<{
    letterGrade: string;
    gradePoints: number;
    minPercentage?: number;
    description: string;
  }>;
}
```

### 4.2 评分系统配置
```typescript
const UNWEIGHTED_GRADING_SYSTEMS = {
  'unweighted-4.0-standard': {
    id: 'unweighted-4.0-standard',
    name: '4.0 Standard Scale',
    description: 'Standard 4.0 scale without plus/minus grades',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A', gradePoints: 4.0, minPercentage: 90, description: 'Excellent' },
      { letterGrade: 'B', gradePoints: 3.0, minPercentage: 80, description: 'Good' },
      { letterGrade: 'C', gradePoints: 2.0, minPercentage: 70, description: 'Satisfactory' },
      { letterGrade: 'D', gradePoints: 1.0, minPercentage: 60, description: 'Poor' },
      { letterGrade: 'F', gradePoints: 0.0, minPercentage: 0, description: 'Failing' }
    ]
  },
  'unweighted-4.0-plus-minus': {
    id: 'unweighted-4.0-plus-minus',
    name: '4.0 Plus/Minus Scale',
    description: '4.0 scale with plus/minus grade refinements',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A+', gradePoints: 4.0, minPercentage: 97, description: 'Excellent Plus' },
      { letterGrade: 'A', gradePoints: 4.0, minPercentage: 93, description: 'Excellent' },
      { letterGrade: 'A-', gradePoints: 3.7, minPercentage: 90, description: 'Excellent Minus' },
      { letterGrade: 'B+', gradePoints: 3.3, minPercentage: 87, description: 'Good Plus' },
      { letterGrade: 'B', gradePoints: 3.0, minPercentage: 83, description: 'Good' },
      { letterGrade: 'B-', gradePoints: 2.7, minPercentage: 80, description: 'Good Minus' },
      { letterGrade: 'C+', gradePoints: 2.3, minPercentage: 77, description: 'Satisfactory Plus' },
      { letterGrade: 'C', gradePoints: 2.0, minPercentage: 73, description: 'Satisfactory' },
      { letterGrade: 'C-', gradePoints: 1.7, minPercentage: 70, description: 'Satisfactory Minus' },
      { letterGrade: 'D+', gradePoints: 1.3, minPercentage: 67, description: 'Poor Plus' },
      { letterGrade: 'D', gradePoints: 1.0, minPercentage: 60, description: 'Poor' },
      { letterGrade: 'F', gradePoints: 0.0, minPercentage: 0, description: 'Failing' }
    ]
  }
};
```

## 5. 核心算法实现

### 5.1 GPA计算算法
```typescript
function calculateUnweightedGPA(
  courses: UnweightedCourse[],
  gradingSystem: UnweightedGradingSystem,
  precision: number = 2
): UnweightedGPAResult {
  // 1. 验证输入数据
  const validCourses = validateCourses(courses, gradingSystem);
  
  // 2. 计算每门课程的质量点数
  const coursesWithPoints = validCourses.map(course => ({
    ...course,
    gradePoints: getGradePoints(course.letterGrade, gradingSystem),
    qualityPoints: course.credits * getGradePoints(course.letterGrade, gradingSystem)
  }));
  
  // 3. 计算总计数据
  const totalCredits = coursesWithPoints.reduce((sum, course) => sum + course.credits, 0);
  const totalQualityPoints = coursesWithPoints.reduce((sum, course) => sum + course.qualityPoints, 0);
  
  // 4. 计算GPA
  const gpa = totalCredits > 0 ? totalQualityPoints / totalCredits : 0;
  
  // 5. 生成成绩分布
  const gradeDistribution = calculateGradeDistribution(coursesWithPoints);
  
  // 6. 确定学术状态
  const academicStatus = determineAcademicStatus(gpa);
  
  // 7. 生成计算步骤
  const calculationSteps = generateCalculationSteps(coursesWithPoints, gpa, precision);
  
  return {
    gpa: parseFloat(gpa.toFixed(precision)),
    totalCredits,
    totalQualityPoints: parseFloat(totalQualityPoints.toFixed(precision)),
    courses: coursesWithPoints,
    gradeDistribution,
    academicStatus,
    calculationSteps,
    metadata: {
      gradingSystem: gradingSystem.id,
      calculatedAt: new Date(),
      precision
    }
  };
}
```

### 5.2 成绩分布计算
```typescript
function calculateGradeDistribution(courses: UnweightedCourse[]): Record<string, any> {
  const distribution = {};
  const totalCourses = courses.length;
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  
  // 按成绩等级分组
  courses.forEach(course => {
    const grade = course.letterGrade;
    if (!distribution[grade]) {
      distribution[grade] = {
        count: 0,
        percentage: 0,
        totalCredits: 0
      };
    }
    distribution[grade].count += 1;
    distribution[grade].totalCredits += course.credits;
  });
  
  // 计算百分比
  Object.keys(distribution).forEach(grade => {
    distribution[grade].percentage = (distribution[grade].count / totalCourses) * 100;
  });
  
  return distribution;
}
```

### 5.3 学术状态评估
```typescript
function determineAcademicStatus(gpa: number): AcademicStatus {
  if (gpa >= 3.7) {
    return {
      level: 'Excellent',
      description: 'Outstanding academic performance',
      color: 'green'
    };
  } else if (gpa >= 3.0) {
    return {
      level: 'Good',
      description: 'Good academic standing',
      color: 'blue'
    };
  } else if (gpa >= 2.0) {
    return {
      level: 'Satisfactory',
      description: 'Satisfactory academic progress',
      color: 'yellow'
    };
  } else {
    return {
      level: 'Poor',
      description: 'Academic improvement needed',
      color: 'red'
    };
  }
}
```

## 6. React Hook实现

### 6.1 主要Hook接口
```typescript
export interface UseUnweightedGPACalculation {
  // 状态
  result: UnweightedGPAResult | null;
  isCalculating: boolean;
  error: string | null;
  courses: UnweightedCourse[];
  
  // 计算功能
  calculate: (courses: UnweightedCourse[], system: UnweightedGradingSystem) => Promise<void>;
  recalculate: () => Promise<void>;
  
  // 课程管理
  addCourse: (course: Omit<UnweightedCourse, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<UnweightedCourse>) => void;
  removeCourse: (id: string) => void;
  clearAllCourses: () => void;
  
  // 实用功能
  loadExampleData: (systemId: string) => void;
  validateCourse: (course: Partial<UnweightedCourse>) => ValidationResult;
  
  // 导出功能
  exportToCSV: () => string;
  exportToJSON: () => string;
  exportToPDF: () => Promise<Blob>;
}
```

### 6.2 Hook实现要点
```typescript
export function useUnweightedGPACalculation(): UseUnweightedGPACalculation {
  const [result, setResult] = useState<UnweightedGPAResult | null>(null);
  const [courses, setCourses] = useState<UnweightedCourse[]>([]);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // 自动重新计算
  const autoRecalculate = useCallback(async () => {
    if (courses.length > 0) {
      await calculate(courses, currentGradingSystem);
    }
  }, [courses]);
  
  useEffect(() => {
    autoRecalculate();
  }, [courses, autoRecalculate]);
  
  // ... 其他实现
}
```

## 7. 组件实现细节

### 7.1 数据输入组件
```typescript
interface UnweightedGPADataInputProps {
  courses: UnweightedCourse[];
  gradingSystem: UnweightedGradingSystem;
  onAddCourse: (course: Omit<UnweightedCourse, 'id'>) => void;
  onUpdateCourse: (id: string, updates: Partial<UnweightedCourse>) => void;
  onRemoveCourse: (id: string) => void;
  onClearAll: () => void;
  onLoadExample: () => void;
}

export function UnweightedGPADataInput({
  courses,
  gradingSystem,
  onAddCourse,
  onUpdateCourse,
  onRemoveCourse,
  onClearAll,
  onLoadExample
}: UnweightedGPADataInputProps) {
  // 表格形式的课程输入界面
  // 支持内联编辑和验证
  // 响应式设计适配移动端
}
```

### 7.2 结果显示组件
```typescript
interface UnweightedGPAResultsProps {
  result: UnweightedGPAResult;
  precision: number;
  onExport: (format: 'csv' | 'json' | 'pdf') => void;
  onShare: () => void;
  onCopy: () => void;
}

export function UnweightedGPAResults({
  result,
  precision,
  onExport,
  onShare,
  onCopy
}: UnweightedGPAResultsProps) {
  // 三卡片布局：GPA、总学分、质量点数
  // 成绩分布可视化图表
  // 学术状态指示器
  // 操作按钮组
}
```

## 8. 验证和错误处理

### 8.1 输入验证规则
```typescript
const VALIDATION_RULES = {
  courseName: {
    required: true,
    minLength: 1,
    maxLength: 100,
    pattern: /^[a-zA-Z0-9\s\-&().]+$/
  },
  credits: {
    required: true,
    type: 'number',
    min: 0.5,
    max: 10,
    step: 0.5
  },
  letterGrade: {
    required: true,
    validOptions: gradingSystem.mappings.map(m => m.letterGrade)
  }
};
```

### 8.2 错误处理策略
- **输入错误**: 实时验证，友好提示
- **计算错误**: 降级处理，保持界面稳定
- **网络错误**: 重试机制，离线支持
- **数据损坏**: 自动修复，备份恢复

## 9. 性能优化

### 9.1 计算优化
- **防抖计算**: 输入变更后300ms延迟计算
- **结果缓存**: 相同输入使用缓存结果
- **增量计算**: 只重新计算变更部分

### 9.2 渲染优化
- **React.memo**: 防止不必要的重渲染
- **useMemo**: 缓存复杂计算结果
- **虚拟滚动**: 处理大量课程数据

## 10. 测试策略

### 10.1 单元测试覆盖
- 核心算法函数：100%覆盖
- Hook逻辑：主要路径覆盖
- 组件渲染：快照测试
- 边界条件：错误场景测试

### 10.2 集成测试
- 完整计算流程测试
- 用户交互场景测试
- 导出功能测试
- 响应式布局测试

### 10.3 性能测试
- 大数据量处理性能
- 内存泄漏检测
- 页面加载速度
- 计算响应时间

## 11. SEO和可访问性

### 11.1 SEO优化
- 结构化数据标记
- 语义化HTML结构
- 页面元信息优化
- 内部链接建设

### 11.2 可访问性支持
- WCAG 2.1 AA标准
- 键盘导航支持
- 屏幕阅读器兼容
- 高对比度模式

## 12. 部署和监控

### 12.1 部署配置
- 静态资源优化
- CDN配置
- 缓存策略
- 错误监控

### 12.2 使用分析
- 用户行为追踪
- 功能使用统计
- 性能指标监控
- 错误报告收集

这个技术规格完全基于现有GPA Calculator的成熟架构，确保了实现的可行性和一致性，同时针对Unweighted GPA的特定需求进行了专门的优化设计。