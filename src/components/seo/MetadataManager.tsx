/**
 * MetadataManager Component
 * 动态页面元数据管理，支持SEO优化和多语言
 * Features: 动态标题生成、关键词优化、Open Graph、Twitter Card
 */

'use client';

import { Metadata } from 'next';
import { usePathname } from 'next/navigation';

// SEO配置接口
export interface SEOConfig {
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  openGraph?: OpenGraphConfig;
  twitterCard?: TwitterCardConfig;
  robots?: RobotsConfig;
  alternates?: AlternatesConfig;
}

export interface OpenGraphConfig {
  title?: string;
  description?: string;
  type?: 'website' | 'article' | 'product';
  siteName?: string;
  url?: string;
  images?: Array<{
    url: string;
    width?: number;
    height?: number;
    alt?: string;
  }>;
  locale?: string;
}

export interface TwitterCardConfig {
  card?: 'summary' | 'summary_large_image' | 'app' | 'player';
  site?: string;
  creator?: string;
  title?: string;
  description?: string;
  images?: string[];
}

export interface RobotsConfig {
  index?: boolean;
  follow?: boolean;
  noarchive?: boolean;
  nosnippet?: boolean;
  noimageindex?: boolean;
}

export interface AlternatesConfig {
  canonical?: string;
  languages?: Record<string, string>;
}

// 工具特定的SEO配置
export const TOOL_SEO_CONFIGS: Record<string, SEOConfig> = {
  'mean': {
    title: 'Mean Calculator | Calculate Average Online - StatCal',
    description: 'Free online mean calculator. Calculate arithmetic mean, average of numbers instantly. Perfect for students, researchers, and data analysts.',
    keywords: [
      'mean calculator',
      'average calculator', 
      'arithmetic mean',
      'calculate mean online',
      'statistics calculator',
      'data analysis tool'
    ],
    openGraph: {
      title: 'Mean Calculator - Calculate Average Online',
      description: 'Free online tool to calculate arithmetic mean and average of numbers instantly.',
      type: 'website',
      siteName: 'StatCal - Statistical Calculators'
    },
    twitterCard: {
      card: 'summary',
      title: 'Mean Calculator - StatCal',
      description: 'Calculate arithmetic mean and average online for free.'
    }
  },
  
  'standard-deviation': {
    title: 'Standard Deviation Calculator | Population & Sample SD - StatCal',
    description: 'Calculate standard deviation online for population and sample data. Free statistical tool with step-by-step explanations and visualization.',
    keywords: [
      'standard deviation calculator',
      'population standard deviation',
      'sample standard deviation',
      'statistics calculator',
      'variance calculator',
      'statistical analysis'
    ],
    openGraph: {
      title: 'Standard Deviation Calculator - Population & Sample',
      description: 'Free online standard deviation calculator with explanations and charts.',
      type: 'website'
    },
    twitterCard: {
      card: 'summary',
      title: 'Standard Deviation Calculator',
      description: 'Calculate population and sample standard deviation online.'
    }
  },
  
  'gpa': {
    title: 'GPA Calculator | Grade Point Average Calculator - StatCal',
    description: 'Calculate your GPA with multiple grading systems (4.0, 4.3, 4.5). Support for custom grading scales, batch processing, and academic analysis.',
    keywords: [
      'GPA calculator',
      'grade point average',
      'GPA calculation',
      'academic calculator',
      '4.0 scale calculator',
      'college GPA calculator',
      'university grade calculator'
    ],
    openGraph: {
      title: 'GPA Calculator - Multiple Grading Systems Supported',
      description: 'Calculate your Grade Point Average with 4.0, 4.3, 4.5 and custom grading systems.',
      type: 'website'
    },
    twitterCard: {
      card: 'summary',
      title: 'GPA Calculator - StatCal',
      description: 'Calculate GPA with multiple grading systems support.'
    }
  }
};

// 默认SEO配置
export const DEFAULT_SEO_CONFIG: SEOConfig = {
  title: 'StatCal - Free Online Statistical Calculators',
  description: 'Free online statistical calculators for mean, standard deviation, GPA, and more. Perfect for students, researchers, and data analysts.',
  keywords: [
    'statistical calculators',
    'online statistics',
    'data analysis tools',
    'free calculators',
    'math calculators',
    'statistical analysis'
  ],
  openGraph: {
    title: 'StatCal - Statistical Calculators',
    description: 'Free online statistical calculators for data analysis and research.',
    type: 'website',
    siteName: 'StatCal'
  },
  twitterCard: {
    card: 'summary',
    title: 'StatCal - Statistical Calculators',
    description: 'Free online tools for statistical analysis and calculations.'
  },
  robots: {
    index: true,
    follow: true
  }
};

