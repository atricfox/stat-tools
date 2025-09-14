'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowLeft, Calculator, Info, HelpCircle, ChevronRight } from 'lucide-react';
import type { TCalculatorsJson, TCalculatorItem } from '@/lib/hub/calculatorsSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

interface ThemeHubProps {
  title: string;
  description: string;
  themeId: string;
  calculatorsData: TCalculatorsJson;
  allowedTools: string[];
  guideCards?: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
  faqs?: Array<{
    question: string;
    answer: string;
  }>;
}

export default function UnifiedThemeHub({
  title,
  description,
  themeId,
  calculatorsData,
  allowedTools,
  guideCards = [],
  faqs = []
}: ThemeHubProps) {
  const [expandedFaq, setExpandedFaq] = React.useState<number | null>(null);

  // Filter tools based on allowed list
  const filteredTools = React.useMemo(() => {
    const tools: TCalculatorItem[] = [];
    calculatorsData.groups.forEach(group => {
      group.items.forEach(item => {
        if (allowedTools.includes(item.url)) {
          tools.push(item);
        }
      });
    });
    return tools;
  }, [calculatorsData, allowedTools]);

  const handleToolClick = (toolUrl: string, position: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'hub_tool_click', {
        tool_slug: toolUrl.replace('/calculator/', ''),
        group_name: themeId,
        position: position,
        context: `${themeId}_hub`,
      });
    }
  };

  const handleGuideCardClick = (cardTitle: string, index: number) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'guide_card_click', {
        card_title: cardTitle,
        position: index + 1,
        context: `${themeId}_hub`,
      });
    }
  };

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('event', 'faq_expand', {
        question_index: index + 1,
        context: `${themeId}_hub`,
      });
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back to main hub link */}
          <Link 
            href="/statistics-calculators" 
            className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Back to All Calculators
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {title}
          </h1>
          <p className="text-lg text-gray-600">
            {description}
          </p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Guide Cards Section */}
        {guideCards.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <Info className="w-5 h-5 mr-2 text-blue-600" />
              Quick Selection Guide
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {guideCards.map((card, index) => (
                <div
                  key={index}
                  onClick={() => handleGuideCardClick(card.title, index)}
                  className="bg-white p-6 rounded-lg border border-gray-200 hover:border-blue-400 hover:shadow-md transition-all cursor-pointer"
                >
                  <div className="flex items-start space-x-3">
                    {card.icon && (
                      <div className="text-blue-600 flex-shrink-0">
                        {card.icon}
                      </div>
                    )}
                    <div>
                      <h3 className="font-medium text-gray-900 mb-2">
                        {card.title}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {card.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Calculator Tools Grid */}
        <section className="mb-12">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Calculator className="w-5 h-5 mr-2 text-blue-600" />
            Available Calculators
          </h2>
          
          {filteredTools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredTools.map((tool, index) => (
                <Link
                  key={tool.url}
                  href={tool.url}
                  onClick={() => handleToolClick(tool.url, index + 1)}
                  className="block bg-white rounded-lg border border-gray-200 p-5 hover:border-blue-400 hover:shadow-md transition-all group"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                      {tool.name}
                    </h3>
                    <div className="flex space-x-1 flex-shrink-0">
                      {tool.is_new && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          NEW
                        </span>
                      )}
                      {tool.is_hot && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-orange-100 text-orange-800">
                          HOT
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                    {tool.description}
                  </p>
                  <div className="text-blue-600 text-sm font-medium group-hover:underline flex items-center">
                    Open Calculator
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-lg border border-gray-200">
              <p className="text-gray-600">
                No calculators available in this category yet.
              </p>
              <Link
                href="/statistics-calculators"
                className="mt-4 inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Browse all calculators
                <ChevronRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          )}
        </section>

        {/* FAQ Section */}
        {faqs.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
              <HelpCircle className="w-5 h-5 mr-2 text-blue-600" />
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <span className="font-medium text-gray-900">
                      {faq.question}
                    </span>
                    <ChevronRight
                      className={`w-5 h-5 text-gray-500 transition-transform ${
                        expandedFaq === index ? 'rotate-90' : ''
                      }`}
                    />
                  </button>
                  {expandedFaq === index && (
                    <div className="px-6 pb-4 text-gray-600">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Additional Resources */}
        <section className="mt-12 p-6 bg-blue-50 rounded-lg">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Need More Tools?
          </h3>
          <p className="text-gray-600 mb-4">
            Explore our complete collection of statistical calculators for all your analysis needs.
          </p>
          <Link
            href="/statistics-calculators"
            className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
          >
            View All Statistical Calculators
            <ChevronRight className="w-4 h-4 ml-1" />
          </Link>
        </section>
      </main>
      
      <Footer />
    </div>
  );
}