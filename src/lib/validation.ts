/**
 * Form validation schemas for statistical tools
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Base calculator input validation schema
 */
export const calculatorInputSchema = z.object({
  numbers: z.string()
    .min(1, 'Please enter some numbers')
    .max(50000, 'Input too long (max 50,000 characters)'),
  precision: z.number()
    .int('Precision must be a whole number')
    .min(0, 'Precision cannot be negative')
    .max(10, 'Maximum precision is 10 decimal places')
    .default(2),
});

/**
 * Mean calculator specific validation
 */
export const meanCalculatorSchema = calculatorInputSchema.extend({
  showSteps: z.boolean().optional().default(false),
});

/**
 * Research calculator validation (higher precision, additional options)
 */
export const researchCalculatorSchema = calculatorInputSchema.extend({
  precision: z.number()
    .int('Precision must be a whole number')
    .min(0, 'Precision cannot be negative')
    .max(15, 'Maximum precision is 15 decimal places'), // Higher precision for research
  ignoreOutliers: z.boolean().optional().default(false),
  confidenceLevel: z.number()
    .min(50, 'Confidence level must be at least 50%')
    .max(99.9, 'Confidence level cannot exceed 99.9%')
    .optional()
    .default(95),
});

/**
 * Teacher/Grade calculator validation
 */
export const gradeCalculatorSchema = calculatorInputSchema.extend({
  precision: z.number()
    .int('Precision must be a whole number')
    .min(0, 'Precision cannot be negative')
    .max(3, 'Maximum precision is 3 decimal places'), // Lower precision for grades
  gradeScale: z.enum(['100', '4.0', 'custom']).optional().default('100'),
  excludeInvalid: z.boolean().optional().default(true),
});

/**
 * Additional validation functions for number parsing
 */
export function isValidNumber(value: string): boolean {
  const trimmed = value.trim();
  if (!trimmed) return false;
  
  const num = parseFloat(trimmed);
  return !isNaN(num) && isFinite(num);
}

export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[;|]/g, ',') // Replace semicolons and pipes with commas
    .replace(/\s+/g, ', ') // Replace multiple spaces with comma-space
    .replace(/,+/g, ',') // Collapse multiple commas
    .replace(/^,|,$/g, ''); // Remove leading/trailing commas
}

export function parseNumberString(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  
  const num = parseFloat(trimmed);
  if (isNaN(num) || !isFinite(num)) return null;
  
  return num;
}

/**
 * Advanced validation error types
 */
export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
  details?: any;
}

export interface ValidationResult<T = any> {
  success: boolean;
  data?: T;
  errors: ValidationError[];
  warnings: ValidationError[];
  metadata?: {
    parsedCount: number;
    invalidCount: number;
    formatDetected: string;
  };
}

/**
 * Custom validation functions
 */
