/**
 * Core grade calculation functions for educational tools
 * Implements weighted averages, final score calculations, and GPA conversions
 */

import type {
  GradeItem,
  Course,
  FinalGradeCalculationOptions,
  FinalGradeResult,
  SemesterGradeResult,
  CumulativeGPAResult,
  GradingScale,
  COMMON_GRADING_SYSTEMS,
  ValidationError
} from '@/types/education';

/**
 * Calculate weighted average from grade items
 * @param grades - Array of grade items with scores and weights
 * @param normalizeWeights - Whether to normalize weights if they don't sum to 100
 * @returns Weighted average score
 */
export function calculateWeightedAverage(
  grades: GradeItem[], 
  normalizeWeights: boolean = false
): number {
  if (!grades.length) return 0;

  // Calculate total weight
  const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
  
  if (totalWeight === 0) return 0;

  // Calculate weighted sum
  const weightedSum = grades.reduce((sum, grade) => {
    return sum + (grade.score * grade.weight);
  }, 0);

  // Return normalized or direct weighted average
  if (normalizeWeights && totalWeight !== 100) {
    return weightedSum / totalWeight;
  }
  
  return weightedSum / 100; // Assuming weights are percentages
}

/**
 * Calculate required final exam score to achieve target grade
 * @param options - Final grade calculation parameters
 * @returns Final grade calculation result with required score and analysis
 */
export function calculateRequiredFinalScore(
  options: FinalGradeCalculationOptions
): FinalGradeResult {
  const { currentGrades, finalExamWeight, targetGrade, passingGrade = 60 } = options;

  // Calculate current weighted score (excluding final exam)
  const currentWeightedScore = calculateWeightedAverage(currentGrades, true);
  const currentContribution = currentWeightedScore * (100 - finalExamWeight) / 100;

  // Calculate required final score
  const requiredFinalContribution = targetGrade - currentContribution;
  const requiredScore = (requiredFinalContribution * 100) / finalExamWeight;

  // Determine if achievable (assuming max score of 100)
  const isAchievable = requiredScore <= 100 && requiredScore >= 0;
  
  // Calculate max possible grade
  const maxPossibleGrade = currentContribution + (100 * finalExamWeight / 100);

  // Determine difficulty level
  let difficultyLevel: FinalGradeResult['difficultyLevel'];
  if (!isAchievable) {
    difficultyLevel = 'impossible';
  } else if (requiredScore <= 75) {
    difficultyLevel = 'easy';
  } else if (requiredScore <= 92.5) {
    difficultyLevel = 'moderate';
  } else {
    difficultyLevel = 'challenging';
  }

  // Generate recommendation
  let recommendation: string;
  if (!isAchievable) {
    recommendation = `目标成绩${targetGrade}分无法达到。建议调整目标至${Math.floor(maxPossibleGrade)}分或以下。`;
  } else if (difficultyLevel === 'easy') {
    recommendation = `期末考试需要${Math.ceil(requiredScore)}分，难度较低，保持当前学习状态即可。`;
  } else if (difficultyLevel === 'moderate') {
    recommendation = `期末考试需要${Math.ceil(requiredScore)}分，需要适度加强复习。`;
  } else {
    recommendation = `期末考试需要${Math.ceil(requiredScore)}分，需要全力冲刺！建议制定详细复习计划。`;
  }

  // Generate calculation steps
  const calculationSteps = [
    `当前成绩加权平均: ${currentWeightedScore.toFixed(1)}%`,
    `当前成绩贡献: ${currentWeightedScore.toFixed(1)} × ${(100-finalExamWeight)}% = ${currentContribution.toFixed(1)}%`,
    `期末考试需贡献: ${targetGrade} - ${currentContribution.toFixed(1)} = ${requiredFinalContribution.toFixed(1)}%`,
    `期末考试需得分: ${requiredFinalContribution.toFixed(1)} ÷ ${finalExamWeight}% = ${requiredScore.toFixed(1)}%`
  ];

  return {
    requiredScore: Math.round(requiredScore * 10) / 10,
    isAchievable,
    currentWeightedScore: Math.round(currentWeightedScore * 10) / 10,
    maxPossibleGrade: Math.round(maxPossibleGrade * 10) / 10,
    difficultyLevel,
    recommendation,
    calculationSteps
  };
}

/**
 * Convert grade to grade points based on grading scale
 * @param grade - Grade value (number or string)
 * @param scale - Grading scale system
 * @returns Numeric grade points
 */
