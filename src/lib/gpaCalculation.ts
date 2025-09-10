/**
 * Core GPA Calculation Engine
 * Supports multiple grading systems (4.0, 4.3, 4.5) with comprehensive validation
 * Based on official educational standards and international conversion tables
 */

import {
  Course,
  GPAResult,
  GradePointSystem,
  GradeMapping,
  CourseGradeResult,
  GPACalculationStep,
  GradeDistribution,
  GPACalculatorState,
  ValidationResult,
  ValidationError,
  ValidationWarning,
  GPACalculationError
} from '@/types/gpa';

/**
 * Default grade point systems with official mappings
 */
export const DEFAULT_GRADE_SYSTEMS: Record<string, GradePointSystem> = {
  'gpa-4.0': {
    id: 'gpa-4.0',
    name: '4.0 Scale (US Standard)',
    scale: 4.0,
    country: 'United States',
    description: 'Standard US university grading system',
    isOfficial: true,
    source: 'https://www.usnews.com/education/best-colleges/articles/how-to-convert-gpa-to-4-0-scale',
    mappings: [
      { letterGrade: 'A+', numericMin: 97, numericMax: 100, gradePoints: 4.0, percentageMin: 97, percentageMax: 100, description: 'Exceptional' },
      { letterGrade: 'A', numericMin: 93, numericMax: 96, gradePoints: 4.0, percentageMin: 93, percentageMax: 96, description: 'Excellent' },
      { letterGrade: 'A-', numericMin: 90, numericMax: 92, gradePoints: 3.7, percentageMin: 90, percentageMax: 92, description: 'Very Good' },
      { letterGrade: 'B+', numericMin: 87, numericMax: 89, gradePoints: 3.3, percentageMin: 87, percentageMax: 89, description: 'Good' },
      { letterGrade: 'B', numericMin: 83, numericMax: 86, gradePoints: 3.0, percentageMin: 83, percentageMax: 86, description: 'Good' },
      { letterGrade: 'B-', numericMin: 80, numericMax: 82, gradePoints: 2.7, percentageMin: 80, percentageMax: 82, description: 'Satisfactory' },
      { letterGrade: 'C+', numericMin: 77, numericMax: 79, gradePoints: 2.3, percentageMin: 77, percentageMax: 79, description: 'Satisfactory' },
      { letterGrade: 'C', numericMin: 73, numericMax: 76, gradePoints: 2.0, percentageMin: 73, percentageMax: 76, description: 'Acceptable' },
      { letterGrade: 'C-', numericMin: 70, numericMax: 72, gradePoints: 1.7, percentageMin: 70, percentageMax: 72, description: 'Below Average' },
      { letterGrade: 'D+', numericMin: 67, numericMax: 69, gradePoints: 1.3, percentageMin: 67, percentageMax: 69, description: 'Poor' },
      { letterGrade: 'D', numericMin: 65, numericMax: 66, gradePoints: 1.0, percentageMin: 65, percentageMax: 66, description: 'Poor' },
      { letterGrade: 'F', numericMin: 0, numericMax: 64, gradePoints: 0.0, percentageMin: 0, percentageMax: 64, description: 'Failing' }
    ]
  },
  
  'gpa-4.3': {
    id: 'gpa-4.3',
    name: '4.3 Scale (Canada)',
    scale: 4.3,
    country: 'Canada',
    description: 'Standard Canadian university grading system',
    isOfficial: true,
    source: 'https://www.canada.ca/en/immigration-refugees-citizenship/corporate/publications-manuals/operational-bulletins-manuals/temporary-residents/students/assessing-documents.html',
    mappings: [
      { letterGrade: 'A+', numericMin: 95, numericMax: 100, gradePoints: 4.3, percentageMin: 95, percentageMax: 100, description: 'Outstanding' },
      { letterGrade: 'A', numericMin: 90, numericMax: 94, gradePoints: 4.0, percentageMin: 90, percentageMax: 94, description: 'Excellent' },
      { letterGrade: 'A-', numericMin: 85, numericMax: 89, gradePoints: 3.7, percentageMin: 85, percentageMax: 89, description: 'Very Good' },
      { letterGrade: 'B+', numericMin: 82, numericMax: 84, gradePoints: 3.3, percentageMin: 82, percentageMax: 84, description: 'Good' },
      { letterGrade: 'B', numericMin: 78, numericMax: 81, gradePoints: 3.0, percentageMin: 78, percentageMax: 81, description: 'Good' },
      { letterGrade: 'B-', numericMin: 75, numericMax: 77, gradePoints: 2.7, percentageMin: 75, percentageMax: 77, description: 'Satisfactory' },
      { letterGrade: 'C+', numericMin: 72, numericMax: 74, gradePoints: 2.3, percentageMin: 72, percentageMax: 74, description: 'Satisfactory' },
      { letterGrade: 'C', numericMin: 68, numericMax: 71, gradePoints: 2.0, percentageMin: 68, percentageMax: 71, description: 'Acceptable' },
      { letterGrade: 'C-', numericMin: 65, numericMax: 67, gradePoints: 1.7, percentageMin: 65, percentageMax: 67, description: 'Below Average' },
      { letterGrade: 'D+', numericMin: 62, numericMax: 64, gradePoints: 1.3, percentageMin: 62, percentageMax: 64, description: 'Poor' },
      { letterGrade: 'D', numericMin: 60, numericMax: 61, gradePoints: 1.0, percentageMin: 60, percentageMax: 61, description: 'Poor' },
      { letterGrade: 'F', numericMin: 0, numericMax: 59, gradePoints: 0.0, percentageMin: 0, percentageMax: 59, description: 'Failing' }
    ]
  },
  
  'gpa-4.5': {
    id: 'gpa-4.5',
    name: '4.5 Scale (Germany)',
    scale: 4.5,
    country: 'Germany',
    description: 'German university grading system',
    isOfficial: true,
    source: 'https://www.daad.de/en/study-and-research-in-germany/plan-your-studies/grades/',
    mappings: [
      { letterGrade: '1.0', numericMin: 95, numericMax: 100, gradePoints: 4.5, percentageMin: 95, percentageMax: 100, description: 'Sehr gut (Very Good)' },
      { letterGrade: '1.3', numericMin: 90, numericMax: 94, gradePoints: 4.2, percentageMin: 90, percentageMax: 94, description: 'Sehr gut (Very Good)' },
      { letterGrade: '1.7', numericMin: 85, numericMax: 89, gradePoints: 3.8, percentageMin: 85, percentageMax: 89, description: 'Gut (Good)' },
      { letterGrade: '2.0', numericMin: 80, numericMax: 84, gradePoints: 3.5, percentageMin: 80, percentageMax: 84, description: 'Gut (Good)' },
      { letterGrade: '2.3', numericMin: 75, numericMax: 79, gradePoints: 3.2, percentageMin: 75, percentageMax: 79, description: 'Gut (Good)' },
      { letterGrade: '2.7', numericMin: 70, numericMax: 74, gradePoints: 2.8, percentageMin: 70, percentageMax: 74, description: 'Befriedigend (Satisfactory)' },
      { letterGrade: '3.0', numericMin: 65, numericMax: 69, gradePoints: 2.5, percentageMin: 65, percentageMax: 69, description: 'Befriedigend (Satisfactory)' },
      { letterGrade: '3.3', numericMin: 60, numericMax: 64, gradePoints: 2.2, percentageMin: 60, percentageMax: 64, description: 'Befriedigend (Satisfactory)' },
      { letterGrade: '3.7', numericMin: 55, numericMax: 59, gradePoints: 1.8, percentageMin: 55, percentageMax: 59, description: 'Ausreichend (Sufficient)' },
      { letterGrade: '4.0', numericMin: 50, numericMax: 54, gradePoints: 1.5, percentageMin: 50, percentageMax: 54, description: 'Ausreichend (Sufficient)' },
      { letterGrade: '4.3', numericMin: 45, numericMax: 49, gradePoints: 1.2, percentageMin: 45, percentageMax: 49, description: 'Ausreichend (Sufficient)' },
      { letterGrade: '5.0', numericMin: 0, numericMax: 44, gradePoints: 0.0, percentageMin: 0, percentageMax: 44, description: 'Nicht ausreichend (Insufficient)' }
    ]
  }
};

