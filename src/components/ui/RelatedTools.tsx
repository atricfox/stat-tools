'use client';

import React, { useEffect, useState } from 'react';
import { Calculator, BarChart3, TrendingUp, Award, ArrowRight } from 'lucide-react';

interface CalculatorGroup {
  id: number;
  group_name: string;
  display_name: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

interface CalculatorWithGroup {
  id: number;
  group_id: number;
  name: string;
  url: string;
  description: string;
  is_hot: boolean;
  is_new: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
  group?: CalculatorGroup;
}

interface RelatedToolsProps {
  currentTool: string;
  category?: 'statistics' | 'gpa' | 'analysis';
}

const RelatedTools: React.FC<RelatedToolsProps> = ({ currentTool, category = 'statistics' }) => {
  const [relatedCalculators, setRelatedCalculators] = useState<CalculatorWithGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRelatedCalculators = async () => {
      try {
        setLoading(true);
        // Build current calculator URL
        const currentUrl = `/calculator/${currentTool.toLowerCase().replace(/\s+/g, '-')}`;

        // Fetch related calculators from API
        const response = await fetch(`/api/calculators/related?currentUrl=${encodeURIComponent(currentUrl)}`);
        if (response.ok) {
          const data = await response.json();
          setRelatedCalculators(data);
        } else {
          console.error('Failed to fetch related calculators');
          setRelatedCalculators([]);
        }
      } catch (error) {
        console.error('Error fetching related calculators:', error);
        setRelatedCalculators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedCalculators();
  }, [currentTool]);

  // Map icon based on calculator name or group
  const getIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('gpa') || nameLower.includes('grade')) return Award;
    if (nameLower.includes('deviation') || nameLower.includes('variance')) return BarChart3;
    if (nameLower.includes('mean') || nameLower.includes('median') || nameLower.includes('average')) return TrendingUp;
    return Calculator;
  };

  const getDifficultyColor = (groupName: string) => {
    // Determine difficulty based on group
    if (groupName?.includes('basic') || groupName?.includes('simple')) return 'text-green-600 bg-green-50';
    if (groupName?.includes('advanced') || groupName?.includes('complex')) return 'text-purple-600 bg-purple-50';
    return 'text-blue-600 bg-blue-50'; // Default to intermediate
  };

  const getDifficultyLabel = (groupName: string) => {
    if (groupName?.includes('basic') || groupName?.includes('simple')) return 'Basic';
    if (groupName?.includes('advanced') || groupName?.includes('complex')) return 'Advanced';
    return 'Intermediate';
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
            <div className="h-16 bg-gray-100 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Related Calculators</h3>
        <a
          href="/statistics-calculators"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>

      <div className="space-y-3">
        {relatedCalculators.length > 0 ? (
          relatedCalculators.map((calc) => {
            const IconComponent = getIcon(calc.name);
            return (
              <a
                key={calc.id}
                href={calc.url}
                className="block p-3 rounded-lg border border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 bg-gray-100 rounded flex items-center justify-center group-hover:bg-blue-100 transition-colors mr-2">
                        <IconComponent className="h-3 w-3 text-gray-600 group-hover:text-blue-600" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-blue-900 truncate">
                        {calc.name}
                      </h4>
                    </div>
                    <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${getDifficultyColor(calc.group?.group_name || '')}`}>
                      {getDifficultyLabel(calc.group?.group_name || '')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-2 leading-tight">
                    {calc.description}
                  </p>
                </div>
              </a>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No related calculators found</p>
        )}
      </div>
    </div>
  );
};

export default RelatedTools;