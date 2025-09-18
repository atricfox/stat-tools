import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'About Us | TheStatsCalculator',
  description: 'TheStatsCalculator is your hub for free statistical calculators. From standard deviation to t-tests, get instant results plus simple, step-by-step explanations.',
  openGraph: {
    title: 'About Us | TheStatsCalculator',
    description: 'TheStatsCalculator is your hub for free statistical calculators. From standard deviation to t-tests, get instant results plus simple, step-by-step explanations.',
    url: 'https://thestatscalculator.com/about',
    siteName: 'TheStatsCalculator',
    type: 'website',
  },
  alternates: {
    canonical: 'https://thestatscalculator.com/about',
  },
}

import Header from '@/components/sections/Header'
import Footer from '@/components/sections/Footer'

export default function AboutPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'About Us | TheStatsCalculator',
    description: 'About TheStatsCalculator: professional, free statistical calculators and learning resources.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'About Us', item: '/about' }
      ]
    }
  }

  return (
    <>
    <Header />
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Script id="ld-json-about" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-gray-900 mb-6">About TheStatsCalculator</h1>
        
        <div className="prose prose-lg max-w-none space-y-6">
          <p className="text-lg text-gray-700 leading-relaxed">
            Welcome to TheStatsCalculator, your trusted destination for powerful, easy-to-use statistical calculators and reliable learning resources. Our mission is to make statistics simple, accurate, and accessible for everyone—students, educators, researchers, analysts, and lifelong learners.
          </p>

          <p className="text-gray-700 leading-relaxed">
            At TheStatsCalculator, we combine the practical utility of a wide range of online calculators with the academic authority of clear explanations and step-by-step guides. Each tool is built to provide instant, accurate results while helping you understand the underlying formulas, concepts, and real-world applications.
          </p>

          <section className="bg-gray-50 rounded-lg p-6 my-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">What We Offer</h2>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Comprehensive Tools</h3>
                <p className="text-gray-700 text-sm">From mean, median, and standard deviation calculators to confidence intervals, t-tests, ANOVA, and more.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Educational Depth</h3>
                <p className="text-gray-700 text-sm">Detailed explanations, worked examples, and FAQs designed for both quick answers and deeper understanding.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">User-Friendly Design</h3>
                <p className="text-gray-700 text-sm">Fast-loading, mobile-friendly calculators that save time and boost accuracy.</p>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Free & Accessible</h3>
                <p className="text-gray-700 text-sm">All tools and resources are available at no cost, anytime and anywhere.</p>
              </div>
            </div>
          </section>

          <section className="my-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Our Vision</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              We believe that statistics should be practical, accurate, and easy to learn. That's why TheStatsCalculator is built around two core principles:
            </p>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">1</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Usability</h3>
                  <p className="text-gray-700 text-sm">Calculators that anyone can use instantly without prior knowledge.</p>
                </div>
              </div>
              <div className="flex items-start">
                <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                  <span className="text-blue-600 text-sm font-semibold">2</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Authority</h3>
                  <p className="text-gray-700 text-sm">Trusted explanations and guides that make complex topics simple.</p>
                </div>
              </div>
            </div>
          </section>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 my-8">
            <p className="text-gray-700 leading-relaxed">
              By combining speed, accuracy, and clarity, TheStatsCalculator aims to become the leading global hub for statistical calculators and educational content, empowering millions of learners and professionals worldwide.
            </p>
          </div>
        </div>
      </div>
    </main>
    <Footer />
    </>
  )
}
