/**
 * 工具分类系统组件
 * 提供多维度、智能化的统计工具分类和展示功能
 */

'use client';

import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BarChart3, 
  TrendingUp, 
  GraduationCap, 
  Calculator,
  Filter,
  Grid3x3,
  List,
  ChevronRight,
  Star,
  Clock,
  Users,
  Zap
} from 'lucide-react';
import { 
  StatisticalTool, 
  ToolCategory, 
  DifficultyLevel, 
  UsageFrequency,
  ToolsDataManager 
} from '@/lib/toolsData';

// 分类维度定义
export interface ClassificationDimension {
  key: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  values: ClassificationValue[];
}

export interface ClassificationValue {
  key: string;
  name: string;
  color: string;
  description: string;
  count?: number;
}

// 分类配置
interface ClassificationConfig {
  dimensions: ClassificationDimension[];
  defaultDimension?: string;
  showCounts?: boolean;
  showDescriptions?: boolean;
  allowMultiSelect?: boolean;
  compactMode?: boolean;
}

// 分类状态
interface ClassificationState {
  activeDimension: string;
  selectedValues: Record<string, string[]>;
  viewMode: 'grid' | 'list' | 'tree';
}

// 组件Props
interface ToolClassificationProps {
  tools?: StatisticalTool[];
  config?: Partial<ClassificationConfig>;
  onSelectionChange?: (dimension: string, values: string[]) => void;
  onToolClick?: (tool: StatisticalTool) => void;
  className?: string;
}

// 默认分类维度配置
const DEFAULT_DIMENSIONS: ClassificationDimension[] = [
  {
    key: 'category',
    name: '功能分类',
    icon: <BarChart3 className="h-4 w-4" />,
    description: '按统计功能类型分类',
    values: [
      {
        key: ToolCategory.DESCRIPTIVE,
        name: '描述性统计',
        color: 'bg-blue-100 text-blue-800',
        description: '计算数据集的基本特征和描述性指标'
      },
      {
        key: ToolCategory.INFERENTIAL,
        name: '推断性统计',
        color: 'bg-green-100 text-green-800',
        description: '基于样本数据推断总体参数'
      },
      {
        key: ToolCategory.ACADEMIC,
        name: '学术评估',
        color: 'bg-purple-100 text-purple-800',
        description: '学术成绩计算和评估工具'
      }
    ]
  },
  {
    key: 'difficulty',
    name: '难度等级',
    icon: <TrendingUp className="h-4 w-4" />,
    description: '按使用难度和复杂程度分类',
    values: [
      {
        key: DifficultyLevel.BEGINNER,
        name: '初学者',
        color: 'bg-emerald-100 text-emerald-800',
        description: '简单易用，适合统计初学者'
      },
      {
        key: DifficultyLevel.INTERMEDIATE,
        name: '中等',
        color: 'bg-orange-100 text-orange-800',
        description: '需要一定统计基础知识'
      },
      {
        key: DifficultyLevel.ADVANCED,
        name: '高级',
        color: 'bg-red-100 text-red-800',
        description: '复杂工具，需要专业统计知识'
      }
    ]
  },
  {
    key: 'usage',
    name: '使用频率',
    icon: <Clock className="h-4 w-4" />,
    description: '按工具使用频率和受欢迎程度分类',
    values: [
      {
        key: UsageFrequency.VERY_HIGH,
        name: '极高频',
        color: 'bg-rose-100 text-rose-800',
        description: '最常用的核心统计工具'
      },
      {
        key: UsageFrequency.HIGH,
        name: '高频',
        color: 'bg-amber-100 text-amber-800',
        description: '经常使用的重要工具'
      },
      {
        key: UsageFrequency.MEDIUM,
        name: '中频',
        color: 'bg-sky-100 text-sky-800',
        description: '特定场景下使用的工具'
      },
      {
        key: UsageFrequency.LOW,
        name: '低频',
        color: 'bg-slate-100 text-slate-800',
        description: '专业或特殊用途工具'
      }
    ]
  },
  {
    key: 'featured',
    name: '推荐等级',
    icon: <Star className="h-4 w-4" />,
    description: '按推荐程度和重要性分类',
    values: [
      {
        key: 'featured',
        name: '精选推荐',
        color: 'bg-yellow-100 text-yellow-800',
        description: '编辑精选的优质工具'
      },
      {
        key: 'regular',
        name: '常规工具',
        color: 'bg-gray-100 text-gray-800',
        description: '标准功能工具'
      }
    ]
  }
];

// 工具分类智能管理器
class ToolClassificationManager {
  private tools: StatisticalTool[];
  private dataManager: ToolsDataManager;

  constructor(tools: StatisticalTool[]) {
    this.tools = tools;
    this.dataManager = new ToolsDataManager();
  }

