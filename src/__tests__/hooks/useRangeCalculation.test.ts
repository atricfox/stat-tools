import { renderHook, act } from '@testing-library/react';
import { useRangeCalculation } from '@/hooks/useRangeCalculation';

describe('useRangeCalculation', () => {
  describe('Basic Functionality', () => {
    it('should calculate range correctly', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      act(() => {
        result.current.calculateRange('12, 15, 8, 22, 18, 7, 25, 14, 19, 11');
      });

      expect(result.current.result).not.toBeNull();
      expect(result.current.result?.range).toBe(18); // 25 - 7 = 18
      expect(result.current.result?.minimum).toBe(7);
      expect(result.current.result?.maximum).toBe(25);
      expect(result.current.result?.count).toBe(10);
    });

    it('should handle single value', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      act(() => {
        result.current.calculateRange('15');
      });

      expect(result.current.result?.range).toBe(0);
      expect(result.current.result?.minimum).toBe(15);
      expect(result.current.result?.maximum).toBe(15);
      expect(result.current.result?.count).toBe(1);
    });

    it('should handle empty input', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      act(() => {
        result.current.calculateRange('');
      });

      expect(result.current.result).toBeNull();
    });

    it('should handle invalid inputs', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      act(() => {
        result.current.calculateRange('abc, def');
      });

      expect(result.current.result?.count).toBe(0);
      expect(result.current.result?.steps[0]).toContain('No valid numbers');
    });
  });

  describe('User Mode Specific Features', () => {
    it('should provide research mode features', () => {
      const { result } = renderHook(() => useRangeCalculation('research', 2));

      act(() => {
        result.current.calculateRange('45.2, 47.8, 44.1, 46.9, 45.7, 48.3, 44.6, 47.1, 45.9, 46.5');
      });

      expect(result.current.result?.interquartileRange).toBeDefined();
      expect(result.current.result?.quartiles).toBeDefined();
      expect(result.current.result?.outliers).toBeDefined();
      
      // Check quartiles calculation
      expect(result.current.result?.quartiles?.q1).toBeDefined();
      expect(result.current.result?.quartiles?.q2).toBeDefined();
      expect(result.current.result?.quartiles?.q3).toBeDefined();
    });

    it('should provide teacher mode features', () => {
      const { result } = renderHook(() => useRangeCalculation('teacher', 2));

      act(() => {
        result.current.calculateRange('95, 87, 92, 78, 89, 94, 81, 88, 90, 85');
      });

      expect(result.current.result?.gradeDistribution).toBeDefined();
      expect(result.current.result?.spreadAnalysis).toBeDefined();
      
      // Check grade distribution
      const distribution = result.current.result?.gradeDistribution;
      expect(distribution?.['A (90-100)']).toBeGreaterThan(0);
      expect(distribution?.['B (80-89)']).toBeGreaterThan(0);
    });
  });

  describe('Data Parsing', () => {
    it('should parse comma-separated values', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      const parsed = result.current.parseInput('1, 2, 3, 4, 5');
      expect(parsed.validNumbers).toEqual([1, 2, 3, 4, 5]);
      expect(parsed.invalidEntries).toEqual([]);
    });

    it('should parse space-separated values', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      const parsed = result.current.parseInput('1 2 3 4 5');
      expect(parsed.validNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should parse newline-separated values', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      const parsed = result.current.parseInput('1\n2\n3\n4\n5');
      expect(parsed.validNumbers).toEqual([1, 2, 3, 4, 5]);
    });

    it('should handle teacher mode grade validation', () => {
      const { result } = renderHook(() => useRangeCalculation('teacher', 2));

      const parsed = result.current.parseInput('95, 200, 85'); // 200 is invalid
      expect(parsed.validNumbers).toEqual([95, 85]);
      expect(parsed.invalidEntries).toContain('200');
    });
  });

  describe('Load Examples', () => {
    it('should load student mode example', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      const example = result.current.loadExample();
      expect(example).toBe('12, 15, 8, 22, 18, 7, 25, 14, 19, 11');
    });

    it('should load teacher mode example', () => {
      const { result } = renderHook(() => useRangeCalculation('teacher', 2));

      const example = result.current.loadExample();
      expect(example).toContain('95, 87, 92');
    });

    it('should load research mode example', () => {
      const { result } = renderHook(() => useRangeCalculation('research', 2));

      const example = result.current.loadExample();
      expect(example).toContain('45.2, 47.8');
    });
  });

  describe('Clear Results', () => {
    it('should clear results', () => {
      const { result } = renderHook(() => useRangeCalculation('student', 2));

      act(() => {
        result.current.calculateRange('1, 2, 3, 4, 5');
      });

      expect(result.current.result).not.toBeNull();

      act(() => {
        result.current.clearResults();
      });

      expect(result.current.result).toBeNull();
    });
  });
});