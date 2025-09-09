/**
 * 统一Hub页面组件
 * 提供所有统计工具的中央访问点
 * Features: 搜索、分类、筛选、推荐、个性化展示
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { Search, Filter, Star, Clock, Zap, BookOpen, TrendingUp } from 'lucide-react';
import { 
  StatisticalTool, 
  ToolCategory, 
  DifficultyLevel, 
  UsageFrequency,
  toolsDataManager,
  getToolDifficultyBadge,
  getToolCategoryColor 
} from '@/lib/toolsData';
import { Breadcrumb } from '@/components/navigation/Breadcrumb';
import { RelatedToolsRecommendation } from '@/components/navigation/RelatedToolsRecommendation';

// Hub页面配置
interface HubConfig {
  title: string;
  description: string;
  showBreadcrumb: boolean;
  showSearch: boolean;
  showFilters: boolean;
  showRecommendations: boolean;
  defaultView: 'grid' | 'list' | 'categories';
  featuredSection: boolean;
  recentSection: boolean;
}

// 筛选状态
interface FilterState {
  search: string;
  categories: ToolCategory[];
  difficulties: DifficultyLevel[];
  usages: UsageFrequency[];
  featured: boolean | undefined;
  beta: boolean | undefined;
  premium: boolean | undefined;
}

// Hub组件属性
interface UnifiedHubProps {
  config?: Partial<HubConfig>;
  className?: string;
  onToolClick?: (tool: StatisticalTool) => void;
}

// 默认配置
const DEFAULT_CONFIG: HubConfig = {
  title: 'Statistical Calculators Hub',
  description: 'Discover and access all our statistical analysis tools in one place',
  showBreadcrumb: true,
  showSearch: true,
  showFilters: true,
  showRecommendations: true,
  defaultView: 'categories',
  featuredSection: true,
  recentSection: true
};

// 工具卡片组件
interface ToolCardProps {
  tool: StatisticalTool;
  viewMode: 'grid' | 'list';
  onToolClick?: (tool: StatisticalTool) => void;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, viewMode, onToolClick }) => {
  const difficultyBadge = getToolDifficultyBadge(tool.difficulty);
  const categoryColor = getToolCategoryColor(tool.category);

  const handleClick = useCallback(() => {
    onToolClick?.(tool);
    
    // 发送工具点击事件到分析系统
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'tool_click', {
        event_category: 'Hub Navigation',
        event_label: tool.id,
        custom_parameters: {
          tool_name: tool.name,
          category: tool.category,
          difficulty: tool.difficulty,
          view_mode: viewMode
        }
      });
    }
  }, [tool, viewMode, onToolClick]);

  const cardStyles = viewMode === 'list' 
    ? "flex items-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all duration-200"
    : "p-6 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-lg hover:transform hover:scale-[1.02] transition-all duration-200";

  return (
    <Link href={tool.url} className="block group" onClick={handleClick}>
      <div className={cardStyles}>
        {viewMode === 'list' ? (
          // List View Layout
          <>
            <div className="flex-1 min-w-0">
              <div className="flex items-center space-x-3 mb-2">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 truncate">
                  {tool.name}
                </h3>
                <div className="flex items-center space-x-2">
                  {tool.featured && (
                    <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                  )}
                  {tool.beta && (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                      Beta
                    </span>
                  )}
                  {tool.premium && (
                    <Zap className="h-4 w-4 text-purple-500" />
                  )}
                </div>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                {tool.description}
              </p>
              <div className="flex items-center space-x-4 text-xs text-gray-500 dark:text-gray-400">
                <span className={`inline-flex items-center px-2 py-1 rounded-full bg-${difficultyBadge.color}-100 text-${difficultyBadge.color}-800 dark:bg-${difficultyBadge.color}-900 dark:text-${difficultyBadge.color}-200`}>
                  {difficultyBadge.label}
                </span>
                <span className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {tool.estimatedTime}
                </span>
                <span className="capitalize">{tool.category.replace('-', ' ')}</span>
              </div>
            </div>
            <div className="flex-shrink-0 ml-4">
              <TrendingUp className="h-6 w-6 text-gray-400 group-hover:text-blue-500 transition-colors" />
            </div>
          </>
        ) : (
          // Grid View Layout
          <>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900 flex items-center justify-center`}>
                <TrendingUp className={`h-6 w-6 text-${categoryColor}-600 dark:text-${categoryColor}-400`} />
              </div>
              <div className="flex items-center space-x-1">
                {tool.featured && (
                  <Star className="h-4 w-4 text-yellow-500" fill="currentColor" />
                )}
                {tool.beta && (
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200">
                    Beta
                  </span>
                )}
                {tool.premium && (
                  <Zap className="h-4 w-4 text-purple-500" />
                )}
              </div>
            </div>

            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 mb-2">
              {tool.name}
            </h3>
            
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
              {tool.description}
            </p>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className={`inline-flex items-center px-2 py-1 rounded-full bg-${difficultyBadge.color}-100 text-${difficultyBadge.color}-800 dark:bg-${difficultyBadge.color}-900 dark:text-${difficultyBadge.color}-200`}>
                  {difficultyBadge.label}
                </span>
                <span className="flex items-center text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3 mr-1" />
                  {tool.estimatedTime}
                </span>
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                <span className="capitalize">{tool.category.replace('-', ' ')}</span>
                <span className="capitalize">{tool.usage.replace('-', ' ')} usage</span>
              </div>
            </div>
          </>
        )}
      </div>
    </Link>
  );
};

// 分类区域组件
interface CategorySectionProps {
  category: ToolCategory;
  tools: StatisticalTool[];
  onToolClick?: (tool: StatisticalTool) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ category, tools, onToolClick }) => {
  const categoryMeta = toolsDataManager.getCategoryMeta(category);
  const categoryColor = getToolCategoryColor(category);

  if (tools.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center mb-6">
        <div className={`w-10 h-10 rounded-lg bg-${categoryColor}-100 dark:bg-${categoryColor}-900 flex items-center justify-center mr-4`}>
          <TrendingUp className={`h-5 w-5 text-${categoryColor}-600 dark:text-${categoryColor}-400`} />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {categoryMeta.name}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {categoryMeta.description}
          </p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {tools.map(tool => (
          <ToolCard
            key={tool.id}
            tool={tool}
            viewMode="grid"
            onToolClick={onToolClick}
          />
        ))}
      </div>
    </div>
  );
};

// 搜索和筛选组件
interface SearchFiltersProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  showFilters: boolean;
  showSearch?: boolean;
}

const SearchFilters: React.FC<SearchFiltersProps> = ({ filters, onFiltersChange, showFilters, showSearch = true }) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const handleSearchChange = useCallback((value: string) => {
    onFiltersChange({ ...filters, search: value });
  }, [filters, onFiltersChange]);

  const toggleCategory = useCallback((category: ToolCategory) => {
    const newCategories = filters.categories.includes(category)
      ? filters.categories.filter(c => c !== category)
      : [...filters.categories, category];
    onFiltersChange({ ...filters, categories: newCategories });
  }, [filters, onFiltersChange]);

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-6 mb-8">
      {/* Search Bar */}
      {showSearch && (
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search statistical tools..."
            value={filters.search}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100"
          />
        </div>
      )}

      {showFilters && (
        <>
          {/* Quick Filters */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.featured === true}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  featured: e.target.checked ? true : undefined 
                })}
                className="mr-2 rounded"
              />
              <Star className="h-4 w-4 text-yellow-500 mr-1" />
              Featured
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={filters.beta === true}
                onChange={(e) => onFiltersChange({ 
                  ...filters, 
                  beta: e.target.checked ? true : undefined 
                })}
                className="mr-2 rounded"
              />
              <span className="text-orange-600">Beta</span>
            </label>

            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              <Filter className="h-4 w-4 mr-1" />
              Advanced
            </button>
          </div>

          {/* Advanced Filters */}
          {showAdvancedFilters && (
            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Categories */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Categories</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {toolsDataManager.getAllCategories().map(category => (
                      <label key={category.id} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.categories.includes(category.id)}
                          onChange={() => toggleCategory(category.id)}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm">{category.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Difficulty */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Difficulty</h4>
                  <div className="space-y-2">
                    {Object.values(DifficultyLevel).map(difficulty => {
                      const badge = getToolDifficultyBadge(difficulty);
                      return (
                        <label key={difficulty} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={filters.difficulties.includes(difficulty)}
                            onChange={(e) => {
                              const newDifficulties = e.target.checked
                                ? [...filters.difficulties, difficulty]
                                : filters.difficulties.filter(d => d !== difficulty);
                              onFiltersChange({ ...filters, difficulties: newDifficulties });
                            }}
                            className="mr-2 rounded"
                          />
                          <span className="text-sm">{badge.label}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>

                {/* Usage Frequency */}
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Usage</h4>
                  <div className="space-y-2">
                    {Object.values(UsageFrequency).map(usage => (
                      <label key={usage} className="flex items-center">
                        <input
                          type="checkbox"
                          checked={filters.usages.includes(usage)}
                          onChange={(e) => {
                            const newUsages = e.target.checked
                              ? [...filters.usages, usage]
                              : filters.usages.filter(u => u !== usage);
                            onFiltersChange({ ...filters, usages: newUsages });
                          }}
                          className="mr-2 rounded"
                        />
                        <span className="text-sm capitalize">{usage.replace('-', ' ')}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// 主Hub组件
export const UnifiedHub: React.FC<UnifiedHubProps> = ({
  config: userConfig = {},
  className = '',
  onToolClick
}) => {
  const config = { ...DEFAULT_CONFIG, ...userConfig };
  
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    categories: [],
    difficulties: [],
    usages: [],
    featured: undefined,
    beta: undefined,
    premium: undefined
  });

  const [viewMode, setViewMode] = useState<'grid' | 'list' | 'categories'>(config.defaultView);

  // 过滤工具
  const filteredTools = useMemo(() => {
    return toolsDataManager.filterTools(filters);
  }, [filters]);

  // 特色工具
  const featuredTools = useMemo(() => {
    return toolsDataManager.getFeaturedTools();
  }, []);

  // 按分类分组工具
  const toolsByCategory = useMemo(() => {
    const grouped: Record<ToolCategory, StatisticalTool[]> = {} as Record<ToolCategory, StatisticalTool[]>;
    
    toolsDataManager.getAllCategories().forEach(category => {
      grouped[category.id] = filteredTools.filter(tool => tool.category === category.id);
    });
    
    return grouped;
  }, [filteredTools]);

  // 统计信息
  const stats = useMemo(() => toolsDataManager.getToolStats(), []);

  return (
    <div className={`unified-hub ${className}`}>
      {/* Breadcrumb */}
      {config.showBreadcrumb && (
        <Breadcrumb currentUrl="/hub" className="mb-6" />
      )}

      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              {config.title}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mb-4">
              {config.description}
            </p>
            <div className="flex items-center space-x-6 text-sm text-gray-500 dark:text-gray-400">
              <span>{stats.totalTools} tools available</span>
              <span>{stats.featuredTools} featured</span>
              <span>{stats.betaTools} in beta</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setViewMode('categories')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'categories' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              Categories
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              Grid
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                viewMode === 'list' 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100'
              }`}
            >
              List
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      {(config.showSearch || config.showFilters) && (
        <SearchFilters
          filters={filters}
          onFiltersChange={setFilters}
          showFilters={config.showFilters}
          showSearch={config.showSearch}
        />
      )}

      {/* Featured Tools Section - Only show in grid/list view or if we have filtered results */}
      {config.featuredSection && featuredTools.length > 0 && (viewMode !== 'categories' || filters.search || filters.categories.length > 0 || filters.featured === true) && (
        <div className="mb-12">
          <div className="flex items-center mb-6">
            <Star className="h-6 w-6 text-yellow-500 mr-2" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Featured Tools
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredTools.slice(0, 6).map(tool => (
              <ToolCard
                key={tool.id}
                tool={tool}
                viewMode="grid"
                onToolClick={onToolClick}
              />
            ))}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="mb-12">
        {viewMode === 'categories' ? (
          // Category View
          <div>
            {toolsDataManager.getAllCategories().map(category => (
              <CategorySection
                key={category.id}
                category={category.id}
                tools={toolsByCategory[category.id]}
                onToolClick={onToolClick}
              />
            ))}
          </div>
        ) : (
          // Grid/List View
          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                All Tools ({filteredTools.length})
              </h2>
            </div>
            
            {filteredTools.length === 0 ? (
              <div className="text-center py-12">
                <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  No tools found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Try adjusting your search or filters to find more tools.
                </p>
              </div>
            ) : (
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
                  : 'space-y-4'
              }>
                {filteredTools.map(tool => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    viewMode={viewMode}
                    onToolClick={onToolClick}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Recommendations */}
      {config.showRecommendations && (
        <div className="mb-8">
          <RelatedToolsRecommendation 
            currentUrl="/hub"
            variant="card"
            config={{
              maxRecommendations: 4,
              customTitle: 'You Might Also Like',
              customDescription: 'Discover more statistical tools based on popular combinations'
            }}
          />
        </div>
      )}
    </div>
  );
};

export default UnifiedHub;