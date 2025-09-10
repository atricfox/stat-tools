/**
 * Tool navigation component for switching between statistical tools
 * Provides easy access to related calculators and tools
 */

'use client'

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Calculator, 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Target, 
  Users,
  BookOpen,
  ChevronDown,
  Star,
  Clock
} from 'lucide-react';

export interface Tool {
  id: string;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
  category: 'basic' | 'advanced' | 'specialized';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  popular?: boolean;
  comingSoon?: boolean;
}

export interface ToolNavigationProps {
  currentTool?: string;
  showCategories?: boolean;
  showDescriptions?: boolean;
  maxVisible?: number;
  className?: string;
}

const ToolNavigation: React.FC<ToolNavigationProps> = ({
  currentTool,
  showCategories = true,
  showDescriptions = true,
  maxVisible = 6,
  className = ''
}) => {
  const [showAllTools, setShowAllTools] = useState(false);
  const [activeCategory, setActiveCategory] = useState<string>('basic');
  const pathname = usePathname();

  const tools: Tool[] = [
    {
      id: 'mean',
      name: 'Mean Calculator',
      description: 'Calculate arithmetic mean (average) of numbers',
      icon: Calculator,
      href: '/tools/mean',
      category: 'basic',
      difficulty: 'beginner',
      popular: true
    },
    {
      id: 'median',
      name: 'Median Calculator',
      description: 'Find the middle value in a dataset',
      icon: Target,
      href: '/tools/median',
      category: 'basic',
      difficulty: 'beginner',
      popular: true
    },
    {
      id: 'mode',
      name: 'Mode Calculator',
      description: 'Find the most frequently occurring value',
      icon: BarChart3,
      href: '/tools/mode',
      category: 'basic',
      difficulty: 'beginner',
      comingSoon: true
    },
    {
      id: 'range',
      name: 'Range Calculator',
      description: 'Calculate the difference between max and min values',
      icon: TrendingUp,
      href: '/tools/range',
      category: 'basic',
      difficulty: 'beginner',
      comingSoon: true
    },
    {
      id: 'standard-deviation',
      name: 'Standard Deviation',
      description: 'Measure data spread and variability',
      icon: BarChart3,
      href: '/tools/standard-deviation',
      category: 'advanced',
      difficulty: 'intermediate',
      popular: true,
      comingSoon: true
    },
    {
      id: 'variance',
      name: 'Variance Calculator',
      description: 'Calculate variance of a dataset',
      icon: TrendingUp,
      href: '/tools/variance',
      category: 'advanced',
      difficulty: 'intermediate',
      comingSoon: true
    },
    {
      id: 'percentile',
      name: 'Percentile Calculator',
      description: 'Find percentiles and quartiles',
      icon: PieChart,
      href: '/tools/percentile',
      category: 'advanced',
      difficulty: 'intermediate',
      comingSoon: true
    },
    {
      id: 'correlation',
      name: 'Correlation Analysis',
      description: 'Analyze relationships between variables',
      icon: TrendingUp,
      href: '/tools/correlation',
      category: 'specialized',
      difficulty: 'advanced',
      comingSoon: true
    },
    {
      id: 'regression',
      name: 'Linear Regression',
      description: 'Fit linear models to data',
      icon: TrendingUp,
      href: '/tools/regression',
      category: 'specialized',
      difficulty: 'advanced',
      comingSoon: true
    },
    {
      id: 'hypothesis-test',
      name: 'Hypothesis Testing',
      description: 'Statistical significance testing',
      icon: Target,
      href: '/tools/hypothesis-test',
      category: 'specialized',
      difficulty: 'advanced',
      comingSoon: true
    }
  ];

  const categories = [
    { id: 'basic', name: 'Basic Statistics', description: 'Fundamental statistical measures' },
    { id: 'advanced', name: 'Advanced Statistics', description: 'Complex statistical analysis' },
    { id: 'specialized', name: 'Specialized Tools', description: 'Advanced statistical methods' }
  ];

  const getToolsByCategory = (category: string) => {
    return tools.filter(tool => tool.category === category);
  };

  const getCurrentTool = () => {
    return tools.find(tool => pathname.includes(tool.id));
  };

  const getRelatedTools = () => {
    const current = getCurrentTool();
    if (!current) return tools.slice(0, 4);
    
    // Get tools from the same category first, then others
    const sameCategory = tools.filter(tool => 
      tool.category === current.category && tool.id !== current.id
    );
    const otherTools = tools.filter(tool => 
      tool.category !== current.category
    );
    
    return [...sameCategory, ...otherTools].slice(0, 4);
  };

  const visibleTools = showAllTools ? tools : tools.slice(0, maxVisible);
  const currentToolData = getCurrentTool();

  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Statistical Tools</h3>
          </div>
          {currentToolData && (
            <div className="flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
              <currentToolData.icon className="h-4 w-4 mr-1" />
              Currently: {currentToolData.name}
            </div>
          )}
        </div>
      </div>

      {/* Categories */}
      {showCategories && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeCategory === category.id
                    ? 'bg-blue-100 text-blue-700 border border-blue-300'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Tools Grid */}
      <div className="p-4">
        {showCategories ? (
          <div className="space-y-6">
            {categories.map((category) => (
              <div key={category.id} className={activeCategory === category.id ? '' : 'hidden'}>
                <h4 className="font-medium text-gray-900 mb-3">{category.name}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {getToolsByCategory(category.id).map((tool) => (
                    <ToolCard
                      key={tool.id}
                      tool={tool}
                      isActive={pathname.includes(tool.id)}
                      showDescription={showDescriptions}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                isActive={pathname.includes(tool.id)}
                showDescription={showDescriptions}
              />
            ))}
          </div>
        )}

        {/* Show More Button */}
        {!showCategories && tools.length > maxVisible && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAllTools(!showAllTools)}
              className="inline-flex items-center px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              {showAllTools ? 'Show Less' : `Show All ${tools.length} Tools`}
              <ChevronDown className={`h-4 w-4 ml-1 transform transition-transform ${showAllTools ? 'rotate-180' : ''}`} />
            </button>
          </div>
        )}
      </div>

      {/* Related Tools Section */}
      {currentToolData && (
        <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
          <h4 className="font-medium text-gray-900 mb-3">Related Tools</h4>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
            {getRelatedTools().map((tool) => (
              <Link
                key={tool.id}
                href={(tool.comingSoon ? '#' : tool.href) as any}
                className={`p-2 rounded-lg transition-colors text-center ${
                  tool.comingSoon
                    ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    : 'bg-white hover:bg-gray-100 text-gray-700'
                }`}
              >
                <tool.icon className="h-4 w-4 mx-auto mb-1" />
                <div className="text-xs font-medium">{tool.name}</div>
                {tool.comingSoon && (
                  <div className="text-xs text-gray-500">Coming Soon</div>
                )}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Tool Card Component
interface ToolCardProps {
  tool: Tool;
  isActive: boolean;
  showDescription: boolean;
}

const ToolCard: React.FC<ToolCardProps> = ({ tool, isActive, showDescription }) => {
  return tool.comingSoon ? (
    <div className="cursor-not-allowed">
      <div className={`p-3 rounded-lg border transition-all duration-200 ${
        tool.comingSoon
          ? 'border-gray-200 bg-gray-50 opacity-60'
          : isActive
          ? 'border-blue-300 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <tool.icon className={`h-4 w-4 mr-2 ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`} />
            <h5 className={`text-sm font-medium ${
              isActive ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {tool.name}
            </h5>
          </div>
          <div className="flex items-center gap-1">
            {tool.popular && (
              <Star className="h-3 w-3 text-yellow-500" aria-hidden="true" />
            )}
            {tool.comingSoon && (
              <Clock className="h-3 w-3 text-gray-400" aria-hidden="true" />
            )}
          </div>
        </div>

        {showDescription && (
          <p className={`text-xs ${isActive ? 'text-blue-700' : 'text-gray-600'} mb-2`}>
            {tool.description}
          </p>
        )}

        <div className="flex items-center justify-between">
          <span className={`text-xs px-2 py-1 rounded-full ${
            tool.difficulty === 'beginner' ? 'bg-green-100 text-green-700' :
            tool.difficulty === 'intermediate' ? 'bg-yellow-100 text-yellow-700' :
            'bg-red-100 text-red-700'
          }`}>
            {tool.difficulty}
          </span>
          
          {tool.comingSoon && (
            <span className="text-xs text-gray-500">Coming Soon</span>
          )}
        </div>
      </div>
    </div>
  ) : (
    <Link href={tool.href as any}>
      <div className={`p-3 rounded-lg border transition-all duration-200 ${
        isActive
          ? 'border-blue-300 bg-blue-50 shadow-sm'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-sm hover:bg-gray-50'
      }`}>
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center">
            <tool.icon className={`h-4 w-4 mr-2 ${
              isActive ? 'text-blue-600' : 'text-gray-600'
            }`} />
            <h5 className={`text-sm font-medium ${
              isActive ? 'text-blue-900' : 'text-gray-900'
            }`}>
              {tool.name}
            </h5>
          </div>
          <div className="flex items-center gap-1">
            {tool.popular && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-100 text-yellow-800">Popular</span>
            )}
            {isActive && (
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">Current</span>
            )}
          </div>
        </div>
        {showDescription && tool.description && (
          <p className="text-xs text-gray-600 line-clamp-2">{tool.description}</p>
        )}
      </div>
    </Link>
  );
};

export default ToolNavigation;
