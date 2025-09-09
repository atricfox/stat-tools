/**
 * SEO监控和验证工具
 * 提供SEO健康检查、性能监控、搜索控制台集成等功能
 */

import { LighthouseScore, CoreWebVitals, SEOAudit, SearchResult } from '@/types/seo';

// SEO健康检查配置
export interface SEOHealthCheckConfig {
  checkMetadata: boolean;
  checkStructuredData: boolean;
  checkPerformance: boolean;
  checkAccessibility: boolean;
  checkInternalLinks: boolean;
  checkImages: boolean;
}

// SEO监控结果
export interface SEOMonitoringResult {
  overall: {
    score: number;
    grade: 'A' | 'B' | 'C' | 'D' | 'F';
    lastChecked: Date;
  };
  metadata: MetadataCheck;
  structuredData: StructuredDataCheck;
  performance: PerformanceCheck;
  accessibility: AccessibilityCheck;
  content: ContentCheck;
  technical: TechnicalCheck;
}

export interface MetadataCheck {
  score: number;
  issues: Array<{
    type: 'error' | 'warning' | 'info';
    message: string;
    element?: string;
    fix?: string;
  }>;
  checks: {
    titlePresent: boolean;
    titleLength: boolean;
    descriptionPresent: boolean;
    descriptionLength: boolean;
    keywordsRelevant: boolean;
    canonicalPresent: boolean;
    openGraphPresent: boolean;
    twitterCardPresent: boolean;
  };
}

export interface StructuredDataCheck {
  score: number;
  schemas: Array<{
    type: string;
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }>;
  googleRichResultsEligible: boolean;
}

export interface PerformanceCheck {
  score: number;
  coreWebVitals: CoreWebVitals;
  lighthouse: LighthouseScore;
  recommendations: string[];
}

export interface AccessibilityCheck {
  score: number;
  issues: Array<{
    type: 'error' | 'warning';
    message: string;
    element: string;
    impact: 'critical' | 'serious' | 'moderate' | 'minor';
  }>;
  wcagCompliance: {
    levelA: boolean;
    levelAA: boolean;
    levelAAA: boolean;
  };
}

export interface ContentCheck {
  score: number;
  wordCount: number;
  readabilityScore: number;
  keywordDensity: Record<string, number>;
  headingStructure: {
    hasH1: boolean;
    h1Count: number;
    hierarchyCorrect: boolean;
  };
  internalLinks: {
    count: number;
    brokenLinks: number;
    anchorTextOptimized: boolean;
  };
  images: {
    total: number;
    withoutAlt: number;
    oversized: number;
    notOptimized: number;
  };
}

export interface TechnicalCheck {
  score: number;
  issues: string[];
  checks: {
    robotsTxtValid: boolean;
    sitemapValid: boolean;
    httpsEnabled: boolean;
    mobileResponsive: boolean;
    pageSpeeds: Record<string, number>;
  };
}

/**
 * SEO监控器主类
 */
export class SEOMonitor {
  private baseUrl: string;
  private config: SEOHealthCheckConfig;

  constructor(baseUrl: string, config: SEOHealthCheckConfig) {
    this.baseUrl = baseUrl;
    this.config = config;
  }

  /**
   * 执行完整的SEO健康检查
   */
  async performHealthCheck(url: string): Promise<SEOMonitoringResult> {
    const results: Partial<SEOMonitoringResult> = {};

    try {
      // 获取页面内容
      const pageContent = await this.fetchPageContent(url);

      if (this.config.checkMetadata) {
        results.metadata = await this.checkMetadata(pageContent, url);
      }

      if (this.config.checkStructuredData) {
        results.structuredData = await this.checkStructuredData(pageContent);
      }

      if (this.config.checkPerformance) {
        results.performance = await this.checkPerformance(url);
      }

      if (this.config.checkAccessibility) {
        results.accessibility = await this.checkAccessibility(pageContent);
      }

      const contentCheck = await this.checkContent(pageContent);
      results.content = contentCheck;

      const technicalCheck = await this.checkTechnical(url);
      results.technical = technicalCheck;

      // 计算总体评分
      const overallScore = this.calculateOverallScore(results as SEOMonitoringResult);

      return {
        overall: {
          score: overallScore,
          grade: this.scoreToGrade(overallScore),
          lastChecked: new Date()
        },
        metadata: results.metadata!,
        structuredData: results.structuredData!,
        performance: results.performance!,
        accessibility: results.accessibility!,
        content: results.content!,
        technical: results.technical!
      };

    } catch (error) {
      throw new Error(`SEO health check failed: ${error}`);
    }
  }

