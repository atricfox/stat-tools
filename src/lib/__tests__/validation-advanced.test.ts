/**
 * Advanced validation tests for edge cases and boundary conditions
 * Tests comprehensive error handling and data quality detection
 */

import {
  validationHelpers,
  advancedValidation,
  ValidationError,
  ValidationResult,
  isValidNumber,
  sanitizeInput,
  parseNumberString
} from '../validation';

describe('isValidNumber', () => {
  it('should validate basic numbers', () => {
    expect(isValidNumber('42')).toBe(true);
    expect(isValidNumber('3.14')).toBe(true);
    expect(isValidNumber('-2.5')).toBe(true);
    expect(isValidNumber('0')).toBe(true);
  });

  it('should validate scientific notation', () => {
    expect(isValidNumber('1e3')).toBe(true);
    expect(isValidNumber('2.5e-2')).toBe(true);
    expect(isValidNumber('3.14E+0')).toBe(true);
  });

  it('should reject invalid inputs', () => {
    expect(isValidNumber('')).toBe(false);
    expect(isValidNumber('   ')).toBe(false);
    expect(isValidNumber('abc')).toBe(false);
    expect(isValidNumber('Infinity')).toBe(false);
    expect(isValidNumber('NaN')).toBe(false);
    expect(isValidNumber('undefined')).toBe(false);
  });

  it('should handle edge cases', () => {
    expect(isValidNumber('0.0')).toBe(true);
    expect(isValidNumber('-0')).toBe(true);
    expect(isValidNumber('.5')).toBe(true);
    expect(isValidNumber('5.')).toBe(true);
    expect(isValidNumber('+')).toBe(false);
    expect(isValidNumber('-')).toBe(false);
    expect(isValidNumber('.')).toBe(false);
  });
});

describe('sanitizeInput', () => {
  it('should normalize separators', () => {
    expect(sanitizeInput('1;2;3')).toBe('1, 2, 3');
    expect(sanitizeInput('1|2|3')).toBe('1, 2, 3');
    expect(sanitizeInput('1  2  3')).toBe('1, 2, 3');
  });

  it('should handle mixed separators', () => {
    expect(sanitizeInput('1, 2; 3|4  5')).toBe('1, 2, 3, 4, 5');
  });

  it('should remove extra commas', () => {
    expect(sanitizeInput('1,,,2,,,3')).toBe('1, 2, 3');
    expect(sanitizeInput(',1,2,3,')).toBe('1, 2, 3');
  });

  it('should preserve numbers', () => {
    expect(sanitizeInput('1.5, -2.7, 3.14e-2')).toBe('1.5, -2.7, 3.14e-2');
  });
});

describe('parseNumberString', () => {
  it('should parse valid numbers', () => {
    expect(parseNumberString('42')).toBe(42);
    expect(parseNumberString('3.14')).toBe(3.14);
    expect(parseNumberString('-2.5')).toBe(-2.5);
  });

  it('should handle whitespace', () => {
    expect(parseNumberString('  42  ')).toBe(42);
    expect(parseNumberString('\t3.14\n')).toBe(3.14);
  });

  it('should return null for invalid input', () => {
    expect(parseNumberString('')).toBeNull();
    expect(parseNumberString('abc')).toBeNull();
    expect(parseNumberString('Infinity')).toBeNull();
    expect(parseNumberString('NaN')).toBeNull();
  });
});

describe('validationHelpers.validateInput', () => {
  it('should handle valid input', () => {
    const result = validationHelpers.validateInput('1, 2, 3, 4, 5');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([1, 2, 3, 4, 5]);
    expect(result.errors).toHaveLength(0);
  });

  it('should handle empty input', () => {
    const result = validationHelpers.validateInput('');
    expect(result.success).toBe(false);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].code).toBe('EMPTY_INPUT');
  });

  it('should handle input too long', () => {
    const longInput = 'a'.repeat(50001);
    const result = validationHelpers.validateInput(longInput);
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.code === 'INPUT_TOO_LONG')).toBe(true);
  });

  it('should handle no valid numbers', () => {
    const result = validationHelpers.validateInput('abc, def, ghi');
    expect(result.success).toBe(false);
    expect(result.errors.some(e => e.code === 'NO_VALID_NUMBERS')).toBe(true);
  });

  it('should warn about invalid entries', () => {
    const result = validationHelpers.validateInput('1, abc, 3, def, 5');
    expect(result.success).toBe(true);
    expect(result.warnings).toHaveLength(1);
    expect(result.warnings[0].code).toBe('INVALID_ENTRIES');
  });

  it('should provide metadata', () => {
    const result = validationHelpers.validateInput('1, abc, 3, def, 5');
    expect(result.metadata).toEqual({
      parsedCount: 3,
      invalidCount: 2,
      formatDetected: 'mixed'
    });
  });
});

