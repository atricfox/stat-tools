/**
 * 智能内部链接系统
 * 自动生成和管理内部链接，提升SEO和用户体验
 * Features: 相关性评分、锚文本优化、链接权重分析
 */

// 页面类型定义
export enum PageType {
  HOMEPAGE = 'homepage',
  CALCULATOR = 'calculator', 
  HUB = 'hub',
  GUIDE = 'guide',
  ABOUT = 'about'
}

// 内部链接配置接口
export interface InternalLink {
  url: string;
  title: string;
  anchorText: string;
  relevanceScore: number;  // 0-1的相关性评分
  priority: 'high' | 'medium' | 'low';
  context: string;        // 链接上下文描述
  pageType: PageType;
  keywords: string[];
}

// 页面信息接口
export interface PageInfo {
  url: string;
  title: string;
  description: string;
  pageType: PageType;
  keywords: string[];
  category?: string;
  relatedTopics: string[];
}

// 链接建议配置
export interface LinkSuggestion {
  targetUrl: string;
  suggestedAnchorText: string[];
  contextualPhrases: string[];
  relevanceReason: string;
  seoValue: number;      // SEO价值评分 0-100
}

/**
 * StatCal网站页面数据配置
 */
export const SITE_PAGES: Record<string, PageInfo> = {
  // 首页
  '/': {
    url: '/',
    title: 'StatCal - Free Online Statistical Calculators',
    description: 'Professional statistical calculators for students, researchers, and professionals. Free online tools for data analysis and statistical computing.',
    pageType: PageType.HOMEPAGE,
    keywords: ['statistical calculators', 'online tools', 'statistics', 'math calculators'],
    relatedTopics: ['statistics', 'mathematics', 'data analysis', 'research tools']
  },

  // 计算器页面
  '/calculator/mean': {
    url: '/calculator/mean',
    title: 'Mean Calculator | Calculate Average Online',
    description: 'Free online mean calculator. Calculate arithmetic mean and average of numbers instantly.',
    pageType: PageType.CALCULATOR,
    keywords: ['mean calculator', 'average calculator', 'arithmetic mean', 'central tendency'],
    category: 'descriptive-statistics',
    relatedTopics: ['central tendency', 'descriptive statistics', 'data analysis']
  },

  '/calculator/standard-deviation': {
    url: '/calculator/standard-deviation',
    title: 'Standard Deviation Calculator | Population & Sample',
    description: 'Calculate standard deviation for both population and sample data sets with step-by-step explanations.',
    pageType: PageType.CALCULATOR,
    keywords: ['standard deviation', 'variance', 'spread', 'dispersion', 'population', 'sample'],
    category: 'descriptive-statistics', 
    relatedTopics: ['dispersion', 'variance', 'descriptive statistics', 'data spread']
  },

  '/calculator/gpa': {
    url: '/calculator/gpa',
    title: 'GPA Calculator | Grade Point Average Calculator',
    description: 'Calculate your GPA with support for different grading systems (4.0, 4.3, 4.5 scales). Free online tool for students and academics.',
    pageType: PageType.CALCULATOR,
    keywords: ['gpa calculator', 'grade point average', 'academic grades', 'gpa scale'],
    category: 'academic-tools',
    relatedTopics: ['academic performance', 'grading systems', 'education tools']
  },

  '/calculator/weighted-mean': {
    url: '/calculator/weighted-mean',
    title: 'Weighted Mean Calculator | Weighted Average',
    description: 'Calculate weighted mean and weighted average with custom weights for each value. Free online tool for statistical analysis and data processing.',
    pageType: PageType.CALCULATOR,
    keywords: ['weighted mean', 'weighted average', 'weighted calculation'],
    category: 'descriptive-statistics',
    relatedTopics: ['central tendency', 'weighted statistics', 'data analysis']
  },

  '/calculator/confidence-interval': {
    url: '/calculator/confidence-interval',
    title: 'Confidence Interval Calculator | Statistical Inference',
    description: 'Calculate confidence intervals for means, proportions, and other statistical parameters.',
    pageType: PageType.CALCULATOR,
    keywords: ['confidence interval', 'statistical inference', 'margin of error', 'confidence level'],
    category: 'inferential-statistics',
    relatedTopics: ['statistical inference', 'hypothesis testing', 'estimation']
  },

  // Hub页面
  '/calculator': {
    url: '/calculator',
    title: 'Statistical Calculators Hub | All Tools',
    description: 'Complete collection of free online statistical calculators and tools for students, researchers, and professionals worldwide.',
    pageType: PageType.HUB,
    keywords: ['statistical tools', 'calculator hub', 'statistics collection'],
    relatedTopics: ['statistical analysis', 'mathematical tools', 'data analysis']
  },

  '/hub': {
    url: '/hub',
    title: 'StatCal Hub | Educational Resources & Tools',
    description: 'Educational hub with tutorials, guides, and advanced statistical resources for learning data analysis and statistical methods.',
    pageType: PageType.HUB,
    keywords: ['educational hub', 'statistics resources', 'learning center'],
    relatedTopics: ['education', 'tutorials', 'statistical learning']
  },

  // 指南页面
  '/guides/how-to-calculate-mean': {
    url: '/guides/how-to-calculate-mean',
    title: 'How to Calculate Mean: Complete Guide with Examples',
    description: 'Step-by-step guide on calculating arithmetic mean with practical examples and detailed explanations for students and professionals.',
    pageType: PageType.GUIDE,
    keywords: ['calculate mean', 'mean tutorial', 'average calculation', 'statistics guide'],
    relatedTopics: ['mean calculation', 'descriptive statistics', 'tutorials']
  },

  '/guides/understanding-standard-deviation': {
    url: '/guides/understanding-standard-deviation',
    title: 'Understanding Standard Deviation: A Complete Guide',
    description: 'Comprehensive guide to standard deviation, variance, and measures of spread with practical examples and statistical interpretations.',
    pageType: PageType.GUIDE,
    keywords: ['standard deviation guide', 'variance explained', 'dispersion measures'],
    relatedTopics: ['dispersion', 'variance', 'statistical concepts']
  },

  '/guides/gpa-calculation-guide': {
    url: '/guides/gpa-calculation-guide',
    title: 'GPA Calculation Guide: Different Systems Explained',
    description: 'Complete guide to GPA calculation across different grading systems and scales with examples from various educational institutions.',
    pageType: PageType.GUIDE,
    keywords: ['gpa guide', 'grade calculation', 'grading systems', 'academic assessment'],
    relatedTopics: ['academic grading', 'education systems', 'grade calculation']
  }
};

