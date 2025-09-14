import Script from 'next/script';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { glossaryService } from '@/lib/services/glossary';
import { getRelatedTerms } from '@/lib/glossary/glossaryUtils';
import GlossaryDetailClient from './GlossaryDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function loadTermBySlug(slug: string) {
  try {
    const result = await glossaryService.getTerms({ search: slug });
    const term = result.terms.find(t => t.slug === slug);
    return term || null;
  } catch (error) {
    console.error('Failed to load term from database:', error);
    return null;
  }
}

async function loadGlossaryData() {
  try {
    const result = await glossaryService.getTerms();

    // 转换为原有格式以保持兼容性
    const glossaryData = {
      terms: result.terms.map(term => ({
        slug: term.slug,
        title: term.title,
        shortDescription: term.short_description || '',
        definition: term.definition,
        firstLetter: term.first_letter || term.title.charAt(0).toUpperCase(),
        categories: term.categories?.map(cat => cat.name) || [],
        createdAt: term.created_at,
        updatedAt: term.updated_at
      })),
      categories: result.categories.map(cat => ({
        name: cat.name,
        displayName: cat.display_name,
        description: cat.description || ''
      }))
    };

    return glossaryData;
  } catch (error) {
    console.error('Failed to load glossary data from database:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const result = await glossaryService.getTerms({ pageSize: 1000 });
    return result.terms.map(term => ({
      slug: term.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const term = await loadTermBySlug(slug);
  if (!term) return {};
  
  return {
    title: `${term.title} - Definition and Explanation | TheStatsCalculator`,
    description: term.seo?.metaDescription || term.shortDescription,
    keywords: term.seo?.keywords?.join(', ') || `${term.title}, statistics, definition, glossary`,
    openGraph: {
      title: `${term.title} - Statistical Term Definition`,
      description: term.shortDescription,
      url: `https://thestatscalculator.com/glossary/${term.slug}`,
      siteName: 'TheStatsCalculator',
      type: 'article',
    },
    alternates: {
      canonical: `https://thestatscalculator.com/glossary/${term.slug}`,
    },
  };
}

export default async function GlossaryDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const term = await loadTermBySlug(slug);

  if (!term) {
    notFound();
  }
  
  if (!term) {
    notFound();
  }
  
  // Get related terms
  const relatedTerms = getRelatedTerms(glossaryData.terms, term.seeAlso);
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DefinedTerm',
    '@id': `https://thestatscalculator.com/glossary/${term.slug}`,
    name: term.title,
    description: term.definition,
    url: `https://thestatscalculator.com/glossary/${term.slug}`,
    inDefinedTermSet: {
      '@type': 'DefinedTermSet',
      '@id': 'https://thestatscalculator.com/glossary',
      name: 'Statistics Glossary',
    },
    ...(term.relatedTools && term.relatedTools.length > 0 && {
      mentions: term.relatedTools.map(tool => ({
        '@type': 'SoftwareApplication',
        url: `https://thestatscalculator.com${tool}`,
      })),
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://thestatscalculator.com/glossary' },
        { '@type': 'ListItem', position: 3, name: term.title, item: `https://thestatscalculator.com/glossary/${term.slug}` },
      ],
    },
  };

  return (
    <>
      <Script 
        id="ld-json-glossary-detail" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <GlossaryDetailClient 
        term={term} 
        relatedTerms={relatedTerms}
        allTerms={glossaryData.terms}
      />
    </>
  );
}