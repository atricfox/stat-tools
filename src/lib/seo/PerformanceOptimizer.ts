/**
 * PerformanceOptimizer
 * Core Web Vitals优化和性能监控系统
 * Features: LCP、CLS、FID优化，性能监控，优化建议
 */

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint
  fid: number; // First Input Delay  
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint
  ttfb: number; // Time to First Byte
}

export interface PerformanceMetrics extends CoreWebVitals {
  domContentLoaded: number;
  loadComplete: number;
  resourceLoadTime: number;
  renderTime: number;
  hydrationTime?: number;
}

export interface PerformanceOptimization {
  type: 'critical' | 'important' | 'minor';
  category: 'loading' | 'interactivity' | 'visual-stability' | 'custom';
  issue: string;
  recommendation: string;
  impact: 'high' | 'medium' | 'low';
  implementation: string;
  estimatedImprovement: string;
}

export interface PerformanceBudget {
  lcp: number;
  fid: number;
  cls: number;
  fcp: number;
  ttfb: number;
  bundleSize: number;
  imageSize: number;
}

// 性能预算配置
const PERFORMANCE_BUDGET: PerformanceBudget = {
  lcp: 2500, // 2.5s
  fid: 100,  // 100ms
  cls: 0.1,  // 0.1
  fcp: 1800, // 1.8s
  ttfb: 600, // 600ms
  bundleSize: 244000, // 244KB (gzipped)
  imageSize: 500000   // 500KB per image
};

// 性能评级阈值
const PERFORMANCE_THRESHOLDS = {
  good: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    fcp: 1800,
    ttfb: 600
  },
  needsImprovement: {
    lcp: 4000,
    fid: 300,
    cls: 0.25,
    fcp: 3000,
    ttfb: 1000
  }
};

export class PerformanceOptimizer {
  private static instance: PerformanceOptimizer;
  private observer: PerformanceObserver | null = null;
  private metrics: Partial<PerformanceMetrics> = {};

  private constructor() {
    this.initializePerformanceObserver();
  }

  public static getInstance(): PerformanceOptimizer {
    if (!PerformanceOptimizer.instance) {
      PerformanceOptimizer.instance = new PerformanceOptimizer();
    }
    return PerformanceOptimizer.instance;
  }

