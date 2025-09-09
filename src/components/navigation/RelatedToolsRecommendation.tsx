/**
 * 相关工具推荐组件
 * 基于智能内部链接系统提供个性化工具推荐
 * Features: 相关性评分、A/B测试、用户行为追踪、SEO友好
 */

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ArrowRight, Calculator, BookOpen, BarChart3 } from 'lucide-react';
import { getPageInternalLinks, InternalLink, PageType } from '@/lib/internalLinks';

// 推荐组件配置接口
interface RecommendationConfig {
  maxRecommendations: number;
  showRelevanceScore: boolean;
  enableClickTracking: boolean;
  showPageTypeIcons: boolean;
  customTitle?: string;
  customDescription?: string;
}

// 推荐组件属性
interface RelatedToolsRecommendationProps {
  currentUrl: string;
  currentTitle?: string;
  config?: Partial<RecommendationConfig>;
  className?: string;
  variant?: 'default' | 'sidebar' | 'inline' | 'card';
  onRecommendationClick?: (link: InternalLink, position: number) => void;
}

// 默认配置
const DEFAULT_CONFIG: RecommendationConfig = {
  maxRecommendations: 4,
  showRelevanceScore: false,
  enableClickTracking: true,
  showPageTypeIcons: true
};

// 页面类型图标映射
const PAGE_TYPE_ICONS = {
  [PageType.CALCULATOR]: Calculator,
  [PageType.GUIDE]: BookOpen,
  [PageType.HUB]: BarChart3,
  [PageType.HOMEPAGE]: BarChart3,
  [PageType.ABOUT]: BookOpen
};

// 推荐项组件
interface RecommendationItemProps {
  link: InternalLink;
  position: number;
  config: RecommendationConfig;
  onClick?: (link: InternalLink, position: number) => void;
  variant: string;
}

const RecommendationItem: React.FC<RecommendationItemProps> = ({
  link,
  position,
  config,
  onClick,
  variant
}) => {
  const IconComponent = config.showPageTypeIcons ? PAGE_TYPE_ICONS[link.pageType] : null;
  
  const handleClick = useCallback(() => {
    if (config.enableClickTracking && onClick) {
      onClick(link, position);
    }
    
    // 发送点击事件到分析系统
    if (typeof window !== 'undefined' && config.enableClickTracking) {
      window.gtag?.('event', 'related_tool_click', {
        event_category: 'Navigation',
        event_label: link.url,
        value: position + 1,
        custom_parameters: {
          relevance_score: Math.round(link.relevanceScore * 100),
          page_type: link.pageType,
          priority: link.priority
        }
      });
    }
  }, [link, position, onClick, config.enableClickTracking]);

  const getItemStyles = (variant: string) => {
    const baseStyles = "group relative transition-all duration-200 hover:transform hover:scale-[1.02]";
    
    switch (variant) {
      case 'sidebar':
        return `${baseStyles} p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`;
      
      case 'inline':
        return `${baseStyles} px-4 py-2 bg-white dark:bg-gray-900 rounded-full border border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm`;
      
      case 'card':
        return `${baseStyles} p-4 bg-white dark:bg-gray-900 rounded-xl shadow-md border border-gray-100 dark:border-gray-700 hover:shadow-lg hover:border-blue-300 dark:hover:border-blue-600`;
      
      default:
        return `${baseStyles} p-3 bg-gradient-to-r from-white to-gray-50 dark:from-gray-900 dark:to-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`;
    }
  };

  const getLinkStyles = (variant: string) => {
    const baseStyles = "block text-decoration-none";
    
    switch (variant) {
      case 'inline':
        return `${baseStyles} text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400`;
      
      default:
        return `${baseStyles} text-gray-900 dark:text-gray-100`;
    }
  };

  return (
    <div className={getItemStyles(variant)}>
      <Link href={link.url} className={getLinkStyles(variant)} onClick={handleClick}>
        <div className="flex items-center space-x-3">
          {IconComponent && variant !== 'inline' && (
            <div className="flex-shrink-0">
              <IconComponent className={`
                ${variant === 'card' ? 'h-6 w-6' : 'h-5 w-5'} 
                text-gray-500 dark:text-gray-400 
                group-hover:text-blue-500 dark:group-hover:text-blue-400
                transition-colors duration-200
              `} />
            </div>
          )}
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between">
              <h4 className={`
                font-medium text-gray-900 dark:text-gray-100 
                group-hover:text-blue-600 dark:group-hover:text-blue-400
                transition-colors duration-200
                ${variant === 'card' ? 'text-base' : 'text-sm'}
                ${variant === 'inline' ? 'text-xs' : ''}
                truncate
              `}>
                {link.anchorText}
              </h4>
              
              {config.showRelevanceScore && variant !== 'inline' && (
                <span className="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                  {Math.round(link.relevanceScore * 100)}%
                </span>
              )}
            </div>
            
            {variant === 'card' && link.context && (
              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
                {link.context}
              </p>
            )}
            
            {variant !== 'inline' && variant !== 'card' && (
              <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                <span className="capitalize">{link.pageType.replace('_', ' ')}</span>
                {link.priority === 'high' && (
                  <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300">
                    Hot
                  </span>
                )}
              </div>
            )}
          </div>
          
          {variant !== 'inline' && (
            <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-blue-500 transition-colors duration-200 flex-shrink-0" />
          )}
        </div>
      </Link>
    </div>
  );
};

