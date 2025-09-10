/**
 * Education domain types for grade calculations and GPA management
 * Supports multiple grading systems and educational contexts
 */

// Core grade item interface
export interface GradeItem {
  id: string;
  name: string;
  score: number;
  weight: number; // Percentage (0-100)
  maxScore?: number;
  isCompleted?: boolean;
  category?: string; // 'exam' | 'homework' | 'project' | 'participation'
}

// Course information for semester/cumulative calculations
export interface Course {
  id: string;
  name: string;
  grade: number | string; // Numeric or letter grade
  credits: number;
  gradePoints?: number; // Calculated based on grading scale
  semester?: string;
  isIncluded?: boolean;
}

// Grading system configurations
export type GradingScale = '4.0' | '5.0' | 'percentage' | 'letter';

export interface GradingSystemConfig {
  scale: GradingScale;
  conversionTable: Record<string, number>;
  letterGrades?: Record<string, string>;
  passingGrade: number;
  maxGrade: number;
}

// Final grade calculator specific types
export interface FinalGradeCalculationOptions {
  currentGrades: GradeItem[];
  finalExamWeight: number; // Percentage (0-100)
  targetGrade: number;
  gradeScale?: GradingScale;
  passingGrade?: number;
}

export interface FinalGradeResult {
  requiredScore: number;
  isAchievable: boolean;
  currentWeightedScore: number;
  maxPossibleGrade: number;
  difficultyLevel: 'easy' | 'moderate' | 'challenging' | 'impossible';
  recommendation: string;
  calculationSteps: {
    id: string;
    title: string;
    description: string;
    formula: string;
    calculation: string;
    result: string;
    explanation: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
  }[];
}

// Semester grade calculator types
export interface SemesterCalculationOptions {
  courses: Course[];
  targetGradingScale: GradingScale;
  includeGPA?: boolean;
}

export interface SemesterGradeResult {
  weightedAverage: number;
  semesterGPA: number;
  totalCredits: number;
  totalGradePoints: number;
  courseCount: number;
  gradeDistribution: Record<string, number>;
  performanceAnalysis: {
    highestPerforming: Course[];
    lowestPerforming: Course[];
    averageCredits: number;
  };
  recommendations: string[];
  calculationSteps: {
    id: string;
    title: string;
    description: string;
    formula: string;
    calculation: string;
    result: string;
    explanation: string;
    difficulty: 'basic' | 'intermediate' | 'advanced';
  }[];
}

// Cumulative GPA calculator types
export interface CumulativeGPAOptions {
  courses: Course[];
  sourceGradingSystem: GradingScale;
  targetGradingSystem: GradingScale;
  conversionStandard?: 'standard' | 'liberal' | 'conservative';
}

export interface CumulativeGPAResult {
  cumulativeGPA: number;
  totalCredits: number;
  totalGradePoints: number;
  courseCount: number;
  semesterBreakdown?: SemesterGradeResult[];
  gradeDistribution: Record<string, number>;
  competitiveAnalysis: {
    percentile: number;
    competitiveLevel: 'excellent' | 'good' | 'average' | 'below-average';
    improvementSuggestions: string[];
  };
  conversionDetails: {
    originalSystem: string;
    targetSystem: string;
    conversionApplied: Record<string, number>;
  };
}

// What-if analysis types
export interface WhatIfScenario {
  scenarioName: string;
  modifications: Array<{
    courseId: string;
    newGrade: number;
    newCredits?: number;
  }>;
}

export interface WhatIfResult {
  originalGPA: number;
  projectedGPA: number;
  improvement: number;
  impactAnalysis: string;
}

// Grade conversion utilities
export interface GradeConversionRule {
  sourceRange: { min: number; max: number };
  targetValue: number;
  letterGrade?: string;
  description?: string;
}

export interface ConversionTable {
  name: string;
  sourceScale: GradingScale;
  targetScale: GradingScale;
  rules: GradeConversionRule[];
  metadata: {
    country?: string;
    institution?: string;
    year?: number;
    source?: string;
  };
}

// Validation and error types
export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface CalculationError extends Error {
  code: string;
  context?: Record<string, any>;
}

// Educational constants
export const COMMON_GRADING_SYSTEMS: Record<GradingScale, GradingSystemConfig> = {
  '4.0': {
    scale: '4.0',
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
    scale: '5.0',
    conversionTable: {
      'A': 5.0, 'B': 4.0, 'C': 3.0, 'D': 2.0, 'F': 1.0
    },
    passingGrade: 3.0,
    maxGrade: 5.0
  },
  'percentage': {
    scale: 'percentage',
    conversionTable: {}, // Direct numeric mapping
    passingGrade: 60,
    maxGrade: 100
  },
  'letter': {
    scale: 'letter',
    conversionTable: {
      'A+': 97, 'A': 94, 'A-': 90,
      'B+': 87, 'B': 84, 'B-': 80,
      'C+': 77, 'C': 74, 'C-': 70,
      'D+': 67, 'D': 64, 'D-': 60,
      'F': 0
    },
    letterGrades: {
      'A+': 'Excellent+', 'A': 'Excellent', 'A-': 'Excellent-',
      'B+': 'Good+', 'B': 'Good', 'B-': 'Good-',
      'C+': 'Average+', 'C': 'Average', 'C-': 'Average-',
      'D+': 'Pass+', 'D': 'Pass', 'D-': 'Pass-',
      'F': 'Fail'
    },
    passingGrade: 60,
    maxGrade: 100
  }
};

// Export utility type guards
export function isValidGradeItem(item: any): item is GradeItem {
  return (
    typeof item === 'object' &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.score === 'number' &&
    typeof item.weight === 'number' &&
    item.score >= 0 &&
    item.weight >= 0 &&
    item.weight <= 100
  );
}

export function isValidCourse(course: any): course is Course {
  return (
    typeof course === 'object' &&
    typeof course.id === 'string' &&
    typeof course.name === 'string' &&
    (typeof course.grade === 'number' || typeof course.grade === 'string') &&
    typeof course.credits === 'number' &&
    course.credits > 0
  );
}