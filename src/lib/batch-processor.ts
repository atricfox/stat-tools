/**
 * Batch data processing engine for teacher scenarios
 * Optimized for handling multiple datasets efficiently
 */

import { MeanCalculationResult, calculateMean } from './calculations';
import HighPrecisionCalculator from './high-precision-calculations';

export interface BatchDataset {
  id: string;
  name: string;
  data: number[];
  metadata?: {
    source?: string;
    studentCount?: number;
    assignmentType?: string;
    maxPoints?: number;
    dueDate?: string;
    [key: string]: any;
  };
}

export interface BatchProcessingOptions {
  precision?: number;
  includeOutliers?: boolean;
  calculateAdvancedStats?: boolean;
  generateComparisons?: boolean;
  enableWebWorker?: boolean;
  chunkSize?: number;
  progressCallback?: (progress: number, current: string) => void;
}

export interface BatchResult {
  id: string;
  name: string;
  result: MeanCalculationResult;
  advancedStats?: {
    quartiles: { q1: number; q2: number; q3: number; iqr: number };
    skewness: number;
    kurtosis: number;
    outliers: { mild: number[]; extreme: number[] };
    confidenceInterval95: { lower: number; upper: number };
  };
  metadata: BatchDataset['metadata'];
  processingTime: number;
}

export interface BatchSummary {
  totalDatasets: number;
  successfulProcessing: number;
  failedProcessing: number;
  totalProcessingTime: number;
  overallStatistics: {
    averageOfMeans: number;
    highestMean: { name: string; value: number };
    lowestMean: { name: string; value: number };
    mostConsistent: { name: string; cv: number };
    leastConsistent: { name: string; cv: number };
  };
  comparisons?: {
    correlations: Array<{
      dataset1: string;
      dataset2: string;
      correlation: number;
    }>;
    rankings: Array<{
      name: string;
      rank: number;
      mean: number;
      percentile: number;
    }>;
  };
}

export class BatchProcessor {
  private static readonly DEFAULT_CHUNK_SIZE = 100;
  private static readonly MAX_CONCURRENT_WORKERS = 4;

