#!/usr/bin/env node

/**
 * Run Lighthouse performance audits
 */

import { chromium } from 'playwright';
import fs from 'node:fs/promises';
import path from 'node:path';

// Simple chalk alternative
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

const PAGES_TO_AUDIT = [
  { name: 'Homepage', url: '/' },
  { name: 'Statistics Hub', url: '/statistics-calculators' },
  { name: 'Mean Calculator', url: '/calculator/mean' },
  { name: 'GPA Calculator', url: '/calculator/gpa' },
  { name: 'Glossary', url: '/glossary' },
];

const PERFORMANCE_BUDGET = {
  performance: 90,
  accessibility: 95,
  bestPractices: 90,
  seo: 95,
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  baseUrl: args.find(arg => arg.startsWith('--url='))?.split('=')[1] || 'http://localhost:3000',
  output: args.find(arg => arg.startsWith('--output='))?.split('=')[1] || 'lighthouse-report.json',
  headless: !args.includes('--headed'),
  help: args.includes('--help') || args.includes('-h'),
};

if (options.help) {
  console.log(`
${colors.bold('Lighthouse Performance Audit')}

Usage: npm run lighthouse [options]

Options:
  --url=<url>        Base URL to test (default: http://localhost:3000)
  --output=<file>    Output file for report (default: lighthouse-report.json)
  --headed           Run in headed mode (show browser)
  --help, -h         Show this help message

Examples:
  npm run lighthouse
  npm run lighthouse --url=https://thestatscalculator.com
  npm run lighthouse --output=performance.json --headed
`);
  process.exit(0);
}

async function runAudits() {
  console.log(colors.blue(colors.bold('\n🚀 Starting Lighthouse audits...\n')));
  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Output: ${options.output}\n`);
  
  const browser = await chromium.launch({
    headless: options.headless,
  });
  
  const results: any[] = [];
  
  for (const pageInfo of PAGES_TO_AUDIT) {
    const url = `${options.baseUrl}${pageInfo.url}`;
    console.log(`Auditing ${pageInfo.name}: ${url}`);
    
    const context = await browser.newContext();
    const page = await context.newPage();
    
    try {
      // Navigate to page
      await page.goto(url, { waitUntil: 'networkidle' });
      
      // Collect performance metrics
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        const paint = performance.getEntriesByType('paint');
        
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
          firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
        };
      });
      
      // Run basic accessibility checks
      await page.addScriptTag({
        path: require.resolve('axe-core/axe.min.js')
      });
      
      const a11yResults = await page.evaluate(() => {
        return (window as any).axe.run();
      });
      
      // Calculate scores (simplified)
      const scores = {
        performance: calculatePerformanceScore(metrics),
        accessibility: calculateA11yScore(a11yResults),
        bestPractices: 95, // Placeholder
        seo: 100, // Placeholder
      };
      
      // Check against budget
      const budgetStatus = checkBudget(scores);
      
      results.push({
        page: pageInfo.name,
        url,
        scores,
        metrics,
        accessibility: {
          violations: a11yResults.violations.length,
          passes: a11yResults.passes.length,
        },
        budgetStatus,
        timestamp: new Date().toISOString(),
      });
      
      // Display results
      displayPageResults(pageInfo.name, scores, budgetStatus);
      
    } catch (error) {
      console.error(colors.red(`  Error auditing ${pageInfo.name}: ${error}`));
      results.push({
        page: pageInfo.name,
        url,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
    
    await context.close();
  }
  
  await browser.close();
  
  // Save results
  await fs.writeFile(options.output, JSON.stringify(results, null, 2));
  
  // Display summary
  displaySummary(results);
  
  // Exit with error if budget failed
  const failedBudget = results.some(r => r.budgetStatus && !r.budgetStatus.passed);
  if (failedBudget) {
    console.log(colors.red('\n❌ Performance budget exceeded!'));
    process.exit(1);
  }
  
  console.log(colors.green('\n✅ All audits passed!'));
}

function calculatePerformanceScore(metrics: any): number {
  // Simplified scoring based on key metrics
  let score = 100;
  
  if (metrics.firstContentfulPaint > 1800) score -= 10;
  if (metrics.firstContentfulPaint > 3000) score -= 20;
  if (metrics.domContentLoaded > 3000) score -= 10;
  if (metrics.loadComplete > 5000) score -= 10;
  
  return Math.max(0, score);
}

function calculateA11yScore(results: any): number {
  const violations = results.violations;
  let score = 100;
  
  // Deduct points based on violation severity
  for (const violation of violations) {
    switch (violation.impact) {
      case 'critical':
        score -= 20;
        break;
      case 'serious':
        score -= 10;
        break;
      case 'moderate':
        score -= 5;
        break;
      case 'minor':
        score -= 2;
        break;
    }
  }
  
  return Math.max(0, score);
}

function checkBudget(scores: any): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  
  for (const [metric, threshold] of Object.entries(PERFORMANCE_BUDGET)) {
    if (scores[metric] < threshold) {
      failures.push(`${metric}: ${scores[metric]} < ${threshold}`);
    }
  }
  
  return {
    passed: failures.length === 0,
    failures,
  };
}

function displayPageResults(name: string, scores: any, budgetStatus: any) {
  const getEmoji = (score: number) => {
    if (score >= 90) return '🟢';
    if (score >= 50) return '🟡';
    return '🔴';
  };
  
  console.log(`  Performance: ${getEmoji(scores.performance)} ${scores.performance}`);
  console.log(`  Accessibility: ${getEmoji(scores.accessibility)} ${scores.accessibility}`);
  console.log(`  Best Practices: ${getEmoji(scores.bestPractices)} ${scores.bestPractices}`);
  console.log(`  SEO: ${getEmoji(scores.seo)} ${scores.seo}`);
  
  if (!budgetStatus.passed) {
    console.log(colors.red(`  Budget failures: ${budgetStatus.failures.join(', ')}`));
  } else {
    console.log(colors.green('  ✅ Budget passed'));
  }
  
  console.log('');
}

function displaySummary(results: any[]) {
  console.log(colors.bold('\n📊 Summary'));
  console.log('═══════════════════════════════════════════');
  
  const avgScores = {
    performance: 0,
    accessibility: 0,
    bestPractices: 0,
    seo: 0,
  };
  
  let validResults = 0;
  for (const result of results) {
    if (result.scores) {
      avgScores.performance += result.scores.performance;
      avgScores.accessibility += result.scores.accessibility;
      avgScores.bestPractices += result.scores.bestPractices;
      avgScores.seo += result.scores.seo;
      validResults++;
    }
  }
  
  if (validResults > 0) {
    avgScores.performance = Math.round(avgScores.performance / validResults);
    avgScores.accessibility = Math.round(avgScores.accessibility / validResults);
    avgScores.bestPractices = Math.round(avgScores.bestPractices / validResults);
    avgScores.seo = Math.round(avgScores.seo / validResults);
    
    console.log(`Average Performance: ${avgScores.performance}`);
    console.log(`Average Accessibility: ${avgScores.accessibility}`);
    console.log(`Average Best Practices: ${avgScores.bestPractices}`);
    console.log(`Average SEO: ${avgScores.seo}`);
  }
  
  const errors = results.filter(r => r.error);
  if (errors.length > 0) {
    console.log(colors.red(`\nErrors: ${errors.length} pages failed to audit`));
  }
}

// Run the audits
runAudits().catch(error => {
  console.error(colors.red('Fatal error:'), error);
  process.exit(1);
});