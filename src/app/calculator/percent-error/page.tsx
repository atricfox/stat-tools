import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('percent-error', {
  title: 'Percent Error Calculator | Calculate Measurement Accuracy - StatCal',
  description: 'Free online percent error calculator. Calculate percentage error between theoretical and experimental values. Perfect for students, teachers, and researchers.',
  keywords: [
    'percent error calculator',
    'percentage error',
    'experimental error',
    'measurement accuracy',
    'error analysis',
    'theoretical vs experimental',
    'scientific calculator',
    'statistics tool'
  ]
});

import PercentErrorCalculatorClient from './PercentErrorCalculatorClient';

export default function PercentErrorCalculatorPage() {
  return <PercentErrorCalculatorClient />;
}