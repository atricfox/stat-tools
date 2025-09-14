import type { Metadata } from 'next'
import Script from 'next/script'
import Header from '@/components/sections/Header'
import Footer from '@/components/sections/Footer'

export const metadata: Metadata = {
  title: 'Privacy Policy | TheStatsCalculator',
  description: 'This Privacy Policy explains what data we collect, how we use it, how we share it, and your choices.'
}

export default function PrivacyPolicyPage() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Privacy Policy | TheStatsCalculator',
    description: 'Privacy policy explaining data collection and use at TheStatsCalculator.',
    breadcrumb: {
      '@type': 'BreadcrumbList',
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Home', item: '/' },
        { '@type': 'ListItem', position: 2, name: 'Privacy Policy', item: '/privacy-policy' }
      ]
    }
  }

  return (
    <>
    <Header />
    <main className="max-w-[1120px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Script id="ld-json-privacy" type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <h1 className="text-3xl font-bold mb-6">Privacy Policy | TheStatsCalculator</h1>
      <section className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-2">Introduction</h2>
          <p>This policy explains the types of data we collect, how we use it, how we share it, and your choices.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Data We Collect</h2>
          <p>We may collect technical data (e.g., cookies and logs), information submitted via forms, and limited third‑party SDK signals.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">How We Use Data</h2>
          <p>To operate core functionality, improve tools, understand usage at an aggregate level, and, where applicable, measure campaigns.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Sharing & Third Parties</h2>
          <p>We share data with processors strictly for operations and compliance needs. We apply minimization and purpose limitation.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Your Rights & Choices</h2>
          <p>You can request access, rectification, or deletion of your data, and opt‑out of certain tracking where supported.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Cookies & Consent</h2>
          <p>We use Consent Mode v2. You can manage cookie preferences to control analytics or ad‑related storage.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Security & Retention</h2>
          <p>We implement reasonable safeguards (encryption, access control) and retain data only as long as necessary.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Regions & Laws</h2>
          <p>Where applicable, we align with GDPR/CCPA/PIPL obligations. Additional regional notices may apply.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Updates</h2>
          <p>We may update this policy over time. Material changes will be communicated reasonably.</p>
        </div>
        <div>
          <h2 className="text-xl font-semibold mb-2">Contact</h2>
          <p>Contact our legal team at <a className="text-blue-600 dark:text-blue-400" href="mailto:legal@example.com">legal@example.com</a>.</p>
        </div>
      </section>
    </main>
    <Footer />
    </>
  )
}
