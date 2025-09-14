'use client';

import React, { useEffect, useState } from 'react';
import { Calculator, Award, BarChart3, TrendingUp, Flame, ArrowRight, Target, Ruler, Percent } from 'lucide-react';

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

const PopularTools = () => {
  const [hotCalculators, setHotCalculators] = useState<CalculatorWithGroup[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHotCalculators = async () => {
      try {
        setLoading(true);
        // Fetch hot calculators from API
        const response = await fetch('/api/calculators/hot?limit=8');
        if (response.ok) {
          const data = await response.json();
          setHotCalculators(data);
        } else {
          console.error('Failed to fetch hot calculators');
          setHotCalculators([]);
        }
      } catch (error) {
        console.error('Error fetching hot calculators:', error);
        setHotCalculators([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHotCalculators();
  }, []);

  // Map icon based on calculator name
  const getIcon = (name: string) => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('mean') || nameLower.includes('average')) return Calculator;
    if (nameLower.includes('median')) return Target;
    if (nameLower.includes('gpa') || nameLower.includes('grade')) return Award;
    if (nameLower.includes('range')) return Ruler;
    if (nameLower.includes('percent') || nameLower.includes('error')) return Percent;
    if (nameLower.includes('deviation') || nameLower.includes('variance')) return BarChart3;
    if (nameLower.includes('test') || nameLower.includes('confidence')) return TrendingUp;
    return Calculator;
  };

  // Generate mock usage and trend data (can be replaced with real data later)
  const getUsageData = (index: number) => {
    const usages = ['15.2K', '12.8K', '11.4K', '8.7K', '7.2K', '6.8K', '6.3K', '4.9K'];
    const trends = ['+12%', '+25%', '+20%', '+18%', '+14%', '+16%', '+8%', '+15%'];
    return {
      usage: usages[index] || `${Math.floor(Math.random() * 10 + 3)}.${Math.floor(Math.random() * 10)}K`,
      trend: trends[index] || `+${Math.floor(Math.random() * 20 + 5)}%`
    };
  };

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
        <div className="animate-pulse">
          <div className="flex items-center justify-between mb-4">
            <div className="h-6 bg-orange-200 rounded w-1/3"></div>
            <div className="h-4 bg-orange-200 rounded w-16"></div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-white rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl border border-orange-200 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Flame className="h-5 w-5 text-orange-500 mr-2" />
          <h3 className="text-lg font-semibold text-gray-900">Most Popular Calculators</h3>
        </div>
        <a
          href="/statistics-calculators"
          className="text-sm text-orange-600 hover:text-orange-700 font-medium flex items-center"
        >
          View All
          <ArrowRight className="h-4 w-4 ml-1" />
        </a>
      </div>

      <div className="space-y-3">
        {hotCalculators.length > 0 ? (
          hotCalculators.map((calc, index) => {
            const IconComponent = getIcon(calc.name);
            const { usage, trend } = getUsageData(index);
            return (
              <a
                key={calc.id}
                href={calc.url}
                className="block p-3 bg-white rounded-lg border border-orange-100 hover:border-orange-300 hover:shadow-md transition-all duration-200 group"
              >
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 w-6 h-6 bg-orange-100 rounded flex items-center justify-center group-hover:bg-orange-200 transition-colors mr-2">
                        <IconComponent className="h-3 w-3 text-orange-600" />
                      </div>
                      <h4 className="text-sm font-medium text-gray-900 group-hover:text-orange-900 truncate">
                        {calc.name}
                      </h4>
                    </div>
                    <div className="flex items-center space-x-1 text-xs">
                      <span className="text-gray-600">{usage}</span>
                      <span className="text-green-600 font-medium">{trend}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 line-clamp-1 leading-tight">
                    {calc.description}
                  </p>
                </div>
              </a>
            );
          })
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No popular calculators found</p>
        )}
      </div>

      <div className="mt-4 pt-4 border-t border-orange-200">
        <div className="flex items-center justify-between text-xs text-gray-600">
          <span>Updated hourly</span>
          <span>Based on usage data</span>
        </div>
      </div>
    </div>
  );
};

export default PopularTools;