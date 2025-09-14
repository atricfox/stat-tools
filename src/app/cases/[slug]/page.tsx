import Script from 'next/script';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { contentService } from '@/lib/content/ContentService';
import CaseDetailClient from './CaseDetailClient';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function loadCaseContent(slug: string) {
  try {
    // 使用数据库服务获取案例内容
    const caseItem = contentService.getContentItemBySlug(slug, 'case');
    if (!caseItem) {
      return null;
    }

    // 获取案例详情
    const caseDetails = contentService.getCaseDetailsBySlug(slug);

    return {
      frontmatter: {
        slug: caseItem.slug,
        title: caseItem.title,
        summary: caseItem.summary,
        difficulty: caseItem.difficulty,
        industry: caseItem.industry,
        target_tool: caseItem.target_tool,
        tags: caseItem.tags || [],
        problem: caseDetails?.problem || '',
        solution: caseDetails?.solution || '',
        updated: caseItem.updated_at
      },
      content: {
        background: caseDetails?.background || '',
        challenge: caseDetails?.challenge || '',
        approach: caseDetails?.approach || {},
        results_detail: caseDetails?.results_detail || {},
        key_insights: caseDetails?.key_insights || {},
        recommendations: caseDetails?.recommendations || {}
      }
    };
  } catch (error) {
    console.error('Failed to load Case content from database:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    // 使用数据库服务获取所有案例的slug
    const caseItems = contentService.getContentByType('case');

    return caseItems.map(item => ({
      slug: item.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadCaseContent(slug);
  if (!content) return {};
  
  return {
    title: `${content.frontmatter.title} - Case Study | TheStatsCalculator`,
    description: content.frontmatter.seo?.metaDescription || content.frontmatter.summary,
    keywords: content.frontmatter.seo?.keywords?.join(', ') || content.frontmatter.tags.join(', '),
    openGraph: {
      title: content.frontmatter.title,
      description: content.frontmatter.summary,
      url: `https://thestatscalculator.com/cases/${params.slug}`,
      siteName: 'TheStatsCalculator',
      type: 'article',
    },
    alternates: {
      canonical: `https://thestatscalculator.com/cases/${params.slug}`,
    },
  };
}

export default async function CaseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const caseData = await loadCaseContent(slug);
  
  if (!caseData) {
    notFound();
  }
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    '@id': `https://thestatscalculator.com/cases/${params.slug}`,
    headline: caseData.frontmatter.title,
    description: caseData.frontmatter.summary,
    ...(caseData.frontmatter.industry && {
      about: {
        '@type': 'Thing',
        name: caseData.frontmatter.industry
      }
    }),
    author: caseData.frontmatter.author ? {
      '@type': 'Person',
      name: caseData.frontmatter.author.name,
      ...(caseData.frontmatter.author.role && { jobTitle: caseData.frontmatter.author.role })
    } : {
      '@type': 'Organization',
      name: 'TheStatsCalculator'
    },
    datePublished: caseData.frontmatter.created,
    dateModified: caseData.frontmatter.updated,
    keywords: caseData.frontmatter.tags.join(', '),
    ...(caseData.frontmatter.readingTime && {
      timeRequired: `PT${caseData.frontmatter.readingTime}M`
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'Case Studies', item: 'https://thestatscalculator.com/cases' },
        { '@type': 'ListItem', position: 3, name: caseData.frontmatter.title, item: `https://thestatscalculator.com/cases/${params.slug}` },
      ],
    },
    mainEntity: {
      '@type': 'CreativeWork',
      name: caseData.frontmatter.title,
      abstract: caseData.frontmatter.problem,
      text: caseData.frontmatter.solution,
      ...(caseData.frontmatter.toolsUsed && {
        mentions: caseData.frontmatter.toolsUsed.map(tool => ({
          '@type': 'SoftwareApplication',
          url: `https://thestatscalculator.com${tool}`,
          name: tool.split('/').pop()?.replace(/-/g, ' ')
        }))
      })
    }
  };

  return (
    <>
      <Script 
        id="ld-json-case" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <CaseDetailClient 
        caseStudy={caseData.frontmatter}
        content={caseData.content}
      />
    </>
  );
}