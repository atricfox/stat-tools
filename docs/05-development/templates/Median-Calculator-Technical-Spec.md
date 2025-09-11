# Median Calculator Technical Specification

## 📋 Overview

This document provides detailed technical specifications for implementing the Median Calculator (US-020) based on the existing Mean Calculator architecture, ensuring consistency with the current codebase while adding median-specific functionality.

## 🏗️ Architecture Overview

### Component Hierarchy
```
/calculator/median
├── page.tsx                    # Next.js page with metadata
├── MedianCalculatorClient.tsx  # Main client component
└── loading.tsx                 # Loading component

src/hooks/
└── useMedianCalculation.ts     # Core calculation hook

src/lib/
├── medianCalculations.ts       # Pure calculation functions
└── statisticalUtils.ts         # Utility functions
```

## 🔧 Core Components Implementation

### 1. Page Setup (`/app/calculator/median/page.tsx`)

```typescript
import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';
import MedianCalculatorClient from './MedianCalculatorClient';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata({
  title: 'Median Calculator | Calculate Middle Value Online - StatCal',
  description: 'Free online median calculator. Calculate the middle value of your dataset with quartiles, outlier detection, and statistical analysis tools.',
  keywords: [
    'median calculator',
    'middle value calculator', 
    'quartiles calculator',
    'statistical analysis',
    'outlier detection',
    'data analysis tool'
  ]
});

export default function MedianCalculatorPage() {
  return <MedianCalculatorClient />;
}
```

### 2. Main Client Component (`MedianCalculatorClient.tsx`)

