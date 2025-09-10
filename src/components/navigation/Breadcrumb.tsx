/**
 * 面包屑导航组件
 * 基于智能内部链接系统提供层级导航和SEO优化
 * Features: 自动路径生成、结构化数据、可访问性、响应式设计
 */

'use client';

import React, { useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import { getPageInternalLinks, InternalLink, SITE_PAGES } from '@/lib/internalLinks';

// 面包屑项接口
export interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: React.ComponentType<{ className?: string }>;
  isCurrentPage?: boolean;
  seoTitle?: string;
}

// 面包屑组件属性
interface BreadcrumbProps {
  currentUrl: string;
  currentTitle?: string;
  customItems?: BreadcrumbItem[];
  showHomeIcon?: boolean;
  showSeparator?: boolean;
  separatorIcon?: React.ComponentType<{ className?: string }>;
  className?: string;
  itemClassName?: string;
  separatorClassName?: string;
  variant?: 'default' | 'compact' | 'minimal';
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

// 默认配置
const DEFAULT_SEPARATOR_ICON = ChevronRight;

// 路径解析器：根据URL路径生成面包屑项
function parseUrlPath(currentUrl: string, currentTitle?: string): BreadcrumbItem[] {
  const items: BreadcrumbItem[] = [];
  
  // 总是添加首页
  items.push({
    label: 'Home',
    href: '/',
    icon: Home,
    seoTitle: 'StatCal - Home'
  });

  // 解析URL段落
  const pathSegments = currentUrl.split('/').filter(Boolean);
  let accumulatedPath = '';

  for (let i = 0; i < pathSegments.length; i++) {
    const segment = pathSegments[i];
    accumulatedPath += `/${segment}`;
    const isLastSegment = i === pathSegments.length - 1;
    
    // 查找对应的页面配置
    const pageConfig = SITE_PAGES[accumulatedPath];
    
    if (pageConfig) {
      const label = isLastSegment && currentTitle ? currentTitle : getSegmentLabel(segment, pageConfig.title, isLastSegment);
      items.push({
        label: label,
        href: isLastSegment ? undefined : accumulatedPath,
        isCurrentPage: isLastSegment,
        seoTitle: pageConfig.title
      });
    } else {
      // 如果没有页面配置，使用段落名称
      const label = formatSegmentName(segment);
      items.push({
        label: isLastSegment && currentTitle ? currentTitle : label,
        href: isLastSegment ? undefined : accumulatedPath,
        isCurrentPage: isLastSegment,
        seoTitle: label
      });
    }
  }

  return items;
}

// 获取段落标签
function getSegmentLabel(segment: string, pageTitle: string, isLastSegment: boolean): string {
  // 对于最后一个段落，优先使用简化的页面标题
  if (isLastSegment) {
    return pageTitle.split('|')[0].trim();
  }
  
  // 对于中间段落，使用合适的标签
  const segmentLabels: Record<string, string> = {
    'calculator': 'Calculators',
    'calculators': 'Calculators',
    'hub': 'Hub',
    'guides': 'Guides',
    'help': 'Help',
    'about': 'About',
    'privacy': 'Privacy',
    'terms': 'Terms'
  };
  
  return segmentLabels[segment] || formatSegmentName(segment);
}

// 格式化段落名称
function formatSegmentName(segment: string): string {
  return segment
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

// 面包屑项组件
interface BreadcrumbItemComponentProps {
  item: BreadcrumbItem;
  index: number;
  isLast: boolean;
  variant: string;
  itemClassName?: string;
  onItemClick?: (item: BreadcrumbItem, index: number) => void;
}

const BreadcrumbItemComponent: React.FC<BreadcrumbItemComponentProps> = ({
  item,
  index,
  isLast,
  variant,
  itemClassName = '',
  onItemClick
}) => {
  const handleClick = useCallback(() => {
    if (onItemClick) {
      onItemClick(item, index);
    }
    
    // 发送面包屑点击事件到分析系统
    if (typeof window !== 'undefined' && item.href) {
      (window as any).gtag?.('event', 'breadcrumb_click', {
        event_category: 'Navigation',
        event_label: item.href,
        value: index + 1,
        custom_parameters: {
          breadcrumb_label: item.label,
          breadcrumb_position: index + 1,
          is_current_page: item.isCurrentPage || false
        }
      });
    }
  }, [item, index, onItemClick]);

  const getItemStyles = (variant: string, isLast: boolean) => {
    const baseStyles = "inline-flex items-center text-sm font-medium transition-colors duration-200";
    
    if (isLast) {
      return `${baseStyles} text-gray-900 dark:text-gray-100 cursor-default`;
    }
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 text-xs`;
      
      case 'minimal':
        return `${baseStyles} text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100`;
      
      default:
        return `${baseStyles} text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400`;
    }
  };

  const content = (
    <span className={`${getItemStyles(variant, isLast)} ${itemClassName}`}>
      {item.icon && index === 0 && (
        <item.icon className={`
          ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'} 
          ${variant === 'minimal' ? 'hidden' : 'mr-2'}
          flex-shrink-0
        `} />
      )}
      <span className={variant === 'compact' ? 'truncate max-w-20' : 'truncate max-w-32'}>
        {item.label}
      </span>
    </span>
  );

  if (item.href && !isLast) {
    return (
      <Link 
        href={item.href as any} 
        className="hover:no-underline focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 rounded"
        onClick={handleClick}
        title={item.seoTitle || item.label}
      >
        {content}
      </Link>
    );
  }

  return (
    <span 
      className="focus:outline-none"
      title={item.seoTitle || item.label}
      {...(isLast && { 'aria-current': 'page' })}
    >
      {content}
    </span>
  );
};

// 分隔符组件
interface BreadcrumbSeparatorProps {
  SeparatorIcon: React.ComponentType<{ className?: string }>;
  variant: string;
  separatorClassName?: string;
}

const BreadcrumbSeparator: React.FC<BreadcrumbSeparatorProps> = ({
  SeparatorIcon,
  variant,
  separatorClassName = ''
}) => (
  <SeparatorIcon 
    className={`
      ${variant === 'compact' ? 'h-3 w-3' : 'h-4 w-4'}
      text-gray-400 dark:text-gray-500 
      mx-2 flex-shrink-0
      ${separatorClassName}
    `}
  />
);

// 主面包屑组件
export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  currentUrl,
  currentTitle,
  customItems,
  showHomeIcon = true,
  showSeparator = true,
  separatorIcon: SeparatorIcon = DEFAULT_SEPARATOR_ICON,
  className = '',
  itemClassName = '',
  separatorClassName = '',
  variant = 'default',
  onItemClick
}) => {
  // 生成面包屑项
  const breadcrumbItems = useMemo(() => {
    if (customItems) {
      return customItems;
    }
    
    const items = parseUrlPath(currentUrl, currentTitle);
    
    // 如果不显示首页图标，移除图标
    if (!showHomeIcon && items.length > 0) {
      items[0] = { ...items[0], icon: undefined };
    }
    
    return items;
  }, [currentUrl, currentTitle, customItems, showHomeIcon]);

  // 获取容器样式
  const getContainerStyles = (variant: string) => {
    const baseStyles = "flex items-center space-x-1 overflow-hidden";
    
    switch (variant) {
      case 'compact':
        return `${baseStyles} text-xs py-1`;
      
      case 'minimal':
        return `${baseStyles} text-sm py-2`;
      
      default:
        return `${baseStyles} text-sm py-2`;
    }
  };

  // 如果只有首页，不显示面包屑
  if (breadcrumbItems.length <= 1 && currentUrl === '/') {
    return null;
  }

  return (
    <nav 
      className={`breadcrumb ${getContainerStyles(variant)} ${className}`}
      aria-label="Breadcrumb navigation"
      role="navigation"
    >
      <ol className="flex items-center space-x-1 w-full min-w-0">
        {breadcrumbItems.map((item, index) => (
          <React.Fragment key={`${item.href || 'current'}-${index}`}>
            <li className="flex items-center min-w-0">
              <BreadcrumbItemComponent
                item={item}
                index={index}
                isLast={index === breadcrumbItems.length - 1}
                variant={variant}
                itemClassName={itemClassName}
                onItemClick={onItemClick}
              />
            </li>
            
            {showSeparator && index < breadcrumbItems.length - 1 && (
              <li className="flex items-center" aria-hidden="true">
                <BreadcrumbSeparator
                  SeparatorIcon={SeparatorIcon}
                  variant={variant}
                  separatorClassName={separatorClassName}
                />
              </li>
            )}
          </React.Fragment>
        ))}
      </ol>
      
      {/* SEO友好的结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": breadcrumbItems
              .filter(item => item.href || item.isCurrentPage)
              .map((item, index) => ({
                "@type": "ListItem",
                "position": index + 1,
                "name": item.label,
                ...(item.href && { "item": `https://statcal.com${item.href}` })
              }))
          })
        }}
      />
    </nav>
  );
};

