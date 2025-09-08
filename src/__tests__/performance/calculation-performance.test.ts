/**
 * Performance tests for calculation systems
 * Measures performance characteristics and optimization effectiveness
 */

import { performance } from 'perf_hooks';
import { calculateMean } from '@/lib/calculations';
import { HighPrecisionCalculator } from '@/lib/high-precision-calculations';
import { 
  OptimizedCalculationService,
  optimizedCalculationService 
} from '@/lib/optimized-calculations';
import { 
  calculateMeanCached,
  calculateHighPrecisionCached,
  calculateBatchCached 
} from '@/lib/calculation-cache-integration';
import { calculationCache } from '@/lib/performance-cache';

describe('Calculation Performance Tests', () => {
  
  beforeEach(() => {
    // Clear cache before each test for consistent measurements
    calculationCache.clear();
    
    // Force garbage collection if available
    if (global.gc) {
      global.gc();
    }
  });

  describe('Basic Calculation Performance', () => {
    test('mean calculation scales linearly with data size', () => {
      const dataSizes = [100, 1000, 10000, 100000];
      const performanceResults = [];

      dataSizes.forEach(size => {
        const data = Array.from({ length: size }, (_, i) => Math.random() * 100);
        
        const startTime = performance.now();
        const result = calculateMean(data);
        const endTime = performance.now();
        
        const duration = endTime - startTime;
        performanceResults.push({ size, duration, throughput: size / duration });
        
        expect(result.mean).toBeDefined();
        expect(duration).toBeLessThan(1000); // Should complete within 1 second
      });

      // Verify performance scaling
      console.log('Basic Mean Calculation Performance:');
      performanceResults.forEach(({ size, duration, throughput }) => {
        console.log(`  ${size.toLocaleString()} items: ${duration.toFixed(2)}ms (${throughput.toFixed(0)} items/ms)`);
      });

      // Performance should scale sub-linearly due to optimizations
      const firstThroughput = performanceResults[0].throughput;
      const lastThroughput = performanceResults[performanceResults.length - 1].throughput;
      expect(lastThroughput).toBeGreaterThan(firstThroughput * 0.1); // At least 10% of initial throughput
    });

    test('high-precision calculation performance vs standard calculation', () => {
      const testSizes = [100, 1000, 10000];
      const comparisonResults = [];

      testSizes.forEach(size => {
        const data = Array.from({ length: size }, () => Math.random() * 1000);

        // Standard calculation
        const standardStart = performance.now();
        const standardResult = calculateMean(data);
        const standardEnd = performance.now();
        const standardDuration = standardEnd - standardStart;

        // High-precision calculation
        const hpStart = performance.now();
        const hpCalculator = new HighPrecisionCalculator(data);
        const hpResult = hpCalculator.calculateAll();
        const hpEnd = performance.now();
        const hpDuration = hpEnd - hpStart;

        const overhead = hpDuration / standardDuration;
        comparisonResults.push({
          size,
          standardDuration,
          hpDuration,
          overhead
        });

        // Results should be similar (within precision limits)
        expect(Math.abs(standardResult.mean - parseFloat(hpResult.mean.toString()))).toBeLessThan(0.001);
      });

      console.log('Standard vs High-Precision Performance:');
      comparisonResults.forEach(({ size, standardDuration, hpDuration, overhead }) => {
        console.log(`  ${size} items: Standard ${standardDuration.toFixed(2)}ms, HP ${hpDuration.toFixed(2)}ms (${overhead.toFixed(1)}x overhead)`);
      });

      // High-precision should not be excessively slower
      const averageOverhead = comparisonResults.reduce((sum, r) => sum + r.overhead, 0) / comparisonResults.length;
      expect(averageOverhead).toBeLessThan(10); // Less than 10x overhead
    });
  });

  describe('Optimized Calculation Service Performance', () => {
    test('algorithm selection optimization effectiveness', async () => {
      const service = new OptimizedCalculationService();
      const testCases = [
        { name: 'Small Dataset (Basic)', data: Array.from({ length: 50 }, () => Math.random() * 100) },
        { name: 'Medium Dataset (Enhanced)', data: Array.from({ length: 5000 }, () => Math.random() * 100) },
        { name: 'Large Dataset (Streaming)', data: Array.from({ length: 50000 }, () => Math.random() * 100) },
        { name: 'High Precision', data: Array.from({ length: 1000 }, () => Math.random() * 100), precision: 8 }
      ];

      const optimizationResults = [];

      for (const testCase of testCases) {
        const startTime = performance.now();
        
        const result = await service.calculateMeanOptimized(testCase.data, {
          precision: testCase.precision || 2,
          useCache: false, // Disable cache to measure raw performance
          enableProfiling: true
        });
        
        const endTime = performance.now();
        const totalDuration = endTime - startTime;

        optimizationResults.push({
          name: testCase.name,
          dataSize: testCase.data.length,
          optimizationLevel: result.performance.optimizationLevel,
          computationTime: result.performance.computationTime,
          totalDuration,
          throughput: testCase.data.length / totalDuration
        });

        expect(result.mean).toBeDefined();
        expect(result.performance.optimizationLevel).toBeDefined();
      }

      console.log('Optimized Calculation Service Performance:');
      optimizationResults.forEach(({ name, dataSize, optimizationLevel, computationTime, totalDuration, throughput }) => {
        console.log(`  ${name}: ${dataSize} items, ${optimizationLevel}, ${totalDuration.toFixed(2)}ms (${throughput.toFixed(0)} items/ms)`);
      });

      // Verify appropriate optimization levels were selected
      expect(optimizationResults[0].optimizationLevel).toBe('basic');
      expect(optimizationResults[2].optimizationLevel).toBeOneOf(['enhanced', 'high-precision']);
    });

    test('streaming calculation performance for large datasets', async () => {
      const service = new OptimizedCalculationService();
      const largeSizes = [10000, 50000, 100000];
      const streamingResults = [];

      for (const size of largeSizes) {
        const data = Array.from({ length: size }, (_, i) => i + Math.random());
        
        const startTime = performance.now();
        const startMemory = process.memoryUsage().heapUsed;
        
        const result = await service.calculateMeanOptimized(data, {
          precision: 4,
          useCache: false
        });
        
        const endTime = performance.now();
        const endMemory = process.memoryUsage().heapUsed;
        const memoryDelta = endMemory - startMemory;
        
        streamingResults.push({
          size,
          duration: endTime - startTime,
          memoryDelta,
          throughput: size / (endTime - startTime)
        });

        expect(result.mean).toBeDefined();
        // Memory usage should not scale linearly with data size for streaming
        expect(memoryDelta).toBeLessThan(size * 8 * 0.5); // Less than 50% of raw data size
      }

      console.log('Streaming Calculation Performance:');
      streamingResults.forEach(({ size, duration, memoryDelta, throughput }) => {
        console.log(`  ${size.toLocaleString()} items: ${duration.toFixed(2)}ms, ${(memoryDelta/1024/1024).toFixed(1)}MB (${throughput.toFixed(0)} items/ms)`);
      });

      // Verify streaming efficiency
      const memoryEfficiency = streamingResults.map(r => r.memoryDelta / r.size);
      const avgMemoryPerItem = memoryEfficiency.reduce((a, b) => a + b) / memoryEfficiency.length;
      expect(avgMemoryPerItem).toBeLessThan(64); // Less than 64 bytes per item on average
    });
  });

  describe('Cache Performance Impact', () => {
    test('cache hit performance vs cache miss', async () => {
      const testData = Array.from({ length: 1000 }, () => Math.random() * 100);
      const cacheKey = 'performance-test-cache';

      // First calculation (cache miss)
      const missStart = performance.now();
      const missResult = await calculateMeanCached(testData, {
        cacheKey,
        useCache: true,
        userContext: 'research'
      });
      const missEnd = performance.now();
      const missDuration = missEnd - missStart;

      expect(missResult.cacheInfo.cacheHit).toBe(false);

      // Second calculation (cache hit)
      const hitStart = performance.now();
      const hitResult = await calculateMeanCached(testData, {
        cacheKey,
        useCache: true,
        userContext: 'research'
      });
      const hitEnd = performance.now();
      const hitDuration = hitEnd - hitStart;

      expect(hitResult.cacheInfo.cacheHit).toBe(true);

      const speedup = missDuration / hitDuration;
      console.log(`Cache Performance: Miss ${missDuration.toFixed(2)}ms, Hit ${hitDuration.toFixed(2)}ms (${speedup.toFixed(1)}x speedup)`);

      // Cache hits should be significantly faster
      expect(speedup).toBeGreaterThan(2); // At least 2x faster
      expect(hitDuration).toBeLessThan(10); // Very fast cache hits
    });

    test('cache memory efficiency and limits', async () => {
      const cacheStartMemory = process.memoryUsage().heapUsed;
      const datasets = [];

      // Fill cache with many datasets
      for (let i = 0; i < 100; i++) {
        const data = Array.from({ length: 100 }, () => Math.random() * 100);
        datasets.push(data);
        
        await calculateMeanCached(data, {
          cacheKey: `memory-test-${i}`,
          useCache: true,
          userContext: 'student'
        });
      }

      const cacheEndMemory = process.memoryUsage().heapUsed;
      const cacheMemoryUsage = cacheEndMemory - cacheStartMemory;
      const cacheStats = calculationCache.getStats();

      console.log(`Cache Memory Usage: ${(cacheMemoryUsage/1024/1024).toFixed(1)}MB for ${cacheStats.entryCount} entries`);
      console.log(`Cache Stats: ${cacheStats.hits} hits, ${cacheStats.misses} misses, ${cacheStats.hitRate.toFixed(1)}% hit rate`);

      // Cache should not consume excessive memory
      expect(cacheMemoryUsage).toBeLessThan(50 * 1024 * 1024); // Less than 50MB
      expect(cacheStats.entryCount).toBeLessThanOrEqual(100); // Respect cache limits
    });

    test('batch processing cache efficiency', async () => {
      const batchSizes = [10, 50, 100];
      const batchResults = [];

      for (const batchSize of batchSizes) {
        const datasets = Array.from({ length: batchSize }, (_, i) => ({
          id: `batch-perf-${i}`,
          name: `Dataset ${i}`,
          data: Array.from({ length: 100 }, () => Math.random() * 100)
        }));

        // First batch (cache miss)
        const missStart = performance.now();
        const firstBatch = await calculateBatchCached(datasets, {
          userContext: 'teacher',
          useCache: true
        });
        const missEnd = performance.now();
        const missDuration = missEnd - missStart;

        // Second batch (cache hit)
        const hitStart = performance.now();
        const secondBatch = await calculateBatchCached(datasets, {
          userContext: 'teacher',
          useCache: true
        });
        const hitEnd = performance.now();
        const hitDuration = hitEnd - hitStart;

        const hitRate = secondBatch.filter(r => r.cacheInfo.cacheHit).length / secondBatch.length;
        const speedup = missDuration / hitDuration;

        batchResults.push({
          batchSize,
          missDuration,
          hitDuration,
          hitRate,
          speedup
        });
      }

      console.log('Batch Processing Cache Performance:');
      batchResults.forEach(({ batchSize, missDuration, hitDuration, hitRate, speedup }) => {
        console.log(`  ${batchSize} items: Miss ${missDuration.toFixed(2)}ms, Hit ${hitDuration.toFixed(2)}ms, ${(hitRate*100).toFixed(0)}% hit rate, ${speedup.toFixed(1)}x speedup`);
      });

      // Verify batch cache effectiveness
      batchResults.forEach(result => {
        expect(result.hitRate).toBeGreaterThan(0.8); // At least 80% cache hit rate
        expect(result.speedup).toBeGreaterThan(2); // At least 2x speedup
      });
    });
  });

  describe('Memory Usage and Leak Detection', () => {
    test('memory usage stays stable during repeated calculations', async () => {
      const initialMemory = process.memoryUsage().heapUsed;
      const memoryMeasurements = [];

      // Perform many calculations
      for (let i = 0; i < 50; i++) {
        const data = Array.from({ length: 1000 }, () => Math.random() * 100);
        
        await calculateMeanCached(data, {
          useCache: false, // Disable cache to test raw memory usage
          userContext: 'student'
        });

        // Measure memory every 10 iterations
        if (i % 10 === 0) {
          const currentMemory = process.memoryUsage().heapUsed;
          memoryMeasurements.push({
            iteration: i,
            memory: currentMemory,
            delta: currentMemory - initialMemory
          });
        }
      }

      console.log('Memory Usage During Repeated Calculations:');
      memoryMeasurements.forEach(({ iteration, memory, delta }) => {
        console.log(`  Iteration ${iteration}: ${(memory/1024/1024).toFixed(1)}MB (${(delta/1024/1024).toFixed(1)}MB delta)`);
      });

      // Memory growth should be minimal
      const finalDelta = memoryMeasurements[memoryMeasurements.length - 1].delta;
      expect(finalDelta).toBeLessThan(10 * 1024 * 1024); // Less than 10MB growth
    });

    test('cache cleanup prevents memory leaks', async () => {
      const memoryBefore = process.memoryUsage().heapUsed;

      // Fill cache with temporary data
      for (let i = 0; i < 200; i++) {
        const data = Array.from({ length: 500 }, () => Math.random() * 100);
        await calculateMeanCached(data, {
          cacheKey: `temp-${i}`,
          useCache: true,
          ttl: 100, // Very short TTL
          userContext: 'student'
        });
      }

      const memoryAfterFill = process.memoryUsage().heapUsed;
      
      // Wait for cache cleanup
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // Force cleanup
      calculationCache.cleanup();
      
      if (global.gc) {
        global.gc();
      }

      const memoryAfterCleanup = process.memoryUsage().heapUsed;
      const cleanupEffectiveness = (memoryAfterFill - memoryAfterCleanup) / (memoryAfterFill - memoryBefore);

      console.log(`Memory Cleanup: Before ${(memoryBefore/1024/1024).toFixed(1)}MB, After Fill ${(memoryAfterFill/1024/1024).toFixed(1)}MB, After Cleanup ${(memoryAfterCleanup/1024/1024).toFixed(1)}MB`);
      console.log(`Cleanup Effectiveness: ${(cleanupEffectiveness*100).toFixed(1)}%`);

      // Cleanup should free significant memory
      expect(cleanupEffectiveness).toBeGreaterThan(0.5); // At least 50% cleanup
    });
  });

  describe('Performance Regression Detection', () => {
    test('performance benchmarks stay within acceptable ranges', async () => {
      const benchmarks = {
        'basic-1000': { size: 1000, maxTime: 10, operation: 'basic' },
        'basic-10000': { size: 10000, maxTime: 50, operation: 'basic' },
        'hp-1000': { size: 1000, maxTime: 30, operation: 'high-precision' },
        'batch-50': { size: 50, maxTime: 200, operation: 'batch' }
      };

      const benchmarkResults = {};

      for (const [name, benchmark] of Object.entries(benchmarks)) {
        let duration;

        if (benchmark.operation === 'basic') {
          const data = Array.from({ length: benchmark.size }, () => Math.random() * 100);
          const start = performance.now();
          await calculateMeanCached(data, { useCache: false, userContext: 'student' });
          duration = performance.now() - start;
          
        } else if (benchmark.operation === 'high-precision') {
          const data = Array.from({ length: benchmark.size }, () => Math.random() * 100);
          const start = performance.now();
          await calculateHighPrecisionCached(data, { useCache: false, userContext: 'research' });
          duration = performance.now() - start;
          
        } else if (benchmark.operation === 'batch') {
          const datasets = Array.from({ length: benchmark.size }, (_, i) => ({
            id: `bench-${i}`,
            name: `Benchmark ${i}`,
            data: Array.from({ length: 100 }, () => Math.random() * 100)
          }));
          const start = performance.now();
          await calculateBatchCached(datasets, { useCache: false, userContext: 'teacher' });
          duration = performance.now() - start;
        }

        benchmarkResults[name] = {
          duration,
          maxTime: benchmark.maxTime,
          passed: duration <= benchmark.maxTime
        };
      }

      console.log('Performance Benchmarks:');
      Object.entries(benchmarkResults).forEach(([name, result]) => {
        const status = result.passed ? '✅' : '❌';
        console.log(`  ${status} ${name}: ${result.duration.toFixed(2)}ms (max: ${result.maxTime}ms)`);
      });

      // All benchmarks should pass
      Object.values(benchmarkResults).forEach(result => {
        expect(result.passed).toBe(true);
      });
    });
  });
});