import { useState, useCallback } from 'react';
import { UserMode } from '@/components/calculator/UserModeSelector';

export interface RangeResult {
  range: number;
  minimum: number;
  maximum: number;
  count: number;
  steps: string[];
  validNumbers: number[];
  invalidEntries: string[];
  // Research mode specific
  interquartileRange?: number;
  quartiles?: { q1: number; q2: number; q3: number };
  outliers?: number[];
  // Teacher mode specific
  gradeDistribution?: { [key: string]: number };
  spreadAnalysis?: string;
}

export interface UseRangeCalculationReturn {
  result: RangeResult | null;
  parseInput: (inputText: string) => { validNumbers: number[]; invalidEntries: string[] };
  calculateRange: (inputText: string) => void;
  clearResults: () => void;
  loadExample: () => string;
}

export function useRangeCalculation(
  userMode: UserMode,
  precision: number = 2
): UseRangeCalculationReturn {
  const [result, setResult] = useState<RangeResult | null>(null);

  const parseInput = useCallback((inputText: string) => {
    // Support comma, newline, and space separation
    const entries = inputText
      .replace(/[\t]/g, ' ')
      .split(/[,\n\s]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);

    const validNumbers: number[] = [];
    const invalidEntries: string[] = [];

    entries.forEach(entry => {
      const cleanEntry = userMode === 'teacher' ? entry.replace(/[^\d.-]/g, '') : entry;
      const num = parseFloat(cleanEntry);
      
      if (!isNaN(num) && isFinite(num)) {
        if (userMode === 'teacher' && (num < 0 || num > 150)) {
          invalidEntries.push(entry);
        } else {
          validNumbers.push(num);
        }
      } else if (entry.length > 0) {
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

  // Calculate quartiles for research mode
  const calculateQuartiles = useCallback((numbers: number[]) => {
    const sorted = [...numbers].sort((a, b) => a - b);
    const n = sorted.length;
    
    const q1Index = Math.floor((n - 1) * 0.25);
    const q2Index = Math.floor((n - 1) * 0.5);
    const q3Index = Math.floor((n - 1) * 0.75);
    
    return {
      q1: sorted[q1Index],
      q2: sorted[q2Index], // median
      q3: sorted[q3Index]
    };
  }, []);

  // Detect outliers using IQR method
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

  // Calculate grade distribution for teacher mode
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

  const calculateRange = useCallback((inputText: string) => {
    if (!inputText.trim()) {
      setResult(null);
      return;
    }

    const { validNumbers, invalidEntries } = parseInput(inputText);

    if (validNumbers.length === 0) {
      setResult({
        range: 0,
        minimum: 0,
        maximum: 0,
        count: 0,
        steps: ['No valid numbers found in input'],
        validNumbers: [],
        invalidEntries
      });
      return;
    }

    if (validNumbers.length === 1) {
      setResult({
        range: 0,
        minimum: validNumbers[0],
        maximum: validNumbers[0],
        count: 1,
        steps: ['Only one value provided - range is 0'],
        validNumbers,
        invalidEntries
      });
      return;
    }

    const minimum = Math.min(...validNumbers);
    const maximum = Math.max(...validNumbers);
    const range = maximum - minimum;

    // Base calculation steps
    const steps = [
      userMode === 'research' 
        ? `Dataset: ${validNumbers.length} data points`
        : userMode === 'teacher'
          ? `Found ${validNumbers.length} valid student grades`
          : `Found ${validNumbers.length} valid numbers: ${validNumbers.join(', ')}`,
      `Minimum value: ${minimum.toFixed(precision)}`,
      `Maximum value: ${maximum.toFixed(precision)}`,
      `Range = Maximum - Minimum = ${maximum.toFixed(precision)} - ${minimum.toFixed(precision)} = ${range.toFixed(precision)}`
    ];

    let additionalData: any = {};

    // Research mode specific calculations
    if (userMode === 'research') {
      const quartiles = calculateQuartiles(validNumbers);
      const interquartileRange = quartiles.q3 - quartiles.q1;
      const outliers = detectOutliers(validNumbers);

      steps.push(
        `First Quartile (Q1): ${quartiles.q1.toFixed(precision)}`,
        `Second Quartile (Q2/Median): ${quartiles.q2.toFixed(precision)}`,
        `Third Quartile (Q3): ${quartiles.q3.toFixed(precision)}`,
        `Interquartile Range (IQR) = Q3 - Q1 = ${interquartileRange.toFixed(precision)}`
      );

      if (outliers.length > 0) {
        steps.push(`Detected ${outliers.length} potential outliers: ${outliers.map(o => o.toFixed(precision)).join(', ')}`);
      }

      additionalData = {
        interquartileRange: parseFloat(interquartileRange.toFixed(precision)),
        quartiles: {
          q1: parseFloat(quartiles.q1.toFixed(precision)),
          q2: parseFloat(quartiles.q2.toFixed(precision)),
          q3: parseFloat(quartiles.q3.toFixed(precision))
        },
        outliers
      };
    }

    // Teacher mode specific calculations
    if (userMode === 'teacher') {
      const gradeDistribution = calculateGradeDistribution(validNumbers);
      let spreadAnalysis = '';

      if (range <= 10) {
        spreadAnalysis = 'Low spread - students performed similarly';
      } else if (range <= 30) {
        spreadAnalysis = 'Moderate spread - mixed performance levels';
      } else {
        spreadAnalysis = 'High spread - significant performance differences';
      }

      steps[0] = `Found ${validNumbers.length} valid student grades`;
      steps.push(`Grade spread analysis: ${spreadAnalysis}`);

      additionalData = {
        gradeDistribution,
        spreadAnalysis
      };
    }

    if (invalidEntries.length > 0) {
      const prefix = userMode === 'teacher' 
        ? `Excluded ${invalidEntries.length} non-numeric entries: ${invalidEntries.join(', ')}`
        : `Ignored ${invalidEntries.length} invalid entries: ${invalidEntries.join(', ')}`;
      steps.unshift(prefix);
    }

    setResult({
      range: parseFloat(range.toFixed(precision)),
      minimum: parseFloat(minimum.toFixed(precision)),
      maximum: parseFloat(maximum.toFixed(precision)),
      count: validNumbers.length,
      steps,
      validNumbers,
      invalidEntries,
      ...additionalData
    });
  }, [userMode, precision, parseInput, calculateQuartiles, detectOutliers, calculateGradeDistribution]);

  const clearResults = useCallback(() => {
    setResult(null);
  }, []);

  const loadExample = useCallback(() => {
    switch (userMode) {
      case 'student':
        return '12, 15, 8, 22, 18, 7, 25, 14, 19, 11';
      case 'research':
        return '45.2, 47.8, 44.1, 46.9, 45.7, 48.3, 44.6, 47.1, 45.9, 46.5';
      case 'teacher':
        return `95, 87, 92, 78, 89, 94, 81, 88, 90, 85
76, 93, 89, 82, 91, 87, 95, 79, 88, 92
84, 89, 91, 86, 94, 88, 83, 90, 87, 93`;
      default:
        return '12, 15, 8, 22, 18, 7, 25, 14, 19, 11';
    }
  }, [userMode]);

  return {
    result,
    parseInput,
    calculateRange,
    clearResults,
    loadExample
  };
}