import fs from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';
import type { Metadata } from 'next';
import { CalculatorsJson, type TCalculatorsJson } from '@/lib/hub/calculatorsSchema';
import StatisticsCalculatorsHubSEO from './StatisticsCalculatorsHubSEO';

export const revalidate = 86400; // Regenerate daily

export const metadata: Metadata = {
  title: 'Statistics Calculators Hub - All Statistical Tools | TheStatsCalculator',
  description:
    'Complete collection of statistics calculators for mean, median, standard deviation, GPA, and more. Find the right statistical tool for your analysis.',
  keywords: 'statistics calculators, statistical tools, mean calculator, median calculator, standard deviation, GPA calculator, statistical analysis',
  openGraph: {
    title: 'Statistics Calculators Hub - All Statistical Tools',
    description: 'Complete collection of statistics calculators for mean, median, standard deviation, GPA, and more.',
    url: 'https://thestatscalculator.com/statistics-calculators',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/statistics-calculators',
  },
};

async function loadData(): Promise<TCalculatorsJson | null> {
  try {
    // Direct database access (server-side)
    const { getDb } = await import('@/lib/db/db-utils');
    const { createCalculatorsService } = await import('@/lib/db/calculators-service');

    const db = getDb();
    const service = createCalculatorsService(db);
    const data = await service.getCalculatorsData();

    const validationResult = CalculatorsJson.safeParse(data);
    if (validationResult.success) {
      return validationResult.data;
    }

    // Fallback to local file if database fails
    const file = path.resolve(process.cwd(), 'data', 'calculators.json');
    const raw = await fs.readFile(file, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = CalculatorsJson.safeParse(json);
    if (!parsed.success) return null;
    return parsed.data;
  } catch (error) {
    console.warn('Failed to load calculators data:', error);
    return null;
  }
}

function Fallback() {
  const fallbackData: TCalculatorsJson = {
    groups: [
      {
        group_name: 'quick-start',
        display_name: 'Quick Start',
        sort_order: 1,
        items: [
          { name: 'Mean Calculator', url: '/calculator/mean', description: 'Compute arithmetic mean', is_hot: true, is_new: false, sort_order: 1 },
          { name: 'Weighted Mean Calculator', url: '/calculator/weighted-mean', description: 'Compute weighted average', is_hot: false, is_new: false, sort_order: 2 },
          { name: 'Standard Deviation Calculator', url: '/calculator/standard-deviation', description: 'Sample/Population SD', is_hot: true, is_new: false, sort_order: 3 },
          { name: 'GPA Calculator', url: '/calculator/gpa', description: 'Calculate GPA', is_hot: true, is_new: false, sort_order: 4 },
        ],
      },
    ],
    lastmod: new Date().toISOString(),
  };
  
  return <StatisticsCalculatorsHubSEO calculatorsData={fallbackData} />;
}

export default async function Page() {
  const data = await loadData();
  if (!data) return <Fallback />;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Statistics Calculators Hub',
    description:
      'Complete collection of statistics calculators for mean, median, standard deviation, GPA, and more.',
    url: 'https://thestatscalculator.com/statistics-calculators',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Statistics Calculators', item: 'https://thestatscalculator.com/statistics-calculators' },
      ],
    },
    hasPart: data.groups.map((g, gi) => ({
      '@type': 'ItemList',
      name: g.display_name,
      position: gi + 1,
      itemListElement: g.items.map((it, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'SoftwareApplication',
          name: it.name,
          url: `https://thestatscalculator.com${it.url}`,
          description: it.description,
          applicationCategory: 'EducationalApplication',
          operatingSystem: 'Web',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
      })),
    })),
  };

  return (
    <>
      <Script 
        id="ld-json-hub" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <StatisticsCalculatorsHubSEO calculatorsData={data} />
    </>
  );
}

