/**
 * SEO实用工具库
 * 提供结构化数据验证、URL优化、关键词分析等功能
 */

import { BaseSchema, StructuredDataType } from '@/components/seo/StructuredDataProvider';

// 结构化数据验证结果
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  suggestions: string[];
}

// URL优化配置
export interface URLOptimizationConfig {
  includeKeywords: boolean;
  maxLength: number;
  separators: '-' | '_';
  lowercase: boolean;
  removeStopWords: boolean;
}

// 关键词分析结果
export interface KeywordAnalysisResult {
  keyword: string;
  frequency: number;
  density: number;
  positions: number[];
  context: ('title' | 'h1' | 'h2' | 'h3' | 'content' | 'meta')[];
}

/**
 * 结构化数据验证器
 */
export class StructuredDataValidator {
  private static requiredFields: Record<StructuredDataType, string[]> = {
    'WebSite': ['@context', '@type', 'name', 'url'],
    'Organization': ['@context', '@type', 'name', 'url'],
    'HowTo': ['@context', '@type', 'name', 'description', 'step'],
    'FAQ': ['@context', '@type', 'mainEntity'],
    'BreadcrumbList': ['@context', '@type', 'itemListElement'],
    'SoftwareApplication': ['@context', '@type', 'name', 'description', 'url'],
    'Calculator': ['@context', '@type', 'name', 'description'],
    'Article': ['@context', '@type', 'headline', 'author', 'publisher', 'datePublished']
  };

  /**
   * 验证结构化数据
   */
  static validateSchema(schema: BaseSchema): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: []
    };

    // 检查基本结构
    if (!schema['@context']) {
      result.errors.push('Missing required @context field');
      result.isValid = false;
    } else if (schema['@context'] !== 'https://schema.org') {
      result.errors.push('Invalid @context value, should be "https://schema.org"');
      result.isValid = false;
    }

    if (!schema['@type']) {
      result.errors.push('Missing required @type field');
      result.isValid = false;
      return result;
    }

    const schemaType = schema['@type'] as StructuredDataType;
    const requiredFields = this.requiredFields[schemaType];

    if (!requiredFields) {
      result.warnings.push(`Unknown schema type: ${schemaType}`);
    } else {
      // 检查必需字段
      for (const field of requiredFields) {
        if (!(field in schema) || !schema[field as keyof BaseSchema]) {
          result.errors.push(`Missing required field: ${field}`);
          result.isValid = false;
        }
      }
    }

    // 特定类型的验证
    switch (schemaType) {
      case 'HowTo':
        result.suggestions.push(...this.validateHowToSchema(schema as any));
        break;
      case 'FAQ':
        result.suggestions.push(...this.validateFAQSchema(schema as any));
        break;
      case 'WebSite':
        result.suggestions.push(...this.validateWebSiteSchema(schema as any));
        break;
    }

    return result;
  }

  private static validateHowToSchema(schema: any): string[] {
    const suggestions: string[] = [];

    if (!schema.step || !Array.isArray(schema.step)) {
      return suggestions;
    }

    if (schema.step.length < 3) {
      suggestions.push('Consider adding more steps for better SEO (minimum 3 recommended)');
    }

    schema.step.forEach((step: any, index: number) => {
      if (!step.name || step.name.length < 10) {
        suggestions.push(`Step ${index + 1}: Step name should be more descriptive`);
      }
      if (!step.text || step.text.length < 20) {
        suggestions.push(`Step ${index + 1}: Step description should be more detailed`);
      }
    });

    if (!schema.totalTime) {
      suggestions.push('Consider adding totalTime for better user experience');
    }

    return suggestions;
  }

  private static validateFAQSchema(schema: any): string[] {
    const suggestions: string[] = [];

    if (!schema.mainEntity || !Array.isArray(schema.mainEntity)) {
      return suggestions;
    }

    if (schema.mainEntity.length < 3) {
      suggestions.push('Consider adding more FAQ items (minimum 3 recommended)');
    }

    schema.mainEntity.forEach((item: any, index: number) => {
      if (!item.name || item.name.length < 10) {
        suggestions.push(`FAQ ${index + 1}: Question should be more descriptive`);
      }
      if (!item.acceptedAnswer?.text || item.acceptedAnswer.text.length < 30) {
        suggestions.push(`FAQ ${index + 1}: Answer should be more comprehensive`);
      }
    });

    return suggestions;
  }

  private static validateWebSiteSchema(schema: any): string[] {
    const suggestions: string[] = [];

    if (!schema.potentialAction) {
      suggestions.push('Consider adding search functionality (potentialAction)');
    }

    if (!schema.publisher) {
      suggestions.push('Consider adding publisher information');
    }

    return suggestions;
  }
}

/**
 * URL优化工具
 */
export class URLOptimizer {
  private static readonly STOP_WORDS = [
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'were', 'will', 'with', 'the', 'this', 'but', 'they',
    'have', 'had', 'what', 'said', 'each', 'which', 'she', 'do', 'how'
  ];

  /**
   * 优化URL路径
   */
  static optimizeURL(
    text: string,
    config: URLOptimizationConfig = {
      includeKeywords: true,
      maxLength: 60,
      separators: '-',
      lowercase: true,
      removeStopWords: true
    }
  ): string {
    let url = text;

    // 转换为小写
    if (config.lowercase) {
      url = url.toLowerCase();
    }

    // 移除特殊字符
    url = url.replace(/[^\w\s-]/g, '');

    // 分割单词
    let words = url.split(/\s+/);

    // 移除停用词
    if (config.removeStopWords) {
      words = words.filter(word => !this.STOP_WORDS.includes(word.toLowerCase()));
    }

    // 重新组合
    url = words.join(config.separators);

    // 移除多余的分隔符
    url = url.replace(new RegExp(`${config.separators}+`, 'g'), config.separators);

    // 移除首尾分隔符
    url = url.replace(new RegExp(`^${config.separators}+|${config.separators}+$`, 'g'), '');

    // 限制长度
    if (url.length > config.maxLength) {
      const words = url.split(config.separators);
      let shortUrl = '';
      for (const word of words) {
        if ((shortUrl + config.separators + word).length <= config.maxLength) {
          shortUrl = shortUrl ? shortUrl + config.separators + word : word;
        } else {
          break;
        }
      }
      url = shortUrl;
    }

    return url;
  }

