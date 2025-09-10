/**
 * Test suite for useFinalGradeCalculation hook
 */

import { renderHook, act } from '@testing-library/react';
import useFinalGradeCalculation from '../useFinalGradeCalculation';
import type { GradeItem } from '@/types/education';

const mockGrades: GradeItem[] = [
  {
    id: '1',
    name: '期中考试',
    score: 85,
    weight: 30,
    category: 'exam'
  },
  {
    id: '2',
    name: '作业平均',
    score: 92,
    weight: 20,
    category: 'homework'
  }
];

describe('useFinalGradeCalculation Hook', () => {
  beforeEach(() => {
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
  });

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    expect(result.current.grades).toEqual([]);
    expect(result.current.finalExamWeight).toBe(50);
    expect(result.current.targetGrade).toBe(85);
    expect(result.current.gradingScale).toBe('percentage');
    expect(result.current.result).toBeNull();
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should initialize with provided initial values', () => {
    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: mockGrades,
        initialFinalWeight: 40,
        initialTargetGrade: 90,
        initialGradingScale: '4.0'
      })
    );

    expect(result.current.grades).toEqual(mockGrades);
    expect(result.current.finalExamWeight).toBe(40);
    expect(result.current.targetGrade).toBe(90);
    expect(result.current.gradingScale).toBe('4.0');
  });

  it('should update grades correctly', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    act(() => {
      result.current.setGrades(mockGrades);
    });

    expect(result.current.grades).toEqual(mockGrades);
  });

  it('should update final exam weight with clamping', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    act(() => {
      result.current.setFinalExamWeight(150); // Should clamp to 100
    });
    expect(result.current.finalExamWeight).toBe(100);

    act(() => {
      result.current.setFinalExamWeight(-10); // Should clamp to 1
    });
    expect(result.current.finalExamWeight).toBe(1);
  });

  it('should update target grade with clamping', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    act(() => {
      result.current.setTargetGrade(150); // Should clamp to 100
    });
    expect(result.current.targetGrade).toBe(100);

    act(() => {
      result.current.setTargetGrade(-10); // Should clamp to 0
    });
    expect(result.current.targetGrade).toBe(0);
  });

  it('should calculate current weighted score correctly', () => {
    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: mockGrades,
        autoCalculate: false
      })
    );

    // Current weighted score should be based on grades
    // (85 * 30 + 92 * 20) / (30 + 20) = (2550 + 1840) / 50 = 87.8
    expect(result.current.currentWeightedScore).toBeCloseTo(87.8, 1);
    expect(result.current.remainingWeight).toBe(50); // 100 - 30 - 20 = 50
  });

  it('should validate inputs correctly', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    // Initially invalid due to no grades
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors).toContain('请至少添加一个成绩项目');

    act(() => {
      result.current.setGrades(mockGrades);
    });

    expect(result.current.isValid).toBe(true);
    expect(result.current.validationErrors).toEqual([]);
  });

  it('should handle weight validation errors', () => {
    const invalidGrades: GradeItem[] = [
      { id: '1', name: '测试', score: 85, weight: 70 },
      { id: '2', name: '作业', score: 92, weight: 40 }
    ];

    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: invalidGrades,
        initialFinalWeight: 30,
        autoCalculate: false
      })
    );

    // Total weight would be 70 + 40 + 30 = 140% > 100%
    expect(result.current.isValid).toBe(false);
    expect(result.current.validationErrors.some(error => 
      error.includes('超过100%')
    )).toBe(true);
  });

  it('should perform calculation manually', async () => {
    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: mockGrades,
        initialFinalWeight: 50,
        initialTargetGrade: 90,
        autoCalculate: false
      })
    );

    act(() => {
      result.current.calculate();
    });

    expect(result.current.isCalculating).toBe(true);

    // Fast forward the async timeout
    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.isCalculating).toBe(false);
    expect(result.current.result).not.toBeNull();
    expect(result.current.result?.isAchievable).toBe(true);
    expect(result.current.result?.requiredScore).toBeGreaterThan(0);
  });

  it('should auto-calculate when enabled', async () => {
    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: mockGrades,
        autoCalculate: true
      })
    );

    // Auto-calculation should trigger after debounce
    await act(async () => {
      jest.advanceTimersByTime(400); // Wait for debounce + calculation
    });

    expect(result.current.result).not.toBeNull();
  });

  it('should reset to initial values', () => {
    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: mockGrades,
        initialFinalWeight: 40,
        initialTargetGrade: 95
      })
    );

    // Make changes
    act(() => {
      result.current.setGrades([]);
      result.current.setFinalExamWeight(60);
      result.current.setTargetGrade(80);
    });

    // Reset
    act(() => {
      result.current.reset();
    });

    expect(result.current.grades).toEqual(mockGrades);
    expect(result.current.finalExamWeight).toBe(40);
    expect(result.current.targetGrade).toBe(95);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should handle calculation errors gracefully', async () => {
    const invalidGrades: GradeItem[] = [
      { id: '1', name: '', score: -10, weight: 150 } // Invalid grade
    ];

    const { result } = renderHook(() =>
      useFinalGradeCalculation({
        initialGrades: invalidGrades,
        autoCalculate: false
      })
    );

    act(() => {
      result.current.calculate();
    });

    await act(async () => {
      jest.advanceTimersByTime(200);
    });

    expect(result.current.error).toBe('请检查输入数据的有效性');
    expect(result.current.result).toBeNull();
  });

  it('should update grading scale correctly', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    act(() => {
      result.current.setGradingScale('4.0');
    });

    expect(result.current.gradingScale).toBe('4.0');
  });

  it('should determine canCalculate status correctly', () => {
    const { result } = renderHook(() => useFinalGradeCalculation());

    // Initially can't calculate - no grades
    expect(result.current.canCalculate).toBe(false);

    act(() => {
      result.current.setGrades(mockGrades);
    });

    // Now can calculate
    expect(result.current.canCalculate).toBe(true);

    // Set an invalid target grade instead since weight gets clamped
    act(() => {
      result.current.setTargetGrade(-5); // This will be clamped to 0, which is invalid
    });

    // Can't calculate with invalid target grade (0 is invalid)
    expect(result.current.canCalculate).toBe(false);
  });
});