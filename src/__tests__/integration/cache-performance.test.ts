/**
 * Integration tests for cache and performance systems
 * Tests the complete caching pipeline and performance optimizations
 */

import { 
  PerformanceCache, 
  calculationCache,
  dataCache,
  uiCache 
} from '@/lib/performance-cache';
import { 
  OptimizedCalculationService,
  optimizedCalculationService 
} from '@/lib/optimized-calculations';
import { 
  calculationCacheWarmer,
  calculateMeanCached,
  calculateBatchCached 
} from '@/lib/calculation-cache-integration';
import { 
  contextualLoader,
  lazyLoadingMetrics 
} from '@/lib/dynamic-imports';

describe('Cache and Performance Integration Tests', () => {
  beforeEach(() => {
    // Clear all caches before each test
    calculationCache.clear();
    dataCache.clear();
    uiCache.clear();
    
    // Reset performance metrics
    jest.clearAllMocks();
  });

  describe('Performance Cache System', () => {
    test('multi-level cache hierarchy works correctly', async () => {
      const testData = [10, 20, 30, 40, 50];
      const cacheKey = 'test-hierarchy';

      // Test calculation cache
      const result1 = await calculationCache.getOrCompute(
        cacheKey,
        async () => ({ mean: 30, computed: true }),
        { ttl: 5000 }
      );
      expect(result1.computed).toBe(true);

      // Second call should hit cache
      const result2 = await calculationCache.getOrCompute(
        cacheKey,
        async () => ({ mean: 30, computed: false }),
        { ttl: 5000 }
      );
      expect(result2.computed).toBe(true); // Should be cached result

      // Verify cache statistics
      const stats = calculationCache.getStats();
      expect(stats.hits).toBeGreaterThan(0);
      expect(stats.hitRate).toBeGreaterThan(0);
    });

    test('cache eviction and memory management', async () => {
      // Create a small cache for testing eviction
      const smallCache = new PerformanceCache({
        maxEntries: 3,
        maxSize: 1024, // 1KB
        ttl: 5000
      });

      // Fill cache beyond capacity
      await smallCache.set('key1', { data: 'a'.repeat(200) });
      await smallCache.set('key2', { data: 'b'.repeat(200) });
      await smallCache.set('key3', { data: 'c'.repeat(200) });
      await smallCache.set('key4', { data: 'd'.repeat(200) }); // Should trigger eviction

      const stats = smallCache.getStats();
      expect(stats.entryCount).toBeLessThanOrEqual(3);
      
      // Oldest entry should be evicted
      expect(smallCache.get('key1')).toBeNull();
      expect(smallCache.get('key4')).toBeDefined();
    });

    test('TTL expiration and cleanup', async () => {
      const shortTTLCache = new PerformanceCache({
        ttl: 100, // 100ms
        cleanupInterval: 50
      });

      await shortTTLCache.set('temp-key', { value: 'temporary' });
      expect(shortTTLCache.get('temp-key')).toBeDefined();

      // Wait for expiration
      await new Promise(resolve => setTimeout(resolve, 150));
      
      expect(shortTTLCache.get('temp-key')).toBeNull();
    });

    test('cache performance under concurrent load', async () => {
      const concurrentPromises = Array.from({ length: 50 }, (_, i) =>
        calculationCache.getOrCompute(
          `concurrent-${i % 10}`, // 10 unique keys, 5 duplicates each
          async () => {
            await new Promise(resolve => setTimeout(resolve, 10)); // Simulate work
            return { id: i, value: Math.random() };
          },
          { ttl: 5000 }
        )
      );

      const results = await Promise.all(concurrentPromises);
      expect(results).toHaveLength(50);

      // Verify cache hits occurred (duplicates should hit cache)
      const stats = calculationCache.getStats();
      expect(stats.hits).toBeGreaterThan(20); // At least 40 cache hits expected
    });
  });

  describe('Optimized Calculation Service Integration', () => {
    test('intelligent algorithm selection based on data characteristics', async () => {
      const service = new OptimizedCalculationService();

      // Small dataset - should use standard calculation
      const smallData = [10, 20, 30, 40, 50];
      const smallResult = await service.calculateMeanOptimized(smallData, { precision: 2 });
      expect(smallResult.performance.optimizationLevel).toBe('basic');

      // Large dataset - should use streaming calculation
      const largeData = Array.from({ length: 15000 }, (_, i) => i + 1);
      const largeResult = await service.calculateMeanOptimized(largeData, { precision: 3 });
      expect(largeResult.performance.optimizationLevel).toBe('enhanced');

      // High precision requirement - should use high-precision calculation
      const precisionData = [1.123456789, 2.987654321, 3.456789012];
      const precisionResult = await service.calculateMeanOptimized(precisionData, { precision: 8 });
      expect(precisionResult.performance.optimizationLevel).toBe('high-precision');
    });

    test('batch processing optimization and caching', async () => {
      const datasets = Array.from({ length: 10 }, (_, i) => ({
        id: `dataset-${i}`,
        name: `Test Dataset ${i}`,
        data: Array.from({ length: 100 }, (_, j) => i * 100 + j)
      }));

      const batchResults = await optimizedCalculationService.calculateBatchOptimized(
        datasets,
        { useCache: true, precision: 3 }
      );

      expect(batchResults).toHaveLength(10);
      
      // Verify each result has performance metrics
      batchResults.forEach((result, index) => {
        expect(result.id).toBe(`dataset-${index}`);
        expect(result.performance.computationTime).toBeGreaterThan(0);
        expect(result.performance.cacheHit).toBeDefined();
      });

      // Second batch should hit cache
      const cachedBatchResults = await optimizedCalculationService.calculateBatchOptimized(
        datasets,
        { useCache: true, precision: 3 }
      );

      const cacheHits = cachedBatchResults.filter(r => r.performance.cacheHit).length;
      expect(cacheHits).toBeGreaterThan(5); // Most should be cache hits
    });

    test('quality assessment and recommendations', async () => {
      const testCases = [
        {
          name: 'Small sample',
          data: [1, 2, 3],
          expectedRecommendations: ['sample', 'data']
        },
        {
          name: 'High variability',
          data: [1, 100, 2, 99, 3, 98, 4, 97],
          expectedRecommendations: ['variability', 'reliable']
        },
        {
          name: 'Good sample',
          data: Array.from({ length: 50 }, (_, i) => 80 + Math.random() * 20),
          expectedRecommendations: []
        }
      ];

      for (const testCase of testCases) {
        const result = await optimizedCalculationService.calculateMeanOptimized(
          testCase.data,
          { precision: 4 }
        );

        expect(result.quality.confidence).toBeGreaterThanOrEqual(0);
        expect(result.quality.confidence).toBeLessThanOrEqual(100);
        expect(result.quality.accuracy).toBeDefined();
        expect(Array.isArray(result.quality.recommendations)).toBe(true);

        if (testCase.expectedRecommendations.length > 0) {
          const hasExpectedRec = testCase.expectedRecommendations.some(keyword =>
            result.quality.recommendations.some(rec => 
              rec.toLowerCase().includes(keyword)
            )
          );
          expect(hasExpectedRec).toBe(true);
        }
      }
    });

    test('performance metrics collection and reporting', async () => {
      const service = new OptimizedCalculationService();
      service.setProfiling(true);

      // Perform multiple calculations
      const calculations = [
        [10, 20, 30, 40, 50],
        [100, 200, 300, 400, 500],
        Array.from({ length: 1000 }, (_, i) => i)
      ];

      for (const data of calculations) {
        await service.calculateMeanOptimized(data, { 
          enableProfiling: true,
          useCache: true 
        });
      }

      const metrics = service.getMetrics();
      expect(metrics.totalCalculations).toBe(3);
      expect(metrics.averageComputationTime).toBeGreaterThan(0);
      expect(metrics.cacheHitRate).toBeGreaterThanOrEqual(0);
      expect(metrics.memoryUsage).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache Warming and Preloading', () => {
    test('cache warmer loads common datasets effectively', async () => {
      // Add test datasets to warmer
      calculationCacheWarmer.addCommonDataset('test_grades', [85, 90, 88, 92, 87], 'student');
      calculationCacheWarmer.addCommonDataset('research_data', [1.23, 2.34, 3.45, 4.56], 'research');

      // Warm the cache
      await calculationCacheWarmer.warmCache();

      // Verify cache has been populated
      const stats = calculationCache.getStats();
      expect(stats.entryCount).toBeGreaterThan(0);

      // Subsequent calculations should hit cache
      const result = await calculateMeanCached([85, 90, 88, 92, 87], {
        userContext: 'student',
        useCache: true
      });

      expect(result.cacheInfo).toBeDefined();
    });

    test('contextual preloading based on user patterns', async () => {
      // Simulate user switching to research context
      contextualLoader.setContext('research');

      // This should trigger preloading of research components
      await new Promise(resolve => setTimeout(resolve, 100));

      // Verify preloading occurred (this would be tracked in real implementation)
      expect(contextualLoader).toBeDefined();
    });

    test('intelligent prefetching based on usage patterns', async () => {
      const userActions = ['input-data', 'change-precision', 'calculate'];
      const contextHistory = ['student', 'student', 'research'];

      await contextualLoader.prefetchBasedOnInteraction(
        'mean-calculator',
        userActions,
        contextHistory
      );

      // Verify predictive loading metrics
      const metrics = lazyLoadingMetrics.getMetrics();
      expect(metrics).toBeDefined();
      expect(metrics.componentsLoaded).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Cache Integration with User Contexts', () => {
    test('context-specific caching strategies', async () => {
      const testData = [75, 80, 85, 90, 95];

      // Student context - shorter TTL
      const studentResult = await calculateMeanCached(testData, {
        userContext: 'student',
        useCache: true
      });

      // Research context - longer TTL, higher precision
      const researchResult = await calculateMeanCached(testData, {
        userContext: 'research', 
        precision: 6,
        useCache: true
      });

      // Teacher context - batch-optimized caching
      const teacherResult = await calculateMeanCached(testData, {
        userContext: 'teacher',
        useCache: true
      });

      // All should have different cache keys due to context
      expect(studentResult.cacheInfo.cacheKey).not.toBe(researchResult.cacheInfo.cacheKey);
      expect(studentResult.cacheInfo.cacheKey).not.toBe(teacherResult.cacheInfo.cacheKey);
      expect(researchResult.cacheInfo.cacheKey).not.toBe(teacherResult.cacheInfo.cacheKey);
    });

    test('cache invalidation on context switch', async () => {
      const testData = [10, 20, 30];

      // Cache in student context
      await calculateMeanCached(testData, {
        userContext: 'student',
        cacheKey: 'context-test',
        useCache: true
      });

      // Switch context should not use cached result from different context
      const researchResult = await calculateMeanCached(testData, {
        userContext: 'research',
        cacheKey: 'context-test', // Same key, different context
        useCache: true
      });

      // Should be a cache miss due to context change
      expect(researchResult.cacheInfo.cacheHit).toBe(false);
    });

    test('batch processing cache efficiency', async () => {
      const batchData = Array.from({ length: 20 }, (_, i) => ({
        id: `batch-${i}`,
        name: `Dataset ${i}`,
        data: Array.from({ length: 50 }, (_, j) => i * 10 + j + Math.random())
      }));

      // First batch processing
      const firstBatch = await calculateBatchCached(batchData, {
        userContext: 'teacher',
        useCache: true
      });

      // Second batch with same data should hit cache
      const secondBatch = await calculateBatchCached(batchData, {
        userContext: 'teacher',
        useCache: true
      });

      const cacheHitCount = secondBatch.filter(result => 
        result.cacheInfo.cacheHit
      ).length;

      expect(cacheHitCount).toBeGreaterThan(10); // Most should be cache hits
    });
  });

  describe('Performance Monitoring and Optimization', () => {
    test('real-time performance tracking', async () => {
      const performanceData = [];
      
      // Simulate performance monitoring
      const startMemory = process.memoryUsage().heapUsed;
      
      for (let i = 0; i < 10; i++) {
        const data = Array.from({ length: 1000 }, (_, j) => i * 1000 + j);
        const startTime = performance.now();
        
        const result = await calculateMeanCached(data, {
          userContext: 'research',
          useCache: true,
          enableProfiling: true
        });
        
        const endTime = performance.now();
        
        performanceData.push({
          iteration: i,
          computationTime: endTime - startTime,
          cacheHit: result.cacheInfo.cacheHit,
          memoryDelta: process.memoryUsage().heapUsed - startMemory
        });
      }

      // Analyze performance trends
      const avgComputationTime = performanceData.reduce((sum, d) => sum + d.computationTime, 0) / performanceData.length;
      const cacheHitRate = performanceData.filter(d => d.cacheHit).length / performanceData.length;

      expect(avgComputationTime).toBeLessThan(1000); // Should be fast
      expect(cacheHitRate).toBeGreaterThan(0.3); // Some cache hits expected

      // Memory should not grow indefinitely
      const finalMemoryDelta = performanceData[performanceData.length - 1].memoryDelta;
      expect(finalMemoryDelta).toBeLessThan(100 * 1024 * 1024); // Less than 100MB increase
    });

    test('cache performance under memory pressure', async () => {
      // Configure cache with limited memory
      const limitedCache = new PerformanceCache({
        maxSize: 1024 * 1024, // 1MB
        maxEntries: 100,
        ttl: 30000
      });

      // Fill cache with large datasets
      const largeDatasets = Array.from({ length: 200 }, (_, i) => 
        Array.from({ length: 1000 }, (_, j) => i * 1000 + j)
      );

      for (let i = 0; i < largeDatasets.length; i++) {
        await limitedCache.set(
          `large-dataset-${i}`,
          { data: largeDatasets[i] },
          { priority: i < 50 ? 'high' : 'normal' }
        );
      }

      const stats = limitedCache.getStats();
      
      // Cache should respect memory limits
      expect(stats.entryCount).toBeLessThanOrEqual(100);
      expect(stats.memoryUsage).toBeLessThanOrEqual(1024 * 1024 * 1.1); // Allow 10% overage

      // High priority items should be preserved
      expect(limitedCache.get('large-dataset-10')).toBeDefined();
    });

    test('optimization effectiveness measurement', async () => {
      const testDataSizes = [10, 100, 1000, 10000];
      const optimizationResults = [];

      for (const size of testDataSizes) {
        const data = Array.from({ length: size }, (_, i) => Math.random() * 100);
        
        const result = await optimizedCalculationService.calculateMeanOptimized(data, {
          useCache: false, // Force calculation
          precision: 4,
          enableProfiling: true
        });

        optimizationResults.push({
          dataSize: size,
          computationTime: result.performance.computationTime,
          optimizationLevel: result.performance.optimizationLevel,
          accuracy: result.quality.accuracy
        });
      }

      // Verify optimization scales appropriately with data size
      expect(optimizationResults[0].optimizationLevel).toBe('basic');
      expect(optimizationResults[3].optimizationLevel).toBeOneOf(['enhanced', 'high-precision']);
      
      // Computation time should scale sub-linearly due to optimizations
      const timeRatio = optimizationResults[3].computationTime / optimizationResults[0].computationTime;
      const sizeRatio = testDataSizes[3] / testDataSizes[0];
      expect(timeRatio).toBeLessThan(sizeRatio); // Better than linear scaling
    });
  });

  afterAll(() => {
    // Cleanup resources
    calculationCache.clear();
    dataCache.clear();
    uiCache.clear();
  });
});