'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search, Calculator, TrendingUp, GraduationCap, BarChart3, X, ArrowUp } from 'lucide-react';
import type { TCalculatorsJson } from '@/lib/hub/calculatorsSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface StatisticsCalculatorsHubProps {
  calculatorsData: TCalculatorsJson;
}

export default function StatisticsCalculatorsHubSEO({ calculatorsData }: StatisticsCalculatorsHubProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);

  // Read search query from URL parameters on mount
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const searchParam = params.get('search');
    if (searchParam) {
      setSearchQuery(searchParam);
    }
  }, []);

  // Handle scroll for back to top button
  React.useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 300);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Statistics Calculators Hub
          </h1>
          <p className="text-lg text-gray-600">
            Complete collection of statistical tools and calculators for data analysis
          </p>
        </div>
      </header>

      {/* Search Bar - Sticky */}
      <div className="bg-white shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search calculators by name or description..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Search calculators"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Table of Contents for SEO */}
      <nav className="bg-white border-b" aria-label="Calculator categories">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm font-medium text-gray-700 mr-2">Jump to:</span>
            {calculatorsData.groups.map((group) => (
              <a
                key={group.group_name}
                href={`#${group.group_name}`}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline px-2 py-1 rounded hover:bg-blue-50 transition-colors"
              >
                {group.display_name}
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {searchQuery && filteredData.length === 0 ? (
          // Empty State for Search
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">No results found</h2>
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
          // All Calculator Groups - Always Visible for SEO
          <div className="space-y-12">
            {filteredData.map((group) => (
              <section 
                key={group.group_name} 
                id={group.group_name}
                className="scroll-mt-40" // Account for sticky header and search bar
              >
                {/* Group Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="text-blue-600">
                      {getGroupIcon(group.group_name)}
                    </div>
                    <h2 className="text-2xl font-semibold text-gray-900">
                      {group.display_name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      ({group.items.length} tools)
                    </span>
                  </div>
                  <a
                    href={`#${group.group_name}`}
                    className="text-sm text-gray-500 hover:text-gray-700"
                    title="Direct link to this section"
                    aria-label={`Direct link to ${group.display_name} section`}
                  >
                    #
                  </a>
                </div>

                {/* Calculator Cards Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {group.items.map((item, index) => (
                    <article key={item.url} className="h-full">
                      <Link
                        href={item.url}
                        onClick={() => handleToolClick(item.url, group.group_name, index + 1)}
                        className="block h-full bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                            {item.name}
                          </h3>
                          <div className="flex space-x-1 flex-shrink-0">
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
                    </article>
                  ))}
                </div>

                {/* Theme Hub Links */}
                {group.group_name === 'gpa-grades' && (
                  <aside className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">Looking for more GPA tools?</p>
                    <Link
                      href="/gpa"
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      Visit GPA Calculator Hub
                      <span className="ml-1">→</span>
                    </Link>
                  </aside>
                )}
                {(group.group_name === 'means-weighted' || group.group_name === 'dispersion') && (
                  <aside className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-gray-700 mb-2">Explore more statistical tools:</p>
                    <Link
                      href="/descriptive-statistics"
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center"
                    >
                      Visit Descriptive Statistics Hub
                      <span className="ml-1">→</span>
                    </Link>
                  </aside>
                )}
              </section>
            ))}
          </div>
        )}

        {/* Additional SEO Content */}
        <section className="mt-16 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            About Our Statistics Calculators
          </h2>
          <div className="prose prose-gray max-w-none">
            <p className="text-gray-600 mb-4">
              Our comprehensive collection of statistics calculators helps students, researchers, and professionals 
              perform accurate statistical analysis. Each calculator provides step-by-step explanations and 
              supports multiple calculation methods.
            </p>
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Popular Calculators</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Mean, Median, and Mode Calculators</li>
                  <li>• Standard Deviation and Variance</li>
                  <li>• GPA and Grade Calculators</li>
                  <li>• Confidence Interval Tools</li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Features</h3>
                <ul className="space-y-1 text-sm text-gray-600">
                  <li>• Step-by-step calculation breakdowns</li>
                  <li>• Multiple input formats supported</li>
                  <li>• Export results to CSV or JSON</li>
                  <li>• Mobile-friendly responsive design</li>
                </ul>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Back to Top Button */}
      {showBackToTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 p-3 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors z-20"
          aria-label="Back to top"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
      
      <Footer />
    </div>
  );
}