'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Target, BookOpen, Calculator, ChevronRight } from 'lucide-react';
import type { THowToFrontmatter, THowToStep } from '@/lib/content/contentSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import HowToSteps from '@/components/content/HowToSteps';
import RelatedLinks from '@/components/content/RelatedLinks';
import { generatePrefillUrl } from '@/lib/content/prefillWhitelist';

interface HowToDetailClientProps {
  howto: THowToFrontmatter;
  steps: THowToStep[];
  content: string;
}

export default function HowToDetailClient({ howto, steps, content }: HowToDetailClientProps) {
  const handleToolCTAClick = () => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'howto_tool_cta_click', {
        howto_slug: howto.slug,
        tool_slug: howto.targetTool?.replace('/calculator/', ''),
        context: 'howto_detail',
      });
    }
  };

  // Prepare related links
  const relatedLinks = [
    ...(howto.related?.tools?.map(tool => ({
      type: 'tool' as const,
      title: tool.split('/').pop()?.replace(/-/g, ' ')
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Calculator',
      url: tool,
    })) || []),
    ...(howto.related?.glossary?.map(term => ({
      type: 'glossary' as const,
      title: term.charAt(0).toUpperCase() + term.slice(1).replace(/-/g, ' '),
      url: `/glossary/${term}`,
    })) || []),
    ...(howto.related?.faq?.map(faq => ({
      type: 'faq' as const,
      title: faq.replace(/-/g, ' ')
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      url: `/faq/${faq}`,
    })) || []),
  ];

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'beginner':
        return 'text-green-600 bg-green-50';
      case 'intermediate':
        return 'text-amber-600 bg-amber-50';
      case 'advanced':
        return 'text-red-600 bg-red-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Breadcrumb */}
      <nav className="bg-white border-b" aria-label="Breadcrumb">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
          <ol className="flex items-center space-x-2 text-sm">
            <li>
              <Link href="/" className="text-gray-500 hover:text-gray-700">
                Home
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/how-to" className="text-gray-500 hover:text-gray-700">
                How-To Guides
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{howto.title}</li>
          </ol>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-8">
            {/* Back Link */}
            <Link 
              href="/how-to" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Guides
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <BookOpen className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{howto.title}</h1>
                  <p className="text-lg text-gray-600">{howto.summary}</p>
                </div>
              </div>
              
              {/* Metadata */}
              <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t">
                {howto.readingTime && (
                  <div className="flex items-center text-sm text-gray-600">
                    <Clock className="w-4 h-4 mr-1" />
                    {howto.readingTime} min read
                  </div>
                )}
                {howto.difficulty && (
                  <div className={`flex items-center text-sm px-2 py-1 rounded-full ${getDifficultyColor(howto.difficulty)}`}>
                    <Target className="w-4 h-4 mr-1" />
                    {howto.difficulty.charAt(0).toUpperCase() + howto.difficulty.slice(1)}
                  </div>
                )}
                <div className="flex items-center text-sm text-gray-600">
                  {steps.length} steps
                </div>
              </div>
            </div>

            {/* Introduction */}
            {content && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <p className="text-gray-700">{content}</p>
              </div>
            )}

            {/* Prerequisites */}
            {howto.prerequisites && howto.prerequisites.length > 0 && (
              <div className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Prerequisites</h2>
                <ul className="space-y-2">
                  {howto.prerequisites.map((prereq, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">•</span>
                      <span className="text-gray-700">{prereq}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Steps */}
            <HowToSteps steps={steps} defaultExpanded={false} />

            {/* Expected Outcomes */}
            {howto.outcomes && howto.outcomes.length > 0 && (
              <div className="bg-green-50 rounded-lg border border-green-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">What You'll Achieve</h2>
                <ul className="space-y-2">
                  {howto.outcomes.map((outcome, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-green-600 mr-2">✓</span>
                      <span className="text-gray-700">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tool CTA */}
            {howto.targetTool && (
              <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-3">Try It Yourself</h2>
                <p className="text-gray-700 mb-4">
                  Ready to put this knowledge into practice? Use our calculator with pre-filled example values.
                </p>
                <Link
                  href={howto.prefillParams 
                    ? generatePrefillUrl(howto.targetTool, howto.prefillParams)
                    : howto.targetTool
                  }
                  onClick={handleToolCTAClick}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Calculator className="w-5 h-5 mr-2" />
                  Open Calculator
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Link>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related Content */}
            {relatedLinks.length > 0 && (
              <RelatedLinks links={relatedLinks} title="Related Resources" />
            )}

            {/* Tags */}
            {howto.tags && howto.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {howto.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Last Updated */}
            <div className="text-sm text-gray-500">
              Last updated: {new Date(howto.updated).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </div>
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}