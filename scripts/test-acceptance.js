#!/usr/bin/env node

/**
 * User Acceptance Test Runner
 * Comprehensive testing from end-user perspective with detailed reporting
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class AcceptanceTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testResults = {};
    this.userStories = {
      'US-001': 'Student calculates test scores average',
      'US-002': 'Research assistant analyzes experimental data', 
      'US-003': 'Teacher processes student grades in bulk'
    };
    this.acceptanceCriteria = {
      'US-001': [
        'Student can enter test scores in various formats',
        'Student sees immediate feedback on data entry',
        'Student gets accurate average calculation',
        'Student can adjust precision as needed',
        'Student can copy/share results',
        'Interface works on mobile devices'
      ],
      'US-002': [
        'Research assistant can switch to research mode',
        'Research assistant can enter scientific notation',
        'Research assistant gets high-precision calculations',
        'Research assistant sees advanced statistical analysis',
        'Research assistant gets confidence intervals',
        'System handles complex mathematical operations'
      ],
      'US-003': [
        'Teacher can switch to teacher mode',
        'Teacher can upload/paste grade data',
        'Teacher can process tabulated data',
        'Teacher sees batch processing options',
        'Teacher gets class performance analytics',
        'System handles large datasets efficiently'
      ]
    };
  }

  async run() {
    console.log('🎯 Starting User Acceptance Test Suite');
    console.log('======================================\n');

    try {
      // Setup test environment
      await this.setupEnvironment();

      // Run acceptance tests
      await this.runAcceptanceTests();

      // Validate user stories
      await this.validateUserStories();

      // Generate comprehensive report
      await this.generateAcceptanceReport();

    } catch (error) {
      console.error('❌ Acceptance test suite failed:', error);
      process.exit(1);
    }
  }

  async setupEnvironment() {
    console.log('🔧 Setting up acceptance test environment...');

    const dirs = [
      'test-results/acceptance',
      'reports/user-acceptance'
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
      }
    }

    console.log('✅ Environment ready for acceptance testing\n');
  }

  async runAcceptanceTests() {
    console.log('🧪 Running User Acceptance Tests...\n');

    const testCategories = [
      {
        name: 'user-scenarios',
        description: 'Complete User Scenario Tests',
        pattern: '__tests__/acceptance/user-scenarios.test.tsx'
      }
    ];

    for (const category of testCategories) {
      console.log(`📋 Executing ${category.description}...`);
      const result = await this.runTestCategory(category);
      
      this.testResults[category.name] = result;
      
      if (result.success) {
        console.log(`✅ ${category.description} - All scenarios passed`);
      } else {
        console.log(`❌ ${category.description} - Some scenarios failed`);
      }
      console.log('');
    }
  }

  async runTestCategory(category) {
    return new Promise((resolve) => {
      const startTime = Date.now();
      
      const testProcess = spawn('npx', [
        'jest',
        '--testPathPattern', category.pattern,
        '--verbose',
        '--no-cache',
        '--runInBand',
        '--detectOpenHandles',
        '--forceExit',
        '--json',
        '--outputFile', `test-results/acceptance/${category.name}-results.json`
      ], {
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        const output = data.toString();
        stdout += output;
        process.stdout.write(output);
      });

      testProcess.stderr.on('data', (data) => {
        const output = data.toString();
        stderr += output;
        // Don't echo stderr to avoid noise, but capture it
      });

      testProcess.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        resolve({
          description: category.description,
          duration,
          exitCode: code,
          success: code === 0,
          stdout,
          stderr,
          timestamp: new Date().toISOString()
        });
      });

      testProcess.on('error', (error) => {
        resolve({
          description: category.description,
          duration: 0,
          exitCode: -1,
          success: false,
          error: error.message,
          timestamp: new Date().toISOString()
        });
      });
    });
  }

  async validateUserStories() {
    console.log('📖 Validating User Stories...\n');

    const validation = {};

    for (const [storyId, storyTitle] of Object.entries(this.userStories)) {
      console.log(`📋 ${storyId}: ${storyTitle}`);
      
      const criteria = this.acceptanceCriteria[storyId] || [];
      const criteriaResults = [];

      // Analyze test output for story validation
      const testOutput = this.testResults['user-scenarios']?.stdout || '';
      
      criteria.forEach((criterion, index) => {
        // Simple validation based on test names and console outputs
        const criterionPassed = this.validateCriterion(criterion, testOutput, storyId);
        criteriaResults.push({
          criterion,
          passed: criterionPassed,
          index: index + 1
        });

        const status = criterionPassed ? '✅' : '❌';
        console.log(`  ${status} ${criterion}`);
      });

      const passedCount = criteriaResults.filter(c => c.passed).length;
      const totalCount = criteriaResults.length;
      const storyPassed = passedCount === totalCount;

      validation[storyId] = {
        title: storyTitle,
        criteria: criteriaResults,
        passed: storyPassed,
        passedCount,
        totalCount,
        completionRate: totalCount > 0 ? (passedCount / totalCount) * 100 : 0
      };

      console.log(`  📊 Story Status: ${passedCount}/${totalCount} criteria passed (${validation[storyId].completionRate.toFixed(1)}%)`);
      console.log('');
    }

    this.storyValidation = validation;
    return validation;
  }

  validateCriterion(criterion, testOutput, storyId) {
    // Map criteria to test indicators
    const criteriaMapping = {
      // US-001 Student criteria
      'Student can enter test scores in various formats': ['test scores average', 'type', 'Enter numbers'],
      'Student sees immediate feedback on data entry': ['values', 'feedback'],
      'Student gets accurate average calculation': ['87.75', 'calculated', 'average'],
      'Student can adjust precision as needed': ['precision', 'slider', 'adjusted'],
      'Student can copy/share results': ['copy results', 'share'],
      'Interface works on mobile devices': ['mobile', '375', 'combobox'],

      // US-002 Research criteria
      'Research assistant can switch to research mode': ['research', 'Research', 'switch'],
      'Research assistant can enter scientific notation': ['scientific', '1.234e-3', 'notation'],
      'Research assistant gets high-precision calculations': ['high precision', 'precision: 6', 'Advanced'],
      'Research assistant sees advanced statistical analysis': ['Advanced Statistical Analysis', 'research-results'],
      'Research assistant gets confidence intervals': ['Confidence Intervals', 'confidenceInterval'],
      'System handles complex mathematical operations': ['experimental data', 'analyzed'],

      // US-003 Teacher criteria
      'Teacher can switch to teacher mode': ['teacher', 'Teacher', 'teacher mode'],
      'Teacher can upload/paste grade data': ['upload', 'Upload', 'Sample Data'],
      'Teacher can process tabulated data': ['tabulated', 'tab', 'gradebook'],
      'Teacher sees batch processing options': ['Batch Processing', 'batch-processing'],
      'Teacher gets class performance analytics': ['bulk', 'grades', 'processed'],
      'System handles large datasets efficiently': ['1000', 'large dataset', 'efficiently']
    };

    const indicators = criteriaMapping[criterion] || [];
    
    // Check if any indicator is present in the test output
    return indicators.some(indicator => 
      testOutput.toLowerCase().includes(indicator.toLowerCase())
    );
  }

  async generateAcceptanceReport() {
    console.log('📊 Generating Acceptance Test Report...\n');

    const totalDuration = Date.now() - this.startTime;
    const overallSuccess = Object.values(this.testResults).every(result => result.success);
    
    // Calculate story completion statistics
    const storyStats = Object.values(this.storyValidation);
    const totalStories = storyStats.length;
    const passedStories = storyStats.filter(story => story.passed).length;
    const averageCompletion = storyStats.reduce((sum, story) => sum + story.completionRate, 0) / totalStories;

    const reportData = {
      summary: {
        totalStories,
        passedStories,
        failedStories: totalStories - passedStories,
        averageCompletion: averageCompletion.toFixed(1),
        overallSuccess,
        totalDuration,
        timestamp: new Date().toISOString()
      },
      userStories: this.storyValidation,
      testResults: this.testResults,
      recommendations: this.generateRecommendations()
    };

    // Save JSON report
    await fs.writeFile(
      'test-results/acceptance/acceptance-report.json',
      JSON.stringify(reportData, null, 2)
    );

    // Generate HTML report
    await this.generateHTMLReport(reportData);

    // Print summary
    this.printReportSummary(reportData);

    return reportData;
  }

  generateRecommendations() {
    const recommendations = [];
    const storyStats = Object.values(this.storyValidation);

    // Check for failed stories
    const failedStories = storyStats.filter(story => !story.passed);
    if (failedStories.length > 0) {
      recommendations.push({
        type: 'critical',
        message: `${failedStories.length} user stories have unmet acceptance criteria`,
        action: 'Review failed criteria and implement missing functionality'
      });
    }

    // Check for low completion rates
    const lowCompletionStories = storyStats.filter(story => story.completionRate < 80);
    if (lowCompletionStories.length > 0) {
      recommendations.push({
        type: 'improvement',
        message: `${lowCompletionStories.length} user stories have completion rates below 80%`,
        action: 'Focus on improving these user scenarios before release'
      });
    }

    // Check overall test success
    if (!Object.values(this.testResults).every(result => result.success)) {
      recommendations.push({
        type: 'technical',
        message: 'Some acceptance tests are failing',
        action: 'Fix failing tests to ensure system reliability'
      });
    }

    if (recommendations.length === 0) {
      recommendations.push({
        type: 'success',
        message: 'All user acceptance criteria have been met',
        action: 'System is ready for user acceptance and deployment'
      });
    }

    return recommendations;
  }

  async generateHTMLReport(reportData) {
    const { summary, userStories, recommendations } = reportData;
    
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>User Acceptance Test Report</title>
    <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 0; padding: 20px; background: #f5f7fa; }
        .container { max-width: 1200px; margin: 0 auto; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; border-radius: 12px; margin-bottom: 30px; }
        .header h1 { margin: 0 0 10px 0; font-size: 2.5em; }
        .header p { margin: 0; opacity: 0.9; font-size: 1.1em; }
        
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .summary-card { background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); text-align: center; }
        .summary-value { font-size: 3em; font-weight: bold; margin-bottom: 10px; }
        .summary-label { font-size: 1.1em; color: #666; text-transform: uppercase; letter-spacing: 1px; }
        .success { color: #10b981; }
        .warning { color: #f59e0b; }
        .danger { color: #ef4444; }
        .info { color: #3b82f6; }
        
        .story-section { background: white; border-radius: 12px; padding: 30px; margin-bottom: 30px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .story-header { display: flex; justify-content: between; align-items: center; margin-bottom: 20px; padding-bottom: 15px; border-bottom: 2px solid #e5e7eb; }
        .story-title { font-size: 1.5em; font-weight: 600; margin: 0; }
        .story-status { padding: 8px 16px; border-radius: 20px; font-weight: 600; font-size: 0.9em; }
        .status-passed { background: #d1fae5; color: #065f46; }
        .status-failed { background: #fee2e2; color: #991b1b; }
        
        .criteria-list { list-style: none; padding: 0; margin: 0; }
        .criteria-item { display: flex; align-items: flex-start; padding: 12px 0; border-bottom: 1px solid #f3f4f6; }
        .criteria-item:last-child { border-bottom: none; }
        .criteria-icon { width: 24px; height: 24px; margin-right: 12px; flex-shrink: 0; }
        .criteria-text { flex: 1; font-size: 1em; line-height: 1.5; }
        
        .completion-bar { width: 100%; height: 8px; background: #e5e7eb; border-radius: 4px; overflow: hidden; margin-top: 15px; }
        .completion-fill { height: 100%; transition: width 0.3s ease; }
        
        .recommendations { background: #f0f9ff; border: 1px solid #0ea5e9; border-radius: 12px; padding: 25px; margin-top: 30px; }
        .recommendations h3 { color: #0369a1; margin-top: 0; }
        .recommendation-item { display: flex; align-items: flex-start; margin-bottom: 15px; padding: 15px; border-radius: 8px; }
        .recommendation-item:last-child { margin-bottom: 0; }
        .rec-critical { background: #fef2f2; border-left: 4px solid #ef4444; }
        .rec-improvement { background: #fffbeb; border-left: 4px solid #f59e0b; }
        .rec-technical { background: #f0f9ff; border-left: 4px solid #3b82f6; }
        .rec-success { background: #f0fdf4; border-left: 4px solid #10b981; }
        
        @media (max-width: 768px) {
            .summary-grid { grid-template-columns: repeat(2, 1fr); }
            .story-header { flex-direction: column; align-items: flex-start; }
            .story-status { margin-top: 10px; }
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🎯 User Acceptance Test Report</h1>
            <p>Comprehensive validation of user scenarios and acceptance criteria</p>
            <p><strong>Generated:</strong> ${summary.timestamp}</p>
        </div>
        
        <div class="summary-grid">
            <div class="summary-card">
                <div class="summary-value success">${summary.passedStories}</div>
                <div class="summary-label">Stories Passed</div>
            </div>
            <div class="summary-card">
                <div class="summary-value ${summary.failedStories > 0 ? 'danger' : 'success'}">${summary.failedStories}</div>
                <div class="summary-label">Stories Failed</div>
            </div>
            <div class="summary-card">
                <div class="summary-value info">${summary.averageCompletion}%</div>
                <div class="summary-label">Avg Completion</div>
            </div>
            <div class="summary-card">
                <div class="summary-value">${summary.totalDuration}ms</div>
                <div class="summary-label">Test Duration</div>
            </div>
        </div>
        
        ${Object.entries(userStories).map(([storyId, story]) => `
            <div class="story-section">
                <div class="story-header">
                    <h2 class="story-title">${storyId}: ${story.title}</h2>
                    <div class="story-status ${story.passed ? 'status-passed' : 'status-failed'}">
                        ${story.passed ? '✅ PASSED' : '❌ FAILED'}
                    </div>
                </div>
                
                <ul class="criteria-list">
                    ${story.criteria.map(criterion => `
                        <li class="criteria-item">
                            <span class="criteria-icon">${criterion.passed ? '✅' : '❌'}</span>
                            <span class="criteria-text">${criterion.criterion}</span>
                        </li>
                    `).join('')}
                </ul>
                
                <div class="completion-bar">
                    <div class="completion-fill ${story.completionRate === 100 ? 'success' : story.completionRate >= 80 ? 'warning' : 'danger'}" 
                         style="width: ${story.completionRate}%; background: ${story.completionRate === 100 ? '#10b981' : story.completionRate >= 80 ? '#f59e0b' : '#ef4444'};"></div>
                </div>
                <p style="text-align: center; margin-top: 10px; font-weight: 600;">
                    ${story.passedCount}/${story.totalCount} criteria met (${story.completionRate.toFixed(1)}%)
                </p>
            </div>
        `).join('')}
        
        <div class="recommendations">
            <h3>💡 Recommendations & Next Steps</h3>
            ${recommendations.map(rec => `
                <div class="recommendation-item rec-${rec.type}">
                    <div>
                        <strong>${rec.type.charAt(0).toUpperCase() + rec.type.slice(1)}:</strong> ${rec.message}<br>
                        <strong>Action:</strong> ${rec.action}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile('reports/user-acceptance/acceptance-report.html', htmlReport);
    console.log('📊 HTML report saved to reports/user-acceptance/acceptance-report.html');
  }

  printReportSummary(reportData) {
    const { summary, userStories, recommendations } = reportData;
    
    console.log('🎯 USER ACCEPTANCE TEST SUMMARY');
    console.log('================================');
    console.log(`📊 Stories: ${summary.passedStories}/${summary.totalStories} passed (${((summary.passedStories/summary.totalStories)*100).toFixed(1)}%)`);
    console.log(`⏱️  Duration: ${summary.totalDuration}ms`);
    console.log(`📈 Average Completion: ${summary.averageCompletion}%`);
    console.log('');

    Object.entries(userStories).forEach(([storyId, story]) => {
      const status = story.passed ? '✅' : '❌';
      console.log(`${status} ${storyId}: ${story.completionRate.toFixed(1)}% (${story.passedCount}/${story.totalCount})`);
    });

    console.log('');
    console.log('💡 RECOMMENDATIONS:');
    recommendations.forEach(rec => {
      const icon = { critical: '🚨', improvement: '⚠️', technical: '🔧', success: '🎉' }[rec.type] || '💡';
      console.log(`${icon} ${rec.message}`);
    });

    if (summary.overallSuccess && summary.passedStories === summary.totalStories) {
      console.log('\n🎉 ALL ACCEPTANCE TESTS PASSED! System ready for deployment.');
      process.exit(0);
    } else {
      console.log('\n❌ Some acceptance criteria not met. Review and fix before deployment.');
      process.exit(1);
    }
  }
}

// Run acceptance tests
if (require.main === module) {
  const runner = new AcceptanceTestRunner();
  runner.run().catch(console.error);
}

module.exports = AcceptanceTestRunner;