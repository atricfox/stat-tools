'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { FileText, TrendingUp, Calendar, Building, ChevronRight, Search, X } from 'lucide-react';
import type { TCaseFrontmatter } from '@/lib/content/contentSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface CasesListClientProps {
  caseStudies: (TCaseFrontmatter & { content?: any })[];
}

export default function CasesListClient({ caseStudies }: CasesListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);

  // 获取所有独特的行业
  const industries = useMemo(() => {
    const industrySet = new Set<string>();
    caseStudies.forEach(cs => {
      if (cs.industry) {
        industrySet.add(cs.industry);
      }
    });
    return Array.from(industrySet).sort();
  }, [caseStudies]);

  // 过滤案例研究
  const filteredCases = useMemo(() => {
    let filtered = caseStudies;
    
    // 搜索过滤
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(cs => 
        cs.title.toLowerCase().includes(query) ||
        cs.summary.toLowerCase().includes(query) ||
        cs.problem.toLowerCase().includes(query) ||
        cs.solution.toLowerCase().includes(query) ||
        cs.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }
    
    // 行业过滤
    if (selectedIndustry) {
      filtered = filtered.filter(cs => cs.industry === selectedIndustry);
    }
    
    return filtered;
  }, [caseStudies, searchQuery, selectedIndustry]);

  const handleCaseClick = (slug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'case_click', {
        case_slug: slug,
        from_list: true,
        context: 'cases_list',
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (typeof window !== 'undefined' && (window as any).gtag && query) {
      (window as any).gtag('event', 'search_use', {
        query: query,
        results_count: filteredCases.length,
        context: 'cases',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Case Studies</h1>
          </div>
          <p className="text-lg text-gray-600">
            Learn from real-world examples of statistical analysis and data-driven decision making.
            Explore success stories and practical applications.
          </p>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="bg-white shadow-sm sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search case studies..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                aria-label="Search case studies"
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
            
            {/* Industry Filter */}
            {industries.length > 0 && (
              <select
                value={selectedIndustry || ''}
                onChange={(e) => setSelectedIndustry(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by industry"
              >
                <option value="">All Industries</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>
                    {industry}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredCases.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No case studies found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No case studies match "${searchQuery}"`
                : 'No case studies available'
              }
            </p>
            {(searchQuery || selectedIndustry) && (
              <button
                onClick={() => {
                  handleSearch('');
                  setSelectedIndustry(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          // Case Studies Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredCases.map(caseStudy => (
              <Link
                key={caseStudy.slug}
                href={`/cases/${caseStudy.slug}`}
                onClick={() => handleCaseClick(caseStudy.slug)}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {caseStudy.title}
                    </h2>
                  </div>
                  
                  {/* Summary */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {caseStudy.summary}
                  </p>
                  
                  {/* Problem & Solution Preview */}
                  <div className="space-y-3 mb-4">
                    <div className="bg-red-50 rounded p-3">
                      <p className="text-sm font-medium text-red-900 mb-1">Challenge:</p>
                      <p className="text-sm text-red-700 line-clamp-2">
                        {caseStudy.problem}
                      </p>
                    </div>
                    
                    <div className="bg-green-50 rounded p-3">
                      <p className="text-sm font-medium text-green-900 mb-1">Solution:</p>
                      <p className="text-sm text-green-700 line-clamp-2">
                        {caseStudy.solution}
                      </p>
                    </div>
                  </div>
                  
                  {/* Results Preview */}
                  <div className="flex items-center text-sm text-gray-600 mb-4">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    <span>{(caseStudy.results?.length || 0)} key results</span>
                  </div>
                  
                  {/* Metadata */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      {caseStudy.industry && (
                        <div className="flex items-center">
                          <Building className="w-4 h-4 mr-1" />
                          {caseStudy.industry}
                        </div>
                      )}
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1" />
                        {new Date(caseStudy.updated).toLocaleDateString('en-US', {
                          month: 'short',
                          year: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="text-blue-600 font-medium group-hover:underline flex items-center">
                      Read Case Study
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {caseStudy.tags && caseStudy.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      {caseStudy.tags.slice(0, 3).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {caseStudy.tags.length > 3 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{caseStudy.tags.length - 3} more
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </Link>
            ))}
          </div>
        )}
        
        {/* Results Summary */}
        {searchQuery && filteredCases.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Found {filteredCases.length} {filteredCases.length === 1 ? 'case study' : 'case studies'} matching "{searchQuery}"
          </div>
        )}
        
        {/* Call to Action */}
        <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Have a Success Story?</h2>
          <p className="text-gray-700 mb-4">
            If you've used our calculators to achieve your goals, we'd love to hear about it! 
            Your story could inspire others facing similar challenges.
          </p>
          <div className="space-y-2">
            <a 
              href="/statistics-calculators" 
              className="inline-block text-blue-600 hover:text-blue-700"
            >
              → Explore our calculators
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}