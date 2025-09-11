import { renderHook, act } from '@testing-library/react';
import { useMedianCalculation } from '@/hooks/useMedianCalculation';

describe('useMedianCalculation', () => {
  test('calculates median for odd number of values', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5');
    });

    expect(result.current.result?.median).toBe(3);
    expect(result.current.result?.count).toBe(5);
  });

  test('calculates median for even number of values', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 6');
    });

    expect(result.current.result?.median).toBe(3.5);
    expect(result.current.result?.count).toBe(6);
  });

  test('calculates quartiles correctly', () => {
    const { result } = renderHook(() => useMedianCalculation('research', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 6, 7, 8, 9');
    });

    expect(result.current.result?.median).toBe(5);
    expect(result.current.result?.q1).toBe(2.5);
    expect(result.current.result?.q3).toBe(7.5);
    expect(result.current.result?.iqr).toBe(5);
  });

  test('detects outliers in research mode', () => {
    const { result } = renderHook(() => useMedianCalculation('research', 2));
    
    act(() => {
      result.current.calculateMedian('1, 2, 3, 4, 5, 100');
    });

    expect(result.current.result?.outliers).toContain(100);
  });

  test('handles single value', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('42');
    });

    expect(result.current.result?.median).toBe(42);
    expect(result.current.result?.count).toBe(1);
  });

  test('handles empty input', () => {
    const { result } = renderHook(() => useMedianCalculation('student', 2));
    
    act(() => {
      result.current.calculateMedian('');
    });

    expect(result.current.result).toBeNull();
  });
});
