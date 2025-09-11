/**
 * Unweighted GPA Calculation Core Functions
 * Standard 4.0 scale calculations without course difficulty weights
 */

import { formatForCalculationSteps } from '@/lib/formatters/numberFormatter';
import { 
  UnweightedCourse, 
  UnweightedGPAResult, 
  UnweightedGradingSystem,
  UnweightedGPACalculationError,
  ValidationResult
} from '@/types/unweightedGpa';

/**
 * Standard 4.0 grading systems configuration
 */
export const UNWEIGHTED_GRADING_SYSTEMS: Record<string, UnweightedGradingSystem> = {
  'standard-4.0': {
    id: 'standard-4.0',
    name: '4.0 Standard Scale',
    description: 'Standard 4.0 scale without plus/minus grades',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A', gradePoints: 4.0, description: 'Excellent (90-100%)' },
      { letterGrade: 'B', gradePoints: 3.0, description: 'Good (80-89%)' },
      { letterGrade: 'C', gradePoints: 2.0, description: 'Satisfactory (70-79%)' },
      { letterGrade: 'D', gradePoints: 1.0, description: 'Poor (60-69%)' },
      { letterGrade: 'F', gradePoints: 0.0, description: 'Failing (0-59%)' }
    ]
  },
  'plus-minus-4.0': {
    id: 'plus-minus-4.0',
    name: '4.0 Plus/Minus Scale',
    description: '4.0 scale with plus/minus grade refinements',
    scale: 4.0,
    mappings: [
      { letterGrade: 'A+', gradePoints: 4.0, description: 'Excellent Plus (97-100%)' },
      { letterGrade: 'A', gradePoints: 4.0, description: 'Excellent (93-96%)' },
      { letterGrade: 'A-', gradePoints: 3.7, description: 'Excellent Minus (90-92%)' },
      { letterGrade: 'B+', gradePoints: 3.3, description: 'Good Plus (87-89%)' },
      { letterGrade: 'B', gradePoints: 3.0, description: 'Good (83-86%)' },
      { letterGrade: 'B-', gradePoints: 2.7, description: 'Good Minus (80-82%)' },
      { letterGrade: 'C+', gradePoints: 2.3, description: 'Satisfactory Plus (77-79%)' },
      { letterGrade: 'C', gradePoints: 2.0, description: 'Satisfactory (73-76%)' },
      { letterGrade: 'C-', gradePoints: 1.7, description: 'Satisfactory Minus (70-72%)' },
      { letterGrade: 'D+', gradePoints: 1.3, description: 'Poor Plus (67-69%)' },
      { letterGrade: 'D', gradePoints: 1.0, description: 'Poor (60-66%)' },
      { letterGrade: 'F', gradePoints: 0.0, description: 'Failing (0-59%)' }
    ]
  }
};

/**
 * Main unweighted GPA calculation function
 */
