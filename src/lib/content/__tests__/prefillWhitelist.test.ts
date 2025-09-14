/**
 * Unit tests for prefill whitelist
 */

import { 
  validatePrefillParams, 
  sanitizePrefillParams,
  generatePrefillUrl,
  CALCULATOR_PREFILL_WHITELIST 
} from '../prefillWhitelist';

describe('prefillWhitelist', () => {
  describe('validatePrefillParams', () => {
    it('should validate mean calculator params', () => {
      const params = {
        numbers: '1,2,3,4,5',
        precision: '2',
      };
      
      const isValid = validatePrefillParams('mean', params);
      expect(isValid).toBe(true);
    });
    
    it('should reject invalid param names', () => {
      const params = {
        numbers: '1,2,3',
        invalidParam: 'value',
      };
      
      const isValid = validatePrefillParams('mean', params);
      expect(isValid).toBe(false);
    });
    
    it('should validate number type params', () => {
      const validParams = {
        numbers: '1,2,3',
        precision: '2',
      };
      
      const invalidParams = {
        numbers: '1,2,3',
        precision: 'not-a-number',
      };
      
      expect(validatePrefillParams('mean', validParams)).toBe(true);
      expect(validatePrefillParams('mean', invalidParams)).toBe(false);
    });
    
    it('should validate array type params', () => {
      const validParams = {
        numbers: '1,2,3,4,5',
      };
      
      const invalidParams = {
        numbers: 'not,valid,numbers',
      };
      
      expect(validatePrefillParams('mean', validParams)).toBe(true);
      expect(validatePrefillParams('mean', invalidParams)).toBe(false);
    });
    
    it('should validate GPA calculator params', () => {
      const validParams = {
        courses: JSON.stringify([
          { name: 'Math', grade: 'A', credits: 3 },
          { name: 'Science', grade: 'B+', credits: 4 },
        ]),
        scale: '4.0',
      };
      
      const isValid = validatePrefillParams('gpa', validParams);
      expect(isValid).toBe(true);
    });
    
    it('should reject invalid GPA scale', () => {
      const params = {
        scale: '10.0', // Not in allowed values
      };
      
      const isValid = validatePrefillParams('gpa', params);
      expect(isValid).toBe(false);
    });
    
    it('should return false for unknown calculator', () => {
      const params = { test: 'value' };
      const isValid = validatePrefillParams('unknown-calculator', params);
      expect(isValid).toBe(false);
    });
  });
  
  describe('sanitizePrefillParams', () => {
    it('should sanitize and convert param types', () => {
      const params = {
        numbers: '1,2,3,4,5',
        precision: '2',
        showSteps: 'true',
      };
      
      const sanitized = sanitizePrefillParams('mean', params);
      
      expect(sanitized.numbers).toBe('1,2,3,4,5');
      expect(sanitized.precision).toBe(2);
      expect(sanitized.showSteps).toBe(true);
    });
    
    it('should remove invalid params', () => {
      const params = {
        numbers: '1,2,3',
        invalidParam: 'should-be-removed',
        precision: '2',
      };
      
      const sanitized = sanitizePrefillParams('mean', params);
      
      expect(sanitized.numbers).toBeDefined();
      expect(sanitized.precision).toBeDefined();
      expect(sanitized.invalidParam).toBeUndefined();
    });
    
    it('should handle array parsing', () => {
      const params = {
        numbers: '10,20,30,40',
      };
      
      const sanitized = sanitizePrefillParams('mean', params);
      expect(sanitized.numbers).toBe('10,20,30,40');
    });
    
    it('should handle JSON array parsing for GPA', () => {
      const courses = [
        { name: 'Math', grade: 'A', credits: 3 },
        { name: 'Science', grade: 'B', credits: 4 },
      ];
      
      const params = {
        courses: JSON.stringify(courses),
      };
      
      const sanitized = sanitizePrefillParams('gpa', params);
      expect(sanitized.courses).toEqual(courses);
    });
    
    it('should return empty object for invalid params', () => {
      const params = {
        invalidParam1: 'value1',
        invalidParam2: 'value2',
      };
      
      const sanitized = sanitizePrefillParams('mean', params);
      expect(Object.keys(sanitized).length).toBe(0);
    });
    
    it('should return empty object for unknown calculator', () => {
      const params = { test: 'value' };
      const sanitized = sanitizePrefillParams('unknown', params);
      expect(sanitized).toEqual({});
    });
  });
  
  describe('generatePrefillUrl', () => {
    it('should generate URL with query params', () => {
      const params = {
        numbers: '1,2,3,4,5',
        precision: 2,
      };
      
      const url = generatePrefillUrl('/calculator/mean', params);
      expect(url).toBe('/calculator/mean?numbers=1%2C2%2C3%2C4%2C5&precision=2');
    });
    
    it('should handle array params', () => {
      const params = {
        values: [1, 2, 3],
      };
      
      const url = generatePrefillUrl('/calculator/test', params);
      expect(url).toBe('/calculator/test?values=1&values=2&values=3');
    });
    
    it('should handle object params as JSON', () => {
      const params = {
        config: { option: 'value' },
      };
      
      const url = generatePrefillUrl('/calculator/test', params);
      expect(url).toContain('config=%7B%22option%22%3A%22value%22%7D');
    });
    
    it('should skip undefined and null values', () => {
      const params = {
        defined: 'value',
        undefined: undefined,
        null: null,
        zero: 0,
        empty: '',
      };
      
      const url = generatePrefillUrl('/calculator/test', params);
      expect(url).toContain('defined=value');
      expect(url).toContain('zero=0');
      expect(url).not.toContain('undefined');
      expect(url).not.toContain('null');
      expect(url).not.toContain('empty');
    });
    
    it('should return base URL when no params', () => {
      const url = generatePrefillUrl('/calculator/mean', {});
      expect(url).toBe('/calculator/mean');
    });
  });
  
  describe('CALCULATOR_PREFILL_WHITELIST', () => {
    it('should have validation for mean calculator', () => {
      const meanConfig = CALCULATOR_PREFILL_WHITELIST['mean'];
      expect(meanConfig).toBeDefined();
      expect(meanConfig.allowedParams).toContain('numbers');
      expect(meanConfig.allowedParams).toContain('precision');
      expect(meanConfig.paramTypes.numbers).toBe('array');
      expect(meanConfig.paramTypes.precision).toBe('number');
    });
    
    it('should have validation for GPA calculator', () => {
      const gpaConfig = CALCULATOR_PREFILL_WHITELIST['gpa'];
      expect(gpaConfig).toBeDefined();
      expect(gpaConfig.allowedParams).toContain('courses');
      expect(gpaConfig.allowedParams).toContain('scale');
      expect(gpaConfig.paramValidation?.scale).toBeDefined();
    });
    
    it('should validate GPA scale values', () => {
      const gpaConfig = CALCULATOR_PREFILL_WHITELIST['gpa'];
      const scaleValidator = gpaConfig.paramValidation?.scale;
      
      expect(scaleValidator?.('4.0')).toBe(true);
      expect(scaleValidator?.('4.3')).toBe(true);
      expect(scaleValidator?.('5.0')).toBe(true);
      expect(scaleValidator?.('10.0')).toBe(false);
      expect(scaleValidator?.('invalid')).toBe(false);
    });
    
    it('should validate number arrays', () => {
      const meanConfig = CALCULATOR_PREFILL_WHITELIST['mean'];
      const numbersValidator = meanConfig.paramValidation?.numbers;
      
      expect(numbersValidator?.('1,2,3,4,5')).toBe(true);
      expect(numbersValidator?.('1.5,2.5,3.5')).toBe(true);
      expect(numbersValidator?.('-1,0,1')).toBe(true);
      expect(numbersValidator?.('not,valid,numbers')).toBe(false);
      expect(numbersValidator?.('')).toBe(false);
    });
  });
});