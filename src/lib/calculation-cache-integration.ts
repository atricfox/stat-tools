/**
 * Statistical calculation caching integration system
 * Integrates performance cache with existing calculation functions
 */

import { 
  calculationCache, 
  PerformanceCache 
} from './performance-cache';
import { 
  OptimizedCalculationService,
  optimizedCalculationService 
} from './optimized-calculations';
import { 
  calculateMean, 
  MeanCalculationResult 
} from './calculations';
import { 
  HighPrecisionCalculator, 
  HighPrecisionResult 
} from './high-precision-calculations';

export interface CachedCalculationOptions {
  useCache?: boolean;
  cacheKey?: string;
  ttl?: number;
  precision?: number;
  enableProfiling?: boolean;
  userContext?: 'student' | 'research' | 'teacher';
  priority?: 'low' | 'normal' | 'high';
}

export interface CachedCalculationResult extends MeanCalculationResult {
  cacheInfo: {
    cacheHit: boolean;
    computationTime: number;
    cacheKey: string;
    dataSignature: string;
  };
  qualityMetrics?: {
    confidence: number;
    reliability: string;
    suggestions: string[];
  };
}

/**
 * Cached wrapper for basic mean calculations
 */
export async function calculateMeanCached(
  data: number[],
  options: CachedCalculationOptions = {}
): Promise<CachedCalculationResult> {
  const startTime = performance.now();
  const {
    useCache = true,
    precision = 2,
    userContext = 'student',
    priority = 'normal',
    ttl
  } = options;

  // Generate cache key
  const cacheKey = options.cacheKey || generateCalculationCacheKey(data, {
    type: 'mean',
    precision,
    userContext
  });

  const dataSignature = generateDataSignature(data);

  if (useCache) {
    try {
      // Check cache first
      const cached = calculationCache.get(cacheKey);
      if (cached && validateCachedResult(cached, dataSignature)) {
        const endTime = performance.now();
        
        return {
          ...cached.result,
          cacheInfo: {
            cacheHit: true,
            computationTime: endTime - startTime,
            cacheKey,
            dataSignature
          }
        };
      }
    } catch (error) {
      console.warn('Cache retrieval failed:', error);
    }
  }

  // Cache miss - compute fresh result
  const result = calculateMean(data);
  const endTime = performance.now();
  const computationTime = endTime - startTime;

  // Enhance with quality metrics
  const qualityMetrics = assessCalculationQuality(result, data, userContext);

  const cachedResult: CachedCalculationResult = {
    ...result,
    cacheInfo: {
      cacheHit: false,
      computationTime,
      cacheKey,
      dataSignature
    },
    qualityMetrics
  };

  // Store in cache
  if (useCache) {
    try {
      calculationCache.set(cacheKey, {
        result: cachedResult,
        signature: dataSignature,
        timestamp: Date.now(),
        context: userContext
      }, {
        ttl: ttl || getContextualTTL(userContext),
        computationTime,
        priority
      });
    } catch (error) {
      console.warn('Cache storage failed:', error);
    }
  }

  return cachedResult;
}

/**
 * Cached high-precision calculations for research context
 */
export async function calculateHighPrecisionCached(
  data: number[],
  options: CachedCalculationOptions = {}
): Promise<HighPrecisionResult & { cacheInfo: any; qualityMetrics?: any }> {
  const startTime = performance.now();
  const {
    useCache = true,
    precision = 6,
    userContext = 'research',
    priority = 'high',
    ttl = 20 * 60 * 1000 // 20 minutes for high-precision
  } = options;

  const cacheKey = options.cacheKey || generateCalculationCacheKey(data, {
    type: 'high-precision',
    precision,
    userContext
  });

  const dataSignature = generateDataSignature(data);

  if (useCache) {
    try {
      const cached = calculationCache.get(cacheKey);
      if (cached && validateCachedResult(cached, dataSignature)) {
        const endTime = performance.now();
        
        return {
          ...cached.result,
          cacheInfo: {
            cacheHit: true,
            computationTime: endTime - startTime,
            cacheKey,
            dataSignature
          }
        };
      }
    } catch (error) {
      console.warn('High-precision cache retrieval failed:', error);
    }
  }

  // Compute high-precision result
  const calculator = new HighPrecisionCalculator(data);
  const result = calculator.calculateAll();
  const endTime = performance.now();
  const computationTime = endTime - startTime;

  const qualityMetrics = assessHighPrecisionQuality(result, data);

  const cachedResult = {
    ...result,
    cacheInfo: {
      cacheHit: false,
      computationTime,
      cacheKey,
      dataSignature
    },
    qualityMetrics
  };

  // Store in cache with high priority
  if (useCache) {
    try {
      calculationCache.set(cacheKey, {
        result: cachedResult,
        signature: dataSignature,
        timestamp: Date.now(),
        context: userContext,
        precision: 'high'
      }, {
        ttl,
        computationTime,
        priority: 'high'
      });
    } catch (error) {
      console.warn('High-precision cache storage failed:', error);
    }
  }

  return cachedResult;
}

