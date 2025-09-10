/**
 * Unit tests for useMeanCalculator hook
 * Tests React hook functionality and state management
 */

import { renderHook, act } from '@testing-library/react'
import { useMeanCalculator } from '../useMeanCalculator'

// Mock the math and validation utilities
jest.mock('../../lib/math', () => ({
  parseNumberInput: jest.fn(),
  calculateMean: jest.fn(),
  generateCalculationSteps: jest.fn(),
}))

jest.mock('../../lib/validation', () => ({
  validationHelpers: {
    detectDataIssues: jest.fn(),
  },
}))

const mockParseNumberInput = require('../../lib/math').parseNumberInput
const mockCalculateMean = require('../../lib/math').calculateMean
const mockGenerateCalculationSteps = require('../../lib/math').generateCalculationSteps
const mockDetectDataIssues = require('../../lib/validation').validationHelpers.detectDataIssues

describe('useMeanCalculator', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with default values', () => {
    const { result } = renderHook(() => useMeanCalculator())
    
    expect(result.current.input).toBe('')
    expect(result.current.precision).toBe(2)
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
    expect(result.current.isCalculating).toBe(false)
    expect(result.current.isValid).toBe(false)
  })

  it('should initialize with custom values', () => {
    const { result } = renderHook(() => 
      useMeanCalculator({
        precision: 4,
        autoCalculate: false,
        validateInput: false,
      })
    )
    
    expect(result.current.precision).toBe(4)
  })

  it('should update input', () => {
    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })
    
    expect(result.current.input).toBe('1, 2, 3')
  })

  it('should parse input correctly', () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })

    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })
    
    expect(mockParseNumberInput).toHaveBeenCalledWith('1, 2, 3')
    expect(result.current.isValid).toBe(true)
    expect(result.current.validCount).toBe(3)
    expect(result.current.invalidCount).toBe(0)
  })

  it('should handle invalid input', () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [],
      invalidEntries: ['abc'],
    })

    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.setInput('abc')
    })
    
    expect(result.current.isValid).toBe(false)
    expect(result.current.validCount).toBe(0)
    expect(result.current.invalidCount).toBe(1)
  })

  it('should auto-calculate when enabled', async () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })
    mockCalculateMean.mockReturnValue({
      mean: 2,
      sum: 6,
      count: 3,
    })
    mockGenerateCalculationSteps.mockReturnValue(['Step 1', 'Step 2'])
    mockDetectDataIssues.mockReturnValue({
      warnings: [],
      suggestions: [],
    })

    const { result } = renderHook(() => useMeanCalculator({ autoCalculate: true }))
    
    await act(async () => {
      result.current.setInput('1, 2, 3')
    })

    // Wait for async calculation to complete
    await act(async () => {
      await new Promise(resolve => setTimeout(resolve, 20))
    })
    
    expect(result.current.result).toEqual(
      expect.objectContaining({
        mean: 2,
        sum: 6,
        count: 3,
        steps: ['Step 1', 'Step 2'],
        validNumbers: [1, 2, 3],
        invalidEntries: [],
        warnings: [],
        suggestions: [],
      })
    )
  })

  it('should not auto-calculate when disabled', () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })

    const { result } = renderHook(() => useMeanCalculator({ autoCalculate: false }))
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })
    
    expect(result.current.result).toBeNull()
    expect(mockCalculateMean).not.toHaveBeenCalled()
  })

  it('should calculate manually', async () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })
    mockCalculateMean.mockReturnValue({
      mean: 2,
      sum: 6,
      count: 3,
    })
    mockGenerateCalculationSteps.mockReturnValue(['Step 1'])
    mockDetectDataIssues.mockReturnValue({
      warnings: [],
      suggestions: [],
    })

    const { result } = renderHook(() => useMeanCalculator({ autoCalculate: false }))
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })

    await act(async () => {
      await result.current.calculate()
    })
    
    expect(result.current.result?.mean).toBe(2)
  })

  it('should handle calculation errors', async () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })
    mockCalculateMean.mockImplementation(() => {
      throw new Error('Calculation failed')
    })

    const { result } = renderHook(() => useMeanCalculator({ autoCalculate: false }))
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })

    await act(async () => {
      await result.current.calculate()
    })
    
    expect(result.current.error).toBe('Calculation failed')
    expect(result.current.result).toBeNull()
  })

  it('should update precision', () => {
    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.updatePrecision(4)
    })
    
    expect(result.current.precision).toBe(4)
  })

  it('should clear all data', () => {
    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.setInput('1, 2, 3')
    })

    act(() => {
      result.current.clear()
    })
    
    expect(result.current.input).toBe('')
    expect(result.current.result).toBeNull()
    expect(result.current.error).toBeNull()
  })

  it('should load example data', () => {
    const { result } = renderHook(() => useMeanCalculator())
    
    act(() => {
      result.current.loadExample()
    })
    
    expect(result.current.input).toBe('85, 92, 78, 96, 88, 91, 83, 89')
  })

  it('should copy result to clipboard', async () => {
    // Mock successful clipboard operation
    const writeTextMock = jest.fn().mockResolvedValue(undefined)
    Object.assign(navigator, {
      clipboard: { writeText: writeTextMock }
    })

    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })

    mockCalculateMean.mockReturnValue({
      mean: 2,
      sum: 6,
      count: 3,
    })

    mockGenerateCalculationSteps.mockReturnValue(['1 + 2 + 3 = 6', '6 / 3 = 2'])

    const { result } = renderHook(() => useMeanCalculator())
    
    // Set a result first and calculate
    await act(async () => {
      result.current.setInput('1, 2, 3')
    })

    // Check parsed data validity
    expect(result.current.isValid).toBe(true)
    expect(result.current.validCount).toBe(3)

    await act(async () => {
      await result.current.calculate()
    })

    // Check if result was actually set
    expect(result.current.result).not.toBeNull()
    
    let copyResult: boolean = false
    await act(async () => {
      copyResult = await result.current.copyResult()
    })
    
    expect(copyResult).toBe(true)
    expect(writeTextMock).toHaveBeenCalledWith('Mean: 2\nCount: 3\nSum: 6')
  })

  it('should export data', async () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2, 3],
      invalidEntries: [],
    })

    mockCalculateMean.mockReturnValue({
      mean: 2,
      sum: 6,
      count: 3,
    })

    mockGenerateCalculationSteps.mockReturnValue(['1 + 2 + 3 = 6', '6 / 3 = 2'])

    const { result } = renderHook(() => useMeanCalculator())
    
    await act(async () => {
      result.current.setInput('1, 2, 3')
    })

    await act(async () => {
      await result.current.calculate()
    })

    const exportData = result.current.exportData()
    
    expect(exportData).toEqual(
      expect.objectContaining({
        input: '1, 2, 3',
        result: {
          mean: 2,
          sum: 6,
          count: 3,
          precision: 2,
        },
        validNumbers: [1, 2, 3],
        invalidEntries: [],
        timestamp: expect.any(String),
      })
    )
  })

  it('should detect data quality issues', () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2],
      invalidEntries: [],
    })
    mockDetectDataIssues.mockReturnValue({
      warnings: ['Small dataset warning'],
      suggestions: ['Add more data points'],
    })

    const { result } = renderHook(() => useMeanCalculator({ validateInput: true }))
    
    act(() => {
      result.current.setInput('1, 2')
    })
    
    expect(result.current.hasWarnings).toBe(true)
    expect(mockDetectDataIssues).toHaveBeenCalledWith('1, 2')
  })

  it('should not validate when disabled', () => {
    mockParseNumberInput.mockReturnValue({
      validNumbers: [1, 2],
      invalidEntries: [],
    })

    const { result } = renderHook(() => useMeanCalculator({ validateInput: false }))
    
    act(() => {
      result.current.setInput('1, 2')
    })
    
    expect(result.current.hasWarnings).toBe(false)
    expect(mockDetectDataIssues).not.toHaveBeenCalled()
  })
})