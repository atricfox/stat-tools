# Unweighted GPA Calculator 实现指南

> 基于现有GPA Calculator架构，快速实现Unweighted GPA Calculator的详细指南

## 1. 实现概述

Unweighted GPA Calculator是对现有GPA Calculator的简化和特化版本，主要变更包括：
- 移除课程类型和权重系数
- 简化为标准4.0评分系统
- 专注于基础GPA计算
- 保持相同的UI/UX模式

## 2. 文件结构规划

### 2.1 需要创建的新文件
```
src/
├── app/calculator/unweighted-gpa/
│   ├── page.tsx                           # 页面入口
│   └── UnweightedGPACalculatorClient.tsx  # 主组件
├── hooks/
│   └── useUnweightedGPACalculation.ts     # 计算钩子
├── lib/
│   └── unweightedGpaCalculation.ts        # 核心算法
├── types/
│   └── unweightedGpa.ts                   # 类型定义
└── components/calculator/
    ├── UnweightedGPADataInput.tsx         # 数据输入组件
    └── UnweightedGPAResults.tsx           # 结果显示组件
```

### 2.2 需要复用的现有文件
```
现有可复用组件：
├── components/layout/CalculatorLayout.tsx
├── components/calculator/PrecisionControl.tsx
├── components/calculator/CalculationSteps.tsx
├── components/calculator/HelpSection.tsx
├── components/calculator/GradePointSystemSelector.tsx (需调整)
└── lib/gpaCalculation.ts (部分函数复用)
```

## 3. 核心类型定义

### 3.1 创建 `/src/types/unweightedGpa.ts`
```typescript
export interface UnweightedCourse {
  id: string;
  courseName: string;
  credits: number;
  letterGrade: string;
}

export interface UnweightedGPAResult {
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
  calculationSteps: Array<{
    id: string;
    title: string;
    description: string;
    calculation: string;
    result: string;
    formula?: string;
    explanation?: string;
  }>;
}

export interface UnweightedGradingSystem {
  id: string;
  name: string;
  description: string;
  scale: number;
  mappings: Array<{
    letterGrade: string;
    gradePoints: number;
    description: string;
  }>;
}

export interface UseUnweightedGPACalculation {
  result: UnweightedGPAResult | null;
  isCalculating: boolean;
  error: string | null;
  courses: UnweightedCourse[];
  
  // 计算功能
  calculate: () => Promise<void>;
  
  // 课程管理
  addCourse: (course: Omit<UnweightedCourse, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<UnweightedCourse>) => void;
  removeCourse: (id: string) => void;
  clearAll: () => void;
  
  // 实用功能
  loadExample: (systemId: string) => void;
  exportToCSV: () => string;
  exportToJSON: () => string;
}
```

## 4. 核心算法实现

