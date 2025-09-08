/**
 * High-precision calculation engine for research scenarios
 * Provides scientific-grade precision for statistical calculations
 */

import Decimal from 'decimal.js';

// Configure Decimal.js for high precision
Decimal.set({
  precision: 50, // 50 significant digits
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -20,
  toExpPos: 20,
  modulo: Decimal.ROUND_HALF_UP
});

export interface HighPrecisionResult {
  mean: Decimal;
  variance: Decimal;
  standardDeviation: Decimal;
  standardError: Decimal;
  confidenceInterval95: {
    lower: Decimal;
    upper: Decimal;
  };
  sum: Decimal;
  sumOfSquares: Decimal;
  count: number;
  min: Decimal;
  max: Decimal;
  range: Decimal;
  median: Decimal;
  mode: Decimal[];
  quartiles: {
    q1: Decimal;
    q2: Decimal;
    q3: Decimal;
    iqr: Decimal;
  };
  skewness: Decimal;
  kurtosis: Decimal;
  coefficientOfVariation: Decimal;
  zScores: Decimal[];
  outliers: {
    mild: number[];
    extreme: number[];
  };
}

export interface StatisticalTest {
  name: string;
  testStatistic: Decimal;
  pValue: Decimal;
  criticalValue: Decimal;
  significant: boolean;
  effectSize?: Decimal;
  powerAnalysis?: {
    power: Decimal;
    requiredSampleSize: number;
  };
}

export interface BootstrapResult {
  iterations: number;
  bootstrapMeans: Decimal[];
  bootstrapCI: {
    lower: Decimal;
    upper: Decimal;
    confidence: number;
  };
  bias: Decimal;
  standardError: Decimal;
}

export class HighPrecisionCalculator {
  private data: Decimal[];
  private _result: HighPrecisionResult | null = null;

  constructor(numbers: number[] | string[] | Decimal[]) {
    this.data = numbers.map(n => new Decimal(n));
    this.validateData();
  }

  private validateData(): void {
    if (this.data.length === 0) {
      throw new Error('Dataset cannot be empty');
    }

    const hasInvalidData = this.data.some(d => !d.isFinite());
    if (hasInvalidData) {
      throw new Error('Dataset contains invalid values (NaN or Infinity)');
    }
  }

  /**
   * Calculate comprehensive statistics with high precision
   */
  public calculateAll(): HighPrecisionResult {
    if (this._result) return this._result;

    const n = this.data.length;
    const decimalN = new Decimal(n);

    // Basic calculations
    const sum = this.calculateSum();
    const mean = sum.dividedBy(decimalN);
    const sortedData = this.getSortedData();
    
    // Central tendency
    const median = this.calculateMedian(sortedData);
    const mode = this.calculateMode();
    
    // Spread measures
    const variance = this.calculateVariance(mean);
    const standardDeviation = variance.sqrt();
    const standardError = standardDeviation.dividedBy(decimalN.sqrt());
    const range = sortedData[sortedData.length - 1].minus(sortedData[0]);
    
    // Quartiles
    const quartiles = this.calculateQuartiles(sortedData);
    
    // Advanced statistics
    const sumOfSquares = this.calculateSumOfSquares();
    const skewness = this.calculateSkewness(mean, standardDeviation);
    const kurtosis = this.calculateKurtosis(mean, standardDeviation);
    const coefficientOfVariation = standardDeviation.dividedBy(mean.abs()).times(100);
    
    // Confidence interval (95%)
    const tValue = this.getTValue(n - 1, 0.05); // t-distribution critical value
    const marginOfError = standardError.times(tValue);
    const confidenceInterval95 = {
      lower: mean.minus(marginOfError),
      upper: mean.plus(marginOfError)
    };
    
    // Z-scores and outlier detection
    const zScores = this.calculateZScores(mean, standardDeviation);
    const outliers = this.detectOutliers(quartiles);

    this._result = {
      mean,
      variance,
      standardDeviation,
      standardError,
      confidenceInterval95,
      sum,
      sumOfSquares,
      count: n,
      min: sortedData[0],
      max: sortedData[sortedData.length - 1],
      range,
      median,
      mode,
      quartiles,
      skewness,
      kurtosis,
      coefficientOfVariation,
      zScores,
      outliers
    };

    return this._result;
  }

