import { z } from 'zod';

// Base content frontmatter schema
const BaseContentFrontmatterSchema = z.object({
  type: z.enum(['howto', 'faq', 'case']),
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1).max(200),
  summary: z.string().min(50).max(300),
  tags: z.array(z.string()).min(1).max(10),
  related: z.object({
    howto: z.array(z.string()).optional(),
    faq: z.array(z.string()).optional(),
    cases: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    glossary: z.array(z.string()).optional(),
  }).optional(),
  mentions: z.object({
    tools: z.array(z.string()).optional(),
    concepts: z.array(z.string()).optional(),
  }).optional(),
  seo: z.object({
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional(),
  }).optional(),
  created: z.string().datetime(),
  updated: z.string().datetime(),
  author: z.object({
    name: z.string(),
    role: z.string().optional(),
  }).optional(),
  status: z.enum(['draft', 'published', 'archived']),
  readingTime: z.number().positive().optional(),
});

// HowTo specific frontmatter schema
export const HowToFrontmatterSchema = BaseContentFrontmatterSchema.extend({
  type: z.literal('howto'),
  targetTool: z.string().optional(),
  prefillParams: z.record(z.any()).optional(),
  difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
  prerequisites: z.array(z.string()).optional(),
  outcomes: z.array(z.string()).optional(),
});

// FAQ specific frontmatter schema
export const FAQFrontmatterSchema = BaseContentFrontmatterSchema.extend({
  type: z.literal('faq'),
  category: z.string().optional(),
  priority: z.number().int().min(0).max(100).optional(),
  featured: z.boolean().optional(),
});

// Case study specific frontmatter schema
export const CaseFrontmatterSchema = BaseContentFrontmatterSchema.extend({
  type: z.literal('case'),
  industry: z.string().optional(),
  problem: z.string().min(50).max(500),
  solution: z.string().min(50).max(500),
  results: z.array(z.string()).min(1).max(5),
  lessons: z.array(z.string()).optional(),
  toolsUsed: z.array(z.string()).min(1),
});

// Legal page specific frontmatter schema
export const LegalFrontmatterSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1).max(200),
  description: z.string().min(50).max(300),
  updated: z.string().datetime(),
  version: z.string().min(1).max(20),
  toc: z.array(z.object({
    id: z.string(),
    title: z.string(),
  })).min(1),
  seo: z.object({
    metaDescription: z.string().max(160).optional(),
    keywords: z.array(z.string()).optional(),
    ogImage: z.string().url().optional(),
  }).optional(),
});

// Union type for any content frontmatter
export const ContentFrontmatterSchema = z.discriminatedUnion('type', [
  HowToFrontmatterSchema,
  FAQFrontmatterSchema,
  CaseFrontmatterSchema,
]);

// HowTo step schema
export const HowToStepSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  image: z.object({
    url: z.string().url(),
    alt: z.string(),
  }).optional(),
  tip: z.string().optional(),
  warning: z.string().optional(),
});

// FAQ item schema
export const FAQItemSchema = z.object({
  id: z.string(),
  question: z.string(),
  answer: z.string(),
  category: z.string().optional(),
  relatedQuestions: z.array(z.string()).optional(),
});

// Content index schema for search
export const ContentIndexSchema = z.object({
  type: z.enum(['howto', 'faq', 'case']),
  slug: z.string(),
  title: z.string(),
  summary: z.string(),
  tags: z.array(z.string()),
  updated: z.string().datetime(),
  url: z.string(),
});

// Type exports
export type THowToFrontmatter = z.infer<typeof HowToFrontmatterSchema>;
export type TFAQFrontmatter = z.infer<typeof FAQFrontmatterSchema>;
export type TCaseFrontmatter = z.infer<typeof CaseFrontmatterSchema>;
export type TLegalFrontmatter = z.infer<typeof LegalFrontmatterSchema>;
export type TContentFrontmatter = z.infer<typeof ContentFrontmatterSchema>;
export type THowToStep = z.infer<typeof HowToStepSchema>;
export type TFAQItem = z.infer<typeof FAQItemSchema>;
export type TContentIndex = z.infer<typeof ContentIndexSchema>;