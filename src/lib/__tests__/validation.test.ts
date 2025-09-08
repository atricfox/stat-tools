/**
 * Unit tests for validation utilities and schemas
 * Tests form validation and data quality checking
 */

import { z } from 'zod'
import {
  calculatorInputSchema,
  meanCalculatorSchema,
  validationHelpers,
  isValidNumber,
  sanitizeInput,
  parseNumberString,
} from '../validation'

describe('calculatorInputSchema', () => {
  it('should validate valid calculator input', () => {
    const validInput = {
      numbers: '1, 2, 3, 4, 5',
      precision: 2,
    }
    
    expect(() => calculatorInputSchema.parse(validInput)).not.toThrow()
    const result = calculatorInputSchema.parse(validInput)
    expect(result.numbers).toBe('1, 2, 3, 4, 5')
    expect(result.precision).toBe(2)
  })

  it('should apply default precision', () => {
    const input = {
      numbers: '1, 2, 3',
    }
    
    const result = calculatorInputSchema.parse(input)
    expect(result.precision).toBe(2) // default value
  })

  it('should reject empty numbers string', () => {
    const invalidInput = {
      numbers: '',
      precision: 2,
    }
    
    expect(() => calculatorInputSchema.parse(invalidInput)).toThrow()
  })

  it('should reject precision out of range', () => {
    const invalidInput = {
      numbers: '1, 2, 3',
      precision: -1,
    }
    
    expect(() => calculatorInputSchema.parse(invalidInput)).toThrow()
  })

  it('should reject precision too high', () => {
    const invalidInput = {
      numbers: '1, 2, 3',
      precision: 15,
    }
    
    expect(() => calculatorInputSchema.parse(invalidInput)).toThrow()
  })
})

describe('meanCalculatorSchema', () => {
  it('should validate mean calculator input with showSteps', () => {
    const validInput = {
      numbers: '1, 2, 3, 4, 5',
      precision: 2,
      showSteps: true,
    }
    
    const result = meanCalculatorSchema.parse(validInput)
    expect(result.showSteps).toBe(true)
  })

  it('should apply default showSteps value', () => {
    const input = {
      numbers: '1, 2, 3',
      precision: 2,
    }
    
    const result = meanCalculatorSchema.parse(input)
    expect(result.showSteps).toBe(false) // default value
  })
})

describe('isValidNumber', () => {
  it('should validate regular numbers', () => {
    expect(isValidNumber('42')).toBe(true)
    expect(isValidNumber('3.14')).toBe(true)
    expect(isValidNumber('-2.5')).toBe(true)
  })

  it('should validate scientific notation', () => {
    expect(isValidNumber('1e3')).toBe(true)
    expect(isValidNumber('2.5e-2')).toBe(true)
    expect(isValidNumber('3.14e0')).toBe(true)
  })

  it('should reject invalid numbers', () => {
    expect(isValidNumber('abc')).toBe(false)
    expect(isValidNumber('1.2.3')).toBe(false)
    expect(isValidNumber('+')).toBe(false)
    expect(isValidNumber('-')).toBe(false)
  })

  it('should reject infinity and NaN', () => {
    expect(isValidNumber('Infinity')).toBe(false)
    expect(isValidNumber('NaN')).toBe(false)
    expect(isValidNumber('inf')).toBe(false)
  })

  it('should handle empty strings', () => {
    expect(isValidNumber('')).toBe(false)
    expect(isValidNumber('   ')).toBe(false)
  })
})

describe('sanitizeInput', () => {
  it('should trim whitespace', () => {
    expect(sanitizeInput('  1, 2, 3  ')).toBe('1, 2, 3')
  })

  it('should normalize separators', () => {
    expect(sanitizeInput('1;2;3')).toBe('1, 2, 3')
    expect(sanitizeInput('1|2|3')).toBe('1, 2, 3')
  })

  it('should collapse multiple spaces', () => {
    expect(sanitizeInput('1    2    3')).toBe('1, 2, 3')
  })

  it('should handle mixed separators', () => {
    expect(sanitizeInput('1, 2; 3| 4')).toBe('1, 2, 3, 4')
  })

  it('should preserve decimal points', () => {
    expect(sanitizeInput('1.5, 2.7, 3.14')).toBe('1.5, 2.7, 3.14')
  })

  it('should handle negative numbers', () => {
    expect(sanitizeInput('-1, -2.5, 3')).toBe('-1, -2.5, 3')
  })
})

describe('parseNumberString', () => {
  it('should parse valid number strings', () => {
    expect(parseNumberString('42')).toBe(42)
    expect(parseNumberString('3.14')).toBe(3.14)
    expect(parseNumberString('-2.5')).toBe(-2.5)
  })

  it('should parse scientific notation', () => {
    expect(parseNumberString('1e3')).toBe(1000)
    expect(parseNumberString('2.5e-2')).toBe(0.025)
  })

  it('should return null for invalid strings', () => {
    expect(parseNumberString('abc')).toBeNull()
    expect(parseNumberString('1.2.3')).toBeNull()
    expect(parseNumberString('Infinity')).toBeNull()
    expect(parseNumberString('NaN')).toBeNull()
  })

  it('should handle empty strings', () => {
    expect(parseNumberString('')).toBeNull()
    expect(parseNumberString('   ')).toBeNull()
  })
})

describe('validationHelpers.detectDataIssues', () => {
  it('should detect no issues with clean data', () => {
    const result = validationHelpers.detectDataIssues('1, 2, 3, 4, 5')
    expect(result.warnings).toHaveLength(0)
    expect(result.suggestions).toHaveLength(0)
  })

  it('should detect outliers', () => {
    const result = validationHelpers.detectDataIssues('1, 2, 3, 4, 100')
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('outlier')
      ])
    )
  })

  it('should detect small dataset', () => {
    const result = validationHelpers.detectDataIssues('1, 2')
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('small dataset')
      ])
    )
  })

  it('should detect duplicate values', () => {
    const result = validationHelpers.detectDataIssues('1, 2, 2, 3, 3, 3')
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('duplicate')
      ])
    )
  })

  it('should provide suggestions for improvements', () => {
    const result = validationHelpers.detectDataIssues('1, 2')
    expect(result.suggestions.length).toBeGreaterThan(0)
    expect(result.suggestions).toEqual(
      expect.arrayContaining([
        expect.stringContaining('more data points')
      ])
    )
  })

  it('should detect precision issues', () => {
    const result = validationHelpers.detectDataIssues('1.123456789, 2.987654321')
    expect(result.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('high precision')
      ])
    )
  })

  it('should handle edge cases', () => {
    // Empty input
    expect(() => validationHelpers.detectDataIssues('')).not.toThrow()
    
    // Single value
    const singleResult = validationHelpers.detectDataIssues('42')
    expect(singleResult.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('single value')
      ])
    )
  })
})