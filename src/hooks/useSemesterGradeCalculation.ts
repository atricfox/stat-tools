/**
 * useSemesterGradeCalculation - Hook for semester grade calculation
 * Handles multiple courses with credits and grade conversion
 */

import { useState, useMemo, useCallback } from 'react';
import { calculateSemesterGPA, convertGradeToPoints } from '@/lib/gradeCalculations';
import type {
  Course,
  SemesterCalculationOptions,
  SemesterGradeResult,
  GradingScale
} from '@/types/education';

interface UseSemesterGradeCalculationProps {
  initialCourses?: Course[];
  initialGradingScale?: GradingScale;
  autoCalculate?: boolean;
}

interface UseSemesterGradeCalculationReturn {
  // State
  courses: Course[];
  gradingScale: GradingScale;
  
  // Results
  result: SemesterGradeResult | null;
  isCalculating: boolean;
  error: string | null;
  
  // Actions
  setCourses: (courses: Course[]) => void;
  addCourse: () => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  setGradingScale: (scale: GradingScale) => void;
  calculate: () => void;
  reset: () => void;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  
  // Utilities
  totalCredits: number;
  courseCount: number;
  canCalculate: boolean;
}

export default function useSemesterGradeCalculation({
  initialCourses = [],
  initialGradingScale = '4.0',
  autoCalculate = true
}: UseSemesterGradeCalculationProps = {}): UseSemesterGradeCalculationReturn {
  
  // State management
  const [courses, setCoursesState] = useState<Course[]>(initialCourses);
  const [gradingScale, setGradingScaleState] = useState<GradingScale>(initialGradingScale);
  const [result, setResult] = useState<SemesterGradeResult | null>(null);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Validation logic
  const validationErrors = useMemo(() => {
    const errors: string[] = [];
    
    if (courses.length === 0) {
      errors.push('Please add at least one course');
      return errors;
    }

    courses.forEach((course, index) => {
      if (!course.name || course.name.trim() === '') {
        errors.push(`Course ${index + 1}: Please enter course name`);
      }

      if (course.credits <= 0 || course.credits > 20) {
        errors.push(`Course ${index + 1}: Credits must be between 0.1-20`);
      }

      // Validate grade based on grading scale
      if (gradingScale === 'percentage') {
        const gradeNum = typeof course.grade === 'string' ? parseFloat(course.grade) : course.grade;
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
          errors.push(`Course ${index + 1}: Grade must be between 0-100`);
        }
      } else if (gradingScale === '4.0') {
        if (typeof course.grade === 'string') {
          const validGrades = ['A+', 'A', 'A-', 'B+', 'B', 'B-', 'C+', 'C', 'C-', 'D+', 'D', 'D-', 'F'];
          if (!validGrades.includes(course.grade)) {
            errors.push(`Course ${index + 1}: Please enter a valid letter grade (A+ ~ F)`);
          }
        } else {
          if (course.grade < 0 || course.grade > 4.0) {
            errors.push(`Course ${index + 1}: GPA must be between 0-4.0`);
          }
        }
      } else if (gradingScale === '5.0') {
        if (typeof course.grade === 'string') {
          const validGrades = ['A', 'B', 'C', 'D', 'F'];
          if (!validGrades.includes(course.grade)) {
            errors.push(`Course ${index + 1}: Please enter a valid letter grade (A, B, C, D, F)`);
          }
        } else {
          if (course.grade < 1 || course.grade > 5) {
            errors.push(`Course ${index + 1}: Grade must be between 1-5`);
          }
        }
      }
    });

    return errors;
  }, [courses, gradingScale]);

  const isValid = validationErrors.length === 0;

  // Calculate totals
  const { totalCredits, courseCount } = useMemo(() => {
    const includedCourses = courses.filter(course => course.isIncluded !== false);
    return {
      totalCredits: includedCourses.reduce((sum, course) => sum + course.credits, 0),
      courseCount: includedCourses.length
    };
  }, [courses]);

  const canCalculate = isValid && courses.length > 0;

  // Calculation function
  const calculate = useCallback(async () => {
    if (!canCalculate) {
      setError('Please check the validity of input data');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      // Convert grades to grade points for calculation
      const coursesWithPoints = courses.map(course => ({
        ...course,
        gradePoints: convertGradeToPoints(course.grade, gradingScale)
      }));

      // Simulate async calculation
      await new Promise(resolve => setTimeout(resolve, 100));

      const calculationResult = calculateSemesterGPA(coursesWithPoints, gradingScale);
      setResult(calculationResult);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during calculation';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [courses, gradingScale, canCalculate]);

  // Auto-calculate when inputs change
  useMemo(() => {
    if (autoCalculate && canCalculate) {
      const timer = setTimeout(() => {
        calculate();
      }, 300);
      
      return () => clearTimeout(timer);
    } else if (!canCalculate) {
      setResult(null);
    }
  }, [autoCalculate, canCalculate, calculate]);

  // Action handlers
  const setCourses = useCallback((newCourses: Course[]) => {
    setCoursesState(newCourses);
  }, []);

  const addCourse = useCallback(() => {
    const newCourse: Course = {
      id: `course-${Date.now()}`,
      name: '',
      grade: gradingScale === 'percentage' ? 0 : 
             gradingScale === '4.0' ? 'B' : 'C',
      credits: 3,
      gradePoints: 0,
      isIncluded: true
    };

    setCoursesState(prev => [...prev, newCourse]);
  }, [gradingScale]);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCoursesState(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCoursesState(prev => prev.filter(course => course.id !== id));
  }, []);

  const setGradingScale = useCallback((scale: GradingScale) => {
    setGradingScaleState(scale);
    // Update all courses to use appropriate default grades for new scale
    setCoursesState(prev => prev.map(course => ({
      ...course,
      grade: scale === 'percentage' ? 85 : 
             scale === '4.0' ? 'B' : 'C'
    })));
  }, []);

  const reset = useCallback(() => {
    setCoursesState(initialCourses);
    setGradingScaleState(initialGradingScale);
    setResult(null);
    setError(null);
  }, [initialCourses, initialGradingScale]);

  return {
    // State
    courses,
    gradingScale,
    
    // Results
    result,
    isCalculating,
    error,
    
    // Actions
    setCourses,
    addCourse,
    updateCourse,
    removeCourse,
    setGradingScale,
    calculate,
    reset,
    
    // Validation
    isValid,
    validationErrors,
    
    // Utilities
    totalCredits,
    courseCount,
    canCalculate
  };
}