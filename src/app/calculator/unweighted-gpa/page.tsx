import { Metadata } from 'next';
import UnweightedGPACalculatorClient from './UnweightedGPACalculatorClient';

export const metadata: Metadata = {
  title: 'Unweighted GPA Calculator - Calculate Standard 4.0 Scale GPA | StatCal',
  description: 'Calculate your unweighted GPA using standard 4.0 scale. Fair academic assessment without course difficulty bias. Perfect for college applications and academic planning.',
  keywords: [
    'unweighted gpa calculator',
    '4.0 scale',
    'gpa calculation',
    'academic assessment', 
    'college application',
    'standard gpa',
    'grade point average',
    'student tools',
    'academic performance'
  ].join(', '),
  openGraph: {
    title: 'Unweighted GPA Calculator | StatCal',
    description: 'Calculate standard unweighted GPA with 4.0 scale. No course difficulty weights - fair academic performance assessment.',
    type: 'website',
    url: '/calculator/unweighted-gpa'
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Unweighted GPA Calculator - Standard 4.0 Scale',
    description: 'Free unweighted GPA calculator for students. Calculate your true academic performance without course difficulty bias.'
  },
  alternates: {
    canonical: '/calculator/unweighted-gpa'
  }
};

export default function UnweightedGPACalculatorPage() {
  return <UnweightedGPACalculatorClient />;
}