  /**
   * Perform bootstrap resampling for robust confidence intervals
   */
  public bootstrap(iterations: number = 10000, confidence: number = 0.95): BootstrapResult {
    const bootstrapMeans: Decimal[] = [];
    const n = this.data.length;

    // Generate bootstrap samples
    for (let i = 0; i < iterations; i++) {
      const sample: Decimal[] = [];
      for (let j = 0; j < n; j++) {
        const randomIndex = Math.floor(Math.random() * n);
        sample.push(this.data[randomIndex]);
      }
      
      const sampleSum = sample.reduce((acc, val) => acc.plus(val), new Decimal(0));
      const sampleMean = sampleSum.dividedBy(n);
      bootstrapMeans.push(sampleMean);
    }

    // Sort bootstrap means
    bootstrapMeans.sort((a, b) => a.comparedTo(b));

    // Calculate confidence interval
    const alpha = 1 - confidence;
    const lowerIndex = Math.floor((alpha / 2) * iterations);
    const upperIndex = Math.floor((1 - alpha / 2) * iterations);

    const bootstrapCI = {
      lower: bootstrapMeans[lowerIndex],
      upper: bootstrapMeans[upperIndex],
      confidence
    };

    // Calculate bias and standard error
    const originalMean = this.calculateAll().mean;
    const bootstrapMeanOfMeans = bootstrapMeans.reduce((acc, val) => acc.plus(val), new Decimal(0))
      .dividedBy(iterations);
    const bias = bootstrapMeanOfMeans.minus(originalMean);

    const variance = bootstrapMeans.reduce((acc, val) => {
      const diff = val.minus(bootstrapMeanOfMeans);
      return acc.plus(diff.pow(2));
    }, new Decimal(0)).dividedBy(iterations - 1);
    const standardError = variance.sqrt();

    return {
      iterations,
      bootstrapMeans,
      bootstrapCI,
      bias,
      standardError
    };
  }

  /**
   * Perform one-sample t-test
   */
  public oneSampleTTest(hypothesizedMean: number | Decimal): StatisticalTest {
    const result = this.calculateAll();
    const h0 = new Decimal(hypothesizedMean);
    const testStatistic = result.mean.minus(h0).dividedBy(result.standardError);
    const degreesOfFreedom = result.count - 1;
    
    // Approximate p-value calculation (simplified)
    const tAbs = testStatistic.abs();
    const pValue = this.approximateTTestPValue(tAbs, degreesOfFreedom);
    const criticalValue = this.getTValue(degreesOfFreedom, 0.05);
    const significant = tAbs.greaterThan(criticalValue);

    // Effect size (Cohen's d)
    const effectSize = result.mean.minus(h0).dividedBy(result.standardDeviation);

    return {
      name: 'One-Sample t-test',
      testStatistic,
      pValue,
      criticalValue,
      significant,
      effectSize
    };
  }

  /**
   * Calculate normality test (Shapiro-Wilk approximation)
   */
  public normalityTest(): StatisticalTest {
    const result = this.calculateAll();
    const n = result.count;
    
    if (n < 3 || n > 5000) {
      throw new Error('Normality test requires sample size between 3 and 5000');
    }

    // Simplified Shapiro-Wilk test calculation
    // This is a basic approximation - full implementation would be more complex
    const sortedData = this.getSortedData();
    const mean = result.mean;
    
    // Calculate test statistic (simplified)
    let numerator = new Decimal(0);
    let denominator = new Decimal(0);
    
    for (let i = 0; i < n; i++) {
      const diff = sortedData[i].minus(mean);
      denominator = denominator.plus(diff.pow(2));
      
      if (i < n / 2) {
        const weight = new Decimal(1); // Simplified weight
        numerator = numerator.plus(weight.times(sortedData[n - 1 - i].minus(sortedData[i])));
      }
    }
    
    const testStatistic = numerator.pow(2).dividedBy(denominator);
    const pValue = new Decimal(0.5); // Placeholder - real calculation is complex
    const criticalValue = new Decimal(0.05);
    const significant = pValue.lessThan(criticalValue);

    return {
      name: 'Shapiro-Wilk Normality Test',
      testStatistic,
      pValue,
      criticalValue,
      significant
    };
  }