### 4.1 创建 `/src/lib/unweightedGpaCalculation.ts`
```typescript
import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';
import { UnweightedCourse, UnweightedGPAResult, UnweightedGradingSystem } from '@/types/unweightedGpa';

// 标准4.0评分系统
export const UNWEIGHTED_GRADING_SYSTEMS: Record<string, UnweightedGradingSystem> = {
  'standard-4.0': {
    id: 'standard-4.0',
    name: '4.0 Standard Scale',
    description: 'Standard 4.0 scale without plus/minus grades',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A', gradePoints: 4.0, description: 'Excellent' },
      { letterGrade: 'B', gradePoints: 3.0, description: 'Good' },
      { letterGrade: 'C', gradePoints: 2.0, description: 'Satisfactory' },
      { letterGrade: 'D', gradePoints: 1.0, description: 'Poor' },
      { letterGrade: 'F', gradePoints: 0.0, description: 'Failing' }
    ]
  },
  'plus-minus-4.0': {
    id: 'plus-minus-4.0',
    name: '4.0 Plus/Minus Scale',
    description: '4.0 scale with plus/minus grade refinements',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A+', gradePoints: 4.0, description: 'Excellent Plus' },
      { letterGrade: 'A', gradePoints: 4.0, description: 'Excellent' },
      { letterGrade: 'A-', gradePoints: 3.7, description: 'Excellent Minus' },
      { letterGrade: 'B+', gradePoints: 3.3, description: 'Good Plus' },
      { letterGrade: 'B', gradePoints: 3.0, description: 'Good' },
      { letterGrade: 'B-', gradePoints: 2.7, description: 'Good Minus' },
      { letterGrade: 'C+', gradePoints: 2.3, description: 'Satisfactory Plus' },
      { letterGrade: 'C', gradePoints: 2.0, description: 'Satisfactory' },
      { letterGrade: 'C-', gradePoints: 1.7, description: 'Satisfactory Minus' },
      { letterGrade: 'D+', gradePoints: 1.3, description: 'Poor Plus' },
      { letterGrade: 'D', gradePoints: 1.0, description: 'Poor' },
      { letterGrade: 'F', gradePoints: 0.0, description: 'Failing' }
    ]
  }
};

export function calculateUnweightedGPA(
  courses: UnweightedCourse[],
  gradingSystem: UnweightedGradingSystem,
  precision: number = 2
): UnweightedGPAResult {
  // 过滤有效课程
  const validCourses = courses.filter(course => 
    course.courseName.trim() && 
    course.credits > 0 && 
    course.letterGrade
  );

  if (validCourses.length === 0) {
    return createEmptyResult();
  }

  // 计算每门课程的质量点数
  let totalCredits = 0;
  let totalQualityPoints = 0;
  const calculationSteps: any[] = [];

  // Step 1: Grade Points Conversion
  const conversionSteps: string[] = [];
  
  validCourses.forEach(course => {
    const gradePoints = getGradePoints(course.letterGrade, gradingSystem);
    const qualityPoints = course.credits * gradePoints;
    
    totalCredits += course.credits;
    totalQualityPoints += qualityPoints;
    
    conversionSteps.push(
      `${course.courseName}: ${course.letterGrade} (${formatForCalculationSteps(gradePoints, 'student', precision)}) × ${course.credits} credits = ${formatForCalculationSteps(qualityPoints, 'student', precision)} quality points`
    );
  });

  calculationSteps.push({
    id: 'step-1',
    title: 'Course Grade Points Conversion',
    description: 'Convert letter grades to grade points and calculate quality points',
    calculation: conversionSteps.join('\n'),
    result: '',
    formula: 'Quality Points = Grade Points × Credits'
  });

  // Step 2: Totals
  calculationSteps.push({
    id: 'step-2',
    title: 'Totals Calculation',
    description: 'Sum up all quality points and credits',
    calculation: `Total Quality Points: ${conversionSteps.map((_, i) => formatForCalculationSteps(validCourses[i].credits * getGradePoints(validCourses[i].letterGrade, gradingSystem), 'student', precision)).join(' + ')} = ${formatForCalculationSteps(totalQualityPoints, 'student', precision)}\nTotal Credits: ${validCourses.map(c => c.credits).join(' + ')} = ${totalCredits}`,
    result: `Total Quality Points: ${formatForCalculationSteps(totalQualityPoints, 'student', precision)}\nTotal Credits: ${totalCredits}`,
    formula: ''
  });

  // Step 3: GPA Calculation
  const gpa = totalQualityPoints / totalCredits;
  
  calculationSteps.push({
    id: 'step-3',
    title: 'GPA Calculation',
    description: 'Divide total quality points by total credits',
    calculation: `Unweighted GPA = Total Quality Points ÷ Total Credits\nUnweighted GPA = ${formatForCalculationSteps(totalQualityPoints, 'student', precision)} ÷ ${totalCredits} = ${formatForCalculationSteps(gpa, 'student', precision)}`,
    result: formatForCalculationSteps(gpa, 'student', precision),
    formula: 'GPA = Σ(Quality Points) ÷ Σ(Credits)'
  });

  // Calculate grade distribution
  const gradeDistribution = calculateGradeDistribution(validCourses);

  // Determine academic status
  const academicStatus = determineAcademicStatus(gpa);

  return {
    gpa: parseFloat(gpa.toFixed(precision)),
    totalCredits,
    totalQualityPoints: parseFloat(totalQualityPoints.toFixed(precision)),
    courses: validCourses,
    gradeDistribution,
    academicStatus,
    calculationSteps
  };
}

function getGradePoints(letterGrade: string, gradingSystem: UnweightedGradingSystem): number {
  const mapping = gradingSystem.mappings.find(m => m.letterGrade === letterGrade);
  return mapping ? mapping.gradePoints : 0;
}

function calculateGradeDistribution(courses: UnweightedCourse[]): Record<string, any> {
  const distribution: Record<string, any> = {};
  const totalCourses = courses.length;
  
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
  
  // Calculate percentages
  Object.keys(distribution).forEach(grade => {
    distribution[grade].percentage = (distribution[grade].count / totalCourses) * 100;
  });
  
  return distribution;
}

function determineAcademicStatus(gpa: number) {
  if (gpa >= 3.7) {
    return { level: 'Excellent' as const, description: 'Outstanding academic performance', color: 'green' };
  } else if (gpa >= 3.0) {
    return { level: 'Good' as const, description: 'Good academic standing', color: 'blue' };
  } else if (gpa >= 2.0) {
    return { level: 'Satisfactory' as const, description: 'Satisfactory academic progress', color: 'yellow' };
  } else {
    return { level: 'Poor' as const, description: 'Academic improvement needed', color: 'red' };
  }
}

function createEmptyResult(): UnweightedGPAResult {
  return {
    gpa: 0,
    totalCredits: 0,
    totalQualityPoints: 0,
    courses: [],
    gradeDistribution: {},
    academicStatus: { level: 'Poor', description: 'No courses entered', color: 'gray' },
    calculationSteps: []
  };
}

// 示例数据生成
export function createUnweightedExampleCourses(systemId: string): UnweightedCourse[] {
  const baseId = Date.now();
  
  if (systemId === 'plus-minus-4.0') {
    return [
      { id: `${baseId}-1`, courseName: 'Calculus I', credits: 4, letterGrade: 'A-' },
      { id: `${baseId}-2`, courseName: 'English Literature', credits: 3, letterGrade: 'B+' },
      { id: `${baseId}-3`, courseName: 'Biology', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-4`, courseName: 'Psychology', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-5`, courseName: 'Art History', credits: 2, letterGrade: 'A-' }
    ];
  } else {
    return [
      { id: `${baseId}-1`, courseName: 'Mathematics', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-2`, courseName: 'English', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-3`, courseName: 'Science', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-4`, courseName: 'History', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-5`, courseName: 'Physical Education', credits: 2, letterGrade: 'A' }
    ];
  }
}
```

