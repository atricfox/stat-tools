/**
 * useCumulativeGPACalculation - Hook for cumulative GPA calculation
 * Handles multiple semesters with grade conversion and competitive analysis
 */

import { useState, useMemo, useCallback } from 'react';
import { calculateCumulativeGPA, convertGradeToPoints } from '@/lib/gradeCalculations';
import type {
  Course,
  CumulativeGPAOptions,
  CumulativeGPAResult,
  GradingScale
} from '@/types/education';

interface UseCumulativeGPACalculationProps {
  initialCourses?: Course[];
  initialSourceGradingSystem?: GradingScale;
  initialTargetGradingSystem?: GradingScale;
  autoCalculate?: boolean;
}

interface UseCumulativeGPACalculationReturn {
  // State
  courses: Course[];
  sourceGradingSystem: GradingScale;
  targetGradingSystem: GradingScale;
  
  // Results
  result: CumulativeGPAResult | null;
  isCalculating: boolean;
  error: string | null;
  
  // Actions
  setCourses: (courses: Course[]) => void;
  addCourse: () => void;
  updateCourse: (id: string, updates: Partial<Course>) => void;
  removeCourse: (id: string) => void;
  setSourceGradingSystem: (scale: GradingScale) => void;
  setTargetGradingSystem: (scale: GradingScale) => void;
  calculate: () => void;
  reset: () => void;
  
  // Bulk operations
  addSemester: (semesterName: string) => void;
  importCoursesFromCSV: (csvData: string) => void;
  
  // Validation
  isValid: boolean;
  validationErrors: string[];
  
  // Utilities
  totalCredits: number;
  courseCount: number;
  semesterCount: number;
  canCalculate: boolean;
}

