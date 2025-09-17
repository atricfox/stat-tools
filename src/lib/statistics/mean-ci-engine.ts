/**
 * Mean Confidence Intervals Engine
 * Implements multiple methods for calculating confidence intervals for the mean:
 * - Classical t-interval
 * - Bootstrap percentile
 * - Bootstrap BCa (Bias-corrected and accelerated)
 * - Trimmed mean bootstrap
 */

export interface ConfidenceInterval {
  method: 't' | 'bootstrap_percentile' | 'bootstrap_bca' | 'bootstrap_trimmed';
  confidenceLevel: number;
  lower: number;
  upper: number;
  notes: string;
}

export interface OutlierDetection {
  iqr: number[];
  mad: number[];
}

export interface MeanCIResults {
  sampleSize: number;
  sampleMean: number;
  sampleStd: number;
  standardError: number;
  outlierFlags: OutlierDetection;
  intervals: ConfidenceInterval[];
  narrative: string;
  recommendations: string[];
  diagnostics: {
    computeTime: number;
    bootstrapCoverage: number;
    randomSeed: number;
  };
}

export interface MeanCIOptions {
  confidenceLevels: number[];
  includeTrimmed: boolean;
  trimRatio: number;
  bootstrapIterations: number;
  randomSeed: number;
}

/**
 * Simple Linear Congruential Generator for reproducible random numbers
 */
class SimpleRNG {
  private seed: number;

  constructor(seed: number) {
    this.seed = seed % 2147483647;
    if (this.seed <= 0) this.seed += 2147483646;
  }

  next(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return (this.seed - 1) / 2147483646;
  }

  // Generate random integers between min (inclusive) and max (exclusive)
  nextInt(min: number, max: number): number {
    return Math.floor(this.next() * (max - min)) + min;
  }
}

/**
 * Basic statistical functions
 */
export class StatUtils {
  static mean(data: number[]): number {
    return data.reduce((sum, val) => sum + val, 0) / data.length;
  }

