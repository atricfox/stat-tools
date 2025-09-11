/**
 * TypeScript interfaces for Unweighted GPA Calculator
 * Based on standard 4.0 grading scale without course difficulty weights
 */

export interface UnweightedCourse {
  id: string;
  courseName: string;
  credits: number;
  letterGrade: string;
}

export interface UnweightedGPAResult {
  gpa: number;
  totalCredits: number;
  totalQualityPoints: number;
  courses: UnweightedCourse[];
  gradeDistribution: Record<string, {
    count: number;
    percentage: number;
    totalCredits: number;
  }>;
  academicStatus: {
    level: 'Excellent' | 'Good' | 'Satisfactory' | 'Poor';
    description: string;
    color: string;
  };
  calculationSteps: Array<{
    id: string;
    title: string;
    description: string;
    calculation: string;
    result: string;
    formula?: string;
    explanation?: string;
  }>;
  metadata: {
    gradingSystem: string;
    calculatedAt: Date;
    precision: number;
  };
}

export interface UnweightedGradingSystem {
  id: string;
  name: string;
  description: string;
  scale: number; // 4.0
  mappings: Array<{
    letterGrade: string;
    gradePoints: number;
    description: string;
  }>;
}

export interface UseUnweightedGPACalculation {
  // State
  result: UnweightedGPAResult | null;
  isCalculating: boolean;
  error: string | null;
  courses: UnweightedCourse[];
  
  // Core calculation
  calculate: () => Promise<void>;
  
  // Course management
  addCourse: (course: Omit<UnweightedCourse, 'id'>) => void;
  updateCourse: (id: string, updates: Partial<UnweightedCourse>) => void;
  removeCourse: (id: string) => void;
  clearAll: () => void;
  
  // Utility functions
  loadExample: (systemId: string) => void;
  validateCourse: (course: Partial<UnweightedCourse>) => ValidationResult;
  
  // Export functions
  exportToCSV: () => string;
  exportToJSON: () => string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: Array<{
    field: string;
    message: string;
  }>;
}

export interface UnweightedGPACalculatorProps {
  initialGradingSystem?: UnweightedGradingSystem;
  initialPrecision?: number;
  className?: string;
}

// Error types
export class UnweightedGPACalculationError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = 'UnweightedGPACalculationError';
  }
}

// UI Content constants
export const UI_CONTENT = {
  title: 'Unweighted GPA Calculator',
  description: 'Calculate your standard unweighted GPA using 4.0 scale without course difficulty weights',
  
  labels: {
    courseName: 'Course Name',
    credits: 'Credits',
    letterGrade: 'Letter Grade',
    gpa: 'Final GPA',
    totalCredits: 'Total Credits',
    qualityPoints: 'Quality Points',
    gradeDistribution: 'Grade Distribution',
    academicStatus: 'Academic Status',
    calculationSteps: 'Calculation Steps',
    gradingSystem: 'Grading System',
    precision: 'Precision',
    sampleData: 'Sample Data'
  },
  
  buttons: {
    addCourse: 'Add Course',
    clearAll: 'Clear All',
    loadExample: 'Load Example',
    export: 'Export',
    share: 'Share',
    copy: 'Copy Results',
    remove: 'Remove',
    calculate: 'Calculate'
  },
  
  help: {
    title: 'How to Use Unweighted GPA Calculator',
    unweightedVsWeighted: 'Unweighted vs Weighted GPA',
    gradingSystems: 'Supported Grading Systems',
    tips: 'Tips for Students'
  },
  
  placeholders: {
    courseName: 'e.g., Mathematics, English Literature',
    credits: '1-10',
    selectGrade: 'Select grade'
  },
  
  validation: {
    courseNameRequired: 'Course name is required',
    courseNameTooLong: 'Course name must be less than 100 characters',
    creditsRequired: 'Credits are required',
    creditsRange: 'Credits must be between 0.5 and 10',
    gradeRequired: 'Grade selection is required',
    invalidGrade: 'Selected grade is not valid for current grading system'
  },
  
  status: {
    excellent: 'Excellent (3.7+)',
    good: 'Good (3.0-3.69)',
    satisfactory: 'Satisfactory (2.0-2.99)',
    poor: 'Poor (Below 2.0)',
    
    excellentDesc: 'Outstanding academic performance',
    goodDesc: 'Good academic standing',
    satisfactoryDesc: 'Satisfactory academic progress',
    poorDesc: 'Academic improvement needed'
  }
} as const;