export function convertGradeToPoints(
  grade: number | string, 
  scale: GradingScale
): number {
  // Import the constant properly
  const gradingSystems = {
    '4.0': {
      scale: '4.0' as const,
      conversionTable: {
        'A+': 4.0, 'A': 4.0, 'A-': 3.7,
        'B+': 3.3, 'B': 3.0, 'B-': 2.7,
        'C+': 2.3, 'C': 2.0, 'C-': 1.7,
        'D+': 1.3, 'D': 1.0, 'D-': 0.7,
        'F': 0.0
      },
      passingGrade: 2.0,
      maxGrade: 4.0
    },
    '5.0': {
      scale: '5.0' as const,
      conversionTable: {
        'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'F': 1.0
      },
      passingGrade: 3.0,
      maxGrade: 5.0
    },
    'percentage': {
      scale: 'percentage' as const,
      conversionTable: {},
      passingGrade: 60,
      maxGrade: 100
    },
    'letter': {
      scale: 'letter' as const,
      conversionTable: {
        'A+': 97, 'A': 94, 'A-': 90,
        'B+': 87, 'B': 84, 'B-': 80,
        'C+': 77, 'C': 74, 'C-': 70,
        'D+': 67, 'D': 64, 'D-': 60,
        'F': 0
      },
      passingGrade: 60,
      maxGrade: 100
    }
  };

  const system = gradingSystems[scale];

  if (scale === 'percentage') {
    // Handle numeric percentage grades
    if (typeof grade === 'number') {
      return Math.max(0, Math.min(100, grade)); // Clamp to 0-100
    }
    return 0;
  }

  // Handle letter grades
  if (typeof grade === 'string') {
    const table = (system as any).conversionTable as Record<string, number>;
    const points = table[grade];
    return points !== undefined ? points : 0;
  }

  // Handle numeric grades in non-percentage systems
  if (typeof grade === 'number') {
    if (scale === '4.0') {
      return Math.max(0, Math.min(4.0, grade));
    } else if (scale === '5.0') {
      return Math.max(1.0, Math.min(5.0, grade));
    }
  }

  return 0;
}

/**
 * Calculate semester GPA and analysis
 * @param courses - Array of courses with grades and credits
 * @param gradingScale - Target grading scale
 * @returns Semester grade calculation result
 */
export function calculateSemesterGPA(
  courses: Course[], 
  gradingScale: GradingScale
): SemesterGradeResult {
  // Filter included courses
  const includedCourses = courses.filter(course => 
    course.isIncluded !== false
  );

  if (includedCourses.length === 0) {
    return {
      weightedAverage: 0,
      semesterGPA: 0,
      totalCredits: 0,
      totalGradePoints: 0,
      courseCount: 0,
      gradeDistribution: {},
      performanceAnalysis: {
        highestPerforming: [],
        lowestPerforming: [],
        averageCredits: 0
      },
      recommendations: ['没有有效的课程数据']
    };
  }

  // Calculate grade points for each course
  const coursesWithPoints = includedCourses.map(course => ({
    ...course,
    gradePoints: course.gradePoints || convertGradeToPoints(course.grade, gradingScale)
  }));

  // Calculate totals
  const totalCredits = coursesWithPoints.reduce((sum, course) => sum + course.credits, 0);
  const totalGradePoints = coursesWithPoints.reduce(
    (sum, course) => sum + (course.gradePoints! * course.credits), 0
  );
  const semesterGPA = totalGradePoints / totalCredits;

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  coursesWithPoints.forEach(course => {
    const gradeStr = course.grade.toString();
    gradeDistribution[gradeStr] = (gradeDistribution[gradeStr] || 0) + 1;
  });

  // Performance analysis
  const sortedByGradePoints = [...coursesWithPoints].sort((a, b) => b.gradePoints! - a.gradePoints!);
  const averageCredits = totalCredits / coursesWithPoints.length;

  const performanceAnalysis = {
    highestPerforming: sortedByGradePoints.slice(0, Math.ceil(coursesWithPoints.length * 0.3)),
    lowestPerforming: sortedByGradePoints.slice(-Math.ceil(coursesWithPoints.length * 0.3)),
    averageCredits: Math.round(averageCredits * 10) / 10
  };

  // Generate recommendations
  const recommendations: string[] = [];
  if (semesterGPA >= 3.5) {
    recommendations.push('优秀的学期表现！继续保持。');
  } else if (semesterGPA >= 3.0) {
    recommendations.push('良好的学期表现，可以进一步提升。');
  } else if (semesterGPA >= 2.5) {
    recommendations.push('学期表现一般，建议加强学习方法。');
  } else {
    recommendations.push('需要重视学习问题，建议寻求学习帮助。');
  }

  if (performanceAnalysis.lowestPerforming.length > 0) {
    const lowestCourse = performanceAnalysis.lowestPerforming[0];
    recommendations.push(`重点关注${lowestCourse.name}的学习。`);
  }

  return {
    weightedAverage: Math.round(semesterGPA * 100 * 10) / 10,
    semesterGPA: Math.round(semesterGPA * 100) / 100,
    totalCredits,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
    courseCount: coursesWithPoints.length,
    gradeDistribution,
    performanceAnalysis,
    recommendations
  };
}

