import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';
import MedianCalculatorClient from './MedianCalculatorClient';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata({
  title: 'Median Calculator | Calculate Middle Value Online - StatCal',
  description: 'Free online median calculator. Calculate the middle value of your dataset with quartiles, outlier detection, and statistical analysis tools.',
  keywords: [
    'median calculator',
    'middle value calculator', 
    'quartiles calculator',
    'statistical analysis',
    'outlier detection',
    'data analysis tool'
  ]
});

export default function MedianCalculatorPage() {
  return <MedianCalculatorClient />;
}
