/**
 * 高级搜索和筛选组件
 * 提供强大的搜索、筛选和排序功能
 * Features: 实时搜索、多维度筛选、智能建议、搜索历史
 */

'use client';

import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Search, X, Filter, ArrowUpDown, Clock, Star, Zap } from 'lucide-react';
import {
  StatisticalTool,
  ToolCategory,
  DifficultyLevel,
  UsageFrequency,
  toolsDataManager,
  getToolDifficultyBadge,
  getToolCategoryColor
} from '@/lib/toolsData';

// 搜索建议接口
interface SearchSuggestion {
  type: 'tool' | 'category' | 'keyword';
  text: string;
  description?: string;
  data?: any;
}

// 搜索历史接口
interface SearchHistoryItem {
  query: string;
  timestamp: Date;
  resultsCount: number;
}

// 排序选项
export enum SortOption {
  RELEVANCE = 'relevance',
  NAME = 'name',
  DIFFICULTY = 'difficulty',
  USAGE = 'usage',
  LAST_UPDATED = 'lastUpdated'
}

// 筛选状态接口
export interface SearchFilters {
  query: string;
  categories: ToolCategory[];
  difficulties: DifficultyLevel[];
  usages: UsageFrequency[];
  featured: boolean | undefined;
  beta: boolean | undefined;
  premium: boolean | undefined;
  sortBy: SortOption;
  sortDirection: 'asc' | 'desc';
}

// 搜索结果接口
export interface SearchResults {
  tools: StatisticalTool[];
  totalCount: number;
  filteredCount: number;
  searchTime: number;
  suggestions: SearchSuggestion[];
}

// 组件属性
interface AdvancedSearchProps {
  initialFilters?: Partial<SearchFilters>;
  placeholder?: string;
  showFilters?: boolean;
  showSorting?: boolean;
  showSuggestions?: boolean;
  showHistory?: boolean;
  maxSuggestions?: number;
  maxHistory?: number;
  onFiltersChange?: (filters: SearchFilters) => void;
  onResults?: (results: SearchResults) => void;
  className?: string;
}

// 默认筛选状态
const DEFAULT_FILTERS: SearchFilters = {
  query: '',
  categories: [],
  difficulties: [],
  usages: [],
  featured: undefined,
  beta: undefined,
  premium: undefined,
  sortBy: SortOption.RELEVANCE,
  sortDirection: 'desc'
};

// 搜索引擎类
class SearchEngine {
  private tools: StatisticalTool[];
  private searchIndex: Map<string, Set<string>>;

  constructor() {
    this.tools = toolsDataManager.getAllTools();
    this.searchIndex = this.buildSearchIndex();
  }

  // 构建搜索索引
  private buildSearchIndex(): Map<string, Set<string>> {
    const index = new Map<string, Set<string>>();

    this.tools.forEach(tool => {
      const tokens = this.tokenize([
        tool.name,
        tool.description,
        tool.longDescription || '',
        ...tool.tags,
        ...tool.keywords,
        tool.category.replace('-', ' ')
      ].join(' '));

      tokens.forEach(token => {
        if (!index.has(token)) {
          index.set(token, new Set());
        }
        index.get(token)!.add(tool.id);
      });
    });

    return index;
  }

