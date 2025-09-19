import Script from 'next/script';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { EnhancedContentService } from '@/lib/services/enhanced-content';
import type { THowToStep } from '@/lib/content/contentSchema';
import HowToDetailClient from './HowToDetailClient';

export const dynamic = 'force-static';

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

async function loadHowToContent(slug: string) {
  try {
    const contentService = new EnhancedContentService();
    const result = await contentService.getHowToWithSteps(slug);
    
    if (!result) {
      return null;
    }

    return {
      frontmatter: result.howto,
      steps: result.steps,
      content: result.content
    };
  } catch (error) {
    console.error('Failed to load HowTo content from database:', error);
    return null;
  }
}

export async function generateStaticParams() {
  try {
    const contentService = new EnhancedContentService();
    const howToItems = await contentService.getHowToList();

    return howToItems.map(item => ({
      slug: item.slug,
    }));
  } catch {
    return [];
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const content = await loadHowToContent(slug);
  if (!content) return {};

  return {
    title: `${content.frontmatter.title} | TheStatsCalculator`,
    description: content.frontmatter.seo?.metaDescription || content.frontmatter.summary,
    keywords: content.frontmatter.seo?.keywords?.join(', ') || content.frontmatter.tags.join(', '),
    openGraph: {
      title: content.frontmatter.title,
      description: content.frontmatter.summary,
      url: `https://thestatscalculator.com/how-to/${slug}`,
      siteName: 'TheStatsCalculator',
      type: 'article',
    },
    alternates: {
      canonical: `https://thestatscalculator.com/how-to/${slug}`,
    },
  };
}

export default async function HowToDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const content = await loadHowToContent(slug);
  
  if (!content) {
    notFound();
  }
  
  // Generate JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: content.frontmatter.title,
    description: content.frontmatter.summary,
    ...(content.frontmatter.readingTime && {
      totalTime: `PT${content.frontmatter.readingTime}M`
    }),
    ...(content.frontmatter.difficulty && {
      proficiencyLevel: content.frontmatter.difficulty
    }),
    ...(content.frontmatter.outcomes && {
      performTime: {
        '@type': 'Duration',
        description: content.frontmatter.outcomes.join('. ')
      }
    }),
    step: content.steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.description,
      ...(step.tip && {
        tip: {
          '@type': 'HowToTip',
          text: step.tip
        }
      }),
      ...(step.image && {
        image: {
          '@type': 'ImageObject',
          url: step.image.url,
          caption: step.image.alt
        }
      }),
      url: `https://thestatscalculator.com/how-to/${slug}#${step.id}`
    })),
    ...(content.frontmatter.targetTool && {
      tool: {
        '@type': 'SoftwareApplication',
        url: `https://thestatscalculator.com${content.frontmatter.targetTool}`,
        name: content.frontmatter.targetTool.split('/').pop()?.replace(/-/g, ' ')
      }
    }),
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://thestatscalculator.com' },
        { '@type': 'ListItem', position: 2, name: 'How-To Guides', item: 'https://thestatscalculator.com/how-to' },
        { '@type': 'ListItem', position: 3, name: content.frontmatter.title, item: `https://thestatscalculator.com/how-to/${slug}` },
      ],
    },
    author: content.frontmatter.author ? {
      '@type': 'Person',
      name: content.frontmatter.author.name,
      ...(content.frontmatter.author.role && { jobTitle: content.frontmatter.author.role })
    } : undefined,
    datePublished: content.frontmatter.created,
    dateModified: content.frontmatter.updated,
  };

  return (
    <>
      <Script 
        id="ld-json-howto" 
        type="application/ld+json" 
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} 
      />
      <HowToDetailClient 
        howto={content.frontmatter}
        steps={content.steps}
        content={content.content}
      />
    </>
  );
}