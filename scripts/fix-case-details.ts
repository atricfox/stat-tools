#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import path from 'node:path';

interface CaseDetailData {
  contentId: number;
  slug: string;
  problem: string;
  solution: string;
  background: string;
  challenge: string;
  approach: any;
  resultsDetail: any;
  keyInsights: string[];
  recommendations: string[];
  results: string[];
  lessons: string[];
  toolsUsed: string[];
}

function fixCaseDetails() {
  const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
  const db = new Database(dbPath);
  
  try {
    console.log('🔧 Fixing Case Studies details...\n');
    
    // Get the content IDs for our new case studies
    const newCases = [
      'manufacturing-quality-control-spc',
      'healthcare-wait-time-optimization', 
      'retail-customer-behavior-analytics'
    ];
    
    const caseDetails: CaseDetailData[] = [
      {
        contentId: 35, // manufacturing
        slug: 'manufacturing-quality-control-spc',
        problem: 'High defect rate (0.8%) exceeding aerospace tolerance (0.03%), inconsistent quality across shifts, $240,000 annual waste, and customer complaints.',
        solution: 'Implemented statistical process control with real-time monitoring, control charts, process capability analysis, and automated quality alerts.',
        background: 'TechPrecision Manufacturing is a specialized electronic components manufacturer serving aerospace and defense industries, where quality requirements are extremely stringent.',
        challenge: 'The company faced mounting pressure from aerospace clients due to defect rates exceeding acceptable tolerances, with significant variation between production shifts and mounting financial losses.',
        approach: {
          phase1: 'Baseline assessment and data collection system implementation',
          phase2: 'Statistical process control chart development and training',
          phase3: 'Real-time monitoring system deployment',
          phase4: 'Process capability analysis and optimization'
        },
        resultsDetail: {
          defectReduction: '83% reduction in defect rate (0.8% to 0.08%)',
          financialBenefit: '$583,000 annual savings with 366% ROI',
          qualityAchievement: '99.92% defect-free production',
          customerSatisfaction: '97% reduction in complaints',
          processCapability: 'Cp improved from 0.88 to 1.87'
        },
        keyInsights: [
          'Statistical process control requires comprehensive training and management commitment',
          'Real-time monitoring enables predictive rather than reactive quality control',
          'Control charts must be properly interpreted and acted upon consistently',
          'Process capability analysis identifies improvement opportunities systematically'
        ],
        recommendations: [
          'Implement SPC training for all production staff',
          'Establish real-time monitoring dashboards',
          'Develop automated alert systems for process deviations',
          'Conduct regular process capability studies'
        ],
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
        ]
      },
      {
        contentId: 36, // healthcare
        slug: 'healthcare-wait-time-optimization',
        problem: 'Average wait time of 4.2 hours (vs 2.8 national average), patient satisfaction at 2.3/5.0, 8.4% left without being seen rate, and $1.8M annual overtime costs.',
        solution: 'Implemented predictive analytics for patient flow, statistical staffing optimization, real-time monitoring dashboards, and automated patient communication systems.',
        background: 'Metropolitan General Hospital is a 450-bed regional medical center serving over 85,000 emergency department patients annually in a competitive healthcare market.',
        challenge: 'Extended patient wait times were causing patient dissatisfaction, increased left-without-being-seen rates, and significant overtime costs while threatening the hospital\'s reputation and financial performance.',
        approach: {
          phase1: 'Historical data analysis and pattern identification',
          phase2: 'Predictive modeling for patient demand forecasting',
          phase3: 'Statistical staffing optimization implementation',
          phase4: 'Real-time monitoring and communication system deployment'
        },
        resultsDetail: {
          waitTimeReduction: '40% reduction in average wait times (4.2 to 2.5 hours)',
          satisfactionImprovement: '78% improvement in patient satisfaction (2.3 to 4.1/5.0)',
          lwbsReduction: '63% reduction in left-without-being-seen rate (8.4% to 3.1%)',
          financialBenefit: '$1.6M annual benefit with 148% ROI',
          clinicalImprovement: '38% improvement in door-to-physician time'
        },
        keyInsights: [
          'Predictive analytics can effectively forecast patient demand patterns',
          'Real-time statistical monitoring enables proactive capacity management',
          'Patient communication based on statistical estimates improves satisfaction',
          'Data-driven staffing optimization balances cost and service quality'
        ],
        recommendations: [
          'Expand predictive analytics to other hospital departments',
          'Implement advanced patient flow optimization algorithms',
          'Develop integrated communication systems for patient updates',
          'Establish continuous monitoring and improvement processes'
        ],
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
        ]
      },
      {
        contentId: 37, // retail
        slug: 'retail-customer-behavior-analytics',
        problem: '15% decline in customer retention, 22% food waste with frequent stockouts, inconsistent store performance, and limited understanding of customer purchase patterns.',
        solution: 'Implemented customer lifetime value analysis, predictive purchase modeling, inventory optimization using statistical forecasting, and personalized marketing campaigns.',
        background: 'FreshMart is a regional supermarket chain with 28 locations serving diverse communities, facing increasing competition from both traditional retailers and e-commerce platforms.',
        challenge: 'The company needed to understand customer behavior patterns to improve retention, reduce waste, optimize inventory, and compete effectively in a rapidly evolving retail landscape.',
        approach: {
          phase1: 'Customer data integration and behavior analysis',
          phase2: 'Statistical modeling for purchase prediction and CLV calculation',
          phase3: 'Inventory optimization using demand forecasting',
          phase4: 'Personalized marketing campaign implementation'
        },
        resultsDetail: {
          revenueGrowth: '23% increase in revenue ($111.8M growth)',
          satisfactionImprovement: '18% improvement in customer satisfaction (3.4 to 4.0/5.0)',
          wasteReduction: '68% reduction in fresh product waste (22% to 7%)',
          roiAchievement: '2,022% ROI through statistical optimization',
          retentionImprovement: '15% improvement in customer retention'
        },
        keyInsights: [
          'Customer lifetime value analysis enables targeted marketing investment',
          'Statistical demand forecasting dramatically reduces inventory waste',
          'Personalized recommendations based on purchase patterns increase sales',
          'Store layout optimization using traffic analytics improves revenue per customer'
        ],
        recommendations: [
          'Expand personalization algorithms to include seasonal and local preferences',
          'Implement dynamic pricing based on demand forecasting',
          'Develop cross-channel customer analytics platform',
          'Create predictive models for new product introduction success'
        ],
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
        ]
      }
    ];
    
    // Prepare insert statement for case details
    const insertDetailsStmt = db.prepare(`
      INSERT OR REPLACE INTO slim_content_details (content_id, details)
      VALUES (?, ?)
    `);
    
    let successCount = 0;
    
    for (const caseDetail of caseDetails) {
      try {
        // Create the structured details object
        const detailsObject = {
          case: {
            problem: caseDetail.problem,
            solution: caseDetail.solution,
            background: caseDetail.background,
            challenge: caseDetail.challenge,
            approach: caseDetail.approach,
            resultsDetail: caseDetail.resultsDetail,
            keyInsights: caseDetail.keyInsights,
            recommendations: caseDetail.recommendations,
            results: caseDetail.results,
            lessons: caseDetail.lessons,
            toolsUsed: caseDetail.toolsUsed
          }
        };
        
        // Insert the details
        insertDetailsStmt.run(caseDetail.contentId, JSON.stringify(detailsObject));
        
        console.log(`✅ Added details for: ${caseDetail.slug}`);
        console.log(`   Content ID: ${caseDetail.contentId}`);
        console.log(`   Problem: ${caseDetail.problem.substring(0, 80)}...`);
        console.log(`   Solution: ${caseDetail.solution.substring(0, 80)}...`);
        console.log(`   Results: ${caseDetail.results.length} items`);
        console.log('');
        
        successCount++;
        
      } catch (error) {
        console.error(`❌ Error processing ${caseDetail.slug}:`, error);
      }
    }
    
    console.log('📋 Case Details Fix Summary:');
    console.log('============================');
    console.log(`✅ Successfully processed: ${successCount} cases`);
    
    // Verify the details were added
    console.log('\n🔍 Verification:');
    for (const caseDetail of caseDetails) {
      const result = db.prepare(`
        SELECT json_extract(details, '$.case.problem') as problem
        FROM slim_content_details 
        WHERE content_id = ?
      `).get(caseDetail.contentId) as any;
      
      if (result && result.problem) {
        console.log(`✅ ${caseDetail.slug}: Details found`);
      } else {
        console.log(`❌ ${caseDetail.slug}: Details missing`);
      }
    }
    
    console.log('\n🎉 Case details fix completed!');
    
  } catch (error) {
    console.error('❌ Error fixing case details:', error);
  } finally {
    db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  fixCaseDetails();
}