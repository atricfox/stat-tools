import {
  calculateWeightedMean,
  createDefaultStrategy,
  parseNumericValue
} from '../weightedMeanCalculation';
import { WeightedPair, WeightingStrategy } from '@/types/weightedMean';

describe('calculateWeightedMean', () => {
  const defaultStrategy = createDefaultStrategy(2);

  describe('basic calculations', () => {
    test('calculates simple weighted mean correctly', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 85, weight: 4 },
        { value: 92, weight: 2 },
        { value: 88, weight: 3 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Expected: (90*3 + 85*4 + 92*2 + 88*3) / (3+4+2+3) = 1058 / 12 = 88.17
        expect(result.result.weightedMean).toBeCloseTo(88.17, 2);
        expect(result.result.totalWeights).toBe(12);
        expect(result.result.validPairs).toBe(4);
        expect(result.result.excludedPairs).toBe(0);
      }
    });

    test('handles single pair calculation', () => {
      const pairs: WeightedPair[] = [
        { value: 95, weight: 5 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.weightedMean).toBe(95);
        expect(result.result.totalWeights).toBe(5);
      }
    });

    test('handles equal weights (should equal arithmetic mean)', () => {
      const pairs: WeightedPair[] = [
        { value: 80, weight: 1 },
        { value: 90, weight: 1 },
        { value: 100, weight: 1 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Should equal arithmetic mean: (80+90+100)/3 = 90
        expect(result.result.weightedMean).toBe(90);
      }
    });
  });

  describe('precision control', () => {
    test('respects precision setting', () => {
      const pairs: WeightedPair[] = [
        { value: 85.6789, weight: 2.3456 },
        { value: 92.1234, weight: 3.7890 }
      ];

      const highPrecisionStrategy: WeightingStrategy = {
        ...defaultStrategy,
        precision: 4
      };

      const result = calculateWeightedMean(pairs, highPrecisionStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        // Should maintain 4 decimal places
        const decimalPlaces = result.result.weightedMean.toString().split('.')[1]?.length || 0;
        expect(decimalPlaces).toBeLessThanOrEqual(4);
      }
    });
  });

  describe('zero weight handling', () => {
    test('ignores zero weights by default', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 0, weight: 0 },  // Should be ignored
        { value: 85, weight: 4 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.validPairs).toBe(2); // Only 2 valid pairs
        expect(result.result.excludedPairs).toBe(1);
        // Should equal (90*3 + 85*4) / (3+4) = 610 / 7 = 87.14
        expect(result.result.weightedMean).toBeCloseTo(87.14, 2);
      }
    });

    test('includes zero weights when strategy is include', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 100, weight: 0 },  // Should be included but contribute 0
        { value: 85, weight: 4 }
      ];

      const includeStrategy: WeightingStrategy = {
        ...defaultStrategy,
        zeroWeightStrategy: 'include'
      };

      const result = calculateWeightedMean(pairs, includeStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.result.validPairs).toBe(3);
        expect(result.result.excludedPairs).toBe(0);
        // Should equal (90*3 + 100*0 + 85*4) / (3+0+4) = 610 / 7 = 87.14
        expect(result.result.weightedMean).toBeCloseTo(87.14, 2);
      }
    });

    test('throws error when strategy is error and zero weights exist', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 85, weight: 0 }
      ];

      const errorStrategy: WeightingStrategy = {
        ...defaultStrategy,
        zeroWeightStrategy: 'error'
      };

      const result = calculateWeightedMean(pairs, errorStrategy);
      
      expect(result.success).toBe(false);
    });
  });

  describe('edge cases and error handling', () => {
    test('handles empty input', () => {
      const result = calculateWeightedMean([], defaultStrategy);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PAIRS');
      }
    });

    test('handles invalid numbers', () => {
      const pairs: WeightedPair[] = [
        { value: NaN, weight: 3 },
        { value: 85, weight: 4 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PAIRS');
      }
    });

    test('handles negative weights', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 85, weight: -2 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(false);
    });

    test('handles all zero weights', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 0 },
        { value: 85, weight: 0 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.code).toBe('INVALID_PAIRS');
      }
    });
  });

  describe('result structure validation', () => {
    test('returns complete result structure', () => {
      const pairs: WeightedPair[] = [
        { value: 90, weight: 3 },
        { value: 85, weight: 4 }
      ];

      const result = calculateWeightedMean(pairs, defaultStrategy);
      
      expect(result.success).toBe(true);
      if (result.success) {
        const { result: calcResult } = result;
        
        // Check all required fields exist
        expect(calcResult).toHaveProperty('weightedMean');
        expect(calcResult).toHaveProperty('totalWeights');
        expect(calcResult).toHaveProperty('totalWeightedValue');
        expect(calcResult).toHaveProperty('validPairs');
        expect(calcResult).toHaveProperty('excludedPairs');
        expect(calcResult).toHaveProperty('pairs');
        expect(calcResult).toHaveProperty('steps');
        expect(calcResult).toHaveProperty('weightDistribution');
        expect(calcResult).toHaveProperty('metadata');
        
        // Check pairs have contribution calculated
        expect(calcResult.pairs[0]).toHaveProperty('contribution');
        expect(calcResult.pairs[0].contribution).toBeGreaterThan(0);
        
        // Check steps are generated
        expect(calcResult.steps.length).toBeGreaterThan(0);
        
        // Check weight distribution
        expect(calcResult.weightDistribution).toHaveProperty('min');
        expect(calcResult.weightDistribution).toHaveProperty('max');
        expect(calcResult.weightDistribution).toHaveProperty('mean');
        expect(calcResult.weightDistribution).toHaveProperty('std');
      }
    });
  });
});

