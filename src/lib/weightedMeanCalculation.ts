import {
  WeightedPair,
  WeightingStrategy,
  WeightedMeanResult,
  WeightedMeanError,
  WeightedMeanCalculationResult,
  ProcessedPair
} from '@/types/weightedMean';

/**
 * Validates input pairs for weighted mean calculation
 */
function validatePairs(pairs: WeightedPair[]): WeightedMeanError | null {
  if (!pairs || pairs.length === 0) {
    return {
      code: 'INVALID_PAIRS',
      message: 'No valid value:weight pairs found. Please enter at least one pair.',
      pairs
    };
  }

  // Check for invalid numbers
  const invalidPairs = pairs.filter(pair => 
    !isFinite(pair.value) || !isFinite(pair.weight) ||
    isNaN(pair.value) || isNaN(pair.weight)
  );

  if (invalidPairs.length > 0) {
    return {
      code: 'INVALID_PAIRS',
      message: 'Some pairs contain invalid numbers. Please check your input.',
      pairs: invalidPairs
    };
  }

  return null;
}

/**
 * Processes pairs according to weighting strategy
 */
function processPairs(
  pairs: WeightedPair[],
  strategy: WeightingStrategy
): { processedPairs: ProcessedPair[]; excludedCount: number } {
  let workingPairs = [...pairs];
  let excludedCount = 0;

  // Handle zero weights
  const zeroWeightPairs = workingPairs.filter(pair => pair.weight === 0);
  if (zeroWeightPairs.length > 0) {
    switch (strategy.zeroWeightStrategy) {
      case 'ignore':
        workingPairs = workingPairs.filter(pair => pair.weight !== 0);
        excludedCount += zeroWeightPairs.length;
        break;
      case 'error':
        throw new Error('Zero weight values found. Please adjust your weighting strategy or data.');
      case 'include':
        // Keep zero weight pairs
        break;
    }
  }

  // Handle negative weights (treat as error)
  const negativeWeightPairs = workingPairs.filter(pair => pair.weight < 0);
  if (negativeWeightPairs.length > 0) {
    throw new Error('Negative weights are not supported. Please use positive weight values.');
  }

  // Calculate total weights for contribution calculation
  const totalWeights = workingPairs.reduce((sum, pair) => sum + pair.weight, 0);

  if (totalWeights === 0) {
    return { processedPairs: [], excludedCount: pairs.length };
  }

  // Process pairs with contribution and normalization
  const processedPairs: ProcessedPair[] = workingPairs.map((pair, index) => {
    const points = pair.value * pair.weight;
    const contribution = totalWeights > 0 ? (pair.weight / totalWeights) * 100 : 0;
    const normalizedWeight = strategy.normalizeWeights && totalWeights > 0 ? pair.weight / totalWeights : pair.weight;

    return {
      ...pair,
      id: pair.id || `pair-${index}`,
      points,
      contribution,
      normalizedWeight
    };
  });

  return { processedPairs, excludedCount };
}

/**
 * Calculates weight distribution statistics
 */
function calculateWeightDistribution(pairs: ProcessedPair[]) {
  if (pairs.length === 0) {
    return { min: 0, max: 0, mean: 0, std: 0 };
  }

  const weights = pairs.map(pair => pair.weight);
  const min = Math.min(...weights);
  const max = Math.max(...weights);
  const mean = weights.reduce((sum, w) => sum + w, 0) / weights.length;
  
  // Calculate standard deviation
  const variance = weights.reduce((sum, w) => sum + Math.pow(w - mean, 2), 0) / weights.length;
  const std = Math.sqrt(variance);

  return { min, max, mean, std };
}

/**
 * Generates calculation steps for educational purposes
 */