```typescript
'use client';

import React, { useState } from 'react';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import UserModeSelector, { UserMode } from '@/components/calculator/UserModeSelector';
import DataInput from '@/components/calculator/DataInput';
import PrecisionControl from '@/components/calculator/PrecisionControl';
import StatisticalResults from '@/components/calculator/StatisticalResults';
import CalculationSteps, { CalculationStep } from '@/components/calculator/CalculationSteps';
import HelpSection from '@/components/calculator/HelpSection';
import { useMedianCalculation } from '@/hooks/useMedianCalculation';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

export default function MedianCalculatorClient() {
  const [userMode, setUserMode] = useState<UserMode>('student');
  const [input, setInput] = useState('');
  const [precision, setPrecision] = useState(2);
  const [showSteps, setShowSteps] = useState(false);
  const [showHelp, setShowHelp] = useState(true);

  // Use the median calculation hook
  const { result, calculateMedian, clearResults } = useMedianCalculation(
    userMode,
    precision
  );

  // SEO structured data
  const { getToolConfig } = useStructuredData('median');
  const structuredDataConfig = getToolConfig('median');

  const handleInputChange = (value: string) => {
    setInput(value);
    calculateMedian(value);
  };

  const handleClearAll = () => {
    setInput('');
    clearResults();
  };

  // Convert result steps to CalculationStep format
  const getCalculationSteps = (): CalculationStep[] => {
    if (!result || !result.steps) return [];
    
    return result.steps.map((step, index) => ({
      id: `step-${index}`,
      title: `Step ${index + 1}`,
      description: step,
      formula: index === 0 ? 'Data Processing' : 
               index === result.steps.length - 1 ? 'Median = Middle Value' : 
               index === 1 ? 'Data Sorting' : '',
      calculation: step,
      result: index === result.steps.length - 1 ? result.median.toFixed(precision) : '',
      explanation: index === result.steps.length - 1 
        ? 'The median represents the middle value when data is sorted in order.' 
        : index === 0 
        ? 'Processing and validating the input data.'
        : 'Sorting data and finding the middle position.',
      difficulty: userMode === 'student' ? 'basic' : userMode === 'research' ? 'advanced' : 'intermediate'
    }));
  };

  const handleCopyResults = (text: string) => {
    navigator.clipboard.writeText(text);
    // Add toast notification
  };

  const handleExportResults = (format: 'csv' | 'json' | 'txt') => {
    if (!result) return;
    
    // Export logic based on format
    const data = {
      median: result.median,
      mean: result.mean,
      count: result.count,
      quartiles: { q1: result.q1, q3: result.q3 },
      iqr: result.iqr,
      outliers: result.outliers || []
    };
    
    // Implementation for different formats
  };

  const handleShareResults = (data: any) => {
    // Share functionality
  };

  const toolCategory = userMode === 'teacher' ? 'gpa' : userMode === 'research' ? 'analysis' : 'statistics';

  return (
    <>
      {/* SEO Structured Data */}
      <StructuredDataProvider config={structuredDataConfig} />
      
      <CalculatorLayout
        title="Median Calculator"
        description="Calculate the median (middle value) of your dataset with advanced statistical analysis tools."
        breadcrumbs={[
          { label: 'Calculators', href: '/calculator' },
          { label: 'Median Calculator' }
        ]}
        currentTool="median"
        toolCategory={toolCategory}
      >
        <div className="space-y-6">
          {/* User Mode Selector */}
          <UserModeSelector 
            userMode={userMode}
            onModeChange={setUserMode}
          />

          {/* Input Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 lg:p-8">
            <div className="space-y-6">
              <DataInput
                value={input}
                onChange={handleInputChange}
                context={userMode}
                placeholder="Enter numbers separated by commas, spaces, or line breaks..."
                label="Data Values"
                onClear={handleClearAll}
              />
              
              <PrecisionControl
                precision={precision}
                onPrecisionChange={setPrecision}
              />
            </div>
          </div>

          {/* Results Section */}
          {result && (
            <StatisticalResults
              result={result}
              userMode={userMode}
              precision={precision}
              onCopy={handleCopyResults}
              onDownload={(data, format) => handleExportResults(format as 'csv' | 'json' | 'txt')}
              onShare={handleShareResults}
            />
          )}

          {/* Calculation Steps Section */}
          {result && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="p-6 border-b border-gray-200">
                <button
                  onClick={() => setShowSteps(!showSteps)}
                  className="flex items-center justify-between w-full text-left"
                >
                  <h3 className="text-lg font-semibold text-gray-900">
                    Calculation Steps
                  </h3>
                  <ChevronDown className={`h-5 w-5 text-gray-500 transition-transform ${showSteps ? 'rotate-180' : ''}`} />
                </button>
              </div>
              
              {showSteps && (
                <div className="p-6">
                  <CalculationSteps 
                    steps={getCalculationSteps()}
                    userMode={userMode}
                  />
                </div>
              )}
            </div>
          )}

          {/* Help Section */}
          <HelpSection 
            isOpen={showHelp}
            onToggle={() => setShowHelp(!showHelp)}
            title="Understanding Median"
            content={{
              concept: "The median is the middle value in a dataset when values are arranged in order. Unlike the mean, it's not affected by extreme values (outliers).",
              whenToUse: "Use median when you want to find the typical value in a dataset, especially when dealing with skewed distributions or outliers.",
              examples: [
                "Test scores: Finding the middle performance level",
                "Income data: Understanding typical earnings (not skewed by high earners)",
                "Survey responses: Finding the central tendency in ratings"
              ]
            }}
            userMode={userMode}
          />
        </div>
      </CalculatorLayout>
    </>
  );
}
```

## 🎣 Core Hook Implementation (`useMedianCalculation.ts`)