  /**
   * 检查页面元数据
   */
  private async checkMetadata(html: string, url: string): Promise<MetadataCheck> {
    const issues: MetadataCheck['issues'] = [];
    const checks: MetadataCheck['checks'] = {
      titlePresent: false,
      titleLength: false,
      descriptionPresent: false,
      descriptionLength: false,
      keywordsRelevant: false,
      canonicalPresent: false,
      openGraphPresent: false,
      twitterCardPresent: false
    };

    // 检查标题
    const titleMatch = html.match(/<title[^>]*>(.*?)<\/title>/i);
    if (titleMatch) {
      checks.titlePresent = true;
      const title = titleMatch[1];
      if (title.length >= 30 && title.length <= 60) {
        checks.titleLength = true;
      } else {
        issues.push({
          type: 'warning',
          message: `Title length (${title.length} chars) should be between 30-60 characters`,
          element: 'title',
          fix: 'Optimize title length for better SEO'
        });
      }
    } else {
      issues.push({
        type: 'error',
        message: 'Missing page title',
        element: 'title',
        fix: 'Add a descriptive title tag'
      });
    }

    // 检查描述
    const descMatch = html.match(/<meta[^>]*name=["\']description["\'][^>]*content=["\']([^"\']*)["\'][^>]*>/i);
    if (descMatch) {
      checks.descriptionPresent = true;
      const description = descMatch[1];
      if (description.length >= 120 && description.length <= 160) {
        checks.descriptionLength = true;
      } else {
        issues.push({
          type: 'warning',
          message: `Description length (${description.length} chars) should be between 120-160 characters`,
          element: 'meta[name="description"]',
          fix: 'Optimize description length'
        });
      }
    } else {
      issues.push({
        type: 'error',
        message: 'Missing meta description',
        element: 'meta[name="description"]',
        fix: 'Add a compelling meta description'
      });
    }

    // 检查Canonical URL
    const canonicalMatch = html.match(/<link[^>]*rel=["\']canonical["\'][^>]*href=["\']([^"\']*)["\'][^>]*>/i);
    checks.canonicalPresent = !!canonicalMatch;
    if (!canonicalMatch) {
      issues.push({
        type: 'warning',
        message: 'Missing canonical URL',
        element: 'link[rel="canonical"]',
        fix: 'Add canonical link to prevent duplicate content issues'
      });
    }

    // 检查Open Graph
    const ogTitleMatch = html.match(/<meta[^>]*property=["\']og:title["\'][^>]*>/i);
    checks.openGraphPresent = !!ogTitleMatch;
    if (!ogTitleMatch) {
      issues.push({
        type: 'info',
        message: 'Missing Open Graph tags',
        element: 'meta[property="og:title"]',
        fix: 'Add Open Graph tags for better social media sharing'
      });
    }

    // 检查Twitter Card
    const twitterCardMatch = html.match(/<meta[^>]*name=["\']twitter:card["\'][^>]*>/i);
    checks.twitterCardPresent = !!twitterCardMatch;

    const score = this.calculateMetadataScore(checks);

    return { score, issues, checks };
  }

  /**
   * 检查结构化数据
   */
  private async checkStructuredData(html: string): Promise<StructuredDataCheck> {
    const schemas: StructuredDataCheck['schemas'] = [];
    let googleRichResultsEligible = false;

    // 查找JSON-LD结构化数据
    const jsonLdMatches = html.match(/<script[^>]*type=["\']application\/ld\+json["\'][^>]*>(.*?)<\/script>/gi);
    
    if (jsonLdMatches) {
      for (const match of jsonLdMatches) {
        const jsonContent = match.replace(/<script[^>]*>/, '').replace(/<\/script>/, '');
        
        try {
          const schema = JSON.parse(jsonContent);
          const validation = this.validateSchema(schema);
          
          schemas.push({
            type: schema['@type'] || 'Unknown',
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
          });

          // 检查是否符合Google富结果条件
          if (['WebSite', 'Organization', 'HowTo', 'FAQ', 'BreadcrumbList'].includes(schema['@type'])) {
            googleRichResultsEligible = true;
          }

        } catch (error) {
          schemas.push({
            type: 'Invalid JSON',
            isValid: false,
            errors: ['Invalid JSON-LD format'],
            warnings: []
          });
        }
      }
    }

    const score = schemas.length > 0 ? 
      Math.round(schemas.filter(s => s.isValid).length / schemas.length * 100) : 0;

    return {
      score,
      schemas,
      googleRichResultsEligible
    };
  }

  /**
   * 检查页面性能
   */
  private async checkPerformance(url: string): Promise<PerformanceCheck> {
    // 模拟性能检查 - 实际实现需要集成Lighthouse API
    const mockCoreWebVitals: CoreWebVitals = {
      lcp: 1800, // Largest Contentful Paint
      fid: 80,   // First Input Delay
      cls: 0.08, // Cumulative Layout Shift
      fcp: 1200, // First Contentful Paint
      ttfb: 400  // Time to First Byte
    };

    const mockLighthouse: LighthouseScore = {
      performance: 92,
      accessibility: 96,
      bestPractices: 88,
      seo: 95
    };

    const recommendations: string[] = [];

    // 分析Core Web Vitals并给出建议
    if (mockCoreWebVitals.lcp > 2500) {
      recommendations.push('Optimize Largest Contentful Paint (LCP) - consider image optimization and server response time');
    }
    if (mockCoreWebVitals.fid > 100) {
      recommendations.push('Improve First Input Delay (FID) - reduce JavaScript execution time');
    }
    if (mockCoreWebVitals.cls > 0.1) {
      recommendations.push('Fix Cumulative Layout Shift (CLS) - ensure proper image dimensions and avoid layout shifts');
    }

    const score = Math.round((mockLighthouse.performance + mockLighthouse.seo) / 2);

    return {
      score,
      coreWebVitals: mockCoreWebVitals,
      lighthouse: mockLighthouse,
      recommendations
    };
  }

  /**
   * 检查内容质量
   */
  private async checkContent(html: string): Promise<ContentCheck> {
    // 移除HTML标签，获取纯文本
    const textContent = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    const wordCount = textContent.split(' ').length;

    // 检查标题结构
    const h1Matches = html.match(/<h1[^>]*>/gi) || [];
    const hasH1 = h1Matches.length > 0;
    const h1Count = h1Matches.length;

    // 检查图片
    const imgMatches = html.match(/<img[^>]*>/gi) || [];
    const imagesWithoutAlt = imgMatches.filter(img => !img.includes('alt=')).length;

    // 检查内部链接
    const internalLinkMatches = html.match(/<a[^>]*href=["\'][^"\']*["\'][^>]*>/gi) || [];
    const internalLinks = internalLinkMatches.filter(link => 
      link.includes('href="/') || link.includes('href="' + this.baseUrl)
    );

    const score = this.calculateContentScore({
      wordCount,
      hasH1,
      h1Count,
      totalImages: imgMatches.length,
      imagesWithoutAlt,
      internalLinkCount: internalLinks.length
    });

    return {
      score,
      wordCount,
      readabilityScore: this.calculateReadabilityScore(textContent),
      keywordDensity: {}, // 实际实现需要关键词分析
      headingStructure: {
        hasH1,
        h1Count,
        hierarchyCorrect: true // 简化实现
      },
      internalLinks: {
        count: internalLinks.length,
        brokenLinks: 0, // 需要实际检查
        anchorTextOptimized: true // 简化实现
      },
      images: {
        total: imgMatches.length,
        withoutAlt: imagesWithoutAlt,
        oversized: 0, // 需要实际检查
        notOptimized: 0 // 需要实际检查
      }
    };
  }

  /**
   * 检查可访问性
   */
  private async checkAccessibility(html: string): Promise<AccessibilityCheck> {
    const issues: AccessibilityCheck['issues'] = [];

    // 检查图片alt属性
    const imgWithoutAlt = html.match(/<img(?![^>]*alt=)[^>]*>/gi);
    if (imgWithoutAlt) {
      issues.push({
        type: 'error',
        message: `${imgWithoutAlt.length} images missing alt attributes`,
        element: 'img',
        impact: 'serious'
      });
    }

    // 检查标题层次
    const h1Count = (html.match(/<h1[^>]*>/gi) || []).length;
    if (h1Count === 0) {
      issues.push({
        type: 'error',
        message: 'Missing H1 heading',
        element: 'h1',
        impact: 'serious'
      });
    } else if (h1Count > 1) {
      issues.push({
        type: 'warning',
        message: 'Multiple H1 headings found',
        element: 'h1',
        impact: 'moderate'
      });
    }

    const score = Math.max(0, 100 - issues.length * 10);

    return {
      score,
      issues,
      wcagCompliance: {
        levelA: issues.filter(i => i.impact === 'critical').length === 0,
        levelAA: issues.filter(i => ['critical', 'serious'].includes(i.impact)).length === 0,
        levelAAA: issues.length === 0
      }
    };
  }

  /**
   * 检查技术SEO
   */
  private async checkTechnical(url: string): Promise<TechnicalCheck> {
    const issues: string[] = [];
    const checks: TechnicalCheck['checks'] = {
      robotsTxtValid: true, // 需要实际检查
      sitemapValid: true,   // 需要实际检查
      httpsEnabled: url.startsWith('https://'),
      mobileResponsive: true, // 需要实际检查
      pageSpeeds: {} // 需要实际测量
    };

    if (!checks.httpsEnabled) {
      issues.push('HTTPS not enabled - affects SEO rankings');
    }

    const score = Object.values(checks).filter(check => 
      typeof check === 'boolean' ? check : true
    ).length / Object.keys(checks).length * 100;

    return {
      score: Math.round(score),
      issues,
      checks
    };
  }

  // 辅助方法
  private async fetchPageContent(url: string): Promise<string> {
    // 实际实现需要网络请求
    // 这里返回模拟内容
    return `
      <html>
        <head>
          <title>Sample Page Title</title>
          <meta name="description" content="Sample meta description for testing">
        </head>
        <body>
          <h1>Main Heading</h1>
          <p>Sample content...</p>
        </body>
      </html>
    `;
  }

  private validateSchema(schema: any): { isValid: boolean; errors: string[]; warnings: string[] } {
    // 简化的schema验证
    const errors: string[] = [];
    const warnings: string[] = [];

    if (!schema['@context']) errors.push('Missing @context');
    if (!schema['@type']) errors.push('Missing @type');

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  private calculateMetadataScore(checks: MetadataCheck['checks']): number {
    const total = Object.keys(checks).length;
    const passed = Object.values(checks).filter(Boolean).length;
    return Math.round((passed / total) * 100);
  }

  private calculateContentScore(metrics: {
    wordCount: number;
    hasH1: boolean;
    h1Count: number;
    totalImages: number;
    imagesWithoutAlt: number;
    internalLinkCount: number;
  }): number {
    let score = 100;

    if (metrics.wordCount < 300) score -= 20;
    if (!metrics.hasH1) score -= 15;
    if (metrics.h1Count > 1) score -= 10;
    if (metrics.imagesWithoutAlt > 0) score -= metrics.imagesWithoutAlt * 5;
    if (metrics.internalLinkCount < 3) score -= 10;

    return Math.max(0, score);
  }

  private calculateReadabilityScore(text: string): number {
    // 简化的可读性评分
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    // Flesch Reading Ease近似计算
    let score = 206.835 - (1.015 * avgWordsPerSentence);
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  private calculateOverallScore(results: SEOMonitoringResult): number {
    const scores = [
      results.metadata.score * 0.25,
      results.structuredData.score * 0.15,
      results.performance.score * 0.25,
      results.accessibility.score * 0.15,
      results.content.score * 0.15,
      results.technical.score * 0.05
    ];

    return Math.round(scores.reduce((sum, score) => sum + score, 0));
  }

  private scoreToGrade(score: number): 'A' | 'B' | 'C' | 'D' | 'F' {
    if (score >= 90) return 'A';
    if (score >= 80) return 'B';
    if (score >= 70) return 'C';
    if (score >= 60) return 'D';
    return 'F';
  }
}

export default SEOMonitor;