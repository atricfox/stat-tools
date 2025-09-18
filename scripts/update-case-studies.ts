#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

interface CaseStudy {
  slug: string;
  title: string;
  summary: string;
  industry: string;
  problem: string;
  solution: string;
  results: string[];
  lessons: string[];
  toolsUsed: string[];
  contentFile: string;
}

function updateCaseStudies() {
  const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
  
  // New comprehensive case studies to add
  const newCaseStudies: CaseStudy[] = [
    {
      slug: 'manufacturing-quality-control-spc',
      title: 'Manufacturing Quality Control: Statistical Process Control Implementation',
      summary: 'TechPrecision Manufacturing implemented comprehensive statistical process control methods to improve product quality and reduce defect rates in electronic component production, achieving 99.92% defect-free production.',
      industry: 'manufacturing',
      problem: 'High defect rate (0.8%) exceeding aerospace tolerance (0.03%), inconsistent quality across shifts, $240,000 annual waste, and customer complaints.',
      solution: 'Implemented statistical process control with real-time monitoring, control charts, process capability analysis, and automated quality alerts.',
      results: [
        '83% reduction in defect rate (0.8% to 0.08%)',
        '$583,000 annual financial benefit with 366% ROI',
        '99.92% defect-free production achievement',
        '97% reduction in customer complaints',
        'Process capability improved from 0.88 to 1.87'
      ],
      lessons: [
        'Statistical process control requires comprehensive training and management commitment',
        'Real-time monitoring enables predictive rather than reactive quality control',
        'Control charts must be properly interpreted and acted upon consistently',
        'Process capability analysis identifies improvement opportunities systematically'
      ],
      toolsUsed: [
        'mean-calculator',
        'standard-deviation-calculator',
        'range-calculator',
        'variance-calculator'
      ],
      contentFile: 'enhanced-case-manufacturing-quality.md'
    },
    {
      slug: 'healthcare-wait-time-optimization',
      title: 'Healthcare Analytics: Patient Wait Time Optimization in Emergency Department',
      summary: 'Metropolitan General Hospital implemented comprehensive statistical analysis to reduce emergency department patient wait times, achieving 40% reduction while improving patient satisfaction and clinical outcomes.',
      industry: 'healthcare',
      problem: 'Average wait time of 4.2 hours (vs 2.8 national average), patient satisfaction at 2.3/5.0, 8.4% left without being seen rate, and $1.8M annual overtime costs.',
      solution: 'Implemented predictive analytics for patient flow, statistical staffing optimization, real-time monitoring dashboards, and automated patient communication systems.',
      results: [
        '40% reduction in average wait times (4.2 to 2.5 hours)',
        '78% improvement in patient satisfaction (2.3 to 4.1/5.0)',
        '63% reduction in left-without-being-seen rate (8.4% to 3.1%)',
        '$1.6M annual financial benefit with 148% ROI',
        '38% improvement in door-to-physician time'
      ],
      lessons: [
        'Predictive analytics can effectively forecast patient demand patterns',
        'Real-time statistical monitoring enables proactive capacity management',
        'Patient communication based on statistical estimates improves satisfaction',
        'Data-driven staffing optimization balances cost and service quality'
      ],
      toolsUsed: [
        'mean-calculator',
        'standard-deviation-calculator',
        'range-calculator',
        'variance-calculator'
      ],
      contentFile: 'enhanced-case-healthcare-analytics.md'
    },
    {
      slug: 'retail-customer-behavior-analytics',
      title: 'Retail Analytics: Customer Behavior Analysis and Sales Optimization',
      summary: 'FreshMart Supermarket chain implemented advanced statistical analytics to understand customer behavior and optimize operations, achieving 23% revenue increase and 18% improvement in customer satisfaction.',
      industry: 'retail',
      problem: '15% decline in customer retention, 22% food waste with frequent stockouts, inconsistent store performance, and limited understanding of customer purchase patterns.',
      solution: 'Implemented customer lifetime value analysis, predictive purchase modeling, inventory optimization using statistical forecasting, and personalized marketing campaigns.',
      results: [
        '23% increase in revenue ($111.8M growth)',
        '18% improvement in customer satisfaction (3.4 to 4.0/5.0)',
        '68% reduction in fresh product waste (22% to 7%)',
        '2,022% ROI through statistical optimization',
        '15% improvement in customer retention'
      ],
      lessons: [
        'Customer lifetime value analysis enables targeted marketing investment',
        'Statistical demand forecasting dramatically reduces inventory waste',
        'Personalized recommendations based on purchase patterns increase sales',
        'Store layout optimization using traffic analytics improves revenue per customer'
      ],
      toolsUsed: [
        'mean-calculator',
        'standard-deviation-calculator',
        'range-calculator',
        'variance-calculator'
      ],
      contentFile: 'enhanced-case-retail-analytics.md'
    }
  ];
  
  // Connect to database
  const db = new Database(dbPath);
  
  try {
    console.log('🚀 Starting Case Studies enhancement...\n');
    
    // Prepare insert statement
    const insertStmt = db.prepare(`
      INSERT INTO slim_content (
        slug, type, title, summary, content, status, industry, 
        tags, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    `);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const caseStudy of newCaseStudies) {
      try {
        const contentPath = path.join(process.cwd(), caseStudy.contentFile);
        
        if (!fs.existsSync(contentPath)) {
          console.log(`❌ Content file not found: ${caseStudy.contentFile}`);
          errorCount++;
          continue;
        }
        
        // Read the content
        const content = fs.readFileSync(contentPath, 'utf8');
        
        // Check if case study already exists
        const existingCase = db.prepare('SELECT slug FROM slim_content WHERE slug = ?').get(caseStudy.slug);
        
        if (existingCase) {
          console.log(`⚠️  Case study already exists: ${caseStudy.slug}`);
          
          // Update existing case study
          const updateStmt = db.prepare(`
            UPDATE slim_content 
            SET title = ?, summary = ?, content = ?, industry = ?, 
                tags = ?, updated_at = CURRENT_TIMESTAMP
            WHERE slug = ?
          `);
          
          const tags = JSON.stringify([
            'case-study',
            caseStudy.industry,
            'statistical-analysis',
            'business-intelligence'
          ]);
          
          updateStmt.run(
            caseStudy.title,
            caseStudy.summary,
            content,
            caseStudy.industry,
            tags,
            caseStudy.slug
          );
          
          console.log(`✅ Updated existing case: ${caseStudy.slug}`);
          console.log(`📊 Content length: ${content.length} characters`);
          
        } else {
          // Insert new case study
          const tags = JSON.stringify([
            'case-study',
            caseStudy.industry,
            'statistical-analysis',
            'business-intelligence'
          ]);
          
          insertStmt.run(
            caseStudy.slug,
            'case',
            caseStudy.title,
            caseStudy.summary,
            content,
            'published',
            caseStudy.industry,
            tags
          );
          
          console.log(`✅ Added new case: ${caseStudy.slug}`);
          console.log(`📊 Content length: ${content.length} characters`);
        }
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${caseStudy.slug}:`, error);
        errorCount++;
      }
      
      console.log(''); // Add spacing between cases
    }
    
    // Generate summary report
    console.log('📋 Case Studies Enhancement Summary:');
    console.log('=====================================');
    console.log(`✅ Successfully processed: ${successCount} case studies`);
    console.log(`❌ Errors encountered: ${errorCount} case studies`);
    
    // Check final state
    const totalCases = db.prepare("SELECT COUNT(*) as count FROM slim_content WHERE type = 'case'").get() as {count: number};
    console.log(`📊 Total case studies in database: ${totalCases.count}`);
    
    // Show industry distribution
    const industries = db.prepare(`
      SELECT industry, COUNT(*) as count 
      FROM slim_content 
      WHERE type = 'case' 
      GROUP BY industry 
      ORDER BY count DESC
    `).all() as Array<{industry: string, count: number}>;
    
    console.log('\n🏭 Industry Distribution:');
    industries.forEach(ind => {
      console.log(`   ${ind.industry}: ${ind.count} case${ind.count > 1 ? 's' : ''}`);
    });
    
    console.log('\n🎉 Case Studies enhancement completed!');
    
  } catch (error) {
    console.error('❌ Error updating case studies:', error);
  } finally {
    db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  updateCaseStudies();
}