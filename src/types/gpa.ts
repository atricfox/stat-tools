/**
 * Type definitions for GPA Calculator
 * Supports multiple grading systems, batch processing, and international conversions
 */

export interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
  gradePoints?: number;
  semester?: string;
  academicYear?: string;
  isRetake?: boolean;
  excluded?: boolean;
  weight?: number; // For weighted GPA calculations
  courseType?: 'major' | 'minor' | 'elective' | 'core';
}

export interface GradeMapping {
  letterGrade: string;        // A+, A, A-, B+, etc.
  numericMin: number;         // Minimum numeric score
  numericMax: number;         // Maximum numeric score
  gradePoints: number;        // Points for this grade
  percentageMin?: number;     // Minimum percentage
  percentageMax?: number;     // Maximum percentage
  description?: string;       // Grade description
}

export interface GradePointSystem {
  id: string;
  name: string;
  scale: number;              // 4.0, 4.3, 4.5, etc.
  country: string;
  description: string;
  mappings: GradeMapping[];
  isOfficial: boolean;
  source?: string;            // Official source URL
  customMappings?: GradeMapping[];
}

export interface GPAResult {
  gpa: number;
  totalCredits: number;
  totalGradePoints: number;
  weightedGPA?: number;
  courses: CourseGradeResult[];
  system: GradePointSystem;
  
  // Academic performance analysis
  academicStanding: {
    level: 'Excellent' | 'Good' | 'Satisfactory' | 'Warning' | 'Probation';
    description: string;
    recommendations: string[];
    competitiveness?: 'Very Competitive' | 'Competitive' | 'Moderate' | 'Below Average';
  };
  
  // Semester breakdown
  semester?: {
    current: number;
    cumulative: number;
    trend: 'improving' | 'stable' | 'declining';
    projection?: number;
  };
  
  // Statistical analysis
  statistics: {
    mean: number;
    median: number;
    mode?: string;
    distribution: GradeDistribution[];
    creditWeightedAverage: number;
    standardDeviation?: number;
  };
  
  // Educational insights
  calculationSteps: GPACalculationStep[];
  timestamp: string;
  metadata?: {
    institution?: string;
    program?: string;
    graduationRequirement?: number;
  };
}

export interface CourseGradeResult {
  course: Course;
  gradePoints: number;
  qualityPoints: number; // gradePoints * credits
  isIncluded: boolean;
  conversionNote?: string;
}

export interface GradeDistribution {
  grade: string;
  count: number;
  credits: number;
  percentage: number;
}

export interface GPACalculationStep {
  id: string;
  title: string;
  description: string;
  formula?: string;
  calculation: string;
  result: string;
  explanation: string;
  difficulty: 'basic' | 'intermediate' | 'advanced';
}

// Input and processing types
export interface GPAInputMode {
  type: 'manual' | 'transcript' | 'csv' | 'batch';
  format?: 'text' | 'pdf' | 'excel';
  transcriptParser?: TranscriptParserConfig;
}

export interface TranscriptParserConfig {
  delimiter?: string;
  hasHeaders?: boolean;
  courseNameColumn: number;
  creditsColumn: number;
  gradeColumn: number;
  semesterColumn?: number;
}

export interface GPACalculatorState {
  courses: Course[];
  inputMode: GPAInputMode;
  gradeSystem: GradePointSystem;
  precision: number;
  userMode: 'student' | 'research' | 'teacher';
  showSteps: boolean;
  showVisualization: boolean;
  
  // Calculation options
  includeRetakes: boolean;
  retakePolicy: 'latest' | 'highest' | 'average' | 'all';
  excludeFailed: boolean;
  useWeights: boolean;
  
  // Academic settings
  graduationRequirement?: number;
  currentSemester?: string;
  academicYear?: string;
  
  // Metadata for sharing
  metadata?: {
    title?: string;
    description?: string;
    institution?: string;
    program?: string;
    tags?: string[];
  };
  
