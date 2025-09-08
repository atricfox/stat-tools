/**
 * Dynamic import utilities for code splitting and lazy loading
 * Implements smart component loading with loading states and error boundaries
 */

import { lazy, ComponentType } from 'react';

export interface LazyComponentOptions {
  fallback?: ComponentType;
  retries?: number;
  retryDelay?: number;
  prefetch?: boolean;
}

export interface LazyLoadResult<T> {
  Component: ComponentType<T>;
  prefetch: () => Promise<void>;
  preload: () => Promise<{ default: ComponentType<T> }>;
}

/**
 * Enhanced lazy loading with retry logic and prefetching
 */
export function lazyWithRetry<T extends {}>(
  importFn: () => Promise<{ default: ComponentType<T> }>,
  options: LazyComponentOptions = {}
): LazyLoadResult<T> {
  const {
    retries = 3,
    retryDelay = 1000,
    prefetch = false
  } = options;

  // Retry logic for failed imports
  const importWithRetry = async (attempt = 1): Promise<{ default: ComponentType<T> }> => {
    try {
      return await importFn();
    } catch (error) {
      if (attempt >= retries) {
        console.error('Failed to load component after retries:', error);
        throw error;
      }
      
      console.warn(`Component load failed (attempt ${attempt}/${retries}), retrying...`);
      await new Promise(resolve => setTimeout(resolve, retryDelay * attempt));
      return importWithRetry(attempt + 1);
    }
  };

  // Create lazy component
  const LazyComponent = lazy(() => importWithRetry());

  // Prefetch function
  const prefetchComponent = async (): Promise<void> => {
    try {
      await importWithRetry();
    } catch (error) {
      console.warn('Prefetch failed:', error);
    }
  };

  // Preload function (immediate load)
  const preloadComponent = (): Promise<{ default: ComponentType<T> }> => {
    return importWithRetry();
  };

  // Auto-prefetch if enabled
  if (prefetch && typeof window !== 'undefined') {
    // Prefetch on idle or after a delay
    if ('requestIdleCallback' in window) {
      requestIdleCallback(prefetchComponent);
    } else {
      setTimeout(prefetchComponent, 2000);
    }
  }

  return {
    Component: LazyComponent,
    prefetch: prefetchComponent,
    preload: preloadComponent
  };
}

/**
 * Route-level lazy loading for page components
 */
export const lazyPages = {
  // Calculator pages
  meanCalculator: lazyWithRetry(
    () => import('@/app/calculator/mean/page'),
    { prefetch: true, retries: 2 }
  ),
  
  // Component lazy loading
  highPrecisionResults: lazyWithRetry(
    () => import('@/components/calculator/ResearchResults'),
    { prefetch: false, retries: 2 }
  ),
  
  batchProcessing: lazyWithRetry(
    () => import('@/components/calculator/BatchProcessingManager'),
    { prefetch: false, retries: 2 }
  ),
  
  teacherFileUpload: lazyWithRetry(
    () => import('@/components/calculator/TeacherFileUpload'),
    { prefetch: false, retries: 2 }
  ),
  
  // dataVisualization: lazyWithRetry(
  //   () => import('@/components/visualization/StatisticalCharts'),
  //   { prefetch: false, retries: 2 }
  // )
};

/**
 * Context-aware component loading based on user scenarios
 */
export class ContextualLoader {
  private preloadedComponents = new Set<string>();
  private currentContext: 'student' | 'research' | 'teacher' = 'student';

  setContext(context: 'student' | 'research' | 'teacher') {
    this.currentContext = context;
    this.preloadContextualComponents();
  }

  private async preloadContextualComponents() {
    const contextComponents = {
      student: [
        'basicResults',
        'calculationSteps'
      ],
      research: [
        'highPrecisionResults',
        // 'dataVisualization',
        // 'statisticalTests'
      ],
      teacher: [
        'batchProcessing',
        'teacherFileUpload',
        // 'gradeAnalysis'
      ]
    };

    const componentsToLoad = contextComponents[this.currentContext] || [];
    
    for (const component of componentsToLoad) {
      if (!this.preloadedComponents.has(component)) {
        try {
          await this.preloadComponent(component);
          this.preloadedComponents.add(component);
        } catch (error) {
          console.warn(`Failed to preload ${component}:`, error);
        }
      }
    }
  }

