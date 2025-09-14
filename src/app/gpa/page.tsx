import fs from 'node:fs/promises';
import path from 'node:path';
import Script from 'next/script';
import type { Metadata } from 'next';
import { CalculatorsJson, type TCalculatorsJson } from '@/lib/hub/calculatorsSchema';
import UnifiedThemeHub from '@/components/hub/UnifiedThemeHub';
import { GraduationCap, Scale, Calendar, Target } from 'lucide-react';

export const metadata: Metadata = {
  title: 'GPA Calculators Hub - Grade Point Average Tools | TheStatsCalculator',
  description: 'Complete collection of GPA calculators including weighted GPA, unweighted GPA, cumulative GPA, final grade, and semester grade calculators.',
  keywords: 'GPA calculator, grade point average, weighted GPA, unweighted GPA, cumulative GPA, final grade calculator, semester GPA',
  openGraph: {
    title: 'GPA Calculators Hub - All GPA & Grade Tools',
    description: 'Calculate your GPA with our comprehensive collection of grade calculators. Weighted, unweighted, cumulative, and more.',
    url: 'https://thestatscalculator.com/gpa',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/gpa',
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
    groups: [{
      group_name: 'gpa-grades',
      display_name: 'GPA & Grade Tools',
      sort_order: 1,
      items: [
        { name: 'GPA Calculator', url: '/calculator/gpa', description: 'Calculate weighted GPA with multiple grading systems', is_hot: true, is_new: false, sort_order: 1 },
        { name: 'Unweighted GPA Calculator', url: '/calculator/unweighted-gpa', description: 'Calculate unweighted GPA on standard 4.0 scale', is_hot: false, is_new: true, sort_order: 2 },
        { name: 'Cumulative GPA Calculator', url: '/calculator/cumulative-gpa', description: 'Calculate cumulative GPA for graduate school applications', is_hot: false, is_new: false, sort_order: 3 },
        { name: 'Final Grade Calculator', url: '/calculator/final-grade', description: 'Calculate the score needed on your final exam', is_hot: true, is_new: false, sort_order: 4 },
        { name: 'Semester Grade Calculator', url: '/calculator/semester-grade', description: 'Calculate weighted semester grade from multiple courses', is_hot: false, is_new: false, sort_order: 5 },
      ]
    }],
    lastmod: new Date().toISOString(),
  };
}

export default async function GPAHubPage() {
  const data = await loadCalculatorsData() || getFallbackData();

  const allowedTools = [
    '/calculator/gpa',
    '/calculator/unweighted-gpa',
    '/calculator/cumulative-gpa',
    '/calculator/final-grade',
    '/calculator/semester-grade',
  ];

  const guideCards = [
    {
      title: 'Weighted vs Unweighted GPA',
      description: 'Weighted GPA gives extra points for advanced courses (AP/IB/Honors), while unweighted treats all courses equally on a 4.0 scale.',
      icon: <Scale className="w-5 h-5" />,
    },
    {
      title: 'Semester vs Cumulative',
      description: 'Semester GPA covers one term only, while cumulative GPA includes all semesters throughout your academic career.',
      icon: <Calendar className="w-5 h-5" />,
    },
    {
      title: 'Final Grade Planning',
      description: 'Calculate exactly what score you need on your final exam to achieve your target grade in the course.',
      icon: <Target className="w-5 h-5" />,
    },
  ];

  const faqs = [
    {
      question: 'What grading scales are supported?',
      answer: 'Our calculators support multiple grading scales including 4.0, 4.3, and 4.5 scales, as well as plus/minus grading systems. You can select the scale that matches your institution.',
    },
    {
      question: 'Should I use weighted or unweighted GPA?',
      answer: 'Use weighted GPA if your school gives extra points for AP, IB, or Honors courses. Use unweighted GPA for a standard comparison across all courses or if your school doesn\'t weight grades.',
    },
    {
      question: 'How do I calculate my cumulative GPA?',
      answer: 'Enter all your courses from all semesters with their credit hours and grades. The calculator will compute your overall GPA across your entire academic record.',
    },
    {
      question: 'Can I exclude certain courses from my GPA calculation?',
      answer: 'Yes, most of our calculators allow you to include or exclude specific courses. This is useful for calculating major GPA or excluding pass/fail courses.',
    },
  ];

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'GPA Calculators Hub',
    description: 'Complete collection of GPA and grade calculation tools',
    url: 'https://thestatscalculator.com/gpa',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Statistics Calculators', item: 'https://thestatscalculator.com/statistics-calculators' },
        { '@type': 'ListItem', position: 3, name: 'GPA Calculators', item: 'https://thestatscalculator.com/gpa' },
      ],
    },
    hasPart: allowedTools.map((url, i) => {
      const tool = data.groups[0]?.items.find(item => item.url === url);
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
        id="ld-json-gpa-hub" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <UnifiedThemeHub
        title="GPA Calculators Hub"
        description="Calculate your Grade Point Average with our comprehensive collection of GPA tools"
        themeId="gpa"
        calculatorsData={data}
        allowedTools={allowedTools}
        guideCards={guideCards}
        faqs={faqs}
      />
    </>
  );
}