```typescript
import { useState, useCallback } from 'react';
import { UserMode } from '@/components/calculator/UserModeSelector';

export interface MedianResult {
  median: number;
  mean: number;
  count: number;
  validNumbers: number[];
  invalidEntries: string[];
  sortedData: number[];
  steps: string[];
  
  // Basic statistics
  min: number;
  max: number;
  q1: number;
  q3: number;
  iqr: number;
  
  // Research mode specific
  outliers?: number[];
  confidenceInterval?: [number, number];
  bootstrapSamples?: number;
  
  // Teacher mode specific
  gradeDistribution?: { [key: string]: number };
  scoreRange?: { min: number; max: number };
  classPerformance?: string;
}

export interface UseMedianCalculationReturn {
  result: MedianResult | null;
  parseInput: (inputText: string) => { validNumbers: number[]; invalidEntries: string[] };
  calculateMedian: (inputText: string) => void;
  clearResults: () => void;
  loadExample: () => string;
}

export function useMedianCalculation(
  userMode: UserMode,
  precision: number
): UseMedianCalculationReturn {
  const [result, setResult] = useState<MedianResult | null>(null);

  const parseInput = useCallback((inputText: string) => {
    // Support comma, newline, and space separation
    const entries = inputText
      .replace(/[\t]/g, ' ') // Replace tabs with spaces for teacher mode Excel paste
      .split(/[,\n\s]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const validNumbers: number[] = [];
    const invalidEntries: string[] = [];

    entries.forEach(entry => {
      // Remove common non-numeric characters for teacher mode
      const cleanEntry = userMode === 'teacher' ? entry.replace(/[^\d.-]/g, '') : entry;
      const num = parseFloat(cleanEntry);
      
      if (!isNaN(num) && isFinite(num)) {
        // Range validation for teacher mode (grades typically 0-150)
        if (userMode === 'teacher' && (num < 0 || num > 150)) {
          invalidEntries.push(entry);
        } else {
          validNumbers.push(num);
        }
      } else if (entry.length > 0) {
        // Common non-numeric entries in teacher gradebooks
        const commonInvalid = ['absent', 'excused', 'makeup', 'incomplete', 'n/a', 'na', '-', ''];
        if (userMode === 'teacher' && !commonInvalid.includes(entry.toLowerCase())) {
          invalidEntries.push(entry);
        } else if (userMode !== 'teacher') {
          invalidEntries.push(entry);
        }
      }
    });

    return { validNumbers, invalidEntries };
  }, [userMode]);

  // Calculate quartiles
  const calculateQuartiles = useCallback((sortedData: number[]) => {
    const n = sortedData.length;
    
    const q1Index = Math.floor((n + 1) / 4) - 1;
    const q3Index = Math.floor(3 * (n + 1) / 4) - 1;
    
    const q1 = n >= 4 ? sortedData[Math.max(0, q1Index)] : sortedData[0];
    const q3 = n >= 4 ? sortedData[Math.min(n - 1, q3Index)] : sortedData[n - 1];
    
    return { q1, q3, iqr: q3 - q1 };
  }, []);

  // Detect outliers using IQR method
  const detectOutliers = useCallback((numbers: number[], q1: number, q3: number, iqr: number) => {
    const lowerBound = q1 - 1.5 * iqr;
    const upperBound = q3 + 1.5 * iqr;
    
    return numbers.filter(num => num < lowerBound || num > upperBound);
  }, []);

  // Teacher mode: Calculate grade distribution
  const calculateGradeDistribution = useCallback((scores: number[]) => {
    const distribution: { [key: string]: number } = {
      'A (90-100)': 0,
      'B (80-89)': 0,
      'C (70-79)': 0,
      'D (60-69)': 0,
      'F (0-59)': 0
    };

    scores.forEach(score => {
      if (score >= 90) distribution['A (90-100)']++;
      else if (score >= 80) distribution['B (80-89)']++;
      else if (score >= 70) distribution['C (70-79)']++;
      else if (score >= 60) distribution['D (60-69)']++;
      else distribution['F (0-59)']++;
    });

    return distribution;
  }, []);

  const calculateMedian = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    const { validNumbers, invalidEntries } = parseInput(inputText);

    if (validNumbers.length === 0) {
      setResult({
        median: 0,
        mean: 0,
        count: 0,
        validNumbers: [],
        invalidEntries,
        sortedData: [],
        steps: ['No valid numbers found in input'],
        min: 0,
        max: 0,
        q1: 0,
        q3: 0,
        iqr: 0
      });
      return;
    }

    // Sort the data
    const sortedData = [...validNumbers].sort((a, b) => a - b);
    const n = sortedData.length;

    // Calculate median
    let median: number;
    if (n % 2 === 1) {
      // Odd number of values
      median = sortedData[Math.floor(n / 2)];
    } else {
      // Even number of values
      const mid1 = sortedData[n / 2 - 1];
      const mid2 = sortedData[n / 2];
      median = (mid1 + mid2) / 2;
    }

    // Calculate mean for comparison
    const sum = validNumbers.reduce((acc, num) => acc + num, 0);
    const mean = sum / n;

    // Calculate quartiles and basic statistics
    const { q1, q3, iqr } = calculateQuartiles(sortedData);
    const min = sortedData[0];
    const max = sortedData[n - 1];

    // Base calculation steps
    const steps = [
      userMode === 'research' 
        ? `Dataset: ${n} data points`
        : userMode === 'teacher'
          ? `Found ${n} valid student grades`
          : `Found ${n} valid numbers: ${validNumbers.join(', ')}`,
      `Sorted data: ${sortedData.join(', ')}`,
      n % 2 === 1
        ? `Median = middle value = ${median.toFixed(precision)}`
        : `Median = (${sortedData[n/2-1]} + ${sortedData[n/2]}) ÷ 2 = ${median.toFixed(precision)}`
    ];

    let additionalData: any = {};

    // Research mode specific calculations
    if (userMode === 'research') {
      const outliers = detectOutliers(validNumbers, q1, q3, iqr);
      
      steps.push(
        `Q1 (First Quartile) = ${q1.toFixed(precision)}`,
        `Q3 (Third Quartile) = ${q3.toFixed(precision)}`,
        `IQR (Interquartile Range) = ${iqr.toFixed(precision)}`
      );

      if (outliers.length > 0) {
        steps.push(`Outliers detected: ${outliers.map(o => o.toFixed(2)).join(', ')}`);
      }

      additionalData = {
        outliers,
        // Note: Confidence interval for median requires bootstrap or other methods
        // This is a simplified implementation
        confidenceInterval: [
          median - 1.96 * Math.sqrt(iqr / n),
          median + 1.96 * Math.sqrt(iqr / n)
        ] as [number, number]
      };
    }

    // Teacher mode specific calculations
    if (userMode === 'teacher') {
      const scoreRange = { min, max };
      const gradeDistribution = calculateGradeDistribution(validNumbers);

      steps[0] = `Found ${n} valid student grades`;
      steps.splice(1, 0, `Grade range: ${min} - ${max}`);
      steps.push(`Class median grade: ${median.toFixed(precision)}`);

      // Determine class performance
      let classPerformance = '';
      if (median >= 85) classPerformance = 'Excellent class performance';
      else if (median >= 75) classPerformance = 'Good class performance';
      else if (median >= 65) classPerformance = 'Average class performance';
      else classPerformance = 'Below average class performance';

      additionalData = {
        scoreRange,
        gradeDistribution,
        classPerformance
      };
    }

    if (invalidEntries.length > 0) {
      const prefix = userMode === 'teacher' 
        ? `Excluded ${invalidEntries.length} non-numeric entries: ${invalidEntries.join(', ')}`
        : `Ignored ${invalidEntries.length} invalid entries: ${invalidEntries.join(', ')}`;
      steps.unshift(prefix);
    }

    setResult({
      median: parseFloat(median.toFixed(precision)),
      mean: parseFloat(mean.toFixed(precision)),
      count: n,
      validNumbers,
      invalidEntries,
      sortedData,
      steps,
      min,
      max,
      q1: parseFloat(q1.toFixed(precision)),
      q3: parseFloat(q3.toFixed(precision)),
      iqr: parseFloat(iqr.toFixed(precision)),
      ...additionalData
    });
  }, [userMode, precision, parseInput, calculateQuartiles, detectOutliers, calculateGradeDistribution]);

  const clearResults = useCallback(() => {
    setResult(null);
  }, []);

  const loadExample = useCallback(() => {
    switch (userMode) {
      case 'student':
        return '85, 92, 78, 96, 88, 91, 83, 89, 94';
      case 'research':
        return '23.45, 24.12, 23.89, 24.56, 23.78, 24.23, 23.67, 24.01, 23.95, 24.34, 25.12';
      case 'teacher':
        return `92, 88, 95, 87, 91, 89, 94, 86, 90, 93