// 预设配置的便捷组件
export const CompactBreadcrumb: React.FC<Omit<BreadcrumbProps, 'variant'>> = (props) => (
  <Breadcrumb {...props} variant="compact" />
);

export const MinimalBreadcrumb: React.FC<Omit<BreadcrumbProps, 'variant'>> = (props) => (
  <Breadcrumb {...props} variant="minimal" />
);

// 工具函数：获取当前页面的面包屑数据
export function getBreadcrumbData(currentUrl: string, currentTitle?: string) {
  const items = parseUrlPath(currentUrl, currentTitle);
  
  return {
    items,
    depth: items.length,
    currentPageTitle: items[items.length - 1]?.label,
    parentPages: items.slice(0, -1),
    structuredData: {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList", 
      "itemListElement": items
        .filter(item => item.href || item.isCurrentPage)
        .map((item, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "name": item.label,
          ...(item.href && { "item": `https://statcal.com${item.href}` })
        }))
    }
  };
}

// 工具函数：检查面包屑配置的有效性
export function validateBreadcrumbConfig(items: BreadcrumbItem[]): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];

  // 检查面包屑深度
  if (items.length > 5) {
    warnings.push('Breadcrumb depth is too deep (>5 levels). Consider simplifying the navigation structure.');
  }

  if (items.length === 0) {
    warnings.push('Empty breadcrumb items array.');
  }

  // 检查标签长度
  items.forEach((item, index) => {
    if (item.label.length > 30) {
      suggestions.push(`Item ${index + 1} label is too long (${item.label.length} chars). Consider shortening for better UX.`);
    }
    
    if (!item.label.trim()) {
      warnings.push(`Item ${index + 1} has empty label.`);
    }
  });

  // 检查链接有效性
  const lastItem = items[items.length - 1];
  if (lastItem && lastItem.href) {
    suggestions.push('Last breadcrumb item should not have href (current page).');
  }

  // 检查首页链接
  const firstItem = items[0];
  if (firstItem && firstItem.href !== '/') {
    suggestions.push('First breadcrumb item should link to homepage (/).');
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}

export default Breadcrumb;