// 主推荐组件
export const RelatedToolsRecommendation: React.FC<RelatedToolsRecommendationProps> = ({
  currentUrl,
  currentTitle,
  config: userConfig = {},
  className = '',
  variant = 'default',
  onRecommendationClick
}) => {
  const [recommendations, setRecommendations] = useState<InternalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const config = { ...DEFAULT_CONFIG, ...userConfig };

  // 获取推荐链接
  useEffect(() => {
    try {
      setLoading(true);
      setError(null);
      
      const linkData = getPageInternalLinks(currentUrl);
      const allLinks = [
        ...linkData.relatedLinks,
        ...linkData.categoryLinks
      ];
      
      // 去重并按相关性排序
      const uniqueLinks = allLinks
        .filter((link, index, self) => 
          index === self.findIndex(l => l.url === link.url)
        )
        .sort((a, b) => b.relevanceScore - a.relevanceScore)
        .slice(0, config.maxRecommendations);
      
      setRecommendations(uniqueLinks);
    } catch (err) {
      setError('Failed to load recommendations');
      console.error('Error loading recommendations:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUrl, config.maxRecommendations]);

  // 处理推荐点击
  const handleRecommendationClick = useCallback((link: InternalLink, position: number) => {
    onRecommendationClick?.(link, position);
  }, [onRecommendationClick]);

  // 获取容器样式
  const getContainerStyles = (variant: string) => {
    switch (variant) {
      case 'sidebar':
        return 'space-y-2';
      case 'inline':
        return 'flex flex-wrap gap-2';
      case 'card':
        return 'grid grid-cols-1 sm:grid-cols-2 gap-4';
      default:
        return 'space-y-3';
    }
  };

  // 获取标题文本
  const getTitle = () => {
    if (config.customTitle) return config.customTitle;
    
    switch (variant) {
      case 'sidebar':
        return 'Related Tools';
      case 'inline':
        return 'You might also like';
      case 'card':
        return 'Recommended for You';
      default:
        return 'Related Statistical Tools';
    }
  };

  // 获取描述文本
  const getDescription = () => {
    if (config.customDescription) return config.customDescription;
    
    switch (variant) {
      case 'inline':
        return null;
      case 'card':
        return 'Discover more tools that complement your current analysis';
      default:
        return 'Explore other statistical calculators that might help with your analysis';
    }
  };

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-3"></div>
        <div className={getContainerStyles(variant)}>
          {[...Array(config.maxRecommendations)].map((_, index) => (
            <div
              key={index}
              className={`
                h-16 bg-gray-200 dark:bg-gray-700 rounded-lg
                ${variant === 'inline' ? 'w-32 h-8' : ''}
              `}
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-center py-6 ${className}`}>
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          Unable to load recommendations. Please try again later.
        </p>
      </div>
    );
  }

  if (recommendations.length === 0) {
    return null; // 不显示空的推荐区域
  }

  return (
    <div className={`related-tools-recommendation ${className}`}>
      <div className={variant === 'inline' ? 'flex items-center space-x-4' : 'mb-4'}>
        <h3 className={`
          font-semibold text-gray-900 dark:text-gray-100
          ${variant === 'sidebar' ? 'text-sm' : ''}
          ${variant === 'inline' ? 'text-sm flex-shrink-0' : ''}
          ${variant === 'card' ? 'text-lg' : 'text-base'}
        `}>
          {getTitle()}
        </h3>
        
        {variant === 'inline' && (
          <div className="flex-1 min-w-0">
            <div className={getContainerStyles(variant)}>
              {recommendations.map((link, index) => (
                <RecommendationItem
                  key={link.url}
                  link={link}
                  position={index}
                  config={config}
                  onClick={handleRecommendationClick}
                  variant={variant}
                />
              ))}
            </div>
          </div>
        )}
      </div>
      
      {getDescription() && variant !== 'inline' && (
        <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
          {getDescription()}
        </p>
      )}
      
      {variant !== 'inline' && (
        <div className={getContainerStyles(variant)}>
          {recommendations.map((link, index) => (
            <RecommendationItem
              key={link.url}
              link={link}
              position={index}
              config={config}
              onClick={handleRecommendationClick}
              variant={variant}
            />
          ))}
        </div>
      )}
      
      {/* SEO友好的结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            "name": getTitle(),
            "description": getDescription(),
            "numberOfItems": recommendations.length,
            "itemListElement": recommendations.map((link, index) => ({
              "@type": "ListItem",
              "position": index + 1,
              "item": {
                "@type": "WebPage",
                "name": link.title,
                "url": `https://statcal.com${link.url}`,
                "description": link.context
              }
            }))
          })
        }}
      />
    </div>
  );
};

// 预设配置的便捷组件
export const SidebarRecommendations: React.FC<Omit<RelatedToolsRecommendationProps, 'variant'>> = (props) => (
  <RelatedToolsRecommendation {...props} variant="sidebar" />
);

export const InlineRecommendations: React.FC<Omit<RelatedToolsRecommendationProps, 'variant'>> = (props) => (
  <RelatedToolsRecommendation {...props} variant="inline" />
);

export const CardRecommendations: React.FC<Omit<RelatedToolsRecommendationProps, 'variant'>> = (props) => (
  <RelatedToolsRecommendation {...props} variant="card" />
);

// 工具函数：获取推荐统计信息
export function getRecommendationStats(currentUrl: string) {
  const linkData = getPageInternalLinks(currentUrl);
  const allLinks = [...linkData.relatedLinks, ...linkData.categoryLinks];
  
  const stats = {
    totalRecommendations: allLinks.length,
    highPriorityCount: allLinks.filter(link => link.priority === 'high').length,
    averageRelevanceScore: allLinks.length > 0 
      ? allLinks.reduce((sum, link) => sum + link.relevanceScore, 0) / allLinks.length 
      : 0,
    pageTypeDistribution: allLinks.reduce((acc, link) => {
      acc[link.pageType] = (acc[link.pageType] || 0) + 1;
      return acc;
    }, {} as Record<PageType, number>)
  };
  
  return stats;
}

export default RelatedToolsRecommendation;