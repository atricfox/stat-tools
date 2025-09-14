import type { TGlossaryTerm, TGlossaryData } from './glossarySchema';

/**
 * Group glossary terms by first letter for A-Z index
 */
export function groupTermsByLetter(terms: TGlossaryTerm[]): Map<string, TGlossaryTerm[]> {
  const grouped = new Map<string, TGlossaryTerm[]>();
  
  terms.forEach(term => {
    const letter = (term.firstLetter || term.title[0]).toUpperCase();
    if (!grouped.has(letter)) {
      grouped.set(letter, []);
    }
    grouped.get(letter)!.push(term);
  });
  
  // Sort terms within each letter group
  grouped.forEach((terms, letter) => {
    grouped.set(letter, terms.sort((a, b) => a.title.localeCompare(b.title)));
  });
  
  return grouped;
}

/**
 * Get all unique letters that have terms
 */
export function getAvailableLetters(terms: TGlossaryTerm[]): string[] {
  const letters = new Set<string>();
  terms.forEach(term => {
    const letter = (term.firstLetter || term.title[0]).toUpperCase();
    letters.add(letter);
  });
  return Array.from(letters).sort();
}

/**
 * Search glossary terms by query
 */
export function searchTerms(terms: TGlossaryTerm[], query: string): TGlossaryTerm[] {
  if (!query || query.trim() === '') {
    return terms;
  }
  
  const normalizedQuery = query.toLowerCase().trim();
  
  return terms.filter(term => {
    // Search in multiple fields
    const searchableText = [
      term.title,
      term.shortDescription,
      term.definition,
      ...(term.categories || []),
      ...(term.seo?.keywords || [])
    ].join(' ').toLowerCase();
    
    return searchableText.includes(normalizedQuery);
  });
}

/**
 * Get related terms by slugs
 */
export function getRelatedTerms(
  allTerms: TGlossaryTerm[], 
  slugs: string[] | undefined
): TGlossaryTerm[] {
  if (!slugs || slugs.length === 0) {
    return [];
  }
  
  return allTerms.filter(term => slugs.includes(term.slug));
}

/**
 * Calculate the most recent lastmod from all terms
 */
export function calculateLastmod(terms: TGlossaryTerm[]): string {
  const dates = terms
    .map(term => term.updated)
    .filter((date): date is string => !!date)
    .map(date => new Date(date));
  
  if (dates.length === 0) {
    return new Date().toISOString();
  }
  
  const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
  return maxDate.toISOString();
}

/**
 * Generate breadcrumb items for a glossary term
 */
export function generateBreadcrumbs(term: TGlossaryTerm) {
  return [
    { name: 'Home', url: '/' },
    { name: 'Glossary', url: '/glossary' },
    { name: term.title, url: `/glossary/${term.slug}` }
  ];
}

/**
 * Format term for search indexing
 */
export function formatForSearch(term: TGlossaryTerm) {
  return {
    objectID: term.slug,
    title: term.title,
    description: term.shortDescription,
    content: term.definition,
    url: `/glossary/${term.slug}`,
    categories: term.categories || [],
    type: 'glossary'
  };
}

/**
 * Sort terms by relevance to a search query
 */
export function sortByRelevance(terms: TGlossaryTerm[], query: string): TGlossaryTerm[] {
  if (!query) return terms;
  
  const normalizedQuery = query.toLowerCase();
  
  return terms.sort((a, b) => {
    // Exact title match gets highest priority
    const aExactTitle = a.title.toLowerCase() === normalizedQuery;
    const bExactTitle = b.title.toLowerCase() === normalizedQuery;
    if (aExactTitle && !bExactTitle) return -1;
    if (!aExactTitle && bExactTitle) return 1;
    
    // Title starts with query
    const aTitleStarts = a.title.toLowerCase().startsWith(normalizedQuery);
    const bTitleStarts = b.title.toLowerCase().startsWith(normalizedQuery);
    if (aTitleStarts && !bTitleStarts) return -1;
    if (!aTitleStarts && bTitleStarts) return 1;
    
    // Title contains query
    const aTitleContains = a.title.toLowerCase().includes(normalizedQuery);
    const bTitleContains = b.title.toLowerCase().includes(normalizedQuery);
    if (aTitleContains && !bTitleContains) return -1;
    if (!aTitleContains && bTitleContains) return 1;
    
    // Alphabetical order as fallback
    return a.title.localeCompare(b.title);
  });
}