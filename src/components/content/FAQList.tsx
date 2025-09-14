'use client';

import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight, Search, HelpCircle, X } from 'lucide-react';
import Link from 'next/link';
import type { TFAQItem } from '@/lib/content/contentSchema';

interface FAQListProps {
  items: TFAQItem[];
  searchable?: boolean;
  groupByCategory?: boolean;
  onItemExpand?: (itemId: string, isExpanded: boolean) => void;
}

export default function FAQList({ 
  items, 
  searchable = true, 
  groupByCategory = true,
  onItemExpand 
}: FAQListProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');

  // Filter items based on search
  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    
    const query = searchQuery.toLowerCase();
    return items.filter(item => 
      item.question.toLowerCase().includes(query) ||
      item.answer.toLowerCase().includes(query) ||
      item.category?.toLowerCase().includes(query)
    );
  }, [items, searchQuery]);

  // Group items by category if requested
  const groupedItems = useMemo(() => {
    if (!groupByCategory) {
      return { 'All Questions': filteredItems };
    }

    const groups: Record<string, TFAQItem[]> = {};
    filteredItems.forEach(item => {
      const category = item.category || 'General';
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(item);
    });
    
    return groups;
  }, [filteredItems, groupByCategory]);

  const toggleItem = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    const isExpanding = !newExpanded.has(itemId);
    
    if (isExpanding) {
      newExpanded.add(itemId);
    } else {
      newExpanded.delete(itemId);
    }
    
    setExpandedItems(newExpanded);
    
    // Track event
    if (onItemExpand) {
      onItemExpand(itemId, isExpanding);
    }
    
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'faq_expand', {
        question_id: itemId,
        action: isExpanding ? 'expand' : 'collapse',
        context: 'faq_list',
      });
    }
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    
    if (typeof window !== 'undefined' && (window as any).gtag && query) {
      (window as any).gtag('event', 'search_use', {
        query: query,
        results_count: filteredItems.length,
        context: 'faq',
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      {searchable && (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search frequently asked questions..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
            aria-label="Search FAQs"
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
      )}

      {/* Empty State */}
      {filteredItems.length === 0 ? (
        <div className="text-center py-12">
          <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">
            {searchQuery 
              ? `No questions found matching "${searchQuery}"`
              : 'No questions available'
            }
          </p>
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
            >
              Clear search
            </button>
          )}
        </div>
      ) : (
        /* FAQ Groups */
        <div className="space-y-8">
          {Object.entries(groupedItems).map(([category, categoryItems]) => (
            <div key={category}>
              {groupByCategory && (
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {category}
                </h3>
              )}
              
              <div className="space-y-3" role="list">
                {categoryItems.map(item => {
                  const isExpanded = expandedItems.has(item.id);
                  
                  return (
                    <div
                      key={item.id}
                      className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                      role="listitem"
                    >
                      <button
                        onClick={() => toggleItem(item.id)}
                        className="w-full px-4 py-4 flex items-start gap-3 hover:bg-gray-50 transition-colors text-left"
                        aria-expanded={isExpanded}
                        aria-controls={`faq-${item.id}-answer`}
                      >
                        <div className="flex-shrink-0 mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="w-5 h-5 text-gray-500" />
                          ) : (
                            <ChevronRight className="w-5 h-5 text-gray-500" />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <h4 className="font-medium text-gray-900">
                            {item.question}
                          </h4>
                        </div>
                      </button>
                      
                      {isExpanded && (
                        <div
                          id={`faq-${item.id}-answer`}
                          className="px-4 pb-4 pl-12"
                        >
                          <div className="prose prose-sm max-w-none text-gray-700">
                            {item.answer}
                          </div>
                          
                          {item.relatedQuestions && item.relatedQuestions.length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <p className="text-sm font-medium text-gray-700 mb-2">
                                Related Questions:
                              </p>
                              <div className="flex flex-wrap gap-2">
                                {item.relatedQuestions.map(relatedId => {
                                  const relatedItem = items.find(i => i.id === relatedId);
                                  if (!relatedItem) return null;
                                  
                                  return (
                                    <button
                                      key={relatedId}
                                      onClick={() => {
                                        // Expand the related question
                                        setExpandedItems(new Set([relatedId]));
                                        // Scroll to it
                                        const element = document.querySelector(`[key="${relatedId}"]`);
                                        if (element) {
                                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                        }
                                      }}
                                      className="text-sm text-blue-600 hover:text-blue-700 hover:underline"
                                    >
                                      {relatedItem.question}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Results Summary */}
      {searchQuery && filteredItems.length > 0 && (
        <div className="text-center text-sm text-gray-600">
          Found {filteredItems.length} {filteredItems.length === 1 ? 'question' : 'questions'} matching "{searchQuery}"
        </div>
      )}
    </div>
  );
}