export const validationHelpers = {
  /**
   * Validate if input contains at least some valid numbers
   */
  hasValidNumbers: (input: string): boolean => {
    const entries = input.split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    return entries.some(entry => {
      const num = parseFloat(entry);
      return !isNaN(num) && isFinite(num);
    });
  },

  /**
   * Count valid numbers in input
   */
  countValidNumbers: (input: string): number => {
    const entries = input.split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    return entries.filter(entry => {
      const num = parseFloat(entry);
      return !isNaN(num) && isFinite(num);
    }).length;
  },

  /**
   * Validate grade range (0-100 by default)
   */
  validateGradeRange: (input: string, min: number = 0, max: number = 100): {
    valid: boolean;
    message?: string;
  } => {
    const entries = input.split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    const numbers = entries.map(entry => parseFloat(entry))
      .filter(num => !isNaN(num) && isFinite(num));
    
    const outOfRange = numbers.filter(num => num < min || num > max);
    
    if (outOfRange.length > 0) {
      return {
        valid: false,
        message: `${outOfRange.length} number(s) outside valid range (${min}-${max}): ${outOfRange.slice(0, 3).join(', ')}${outOfRange.length > 3 ? '...' : ''}`
      };
    }
    
    return { valid: true };
  },

  /**
   * Check for potential data entry errors
   */
  detectDataIssues: (input: string): {
    warnings: string[];
    suggestions: string[];
  } => {
    const warnings: string[] = [];
    const suggestions: string[] = [];
    
    const entries = input.split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    const numbers = entries.map(entry => parseFloat(entry))
      .filter(num => !isNaN(num) && isFinite(num));
    
    // Check for single value
    if (numbers.length === 1) {
      warnings.push('Only one value provided - single value mean');
      suggestions.push('Add more data points for statistical analysis');
    }
    
    // Check for very small dataset
    if (numbers.length >= 2 && numbers.length < 3) {
      warnings.push('Small dataset - results may not be meaningful');
      suggestions.push('Consider collecting more data points for reliable results');
    }
    
    // Check for repeated values (might indicate copy-paste error)
    const uniqueNumbers = new Set(numbers);
    const duplicateCount = numbers.length - uniqueNumbers.size;
    if (duplicateCount > 0) {
      warnings.push(`${duplicateCount} duplicate value${duplicateCount > 1 ? 's' : ''} detected`);
      if (duplicateCount / numbers.length > 0.3) {
        suggestions.push('Verify data entry for potential copy-paste errors');
      }
    }
    
    // Check for extreme outliers (more than 3 standard deviations)
    if (numbers.length > 4) {
      const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
      const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
      const stdDev = Math.sqrt(variance);
      
      const extremeOutliers = numbers.filter(num => Math.abs(num - mean) > 3 * stdDev);
      if (extremeOutliers.length > 0) {
        warnings.push(`${extremeOutliers.length} extreme outlier${extremeOutliers.length > 1 ? 's' : ''} detected`);
        suggestions.push('Review outlying values for potential data entry errors');
      }
    }
    
    // Check for high precision issues
    const highPrecisionCount = entries.filter(entry => {
      const parts = entry.split('.');
      return parts.length > 1 && parts[1].length > 6;
    }).length;
    
    if (highPrecisionCount > 0) {
      warnings.push(`${highPrecisionCount} number${highPrecisionCount > 1 ? 's' : ''} with high precision (>6 decimal places)`);
      suggestions.push('Consider rounding to appropriate precision for your use case');
    }
    
    return { warnings, suggestions };
  },

  /**
   * Comprehensive input validation
   */
  validateInput: (input: string): ValidationResult => {
    const errors: ValidationError[] = [];
    const warnings: ValidationError[] = [];
    
    // Basic checks
    if (!input || input.trim().length === 0) {
      errors.push({
        field: 'numbers',
        message: 'Please enter some numbers',
        code: 'EMPTY_INPUT',
        severity: 'error'
      });
      return { success: false, errors, warnings };
    }
    
    if (input.length > 50000) {
      errors.push({
        field: 'numbers',
        message: 'Input is too long (maximum 50,000 characters)',
        code: 'INPUT_TOO_LONG',
        severity: 'error'
      });
    }
    
    // Parse and validate numbers
    const entries = input.split(/[,\n\s\t]+/)
      .map(entry => entry.trim())
      .filter(entry => entry.length > 0);
    
    const validNumbers: number[] = [];
    const invalidEntries: string[] = [];
    
    entries.forEach(entry => {
      if (isValidNumber(entry)) {
        validNumbers.push(parseFloat(entry));
      } else {
        invalidEntries.push(entry);
      }
    });
    
    if (validNumbers.length === 0) {
      errors.push({
        field: 'numbers',
        message: 'No valid numbers found in input',
        code: 'NO_VALID_NUMBERS',
        severity: 'error',
        details: { invalidEntries }
      });
    }
    
    if (invalidEntries.length > 0) {
      warnings.push({
        field: 'numbers',
        message: `${invalidEntries.length} invalid entr${invalidEntries.length > 1 ? 'ies' : 'y'} will be ignored`,
        code: 'INVALID_ENTRIES',
        severity: 'warning',
        details: { invalidEntries: invalidEntries.slice(0, 5) }
      });
    }
    
    return {
      success: errors.length === 0,
      data: validNumbers,
      errors,
      warnings,
      metadata: {
        parsedCount: validNumbers.length,
        invalidCount: invalidEntries.length,
        formatDetected: 'mixed'
      }
    };
  }
};

/**
 * Advanced data validation functions
 */
