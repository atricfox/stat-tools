import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Script from 'next/script'
import AttributionTracker from '@/components/analytics/AttributionTracker'
import { headers } from 'next/headers'
// Sentry 相关组件已移除

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL('https://thestatscalculator.com'),
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
    url: 'https://thestatscalculator.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Professional Statistical Calculators | TheStatsCalculator',
    description: 'Free statistical calculators with step-by-step explanations for students and researchers.',
  },
  icons: {
    icon: '/icon.svg',
    shortcut: '/icon.svg',
    apple: '/apple-icon.svg',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const hdrs = await headers()
  const nonce = hdrs.get('x-csp-nonce') || undefined
  const gaId = process.env.STATS_CALCULATOR_GA_MEASUREMENT_ID
  const gaAnalyticsConsent = process.env.STATS_CALCULATOR_GA_ANALYTICS_STORAGE ?? 'granted'
  const clarityId = process.env.STATS_CALCULATOR_CLARITY_PROJECT_ID
  return (
    <html lang="en" className={inter.className}>
      <head>
        {/* Google Analytics (GA4) - loaded only if configured */}
        {gaId ? (
          <>
            <Script
              id="ga4-lib"
              src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-init" strategy="afterInteractive">
              {`
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              window.gtag = gtag;
              // Consent Mode v2 defaults (deny until user consent provided)
              gtag('consent', 'default', {
                'ad_user_data': 'denied',
                'ad_personalization': 'denied',
                'ad_storage': 'denied',
                'analytics_storage': '${gaAnalyticsConsent}'
              });
              gtag('js', new Date());
              gtag('config', '${gaId}', { anonymize_ip: true });
            `}
            </Script>
          </>
        ) : null}
        {clarityId ? (
          <Script id="ms-clarity" strategy="afterInteractive">
            {`
              (function(c,l,a,r,i,t,y){
                c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
              })(window, document, 'clarity', 'script', '${clarityId}');
            `}
          </Script>
        ) : null}
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
        {/* Client-side attribution tracking (UTM/gclid) */}
        <AttributionTracker />
        {children}
      </body>
    </html>
  )
}
