/**
 * Variance Calculator Page
 * Complete statistical analysis tool with visualization and educational features
 * Supports sample/population calculations, outlier detection, and batch processing
 */

import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('variance', {
  title: 'Variance Calculator | Population & Sample Variance - StatCal',
  description: 'Calculate variance online for population and sample data. Free statistical tool with step-by-step explanations and comprehensive analysis.',
  keywords: [
    'variance calculator',
    'population variance',
    'sample variance',
    'statistics calculator',
    'statistical analysis',
    'data dispersion'
  ]
});

import VarianceClient from './VarianceClient';

export default function VarianceCalculatorPage() {
  return <VarianceClient />;
}