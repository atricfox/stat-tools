/**
 * Hook for GPA calculations with multi-system support and educational features
 * Supports 4.0/4.3/4.5 grading systems, retake policies, and batch processing
 */

import { useState, useCallback, useMemo } from 'react';
import { 
  Course,
  GPAResult,
  UseGPACalculation,
  GradePointSystem,
  GPACalculatorState,
  ValidationResult,
  GPACalculationError
} from '@/types/gpa';

import {
  calculateGPA,
  validateCourses,
  validateCourse as validateSingleCourse,
  getGradePointSystem,
  createExampleCourses,
  DEFAULT_GRADE_SYSTEMS
} from '@/lib/gpaCalculation';

export const useGPACalculation = (): UseGPACalculation => {
  const [result, setResult] = useState<GPAResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);

  /**
   * Main calculation function
   */
  const calculate = useCallback(async (
    inputCourses: Course[], 
    system: GradePointSystem, 
    options: Partial<GPACalculatorState> = {}
  ) => {
    setIsCalculating(true);
    setError(null);

    try {
      // Add slight delay to show loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 100));

      const calculationResult = calculateGPA(inputCourses, system, options);
      setResult(calculationResult);
      
    } catch (err) {
      const errorMessage = err instanceof GPACalculationError ? 
        err.message : 'An unexpected error occurred during GPA calculation';
      setError(errorMessage);
      setResult(null);
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('GPA Calculation Error:', err);
      }
    } finally {
      setIsCalculating(false);
    }
  }, []);

  /**
   * Reset all calculation state
   */
  const reset = useCallback(() => {
    setResult(null);
    setError(null);
    setCourses([]);
  }, []);

  /**
   * Add a new course
   */
  const addCourse = useCallback((course: Omit<Course, 'id'>) => {
    const newCourse: Course = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...course
    };

    setCourses(prev => [...prev, newCourse]);
    return newCourse;
  }, []);

  /**
   * Remove a course by ID
   */
  const removeCourse = useCallback((courseId: string) => {
    setCourses(prev => prev.filter(course => course.id !== courseId));
  }, []);

  /**
   * Update a specific course
   */
  const updateCourse = useCallback((courseId: string, updates: Partial<Course>) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId ? { ...course, ...updates } : course
    ));
  }, []);

  /**
   * Validate a single course
   */
  const validateCourse = useCallback((course: Course): ValidationResult => {
    try {
      // Get default 4.0 system for basic validation
      const defaultSystem = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
      return validateSingleCourse(course, defaultSystem);
    } catch (err) {
      return {
        isValid: false,
        errors: [{
          field: 'general',
          message: err instanceof Error ? err.message : 'Validation failed',
          value: course,
          code: 'VALIDATION_ERROR'
        }],
        warnings: []
      };
    }
  }, []);

  /**
   * Load example courses for a specific grading system
   */
  const loadExample = useCallback((systemId: string) => {
    try {
      const examples = createExampleCourses(systemId);
      setCourses(examples);
      setError(null);
    } catch (err) {
      setError(`Failed to load examples: ${err instanceof Error ? err.message : 'Unknown error'}`);
    }
  }, []);

  /**
   * Clear all courses
   */
  const clearAll = useCallback(() => {
    setCourses([]);
    setResult(null);
    setError(null);
  }, []);

  /**
   * Batch add multiple courses
   */
  const addCourses = useCallback((newCourses: Omit<Course, 'id'>[]) => {
    const coursesWithIds = newCourses.map(course => ({
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...course
    }));

    setCourses(prev => [...prev, ...coursesWithIds]);
    return coursesWithIds;
  }, []);

  /**
   * Toggle course exclusion
   */
  const toggleCourseExclusion = useCallback((courseId: string) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, excluded: !course.excluded }
        : course
    ));
  }, []);

  /**
   * Mark course as retake
   */
  const markAsRetake = useCallback((courseId: string, isRetake: boolean = true) => {
    setCourses(prev => prev.map(course => 
      course.id === courseId 
        ? { ...course, isRetake }
        : course
    ));
  }, []);

  /**
   * Get course statistics
   */
  const courseStatistics = useMemo(() => {
    const totalCourses = courses.length;
    const includedCourses = courses.filter(c => !c.excluded).length;
    const excludedCourses = courses.filter(c => c.excluded).length;
    const retakes = courses.filter(c => c.isRetake).length;
    const totalCredits = courses
      .filter(c => !c.excluded)
      .reduce((sum, c) => sum + c.credits, 0);

    return {
      totalCourses,
      includedCourses,
      excludedCourses,
      retakes,
      totalCredits
    };
  }, [courses]);

  /**
   * Get validation summary for all courses
   */
  const validationSummary = useMemo(() => {
    if (courses.length === 0) {
      return {
        isValid: false,
        errorCount: 1,
        warningCount: 0,
        message: 'No courses added'
      };
    }

    let errorCount = 0;
    let warningCount = 0;
    const issues: string[] = [];

    courses.forEach((course, index) => {
      if (!course.name?.trim()) {
        errorCount++;
        issues.push(`Course ${index + 1}: Missing name`);
      }

      if (!course.credits || course.credits <= 0) {
        errorCount++;
        issues.push(`Course ${index + 1}: Invalid credits`);
      }

      if (course.credits > 6) {
        warningCount++;
        issues.push(`Course ${index + 1}: High credit hours`);
      }

      if (!course.grade?.trim()) {
        errorCount++;
        issues.push(`Course ${index + 1}: Missing grade`);
      }
    });

    return {
      isValid: errorCount === 0,
      errorCount,
      warningCount,
      message: issues.length > 0 ? issues.join('; ') : 'All courses valid'
    };
  }, [courses]);

  /**
   * Calculate with current courses automatically
   */
  const calculateWithCurrentCourses = useCallback(async (
    system: GradePointSystem, 
    options: Partial<GPACalculatorState> = {}
  ) => {
    if (courses.length > 0) {
      // Only include courses with all required fields
      const completeCourses = courses.filter(course => 
        course.name?.trim() && 
        course.grade?.trim() && 
        course.credits > 0
      );
      
      if (completeCourses.length > 0) {
        await calculate(completeCourses, system, options);
      } else {
        // Clear results if no complete courses
        setResult(null);
        setError(null);
      }
    }
  }, [courses, calculate, setResult, setError]);

  /**
   * Safe calculation that filters out incompatible grades
   */
  const calculateWithCompatibleCourses = useCallback(async (
    system: GradePointSystem, 
    options: Partial<GPACalculatorState> = {}
  ) => {
    if (courses.length === 0) return;

    // Filter out courses with incompatible grades or missing required fields
    const compatibleCourses = courses.filter(course => {
      // First check if course has required fields
      if (!course.name?.trim() || !course.grade?.trim() || course.credits <= 0) {
        return false;
      }
      
      try {
        // Test if the grade is valid for this system
        return system.mappings.some(mapping => 
          mapping.letterGrade === course.grade
        );
      } catch {
        return false;
      }
    });

    if (compatibleCourses.length > 0) {
      await calculate(compatibleCourses, system, options);
    } else {
      // No compatible courses found, clear results
      setResult(null);
      setError('No courses compatible with the selected grading system');
    }
  }, [courses, calculate, setResult, setError]);

  /**
   * Export courses data
   */
  const exportCourses = useCallback((format: 'json' | 'csv' = 'json') => {
    if (format === 'json') {
      return JSON.stringify(courses, null, 2);
    }
    
    // CSV format
    const headers = 'Name,Credits,Grade,Semester,Excluded,Retake';
    const rows = courses.map(course => 
      `"${course.name}",${course.credits},"${course.grade}","${course.semester || ''}",${course.excluded || false},${course.isRetake || false}`
    );
    
    return [headers, ...rows].join('\n');
  }, [courses]);

  /**
   * Import courses from data
   */
  const importCourses = useCallback((data: string, format: 'json' | 'csv' = 'json') => {
    try {
      let importedCourses: Omit<Course, 'id'>[];

      if (format === 'json') {
        importedCourses = JSON.parse(data);
      } else {
        // Parse CSV
        const lines = data.split('\n').filter(line => line.trim());
        const [header, ...rows] = lines;
        
        importedCourses = rows.map(row => {
          const values = row.split(',').map(v => v.replace(/"/g, '').trim());
          return {
            name: values[0] || '',
            credits: parseInt(values[1]) || 0,
            grade: values[2] || '',
            semester: values[3] || '',
            excluded: values[4] === 'true',
            isRetake: values[5] === 'true'
          };
        });
      }

      // Validate imported data
      if (!Array.isArray(importedCourses)) {
        throw new Error('Invalid data format');
      }

      const validCourses = importedCourses.filter(course => 
        course.name && course.credits > 0 && course.grade
      );

      if (validCourses.length === 0) {
        throw new Error('No valid courses found in imported data');
      }

      // Replace current courses
      setCourses(validCourses.map(course => ({
        id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        ...course
      })));

      setError(null);
      return validCourses.length;

    } catch (err) {
      setError(`Import failed: ${err instanceof Error ? err.message : 'Unknown error'}`);
      return 0;
    }
  }, []);

  return {
    result,
    isCalculating,
    error,
    calculate,
    reset,
    addCourse,
    removeCourse,
    updateCourse,
    validateCourse,
    loadExample,
    clearAll,
    
    // Extended functionality
    courses,
    addCourses,
    toggleCourseExclusion,
    markAsRetake,
    courseStatistics,
    validationSummary,
    calculateWithCurrentCourses,
    calculateWithCompatibleCourses,
    exportCourses,
    importCourses
  };
};

export default useGPACalculation;