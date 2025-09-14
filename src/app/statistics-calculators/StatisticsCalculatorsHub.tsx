'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calculator, TrendingUp, GraduationCap, BarChart3, X } from 'lucide-react';
import type { TCalculatorsJson } from '@/lib/hub/calculatorsSchema';

interface StatisticsCalculatorsHubProps {
  calculatorsData: TCalculatorsJson;
}

export default function StatisticsCalculatorsHub({ calculatorsData }: StatisticsCalculatorsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('all');
  const [isClient, setIsClient] = useState(false);

  // Only apply client-side filtering after mount
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Filter calculators based on search query
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return calculatorsData.groups;

    const query = searchQuery.toLowerCase();
    return calculatorsData.groups
      .map(group => ({
        ...group,
        items: group.items.filter(
          item =>
            item.name.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query)
        ),
      }))
      .filter(group => group.items.length > 0);
  }, [searchQuery, calculatorsData.groups]);

  // Get icon for group
  const getGroupIcon = (groupName: string) => {
    switch (groupName) {
      case 'means-weighted':
        return <Calculator className="w-5 h-5" />;
      case 'dispersion':
        return <BarChart3 className="w-5 h-5" />;
      case 'gpa-grades':
        return <GraduationCap className="w-5 h-5" />;
      default:
        return <TrendingUp className="w-5 h-5" />;
    }
  };

  const handleToolClick = (toolUrl: string, groupName: string, position: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hub_tool_click', {
        tool_slug: toolUrl.replace('/calculator/', ''),
        group_name: groupName,
        position: position,
        context: 'statistics_hub',
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (typeof window !== 'undefined' && (window as any).gtag && query) {
      (window as any).gtag('event', 'search_use', {
        query: query,
        results_count: filteredData.reduce((acc, g) => acc + g.items.length, 0),
        context: 'statistics_hub',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistics Calculators Hub
          </h1>
          <p className="text-lg text-gray-600">
            Complete collection of statistical tools and calculators for data analysis
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search calculators by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Quick Navigation - SEO Friendly Anchors */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8 overflow-x-auto py-2" aria-label="Quick navigation">
            <a
              href="#all"
              className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            >
              All Tools
            </a>
            {calculatorsData.groups.map((group) => (
              <a
                key={group.group_name}
                href={`#${group.group_name}`}
                className="whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              >
                {group.display_name}
              </a>
            ))}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchQuery && filteredData.length === 0 ? (
          // Empty State for Search
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
            <p className="text-gray-600 mb-4">
              No calculators match "{searchQuery}". Try a different search term.
            </p>
            <button
              onClick={() => handleSearch('')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          </div>
        ) : (
          // Calculator Groups - All visible for SEO
          <div className="space-y-10">
            {filteredData.map((group) => (
              <section key={group.group_name} id={group.group_name}>
                {/* Group Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getGroupIcon(group.group_name)}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {group.display_name}
                    </h2>
                  </div>
                  <a
                    href={`#${group.group_name}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                    title="Copy link to section"
                  >
                    #
                  </a>
                </div>

                {/* Calculator Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item, index) => (
                    <Link
                      key={item.url}
                      href={item.url}
                      onClick={() => handleToolClick(item.url, group.group_name, index + 1)}
                      className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                          {item.name}
                        </h3>
                        <div className="flex space-x-1">
                          {item.is_new && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              NEW
                            </span>
                          )}
                          {item.is_hot && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                              HOT
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">
                        {item.description}
                      </p>
                      <div className="mt-3 text-blue-600 text-sm font-medium group-hover:underline">
                        Open Calculator →
                      </div>
                    </Link>
                  ))}
                </div>

                {/* Theme Hub Links */}
                {group.group_name === 'gpa-grades' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <Link
                      href="/gpa"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Visit GPA Hub for specialized GPA tools →
                    </Link>
                  </div>
                )}
                {group.group_name === 'means-weighted' && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <Link
                      href="/descriptive-statistics"
                      className="text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Visit Descriptive Statistics Hub for more tools →
                    </Link>
                  </div>
                )}
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}