  private async preloadComponent(componentName: string): Promise<void> {
    const componentMap = {
      basicResults: () => import('@/components/calculator/MobileResultsDisplay'),
      calculationSteps: () => import('@/components/calculator/CalculationSteps'),
      highPrecisionResults: () => import('@/components/calculator/ResearchResults'),
      // dataVisualization: () => import('@/components/visualization/StatisticalCharts'),
      // statisticalTests: () => import('@/components/calculator/StatisticalTests'),
      batchProcessing: () => import('@/components/calculator/BatchProcessingManager'),
      teacherFileUpload: () => import('@/components/calculator/TeacherFileUpload'),
      // gradeAnalysis: () => import('@/components/calculator/GradeAnalysis')
    };

    const importFn = componentMap[componentName as keyof typeof componentMap];
    if (importFn) {
      await importFn();
    }
  }

  /**
   * Intelligent prefetching based on user interaction patterns
   */
  async prefetchBasedOnInteraction(
    currentPage: string,
    userActions: string[],
    contextHistory: string[]
  ): Promise<void> {
    // Analyze patterns and prefetch likely next components
    const predictions = this.predictNextComponents(currentPage, userActions, contextHistory);
    
    for (const prediction of predictions) {
      if (!this.preloadedComponents.has(prediction.component)) {
        // Prefetch with priority-based delay
        setTimeout(() => {
          this.preloadComponent(prediction.component).then(() => {
            this.preloadedComponents.add(prediction.component);
          });
        }, prediction.delay);
      }
    }
  }

  private predictNextComponents(
    currentPage: string,
    userActions: string[],
    contextHistory: string[]
  ): Array<{ component: string; delay: number; confidence: number }> {
    const predictions: Array<{ component: string; delay: number; confidence: number }> = [];

    // Pattern-based predictions
    if (currentPage === 'mean-calculator') {
      if (userActions.includes('input-data') && !userActions.includes('calculate')) {
        predictions.push({
          component: 'basicResults',
          delay: 0,
          confidence: 0.9
        });
      }
      
      if (this.currentContext === 'research' && userActions.includes('calculate')) {
        predictions.push({
          component: 'highPrecisionResults',
          delay: 100,
          confidence: 0.8
        });
        predictions.push({
          component: 'dataVisualization',
          delay: 500,
          confidence: 0.6
        });
      }
      
      if (this.currentContext === 'teacher' && userActions.includes('file-upload')) {
        predictions.push({
          component: 'batchProcessing',
          delay: 200,
          confidence: 0.85
        });
      }
    }

    return predictions.filter(p => p.confidence > 0.5);
  }
}

/**
 * Performance monitoring for lazy loading
 */
export class LazyLoadingMetrics {
  private metrics = {
    componentsLoaded: 0,
    totalLoadTime: 0,
    failedLoads: 0,
    cacheHits: 0,
    prefetchSuccesses: 0
  };

  recordComponentLoad(componentName: string, loadTime: number, fromCache: boolean) {
    this.metrics.componentsLoaded++;
    this.metrics.totalLoadTime += loadTime;
    
    if (fromCache) {
      this.metrics.cacheHits++;
    }
    
    // Report metrics for monitoring
    if (typeof window !== 'undefined' && 'performance' in window) {
      performance.mark(`component-loaded-${componentName}`);
    }
  }

  recordLoadFailure(componentName: string, error: Error) {
    this.metrics.failedLoads++;
    console.error(`Component load failure: ${componentName}`, error);
  }

  recordPrefetchSuccess(componentName: string) {
    this.metrics.prefetchSuccesses++;
  }

  getMetrics() {
    return {
      ...this.metrics,
      averageLoadTime: this.metrics.componentsLoaded > 0 
        ? this.metrics.totalLoadTime / this.metrics.componentsLoaded 
        : 0,
      cacheHitRate: this.metrics.componentsLoaded > 0
        ? (this.metrics.cacheHits / this.metrics.componentsLoaded) * 100
        : 0,
      failureRate: this.metrics.componentsLoaded > 0
        ? (this.metrics.failedLoads / (this.metrics.componentsLoaded + this.metrics.failedLoads)) * 100
        : 0
    };
  }
}

// Singleton instances
export const contextualLoader = new ContextualLoader();
export const lazyLoadingMetrics = new LazyLoadingMetrics();

// Utility function for bundle size optimization
export function getChunkName(componentPath: string): string {
  return componentPath
    .replace(/^@\//, '')
    .replace(/\//, '-')
    .replace(/\.[^/.]+$/, '')
    .toLowerCase();
}

export default {
  lazyWithRetry,
  lazyPages,
  contextualLoader,
  lazyLoadingMetrics,
  getChunkName
};