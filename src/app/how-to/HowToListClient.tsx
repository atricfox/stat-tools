'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { BookOpen, Clock, ChevronRight, Search, X, Filter, Target, CheckCircle } from 'lucide-react';
import type { THowToFrontmatter } from '@/lib/content/contentSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface HowToListClientProps {
  guides: (THowToFrontmatter & { steps?: any[] })[];
}

export default function HowToListClient({ guides }: HowToListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  // Get all unique tags and difficulties
  const { tags, difficulties } = useMemo(() => {
    const tagSet = new Set<string>();
    const difficultySet = new Set<string>();
    
    guides.forEach(guide => {
      guide.tags.forEach(tag => tagSet.add(tag));
      if (guide.difficulty) {
        difficultySet.add(guide.difficulty);
      }
    });
    
    return {
      tags: Array.from(tagSet).sort(),
      difficulties: Array.from(difficultySet).sort(),
    };
  }, [guides]);

  // Filter guides
  const filteredGuides = useMemo(() => {
    let filtered = guides;
    
    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(guide => 
        guide.title.toLowerCase().includes(query) ||
        guide.summary.toLowerCase().includes(query) ||
        guide.tags.some(tag => tag.toLowerCase().includes(query)) ||
        (guide.outcomes && guide.outcomes.some(outcome => outcome.toLowerCase().includes(query)))
      );
    }
    
    // Difficulty filter
    if (selectedDifficulty) {
      filtered = filtered.filter(guide => guide.difficulty === selectedDifficulty);
    }
    
    // Tag filter
    if (selectedTag) {
      filtered = filtered.filter(guide => guide.tags.includes(selectedTag));
    }
    
    return filtered;
  }, [guides, searchQuery, selectedDifficulty, selectedTag]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (typeof window !== 'undefined' && (window as any).gtag && query) {
      (window as any).gtag('event', 'search_use', {
        query: query,
        results_count: filteredGuides.length,
        context: 'howto',
      });
    }
  };

  const handleGuideClick = (slug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'howto_click', {
        guide_slug: slug,
        from_list: true,
      });
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'intermediate':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'advanced':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">How-To Guides</h1>
          </div>
          <p className="text-lg text-gray-600">
            Step-by-step tutorials to help you master statistical calculations and data analysis.
            Learn at your own pace with clear instructions and examples.
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
                placeholder="Search guides..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                aria-label="Search guides"
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
            
            {/* Difficulty Filter */}
            {difficulties.length > 0 && (
              <select
                value={selectedDifficulty || ''}
                onChange={(e) => setSelectedDifficulty(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by difficulty"
              >
                <option value="">All Levels</option>
                {difficulties.map(difficulty => (
                  <option key={difficulty} value={difficulty}>
                    {difficulty}
                  </option>
                ))}
              </select>
            )}
            
            {/* Tag Filter */}
            {tags.length > 0 && (
              <select
                value={selectedTag || ''}
                onChange={(e) => setSelectedTag(e.target.value || null)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Filter by topic"
              >
                <option value="">All Topics</option>
                {tags.map(tag => (
                  <option key={tag} value={tag}>
                    {tag}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredGuides.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h2 className="text-lg font-medium text-gray-900 mb-2">No guides found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No guides match "${searchQuery}"`
                : 'No guides available'
              }
            </p>
            {(searchQuery || selectedDifficulty || selectedTag) && (
              <button
                onClick={() => {
                  handleSearch('');
                  setSelectedDifficulty(null);
                  setSelectedTag(null);
                }}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          // Guides Grid
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredGuides.map(guide => (
              <Link
                key={guide.slug}
                href={`/how-to/${guide.slug}`}
                onClick={() => handleGuideClick(guide.slug)}
                className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:border-blue-400 hover:shadow-lg transition-all group"
              >
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {guide.title}
                    </h2>
                    {guide.difficulty && (
                      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${getDifficultyColor(guide.difficulty)}`}>
                        {guide.difficulty}
                      </span>
                    )}
                  </div>
                  
                  {/* Summary */}
                  <p className="text-gray-600 mb-4 line-clamp-2">
                    {guide.summary}
                  </p>
                  
                  {/* Prerequisites & Outcomes */}
                  <div className="space-y-3 mb-4">
                    {guide.prerequisites && guide.prerequisites.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <Target className="w-4 h-4 text-orange-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">Prerequisites:</p>
                          <p className="text-sm text-gray-600 line-clamp-1">
                            {guide.prerequisites.join(', ')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {guide.outcomes && guide.outcomes.length > 0 && (
                      <div className="flex items-start space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs font-medium text-gray-700 mb-1">You'll learn:</p>
                          <p className="text-sm text-gray-600 line-clamp-2">
                            {guide.outcomes.slice(0, 2).join(', ')}
                            {guide.outcomes.length > 2 && `, +${guide.outcomes.length - 2} more`}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Footer */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4 text-gray-500">
                      {guide.readingTime && (
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {guide.readingTime} min read
                        </div>
                      )}
                      {guide.steps && (
                        <div>
                          {guide.steps.length} steps
                        </div>
                      )}
                    </div>
                    
                    <div className="text-blue-600 font-medium group-hover:underline flex items-center">
                      Start Guide
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </div>
                  </div>
                  
                  {/* Tags */}
                  {guide.tags && guide.tags.length > 0 && (
                    <div className="mt-4 pt-4 border-t flex flex-wrap gap-2">
                      {guide.tags.slice(0, 4).map(tag => (
                        <span
                          key={tag}
                          className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                      {guide.tags.length > 4 && (
                        <span className="px-2 py-1 text-gray-500 text-xs">
                          +{guide.tags.length - 4} more
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
        {searchQuery && filteredGuides.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Found {filteredGuides.length} {filteredGuides.length === 1 ? 'guide' : 'guides'} matching "{searchQuery}"
          </div>
        )}
        
        {/* Call to Action */}
        <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Can't Find What You're Looking For?</h2>
          <p className="text-gray-700 mb-4">
            We're constantly adding new guides. If you need help with a specific calculation or concept,
            try our calculators or check our FAQ section.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <a 
              href="/statistics-calculators" 
              className="inline-block text-blue-600 hover:text-blue-700"
            >
              → Browse calculators
            </a>
            <a 
              href="/faq" 
              className="inline-block text-blue-600 hover:text-blue-700"
            >
              → View FAQ
            </a>
            <a 
              href="/glossary" 
              className="inline-block text-blue-600 hover:text-blue-700"
            >
              → Explore glossary
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}