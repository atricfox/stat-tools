/**
 * Form validation schemas for statistical tools
 * Uses Zod for type-safe validation
 */

import { z } from 'zod';

/**
 * Base calculator input validation schema
 */
export const calculatorInputSchema = z.object({
  input: z.string()
    .min(1, 'Please enter some numbers')
    .max(10000, 'Input too long (max 10,000 characters)'),
  precision: z.number()
    .int('Precision must be a whole number')
    .min(0, 'Precision cannot be negative')
    .max(10, 'Maximum precision is 10 decimal places'),
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
    
    // Check for very small dataset
    if (numbers.length < 3) {
      warnings.push('Very small dataset - results may not be meaningful');
      suggestions.push('Consider collecting more data points for reliable results');
    }
    
    // Check for repeated values (might indicate copy-paste error)
    const uniqueNumbers = new Set(numbers);
    const duplicateRatio = (numbers.length - uniqueNumbers.size) / numbers.length;
    if (duplicateRatio > 0.5 && numbers.length > 5) {
      warnings.push('High number of duplicate values detected');
      suggestions.push('Verify data entry for potential copy-paste errors');
    }
    
    // Check for extreme outliers (more than 3 standard deviations)
    if (numbers.length > 4) {
      const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
      const variance = numbers.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0) / numbers.length;
      const stdDev = Math.sqrt(variance);
      
      const extremeOutliers = numbers.filter(num => Math.abs(num - mean) > 3 * stdDev);
      if (extremeOutliers.length > 0) {
        warnings.push(`${extremeOutliers.length} extreme outlier(s) detected`);
        suggestions.push('Review outlying values for potential data entry errors');
      }
    }
    
    return { warnings, suggestions };
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
  inputTooLong: 'Input is too long (maximum 10,000 characters)',
  confidenceLevelRange: 'Confidence level must be between 50% and 99.9%',
  gradeOutOfRange: 'Some grades are outside the valid range',
} as const;

/**
 * Type exports for use in components
 */
export type MeanCalculatorInput = z.infer<typeof meanCalculatorSchema>;
export type ResearchCalculatorInput = z.infer<typeof researchCalculatorSchema>;
export type GradeCalculatorInput = z.infer<typeof gradeCalculatorSchema>;