  // 按维度分类工具
  classifyByDimension(dimension: string): Record<string, StatisticalTool[]> {
    const classification: Record<string, StatisticalTool[]> = {};

    this.tools.forEach(tool => {
      let key: string;
      
      switch (dimension) {
        case 'category':
          key = tool.category;
          break;
        case 'difficulty':
          key = tool.difficulty;
          break;
        case 'usage':
          key = tool.usage;
          break;
        case 'featured':
          key = tool.featured ? 'featured' : 'regular';
          break;
        default:
          key = 'unknown';
      }

      if (!classification[key]) {
        classification[key] = [];
      }
      classification[key].push(tool);
    });

    return classification;
  }

  // 获取维度值的统计计数
  getDimensionCounts(dimension: string): Record<string, number> {
    const classification = this.classifyByDimension(dimension);
    const counts: Record<string, number> = {};

    Object.entries(classification).forEach(([key, tools]) => {
      counts[key] = tools.length;
    });

    return counts;
  }

  // 多维度交叉分类
  crossClassify(dimensions: string[]): Record<string, StatisticalTool[]> {
    const result: Record<string, StatisticalTool[]> = {};

    this.tools.forEach(tool => {
      const keys = dimensions.map(dimension => {
        switch (dimension) {
          case 'category': return tool.category;
          case 'difficulty': return tool.difficulty;
          case 'usage': return tool.usage;
          case 'featured': return tool.featured ? 'featured' : 'regular';
          default: return 'unknown';
        }
      });

      const compositeKey = keys.join('|');
      if (!result[compositeKey]) {
        result[compositeKey] = [];
      }
      result[compositeKey].push(tool);
    });

    return result;
  }

  // 获取推荐的分类组合
  getRecommendedCombinations(): Array<{ dimensions: string[], tools: StatisticalTool[], score: number }> {
    const combinations = [
      ['category', 'difficulty'],
      ['usage', 'featured'],
      ['category', 'usage'],
      ['difficulty', 'featured']
    ];

    return combinations.map(dimensions => {
      const classification = this.crossClassify(dimensions);
      const tools = Object.values(classification).flat();
      const score = this.calculateCombinationScore(classification);

      return { dimensions, tools, score };
    }).sort((a, b) => b.score - a.score);
  }

  private calculateCombinationScore(classification: Record<string, StatisticalTool[]>): number {
    const groups = Object.values(classification);
    const totalTools = groups.reduce((sum, group) => sum + group.length, 0);
    const avgGroupSize = totalTools / groups.length;
    const variance = groups.reduce((sum, group) => sum + Math.pow(group.length - avgGroupSize, 2), 0) / groups.length;
    
    // 分数基于均匀分布和组的数量
    return (1 / (1 + variance)) * Math.log(groups.length + 1);
  }
}

