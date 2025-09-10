/**
 * Optimized calculation service with caching and performance monitoring
 * Provides high-performance statistical calculations with intelligent caching
 */

import { PerformanceCache, calculationCache } from './performance-cache';
import { calculateMean, MeanCalculationResult } from './calculations';
import { HighPrecisionCalculator, HighPrecisionResult } from './high-precision-calculations';
import Decimal from 'decimal.js';

export interface CalculationOptions {
  precision?: number;
  useCache?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
  enableProfiling?: boolean;
  dataSignature?: string; // For cache validation
}

export interface OptimizedCalculationResult extends MeanCalculationResult {
  performance: {
    computationTime: number;
    cacheHit: boolean;
    dataSize: number;
    optimizationLevel: 'basic' | 'enhanced' | 'high-precision';
  };
  quality: {
    confidence: number;
    accuracy: string;
    recommendations: string[];
  };
}

export interface PerformanceMetrics {
  totalCalculations: number;
  averageComputationTime: number;
  cacheHitRate: number;
  memoryUsage: number;
  optimizationsSaved: number;
}

export class OptimizedCalculationService {
  private cache: PerformanceCache<any>;
  private metrics: PerformanceMetrics;
  private profiling: boolean = false;

  constructor(cache?: PerformanceCache) {
    this.cache = cache || calculationCache;
    this.metrics = {
      totalCalculations: 0,
      averageComputationTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      optimizationsSaved: 0
    };
  }

  /**
   * Optimized mean calculation with intelligent caching
   */
  async calculateMeanOptimized(
    data: number[], 
    options: CalculationOptions = {}
  ): Promise<OptimizedCalculationResult> {
    const startTime = performance.now();
    const dataSize = data.length;
    
    // Generate cache key based on data and options
    const cacheKey = options.cacheKey || this.generateCacheKey(data, options);
    
    // Validate input data
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid input data: Array must contain at least one number');
    }
    
    // Filter and validate numbers
    const cleanData = data.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
    if (cleanData.length === 0) {
      throw new Error('No valid numbers found in input data');
    }
    
    const useCache = options.useCache !== false;
    
    let result: MeanCalculationResult | undefined;
    let cacheHit = false;
    
    if (useCache) {
      // Try to get from cache
      const cached = this.cache.get(cacheKey);
      if (cached && this.validateCachedData(cached, options.dataSignature)) {
        result = cached.result;
        cacheHit = true;
        this.metrics.optimizationsSaved++;
      }
    }
    
    if (!cacheHit) {
      // Compute fresh result
      result = await this.performOptimizedCalculation(cleanData, options);
      
      // Cache the result if caching is enabled
      if (useCache) {
        this.cache.set(cacheKey, {
          result,
          signature: options.dataSignature || this.generateDataSignature(cleanData),
          timestamp: Date.now()
        }, {
          ttl: options.cacheTTL,
          computationTime: performance.now() - startTime
        });
      }
    }
    
    const endTime = performance.now();
    const computationTime = endTime - startTime;
    
    // Update metrics
    this.updateMetrics(computationTime, cacheHit);
    
    // Check if result was computed
    if (!result) {
      throw new Error('Failed to compute calculation result');
    }
    
    // Determine optimization level and quality
    const optimizationLevel = this.determineOptimizationLevel(cleanData.length, options.precision || 2);
    const quality = this.assessResultQuality(result, cleanData);
    
