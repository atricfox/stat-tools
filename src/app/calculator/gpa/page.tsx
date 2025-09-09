/**
 * GPA Calculator Page
 * Comprehensive Grade Point Average calculation tool supporting multiple grading systems
 * Features: 4.0/4.3/4.5 grading scales, batch processing, educational guidance
 */

import type { Metadata } from 'next';
import { MetadataManager } from '@/components/seo/MetadataManager';

// Generate metadata for this page
const metadataManager = MetadataManager.getInstance();
export const metadata: Metadata = metadataManager.generateMetadata('gpa', {
  title: 'GPA Calculator | Grade Point Average Calculator - StatCal',
  description: 'Calculate your GPA with multiple grading systems (4.0, 4.3, 4.5). Support for custom grading scales, batch processing, and academic analysis.',
  keywords: [
    'GPA calculator',
    'grade point average',
    'GPA calculation',
    'academic calculator',
    '4.0 scale calculator',
    'college GPA calculator',
    'university grade calculator'
  ]
});

import GPACalculatorClient from './GPACalculatorClient';

export default function GPACalculatorPage() {
  return <GPACalculatorClient />;
}
