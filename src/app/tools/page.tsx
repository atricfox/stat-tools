/**
 * 工具展示页面 - 集成Hub和分类功能
 */

'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Search, 
  Filter,
  Grid3x3,
  List,
  Layers,
  Star,
  BarChart3
} from 'lucide-react';

import UnifiedHub from '@/components/hub/UnifiedHub';
import ToolClassification from '@/components/hub/ToolClassification';
import AdvancedSearch from '@/components/search/AdvancedSearch';

// 页面视图模式
type ViewMode = 'hub' | 'classification' | 'search';

interface ViewModeConfig {
  key: ViewMode;
  name: string;
  icon: React.ReactNode;
  description: string;
}

const VIEW_MODES: ViewModeConfig[] = [
  {
    key: 'hub',
    name: '统一Hub',
    icon: <Grid3x3 className="h-5 w-5" />,
    description: '综合工具展示和快速访问'
  },
  {
    key: 'classification', 
    name: '智能分类',
    icon: <Layers className="h-5 w-5" />,
    description: '多维度工具分类和筛选'
  },
  {
    key: 'search',
    name: '高级搜索',
    icon: <Search className="h-5 w-5" />,
    description: '智能搜索和精确筛选'
  }
];

export default function ToolsPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('hub');
  
  // 处理工具点击
  const handleToolClick = (tool: any) => {
    console.log('Tool clicked:', tool);
    // 这里可以添加导航逻辑
    // router.push(tool.url);
  };

  // 处理分类选择变化
  const handleClassificationChange = (dimension: string, values: string[]) => {
    console.log('Classification changed:', { dimension, values });
  };

  // 处理搜索结果变化
  const handleSearchChange = (results: {
    tools: any[];
    totalCount: number;
    filteredCount: number;
    searchTime: number;
    suggestions: any[];
  }) => {
    console.log('Search results:', results);
  };

  // 渲染视图模式切换器
  const renderViewModeSelector = () => (
    <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
      <div className="flex items-center gap-4 mb-6">
        <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
          <BarChart3 className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            统计工具中心
          </h1>
          <p className="text-gray-600">
            探索和发现强大的统计分析工具
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {VIEW_MODES.map((mode) => (
          <motion.button
            key={mode.key}
            onClick={() => setViewMode(mode.key)}
            className={`
              p-4 rounded-lg text-left transition-all duration-200
              ${viewMode === mode.key
                ? 'bg-blue-50 border-2 border-blue-200 shadow-sm'
                : 'bg-gray-50 border-2 border-transparent hover:bg-gray-100'
              }
            `}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center gap-3 mb-2">
              <div className={`
                p-2 rounded-lg
                ${viewMode === mode.key
                  ? 'bg-blue-100 text-blue-600'
                  : 'bg-gray-200 text-gray-600'
                }
              `}>
                {mode.icon}
              </div>
              <h3 className={`
                font-semibold
                ${viewMode === mode.key ? 'text-blue-900' : 'text-gray-900'}
              `}>
                {mode.name}
              </h3>
            </div>
            <p className="text-sm text-gray-600">
              {mode.description}
            </p>
            
            {viewMode === mode.key && (
              <div className="flex items-center mt-3 text-blue-600 text-sm font-medium">
                <div className="w-2 h-2 bg-blue-600 rounded-full mr-2"></div>
                当前视图
              </div>
            )}
          </motion.button>
        ))}
      </div>
    </div>
  );

  // 渲染当前视图内容
  const renderCurrentView = () => {
    switch (viewMode) {
      case 'hub':
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Grid3x3 className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  统一工具Hub
                </h2>
                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                  推荐
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                集成展示、搜索和快速访问功能的综合工具中心
              </p>
            </div>
            <div className="p-6">
              <UnifiedHub 
                onToolClick={handleToolClick}
                config={{
                  showSearch: true,
                  showFilters: true,
                  featuredSection: true,
                  defaultView: 'grid'
                }}
              />
            </div>
          </div>
        );

      case 'classification':
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Layers className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  智能工具分类
                </h2>
                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-medium rounded-full">
                  多维度
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                按功能类型、难度等级、使用频率等维度智能分类工具
              </p>
            </div>
            <div className="p-6">
              <ToolClassification
                onToolClick={handleToolClick}
                onSelectionChange={handleClassificationChange}
                config={{
                  showCounts: true,
                  showDescriptions: true,
                  allowMultiSelect: false
                }}
              />
            </div>
          </div>
        );

      case 'search':
        return (
          <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
            <div className="p-6 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                <Search className="h-5 w-5 text-gray-600" />
                <h2 className="text-lg font-semibold text-gray-900">
                  高级搜索引擎
                </h2>
                <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                  智能
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                智能搜索算法，支持实时搜索、建议和历史记录
              </p>
            </div>
            <div className="p-6">
              <AdvancedSearch
                onResults={handleSearchChange}
                showSuggestions={true}
                showHistory={true}
                showFilters={true}
                showSorting={true}
                placeholder="Search for statistical calculators..."
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* 页面头部和视图模式选择器 */}
        {renderViewModeSelector()}

        {/* 当前视图内容 */}
        <motion.div
          key={viewMode}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderCurrentView()}
        </motion.div>

        {/* 页面底部信息 */}
        <div className="mt-12 text-center">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            <div className="flex items-center justify-center gap-2 mb-3">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <h3 className="text-lg font-semibold text-gray-900">
                Sprint 6 Day 3 开发成果
              </h3>
            </div>
            <p className="text-gray-600 mb-4">
              完成统一Hub页面、高级搜索引擎和智能工具分类系统的集成开发
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                ✅ 统一Hub组件
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                ✅ 搜索引擎
              </span>
              <span className="px-3 py-1 bg-purple-100 text-purple-800 text-sm font-medium rounded-full">
                ✅ 智能分类系统
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-800 text-sm font-medium rounded-full">
                ✅ 多维度筛选
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}