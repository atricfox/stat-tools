/**
 * Unit tests for advanced data parsers
 * Tests edge cases, boundary conditions, and error handling
 */

import {
  parseMultiFormatInput,
  parseEducationalData,
  parseScientificData,
  detectInputFormat,
  parseCSV,
  parseTSV,
  parseNumber,
  normalizeNumber,
  findDuplicates,
  calculateBasicStats
} from '../parsers';

describe('detectInputFormat', () => {
  it('should detect empty input', () => {
    expect(detectInputFormat('')).toBe('empty');
    expect(detectInputFormat('   ')).toBe('empty');
  });

  it('should detect CSV format', () => {
    expect(detectInputFormat('1,2,3,4,5')).toBe('csv');
    expect(detectInputFormat('1.5, 2.7, 3.14, 4.2')).toBe('csv');
  });

  it('should detect quoted CSV format', () => {
    expect(detectInputFormat('"1.5", "2.7", "test", "4.2"')).toBe('csv-quoted');
    expect(detectInputFormat("'1.5', '2.7', 'test', '4.2'")).toBe('csv-quoted');
  });

  it('should detect TSV format', () => {
    expect(detectInputFormat('1\t2\t3\t4\t5')).toBe('tsv');
    expect(detectInputFormat('Name\tScore\tGrade\nJohn\t85\tB')).toBe('tsv');
  });

  it('should detect multiline format', () => {
    expect(detectInputFormat('1\n2\n3\n4\n5')).toBe('multiline');
    expect(detectInputFormat('1.5\n2.7\n3.14')).toBe('multiline');
  });

  it('should detect space-separated format', () => {
    expect(detectInputFormat('1 2 3 4 5')).toBe('space-separated');
    expect(detectInputFormat('1.5  2.7  3.14')).toBe('space-separated');
  });

  it('should detect scientific notation', () => {
    expect(detectInputFormat('1.5e-3')).toBe('scientific');
    expect(detectInputFormat('1.23E+05')).toBe('scientific');
  });

  it('should detect single number', () => {
    expect(detectInputFormat('42')).toBe('single');
    expect(detectInputFormat('-3.14')).toBe('single');
  });

  it('should fallback to mixed format', () => {
    expect(detectInputFormat('abc def')).toBe('mixed');
    expect(detectInputFormat('1,2;3|4')).toBe('mixed');
  });
});

describe('parseCSV', () => {
  it('should parse simple CSV', () => {
    const result = parseCSV('1,2,3,4,5');
    expect(result).toEqual(['1', '2', '3', '4', '5']);
  });

  it('should handle quoted values', () => {
    const result = parseCSV('"Hello, World","Test",42');
    expect(result).toEqual(['Hello, World', 'Test', '42']);
  });

  it('should handle escaped quotes', () => {
    const result = parseCSV('"He said ""Hello""","Test"');
    expect(result).toEqual(['He said "Hello"', 'Test']);
  });

  it('should handle multiline CSV', () => {
    const result = parseCSV('1,2,3\n4,5,6');
    expect(result).toEqual(['1', '2', '3', '4', '5', '6']);
  });

  it('should handle empty values', () => {
    const result = parseCSV('1,,3,,5');
    expect(result).toEqual(['1', '3', '5']);
  });
});

describe('parseNumber', () => {
  it('should parse valid numbers', () => {
    expect(parseNumber('42')).toBe(42);
    expect(parseNumber('3.14')).toBe(3.14);
    expect(parseNumber('-2.5')).toBe(-2.5);
    expect(parseNumber('1.23e-4')).toBe(0.000123);
  });

  it('should handle edge cases', () => {
    expect(parseNumber('0')).toBe(0);
    expect(parseNumber('-0')).toBe(-0); // JavaScript preserves -0
    expect(parseNumber('0.0')).toBe(0);
  });

  it('should return null for invalid input', () => {
    expect(parseNumber('')).toBeNull();
    expect(parseNumber('   ')).toBeNull();
    expect(parseNumber('abc')).toBeNull();
    expect(parseNumber('Infinity')).toBeNull();
    expect(parseNumber('NaN')).toBeNull();
  });

  it('should handle numbers with extra characters', () => {
    expect(parseNumber('$42')).toBe(42);
    expect(parseNumber('42%')).toBe(42);
    expect(parseNumber('"42"')).toBe(42);
  });

  it('should warn about very large numbers', () => {
    const consoleSpy = jest.spyOn(console, 'warn').mockImplementation();
    expect(parseNumber('1e16')).toBe(1e16);
    expect(consoleSpy).toHaveBeenCalledWith('Large number detected: 10000000000000000');
    consoleSpy.mockRestore();
  });
});

