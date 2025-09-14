#!/usr/bin/env node

/**
 * External link checking script with actual HTTP requests
 */

import { LinkChecker } from '../src/lib/linkChecker/linkChecker';
import { ExternalLinkChecker } from '../src/lib/linkChecker/externalLinkChecker';
import fs from 'node:fs/promises';
import path from 'node:path';

// Simple chalk alternative for colors
const colors = {
  red: (text: string) => `\x1b[31m${text}\x1b[0m`,
  green: (text: string) => `\x1b[32m${text}\x1b[0m`,
  yellow: (text: string) => `\x1b[33m${text}\x1b[0m`,
  blue: (text: string) => `\x1b[34m${text}\x1b[0m`,
  bold: (text: string) => `\x1b[1m${text}\x1b[0m`,
};

// Parse command line arguments
const args = process.argv.slice(2);
const options = {
  reportFile: args.find(arg => arg.startsWith('--report='))?.split('=')[1],
  timeout: parseInt(args.find(arg => arg.startsWith('--timeout='))?.split('=')[1] || '10000'),
  concurrent: parseInt(args.find(arg => arg.startsWith('--concurrent='))?.split('=')[1] || '5'),
  help: args.includes('--help') || args.includes('-h')
};

if (options.help) {
  console.log(`
${colors.bold('External Link Checker')}

Usage: npm run check-links:external [options]

Options:
  --report=<file>     Save report to file
  --timeout=<ms>      Request timeout in milliseconds (default: 10000)
  --concurrent=<n>    Number of concurrent checks (default: 5)
  --help, -h          Show this help message

Examples:
  npm run check-links:external
  npm run check-links:external --report=external-links.md
  npm run check-links:external --timeout=30000 --concurrent=10
`);
  process.exit(0);
}

async function main() {
  console.log(colors.blue(colors.bold('\n🌐 Starting external link check...\n')));
  
  // First, collect all links using the base LinkChecker
  const linkChecker = new LinkChecker();
  const report = await linkChecker.checkAllLinks();
  
  // Filter external links
  const externalLinks = report.results
    .filter(r => r.url.startsWith('http://') || r.url.startsWith('https://'))
    .map(r => r.url);
  
  if (externalLinks.length === 0) {
    console.log(colors.green('No external links found to check.'));
    return;
  }
  
  console.log(`Found ${externalLinks.length} external links to check...\n`);
  
  // Check external links with actual HTTP requests
  const externalChecker = new ExternalLinkChecker({
    timeout: options.timeout,
    concurrent: options.concurrent,
    retryAttempts: 2,
  });
  
  const results = await externalChecker.checkUrls(externalLinks);
  
  // Display results
  displayResults(results);
  
  // Save report if requested
  if (options.reportFile) {
    await saveReport(results, options.reportFile);
    console.log(colors.green(`\n✅ Report saved to ${options.reportFile}`));
  }
  
  // Exit with error if broken links found
  const brokenCount = Array.from(results.values())
    .filter(r => r.status === 'broken' || r.status === 'error').length;
  
  if (brokenCount > 0) {
    console.log(colors.red(`\n❌ Found ${brokenCount} broken external links!`));
    process.exit(1);
  } else {
    console.log(colors.green('\n✅ All external links are valid!'));
  }
}

