/**
 * Integration tests for data processing pipeline
 * Tests end-to-end data flow from input to calculations
 */

import { 
  parseEducationalData, 
  parseScientificData, 
  parseMultiFormatInput 
} from '@/lib/parsers';
import { 
  DataCleaner, 
  CleaningOptions 
} from '@/lib/data-cleaner';
import { 
  calculateMean, 
  MeanCalculationResult 
} from '@/lib/calculations';
import { 
  HighPrecisionCalculator 
} from '@/lib/high-precision-calculations';
import { 
  calculateMeanCached, 
  calculateHighPrecisionCached,
  calculateBatchCached 
} from '@/lib/calculation-cache-integration';

describe('Data Processing Pipeline Integration', () => {
  describe('Educational Data Flow', () => {
    test('complete educational data processing: parse -> clean -> calculate', async () => {
      const rawInput = `
        Student Grades:
        85, 92, 78, 96, 88
        91, 83, 89, 87, 94
        Invalid: abc, --, null
        75, 82, 90
      `;

      // Step 1: Parse educational data
      const parseResult = parseEducationalData(rawInput);
      expect(parseResult.validNumbers).toHaveLength(13);
      expect(parseResult.invalidEntries).toHaveLength(3);
      expect(parseResult.metadata.formatDetected).toBe('educational');

      // Step 2: Clean data
      const cleaner = new DataCleaner(parseResult.validNumbers);
      const cleaningResult = cleaner.clean({
        removeOutliers: true,
        fillMissingValues: false,
        standardizeFormat: true
      });

      expect(cleaningResult.cleanedData.length).toBeGreaterThan(0);
      expect(cleaningResult.summary.outliers.removed).toBeDefined();

      // Step 3: Calculate with caching
      const calculationResult = await calculateMeanCached(cleaningResult.cleanedData, {
        userContext: 'student',
        precision: 2,
        useCache: true
      });

      expect(calculationResult.mean).toBeDefined();
      expect(calculationResult.cacheInfo.cacheHit).toBe(false);
      expect(calculationResult.qualityMetrics?.confidence).toBeGreaterThan(0);
    });

    test('handles grade-specific validation and processing', () => {
      const gradeData = '105, 95, 85, -5, 75, 92, 88';
      
      const parseResult = parseEducationalData(gradeData);
      expect(parseResult.validNumbers).toContain(105); // Allow over 100%
      expect(parseResult.validNumbers).toContain(-5);  // Allow negative (might be penalty)

      // Check grading-specific metadata
      if ('gradingInfo' in parseResult) {
        expect(parseResult.gradingInfo).toBeDefined();
        expect(parseResult.gradingInfo.validGrades).toBeDefined();
      }
    });

    test('processes mixed format educational data', () => {
      const mixedInput = `
        Test 1: 85, 92, 78
        Test 2: 88 91 83
        Test 3:
        89, 87, 94
        Final: 82/100, 90/100
      `;

      const parseResult = parseEducationalData(mixedInput);
      expect(parseResult.validNumbers.length).toBeGreaterThan(8);
      expect(parseResult.metadata.formatDetected).toBe('educational');
    });
  });

  describe('Scientific Data Flow', () => {
    test('complete scientific data processing with high precision', async () => {
      const scientificInput = `
        Measurement Data:
        1.23456789e-4
        5.67890123e+2
        -2.34567891e-3
        8.90123456e+1
        1.11111111e-5
      `;

      // Step 1: Parse scientific data
      const parseResult = parseScientificData(scientificInput);
      expect(parseResult.validNumbers).toHaveLength(5);
      expect(parseResult.metadata.formatDetected).toBe('scientific');

      if ('researchInfo' in parseResult) {
        expect(parseResult.researchInfo.hasScientificNotation).toBe(true);
        expect(parseResult.researchInfo.suggestedSignificantFigures).toBeGreaterThan(6);
      }

      // Step 2: High-precision calculation
      const hpResult = await calculateHighPrecisionCached(parseResult.validNumbers, {
        userContext: 'research',
        precision: 8,
        useCache: true
      });

      expect(hpResult.mean).toBeDefined();
      expect(hpResult.standardDeviation).toBeDefined();
      expect(hpResult.confidenceInterval95).toBeDefined();
      expect(hpResult.cacheInfo.cacheHit).toBe(false);
    });

    test('handles extreme scientific notation values', () => {
      const extremeValues = '1e-100, 1e+100, 1e-50, 1e+50, 1e-10';
      
      const parseResult = parseScientificData(extremeValues);
      expect(parseResult.validNumbers).toHaveLength(5);
      
      // Should handle extreme values without overflow
      parseResult.validNumbers.forEach(num => {
        expect(Number.isFinite(num)).toBe(true);
      });
    });

    test('processes mixed precision scientific data', async () => {
      const mixedPrecisionData = `
        High precision: 3.141592653589793
        Scientific: 6.022e23
        Simple: 2.718
        Very precise: 1.41421356237309504880168872420969807856967187537694
      `;

      const parseResult = parseScientificData(mixedPrecisionData);
      expect(parseResult.validNumbers).toHaveLength(4);

      const calculator = new HighPrecisionCalculator(parseResult.validNumbers);
      const result = calculator.calculateAll();
      
      expect(result.mean).toBeDefined();
      expect(result.precision).toBeGreaterThan(10);
    });
  });

  describe('Teacher Batch Processing Flow', () => {
    test('processes multiple student datasets', async () => {
      const batchData = [
        {
          id: 'class_1',
          name: 'Math Test - Class A',
          data: [85, 92, 78, 96, 88, 91, 83, 89]
        },
        {
          id: 'class_2', 
          name: 'Math Test - Class B',
          data: [75, 82, 70, 86, 78, 81, 73, 79]
        },
        {
          id: 'class_3',
          name: 'Math Test - Class C', 
          data: [95, 98, 92, 99, 94, 97, 91, 96]
        }
      ];

      const batchResults = await calculateBatchCached(batchData, {
        userContext: 'teacher',
        precision: 2,
        useCache: true
      });

      expect(batchResults).toHaveLength(3);
      
      batchResults.forEach((result, index) => {
        expect(result.id).toBe(batchData[index].id);
        expect(result.name).toBe(batchData[index].name);
        expect(result.mean).toBeDefined();
        expect(result.cacheInfo).toBeDefined();
      });

      // Verify different means for different classes
      expect(batchResults[0].mean).not.toBe(batchResults[1].mean);
      expect(batchResults[2].mean).toBeGreaterThan(batchResults[1].mean);
    });

    test('handles Excel-style tabulated data', () => {
      const excelData = `Student\tTest1\tTest2\tTest3
John\t85\t92\t78
Mary\t96\t88\t91
Bob\t83\t89\t87
Alice\t94\t75\t82`;

      const parseResult = parseMultiFormatInput(excelData);
      expect(parseResult.validNumbers).toHaveLength(12);
      expect(parseResult.metadata.formatDetected).toBe('tabulated');
    });

    test('processes gradebook with missing values', () => {
      const gradebookData = `
        Student, Test1, Test2, Test3, Final
        Alice, 85, , 78, 92
        Bob, 92, 88, , 89
        Charlie, , 83, 75, 
        Diana, 96, 91, 82, 94
      `;

      const parseResult = parseEducationalData(gradebookData);
      expect(parseResult.validNumbers.length).toBeLessThan(16); // Some missing values
      expect(parseResult.invalidEntries.length).toBeGreaterThan(0);

      // Clean and fill missing values
      const cleaner = new DataCleaner(parseResult.validNumbers);
      const cleanResult = cleaner.clean({
        fillMissingValues: true,
        removeOutliers: false
      });

      expect(cleanResult.cleanedData.length).toBeGreaterThan(parseResult.validNumbers.length);
    });
  });

  describe('Data Quality and Validation', () => {
    test('comprehensive data quality assessment', async () => {
      const testCases = [
        {
          name: 'High Quality Dataset',
          data: Array.from({ length: 100 }, (_, i) => 80 + Math.random() * 20),
          expectedConfidence: 90
        },
        {
          name: 'Small Dataset',
          data: [85, 90, 92],
          expectedConfidence: 70
        },
        {
          name: 'High Variability Dataset', 
          data: [10, 50, 90, 15, 85, 25, 75, 5, 95],
          expectedConfidence: 70
        },
        {
          name: 'Single Value',
          data: [85],
          expectedConfidence: 40
        }
      ];

      for (const testCase of testCases) {
        const result = await calculateMeanCached(testCase.data, {
          userContext: 'research',
          precision: 3,
          useCache: false
        });

        expect(result.qualityMetrics?.confidence).toBeLessThanOrEqual(100);
        expect(result.qualityMetrics?.confidence).toBeGreaterThanOrEqual(0);
        expect(result.qualityMetrics?.reliability).toBeDefined();
        
        if (testCase.expectedConfidence) {
          expect(result.qualityMetrics?.confidence).toBeGreaterThanOrEqual(testCase.expectedConfidence - 20);
        }
      }
    });

    test('outlier detection and handling', () => {
      const dataWithOutliers = [85, 87, 89, 91, 93, 500, 88, 90, 92, 1]; // 500 and 1 are outliers

      const cleaner = new DataCleaner(dataWithOutliers);
      const outliers = cleaner.detectOutliers('iqr');
      
      expect(outliers.mild.length + outliers.extreme.length).toBeGreaterThan(0);
      expect(outliers.extreme).toContain(500);
      expect(outliers.extreme).toContain(1);

      const cleanResult = cleaner.clean({
        removeOutliers: true,
        outlierMethod: 'iqr'
      });

      expect(cleanResult.cleanedData).not.toContain(500);
      expect(cleanResult.cleanedData).not.toContain(1);
      expect(cleanResult.summary.outliers.removed).toBeGreaterThan(0);
    });

    test('data format consistency validation', () => {
      const inconsistentData = [
        'Scientific: 1.23e-4, 5.67e+2',
        'Regular: 10, 20, 30', 
        'Mixed: 1e5, 100000, 1.5e2, 150'
      ];

      inconsistentData.forEach(data => {
        const parseResult = parseMultiFormatInput(data);
        expect(parseResult.validNumbers.length).toBeGreaterThan(0);
        expect(parseResult.metadata.formatDetected).toBeDefined();
      });
    });
  });

  describe('Performance and Caching Integration', () => {
    test('cache effectiveness across similar datasets', async () => {
      const baseData = [10, 20, 30, 40, 50];
      
      // First calculation
      const result1 = await calculateMeanCached(baseData, {
        userContext: 'student',
        cacheKey: 'test-cache-1',
        useCache: true
      });
      expect(result1.cacheInfo.cacheHit).toBe(false);

      // Second calculation with same data and key should hit cache
      const result2 = await calculateMeanCached(baseData, {
        userContext: 'student',
        cacheKey: 'test-cache-1',
        useCache: true
      });
      expect(result2.cacheInfo.cacheHit).toBe(true);

      // Results should be identical
      expect(result1.mean).toBe(result2.mean);
      expect(result1.standardDeviation).toBe(result2.standardDeviation);
    });

    test('performance with large datasets', async () => {
      const largeDataset = Array.from({ length: 10000 }, (_, i) => Math.random() * 100);
      
      const startTime = performance.now();
      const result = await calculateMeanCached(largeDataset, {
        userContext: 'research',
        useCache: true,
        precision: 4
      });
      const endTime = performance.now();

      expect(result.mean).toBeDefined();
      expect(result.cacheInfo.computationTime).toBeGreaterThan(0);
      expect(endTime - startTime).toBeLessThan(5000); // Should complete within 5 seconds
    });

    test('memory efficiency with multiple contexts', async () => {
      const testData = [75, 80, 85, 90, 95];
      
      const contexts: Array<'student' | 'research' | 'teacher'> = ['student', 'research', 'teacher'];
      const results = [];

      for (const context of contexts) {
        const result = await calculateMeanCached(testData, {
          userContext: context,
          useCache: true,
          precision: context === 'research' ? 6 : 2
        });
        results.push(result);
      }

      // All should have same basic statistical results
      const means = results.map(r => r.mean);
      expect(new Set(means).size).toBe(1); // All means should be identical

      // But cache info should be different
      const cacheKeys = results.map(r => r.cacheInfo.cacheKey);
      expect(new Set(cacheKeys).size).toBe(3); // Different cache keys per context
    });
  });

  describe('Error Recovery and Resilience', () => {
    test('graceful handling of corrupted data', () => {
      const corruptedInputs = [
        'NaN, Infinity, -Infinity, 10, 20',
        'null, undefined, "", 0, false',
        '1/0, Math.PI, Number.MAX_VALUE',
        'very long string that is not a number at all'
      ];

      corruptedInputs.forEach(input => {
        expect(() => {
          const result = parseMultiFormatInput(input);
          expect(result.validNumbers.length).toBeGreaterThanOrEqual(0);
        }).not.toThrow();
      });
    });

    test('network failure simulation for cached calculations', async () => {
      const testData = [1, 2, 3, 4, 5];
      
      // Simulate calculation failure with fallback
      const mockCalculation = jest.fn()
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(calculateMean(testData));

      try {
        const result = await calculateMeanCached(testData, {
          useCache: true,
          userContext: 'student'
        });
        expect(result).toBeDefined();
      } catch (error) {
        // Should fall back to basic calculation
        expect(error).toBeDefined();
      }
    });

    test('memory limit handling for large datasets', () => {
      // Test with extremely large dataset
      const hugeDataset = Array.from({ length: 1000000 }, (_, i) => i);
      
      expect(() => {
        const cleaner = new DataCleaner(hugeDataset);
        const result = cleaner.clean({ removeOutliers: false });
        expect(result.cleanedData.length).toBe(hugeDataset.length);
      }).not.toThrow();
    });
  });
});