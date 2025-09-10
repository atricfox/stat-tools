/**
 * Test suite for grade calculation functions
 * Following TDD approach - tests first, then implementation
 */

import {
  calculateWeightedAverage,
  calculateRequiredFinalScore,
  convertGradeToPoints,
  calculateSemesterGPA,
  calculateCumulativeGPA,
  validateGradeInputs
} from '../gradeCalculations';

import type {
  GradeItem,
  Course,
  FinalGradeCalculationOptions,
  GradingScale
} from '@/types/education';

describe('calculateWeightedAverage', () => {
  it('should calculate correct weighted average for simple grades', () => {
    const grades: GradeItem[] = [
      { id: '1', name: '期中考试', score: 85, weight: 40 },
      { id: '2', name: '作业', score: 92, weight: 30 },
      { id: '3', name: '出勤', score: 95, weight: 30 }
    ];

    const result = calculateWeightedAverage(grades);
    // (85*0.4 + 92*0.3 + 95*0.3) = 34 + 27.6 + 28.5 = 90.1
    expect(result).toBeCloseTo(90.1, 1);
  });

  it('should handle zero weights correctly', () => {
    const grades: GradeItem[] = [
      { id: '1', name: '测试', score: 100, weight: 0 },
      { id: '2', name: '期末', score: 80, weight: 100 }
    ];

    const result = calculateWeightedAverage(grades);
    expect(result).toBe(80);
  });

  it('should handle empty grades array', () => {
    const result = calculateWeightedAverage([]);
    expect(result).toBe(0);
  });

  it('should normalize weights that don\'t sum to 100', () => {
    const grades: GradeItem[] = [
      { id: '1', name: '考试1', score: 80, weight: 60 },
      { id: '2', name: '考试2', score: 90, weight: 40 }
    ];

    const result = calculateWeightedAverage(grades, true);
    // Weights sum to 100, should be (80*0.6 + 90*0.4) = 48 + 36 = 84
    expect(result).toBeCloseTo(84, 1);
  });
});

describe('calculateRequiredFinalScore', () => {
  it('should calculate required final score correctly', () => {
    const currentGrades: GradeItem[] = [
      { id: '1', name: '期中考试', score: 85, weight: 30 },
      { id: '2', name: '作业平均', score: 92, weight: 20 }
    ];
    
    const options: FinalGradeCalculationOptions = {
      currentGrades,
      finalExamWeight: 50, // 50% final exam
      targetGrade: 90,
      gradeScale: 'percentage'
    };

    const result = calculateRequiredFinalScore(options);
    
    // Current weighted score: 85*0.3 + 92*0.2 = 25.5 + 18.4 = 43.9
    // Need: 90 = 43.9 + final*0.5
    // final = (90 - 43.9) / 0.5 = 92.2
    expect(result.requiredScore).toBeCloseTo(92.2, 1);
    expect(result.isAchievable).toBe(true);
    expect(result.difficultyLevel).toBe('moderate');
  });

  it('should identify impossible targets', () => {
    const currentGrades: GradeItem[] = [
      { id: '1', name: '期中', score: 60, weight: 70 }
    ];
    
    const options: FinalGradeCalculationOptions = {
      currentGrades,
      finalExamWeight: 30,
      targetGrade: 95
    };

    const result = calculateRequiredFinalScore(options);
    
    // Current: 60*0.7 = 42, need 95, final weight 30%
    // Required: (95 - 42) / 0.3 = 176.67 (impossible)
    expect(result.isAchievable).toBe(false);
    expect(result.difficultyLevel).toBe('impossible');
    expect(result.maxPossibleGrade).toBeCloseTo(72, 1); // 42 + 100*0.3
  });

  it('should handle easy targets', () => {
    const currentGrades: GradeItem[] = [
      { id: '1', name: '期中', score: 95, weight: 60 }
    ];
    
    const options: FinalGradeCalculationOptions = {
      currentGrades,
      finalExamWeight: 40,
      targetGrade: 85
    };

    const result = calculateRequiredFinalScore(options);
    
    // Current: 95*0.6 = 57, need 85, final weight 40%
    // Required: (85 - 57) / 0.4 = 70
    expect(result.requiredScore).toBeCloseTo(70, 1);
    expect(result.difficultyLevel).toBe('easy');
    expect(result.isAchievable).toBe(true);
  });
});

describe('convertGradeToPoints', () => {
  it('should convert 4.0 scale letter grades correctly', () => {
    expect(convertGradeToPoints('A', '4.0')).toBe(4.0);
    expect(convertGradeToPoints('A-', '4.0')).toBe(3.7);
    expect(convertGradeToPoints('B+', '4.0')).toBe(3.3);
    expect(convertGradeToPoints('B', '4.0')).toBe(3.0);
    expect(convertGradeToPoints('F', '4.0')).toBe(0.0);
  });

  it('should convert percentage grades correctly', () => {
    expect(convertGradeToPoints(95, 'percentage')).toBe(95);
    expect(convertGradeToPoints(87.5, 'percentage')).toBe(87.5);
    expect(convertGradeToPoints(0, 'percentage')).toBe(0);
  });

  it('should convert 5.0 scale grades correctly', () => {
    expect(convertGradeToPoints('A', '5.0')).toBe(5.0);
    expect(convertGradeToPoints('B', '5.0')).toBe(4.0);
    expect(convertGradeToPoints('C', '5.0')).toBe(3.0);
    expect(convertGradeToPoints('F', '5.0')).toBe(1.0);
  });

  it('should handle invalid grades gracefully', () => {
    expect(convertGradeToPoints('Z', '4.0')).toBe(0);
    expect(convertGradeToPoints(-10, 'percentage')).toBe(0);
    expect(convertGradeToPoints(110, 'percentage')).toBe(100);
  });
});

