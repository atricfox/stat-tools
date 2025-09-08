/**
 * Basic statistical calculations for mean and related measures
 */

export interface MeanCalculationResult {
  mean: number;
  count: number;
  sum: number;
  min: number;
  max: number;
  range: number;
  standardDeviation: number;
  variance: number;
}

/**
 * Calculate mean and basic statistics for a dataset
 */
export function calculateMean(numbers: number[]): MeanCalculationResult {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate mean of empty dataset');
  }

  // Filter out invalid numbers
  const validNumbers = numbers.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
  
  if (validNumbers.length === 0) {
    throw new Error('No valid numbers in dataset');
  }

  const count = validNumbers.length;
  const sum = validNumbers.reduce((acc, num) => acc + num, 0);
  const mean = sum / count;
  
  const min = Math.min(...validNumbers);
  const max = Math.max(...validNumbers);
  const range = max - min;
  
  // Calculate variance and standard deviation
  const squaredDifferences = validNumbers.map(num => Math.pow(num - mean, 2));
  const variance = squaredDifferences.reduce((acc, diff) => acc + diff, 0) / (count - 1);
  const standardDeviation = Math.sqrt(variance);

  return {
    mean,
    count,
    sum,
    min,
    max,
    range,
    standardDeviation,
    variance
  };
}

/**
 * Calculate mean with specified precision
 */
export function calculateMeanWithPrecision(numbers: number[], precision: number = 2): MeanCalculationResult {
  const result = calculateMean(numbers);
  
  return {
    mean: Number(result.mean.toFixed(precision)),
    count: result.count,
    sum: Number(result.sum.toFixed(precision)),
    min: Number(result.min.toFixed(precision)),
    max: Number(result.max.toFixed(precision)),
    range: Number(result.range.toFixed(precision)),
    standardDeviation: Number(result.standardDeviation.toFixed(precision)),
    variance: Number(result.variance.toFixed(precision))
  };
}

export default { calculateMean, calculateMeanWithPrecision };