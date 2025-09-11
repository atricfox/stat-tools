import { renderHook, act } from '@testing-library/react';
import { usePercentErrorCalculation } from '@/hooks/usePercentErrorCalculation';

describe('usePercentErrorCalculation', () => {
  describe('Basic Functionality', () => {
    it('should calculate percent error correctly', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('student', 2));

      act(() => {
        result.current.calculatePercentError('9.8', '9.6');
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.percentError).toBe(2.04);
      expect(result.current.result?.absoluteError).toBe(0.2);
      expect(result.current.result?.theoreticalValue).toBe(9.8);
      expect(result.current.result?.experimentalValue).toBe(9.6);
    });

    it('should handle zero theoretical value', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('student', 2));

      act(() => {
        result.current.calculatePercentError('0', '5');
      });

      expect(result.current.result?.steps[0]).toContain('错误');
    });

    it('should handle invalid inputs', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('student', 2));

      act(() => {
        result.current.calculatePercentError('abc', '5');
      });

      expect(result.current.result?.steps[0]).toContain('输入无效');
    });
  });

  describe('User Mode Specific Features', () => {
    it('should provide research mode features', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('research', 4));

      act(() => {
        result.current.calculatePercentError('25.00', '24.75');
      });

      expect(result.current.result?.relativeError).toBeDefined();
      expect(result.current.result?.accuracy).toBeDefined();
      expect(result.current.result?.percentError).toBe(1.0);
      expect(result.current.result?.accuracy).toBe(99.0);
    });

    it('should provide teacher mode features', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('teacher', 2));

      act(() => {
        result.current.calculatePercentError('100', '95');
      });

      expect(result.current.result?.gradeEquivalent).toBeDefined();
      expect(result.current.result?.interpretation).toBeDefined();
      expect(result.current.result?.percentError).toBe(5.0);
      expect(result.current.result?.gradeEquivalent).toContain('B');
    });
  });

  describe('Load Examples', () => {
    it('should load student mode example', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('student', 2));

      const example = result.current.loadExample();
      expect(example.theoretical).toBe('9.8');
      expect(example.experimental).toBe('9.6');
    });

    it('should load teacher mode example', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('teacher', 2));

      const example = result.current.loadExample();
      expect(example.theoretical).toBe('100');
      expect(example.experimental).toBe('95');
    });

    it('should load research mode example', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('research', 2));

      const example = result.current.loadExample();
      expect(example.theoretical).toBe('25.00');
      expect(example.experimental).toBe('24.75');
    });
  });

  describe('Clear Results', () => {
    it('should clear results', () => {
      const { result } = renderHook(() => usePercentErrorCalculation('student', 2));

      act(() => {
        result.current.calculatePercentError('9.8', '9.6');
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.result).toBeNull();
    });
  });
});