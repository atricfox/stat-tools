/**
 * Mathematical calculation utilities for statistical tools
 * Uses decimal.js for high precision calculations
 */

import { Decimal } from 'decimal.js';

// Configure Decimal.js for statistical calculations
Decimal.config({
  precision: 20, // High precision for intermediate calculations
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -7,
  toExpPos: 21
});

/**
 * Parse input string and extract valid numbers
 */
export function parseNumberInput(input: string): {
  validNumbers: number[];
  invalidEntries: string[];
} {
  const entries = input
    .split(/[,\n\s\t]+/)
    .map(entry => entry.trim())
    .filter(entry => entry.length > 0);

  const validNumbers: number[] = [];
  const invalidEntries: string[] = [];

  entries.forEach(entry => {
    // Handle scientific notation and decimals
    const num = parseFloat(entry);
    if (!isNaN(num) && isFinite(num)) {
      validNumbers.push(num);
    } else if (entry.length > 0) {
      invalidEntries.push(entry);
    }
  });

  return { validNumbers, invalidEntries };
}

/**
 * Calculate arithmetic mean with high precision
 */
export function calculateMean(numbers: number[], precision: number = 2): {
  mean: number;
  sum: number;
  count: number;
  steps: string[];
} {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate mean of empty array');
  }

  // Use Decimal.js for precise calculations
  const decimalNumbers = numbers.map(n => new Decimal(n));
  const sum = decimalNumbers.reduce((acc, num) => acc.plus(num), new Decimal(0));
  const mean = sum.dividedBy(numbers.length);

  const steps = [
    `Found ${numbers.length} valid numbers: ${numbers.join(', ')}`,
    `Sum = ${numbers.join(' + ')} = ${sum.toString()}`,
    `Mean = Sum ÷ Count = ${sum.toString()} ÷ ${numbers.length} = ${mean.toFixed(precision)}`
  ];

  return {
    mean: parseFloat(mean.toFixed(precision)),
    sum: parseFloat(sum.toFixed(precision)),
    count: numbers.length,
    steps
  };
}

/**
 * Calculate standard deviation (for research scenarios)
 */
export function calculateStandardDeviation(numbers: number[], sample: boolean = true): {
  standardDeviation: number;
  variance: number;
} {
  if (numbers.length === 0) {
    throw new Error('Cannot calculate standard deviation of empty array');
  }

  const { mean } = calculateMean(numbers);
  const decimalMean = new Decimal(mean);
  
  // Calculate variance
  const squaredDifferences = numbers.map(n => 
    new Decimal(n).minus(decimalMean).pow(2)
  );
  
  const sumSquaredDiff = squaredDifferences.reduce((acc, val) => acc.plus(val), new Decimal(0));
  const divisor = sample ? numbers.length - 1 : numbers.length;
  const variance = sumSquaredDiff.dividedBy(divisor);
  const standardDeviation = variance.sqrt();

  return {
    standardDeviation: parseFloat(standardDeviation.toFixed(6)),
    variance: parseFloat(variance.toFixed(6))
  };
}

/**
 * Detect outliers using IQR method
 */
export function detectOutliers(numbers: number[]): number[] {
  if (numbers.length < 4) return [];
  
  const sorted = [...numbers].sort((a, b) => a - b);
  const q1Index = Math.floor(sorted.length * 0.25);
  const q3Index = Math.floor(sorted.length * 0.75);
  
  const q1 = new Decimal(sorted[q1Index]);
  const q3 = new Decimal(sorted[q3Index]);
  const iqr = q3.minus(q1);
  
  const lowerBound = q1.minus(iqr.times(1.5));
  const upperBound = q3.plus(iqr.times(1.5));
  
  return numbers.filter(num => {
    const decimal = new Decimal(num);
    return decimal.lessThan(lowerBound) || decimal.greaterThan(upperBound);
  });
}

/**
 * Validate number range for educational contexts (e.g., grades)
 */
export function validateGradeRange(numbers: number[], min: number = 0, max: number = 100): {
  validGrades: number[];
  outOfRange: number[];
} {
  const validGrades: number[] = [];
  const outOfRange: number[] = [];
  
  numbers.forEach(num => {
    if (num >= min && num <= max) {
      validGrades.push(num);
    } else {
      outOfRange.push(num);
    }
  });
  
  return { validGrades, outOfRange };
}

/**
 * Generate calculation steps for educational purposes
 */
export function generateCalculationSteps(
  numbers: number[], 
  result: number, 
  operation: 'mean' | 'sum' | 'count',
  precision: number = 2
): string[] {
  switch (operation) {
    case 'mean':
      const sum = numbers.reduce((acc, num) => acc + num, 0);
      return [
        `Step 1: Add all numbers together`,
        `${numbers.join(' + ')} = ${sum}`,
        `Step 2: Divide by the count of numbers`,
        `${sum} ÷ ${numbers.length} = ${result.toFixed(precision)}`,
        `Therefore, the mean is ${result.toFixed(precision)}`
      ];
    
    case 'sum':
      return [
        `Add all numbers: ${numbers.join(' + ')} = ${result}`
      ];
    
    case 'count':
      return [
        `Count the valid numbers: ${numbers.length} numbers found`
      ];
    
    default:
      return [`Result: ${result}`];
  }
}