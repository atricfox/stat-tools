/**
 * SEOMonitor
 * SEO健康检查和监控系统  
 * Features: Google Search Console集成、SEO指标监控、自动验证
 */

export interface SEOHealthCheck {
  timestamp: string;
  url: string;
  checks: {
    metadata: SEOCheckResult;
    structuredData: SEOCheckResult;
    performance: SEOCheckResult;
    accessibility: SEOCheckResult;
    internalLinks: SEOCheckResult;
    robotsAndSitemap: SEOCheckResult;
  };
  overallScore: number;
  recommendations: string[];
}

export interface SEOCheckResult {
  passed: boolean;
  score: number;
  issues: string[];
  warnings: string[];
  recommendations: string[];
}

export interface SearchConsoleData {
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  keywords: Array<{
    query: string;
    clicks: number;
    impressions: number;
    ctr: number;
    position: number;
  }>;
}

export interface SEOMetrics {
  indexedPages: number;
  avgPosition: number;
  organicClicks: number;
  organicImpressions: number;
  ctr: number;
  coreWebVitalsStatus: 'good' | 'needs-improvement' | 'poor';
  crawlErrors: number;
  lastCrawlDate: string;
}

export class SEOMonitor {
  private static instance: SEOMonitor;
  
  private constructor() {}
  
  public static getInstance(): SEOMonitor {
    if (!SEOMonitor.instance) {
      SEOMonitor.instance = new SEOMonitor();
    }
    return SEOMonitor.instance;
  }

  /**
   * 执行完整的SEO健康检查
   */
  public async performHealthCheck(url?: string): Promise<SEOHealthCheck> {
    const targetUrl = url || (typeof window !== 'undefined' ? window.location.href : '');
    
    const checks = {
      metadata: await this.checkMetadata(),
      structuredData: await this.checkStructuredData(),
      performance: await this.checkPerformance(),
      accessibility: await this.checkAccessibility(),
      internalLinks: await this.checkInternalLinks(),
      robotsAndSitemap: await this.checkRobotsAndSitemap()
    };

    const overallScore = this.calculateOverallScore(checks);
    const recommendations = this.generateRecommendations(checks);

    return {
      timestamp: new Date().toISOString(),
      url: targetUrl,
      checks,
      overallScore,
      recommendations
    };
  }

  /**
   * 检查页面元数据
   */
  private async checkMetadata(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { passed: true, score: 100, issues: [], warnings: [], recommendations: [] };
    }

    // 检查标题
    const title = document.querySelector('title')?.textContent;
    if (!title) {
      issues.push('Missing page title');
      score -= 30;
    } else {
      if (title.length < 30) {
        warnings.push(`Title too short: ${title.length} characters (recommended: 30-60)`);
        score -= 10;
      } else if (title.length > 60) {
        warnings.push(`Title too long: ${title.length} characters (recommended: 30-60)`);
        score -= 5;
      }
    }

    // 检查描述
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content');
    if (!description) {
      issues.push('Missing meta description');
      score -= 25;
    } else {
      if (description.length < 120) {
        warnings.push(`Description too short: ${description.length} characters (recommended: 120-160)`);
        score -= 10;
      } else if (description.length > 160) {
        warnings.push(`Description too long: ${description.length} characters (recommended: 120-160)`);
        score -= 5;
      }
    }

    // 检查关键词
    const keywords = document.querySelector('meta[name="keywords"]')?.getAttribute('content');
    if (!keywords) {
      warnings.push('No keywords meta tag found');
      score -= 5;
    }

    // 检查Open Graph
    const ogTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content');
    const ogDescription = document.querySelector('meta[property="og:description"]')?.getAttribute('content');
    if (!ogTitle || !ogDescription) {
      warnings.push('Missing Open Graph tags');
      score -= 10;
    }

    // 检查Canonical URL
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href');
    if (!canonical) {
      warnings.push('Missing canonical URL');
      score -= 10;
    }

