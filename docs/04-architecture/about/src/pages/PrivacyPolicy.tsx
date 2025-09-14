import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Shield, Mail, Eye, Cookie, Lock, Globe } from 'lucide-react';
import TableOfContents from '../components/TableOfContents';

const PrivacyPolicy: React.FC = () => {
  const tocItems = [
    { id: 'introduction', title: 'Introduction', level: 2 },
    { id: 'data-we-collect', title: 'Data We Collect', level: 2 },
    { id: 'how-we-use-data', title: 'How We Use Data', level: 2 },
    { id: 'sharing-third-parties', title: 'Sharing & Third Parties', level: 2 },
    { id: 'your-rights', title: 'Your Rights & Choices', level: 2 },
    { id: 'cookies-consent', title: 'Cookies & Consent', level: 2 },
    { id: 'data-security', title: 'Data Security & Retention', level: 2 },
    { id: 'regional-compliance', title: 'Regional Compliance', level: 2 },
    { id: 'updates', title: 'Policy Updates', level: 2 },
    { id: 'contact', title: 'Contact Information', level: 2 },
  ];

  const handleTocClick = (itemId: string) => {
    console.log('legal_toc_click', { toc_item: itemId });
  };

  return (
    <>
      <Helmet>
        <title>Privacy Policy | TheStatsCalculator - Data Protection & Privacy</title>
        <meta 
          name="description" 
          content="TheStatsCalculator Privacy Policy - Learn how we collect, use, and protect your personal data in compliance with GDPR, CCPA, and other privacy regulations." 
        />
        <link rel="canonical" href="/privacy-policy" />
        <meta property="og:title" content="Privacy Policy | TheStatsCalculator" />
        <meta property="og:description" content="Our commitment to protecting your privacy and data" />
        <meta property="og:url" content="/privacy-policy" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Privacy Policy | TheStatsCalculator" />
        <meta name="twitter:description" content="Our commitment to protecting your privacy and data" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Privacy Policy",
            "description": "TheStatsCalculator Privacy Policy and data protection information",
            "url": "/privacy-policy",
            "breadcrumb": {
              "@type": "BreadcrumbList",
              "itemListElement": [
                {
                  "@type": "ListItem",
                  "position": 1,
                  "name": "Home",
                  "item": "/"
                },
                {
                  "@type": "ListItem",
                  "position": 2,
                  "name": "Privacy Policy",
                  "item": "/privacy-policy"
                }
              ]
            }
          })}
        </script>
      </Helmet>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li><a href="/" className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1">Home</a></li>
            <li className="flex items-center">
              <span className="mx-2">/</span>
              <span className="text-gray-900">Privacy Policy</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Table of Contents */}
          <div className="lg:col-span-1">
            <div className="sticky top-8">
              <TableOfContents items={tocItems} onItemClick={handleTocClick} />
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center mb-4">
                <Shield className="w-8 h-8 text-blue-600 mr-3" aria-hidden="true" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Privacy Policy | TheStatsCalculator
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Last updated: January 15, 2025 | Version: 1.0
              </p>
            </div>

            {/* Introduction */}
            <section id="introduction" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Eye className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Introduction
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  At TheStatsCalculator, we are committed to protecting your privacy and being transparent about 
                  how we collect, use, and share your personal information. This Privacy Policy explains our 
                  practices regarding data collection when you use our statistical analysis tools and services.
                </p>
                <p className="mb-4">
                  This policy applies to all users of TheStatsCalculator website and services. By using our 
                  platform, you agree to the collection and use of information in accordance with this policy.
                </p>
              </div>
            </section>

            {/* Data We Collect */}
            <section id="data-we-collect" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Globe className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Data We Collect
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Information You Provide</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Contact information when you reach out to us (name, email address)</li>
                  <li>Feedback and survey responses</li>
                  <li>Statistical data you input into our calculators (processed locally when possible)</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Automatically Collected Information</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Usage data and analytics (pages visited, time spent, features used)</li>
                  <li>Device and browser information (browser type, operating system, screen resolution)</li>
                  <li>IP address and approximate location (country/region level)</li>
                  <li>Cookies and similar tracking technologies</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Third-Party Data</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Analytics data from Google Analytics (anonymized)</li>
                  <li>Error reporting and performance monitoring data</li>
                </ul>
              </div>
            </section>

            {/* How We Use Data */}
            <section id="how-we-use-data" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">How We Use Data</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Service Functionality</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Provide and maintain our statistical calculation services</li>
                  <li>Process your statistical data and provide accurate results</li>
                  <li>Respond to your inquiries and support requests</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Analytics & Improvements</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Analyze usage patterns to improve our tools and user experience</li>
                  <li>Monitor service performance and identify technical issues</li>
                  <li>Develop new features based on user needs</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Legal Compliance</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Comply with applicable laws and regulations</li>
                  <li>Protect against fraud, abuse, and security threats</li>
                  <li>Enforce our terms of service</li>
                </ul>
              </div>
            </section>

            {/* Sharing & Third Parties */}
            <section id="sharing-third-parties" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Sharing & Third Parties</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  We follow data minimization principles and only share information when necessary for 
                  service operation or legal compliance.
                </p>

                <h3 className="text-lg font-semibold mb-3">Service Providers</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Analytics providers (Google Analytics with anonymization)</li>
                  <li>Hosting and infrastructure providers</li>
                  <li>Email service providers for support communications</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Legal Requirements</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>When required by law or legal process</li>
                  <li>To protect our rights, property, or safety</li>
                  <li>To prevent fraud or abuse</li>
                </ul>

                <p className="mb-4">
                  <strong>We do not sell, rent, or trade your personal information to third parties.</strong>
                </p>
              </div>
            </section>

            {/* Your Rights & Choices */}
            <section id="your-rights" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Your Rights & Choices</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Data Subject Rights</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li><strong>Access:</strong> Request information about data we have about you</li>
                  <li><strong>Rectification:</strong> Request correction of inaccurate data</li>
                  <li><strong>Erasure:</strong> Request deletion of your personal data</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a machine-readable format</li>
                  <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Tracking & Analytics Opt-Out</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Use browser "Do Not Track" settings</li>
                  <li>Disable cookies in your browser settings</li>
                  <li>Use Google Analytics opt-out browser addon</li>
                </ul>

                <p className="mb-4">
                  To exercise these rights, contact us at{' '}
                  <a
                    href="mailto:privacy@thestatscalculator.com"
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                    onClick={() => console.log('legal_contact_click', { channel: 'privacy_email' })}
                  >
                    privacy@thestatscalculator.com
                  </a>
                </p>
              </div>
            </section>

            {/* Cookies & Consent */}
            <section id="cookies-consent" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Cookie className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Cookies & Consent
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  We use cookies and similar technologies to enhance your experience and analyze usage patterns. 
                  Our cookie usage is designed to comply with Consent Mode v2 standards.
                </p>

                <h3 className="text-lg font-semibold mb-3">Types of Cookies</h3>
                <div className="space-y-4 mb-4">
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Essential Cookies</h4>
                    <p className="text-sm">Necessary for basic site functionality. Cannot be disabled.</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Analytics Cookies</h4>
                    <p className="text-sm">Help us understand site usage and improve user experience. Optional.</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-3">Managing Cookie Preferences</h3>
                <p className="mb-4">
                  You can manage your cookie preferences through your browser settings or our cookie consent banner. 
                  Changes may affect site functionality.
                </p>
              </div>
            </section>

            {/* Data Security & Retention */}
            <section id="data-security" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Lock className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Data Security & Retention
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Security Measures</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>HTTPS encryption for all data transmission</li>
                  <li>Regular security assessments and updates</li>
                  <li>Access controls and authentication for our systems</li>
                  <li>Data minimization and anonymization where possible</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Data Retention</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Contact information: Retained until you request deletion</li>
                  <li>Analytics data: Retained for 26 months (Google Analytics default)</li>
                  <li>Statistical inputs: Processed locally and not permanently stored when possible</li>
                  <li>Log data: Retained for 12 months for security and performance monitoring</li>
                </ul>
              </div>
            </section>

            {/* Regional Compliance */}
            <section id="regional-compliance" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Regional Compliance</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">GDPR (European Union)</h3>
                <p className="mb-4">
                  For users in the European Union, we comply with the General Data Protection Regulation (GDPR). 
                  We process data based on legitimate interests, consent, or contractual necessity.
                </p>

                <h3 className="text-lg font-semibold mb-3">CCPA (California)</h3>
                <p className="mb-4">
                  California residents have additional rights under the California Consumer Privacy Act (CCPA), 
                  including the right to know what personal information is collected and to opt-out of its sale.
                </p>

                <h3 className="text-lg font-semibold mb-3">Other Jurisdictions</h3>
                <p className="mb-4">
                  We respect privacy laws in all jurisdictions where our users are located and will comply 
                  with applicable data protection regulations.
                </p>
              </div>
            </section>

            {/* Updates */}
            <section id="updates" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Policy Updates</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  We may update this Privacy Policy periodically to reflect changes in our practices or 
                  applicable laws. We will notify you of material changes by:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Posting the updated policy on our website</li>
                  <li>Updating the "Last Modified" date</li>
                  <li>Sending email notifications for significant changes (when we have your email)</li>
                </ul>
                <p className="mb-4">
                  Continued use of our services after policy updates constitutes acceptance of the new terms.
                </p>
              </div>
            </section>

            {/* Contact */}
            <section id="contact" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Mail className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Contact Information
              </h2>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                <p className="text-gray-700 mb-4">
                  For questions about this Privacy Policy or to exercise your data rights, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Email:</strong>{' '}
                    <a
                      href="mailto:privacy@thestatscalculator.com"
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                      onClick={() => console.log('legal_contact_click', { channel: 'privacy_email' })}
                    >
                      privacy@thestatscalculator.com
                    </a>
                  </p>
                  <p>
                    <strong>General Contact:</strong>{' '}
                    <a
                      href="mailto:legal@thestatscalculator.com"
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                      onClick={() => console.log('legal_contact_click', { channel: 'legal_email' })}
                    >
                      legal@thestatscalculator.com
                    </a>
                  </p>
                  <p>
                    <strong>Response Time:</strong> We will respond to privacy inquiries within 30 days.
                  </p>
                </div>
              </div>
            </section>

            {/* Footer Links */}
            <div className="border-t border-gray-200 pt-8 text-center">
              <div className="text-sm text-gray-600 space-y-2">
                <p>
                  <strong>Effective Date:</strong> January 15, 2025 | <strong>Version:</strong> 1.0
                </p>
                <div className="flex justify-center space-x-4">
                  <a
                    href="/about"
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                  >
                    About Us
                  </a>
                  <span className="text-gray-400">|</span>
                  <a
                    href="/terms-of-service"
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                  >
                    Terms of Service
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default PrivacyPolicy;