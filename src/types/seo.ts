/**
 * SEO类型定义
 * 支持元数据管理、结构化数据、性能优化等SEO功能
 */

// 页面类型枚举
export enum PageType {
  HOME = 'home',
  CALCULATOR = 'calculator',
  HUB = 'hub',
  ABOUT = 'about',
  HELP = 'help'
}

// 工具类别
export enum ToolCategory {
  STATISTICS = 'statistics',
  MATHEMATICS = 'mathematics',
  ACADEMIC = 'academic',
  FINANCE = 'finance'
}

// SEO优先级
export enum SEOPriority {
  HIGH = 'high',
  MEDIUM = 'medium',
  LOW = 'low'
}

// 更新频率
export enum ChangeFrequency {
  ALWAYS = 'always',
  HOURLY = 'hourly',
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  YEARLY = 'yearly',
  NEVER = 'never'
}

// 站点地图URL配置
export interface SitemapUrl {
  url: string;
  lastModified?: Date;
  changeFrequency?: ChangeFrequency;
  priority?: number; // 0.0 - 1.0
}

// 内链配置
export interface InternalLink {
  url: string;
  anchorText: string;
  title?: string;
  rel?: string;
  context: string; // 链接出现的上下文
}

// 关键词分析结果
export interface KeywordAnalysis {
  keyword: string;
  density: number; // 关键词密度百分比
  frequency: number; // 出现次数
  prominence: number; // 显著性评分 (标题、H1等权重更高)
  recommendations: string[];
}

// SEO审核结果
export interface SEOAudit {
  score: number; // 总分 0-100
  issues: SEOIssue[];
  recommendations: string[];
  performance: {
    lighthouse: LighthouseScore;
    coreWebVitals: CoreWebVitals;
  };
}

export interface SEOIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  element?: string; // 相关的DOM元素
  fix?: string; // 修复建议
}

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
  pwa?: number;
}

export interface CoreWebVitals {
  lcp: number; // Largest Contentful Paint (ms)
  fid: number; // First Input Delay (ms)
  cls: number; // Cumulative Layout Shift
  fcp: number; // First Contentful Paint (ms)
  ttfb: number; // Time to First Byte (ms)
}

// 竞争对手分析
export interface CompetitorAnalysis {
  domain: string;
  title: string;
  description: string;
  keywords: string[];
  backlinks: number;
  domainAuthority: number;
  ranking: number; // 搜索排名位置
  strengths: string[];
  weaknesses: string[];
}

// 搜索结果数据
export interface SearchResult {
  query: string;
  position: number;
  url: string;
  title: string;
  description: string;
  clicks: number;
  impressions: number;
  ctr: number; // 点击率
  averagePosition: number;
}

// 语言和地区配置
export interface LocalizationConfig {
  language: string; // ISO 639-1 语言代码
  region: string; // ISO 3166-1 地区代码
  hreflang: string; // hreflang属性值
  url: string; // 该语言版本的URL
}

export default {
  PageType,
  ToolCategory,
  SEOPriority,
  ChangeFrequency
};