  // 文本分词
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 1);
  }

  // 计算相关性评分
  private calculateRelevance(tool: StatisticalTool, query: string): number {
    if (!query) return 1;

    const queryTokens = this.tokenize(query);
    let score = 0;

    // 名称匹配 (权重: 3)
    const nameMatch = queryTokens.some(token => 
      tool.name.toLowerCase().includes(token)
    );
    if (nameMatch) score += 3;

    // 描述匹配 (权重: 2)
    const descMatch = queryTokens.some(token => 
      tool.description.toLowerCase().includes(token)
    );
    if (descMatch) score += 2;

    // 标签匹配 (权重: 2)
    const tagMatch = queryTokens.some(token => 
      tool.tags.some(tag => tag.toLowerCase().includes(token))
    );
    if (tagMatch) score += 2;

    // 关键词匹配 (权重: 1.5)
    const keywordMatch = queryTokens.some(token => 
      tool.keywords.some(keyword => keyword.toLowerCase().includes(token))
    );
    if (keywordMatch) score += 1.5;

    // 分类匹配 (权重: 1)
    const categoryMatch = queryTokens.some(token => 
      tool.category.toLowerCase().includes(token)
    );
    if (categoryMatch) score += 1;

    // 使用频率加分
    const usageBonus = {
      [UsageFrequency.VERY_HIGH]: 0.3,
      [UsageFrequency.HIGH]: 0.2,
      [UsageFrequency.MEDIUM]: 0.1,
      [UsageFrequency.LOW]: 0
    };
    score += usageBonus[tool.usage];

    // 特色工具加分
    if (tool.featured) score += 0.2;

    return score;
  }

  // 搜索工具
  search(filters: SearchFilters): SearchResults {
    const startTime = performance.now();

    let results = this.tools;

    // 应用文本搜索
    if (filters.query) {
      results = results.filter(tool => {
        const relevance = this.calculateRelevance(tool, filters.query);
        (tool as any).__relevance = relevance;
        return relevance > 0;
      });
    } else {
      results.forEach(tool => {
        (tool as any).__relevance = 1;
      });
    }

    // 应用筛选
    results = toolsDataManager.filterTools({
      categories: filters.categories,
      difficulties: filters.difficulties,
      usages: filters.usages,
      featured: filters.featured,
      beta: filters.beta,
      premium: filters.premium
    }).filter(tool => results.some(r => r.id === tool.id));

    // 应用排序
    results = this.sortResults(results, filters.sortBy, filters.sortDirection);

    const endTime = performance.now();

    return {
      tools: results,
      totalCount: this.tools.length,
      filteredCount: results.length,
      searchTime: endTime - startTime,
      suggestions: this.generateSuggestions(filters.query)
    };
  }

  // 排序结果
  private sortResults(
    tools: StatisticalTool[], 
    sortBy: SortOption, 
    direction: 'asc' | 'desc'
  ): StatisticalTool[] {
    const sorted = [...tools].sort((a, b) => {
      let comparison = 0;

      switch (sortBy) {
        case SortOption.RELEVANCE:
          comparison = ((b as any).__relevance || 0) - ((a as any).__relevance || 0);
          break;
        
        case SortOption.NAME:
          comparison = a.name.localeCompare(b.name);
          break;
        
        case SortOption.DIFFICULTY:
          const difficultyOrder = {
            [DifficultyLevel.BEGINNER]: 1,
            [DifficultyLevel.INTERMEDIATE]: 2,
            [DifficultyLevel.ADVANCED]: 3,
            [DifficultyLevel.EXPERT]: 4
          };
          comparison = difficultyOrder[a.difficulty] - difficultyOrder[b.difficulty];
          break;
        
        case SortOption.USAGE:
          const usageOrder = {
            [UsageFrequency.VERY_HIGH]: 4,
            [UsageFrequency.HIGH]: 3,
            [UsageFrequency.MEDIUM]: 2,
            [UsageFrequency.LOW]: 1
          };
          comparison = usageOrder[b.usage] - usageOrder[a.usage];
          break;
        
        case SortOption.LAST_UPDATED:
          comparison = b.lastUpdated.getTime() - a.lastUpdated.getTime();
          break;
      }

      return direction === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }

  // 生成搜索建议
  private generateSuggestions(query: string): SearchSuggestion[] {
    if (!query || query.length < 2) return [];

    const suggestions: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // 工具名称建议
    this.tools.forEach(tool => {
      if (tool.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'tool',
          text: tool.name,
          description: tool.description,
          data: tool
        });
      }
    });

    // 分类建议
    toolsDataManager.getAllCategories().forEach(category => {
      if (category.name.toLowerCase().includes(queryLower)) {
        suggestions.push({
          type: 'category',
          text: category.name,
          description: category.description,
          data: category
        });
      }
    });

    // 关键词建议
    const allKeywords = new Set<string>();
    this.tools.forEach(tool => {
      tool.keywords.forEach(keyword => {
        if (keyword.toLowerCase().includes(queryLower)) {
          allKeywords.add(keyword);
        }
      });
    });

    Array.from(allKeywords).slice(0, 3).forEach(keyword => {
      suggestions.push({
        type: 'keyword',
        text: keyword,
        description: 'Keyword suggestion'
      });
    });

    return suggestions.slice(0, 8);
  }
}

