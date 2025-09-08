/**
 * Unit tests for mathematical calculation utilities
 * Tests core statistical functions and data processing
 */

import {
  parseNumberInput,
  calculateMean,
  generateCalculationSteps,
  formatNumber,
  validatePrecision,
} from '../math'

describe('parseNumberInput', () => {
  it('should parse comma-separated numbers', () => {
    const result = parseNumberInput('1, 2, 3, 4, 5')
    expect(result.validNumbers).toEqual([1, 2, 3, 4, 5])
    expect(result.invalidEntries).toEqual([])
  })

  it('should parse space-separated numbers', () => {
    const result = parseNumberInput('1 2 3 4 5')
    expect(result.validNumbers).toEqual([1, 2, 3, 4, 5])
    expect(result.invalidEntries).toEqual([])
  })

  it('should parse newline-separated numbers', () => {
    const result = parseNumberInput('1\n2\n3\n4\n5')
    expect(result.validNumbers).toEqual([1, 2, 3, 4, 5])
    expect(result.invalidEntries).toEqual([])
  })

  it('should handle mixed separators', () => {
    const result = parseNumberInput('1, 2\n3 4\t5')
    expect(result.validNumbers).toEqual([1, 2, 3, 4, 5])
    expect(result.invalidEntries).toEqual([])
  })

  it('should handle decimal numbers', () => {
    const result = parseNumberInput('1.5, 2.7, 3.14')
    expect(result.validNumbers).toEqual([1.5, 2.7, 3.14])
    expect(result.invalidEntries).toEqual([])
  })

  it('should handle negative numbers', () => {
    const result = parseNumberInput('-1, -2.5, 3')
    expect(result.validNumbers).toEqual([-1, -2.5, 3])
    expect(result.invalidEntries).toEqual([])
  })

  it('should filter out invalid entries', () => {
    const result = parseNumberInput('1, abc, 3, def, 5')
    expect(result.validNumbers).toEqual([1, 3, 5])
    expect(result.invalidEntries).toEqual(['abc', 'def'])
  })

  it('should handle empty input', () => {
    const result = parseNumberInput('')
    expect(result.validNumbers).toEqual([])
    expect(result.invalidEntries).toEqual([])
  })

  it('should handle scientific notation', () => {
    const result = parseNumberInput('1e3, 2.5e-2, 3.14e0')
    expect(result.validNumbers).toEqual([1000, 0.025, 3.14])
    expect(result.invalidEntries).toEqual([])
  })
})

describe('calculateMean', () => {
  it('should calculate mean of positive numbers', () => {
    const result = calculateMean([1, 2, 3, 4, 5], 2)
    expect(result.mean).toBe(3)
    expect(result.sum).toBe(15)
    expect(result.count).toBe(5)
  })

  it('should calculate mean with specified precision', () => {
    const result = calculateMean([1, 2, 3], 3)
    expect(result.mean).toBe(2.000)
    expect(result.sum).toBe(6)
    expect(result.count).toBe(3)
  })

  it('should handle decimal numbers with precision', () => {
    const result = calculateMean([1.111, 2.222, 3.333], 2)
    expect(result.mean).toBe(2.22)
    expect(result.sum).toBe(6.666)
    expect(result.count).toBe(3)
  })

  it('should handle negative numbers', () => {
    const result = calculateMean([-1, -2, -3], 2)
    expect(result.mean).toBe(-2)
    expect(result.sum).toBe(-6)
    expect(result.count).toBe(3)
  })

  it('should handle mixed positive and negative numbers', () => {
    const result = calculateMean([-2, 0, 2], 2)
    expect(result.mean).toBe(0)
    expect(result.sum).toBe(0)
    expect(result.count).toBe(3)
  })

  it('should handle single number', () => {
    const result = calculateMean([42], 2)
    expect(result.mean).toBe(42)
    expect(result.sum).toBe(42)
    expect(result.count).toBe(1)
  })

  it('should throw error for empty array', () => {
    expect(() => calculateMean([], 2)).toThrow('Cannot calculate mean of empty array')
  })

  it('should handle very large numbers', () => {
    const result = calculateMean([1e10, 2e10, 3e10], 0)
    expect(result.mean).toBe(20000000000)
    expect(result.sum).toBe(60000000000)
    expect(result.count).toBe(3)
  })
})

describe('generateCalculationSteps', () => {
  it('should generate steps for mean calculation', () => {
    const numbers = [1, 2, 3, 4, 5]
    const result = 3
    const steps = generateCalculationSteps(numbers, result, 'mean', 2)
    
    expect(steps).toHaveLength(4)
    expect(steps[0]).toContain('numbers: 1, 2, 3, 4, 5')
    expect(steps[1]).toContain('sum = 1 + 2 + 3 + 4 + 5 = 15')
    expect(steps[2]).toContain('count = 5')
    expect(steps[3]).toContain('mean = 15 ÷ 5 = 3.00')
  })

  it('should handle different precisions', () => {
    const numbers = [1.1, 2.2, 3.3]
    const result = 2.2
    const steps = generateCalculationSteps(numbers, result, 'mean', 4)
    
    expect(steps[3]).toContain('2.2000')
  })

  it('should handle negative numbers in steps', () => {
    const numbers = [-1, 2, -3]
    const result = -0.67
    const steps = generateCalculationSteps(numbers, result, 'mean', 2)
    
    expect(steps[0]).toContain('-1, 2, -3')
    expect(steps[1]).toContain('(-1) + 2 + (-3) = -2')
  })
})

describe('formatNumber', () => {
  it('should format numbers with specified precision', () => {
    expect(formatNumber(3.14159, 2)).toBe('3.14')
    expect(formatNumber(3.14159, 4)).toBe('3.1416')
    expect(formatNumber(3.14159, 0)).toBe('3')
  })

  it('should handle integers', () => {
    expect(formatNumber(42, 2)).toBe('42.00')
    expect(formatNumber(42, 0)).toBe('42')
  })

  it('should handle negative numbers', () => {
    expect(formatNumber(-3.14159, 2)).toBe('-3.14')
  })

  it('should handle zero', () => {
    expect(formatNumber(0, 2)).toBe('0.00')
    expect(formatNumber(0, 0)).toBe('0')
  })
})

describe('validatePrecision', () => {
  it('should validate precision within range', () => {
    expect(validatePrecision(2)).toBe(2)
    expect(validatePrecision(0)).toBe(0)
    expect(validatePrecision(10)).toBe(10)
  })

  it('should clamp precision to minimum', () => {
    expect(validatePrecision(-1)).toBe(0)
    expect(validatePrecision(-10)).toBe(0)
  })

  it('should clamp precision to maximum', () => {
    expect(validatePrecision(15)).toBe(10)
    expect(validatePrecision(100)).toBe(10)
  })

  it('should handle non-integer precision', () => {
    expect(validatePrecision(2.5)).toBe(2)
    expect(validatePrecision(2.9)).toBe(2)
  })
})