85, 88, 92, 89, 87, 91, 94, 88, 90, 86
89, 92, 87, 90, 88, 91, 85, 93, 89, 94`;
    }
  }, [userMode]);

  return {
    result,
    parseInput,
    calculateMedian,
    clearResults,
    loadExample
  };
}
```

## 🧪 Test Implementation

### Unit Tests (`useMedianCalculation.test.ts`)

```typescript
import { renderHook, act } from '@testing-library/react';
import { useMedianCalculation } from '@/hooks/useMedianCalculation';

describe('useMedianCalculation', () => {
  test('calculates median for odd number of values', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5');
    });

    expect(result.current.result?.median).toBe(3);
    expect(result.current.result?.count).toBe(5);
  });

  test('calculates median for even number of values', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 6');
    });

    expect(result.current.result?.median).toBe(3.5);
    expect(result.current.result?.count).toBe(6);
  });

  test('calculates quartiles correctly', () => {
    const { result } = renderHook(() => useMedianCalculation('research', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 6, 7, 8, 9');
    });

    expect(result.current.result?.q1).toBe(3);
    expect(result.current.result?.q3).toBe(7);
    expect(result.current.result?.iqr).toBe(4);
  });

  test('detects outliers in research mode', () => {
    const { result } = renderHook(() => useMedianCalculation('research', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 100');
    });

    expect(result.current.result?.outliers).toContain(100);
  });

  test('handles grade distribution in teacher mode', () => {
    const { result } = renderHook(() => useMedianCalculation('teacher', 2));
    
    act(() => {
      result.current.calculateMedian('95, 88, 92, 85, 78, 91, 87, 94');
    });

    expect(result.current.result?.gradeDistribution).toBeDefined();
    expect(result.current.result?.gradeDistribution?.['A (90-100)']).toBeGreaterThan(0);
  });

  test('handles invalid input gracefully', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('abc, def, ghi');
    });

    expect(result.current.result?.count).toBe(0);
    expect(result.current.result?.invalidEntries).toEqual(['abc', 'def', 'ghi']);
  });

  test('handles single value', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('42');
    });

    expect(result.current.result?.median).toBe(42);
    expect(result.current.result?.count).toBe(1);
  });

  test('handles empty input', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('');
    });

    expect(result.current.result).toBeNull();
  });
});
```