  /**
   * 初始化性能观察器
   */
  private initializePerformanceObserver(): void {
    if (typeof window === 'undefined') return;

    try {
      // 观察各种性能指标
      this.observer = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          this.processPerformanceEntry(entry);
        });
      });

      // 观察不同类型的性能指标
      this.observer.observe({ entryTypes: ['navigation', 'paint', 'layout-shift', 'first-input'] });
    } catch (error) {
      console.warn('Performance observer not supported:', error);
    }
  }

  /**
   * 处理性能条目
   */
  private processPerformanceEntry(entry: PerformanceEntry): void {
    switch (entry.entryType) {
      case 'navigation':
        const navEntry = entry as PerformanceNavigationTiming;
        this.metrics.domContentLoaded = navEntry.domContentLoadedEventEnd - navEntry.fetchStart;
        this.metrics.loadComplete = navEntry.loadEventEnd - navEntry.fetchStart;
        this.metrics.ttfb = navEntry.responseStart - navEntry.fetchStart;
        break;

      case 'paint':
        if (entry.name === 'first-contentful-paint') {
          this.metrics.fcp = entry.startTime;
        }
        break;

      case 'largest-contentful-paint':
        this.metrics.lcp = entry.startTime;
        break;

      case 'first-input':
        const fidEntry = entry as PerformanceEventTiming;
        this.metrics.fid = fidEntry.processingStart - fidEntry.startTime;
        break;

      case 'layout-shift':
        const clsEntry = entry as any; // LayoutShift interface may not be available
        if (!clsEntry.hadRecentInput) {
          this.metrics.cls = (this.metrics.cls || 0) + clsEntry.value;
        }
        break;
    }
  }

  /**
   * 获取当前性能指标
   */
  public getCurrentMetrics(): Partial<PerformanceMetrics> {
    // 合并观察器数据和手动测量数据
    const navigationTiming = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    const paintEntries = performance.getEntriesByType('paint');

    const currentMetrics: Partial<PerformanceMetrics> = {
      ...this.metrics
    };

    // 填充缺失的指标
    if (navigationTiming) {
      currentMetrics.ttfb = currentMetrics.ttfb || (navigationTiming.responseStart - navigationTiming.fetchStart);
      currentMetrics.domContentLoaded = currentMetrics.domContentLoaded || 
        (navigationTiming.domContentLoadedEventEnd - navigationTiming.fetchStart);
      currentMetrics.loadComplete = currentMetrics.loadComplete || 
        (navigationTiming.loadEventEnd - navigationTiming.fetchStart);
    }

    if (paintEntries.length > 0) {
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry && !currentMetrics.fcp) {
        currentMetrics.fcp = fcpEntry.startTime;
      }
    }

    return currentMetrics;
  }

  /**
   * 分析性能并生成优化建议
   */
  public analyzePerformance(metrics?: Partial<PerformanceMetrics>): {
    metrics: Partial<PerformanceMetrics>;
    score: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    optimizations: PerformanceOptimization[];
    coreWebVitalsStatus: Record<string, 'good' | 'needs-improvement' | 'poor'>;
  } {
    const currentMetrics = metrics || this.getCurrentMetrics();
    const optimizations: PerformanceOptimization[] = [];

    // 分析LCP
    if (currentMetrics.lcp) {
      if (currentMetrics.lcp > PERFORMANCE_THRESHOLDS.needsImprovement.lcp) {
        optimizations.push({
          type: 'critical',
          category: 'loading',
          issue: `LCP is ${Math.round(currentMetrics.lcp)}ms (target: ≤2500ms)`,
          recommendation: 'Optimize largest content element loading',
          impact: 'high',
          implementation: 'Implement image optimization, preload critical resources, optimize server response',
          estimatedImprovement: '30-50% LCP improvement'
        });
      }
    }

    // 分析FID
    if (currentMetrics.fid && currentMetrics.fid > PERFORMANCE_THRESHOLDS.good.fid) {
      optimizations.push({
        type: currentMetrics.fid > PERFORMANCE_THRESHOLDS.needsImprovement.fid ? 'critical' : 'important',
        category: 'interactivity',
        issue: `FID is ${Math.round(currentMetrics.fid)}ms (target: ≤100ms)`,
        recommendation: 'Reduce JavaScript execution time and main thread blocking',
        impact: 'high',
        implementation: 'Code splitting, defer non-critical JS, optimize event handlers',
        estimatedImprovement: '20-40% FID improvement'
      });
    }

    // 分析CLS
    if (currentMetrics.cls && currentMetrics.cls > PERFORMANCE_THRESHOLDS.good.cls) {
      optimizations.push({
        type: currentMetrics.cls > PERFORMANCE_THRESHOLDS.needsImprovement.cls ? 'critical' : 'important',
        category: 'visual-stability',
        issue: `CLS is ${currentMetrics.cls.toFixed(3)} (target: ≤0.1)`,
        recommendation: 'Prevent layout shifts by reserving space for dynamic content',
        impact: 'medium',
        implementation: 'Set explicit dimensions for images/videos, avoid dynamic content insertion',
        estimatedImprovement: '50-80% CLS improvement'
      });
    }

    // 分析TTFB
    if (currentMetrics.ttfb && currentMetrics.ttfb > PERFORMANCE_THRESHOLDS.good.ttfb) {
      optimizations.push({
        type: 'important',
        category: 'loading',
        issue: `TTFB is ${Math.round(currentMetrics.ttfb)}ms (target: ≤600ms)`,
        recommendation: 'Optimize server response time and CDN configuration',
        impact: 'medium',
        implementation: 'Use CDN, optimize database queries, implement caching',
        estimatedImprovement: '20-30% TTFB improvement'
      });
    }

    // 计算总分和评级
    const score = this.calculatePerformanceScore(currentMetrics);
    const rating = this.getPerformanceRating(score);
    const coreWebVitalsStatus = this.getCoreWebVitalsStatus(currentMetrics);

    return {
      metrics: currentMetrics,
      score,
      rating,
      optimizations,
      coreWebVitalsStatus
    };
  }

  /**
   * 计算性能分数 (0-100)
   */
  private calculatePerformanceScore(metrics: Partial<PerformanceMetrics>): number {
    let score = 0;
    let totalWeight = 0;

    const scoreComponents = [
      { metric: metrics.lcp, threshold: PERFORMANCE_THRESHOLDS.good.lcp, weight: 30 },
      { metric: metrics.fid, threshold: PERFORMANCE_THRESHOLDS.good.fid, weight: 30 },
      { metric: metrics.cls, threshold: PERFORMANCE_THRESHOLDS.good.cls, weight: 25 },
      { metric: metrics.fcp, threshold: PERFORMANCE_THRESHOLDS.good.fcp, weight: 15 }
    ];

    scoreComponents.forEach(({ metric, threshold, weight }) => {
      if (metric !== undefined) {
        const componentScore = Math.max(0, Math.min(100, 
          100 - ((metric / threshold) * 50)
        ));
        score += componentScore * weight;
        totalWeight += weight;
      }
    });

    return totalWeight > 0 ? Math.round(score / totalWeight) : 0;
  }

  /**
   * 获取性能评级
   */
  private getPerformanceRating(score: number): 'good' | 'needs-improvement' | 'poor' {
    if (score >= 80) return 'good';
    if (score >= 50) return 'needs-improvement';
    return 'poor';
  }

  /**
   * 获取Core Web Vitals状态
   */
  private getCoreWebVitalsStatus(metrics: Partial<PerformanceMetrics>): Record<string, 'good' | 'needs-improvement' | 'poor'> {
    const status: Record<string, 'good' | 'needs-improvement' | 'poor'> = {};

    if (metrics.lcp) {
      if (metrics.lcp <= PERFORMANCE_THRESHOLDS.good.lcp) status.lcp = 'good';
      else if (metrics.lcp <= PERFORMANCE_THRESHOLDS.needsImprovement.lcp) status.lcp = 'needs-improvement';
      else status.lcp = 'poor';
    }

    if (metrics.fid !== undefined) {
      if (metrics.fid <= PERFORMANCE_THRESHOLDS.good.fid) status.fid = 'good';
      else if (metrics.fid <= PERFORMANCE_THRESHOLDS.needsImprovement.fid) status.fid = 'needs-improvement';
      else status.fid = 'poor';
    }

    if (metrics.cls !== undefined) {
      if (metrics.cls <= PERFORMANCE_THRESHOLDS.good.cls) status.cls = 'good';
      else if (metrics.cls <= PERFORMANCE_THRESHOLDS.needsImprovement.cls) status.cls = 'needs-improvement';
      else status.cls = 'poor';
    }

    return status;
  }

  /**
   * 生成性能监控报告
   */
  public generatePerformanceReport(): {
    timestamp: string;
    url: string;
    userAgent: string;
    metrics: Partial<PerformanceMetrics>;
    analysis: {
      metrics: Partial<PerformanceMetrics>;
      score: number;
      rating: 'good' | 'needs-improvement' | 'poor';
      optimizations: PerformanceOptimization[];
      coreWebVitalsStatus: Record<string, 'good' | 'needs-improvement' | 'poor'>;
    };
  } {
    const metrics = this.getCurrentMetrics();
    const analysis = this.analyzePerformance(metrics);

    return {
      timestamp: new Date().toISOString(),
      url: typeof window !== 'undefined' ? window.location.href : '',
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      metrics,
      analysis
    };
  }

  /**
   * 检查是否超出性能预算
   */
  public checkPerformanceBudget(metrics?: Partial<PerformanceMetrics>): {
    withinBudget: boolean;
    violations: Array<{
      metric: string;
      current: number;
      budget: number;
      overBy: number;
    }>;
  } {
    const currentMetrics = metrics || this.getCurrentMetrics();
    const violations: Array<{metric: string; current: number; budget: number; overBy: number}> = [];

    Object.entries(PERFORMANCE_BUDGET).forEach(([key, budgetValue]) => {
      const currentValue = currentMetrics[key as keyof PerformanceMetrics];
      if (currentValue !== undefined && currentValue > budgetValue) {
        violations.push({
          metric: key,
          current: currentValue,
          budget: budgetValue,
          overBy: currentValue - budgetValue
        });
      }
    });

    return {
      withinBudget: violations.length === 0,
      violations
    };
  }

  /**
   * 启动实时监控
   */
  public startRealTimeMonitoring(callback: (metrics: Partial<PerformanceMetrics>) => void, interval = 5000): () => void {
    const intervalId = setInterval(() => {
      const metrics = this.getCurrentMetrics();
      callback(metrics);
    }, interval);

    return () => clearInterval(intervalId);
  }

  /**
   * 清理资源
   */
  public dispose(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    this.metrics = {};
  }
}

// React Hook for performance monitoring
export function usePerformanceMonitoring() {
  const optimizer = PerformanceOptimizer.getInstance();
  
  return {
    getCurrentMetrics: () => optimizer.getCurrentMetrics(),
    analyzePerformance: (metrics?: Partial<PerformanceMetrics>) => optimizer.analyzePerformance(metrics),
    generateReport: () => optimizer.generatePerformanceReport(),
    checkBudget: (metrics?: Partial<PerformanceMetrics>) => optimizer.checkPerformanceBudget(metrics),
    startMonitoring: (callback: (metrics: Partial<PerformanceMetrics>) => void, interval?: number) => 
      optimizer.startRealTimeMonitoring(callback, interval)
  };
}

export { PERFORMANCE_BUDGET, PERFORMANCE_THRESHOLDS };
export default PerformanceOptimizer;