/**
 * Convert letter grade to grade points based on the grading system
 */
export function convertGradeToPoints(grade: string, system: GradePointSystem): number {
  if (!grade || !system || !system.mappings) {
    throw new GPACalculationError('Invalid grade or grading system', 'INVALID_INPUT');
  }

  const normalizedGrade = grade.trim().toUpperCase();
  const mapping = system.mappings.find(m => 
    m.letterGrade.toUpperCase() === normalizedGrade
  );

  if (!mapping) {
    // Try partial matching for flexible input
    const partialMatch = system.mappings.find(m => 
      m.letterGrade.toUpperCase().includes(normalizedGrade) ||
      normalizedGrade.includes(m.letterGrade.toUpperCase())
    );
    
    if (partialMatch) {
      return partialMatch.gradePoints;
    }
    
    throw new GPACalculationError(
      `Grade "${grade}" not found in ${system.name} grading system`, 
      'GRADE_NOT_FOUND',
      { grade, systemId: system.id, availableGrades: system.mappings.map(m => m.letterGrade) }
    );
  }

  return mapping.gradePoints;
}

/**
 * Validate course data before calculation
 */
export function validateCourse(course: Course, system: GradePointSystem): ValidationResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];

  // Required field validation
  if (!course.name || course.name.trim().length === 0) {
    errors.push({
      field: 'name',
      message: 'Course name is required',
      value: course.name,
      code: 'REQUIRED_FIELD'
    });
  }

  if (!course.credits || course.credits <= 0) {
    errors.push({
      field: 'credits',
      message: 'Course credits must be greater than 0',
      value: course.credits,
      code: 'INVALID_CREDITS'
    });
  }

  if (course.credits && course.credits > 6) {
    warnings.push({
      field: 'credits',
      message: 'Unusually high credit hours (>6). Please verify.',
      value: course.credits,
      code: 'HIGH_CREDITS'
    });
  }

  if (!course.grade || course.grade.trim().length === 0) {
    errors.push({
      field: 'grade',
      message: 'Course grade is required',
      value: course.grade,
      code: 'REQUIRED_FIELD'
    });
  } else {
    // Validate grade exists in system
    try {
      convertGradeToPoints(course.grade, system);
    } catch (error) {
      errors.push({
        field: 'grade',
        message: `Invalid grade "${course.grade}" for ${system.name}`,
        value: course.grade,
        code: 'INVALID_GRADE'
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate all courses before calculation
 */
export function validateCourses(courses: Course[], system: GradePointSystem): ValidationResult {
  const allErrors: ValidationError[] = [];
  const allWarnings: ValidationWarning[] = [];

  if (!courses || courses.length === 0) {
    allErrors.push({
      field: 'courses',
      message: 'At least one course is required for GPA calculation',
      value: courses,
      code: 'NO_COURSES'
    });
    
    return {
      isValid: false,
      errors: allErrors,
      warnings: allWarnings
    };
  }

  courses.forEach((course, index) => {
    const validation = validateCourse(course, system);
    
    // Add course index to error context
    validation.errors.forEach(error => {
      allErrors.push({
        ...error,
        field: `course[${index}].${error.field}`,
        message: `Course ${index + 1}: ${error.message}`
      });
    });

    validation.warnings.forEach(warning => {
      allWarnings.push({
        ...warning,
        field: `course[${index}].${warning.field}`,
        message: `Course ${index + 1}: ${warning.message}`
      });
    });
  });

  return {
    isValid: allErrors.length === 0,
    errors: allErrors,
    warnings: allWarnings
  };
}

/**
 * Calculate GPA with comprehensive analysis
 */
export function calculateGPA(
  courses: Course[], 
  system: GradePointSystem,
  options: Partial<GPACalculatorState> = {}
): GPAResult {
  // Validate inputs
  const validation = validateCourses(courses, system);
  if (!validation.isValid) {
    throw new GPACalculationError(
      `Validation failed: ${validation.errors.map(e => e.message).join('; ')}`,
      'VALIDATION_FAILED',
      { errors: validation.errors, warnings: validation.warnings }
    );
  }

  // Filter courses based on options
  let includedCourses = courses.filter(course => !course.excluded);
  
  if (options.excludeFailed) {
    includedCourses = includedCourses.filter(course => {
      try {
        const points = convertGradeToPoints(course.grade, system);
        return points > 0;
      } catch {
        return false;
      }
    });
  }

  // Handle retakes
  if (options.retakePolicy && options.retakePolicy !== 'all') {
    const coursesByName = new Map<string, Course[]>();
    
    includedCourses.forEach(course => {
      const courseName = course.name.toLowerCase().trim();
      if (!coursesByName.has(courseName)) {
        coursesByName.set(courseName, []);
      }
      coursesByName.get(courseName)!.push(course);
    });

    includedCourses = [];
    coursesByName.forEach((coursesGroup) => {
      if (coursesGroup.length === 1 || !coursesGroup.some(c => c.isRetake)) {
        includedCourses.push(...coursesGroup);
      } else {
        // Apply retake policy
        const retakes = coursesGroup.filter(c => c.isRetake);
        const original = coursesGroup.filter(c => !c.isRetake);
        
        switch (options.retakePolicy) {
          case 'latest':
            // Use only the latest retake, ignore original
            const latest = retakes.sort((a, b) => 
              (b.semester || '').localeCompare(a.semester || '')
            )[0];
            includedCourses.push(latest);
            break;
            
          case 'highest':
            // Find the best grade among all attempts (including original)
            const allAttempts = [...original, ...retakes];
            const highest = allAttempts.reduce((best, current) => {
              try {
                const bestPoints = convertGradeToPoints(best.grade, system);
                const currentPoints = convertGradeToPoints(current.grade, system);
                return currentPoints > bestPoints ? current : best;
              } catch {
                return best;
              }
            });
            includedCourses.push(highest);
            break;
            
          case 'average':
            // For average, include all courses
            includedCourses.push(...coursesGroup);
            break;
        }
      }
    });
  }

  if (includedCourses.length === 0) {
    throw new GPACalculationError(
      'No valid courses found for GPA calculation',
      'NO_VALID_COURSES'
    );
  }

  // Convert courses to results with grade points
  const courseResults: CourseGradeResult[] = includedCourses.map(course => {
    try {
      const gradePoints = convertGradeToPoints(course.grade, system);
      const qualityPoints = gradePoints * course.credits;
      
      return {
        course,
        gradePoints,
        qualityPoints,
        isIncluded: true
      };
    } catch (error) {
      return {
        course,
        gradePoints: 0,
        qualityPoints: 0,
        isIncluded: false,
        conversionNote: error instanceof Error ? error.message : 'Conversion failed'
      };
    }
  });

  // Calculate totals
  const validCourseResults = courseResults.filter(cr => cr.isIncluded);
  const totalQualityPoints = validCourseResults.reduce((sum, cr) => sum + cr.qualityPoints, 0);
  const totalCredits = validCourseResults.reduce((sum, cr) => sum + cr.course.credits, 0);
  
  if (totalCredits === 0) {
    throw new GPACalculationError(
      'Total credits cannot be zero',
      'ZERO_CREDITS'
    );
  }

  const gpa = totalQualityPoints / totalCredits;

  // Calculate statistics
  const gradePointsList = validCourseResults.map(cr => cr.gradePoints);
  const mean = gradePointsList.reduce((sum, gp) => sum + gp, 0) / gradePointsList.length;
  const sortedGradePoints = [...gradePointsList].sort((a, b) => a - b);
  const median = sortedGradePoints.length % 2 === 0
    ? (sortedGradePoints[sortedGradePoints.length / 2 - 1] + sortedGradePoints[sortedGradePoints.length / 2]) / 2
    : sortedGradePoints[Math.floor(sortedGradePoints.length / 2)];

  // Grade distribution
  const gradeDistribution: GradeDistribution[] = [];
  const gradeMap = new Map<string, { count: number; credits: number }>();
  
  validCourseResults.forEach(cr => {
    const grade = cr.course.grade;
    if (!gradeMap.has(grade)) {
      gradeMap.set(grade, { count: 0, credits: 0 });
    }
    const entry = gradeMap.get(grade)!;
    entry.count++;
    entry.credits += cr.course.credits;
  });

  gradeMap.forEach((value, grade) => {
    gradeDistribution.push({
      grade,
      count: value.count,
      credits: value.credits,
      percentage: (value.count / validCourseResults.length) * 100
    });
  });

  // Academic standing
  const academicStanding = determineAcademicStanding(gpa, system);

  // Calculation steps
  const calculationSteps = generateCalculationSteps(validCourseResults, system, gpa, totalCredits, totalQualityPoints);

  return {
    gpa: Number(gpa.toFixed(options.precision || 2)),
    totalCredits,
    totalGradePoints: Number(totalQualityPoints.toFixed(options.precision || 2)),
    courses: courseResults,
    system,
    academicStanding,
    statistics: {
      mean: Number(mean.toFixed(options.precision || 2)),
      median: Number(median.toFixed(options.precision || 2)),
      distribution: gradeDistribution,
      creditWeightedAverage: gpa
    },
    calculationSteps,
    timestamp: new Date().toISOString()
  };
}

/**
 * Determine academic standing based on GPA and system
 */
function determineAcademicStanding(gpa: number, system: GradePointSystem) {
  const scale = system.scale;
  
  if (gpa >= scale * 0.9) {
    return {
      level: 'Excellent' as const,
      description: 'Outstanding academic performance. Keep up the excellent work!',
      recommendations: [
        'Maintain current study habits and dedication',
        'Consider pursuing honors courses or research opportunities',
        'Explore leadership roles in academic organizations'
      ]
    };
  } else if (gpa >= scale * 0.75) {
    return {
      level: 'Good' as const,
      description: 'Strong academic performance with room for improvement.',
      recommendations: [
        'Continue consistent study practices',
        'Seek challenging courses to enhance learning',
        'Consider joining study groups or academic clubs'
      ]
    };
  } else if (gpa >= scale * 0.6) {
    return {
      level: 'Satisfactory' as const,
      description: 'Acceptable academic performance. Focus on improvement strategies.',
      recommendations: [
        'Develop better study habits and time management',
        'Seek tutoring or academic support services',
        'Focus on understanding rather than memorization'
      ]
    };
  } else if (gpa >= scale * 0.5) {
    return {
      level: 'Warning' as const,
      description: 'Below average performance. Immediate improvement needed.',
      recommendations: [
        'Meet with academic advisor immediately',
        'Utilize all available academic support resources',
        'Consider reducing course load to focus on quality',
        'Identify and address specific learning challenges'
      ]
    };
  } else {
    return {
      level: 'Probation' as const,
      description: 'Critical academic standing. Urgent intervention required.',
      recommendations: [
        'Schedule immediate meeting with academic dean',
        'Enroll in academic success coaching program',
        'Consider academic fresh start or remedial courses',
        'Evaluate time management and personal circumstances'
      ]
    };
  }
}

/**
 * Generate detailed calculation steps for educational purposes
 */
function generateCalculationSteps(
  courseResults: CourseGradeResult[],
  system: GradePointSystem,
  gpa: number,
  totalCredits: number,
  totalQualityPoints: number
): GPACalculationStep[] {
  const steps: GPACalculationStep[] = [];

  // Step 1: Grade conversion
  steps.push({
    id: 'step-1',
    title: 'Convert Grades to Grade Points',
    description: `Convert each letter grade to grade points using the ${system.name} scale.`,
    formula: 'Grade Points = Numeric value assigned to each letter grade',
    calculation: courseResults.map(cr => 
      `${cr.course.grade} → ${cr.gradePoints} points`
    ).join(', '),
    result: 'All grades successfully converted to grade points',
    explanation: 'Each letter grade corresponds to a specific numeric value in the grading system.',
    difficulty: 'basic'
  });

  // Step 2: Calculate quality points
  steps.push({
    id: 'step-2',
    title: 'Calculate Quality Points',
    description: 'Multiply grade points by credit hours for each course.',
    formula: 'Quality Points = Grade Points × Credit Hours',
    calculation: courseResults.map(cr => 
      `${cr.gradePoints} × ${cr.course.credits} = ${cr.qualityPoints.toFixed(2)}`
    ).join(', '),
    result: `Total Quality Points: ${totalQualityPoints.toFixed(2)}`,
    explanation: 'Quality points weight each grade by the course credit hours.',
    difficulty: 'basic'
  });

  // Step 3: Sum totals
  steps.push({
    id: 'step-3',
    title: 'Sum Credits and Quality Points',
    description: 'Add up all credit hours and quality points.',
    calculation: `Total Credits: ${courseResults.map(cr => cr.course.credits).join(' + ')} = ${totalCredits}\nTotal Quality Points: ${courseResults.map(cr => cr.qualityPoints.toFixed(2)).join(' + ')} = ${totalQualityPoints.toFixed(2)}`,
    result: `Credits: ${totalCredits}, Quality Points: ${totalQualityPoints.toFixed(2)}`,
    explanation: 'These totals will be used to calculate the final GPA.',
    difficulty: 'basic'
  });

  // Step 4: Calculate GPA
  steps.push({
    id: 'step-4',
    title: 'Calculate GPA',
    description: 'Divide total quality points by total credit hours.',
    formula: 'GPA = Total Quality Points ÷ Total Credit Hours',
    calculation: `${totalQualityPoints.toFixed(2)} ÷ ${totalCredits} = ${gpa.toFixed(4)}`,
    result: `Final GPA: ${gpa.toFixed(2)}`,
    explanation: 'This gives the credit-weighted average of all course grades.',
    difficulty: 'basic'
  });

  return steps;
}

/**
 * Get all available grade point systems
 */
export function getGradePointSystems(): GradePointSystem[] {
  return Object.values(DEFAULT_GRADE_SYSTEMS);
}

/**
 * Get grade point system by ID
 */
export function getGradePointSystem(systemId: string): GradePointSystem {
  const system = DEFAULT_GRADE_SYSTEMS[systemId];
  if (!system) {
    throw new GPACalculationError(
      `Grade point system "${systemId}" not found`,
      'SYSTEM_NOT_FOUND',
      { availableSystems: Object.keys(DEFAULT_GRADE_SYSTEMS) }
    );
  }
  return system;
}

/**
 * Create example courses for demonstration
 */
export function createExampleCourses(systemId: string): Course[] {
  const examples: Record<string, Course[]> = {
    'gpa-4.0': [
      { id: 'ex-1', name: 'Calculus I', credits: 4, grade: 'A', semester: 'Fall 2024' },
      { id: 'ex-2', name: 'Chemistry', credits: 3, grade: 'B+', semester: 'Fall 2024' },
      { id: 'ex-3', name: 'English Composition', credits: 3, grade: 'A-', semester: 'Fall 2024' },
      { id: 'ex-4', name: 'Physics', credits: 4, grade: 'B', semester: 'Spring 2024' },
      { id: 'ex-5', name: 'History', credits: 3, grade: 'A', semester: 'Spring 2024' }
    ],
    'gpa-4.3': [
      { id: 'ex-1', name: 'Mathematics', credits: 3, grade: 'A+', semester: 'Fall 2024' },
      { id: 'ex-2', name: 'Biology', credits: 4, grade: 'A', semester: 'Fall 2024' },
      { id: 'ex-3', name: 'Literature', credits: 3, grade: 'A-', semester: 'Fall 2024' },
      { id: 'ex-4', name: 'Statistics', credits: 3, grade: 'B+', semester: 'Spring 2024' }
    ],
    'gpa-4.5': [
      { id: 'ex-1', name: 'Mathematik', credits: 5, grade: '1.0', semester: 'WS 2024' },
      { id: 'ex-2', name: 'Physik', credits: 4, grade: '1.3', semester: 'WS 2024' },
      { id: 'ex-3', name: 'Chemie', credits: 4, grade: '2.0', semester: 'SS 2024' },
      { id: 'ex-4', name: 'Informatik', credits: 6, grade: '1.7', semester: 'SS 2024' }
    ]
  };

  return examples[systemId] || examples['gpa-4.0'];
}