## 🎨 UI Text Content (All English)

### Page Metadata
- **Title**: "Median Calculator | Calculate Middle Value Online - StatCal"
- **Description**: "Free online median calculator. Calculate the middle value of your dataset with quartiles, outlier detection, and statistical analysis tools."

### User Mode Descriptions
- **Student Mode**: "Basic median calculation with educational explanations and step-by-step guidance"
- **Research Mode**: "Advanced statistical analysis with quartiles, outlier detection, and confidence intervals"
- **Teacher Mode**: "Grade analysis tools with class performance insights and distribution analysis"

### Input Section
- **Label**: "Data Values"
- **Placeholder**: "Enter numbers separated by commas, spaces, or line breaks..."
- **Help Text**: "Example: 85, 92, 78, 96, 88, 91, 83, 89"

### Results Display
- **Primary Result**: "Median (Middle Value)"
- **Secondary Results**: "Mean (Average)", "Count", "Range"
- **Quartiles**: "Q1 (First Quartile)", "Q3 (Third Quartile)", "IQR (Interquartile Range)"

### Error Messages
- "Please enter at least one valid number"
- "Invalid data format detected in your input"
- "Calculation failed. Please check your data and try again"
- "Some entries were ignored due to invalid format"

### Help Content
- **Concept**: "The median is the middle value in a dataset when values are arranged in ascending order. Unlike the mean, it's not affected by extreme values (outliers)."
- **When to Use**: "Use median when you want to find the typical value in a dataset, especially when dealing with skewed distributions or outliers."

This technical specification provides a complete implementation guide for the Median Calculator, ensuring consistency with existing code patterns while delivering the advanced functionality specified in US-020.
