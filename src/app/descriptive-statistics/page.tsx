import fs from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';
import type { Metadata } from 'next';
import { CalculatorsJson, type TCalculatorsJson } from '@/lib/hub/calculatorsSchema';
import UnifiedThemeHub from '@/components/hub/UnifiedThemeHub';
import { BarChart3, TrendingUp, Calculator, Activity } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Descriptive Statistics Calculators Hub | TheStatsCalculator',
  description: 'Comprehensive collection of descriptive statistics calculators for mean, median, standard deviation, variance, range, and more statistical measures.',
  keywords: 'descriptive statistics, mean calculator, median calculator, standard deviation, variance, range, statistical analysis tools',
  openGraph: {
    title: 'Descriptive Statistics Calculators Hub',
    description: 'Calculate mean, median, standard deviation, and other descriptive statistics with our comprehensive tools.',
    url: 'https://thestatscalculator.com/descriptive-statistics',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/descriptive-statistics',
  },
};

async function loadCalculatorsData(): Promise<TCalculatorsJson | null> {
  try {
    const file = path.resolve(process.cwd(), 'data', 'calculators.json');
    const raw = await fs.readFile(file, 'utf-8');
    const json = JSON.parse(raw);
    const parsed = CalculatorsJson.safeParse(json);
    if (!parsed.success) return null;
    return parsed.data;
  } catch {
    return null;
  }
}

// Fallback data if JSON loading fails
function getFallbackData(): TCalculatorsJson {
  return {
    groups: [
      {
        group_name: 'means-weighted',
        display_name: 'Mean & Weighted Average',
        sort_order: 1,
        items: [
          { name: 'Mean Calculator', url: '/calculator/mean', description: 'Calculate arithmetic mean (average) of a dataset', is_hot: true, is_new: false, sort_order: 1 },
          { name: 'Weighted Mean Calculator', url: '/calculator/weighted-mean', description: 'Calculate weighted average with custom weights', is_hot: false, is_new: false, sort_order: 2 },
          { name: 'Median Calculator', url: '/calculator/median', description: 'Compute the median of a dataset', is_hot: false, is_new: false, sort_order: 3 },
        ]
      },
      {
        group_name: 'dispersion',
        display_name: 'Variance & Standard Deviation',
        sort_order: 2,
        items: [
          { name: 'Standard Deviation Calculator', url: '/calculator/standard-deviation', description: 'Calculate standard deviation (sample/population)', is_hot: true, is_new: false, sort_order: 1 },
          { name: 'Variance Calculator', url: '/calculator/variance', description: 'Compute variance of a dataset', is_hot: false, is_new: false, sort_order: 2 },
          { name: 'Range Calculator', url: '/calculator/range', description: 'Find the difference between max and min', is_hot: false, is_new: false, sort_order: 3 },
        ]
      },
      {
        group_name: 'descriptive-others',
        display_name: 'Other Statistical Tools',
        sort_order: 3,
        items: [
          { name: 'Percent Error Calculator', url: '/calculator/percent-error', description: 'Calculate percent error between true and measured values', is_hot: false, is_new: false, sort_order: 1 },
        ]
      }
    ],
    lastmod: new Date().toISOString(),
  };
}

export default async function DescriptiveStatisticsHubPage() {
  const data = await loadCalculatorsData() || getFallbackData();

  const allowedTools = [
    '/calculator/mean',
    '/calculator/median',
    '/calculator/weighted-mean',
    '/calculator/standard-deviation',
    '/calculator/variance',
    '/calculator/range',
    '/calculator/percent-error',
  ];

  const guideCards = [
    {
      title: 'Mean vs Median vs Mode',
      description: 'Mean is the average, median is the middle value, and mode is the most frequent value. Choose based on your data distribution.',
      icon: <Calculator className="w-5 h-5" />,
    },
    {
      title: 'Sample vs Population',
      description: 'Use sample statistics when analyzing a subset of data, population statistics when analyzing complete datasets.',
      icon: <Activity className="w-5 h-5" />,
    },
    {
      title: 'Measuring Spread',
      description: 'Standard deviation and variance measure data spread. Range shows the difference between maximum and minimum values.',
      icon: <TrendingUp className="w-5 h-5" />,
    },
  ];

  const faqs = [
    {
      question: 'When should I use mean vs median?',
      answer: 'Use mean for normally distributed data without outliers. Use median when your data has outliers or is skewed, as median is more robust to extreme values.',
    },
    {
      question: 'What\'s the difference between sample and population standard deviation?',
      answer: 'Sample standard deviation (n-1 in denominator) is used when analyzing a sample from a larger population. Population standard deviation (n in denominator) is used when you have data for the entire population.',
    },
    {
      question: 'How do I interpret standard deviation?',
      answer: 'Standard deviation measures how spread out your data is. About 68% of data falls within 1 standard deviation of the mean, 95% within 2 standard deviations, and 99.7% within 3 standard deviations in a normal distribution.',
    },
    {
      question: 'What input formats are supported?',
      answer: 'Our calculators support various input formats including comma-separated values, space-separated values, and line-by-line entry. You can also paste data directly from spreadsheets.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Descriptive Statistics Calculators Hub',
    description: 'Complete collection of descriptive statistics calculation tools',
    url: 'https://thestatscalculator.com/descriptive-statistics',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Statistics Calculators', item: 'https://thestatscalculator.com/statistics-calculators' },
        { '@type': 'ListItem', position: 3, name: 'Descriptive Statistics', item: 'https://thestatscalculator.com/descriptive-statistics' },
      ],
    },
    hasPart: allowedTools.map((url, i) => {
      let tool = null;
      for (const group of data.groups) {
        tool = group.items.find(item => item.url === url);
        if (tool) break;
      }
      return tool ? {
        '@type': 'SoftwareApplication',
        position: i + 1,
        name: tool.name,
        url: `https://thestatscalculator.com${tool.url}`,
        description: tool.description,
        applicationCategory: 'EducationalApplication',
        operatingSystem: 'Web',
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
      } : null;
    }).filter(Boolean),
  };

  return (
    <>
      <Script 
        id="ld-json-descriptive-hub" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <UnifiedThemeHub
        title="Descriptive Statistics Calculators"
        description="Analyze your data with our comprehensive collection of descriptive statistics tools"
        themeId="descriptive-statistics"
        calculatorsData={data}
        allowedTools={allowedTools}
        guideCards={guideCards}
        faqs={faqs}
      />
    </>
  );
}