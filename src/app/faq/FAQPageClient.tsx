'use client';

import React from 'react';
import { HelpCircle } from 'lucide-react';
import type { TFAQItem } from '@/lib/content/contentSchema';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';
import FAQList from '@/components/content/FAQList';

interface FAQPageClientProps {
  faqItems: TFAQItem[];
}

export default function FAQPageClient({ faqItems }: FAQPageClientProps) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      {/* Page Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center space-x-3 mb-4">
            <HelpCircle className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Frequently Asked Questions</h1>
          </div>
          <p className="text-lg text-gray-600">
            Find answers to common questions about statistics, calculators, and data analysis.
            Can't find what you're looking for? Use the search below.
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <FAQList 
          items={faqItems} 
          searchable={true}
          groupByCategory={true}
        />
        
        {/* Additional Help Section */}
        <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">Still Need Help?</h2>
          <p className="text-gray-700 mb-4">
            If you couldn't find the answer you're looking for, try these resources:
          </p>
          <div className="space-y-2">
            <a 
              href="/glossary" 
              className="block text-blue-600 hover:text-blue-700"
            >
              → Browse our statistics glossary for term definitions
            </a>
            <a 
              href="/how-to" 
              className="block text-blue-600 hover:text-blue-700"
            >
              → Check our step-by-step how-to guides
            </a>
            <a 
              href="/statistics-calculators" 
              className="block text-blue-600 hover:text-blue-700"
            >
              → Explore all available calculators
            </a>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}