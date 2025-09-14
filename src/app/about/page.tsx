import type { Metadata } from 'next'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'About Us | TheStatsCalculator',
  description: 'We build professional, free statistical calculators and learning resources for students, researchers, and professionals.'
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

      <h1 className="text-3xl font-bold mb-4">About Us | TheStatsCalculator</h1>
      <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
        We help students and professionals compute statistics faster and understand better.
      </p>

      <section className="space-y-4">
        <p>
          TheStatsCalculator focuses on accessible, accurate statistical calculators and clear explanations. We
          serve learners, researchers, and practitioners worldwide with task‑oriented tools and concise guidance.
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Professional team</li>
          <li>Free tools</li>
          <li>Continual improvements</li>
        </ul>
        <div className="pt-2 text-sm text-gray-600 dark:text-gray-400">
          Contact: <a className="text-blue-600 dark:text-blue-400" href="mailto:support@example.com">support@example.com</a>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