/**
 * Calculate cumulative GPA with competitive analysis
 * @param courses - All courses across semesters
 * @param sourceGradingSystem - Source grading scale
 * @param targetGradingSystem - Target grading scale
 * @returns Cumulative GPA calculation result
 */
export function calculateCumulativeGPA(
  courses: Course[],
  sourceGradingSystem: GradingScale,
  targetGradingSystem: GradingScale
): CumulativeGPAResult {
  // Convert all grades to target system if needed
  const convertedCourses = courses.map(course => ({
    ...course,
    gradePoints: convertGradeToPoints(course.grade, targetGradingSystem)
  }));

  // Calculate cumulative totals
  const totalCredits = convertedCourses.reduce((sum, course) => sum + course.credits, 0);
  const totalGradePoints = convertedCourses.reduce(
    (sum, course) => sum + (course.gradePoints * course.credits), 0
  );
  const cumulativeGPA = totalGradePoints / totalCredits;

  // Grade distribution
  const gradeDistribution: Record<string, number> = {};
  convertedCourses.forEach(course => {
    const gradeStr = course.grade.toString();
    gradeDistribution[gradeStr] = (gradeDistribution[gradeStr] || 0) + 1;
  });

  // Competitive analysis
  let competitiveLevel: CumulativeGPAResult['competitiveAnalysis']['competitiveLevel'];
  let percentile: number;

  if (cumulativeGPA >= 3.8) {
    competitiveLevel = 'excellent';
    percentile = 95;
  } else if (cumulativeGPA >= 3.5) {
    competitiveLevel = 'good';
    percentile = 80;
  } else if (cumulativeGPA >= 3.0) {
    competitiveLevel = 'average';
    percentile = 60;
  } else {
    competitiveLevel = 'below-average';
    percentile = 30;
  }

  // Generate improvement suggestions
  const improvementSuggestions: string[] = [];
  if (cumulativeGPA < 3.5) {
    improvementSuggestions.push('考虑重修低分课程提高GPA');
    improvementSuggestions.push('选择相对容易获得高分的选修课');
    improvementSuggestions.push('寻求学术辅导和学习资源');
  }
  if (cumulativeGPA >= 3.5) {
    improvementSuggestions.push('保持当前学习水平');
    improvementSuggestions.push('挑战更高难度的课程');
  }

  return {
    cumulativeGPA: Math.round(cumulativeGPA * 100) / 100,
    totalCredits,
    totalGradePoints: Math.round(totalGradePoints * 100) / 100,
    courseCount: convertedCourses.length,
    gradeDistribution,
    competitiveAnalysis: {
      percentile,
      competitiveLevel,
      improvementSuggestions
    },
    conversionDetails: {
      originalSystem: sourceGradingSystem,
      targetSystem: targetGradingSystem,
      conversionApplied: sourceGradingSystem !== targetGradingSystem 
        ? { 'conversion_applied': 1 } 
        : { 'no_conversion': 1 }
    }
  };
}

/**
 * Validate grade input data
 * @param grades - Array of grade items to validate
 * @param allowNormalization - Whether to allow weight normalization
 * @throws ValidationError if data is invalid
 */
export function validateGradeInputs(
  grades: GradeItem[], 
  allowNormalization: boolean = false
): void {
  if (!Array.isArray(grades)) {
    throw new Error('Grades must be an array');
  }

  for (const grade of grades) {
    // Validate score
    if (typeof grade.score !== 'number' || grade.score < 0 || grade.score > 100) {
      throw new Error(`Invalid grade score: ${grade.score}. Must be between 0 and 100.`);
    }

    // Validate weight
    if (typeof grade.weight !== 'number' || grade.weight < 0 || grade.weight > 100) {
      throw new Error(`Invalid weight: ${grade.weight}. Must be between 0 and 100.`);
    }

    // Validate required fields
    if (!grade.id || typeof grade.id !== 'string') {
      throw new Error('Grade item must have a valid id');
    }

    if (!grade.name || typeof grade.name !== 'string') {
      throw new Error('Grade item must have a valid name');
    }
  }

  // Validate total weights
  if (!allowNormalization && grades.length > 0) {
    const totalWeight = grades.reduce((sum, grade) => sum + grade.weight, 0);
    if (Math.abs(totalWeight - 100) > 0.01) {
      throw new Error(`Total weights must equal 100%. Current total: ${totalWeight}%`);
    }
  }
}