// MetadataManager类
export class MetadataManager {
  private static instance: MetadataManager;
  private baseUrl: string = 'https://statcal.com';
  
  private constructor() {}
  
  public static getInstance(): MetadataManager {
    if (!MetadataManager.instance) {
      MetadataManager.instance = new MetadataManager();
    }
    return MetadataManager.instance;
  }
  
  /**
   * 生成完整的页面元数据
   */
  public generateMetadata(toolId?: string, customConfig?: Partial<SEOConfig>): Metadata {
    const config = this.mergeConfigs(toolId, customConfig);
    
    return {
      title: config.title,
      description: config.description,
      keywords: config.keywords.join(', '),
      
      // Robots设置
      robots: {
        index: config.robots?.index ?? true,
        follow: config.robots?.follow ?? true,
        noarchive: config.robots?.noarchive,
        nosnippet: config.robots?.nosnippet,
        noimageindex: config.robots?.noimageindex
      },
      
      // Open Graph
      openGraph: {
        title: config.openGraph?.title || config.title,
        description: config.openGraph?.description || config.description,
        type: config.openGraph?.type || 'website',
        siteName: config.openGraph?.siteName || 'StatCal',
        url: config.openGraph?.url || this.generateCanonicalUrl(toolId),
        images: config.openGraph?.images || [{
          url: `${this.baseUrl}/og-image-${toolId || 'default'}.png`,
          width: 1200,
          height: 630,
          alt: config.openGraph?.title || config.title
        }],
        locale: config.openGraph?.locale || 'en_US'
      },
      
      // Twitter Card
      twitter: {
        card: config.twitterCard?.card || 'summary_large_image',
        site: config.twitterCard?.site || '@StatCal',
        creator: config.twitterCard?.creator || '@StatCal',
        title: config.twitterCard?.title || config.title,
        description: config.twitterCard?.description || config.description,
        images: config.twitterCard?.images || [`${this.baseUrl}/twitter-image-${toolId || 'default'}.png`]
      },
      
      // Canonical URL
      alternates: {
        canonical: config.alternates?.canonical || this.generateCanonicalUrl(toolId),
        languages: config.alternates?.languages
      },
      
      // 额外的meta标签
      other: {
        'theme-color': '#3b82f6',
        'color-scheme': 'light',
        'format-detection': 'telephone=no'
      }
    };
  }
  
  /**
   * 生成优化的页面标题
   */
  public generateOptimizedTitle(toolName: string, action: string = 'Calculator'): string {
    const brandSuffix = '- StatCal';
    const maxLength = 60; // Google建议的标题长度
    
    let title = `${toolName} ${action}`;
    
    // 添加关键词优化
    const keywordMap: Record<string, string> = {
      'Mean': 'Mean Calculator | Calculate Average Online',
      'Standard Deviation': 'Standard Deviation Calculator | Population & Sample SD',
      'GPA': 'GPA Calculator | Grade Point Average Calculator'
    };
    
    const optimizedTitle = keywordMap[toolName] || title;
    
    // 检查长度并添加品牌名
    const fullTitle = `${optimizedTitle} ${brandSuffix}`;
    
    return fullTitle.length <= maxLength ? fullTitle : optimizedTitle;
  }
  
  /**
   * 生成优化的页面描述
   */
  public generateOptimizedDescription(toolName: string, features: string[] = []): string {
    const maxLength = 160; // Google建议的描述长度
    
    const descriptionTemplates: Record<string, string> = {
      'Mean': 'Free online mean calculator. Calculate arithmetic mean, average of numbers instantly.',
      'Standard Deviation': 'Calculate standard deviation online for population and sample data with explanations.',
      'GPA': 'Calculate your GPA with multiple grading systems (4.0, 4.3, 4.5) and custom scales.'
    };
    
    let description = descriptionTemplates[toolName] || `Free online ${toolName.toLowerCase()} calculator.`;
    
    // 添加特性描述
    if (features.length > 0) {
      const featureText = ` Features: ${features.join(', ')}.`;
      if ((description + featureText).length <= maxLength) {
        description += featureText;
      }
    }
    
    // 添加目标用户
    const suffix = ' Perfect for students, researchers, and data analysts.';
    if ((description + suffix).length <= maxLength) {
      description += suffix;
    }
    
    return description;
  }
  