export const advancedValidation = {
  /**
   * Validate dataset size for statistical significance
   */
  validateSampleSize: (count: number, operation: 'mean' | 'median' | 'stdev'): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    const minSizes = { mean: 1, median: 1, stdev: 2 };
    const recommendedSizes = { mean: 5, median: 7, stdev: 10 };
    
    if (count < minSizes[operation]) {
      errors.push({
        field: 'sampleSize',
        message: `At least ${minSizes[operation]} value${minSizes[operation] > 1 ? 's' : ''} required for ${operation}`,
        code: 'INSUFFICIENT_SAMPLE_SIZE',
        severity: 'error'
      });
    } else if (count < recommendedSizes[operation]) {
      errors.push({
        field: 'sampleSize',
        message: `Small sample size (${count}). Consider collecting more data for reliable ${operation}`,
        code: 'SMALL_SAMPLE_SIZE',
        severity: 'warning'
      });
    }
    
    return errors;
  },

  /**
   * Validate numeric range for specific contexts
   */
  validateRange: (numbers: number[], context: 'grades' | 'percentages' | 'general'): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    const ranges = {
      grades: { min: 0, max: 100, name: 'grades' },
      percentages: { min: 0, max: 100, name: 'percentages' },
      general: { min: -Infinity, max: Infinity, name: 'numbers' }
    };
    
    const { min, max, name } = ranges[context];
    const outOfRange = numbers.filter(n => n < min || n > max);
    
    if (outOfRange.length > 0) {
      errors.push({
        field: 'range',
        message: `${outOfRange.length} ${name} outside valid range (${min === -Infinity ? 'no minimum' : min}-${max === Infinity ? 'no maximum' : max})`,
        code: 'OUT_OF_RANGE',
        severity: context === 'general' ? 'warning' : 'error',
        details: { outOfRange: outOfRange.slice(0, 5) }
      });
    }
    
    return errors;
  },

  /**
   * Detect potential data quality issues
   */
  detectQualityIssues: (numbers: number[]): ValidationError[] => {
    const errors: ValidationError[] = [];
    
    if (numbers.length === 0) return errors;
    
    // Check for all identical values
    const unique = [...new Set(numbers)];
    if (unique.length === 1) {
      errors.push({
        field: 'dataQuality',
        message: 'All values are identical - no variation in data',
        code: 'NO_VARIATION',
        severity: 'warning'
      });
    }
    
    // Check for excessive zeros
    const zeroCount = numbers.filter(n => n === 0).length;
    if (zeroCount > numbers.length * 0.5 && numbers.length > 5) {
      errors.push({
        field: 'dataQuality',
        message: `High proportion of zero values (${zeroCount}/${numbers.length})`,
        code: 'EXCESSIVE_ZEROS',
        severity: 'warning'
      });
    }
    
    // Check for extreme skewness
    const mean = numbers.reduce((sum, n) => sum + n, 0) / numbers.length;
    const sorted = [...numbers].sort((a, b) => a - b);
    const median = sorted.length % 2 === 0 
      ? (sorted[sorted.length / 2 - 1] + sorted[sorted.length / 2]) / 2
      : sorted[Math.floor(sorted.length / 2)];
    
    const skewness = Math.abs(mean - median);
    const range = Math.max(...numbers) - Math.min(...numbers);
    
    if (range > 0 && skewness / range > 0.3) {
      errors.push({
        field: 'dataQuality',
        message: 'Data appears highly skewed - consider checking for outliers',
        code: 'HIGH_SKEWNESS',
        severity: 'info'
      });
    }
    
    return errors;
  }
};

/**
 * Error messages for common validation failures
 */
export const errorMessages = {
  required: 'This field is required',
  invalidNumber: 'Please enter valid numbers',
  noValidNumbers: 'No valid numbers found in input',
  precisionRange: 'Precision must be between 0 and 10',
  inputTooLong: 'Input is too long (maximum 50,000 characters)',
  confidenceLevelRange: 'Confidence level must be between 50% and 99.9%',
  gradeOutOfRange: 'Some grades are outside the valid range',
  insufficientData: 'Not enough data points for reliable calculation',
  dataQualityIssue: 'Potential data quality issue detected',
} as const;

/**
 * Type exports for use in components
 */
export type MeanCalculatorInput = z.infer<typeof meanCalculatorSchema>;
export type ResearchCalculatorInput = z.infer<typeof researchCalculatorSchema>;
export type GradeCalculatorInput = z.infer<typeof gradeCalculatorSchema>;