  timestamp: number;
  version: string;
}

// Batch processing for multiple students
export interface StudentTranscript {
  studentId: string;
  studentName: string;
  courses: Course[];
  metadata: {
    semester: string;
    academicYear: string;
    program: string;
    institution?: string;
  };
}

export interface BatchGPAResults {
  summary: {
    totalStudents: number;
    averageGPA: number;
    gpaDistribution: GPADistributionRange[];
    creditDistribution: CreditDistribution[];
    academicStandingBreakdown: AcademicStandingCount[];
  };
  students: StudentGPAResult[];
  classStatistics: {
    mean: number;
    median: number;
    standardDeviation: number;
    percentiles: Record<number, number>;
    range: {
      min: number;
      max: number;
    };
  };
  qualityReport: DataQualityReport;
}

export interface StudentGPAResult {
  student: StudentTranscript;
  gpaResult: GPAResult;
  ranking?: {
    position: number;
    percentile: number;
    total: number;
  };
  warnings: string[];
}

export interface GPADistributionRange {
  range: string;
  count: number;
  percentage: number;
  standing: string;
}

export interface CreditDistribution {
  range: string;
  count: number;
  percentage: number;
}

export interface AcademicStandingCount {
  standing: 'Excellent' | 'Good' | 'Satisfactory' | 'Warning' | 'Probation';
  count: number;
  percentage: number;
}

export interface DataQualityReport {
  totalRecords: number;
  validRecords: number;
  errorCount: number;
  warningCount: number;
  errors: DataQualityIssue[];
  warnings: DataQualityIssue[];
  confidence: number; // 0-100%
}

export interface DataQualityIssue {
  studentId?: string;
  courseId?: string;
  type: 'missing_grade' | 'invalid_credits' | 'unknown_grade' | 'duplicate_course';
  field: string;
  value: any;
  suggestion?: string;
  severity: 'error' | 'warning';
}

// GPA system conversion
export interface GPAConversionResult {
  originalGPA: GPAResult;
  convertedGPA: number;
  targetSystem: GradePointSystem;
  conversionMethod: 'linear' | 'percentile' | 'standard' | 'institutional';
  accuracy: ConversionAccuracy;
  limitations: string[];
  recommendations: string[];
  competitivenessAnalysis: {
    level: 'Very Competitive' | 'Competitive' | 'Moderate' | 'Below Average';
    percentile: number;
    targetInstitutions?: string[];
    improvementSuggestions: string[];
  };
}

export interface ConversionAccuracy {
  confidence: number; // 0-100%
  methodology: string;
  limitations: string[];
  sourceReliability: 'official' | 'standard' | 'estimated';
}

export interface GradeSystemPair {
  source: GradePointSystem;
  target: GradePointSystem;
  conversionTable: GradeConversionMapping[];
  officialSource?: string;
}

export interface GradeConversionMapping {
  sourceGrade: string;
  sourceRange: [number, number];
  targetGrade: string;
  targetPoints: number;
  confidence: number;
}

// Hooks return types
export interface UseGPACalculation {
  result: GPAResult | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (courses: Course[], system: GradePointSystem, options?: Partial<GPACalculatorState>) => void;
  reset: () => void;
  addCourse: (course: Omit<Course, 'id'>) => Course;
  removeCourse: (courseId: string) => void;
  updateCourse: (courseId: string, updates: Partial<Course>) => void;
  validateCourse: (course: Course) => ValidationResult;
  loadExample: (systemId: string) => void;
  clearAll: () => void;
  