describe('calculateSemesterGPA', () => {
  it('should calculate semester GPA correctly', () => {
    const courses: Course[] = [
      { id: '1', name: '数学', grade: 'A', credits: 4, gradePoints: 4.0 },
      { id: '2', name: '物理', grade: 'B+', credits: 3, gradePoints: 3.3 },
      { id: '3', name: '化学', grade: 'A-', credits: 3, gradePoints: 3.7 }
    ];

    const result = calculateSemesterGPA(courses, '4.0');
    
    // Total grade points: 4*4.0 + 3*3.3 + 3*3.7 = 16 + 9.9 + 11.1 = 37
    // Total credits: 4 + 3 + 3 = 10
    // GPA: 37/10 = 3.7
    expect(result.semesterGPA).toBeCloseTo(3.7, 2);
    expect(result.totalCredits).toBe(10);
    expect(result.totalGradePoints).toBeCloseTo(37, 1);
    expect(result.courseCount).toBe(3);
  });

  it('should handle courses with isIncluded flag', () => {
    const courses: Course[] = [
      { id: '1', name: '数学', grade: 'A', credits: 4, gradePoints: 4.0, isIncluded: true },
      { id: '2', name: '体育', grade: 'A', credits: 1, gradePoints: 4.0, isIncluded: false },
      { id: '3', name: '英语', grade: 'B', credits: 3, gradePoints: 3.0, isIncluded: true }
    ];

    const result = calculateSemesterGPA(courses, '4.0');
    
    // Only included courses: 数学 + 英语
    // Total grade points: 4*4.0 + 3*3.0 = 16 + 9 = 25
    // Total credits: 4 + 3 = 7
    // GPA: 25/7 ≈ 3.57
    expect(result.semesterGPA).toBeCloseTo(3.57, 2);
    expect(result.totalCredits).toBe(7);
    expect(result.courseCount).toBe(2); // Only included courses
  });
});

describe('calculateCumulativeGPA', () => {
  it('should calculate cumulative GPA from multiple semesters', () => {
    const courses: Course[] = [
      // Semester 1
      { id: '1', name: '数学1', grade: 'A', credits: 4, gradePoints: 4.0, semester: '2023-1' },
      { id: '2', name: '物理1', grade: 'B+', credits: 3, gradePoints: 3.3, semester: '2023-1' },
      // Semester 2
      { id: '3', name: '数学2', grade: 'A-', credits: 4, gradePoints: 3.7, semester: '2023-2' },
      { id: '4', name: '化学1', grade: 'B', credits: 3, gradePoints: 3.0, semester: '2023-2' }
    ];

    const result = calculateCumulativeGPA(courses, '4.0', '4.0');
    
    // Total grade points: 4*4.0 + 3*3.3 + 4*3.7 + 3*3.0 = 16 + 9.9 + 14.8 + 9 = 49.7
    // Total credits: 4 + 3 + 4 + 3 = 14
    // Cumulative GPA: 49.7/14 ≈ 3.55
    expect(result.cumulativeGPA).toBeCloseTo(3.55, 2);
    expect(result.totalCredits).toBe(14);
    expect(result.courseCount).toBe(4);
  });

  it('should provide competitive analysis', () => {
    const courses: Course[] = [
      { id: '1', name: '课程1', grade: 'A', credits: 3, gradePoints: 4.0 },
      { id: '2', name: '课程2', grade: 'A', credits: 3, gradePoints: 4.0 },
      { id: '3', name: '课程3', grade: 'A-', credits: 3, gradePoints: 3.7 }
    ];

    const result = calculateCumulativeGPA(courses, '4.0', '4.0');
    
    // GPA: (3*4.0 + 3*4.0 + 3*3.7) / 9 = 35.1/9 = 3.9
    expect(result.cumulativeGPA).toBeCloseTo(3.9, 1);
    expect(result.competitiveAnalysis.competitiveLevel).toBe('excellent');
    expect(result.competitiveAnalysis.percentile).toBeGreaterThan(90);
  });
});

describe('validateGradeInputs', () => {
  it('should validate grade items correctly', () => {
    const validGrades: GradeItem[] = [
      { id: '1', name: '测试', score: 85, weight: 50 },
      { id: '2', name: '作业', score: 92, weight: 50 }
    ];

    expect(() => validateGradeInputs(validGrades)).not.toThrow();
  });

  it('should reject invalid scores', () => {
    const invalidGrades: GradeItem[] = [
      { id: '1', name: '测试', score: -5, weight: 50 },
      { id: '2', name: '作业', score: 105, weight: 50 }
    ];

    expect(() => validateGradeInputs(invalidGrades)).toThrow('Invalid grade score');
  });

  it('should reject invalid weights', () => {
    const invalidGrades: GradeItem[] = [
      { id: '1', name: '测试', score: 85, weight: -10 },
      { id: '2', name: '作业', score: 92, weight: 110 }
    ];

    expect(() => validateGradeInputs(invalidGrades)).toThrow('Invalid weight');
  });

  it('should validate weight totals', () => {
    const grades: GradeItem[] = [
      { id: '1', name: '测试', score: 85, weight: 30 },
      { id: '2', name: '作业', score: 92, weight: 30 }
    ];

    // Weights total 60%, should be invalid without normalization
    expect(() => validateGradeInputs(grades, false)).toThrow('Total weights must equal 100%');
    
    // Should pass with normalization enabled
    expect(() => validateGradeInputs(grades, true)).not.toThrow();
  });
});