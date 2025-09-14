/**
 * Test for useVarianceCalculation hook
 * Tests the variance calculation functionality
 */

import { renderHook, act } from '@testing-library/react';
import { useVarianceCalculation } from '@/hooks/useVarianceCalculation';
import { VarianceDataPoint } from '@/types/variance';

describe('useVarianceCalculation', () => {
  it('should calculate correct sample variance', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    const testData: VarianceDataPoint[] = [
      { id: '1', value: 2, label: 'Value 1' },
      { id: '2', value: 4, label: 'Value 2' },
      { id: '3', value: 4, label: 'Value 3' },
      { id: '4', value: 4, label: 'Value 4' },
      { id: '5', value: 5, label: 'Value 5' },
      { id: '6', value: 5, label: 'Value 6' },
      { id: '7', value: 7, label: 'Value 7' },
      { id: '8', value: 9, label: 'Value 8' }
    ];

    act(() => {
      result.current.calculate(testData, {
        calculationType: 'sample',
        precision: 2
      });
    });

    expect(result.current.result).toBeTruthy();
    expect(result.current.result?.sampleVariance).toBeCloseTo(4.571, 3);
    expect(result.current.result?.populationVariance).toBeCloseTo(4.0, 3);
    expect(result.current.result?.mean).toBe(5);
    expect(result.current.result?.standardDeviation).toBeCloseTo(2.138, 3);
  });

  it('should calculate correct population variance', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    const testData: VarianceDataPoint[] = [
      { id: '1', value: 10, label: 'Value 1' },
      { id: '2', value: 20, label: 'Value 2' },
      { id: '3', value: 30, label: 'Value 3' }
    ];

    act(() => {
      result.current.calculate(testData, {
        calculationType: 'population',
        precision: 2
      });
    });

    expect(result.current.result).toBeTruthy();
    expect(result.current.result?.populationVariance).toBeCloseTo(66.67, 2);
    expect(result.current.result?.mean).toBe(20);
  });

  it('should handle single data point for population variance', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    const testData: VarianceDataPoint[] = [
      { id: '1', value: 42, label: 'Value 1' }
    ];

    act(() => {
      result.current.calculate(testData, {
        calculationType: 'population',
        precision: 2
      });
    });

    expect(result.current.result).toBeTruthy();
    expect(result.current.result?.populationVariance).toBe(0);
    expect(result.current.result?.mean).toBe(42);
  });

  it('should reject empty data', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    act(() => {
      result.current.calculate([], {
        calculationType: 'sample',
        precision: 2
      });
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeTruthy();
  });

  it('should generate calculation steps', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    const testData: VarianceDataPoint[] = [
      { id: '1', value: 1, label: 'Value 1' },
      { id: '2', value: 2, label: 'Value 2' },
      { id: '3', value: 3, label: 'Value 3' }
    ];

    act(() => {
      result.current.calculate(testData, {
        calculationType: 'sample',
        precision: 2
      });
    });

    expect(result.current.result?.steps).toBeTruthy();
    expect(result.current.result?.steps.length).toBeGreaterThan(0);
    expect(result.current.result?.steps[0]).toContain('Step 1');
  });

  it('should reset calculation state', () => {
    const { result } = renderHook(() => useVarianceCalculation());

    const testData: VarianceDataPoint[] = [
      { id: '1', value: 1, label: 'Value 1' },
      { id: '2', value: 2, label: 'Value 2' }
    ];

    act(() => {
      result.current.calculate(testData, {
        calculationType: 'sample',
        precision: 2
      });
    });

    expect(result.current.result).toBeTruthy();

    act(() => {
      result.current.reset();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});