export const ToolClassification: React.FC<ToolClassificationProps> = ({
  tools: userTools,
  config = {},
  onSelectionChange,
  onToolClick,
  className = ''
}) => {
  // 配置合并
  const finalConfig: ClassificationConfig = {
    dimensions: DEFAULT_DIMENSIONS,
    defaultDimension: 'category',
    showCounts: true,
    showDescriptions: true,
    allowMultiSelect: false,
    compactMode: false,
    ...config
  };

  // 工具数据
  const dataManager = useMemo(() => new ToolsDataManager(), []);
  const allTools = dataManager.getAllTools();
  const tools = userTools || allTools;
  const classificationManager = useMemo(() => new ToolClassificationManager(tools), [tools]);

  // 状态管理
  const [state, setState] = useState<ClassificationState>({
    activeDimension: finalConfig.defaultDimension || 'category',
    selectedValues: {},
    viewMode: 'grid'
  });

  // 计算当前分类数据
  const currentClassification = useMemo(() => {
    const classification = classificationManager.classifyByDimension(state.activeDimension);
    const counts = classificationManager.getDimensionCounts(state.activeDimension);
    
    return { classification, counts };
  }, [classificationManager, state.activeDimension]);

  // 获取当前维度配置
  const currentDimension = useMemo(() => {
    return finalConfig.dimensions.find(d => d.key === state.activeDimension) || finalConfig.dimensions[0];
  }, [finalConfig.dimensions, state.activeDimension]);

  // 处理维度切换
  const handleDimensionChange = useCallback((dimensionKey: string) => {
    setState(prev => ({
      ...prev,
      activeDimension: dimensionKey,
      selectedValues: finalConfig.allowMultiSelect ? prev.selectedValues : {}
    }));
  }, [finalConfig.allowMultiSelect]);

  // 处理值选择
  const handleValueSelection = useCallback((dimensionKey: string, valueKey: string) => {
    setState(prev => {
      const currentSelected = prev.selectedValues[dimensionKey] || [];
      let newSelected: string[];

      if (finalConfig.allowMultiSelect) {
        newSelected = currentSelected.includes(valueKey)
          ? currentSelected.filter(v => v !== valueKey)
          : [...currentSelected, valueKey];
      } else {
        newSelected = currentSelected.includes(valueKey) ? [] : [valueKey];
      }

      const newState = {
        ...prev,
        selectedValues: {
          ...prev.selectedValues,
          [dimensionKey]: newSelected
        }
      };

      // 触发回调
      onSelectionChange?.(dimensionKey, newSelected);

      return newState;
    });
  }, [finalConfig.allowMultiSelect, onSelectionChange]);

  // 获取过滤后的工具
  const filteredTools = useMemo(() => {
    const selectedInCurrentDimension = state.selectedValues[state.activeDimension] || [];
    if (selectedInCurrentDimension.length === 0) {
      return tools;
    }

    return tools.filter(tool => {
      switch (state.activeDimension) {
        case 'category':
          return selectedInCurrentDimension.includes(tool.category);
        case 'difficulty':
          return selectedInCurrentDimension.includes(tool.difficulty);
        case 'usage':
          return selectedInCurrentDimension.includes(tool.usage);
        case 'featured':
          return selectedInCurrentDimension.includes(tool.featured ? 'featured' : 'regular');
        default:
          return true;
      }
    });
  }, [tools, state.selectedValues, state.activeDimension]);

  // 渲染维度选择器
  const renderDimensionSelector = () => (
    <div className="flex flex-wrap gap-2 p-4 bg-gray-50 rounded-lg">
      {finalConfig.dimensions.map((dimension) => (
        <button
          key={dimension.key}
          onClick={() => handleDimensionChange(dimension.key)}
          className={`
            flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
            ${state.activeDimension === dimension.key
              ? 'bg-blue-600 text-white'
              : 'bg-white text-gray-600 hover:bg-gray-100'
            }
          `}
        >
          {dimension.icon}
          {dimension.name}
        </button>
      ))}
    </div>
  );

  // 渲染分类值
  const renderClassificationValues = () => {
    const selectedValues = state.selectedValues[state.activeDimension] || [];

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {currentDimension.values.map((value) => {
          const count = currentClassification.counts[value.key] || 0;
          const isSelected = selectedValues.includes(value.key);
          const hasTools = count > 0;

          return (
            <motion.button
              key={value.key}
              onClick={() => hasTools && handleValueSelection(state.activeDimension, value.key)}
              disabled={!hasTools}
              className={`
                p-4 rounded-lg border-2 text-left transition-all duration-200
                ${isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : hasTools
                    ? 'border-gray-200 hover:border-gray-300 bg-white hover:bg-gray-50'
                    : 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                }
              `}
              whileHover={hasTools ? { scale: 1.02 } : undefined}
              whileTap={hasTools ? { scale: 0.98 } : undefined}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${value.color}`}>
                  {value.name}
                </span>
                {finalConfig.showCounts && (
                  <span className="text-sm font-semibold text-gray-600">
                    {count}
                  </span>
                )}
              </div>
              
              {finalConfig.showDescriptions && (
                <p className="text-sm text-gray-600 mb-2">
                  {value.description}
                </p>
              )}

              {isSelected && (
                <div className="flex items-center text-blue-600 text-sm">
                  <Filter className="h-3 w-3 mr-1" />
                  已选择
                </div>
              )}
            </motion.button>
          );
        })}
      </div>
    );
  };

  // 渲染工具列表
  const renderFilteredTools = () => {
    if (filteredTools.length === 0) {
      return (
        <div className="text-center py-12">
          <Calculator className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">没有找到符合条件的工具</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTools.map((tool) => (
          <motion.div
            key={tool.id}
            onClick={() => onToolClick?.(tool)}
            className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.98 }}
          >
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-medium text-gray-900">{tool.name}</h3>
              {tool.featured && (
                <Star className="h-4 w-4 text-yellow-500 fill-current" />
              )}
            </div>
            
            <p className="text-sm text-gray-600 mb-3">
              {tool.description}
            </p>

            <div className="flex flex-wrap gap-2">
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                currentDimension.values.find(v => v.key === tool.category)?.color || 'bg-gray-100 text-gray-800'
              }`}>
                {currentDimension.values.find(v => v.key === tool.category)?.name || tool.category}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 维度选择器 */}
      {renderDimensionSelector()}

      {/* 当前维度信息 */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 mb-4">
          {currentDimension.icon}
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {currentDimension.name}
            </h2>
            <p className="text-sm text-gray-600">
              {currentDimension.description}
            </p>
          </div>
        </div>

        {/* 分类值网格 */}
        {renderClassificationValues()}
      </div>

      {/* 过滤结果 */}
      {(state.selectedValues[state.activeDimension]?.length || 0) > 0 && (
        <div className="bg-white p-4 rounded-lg border">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              筛选结果 ({filteredTools.length})
            </h3>
            <button
              onClick={() => setState(prev => ({
                ...prev,
                selectedValues: {
                  ...prev.selectedValues,
                  [state.activeDimension]: []
                }
              }))}
              className="text-sm text-gray-600 hover:text-gray-800"
            >
              清除筛选
            </button>
          </div>

          {renderFilteredTools()}
        </div>
      )}
    </div>
  );
};

export default ToolClassification;
