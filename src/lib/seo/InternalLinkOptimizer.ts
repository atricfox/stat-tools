/**
 * InternalLinkOptimizer
 * 智能内链推荐和优化系统
 * Features: 相关性分析、锚文本优化、链接权重分布
 */

export interface InternalLink {
  href: string;
  anchor: string;
  relevanceScore: number;
  context: 'calculator' | 'tool' | 'guide' | 'home' | 'hub';
  priority: 'high' | 'medium' | 'low';
}

export interface PageContext {
  pageType: 'calculator' | 'hub' | 'tool' | 'home';
  toolId?: string;
  categories: string[];
  keywords: string[];
}

export interface LinkRecommendation {
  links: InternalLink[];
  reasoning: string;
  placement: 'header' | 'content' | 'sidebar' | 'footer';
}

// 工具数据和关系映射
const TOOL_RELATIONSHIPS = {
  'mean': {
    related: ['standard-deviation', 'weighted-mean'],
    categories: ['descriptive-statistics', 'central-tendency'],
    keywords: ['average', 'central tendency', 'arithmetic mean', 'statistics']
  },
  'standard-deviation': {
    related: ['mean', 'weighted-mean'],
    categories: ['descriptive-statistics', 'variability'],
    keywords: ['variance', 'spread', 'dispersion', 'deviation', 'statistics']
  },
  'weighted-mean': {
    related: ['mean', 'standard-deviation'],
    categories: ['descriptive-statistics', 'central-tendency'],
    keywords: ['weighted average', 'importance', 'weight', 'statistics']
  },
  'gpa': {
    related: ['weighted-mean'],
    categories: ['academic', 'grading'],
    keywords: ['grade point average', 'academic', 'education', 'grading']
  }
} as const;

const TOOL_METADATA = {
  'mean': {
    name: 'Mean Calculator',
    description: 'Calculate arithmetic mean and average',
    anchor: 'mean calculator'
  },
  'standard-deviation': {
    name: 'Standard Deviation Calculator', 
    description: 'Calculate population and sample standard deviation',
    anchor: 'standard deviation calculator'
  },
  'weighted-mean': {
    name: 'Weighted Mean Calculator',
    description: 'Calculate weighted average with importance factors',
    anchor: 'weighted mean calculator'
  },
  'gpa': {
    name: 'GPA Calculator',
    description: 'Calculate Grade Point Average with multiple systems',
    anchor: 'GPA calculator'
  }
} as const;

export class InternalLinkOptimizer {
  private static instance: InternalLinkOptimizer;
  
  private constructor() {}
  
  public static getInstance(): InternalLinkOptimizer {
    if (!InternalLinkOptimizer.instance) {
      InternalLinkOptimizer.instance = new InternalLinkOptimizer();
    }
    return InternalLinkOptimizer.instance;
  }

  /**
   * 生成智能内链推荐
   */
  public generateRecommendations(context: PageContext): LinkRecommendation[] {
    const recommendations: LinkRecommendation[] = [];

    // 为不同页面类型生成推荐
    switch (context.pageType) {
      case 'calculator':
        recommendations.push(...this.getCalculatorPageRecommendations(context));
        break;
      case 'hub':
        recommendations.push(...this.getHubPageRecommendations(context));
        break;
      case 'tool':
        recommendations.push(...this.getToolPageRecommendations(context));
        break;
      case 'home':
        recommendations.push(...this.getHomePageRecommendations(context));
        break;
    }

    return recommendations;
  }

  /**
   * 计算器页面的内链推荐
   */
  private getCalculatorPageRecommendations(context: PageContext): LinkRecommendation[] {
    if (!context.toolId) return [];

    const recommendations: LinkRecommendation[] = [];
    const toolData = TOOL_RELATIONSHIPS[context.toolId as keyof typeof TOOL_RELATIONSHIPS];
    
    if (!toolData) return [];

    // 相关计算器推荐（侧边栏）
    const relatedLinks = toolData.related.map(toolId => ({
      href: `/calculator/${toolId}`,
      anchor: TOOL_METADATA[toolId as keyof typeof TOOL_METADATA]?.anchor || toolId,
      relevanceScore: 0.9,
      context: 'calculator' as const,
      priority: 'high' as const
    }));

    recommendations.push({
      links: relatedLinks,
      reasoning: 'Related calculators based on statistical category and user workflow',
      placement: 'sidebar'
    });

    // Hub页面链接（导航）
    recommendations.push({
      links: [{
        href: '/tools',
        anchor: 'all statistical calculators',
        relevanceScore: 0.7,
        context: 'hub',
        priority: 'medium'
      }],
      reasoning: 'Navigation to tool hub for discovery',
      placement: 'header'
    });

    // 内容区域的深度链接
    const contentLinks = this.generateContentLinks(context.toolId, toolData);
    if (contentLinks.length > 0) {
      recommendations.push({
        links: contentLinks,
        reasoning: 'Contextual links within calculator content',
        placement: 'content'
      });
    }

    return recommendations;
  }

  /**
   * Hub页面的内链推荐
   */
  private getHubPageRecommendations(context: PageContext): LinkRecommendation[] {
    const recommendations: LinkRecommendation[] = [];

    // 推荐热门计算器
    const popularTools = ['mean', 'standard-deviation', 'gpa', 'weighted-mean'];
    const popularLinks = popularTools.map((toolId, index) => ({
      href: `/calculator/${toolId}`,
      anchor: TOOL_METADATA[toolId as keyof typeof TOOL_METADATA]?.name || toolId,
      relevanceScore: 0.8 - (index * 0.1),
      context: 'calculator' as const,
      priority: index < 2 ? 'high' as const : 'medium' as const
    }));

    recommendations.push({
      links: popularLinks,
      reasoning: 'Popular calculators for quick access',
      placement: 'content'
    });

    return recommendations;
  }

