'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Award, RefreshCw, Mail } from 'lucide-react';
import ContactForm from './ContactForm';
import Header from '@/components/sections/Header';
import Footer from '@/components/sections/Footer';

const AboutPageClient: React.FC = () => {
  const handleContactSubmit = (data: { name: string; email: string; message: string }) => {
    // Track contact event
    console.log('legal_contact_click', { channel: 'contact_form', ...data });
  };

  return (
    <>
      <Header />
      <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center space-x-2 text-sm text-gray-500">
          <li>
            <Link href="/" className="hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1">
              Home
            </Link>
          </li>
          <li className="flex items-center">
            <span className="mx-2">/</span>
            <span className="text-gray-900">About Us</span>
          </li>
        </ol>
      </nav>

      {/* Hero Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
          About Us | TheStatsCalculator
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
          Empowering researchers and analysts worldwide with precise, accessible statistical tools
        </p>
        <a
          href="#contact"
          className="inline-flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
          onClick={() => console.log('legal_contact_click', { channel: 'hero_cta' })}
        >
          <Mail className="w-5 h-5 mr-2" aria-hidden="true" />
          Contact Us
        </a>
      </div>

      {/* Core Overview */}
      <div className="mb-12">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Who We Are</h2>
          <p className="text-lg text-gray-700 leading-relaxed mb-6">
            TheStatsCalculator is dedicated to democratizing statistical analysis by providing professional-grade tools
            that are both powerful and accessible. We serve researchers, students, and professionals who need reliable
            statistical calculations for their work and studies.
          </p>
          <p className="text-lg text-gray-700 leading-relaxed">
            Our platform bridges the gap between complex statistical software and basic calculators, offering
            comprehensive tools that deliver accurate results while remaining intuitive to use.
          </p>
        </div>
      </div>

      {/* Highlights */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">Why Choose TheStatsCalculator</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Users className="w-6 h-6 text-blue-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Professional Team</h3>
            <p className="text-gray-600 leading-relaxed">
              Built by statisticians and developers with extensive experience in data analysis and web development.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Award className="w-6 h-6 text-green-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Free Tools</h3>
            <p className="text-gray-600 leading-relaxed">
              All our core statistical tools are completely free to use, making professional analysis accessible to everyone.
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center hover:shadow-md transition-shadow">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-purple-600" aria-hidden="true" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-3">Continual Improvements</h3>
            <p className="text-gray-600 leading-relaxed">
              We regularly update our tools based on user feedback and the latest statistical methods and best practices.
            </p>
          </div>
        </div>
      </div>

      {/* Team Section */}
      <div className="mb-12">
        <div className="bg-gray-50 rounded-lg p-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Our Commitment</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Accuracy First</h3>
              <p className="text-gray-700 leading-relaxed">
                Every calculation is thoroughly tested and validated against established statistical methods to ensure
                you can trust our results for your research and analysis.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">User-Centered Design</h3>
              <p className="text-gray-700 leading-relaxed">
                We design our tools with real users in mind, focusing on clarity, ease of use, and comprehensive
                documentation to support your statistical journey.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div id="contact" className="mb-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Get in Touch</h2>
            <div className="space-y-4 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-600" aria-hidden="true" />
                <a
                  href="mailto:contact@thestatscalculator.com"
                  className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
                  onClick={() => console.log('legal_contact_click', { channel: 'email' })}
                >
                  contact@thestatscalculator.com
                </a>
              </div>
            </div>
            <div className="text-sm text-gray-600">
              <p className="mb-2">
                <strong>Business Hours:</strong> Monday - Friday, 9:00 AM - 6:00 PM (UTC)
              </p>
              <p>
                <strong>Response Time:</strong> We aim to respond to all inquiries within 24 hours.
              </p>
            </div>
          </div>

          <div>
            <ContactForm onSubmit={handleContactSubmit} />
          </div>
        </div>
      </div>

      {/* Footer Information */}
      <div className="border-t border-gray-200 pt-8 text-center">
        <div className="text-sm text-gray-600 space-y-2">
          <p>
            <strong>Last Updated:</strong> January 15, 2025 | <strong>Version:</strong> 1.0
          </p>
          <div className="flex justify-center space-x-4">
            <Link
              href="/privacy-policy"
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
            >
              Privacy Policy
            </Link>
            <span className="text-gray-400">|</span>
            <Link
              href="/terms-of-service"
              className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md px-1"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </div>
      <Footer />
    </>
  );
};

export default AboutPageClient;