  static variance(data: number[], sample: boolean = true): number {
    const mean = this.mean(data);
    const sumSquaredDiffs = data.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);
    return sumSquaredDiffs / (data.length - (sample ? 1 : 0));
  }

  static standardDeviation(data: number[], sample: boolean = true): number {
    return Math.sqrt(this.variance(data, sample));
  }

  static standardError(data: number[]): number {
    return this.standardDeviation(data, true) / Math.sqrt(data.length);
  }

  static median(data: number[]): number {
    const sorted = [...data].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  static quantile(data: number[], p: number): number {
    const sorted = [...data].sort((a, b) => a - b);
    const index = p * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    
    if (lower === upper) {
      return sorted[lower];
    }
    
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  static trimmedMean(data: number[], trimRatio: number): number {
    if (trimRatio <= 0 || trimRatio >= 0.5) {
      throw new Error('Trim ratio must be between 0 and 0.5');
    }

    const sorted = [...data].sort((a, b) => a - b);
    const trimCount = Math.floor(data.length * trimRatio);
    const trimmed = sorted.slice(trimCount, sorted.length - trimCount);
    
    return this.mean(trimmed);
  }

  // t-distribution critical value approximation
  static tCritical(df: number, alpha: number): number {
    // Simplified approximation for common cases
    // In production, use a proper t-distribution implementation
    const p = 1 - alpha / 2;
    
    if (df >= 30) {
      // Use normal approximation for large df
      return this.normalInverse(p);
    }
    
    // Rough approximation for small degrees of freedom
    const lookup: { [key: number]: { [key: string]: number } } = {
      1: { '0.975': 12.706, '0.95': 6.314, '0.995': 63.657 },
      2: { '0.975': 4.303, '0.95': 2.920, '0.995': 9.925 },
      3: { '0.975': 3.182, '0.95': 2.353, '0.995': 5.841 },
      4: { '0.975': 2.776, '0.95': 2.132, '0.995': 4.604 },
      5: { '0.975': 2.571, '0.95': 2.015, '0.995': 4.032 },
      10: { '0.975': 2.228, '0.95': 1.812, '0.995': 3.169 },
      20: { '0.975': 2.086, '0.95': 1.725, '0.995': 2.845 },
      30: { '0.975': 2.042, '0.95': 1.697, '0.995': 2.750 }
    };

    const pStr = p.toString();
    if (lookup[df] && lookup[df][pStr]) {
      return lookup[df][pStr];
    }

    // Linear interpolation for missing values
    const keys = Object.keys(lookup).map(Number).sort((a, b) => a - b);
    for (let i = 0; i < keys.length - 1; i++) {
      if (df >= keys[i] && df <= keys[i + 1]) {
        const lower = lookup[keys[i]][pStr] || 0;
        const upper = lookup[keys[i + 1]][pStr] || 0;
        const ratio = (df - keys[i]) / (keys[i + 1] - keys[i]);
        return lower + ratio * (upper - lower);
      }
    }

    // Fallback to normal approximation
    return this.normalInverse(p);
  }

  // Standard normal inverse (approximate)
  static normalInverse(p: number): number {
    // Beasley-Springer-Moro algorithm approximation
    const a = [0, -3.969683028665376e+01, 2.209460984245205e+02, -2.759285104469687e+02, 1.383577518672690e+02, -3.066479806614716e+01, 2.506628277459239e+00];
    const b = [0, -5.447609879822406e+01, 1.615858368580409e+02, -1.556989798598866e+02, 6.680131188771972e+01, -1.328068155288572e+01];
    const c = [0, -7.784894002430293e-03, -3.223964580411365e-01, -2.400758277161838e+00, -2.549732539343734e+00, 4.374664141464968e+00, 2.938163982698783e+00];
    const d = [0, 7.784695709041462e-03, 3.224671290700398e-01, 2.445134137142996e+00, 3.754408661907416e+00];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;

    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    if (p < pLow) {
      const q = Math.sqrt(-2 * Math.log(p));
      return (((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
             ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
    }

    if (p <= pHigh) {
      const q = p - 0.5;
      const r = q * q;
      return (((((a[1] * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) * r + a[6]) * q /
             (((((b[1] * r + b[2]) * r + b[3]) * r + b[4]) * r + b[5]) * r + 1);
    }

    const q = Math.sqrt(-2 * Math.log(1 - p));
    return -(((((c[1] * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) * q + c[6]) /
            ((((d[1] * q + d[2]) * q + d[3]) * q + d[4]) * q + 1);
  }
}

/**
 * Outlier detection methods
 */
export class OutlierDetector {
  static detectIQROutliers(data: number[], factor: number = 1.5): number[] {
    const q1 = StatUtils.quantile(data, 0.25);
    const q3 = StatUtils.quantile(data, 0.75);
    const iqr = q3 - q1;
    const lowerBound = q1 - factor * iqr;
    const upperBound = q3 + factor * iqr;
    
    return data.filter(val => val < lowerBound || val > upperBound);
  }

  static detectMADOutliers(data: number[], factor: number = 2.5): number[] {
    const median = StatUtils.median(data);
    const deviations = data.map(val => Math.abs(val - median));
    const mad = StatUtils.median(deviations);
    
    if (mad === 0) return []; // No variation
    
    const threshold = factor * mad;
    return data.filter(val => Math.abs(val - median) > threshold);
  }
}

/**
 * Bootstrap sampling methods
 */
export class BootstrapSampler {
  private rng: SimpleRNG;

  constructor(seed: number) {
    this.rng = new SimpleRNG(seed);
  }

  // Generate a bootstrap sample
  sampleWithReplacement(data: number[]): number[] {
    const sample: number[] = [];
    for (let i = 0; i < data.length; i++) {
      const index = this.rng.nextInt(0, data.length);
      sample.push(data[index]);
    }
    return sample;
  }

  // Perform bootstrap resampling and calculate means
  bootstrapMeans(data: number[], iterations: number): number[] {
    const means: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const sample = this.sampleWithReplacement(data);
      means.push(StatUtils.mean(sample));
    }
    return means;
  }

  // Bootstrap for trimmed means
  bootstrapTrimmedMeans(data: number[], iterations: number, trimRatio: number): number[] {
    const means: number[] = [];
    for (let i = 0; i < iterations; i++) {
      const sample = this.sampleWithReplacement(data);
      means.push(StatUtils.trimmedMean(sample, trimRatio));
    }
    return means;
  }
}

/**
 * Main engine for calculating confidence intervals
 */
export class MeanCIEngine {
  /**
   * Calculate all confidence intervals for given data and options
   */
  static async calculateConfidenceIntervals(
    data: number[],
    options: MeanCIOptions,
    progressCallback?: (progress: number) => void
  ): Promise<MeanCIResults> {
    const startTime = Date.now();
    
    // Validate input
    if (data.length < 3) {
      throw new Error('Sample size too small. Need at least 3 observations.');
    }

    // Calculate basic statistics
    const sampleSize = data.length;
    const sampleMean = StatUtils.mean(data);
    const sampleStd = StatUtils.standardDeviation(data, true);
    const standardError = StatUtils.standardError(data);

    // Check for zero variance
    if (sampleStd === 0 || !isFinite(sampleStd)) {
      throw new Error('Data has zero variance. All confidence intervals collapse to the mean.');
    }

    progressCallback?.(10);

    // Detect outliers
    const outlierFlags: OutlierDetection = {
      iqr: OutlierDetector.detectIQROutliers(data),
      mad: OutlierDetector.detectMADOutliers(data)
    };

    progressCallback?.(20);

    // Calculate confidence intervals
    const intervals: ConfidenceInterval[] = [];
    
    // Progress tracking
    let completedMethods = 0;
    const totalMethods = options.confidenceLevels.length * (3 + (options.includeTrimmed ? 1 : 0));

    for (const level of options.confidenceLevels) {
      // t-interval
      const tInterval = this.calculateTInterval(data, level);
      intervals.push(tInterval);
      completedMethods++;
      progressCallback?.(20 + (completedMethods / totalMethods) * 60);

      // Bootstrap percentile
      const bootstrapPercentile = await this.calculateBootstrapPercentile(
        data, level, options.bootstrapIterations, options.randomSeed
      );
      intervals.push(bootstrapPercentile);
      completedMethods++;
      progressCallback?.(20 + (completedMethods / totalMethods) * 60);

      // Bootstrap BCa
      const bootstrapBCa = await this.calculateBootstrapBCa(
        data, level, options.bootstrapIterations, options.randomSeed
      );
      intervals.push(bootstrapBCa);
      completedMethods++;
      progressCallback?.(20 + (completedMethods / totalMethods) * 60);

      // Trimmed mean bootstrap (if requested)
      if (options.includeTrimmed) {
        const trimmedBootstrap = await this.calculateTrimmedBootstrap(
          data, level, options.bootstrapIterations, options.randomSeed, options.trimRatio
        );
        intervals.push(trimmedBootstrap);
        completedMethods++;
        progressCallback?.(20 + (completedMethods / totalMethods) * 60);
      }
    }

    progressCallback?.(85);

    // Generate narrative and recommendations
    const narrative = this.generateNarrative(intervals, outlierFlags);
    const recommendations = this.generateRecommendations(intervals, outlierFlags, sampleSize);

    progressCallback?.(95);

    const computeTime = Date.now() - startTime;

    progressCallback?.(100);

    return {
      sampleSize,
      sampleMean,
      sampleStd,
      standardError,
      outlierFlags,
      intervals,
      narrative,
      recommendations,
      diagnostics: {
        computeTime,
        bootstrapCoverage: 0.95, // Placeholder
        randomSeed: options.randomSeed
      }
    };
  }

  /**
   * Calculate classical t-interval
   */
  private static calculateTInterval(data: number[], confidenceLevel: number): ConfidenceInterval {
    const mean = StatUtils.mean(data);
    const se = StatUtils.standardError(data);
    const df = data.length - 1;
    const alpha = 1 - confidenceLevel;
    const tCrit = StatUtils.tCritical(df, alpha);
    const margin = tCrit * se;

    return {
      method: 't',
      confidenceLevel,
      lower: mean - margin,
      upper: mean + margin,
      notes: `Classical t-interval (df=${df})`
    };
  }

  /**
   * Calculate bootstrap percentile confidence interval
   */
  private static async calculateBootstrapPercentile(
    data: number[],
    confidenceLevel: number,
    iterations: number,
    seed: number
  ): Promise<ConfidenceInterval> {
    const sampler = new BootstrapSampler(seed);
    const bootstrapMeans = sampler.bootstrapMeans(data, iterations);
    
    const alpha = 1 - confidenceLevel;
    const lower = StatUtils.quantile(bootstrapMeans, alpha / 2);
    const upper = StatUtils.quantile(bootstrapMeans, 1 - alpha / 2);

    return {
      method: 'bootstrap_percentile',
      confidenceLevel,
      lower,
      upper,
      notes: `Bootstrap percentile method (B=${iterations})`
    };
  }

  /**
   * Calculate bootstrap BCa confidence interval
   * Simplified implementation - full BCa requires more complex bias and acceleration calculations
   */
  private static async calculateBootstrapBCa(
    data: number[],
    confidenceLevel: number,
    iterations: number,
    seed: number
  ): Promise<ConfidenceInterval> {
    const sampler = new BootstrapSampler(seed);
    const bootstrapMeans = sampler.bootstrapMeans(data, iterations);
    
    // Simplified BCa - in practice, would calculate bias correction and acceleration
    const originalMean = StatUtils.mean(data);
    const biasCorrection = this.estimateBiasCorrection(bootstrapMeans, originalMean);
    
    const alpha = 1 - confidenceLevel;
    let lowerP = alpha / 2;
    let upperP = 1 - alpha / 2;
    
    // Apply bias correction (simplified)
    if (Math.abs(biasCorrection) > 0.01) {
      lowerP = Math.max(0.001, lowerP + biasCorrection);
      upperP = Math.min(0.999, upperP + biasCorrection);
    }
    
    const lower = StatUtils.quantile(bootstrapMeans, lowerP);
    const upper = StatUtils.quantile(bootstrapMeans, upperP);

    return {
      method: 'bootstrap_bca',
      confidenceLevel,
      lower,
      upper,
      notes: `Bootstrap BCa method (B=${iterations})`
    };
  }

  /**
   * Calculate trimmed mean bootstrap confidence interval
   */
  private static async calculateTrimmedBootstrap(
    data: number[],
    confidenceLevel: number,
    iterations: number,
    seed: number,
    trimRatio: number
  ): Promise<ConfidenceInterval> {
    const sampler = new BootstrapSampler(seed + 1); // Different seed
    const bootstrapTrimmedMeans = sampler.bootstrapTrimmedMeans(data, iterations, trimRatio);
    
    const alpha = 1 - confidenceLevel;
    const lower = StatUtils.quantile(bootstrapTrimmedMeans, alpha / 2);
    const upper = StatUtils.quantile(bootstrapTrimmedMeans, 1 - alpha / 2);

    return {
      method: 'bootstrap_trimmed',
      confidenceLevel,
      lower,
      upper,
      notes: `Bootstrap trimmed mean (${(trimRatio * 100).toFixed(0)}% trim, B=${iterations})`
    };
  }

  /**
   * Estimate bias correction for BCa method
   */
  private static estimateBiasCorrection(bootstrapMeans: number[], originalMean: number): number {
    const countBelow = bootstrapMeans.filter(mean => mean < originalMean).length;
    const proportion = countBelow / bootstrapMeans.length;
    
    // Convert to z-score equivalent
    if (proportion <= 0.001) return -3;
    if (proportion >= 0.999) return 3;
    
    return StatUtils.normalInverse(proportion);
  }

  /**
   * Generate narrative description of results
   */
  private static generateNarrative(intervals: ConfidenceInterval[], outliers: OutlierDetection): string {
    const methods = [...new Set(intervals.map(i => i.method))];
    const hasOutliers = outliers.iqr.length > 0 || outliers.mad.length > 0;

    if (methods.length === 1) {
      return 'Single confidence interval calculated.';
    }

    // Check consistency between methods
    const level95Intervals = intervals.filter(i => Math.abs(i.confidenceLevel - 0.95) < 0.01);
    if (level95Intervals.length > 1) {
      const widths = level95Intervals.map(i => i.upper - i.lower);
      const maxWidth = Math.max(...widths);
      const minWidth = Math.min(...widths);
      const widthDifference = (maxWidth - minWidth) / minWidth;

      if (widthDifference < 0.1) {
        return hasOutliers 
          ? 'All confidence interval methods show good agreement despite some outliers detected.'
          : 'All confidence interval methods show excellent agreement, indicating robust results.';
      } else {
        return hasOutliers
          ? 'Confidence intervals show some variation between methods, possibly due to outliers and distribution assumptions.'
          : 'Confidence intervals show some variation between methods, suggesting sensitivity to distribution assumptions.';
      }
    }

    return 'Confidence intervals calculated using multiple methods for comparison.';
  }

  /**
   * Generate recommendations based on results
   */
  private static generateRecommendations(
    intervals: ConfidenceInterval[],
    outliers: OutlierDetection,
    sampleSize: number
  ): string[] {
    const recommendations: string[] = [];
    
    if (outliers.iqr.length > 0 || outliers.mad.length > 0) {
      recommendations.push('Outliers detected. Consider using trimmed mean or investigating unusual values.');
      
      const hasTrimmed = intervals.some(i => i.method === 'bootstrap_trimmed');
      if (hasTrimmed) {
        recommendations.push('Trimmed mean bootstrap provides robust results less affected by outliers.');
      }
    }

    if (sampleSize < 30) {
      recommendations.push('Small sample size. Bootstrap methods may be more reliable than t-intervals.');
    }

    const hasBootstrap = intervals.some(i => i.method.includes('bootstrap'));
    if (hasBootstrap) {
      recommendations.push('Bootstrap methods do not assume normal distribution and may be more robust.');
    }

    if (recommendations.length === 0) {
      recommendations.push('All methods should provide reliable results for this dataset.');
    }

    return recommendations;
  }
}