  /**
   * 工具详情页面的推荐
   */
  private getToolPageRecommendations(context: PageContext): LinkRecommendation[] {
    // 类似于计算器页面，但链接到实际计算器
    if (!context.toolId) return [];

    return [{
      links: [{
        href: `/calculator/${context.toolId}`,
        anchor: `Use ${TOOL_METADATA[context.toolId as keyof typeof TOOL_METADATA]?.name}`,
        relevanceScore: 1.0,
        context: 'calculator',
        priority: 'high'
      }],
      reasoning: 'Direct link to calculator functionality',
      placement: 'content'
    }];
  }

  /**
   * 主页的内链推荐
   */
  private getHomePageRecommendations(context: PageContext): LinkRecommendation[] {
    return [{
      links: [
        {
          href: '/tools',
          anchor: 'explore all calculators',
          relevanceScore: 0.9,
          context: 'hub',
          priority: 'high'
        },
        {
          href: '/calculator/mean',
          anchor: 'mean calculator',
          relevanceScore: 0.8,
          context: 'calculator',
          priority: 'high'
        },
        {
          href: '/calculator/standard-deviation',
          anchor: 'standard deviation calculator',
          relevanceScore: 0.7,
          context: 'calculator',
          priority: 'medium'
        }
      ],
      reasoning: 'Primary navigation and popular tools',
      placement: 'content'
    }];
  }

  /**
   * 生成内容中的上下文链接
   */
  private generateContentLinks(toolId: string, toolData: typeof TOOL_RELATIONSHIPS[keyof typeof TOOL_RELATIONSHIPS]): InternalLink[] {
    const links: InternalLink[] = [];

    // 基于关键词生成链接
    toolData.keywords.forEach((keyword, index) => {
      if (index < 2) { // 限制数量避免过度优化
        const relatedTool = toolData.related[0];
        if (relatedTool) {
          links.push({
            href: `/calculator/${relatedTool}`,
            anchor: `${keyword} with ${TOOL_METADATA[relatedTool as keyof typeof TOOL_METADATA]?.anchor}`,
            relevanceScore: 0.6,
            context: 'calculator',
            priority: 'low'
          });
        }
      }
    });

    return links;
  }

  /**
   * 分析页面链接分布
   */
  public analyzeLinkDistribution(links: InternalLink[]): {
    totalLinks: number;
    byContext: Record<string, number>;
    byPriority: Record<string, number>;
    averageRelevance: number;
    recommendations: string[];
  } {
    const byContext = links.reduce((acc, link) => {
      acc[link.context] = (acc[link.context] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const byPriority = links.reduce((acc, link) => {
      acc[link.priority] = (acc[link.priority] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const averageRelevance = links.length > 0 
      ? links.reduce((sum, link) => sum + link.relevanceScore, 0) / links.length
      : 0;

    const recommendations: string[] = [];

    // 生成优化建议
    if (links.length < 3) {
      recommendations.push('Consider adding more internal links to improve page connectivity');
    }
    if (links.length > 10) {
      recommendations.push('Too many links may dilute link equity - consider prioritizing');
    }
    if (averageRelevance < 0.5) {
      recommendations.push('Improve link relevance by focusing on related content');
    }
    if (!byContext.calculator) {
      recommendations.push('Add links to related calculators to improve user flow');
    }

    return {
      totalLinks: links.length,
      byContext,
      byPriority,
      averageRelevance,
      recommendations
    };
  }

  /**
   * 生成锚文本变体
   */
  public generateAnchorVariants(baseAnchor: string): string[] {
    const variants = [baseAnchor];
    
    // 添加修饰词变体
    const modifiers = ['free', 'online', 'accurate', 'easy'];
    modifiers.forEach(modifier => {
      variants.push(`${modifier} ${baseAnchor}`);
    });

    // 添加动作词变体
    const actions = ['calculate', 'compute', 'find'];
    actions.forEach(action => {
      if (!baseAnchor.includes(action)) {
        variants.push(`${action} ${baseAnchor.replace('calculator', '')}`);
      }
    });

    return variants;
  }

  /**
   * 验证链接质量
   */
  public validateLinkQuality(link: InternalLink): {
    isValid: boolean;
    issues: string[];
    suggestions: string[];
  } {
    const issues: string[] = [];
    const suggestions: string[] = [];

    // 检查锚文本质量
    if (link.anchor.length < 10) {
      issues.push('Anchor text too short - may not be descriptive enough');
      suggestions.push('Use more descriptive anchor text (10+ characters)');
    }
    if (link.anchor.length > 60) {
      issues.push('Anchor text too long - may appear spammy');
      suggestions.push('Shorten anchor text to under 60 characters');
    }

    // 检查相关性分数
    if (link.relevanceScore < 0.3) {
      issues.push('Low relevance score - link may not be contextually appropriate');
      suggestions.push('Ensure link is relevant to current page context');
    }

    // 检查URL格式
    if (!link.href.startsWith('/')) {
      issues.push('Internal link should use relative URLs');
      suggestions.push('Use relative URLs for internal links (start with /)');
    }

    return {
      isValid: issues.length === 0,
      issues,
      suggestions
    };
  }
}

// Utility functions for component usage
export function useInternalLinks(context: PageContext) {
  const optimizer = InternalLinkOptimizer.getInstance();
  
  return {
    recommendations: optimizer.generateRecommendations(context),
    analyzeDistribution: (links: InternalLink[]) => optimizer.analyzeLinkDistribution(links),
    validateLink: (link: InternalLink) => optimizer.validateLinkQuality(link),
    generateAnchors: (baseAnchor: string) => optimizer.generateAnchorVariants(baseAnchor)
  };
}

export default InternalLinkOptimizer;