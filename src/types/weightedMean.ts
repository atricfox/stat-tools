export interface WeightedPair {
  value: number;
  weight: number;
  id?: string;
}

export interface WeightingStrategy {
  zeroWeightStrategy: 'ignore' | 'error' | 'include';
  missingWeightStrategy: 'zero' | 'ignore' | 'error';
  normalizeWeights: boolean;
  precision: number;
}

export interface ProcessedPair extends WeightedPair {
  contribution: number; // 贡献度百分比
  normalizedWeight: number; // 归一化权重
  points: number; // value * weight 的结果
}

export interface WeightedMeanResult {
  weightedMean: number;
  totalWeights: number;
  totalWeightedValue: number;
  validPairs: number;
  excludedPairs: number;
  pairs: ProcessedPair[];
  steps: string[];
  weightDistribution: {
    min: number;
    max: number;
    mean: number;
    std: number;
  };
  metadata: {
    inputMode?: 'pairs' | 'columns' | 'manual';
    strategy: WeightingStrategy;
    timestamp: string;
    hasZeroWeights: boolean;
    hasMissingWeights: boolean;
  };
}

export interface WeightedMeanError {
  code: 'INVALID_PAIRS' | 'ZERO_SUM_WEIGHTS' | 'MISSING_WEIGHTS' | 'INVALID_STRATEGY';
  message: string;
  field?: string;
  pairs?: WeightedPair[];
}

export type WeightedMeanCalculationResult = 
  | { success: true; result: WeightedMeanResult }
  | { success: false; error: WeightedMeanError };

export type UserMode = 'student' | 'research' | 'teacher';

export type InputMode = 'pairs' | 'columns' | 'manual';