/**
 * 智能内部链接生成器类
 */
export class InternalLinkGenerator {
  private pages: Record<string, PageInfo>;
  
  constructor(pages: Record<string, PageInfo> = SITE_PAGES) {
    this.pages = pages;
  }

  /**
   * 为指定页面生成相关内部链接
   */
  generateLinksForPage(currentPageUrl: string, maxLinks: number = 5): InternalLink[] {
    const currentPage = this.pages[currentPageUrl];
    if (!currentPage) {
      return [];
    }

    const suggestions = this.calculateRelevanceScores(currentPage);
    return this.buildInternalLinks(suggestions, maxLinks);
  }

  /**
   * 计算页面间相关性评分
   */
  private calculateRelevanceScores(currentPage: PageInfo): LinkSuggestion[] {
    const suggestions: LinkSuggestion[] = [];

    Object.values(this.pages).forEach(targetPage => {
      // 跳过当前页面
      if (targetPage.url === currentPage.url) return;

      const relevanceScore = this.calculateRelevance(currentPage, targetPage);
      if (relevanceScore > 0.3) { // 只保留相关性较高的链接
        suggestions.push({
          targetUrl: targetPage.url,
          suggestedAnchorText: this.generateAnchorTexts(targetPage),
          contextualPhrases: this.generateContextualPhrases(currentPage, targetPage),
          relevanceReason: this.explainRelevance(currentPage, targetPage),
          seoValue: Math.round(relevanceScore * 100)
        });
      }
    });

    return suggestions.sort((a, b) => b.seoValue - a.seoValue);
  }

