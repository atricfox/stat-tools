/**
 * Semester Grade Calculator Page - US-022 Implementation
 * Route: /calculator/semester-grade
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import SemesterGradeCalculator from '@/components/calculators/SemesterGradeCalculator';

export const metadata: Metadata = {
  title: 'Semester Grade Calculator - StatCal Statistical Tools',
  description: 'Calculate semester GPA and overall grade with support for multiple grading systems. Get detailed grade analysis and academic recommendations.',
  keywords: ['semester grade calculator', 'GPA calculator', 'semester GPA', 'grade analysis', 'grading systems', 'credit hours'],
  openGraph: {
    title: 'Semester Grade Calculator',
    description: 'Calculate semester GPA and overall grade with multiple grading system support',
    type: 'website',
  },
  alternates: {
    canonical: '/calculator/semester-grade'
  }
};

// 结构化数据 for SEO
const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'Semester Grade Calculator',
  description: 'Calculate semester GPA and overall grade with multiple grading system support',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    'Multiple course batch calculation',
    'Multiple grading system support',
    'Automatic semester GPA calculation',
    'Grade analysis and recommendations',
    'Course contribution analysis'
  ]
};

export default function SemesterGradeCalculatorPage() {
  const breadcrumbs = [
    { label: 'Calculators', href: '/statistics-calculators' },
    { label: 'Semester Grade Calculator' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="Semester Grade Calculator"
        description="Calculate semester GPA and overall grade with multiple grading system support and detailed grade analysis"
        breadcrumbs={breadcrumbs}
        currentTool="semester-grade-calculator"
        toolCategory="gpa"
      >
        <SemesterGradeCalculator />
      </CalculatorLayout>
    </>
  );
}