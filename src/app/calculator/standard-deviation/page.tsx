/**
 * Standard Deviation Calculator Page
 * Complete statistical analysis tool with visualization and educational features
 * Supports sample/population calculations, outlier detection, and batch processing
 */

import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';
import { StructuredDataProvider, useStructuredData } from '@/components/seo/StructuredDataProvider';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('standard-deviation', {
  title: 'Standard Deviation Calculator | Population & Sample SD - StatCal',
  description: 'Calculate standard deviation online for population and sample data. Free statistical tool with step-by-step explanations and visualization.',
  keywords: [
    'standard deviation calculator',
    'population standard deviation',
    'sample standard deviation',
    'statistics calculator',
    'variance calculator',
    'statistical analysis'
  ]
});

import StandardDeviationClient from './StandardDeviationClient';

export default function StandardDeviationCalculatorPage() {
  return <StandardDeviationClient />;
}