export function calculateUnweightedGPA(
  courses: UnweightedCourse[],
  gradingSystem: UnweightedGradingSystem,
  precision: number = 2
): UnweightedGPAResult {
  // Validate inputs
  if (!gradingSystem) {
    throw new UnweightedGPACalculationError('Grading system is required', 'MISSING_GRADING_SYSTEM');
  }

  // Filter valid courses
  const validCourses = courses.filter(course => 
    course.courseName.trim() && 
    course.credits > 0 && 
    course.letterGrade.trim()
  );

  if (validCourses.length === 0) {
    return createEmptyResult(gradingSystem.id, precision);
  }

  // Calculate totals
  let totalCredits = 0;
  let totalQualityPoints = 0;
  const calculationSteps: any[] = [];

  // Step 1: Grade Points Conversion
  const conversionSteps: string[] = [];
  
  validCourses.forEach(course => {
    const gradePoints = getGradePoints(course.letterGrade, gradingSystem);
    const qualityPoints = course.credits * gradePoints;
    
    totalCredits += course.credits;
    totalQualityPoints += qualityPoints;
    
    conversionSteps.push(
      `${course.courseName}: ${course.letterGrade} (${formatForCalculationSteps(gradePoints, 'student', precision)}) × ${course.credits} credits = ${formatForCalculationSteps(qualityPoints, 'student', precision)} quality points`
    );
  });

  calculationSteps.push({
    id: 'step-1',
    title: 'Course Grade Points Conversion',
    description: 'Convert letter grades to grade points and calculate quality points for each course',
    calculation: conversionSteps.join('\n'),
    result: '',
    formula: 'Quality Points = Grade Points × Credits',
    explanation: 'Each letter grade corresponds to a specific number of grade points on the 4.0 scale. Multiply by credits to get quality points.'
  });

  // Step 2: Totals Calculation
  const qualityPointsList = validCourses.map(course => {
    const gradePoints = getGradePoints(course.letterGrade, gradingSystem);
    return formatForCalculationSteps(course.credits * gradePoints, 'student', precision);
  });

  calculationSteps.push({
    id: 'step-2',
    title: 'Totals Calculation',
    description: 'Sum up all quality points and credits',
    calculation: `Total Quality Points: ${qualityPointsList.join(' + ')} = ${formatForCalculationSteps(totalQualityPoints, 'student', precision)}\nTotal Credits: ${validCourses.map(c => c.credits).join(' + ')} = ${totalCredits}`,
    result: `${formatForCalculationSteps(totalQualityPoints, 'student', precision)} quality points\n${totalCredits} total credits`,
    formula: 'Σ(Quality Points) and Σ(Credits)',
    explanation: 'Add up all quality points and all credit hours to prepare for the final GPA calculation.'
  });

  // Step 3: GPA Calculation
  const gpa = totalQualityPoints / totalCredits;
  
  calculationSteps.push({
    id: 'step-3',
    title: 'GPA Calculation',
    description: 'Divide total quality points by total credits to get the unweighted GPA',
    calculation: `Unweighted GPA = Total Quality Points ÷ Total Credits\nUnweighted GPA = ${formatForCalculationSteps(totalQualityPoints, 'student', precision)} ÷ ${totalCredits} = ${formatForCalculationSteps(gpa, 'student', precision)}`,
    result: formatForCalculationSteps(gpa, 'student', precision),
    formula: 'GPA = Σ(Quality Points) ÷ Σ(Credits)',
    explanation: 'The final GPA represents the weighted average of all grades, where the weight is determined by credit hours.'
  });

  // Calculate grade distribution
  const gradeDistribution = calculateGradeDistribution(validCourses);

  // Determine academic status
  const academicStatus = determineAcademicStatus(gpa);

  return {
    gpa: parseFloat(gpa.toFixed(precision)),
    totalCredits,
    totalQualityPoints: parseFloat(totalQualityPoints.toFixed(precision)),
    courses: validCourses,
    gradeDistribution,
    academicStatus,
    calculationSteps,
    metadata: {
      gradingSystem: gradingSystem.id,
      calculatedAt: new Date(),
      precision
    }
  };
}

/**
 * Get grade points for a letter grade from the grading system
 */
export function getGradePoints(letterGrade: string, gradingSystem: UnweightedGradingSystem): number {
  const mapping = gradingSystem.mappings.find(m => m.letterGrade === letterGrade);
  if (!mapping) {
    console.warn(`Grade "${letterGrade}" not found in grading system "${gradingSystem.id}"`);
    return 0;
  }
  return mapping.gradePoints;
}

/**
 * Calculate grade distribution statistics
 */
export function calculateGradeDistribution(courses: UnweightedCourse[]): Record<string, any> {
  const distribution: Record<string, any> = {};
  const totalCourses = courses.length;
  
  courses.forEach(course => {
    const grade = course.letterGrade;
    if (!distribution[grade]) {
      distribution[grade] = {
        count: 0,
        percentage: 0,
        totalCredits: 0
      };
    }
    distribution[grade].count += 1;
    distribution[grade].totalCredits += course.credits;
  });
  
  // Calculate percentages
  Object.keys(distribution).forEach(grade => {
    distribution[grade].percentage = parseFloat(
      ((distribution[grade].count / totalCourses) * 100).toFixed(1)
    );
  });
  
  return distribution;
}

/**
 * Determine academic status based on GPA
 */
export function determineAcademicStatus(gpa: number) {
  if (gpa >= 3.7) {
    return { 
      level: 'Excellent' as const, 
      description: 'Outstanding academic performance', 
      color: 'green' 
    };
  } else if (gpa >= 3.0) {
    return { 
      level: 'Good' as const, 
      description: 'Good academic standing', 
      color: 'blue' 
    };
  } else if (gpa >= 2.0) {
    return { 
      level: 'Satisfactory' as const, 
      description: 'Satisfactory academic progress', 
      color: 'yellow' 
    };
  } else {
    return { 
      level: 'Poor' as const, 
      description: 'Academic improvement needed', 
      color: 'red' 
    };
  }
}