  /**
   * 生成SEO友好的URL
   */
  static generateSEOFriendlyURL(title: string, category?: string): string {
    const optimizedTitle = this.optimizeURL(title);
    
    if (category) {
      const optimizedCategory = this.optimizeURL(category);
      return `${optimizedCategory}/${optimizedTitle}`;
    }
    
    return optimizedTitle;
  }
}

/**
 * 关键词分析工具
 */
export class KeywordAnalyzer {
  /**
   * 分析文本中的关键词
   */
  static analyzeKeywords(
    text: string,
    targetKeywords: string[],
    context: 'title' | 'h1' | 'h2' | 'h3' | 'content' | 'meta' = 'content'
  ): KeywordAnalysisResult[] {
    const results: KeywordAnalysisResult[] = [];
    const lowercaseText = text.toLowerCase();

    for (const keyword of targetKeywords) {
      const lowercaseKeyword = keyword.toLowerCase();
      const regex = new RegExp(`\\b${this.escapeRegex(lowercaseKeyword)}\\b`, 'gi');
      const matches = [...lowercaseText.matchAll(regex)];
      
      const positions = matches.map(match => match.index!);
      const frequency = matches.length;
      const density = (frequency * lowercaseKeyword.split(/\s+/).length) / text.split(/\s+/).length * 100;

      results.push({
        keyword,
        frequency,
        density,
        positions,
        context: [context]
      });
    }

    return results;
  }

  /**
   * 获取关键词密度建议
   */
  static getKeywordDensityRecommendations(results: KeywordAnalysisResult[]): string[] {
    const recommendations: string[] = [];

    for (const result of results) {
      if (result.density > 5) {
        recommendations.push(
          `Keyword "${result.keyword}" appears too frequently (${result.density.toFixed(1)}%). Consider reducing to 2-3%.`
        );
      } else if (result.density < 0.5) {
        recommendations.push(
          `Keyword "${result.keyword}" appears infrequently (${result.density.toFixed(1)}%). Consider adding more mentions.`
        );
      }
    }

    return recommendations;
  }

  /**
   * 分析竞争对手关键词
   */
  static analyzeCompetitorKeywords(
    yourKeywords: string[],
    competitorKeywords: string[]
  ): {
    missing: string[];
    common: string[];
    unique: string[];
  } {
    const yourSet = new Set(yourKeywords.map(k => k.toLowerCase()));
    const competitorSet = new Set(competitorKeywords.map(k => k.toLowerCase()));

    const missing = competitorKeywords.filter(k => !yourSet.has(k.toLowerCase()));
    const common = yourKeywords.filter(k => competitorSet.has(k.toLowerCase()));
    const unique = yourKeywords.filter(k => !competitorSet.has(k.toLowerCase()));

    return { missing, common, unique };
  }

  private static escapeRegex(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  }
}

/**
 * 性能优化工具
 */
export class PerformanceOptimizer {
  /**
   * 生成关键CSS
   */
  static generateCriticalCSS(html: string, css: string): string {
    // 简化版关键CSS提取
    // 实际项目中可能需要使用更复杂的工具
    const usedSelectors: Set<string> = new Set();
    
    // 提取HTML中使用的class和id
    const classMatches = html.match(/class=['"][^'"]*['"]/g) || [];
    const idMatches = html.match(/id=['"][^'"]*['"]/g) || [];
    
    for (const match of classMatches) {
      const classes = match.replace(/class=['"]/, '').replace(/['"]/, '').split(/\s+/);
      classes.forEach(cls => usedSelectors.add(`.${cls}`));
    }
    
    for (const match of idMatches) {
      const id = match.replace(/id=['"]/, '').replace(/['"]/, '');
      usedSelectors.add(`#${id}`);
    }

    // 过滤CSS规则
    const criticalRules: string[] = [];
    const cssRules = css.split('}');
    
    for (const rule of cssRules) {
      if (!rule.trim()) continue;
      
      const selector = rule.split('{')[0]?.trim();
      if (selector && this.shouldIncludeSelector(selector, usedSelectors)) {
        criticalRules.push(rule + '}');
      }
    }

    return criticalRules.join('\n');
  }

  private static shouldIncludeSelector(selector: string, usedSelectors: Set<string>): boolean {
    // 总是包含的选择器
    if (selector.includes('html') || selector.includes('body') || selector.includes('*')) {
      return true;
    }

    // 检查是否匹配使用的选择器
    for (const used of usedSelectors) {
      if (selector.includes(used)) {
        return true;
      }
    }

    return false;
  }

  /**
   * 优化图片加载
   */
  static generateImageOptimizationConfig(images: string[]): {
    preload: string[];
    lazy: string[];
    webpAlternatives: Array<{original: string, webp: string}>;
  } {
    const aboveFoldImages = images.slice(0, 3); // 前3张图片预加载
    const belowFoldImages = images.slice(3);    // 其余懒加载

    return {
      preload: aboveFoldImages,
      lazy: belowFoldImages,
      webpAlternatives: images.map(img => ({
        original: img,
        webp: img.replace(/\.(jpg|jpeg|png)$/, '.webp')
      }))
    };
  }
}

// Classes are already exported inline above