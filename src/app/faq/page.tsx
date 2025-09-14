import Script from 'next/script';
import type { Metadata } from 'next';
import { contentService } from '@/lib/content/ContentService';
import FAQPageClient from './FAQPageClient';

export const metadata: Metadata = {
  title: 'Frequently Asked Questions - Statistics Help | TheStatsCalculator',
  description: 'Find answers to common questions about statistics, calculators, GPA, mean, median, standard deviation, and more.',
  keywords: 'statistics FAQ, calculator help, GPA questions, statistics help, mean median questions',
  openGraph: {
    title: 'Statistics FAQ - Frequently Asked Questions',
    description: 'Get answers to common statistics and calculator questions.',
    url: 'https://thestatscalculator.com/faq',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/faq',
  },
};

async function loadFAQData() {
  try {
    // 使用数据库服务获取FAQ数据
    const faqItems = contentService.getContentByType('faq');

    // 转换为TFAQItem格式以保持兼容性
    return faqItems.map(item => ({
      id: item.id,
      slug: item.slug,
      question: item.title,
      answer: item.content,
      category: item.tags?.[0] || 'general',
      difficulty: item.difficulty || 'beginner',
      relatedCalculators: item.industry ? [item.industry] : [],
      relatedTools: item.target_tool ? [item.target_tool] : [],
      tags: item.tags || [],
      frontmatter: {
        slug: item.slug,
        title: item.title,
        summary: item.summary,
        category: item.tags?.[0] || 'general',
        difficulty: item.difficulty || 'beginner',
        tags: item.tags || [],
        relatedCalculators: item.industry ? [item.industry] : [],
        relatedTools: item.target_tool ? [item.target_tool] : [],
        updated: item.updated_at
      },
      content: item.content,
      seoTitle: item.title,
      seoDescription: item.summary,
      lastUpdated: item.updated_at
    }));
  } catch (error) {
    console.error('Failed to load FAQ data from database:', error);
    return [];
  }
}

export default async function FAQPage() {
  const faqItems = await loadFAQData();
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    name: 'Statistics Frequently Asked Questions',
    description: 'Common questions and answers about statistics, calculators, and data analysis',
    url: 'https://thestatscalculator.com/faq',
    mainEntity: faqItems.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'FAQ', item: 'https://thestatscalculator.com/faq' },
      ],
    },
  };

  return (
    <>
      <Script 
        id="ld-json-faq" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <FAQPageClient faqItems={faqItems} />
    </>
  );
}