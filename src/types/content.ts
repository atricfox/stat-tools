// Content Types for Internal Linking System
// Sprint 13 - T001: Content data structures and TypeScript types

export interface ContentFrontmatter {
  // Content type identifier
  type: 'howto' | 'faq' | 'case';
  
  // Unique slug for URL routing
  slug: string;
  
  // Display title
  title: string;
  
  // Short summary (100-200 chars)
  summary: string;
  
  // Tags for categorization and search
  tags: string[];
  
  // Related content slugs (explicit relationships)
  related?: {
    howto?: string[];
    faq?: string[];
    cases?: string[];
    tools?: string[];
    glossary?: string[];
  };
  
  // Mentioned entities (implicit relationships)
  mentions?: {
    tools?: string[];
    concepts?: string[];
  };
  
  // SEO metadata
  seo?: {
    metaDescription?: string;
    keywords?: string[];
    ogImage?: string;
  };
  
  // ISO-8601 timestamps
  created: string;
  updated: string;
  
  // Author information
  author?: {
    name: string;
    role?: string;
  };
  
  // Content status
  status: 'draft' | 'published' | 'archived';
  
  // Estimated reading time in minutes
  readingTime?: number;
}

// HowTo specific frontmatter
export interface HowToFrontmatter extends ContentFrontmatter {
  type: 'howto';
  
  // Tool slug for pre-filling
  targetTool?: string;
  
  // Pre-fill parameters (whitelist)
  prefillParams?: Record<string, any>;
  
  // Difficulty level
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  
  // Prerequisites
  prerequisites?: string[];
  
  // Expected outcomes
  outcomes?: string[];
}

// FAQ specific frontmatter
export interface FAQFrontmatter extends ContentFrontmatter {
  type: 'faq';
  
  // Category for grouping
  category?: string;
  
  // Priority for ordering
  priority?: number;
  
  // Whether to show on homepage
  featured?: boolean;
}

// Case study specific frontmatter
export interface CaseFrontmatter extends ContentFrontmatter {
  type: 'case';
  
  // Industry or domain
  industry?: string;
  
  // Problem statement
  problem: string;
  
  // Solution approach
  solution: string;
  
  // Key results
  results: string[];
  
  // Lessons learned
  lessons?: string[];
  
  // Tools used in the case
  toolsUsed: string[];
}

// Step structure for HowTo content
export interface HowToStep {
  id: string;
  name: string;
  description: string;
  image?: {
    url: string;
    alt: string;
  };
  tip?: string;
  warning?: string;
}

// FAQ item structure
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
  relatedQuestions?: string[];
}

// Content index for search and discovery
export interface ContentIndex {
  type: 'howto' | 'faq' | 'case';
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  updated: string;
  url: string;
}

// Related content recommendation
export interface RelatedContent {
  howto: ContentIndex[];
  faq: ContentIndex[];
  cases: ContentIndex[];
  tools: Array<{
    slug: string;
    name: string;
    url: string;
  }>;
  glossary: Array<{
    slug: string;
    term: string;
    url: string;
  }>;
}