    return {
      ...result,
      performance: {
        computationTime,
        cacheHit,
        dataSize,
        optimizationLevel
      },
      quality
    };
  }

  /**
   * High-precision calculations with advanced caching
   */
  async calculateHighPrecisionOptimized(
    data: number[],
    options: CalculationOptions & { significantDigits?: number } = {}
  ): Promise<HighPrecisionResult & { performance: any; quality: any }> {
    const startTime = performance.now();
    const cacheKey = options.cacheKey || `hp_${this.generateCacheKey(data, options)}`;
    
    // Validate and clean data
    const cleanData = data.filter(n => typeof n === 'number' && !isNaN(n) && isFinite(n));
    if (cleanData.length === 0) {
      throw new Error('No valid numbers found for high-precision calculation');
    }
    
    const useCache = options.useCache !== false;
    let result: HighPrecisionResult | undefined;
    let cacheHit = false;
    
    if (useCache) {
      const cached = this.cache.get(cacheKey);
      if (cached && this.validateCachedData(cached, options.dataSignature)) {
        result = cached.result;
        cacheHit = true;
        this.metrics.optimizationsSaved++;
      }
    }
    
    if (!cacheHit) {
      // Use optimized high-precision calculator
      const calculator = new HighPrecisionCalculator(cleanData);
      
      // Configure precision
      if (options.significantDigits) {
        Decimal.set({ precision: options.significantDigits });
      }
      
      result = calculator.calculateAll();
      
      // Cache result
      if (useCache) {
        this.cache.set(cacheKey, {
          result,
          signature: options.dataSignature || this.generateDataSignature(cleanData),
          timestamp: Date.now()
        }, {
          ttl: options.cacheTTL || 20 * 60 * 1000, // 20 minutes for high-precision
          computationTime: performance.now() - startTime
        });
      }
    }
    
    const endTime = performance.now();
    const computationTime = endTime - startTime;
    
    this.updateMetrics(computationTime, cacheHit);
    
    // Check if result was computed
    if (!result) {
      throw new Error('Failed to compute high-precision calculation result');
    }
    
    return {
      ...result,
      performance: {
        computationTime,
        cacheHit,
        dataSize: cleanData.length,
        optimizationLevel: 'high-precision' as const
      },
      quality: this.assessHighPrecisionQuality(result, cleanData)
    };
  }

  /**
   * Batch calculation optimization
   */
  async calculateBatchOptimized(
    datasets: Array<{ id: string; name: string; data: number[] }>,
    options: CalculationOptions = {}
  ): Promise<Array<OptimizedCalculationResult & { id: string; name: string }>> {
    const results = await Promise.allSettled(
      datasets.map(async (dataset) => {
        const result = await this.calculateMeanOptimized(dataset.data, {
          ...options,
          cacheKey: `batch_${dataset.id}_${this.generateCacheKey(dataset.data, options)}`
        });
        
        return {
          id: dataset.id,
          name: dataset.name,
          ...result
        };
      })
    );
    
    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }

  /**
   * Warm up cache with common calculations
   */
  async warmupCache(commonDatasets: number[][]): Promise<void> {
    const warmupPromises = commonDatasets.map(async (data, index) => {
      const cacheKey = `warmup_${index}_${this.generateCacheKey(data, {})}`;
      
      await this.calculateMeanOptimized(data, {
        useCache: true,
        cacheKey,
        cacheTTL: 60 * 60 * 1000 // 1 hour for warmup cache
      });
    });
    
    await Promise.allSettled(warmupPromises);
  }

  /**
   * Get performance metrics
   */
  getMetrics(): PerformanceMetrics {
    const cacheStats = this.cache.getStats();
    
    return {
      ...this.metrics,
      cacheHitRate: cacheStats.hitRate,
      memoryUsage: cacheStats.memoryUsage
    };
  }

  /**
   * Clear cache and reset metrics
   */
  reset(): void {
    this.cache.clear();
    this.metrics = {
      totalCalculations: 0,
      averageComputationTime: 0,
      cacheHitRate: 0,
      memoryUsage: 0,
      optimizationsSaved: 0
    };
  }

  /**
   * Enable/disable profiling
   */
  setProfiling(enabled: boolean): void {
    this.profiling = enabled;
  }

  // Private methods

  private async performOptimizedCalculation(
    data: number[], 
    options: CalculationOptions
  ): Promise<MeanCalculationResult> {
    const precision = options.precision || 2;
    
    // Choose algorithm based on data size and precision requirements
    if (data.length > 10000 && precision <= 4) {
      // Use streaming calculation for large datasets with moderate precision
      return this.streamingMeanCalculation(data, precision);
    } else if (precision > 6) {
      // Use high-precision for high precision requirements
      const calculator = new HighPrecisionCalculator(data);
      const hpResult = calculator.calculateAll();
      
      // Convert to MeanCalculationResult format
      return {
        mean: parseFloat(hpResult.mean.toString()),
        count: hpResult.count,
        sum: parseFloat(hpResult.sum.toString()),
        min: parseFloat(hpResult.min.toString()),
        max: parseFloat(hpResult.max.toString()),
        range: parseFloat(hpResult.range.toString()),
        standardDeviation: parseFloat(hpResult.standardDeviation.toString()),
        variance: parseFloat(hpResult.variance.toString())
      };
    } else {
      // Use standard calculation
      return calculateMean(data);
    }
  }

  private streamingMeanCalculation(data: number[], precision: number): MeanCalculationResult {
    // Optimized streaming calculation for large datasets
    let sum = 0;
    let count = 0;
    let min = Infinity;
    let max = -Infinity;
    let m2 = 0; // For variance calculation
    
    // Single pass algorithm
    for (const value of data) {
      count++;
      const delta = value - sum / count;
      sum += value;
      min = Math.min(min, value);
      max = Math.max(max, value);
      
      // Online variance calculation (Welford's algorithm)
      const newMean = sum / count;
      const delta2 = value - newMean;
      m2 += delta * delta2;
    }
    
    const mean = sum / count;
    const variance = count > 1 ? m2 / (count - 1) : 0;
    const standardDeviation = Math.sqrt(variance);
    const range = max - min;
    
    return {
      mean: parseFloat(mean.toFixed(precision)),
      count,
      sum: parseFloat(sum.toFixed(precision)),
      min: parseFloat(min.toFixed(precision)),
      max: parseFloat(max.toFixed(precision)),
      range: parseFloat(range.toFixed(precision)),
      standardDeviation: parseFloat(standardDeviation.toFixed(precision)),
      variance: parseFloat(variance.toFixed(precision))
    };
  }

  private generateCacheKey(data: number[], options: CalculationOptions): string {
    // Create efficient cache key
    const dataHash = this.hashArray(data);
    const optionsHash = this.hashObject({
      precision: options.precision || 2,
      signature: options.dataSignature
    });
    
    return `calc_${dataHash}_${optionsHash}`;
  }

  private generateDataSignature(data: number[]): string {
    // Generate signature for cache validation
    if (data.length <= 10) {
      return data.join(',');
    }
    
    // For large datasets, use statistical signature
    const sorted = [...data].sort((a, b) => a - b);
    const signature = [
      data.length,
      sorted[0], // min
      sorted[sorted.length - 1], // max
      sorted[Math.floor(sorted.length / 2)], // median
      data.reduce((sum, n) => sum + n, 0) / data.length // mean
    ];
    
    return signature.join('|');
  }

  private validateCachedData(cached: any, signature?: string): boolean {
    if (!cached || !cached.result) return false;
    
    // Check if signatures match (if provided)
    if (signature && cached.signature !== signature) {
      return false;
    }
    
    return true;
  }

  private determineOptimizationLevel(
    dataSize: number, 
    precision: number
  ): 'basic' | 'enhanced' | 'high-precision' {
    if (precision > 6) return 'high-precision';
    if (dataSize > 1000 || precision > 3) return 'enhanced';
    return 'basic';
  }

  private assessResultQuality(
    result: MeanCalculationResult, 
    data: number[]
  ): { confidence: number; accuracy: string; recommendations: string[] } {
    const recommendations: string[] = [];
    let confidence = 100;
    let accuracy = 'high';
    
    // Sample size assessment
    if (data.length < 30) {
      confidence -= 20;
      accuracy = 'moderate';
      recommendations.push('Consider collecting more data for increased statistical power');
    }
    
    // Variability assessment
    const cv = (result.standardDeviation / Math.abs(result.mean)) * 100;
    if (cv > 50) {
      confidence -= 15;
      accuracy = 'moderate';
      recommendations.push('High variability detected - results may be less reliable');
    }
    
    // Outlier detection (basic)
    const q1 = data.sort((a, b) => a - b)[Math.floor(data.length * 0.25)];
    const q3 = data[Math.floor(data.length * 0.75)];
    const iqr = q3 - q1;
    const outlierThreshold = 1.5 * iqr;
    const outliers = data.filter(x => x < q1 - outlierThreshold || x > q3 + outlierThreshold);
    
    if (outliers.length > data.length * 0.05) {
      confidence -= 10;
      recommendations.push(`${outliers.length} potential outliers detected - consider investigating`);
    }
    
    return {
      confidence: Math.max(0, confidence),
      accuracy,
      recommendations
    };
  }

  private assessHighPrecisionQuality(
    result: HighPrecisionResult,
    data: number[]
  ): { confidence: number; accuracy: string; recommendations: string[] } {
    const recommendations: string[] = [];
    let confidence = 95; // Start higher for high-precision
    let accuracy = 'very-high';
    
    // High-precision specific assessments
    if (data.length < 10) {
      confidence -= 10;
      recommendations.push('Small sample size may limit precision benefits');
    }
    
    if (result.outliers && result.outliers.extreme.length > 0) {
      confidence -= 5;
      recommendations.push('Extreme outliers detected in high-precision analysis');
    }
    
    return { confidence, accuracy, recommendations };
  }

  private updateMetrics(computationTime: number, cacheHit: boolean): void {
    this.metrics.totalCalculations++;
    
    // Update average computation time
    const totalTime = this.metrics.averageComputationTime * (this.metrics.totalCalculations - 1) + computationTime;
    this.metrics.averageComputationTime = totalTime / this.metrics.totalCalculations;
  }

  private hashArray(arr: number[]): string {
    // Simple hash function for arrays
    let hash = 0;
    const str = arr.slice(0, 100).join(','); // Limit for performance
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString(36);
  }

  private hashObject(obj: any): string {
    return this.hashArray([JSON.stringify(obj).length, Object.keys(obj).length]);
  }
}

// Singleton instance
export const optimizedCalculationService = new OptimizedCalculationService();

export default OptimizedCalculationService;