export default function useCumulativeGPACalculation({
  initialCourses = [],
  initialSourceGradingSystem = '4.0',
  initialTargetGradingSystem = '4.0',
  autoCalculate = true
}: UseCumulativeGPACalculationProps = {}): UseCumulativeGPACalculationReturn {
  
  // State management
  const [courses, setCoursesState] = useState<Course[]>(initialCourses);
  const [sourceGradingSystem, setSourceGradingSystemState] = useState<GradingScale>(initialSourceGradingSystem);
  const [targetGradingSystem, setTargetGradingSystemState] = useState<GradingScale>(initialTargetGradingSystem);
  const [result, setResult] = useState<CumulativeGPAResult | null>(null);
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

      // Validate grade based on source grading system
      if (sourceGradingSystem === 'percentage') {
        const gradeNum = typeof course.grade === 'string' ? parseFloat(course.grade) : course.grade;
        if (isNaN(gradeNum) || gradeNum < 0 || gradeNum > 100) {
          errors.push(`Course ${index + 1}: Grade must be between 0-100`);
        }
      } else if (sourceGradingSystem === '4.0') {
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
      } else if (sourceGradingSystem === '5.0') {
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

      // Validate semester field if provided
      if (course.semester && typeof course.semester !== 'string') {
        errors.push(`Course ${index + 1}: Invalid semester format`);
      }
    });

    return errors;
  }, [courses, sourceGradingSystem]);

  const isValid = validationErrors.length === 0;

  // Calculate statistics
  const { totalCredits, courseCount, semesterCount } = useMemo(() => {
    const includedCourses = courses.filter(course => course.isIncluded !== false);
    const semesters = new Set(includedCourses.map(course => course.semester).filter(Boolean));
    
    return {
      totalCredits: includedCourses.reduce((sum, course) => sum + course.credits, 0),
      courseCount: includedCourses.length,
      semesterCount: semesters.size
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
        gradePoints: convertGradeToPoints(course.grade, targetGradingSystem)
      }));

      // Simulate async calculation
      await new Promise(resolve => setTimeout(resolve, 150));

      const calculationResult = calculateCumulativeGPA(
        coursesWithPoints, 
        sourceGradingSystem, 
        targetGradingSystem
      );
      
      setResult(calculationResult);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred during calculation';
      setError(errorMessage);
      setResult(null);
    } finally {
      setIsCalculating(false);
    }
  }, [courses, sourceGradingSystem, targetGradingSystem, canCalculate]);

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
      grade: sourceGradingSystem === 'percentage' ? 85 : 
             sourceGradingSystem === '4.0' ? 'B' : 'C',
      credits: 3,
      semester: '',
      isIncluded: true
    };

    setCoursesState(prev => [...prev, newCourse]);
  }, [sourceGradingSystem]);

  const updateCourse = useCallback((id: string, updates: Partial<Course>) => {
    setCoursesState(prev => prev.map(course => 
      course.id === id ? { ...course, ...updates } : course
    ));
  }, []);

  const removeCourse = useCallback((id: string) => {
    setCoursesState(prev => prev.filter(course => course.id !== id));
  }, []);

  const setSourceGradingSystem = useCallback((scale: GradingScale) => {
    setSourceGradingSystemState(scale);
    // Update all courses to use appropriate default grades for new scale
    setCoursesState(prev => prev.map(course => ({
      ...course,
      grade: scale === 'percentage' ? 85 : 
             scale === '4.0' ? 'B' : 'C'
    })));
  }, []);

  const setTargetGradingSystem = useCallback((scale: GradingScale) => {
    setTargetGradingSystemState(scale);
  }, []);

  const addSemester = useCallback((semesterName: string) => {
    const semesterCourses: Course[] = [
      {
        id: `course-${Date.now()}-1`,
        name: '',
        grade: sourceGradingSystem === 'percentage' ? 85 : 
               sourceGradingSystem === '4.0' ? 'B' : 'C',
        credits: 3,
        semester: semesterName,
        isIncluded: true
      }
    ];

    setCoursesState(prev => [...prev, ...semesterCourses]);
  }, [sourceGradingSystem]);

  const importCoursesFromCSV = useCallback((csvData: string) => {
    try {
      const lines = csvData.trim().split('\n');
      const headers = lines[0].toLowerCase().split(',');
      
      const nameIndex = headers.findIndex(h => h.includes('name') || h.includes('course'));
      const gradeIndex = headers.findIndex(h => h.includes('grade') || h.includes('score'));
      const creditsIndex = headers.findIndex(h => h.includes('credit') || h.includes('credits'));
      const semesterIndex = headers.findIndex(h => h.includes('semester') || h.includes('term'));

      if (nameIndex === -1 || gradeIndex === -1 || creditsIndex === -1) {
        throw new Error('CSV file must contain course name, grade, and credits columns');
      }

      const newCourses: Course[] = lines.slice(1).map((line, index) => {
        const values = line.split(',');
        return {
          id: `imported-${Date.now()}-${index}`,
          name: values[nameIndex]?.trim() || '',
          grade: sourceGradingSystem === 'percentage' 
            ? parseFloat(values[gradeIndex]) || 0
            : values[gradeIndex]?.trim() || 'C',
          credits: parseFloat(values[creditsIndex]) || 3,
          semester: semesterIndex !== -1 ? values[semesterIndex]?.trim() : '',
          isIncluded: true
        };
      }).filter(course => course.name); // Filter out empty rows

      setCoursesState(prev => [...prev, ...newCourses]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'CSV import failed');
    }
  }, [sourceGradingSystem]);

  const reset = useCallback(() => {
    setCoursesState(initialCourses);
    setSourceGradingSystemState(initialSourceGradingSystem);
    setTargetGradingSystemState(initialTargetGradingSystem);
    setResult(null);
    setError(null);
  }, [initialCourses, initialSourceGradingSystem, initialTargetGradingSystem]);

  return {
    // State
    courses,
    sourceGradingSystem,
    targetGradingSystem,
    
    // Results
    result,
    isCalculating,
    error,
    
    // Actions
    setCourses,
    addCourse,
    updateCourse,
    removeCourse,
    setSourceGradingSystem,
    setTargetGradingSystem,
    calculate,
    reset,
    
    // Bulk operations
    addSemester,
    importCoursesFromCSV,
    
    // Validation
    isValid,
    validationErrors,
    
    // Utilities
    totalCredits,
    courseCount,
    semesterCount,
    canCalculate
  };
}