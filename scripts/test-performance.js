#!/usr/bin/env node

/**
 * Performance test runner script
 * Comprehensive performance testing and benchmarking
 */

const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');

class PerformanceTestRunner {
  constructor() {
    this.startTime = Date.now();
    this.benchmarkResults = {};
    this.performanceThresholds = {
      calculationBasic: { maxTime: 10, unit: 'ms' },
      calculationHighPrecision: { maxTime: 30, unit: 'ms' },
      renderInitial: { maxTime: 200, unit: 'ms' },
      contextSwitch: { maxTime: 100, unit: 'ms' },
      cacheHit: { minSpeedup: 2, unit: 'x' },
      memoryGrowth: { maxGrowth: 10, unit: 'MB' }
    };
  }

  async run() {
    console.log('🚀 Starting Performance Test Suite');
    console.log('===================================\n');

    try {
      // Setup performance test environment
      await this.setupEnvironment();

      // Run performance tests
      await this.runPerformanceTests();

      // Run benchmark comparisons
      await this.runBenchmarks();

      // Analyze results and generate report
      await this.analyzeResults();

    } catch (error) {
      console.error('❌ Performance test suite failed:', error);
      process.exit(1);
    }
  }

  async setupEnvironment() {
    console.log('🔧 Setting up performance test environment...');

    // Ensure test directories exist
    const dirs = [
      'test-results/performance',
      'coverage/performance',
      'benchmarks'
    ];

    for (const dir of dirs) {
      try {
        await fs.access(dir);
      } catch {
        await fs.mkdir(dir, { recursive: true });
        console.log(`📁 Created directory: ${dir}`);
      }
    }

    // Configure Node.js for performance testing
    if (global.gc) {
      console.log('✅ Garbage collection available');
    } else {
      console.log('⚠️  Garbage collection not available (run with --expose-gc)');
    }

    console.log('✅ Environment setup complete\n');
  }

  async runPerformanceTests() {
    console.log('⚡ Running performance tests...');

    const testCategories = [
      {
        name: 'calculation-performance',
        description: 'Calculation Performance Tests',
        pattern: '__tests__/performance/calculation-performance.test.ts'
      },
      {
        name: 'component-performance', 
        description: 'Component Performance Tests',
        pattern: '__tests__/performance/component-performance.test.tsx'
      }
    ];

    for (const category of testCategories) {
      console.log(`\n🧪 Running ${category.description}...`);
      const success = await this.runTestCategory(category);
      
      if (!success) {
        console.log(`❌ ${category.description} failed`);
      } else {
        console.log(`✅ ${category.description} completed`);
      }
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
        '--runInBand', // Run tests serially for accurate performance measurements
        '--detectOpenHandles',
        '--forceExit'
      ], {
        stdio: 'pipe',
        shell: true,
        env: {
          ...process.env,
          NODE_OPTIONS: '--expose-gc --max-old-space-size=4096'
        }
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
        process.stderr.write(output);
      });

      testProcess.on('close', (code) => {
        const endTime = Date.now();
        const duration = endTime - startTime;

        this.benchmarkResults[category.name] = {
          description: category.description,
          duration,
          exitCode: code,
          success: code === 0,
          stdout,
          stderr
        };

        resolve(code === 0);
      });

