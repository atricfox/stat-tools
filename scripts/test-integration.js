#!/usr/bin/env node

/**
 * Integration test runner script
 * Provides enhanced test execution with reporting and analysis
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class IntegrationTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.testResults = {};
  }

  async run() {
    console.log('🧪 Starting Integration Test Suite');
    console.log('=====================================\n');

    try {
      // Ensure test directories exist
      await this.ensureDirectories();

      // Run different test categories
      await this.runTestCategory('calculator-flow', 'Calculator Flow Tests');
      await this.runTestCategory('data-processing', 'Data Processing Tests');
      await this.runTestCategory('cache-performance', 'Cache & Performance Tests');

      // Generate summary report
      await this.generateSummaryReport();

    } catch (error) {
      console.error('❌ Integration test suite failed:', error);
      process.exit(1);
    }
  }

  async ensureDirectories() {
    const dirs = [
      'test-results',
      'test-results/integration',
      'coverage/integration'
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }
  }

  async runTestCategory(category, description) {
    console.log(`🔬 Running ${description}...`);
    const startTime = Date.now();

    return new Promise((resolve, reject) => {
      const testProcess = spawn('npx', [
        'jest',
        '--config', 'jest.config.integration.js',
        '--testNamePattern', category,
        '--coverage',
        '--coverageDirectory', `coverage/integration/${category}`,
        '--json',
        '--outputFile', `test-results/integration/${category}-results.json`
      ], {
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      testProcess.stdout.on('data', (data) => {
        stdout += data.toString();
        process.stdout.write(data);
      });

      testProcess.stderr.on('data', (data) => {
        stderr += data.toString();
        process.stderr.write(data);
      });

      testProcess.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.testResults[category] = {
          description,
          duration,
          exitCode: code,
          success: code === 0
        };

        if (code === 0) {
          console.log(`✅ ${description} completed in ${duration}ms\n`);
          resolve();
        } else {
          console.log(`❌ ${description} failed (exit code: ${code})\n`);
          // Don't reject immediately, continue with other tests
          resolve();
        }
      });

      testProcess.on('error', (error) => {
        console.error(`❌ Failed to run ${description}:`, error);
        this.testResults[category] = {
          description,
          duration: 0,
          exitCode: -1,
          success: false,
          error: error.message
        };
        resolve();
      });
    });
  }

  async generateSummaryReport() {
    const totalDuration = Date.now() - this.startTime;
    const categories = Object.keys(this.testResults);
    const successCount = categories.filter(cat => this.testResults[cat].success).length;
    const failureCount = categories.length - successCount;

    console.log('\n📊 Integration Test Summary');
    console.log('============================');
    console.log(`Total Categories: ${categories.length}`);
    console.log(`✅ Passed: ${successCount}`);
    console.log(`❌ Failed: ${failureCount}`);
    console.log(`⏱️  Total Time: ${totalDuration}ms`);
    console.log('');

    // Detailed results
    categories.forEach(category => {
      const result = this.testResults[category];
      const status = result.success ? '✅' : '❌';
      const duration = result.duration > 0 ? `${result.duration}ms` : 'N/A';
      console.log(`${status} ${result.description} (${duration})`);
      
      if (result.error) {
        console.log(`   Error: ${result.error}`);
      }
    });

    // Save detailed report
    const reportData = {
      summary: {
        totalCategories: categories.length,
        passed: successCount,
        failed: failureCount,
        totalDuration,
        timestamp: new Date().toISOString()
      },
      categories: this.testResults
    };

    try {
      await fs.writeFile(
        'test-results/integration/summary-report.json',
        JSON.stringify(reportData, null, 2)
      );
      console.log('\n📄 Detailed report saved to test-results/integration/summary-report.json');
    } catch (error) {
      console.warn('⚠️  Failed to save detailed report:', error.message);
    }

    // Generate HTML report if possible
    await this.generateHTMLReport(reportData);

    // Exit with appropriate code
    if (failureCount > 0) {
      console.log('\n❌ Some integration tests failed. Check the logs above for details.');
      process.exit(1);
    } else {
      console.log('\n🎉 All integration tests passed!');
      process.exit(0);
    }
  }

  async generateHTMLReport(reportData) {
    try {
      const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Integration Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; }
        .header { background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .passed { color: #28a745; }
        .failed { color: #dc3545; }
        .category { background: white; padding: 20px; border-radius: 8px; margin-bottom: 15px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
        .category-header { display: flex; justify-content: between; align-items: center; }
        .status-icon { font-size: 1.2em; margin-right: 10px; }
        .duration { color: #6c757d; font-size: 0.9em; }
        .error { color: #dc3545; background: #f8d7da; padding: 10px; border-radius: 4px; margin-top: 10px; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Integration Test Report</h1>
        <p>Generated: ${reportData.summary.timestamp}</p>
    </div>
    
    <div class="summary">
        <div class="metric">
            <div class="metric-value">${reportData.summary.totalCategories}</div>
            <div>Total Categories</div>
        </div>
        <div class="metric">
            <div class="metric-value passed">${reportData.summary.passed}</div>
            <div>Passed</div>
        </div>
        <div class="metric">
            <div class="metric-value failed">${reportData.summary.failed}</div>
            <div>Failed</div>
        </div>
        <div class="metric">
            <div class="metric-value">${reportData.summary.totalDuration}ms</div>
            <div>Total Time</div>
        </div>
    </div>
    
    <div class="categories">
        ${Object.entries(reportData.categories).map(([key, result]) => `
            <div class="category">
                <div class="category-header">
                    <div>
                        <span class="status-icon">${result.success ? '✅' : '❌'}</span>
                        <strong>${result.description}</strong>
                    </div>
                    <div class="duration">${result.duration > 0 ? `${result.duration}ms` : 'N/A'}</div>
                </div>
                ${result.error ? `<div class="error">Error: ${result.error}</div>` : ''}
            </div>
        `).join('')}
    </div>
</body>
</html>`;

      await fs.writeFile('test-results/integration/report.html', htmlReport);
      console.log('📊 HTML report saved to test-results/integration/report.html');
    } catch (error) {
      console.warn('⚠️  Failed to generate HTML report:', error.message);
    }
  }
}

// Run the integration tests
const runner = new IntegrationTestRunner();
runner.run().catch(console.error);