  /**
   * 生成关键词列表
   */
  public generateKeywords(toolName: string, additionalKeywords: string[] = []): string[] {
    const baseKeywords = [
      `${toolName.toLowerCase()} calculator`,
      'online calculator',
      'free calculator',
      'statistics calculator',
      'mathematical calculator'
    ];
    
    const toolSpecificKeywords: Record<string, string[]> = {
      'Mean': ['average calculator', 'arithmetic mean', 'calculate mean online'],
      'Standard Deviation': ['population standard deviation', 'sample standard deviation', 'variance calculator'],
      'GPA': ['grade point average', 'GPA calculation', 'academic calculator', 'college GPA']
    };
    
    return [
      ...baseKeywords,
      ...(toolSpecificKeywords[toolName] || []),
      ...additionalKeywords
    ];
  }
  
  /**
   * 合并配置
   */
  private mergeConfigs(toolId?: string, customConfig?: Partial<SEOConfig>): SEOConfig {
    const baseConfig = toolId ? TOOL_SEO_CONFIGS[toolId] || DEFAULT_SEO_CONFIG : DEFAULT_SEO_CONFIG;
    
    if (!customConfig) return baseConfig;
    
    return {
      ...baseConfig,
      ...customConfig,
      keywords: [...baseConfig.keywords, ...(customConfig.keywords || [])],
      openGraph: {
        ...baseConfig.openGraph,
        ...customConfig.openGraph
      },
      twitterCard: {
        ...baseConfig.twitterCard,
        ...customConfig.twitterCard
      },
      robots: {
        ...baseConfig.robots,
        ...customConfig.robots
      }
    };
  }
  
  /**
   * 生成规范URL
   */
  private generateCanonicalUrl(toolId?: string): string {
    if (!toolId) return this.baseUrl;
    return `${this.baseUrl}/calculator/${toolId}`;
  }
  
  /**
   * 验证SEO配置
   */
  public validateSEOConfig(config: SEOConfig): {
    isValid: boolean;
    warnings: string[];
    errors: string[];
  } {
    const warnings: string[] = [];
    const errors: string[] = [];
    
    // 标题长度检查
    if (config.title.length > 60) {
      warnings.push(`Title too long: ${config.title.length} characters (recommended: ≤60)`);
    } else if (config.title.length < 30) {
      warnings.push(`Title too short: ${config.title.length} characters (recommended: ≥30)`);
    }
    
    // 描述长度检查
    if (config.description.length > 160) {
      warnings.push(`Description too long: ${config.description.length} characters (recommended: ≤160)`);
    } else if (config.description.length < 120) {
      warnings.push(`Description too short: ${config.description.length} characters (recommended: ≥120)`);
    }
    
    // 关键词检查
    if (config.keywords.length < 3) {
      warnings.push(`Too few keywords: ${config.keywords.length} (recommended: ≥3)`);
    } else if (config.keywords.length > 10) {
      warnings.push(`Too many keywords: ${config.keywords.length} (recommended: ≤10)`);
    }
    
    // 必填字段检查
    if (!config.title) errors.push('Title is required');
    if (!config.description) errors.push('Description is required');
    if (!config.keywords || config.keywords.length === 0) {
      errors.push('Keywords are required');
    }
    
    return {
      isValid: errors.length === 0,
      warnings,
      errors
    };
  }
}

// Hook for using MetadataManager
export function useMetadataManager() {
  const pathname = usePathname();
  const manager = MetadataManager.getInstance();
  
  // 从路径中提取工具ID
  const getToolIdFromPath = (path: string): string | undefined => {
    const match = path.match(/\/calculator\/([^\/]+)/);
    return match ? match[1] : undefined;
  };
  
  const toolId = getToolIdFromPath(pathname);
  
  return {
    manager,
    toolId,
    generateMetadata: (customConfig?: Partial<SEOConfig>) => 
      manager.generateMetadata(toolId, customConfig),
    validateConfig: (config: SEOConfig) => manager.validateSEOConfig(config)
  };
}

export default MetadataManager;