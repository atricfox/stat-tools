import React from 'react';
import { Helmet } from 'react-helmet-async';
import { FileText, Mail, Scale, Shield, AlertTriangle, Users } from 'lucide-react';
import TableOfContents from '../components/TableOfContents';

const TermsOfService: React.FC = () => {
  const tocItems = [
    { id: 'general-scope', title: 'General Terms & Scope', level: 2 },
    { id: 'user-accounts', title: 'User Accounts & Use', level: 2 },
    { id: 'intellectual-property', title: 'Intellectual Property', level: 2 },
    { id: 'platform-rights', title: 'Platform Rights & Disclaimers', level: 2 },
    { id: 'governing-law', title: 'Governing Law & Dispute Resolution', level: 2 },
    { id: 'changes-notices', title: 'Changes & Notices', level: 2 },
    { id: 'termination', title: 'Termination', level: 2 },
    { id: 'contact', title: 'Contact Information', level: 2 },
  ];

  const handleTocClick = (itemId: string) => {
    console.log('legal_toc_click', { toc_item: itemId });
  };

  return (
    <>
      <Helmet>
        <title>Terms of Service | TheStatsCalculator - User Agreement & Legal Terms</title>
        <meta 
          name="description" 
          content="TheStatsCalculator Terms of Service - User rights, obligations, and legal terms governing the use of our statistical analysis platform." 
        />
        <link rel="canonical" href="/terms-of-service" />
        <meta property="og:title" content="Terms of Service | TheStatsCalculator" />
        <meta property="og:description" content="Legal terms and conditions for using TheStatsCalculator" />
        <meta property="og:url" content="/terms-of-service" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content="Terms of Service | TheStatsCalculator" />
        <meta name="twitter:description" content="Legal terms and conditions for using TheStatsCalculator" />
        
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebPage",
            "name": "Terms of Service",
            "description": "TheStatsCalculator Terms of Service and legal agreement",
            "url": "/terms-of-service",
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
                  "name": "Terms of Service",
                  "item": "/terms-of-service"
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
              <span className="text-gray-900">Terms of Service</span>
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
                <FileText className="w-8 h-8 text-blue-600 mr-3" aria-hidden="true" />
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
                  Terms of Service | TheStatsCalculator
                </h1>
              </div>
              <p className="text-lg text-gray-600">
                Last updated: January 15, 2025 | Version: 1.0
              </p>
            </div>

            {/* Important Notice */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" aria-hidden="true" />
                <div className="text-sm">
                  <p className="font-semibold text-yellow-800 mb-1">Important Legal Agreement</p>
                  <p className="text-yellow-700">
                    By using TheStatsCalculator, you agree to be bound by these Terms of Service. 
                    Please read them carefully before using our platform.
                  </p>
                </div>
              </div>
            </div>

            {/* General Terms & Scope */}
            <section id="general-scope" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Scale className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                General Terms & Scope
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="mb-4">
                  These Terms of Service ("Terms") constitute a legal agreement between you ("User" or "you") 
                  and TheStatsCalculator ("we," "us," or "our") governing your use of our statistical analysis 
                  platform and related services.
                </p>

                <h3 className="text-lg font-semibold mb-3">Acceptance of Terms</h3>
                <p className="mb-4">
                  By accessing or using TheStatsCalculator, you acknowledge that you have read, understood, 
                  and agree to be bound by these Terms and our Privacy Policy. If you do not agree to these 
                  Terms, you may not use our services.
                </p>

                <h3 className="text-lg font-semibold mb-3">Parties & Relationships</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>TheStatsCalculator provides statistical analysis tools and related services</li>
                  <li>Users access and use these tools subject to the terms outlined here</li>
                  <li>No partnership, joint venture, or employment relationship is created</li>
                  <li>These Terms do not create any third-party beneficiary rights</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Eligibility</h3>
                <p className="mb-4">
                  You must be at least 13 years old to use our services. If you are under 18, you represent 
                  that you have your parent or guardian's permission to use our services.
                </p>
              </div>
            </section>

            {/* User Accounts & Use */}
            <section id="user-accounts" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Users className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                User Accounts & Use
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">License Grant</h3>
                <p className="mb-4">
                  Subject to these Terms, we grant you a limited, non-exclusive, non-transferable, 
                  revocable license to access and use TheStatsCalculator for legitimate statistical 
                  analysis purposes.
                </p>

                <h3 className="text-lg font-semibold mb-3">Permitted Uses</h3>
                <ul className="list-disc pl-6 mb-4">
                  <li>Academic research and educational purposes</li>
                  <li>Business analysis and decision-making</li>
                  <li>Personal statistical calculations</li>
                  <li>Professional consulting and reporting</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Prohibited Conduct</h3>
                <p className="mb-2">You agree not to:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Use our services for any illegal or unauthorized purpose</li>
                  <li>Attempt to interfere with, compromise, or disrupt our services</li>
                  <li>Reverse engineer, decompile, or attempt to extract source code</li>
                  <li>Use automated systems (bots, scrapers) without written permission</li>
                  <li>Upload malicious code, viruses, or harmful content</li>
                  <li>Violate any applicable laws or regulations</li>
                  <li>Infringe upon intellectual property rights of others</li>
                  <li>Impersonate others or provide false information</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Account Security</h3>
                <p className="mb-4">
                  While we currently don't require user accounts, any future account features will 
                  require you to maintain the confidentiality of your login credentials and notify 
                  us immediately of any unauthorized access.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section id="intellectual-property" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Intellectual Property</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Our Ownership</h3>
                <p className="mb-4">
                  TheStatsCalculator, including all software, algorithms, designs, text, graphics, 
                  and other content, is owned by us and protected by copyright, trademark, and other 
                  intellectual property laws.
                </p>

                <h3 className="text-lg font-semibold mb-3">Trademarks</h3>
                <p className="mb-4">
                  "TheStatsCalculator" and our logos are trademarks. You may not use our trademarks 
                  without our prior written consent, except as necessary to identify our services.
                </p>

                <h3 className="text-lg font-semibold mb-3">Your Content</h3>
                <p className="mb-4">
                  You retain ownership of any data you input into our calculators. By using our 
                  services, you grant us a limited license to process your data solely to provide 
                  the statistical analysis you request.
                </p>

                <h3 className="text-lg font-semibold mb-3">DMCA Takedown</h3>
                <p className="mb-4">
                  If you believe any content infringes your copyright, please contact us at{' '}
                  <a
                    href="mailto:legal@thestatscalculator.com"
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                    onClick={() => console.log('legal_contact_click', { channel: 'dmca_email' })}
                  >
                    legal@thestatscalculator.com
                  </a>{' '}
                  with details of the alleged infringement.
                </p>
              </div>
            </section>

            {/* Platform Rights & Disclaimers */}
            <section id="platform-rights" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4 flex items-center">
                <Shield className="w-6 h-6 text-blue-600 mr-2" aria-hidden="true" />
                Platform Rights & Disclaimers
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Service Changes</h3>
                <p className="mb-4">
                  We reserve the right to modify, suspend, or discontinue any part of our services 
                  at any time, with or without notice. We may also impose limits on certain features 
                  or restrict access to parts of our services.
                </p>

                <h3 className="text-lg font-semibold mb-3">Service Availability</h3>
                <p className="mb-4">
                  While we strive for high availability, we do not guarantee uninterrupted access 
                  to our services. Maintenance, updates, or technical issues may cause temporary 
                  service interruptions.
                </p>

                <h3 className="text-lg font-semibold mb-3">Disclaimers</h3>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                  <p className="text-red-800 font-semibold mb-2">IMPORTANT DISCLAIMERS:</p>
                  <ul className="list-disc pl-6 text-red-700 text-sm">
                    <li>Our services are provided "AS IS" without warranties of any kind</li>
                    <li>We do not guarantee accuracy, completeness, or reliability of results</li>
                    <li>Users are responsible for verifying statistical calculations</li>
                    <li>We are not liable for decisions made based on our calculations</li>
                  </ul>
                </div>

                <h3 className="text-lg font-semibold mb-3">Limitation of Liability</h3>
                <p className="mb-4">
                  To the maximum extent permitted by law, our total liability for any claims 
                  related to our services shall not exceed $100 or the amount you paid us in 
                  the past 12 months, whichever is greater.
                </p>

                <h3 className="text-lg font-semibold mb-3">Indemnification</h3>
                <p className="mb-4">
                  You agree to indemnify and hold us harmless from any claims, damages, or 
                  expenses arising from your use of our services or violation of these Terms.
                </p>
              </div>
            </section>

            {/* Governing Law & Dispute Resolution */}
            <section id="governing-law" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Governing Law & Dispute Resolution</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Applicable Law</h3>
                <p className="mb-4">
                  These Terms are governed by the laws of [Jurisdiction], without regard to 
                  conflict of law principles. Any disputes shall be resolved in the courts 
                  of [Jurisdiction].
                </p>

                <h3 className="text-lg font-semibold mb-3">Dispute Resolution Process</h3>
                <ol className="list-decimal pl-6 mb-4">
                  <li className="mb-2">
                    <strong>Informal Resolution:</strong> Contact us first to resolve disputes informally
                  </li>
                  <li className="mb-2">
                    <strong>Mediation:</strong> If informal resolution fails, we encourage mediation
                  </li>
                  <li className="mb-2">
                    <strong>Arbitration:</strong> Binding arbitration for claims under $10,000
                  </li>
                  <li className="mb-2">
                    <strong>Court Proceedings:</strong> For larger claims or when arbitration is not suitable
                  </li>
                </ol>

                <h3 className="text-lg font-semibold mb-3">Class Action Waiver</h3>
                <p className="mb-4">
                  You agree to resolve disputes individually and waive the right to participate 
                  in class actions, except where prohibited by law.
                </p>
              </div>
            </section>

            {/* Changes & Notices */}
            <section id="changes-notices" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes & Notices</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Modifications to Terms</h3>
                <p className="mb-4">
                  We may update these Terms periodically. Material changes will be communicated through:
                </p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Prominent notice on our website</li>
                  <li>Email notification (if we have your email address)</li>
                  <li>In-app notification for significant changes</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Effective Date of Changes</h3>
                <p className="mb-4">
                  Updated Terms become effective 30 days after posting, unless immediate changes 
                  are required for legal compliance or security reasons. Continued use constitutes 
                  acceptance of the new Terms.
                </p>

                <h3 className="text-lg font-semibold mb-3">Communication Methods</h3>
                <p className="mb-4">
                  Official notices will be posted on our website and may be sent via email. 
                  You are responsible for keeping your contact information current.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section id="termination" className="mb-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Termination</h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <h3 className="text-lg font-semibold mb-3">Termination by You</h3>
                <p className="mb-4">
                  You may stop using our services at any time. If we implement user accounts 
                  in the future, you may delete your account by contacting us.
                </p>

                <h3 className="text-lg font-semibold mb-3">Termination by Us</h3>
                <p className="mb-4">We may suspend or terminate your access to our services if you:</p>
                <ul className="list-disc pl-6 mb-4">
                  <li>Violate these Terms of Service</li>
                  <li>Use our services in a way that causes harm or liability</li>
                  <li>Engage in fraudulent or illegal activities</li>
                  <li>Violate applicable laws or regulations</li>
                </ul>

                <h3 className="text-lg font-semibold mb-3">Effect of Termination</h3>
                <p className="mb-4">
                  Upon termination, your right to use our services ceases immediately. 
                  Provisions regarding intellectual property, disclaimers, and limitation 
                  of liability survive termination.
                </p>

                <h3 className="text-lg font-semibold mb-3">Data Deletion</h3>
                <p className="mb-4">
                  Upon request, we will delete your personal data in accordance with our 
                  Privacy Policy and applicable law, except where retention is required 
                  for legal compliance.
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
                  For questions about these Terms of Service or legal matters, please contact us:
                </p>
                <div className="space-y-2">
                  <p>
                    <strong>Legal Email:</strong>{' '}
                    <a
                      href="mailto:legal@thestatscalculator.com"
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                      onClick={() => console.log('legal_contact_click', { channel: 'legal_email' })}
                    >
                      legal@thestatscalculator.com
                    </a>
                  </p>
                  <p>
                    <strong>General Contact:</strong>{' '}
                    <a
                      href="mailto:contact@thestatscalculator.com"
                      className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                      onClick={() => console.log('legal_contact_click', { channel: 'contact_email' })}
                    >
                      contact@thestatscalculator.com
                    </a>
                  </p>
                  <p>
                    <strong>Response Time:</strong> We will respond to legal inquiries within 5 business days.
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
                    href="/privacy-policy"
                    className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                  >
                    Privacy Policy
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

export default TermsOfService;