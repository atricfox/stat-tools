/**
 * US-002 Research Assistant Scenario End-to-End Tests
 * Tests the complete research assistant user journey for mean calculator
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import HighPrecisionCalculator from '@/lib/high-precision-calculations';
import { URLStateManager } from '@/lib/url-state-manager';
import Decimal from 'decimal.js';

describe('US-002: Research Assistant Scenario Journey', () => {
  let researchData: number[];
  let calculator: HighPrecisionCalculator;

  beforeEach(() => {
    // Realistic research data - experimental measurements
    researchData = [
      23.456, 23.512, 23.398, 23.467, 23.523,
      23.445, 23.498, 23.534, 23.421, 23.489,
      23.567, 23.432, 23.501, 23.478, 23.516,
      23.412, 23.543, 23.465, 23.487, 23.509
    ];
    calculator = new HighPrecisionCalculator(researchData);
  });

  describe('High-Precision Calculations', () => {
    it('should provide high-precision mean calculation', () => {
      const result = calculator.calculateAll();
      
      // Mean should be calculated with high precision
      expect(result.mean.toFixed(10)).toMatch(/^\d+\.\d{10}$/);
      expect(result.mean.greaterThan(23.4)).toBe(true);
      expect(result.mean.lessThan(23.6)).toBe(true);
    });

    it('should calculate comprehensive statistical measures', () => {
      const result = calculator.calculateAll();
      
      // Verify all statistical measures are present and valid
      expect(result.variance.greaterThan(0)).toBe(true);
      expect(result.standardDeviation.greaterThan(0)).toBe(true);
      expect(result.standardError.greaterThan(0)).toBe(true);
      expect(result.coefficientOfVariation.greaterThan(0)).toBe(true);
      
      // Advanced statistics
      expect(result.skewness.isFinite()).toBe(true);
      expect(result.kurtosis.isFinite()).toBe(true);
      expect(result.quartiles.iqr.greaterThan(0)).toBe(true);
      expect(result.zScores).toHaveLength(researchData.length);
    });

    it('should provide confidence intervals', () => {
      const result = calculator.calculateAll();
      
      expect(result.confidenceInterval95.lower.lessThan(result.mean)).toBe(true);
      expect(result.confidenceInterval95.upper.greaterThan(result.mean)).toBe(true);
      
      // CI should be reasonable for this precision
      const ciWidth = result.confidenceInterval95.upper.minus(result.confidenceInterval95.lower);
      expect(ciWidth.greaterThan(0)).toBe(true);
      expect(ciWidth.lessThan(1)).toBe(true); // Should be tight for precise measurements
    });

    it('should detect outliers appropriately', () => {
      const result = calculator.calculateAll();
      
      expect(Array.isArray(result.outliers.mild)).toBe(true);
      expect(Array.isArray(result.outliers.extreme)).toBe(true);
      
      // For well-controlled experimental data, should have few or no outliers
      expect(result.outliers.extreme.length).toBeLessThan(2);
    });
  });

  describe('Statistical Tests', () => {
    it('should perform one-sample t-test', () => {
      const hypothesizedMean = 23.5;
      const testResult = calculator.oneSampleTTest(hypothesizedMean);
      
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
    it('should perform bootstrap resampling for robust CI', () => {
      const bootstrapResult = calculator.bootstrap(1000, 0.95);
      
      expect(bootstrapResult.iterations).toBe(1000);
      expect(bootstrapResult.bootstrapMeans).toHaveLength(1000);
      expect(bootstrapResult.bootstrapCI.confidence).toBe(0.95);
      expect(bootstrapResult.bias.isFinite()).toBe(true);
      expect(bootstrapResult.standardError.greaterThan(0)).toBe(true);
      
      // Bootstrap CI should be reasonable
      const original = calculator.calculateAll().mean;
      expect(bootstrapResult.bootstrapCI.lower.lessThanOrEqualTo(original)).toBe(true);
      expect(bootstrapResult.bootstrapCI.upper.greaterThanOrEqualTo(original)).toBe(true);
    });

    it('should provide bootstrap standard error', () => {
      const bootstrapResult = calculator.bootstrap(500, 0.90);
      const directResult = calculator.calculateAll();
      
      // Bootstrap SE should be close to analytical SE
      const ratio = bootstrapResult.standardError.dividedBy(directResult.standardError);
      expect(ratio.greaterThan(0.5)).toBe(true);
      expect(ratio.lessThan(2)).toBe(true); // Should be reasonably close
    });
  });

  describe('URL State Management', () => {
    it('should encode and decode calculator state correctly', () => {
      const state = {
        data: researchData,
        precision: 6,
        context: 'research' as const,
        showSteps: true,
        showAdvancedStats: true,
        timestamp: Date.now(),
        version: '1.0',
        metadata: {
          title: 'Experimental Measurements',
          description: 'High-precision laboratory measurements',
          tags: ['experiment', 'precision', 'research'],
          author: 'Research Team'
        }
      };

      const encoded = URLStateManager.encodeState(state);
      expect(typeof encoded).toBe('string');
      expect(encoded.length).toBeGreaterThan(0);

      const decoded = URLStateManager.decodeState(encoded);
      expect(decoded.data).toEqual(researchData);
      expect(decoded.precision).toBe(6);
      expect(decoded.context).toBe('research');
      expect(decoded.showAdvancedStats).toBe(true);
      expect(decoded.metadata?.title).toBe('Experimental Measurements');
    });

    it('should validate state correctly', () => {
      const validState = {
        data: [1, 2, 3],
        precision: 4,
        context: 'research' as const,
        showSteps: true,
        showAdvancedStats: true,
        timestamp: Date.now(),
        version: '1.0'
      };

      expect(URLStateManager.validateState(validState)).toBe(true);

      // Test invalid states
      expect(URLStateManager.validateState(null)).toBe(false);
      expect(URLStateManager.validateState({ ...validState, data: 'invalid' })).toBe(false);
      expect(URLStateManager.validateState({ ...validState, precision: -1 })).toBe(false);
      expect(URLStateManager.validateState({ ...validState, context: 'invalid' })).toBe(false);
    });

    it('should create shareable URLs', () => {
      const state = {
        data: researchData.slice(0, 5), // Smaller dataset for URL
        precision: 4,
        context: 'research' as const,
        showSteps: true,
        showAdvancedStats: true,
        timestamp: Date.now(),
        version: '1.0',
        metadata: {
          title: 'Sample Data'
        }
      };

      const shareable = URLStateManager.createShareableUrl(
        state,
        'https://statcal.com/tools/mean',
        {
          includeMetadata: true,
          expiresIn: 24
        }
      );

      expect(shareable.id).toBeTruthy();
      expect(shareable.url).toContain('https://statcal.com/tools/mean');
      expect(shareable.url).toContain('state=');
      expect(shareable.isPublic).toBe(true);
      expect(shareable.expiresAt).toBeInstanceOf(Date);
    });

    it('should handle large datasets gracefully', () => {
      const largeData = Array.from({ length: 1000 }, (_, i) => i * 0.001 + 20);
      const state = {
        data: largeData,
        precision: 8,
        context: 'research' as const,
        showSteps: false,
        showAdvancedStats: true,
        timestamp: Date.now(),
        version: '1.0'
      };

      // Should either encode successfully or throw appropriate error
      try {
        const encoded = URLStateManager.encodeState(state);
        expect(typeof encoded).toBe('string');
        
        // If successful, decoding should work
        const decoded = URLStateManager.decodeState(encoded);
        expect(decoded.data).toHaveLength(1000);
      } catch (error) {
        // Should fail gracefully with meaningful error
        expect(error instanceof Error).toBe(true);
        expect((error as Error).message).toContain('State too large for URL encoding');
      }
    });
  });

  describe('Research-Specific Features', () => {
    it('should provide multiple precision levels', () => {
      const formatted2 = calculator.formatResults(2);
      const formatted8 = calculator.formatResults(8);
      
      // Different precision levels should show different detail
      expect(formatted2.mean).toMatch(/^\d+\.\d{2}$/);
      expect(formatted8.mean).toMatch(/^\d+\.\d{8}$/);
      
      // All measures should be formatted
      expect(formatted8.standardDeviation).toBeTruthy();
      expect(formatted8.confidenceInterval95).toMatch(/^\[\d+\.\d{8}, \d+\.\d{8}\]$/);
    });

    it('should handle scientific notation in input', () => {
      const scientificData = ['2.3456e1', '2.3512e1', '2.3398e1'];
      const scientificCalc = new HighPrecisionCalculator(scientificData);
      const result = scientificCalc.calculateAll();
      
      expect(result.count).toBe(3);
      expect(result.mean.greaterThan(23)).toBe(true);
      expect(result.mean.lessThan(24)).toBe(true);
    });

    it('should provide research-quality statistical reporting', () => {
      const result = calculator.calculateAll();
      
      // Should provide all components needed for research reporting
      const reportComponents = {
        sampleSize: result.count.toString(),
        mean: result.mean.toFixed(3),
        standardDeviation: result.standardDeviation.toFixed(3),
        standardError: result.standardError.toFixed(4),
        confidenceInterval: `[${result.confidenceInterval95.lower.toFixed(3)}, ${result.confidenceInterval95.upper.toFixed(3)}]`,
        median: result.median.toFixed(3),
        iqr: result.quartiles.iqr.toFixed(3),
        skewness: result.skewness.toFixed(3),
        kurtosis: result.kurtosis.toFixed(3)
      };

      Object.values(reportComponents).forEach(component => {
        expect(component).toBeTruthy();
        expect(typeof component).toBe('string');
      });
    });
  });

  describe('Error Handling and Robustness', () => {
    it('should handle missing or invalid data gracefully', () => {
      expect(() => new HighPrecisionCalculator([])).toThrow('Dataset cannot be empty');
      expect(() => new HighPrecisionCalculator([NaN, 1, 2])).toThrow('Dataset contains invalid values');
      expect(() => new HighPrecisionCalculator([Infinity, 1, 2])).toThrow('Dataset contains invalid values');
    });

    it('should handle extreme precision requirements', () => {
      const result = calculator.calculateAll();
      const highPrecision = result.mean.toFixed(20);
      
      expect(highPrecision).toMatch(/^\d+\.\d{20}$/);
      expect(highPrecision).not.toBe('NaN');
    });

    it('should maintain numerical stability with varied data scales', () => {
      const microData = researchData.map(x => x * 1e-6); // Micro scale
      const microCalc = new HighPrecisionCalculator(microData);
      const microResult = microCalc.calculateAll();
      
      expect(microResult.mean.isFinite()).toBe(true);
      expect(microResult.standardDeviation.isFinite()).toBe(true);
      
      const megaData = researchData.map(x => x * 1e6); // Mega scale
      const megaCalc = new HighPrecisionCalculator(megaData);
      const megaResult = megaCalc.calculateAll();
      
      expect(megaResult.mean.isFinite()).toBe(true);
      expect(megaResult.standardDeviation.isFinite()).toBe(true);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle moderately large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, () => Math.random() * 100 + 50);
      
      const startTime = performance.now();
      const largeCalc = new HighPrecisionCalculator(largeData);
      const result = largeCalc.calculateAll();
      const endTime = performance.now();
      
      expect(result.count).toBe(10000);
      expect(result.mean.isFinite()).toBe(true);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should perform bootstrap analysis within reasonable time', () => {
      const startTime = performance.now();
      const bootstrapResult = calculator.bootstrap(1000, 0.95);
      const endTime = performance.now();
      
      expect(bootstrapResult.iterations).toBe(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Research Workflow Integration', () => {
    it('should support typical research analysis workflow', () => {
      // 1. Data input and validation
      expect(researchData.every(x => typeof x === 'number' && !isNaN(x))).toBe(true);
      
      // 2. Descriptive statistics
      const descriptive = calculator.calculateAll();
      expect(descriptive.mean.isFinite()).toBe(true);
      expect(descriptive.standardDeviation.isFinite()).toBe(true);
      
      // 3. Statistical testing
      const tTest = calculator.oneSampleTTest(23.5);
      expect(typeof tTest.significant).toBe('boolean');
      
      // 4. Robust analysis (bootstrap)
      const bootstrap = calculator.bootstrap(500);
      expect(bootstrap.bootstrapCI.confidence).toBe(0.95);
      
      // 5. Results formatting for publication
      const formatted = calculator.formatResults(3);
      expect(formatted.mean).toMatch(/^\d+\.\d{3}$/);
      expect(formatted.confidenceInterval95).toContain('[');
    });

    it('should provide reproducible results', () => {
      const calc1 = new HighPrecisionCalculator(researchData);
      const calc2 = new HighPrecisionCalculator(researchData);
      
      const result1 = calc1.calculateAll();
      const result2 = calc2.calculateAll();
      
      expect(result1.mean.equals(result2.mean)).toBe(true);
      expect(result1.standardDeviation.equals(result2.standardDeviation)).toBe(true);
      expect(result1.variance.equals(result2.variance)).toBe(true);
    });
  });
});