function displayResults(results: Map<string, any>) {
  const allResults = Array.from(results.values());
  
  // Summary
  const summary = {
    total: allResults.length,
    valid: allResults.filter(r => r.status === 'valid').length,
    broken: allResults.filter(r => r.status === 'broken').length,
    redirect: allResults.filter(r => r.status === 'redirect').length,
    timeout: allResults.filter(r => r.status === 'timeout').length,
    error: allResults.filter(r => r.status === 'error').length,
  };
  
  console.log(colors.bold('Summary:'));
  console.log(`  Total: ${summary.total}`);
  console.log(`  ${colors.green('✅ Valid:')} ${summary.valid}`);
  if (summary.broken > 0) console.log(`  ${colors.red('❌ Broken:')} ${summary.broken}`);
  if (summary.redirect > 0) console.log(`  ${colors.yellow('↩️  Redirects:')} ${summary.redirect}`);
  if (summary.timeout > 0) console.log(`  ${colors.yellow('⏱️  Timeouts:')} ${summary.timeout}`);
  if (summary.error > 0) console.log(`  ${colors.red('⚠️  Errors:')} ${summary.error}`);
  
  // Broken links
  const broken = allResults.filter(r => r.status === 'broken');
  if (broken.length > 0) {
    console.log(colors.red(colors.bold('\n❌ Broken Links:')));
    for (const link of broken) {
      console.log(colors.red(`  ${link.url} (${link.statusCode})`));
      if (link.error) console.log(`    ${link.error}`);
    }
  }
  
  // Timeouts
  const timeouts = allResults.filter(r => r.status === 'timeout');
  if (timeouts.length > 0) {
    console.log(colors.yellow(colors.bold('\n⏱️  Timeouts:')));
    for (const link of timeouts) {
      console.log(colors.yellow(`  ${link.url}`));
      if (link.error) console.log(`    ${link.error}`);
    }
  }
  
  // Errors
  const errors = allResults.filter(r => r.status === 'error');
  if (errors.length > 0) {
    console.log(colors.red(colors.bold('\n⚠️  Errors:')));
    for (const link of errors) {
      console.log(colors.red(`  ${link.url}`));
      if (link.error) console.log(`    ${link.error}`);
    }
  }
  
  // Redirects
  const redirects = allResults.filter(r => r.status === 'redirect');
  if (redirects.length > 0) {
    console.log(colors.yellow(colors.bold('\n↩️  Redirects:')));
    for (const link of redirects) {
      console.log(colors.yellow(`  ${link.url} (${link.statusCode})`));
      if (link.redirectChain) {
        link.redirectChain.forEach((redirect: string, i: number) => {
          console.log(`    ${i + 1}. → ${redirect}`);
        });
      }
    }
  }
  
  // Response time stats
  const validLinks = allResults.filter(r => r.responseTime);
  if (validLinks.length > 0) {
    const times = validLinks.map(r => r.responseTime!);
    const avgTime = times.reduce((a, b) => a + b, 0) / times.length;
    const maxTime = Math.max(...times);
    const minTime = Math.min(...times);
    
    console.log(colors.bold('\n📊 Response Time Stats:'));
    console.log(`  Average: ${avgTime.toFixed(0)}ms`);
    console.log(`  Min: ${minTime}ms`);
    console.log(`  Max: ${maxTime}ms`);
  }
}

async function saveReport(results: Map<string, any>, filePath: string) {
  const allResults = Array.from(results.entries());
  
  const lines: string[] = [];
  lines.push('# External Link Check Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  
  // Summary
  const summary = {
    total: allResults.length,
    valid: allResults.filter(([_, r]) => r.status === 'valid').length,
    broken: allResults.filter(([_, r]) => r.status === 'broken').length,
    redirect: allResults.filter(([_, r]) => r.status === 'redirect').length,
    timeout: allResults.filter(([_, r]) => r.status === 'timeout').length,
    error: allResults.filter(([_, r]) => r.status === 'error').length,
  };
  
  lines.push('## Summary');
  lines.push('');
  lines.push(`- **Total:** ${summary.total}`);
  lines.push(`- **Valid:** ${summary.valid} ✅`);
  lines.push(`- **Broken:** ${summary.broken} ❌`);
  lines.push(`- **Redirects:** ${summary.redirect} ↩️`);
  lines.push(`- **Timeouts:** ${summary.timeout} ⏱️`);
  lines.push(`- **Errors:** ${summary.error} ⚠️`);
  lines.push('');
  
  // Details by status
  const statuses = ['broken', 'error', 'timeout', 'redirect', 'valid'];
  
  for (const status of statuses) {
    const filtered = allResults.filter(([_, r]) => r.status === status);
    if (filtered.length === 0) continue;
    
    const emoji = {
      broken: '❌',
      error: '⚠️',
      timeout: '⏱️',
      redirect: '↩️',
      valid: '✅',
    }[status];
    
    lines.push(`## ${emoji} ${status.charAt(0).toUpperCase() + status.slice(1)} Links`);
    lines.push('');
    
    for (const [url, result] of filtered) {
      lines.push(`### ${url}`);
      if (result.statusCode) lines.push(`- **Status Code:** ${result.statusCode}`);
      if (result.error) lines.push(`- **Error:** ${result.error}`);
      if (result.responseTime) lines.push(`- **Response Time:** ${result.responseTime}ms`);
      if (result.redirectChain && result.redirectChain.length > 0) {
        lines.push('- **Redirect Chain:**');
        result.redirectChain.forEach((redirect: string, i: number) => {
          lines.push(`  ${i + 1}. ${redirect}`);
        });
      }
      lines.push('');
    }
  }
  
  await fs.writeFile(filePath, lines.join('\n'), 'utf-8');
}

// Run the script
main().catch(error => {
  console.error(colors.red('Unexpected error:'), error);
  process.exit(1);
});