  // Extended functionality
  courses: Course[];
  addCourses: (courses: Omit<Course, 'id'>[]) => Course[];
  toggleCourseExclusion: (courseId: string) => void;
  markAsRetake: (courseId: string, isRetake?: boolean) => void;
  courseStatistics: {
    totalCourses: number;
    includedCourses: number;
    excludedCourses: number;
    retakes: number;
    totalCredits: number;
  };
  validationSummary: {
    isValid: boolean;
    errorCount: number;
    warningCount: number;
    message: string;
  };
  calculateWithCurrentCourses: (system: GradePointSystem, options?: Partial<GPACalculatorState>) => Promise<void>;
  calculateWithCompatibleCourses: (system: GradePointSystem, options?: Partial<GPACalculatorState>) => Promise<void>;
  exportCourses: (format?: 'json' | 'csv') => string;
  importCourses: (data: string, format?: 'json' | 'csv') => number;
}

export interface BatchProcessingOptions {
  chunkSize: number;
  enableProgressTracking: boolean;
  maxRecords: number;
  validationRules?: {
    minCredits?: number;
    maxCredits?: number;
    requireAllFields?: boolean;
    allowDuplicates?: boolean;
  };
}

export interface UseBatchGPAProcessing {
  isProcessing: boolean;
  progress: number;
  results: BatchGPAResults | null;
  errors: string[];
  processTranscripts: (students: StudentTranscript[], system: GradePointSystem) => Promise<void>;
  processFile: (file: File, options: BatchProcessingOptions) => Promise<void>;
  downloadResults: (format: 'csv' | 'excel' | 'pdf') => void;
  reset: () => void;
}

export interface UseGPAConversion {
  convertGPA: (sourceGPA: GPAResult, targetSystem: GradePointSystem) => GPAConversionResult;
  getSupportedConversions: () => GradeSystemPair[];
  isConversionSupported: (sourceId: string, targetId: string) => boolean;
  getConversionAccuracy: (sourceId: string, targetId: string) => ConversionAccuracy;
}

// Validation and error handling
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  value: any;
  code: string;
  suggestion?: string;
}

export interface ValidationWarning {
  field: string;
  message: string;
  value: any;
  suggestion?: string;
}

export class GPACalculationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'GPACalculationError';
  }
}

// Educational content types
export interface GPAEducationalContent {
  concept: string;
  explanation: string;
  examples: GPAExample[];
  tips: string[];
  commonMistakes: string[];
  resources: EducationalResource[];
}

export interface GPAExample {
  title: string;
  courses: Course[];
  expectedGPA: number;
  system: GradePointSystem;
  explanation: string;
}

export interface EducationalResource {
  title: string;
  type: 'article' | 'video' | 'calculator' | 'guide';
  url: string;
  description: string;
}

// Sharing and export types
export interface GPAShareableState {
  id: string;
  url: string;
  shortUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
  isPublic: boolean;
  calculatorType: 'gpa';
  preview: {
    courseCount: number;
    gpa?: number;
    totalCredits?: number;
    system?: string;
    title?: string;
  };
}

export interface GPAExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'transcript';
  includeCalculationSteps: boolean;
  includeRecommendations: boolean;
  includeGradeBreakdown: boolean;
  officialFormat?: boolean;
  institutionHeader?: {
    name: string;
    logo?: string;
    address?: string;
  };
}

// Configuration types
export interface GPACalculatorConfig {
  defaultSystem: string;
  supportedSystems: string[];
  enableBatchProcessing: boolean;
  enableConversions: boolean;
  maxCoursesPerStudent: number;
  maxStudentsPerBatch: number;
  educationalMode: boolean;
  customSystemsAllowed: boolean;
}

// Analytics and insights
export interface GPAInsights {
  trends: {
    semesterTrend: 'improving' | 'stable' | 'declining';
    projectedGPA?: number;
    graduationForecast?: {
      onTrack: boolean;
      estimatedGPA: number;
      recommendedActions: string[];
    };
  };
  comparisons: {
    programAverage?: number;
    institutionAverage?: number;
    percentileRank?: number;
  };
  recommendations: {
    immediate: string[];
    longTerm: string[];
    courseSelection: string[];
    studyStrategies: string[];
  };
}