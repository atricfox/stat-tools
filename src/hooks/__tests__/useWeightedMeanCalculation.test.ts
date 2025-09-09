import { renderHook, act } from '@testing-library/react';
import { useWeightedMeanCalculation } from '../useWeightedMeanCalculation';
import { WeightedPair } from '@/types/weightedMean';

describe('useWeightedMeanCalculation', () => {
  const defaultProps = {
    userMode: 'student' as const,
    precision: 2,
    zeroWeightStrategy: 'ignore' as const,
    missingWeightStrategy: 'zero' as const,
    normalizeWeights: false
  };

  describe('initialization', () => {
    test('initializes with empty state', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isCalculating).toBe(false);
    });
  });

  describe('calculateWeighted function', () => {
    test('calculates weighted mean correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 85, weight: 4 }
      ];

      act(() => {
        result.current.calculateWeighted(pairs);
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.error).toBeNull();
      if (result.current.result) {
        // Expected: (90*3 + 85*4) / (3+4) = 610 / 7 = 87.14
        expect(result.current.result.weightedMean).toBeCloseTo(87.14, 2);
      }
    });

    test('handles calculation errors gracefully', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const invalidPairs: WeightedPair[] = [];

      act(() => {
        result.current.calculateWeighted(invalidPairs);
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).not.toBeNull();
      expect(result.current.error).toContain('No valid value:weight pairs found');
    });
  });

  describe('input parsing functions', () => {
    test('parses pairs input format correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const pairsInput = `90:3
85:4
92:2`;

      act(() => {
        result.current.calculateFromInput(pairsInput, 'pairs');
      });

      expect(result.current.result).not.toBeNull();
      if (result.current.result) {
        expect(result.current.result.validPairs).toBe(3);
      }
    });

    test('parses columns input format correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const columnsInput = '90, 85, 92|3, 4, 2';

      act(() => {
        result.current.calculateFromInput(columnsInput, 'columns');
      });

      expect(result.current.result).not.toBeNull();
      if (result.current.result) {
        expect(result.current.result.validPairs).toBe(3);
      }
    });
  });

  describe('example data generation', () => {
    test('generates student mode example data', () => {
      const { result } = renderHook(() => 
        useWeightedMeanCalculation({ ...defaultProps, userMode: 'student' })
      );
      
      const exampleData = result.current.getExampleData('pairs');
      
      expect(exampleData).toHaveLength(5);
      expect(exampleData[0]).toHaveProperty('value');
      expect(exampleData[0]).toHaveProperty('weight');
      expect(exampleData[0]).toHaveProperty('id');
    });

    test('generates research mode example data', () => {
      const { result } = renderHook(() => 
        useWeightedMeanCalculation({ ...defaultProps, userMode: 'research' })
      );
      
      const exampleData = result.current.getExampleData('pairs');
      
      expect(exampleData).toHaveLength(5);
      // Research data should have decimal weights
      expect(exampleData.some(pair => pair.weight < 1)).toBe(true);
    });

    test('generates teacher mode example data', () => {
      const { result } = renderHook(() => 
        useWeightedMeanCalculation({ ...defaultProps, userMode: 'teacher' })
      );
      
      const exampleData = result.current.getExampleData('pairs');
      
      expect(exampleData).toHaveLength(4);
      // Teacher data should represent assignment weights (percentages)
      expect(exampleData.some(pair => pair.weight <= 1)).toBe(true);
    });
  });

  describe('loadExample function', () => {
    test('formats pairs mode example correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const example = result.current.loadExample('pairs');
      
      expect(example).toContain(':');
      expect(example.split('\n').length).toBeGreaterThan(1);
    });

    test('formats columns mode example correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      const example = result.current.loadExample('columns');
      
      expect(example).toContain('|');
      const [values, weights] = example.split('|');
      expect(values).toContain(',');
      expect(weights).toContain(',');
    });
  });

  describe('clearResults function', () => {
    test('clears all state correctly', () => {
      const { result } = renderHook(() => useWeightedMeanCalculation(defaultProps));
      
      // First calculate something
      act(() => {
        result.current.calculateWeighted([{ value: 90, weight: 3 }]);
      });

      expect(result.current.result).not.toBeNull();

      // Then clear
      act(() => {
        result.current.clearResults();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isCalculating).toBe(false);
    });
  });

  describe('strategy updates', () => {
    test('recalculates when precision changes', () => {
      const { result, rerender } = renderHook(
        (props) => useWeightedMeanCalculation(props),
        { initialProps: defaultProps }
      );
      
      const pairs: WeightedPair[] = [{ value: 90.6789, weight: 3 }];

      // Calculate with 2 decimal places
      act(() => {
        result.current.calculateWeighted(pairs);
      });

      const result2Decimals = result.current.result?.weightedMean;

      // Change precision to 4 decimal places
      rerender({ ...defaultProps, precision: 4 });

      act(() => {
        result.current.calculateWeighted(pairs);
      });

      const result4Decimals = result.current.result?.weightedMean;

      expect(result2Decimals).not.toBe(result4Decimals);
    });

    test('applies zero weight strategy correctly', () => {
      const { result, rerender } = renderHook(
        (props) => useWeightedMeanCalculation(props),
        { initialProps: defaultProps }
      );
      
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 100, weight: 0 }
      ];

      // Calculate with ignore strategy (default)
      act(() => {
        result.current.calculateWeighted(pairs);
      });

      const ignoreResult = result.current.result;
      expect(ignoreResult?.validPairs).toBe(1);
      expect(ignoreResult?.excludedPairs).toBe(1);

      // Change to include strategy
      rerender({ ...defaultProps, zeroWeightStrategy: 'include' });

      act(() => {
        result.current.calculateWeighted(pairs);
      });

      const includeResult = result.current.result;
      expect(includeResult?.validPairs).toBe(2);
      expect(includeResult?.excludedPairs).toBe(0);
    });
  });
});