describe('validationHelpers.detectDataIssues', () => {
  it('should detect single value', () => {
    const result = validationHelpers.detectDataIssues('42');
    expect(result.warnings).toContain('Only one value provided - single value mean');
    expect(result.suggestions).toContain('Add more data points for statistical analysis');
  });

  it('should detect small dataset', () => {
    const result = validationHelpers.detectDataIssues('1, 2');
    expect(result.warnings.some(w => w.includes('Small dataset'))).toBe(true);
  });

  it('should detect duplicates', () => {
    const result = validationHelpers.detectDataIssues('1, 2, 2, 3, 3, 3');
    expect(result.warnings.some(w => w.includes('duplicate'))).toBe(true);
  });

  it('should detect extreme outliers', () => {
    const result = validationHelpers.detectDataIssues('1, 2, 3, 4, 100');
    expect(result.warnings.some(w => w.includes('outlier'))).toBe(true);
    expect(result.suggestions.some(s => s.includes('outlying values'))).toBe(true);
  });

  it('should detect high precision', () => {
    const result = validationHelpers.detectDataIssues('1.1234567890, 2.9876543210');
    expect(result.warnings.some(w => w.includes('high precision'))).toBe(true);
  });

  it('should handle clean data', () => {
    const result = validationHelpers.detectDataIssues('85, 92, 78, 96, 88, 91, 83, 89');
    expect(result.warnings).toHaveLength(0);
    expect(result.suggestions).toHaveLength(0);
  });
});

describe('advancedValidation.validateSampleSize', () => {
  it('should validate sufficient sample size', () => {
    const errors = advancedValidation.validateSampleSize(10, 'mean');
    expect(errors).toHaveLength(0);
  });

  it('should detect insufficient sample size', () => {
    const errors = advancedValidation.validateSampleSize(0, 'mean');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('INSUFFICIENT_SAMPLE_SIZE');
    expect(errors[0].severity).toBe('error');
  });

  it('should warn about small sample size', () => {
    const errors = advancedValidation.validateSampleSize(3, 'mean');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('SMALL_SAMPLE_SIZE');
    expect(errors[0].severity).toBe('warning');
  });

  it('should handle different operations', () => {
    expect(advancedValidation.validateSampleSize(1, 'stdev')).toHaveLength(1); // Error
    expect(advancedValidation.validateSampleSize(2, 'stdev')).toHaveLength(1); // Warning
    expect(advancedValidation.validateSampleSize(15, 'stdev')).toHaveLength(0); // OK
  });
});

describe('advancedValidation.validateRange', () => {
  it('should validate grades in range', () => {
    const errors = advancedValidation.validateRange([85, 92, 78, 96], 'grades');
    expect(errors).toHaveLength(0);
  });

  it('should detect grades out of range', () => {
    const errors = advancedValidation.validateRange([85, 105, -5, 96], 'grades');
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('OUT_OF_RANGE');
    expect(errors[0].severity).toBe('error');
    expect(errors[0].details.outOfRange).toEqual([105, -5]);
  });

  it('should handle percentages', () => {
    const errors = advancedValidation.validateRange([50, 75, 120], 'percentages');
    expect(errors).toHaveLength(1);
    expect(errors[0].details.outOfRange).toEqual([120]);
  });

  it('should handle general numbers', () => {
    const errors = advancedValidation.validateRange([-1000, 1000, 1e6], 'general');
    expect(errors).toHaveLength(0);
  });
});

