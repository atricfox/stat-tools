/**
 * Final Grade Calculator Page - US-019 Implementation
 * Route: /calculator/final-grade
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import FinalGradeCalculator from '@/components/calculators/FinalGradeCalculator';

export const metadata: Metadata = {
  title: '期末成绩预测计算器 - StatCal 统计工具',
  description: '预测期末考试所需分数，帮助学生制定学习目标。支持多项成绩加权计算，提供可行性分析和学习建议。',
  keywords: ['期末成绩预测', '成绩计算器', '学习规划', '目标分数', '加权平均', '考试预测'],
  openGraph: {
    title: '期末成绩预测计算器',
    description: '预测期末考试所需分数，科学制定学习目标',
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
  name: '期末成绩预测计算器',
  description: '预测期末考试所需分数，帮助学生制定学习目标',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    '多项成绩加权计算',
    '期末分数预测',
    '可行性分析',
    '学习建议',
    '实时计算更新'
  ]
};

export default function FinalGradeCalculatorPage() {
  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '计算器', href: '/calculator' },
    { label: '期末成绩预测' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="期末成绩预测计算器"
        description="预测期末考试所需分数，制定科学的学习目标和复习计划"
        breadcrumbs={breadcrumbs}
        currentTool="final-grade-calculator"
        toolCategory="gpa"
      >
        <FinalGradeCalculator />
      </CalculatorLayout>
    </>
  );
}