describe('utility functions', () => {
  describe('createDefaultStrategy', () => {
    test('creates strategy with default precision', () => {
      const strategy = createDefaultStrategy();
      
      expect(strategy.precision).toBe(2);
      expect(strategy.zeroWeightStrategy).toBe('ignore');
      expect(strategy.missingWeightStrategy).toBe('zero');
      expect(strategy.normalizeWeights).toBe(false);
    });

    test('creates strategy with custom precision', () => {
      const strategy = createDefaultStrategy(4);
      
      expect(strategy.precision).toBe(4);
    });
  });

  describe('parseNumericValue', () => {
    test('parses valid numbers', () => {
      expect(parseNumericValue(42)).toBe(42);
      expect(parseNumericValue('42')).toBe(42);
      expect(parseNumericValue('42.5')).toBe(42.5);
      expect(parseNumericValue(' 42.5 ')).toBe(42.5);
    });

    test('handles invalid input', () => {
      expect(parseNumericValue('abc')).toBeNull();
      expect(parseNumericValue('')).toBeNull();
      expect(parseNumericValue('NaN')).toBeNull();
      expect(parseNumericValue(NaN)).toBeNull();
      expect(parseNumericValue(Infinity)).toBeNull();
    });
  });
});

// GPA specific test cases
describe('GPA calculation scenarios', () => {
  const gpaStrategy = createDefaultStrategy(2);
  
  test('calculates typical undergraduate GPA', () => {
    const courses: WeightedPair[] = [
      { value: 92, weight: 3 }, // Math: A- (3 credits)
      { value: 88, weight: 4 }, // Chemistry: B+ (4 credits)  
      { value: 95, weight: 3 }, // English: A (3 credits)
      { value: 87, weight: 2 }, // History: B+ (2 credits)
      { value: 91, weight: 3 }  // Physics: A- (3 credits)
    ];

    const result = calculateWeightedMean(courses, gpaStrategy);
    
    expect(result.success).toBe(true);
    if (result.success) {
      // Expected: (92*3 + 88*4 + 95*3 + 87*2 + 91*3) / 15 = 1360 / 15 = 90.67
      expect(result.result.weightedMean).toBeCloseTo(90.67, 2);
      expect(result.result.totalWeights).toBe(15); // Total credits
    }
  });

  test('handles Pass/Fail courses (zero credit)', () => {
    const courses: WeightedPair[] = [
      { value: 92, weight: 3 },
      { value: 100, weight: 0 }, // Pass/Fail course, should be ignored
      { value: 88, weight: 4 }
    ];

    const result = calculateWeightedMean(courses, gpaStrategy);
    
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.result.validPairs).toBe(2);
      expect(result.result.excludedPairs).toBe(1);
    }
  });
});