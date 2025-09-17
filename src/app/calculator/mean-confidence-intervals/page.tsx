import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('mean-confidence-intervals', {
  title: 'Mean Confidence Intervals Calculator | t, Bootstrap, BCa - StatCal',
  description: 'Calculate multiple types of confidence intervals for the mean: t-interval, Bootstrap percentile, BCa, and trimmed mean. Compare methods and understand distribution assumptions.',
  keywords: [
    'confidence interval calculator',
    'mean confidence interval', 
    'bootstrap confidence interval',
    'BCa confidence interval',
    'trimmed mean',
    't-interval calculator',
    'statistical inference',
    'bootstrap sampling'
  ]
});

import MeanCICalculatorClient from './MeanCICalculatorClient';

export default function MeanCICalculatorPage() {
  return <MeanCICalculatorClient />;
}