describe('advancedValidation.detectQualityIssues', () => {
  it('should handle empty array', () => {
    const errors = advancedValidation.detectQualityIssues([]);
    expect(errors).toHaveLength(0);
  });

  it('should detect no variation', () => {
    const errors = advancedValidation.detectQualityIssues([5, 5, 5, 5, 5]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('NO_VARIATION');
  });

  it('should detect excessive zeros', () => {
    const errors = advancedValidation.detectQualityIssues([0, 0, 0, 0, 1, 2]);
    expect(errors).toHaveLength(1);
    expect(errors[0].code).toBe('EXCESSIVE_ZEROS');
  });

  it('should detect high skewness', () => {
    const errors = advancedValidation.detectQualityIssues([1, 1, 1, 1, 1, 100]);
    expect(errors.some(e => e.code === 'HIGH_SKEWNESS')).toBe(true);
  });

  it('should handle normal distribution', () => {
    const normalData = [85, 87, 89, 91, 93, 95, 88, 92, 90, 86];
    const errors = advancedValidation.detectQualityIssues(normalData);
    expect(errors.filter(e => e.severity === 'error')).toHaveLength(0);
  });
});

describe('Edge cases for validation', () => {
  it('should handle very large numbers', () => {
    const result = validationHelpers.validateInput('1e100, 2e100');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should handle very small numbers', () => {
    const result = validationHelpers.validateInput('1e-100, 2e-100');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(2);
  });

  it('should handle mixed precision', () => {
    const result = validationHelpers.validateInput('1, 1.0, 1.00, 1.000');
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(4);
  });

  it('should handle unicode numbers', () => {
    const result = validationHelpers.validateInput('１，２，３'); // Full-width characters
    // This might fail depending on parseFloat behavior - that's expected
    expect(result.errors.some(e => e.code === 'NO_VALID_NUMBERS')).toBe(true);
  });

  it('should handle boundary precision values', () => {
    const highPrecision = Math.PI.toFixed(15);
    const result = validationHelpers.validateInput(highPrecision);
    expect(result.success).toBe(true);
  });

  it('should handle negative zero edge case', () => {
    const result = validationHelpers.validateInput('-0, +0, 0');
    expect(result.success).toBe(true);
    expect(result.data).toEqual([0, 0, 0]);
  });
});

describe('Performance boundary tests', () => {
  it('should handle maximum input length', () => {
    const maxLengthInput = Array.from({ length: 10000 }, (_, i) => i).join(', ');
    const result = validationHelpers.validateInput(maxLengthInput);
    expect(result.success).toBe(true);
    expect(result.data).toHaveLength(10000);
  });

  it('should handle many duplicates efficiently', () => {
    const manyDuplicates = Array.from({ length: 1000 }, () => '42').join(', ');
    const result = validationHelpers.detectDataIssues(manyDuplicates);
    expect(result.warnings.some(w => w.includes('duplicate'))).toBe(true);
  });

  it('should handle extreme outliers efficiently', () => {
    const withExtremeOutlier = ['1', '2', '3', '1e20'].join(', ');
    const result = validationHelpers.detectDataIssues(withExtremeOutlier);
    expect(result.warnings.some(w => w.includes('outlier'))).toBe(true);
  });
});

describe('Error message formatting', () => {
  it('should format error messages consistently', () => {
    const result = validationHelpers.validateInput('');
    expect(result.errors[0]).toMatchObject({
      field: expect.any(String),
      message: expect.any(String),
      code: expect.any(String),
      severity: expect.any(String)
    });
  });

  it('should include helpful details', () => {
    const result = validationHelpers.validateInput('1, abc, 3');
    const warningWithDetails = result.warnings.find(w => w.details);
    expect(warningWithDetails?.details).toBeDefined();
  });

  it('should use appropriate severity levels', () => {
    const result = validationHelpers.validateInput('abc');
    expect(result.errors[0].severity).toBe('error');
    
    const warningResult = validationHelpers.validateInput('1, abc, 3');
    expect(warningResult.warnings[0].severity).toBe('warning');
  });
});