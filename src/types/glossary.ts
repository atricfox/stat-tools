// Glossary Term Data Contract
// Sprint 12 - T001: Glossary data structure and TypeScript types

export interface GlossaryTerm {
  // Unique identifier for URL routing
  slug: string;
  
  // Display title of the term
  title: string;
  
  // Short description (for list view, 50-100 chars)
  shortDescription: string;
  
  // Full definition (80-150 words for detail page)
  definition: string;
  
  // Common misconceptions or mistakes (1-2 items)
  misconceptions?: string[];
  
  // Related calculator tools (slugs)
  relatedTools?: string[];
  
  // Related theme hub pages (slugs)
  relatedHubs?: string[];
  
  // See also - related glossary terms (slugs)
  seeAlso?: string[];
  
  // External links for further reading
  externalLinks?: Array<{
    title: string;
    url: string;
    description?: string;
  }>;
  
  // ISO-8601 timestamp for last update
  updated?: string;
  
  // SEO metadata
  seo?: {
    metaDescription?: string;
    keywords?: string[];
  };
  
  // Categories or tags for grouping
  categories?: string[];
  
  // First letter for A-Z indexing (auto-generated from title)
  firstLetter?: string;
}

export interface GlossaryData {
  terms: GlossaryTerm[];
  lastmod: string; // ISO-8601, max of all term updates
  version: string;
}

// Helper type for A-Z grouping
export interface GlossaryGroup {
  letter: string;
  terms: GlossaryTerm[];
}

// Search result type
export interface GlossarySearchResult {
  term: GlossaryTerm;
  relevanceScore?: number;
  matchedFields?: string[];
}