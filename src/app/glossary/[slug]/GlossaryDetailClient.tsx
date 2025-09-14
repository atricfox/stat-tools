'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Book, Calculator, ExternalLink, AlertCircle, ChevronRight, Lightbulb, TrendingUp } from 'lucide-react';
import type { TGlossaryTerm } from '@/lib/glossary/glossarySchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface GlossaryDetailClientProps {
  term: TGlossaryTerm;
  relatedTerms: TGlossaryTerm[];
  allTerms: TGlossaryTerm[];
}

export default function GlossaryDetailClient({ term, relatedTerms, allTerms }: GlossaryDetailClientProps) {
  // Track events
  const handleToolClick = (toolSlug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'glossary_to_tool_click', {
        term_slug: term.slug,
        tool_slug: toolSlug.replace('/calculator/', ''),
        context: 'glossary_detail',
      });
    }
  };

  const handleRelatedTermClick = (relatedSlug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'glossary_click', {
        term_slug: term.slug,
        to: relatedSlug,
        context: 'glossary_detail_related',
      });
    }
  };

  const handleHubClick = (hubSlug: string) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'glossary_to_hub_click', {
        term_slug: term.slug,
        hub_slug: hubSlug,
        context: 'glossary_detail',
      });
    }
  };

  // Get more related terms if seeAlso is short
  const additionalRelatedTerms = allTerms
    .filter(t => 
      t.slug !== term.slug && 
      !term.seeAlso?.includes(t.slug) &&
      (t.categories?.some(cat => term.categories?.includes(cat)))
    )
    .slice(0, 4);

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
              <Link href="/glossary" className="text-gray-500 hover:text-gray-700">
                Glossary
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{term.title}</li>
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
              href="/glossary" 
              className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to Glossary
            </Link>

            {/* Term Header */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex items-start space-x-3 mb-4">
                <Book className="w-8 h-8 text-blue-600 flex-shrink-0 mt-1" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{term.title}</h1>
                  <p className="text-lg text-gray-600">{term.shortDescription}</p>
                </div>
              </div>
            </div>

            {/* Definition Section */}
            <section className="bg-white rounded-lg border border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lightbulb className="w-5 h-5 mr-2 text-yellow-500" />
                Definition
              </h2>
              <p className="text-gray-700 leading-relaxed">{term.definition}</p>
            </section>

            {/* Misconceptions Section */}
            {term.misconceptions && term.misconceptions.length > 0 && (
              <section className="bg-amber-50 rounded-lg border border-amber-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-amber-600" />
                  Common Misconceptions
                </h2>
                <ul className="space-y-3">
                  {term.misconceptions.map((misconception, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-amber-600 mr-2 mt-0.5">•</span>
                      <span className="text-gray-700">{misconception}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Related Tools CTA */}
            {term.relatedTools && term.relatedTools.length > 0 && (
              <section className="bg-blue-50 rounded-lg border border-blue-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <Calculator className="w-5 h-5 mr-2 text-blue-600" />
                  Try These Calculators
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {term.relatedTools.map(tool => {
                    const toolName = tool.split('/').pop()?.replace(/-/g, ' ')
                      .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                    return (
                      <Link
                        key={tool}
                        href={tool}
                        onClick={() => handleToolClick(tool)}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-300 hover:border-blue-400 hover:shadow-md transition-all group"
                      >
                        <span className="font-medium text-gray-900 group-hover:text-blue-600">
                          {toolName} Calculator
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Related Hub Pages */}
            {term.relatedHubs && term.relatedHubs.length > 0 && (
              <section className="bg-purple-50 rounded-lg border border-purple-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                  Explore Related Topics
                </h2>
                <div className="space-y-3">
                  {term.relatedHubs.map(hub => {
                    const hubName = hub === '/gpa' ? 'GPA Calculators' :
                                   hub === '/descriptive-statistics' ? 'Descriptive Statistics' :
                                   hub.split('/').pop()?.replace(/-/g, ' ')
                                     .split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
                    
                    return (
                      <Link
                        key={hub}
                        href={hub}
                        onClick={() => handleHubClick(hub)}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-purple-300 hover:border-purple-400 hover:shadow-md transition-all group"
                      >
                        <span className="font-medium text-gray-900 group-hover:text-purple-600">
                          {hubName} Hub
                        </span>
                        <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
                      </Link>
                    );
                  })}
                </div>
              </section>
            )}

            {/* External Links */}
            {term.externalLinks && term.externalLinks.length > 0 && (
              <section className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Further Reading</h2>
                <ul className="space-y-3">
                  {term.externalLinks.map((link, index) => (
                    <li key={index}>
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-start space-x-2 text-blue-600 hover:text-blue-700"
                      >
                        <ExternalLink className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <div>
                          <span className="font-medium">{link.title}</span>
                          {link.description && (
                            <p className="text-sm text-gray-600 mt-1">{link.description}</p>
                          )}
                        </div>
                      </a>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            {/* See Also Section */}
            {(relatedTerms.length > 0 || additionalRelatedTerms.length > 0) && (
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">See Also</h3>
                <div className="flex flex-wrap gap-2">
                  {relatedTerms.map(relatedTerm => (
                    <Link
                      key={relatedTerm.slug}
                      href={`/glossary/${relatedTerm.slug}`}
                      onClick={() => handleRelatedTermClick(relatedTerm.slug)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      {relatedTerm.title}
                    </Link>
                  ))}
                  {additionalRelatedTerms.map(relatedTerm => (
                    <Link
                      key={relatedTerm.slug}
                      href={`/glossary/${relatedTerm.slug}`}
                      onClick={() => handleRelatedTermClick(relatedTerm.slug)}
                      className="inline-flex items-center px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-blue-100 hover:text-blue-700 transition-colors"
                    >
                      {relatedTerm.title}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Quick Links */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link
                    href="/statistics-calculators"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    All Calculators →
                  </Link>
                </li>
                <li>
                  <Link
                    href="/glossary"
                    className="text-blue-600 hover:text-blue-700 text-sm"
                  >
                    Browse Full Glossary →
                  </Link>
                </li>
                {term.categories && term.categories.includes('academic') && (
                  <li>
                    <Link
                      href="/gpa"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      GPA Calculator Hub →
                    </Link>
                  </li>
                )}
                {term.categories && term.categories.includes('descriptive-statistics') && (
                  <li>
                    <Link
                      href="/descriptive-statistics"
                      className="text-blue-600 hover:text-blue-700 text-sm"
                    >
                      Descriptive Statistics Hub →
                    </Link>
                  </li>
                )}
              </ul>
            </div>

            {/* Last Updated */}
            {term.updated && (
              <div className="text-sm text-gray-500">
                Last updated: {new Date(term.updated).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
            )}
          </aside>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}