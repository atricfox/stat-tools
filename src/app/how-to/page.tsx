import Script from 'next/script';
import type { Metadata } from 'next';
import { contentService } from '@/lib/content/ContentService';
import HowToListClient from './HowToListClient';

export const metadata: Metadata = {
  title: 'How-To Guides - Step-by-Step Tutorials | TheStatsCalculator',
  description: 'Comprehensive step-by-step guides for statistical calculations, data analysis, and using our calculators effectively.',
  keywords: 'how-to guides, statistics tutorials, calculator guides, step-by-step instructions, math tutorials',
  openGraph: {
    title: 'Statistics How-To Guides',
    description: 'Learn statistics with our detailed step-by-step tutorials and guides.',
    url: 'https://thestatscalculator.com/how-to',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/how-to',
  },
};

async function loadHowToGuides() {
  try {
    // 使用数据库服务获取How-to指南数据
    const howToItems = contentService.getContentByType('howto');

    // 转换为原有格式以保持兼容性
    const guides = howToItems.map(item => ({
      slug: item.slug,
      title: item.title,
      summary: item.summary,
      difficulty: item.difficulty,
      industry: item.industry,
      target_tool: item.target_tool,
      tags: item.tags || [],
      updated: item.updated_at,
      created: item.created_at,
      featured: item.featured,
      priority: item.priority,
      readingTime: item.reading_time,
      steps: [] // 将从howto_steps获取
    }));

    // 获取步骤数据
    for (const guide of guides) {
      const steps = contentService.getHowToStepsBySlug(guide.slug);
      guide.steps = steps;
    }

    // 按更新时间排序
    guides.sort((a, b) =>
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    );

    return guides;
  } catch (error) {
    console.error('Failed to load how-to guides from database:', error);
    return [];
  }
}

export default async function HowToPage() {
  const guides = await loadHowToGuides();
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Statistics How-To Guides',
    description: 'Collection of step-by-step guides for statistical calculations and analysis',
    url: 'https://thestatscalculator.com/how-to',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'How-To Guides', item: 'https://thestatscalculator.com/how-to' },
      ],
    },
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: guides.length,
      itemListElement: guides.map((guide, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'HowTo',
          name: guide.title,
          description: guide.summary,
          url: `https://thestatscalculator.com/how-to/${guide.slug}`,
        },
      })),
    },
  };

  return (
    <>
      <Script 
        id="ld-json-howto-list" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <HowToListClient guides={guides} />
    </>
  );
}