describe('normalizeNumber', () => {
  it('should handle percentages', () => {
    expect(normalizeNumber('50%')).toBe('0.5');
    expect(normalizeNumber('100%')).toBe('1');
    expect(normalizeNumber('0.5%')).toBe('0.005');
  });

  it('should handle fractions', () => {
    expect(normalizeNumber('1/2')).toBe('0.5');
    expect(normalizeNumber('3/4')).toBe('0.75');
    expect(parseFloat(normalizeNumber('22/7'))).toBeCloseTo(3.142857);
  });

  it('should handle scientific notation conversion', () => {
    expect(normalizeNumber('1e3')).toBe('1000');
    expect(normalizeNumber('5e-3')).toBe('0.005');
  });

  it('should preserve regular numbers', () => {
    expect(normalizeNumber('42')).toBe('42');
    expect(normalizeNumber('3.14')).toBe('3.14');
  });

  it('should handle edge cases', () => {
    expect(normalizeNumber('0/5')).toBe('0');
    expect(normalizeNumber('5/0')).toBe('5/0'); // Division by zero unchanged
    expect(normalizeNumber('1e-10')).toBe('1e-10'); // Very small numbers kept in scientific
  });
});

describe('parseMultiFormatInput', () => {
  it('should handle empty input', () => {
    const result = parseMultiFormatInput('');
    expect(result.validNumbers).toEqual([]);
    expect(result.invalidEntries).toEqual([]);
    expect(result.metadata.formatDetected).toBe('empty');
  });

  it('should parse mixed format input', () => {
    const result = parseMultiFormatInput('1, 2; 3\n4\t5');
    expect(result.validNumbers).toEqual([1, 2, 3, 4, 5]);
    expect(result.invalidEntries).toEqual([]);
    expect(result.metadata.totalEntries).toBe(5);
  });

  it('should handle invalid entries', () => {
    const result = parseMultiFormatInput('1, abc, 3, def, 5');
    expect(result.validNumbers).toEqual([1, 3, 5]);
    expect(result.invalidEntries).toEqual(['abc', 'def']);
    expect(result.metadata.totalEntries).toBe(5);
  });

  it('should calculate statistics', () => {
    const result = parseMultiFormatInput('1, 2, 3, 4, 5');
    expect(result.metadata.statistics).toEqual({
      min: 1,
      max: 5,
      range: 4
    });
  });

  it('should find duplicates', () => {
    const result = parseMultiFormatInput('1, 2, 2, 3, 3, 3');
    expect(result.metadata.duplicates).toEqual([2, 3]);
  });

  it('should handle large datasets', () => {
    const largeData = Array.from({ length: 1000 }, (_, i) => i).join(', ');
    const result = parseMultiFormatInput(largeData);
    expect(result.validNumbers).toHaveLength(1000);
    expect(result.metadata.statistics?.min).toBe(0);
    expect(result.metadata.statistics?.max).toBe(999);
  });

  it('should handle extreme values', () => {
    const result = parseMultiFormatInput('1e-10, 1e10, -1e10');
    expect(result.validNumbers).toEqual([1e-10, 1e10, -1e10]);
    expect(result.metadata.statistics?.range).toBe(2e10);
  });
});

describe('parseEducationalData', () => {
  it('should identify valid grades', () => {
    const result = parseEducationalData('85, 92, 78, 96, 105, -5');
    expect(result.gradingInfo.validGrades).toEqual([85, 92, 78, 96]);
    expect(result.gradingInfo.outOfRange).toEqual([105, -5]);
  });

  it('should calculate grade distribution', () => {
    const result = parseEducationalData('95, 85, 75, 65, 55');
    expect(result.gradingInfo.distribution).toEqual({
      'A (90-100)': 1,
      'B (80-89)': 1,
      'C (70-79)': 1,
      'D (60-69)': 1,
      'F (0-59)': 1
    });
  });

  it('should handle custom grade scale', () => {
    const result = parseEducationalData('3.8, 3.2, 2.7, 1.5, 4.5', { min: 0, max: 4.0 });
    expect(result.gradingInfo.validGrades).toEqual([3.8, 3.2, 2.7, 1.5]);
    expect(result.gradingInfo.outOfRange).toEqual([4.5]);
  });
});