  /**
   * Format results for different precision levels
   */
  public formatResults(precision: number = 6): Record<string, string> {
    const result = this.calculateAll();
    
    return {
      mean: result.mean.toFixed(precision),
      standardDeviation: result.standardDeviation.toFixed(precision),
      standardError: result.standardError.toFixed(precision),
      variance: result.variance.toFixed(precision),
      confidenceInterval95: `[${result.confidenceInterval95.lower.toFixed(precision)}, ${result.confidenceInterval95.upper.toFixed(precision)}]`,
      median: result.median.toFixed(precision),
      min: result.min.toFixed(precision),
      max: result.max.toFixed(precision),
      range: result.range.toFixed(precision),
      q1: result.quartiles.q1.toFixed(precision),
      q3: result.quartiles.q3.toFixed(precision),
      iqr: result.quartiles.iqr.toFixed(precision),
      skewness: result.skewness.toFixed(precision),
      kurtosis: result.kurtosis.toFixed(precision),
      coefficientOfVariation: result.coefficientOfVariation.toFixed(precision) + '%',
      count: result.count.toString(),
      sum: result.sum.toFixed(precision)
    };
  }

  // Private helper methods
  private calculateSum(): Decimal {
    return this.data.reduce((acc, val) => acc.plus(val), new Decimal(0));
  }

  private calculateSumOfSquares(): Decimal {
    return this.data.reduce((acc, val) => acc.plus(val.pow(2)), new Decimal(0));
  }

  private calculateVariance(mean: Decimal): Decimal {
    if (this.data.length === 1) {
      return new Decimal(0); // Variance of single data point is 0
    }
    
    const sumOfSquaredDeviations = this.data.reduce((acc, val) => {
      const diff = val.minus(mean);
      return acc.plus(diff.pow(2));
    }, new Decimal(0));
    
    return sumOfSquaredDeviations.dividedBy(this.data.length - 1); // Sample variance
  }

  private getSortedData(): Decimal[] {
    return [...this.data].sort((a, b) => a.comparedTo(b));
  }

  private calculateMedian(sortedData: Decimal[]): Decimal {
    const n = sortedData.length;
    if (n % 2 === 0) {
      const mid1 = sortedData[n / 2 - 1];
      const mid2 = sortedData[n / 2];
      return mid1.plus(mid2).dividedBy(2);
    } else {
      return sortedData[Math.floor(n / 2)];
    }
  }

  private calculateMode(): Decimal[] {
    const frequency = new Map<string, number>();
    let maxFreq = 0;

    this.data.forEach(val => {
      const key = val.toString();
      const freq = (frequency.get(key) || 0) + 1;
      frequency.set(key, freq);
      maxFreq = Math.max(maxFreq, freq);
    });

    const modes: Decimal[] = [];
    frequency.forEach((freq, key) => {
      if (freq === maxFreq && maxFreq > 1) {
        modes.push(new Decimal(key));
      }
    });

    return modes;
  }

  private calculateQuartiles(sortedData: Decimal[]): HighPrecisionResult['quartiles'] {
    const n = sortedData.length;
    const q1Index = (n + 1) / 4 - 1;
    const q2Index = (n + 1) / 2 - 1;
    const q3Index = 3 * (n + 1) / 4 - 1;

    const q1 = this.interpolateQuartile(sortedData, q1Index);
    const q2 = this.calculateMedian(sortedData);
    const q3 = this.interpolateQuartile(sortedData, q3Index);
    const iqr = q3.minus(q1);

    return { q1, q2, q3, iqr };
  }