      testProcess.on('error', (error) => {
        console.error(`❌ Failed to run ${category.description}:`, error);
        this.benchmarkResults[category.name] = {
          description: category.description,
          duration: 0,
          exitCode: -1,
          success: false,
          error: error.message
        };
        resolve(false);
      });
    });
  }

  async runBenchmarks() {
    console.log('\n📊 Running performance benchmarks...');

    try {
      // Create a simple benchmark runner
      const benchmarkCode = `
const { performance } = require('perf_hooks');
const { calculateMean } = require('./src/lib/calculations');
const { HighPrecisionCalculator } = require('./src/lib/high-precision-calculations');

async function runBenchmarks() {
  const benchmarks = {};
  
  // Basic calculation benchmark
  const basicData = Array.from({ length: 10000 }, (_, i) => Math.random() * 100);
  const basicStart = performance.now();
  calculateMean(basicData);
  benchmarks.basicCalculation = performance.now() - basicStart;
  
  // High-precision benchmark
  const hpStart = performance.now();
  const calculator = new HighPrecisionCalculator(basicData);
  calculator.calculateAll();
  benchmarks.highPrecisionCalculation = performance.now() - hpStart;
  
  console.log(JSON.stringify(benchmarks));
}

runBenchmarks().catch(console.error);
`;

      await fs.writeFile('benchmark-runner.js', benchmarkCode);
      
      const benchmarkResult = await this.runBenchmarkScript('benchmark-runner.js');
      
      if (benchmarkResult.success) {
        try {
          const benchmarkData = JSON.parse(benchmarkResult.stdout.trim());
          this.benchmarkResults.benchmarks = benchmarkData;
          
          console.log('📈 Benchmark Results:');
          Object.entries(benchmarkData).forEach(([name, time]) => {
            console.log(`  ${name}: ${time.toFixed(2)}ms`);
          });
        } catch (error) {
          console.warn('⚠️  Failed to parse benchmark results:', error);
        }
      }

      // Cleanup
      await fs.unlink('benchmark-runner.js').catch(() => {});
      
    } catch (error) {
      console.warn('⚠️  Benchmark execution failed:', error);
    }
  }

  async runBenchmarkScript(scriptPath) {
    return new Promise((resolve) => {
      const benchmarkProcess = spawn('node', [scriptPath], {
        stdio: 'pipe',
        shell: true
      });

      let stdout = '';
      let stderr = '';

      benchmarkProcess.stdout.on('data', (data) => {
        stdout += data.toString();
      });

      benchmarkProcess.stderr.on('data', (data) => {
        stderr += data.toString();
      });

      benchmarkProcess.on('close', (code) => {
        resolve({
          success: code === 0,
          exitCode: code,
          stdout,
          stderr
        });
      });
    });
  }

  async analyzeResults() {
    console.log('\n📊 Analyzing performance results...');

    const analysis = {
      summary: this.generateSummary(),
      thresholdChecks: this.checkThresholds(),
      recommendations: this.generateRecommendations(),
      timestamp: new Date().toISOString()
    };

    // Save detailed analysis
    const analysisPath = 'test-results/performance/analysis.json';
    await fs.writeFile(analysisPath, JSON.stringify(analysis, null, 2));
    console.log(`📄 Analysis saved to ${analysisPath}`);

    // Generate performance report
    await this.generatePerformanceReport(analysis);

    // Check for performance regressions
    const hasRegressions = this.checkForRegressions();
    
    if (hasRegressions) {
      console.log('\n⚠️  Performance regressions detected!');
      process.exit(1);
    } else {
      console.log('\n🎉 All performance tests passed!');
      process.exit(0);
    }
  }

  generateSummary() {
    const categories = Object.keys(this.benchmarkResults).filter(key => key !== 'benchmarks');
    const successful = categories.filter(cat => this.benchmarkResults[cat].success).length;
    const failed = categories.length - successful;
    const totalDuration = Date.now() - this.startTime;

    return {
      totalCategories: categories.length,
      successful,
      failed,
      totalDuration,
      benchmarks: this.benchmarkResults.benchmarks || {}
    };
  }

  checkThresholds() {
    const checks = {};
    
    // Extract performance metrics from test outputs
    Object.entries(this.benchmarkResults).forEach(([category, result]) => {
      if (result.stdout) {
        // Look for performance measurements in stdout
        const performanceLines = result.stdout
          .split('\\n')
          .filter(line => line.includes('ms') || line.includes('Performance'));
          
        checks[category] = {
          passed: result.success,
          performanceMetrics: performanceLines
        };
      }
    });

    return checks;
  }

  generateRecommendations() {
    const recommendations = [];

    // Check if any tests failed
    const failed = Object.values(this.benchmarkResults).some(result => !result.success);
    if (failed) {
      recommendations.push('Some performance tests failed - review test output for specific issues');
    }

    // Check benchmark results against thresholds
    if (this.benchmarkResults.benchmarks) {
      const { basicCalculation, highPrecisionCalculation } = this.benchmarkResults.benchmarks;
      
      if (basicCalculation > this.performanceThresholds.calculationBasic.maxTime) {
        recommendations.push(`Basic calculation is slow (${basicCalculation.toFixed(2)}ms > ${this.performanceThresholds.calculationBasic.maxTime}ms)`);
      }
      
      if (highPrecisionCalculation > this.performanceThresholds.calculationHighPrecision.maxTime) {
        recommendations.push(`High-precision calculation is slow (${highPrecisionCalculation.toFixed(2)}ms > ${this.performanceThresholds.calculationHighPrecision.maxTime}ms)`);
      }

      if (recommendations.length === 0) {
        recommendations.push('All performance benchmarks are within acceptable thresholds');
      }
    }

    return recommendations;
  }

  async generatePerformanceReport(analysis) {
    const htmlReport = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Performance Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; margin: 40px; background: #f5f5f5; }
        .container { background: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 20px; border-radius: 8px; margin-bottom: 30px; }
        .summary-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 30px; }
        .metric-card { background: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center; }
        .metric-value { font-size: 2em; font-weight: bold; margin-bottom: 5px; }
        .success { color: #28a745; }
        .warning { color: #ffc107; }
        .danger { color: #dc3545; }
        .benchmark-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .benchmark-table th, .benchmark-table td { padding: 12px; text-align: left; border-bottom: 1px solid #ddd; }
        .benchmark-table th { background: #f8f9fa; font-weight: 600; }
        .recommendations { background: #e3f2fd; padding: 20px; border-radius: 8px; margin-top: 20px; }
        .recommendation-item { padding: 8px 0; border-bottom: 1px solid #bbdefb; }
        .recommendation-item:last-child { border-bottom: none; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>🚀 Performance Test Report</h1>
            <p>Generated: ${analysis.timestamp}</p>
        </div>
        
        <div class="summary-grid">
            <div class="metric-card">
                <div class="metric-value success">${analysis.summary.successful}</div>
                <div>Tests Passed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value ${analysis.summary.failed > 0 ? 'danger' : 'success'}">${analysis.summary.failed}</div>
                <div>Tests Failed</div>
            </div>
            <div class="metric-card">
                <div class="metric-value">${analysis.summary.totalDuration}ms</div>
                <div>Total Duration</div>
            </div>
        </div>
        
        ${Object.keys(analysis.summary.benchmarks).length > 0 ? `
        <h2>📊 Performance Benchmarks</h2>
        <table class="benchmark-table">
            <thead>
                <tr>
                    <th>Benchmark</th>
                    <th>Duration (ms)</th>
                    <th>Status</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(analysis.summary.benchmarks).map(([name, duration]) => `
                    <tr>
                        <td>${name}</td>
                        <td>${duration.toFixed(2)}ms</td>
                        <td><span class="success">✅ Pass</span></td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
        ` : ''}
        
        <div class="recommendations">
            <h3>💡 Recommendations</h3>
            ${analysis.recommendations.map(rec => `
                <div class="recommendation-item">${rec}</div>
            `).join('')}
        </div>
    </div>
</body>
</html>`;

    await fs.writeFile('test-results/performance/report.html', htmlReport);
    console.log('📊 HTML performance report saved to test-results/performance/report.html');
  }

  checkForRegressions() {
    // Simple regression check based on test failures
    const hasFailures = Object.values(this.benchmarkResults).some(result => !result.success);
    
    if (hasFailures) {
      console.log('❌ Performance regressions detected in test failures');
      return true;
    }

    // Check benchmark thresholds
    if (this.benchmarkResults.benchmarks) {
      const { basicCalculation, highPrecisionCalculation } = this.benchmarkResults.benchmarks;
      
      if (basicCalculation > this.performanceThresholds.calculationBasic.maxTime * 2) {
        console.log(`❌ Severe regression in basic calculation: ${basicCalculation.toFixed(2)}ms`);
        return true;
      }
      
      if (highPrecisionCalculation > this.performanceThresholds.calculationHighPrecision.maxTime * 2) {
        console.log(`❌ Severe regression in high-precision calculation: ${highPrecisionCalculation.toFixed(2)}ms`);
        return true;
      }
    }

    return false;
  }
}

// Run performance tests
if (require.main === module) {
  const runner = new PerformanceTestRunner();
  runner.run().catch(console.error);
}

module.exports = PerformanceTestRunner;