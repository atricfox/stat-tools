import Script from 'next/script';
import type { Metadata } from 'next';
import { contentService } from '@/lib/content/ContentService';
import CasesListClient from './CasesListClient';

export const metadata: Metadata = {
  title: 'Case Studies - Success Stories & Examples | TheStatsCalculator',
  description: 'Real-world case studies and success stories using statistical analysis and calculators. Learn from practical examples and data-driven strategies.',
  keywords: 'case studies, success stories, statistical analysis examples, GPA improvement, data analysis cases',
  openGraph: {
    title: 'Statistical Analysis Case Studies',
    description: 'Learn from real-world examples of statistical analysis and data-driven decision making.',
    url: 'https://thestatscalculator.com/cases',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/cases',
  },
};

async function loadCaseStudies() {
  try {
    // 使用数据库服务获取案例数据
    const caseItems = contentService.getContentByType('case');

    // 转换为原有格式以保持兼容性
    const cases = caseItems.map(item => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      content: item.content,
      difficulty: item.difficulty,
      industry: item.industry,
      target_tool: item.target_tool,
      tags: item.tags || [],
      problem: '', // 将从case_details获取
      solution: '', // 将从case_details获取
      updated: item.updated_at,
      featured: item.featured,
      priority: item.priority
    }));

    // 获取案例详情
    for (const caseItem of cases) {
      const details = contentService.getCaseDetailsBySlug(caseItem.slug);
      if (details) {
        caseItem.problem = details.problem || '';
        caseItem.solution = details.solution || '';
      }
    }

    // 按更新时间排序
    cases.sort((a, b) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return cases;
  } catch (error) {
    console.error('Failed to load case studies from database:', error);
    return [];
  }
}

export default async function CasesPage() {
  const caseStudies = await loadCaseStudies();
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Statistical Analysis Case Studies',
    description: 'Collection of real-world case studies and success stories using statistical analysis',
    url: 'https://thestatscalculator.com/cases',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://thestatscalculator.com/cases' },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: caseStudies.length,
      itemListElement: caseStudies.map((caseStudy, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'Article',
          headline: caseStudy.title,
          description: caseStudy.summary,
          url: `https://thestatscalculator.com/cases/${caseStudy.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <Script 
        id="ld-json-cases-list" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <CasesListClient caseStudies={caseStudies} />
    </>
  );
}