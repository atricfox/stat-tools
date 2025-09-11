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
    
    if (n === 1) {
      return { q1: sortedData[0], q3: sortedData[0], iqr: 0 };
    }
    
    if (n === 2) {
      return { q1: sortedData[0], q3: sortedData[1], iqr: sortedData[1] - sortedData[0] };
    }
    
    // Use the median of lower and upper halves method
    const medianIndex = Math.floor(n / 2);
    
    let lowerHalf, upperHalf;
    if (n % 2 === 0) {
      // Even number of elements
      lowerHalf = sortedData.slice(0, medianIndex);
      upperHalf = sortedData.slice(medianIndex);
    } else {
      // Odd number of elements - exclude the median
      lowerHalf = sortedData.slice(0, medianIndex);
      upperHalf = sortedData.slice(medianIndex + 1);
    }
    
    // Calculate Q1 (median of lower half)
    const q1Index = Math.floor(lowerHalf.length / 2);
    let q1: number;
    if (lowerHalf.length % 2 === 0 && lowerHalf.length > 1) {
      q1 = (lowerHalf[q1Index - 1] + lowerHalf[q1Index]) / 2;
    } else {
      q1 = lowerHalf[q1Index];
    }
    
    // Calculate Q3 (median of upper half)
    const q3Index = Math.floor(upperHalf.length / 2);
    let q3: number;
    if (upperHalf.length % 2 === 0 && upperHalf.length > 1) {
      q3 = (upperHalf[q3Index - 1] + upperHalf[q3Index]) / 2;
    } else {
      q3 = upperHalf[q3Index];
    }
    
    return { q1, q3, iqr: q3 - q1 };
  }, []);

  // Detect outliers using IQR method
  const detectOutliers = useCallback((numbers: number[], q1: number, q3: number, iqr: number) => {
    if (iqr === 0) return []; // No outliers if IQR is 0
    
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

  // Research mode: Simple bootstrap confidence interval for median
  const calculateConfidenceInterval = useCallback((sortedData: number[], median: number) => {
    const n = sortedData.length;
    if (n < 3) return [median, median] as [number, number];
    
    // Simple approximation for median confidence interval
    // Using normal approximation: median ± 1.57 * IQR / sqrt(n)
    const { iqr } = calculateQuartiles(sortedData);
    const standardError = 1.57 * iqr / Math.sqrt(n);
    
    return [
      Math.max(sortedData[0], median - 1.96 * standardError),
      Math.min(sortedData[n - 1], median + 1.96 * standardError)
    ] as [number, number];
  }, [calculateQuartiles]);

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
    let medianCalculation: string;
    
    if (n % 2 === 1) {
      // Odd number of values
      const middleIndex = Math.floor(n / 2);
      median = sortedData[middleIndex];
      medianCalculation = `Median = middle value (position ${middleIndex + 1}) = ${median.toFixed(precision)}`;
    } else {
      // Even number of values
      const mid1Index = n / 2 - 1;
      const mid2Index = n / 2;
      const mid1 = sortedData[mid1Index];
      const mid2 = sortedData[mid2Index];
      median = (mid1 + mid2) / 2;
      medianCalculation = `Median = (${mid1} + ${mid2}) ÷ 2 = ${median.toFixed(precision)}`;
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
          : `Found ${n} valid numbers: ${validNumbers.length <= 10 ? validNumbers.join(', ') : validNumbers.slice(0, 10).join(', ') + '...'}`,
      `Sorted data: ${sortedData.length <= 15 ? sortedData.join(', ') : sortedData.slice(0, 15).join(', ') + '...'}`,
      medianCalculation
    ];

    let additionalData: any = {};

    // Research mode specific calculations
    if (userMode === 'research') {
      const outliers = detectOutliers(validNumbers, q1, q3, iqr);
      const confidenceInterval = calculateConfidenceInterval(sortedData, median);
      
      steps.push(
        `Q1 (First Quartile) = ${q1.toFixed(precision)}`,
        `Q3 (Third Quartile) = ${q3.toFixed(precision)}`,
        `IQR (Interquartile Range) = ${iqr.toFixed(precision)}`
      );

      if (outliers.length > 0) {
        steps.push(`Outliers detected: ${outliers.map(o => o.toFixed(precision)).join(', ')}`);
      } else {
        steps.push('No outliers detected using IQR method');
      }

      steps.push(`95% Confidence Interval: [${confidenceInterval[0].toFixed(precision)}, ${confidenceInterval[1].toFixed(precision)}]`);

      additionalData = {
        outliers,
        confidenceInterval: [
          parseFloat(confidenceInterval[0].toFixed(precision)),
          parseFloat(confidenceInterval[1].toFixed(precision))
        ] as [number, number],
        bootstrapSamples: 1000 // Placeholder for actual bootstrap implementation
      };
    }

    // Teacher mode specific calculations
    if (userMode === 'teacher') {
      const scoreRange = { min, max };
      const gradeDistribution = calculateGradeDistribution(validNumbers);

      steps[0] = `Found ${n} valid student grades`;
      steps.splice(1, 0, `Grade range: ${min.toFixed(1)} - ${max.toFixed(1)}`);
      steps.push(`Class median grade: ${median.toFixed(precision)}`);
      steps.push(`Mean vs Median: ${mean.toFixed(precision)} vs ${median.toFixed(precision)}`);

      // Determine class performance based on median
      let classPerformance = '';
      if (median >= 90) classPerformance = 'Excellent class performance - median in A range';
      else if (median >= 80) classPerformance = 'Good class performance - median in B range';
      else if (median >= 70) classPerformance = 'Average class performance - median in C range';
      else if (median >= 60) classPerformance = 'Below average class performance - median in D range';
      else classPerformance = 'Poor class performance - median below passing';

      steps.push(classPerformance);

      additionalData = {
        scoreRange,
        gradeDistribution,
        classPerformance
      };
    }

    // Add comparison with mean for all modes
    if (userMode === 'student') {
      const difference = Math.abs(median - mean);
      const percentDiff = mean !== 0 ? (difference / mean) * 100 : 0;
      
      if (percentDiff > 10) {
        steps.push(`Note: Median (${median.toFixed(precision)}) differs significantly from mean (${mean.toFixed(precision)}), suggesting skewed data or outliers`);
      } else {
        steps.push(`Median (${median.toFixed(precision)}) and mean (${mean.toFixed(precision)}) are similar, indicating symmetric data distribution`);
      }
    }

    if (invalidEntries.length > 0) {
      const prefix = userMode === 'teacher' 
        ? `Excluded ${invalidEntries.length} non-numeric entries: ${invalidEntries.slice(0, 5).join(', ')}${invalidEntries.length > 5 ? '...' : ''}`
        : `Ignored ${invalidEntries.length} invalid entries: ${invalidEntries.slice(0, 5).join(', ')}${invalidEntries.length > 5 ? '...' : ''}`;
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
      min: parseFloat(min.toFixed(precision)),
      max: parseFloat(max.toFixed(precision)),
      q1: parseFloat(q1.toFixed(precision)),
      q3: parseFloat(q3.toFixed(precision)),
      iqr: parseFloat(iqr.toFixed(precision)),
      ...additionalData
    });
  }, [userMode, precision, parseInput, calculateQuartiles, detectOutliers, calculateGradeDistribution, calculateConfidenceInterval]);

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
      default:
        return '1, 2, 3, 4, 5';
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
