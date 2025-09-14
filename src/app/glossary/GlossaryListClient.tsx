'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Search, Book, X, ChevronRight } from 'lucide-react';
import type { TGlossaryData } from '@/lib/glossary/glossarySchema';
import { groupTermsByLetter, getAvailableLetters, searchTerms, sortByRelevance } from '@/lib/glossary/glossaryUtils';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface GlossaryListClientProps {
  glossaryData: TGlossaryData;
}

export default function GlossaryListClient({ glossaryData }: GlossaryListClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLetter, setSelectedLetter] = useState<string | null>(null);

  // Read search query from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const search = params.get('search');
    if (search) {
      setSearchQuery(search);
    }
  }, []);

  // Filter and group terms
  const filteredTerms = useMemo(() => {
    let terms = glossaryData.terms;
    
    // Apply search filter
    if (searchQuery.trim()) {
      terms = searchTerms(terms, searchQuery);
      terms = sortByRelevance(terms, searchQuery);
    }
    
    // Apply letter filter
    if (selectedLetter && !searchQuery.trim()) {
      terms = terms.filter(term => {
        const firstLetter = (term.firstLetter || term.title[0]).toUpperCase();
        return firstLetter === selectedLetter;
      });
    }
    
    return terms;
  }, [glossaryData.terms, searchQuery, selectedLetter]);

  // Group terms by letter for display
  const groupedTerms = useMemo(() => {
    return groupTermsByLetter(filteredTerms);
  }, [filteredTerms]);

  // Get all available letters
  const availableLetters = useMemo(() => {
    return getAvailableLetters(glossaryData.terms);
  }, [glossaryData.terms]);

  // Track events
  const handleTermClick = (termSlug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'glossary_click', {
        term_slug: termSlug,
        to: 'detail',
        context: 'glossary_list',
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setSelectedLetter(null); // Clear letter filter when searching
    
    if (typeof window !== 'undefined' && (window as any).gtag && query) {
      (window as any).gtag('event', 'search_use', {
        query: query,
        results_count: filteredTerms.length,
        context: 'glossary',
      });
    }
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter === selectedLetter ? null : letter);
    setSearchQuery(''); // Clear search when using letter navigation
    
    // Scroll to the letter section
    const element = document.getElementById(`letter-${letter}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <Book className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Statistics Glossary</h1>
          </div>
          <p className="text-lg text-gray-600">
            Browse {glossaryData.terms.length} statistical terms and definitions. 
            Find clear explanations of concepts from mean to confidence intervals.
          </p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="bg-white shadow-sm sticky top-16 z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search glossary terms..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="w-full pl-8 pr-8 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              aria-label="Search glossary"
            />
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="absolute right-2.5 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* A-Z Navigation */}
      {!searchQuery && (
        <nav className="bg-gray-100 border-b sticky top-28 z-10" aria-label="Alphabetical navigation">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <div className="flex items-center space-x-2 overflow-x-auto">
              <span className="text-sm font-medium text-gray-700 mr-2 flex-shrink-0">Browse:</span>
              <div className="flex space-x-1">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                  const isAvailable = availableLetters.includes(letter);
                  const isSelected = selectedLetter === letter;
                  
                  return (
                    <button
                      key={letter}
                      onClick={() => isAvailable && handleLetterClick(letter)}
                      disabled={!isAvailable}
                      className={`
                        px-3 py-1 text-sm font-medium rounded transition-colors
                        ${isAvailable 
                          ? isSelected
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-600'
                          : 'text-gray-300 cursor-not-allowed'
                        }
                      `}
                      aria-label={`Filter by letter ${letter}`}
                      aria-pressed={isSelected}
                    >
                      {letter}
                    </button>
                  );
                })}
              </div>
              {selectedLetter && (
                <button
                  onClick={() => setSelectedLetter(null)}
                  className="ml-2 text-sm text-blue-600 hover:text-blue-700 flex-shrink-0"
                >
                  Clear filter
                </button>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredTerms.length === 0 ? (
          // Empty State
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h2 className="text-lg font-medium text-gray-900 mb-2">No terms found</h2>
            <p className="text-gray-600 mb-4">
              {searchQuery 
                ? `No glossary terms match "${searchQuery}"`
                : 'No terms available'
              }
            </p>
            {searchQuery && (
              <button
                onClick={() => handleSearch('')}
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                View all terms
              </button>
            )}
          </div>
        ) : (
          // Terms Grid
          <div className="space-y-8">
            {Array.from(groupedTerms.entries()).map(([letter, terms]) => (
              <section key={letter} id={`letter-${letter}`} className="scroll-mt-36">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 pb-2 border-b">
                  {letter}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {terms.map(term => (
                    <Link
                      key={term.slug}
                      href={`/glossary/${term.slug}`}
                      onClick={() => handleTermClick(term.slug)}
                      className="block bg-white rounded-lg border border-gray-200 p-4 hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors mb-2">
                        {term.title}
                      </h3>
                      <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                        {term.shortDescription}
                      </p>
                      <div className="flex items-center text-blue-600 text-sm font-medium group-hover:underline">
                        Read more
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            ))}
          </div>
        )}

        {/* Results Summary */}
        {searchQuery && filteredTerms.length > 0 && (
          <div className="mt-8 text-center text-sm text-gray-600">
            Found {filteredTerms.length} {filteredTerms.length === 1 ? 'term' : 'terms'} matching "{searchQuery}"
          </div>
        )}
      </main>
      
      <Footer />
    </div>
  );
}