#!/usr/bin/env node

/**
 * Link checking script for CI/CD and local development
 */

import { LinkChecker } from '../src/lib/linkChecker/linkChecker';
import fs from 'node:fs/promises';
import path from 'node:path';
import chalk from 'chalk';

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  output: args.includes('--json') ? 'json' : 'console',
  reportFile: args.find(arg => arg.startsWith('--report='))?.split('=')[1],
  failOnBroken: args.includes('--fail-on-broken'),
  baseUrl: args.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000',
  help: args.includes('--help') || args.includes('-h')
};

// Show help
if (options.help) {
  console.log(`
${chalk.bold('Link Checker')}

Usage: npm run check-links [options]

Options:
  --json              Output results as JSON
  --report=<file>     Save report to file (markdown or JSON based on extension)
  --fail-on-broken    Exit with error code if broken links found
  --base-url=<url>    Base URL for checking (default: http://localhost:3000)
  --help, -h          Show this help message

Examples:
  npm run check-links
  npm run check-links --fail-on-broken
  npm run check-links --report=link-report.md
  npm run check-links --json --report=links.json
`);
  process.exit(0);
}

async function main() {
  console.log(chalk.blue.bold('\n🔍 Starting link check...\n'));
  
  const checker = new LinkChecker(options.baseUrl);
  
  try {
    // Run the check
    const report = await checker.checkAllLinks();
    
    // Display results
    if (options.output === 'json') {
      console.log(JSON.stringify(report, null, 2));
    } else {
      displayConsoleReport(report);
    }
    
    // Save report if requested
    if (options.reportFile) {
      await saveReport(report, options.reportFile, checker);
      console.log(chalk.green(`\n✅ Report saved to ${options.reportFile}`));
    }
    
    // Exit with appropriate code
    if (options.failOnBroken && report.brokenLinks > 0) {
      console.log(chalk.red(`\n❌ Found ${report.brokenLinks} broken links!`));
      process.exit(1);
    }
    
    console.log(chalk.green('\n✅ Link check completed successfully!'));
  } catch (error) {
    console.error(chalk.red('\n❌ Link check failed:'), error);
    process.exit(1);
  }
}

function displayConsoleReport(report: any) {
  // Summary
  console.log(chalk.bold('Summary:'));
  console.log(`  Total Links: ${report.totalLinks}`);
  console.log(`  ${chalk.green('✅ Valid:')} ${report.validLinks}`);
  
  if (report.brokenLinks > 0) {
    console.log(`  ${chalk.red('❌ Broken:')} ${report.brokenLinks}`);
  }
  
  if (report.redirects > 0) {
    console.log(`  ${chalk.yellow('↩️  Redirects:')} ${report.redirects}`);
  }
  
  if (report.warnings > 0) {
    console.log(`  ${chalk.yellow('⚠️  Warnings:')} ${report.warnings}`);
  }
  
  console.log(`  Duration: ${(report.duration / 1000).toFixed(2)}s`);
  
  // Broken links details
  const brokenLinks = report.results.filter((r: any) => r.status === 'broken');
  if (brokenLinks.length > 0) {
    console.log(chalk.red.bold('\n❌ Broken Links:'));
    for (const link of brokenLinks) {
      console.log(chalk.red(`\n  ${link.url}`));
      if (link.message) {
        console.log(chalk.gray(`    ${link.message}`));
      }
      console.log(chalk.gray('    Found in:'));
      link.foundIn.forEach((file: string) => {
        console.log(chalk.gray(`      - ${file}`));
      });
    }
  }
  
  // Redirects
  const redirects = report.results.filter((r: any) => r.status === 'redirect');
  if (redirects.length > 0) {
    console.log(chalk.yellow.bold('\n↩️  Redirects:'));
    for (const link of redirects) {
      console.log(chalk.yellow(`  ${link.url}`));
      if (link.redirectUrl) {
        console.log(chalk.gray(`    → ${link.redirectUrl}`));
      }
    }
  }
  
  // Warnings
  const warnings = report.results.filter((r: any) => r.status === 'warning');
  if (warnings.length > 0) {
    console.log(chalk.yellow.bold('\n⚠️  Warnings:'));
    for (const link of warnings) {
      console.log(chalk.yellow(`  ${link.url}`));
      if (link.message) {
        console.log(chalk.gray(`    ${link.message}`));
      }
    }
  }
}

async function saveReport(report: any, filePath: string, checker: LinkChecker) {
  const ext = path.extname(filePath).toLowerCase();
  
  let content: string;
  if (ext === '.json') {
    content = JSON.stringify(report, null, 2);
  } else {
    // Default to markdown
    content = checker.generateMarkdownReport(report);
  }
  
  await fs.writeFile(filePath, content, 'utf-8');
}

// Run the script
main().catch(error => {
  console.error(chalk.red('Unexpected error:'), error);
  process.exit(1);
});