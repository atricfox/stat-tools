import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('range', {
  title: 'Range Calculator | Calculate Data Range & Spread - StatCal',
  description: 'Free online range calculator. Calculate data range, minimum, maximum, and distribution analysis. Perfect for students, teachers, and researchers.',
  keywords: [
    'range calculator',
    'data range',
    'minimum maximum',
    'data spread',
    'statistics calculator',
    'interquartile range',
    'outlier detection',
    'data analysis tool'
  ]
});

import RangeCalculatorClient from './RangeCalculatorClient';

export default function RangeCalculatorPage() {
  return <RangeCalculatorClient />;
}