## 5. React Hook 实现

### 5.1 创建 `/src/hooks/useUnweightedGPACalculation.ts`
```typescript
import { useState, useCallback, useEffect } from 'react';
import { 
  UnweightedCourse, 
  UnweightedGPAResult, 
  UnweightedGradingSystem,
  UseUnweightedGPACalculation
} from '@/types/unweightedGpa';
import { 
  calculateUnweightedGPA, 
  UNWEIGHTED_GRADING_SYSTEMS,
  createUnweightedExampleCourses
} from '@/lib/unweightedGpaCalculation';

export function useUnweightedGPACalculation(
  initialGradingSystem: UnweightedGradingSystem = UNWEIGHTED_GRADING_SYSTEMS['standard-4.0'],
  precision: number = 2
): UseUnweightedGPACalculation {
  const [result, setResult] = useState<UnweightedGPAResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<UnweightedCourse[]>([]);

  // 自动重新计算
  const calculate = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // 添加小延迟以显示加载状态
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const calculationResult = calculateUnweightedGPA(courses, initialGradingSystem, precision);
      setResult(calculationResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Calculation error occurred');
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [courses, initialGradingSystem, precision]);

  // 当课程或设置变更时自动计算
  useEffect(() => {
    calculate();
  }, [calculate]);

  // 课程管理功能
  const addCourse = useCallback((courseData: Omit<UnweightedCourse, 'id'>) => {
    const newCourse: UnweightedCourse = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...courseData
    };
    setCourses(prev => [...prev, newCourse]);
  }, []);

  const updateCourse = useCallback((id: string, updates: Partial<UnweightedCourse>) => {
    setCourses(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
  }, []);

  const clearAll = useCallback(() => {
    setCourses([]);
    setResult(null);
    setError(null);
  }, []);

  // 加载示例数据
  const loadExample = useCallback((systemId: string) => {
    const exampleCourses = createUnweightedExampleCourses(systemId);
    setCourses(exampleCourses);
  }, []);

  // 导出功能
  const exportToCSV = useCallback(() => {
    if (!result) return '';
    
    const headers = ['Course Name', 'Credits', 'Letter Grade', 'Grade Points', 'Quality Points'];
    const rows = result.courses.map(course => {
      const gradePoints = initialGradingSystem.mappings.find(m => m.letterGrade === course.letterGrade)?.gradePoints || 0;
      const qualityPoints = course.credits * gradePoints;
      
      return [
        course.courseName,
        course.credits.toString(),
        course.letterGrade,
        gradePoints.toString(),
        qualityPoints.toString()
      ];
    });

    // Add summary row
    rows.push(['', '', '', 'TOTAL:', '']);
    rows.push(['GPA:', result.gpa.toString(), 'Credits:', result.totalCredits.toString(), 'Quality Points:', result.totalQualityPoints.toString()]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    return csvContent;
  }, [result, initialGradingSystem]);

  const exportToJSON = useCallback(() => {
    return JSON.stringify(result, null, 2);
  }, [result]);

  return {
    result,
    isCalculating,
    error,
    courses,
    calculate,
    addCourse,
    updateCourse,
    removeCourse,
    clearAll,
    loadExample,
    exportToCSV,
    exportToJSON
  };
}
```