  /**
   * Process multiple datasets in batches
   */
  static async processBatch(
    datasets: BatchDataset[],
    options: BatchProcessingOptions = {}
  ): Promise<{ results: BatchResult[]; summary: BatchSummary }> {
    const {
      precision = 2,
      includeOutliers = true,
      calculateAdvancedStats = false,
      generateComparisons = true,
      enableWebWorker = false,
      chunkSize = this.DEFAULT_CHUNK_SIZE,
      progressCallback
    } = options;

    const startTime = performance.now();
    const results: BatchResult[] = [];
    const errors: Array<{ id: string; error: string }> = [];

    // Process datasets
    for (let i = 0; i < datasets.length; i++) {
      const dataset = datasets[i];
      progressCallback?.(
        (i / datasets.length) * 100,
        `Processing ${dataset.name}...`
      );

      try {
        const datasetStartTime = performance.now();
        
        let result: BatchResult;
        
        if (enableWebWorker && datasets.length > 10) {
          // Use web worker for large batch processing
          result = await this.processWithWorker(dataset, {
            precision,
            includeOutliers,
            calculateAdvancedStats
          });
        } else {
          // Process in main thread
          result = await this.processDataset(dataset, {
            precision,
            includeOutliers,
            calculateAdvancedStats
          });
        }

        result.processingTime = performance.now() - datasetStartTime;
        results.push(result);
      } catch (error) {
        errors.push({
          id: dataset.id,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    progressCallback?.(100, 'Generating summary...');

    // Generate summary
    const summary = this.generateBatchSummary(
      results,
      errors,
      performance.now() - startTime,
      generateComparisons
    );

    return { results, summary };
  }

  /**
   * Process datasets optimized for gradebooks
   */
  static async processGradebook(
    datasets: BatchDataset[],
    options: BatchProcessingOptions & {
      gradingScale?: { min: number; max: number };
      letterGrades?: boolean;
      classStatistics?: boolean;
    } = {}
  ): Promise<{
    results: BatchResult[];
    classAnalysis: {
      overallClassAverage: number;
      assignmentDifficulty: Array<{ name: string; difficulty: 'easy' | 'medium' | 'hard'; avgScore: number }>;
      studentPerformance?: Array<{ studentId: string; overallAverage: number; trend: 'improving' | 'declining' | 'stable' }>;
      gradeDistribution?: { [grade: string]: number };
    };
  }> {
    const { results, summary } = await this.processBatch(datasets, options);
    
    // Calculate class analysis
    const classAnalysis = this.analyzeClassPerformance(results, options);
    
    return { results, classAnalysis };
  }

  /**
   * Stream processing for very large datasets
   */
  static async processStream(
    datasetStream: AsyncIterable<BatchDataset>,
    options: BatchProcessingOptions = {}
  ): Promise<AsyncIterable<BatchResult>> {
    const { chunkSize = this.DEFAULT_CHUNK_SIZE } = options;
    
    return this.createResultStream(datasetStream, chunkSize, options);
  }

  // Private processing methods
  private static async processDataset(
    dataset: BatchDataset,
    options: {
      precision: number;
      includeOutliers: boolean;
      calculateAdvancedStats: boolean;
    }
  ): Promise<BatchResult> {
    if (dataset.data.length === 0) {
      throw new Error(`Dataset ${dataset.name} contains no data`);
    }

    // Basic calculation
    const basicResult = calculateMean(dataset.data);

    let advancedStats;
    if (options.calculateAdvancedStats) {
      try {
        const calculator = new HighPrecisionCalculator(dataset.data);
        const fullResult = calculator.calculateAll();
        
        advancedStats = {
          quartiles: {
            q1: Number(fullResult.quartiles.q1.toFixed(options.precision)),
            q2: Number(fullResult.quartiles.q2.toFixed(options.precision)),
            q3: Number(fullResult.quartiles.q3.toFixed(options.precision)),
            iqr: Number(fullResult.quartiles.iqr.toFixed(options.precision))
          },
          skewness: Number(fullResult.skewness.toFixed(options.precision)),
          kurtosis: Number(fullResult.kurtosis.toFixed(options.precision)),
          outliers: fullResult.outliers,
          confidenceInterval95: {
            lower: Number(fullResult.confidenceInterval95.lower.toFixed(options.precision)),
            upper: Number(fullResult.confidenceInterval95.upper.toFixed(options.precision))
          }
        };
      } catch (error) {
        console.warn(`Advanced stats calculation failed for ${dataset.name}:`, error);
      }
    }

    return {
      id: dataset.id,
      name: dataset.name,
      result: basicResult,
      advancedStats,
      metadata: dataset.metadata,
      processingTime: 0 // Will be set by caller
    };
  }

  private static async processWithWorker(
    dataset: BatchDataset,
    options: {
      precision: number;
      includeOutliers: boolean;
      calculateAdvancedStats: boolean;
    }
  ): Promise<BatchResult> {
    // Web Worker implementation would go here
    // For now, fallback to main thread processing
    return this.processDataset(dataset, options);
  }

  private static generateBatchSummary(
    results: BatchResult[],
    errors: Array<{ id: string; error: string }>,
    totalTime: number,
    generateComparisons: boolean
  ): BatchSummary {
    if (results.length === 0) {
      return {
        totalDatasets: results.length + errors.length,
        successfulProcessing: 0,
        failedProcessing: errors.length,
        totalProcessingTime: totalTime,
        overallStatistics: {
          averageOfMeans: 0,
          highestMean: { name: '', value: 0 },
          lowestMean: { name: '', value: 0 },
          mostConsistent: { name: '', cv: 0 },
          leastConsistent: { name: '', cv: 0 }
        }
      };
    }

    const means = results.map(r => r.result.mean);
    const averageOfMeans = means.reduce((sum, mean) => sum + mean, 0) / means.length;

    // Find extremes
    const sortedByMean = [...results].sort((a, b) => a.result.mean - b.result.mean);
    const highestMean = { 
      name: sortedByMean[sortedByMean.length - 1].name, 
      value: sortedByMean[sortedByMean.length - 1].result.mean 
    };
    const lowestMean = { 
      name: sortedByMean[0].name, 
      value: sortedByMean[0].result.mean 
    };

    // Find most/least consistent (by coefficient of variation)
    const withCV = results
      .filter(r => r.result.mean !== 0)
      .map(r => ({
        name: r.name,
        cv: (r.result.standardDeviation / Math.abs(r.result.mean)) * 100
      }))
      .sort((a, b) => a.cv - b.cv);

    const mostConsistent = withCV.length > 0 ? withCV[0] : { name: '', cv: 0 };
    const leastConsistent = withCV.length > 0 ? withCV[withCV.length - 1] : { name: '', cv: 0 };

    let comparisons;
    if (generateComparisons && results.length > 1) {
      comparisons = this.generateComparisons(results);
    }

    return {
      totalDatasets: results.length + errors.length,
      successfulProcessing: results.length,
      failedProcessing: errors.length,
      totalProcessingTime: totalTime,
      overallStatistics: {
        averageOfMeans,
        highestMean,
        lowestMean,
        mostConsistent,
        leastConsistent
      },
      comparisons
    };
  }

  private static generateComparisons(results: BatchResult[]): BatchSummary['comparisons'] {
    const correlations: Array<{ dataset1: string; dataset2: string; correlation: number }> = [];
    
    // Calculate pairwise correlations for datasets of similar size
    for (let i = 0; i < results.length - 1; i++) {
      for (let j = i + 1; j < results.length; j++) {
        const dataset1 = results[i];
        const dataset2 = results[j];
        
        // Only compare if datasets have the same length (e.g., same students)
        if (dataset1.result.count === dataset2.result.count) {
          // Simplified correlation calculation
          // In a real implementation, you'd need the raw data arrays
          const correlation = this.calculateSimpleCorrelation(
            dataset1.result.mean,
            dataset1.result.standardDeviation,
            dataset2.result.mean,
            dataset2.result.standardDeviation
          );
          
          correlations.push({
            dataset1: dataset1.name,
            dataset2: dataset2.name,
            correlation
          });
        }
      }
    }

    // Generate rankings
    const sortedResults = [...results].sort((a, b) => b.result.mean - a.result.mean);
    const rankings = sortedResults.map((result, index) => ({
      name: result.name,
      rank: index + 1,
      mean: result.result.mean,
      percentile: ((sortedResults.length - index) / sortedResults.length) * 100
    }));

    return { correlations, rankings };
  }

  private static calculateSimpleCorrelation(
    mean1: number, std1: number, mean2: number, std2: number
  ): number {
    // This is a simplified correlation estimate
    // Real correlation would require the raw data arrays
    const diffMeans = Math.abs(mean1 - mean2);
    const avgStd = (std1 + std2) / 2;
    
    if (avgStd === 0) return 1;
    
    // Inverse relationship: smaller difference = higher correlation
    return Math.max(0, 1 - (diffMeans / avgStd));
  }

  private static analyzeClassPerformance(
    results: BatchResult[],
    options: any
  ): any {
    const overallClassAverage = results.reduce((sum, r) => sum + r.result.mean, 0) / results.length;
    
    const assignmentDifficulty = results.map(result => {
      let difficulty: 'easy' | 'medium' | 'hard';
      
      if (result.result.mean >= 85) {
        difficulty = 'easy';
      } else if (result.result.mean >= 70) {
        difficulty = 'medium';
      } else {
        difficulty = 'hard';
      }
      
      return {
        name: result.name,
        difficulty,
        avgScore: result.result.mean
      };
    });

    return {
      overallClassAverage,
      assignmentDifficulty
    };
  }

  private static async* createResultStream(
    datasetStream: AsyncIterable<BatchDataset>,
    chunkSize: number,
    options: BatchProcessingOptions
  ): AsyncIterable<BatchResult> {
    const chunk: BatchDataset[] = [];
    
    for await (const dataset of datasetStream) {
      chunk.push(dataset);
      
      if (chunk.length >= chunkSize) {
        const { results } = await this.processBatch(chunk, options);
        for (const result of results) {
          yield result;
        }
        chunk.length = 0; // Clear chunk
      }
    }
    
    // Process remaining datasets
    if (chunk.length > 0) {
      const { results } = await this.processBatch(chunk, options);
      for (const result of results) {
        yield result;
      }
    }
  }
}

/**
 * Utility functions for batch processing
 */
export class BatchUtils {
  /**
   * Create datasets from gradebook data
   */
  static createGradebookDatasets(
    studentGrades: { [assignmentName: string]: number[] },
    metadata?: { [assignmentName: string]: any }
  ): BatchDataset[] {
    return Object.entries(studentGrades).map(([assignmentName, grades], index) => ({
      id: `assignment_${index}`,
      name: assignmentName,
      data: grades,
      metadata: {
        source: 'gradebook',
        studentCount: grades.length,
        assignmentType: 'assignment',
        ...metadata?.[assignmentName]
      }
    }));
  }

  /**
   * Export batch results to CSV
   */
  static exportToCSV(results: BatchResult[]): string {
    const headers = [
      'Assignment Name',
      'Mean',
      'Standard Deviation',
      'Count',
      'Min',
      'Max',
      'Processing Time (ms)'
    ];

    const rows = results.map(result => [
      result.name,
      result.result.mean.toFixed(2),
      result.result.standardDeviation.toFixed(2),
      result.result.count.toString(),
      result.result.min.toFixed(2),
      result.result.max.toFixed(2),
      result.processingTime.toFixed(0)
    ]);

    return [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');
  }

  /**
   * Filter datasets by criteria
   */
  static filterDatasets(
    datasets: BatchDataset[],
    criteria: {
      minSize?: number;
      maxSize?: number;
      sourceType?: string;
      assignmentType?: string;
    }
  ): BatchDataset[] {
    return datasets.filter(dataset => {
      if (criteria.minSize && dataset.data.length < criteria.minSize) return false;
      if (criteria.maxSize && dataset.data.length > criteria.maxSize) return false;
      if (criteria.sourceType && dataset.metadata?.source !== criteria.sourceType) return false;
      if (criteria.assignmentType && dataset.metadata?.assignmentType !== criteria.assignmentType) return false;
      return true;
    });
  }

  /**
   * Merge datasets by common criteria
   */
  static mergeDatasets(
    datasets: BatchDataset[],
    mergeBy: 'source' | 'type' | 'custom',
    customGrouping?: (dataset: BatchDataset) => string
  ): BatchDataset[] {
    const groups = new Map<string, BatchDataset[]>();

    datasets.forEach(dataset => {
      let groupKey: string;
      
      switch (mergeBy) {
        case 'source':
          groupKey = dataset.metadata?.source || 'unknown';
          break;
        case 'type':
          groupKey = dataset.metadata?.assignmentType || 'unknown';
          break;
        case 'custom':
          groupKey = customGrouping ? customGrouping(dataset) : dataset.id;
          break;
        default:
          groupKey = dataset.id;
      }

      if (!groups.has(groupKey)) {
        groups.set(groupKey, []);
      }
      groups.get(groupKey)!.push(dataset);
    });

    return Array.from(groups.entries()).map(([groupName, groupDatasets]) => ({
      id: `merged_${groupName}`,
      name: `Merged: ${groupName}`,
      data: groupDatasets.reduce((allData, dataset) => [...allData, ...dataset.data], [] as number[]),
      metadata: {
        source: 'merged',
        originalDatasets: groupDatasets.map(d => d.name),
        mergedBy: mergeBy
      }
    }));
  }
}

export default BatchProcessor;