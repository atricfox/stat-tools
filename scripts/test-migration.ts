#!/usr/bin/env tsx

import path from 'node:path';
import { EnhancedContentService } from '../src/lib/services/enhanced-content';
import { HowToContentParser } from './content-migration-framework';

/**
 * Test Migration Script
 * Validates the migration process and verifies results
 */

function getDbPath(): string {
  return path.join(process.cwd(), 'data', 'statcal.db');
}

async function testContentParsing(): Promise<void> {
  console.log('🧪 Testing content parsing...');
  
  const parser = new HowToContentParser();
  const testContent = `
# Complete Guide to Using the Median Calculator

The median is the middle value in a dataset when numbers are arranged in order.

## When to Use Median Instead of Mean

### Best Use Cases:
- **Income data** (often skewed by high earners)
- **Real estate prices** (outliers can distort averages)

## Step-by-Step Calculation Process

### Method 1: Manual Calculation
1. **Arrange data in order** (smallest to largest)
2. **Count total values** (n)
3. **Find middle position**

### Method 2: Using Our Calculator
1. **Enter your data** in any format
2. **Click Calculate** - the system automatically sorts

## Prerequisites
- Basic understanding of data sets
- Calculator or computer access

## Expected Results
- Accurate median calculation
- Better understanding of data distribution
`;

  const parsed = parser.parseContent(testContent, 'test-howto');
  
  console.log('📊 Parsing Results:');
  console.log(`   Steps extracted: ${parsed.steps.length}`);
  console.log(`   Prerequisites: ${parsed.metadata.prerequisites.length}`);
  console.log(`   Outcomes: ${parsed.metadata.outcomes.length}`);
  console.log(`   Estimated time: ${parsed.metadata.estimated_time} minutes`);
  
  if (parsed.steps.length > 0) {
    console.log('\n📝 Steps preview:');
    parsed.steps.forEach((step, i) => {
      console.log(`   ${i + 1}. ${step.name}`);
      if (step.tip) console.log(`      💡 Tip: ${step.tip}`);
      if (step.warning) console.log(`      ⚠️  Warning: ${step.warning}`);
    });
  }
  
  console.log('✅ Content parsing test completed\n');
}

async function testDatabaseOperations(): Promise<void> {
  console.log('🗄️  Testing database operations...');
  
  try {
    const contentService = new EnhancedContentService();
    
    // Test migration status
    console.log('📊 Checking migration status...');
    const migrationStatus = await contentService.getMigrationStatus();
    console.log(`   Total How-To guides: ${migrationStatus.total}`);
    console.log(`   Migrated: ${migrationStatus.migrated}`);
    console.log(`   Pending: ${migrationStatus.pending}`);
    console.log(`   Failed: ${migrationStatus.failed}`);
    
    // Test structured steps check
    console.log('\n🔍 Testing structured steps detection...');
    const testSlugs = ['how-to-use-median-calculator', 'how-calculate-mean'];
    
    for (const slug of testSlugs) {
      const hasSteps = await contentService.hasStructuredSteps(slug);
      console.log(`   ${slug}: ${hasSteps ? '✅ Has steps' : '❌ No steps'}`);
    }
    
    // Test content retrieval
    console.log('\n📚 Testing content retrieval...');
    const howtoList = await contentService.getHowToList();
    console.log(`   Retrieved ${howtoList.length} How-To guides`);
    
    if (howtoList.length > 0) {
      const firstItem = howtoList[0];
      console.log(`   Sample: ${firstItem.title}`);
      console.log(`   Tags: ${firstItem.tags?.join(', ') || 'None'}`);
      console.log(`   Difficulty: ${firstItem.difficulty || 'Not specified'}`);
    }
    
    console.log('✅ Database operations test completed\n');
    
  } catch (error) {
    console.error('❌ Database operations test failed:', error);
  }
}

async function testEndToEndFlow(): Promise<void> {
  console.log('🔄 Testing end-to-end flow...');
  
  try {
    const contentService = new EnhancedContentService();
    
    // Test getting How-To with steps
    const testSlug = 'how-to-use-median-calculator';
    console.log(`📖 Testing retrieval of: ${testSlug}`);
    
    const result = await contentService.getHowToWithSteps(testSlug);
    
    if (result) {
      console.log('✅ Successfully retrieved content');
      console.log(`   Title: ${result.howto.title}`);
      console.log(`   Steps: ${result.steps.length}`);
      console.log(`   Content length: ${result.content.length} characters`);
      console.log(`   Prerequisites: ${result.howto.prerequisites?.length || 0}`);
      console.log(`   Outcomes: ${result.howto.outcomes?.length || 0}`);
      
      if (result.steps.length > 0) {
        console.log('\n📋 Steps structure:');
        result.steps.forEach((step, i) => {
          console.log(`   ${i + 1}. ${step.name} (ID: ${step.id})`);
        });
      }
    } else {
      console.log(`❌ No content found for: ${testSlug}`);
    }
    
    console.log('✅ End-to-end flow test completed\n');
    
  } catch (error) {
    console.error('❌ End-to-end flow test failed:', error);
  }
}

async function generateMigrationReport(): Promise<void> {
  console.log('📋 Generating migration report...');
  
  try {
    const contentService = new EnhancedContentService();
    const status = await contentService.getMigrationStatus();
    
    console.log('\n📊 Migration Status Report');
    console.log('=' .repeat(50));
    console.log(`📈 Total How-To Guides: ${status.total}`);
    console.log(`✅ Successfully Migrated: ${status.migrated}`);
    console.log(`⏳ Pending Migration: ${status.pending}`);
    console.log(`❌ Failed Migration: ${status.failed}`);
    console.log(`📊 Success Rate: ${status.total > 0 ? Math.round((status.migrated / status.total) * 100) : 0}%`);
    
    if (status.details.length > 0) {
      console.log('\n📋 Detailed Status:');
      console.log('-'.repeat(80));
      console.log('Slug'.padEnd(35) + 'Status'.padEnd(15) + 'Steps'.padEnd(10) + 'Has Structure');
      console.log('-'.repeat(80));
      
      status.details.forEach(item => {
        const slug = item.slug.padEnd(35);
        const migrationStatus = item.status.padEnd(15);
        const steps = item.steps_count.toString().padEnd(10);
        const hasStructure = item.has_structured_steps ? '✅' : '❌';
        
        console.log(`${slug}${migrationStatus}${steps}${hasStructure}`);
      });
    }
    
    console.log('\n✅ Migration report completed');
    
  } catch (error) {
    console.error('❌ Migration report generation failed:', error);
  }
}

async function runAllTests(): Promise<void> {
  console.log('🚀 Starting How-To Migration Tests\n');
  
  try {
    await testContentParsing();
    await testDatabaseOperations();
    await testEndToEndFlow();
    await generateMigrationReport();
    
    console.log('🎉 All tests completed successfully!');
    
  } catch (error) {
    console.error('💥 Test suite failed:', error);
    process.exit(1);
  }
}

// Execute if run directly
if (require.main === module) {
  runAllTests()
    .then(() => {
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test execution failed:', error);
      process.exit(1);
    });
}