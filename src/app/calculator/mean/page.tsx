import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('mean', {
  title: 'Mean Calculator | Calculate Average Online - StatCal',
  description: 'Free online mean calculator. Calculate arithmetic mean, average of numbers instantly. Perfect for students, researchers, and data analysts.',
  keywords: [
    'mean calculator',
    'average calculator', 
    'arithmetic mean',
    'calculate mean online',
    'statistics calculator',
    'data analysis tool'
  ]
});

import MeanCalculatorClient from './MeanCalculatorClient';

export default function MeanCalculatorPage() {
  return <MeanCalculatorClient />;
}
