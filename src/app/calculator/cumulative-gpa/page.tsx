/**
 * Cumulative GPA Calculator Page - US-018 Implementation
 * Route: /calculator/cumulative-gpa
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import CumulativeGPACalculator from '@/components/calculators/CumulativeGPACalculator';

export const metadata: Metadata = {
  title: 'Cumulative GPA Calculator - StatCal Statistical Tools',
  description: 'Calculate cumulative GPA across multiple semesters with grading system conversions. Perfect for graduate school applications with detailed academic analysis.',
  keywords: ['cumulative GPA calculator', 'GPA calculation', 'graduate school', 'grade conversion', 'academic analysis', 'multi-semester GPA'],
  openGraph: {
    title: 'Cumulative GPA Calculator',
    description: 'Calculate cumulative GPA across multiple semesters with grading system conversions',
    type: 'website',
  },
  alternates: {
    canonical: '/calculator/cumulative-gpa'
  }
};

// 结构化数据 for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Cumulative GPA Calculator',
  description: 'Calculate cumulative GPA across multiple semesters with grading system conversions for graduate school applications',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    'Multi-semester course management',
    'Grading system conversions',
    'Automatic cumulative GPA calculation',
    'Competitiveness analysis',
    'Graduate school application guidance',
    'Grade trend analysis'
  ]
};

export default function CumulativeGPACalculatorPage() {
  const breadcrumbs = [
    { label: 'Calculators', href: '/statistics-calculators' },
    { label: 'Cumulative GPA Calculator' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="Cumulative GPA Calculator"
        description="Calculate cumulative GPA across multiple semesters with grading system conversions for graduate school applications"
        breadcrumbs={breadcrumbs}
        currentTool="cumulative-gpa-calculator"
        toolCategory="gpa"
      >
        <CumulativeGPACalculator />
      </CalculatorLayout>
    </>
  );
}