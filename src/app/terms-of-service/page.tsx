import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/sections/Header'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Terms of Service | TheStatsCalculator',
  description: 'By using our services, you agree to these terms.'
}

export default function TermsOfServicePage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Terms of Service | TheStatsCalculator',
    description: 'Terms governing use of TheStatsCalculator services and tools.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Terms of Service', item: '/terms-of-service' }
      ]
    }
  }

  return (
    <>
    <Header />
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Script id="ld-json-terms" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-3xl font-bold mb-6">Terms of Service | TheStatsCalculator</h1>
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">General & Scope</h2>
          <p>These terms define the relationship between you and TheStatsCalculator, including rights and obligations.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">User Accounts & Use</h2>
          <p>License to use our services; prohibited conduct; responsibility for account security and activity.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Intellectual Property</h2>
          <p>Ownership of content, trademarks, and procedures for reporting alleged infringement.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Platform Rights & Disclaimers</h2>
          <p>Our right to modify or suspend services; disclaimers and limitations of liability as permitted by law.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Governing Law & Dispute Resolution</h2>
          <p>Applicable law and forum/arbitration arrangements, subject to local consumer rights.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Changes & Notices</h2>
          <p>How updates to these terms take effect and how we will notify users.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Termination</h2>
          <p>Conditions under which accounts or access to services may be terminated.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>For questions about these terms, contact <a className="text-blue-600 dark:text-blue-400" href="mailto:legal@example.com">legal@example.com</a>.</p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
