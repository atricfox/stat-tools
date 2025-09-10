/**
 * Custom hook for mean calculation functionality
 * Manages state, validation, and calculation logic
 */

'use client'

import { useState, useCallback, useMemo } from 'react';
import { parseNumberInput, calculateMean, generateCalculationSteps } from '@/lib/math';
import { validationHelpers, ValidationError, ValidationResult } from '@/lib/validation';
import { parseMultiFormatInput, ParseResult } from '@/lib/parsers';

export interface MeanCalculationResult {
  mean: number;
  sum: number;
  count: number;
  steps: string[];
  validNumbers: number[];
  invalidEntries: string[];
  warnings?: string[];
  suggestions?: string[];
}

export interface UseMeanCalculatorProps {
  precision?: number;
  autoCalculate?: boolean;
  validateInput?: boolean;
}

export function useMeanCalculator({
  precision = 2,
  autoCalculate = true,
  validateInput = true
}: UseMeanCalculatorProps = {}) {
  const [input, setInput] = useState('');
  const [precisionValue, setPrecision] = useState(precision);
  const [result, setResult] = useState<MeanCalculationResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Parse and validate input
  const parsedData = useMemo(() => {
    if (!input.trim()) {
      return { validNumbers: [], invalidEntries: [], isValid: false };
    }

    try {
      const parseResult = parseNumberInput(input);
      if (!parseResult || typeof parseResult !== 'object') {
        return { validNumbers: [], invalidEntries: [input], isValid: false };
      }
      
      const { validNumbers, invalidEntries } = parseResult;
      const isValid = validNumbers.length > 0;

      return { validNumbers, invalidEntries, isValid };
    } catch (error) {
      console.error('Parse error in useMeanCalculator:', error);
      return { validNumbers: [], invalidEntries: [input], isValid: false };
    }
  }, [input]);

  // Get data quality warnings and suggestions
  const dataQuality = useMemo(() => {
    if (!validateInput || !parsedData.isValid) {
      return { warnings: [], suggestions: [] };
    }
    try {
      const result = validationHelpers.detectDataIssues(input);
      return result || { warnings: [], suggestions: [] };
    } catch (error) {
      console.error('Validation error in useMeanCalculator:', error);
      return { warnings: [], suggestions: [] };
    }
  }, [input, parsedData.isValid, validateInput]);

  // Calculate mean
  const calculate = useCallback(async () => {
    if (!parsedData.isValid) {
      setError('No valid numbers found in input');
      setResult(null);
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Simulate async calculation (useful for large datasets)
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const calculation = calculateMean(parsedData.validNumbers, precisionValue);
      const steps = generateCalculationSteps(
        parsedData.validNumbers,
        calculation.mean,
        'mean',
        precisionValue
      );

      const calculationResult: MeanCalculationResult = {
        mean: calculation.mean,
        sum: calculation.sum,
        count: calculation.count,
        steps,
        validNumbers: parsedData.validNumbers,
        invalidEntries: parsedData.invalidEntries,
        warnings: dataQuality.warnings,
        suggestions: dataQuality.suggestions
      };

      setResult(calculationResult);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Calculation failed';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [parsedData, precisionValue, dataQuality]);

  // Clear all data
  const clear = useCallback(() => {
    setInput('');
    setResult(null);
    setError(null);
  }, []);

  // Load example data
  const loadExample = useCallback(() => {
    setInput('85, 92, 78, 96, 88, 91, 83, 89');
  }, []);

  // Update precision
  const updatePrecision = useCallback((newPrecision: number) => {
    setPrecision(newPrecision);
    if (autoCalculate && result && parsedData.isValid) {
      // Recalculate with new precision
      const calculation = calculateMean(parsedData.validNumbers, newPrecision);
      const steps = generateCalculationSteps(
        parsedData.validNumbers,
        calculation.mean,
        'mean',
        newPrecision
      );

      setResult(prev => prev ? {
        ...prev,
        mean: calculation.mean,
        sum: calculation.sum,
        steps
      } : null);
    }
  }, [autoCalculate, result, parsedData]);

  // Auto-calculate when input changes
  useMemo(() => {
    if (autoCalculate && parsedData.isValid) {
      calculate();
    } else if (!parsedData.isValid) {
      setResult(null);
      setError(null);
    }
  }, [autoCalculate, parsedData.isValid, calculate]);

  return {
    // State
    input,
    precision: precisionValue,
    result,
    error,
    isCalculating,
    
    // Computed values
    isValid: parsedData.isValid,
    validCount: parsedData.validNumbers.length,
    invalidCount: parsedData.invalidEntries.length,
    hasWarnings: dataQuality.warnings.length > 0,
    
    // Actions
    setInput,
    updatePrecision,
    calculate,
    clear,
    loadExample,
    
    // Utilities
    copyResult: useCallback(async () => {
      if (!result) return false;
      
      try {
        const text = `Mean: ${result.mean}\nCount: ${result.count}\nSum: ${result.sum}`;
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        return false;
      }
    }, [result]),
    
    exportData: useCallback(() => {
      if (!result) return null;
      
      return {
        input,
        result: {
          mean: result.mean,
          sum: result.sum,
          count: result.count,
          precision: precisionValue
        },
        validNumbers: parsedData.validNumbers,
        invalidEntries: parsedData.invalidEntries,
        timestamp: new Date().toISOString()
      };
    }, [input, result, precisionValue, parsedData])
  };
}