  /**
   * 计算两个页面间的相关性评分
   */
  private calculateRelevance(currentPage: PageInfo, targetPage: PageInfo): number {
    let score = 0;

    // 1. 页面类型相关性 (0-0.3)
    score += this.getPageTypeRelevance(currentPage.pageType, targetPage.pageType);

    // 2. 关键词重叠度 (0-0.4)
    score += this.getKeywordOverlap(currentPage.keywords, targetPage.keywords) * 0.4;

    // 3. 主题相关性 (0-0.3)
    score += this.getTopicRelevance(currentPage.relatedTopics, targetPage.relatedTopics) * 0.3;

    // 4. 分类相关性 (0-0.2)
    if (currentPage.category && targetPage.category) {
      score += (currentPage.category === targetPage.category) ? 0.2 : 0;
    }

    // 5. 特殊规则加分
    score += this.applySpecialRules(currentPage, targetPage);

    return Math.min(score, 1); // 确保不超过1
  }

  /**
   * 页面类型相关性评分
   */
  private getPageTypeRelevance(currentType: PageType, targetType: PageType): number {
    const typeMatrix: Record<PageType, Record<PageType, number>> = {
      [PageType.HOMEPAGE]: {
        [PageType.HOMEPAGE]: 0,
        [PageType.CALCULATOR]: 0.25,
        [PageType.HUB]: 0.3,
        [PageType.GUIDE]: 0.2,
        [PageType.ABOUT]: 0.1
      },
      [PageType.CALCULATOR]: {
        [PageType.HOMEPAGE]: 0.15,
        [PageType.CALCULATOR]: 0.25,
        [PageType.HUB]: 0.2,
        [PageType.GUIDE]: 0.3,
        [PageType.ABOUT]: 0.05
      },
      [PageType.HUB]: {
        [PageType.HOMEPAGE]: 0.2,
        [PageType.CALCULATOR]: 0.3,
        [PageType.HUB]: 0.15,
        [PageType.GUIDE]: 0.25,
        [PageType.ABOUT]: 0.1
      },
      [PageType.GUIDE]: {
        [PageType.HOMEPAGE]: 0.1,
        [PageType.CALCULATOR]: 0.3,
        [PageType.HUB]: 0.2,
        [PageType.GUIDE]: 0.2,
        [PageType.ABOUT]: 0.05
      },
      [PageType.ABOUT]: {
        [PageType.HOMEPAGE]: 0.2,
        [PageType.CALCULATOR]: 0.05,
        [PageType.HUB]: 0.15,
        [PageType.GUIDE]: 0.05,
        [PageType.ABOUT]: 0
      }
    };

    return typeMatrix[currentType]?.[targetType] || 0;
  }

