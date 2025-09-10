/**
 * Cumulative GPA Calculator Page - US-018 Implementation
 * Route: /calculator/cumulative-gpa
 */

import { Metadata } from 'next';
import CalculatorLayout from '@/components/layout/CalculatorLayout';
import CumulativeGPACalculator from '@/components/calculators/CumulativeGPACalculator';

export const metadata: Metadata = {
  title: '累积GPA计算器 - StatCal 统计工具',
  description: '计算多学期累积GPA，支持不同评分制度转换，为研究生申请提供准确的成绩分析和竞争力评估。',
  keywords: ['累积GPA', 'GPA计算', '研究生申请', '成绩转换', '竞争力分析', '多学期统计'],
  openGraph: {
    title: '累积GPA计算器',
    description: '计算多学期累积GPA，支持评分制度转换',
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
  name: '累积GPA计算器',
  description: '计算多学期累积GPA，支持不同评分制度转换，为研究生申请提供分析',
  applicationCategory: 'EducationalApplication',
  operatingSystem: 'Web Browser',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'CNY'
  },
  featureList: [
    '多学期课程管理',
    '评分制度转换',
    '累积GPA自动计算',
    '竞争力分析',
    '研究生申请指导',
    '成绩趋势分析'
  ]
};

export default function CumulativeGPACalculatorPage() {
  const breadcrumbs = [
    { label: '首页', href: '/' },
    { label: '计算器', href: '/calculator' },
    { label: '累积GPA计算' }
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      
      <CalculatorLayout
        title="累积GPA计算器"
        description="计算多学期累积GPA，支持评分制度转换，为研究生申请提供准确分析"
        breadcrumbs={breadcrumbs}
        currentTool="cumulative-gpa-calculator"
        toolCategory="gpa"
      >
        <CumulativeGPACalculator />
      </CalculatorLayout>
    </>
  );
}