/**
 * Batch calculation with intelligent caching
 */
export async function calculateBatchCached(
  datasets: Array<{ id: string; name: string; data: number[] }>,
  options: CachedCalculationOptions = {}
): Promise<Array<CachedCalculationResult & { id: string; name: string }>> {
  const {
    userContext = 'teacher',
    useCache = true,
    precision = 2
  } = options;

  // Process datasets in parallel with individual caching
  const results = await Promise.allSettled(
    datasets.map(async (dataset) => {
      const result = await calculateMeanCached(dataset.data, {
        ...options,
        cacheKey: `batch_${dataset.id}_${generateDataSignature(dataset.data)}`,
        userContext,
        useCache,
        precision
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
 * Smart cache warming for common calculations
 */
export class CalculationCacheWarmer {
  private commonDatasets: Array<{ type: string; data: number[]; context: string }> = [];

  addCommonDataset(type: string, data: number[], context: string = 'student') {
    this.commonDatasets.push({ type, data, context });
  }

  async warmCache(): Promise<void> {
    console.log(`Warming cache with ${this.commonDatasets.length} common datasets...`);
    
    const warmupPromises = this.commonDatasets.map(async ({ type, data, context }, index) => {
      try {
        const options = {
          userContext: context as 'student' | 'research' | 'teacher',
          cacheKey: `warmup_${type}_${index}`,
          useCache: true,
          ttl: 60 * 60 * 1000, // 1 hour for warmup cache
          priority: 'low' as const
        };

        if (context === 'research' && data.length > 10) {
          await calculateHighPrecisionCached(data, options);
        } else {
          await calculateMeanCached(data, options);
        }
      } catch (error) {
        console.warn(`Failed to warm cache for dataset ${index}:`, error);
      }
    });

    await Promise.allSettled(warmupPromises);
    console.log('Cache warming completed');
  }

  // Pre-populate with common educational datasets
  loadEducationalDatasets() {
    // Common grade ranges
    this.addCommonDataset('grades_high', [85, 92, 78, 96, 88, 91, 83, 89, 87, 94], 'student');
    this.addCommonDataset('grades_low', [65, 72, 58, 76, 68, 71, 63, 69, 67, 74], 'student');
    this.addCommonDataset('test_scores', [78, 82, 85, 79, 91, 76, 88, 93, 80, 86], 'teacher');
    
    // Research datasets
    this.addCommonDataset('measurements', [1.23, 1.25, 1.21, 1.27, 1.24, 1.22, 1.26, 1.23, 1.25, 1.24], 'research');
    this.addCommonDataset('experimental', [0.045, 0.048, 0.043, 0.049, 0.046, 0.044, 0.047, 0.045, 0.048, 0.046], 'research');
  }
}

// Helper functions

function generateCalculationCacheKey(
  data: number[], 
  metadata: { type: string; precision?: number; userContext?: string }
): string {
  const dataHash = hashArray(data.slice(0, 50)); // Limit for performance
  const metaHash = hashObject(metadata);
  return `calc_${metadata.type}_${dataHash}_${metaHash}`;
}

function generateDataSignature(data: number[]): string {
  if (data.length <= 10) {
    return data.join(',');
  }
  
  // For larger datasets, create statistical signature
  const sorted = [...data].sort((a, b) => a - b);
  return [
    data.length,
    sorted[0], // min
    sorted[sorted.length - 1], // max
    sorted[Math.floor(sorted.length / 2)], // median
    data.reduce((sum, n) => sum + n, 0) / data.length // mean
  ].join('|');
}

function validateCachedResult(cached: any, expectedSignature: string): boolean {
  if (!cached || !cached.result) return false;
  
  // Check if signatures match
  if (cached.signature && cached.signature !== expectedSignature) {
    return false;
  }
  
  // Check if cache is not too old (additional validation)
  const maxAge = 24 * 60 * 60 * 1000; // 24 hours
  if (cached.timestamp && (Date.now() - cached.timestamp) > maxAge) {
    return false;
  }
  
  return true;
}

function getContextualTTL(userContext: string): number {
  switch (userContext) {
    case 'student':
      return 10 * 60 * 1000; // 10 minutes
    case 'research':
      return 20 * 60 * 1000; // 20 minutes
    case 'teacher':
      return 30 * 60 * 1000; // 30 minutes
    default:
      return 15 * 60 * 1000; // 15 minutes default
  }
}

function assessCalculationQuality(
  result: MeanCalculationResult,
  data: number[],
  userContext: string
): { confidence: number; reliability: string; suggestions: string[] } {
  const suggestions: string[] = [];
  let confidence = 100;
  let reliability = 'high';

  // Sample size assessment
  if (data.length < 3) {
    confidence -= 40;
    reliability = 'low';
    suggestions.push('Very small sample size - results may be unreliable');
  } else if (data.length < 10) {
    confidence -= 20;
    reliability = 'moderate';
    suggestions.push('Small sample size - consider collecting more data');
  } else if (data.length < 30 && userContext === 'research') {
    confidence -= 10;
    suggestions.push('Consider larger sample for research purposes (n≥30)');
  }

  // Variability assessment
  if (result.standardDeviation > 0) {
    const cv = (result.standardDeviation / Math.abs(result.mean)) * 100;
    if (cv > 50) {
      confidence -= 15;
      reliability = 'moderate';
      suggestions.push('High variability detected - results may be less stable');
    } else if (cv > 100) {
      confidence -= 25;
      reliability = 'low';
      suggestions.push('Very high variability - consider investigating data quality');
    }
  }

  return {
    confidence: Math.max(0, confidence),
    reliability,
    suggestions
  };
}

function assessHighPrecisionQuality(
  result: HighPrecisionResult,
  data: number[]
): { confidence: number; reliability: string; suggestions: string[] } {
  const suggestions: string[] = [];
  let confidence = 95; // Start higher for high-precision
  let reliability = 'very-high';

  // High-precision specific assessments
  if (data.length < 5) {
    confidence -= 15;
    reliability = 'moderate';
    suggestions.push('Small sample limits high-precision benefits');
  }

  if (result.outliers?.extreme.length > 0) {
    confidence -= 10;
    suggestions.push('Extreme outliers may affect precision calculations');
  }

  if (data.length > 1000) {
    confidence += 5; // Large sample bonus
    suggestions.push('Large sample size provides excellent statistical power');
  }

  return {
    confidence: Math.max(0, confidence),
    reliability,
    suggestions
  };
}

function hashArray(arr: number[]): string {
  let hash = 0;
  const str = arr.slice(0, 100).join(','); // Limit for performance
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString(36);
}

function hashObject(obj: any): string {
  return hashArray([JSON.stringify(obj).length, Object.keys(obj).length]);
}

// Singleton instances
export const calculationCacheWarmer = new CalculationCacheWarmer();

// Initialize with common educational datasets
calculationCacheWarmer.loadEducationalDatasets();

// Auto-warm cache on startup (in production)
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
  setTimeout(() => {
    calculationCacheWarmer.warmCache().catch(console.warn);
  }, 5000); // 5 second delay
}

export default {
  calculateMeanCached,
  calculateHighPrecisionCached,
  calculateBatchCached,
  calculationCacheWarmer
};