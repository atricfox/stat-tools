import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import { headers } from 'next/headers'
// Sentry 相关组件已移除

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://stattools.example.com'),
  title: 'Professional Statistical Calculators | Free Online Tools - TheStatsCalculator',
  description: 'Free statistical calculators with step-by-step solutions. Perfect for students & researchers. Mean, standard deviation, t-tests & more. No signup required.',
  keywords: 'statistical calculators, statistics tools, free calculator, mean calculator, standard deviation, t-test, confidence interval',
  authors: [{ name: 'TheStatsCalculator' }],
  alternates: { canonical: '/' },
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    title: 'Professional Statistical Calculators | TheStatsCalculator',
    description: 'Free statistical calculators with step-by-step explanations. Perfect for students, researchers & professionals.',
    type: 'website',
    url: 'https://stattools.example.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Statistical Calculators | TheStatsCalculator',
    description: 'Free statistical calculators with step-by-step explanations for students and researchers.',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-csp-nonce') || undefined
  return (
    <html lang="en" className={inter.className}>
      <head>
        <Script
          id="ld-json-home"
          type="application/ld+json"
          nonce={nonce}
          // Static JSON-LD content only; avoid user input here
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebApplication',
              name: 'TheStatsCalculator - Statistical Calculators',
              description: 'Professional statistical calculators with step-by-step explanations',
              applicationCategory: 'EducationalApplication',
              operatingSystem: 'Web',
              offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
              author: { '@type': 'Organization', name: 'TheStatsCalculator' },
              aggregateRating: { '@type': 'AggregateRating', ratingValue: '4.8', ratingCount: '1250' },
            }),
          }}
        />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  )
}