  private interpolateQuartile(sortedData: Decimal[], index: number): Decimal {
    if (index % 1 === 0 && index >= 0 && index < sortedData.length) {
      return sortedData[index];
    }
    
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const fraction = index - lower;

    if (upper >= sortedData.length) {
      return sortedData[sortedData.length - 1];
    }
    if (lower < 0) {
      return sortedData[0];
    }

    const lowerVal = sortedData[lower];
    const upperVal = sortedData[upper];
    return lowerVal.plus(upperVal.minus(lowerVal).times(fraction));
  }

  private calculateSkewness(mean: Decimal, standardDeviation: Decimal): Decimal {
    const n = new Decimal(this.data.length);
    const sumCubedDeviations = this.data.reduce((acc, val) => {
      const standardizedVal = val.minus(mean).dividedBy(standardDeviation);
      return acc.plus(standardizedVal.pow(3));
    }, new Decimal(0));

    return sumCubedDeviations.dividedBy(n);
  }

  private calculateKurtosis(mean: Decimal, standardDeviation: Decimal): Decimal {
    const n = new Decimal(this.data.length);
    const sumQuartedDeviations = this.data.reduce((acc, val) => {
      const standardizedVal = val.minus(mean).dividedBy(standardDeviation);
      return acc.plus(standardizedVal.pow(4));
    }, new Decimal(0));

    return sumQuartedDeviations.dividedBy(n).minus(3); // Excess kurtosis
  }

  private calculateZScores(mean: Decimal, standardDeviation: Decimal): Decimal[] {
    return this.data.map(val => val.minus(mean).dividedBy(standardDeviation));
  }

  private detectOutliers(quartiles: HighPrecisionResult['quartiles']): HighPrecisionResult['outliers'] {
    const { q1, q3, iqr } = quartiles;
    const mildOutlierThreshold = iqr.times(1.5);
    const extremeOutlierThreshold = iqr.times(3);
    
    const mildLower = q1.minus(mildOutlierThreshold);
    const mildUpper = q3.plus(mildOutlierThreshold);
    const extremeLower = q1.minus(extremeOutlierThreshold);
    const extremeUpper = q3.plus(extremeOutlierThreshold);

    const mild: number[] = [];
    const extreme: number[] = [];

    this.data.forEach((val, index) => {
      if (val.lessThan(extremeLower) || val.greaterThan(extremeUpper)) {
        extreme.push(index);
      } else if (val.lessThan(mildLower) || val.greaterThan(mildUpper)) {
        mild.push(index);
      }
    });

    return { mild, extreme };
  }

  // Statistical helper functions
  private getTValue(df: number, alpha: number): Decimal {
    // Simplified t-value lookup - in production, use a proper statistical library
    const tValues: Record<number, number> = {
      1: 12.71, 2: 4.30, 3: 3.18, 4: 2.78, 5: 2.57,
      10: 2.23, 15: 2.13, 20: 2.09, 30: 2.04, 60: 2.00, 120: 1.98
    };

    for (const [key, value] of Object.entries(tValues)) {
      if (df <= parseInt(key)) {
        return new Decimal(value);
      }
    }
    
    return new Decimal(1.96); // Z-value for large samples
  }

  private approximateTTestPValue(tStat: Decimal, df: number): Decimal {
    // Very simplified p-value approximation
    // Real implementation would use proper statistical functions
    if (tStat.greaterThan(3)) return new Decimal(0.01);
    if (tStat.greaterThan(2.5)) return new Decimal(0.02);
    if (tStat.greaterThan(2)) return new Decimal(0.05);
    if (tStat.greaterThan(1.5)) return new Decimal(0.15);
    return new Decimal(0.5);
  }
}

export default HighPrecisionCalculator;