// 创建搜索引擎实例
const searchEngine = new SearchEngine();

// 主搜索组件
export const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  initialFilters = {},
  placeholder = 'Search statistical tools...',
  showFilters = true,
  showSorting = true,
  showSuggestions = true,
  showHistory = true,
  maxSuggestions = 6,
  maxHistory = 5,
  onFiltersChange,
  onResults,
  className = ''
}) => {
  const [filters, setFilters] = useState<SearchFilters>({
    ...DEFAULT_FILTERS,
    ...initialFilters
  });

  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [showSuggestionsDropdown, setShowSuggestionsDropdown] = useState(false);
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // 搜索结果
  const searchResults = useMemo(() => {
    setIsSearching(true);
    const results = searchEngine.search(filters);
    setIsSearching(false);
    return results;
  }, [filters]);

  // 处理搜索结果变化
  useEffect(() => {
    onResults?.(searchResults);
  }, [searchResults, onResults]);

  // 处理筛选器变化
  useEffect(() => {
    onFiltersChange?.(filters);
  }, [filters, onFiltersChange]);

  // 加载搜索历史
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('statcal-search-history');
      if (saved) {
        try {
          const history = JSON.parse(saved).map((item: any) => ({
            ...item,
            timestamp: new Date(item.timestamp)
          }));
          setSearchHistory(history);
        } catch (e) {
          console.warn('Failed to load search history');
        }
      }
    }
  }, []);

  // 保存搜索历史
  const saveToHistory = useCallback((query: string, resultsCount: number) => {
    if (!query.trim()) return;

    const newItem: SearchHistoryItem = {
      query: query.trim(),
      timestamp: new Date(),
      resultsCount
    };

    const updatedHistory = [
      newItem,
      ...searchHistory.filter(item => item.query !== newItem.query)
    ].slice(0, maxHistory);

    setSearchHistory(updatedHistory);

    if (typeof window !== 'undefined') {
      localStorage.setItem('statcal-search-history', JSON.stringify(updatedHistory));
    }
  }, [searchHistory, maxHistory]);

  // 处理搜索输入变化
  const handleSearchChange = useCallback((value: string) => {
    setFilters(prev => ({ ...prev, query: value }));
    setShowSuggestionsDropdown(value.length > 0);

    // 添加到搜索历史（防抖）
    if (value && value.length > 2) {
      const timeoutId = setTimeout(() => {
        saveToHistory(value, searchResults.filteredCount);
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [saveToHistory, searchResults.filteredCount]);

  // 处理建议点击
  const handleSuggestionClick = useCallback((suggestion: SearchSuggestion) => {
    setFilters(prev => ({ ...prev, query: suggestion.text }));
    setShowSuggestionsDropdown(false);
    searchInputRef.current?.focus();

    // 发送搜索建议点击事件
    if (typeof window !== 'undefined') {
      window.gtag?.('event', 'search_suggestion_click', {
        event_category: 'Search',
        event_label: suggestion.text,
        custom_parameters: {
          suggestion_type: suggestion.type
        }
      });
    }
  }, []);

  // 处理历史记录点击
  const handleHistoryClick = useCallback((historyItem: SearchHistoryItem) => {
    setFilters(prev => ({ ...prev, query: historyItem.query }));
    setShowSuggestionsDropdown(false);
    searchInputRef.current?.focus();
  }, []);

  // 清除搜索
  const clearSearch = useCallback(() => {
    setFilters(prev => ({ ...prev, query: '' }));
    setShowSuggestionsDropdown(false);
    searchInputRef.current?.focus();
  }, []);

  // 重置所有筛选器
  const resetFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
    setShowSuggestionsDropdown(false);
    setShowAdvancedFilters(false);
  }, []);

  // 处理点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowSuggestionsDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className={`advanced-search ${className}`}>
      {/* 搜索栏 */}
      <div className="relative" ref={dropdownRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            ref={searchInputRef}
            type="text"
            placeholder={placeholder}
            value={filters.query}
            onChange={(e) => handleSearchChange(e.target.value)}
            onFocus={() => setShowSuggestionsDropdown(filters.query.length > 0)}
            className="w-full pl-12 pr-12 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:text-gray-100 transition-all duration-200"
          />
          {filters.query && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {isSearching && (
            <div className="absolute right-12 top-1/2 transform -translate-y-1/2">
              <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>

        {/* 搜索建议下拉菜单 */}
        {showSuggestions && showSuggestionsDropdown && (
          <div className="absolute z-50 w-full mt-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-96 overflow-y-auto">
            {/* 搜索建议 */}
            {searchResults.suggestions.length > 0 && (
              <div className="p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
                  Suggestions
                </div>
                {searchResults.suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                  <button
                    key={`suggestion-${index}`}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-3"
                  >
                    <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {suggestion.text}
                      </div>
                      {suggestion.description && (
                        <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {suggestion.description}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-400 capitalize flex-shrink-0">
                      {suggestion.type}
                    </span>
                  </button>
                ))}
              </div>
            )}

            {/* 搜索历史 */}
            {showHistory && searchHistory.length > 0 && filters.query.length === 0 && (
              <div className="border-t border-gray-200 dark:border-gray-700 p-2">
                <div className="text-xs font-medium text-gray-500 dark:text-gray-400 px-3 py-1">
                  Recent searches
                </div>
                {searchHistory.slice(0, maxHistory).map((item, index) => (
                  <button
                    key={`history-${index}`}
                    onClick={() => handleHistoryClick(item)}
                    className="w-full text-left px-3 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded flex items-center space-x-3"
                  >
                    <Clock className="h-4 w-4 text-gray-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 dark:text-gray-100 truncate">
                        {item.query}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.resultsCount} results
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 flex-shrink-0">
                      {item.timestamp.toLocaleDateString()}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 快速筛选和排序 */}
      {(showFilters || showSorting) && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
          {/* 快速筛选 */}
          {showFilters && (
            <div className="flex items-center space-x-3 flex-wrap">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.featured === true}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    featured: e.target.checked ? true : undefined 
                  }))}
                  className="mr-2 rounded"
                />
                <Star className="h-4 w-4 text-yellow-500 mr-1" />
                Featured
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.beta === true}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    beta: e.target.checked ? true : undefined 
                  }))}
                  className="mr-2 rounded"
                />
                <span className="text-orange-600 text-sm">Beta</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={filters.premium === true}
                  onChange={(e) => setFilters(prev => ({ 
                    ...prev, 
                    premium: e.target.checked ? true : undefined 
                  }))}
                  className="mr-2 rounded"
                />
                <Zap className="h-4 w-4 text-purple-500 mr-1" />
                Premium
              </label>

              <button
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="flex items-center px-3 py-1 text-sm bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                <Filter className="h-4 w-4 mr-1" />
                Advanced
              </button>

              {(filters.categories.length > 0 || filters.difficulties.length > 0 || filters.usages.length > 0) && (
                <button
                  onClick={resetFilters}
                  className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                >
                  Reset filters
                </button>
              )}
            </div>
          )}

          {/* 排序 */}
          {showSorting && (
            <div className="flex items-center space-x-2">
              <ArrowUpDown className="h-4 w-4 text-gray-500" />
              <select
                value={filters.sortBy}
                onChange={(e) => setFilters(prev => ({ ...prev, sortBy: e.target.value as SortOption }))}
                className="text-sm border border-gray-300 dark:border-gray-600 rounded px-2 py-1 bg-white dark:bg-gray-800"
              >
                <option value={SortOption.RELEVANCE}>Relevance</option>
                <option value={SortOption.NAME}>Name</option>
                <option value={SortOption.DIFFICULTY}>Difficulty</option>
                <option value={SortOption.USAGE}>Usage</option>
                <option value={SortOption.LAST_UPDATED}>Last Updated</option>
              </select>
              <button
                onClick={() => setFilters(prev => ({ 
                  ...prev, 
                  sortDirection: prev.sortDirection === 'asc' ? 'desc' : 'asc' 
                }))}
                className="p-1 text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                title={`Sort ${filters.sortDirection === 'asc' ? 'descending' : 'ascending'}`}
              >
                <ArrowUpDown className={`h-4 w-4 ${filters.sortDirection === 'desc' ? 'rotate-180' : ''} transition-transform`} />
              </button>
            </div>
          )}
        </div>
      )}

      {/* 高级筛选面板 */}
      {showAdvancedFilters && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 分类筛选 */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Categories</h4>
              <div className="space-y-1 max-h-32 overflow-y-auto">
                {toolsDataManager.getAllCategories().map(category => (
                  <label key={category.id} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.categories.includes(category.id)}
                      onChange={(e) => {
                        const newCategories = e.target.checked
                          ? [...filters.categories, category.id]
                          : filters.categories.filter(c => c !== category.id);
                        setFilters(prev => ({ ...prev, categories: newCategories }));
                      }}
                      className="mr-2 rounded"
                    />
                    {category.name}
                  </label>
                ))}
              </div>
            </div>

            {/* 难度筛选 */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Difficulty</h4>
              <div className="space-y-1">
                {Object.values(DifficultyLevel).map(difficulty => {
                  const badge = getToolDifficultyBadge(difficulty);
                  return (
                    <label key={difficulty} className="flex items-center text-sm">
                      <input
                        type="checkbox"
                        checked={filters.difficulties.includes(difficulty)}
                        onChange={(e) => {
                          const newDifficulties = e.target.checked
                            ? [...filters.difficulties, difficulty]
                            : filters.difficulties.filter(d => d !== difficulty);
                          setFilters(prev => ({ ...prev, difficulties: newDifficulties }));
                        }}
                        className="mr-2 rounded"
                      />
                      {badge.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* 使用频率筛选 */}
            <div>
              <h4 className="font-medium text-gray-900 dark:text-gray-100 mb-2">Usage Frequency</h4>
              <div className="space-y-1">
                {Object.values(UsageFrequency).map(usage => (
                  <label key={usage} className="flex items-center text-sm">
                    <input
                      type="checkbox"
                      checked={filters.usages.includes(usage)}
                      onChange={(e) => {
                        const newUsages = e.target.checked
                          ? [...filters.usages, usage]
                          : filters.usages.filter(u => u !== usage);
                        setFilters(prev => ({ ...prev, usages: newUsages }));
                      }}
                      className="mr-2 rounded"
                    />
                    <span className="capitalize">{usage.replace('-', ' ')}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 搜索结果统计 */}
      <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
        <span>
          {searchResults.filteredCount} of {searchResults.totalCount} tools
          {filters.query && (
            <span className="ml-1">
              for "{filters.query}"
            </span>
          )}
        </span>
        <span>
          Search completed in {searchResults.searchTime.toFixed(1)}ms
        </span>
      </div>
    </div>
  );
};

export default AdvancedSearch;