  /**
   * 关键词重叠度计算
   */
  private getKeywordOverlap(keywords1: string[], keywords2: string[]): number {
    const set1 = new Set(keywords1.map(k => k.toLowerCase()));
    const set2 = new Set(keywords2.map(k => k.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);
    
    return union.size > 0 ? intersection.size / union.size : 0;
  }

  /**
   * 主题相关性计算
   */
  private getTopicRelevance(topics1: string[], topics2: string[]): number {
    const set1 = new Set(topics1.map(t => t.toLowerCase()));
    const set2 = new Set(topics2.map(t => t.toLowerCase()));
    
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const maxSize = Math.max(set1.size, set2.size);
    
    return maxSize > 0 ? intersection.size / maxSize : 0;
  }

  /**
   * 应用特殊相关性规则
   */
  private applySpecialRules(currentPage: PageInfo, targetPage: PageInfo): number {
    let bonus = 0;

    // 计算器到对应指南的高相关性
    if (currentPage.pageType === PageType.CALCULATOR && targetPage.pageType === PageType.GUIDE) {
      const calculatorName = currentPage.url.split('/').pop();
      if (targetPage.url.includes(calculatorName || '')) {
        bonus += 0.2;
      }
    }

    // Hub页面到计算器的相关性
    if (currentPage.pageType === PageType.HUB && targetPage.pageType === PageType.CALCULATOR) {
      bonus += 0.1;
    }

    // 同类型计算器的相关性
    if (currentPage.pageType === PageType.CALCULATOR && 
        targetPage.pageType === PageType.CALCULATOR &&
        currentPage.category === targetPage.category) {
      bonus += 0.15;
    }

    return bonus;
  }

  /**
   * 生成推荐锚文本
   */
  private generateAnchorTexts(targetPage: PageInfo): string[] {
    const anchorTexts: string[] = [];

    // 基础锚文本
    const pageTitle = targetPage.title.split('|')[0].trim();
    anchorTexts.push(pageTitle);

    // 关键词锚文本
    targetPage.keywords.slice(0, 2).forEach(keyword => {
      const capitalizedKeyword = keyword.charAt(0).toUpperCase() + keyword.slice(1);
      anchorTexts.push(capitalizedKeyword);
    });

    // 页面类型特定锚文本
    switch (targetPage.pageType) {
      case PageType.CALCULATOR:
        anchorTexts.push(`${targetPage.url.split('/').pop()?.replace('-', ' ')} calculator`);
        break;
      case PageType.GUIDE:
        anchorTexts.push(`${targetPage.url.split('/').pop()?.replace('-', ' ')} guide`);
        break;
      case PageType.HUB:
        anchorTexts.push('calculator hub', 'all tools');
        break;
    }

    return [...new Set(anchorTexts)]; // 去重
  }

  /**
   * 生成上下文短语
   */
  private generateContextualPhrases(currentPage: PageInfo, targetPage: PageInfo): string[] {
    const phrases: string[] = [];

    if (targetPage.pageType === PageType.CALCULATOR) {
      phrases.push(
        `You might also need our ${targetPage.title.split('|')[0].trim().toLowerCase()}`,
        `Try our ${targetPage.title.split('|')[0].trim().toLowerCase()}`,
        `Calculate with our ${targetPage.title.split('|')[0].trim().toLowerCase()}`
      );
    }

    if (targetPage.pageType === PageType.GUIDE) {
      phrases.push(
        `Learn more in our ${targetPage.title.split(':')[0].trim().toLowerCase()}`,
        `Check out our ${targetPage.title.split(':')[0].trim().toLowerCase()}`,
        `Read our comprehensive ${targetPage.title.split(':')[0].trim().toLowerCase()}`
      );
    }

    return phrases;
  }

  /**
   * 解释相关性原因
   */
  private explainRelevance(currentPage: PageInfo, targetPage: PageInfo): string {
    if (currentPage.category === targetPage.category) {
      return 'Same statistical category';
    }
    
    const sharedKeywords = currentPage.keywords.filter(k => 
      targetPage.keywords.some(tk => tk.toLowerCase() === k.toLowerCase())
    );
    
    if (sharedKeywords.length > 0) {
      return `Related topics: ${sharedKeywords.join(', ')}`;
    }

    const sharedTopics = currentPage.relatedTopics.filter(t => 
      targetPage.relatedTopics.some(tt => tt.toLowerCase() === t.toLowerCase())
    );
    
    if (sharedTopics.length > 0) {
      return `Shared topics: ${sharedTopics.join(', ')}`;
    }

    return 'Complementary statistical tools';
  }

  /**
   * 构建最终的内部链接对象
   */
  private buildInternalLinks(suggestions: LinkSuggestion[], maxLinks: number): InternalLink[] {
    return suggestions.slice(0, maxLinks).map(suggestion => {
      const targetPage = this.pages[suggestion.targetUrl];
      const anchorText = suggestion.suggestedAnchorText[0] || targetPage.title;

      return {
        url: suggestion.targetUrl,
        title: targetPage.title,
        anchorText,
        relevanceScore: suggestion.seoValue / 100,
        priority: this.determinePriority(suggestion.seoValue),
        context: suggestion.contextualPhrases[0] || '',
        pageType: targetPage.pageType,
        keywords: targetPage.keywords
      };
    });
  }

  /**
   * 根据SEO值确定优先级
   */
  private determinePriority(seoValue: number): 'high' | 'medium' | 'low' {
    if (seoValue >= 70) return 'high';
    if (seoValue >= 50) return 'medium';
    return 'low';
  }

  /**
   * 获取特定分类的相关链接
   */
  getRelatedByCategory(category: string, excludeUrl?: string): InternalLink[] {
    const relatedPages = Object.values(this.pages).filter(page => 
      page.category === category && page.url !== excludeUrl
    );

    return relatedPages.map(page => ({
      url: page.url,
      title: page.title,
      anchorText: page.title.split('|')[0].trim(),
      relevanceScore: 0.8, // 同分类高相关性
      priority: 'high' as const,
      context: `Related ${category.replace('-', ' ')} tool`,
      pageType: page.pageType,
      keywords: page.keywords
    }));
  }

  /**
   * 获取面包屑导航链接
   */
  getBreadcrumbLinks(currentUrl: string): InternalLink[] {
    const breadcrumbs: InternalLink[] = [];
    
    // 总是包含首页
    breadcrumbs.push({
      url: '/',
      title: 'Home',
      anchorText: 'Home',
      relevanceScore: 1,
      priority: 'high',
      context: 'Homepage',
      pageType: PageType.HOMEPAGE,
      keywords: ['home', 'statcal']
    });

    // 根据URL结构添加中间层级
    const pathSegments = currentUrl.split('/').filter(Boolean);
    
    if (pathSegments.length > 0 && pathSegments[0] === 'calculator') {
      breadcrumbs.push({
        url: '/calculator',
        title: 'Calculators',
        anchorText: 'Calculators',
        relevanceScore: 0.9,
        priority: 'high',
        context: 'Calculator Hub',
        pageType: PageType.HUB,
        keywords: ['calculators', 'tools']
      });
    }

    if (pathSegments.length > 0 && pathSegments[0] === 'guides') {
      breadcrumbs.push({
        url: '/hub',
        title: 'Hub',
        anchorText: 'Hub', 
        relevanceScore: 0.9,
        priority: 'high',
        context: 'Educational Hub',
        pageType: PageType.HUB,
        keywords: ['hub', 'resources']
      });
    }

    return breadcrumbs;
  }
}

// 默认实例导出
export const internalLinkGenerator = new InternalLinkGenerator();

// 工具函数：获取页面的所有内部链接
export function getPageInternalLinks(currentUrl: string): {
  relatedLinks: InternalLink[];
  breadcrumbLinks: InternalLink[];
  categoryLinks: InternalLink[];
} {
  const currentPage = SITE_PAGES[currentUrl];
  
  return {
    relatedLinks: internalLinkGenerator.generateLinksForPage(currentUrl, 5),
    breadcrumbLinks: internalLinkGenerator.getBreadcrumbLinks(currentUrl),
    categoryLinks: currentPage?.category ? 
      internalLinkGenerator.getRelatedByCategory(currentPage.category, currentUrl) : []
  };
}

// 工具函数：验证内部链接质量
export function validateInternalLinks(links: InternalLink[]): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 检查链接数量
  if (links.length > 8) {
    warnings.push('Too many internal links may dilute link equity');
  }

  if (links.length < 2) {
    suggestions.push('Consider adding more relevant internal links');
  }

  // 检查锚文本多样性
  const anchorTexts = links.map(link => link.anchorText);
  const uniqueAnchors = new Set(anchorTexts);
  
  if (uniqueAnchors.size < anchorTexts.length) {
    warnings.push('Duplicate anchor texts detected');
  }

  // 检查相关性评分
  const lowRelevanceLinks = links.filter(link => link.relevanceScore < 0.4);
  if (lowRelevanceLinks.length > 0) {
    suggestions.push(`${lowRelevanceLinks.length} links have low relevance scores`);
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}