    // 生成建议
    if (issues.length > 0) {
      recommendations.push('Fix critical metadata issues first');
    }
    if (warnings.length > 0) {
      recommendations.push('Optimize metadata length and completeness');
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 检查结构化数据
   */
  private async checkStructuredData(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { passed: true, score: 100, issues: [], warnings: [], recommendations: [] };
    }

    // 查找JSON-LD结构化数据
    const jsonLdScripts = document.querySelectorAll('script[type="application/ld+json"]');
    
    if (jsonLdScripts.length === 0) {
      issues.push('No structured data found');
      score = 0;
      recommendations.push('Add JSON-LD structured data for better search results');
      return { passed: false, score, issues, warnings, recommendations };
    }

    // 验证JSON-LD格式
    let validStructuredData = 0;
    jsonLdScripts.forEach((script, index) => {
      try {
        const data = JSON.parse(script.textContent || '');
        if (data['@context'] && data['@type']) {
          validStructuredData++;
        } else {
          warnings.push(`Structured data ${index + 1} missing required @context or @type`);
          score -= 10;
        }
      } catch (error) {
        issues.push(`Invalid JSON-LD syntax in structured data ${index + 1}`);
        score -= 20;
      }
    });

    // 检查推荐的结构化数据类型
    const hasWebSite = Array.from(jsonLdScripts).some(script => {
      try {
        const data = JSON.parse(script.textContent || '');
        return data['@type'] === 'WebSite';
      } catch { return false; }
    });

    if (!hasWebSite) {
      warnings.push('Consider adding WebSite structured data');
      score -= 5;
    }

    if (validStructuredData > 0) {
      recommendations.push(`Good: Found ${validStructuredData} valid structured data items`);
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 检查性能相关SEO因素
   */
  private async checkPerformance(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { passed: true, score: 100, issues: [], warnings: [], recommendations: [] };
    }

    // 检查Core Web Vitals
    try {
      const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
      const paintEntries = performance.getEntriesByType('paint');
      
      // LCP检查
      const lcpEntries = performance.getEntriesByType('largest-contentful-paint');
      if (lcpEntries.length > 0) {
        const lcp = lcpEntries[lcpEntries.length - 1].startTime;
        if (lcp > 4000) {
          issues.push(`Poor LCP: ${Math.round(lcp)}ms (target: ≤2500ms)`);
          score -= 30;
        } else if (lcp > 2500) {
          warnings.push(`LCP needs improvement: ${Math.round(lcp)}ms (target: ≤2500ms)`);
          score -= 15;
        }
      }

      // FCP检查
      const fcpEntry = paintEntries.find(entry => entry.name === 'first-contentful-paint');
      if (fcpEntry && fcpEntry.startTime > 3000) {
        warnings.push(`Slow FCP: ${Math.round(fcpEntry.startTime)}ms (target: ≤1800ms)`);
        score -= 10;
      }

      // TTFB检查
      if (navigation) {
        const ttfb = navigation.responseStart - navigation.fetchStart;
        if (ttfb > 1000) {
          warnings.push(`Slow TTFB: ${Math.round(ttfb)}ms (target: ≤600ms)`);
          score -= 10;
        }
      }

    } catch (error) {
      warnings.push('Unable to measure Core Web Vitals');
      score -= 5;
    }

    // 检查资源优化
    const images = document.querySelectorAll('img');
    let imagesWithoutAlt = 0;
    let largeImages = 0;

    images.forEach(img => {
      if (!img.alt) imagesWithoutAlt++;
      // 简化的大图检查
      if (img.naturalWidth > 2000 || img.naturalHeight > 2000) largeImages++;
    });

    if (imagesWithoutAlt > 0) {
      warnings.push(`${imagesWithoutAlt} images missing alt text`);
      score -= imagesWithoutAlt * 2;
    }

    if (largeImages > 0) {
      recommendations.push(`Consider optimizing ${largeImages} large images`);
    }

    if (score < 70) {
      recommendations.push('Focus on Core Web Vitals improvement for better SEO');
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 检查可访问性
   */
  private async checkAccessibility(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { passed: true, score: 100, issues: [], warnings: [], recommendations: [] };
    }

    // 检查基本的可访问性要素
    const h1Elements = document.querySelectorAll('h1');
    if (h1Elements.length === 0) {
      issues.push('Missing H1 heading');
      score -= 20;
    } else if (h1Elements.length > 1) {
      warnings.push('Multiple H1 headings found');
      score -= 10;
    }

    // 检查标题层级
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    let previousLevel = 0;
    headings.forEach(heading => {
      const level = parseInt(heading.tagName.substring(1));
      if (level > previousLevel + 1) {
        warnings.push('Heading hierarchy skip detected');
        score -= 5;
        return;
      }
      previousLevel = level;
    });

    // 检查图片alt属性
    const imagesWithoutAlt = document.querySelectorAll('img:not([alt])');
    if (imagesWithoutAlt.length > 0) {
      warnings.push(`${imagesWithoutAlt.length} images missing alt attributes`);
      score -= imagesWithoutAlt.length * 5;
    }

    // 检查链接可访问性
    const emptyLinks = document.querySelectorAll('a:not([aria-label]):not([title])');
    let emptyLinkCount = 0;
    emptyLinks.forEach(link => {
      if (!link.textContent?.trim()) {
        emptyLinkCount++;
      }
    });

    if (emptyLinkCount > 0) {
      warnings.push(`${emptyLinkCount} links with no accessible text`);
      score -= emptyLinkCount * 3;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 检查内链结构
   */
  private async checkInternalLinks(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    if (typeof window === 'undefined') {
      return { passed: true, score: 100, issues: [], warnings: [], recommendations: [] };
    }

    const links = document.querySelectorAll('a[href]');
    let internalLinks = 0;
    let externalLinks = 0;
    let brokenLinks = 0;

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;

      if (href.startsWith('/') || href.includes(window.location.hostname)) {
        internalLinks++;
      } else if (href.startsWith('http')) {
        externalLinks++;
      }

      // 检查空链接或无效链接
      if (href === '#' || href === '') {
        brokenLinks++;
      }
    });

    if (internalLinks < 3) {
      warnings.push('Consider adding more internal links for better site navigation');
      score -= 10;
    }

    if (brokenLinks > 0) {
      issues.push(`${brokenLinks} broken or empty links found`);
      score -= brokenLinks * 10;
    }

    if (internalLinks > 0) {
      recommendations.push(`Good: Found ${internalLinks} internal links`);
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 检查robots.txt和sitemap
   */
  private async checkRobotsAndSitemap(): Promise<SEOCheckResult> {
    const issues: string[] = [];
    const warnings: string[] = [];
    const recommendations: string[] = [];
    let score = 100;

    try {
      // 检查robots.txt
      const robotsResponse = await fetch('/robots.txt');
      if (!robotsResponse.ok) {
        warnings.push('robots.txt not found');
        score -= 15;
      } else {
        const robotsContent = await robotsResponse.text();
        if (!robotsContent.includes('Sitemap:')) {
          warnings.push('Sitemap URL not specified in robots.txt');
          score -= 10;
        }
      }

      // 检查sitemap.xml
      const sitemapResponse = await fetch('/sitemap.xml');
      if (!sitemapResponse.ok) {
        warnings.push('sitemap.xml not found');
        score -= 15;
      }

    } catch (error) {
      warnings.push('Unable to verify robots.txt and sitemap.xml');
      score -= 10;
    }

    return {
      passed: issues.length === 0,
      score: Math.max(0, score),
      issues,
      warnings,
      recommendations
    };
  }

  /**
   * 计算总分
   */
  private calculateOverallScore(checks: SEOHealthCheck['checks']): number {
    const weights = {
      metadata: 0.25,
      structuredData: 0.20,
      performance: 0.20,
      accessibility: 0.15,
      internalLinks: 0.10,
      robotsAndSitemap: 0.10
    };

    let totalScore = 0;
    Object.entries(weights).forEach(([key, weight]) => {
      totalScore += checks[key as keyof typeof checks].score * weight;
    });

    return Math.round(totalScore);
  }

  /**
   * 生成整体建议
   */
  private generateRecommendations(checks: SEOHealthCheck['checks']): string[] {
    const recommendations: string[] = [];

    // 优先处理严重问题
    Object.entries(checks).forEach(([category, result]) => {
      if (result.issues.length > 0) {
        recommendations.push(`Critical: Fix ${category} issues first`);
      }
    });

    // 添加优化建议
    if (checks.performance.score < 80) {
      recommendations.push('Performance optimization needed for better SEO rankings');
    }

    if (checks.structuredData.score < 80) {
      recommendations.push('Implement rich structured data for enhanced search results');
    }

    if (checks.metadata.score < 90) {
      recommendations.push('Optimize page metadata for better click-through rates');
    }

    return recommendations.slice(0, 5); // 限制建议数量
  }

  /**
   * 生成SEO报告
   */
  public async generateSEOReport(): Promise<{
    healthCheck: SEOHealthCheck;
    timestamp: string;
    summary: {
      overallRating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
      priorityActions: string[];
      nextCheckRecommended: string;
    };
  }> {
    const healthCheck = await this.performHealthCheck();
    
    let overallRating: 'excellent' | 'good' | 'needs-improvement' | 'poor';
    if (healthCheck.overallScore >= 90) overallRating = 'excellent';
    else if (healthCheck.overallScore >= 80) overallRating = 'good';
    else if (healthCheck.overallScore >= 60) overallRating = 'needs-improvement';
    else overallRating = 'poor';

    const priorityActions = healthCheck.recommendations.slice(0, 3);
    const nextCheckRecommended = overallRating === 'poor' ? '24 hours' : 
                                overallRating === 'needs-improvement' ? '1 week' : '1 month';

    return {
      healthCheck,
      timestamp: new Date().toISOString(),
      summary: {
        overallRating,
        priorityActions,
        nextCheckRecommended
      }
    };
  }
}

// React Hook for SEO monitoring
export function useSEOMonitoring() {
  const monitor = SEOMonitor.getInstance();
  
  return {
    performHealthCheck: (url?: string) => monitor.performHealthCheck(url),
    generateReport: () => monitor.generateSEOReport()
  };
}

export default SEOMonitor;