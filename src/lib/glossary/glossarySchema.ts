import { z } from 'zod';

// External link schema
const ExternalLinkSchema = z.object({
  title: z.string(),
  url: z.string().url(),
  description: z.string().optional(),
});

// SEO metadata schema
const SeoSchema = z.object({
  metaDescription: z.string().optional(),
  keywords: z.array(z.string()).optional(),
});

// Individual glossary term schema
export const GlossaryTermSchema = z.object({
  slug: z.string().regex(/^[a-z0-9-]+$/, 'Slug must be lowercase with hyphens only'),
  title: z.string().min(1).max(100),
  shortDescription: z.string().min(50).max(200),
  definition: z.string().min(150).max(500),
  misconceptions: z.array(z.string()).optional(),
  relatedTools: z.array(z.string()).optional(),
  relatedHubs: z.array(z.string()).optional(),
  seeAlso: z.array(z.string()).optional(),
  externalLinks: z.array(ExternalLinkSchema).optional(),
  updated: z.string().datetime().optional(),
  seo: SeoSchema.optional(),
  categories: z.array(z.string()).optional(),
  firstLetter: z.string().length(1).optional(),
});

// Complete glossary data schema
export const GlossaryDataSchema = z.object({
  version: z.string(),
  lastmod: z.string().datetime(),
  terms: z.array(GlossaryTermSchema),
});

// Type exports
export type TGlossaryTerm = z.infer<typeof GlossaryTermSchema>;
export type TGlossaryData = z.infer<typeof GlossaryDataSchema>;
export type TExternalLink = z.infer<typeof ExternalLinkSchema>;