function generateCalculationSteps(
  originalPairs: WeightedPair[],
  processedPairs: ProcessedPair[],
  result: number,
  totalWeights: number,
  totalWeightedValue: number,
  excludedCount: number,
  strategy: WeightingStrategy
): string[] {
  const steps: string[] = [];

  // Step 1: Input processing
  steps.push(`Input processing: Found ${originalPairs.length} value:weight pairs`);

  // Step 2: Weight strategy application
  if (excludedCount > 0) {
    steps.push(`Applied weighting strategy: Excluded ${excludedCount} pairs with zero weights`);
  }

  // Step 3: Valid pairs summary
  steps.push(`Valid pairs for calculation: ${processedPairs.length} pairs`);

  // Step 4: Weighted sum calculation
  if (processedPairs.length <= 10) {
    // Show detailed calculation for small datasets
    const detailedCalc = processedPairs
      .map(pair => `${pair.value} × ${pair.weight} = ${pair.points.toFixed(2)}`)
      .join(' + ');
    steps.push(`Weighted sum: ${detailedCalc} = ${totalWeightedValue.toFixed(strategy.precision)}`);
  } else {
    // Show summary for large datasets
    steps.push(`Weighted sum: Σ(value × weight) = ${totalWeightedValue.toFixed(strategy.precision)}`);
  }

  // Step 5: Total weights
  if (processedPairs.length <= 10) {
    const weightsSum = processedPairs.map(pair => pair.weight.toString()).join(' + ');
    steps.push(`Total weights: ${weightsSum} = ${totalWeights}`);
  } else {
    steps.push(`Total weights: Σ(weights) = ${totalWeights}`);
  }

  // Step 6: Final calculation
  steps.push(`Weighted mean: ${totalWeightedValue.toFixed(strategy.precision)} ÷ ${totalWeights} = ${result.toFixed(strategy.precision)}`);

  return steps;
}

/**
 * Main weighted mean calculation function
 */
export function calculateWeightedMean(
  pairs: WeightedPair[],
  strategy: WeightingStrategy
): WeightedMeanCalculationResult {
  try {
    // Validate input
    const validationError = validatePairs(pairs);
    if (validationError) {
      return { success: false, error: validationError };
    }

    // Process pairs according to strategy
    const { processedPairs, excludedCount } = processPairs(pairs, strategy);

    if (processedPairs.length === 0) {
      return {
        success: false,
        error: {
          code: 'INVALID_PAIRS',
          message: 'No valid pairs remaining after applying weighting strategy.',
          pairs
        }
      };
    }

    // Calculate weighted mean
    const totalWeightedValue = processedPairs.reduce((sum, pair) => sum + pair.points, 0);
    const totalWeights = processedPairs.reduce((sum, pair) => sum + pair.weight, 0);

    if (totalWeights === 0) {
      return {
        success: false,
        error: {
          code: 'ZERO_SUM_WEIGHTS',
          message: 'Sum of weights is zero. Please adjust weights or choose a different strategy.',
          pairs: processedPairs
        }
      };
    }

    const weightedMean = totalWeightedValue / totalWeights;

    // Generate calculation steps
    const steps = generateCalculationSteps(
      pairs,
      processedPairs,
      weightedMean,
      totalWeights,
      totalWeightedValue,
      excludedCount,
      strategy
    );

    // Calculate weight distribution
    const weightDistribution = calculateWeightDistribution(processedPairs);

    // Prepare result
    const result: WeightedMeanResult = {
      weightedMean: parseFloat(weightedMean.toFixed(strategy.precision)),
      totalWeights,
      totalWeightedValue: parseFloat(totalWeightedValue.toFixed(strategy.precision)),
      validPairs: processedPairs.length,
      excludedPairs: excludedCount,
      pairs: processedPairs,
      steps,
      weightDistribution,
      metadata: {
        strategy,
        timestamp: new Date().toISOString(),
        hasZeroWeights: pairs.some(pair => pair.weight === 0),
        hasMissingWeights: false // Will be set by input parsing logic
      }
    };

    return { success: true, result };

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown calculation error';
    
    return {
      success: false,
      error: {
        code: 'INVALID_STRATEGY',
        message: errorMessage,
        pairs
      }
    };
  }
}

/**
 * Utility function to create default weighting strategy
 */
export function createDefaultStrategy(precision: number = 2): WeightingStrategy {
  return {
    zeroWeightStrategy: 'ignore',
    missingWeightStrategy: 'zero',
    normalizeWeights: false,
    precision
  };
}

/**
 * Utility function to validate and parse numeric input
 */
export function parseNumericValue(value: string | number): number | null {
  if (typeof value === 'number') {
    return isFinite(value) ? value : null;
  }
  
  const parsed = parseFloat(value.toString().trim());
  return isFinite(parsed) ? parsed : null;
}