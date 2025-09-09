import { useState, useCallback, useMemo } from 'react';
import { UserMode } from '@/components/calculator/UserModeSelector';

export interface MeanResult {
  mean: number;
  count: number;
  sum: number;
  steps: string[];
  validNumbers: number[];
  invalidEntries: string[];
  // Research mode specific
  stdError?: number;
  confidenceInterval?: [number, number];
  outliers?: number[];
  // Teacher mode specific
  gradeDistribution?: { [key: string]: number };
  scoreRange?: { min: number; max: number };
}

export interface UseMeanCalculationReturn {
  result: MeanResult | null;
  parseInput: (inputText: string) => { validNumbers: number[]; invalidEntries: string[] };
  calculateMean: (inputText: string) => void;
  clearResults: () => void;
  loadExample: () => string;
}

export function useMeanCalculation(
  userMode: UserMode,
  precision: number,
  ignoreOutliers = false,
  confidenceLevel = 95
): UseMeanCalculationReturn {
  const [result, setResult] = useState<MeanResult | null>(null);

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

  // Research mode: Detect outliers using IQR method
  const detectOutliers = useCallback((numbers: number[]) => {
    if (numbers.length < 4) return [];
    
    const sorted = [...numbers].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
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

  // Research mode: Get t-value for confidence intervals
  const getTValue = useCallback((confidence: number, df: number) => {
    const tTable: { [key: number]: { [key: number]: number } } = {
      90: { 1: 6.314, 5: 2.015, 10: 1.812, 20: 1.725, 30: 1.697, 100: 1.660 },
      95: { 1: 12.706, 5: 2.571, 10: 2.228, 20: 2.086, 30: 2.042, 100: 1.984 },
      99: { 1: 63.657, 5: 4.032, 10: 3.169, 20: 2.845, 30: 2.750, 100: 2.626 }
    };

    const confidenceTable = tTable[confidence] || tTable[95];
    const dfKeys = Object.keys(confidenceTable).map(Number).sort((a, b) => a - b);
    
    for (let i = 0; i < dfKeys.length; i++) {
      if (df <= dfKeys[i]) {
        return confidenceTable[dfKeys[i]];
      }
    }
    
    return confidenceTable[100] || 1.96;
  }, []);

  const calculateMean = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    const { validNumbers, invalidEntries } = parseInput(inputText);

    if (validNumbers.length === 0) {
      setResult({
        mean: 0,
        count: 0,
        sum: 0,
        steps: ['No valid numbers found in input'],
        validNumbers: [],
        invalidEntries
      });
      return;
    }

    // Handle outliers for research mode
    const outliers = userMode === 'research' ? detectOutliers(validNumbers) : [];
    const dataToUse = (userMode === 'research' && ignoreOutliers) 
      ? validNumbers.filter(num => !outliers.includes(num))
      : validNumbers;

    if (dataToUse.length === 0) {
      setResult(null);
      return;
    }

    const sum = dataToUse.reduce((acc, num) => acc + num, 0);
    const mean = sum / dataToUse.length;

    // Base calculation steps
    const steps = [
      userMode === 'research' 
        ? `Dataset: ${dataToUse.length} data points`
        : userMode === 'teacher'
          ? `Found ${dataToUse.length} valid student grades`
          : `Found ${dataToUse.length} valid numbers: ${dataToUse.join(', ')}`,
      `Sum = ${sum.toFixed(precision)}`,
      `Mean = ${sum.toFixed(precision)} ÷ ${dataToUse.length} = ${mean.toFixed(precision)}`
    ];

    let additionalData: any = {};

    // Research mode specific calculations
    if (userMode === 'research') {
      const variance = dataToUse.reduce((acc, num) => acc + Math.pow(num - mean, 2), 0) / (dataToUse.length - 1);
      const stdError = Math.sqrt(variance / dataToUse.length);
      const tValue = getTValue(confidenceLevel, dataToUse.length - 1);
      const marginOfError = tValue * stdError;
      const confidenceInterval: [number, number] = [mean - marginOfError, mean + marginOfError];

      steps.push(
        `Standard Error = ${stdError.toFixed(precision)}`,
        `${confidenceLevel}% Confidence Interval: [${confidenceInterval[0].toFixed(precision)}, ${confidenceInterval[1].toFixed(precision)}]`
      );

      if (outliers.length > 0) {
        steps.unshift(`Detected ${outliers.length} potential outliers: ${outliers.map(o => o.toFixed(2)).join(', ')}`);
        if (ignoreOutliers) {
          steps.push('Outliers excluded from calculation');
        }
      }

      additionalData = {
        stdError: parseFloat(stdError.toFixed(precision)),
        confidenceInterval: [
          parseFloat(confidenceInterval[0].toFixed(precision)),
          parseFloat(confidenceInterval[1].toFixed(precision))
        ],
        outliers
      };
    }

    // Teacher mode specific calculations
    if (userMode === 'teacher') {
      const scoreRange = {
        min: Math.min(...dataToUse),
        max: Math.max(...dataToUse)
      };
      const gradeDistribution = calculateGradeDistribution(dataToUse);

      steps[0] = `Found ${dataToUse.length} valid student grades`;
      steps.splice(1, 0, `Grade range: ${scoreRange.min} - ${scoreRange.max}`);
      steps[2] = `Sum of all grades: ${sum.toFixed(1)}`;
      steps[3] = `Class average: ${sum.toFixed(1)} ÷ ${dataToUse.length} = ${mean.toFixed(precision)}`;

      additionalData = {
        scoreRange,
        gradeDistribution
      };
    }

    if (invalidEntries.length > 0) {
      const prefix = userMode === 'teacher' 
        ? `Excluded ${invalidEntries.length} non-numeric entries: ${invalidEntries.join(', ')}`
        : `Ignored ${invalidEntries.length} invalid entries: ${invalidEntries.join(', ')}`;
      steps.unshift(prefix);
    }

    setResult({
      mean: parseFloat(mean.toFixed(precision)),
      count: dataToUse.length,
      sum: parseFloat(sum.toFixed(precision)),
      steps,
      validNumbers,
      invalidEntries,
      ...additionalData
    });
  }, [userMode, precision, ignoreOutliers, confidenceLevel, parseInput, detectOutliers, calculateGradeDistribution, getTValue]);

  const clearResults = useCallback(() => {
    setResult(null);
  }, []);

  const loadExample = useCallback(() => {
    switch (userMode) {
      case 'student':
        return '85, 92, 78, 96, 88, 91, 83, 89';
      case 'research':
        return '23.45, 24.12, 23.89, 24.56, 23.78, 24.23, 23.67, 24.01, 23.95, 24.34';
      case 'teacher':
        return `92, 88, 95, 87, 91, 89, 94, 86, 90, 93
85, 88, 92, 89, 87, 91, 94, 88, 90, 86
89, 92, 87, 90, 88, 91, 85, 93, 89, 94`;
    }
  }, [userMode]);

  return {
    result,
    parseInput,
    calculateMean,
    clearResults,
    loadExample
  };
}