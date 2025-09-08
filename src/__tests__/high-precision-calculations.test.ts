/**
 * High precision calculations test suite
 * Tests scientific-grade calculation accuracy and statistical functions
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import HighPrecisionCalculator from '@/lib/high-precision-calculations';
import Decimal from 'decimal.js';

describe('HighPrecisionCalculator', () => {
  let calculator: HighPrecisionCalculator;
  let testData: number[];

  beforeEach(() => {
    testData = [1.1, 2.2, 3.3, 4.4, 5.5, 6.6, 7.7, 8.8, 9.9, 10.1];
    calculator = new HighPrecisionCalculator(testData);
  });

  describe('Basic Statistics', () => {
    it('should calculate mean with high precision', () => {
      const result = calculator.calculateAll();
      // Mean should be (1.1 + 2.2 + ... + 10.1) / 10 = 59.6 / 10 = 5.96
      expect(result.mean.toFixed(10)).toBe('5.9600000000');
    });

    it('should calculate sum accurately', () => {
      const result = calculator.calculateAll();
      expect(result.sum.toFixed(1)).toBe('59.6');
      expect(result.count).toBe(10);
    });

    it('should calculate variance and standard deviation', () => {
      const result = calculator.calculateAll();
      expect(result.variance.greaterThan(0)).toBe(true);
      expect(result.standardDeviation.greaterThan(0)).toBe(true);
      // Variance should be positive for non-constant data
    });

    it('should calculate median correctly', () => {
      const result = calculator.calculateAll();
      // Median of sorted [1.1, 2.2, ..., 10.1] should be (5.5 + 6.6) / 2 = 6.05
      expect(result.median.toFixed(2)).toBe('6.05');
    });

    it('should calculate min and max values', () => {
      const result = calculator.calculateAll();
      expect(result.min.toFixed(1)).toBe('1.1');
      expect(result.max.toFixed(1)).toBe('10.1');
      expect(result.range.toFixed(1)).toBe('9.0');
    });
  });

  describe('Advanced Statistics', () => {
    it('should calculate quartiles correctly', () => {
      const result = calculator.calculateAll();
      expect(result.quartiles.q1.greaterThan(0)).toBe(true);
      expect(result.quartiles.q2.equals(result.median)).toBe(true);
      expect(result.quartiles.q3.greaterThan(result.quartiles.q1)).toBe(true);
      expect(result.quartiles.iqr.greaterThan(0)).toBe(true);
    });

    it('should calculate skewness and kurtosis', () => {
      const result = calculator.calculateAll();
      // For this symmetric-ish data, skewness should be close to 0
      expect(result.skewness.abs().lessThan(1)).toBe(true);
      expect(result.kurtosis.isFinite()).toBe(true);
    });

    it('should calculate coefficient of variation', () => {
      const result = calculator.calculateAll();
      expect(result.coefficientOfVariation.greaterThan(0)).toBe(true);
      // CV should be (std dev / mean) * 100
    });

    it('should calculate z-scores', () => {
      const result = calculator.calculateAll();
      expect(result.zScores).toHaveLength(10);
      
      // Sum of z-scores should be close to 0
      const zSum = result.zScores.reduce((acc, z) => acc.plus(z), new Decimal(0));
      expect(zSum.abs().lessThan(0.0001)).toBe(true);
    });

    it('should calculate confidence intervals', () => {
      const result = calculator.calculateAll();
      expect(result.confidenceInterval95.lower.lessThan(result.mean)).toBe(true);
      expect(result.confidenceInterval95.upper.greaterThan(result.mean)).toBe(true);
    });
  });

  describe('Outlier Detection', () => {
    it('should detect no outliers in normal data', () => {
      const result = calculator.calculateAll();
      expect(result.outliers.mild).toHaveLength(0);
      expect(result.outliers.extreme).toHaveLength(0);
    });

    it('should detect outliers in data with extreme values', () => {
      const outlierData = [1, 2, 3, 4, 5, 100]; // 100 is an outlier
      const outlierCalc = new HighPrecisionCalculator(outlierData);
      const result = outlierCalc.calculateAll();
      
      expect(result.outliers.mild.length + result.outliers.extreme.length).toBeGreaterThan(0);
    });
  });

  describe('Statistical Tests', () => {
    it('should perform one-sample t-test', () => {
      const testResult = calculator.oneSampleTTest(5.0);
      
      expect(testResult.name).toBe('One-Sample t-test');
      expect(testResult.testStatistic.isFinite()).toBe(true);
      expect(testResult.pValue.greaterThanOrEqualTo(0)).toBe(true);
      expect(testResult.pValue.lessThanOrEqualTo(1)).toBe(true);
      expect(testResult.criticalValue.greaterThan(0)).toBe(true);
      expect(typeof testResult.significant).toBe('boolean');
      expect(testResult.effectSize?.isFinite()).toBe(true);
    });

    it('should perform normality test', () => {
      const testResult = calculator.normalityTest();
      
      expect(testResult.name).toBe('Shapiro-Wilk Normality Test');
      expect(testResult.testStatistic.isFinite()).toBe(true);
      expect(testResult.pValue.greaterThanOrEqualTo(0)).toBe(true);
      expect(testResult.pValue.lessThanOrEqualTo(1)).toBe(true);
      expect(typeof testResult.significant).toBe('boolean');
    });
  });

  describe('Bootstrap Analysis', () => {
    it('should perform bootstrap resampling', () => {
      const bootstrap = calculator.bootstrap(1000, 0.95);
      
      expect(bootstrap.iterations).toBe(1000);
      expect(bootstrap.bootstrapMeans).toHaveLength(1000);
      expect(bootstrap.bootstrapCI.confidence).toBe(0.95);
      expect(bootstrap.bootstrapCI.lower.lessThan(bootstrap.bootstrapCI.upper)).toBe(true);
      expect(bootstrap.bias.isFinite()).toBe(true);
      expect(bootstrap.standardError.greaterThan(0)).toBe(true);
    });

    it('should provide reasonable confidence intervals', () => {
      const bootstrap = calculator.bootstrap(100, 0.90);
      const directResult = calculator.calculateAll();
      
      // Bootstrap CI should contain the sample mean
      expect(bootstrap.bootstrapCI.lower.lessThanOrEqualTo(directResult.mean)).toBe(true);
      expect(bootstrap.bootstrapCI.upper.greaterThanOrEqualTo(directResult.mean)).toBe(true);
    });
  });

  describe('Precision and Formatting', () => {
    it('should format results with specified precision', () => {
      const formatted = calculator.formatResults(3);
      
      expect(typeof formatted.mean).toBe('string');
      expect(formatted.mean).toMatch(/^\d+\.\d{3}$/);
      expect(formatted.standardDeviation).toMatch(/^\d+\.\d{3}$/);
      expect(formatted.confidenceInterval95).toMatch(/^\[\d+\.\d{3}, \d+\.\d{3}\]$/);
    });

    it('should handle different precision levels', () => {
      const precision0 = calculator.formatResults(0);
      const precision6 = calculator.formatResults(6);
      
      expect(precision0.mean).toMatch(/^\d+$/);
      expect(precision6.mean).toMatch(/^\d+\.\d{6}$/);
    });

    it('should format percentage values correctly', () => {
      const formatted = calculator.formatResults(2);
      expect(formatted.coefficientOfVariation).toMatch(/^\d+\.\d{2}%$/);
    });
  });

  describe('Edge Cases and Error Handling', () => {
    it('should handle empty dataset', () => {
      expect(() => new HighPrecisionCalculator([])).toThrow('Dataset cannot be empty');
    });

    it('should handle invalid data', () => {
      expect(() => new HighPrecisionCalculator([NaN, 1, 2])).toThrow('Dataset contains invalid values');
      expect(() => new HighPrecisionCalculator([Infinity, 1, 2])).toThrow('Dataset contains invalid values');
    });

    it('should handle single data point', () => {
      const singleCalc = new HighPrecisionCalculator([5.5]);
      const result = singleCalc.calculateAll();
      
      expect(result.mean.toFixed(1)).toBe('5.5');
      expect(result.variance.toFixed(1)).toBe('0.0'); // Variance of single point is 0
      expect(result.median.toFixed(1)).toBe('5.5');
      expect(result.count).toBe(1);
    });

    it('should handle identical values', () => {
      const identicalCalc = new HighPrecisionCalculator([3, 3, 3, 3]);
      const result = identicalCalc.calculateAll();
      
      expect(result.mean.toFixed(1)).toBe('3.0');
      expect(result.variance.toFixed(10)).toBe('0.0000000000');
      expect(result.standardDeviation.toFixed(10)).toBe('0.0000000000');
      expect(result.mode).toHaveLength(1);
      expect(result.mode[0].toFixed(1)).toBe('3.0');
    });

    it('should handle large datasets', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => i + 1);
      const largeCalc = new HighPrecisionCalculator(largeData);
      const result = largeCalc.calculateAll();
      
      expect(result.count).toBe(10000);
      expect(result.mean.toFixed(1)).toBe('5000.5');
      expect(result.min.toFixed(1)).toBe('1.0');
      expect(result.max.toFixed(1)).toBe('10000.0');
    });

    it('should handle string input conversion', () => {
      const stringCalc = new HighPrecisionCalculator(['1.1', '2.2', '3.3']);
      const result = stringCalc.calculateAll();
      
      expect(result.mean.toFixed(1)).toBe('2.2');
      expect(result.count).toBe(3);
    });

    it('should handle very high precision requirements', () => {
      const preciseData = [
        '3.141592653589793238462643383279502884197',
        '2.718281828459045235360287471352662497757',
        '1.414213562373095048801688724209698078569'
      ];
      const preciseCalc = new HighPrecisionCalculator(preciseData);
      const result = preciseCalc.calculateAll();
      
      // Should maintain high precision throughout calculation
      expect(result.mean.toFixed(20).length).toBeGreaterThan(20);
    });
  });

  describe('Statistical Accuracy', () => {
    it('should match known statistical values for standard datasets', () => {
      // Standard normal approximation data
      const normalData = [
        -2.0, -1.5, -1.0, -0.5, 0.0, 0.5, 1.0, 1.5, 2.0
      ];
      const normalCalc = new HighPrecisionCalculator(normalData);
      const result = normalCalc.calculateAll();
      
      expect(result.mean.abs().lessThan(0.1)).toBe(true); // Should be close to 0
      expect(result.standardDeviation.greaterThan(1.0)).toBe(true); // Should be > 1
    });

    it('should calculate population vs sample statistics correctly', () => {
      const result = calculator.calculateAll();
      
      // We use sample variance (n-1 denominator)
      // Standard error should be std dev / sqrt(n)
      const expectedSE = result.standardDeviation.dividedBy(Math.sqrt(result.count));
      expect(result.standardError.minus(expectedSE).abs().lessThan(0.0001)).toBe(true);
    });

    it('should maintain numerical stability with extreme values', () => {
      const extremeData = [1e-10, 1e10, 1e-5, 1e5];
      const extremeCalc = new HighPrecisionCalculator(extremeData);
      const result = extremeCalc.calculateAll();
      
      expect(result.mean.isFinite()).toBe(true);
      expect(result.standardDeviation.isFinite()).toBe(true);
      expect(result.variance.isFinite()).toBe(true);
    });
  });
});