describe('parseScientificData', () => {
  it('should detect scientific notation', () => {
    const result = parseScientificData('1.23e-4, 5.67e+2, 890');
    expect(result.scientificInfo.hasScientificNotation).toBe(true);
  });

  it('should estimate significant figures', () => {
    const result = parseScientificData('1.23, 45.67, 890.12');
    expect(result.scientificInfo.significantFigures).toEqual([3, 4, 5]);
  });

  it('should detect precision issues', () => {
    const result = parseScientificData('1.12345678901234');
    expect(result.scientificInfo.precisionIssues).toHaveLength(1);
    expect(result.scientificInfo.precisionIssues[0]).toContain('high precision');
  });

  it('should suggest appropriate significant figures', () => {
    const result = parseScientificData('1.23, 4.567, 89.012');
    expect(result.scientificInfo.suggestedSignificantFigures).toBeGreaterThan(3);
  });
});

describe('Edge cases and boundary conditions', () => {
  it('should handle extremely long input', () => {
    const longInput = Array.from({ length: 10000 }, (_, i) => i).join(', ');
    const result = parseMultiFormatInput(longInput);
    expect(result.validNumbers).toHaveLength(10000);
  });

  it('should handle very precise numbers', () => {
    const result = parseMultiFormatInput('3.141592653589793238462643383279');
    expect(result.validNumbers).toHaveLength(1);
    expect(result.validNumbers[0]).toBeCloseTo(Math.PI, 5);
  });

  it('should handle unicode and special characters', () => {
    const result = parseMultiFormatInput('1，2，3'); // Chinese commas
    expect(result.validNumbers).toEqual([1]); // Only first number parsed correctly
  });

  it('should handle mixed number formats', () => {
    const result = parseMultiFormatInput('42, 3.14, 1e-3, 50%, 3/4');
    expect(result.validNumbers).toHaveLength(5);
  });

  it('should handle all-invalid input gracefully', () => {
    const result = parseMultiFormatInput('abc, def, ghi');
    expect(result.validNumbers).toEqual([]);
    expect(result.invalidEntries).toEqual(['abc', 'def', 'ghi']);
  });

  it('should handle single-character inputs', () => {
    expect(parseMultiFormatInput('5').validNumbers).toEqual([5]);
    expect(parseMultiFormatInput('a').invalidEntries).toEqual(['a']);
  });

  it('should handle negative zero', () => {
    const result = parseMultiFormatInput('-0, 0, +0');
    expect(result.validNumbers).toEqual([-0, 0, 0]); // JavaScript preserves -0
  });

  it('should handle infinity and NaN strings', () => {
    const result = parseMultiFormatInput('Infinity, -Infinity, NaN');
    expect(result.validNumbers).toEqual([]);
    expect(result.invalidEntries).toEqual(['Infinity', '-Infinity', 'NaN']);
  });
});

describe('Performance and memory tests', () => {
  it('should handle large datasets efficiently', () => {
    const start = performance.now();
    const largeData = Array.from({ length: 100000 }, (_, i) => (Math.random() * 1000).toFixed(2)).join(', ');
    const result = parseMultiFormatInput(largeData);
    const end = performance.now();
    
    expect(result.validNumbers).toHaveLength(100000);
    expect(end - start).toBeLessThan(5000); // Should complete within 5 seconds
  });

  it('should handle duplicate detection efficiently', () => {
    const dataWithDuplicates = Array.from({ length: 10000 }, () => Math.floor(Math.random() * 100)).join(', ');
    const result = parseMultiFormatInput(dataWithDuplicates);
    
    expect(result.metadata.duplicates.length).toBeGreaterThan(0);
  });
});

describe('Utility functions', () => {
  describe('findDuplicates', () => {
    it('should find duplicate numbers', () => {
      expect(findDuplicates([1, 2, 3, 2, 4, 3, 5])).toEqual([2, 3]);
    });

    it('should return empty array for no duplicates', () => {
      expect(findDuplicates([1, 2, 3, 4, 5])).toEqual([]);
    });

    it('should handle empty array', () => {
      expect(findDuplicates([])).toEqual([]);
    });
  });

  describe('calculateBasicStats', () => {
    it('should calculate statistics correctly', () => {
      const stats = calculateBasicStats([1, 2, 3, 4, 5]);
      expect(stats).toEqual({ min: 1, max: 5, range: 4 });
    });

    it('should handle single value', () => {
      const stats = calculateBasicStats([42]);
      expect(stats).toEqual({ min: 42, max: 42, range: 0 });
    });

    it('should handle empty array', () => {
      const stats = calculateBasicStats([]);
      expect(stats).toEqual({ min: 0, max: 0, range: 0 });
    });
  });
});