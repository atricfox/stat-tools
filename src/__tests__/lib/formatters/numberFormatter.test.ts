import {
  formatNumberSmart,
  formatForCalculationSteps,
  formatPercentage,
  formatScientificValue
} from '@/lib/formatters/numberFormatter';

describe('Number Formatter', () => {
  describe('formatNumberSmart', () => {
    it('should handle regular numbers', () => {
      expect(formatNumberSmart(123.456, { precision: 2 })).toBe('123.46');
      expect(formatNumberSmart(0.1234, { precision: 3 })).toBe('0.123');
    });

    it('should handle very small numbers with scientific notation', () => {
      expect(formatNumberSmart(1.23e-5, { precision: 2 })).toBe('1.23e-5');
      expect(formatNumberSmart(0.0000123, { precision: 2 })).toBe('1.23e-5');
    });

    it('should handle very large numbers with scientific notation', () => {
      expect(formatNumberSmart(1.23e8, { precision: 2 })).toBe('1.23e+8');
      expect(formatNumberSmart(123000000, { precision: 2 })).toBe('1.23e+8');
    });

    it('should prevent rounding to zero for small values', () => {
      expect(formatNumberSmart(0.001, { precision: 2 })).toBe('0.001');
      expect(formatNumberSmart(0.0001, { precision: 2 })).toBe('0.0001');
    });

    it('should handle zero correctly', () => {
      expect(formatNumberSmart(0, { precision: 2 })).toBe('0');
    });

    it('should remove trailing zeros', () => {
      expect(formatNumberSmart(1.0, { precision: 2 })).toBe('1');
      expect(formatNumberSmart(1.10, { precision: 2 })).toBe('1.1');
    });
  });

  describe('formatForCalculationSteps', () => {
    it('should format based on user mode - student', () => {
      expect(formatForCalculationSteps(123.456, 'student', 2)).toBe('123.46');
      expect(formatForCalculationSteps(0.001, 'student', 2)).toBe('0.001');
    });

    it('should format based on user mode - research', () => {
      expect(formatForCalculationSteps(1.23e-5, 'research', 2)).toBe('1.2300e-5');
      expect(formatForCalculationSteps(1.23e5, 'research', 2)).toBe('1.2300e+5');
    });

    it('should format based on user mode - teacher', () => {
      expect(formatForCalculationSteps(95.67, 'teacher', 2)).toBe('95.67');
      expect(formatForCalculationSteps(0.0001, 'teacher', 2)).toBe('0.0001');
    });
  });

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(50.5, 'student', 1)).toBe('50.5%');
      expect(formatPercentage(0.001, 'research', 4)).toBe('0.001%');
    });
  });

  describe('formatScientificValue', () => {
    it('should format scientific values with units', () => {
      expect(formatScientificValue(1.23e-4, 'kg', 3)).toBe('0.0001230 kg');
      expect(formatScientificValue(9.8, 'm/s²', 1)).toBe('9.8 m/s²');
    });

    it('should format scientific values without units', () => {
      expect(formatScientificValue(1.23e-4, '', 3)).toBe('0.0001230');
    });
  });
});