/**
 * Type definitions for Standard Deviation Calculator
 * Supports both sample and population calculations with comprehensive statistical analysis
 */

export type StatisticalDataInputMode = 'manual' | 'csv' | 'excel' | 'paste';

export interface DataPoint {
  id: string;
  value: number;
  label?: string;
  excluded?: boolean;
  weight?: number; // For weighted standard deviation
}

export interface StandardDeviationResult {
  // Core statistical measures
  mean: number;
  sampleStandardDeviation: number;
  populationStandardDeviation: number;
  variance: number;
  sampleVariance: number;
  
  // Descriptive statistics
  count: number;
  sum: number;
  sumOfSquares: number;
  sumOfSquaredDeviations: number;
  
  // Range and quartiles
  min: number;
  max: number;
  range: number;
  median: number;
  q1: number;
  q3: number;
  iqr: number;
  
  // Additional measures
  skewness: number;
  kurtosis: number;
  coefficientOfVariation: number;
  standardError: number;
  
  // Data quality metrics
  validDataPoints: DataPoint[];
  excludedDataPoints: DataPoint[];
  outliers: DataPoint[];
  
  // Calculation metadata
  calculationType: 'sample' | 'population' | 'both';
  timestamp: string;
  steps: string[];
  distributionType?: 'normal' | 'skewed' | 'uniform' | 'bimodal';
  
  // For educational purposes
  deviations: Array<{
    value: number;
    deviation: number;
    squaredDeviation: number;
  }>;
}

export interface StatisticalDataInputConfig {
  type: StatisticalDataInputMode;
  delimiter?: string;
  hasHeaders?: boolean;
  columnMapping?: {
    value: number;
    label?: number;
    weight?: number;
  };
}

export interface StandardDeviationCalculatorState {
  dataPoints: DataPoint[];
  inputMode: StatisticalDataInputConfig;
  calculationType: 'sample' | 'population' | 'both';
  precision: number;
  userMode: 'student' | 'research' | 'teacher';
  showSteps: boolean;
  showOutliers: boolean;
  showVisualization: boolean;
  excludeOutliers: boolean;
  outlierMethod: 'iqr' | 'zscore' | 'modified_zscore';
  outlierThreshold: number;
  
  // Advanced options
  useWeights: boolean;
  normalityTest: boolean;
  confidenceInterval: number; // 90, 95, 99
  
  // Metadata for sharing
  metadata?: {
    title?: string;
    description?: string;
    dataset?: string;
    source?: string;
    tags?: string[];
    author?: string;
  };
  
  timestamp: number;
  version: string;
}

export interface BatchProcessingOptions {
  chunkSize: number;
  enableProgressTracking: boolean;
  maxRecords: number;
  validationRules?: {
    minValue?: number;
    maxValue?: number;
    allowNegative?: boolean;
    requireLabels?: boolean;
  };
}

export interface StatisticalVisualizationConfig {
  chartType: 'histogram' | 'boxplot' | 'scatter' | 'qq' | 'normal';
  showMean: boolean;
  showMedian: boolean;
  showStandardDeviation: boolean;
  showOutliers: boolean;
  showNormalCurve: boolean;
  bins?: number; // For histogram
  width?: number;
  height?: number;
}

export interface GradePointSystem {
  name: string;
  scale: number;
  grades: Array<{
    letter: string;
    points: number;
    minPercentage?: number;
    maxPercentage?: number;
  }>;
  isCustom: boolean;
}

export interface StandardDeviationShareableState {
  id: string;
  url: string;
  shortUrl?: string;
  qrCode?: string;
  expiresAt?: Date;
  isPublic: boolean;
  calculatorType: 'standard-deviation';
  preview: {
    dataPointCount: number;
    mean?: number;
    standardDeviation?: number;
    calculationType?: 'sample' | 'population' | 'both';
    title?: string;
  };
}

// Hook return types
export interface UseStandardDeviationCalculation {
  result: StandardDeviationResult | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (dataPoints: DataPoint[], options: Partial<StandardDeviationCalculatorState>) => Promise<void>;
  reset: () => void;
  addDataPoint: (point: DataPoint) => void;
  removeDataPoint: (id: string) => void;
  updateDataPoint: (id: string, updates: Partial<DataPoint>) => void;
  validateData: (points: DataPoint[]) => { valid: boolean; errors: string[] };
}

export interface UseBatchProcessing {
  isProcessing: boolean;
  progress: number;
  results: StandardDeviationResult[];
  errors: string[];
  processFile: (file: File, options: BatchProcessingOptions) => Promise<void>;
  downloadResults: (format: 'csv' | 'json' | 'excel') => void;
  reset: () => void;
}

// Utility types
export type StatisticalTest = 'shapiro-wilk' | 'kolmogorov-smirnov' | 'anderson-darling';

export interface NormalityTestResult {
  test: StatisticalTest;
  statistic: number;
  pValue: number;
  isNormal: boolean;
  alpha: number;
}

export interface ConfidenceIntervalResult {
  level: number;
  lowerBound: number;
  upperBound: number;
  marginOfError: number;
}

// Error types
export class StandardDeviationError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'StandardDeviationError';
  }
}

// Validation schemas
export interface ValidationRule {
  field: keyof DataPoint;
  validator: (value: any) => boolean;
  message: string;
}

export interface DataValidationResult {
  isValid: boolean;
  errors: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
  warnings: Array<{
    row: number;
    field: string;
    message: string;
    value: any;
  }>;
}