## 6. 主要组件实现

### 6.1 创建页面入口 `/src/app/calculator/unweighted-gpa/page.tsx`
```typescript
import { Metadata } from 'next';
import UnweightedGPACalculatorClient from './UnweightedGPACalculatorClient';

export const metadata: Metadata = {
  title: 'Unweighted GPA Calculator - Calculate Standard 4.0 Scale GPA',
  description: 'Calculate your unweighted GPA using standard 4.0 scale. Fair academic assessment without course difficulty bias. Perfect for college applications and academic planning.',
  keywords: 'unweighted gpa calculator, 4.0 scale, gpa calculation, academic assessment, college application, standard gpa',
  openGraph: {
    title: 'Unweighted GPA Calculator | StatCal',
    description: 'Calculate standard unweighted GPA with 4.0 scale. No course difficulty weights - fair academic performance assessment.',
    type: 'website',
  }
};

export default function UnweightedGPACalculatorPage() {
  return <UnweightedGPACalculatorClient />;
}
```

### 6.2 创建主组件 `/src/app/calculator/unweighted-gpa/UnweightedGPACalculatorClient.tsx`

基于现有GPA Calculator的结构，但简化了课程类型和权重相关的部分：

```typescript
'use client';

import React, { useState, useRef } from 'react';
import { HelpCircle, ChevronDown } from 'lucide-react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import CalculationSteps from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import UnweightedGPADataInput from '@/components/calculator/UnweightedGPADataInput';
import UnweightedGPAResults from '@/components/calculator/UnweightedGPAResults';
import { useUnweightedGPACalculation } from '@/hooks/useUnweightedGPACalculation';
import { UNWEIGHTED_GRADING_SYSTEMS } from '@/lib/unweightedGpaCalculation';
import { UnweightedGradingSystem } from '@/types/unweightedGpa';

export default function UnweightedGPACalculatorClient() {
  // UI State
  const [precision, setPrecision] = useState(2);
  const [showHelp, setShowHelp] = useState(true);
  const [showSteps, setShowSteps] = useState(false);
  const [gradingSystem, setGradingSystem] = useState<UnweightedGradingSystem>(
    UNWEIGHTED_GRADING_SYSTEMS['standard-4.0']
  );

  // Use the unweighted GPA calculation hook
  const {
    result,
    isCalculating,
    error,
    courses,
    addCourse,
    updateCourse,
    removeCourse,
    clearAll,
    loadExample,
    exportToCSV,
    exportToJSON
  } = useUnweightedGPACalculation(gradingSystem, precision);

  // Convert calculation steps for CalculationSteps component
  const getCalculationSteps = () => {
    if (!result || !result.calculationSteps) return [];
    
    return result.calculationSteps.map(step => ({
      id: step.id,
      title: step.title,
      description: step.description,
      formula: step.formula || '',
      calculation: step.calculation,
      result: step.result,
      explanation: step.explanation || '',
      difficulty: 'basic' as const
    }));
  };

  // Handle export operations
  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    let content = '';
    let fileName = '';
    let mimeType = '';

    switch (format) {
      case 'csv':
        content = exportToCSV();
        fileName = 'unweighted-gpa-results.csv';
        mimeType = 'text/csv';
        break;
      case 'json':
        content = exportToJSON();
        fileName = 'unweighted-gpa-results.json';
        mimeType = 'application/json';
        break;
      // PDF export would need additional implementation
    }

    if (content) {
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <CalculatorLayout
      title="Unweighted GPA Calculator"
      description="Calculate your standard unweighted GPA using 4.0 scale without course difficulty weights."
      breadcrumbs={[
        { label: 'Calculators', href: '/calculator' },
        { label: 'Unweighted GPA Calculator' }
      ]}
      currentTool="unweighted-gpa"
      toolCategory="gpa"
    >
      <div className="space-y-6">
        {/* Control Panel */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Grading System Selector */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grading System
              </label>
              <select
                value={gradingSystem.id}
                onChange={(e) => setGradingSystem(UNWEIGHTED_GRADING_SYSTEMS[e.target.value])}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.values(UNWEIGHTED_GRADING_SYSTEMS).map(system => (
                  <option key={system.id} value={system.id}>
                    {system.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Precision Control */}
            <PrecisionControl
              precision={precision}
              onPrecisionChange={setPrecision}
            />

            {/* Load Example */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sample Data
              </label>
              <button
                onClick={() => loadExample(gradingSystem.id)}
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Load Example
              </button>
            </div>
          </div>
        </div>

        {/* Data Input Section */}
        <UnweightedGPADataInput
          courses={courses}
          gradingSystem={gradingSystem}
          onAddCourse={addCourse}
          onUpdateCourse={updateCourse}
          onRemoveCourse={removeCourse}
          onClearAll={clearAll}
        />

        {/* Results Section */}
        {result && courses.length > 0 && (
          <UnweightedGPAResults
            result={result}
            precision={precision}
            onExport={handleExport}
          />
        )}

        {/* Calculation Steps */}
        {result && courses.length > 0 && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <button
              onClick={() => setShowSteps(!showSteps)}
              className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
            >
              <h3 className="text-lg font-semibold text-gray-900">
                <HelpCircle className="w-5 h-5 inline mr-2" />
                Calculation Steps
              </h3>
              <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
            </button>
            
            {showSteps && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <CalculationSteps
                  steps={getCalculationSteps()}
                  context="student"
                  showFormulas={true}
                  showExplanations={true}
                  interactive={true}
                />
              </div>
            )}
          </div>
        )}

        {/* Help Section */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <button
            onClick={() => setShowHelp(!showHelp)}
            className="w-full flex items-center justify-between text-left hover:bg-gray-50 p-2 -m-2 rounded-lg transition-colors"
          >
            <h3 className="text-lg font-semibold text-gray-900">
              <HelpCircle className="w-5 h-5 inline mr-2" />
              Unweighted GPA Calculator Help
            </h3>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${showHelp ? 'rotate-180' : ''}`} />
          </button>
          
          {showHelp && (
            <div className="mt-4 pt-4 border-t border-gray-200">
              <HelpSection
                calculatorType="unweighted-gpa"
                userMode="student"
              />
            </div>
          )}
        </div>
      </div>
    </CalculatorLayout>
  );
}
```

## 7. 实现步骤总结

### Phase 1: 核心功能 (2-3天)
1. 创建类型定义和核心算法
2. 实现React Hook
3. 创建主页面和基础组件

### Phase 2: UI组件 (2-3天)
1. 实现数据输入组件
2. 实现结果显示组件
3. 集成计算步骤和帮助文档

### Phase 3: 功能完善 (1-2天)
1. 添加导出功能
2. 实现响应式设计
3. 添加错误处理和验证

### Phase 4: 测试和优化 (1-2天)
1. 单元测试和集成测试
2. 性能优化
3. 可访问性改进

## 8. 复用策略

通过最大化复用现有GPA Calculator的架构和组件，可以显著减少开发时间：

- **复用布局和样式**: 保持一致的UI/UX体验
- **复用计算逻辑**: 适配现有的GPA计算算法
- **复用组件库**: 利用现有的UI组件
- **复用测试框架**: 使用相同的测试模式

这种实现策略确保了新功能与现有系统的一致性，同时最小化了开发和维护成本。