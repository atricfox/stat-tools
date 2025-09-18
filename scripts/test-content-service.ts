#!/usr/bin/env tsx

import { contentService } from '../src/lib/content/ContentService';

console.log('🔍 Testing ContentService for Case Studies...\n');

try {
  // Test getting all case studies
  console.log('📋 Getting all case studies:');
  const caseStudies = contentService.getContentByType('case');
  
  console.log(`Found ${caseStudies.length} case studies:`);
  
  caseStudies.forEach((caseStudy, index) => {
    console.log(`\n${index + 1}. ${caseStudy.title}`);
    console.log(`   Slug: ${caseStudy.slug}`);
    console.log(`   Industry: ${caseStudy.industry || 'Not specified'}`);
    console.log(`   Content length: ${caseStudy.content.length} characters`);
    console.log(`   Status: ${caseStudy.status}`);
    console.log(`   Updated: ${caseStudy.updatedAt}`);
  });
  
  // Test specific new case study
  if (caseStudies.length > 0) {
    const newCase = caseStudies.find(c => c.slug === 'retail-customer-behavior-analytics');
    if (newCase) {
      console.log('\n🛒 Testing specific new case (Retail Analytics):');
      console.log(`   Title: ${newCase.title}`);
      console.log(`   Summary: ${newCase.summary.substring(0, 100)}...`);
      console.log(`   Industry: ${newCase.industry}`);
      console.log(`   Content length: ${newCase.content.length}`);
    } else {
      console.log('\n❌ Retail Analytics case not found');
    }
  }
  
  console.log('\n✅ ContentService test completed');
  
} catch (error) {
  console.error('❌ Error testing ContentService:', error);
}