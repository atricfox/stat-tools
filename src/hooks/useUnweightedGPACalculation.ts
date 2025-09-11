/**
 * React Hook for Unweighted GPA Calculations
 * Manages state and provides calculation functionality
 */

import { useState, useCallback, useEffect } from 'react';
import { 
  UnweightedCourse, 
  UnweightedGPAResult, 
  UnweightedGradingSystem,
  UseUnweightedGPACalculation,
  ValidationResult,
  UnweightedGPACalculationError
} from '@/types/unweightedGpa';

import {
  calculateUnweightedGPA,
  validateCourse,
  createUnweightedExampleCourses,
  exportToCSV,
  exportToJSON,
  UNWEIGHTED_GRADING_SYSTEMS
} from '@/lib/unweightedGpaCalculation';

export function useUnweightedGPACalculation(
  initialGradingSystem: UnweightedGradingSystem = UNWEIGHTED_GRADING_SYSTEMS['standard-4.0'],
  initialPrecision: number = 2
): UseUnweightedGPACalculation {
  // Core state
  const [result, setResult] = useState<UnweightedGPAResult | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [courses, setCourses] = useState<UnweightedCourse[]>([]);

  /**
   * Main calculation function
   */
  const calculate = useCallback(async () => {
    setIsCalculating(true);
    setError(null);

    try {
      // Add small delay to show loading state for better UX
      await new Promise(resolve => setTimeout(resolve, 50));
      
      const calculationResult = calculateUnweightedGPA(
        courses, 
        initialGradingSystem, 
        initialPrecision
      );
      
      setResult(calculationResult);
    } catch (err) {
      const errorMessage = err instanceof UnweightedGPACalculationError ? 
        err.message : 'An unexpected error occurred during GPA calculation';
      setError(errorMessage);
      setResult(null);
      
      // Log error for debugging in development
      if (process.env.NODE_ENV === 'development') {
        console.error('Unweighted GPA Calculation Error:', err);
      }
    } finally {
      setIsCalculating(false);
    }
  }, [courses, initialGradingSystem, initialPrecision]);

  /**
   * Auto-calculate when courses or settings change
   */
  useEffect(() => {
    calculate();
  }, [calculate]);

  /**
   * Add a new course
   */
  const addCourse = useCallback((courseData: Omit<UnweightedCourse, 'id'>) => {
    // Validate before adding
    const validation = validateCourse(courseData, initialGradingSystem);
    if (!validation.isValid) {
      const errorMessages = validation.errors.map(e => e.message).join(', ');
      setError(`Validation failed: ${errorMessages}`);
      return;
    }

    const newCourse: UnweightedCourse = {
      id: `course-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...courseData
    };
    
    setCourses(prev => [...prev, newCourse]);
    setError(null); // Clear any previous errors
  }, [initialGradingSystem]);

  /**
   * Update an existing course
   */
  const updateCourse = useCallback((id: string, updates: Partial<UnweightedCourse>) => {
    setCourses(prev => prev.map(course => {
      if (course.id === id) {
        const updatedCourse = { ...course, ...updates };
        
        // Validate updated course
        const validation = validateCourse(updatedCourse, initialGradingSystem);
        if (!validation.isValid) {
          const errorMessages = validation.errors.map(e => e.message).join(', ');
          setError(`Validation failed: ${errorMessages}`);
          return course; // Return original if validation fails
        }
        
        setError(null); // Clear any previous errors
        return updatedCourse;
      }
      return course;
    }));
  }, [initialGradingSystem]);

  /**
   * Remove a course by ID
   */
  const removeCourse = useCallback((id: string) => {
    setCourses(prev => prev.filter(course => course.id !== id));
    setError(null); // Clear any errors when removing courses
  }, []);

  /**
   * Clear all courses and reset state
   */
  const clearAll = useCallback(() => {
    setCourses([]);
    setResult(null);
    setError(null);
  }, []);

  /**
   * Load example course data
   */
  const loadExample = useCallback((systemId: string) => {
    try {
      const exampleCourses = createUnweightedExampleCourses(systemId);
      setCourses(exampleCourses);
      setError(null);
    } catch (err) {
      setError('Failed to load example data');
      console.error('Load example error:', err);
    }
  }, []);

  /**
   * Validate a single course
   */
  const validateCourseCallback = useCallback((course: Partial<UnweightedCourse>): ValidationResult => {
    return validateCourse(course, initialGradingSystem);
  }, [initialGradingSystem]);

  /**
   * Export to CSV format
   */
  const exportToCSVCallback = useCallback((): string => {
    if (!result) {
      throw new UnweightedGPACalculationError('No calculation result available for export', 'NO_RESULT');
    }
    
    try {
      return exportToCSV(result, initialGradingSystem);
    } catch (err) {
      setError('Failed to export to CSV');
      throw err;
    }
  }, [result, initialGradingSystem]);

  /**
   * Export to JSON format
   */
  const exportToJSONCallback = useCallback((): string => {
    if (!result) {
      throw new UnweightedGPACalculationError('No calculation result available for export', 'NO_RESULT');
    }
    
    try {
      return exportToJSON(result);
    } catch (err) {
      setError('Failed to export to JSON');
      throw err;
    }
  }, [result]);

  return {
    // State
    result,
    isCalculating,
    error,
    courses,
    
    // Core calculation
    calculate,
    
    // Course management
    addCourse,
    updateCourse,
    removeCourse,
    clearAll,
    
    // Utility functions
    loadExample,
    validateCourse: validateCourseCallback,
    
    // Export functions
    exportToCSV: exportToCSVCallback,
    exportToJSON: exportToJSONCallback
  };
}