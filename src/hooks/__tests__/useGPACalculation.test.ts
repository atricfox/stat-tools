/**
 * Test suite for useGPACalculation hook
 * Tests GPA calculation, course management, and state handling
 */

import { renderHook, act } from '@testing-library/react';
import { useGPACalculation } from '../useGPACalculation';
import { DEFAULT_GRADE_SYSTEMS } from '@/lib/gpaCalculation';
import { Course, GradePointSystem } from '@/types/gpa';

describe('useGPACalculation', () => {
  const system40 = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
  
  test('should initialize with default state', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    expect(result.current.result).toBeNull();
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.courses).toEqual([]);
    expect(result.current.courseStatistics).toEqual({
      totalCourses: 0,
      includedCourses: 0,
      excludedCourses: 0,
      retakes: 0,
      totalCredits: 0
    });
  });

  test('should add a course', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    act(() => {
      const course = result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'A',
        semester: 'Fall 2024'
      });
      
      expect(course.id).toBeDefined();
      expect(course.name).toBe('Mathematics');
    });
    
    expect(result.current.courses).toHaveLength(1);
    expect(result.current.courses[0].name).toBe('Mathematics');
    expect(result.current.courseStatistics.totalCourses).toBe(1);
    expect(result.current.courseStatistics.totalCredits).toBe(3);
  });

  test('should remove a course', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    let courseId: string;
    
    act(() => {
      const course = result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'A'
      });
      courseId = course.id;
    });
    
    expect(result.current.courses).toHaveLength(1);
    
    act(() => {
      result.current.removeCourse(courseId);
    });
    
    expect(result.current.courses).toHaveLength(0);
  });

  test('should update a course', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    let courseId: string;
    
    act(() => {
      const course = result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'B'
      });
      courseId = course.id;
    });
    
    act(() => {
      result.current.updateCourse(courseId, {
        grade: 'A',
        credits: 4
      });
    });
    
    expect(result.current.courses[0].grade).toBe('A');
    expect(result.current.courses[0].credits).toBe(4);
    expect(result.current.courseStatistics.totalCredits).toBe(4);
  });

  test('should toggle course exclusion', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    let courseId: string;
    
    act(() => {
      const course = result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'A'
      });
      courseId = course.id;
    });
    
    expect(result.current.courseStatistics.includedCourses).toBe(1);
    expect(result.current.courseStatistics.excludedCourses).toBe(0);
    
    act(() => {
      result.current.toggleCourseExclusion(courseId);
    });
    
    expect(result.current.courses[0].excluded).toBe(true);
    expect(result.current.courseStatistics.includedCourses).toBe(0);
    expect(result.current.courseStatistics.excludedCourses).toBe(1);
  });

  test('should mark course as retake', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    let courseId: string;
    
    act(() => {
      const course = result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'A'
      });
      courseId = course.id;
    });
    
    expect(result.current.courseStatistics.retakes).toBe(0);
    
    act(() => {
      result.current.markAsRetake(courseId, true);
    });
    
    expect(result.current.courses[0].isRetake).toBe(true);
    expect(result.current.courseStatistics.retakes).toBe(1);
  });

  test('should add multiple courses', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const newCourses = [
      { name: 'Math', credits: 3, grade: 'A' },
      { name: 'Science', credits: 4, grade: 'B' },
      { name: 'English', credits: 3, grade: 'A-' }
    ];
    
    act(() => {
      const addedCourses = result.current.addCourses(newCourses);
      expect(addedCourses).toHaveLength(3);
      expect(addedCourses[0].id).toBeDefined();
    });
    
    expect(result.current.courses).toHaveLength(3);
    expect(result.current.courseStatistics.totalCredits).toBe(10);
  });

  test('should validate courses correctly', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Initially no courses - invalid
    expect(result.current.validationSummary.isValid).toBe(false);
    expect(result.current.validationSummary.errorCount).toBe(1);
    expect(result.current.validationSummary.message).toBe('No courses added');
    
    // Add valid course
    act(() => {
      result.current.addCourse({
        name: 'Mathematics',
        credits: 3,
        grade: 'A'
      });
    });
    
    expect(result.current.validationSummary.isValid).toBe(true);
    expect(result.current.validationSummary.errorCount).toBe(0);
    
    // Add invalid course
    act(() => {
      result.current.addCourse({
        name: '',
        credits: 0,
        grade: ''
      });
    });
    
    expect(result.current.validationSummary.isValid).toBe(false);
    expect(result.current.validationSummary.errorCount).toBe(3); // name, credits, grade
  });

  test('should calculate GPA correctly', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const courses: Course[] = [
      { id: '1', name: 'Math', credits: 3, grade: 'A' },
      { id: '2', name: 'Science', credits: 4, grade: 'B' }
    ];
    
    await act(async () => {
      await result.current.calculate(courses, system40);
    });
    
    expect(result.current.result).toBeDefined();
    expect(result.current.result?.gpa).toBeCloseTo(3.43, 2); // (12 + 12) / 7
    expect(result.current.result?.totalCredits).toBe(7);
    expect(result.current.isCalculating).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test('should handle calculation errors', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const invalidCourses: Course[] = [];
    
    await act(async () => {
      await result.current.calculate(invalidCourses, system40);
    });
    
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeDefined();
    expect(result.current.isCalculating).toBe(false);
  });

  test('should calculate with current courses', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Add courses first
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' });
      result.current.addCourse({ name: 'Science', credits: 4, grade: 'B' });
    });
    
    // Wait for courses to be added
    expect(result.current.courses).toHaveLength(2);
    
    // Calculate with current courses
    await act(async () => {
      result.current.calculateWithCurrentCourses(system40);
    });
    
    expect(result.current.result).toBeDefined();
    if (result.current.result) {
      expect(result.current.result.gpa).toBeCloseTo(3.43, 2);
    }
  });

  test('should load example courses', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    act(() => {
      result.current.loadExample('gpa-4.0');
    });
    
    expect(result.current.courses.length).toBeGreaterThan(0);
    expect(result.current.courses[0].name).toBeTruthy();
    expect(result.current.courses[0].grade).toBeTruthy();
    expect(result.current.error).toBeNull();
  });

  test('should clear all courses and reset state', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Add some courses and calculate
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' });
    });
    
    // Clear all
    act(() => {
      result.current.clearAll();
    });
    
    expect(result.current.courses).toHaveLength(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should reset all state', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Add courses and set some state
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' });
    });
    
    act(() => {
      result.current.reset();
    });
    
    expect(result.current.courses).toHaveLength(0);
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });

  test('should export courses in JSON format', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' });
      result.current.addCourse({ name: 'Science', credits: 4, grade: 'B' });
    });
    
    const exportedData = result.current.exportCourses('json');
    const parsed = JSON.parse(exportedData);
    
    expect(parsed).toHaveLength(2);
    expect(parsed[0].name).toBe('Math');
    expect(parsed[1].name).toBe('Science');
  });

  test('should export courses in CSV format', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    act(() => {
      result.current.addCourse({ 
        name: 'Math', 
        credits: 3, 
        grade: 'A',
        semester: 'Fall 2024'
      });
    });
    
    const exportedData = result.current.exportCourses('csv');
    const lines = exportedData.split('\n');
    
    expect(lines[0]).toBe('Name,Credits,Grade,Semester,Excluded,Retake');
    expect(lines[1]).toBe('"Math",3,"A","Fall 2024",false,false');
  });

  test('should import courses from JSON', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const courseData = JSON.stringify([
      { name: 'Math', credits: 3, grade: 'A', semester: 'Fall 2024' },
      { name: 'Science', credits: 4, grade: 'B', semester: 'Fall 2024' }
    ]);
    
    act(() => {
      const imported = result.current.importCourses(courseData, 'json');
      expect(imported).toBe(2);
    });
    
    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses[0].name).toBe('Math');
    expect(result.current.courses[1].name).toBe('Science');
    expect(result.current.error).toBeNull();
  });

  test('should import courses from CSV', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const csvData = `Name,Credits,Grade,Semester,Excluded,Retake
"Math",3,"A","Fall 2024",false,false
"Science",4,"B","Fall 2024",false,false`;
    
    act(() => {
      const imported = result.current.importCourses(csvData, 'csv');
      expect(imported).toBe(2);
    });
    
    expect(result.current.courses).toHaveLength(2);
    expect(result.current.courses[0].name).toBe('Math');
    expect(result.current.error).toBeNull();
  });

  test('should handle import errors gracefully', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    act(() => {
      const imported = result.current.importCourses('invalid json', 'json');
      expect(imported).toBe(0);
    });
    
    expect(result.current.courses).toHaveLength(0);
    expect(result.current.error).toContain('Import failed');
  });

  test('should validate individual course', () => {
    const { result } = renderHook(() => useGPACalculation());
    
    const validCourse: Course = {
      id: '1',
      name: 'Mathematics',
      credits: 3,
      grade: 'A'
    };
    
    const validation = result.current.validateCourse(validCourse);
    expect(validation.isValid).toBe(true);
    expect(validation.errors).toHaveLength(0);
    
    const invalidCourse: Course = {
      id: '2',
      name: '',
      credits: 0,
      grade: ''
    };
    
    const invalidValidation = result.current.validateCourse(invalidCourse);
    expect(invalidValidation.isValid).toBe(false);
    expect(invalidValidation.errors.length).toBeGreaterThan(0);
  });

  test('should not calculate with empty courses in calculateWithCurrentCourses', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Should not throw error or set result when no courses
    await act(async () => {
      await result.current.calculateWithCurrentCourses(system40);
    });
    
    expect(result.current.result).toBeNull();
  });

  test('should calculate only with compatible courses when using calculateWithCompatibleCourses', async () => {
    const { result } = renderHook(() => useGPACalculation());
    const germanSystem = DEFAULT_GRADE_SYSTEMS['gpa-4.5'];
    
    // Add courses with US grades
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' });
      result.current.addCourse({ name: 'Science', credits: 4, grade: 'B+' });
      result.current.addCourse({ name: 'History', credits: 3, grade: 'A-' });
    });
    
    // Try to calculate with German grading system (incompatible)
    await act(async () => {
      await result.current.calculateWithCompatibleCourses(germanSystem);
    });
    
    // Should show error since no courses are compatible
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBe('No courses compatible with the selected grading system');
  });

  test('should calculate GPA with mixed compatible and incompatible courses', async () => {
    const { result } = renderHook(() => useGPACalculation());
    const germanSystem = DEFAULT_GRADE_SYSTEMS['gpa-4.5'];
    
    // Add mix of German and US grades  
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: '1.0' }); // German grade
      result.current.addCourse({ name: 'Science', credits: 4, grade: 'A' }); // US grade (incompatible with German system)
      result.current.addCourse({ name: 'History', credits: 3, grade: '2.0' }); // German grade
    });
    
    // Calculate with German grading system
    await act(async () => {
      await result.current.calculateWithCompatibleCourses(germanSystem);
    });
    
    // Should calculate GPA using only the German grades (Math and History)
    expect(result.current.result).not.toBeNull();
    expect(result.current.error).toBeNull();
    if (result.current.result) {
      expect(result.current.result.courses.filter(c => c.isIncluded)).toHaveLength(2); // Only compatible courses included
      expect(result.current.result.totalCredits).toBe(6); // 3 + 3 credits
    }
  });

  test('should handle incomplete courses gracefully', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Add complete and incomplete courses
    act(() => {
      result.current.addCourse({ name: 'Math', credits: 3, grade: 'A' }); // Complete course
      result.current.addCourse({ name: '', credits: 4, grade: 'B' }); // Missing name
      result.current.addCourse({ name: 'History', credits: 0, grade: 'A' }); // Invalid credits
      result.current.addCourse({ name: 'Science', credits: 3, grade: '' }); // Missing grade
    });
    
    // Calculate with current courses
    await act(async () => {
      await result.current.calculateWithCurrentCourses(system40);
    });
    
    // Should calculate using only the complete course (Math)
    expect(result.current.result).not.toBeNull();
    expect(result.current.error).toBeNull();
    if (result.current.result) {
      expect(result.current.result.courses.filter(c => c.isIncluded)).toHaveLength(1); // Only complete course included
      expect(result.current.result.totalCredits).toBe(3); // Only Math course credits
    }
  });

  test('should clear results when no complete courses exist', async () => {
    const { result } = renderHook(() => useGPACalculation());
    
    // Add only incomplete courses
    act(() => {
      result.current.addCourse({ name: '', credits: 4, grade: 'B' }); // Missing name
      result.current.addCourse({ name: 'History', credits: 0, grade: 'A' }); // Invalid credits
      result.current.addCourse({ name: 'Science', credits: 3, grade: '' }); // Missing grade
    });
    
    // Calculate with current courses
    await act(async () => {
      await result.current.calculateWithCurrentCourses(system40);
    });
    
    // Should clear results since no complete courses
    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
  });
});