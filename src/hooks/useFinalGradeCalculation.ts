/**
 * useFinalGradeCalculation - Hook for final grade prediction calculations
 * Handles real-time calculations with validation and error handling
 */

import { useState, useMemo, useCallback } from 'react';
import { calculateRequiredFinalScore, validateGradeInputs } from '@/lib/gradeCalculations';
import type {
  GradeItem,
  FinalGradeCalculationOptions,
  FinalGradeResult,
  GradingScale
} from '@/types/education';

interface UseFinalGradeCalculationProps {
  initialGrades?: GradeItem[];
  initialFinalWeight?: number;
  initialTargetGrade?: number;
  initialGradingScale?: GradingScale;
  autoCalculate?: boolean;
}

interface UseFinalGradeCalculationReturn {
  // State
  grades: GradeItem[];
  finalExamWeight: number;
  targetGrade: number;
  gradingScale: GradingScale;
  
  // Results
  result: FinalGradeResult | null;
  isCalculating: boolean;
  error: string | null;
  
  // Actions
  setGrades: (grades: GradeItem[]) => void;
  setFinalExamWeight: (weight: number) => void;
  setTargetGrade: (grade: number) => void;
  setGradingScale: (scale: GradingScale) => void;
  calculate: () => void;
  reset: () => void;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  
  // Utilities
  currentWeightedScore: number;
  remainingWeight: number;
  canCalculate: boolean;
}

export default function useFinalGradeCalculation({
  initialGrades = [],
  initialFinalWeight = 50,
  initialTargetGrade = 85,
  initialGradingScale = 'percentage',
  autoCalculate = true
}: UseFinalGradeCalculationProps = {}): UseFinalGradeCalculationReturn {
  
  // State management
  const [grades, setGradesState] = useState<GradeItem[]>(initialGrades);
  const [finalExamWeight, setFinalExamWeightState] = useState<number>(initialFinalWeight);
  const [targetGrade, setTargetGradeState] = useState<number>(initialTargetGrade);
  const [gradingScale, setGradingScaleState] = useState<GradingScale>(initialGradingScale);
  const [result, setResult] = useState<FinalGradeResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validation logic
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    try {
      if (grades.length === 0) {
        errors.push('Please add at least one grade item');
      } else {
        validateGradeInputs(grades, true); // Allow normalization
      }
    } catch (err) {
      if (err instanceof Error) {
        errors.push(err.message);
      }
    }

    if (finalExamWeight < 1 || finalExamWeight > 100) {
      errors.push('Final exam weight must be between 1-100%');
    }

    if (targetGrade <= 0 || targetGrade > 100) {
      errors.push('Target grade must be between 1-100');
    }

    // Check if current weights + final weight makes sense
    const currentTotalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    if (currentTotalWeight + finalExamWeight > 105) { // Allow small tolerance
      errors.push(`Current grades weight (${currentTotalWeight.toFixed(1)}%) + final exam weight (${finalExamWeight}%) exceeds 100%`);
    }

    return errors;
  }, [grades, finalExamWeight, targetGrade]);

  const isValid = validationErrors.length === 0;

  // Calculate current weighted score and remaining weight
  const { currentWeightedScore, remainingWeight } = useMemo(() => {
    const currentTotalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    const weightedSum = grades.reduce((sum, grade) => sum + (grade.score * grade.weight), 0);
    const currentScore = currentTotalWeight > 0 ? weightedSum / currentTotalWeight : 0;
    
    return {
      currentWeightedScore: currentScore,
      remainingWeight: Math.max(0, 100 - currentTotalWeight)
    };
  }, [grades]);

  const canCalculate = isValid && grades.length > 0;

  // Calculation function
  const calculate = useCallback(async () => {
    if (!canCalculate) {
      setError('Please check the validity of input data');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const options: FinalGradeCalculationOptions = {
        currentGrades: grades,
        finalExamWeight,
        targetGrade,
        gradeScale: gradingScale,
        passingGrade: gradingScale === 'percentage' ? 60 : 2.0
      };

      // Simulate async calculation for better UX
      await new Promise(resolve => setTimeout(resolve, 100));

      const calculationResult = calculateRequiredFinalScore(options);
      setResult(calculationResult);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during calculation';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [grades, finalExamWeight, targetGrade, gradingScale, canCalculate]);

  // Auto-calculate when inputs change
  useMemo(() => {
    if (autoCalculate && canCalculate) {
      // Use a more testable approach for auto-calculation
      const timer = setTimeout(() => {
        calculate();
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (!canCalculate) {
      setResult(null);
    }
  }, [autoCalculate, canCalculate, calculate]);

  // Action handlers
  const setGrades = useCallback((newGrades: GradeItem[]) => {
    setGradesState(newGrades);
  }, []);

  const setFinalExamWeight = useCallback((weight: number) => {
    const clampedWeight = Math.max(1, Math.min(100, weight));
    setFinalExamWeightState(clampedWeight);
  }, []);

  const setTargetGrade = useCallback((grade: number) => {
    const clampedGrade = Math.max(0, Math.min(100, grade));
    setTargetGradeState(clampedGrade);
  }, []);

  const setGradingScale = useCallback((scale: GradingScale) => {
    setGradingScaleState(scale);
  }, []);

  const reset = useCallback(() => {
    setGradesState(initialGrades);
    setFinalExamWeightState(initialFinalWeight);
    setTargetGradeState(initialTargetGrade);
    setGradingScaleState(initialGradingScale);
    setResult(null);
    setError(null);
  }, [initialGrades, initialFinalWeight, initialTargetGrade, initialGradingScale]);

  return {
    // State
    grades,
    finalExamWeight,
    targetGrade,
    gradingScale,
    
    // Results
    result,
    isCalculating,
    error,
    
    // Actions
    setGrades,
    setFinalExamWeight,
    setTargetGrade,
    setGradingScale,
    calculate,
    reset,
    
    // Validation
    isValid,
    validationErrors,
    
    // Utilities
    currentWeightedScore,
    remainingWeight,
    canCalculate
  };
}