import Script from 'next/script';
import type { Metadata } from 'next';
import { glossaryService } from '@/lib/services/glossary';
import GlossaryListClient from './GlossaryListClient';

export const metadata: Metadata = {
  title: 'Statistics Glossary - Terms and Definitions | TheStatsCalculator',
  description: 'Comprehensive glossary of statistical terms, definitions, and concepts. Learn about mean, median, standard deviation, GPA, and more statistical terminology.',
  keywords: 'statistics glossary, statistical terms, definitions, mean, median, standard deviation, GPA, statistical concepts',
  openGraph: {
    title: 'Statistics Glossary - Complete Terms and Definitions',
    description: 'Browse our comprehensive glossary of statistical terms and concepts with clear definitions and examples.',
    url: 'https://thestatscalculator.com/glossary',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/glossary',
  },
};

async function loadGlossaryData() {
  try {
    // 使用数据库服务获取术语数据
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

export default async function GlossaryPage() {
  const glossaryData = await loadGlossaryData();
  
  if (!glossaryData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Glossary Unavailable</h1>
          <p className="text-gray-600">We're unable to load the glossary at this time. Please try again later.</p>
        </div>
      </div>
    );
  }

  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Statistics Glossary',
    description: 'Comprehensive glossary of statistical terms and definitions',
    url: 'https://thestatscalculator.com/glossary',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Glossary', item: 'https://thestatscalculator.com/glossary' },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: glossaryData.terms.length,
      itemListElement: glossaryData.terms.map((term, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'DefinedTerm',
          '@id': `https://thestatscalculator.com/glossary/${term.slug}`,
          name: term.title,
          description: term.shortDescription,
          url: `https://thestatscalculator.com/glossary/${term.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <Script 
        id="ld-json-glossary-list" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <GlossaryListClient glossaryData={glossaryData} />
    </>
  );
}