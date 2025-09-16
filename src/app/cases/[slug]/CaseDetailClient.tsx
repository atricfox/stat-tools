'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, FileText, Target, Lightbulb, TrendingUp, Calculator, ChevronRight, Building } from 'lucide-react';
import type { TCaseFrontmatter } from '@/lib/content/contentSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import RelatedLinks from '@/components/content/RelatedLinks';

interface CaseDetailClientProps {
  caseStudy: TCaseFrontmatter;
  content: any;
}

export default function CaseDetailClient({ caseStudy, content }: CaseDetailClientProps) {
  const handleToolClick = (toolUrl: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'case_to_tool_click', {
        case_slug: caseStudy.slug,
        tool_slug: toolUrl.replace('/calculator/', ''),
        context: 'case_detail',
      });
    }
  };

  // Prepare related links
  const relatedLinks = [
    ...(caseStudy.related?.tools?.map(tool => ({
      type: 'tool' as const,
      title: tool.split('/').pop()?.replace(/-/g, ' ')
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' Calculator',
      url: tool,
    })) || []),
    ...(caseStudy.related?.faq?.map(faq => ({
      type: 'faq' as const,
      title: faq.replace(/-/g, ' ')
        .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
      url: `/faq/${faq}`,
    })) || []),
    ...(caseStudy.related?.glossary?.map(term => ({
      type: 'glossary' as const,
      title: term.charAt(0).toUpperCase() + term.slice(1).replace(/-/g, ' '),
      url: `/glossary/${term}`,
    })) || []),
  ];

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
              <Link href="/cases" className="text-gray-500 hover:text-gray-700">
                Case Studies
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{caseStudy.title}</li>
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
              href="/cases" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Case Studies
            </Link>

            {/* Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <FileText className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div className="flex-grow">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{caseStudy.title}</h1>
                  <p className="text-lg text-gray-600">{caseStudy.summary}</p>
                </div>
              </div>
              
              {/* Metadata */}
              {caseStudy.industry && (
                <div className="flex items-center gap-2 mt-4 pt-4 border-t">
                  <Building className="w-4 h-4 text-gray-500" />
                  <span className="text-sm text-gray-600">Industry: {caseStudy.industry}</span>
                </div>
              )}
            </div>

            {/* Background */}
            {content.background && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Background</h2>
                <p className="text-gray-700">{content.background}</p>
              </section>
            )}

            {/* Problem */}
            <section className="bg-red-50 rounded-lg border border-red-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Target className="w-5 h-5 mr-2 text-red-600" />
                The Challenge
              </h2>
              <p className="text-gray-700">{caseStudy.problem}</p>
              {content.challenge && (
                <p className="text-gray-700 mt-4">{content.challenge}</p>
              )}
            </section>

            {/* Solution */}
            <section className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-blue-600" />
                The Solution
              </h2>
              <p className="text-gray-700">{caseStudy.solution}</p>
              
              {/* Approach Steps */}
              {content.approach && (
                <div className="mt-6 space-y-4">
                  {Object.entries(content.approach).map(([key, step]: [string, any]) => (
                    <div key={key} className="bg-white rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">{step.title}</h3>
                      <p className="text-gray-700">{step.description}</p>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Results */}
            <section className="bg-green-50 rounded-lg border border-green-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Results
              </h2>
              <ul className="space-y-2">
                {caseStudy.results?.map((result, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-600 mr-2">✓</span>
                    <span className="text-gray-700">{result}</span>
                  </li>
                )) || <li className="text-gray-500">No results available</li>}
              </ul>
              
              {/* Detailed Results */}
              {content.results_detail && (
                <div className="mt-6 space-y-4">
                  {Object.entries(content.results_detail).map(([key, detail]: [string, any]) => (
                    <div key={key} className="bg-white rounded-lg p-4">
                      <h3 className="font-medium text-gray-900 mb-2">
                        {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                      </h3>
                      {detail.courses && (
                        <ul className="text-sm text-gray-600 space-y-1">
                          {detail.courses.map((course: string, i: number) => (
                            <li key={i}>{course}</li>
                          ))}
                        </ul>
                      )}
                      {detail.semester_gpa && (
                        <p className="text-sm text-gray-600 mt-2">
                          Semester GPA: <strong>{detail.semester_gpa}</strong>
                        </p>
                      )}
                      {detail.cumulative_gpa && (
                        <p className="text-sm text-gray-600">
                          Cumulative GPA: <strong>{detail.cumulative_gpa}</strong>
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* Lessons Learned */}
            {caseStudy.lessons && caseStudy.lessons.length > 0 && (
              <section className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Key Takeaways</h2>
                <ul className="space-y-2">
                  {caseStudy.lessons.map((lesson, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2">💡</span>
                      <span className="text-gray-700">{lesson}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Tools Used CTA */}
            {caseStudy.toolsUsed && caseStudy.toolsUsed.length > 0 && (
              <section className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Tools Used in This Case</h2>
                <p className="text-gray-700 mb-4">
                  Try the same calculators used in this success story:
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {caseStudy.toolsUsed.map(tool => {
                    const toolName = tool.split('/').pop()?.replace(/-/g, ' ')
                      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                    return (
                      <Link
                        key={tool}
                        href={tool}
                        onClick={() => handleToolClick(tool)}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-300 hover:border-purple-400 hover:shadow-md transition-all group"
                      >
                        <span className="font-medium text-gray-900 group-hover:text-purple-600">
                          {toolName} Calculator
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* Related Content */}
            {relatedLinks.length > 0 && (
              <RelatedLinks links={relatedLinks} title="Related Resources" />
            )}

            {/* Key Insights */}
            {content.key_insights && Array.isArray(content.key_insights) && content.key_insights.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Insights</h3>
                <ul className="space-y-2 text-sm">
                  {content.key_insights.map((insight: string, index: number) => (
                    <li key={index} className="flex items-start">
                      <span className="text-blue-600 mr-2">•</span>
                      <span className="text-gray-700">{insight}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {caseStudy.tags && caseStudy.tags.length > 0 && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {caseStudy.tags.map(tag => (
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
              Published: {new Date(caseStudy.created).toLocaleDateString('en-US', {
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