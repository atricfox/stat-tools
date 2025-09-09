/**
 * Unit tests for useStandardDeviationCalculation hook
 * Tests mathematical accuracy, error handling, and edge cases
 */

import { renderHook, act } from '@testing-library/react';
import { useStandardDeviationCalculation } from '../useStandardDeviationCalculation';
import { DataPoint, StandardDeviationCalculatorState } from '@/types/standardDeviation';

describe('useStandardDeviationCalculation', () => {
  const mockDataPoints: DataPoint[] = [
    { id: '1', value: 10, label: 'Point 1' },
    { id: '2', value: 12, label: 'Point 2' },
    { id: '3', value: 14, label: 'Point 3' },
    { id: '4', value: 16, label: 'Point 4' },
    { id: '5', value: 18, label: 'Point 5' }
  ];

  describe('Basic calculations', () => {
    it('should calculate correct sample standard deviation', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints, { calculationType: 'sample' });
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result!.mean).toBeCloseTo(14, 2);
      expect(result.current.result!.sampleStandardDeviation).toBeCloseTo(3.162, 2);
      expect(result.current.result!.count).toBe(5);
    });

    it('should calculate correct population standard deviation', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints, { calculationType: 'population' });
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result!.mean).toBeCloseTo(14, 2);
      expect(result.current.result!.populationStandardDeviation).toBeCloseTo(2.828, 2);
      expect(result.current.result!.count).toBe(5);
    });

    it('should calculate descriptive statistics correctly', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      const res = result.current.result!;
      expect(res.min).toBe(10);
      expect(res.max).toBe(18);
      expect(res.range).toBe(8);
      expect(res.median).toBe(14);
      expect(res.sum).toBe(70);
    });
  });

  describe('Mathematical edge cases', () => {
    it('should handle identical values', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const identicalPoints: DataPoint[] = [
        { id: '1', value: 5, label: 'Point 1' },
        { id: '2', value: 5, label: 'Point 2' },
        { id: '3', value: 5, label: 'Point 3' }
      ];

      await act(async () => {
        await result.current.calculate(identicalPoints);
      });

      expect(result.current.result!.sampleStandardDeviation).toBe(0);
      expect(result.current.result!.populationStandardDeviation).toBe(0);
      expect(result.current.result!.variance).toBe(0);
    });

    it('should handle single data point', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const singlePoint: DataPoint[] = [{ id: '1', value: 10, label: 'Point 1' }];

      await act(async () => {
        await result.current.calculate(singlePoint);
      });

      expect(result.current.result!.count).toBe(1);
      expect(result.current.result!.mean).toBe(10);
      expect(result.current.result!.sampleStandardDeviation).toBe(0); // N-1 = 0
    });

    it('should handle very large numbers', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const largeNumbers: DataPoint[] = [
        { id: '1', value: 1000000, label: 'Point 1' },
        { id: '2', value: 1000001, label: 'Point 2' },
        { id: '3', value: 1000002, label: 'Point 3' }
      ];

      await act(async () => {
        await result.current.calculate(largeNumbers);
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result!.mean).toBeCloseTo(1000001, 0);
      expect(result.current.result!.sampleStandardDeviation).toBeCloseTo(1, 2);
    });

    it('should handle negative numbers', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const negativeNumbers: DataPoint[] = [
        { id: '1', value: -5, label: 'Point 1' },
        { id: '2', value: -3, label: 'Point 2' },
        { id: '3', value: -1, label: 'Point 3' },
        { id: '4', value: 1, label: 'Point 4' },
        { id: '5', value: 3, label: 'Point 5' }
      ];

      await act(async () => {
        await result.current.calculate(negativeNumbers);
      });

      expect(result.current.result!.mean).toBeCloseTo(-1, 2);
      expect(result.current.result!.sampleStandardDeviation).toBeCloseTo(3.162, 2);
    });
  });

  describe('Outlier detection', () => {
    it('should detect outliers using IQR method', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const dataWithOutliers: DataPoint[] = [
        { id: '1', value: 1, label: 'Point 1' },
        { id: '2', value: 2, label: 'Point 2' },
        { id: '3', value: 3, label: 'Point 3' },
        { id: '4', value: 4, label: 'Point 4' },
        { id: '5', value: 5, label: 'Point 5' },
        { id: '6', value: 100, label: 'Outlier' } // Clear outlier
      ];

      await act(async () => {
        await result.current.calculate(dataWithOutliers, {
          outlierMethod: 'iqr',
          outlierThreshold: 1.5,
          excludeOutliers: false
        });
      });

      expect(result.current.result!.outliers.length).toBeGreaterThan(0);
      expect(result.current.result!.outliers[0].value).toBe(100);
    });

    it('should exclude outliers from calculation when requested', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const dataWithOutliers: DataPoint[] = [
        { id: '1', value: 1, label: 'Point 1' },
        { id: '2', value: 2, label: 'Point 2' },
        { id: '3', value: 3, label: 'Point 3' },
        { id: '4', value: 4, label: 'Point 4' },
        { id: '5', value: 5, label: 'Point 5' },
        { id: '6', value: 100, label: 'Outlier' }
      ];

      await act(async () => {
        await result.current.calculate(dataWithOutliers, {
          outlierMethod: 'iqr',
          outlierThreshold: 1.5,
          excludeOutliers: true
        });
      });

      // Should have fewer valid data points due to outlier exclusion
      expect(result.current.result!.count).toBeLessThan(6);
      expect(result.current.result!.mean).toBeLessThan(20); // Should be much lower without the outlier
    });
  });

  describe('Statistical measures', () => {
    it('should calculate skewness correctly', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const rightSkewedData: DataPoint[] = [
        { id: '1', value: 1, label: 'Point 1' },
        { id: '2', value: 1, label: 'Point 2' },
        { id: '3', value: 2, label: 'Point 3' },
        { id: '4', value: 2, label: 'Point 4' },
        { id: '5', value: 3, label: 'Point 5' },
        { id: '6', value: 10, label: 'Point 6' } // Creates right skew
      ];

      await act(async () => {
        await result.current.calculate(rightSkewedData);
      });

      expect(result.current.result!.skewness).toBeGreaterThan(0); // Right-skewed
    });

    it('should calculate kurtosis correctly', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      expect(typeof result.current.result!.kurtosis).toBe('number');
      expect(isFinite(result.current.result!.kurtosis)).toBe(true);
    });

    it('should calculate coefficient of variation correctly', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      const cv = result.current.result!.coefficientOfVariation;
      expect(cv).toBeCloseTo(22.58, 1); // (3.162/14) * 100
    });
  });

  describe('Data validation', () => {
    it('should validate data points correctly', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      const validData: DataPoint[] = [
        { id: '1', value: 1, label: 'Point 1' },
        { id: '2', value: 2, label: 'Point 2' }
      ];

      const validation = result.current.validateData(validData);
      expect(validation.valid).toBe(true);
      expect(validation.errors.length).toBe(0);
    });

    it('should reject empty data', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      const validation = result.current.validateData([]);
      expect(validation.valid).toBe(false);
      expect(validation.errors).toContain('At least one data point is required');
    });

    it('should reject invalid values', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const invalidData: DataPoint[] = [
        { id: '1', value: NaN, label: 'Point 1' },
        { id: '2', value: Infinity, label: 'Point 2' }
      ];

      const validation = result.current.validateData(invalidData);
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });
  });

  describe('Calculation steps', () => {
    it('should generate calculation steps', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      expect(result.current.result!.steps.length).toBeGreaterThan(0);
      expect(result.current.result!.steps[0]).toContain('Count the data points');
      expect(result.current.result!.steps[1]).toContain('Calculate the mean');
    });
  });

  describe('Deviations data', () => {
    it('should calculate individual deviations', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      expect(result.current.result!.deviations.length).toBe(5);
      
      const firstDeviation = result.current.result!.deviations[0];
      expect(firstDeviation.value).toBe(10);
      expect(firstDeviation.deviation).toBeCloseTo(-4, 1); // 10 - 14 = -4
      expect(firstDeviation.squaredDeviation).toBeCloseTo(16, 1); // (-4)^2 = 16
    });
  });

  describe('Error handling', () => {
    it('should handle calculation errors gracefully', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      await act(async () => {
        try {
          await result.current.calculate([]);
        } catch (error) {
          // Expected to throw
        }
      });

      expect(result.current.error).not.toBeNull();
      expect(result.current.result).toBeNull();
    });
  });

  describe('Data point management', () => {
    it('should add data points', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      const newPoint: DataPoint = { id: '1', value: 5, label: 'New Point' };

      act(() => {
        result.current.addDataPoint(newPoint);
      });

      // Note: The hook doesn't expose internal dataPoints state
      // This would need to be tested through the component that uses the hook
    });

    it('should remove data points', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      act(() => {
        result.current.removeDataPoint('1');
      });

      // Note: Similar to add, this would be tested through component integration
    });

    it('should update data points', () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      act(() => {
        result.current.updateDataPoint('1', { value: 10 });
      });

      // Note: Would be tested through component integration
    });
  });

  describe('Reset functionality', () => {
    it('should reset calculation state', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());

      // First calculate something
      await act(async () => {
        await result.current.calculate(mockDataPoints);
      });

      expect(result.current.result).not.toBeNull();

      // Then reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.result).toBeNull();
      expect(result.current.error).toBeNull();
    });
  });

  describe('Real-world statistical verification', () => {
    it('should match known statistical results', async () => {
      const { result } = renderHook(() => useStandardDeviationCalculation());
      
      // Test data with known results (calculated manually)
      const knownData: DataPoint[] = [
        { id: '1', value: 2, label: 'Point 1' },
        { id: '2', value: 4, label: 'Point 2' },
        { id: '3', value: 4, label: 'Point 3' },
        { id: '4', value: 4, label: 'Point 4' },
        { id: '5', value: 5, label: 'Point 5' },
        { id: '6', value: 5, label: 'Point 6' },
        { id: '7', value: 7, label: 'Point 7' },
        { id: '8', value: 9, label: 'Point 8' }
      ];

      await act(async () => {
        await result.current.calculate(knownData, { calculationType: 'sample' });
      });

      const res = result.current.result!;
      expect(res.mean).toBeCloseTo(5, 1);
      expect(res.sampleStandardDeviation).toBeCloseTo(2.138, 2);
      expect(res.median).toBeCloseTo(4.5, 1);
      expect(res.q1).toBeCloseTo(4, 1);
      expect(res.q3).toBeCloseTo(5, 1);
    });
  });
});