/**
 * Create empty result for when no courses are present
 */
function createEmptyResult(gradingSystemId: string, precision: number): UnweightedGPAResult {
  return {
    gpa: 0,
    totalCredits: 0,
    totalQualityPoints: 0,
    courses: [],
    gradeDistribution: {},
    academicStatus: { 
      level: 'Poor', 
      description: 'No courses entered', 
      color: 'gray' 
    },
    calculationSteps: [],
    metadata: {
      gradingSystem: gradingSystemId,
      calculatedAt: new Date(),
      precision
    }
  };
}

/**
 * Validate a course object
 */
export function validateCourse(
  course: Partial<UnweightedCourse>, 
  gradingSystem: UnweightedGradingSystem
): ValidationResult {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate course name
  if (!course.courseName || !course.courseName.trim()) {
    errors.push({ field: 'courseName', message: 'Course name is required' });
  } else if (course.courseName.length > 100) {
    errors.push({ field: 'courseName', message: 'Course name must be less than 100 characters' });
  }

  // Validate credits
  if (course.credits === undefined || course.credits === null) {
    errors.push({ field: 'credits', message: 'Credits are required' });
  } else if (course.credits < 0.5 || course.credits > 10) {
    errors.push({ field: 'credits', message: 'Credits must be between 0.5 and 10' });
  }

  // Validate letter grade
  if (!course.letterGrade || !course.letterGrade.trim()) {
    errors.push({ field: 'letterGrade', message: 'Grade selection is required' });
  } else {
    const isValidGrade = gradingSystem.mappings.some(m => m.letterGrade === course.letterGrade);
    if (!isValidGrade) {
      errors.push({ field: 'letterGrade', message: 'Selected grade is not valid for current grading system' });
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Generate example course data for different grading systems
 */
export function createUnweightedExampleCourses(systemId: string): UnweightedCourse[] {
  const baseId = Date.now();
  
  if (systemId === 'plus-minus-4.0') {
    return [
      { id: `${baseId}-1`, courseName: 'Calculus I', credits: 4, letterGrade: 'A-' },
      { id: `${baseId}-2`, courseName: 'English Literature', credits: 3, letterGrade: 'B+' },
      { id: `${baseId}-3`, courseName: 'General Biology', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-4`, courseName: 'Introduction to Psychology', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-5`, courseName: 'Art History', credits: 2, letterGrade: 'A-' }
    ];
  } else {
    return [
      { id: `${baseId}-1`, courseName: 'Algebra II', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-2`, courseName: 'English Composition', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-3`, courseName: 'Chemistry', credits: 4, letterGrade: 'A' },
      { id: `${baseId}-4`, courseName: 'World History', credits: 3, letterGrade: 'B' },
      { id: `${baseId}-5`, courseName: 'Physical Education', credits: 2, letterGrade: 'A' }
    ];
  }
}

/**
 * Export course data to CSV format
 */
export function exportToCSV(result: UnweightedGPAResult, gradingSystem: UnweightedGradingSystem): string {
  const headers = ['Course Name', 'Credits', 'Letter Grade', 'Grade Points', 'Quality Points'];
  
  const rows = result.courses.map(course => {
    const gradePoints = getGradePoints(course.letterGrade, gradingSystem);
    const qualityPoints = course.credits * gradePoints;
    
    return [
      course.courseName,
      course.credits.toString(),
      course.letterGrade,
      gradePoints.toString(),
      qualityPoints.toString()
    ];
  });

  // Add summary rows
  rows.push(['', '', '', '', '']);
  rows.push(['SUMMARY', '', '', '', '']);
  rows.push(['Total Credits', result.totalCredits.toString(), '', '', '']);
  rows.push(['Total Quality Points', '', '', '', result.totalQualityPoints.toString()]);
  rows.push(['Unweighted GPA', result.gpa.toString(), '', '', '']);
  rows.push(['Academic Status', result.academicStatus.level, '', '', '']);

  const csvContent = [headers, ...rows]
    .map(row => row.map(cell => `"${cell}"`).join(','))
    .join('\n');

  return csvContent;
}

/**
 * Export calculation data to JSON format
 */
export function exportToJSON(result: UnweightedGPAResult): string {
  return JSON.stringify(result, null, 2);
}