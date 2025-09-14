/**
 * Type definitions for Variance Calculator
 * Supports both sample and population variance calculations with comprehensive statistical analysis
 */

export type VarianceDataInputMode = 'manual' | 'csv' | 'excel' | 'paste';

export interface VarianceDataPoint {
  id: string;
  value: number;
  label?: string;
  excluded?: boolean;
  weight?: number; // For weighted variance
}

export interface VarianceResult {
  // Core statistical measures
  mean: number;
  sampleVariance: number;
  populationVariance: number;
  standardDeviation: number;

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
  validDataPoints: VarianceDataPoint[];
  excludedDataPoints: VarianceDataPoint[];
  outliers: VarianceDataPoint[];

  // Calculation metadata
  calculationType: 'sample' | 'population';
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

export interface VarianceDataInputConfig {
  type: VarianceDataInputMode;
  delimiter?: string;
  hasHeaders?: boolean;
  columnMapping?: {
    value: number;
    label?: number;
    weight?: number;
  };
}

export interface VarianceCalculatorState {
  dataPoints: VarianceDataPoint[];
  inputMode: VarianceDataInputConfig;
  calculationType: 'sample' | 'population';
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

// Hook return types
export interface UseVarianceCalculation {
  result: VarianceResult | null;
  isCalculating: boolean;
  error: string | null;
  calculate: (dataPoints: VarianceDataPoint[], options: Partial<VarianceCalculatorState>) => Promise<void>;
  reset: () => void;
  addDataPoint: (point: VarianceDataPoint) => void;
  removeDataPoint: (id: string) => void;
  updateDataPoint: (id: string, updates: Partial<VarianceDataPoint>) => void;
  validateData: (points: VarianceDataPoint[]) => { valid: boolean; errors: string[] };
}

// Validation schemas
export interface VarianceValidationRule {
  field: keyof VarianceDataPoint;
  validator: (value: any) => boolean;
  message: string;
}

export interface VarianceDataValidationResult {
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

// Error types
export class VarianceError extends Error {
  constructor(
    message: string,
    public code: string,
    public details?: any
  ) {
    super(message);
    this.name = 'VarianceError';
  }
}

// Utility types
export type VarianceTest = 'shapiro-wilk' | 'kolmogorov-smirnov' | 'anderson-darling';

export interface VarianceNormalityTestResult {
  test: VarianceTest;
  statistic: number;
  pValue: number;
  isNormal: boolean;
  alpha: number;
}

export interface VarianceConfidenceIntervalResult {
  level: number;
  lowerBound: number;
  upperBound: number;
  marginOfError: number;
}