/**
 * Comprehensive test suite for GPA calculation engine
 * Tests all supported grading systems with official standard verification
 */

import {
  calculateGPA,
  convertGradeToPoints,
  validateCourse,
  validateCourses,
  getGradePointSystems,
  getGradePointSystem,
  createExampleCourses,
  DEFAULT_GRADE_SYSTEMS
} from '../gpaCalculation';

import {
  Course,
  GradePointSystem,
  GPACalculationError,
  ValidationResult
} from '@/types/gpa';

describe('GPA Calculation Engine', () => {
  
  describe('Grade Point Systems', () => {
    test('should provide all default grade systems', () => {
      const systems = getGradePointSystems();
      
      expect(systems).toHaveLength(3);
      expect(systems.map(s => s.id)).toContain('gpa-4.0');
      expect(systems.map(s => s.id)).toContain('gpa-4.3');
      expect(systems.map(s => s.id)).toContain('gpa-4.5');
    });

    test('should get specific grade point system by ID', () => {
      const system = getGradePointSystem('gpa-4.0');
      
      expect(system.id).toBe('gpa-4.0');
      expect(system.name).toBe('4.0 Scale (US Standard)');
      expect(system.scale).toBe(4.0);
      expect(system.country).toBe('United States');
      expect(system.isOfficial).toBe(true);
    });

    test('should throw error for invalid system ID', () => {
      expect(() => {
        getGradePointSystem('invalid-system');
      }).toThrow(GPACalculationError);
    });

    test('should have correct grade mappings for 4.0 system', () => {
      const system = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
      
      expect(system.mappings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ letterGrade: 'A+', gradePoints: 4.0 }),
          expect.objectContaining({ letterGrade: 'A', gradePoints: 4.0 }),
          expect.objectContaining({ letterGrade: 'A-', gradePoints: 3.7 }),
          expect.objectContaining({ letterGrade: 'B+', gradePoints: 3.3 }),
          expect.objectContaining({ letterGrade: 'B', gradePoints: 3.0 }),
          expect.objectContaining({ letterGrade: 'F', gradePoints: 0.0 })
        ])
      );
    });

    test('should have correct grade mappings for 4.3 system', () => {
      const system = DEFAULT_GRADE_SYSTEMS['gpa-4.3'];
      
      expect(system.mappings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ letterGrade: 'A+', gradePoints: 4.3 }),
          expect.objectContaining({ letterGrade: 'A', gradePoints: 4.0 }),
          expect.objectContaining({ letterGrade: 'F', gradePoints: 0.0 })
        ])
      );
    });

    test('should have correct grade mappings for 4.5 system', () => {
      const system = DEFAULT_GRADE_SYSTEMS['gpa-4.5'];
      
      expect(system.mappings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ letterGrade: '1.0', gradePoints: 4.5 }),
          expect.objectContaining({ letterGrade: '2.0', gradePoints: 3.5 }),
          expect.objectContaining({ letterGrade: '5.0', gradePoints: 0.0 })
        ])
      );
    });
  });

  describe('Grade to Points Conversion', () => {
    const system40 = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
    const system43 = DEFAULT_GRADE_SYSTEMS['gpa-4.3'];
    const system45 = DEFAULT_GRADE_SYSTEMS['gpa-4.5'];

    test('should convert grades correctly in 4.0 system', () => {
      expect(convertGradeToPoints('A+', system40)).toBe(4.0);
      expect(convertGradeToPoints('A', system40)).toBe(4.0);
      expect(convertGradeToPoints('A-', system40)).toBe(3.7);
      expect(convertGradeToPoints('B+', system40)).toBe(3.3);
      expect(convertGradeToPoints('B', system40)).toBe(3.0);
      expect(convertGradeToPoints('B-', system40)).toBe(2.7);
      expect(convertGradeToPoints('C', system40)).toBe(2.0);
      expect(convertGradeToPoints('D', system40)).toBe(1.0);
      expect(convertGradeToPoints('F', system40)).toBe(0.0);
    });

    test('should convert grades correctly in 4.3 system', () => {
      expect(convertGradeToPoints('A+', system43)).toBe(4.3);
      expect(convertGradeToPoints('A', system43)).toBe(4.0);
      expect(convertGradeToPoints('F', system43)).toBe(0.0);
    });

    test('should convert grades correctly in 4.5 system', () => {
      expect(convertGradeToPoints('1.0', system45)).toBe(4.5);
      expect(convertGradeToPoints('2.0', system45)).toBe(3.5);
      expect(convertGradeToPoints('5.0', system45)).toBe(0.0);
    });

    test('should handle case insensitive grade input', () => {
      expect(convertGradeToPoints('a+', system40)).toBe(4.0);
      expect(convertGradeToPoints('A+', system40)).toBe(4.0);
      expect(convertGradeToPoints(' B ', system40)).toBe(3.0);
    });

    test('should throw error for invalid grade', () => {
      expect(() => {
        convertGradeToPoints('X', system40);
      }).toThrow(GPACalculationError);
      
      expect(() => {
        convertGradeToPoints('', system40);
      }).toThrow(GPACalculationError);
    });

    test('should throw error for invalid system', () => {
      expect(() => {
        convertGradeToPoints('A', {} as GradePointSystem);
      }).toThrow(GPACalculationError);
    });
  });

  describe('Course Validation', () => {
    const system = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];

    test('should validate valid course', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Mathematics',
        credits: 3,
        grade: 'A'
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect missing course name', () => {
      const course: Course = {
        id: 'test-1',
        name: '',
        credits: 3,
        grade: 'A'
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'name',
            code: 'REQUIRED_FIELD'
          })
        ])
      );
    });

    test('should detect invalid credits', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Mathematics',
        credits: 0,
        grade: 'A'
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'credits',
            code: 'INVALID_CREDITS'
          })
        ])
      );
    });

    test('should warn about high credits', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Mathematics',
        credits: 8,
        grade: 'A'
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(true);
      expect(result.warnings).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'credits',
            code: 'HIGH_CREDITS'
          })
        ])
      );
    });

    test('should detect missing grade', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Mathematics',
        credits: 3,
        grade: ''
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'grade',
            code: 'REQUIRED_FIELD'
          })
        ])
      );
    });

    test('should detect invalid grade', () => {
      const course: Course = {
        id: 'test-1',
        name: 'Mathematics',
        credits: 3,
        grade: 'X'
      };

      const result = validateCourse(course, system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'grade',
            code: 'INVALID_GRADE'
          })
        ])
      );
    });
  });

  describe('Multiple Courses Validation', () => {
    const system = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];

    test('should validate empty course list', () => {
      const result = validateCourses([], system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            field: 'courses',
            code: 'NO_COURSES'
          })
        ])
      );
    });

    test('should validate multiple valid courses', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' },
        { id: 'test-2', name: 'Science', credits: 4, grade: 'B' }
      ];

      const result = validateCourses(courses, system);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should detect errors in multiple courses', () => {
      const courses: Course[] = [
        { id: 'test-1', name: '', credits: 3, grade: 'A' },
        { id: 'test-2', name: 'Science', credits: 0, grade: 'X' }
      ];

      const result = validateCourses(courses, system);
      
      expect(result.isValid).toBe(false);
      expect(result.errors).toHaveLength(3); // name, credits, grade errors
      expect(result.errors[0].message).toContain('Course 1');
      expect(result.errors[1].message).toContain('Course 2');
      expect(result.errors[2].message).toContain('Course 2');
    });
  });

  describe('GPA Calculation', () => {
    const system40 = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];
    const system43 = DEFAULT_GRADE_SYSTEMS['gpa-4.3'];

    test('should calculate GPA correctly for 4.0 system', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' },      // 3 × 4.0 = 12.0
        { id: 'test-2', name: 'Science', credits: 4, grade: 'B' },   // 4 × 3.0 = 12.0
        { id: 'test-3', name: 'English', credits: 3, grade: 'A-' }   // 3 × 3.7 = 11.1
      ];
      // Total: 35.1 quality points, 10 credits = 3.51 GPA

      const result = calculateGPA(courses, system40);
      
      expect(result.gpa).toBe(3.51);
      expect(result.totalCredits).toBe(10);
      expect(result.totalGradePoints).toBe(35.1);
      expect(result.courses).toHaveLength(3);
      expect(result.system.id).toBe('gpa-4.0');
    });

    test('should calculate GPA correctly for 4.3 system', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A+' },     // 3 × 4.3 = 12.9
        { id: 'test-2', name: 'Science', credits: 3, grade: 'A' }    // 3 × 4.0 = 12.0
      ];
      // Total: 24.9 quality points, 6 credits = 4.15 GPA

      const result = calculateGPA(courses, system43);
      
      expect(result.gpa).toBe(4.15);
      expect(result.totalCredits).toBe(6);
      expect(result.totalGradePoints).toBe(24.9);
    });

    test('should handle single course', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'B+' }
      ];

      const result = calculateGPA(courses, system40);
      
      expect(result.gpa).toBe(3.3); // B+ = 3.3
      expect(result.totalCredits).toBe(3);
      expect(result.totalGradePoints).toBeCloseTo(9.9, 1);
    });

    test('should exclude failed courses when option is set', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' },
        { id: 'test-2', name: 'Science', credits: 3, grade: 'F' }
      ];

      const result = calculateGPA(courses, system40, { excludeFailed: true });
      
      expect(result.gpa).toBe(4.0); // Only A grade counted
      expect(result.totalCredits).toBe(3);
    });

    test('should exclude marked courses', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' },
        { id: 'test-2', name: 'Science', credits: 3, grade: 'B', excluded: true }
      ];

      const result = calculateGPA(courses, system40);
      
      expect(result.gpa).toBe(4.0); // Only A grade counted
      expect(result.totalCredits).toBe(3);
    });

    test('should generate calculation steps', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' }
      ];

      const result = calculateGPA(courses, system40);
      
      expect(result.calculationSteps).toHaveLength(4);
      expect(result.calculationSteps[0].title).toBe('Convert Grades to Grade Points');
      expect(result.calculationSteps[3].title).toBe('Calculate GPA');
    });

    test('should calculate statistics', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' },
        { id: 'test-2', name: 'Science', credits: 3, grade: 'B' },
        { id: 'test-3', name: 'English', credits: 3, grade: 'A' }
      ];

      const result = calculateGPA(courses, system40);
      
      expect(result.statistics.mean).toBeCloseTo(3.67, 2); // (4+3+4)/3
      expect(result.statistics.median).toBe(4.0);
      expect(result.statistics.distribution).toHaveLength(2); // A and B grades
    });

    test('should determine academic standing correctly', () => {
      const excellentCourses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A' }
      ];
      const result1 = calculateGPA(excellentCourses, system40);
      expect(result1.academicStanding.level).toBe('Excellent');

      const goodCourses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'B+' }
      ];
      const result2 = calculateGPA(goodCourses, system40);
      expect(result2.academicStanding.level).toBe('Good');

      const probationCourses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'D' }
      ];
      const result3 = calculateGPA(probationCourses, system40);
      expect(result3.academicStanding.level).toBe('Probation');
    });

    test('should throw error for invalid courses', () => {
      expect(() => {
        calculateGPA([], system40);
      }).toThrow(GPACalculationError);
    });

    test('should throw error for courses with invalid grades', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'X' }
      ];

      expect(() => {
        calculateGPA(courses, system40);
      }).toThrow(GPACalculationError);
    });

    test('should handle retake policies', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'C', semester: 'Fall 2023' },
        { id: 'test-2', name: 'Math', credits: 3, grade: 'A', semester: 'Spring 2024', isRetake: true }
      ];

      const resultHighest = calculateGPA(courses, system40, { retakePolicy: 'highest' });
      expect(resultHighest.totalCredits).toBe(3); // Only highest grade counted
      expect(resultHighest.gpa).toBe(4.0); // Only A grade

      const resultLatest = calculateGPA(courses, system40, { retakePolicy: 'latest' });
      expect(resultLatest.totalCredits).toBe(3); // Only latest retake
      expect(resultLatest.gpa).toBe(4.0); // Only A grade
    });
  });

  describe('Example Courses', () => {
    test('should create example courses for 4.0 system', () => {
      const examples = createExampleCourses('gpa-4.0');
      
      expect(examples).toHaveLength(5);
      expect(examples[0].name).toBe('Calculus I');
      expect(examples[0].grade).toBe('A');
      expect(examples[0].credits).toBe(4);
    });

    test('should create example courses for 4.3 system', () => {
      const examples = createExampleCourses('gpa-4.3');
      
      expect(examples).toHaveLength(4);
      expect(examples[0].grade).toBe('A+');
    });

    test('should create example courses for 4.5 system', () => {
      const examples = createExampleCourses('gpa-4.5');
      
      expect(examples).toHaveLength(4);
      expect(examples[0].grade).toBe('1.0');
    });

    test('should fallback to 4.0 examples for unknown system', () => {
      const examples = createExampleCourses('unknown-system');
      
      expect(examples).toHaveLength(5);
      expect(examples[0].name).toBe('Calculus I');
    });
  });

  describe('Edge Cases and Error Handling', () => {
    const system = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];

    test('should handle precision parameter', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'B+' } // 3.3 GPA
      ];

      const result = calculateGPA(courses, system, { precision: 1 });
      expect(result.gpa).toBeCloseTo(3.3, 1);

      const result2 = calculateGPA(courses, system, { precision: 3 });
      expect(result2.gpa).toBeCloseTo(3.3, 3);
      expect(result2.gpa.toFixed(3)).toBe('3.300');
    });

    test('should handle zero total credits edge case', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 3, grade: 'A', excluded: true }
      ];

      expect(() => {
        calculateGPA(courses, system);
      }).toThrow(GPACalculationError);
    });

    test('should handle course with zero credits', () => {
      const courses: Course[] = [
        { id: 'test-1', name: 'Math', credits: 0, grade: 'A' }
      ];

      expect(() => {
        calculateGPA(courses, system);
      }).toThrow(GPACalculationError);
    });
  });

  describe('Real World Test Cases', () => {
    const system = DEFAULT_GRADE_SYSTEMS['gpa-4.0'];

    test('should match official GPA calculation example 1', () => {
      // Example from US Department of Education guidelines
      const courses: Course[] = [
        { id: '1', name: 'English 101', credits: 3, grade: 'A' },     // 12.0 points
        { id: '2', name: 'Math 151', credits: 4, grade: 'B+' },      // 13.2 points
        { id: '3', name: 'Chemistry', credits: 4, grade: 'B' },      // 12.0 points
        { id: '4', name: 'History', credits: 3, grade: 'A-' },       // 11.1 points
        { id: '5', name: 'Psychology', credits: 3, grade: 'B+' }     // 9.9 points
      ];
      // Total: 58.2 points, 17 credits = 3.424 GPA

      const result = calculateGPA(courses, system);
      expect(result.gpa).toBeCloseTo(3.42, 2);
    });

    test('should match official GPA calculation example 2', () => {
      // Example with failing grade
      const courses: Course[] = [
        { id: '1', name: 'Biology', credits: 4, grade: 'A' },        // 16.0 points
        { id: '2', name: 'Calculus', credits: 5, grade: 'C+' },     // 11.5 points
        { id: '3', name: 'Physics', credits: 4, grade: 'B-' },      // 10.8 points
        { id: '4', name: 'Statistics', credits: 3, grade: 'F' }     // 0.0 points
      ];
      // Total: 38.3 points, 16 credits = 2.394 GPA

      const result = calculateGPA(courses, system);
      expect(result.gpa).toBeCloseTo(2.39, 2);
    });
  });
});