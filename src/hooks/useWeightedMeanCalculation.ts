import { useState, useCallback, useMemo } from 'react';
import {
  WeightedPair,
  WeightingStrategy,
  WeightedMeanResult,
  WeightedMeanCalculationResult,
  UserMode,
  InputMode
} from '@/types/weightedMean';
import {
  calculateWeightedMean,
  createDefaultStrategy,
  parseNumericValue
} from '@/lib/weightedMeanCalculation';

export interface UseWeightedMeanCalculationProps {
  userMode: UserMode;
  precision: number;
  zeroWeightStrategy: 'ignore' | 'error' | 'include';
  missingWeightStrategy: 'zero' | 'ignore' | 'error';
  normalizeWeights: boolean;
}

export interface UseWeightedMeanCalculationReturn {
  result: WeightedMeanResult | null;
  error: string | null;
  isCalculating: boolean;
  calculateWeighted: (pairs: WeightedPair[]) => void;
  calculateFromInput: (input: string, mode: InputMode) => void;
  clearResults: () => void;
  loadExample: (mode: InputMode) => string;
  getExampleData: (mode: InputMode) => WeightedPair[];
}

/**
 * Custom hook for weighted mean calculations
 * Provides state management and calculation logic for weighted mean calculator
 */
export function useWeightedMeanCalculation({
  userMode,
  precision,
  zeroWeightStrategy,
  missingWeightStrategy,
  normalizeWeights
}: UseWeightedMeanCalculationProps): UseWeightedMeanCalculationReturn {
  
  const [result, setResult] = useState<WeightedMeanResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  // Create weighting strategy from props
  const strategy = useMemo((): WeightingStrategy => ({
    zeroWeightStrategy,
    missingWeightStrategy,
    normalizeWeights,
    precision
  }), [zeroWeightStrategy, missingWeightStrategy, normalizeWeights, precision]);

  /**
   * Parse pairs input format: "value:weight" or "value,weight" or "value weight"
   */
  const parsePairsInput = useCallback((input: string): WeightedPair[] => {
    const pairs: WeightedPair[] = [];
    const lines = input.split('\n').filter(line => line.trim());
    
    lines.forEach((line, index) => {
      // Support formats: "value:weight", "value,weight", "value weight"
      const match = line.match(/([0-9.-]+)[\s:,]+([0-9.-]+)/);
      if (match) {
        const value = parseNumericValue(match[1]);
        const weight = parseNumericValue(match[2]);
        
        if (value !== null && weight !== null) {
          pairs.push({ 
            value, 
            weight, 
            id: `pair-${index}` 
          });
        }
      }
    });
    
    return pairs;
  }, []);

  /**
   * Parse columns input format: separate values and weights strings
   */
  const parseColumnsInput = useCallback((valuesText: string, weightsText: string): WeightedPair[] => {
    const values = valuesText.split(/[,\n\s]+/)
      .map(v => parseNumericValue(v.trim()))
      .filter(v => v !== null) as number[];
    
    const weights = weightsText.split(/[,\n\s]+/)
      .map(w => parseNumericValue(w.trim()))
      .filter(w => w !== null) as number[];
    
    const pairs: WeightedPair[] = [];
    const minLength = Math.min(values.length, weights.length);
    
    for (let i = 0; i < minLength; i++) {
      pairs.push({
        value: values[i],
        weight: weights[i],
        id: `pair-${i}`
      });
    }
    
    return pairs;
  }, []);

  /**
   * Main calculation function
   */
  const calculateWeighted = useCallback((pairs: WeightedPair[]) => {
    setIsCalculating(true);
    setError(null);

    try {
      const calculationResult: WeightedMeanCalculationResult = calculateWeightedMean(pairs, strategy);
      
      if (calculationResult.success) {
        setResult({
          ...calculationResult.result,
          metadata: {
            ...calculationResult.result.metadata,
            timestamp: new Date().toISOString()
          }
        });
        setError(null);
      } else {
        setResult(null);
        setError(calculationResult.error.message);
      }
    } catch (err) {
      setResult(null);
      setError(err instanceof Error ? err.message : 'Unknown calculation error');
    } finally {
      setIsCalculating(false);
    }
  }, [strategy]);

  /**
   * Calculate from different input formats
   */
  const calculateFromInput = useCallback((input: string, mode: InputMode) => {
    let pairs: WeightedPair[] = [];

    switch (mode) {
      case 'pairs':
        pairs = parsePairsInput(input);
        break;
      case 'columns':
        // For columns mode, input should be in format "values|weights"
        const [valuesText = '', weightsText = ''] = input.split('|');
        pairs = parseColumnsInput(valuesText, weightsText);
        break;
      case 'manual':
        // Manual mode pairs are passed directly, so we try to parse as JSON
        try {
          pairs = JSON.parse(input);
        } catch {
          pairs = parsePairsInput(input); // Fallback to pairs parsing
        }
        break;
    }

    calculateWeighted(pairs);
  }, [calculateWeighted, parsePairsInput, parseColumnsInput]);

  /**
   * Clear all results and errors
   */
  const clearResults = useCallback(() => {
    setResult(null);
    setError(null);
    setIsCalculating(false);
  }, []);

  /**
   * Get example data based on user mode and input mode
   */
  const getExampleData = useCallback((mode: InputMode): WeightedPair[] => {
    switch (userMode) {
      case 'student':
        // GPA example data
        return [
          { value: 92, weight: 3, id: 'math' },      // Math: A- (3 credits)
          { value: 88, weight: 4, id: 'chemistry' }, // Chemistry: B+ (4 credits)
          { value: 95, weight: 3, id: 'english' },   // English: A (3 credits)
          { value: 87, weight: 2, id: 'history' },   // History: B+ (2 credits)
          { value: 91, weight: 3, id: 'physics' }    // Physics: A- (3 credits)
        ];
      
      case 'research':
        // Research sample data with weights
        return [
          { value: 12.5, weight: 0.2, id: 'sample1' },
          { value: 15.3, weight: 0.3, id: 'sample2' },
          { value: 11.8, weight: 0.25, id: 'sample3' },
          { value: 14.1, weight: 0.15, id: 'sample4' },
          { value: 13.7, weight: 0.1, id: 'sample5' }
        ];
      
      case 'teacher':
        // Class grades with different assignment weights
        return [
          { value: 85, weight: 0.3, id: 'midterm' },    // Midterm: 30%
          { value: 92, weight: 0.4, id: 'final' },      // Final: 40%
          { value: 88, weight: 0.2, id: 'project' },    // Project: 20%
          { value: 90, weight: 0.1, id: 'participation' } // Participation: 10%
        ];
      
      default:
        return [];
    }
  }, [userMode]);

  /**
   * Load example data and return formatted string
   */
  const loadExample = useCallback((mode: InputMode): string => {
    const exampleData = getExampleData(mode);
    
    switch (mode) {
      case 'pairs':
        return exampleData.map(pair => `${pair.value}:${pair.weight}`).join('\n');
      
      case 'columns':
        const values = exampleData.map(pair => pair.value).join(', ');
        const weights = exampleData.map(pair => pair.weight).join(', ');
        return `${values}|${weights}`;
      
      case 'manual':
        return JSON.stringify(exampleData);
      
      default:
        return '';
    }
  }, [getExampleData]);

  return {
    result,
    error,
    isCalculating,
    calculateWeighted,
    calculateFromInput,
    clearResults,
    loadExample,
    getExampleData
  };
}