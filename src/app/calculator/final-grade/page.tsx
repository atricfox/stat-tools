/**
 * Final Grade Calculator Page - US-019 Implementation
 * Route: /calculator/final-grade
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import FinalGradeCalculator from '@/components/calculators/FinalGradeCalculator';

export const metadata: Metadata = {
  title: 'Final Grade Calculator - StatCal Statistical Tools',
  description: 'Calculate the final exam score needed to achieve your target grade. Supports weighted grade calculations with feasibility analysis and study recommendations.',
  keywords: ['final grade calculator', 'exam score predictor', 'grade calculator', 'weighted average', 'target grade', 'study planning'],
  openGraph: {
    title: 'Final Grade Calculator',
    description: 'Calculate required final exam score to achieve your target grade',
    type: 'website',
  },
  alternates: {
    canonical: '/calculator/final-grade'
  }
};

// 结构化数据 for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Final Grade Calculator',
  description: 'Calculate required final exam score to achieve your target grade',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    'Weighted grade calculations',
    'Final exam score prediction',
    'Feasibility analysis',
    'Study recommendations',
    'Real-time calculation updates'
  ]
};

export default function FinalGradeCalculatorPage() {
  const breadcrumbs = [
    { label: 'Calculators', href: '/calculator' },
    { label: 'Final Grade Calculator' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="Final Grade Calculator"
        description="Calculate the final exam score needed to achieve your target grade and plan your study strategy"
        breadcrumbs={breadcrumbs}
        currentTool="final-grade-calculator"
        toolCategory="gpa"
      >
        <FinalGradeCalculator />
      </CalculatorLayout>
    </>
  );
}