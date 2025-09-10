/**
 * Semester Grade Calculator Page - US-022 Implementation
 * Route: /calculator/semester-grade
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import SemesterGradeCalculator from '@/components/calculators/SemesterGradeCalculator';

export const metadata: Metadata = {
  title: '学期总成绩计算器 - StatCal 统计工具',
  description: '计算学期GPA和总成绩，支持多种评分制度转换，提供详细的成绩分析和学习建议。',
  keywords: ['学期成绩', 'GPA计算', '学期总结', '成绩分析', '评分制度', '学分计算'],
  openGraph: {
    title: '学期总成绩计算器',
    description: '计算学期GPA和总成绩，支持多种评分制度',
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
  name: '学期总成绩计算器',
  description: '计算学期GPA和总成绩，支持多种评分制度转换',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    '多门课程批量计算',
    '多种评分制度支持',
    '学期GPA自动计算',
    '成绩分析和建议',
    '课程贡献度分析'
  ]
};

export default function SemesterGradeCalculatorPage() {
  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '计算器', href: '/calculator' },
    { label: '学期总成绩' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="学期总成绩计算器"
        description="计算学期GPA和总成绩，支持多种评分制度，提供详细的成绩分析"
        breadcrumbs={breadcrumbs}
        currentTool="semester-grade-calculator"
        toolCategory="gpa"
      >
        <SemesterGradeCalculator />
      </CalculatorLayout>
    </>
  );
}