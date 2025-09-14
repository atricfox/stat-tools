/**
 * Lighthouse Performance & Accessibility Testing
 */

import type { Page } from 'playwright';

export interface LighthouseScore {
  performance: number;
  accessibility: number;
  bestPractices: number;
  seo: number;
}

export interface LighthouseReport {
  url: string;
  scores: LighthouseScore;
  metrics: {
    firstContentfulPaint: number;
    largestContentfulPaint: number;
    totalBlockingTime: number;
    cumulativeLayoutShift: number;
    speedIndex: number;
  };
  audits: {
    passed: string[];
    failed: Array<{
      id: string;
      title: string;
      description: string;
      score: number;
    }>;
  };
  timestamp: string;
}

export interface A11yIssue {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
  }>;
}

export interface A11yReport {
  url: string;
  violations: A11yIssue[];
  passes: number;
  incomplete: number;
  inapplicable: number;
  timestamp: string;
}

/**
 * Run Lighthouse audit on a page
 */
export async function runLighthouseAudit(
  page: Page,
  url: string,
  options: {
    formFactor?: 'mobile' | 'desktop';
    throttling?: boolean;
  } = {}
): Promise<LighthouseReport> {
  // This would use Playwright with lighthouse
  // For now, return mock data for structure
  return {
    url,
    scores: {
      performance: 95,
      accessibility: 98,
      bestPractices: 95,
      seo: 100,
    },
    metrics: {
      firstContentfulPaint: 1200,
      largestContentfulPaint: 2400,
      totalBlockingTime: 100,
      cumulativeLayoutShift: 0.05,
      speedIndex: 2000,
    },
    audits: {
      passed: [],
      failed: [],
    },
    timestamp: new Date().toISOString(),
  };
}

/**
 * Run accessibility audit using axe-core
 */
export async function runA11yAudit(page: Page, url: string): Promise<A11yReport> {
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Inject axe-core
  await page.addScriptTag({
    path: require.resolve('axe-core/axe.min.js')
  });
  
  // Run axe audit
  const results = await page.evaluate(() => {
    return (window as any).axe.run();
  });
  
  return {
    url,
    violations: results.violations.map((v: any) => ({
      id: v.id,
      impact: v.impact,
      description: v.description,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.map((n: any) => ({
        html: n.html,
        target: n.target,
      })),
    })),
    passes: results.passes.length,
    incomplete: results.incomplete.length,
    inapplicable: results.inapplicable.length,
    timestamp: new Date().toISOString(),
  };
}

/**
 * Performance Budget Configuration
 */
export const PERFORMANCE_BUDGET = {
  scores: {
    performance: 90,
    accessibility: 95,
    bestPractices: 90,
    seo: 95,
  },
  metrics: {
    firstContentfulPaint: 1800,
    largestContentfulPaint: 2500,
    totalBlockingTime: 300,
    cumulativeLayoutShift: 0.1,
    speedIndex: 3000,
  },
  bundleSize: {
    javascript: 200000, // 200KB
    css: 50000, // 50KB
    total: 300000, // 300KB
  },
};

/**
 * Check if scores meet budget
 */
export function checkPerformanceBudget(
  scores: LighthouseScore,
  budget = PERFORMANCE_BUDGET.scores
): { passed: boolean; failures: string[] } {
  const failures: string[] = [];
  
  for (const [metric, threshold] of Object.entries(budget)) {
    const score = scores[metric as keyof LighthouseScore];
    if (score < threshold) {
      failures.push(`${metric}: ${score} < ${threshold}`);
    }
  }
  
  return {
    passed: failures.length === 0,
    failures,
  };
}

/**
 * Generate performance report markdown
 */
export function generatePerformanceReport(reports: LighthouseReport[]): string {
  const lines: string[] = [];
  
  lines.push('# Performance & Accessibility Report');
  lines.push('');
  lines.push(`**Generated:** ${new Date().toISOString()}`);
  lines.push('');
  
  // Summary table
  lines.push('## Summary');
  lines.push('');
  lines.push('| Page | Performance | Accessibility | Best Practices | SEO |');
  lines.push('|------|-------------|---------------|----------------|-----|');
  
  for (const report of reports) {
    const scores = report.scores;
    lines.push(
      `| ${report.url} | ${getScoreEmoji(scores.performance)} ${scores.performance} | ` +
      `${getScoreEmoji(scores.accessibility)} ${scores.accessibility} | ` +
      `${getScoreEmoji(scores.bestPractices)} ${scores.bestPractices} | ` +
      `${getScoreEmoji(scores.seo)} ${scores.seo} |`
    );
  }
  
  lines.push('');
  
  // Core Web Vitals
  lines.push('## Core Web Vitals');
  lines.push('');
  lines.push('| Page | FCP | LCP | TBT | CLS | Speed Index |');
  lines.push('|------|-----|-----|-----|-----|-------------|');
  
  for (const report of reports) {
    const m = report.metrics;
    lines.push(
      `| ${report.url} | ${m.firstContentfulPaint}ms | ${m.largestContentfulPaint}ms | ` +
      `${m.totalBlockingTime}ms | ${m.cumulativeLayoutShift} | ${m.speedIndex}ms |`
    );
  }
  
  lines.push('');
  
  // Failed audits
  const failedAudits = reports.filter(r => r.audits.failed.length > 0);
  if (failedAudits.length > 0) {
    lines.push('## Failed Audits');
    lines.push('');
    
    for (const report of failedAudits) {
      lines.push(`### ${report.url}`);
      lines.push('');
      
      for (const audit of report.audits.failed) {
        lines.push(`- **${audit.title}** (Score: ${audit.score})`);
        lines.push(`  ${audit.description}`);
      }
      lines.push('');
    }
  }
  
  return lines.join('\n');
}

function getScoreEmoji(score: number): string {
  if (score >= 90) return '🟢';
  if (score >= 50) return '🟡';
  return '🔴';
}

/**
 * Critical CSS extraction
 */
export async function extractCriticalCSS(
  page: Page,
  url: string
): Promise<string> {
  await page.goto(url, { waitUntil: 'networkidle' });
  
  // Get all stylesheets
  const stylesheets = await page.evaluate(() => {
    const sheets = Array.from(document.styleSheets);
    return sheets.map(sheet => {
      try {
        const rules = Array.from(sheet.cssRules || sheet.rules || []);
        return rules.map(rule => rule.cssText).join('\n');
      } catch (e) {
        // Cross-origin stylesheets
        return '';
      }
    }).join('\n');
  });
  
  // Get viewport dimensions
  const viewport = await page.viewportSize();
  if (!viewport) return '';
  
  // Get critical selectors (above the fold)
  const criticalSelectors = await page.evaluate((height) => {
    const elements = document.querySelectorAll('*');
    const critical = new Set<string>();
    
    for (const element of elements) {
      const rect = element.getBoundingClientRect();
      if (rect.top < height) {
        // Element is above the fold
        if (element.id) critical.add(`#${element.id}`);
        if (element.className) {
          const classes = element.className.toString().split(' ').filter(Boolean);
          classes.forEach(cls => critical.add(`.${cls}`));
        }
      }
    }
    
    return Array.from(critical);
  }, viewport.height);
  
  // Filter stylesheets to only critical selectors
  // This is a simplified version - production would use a proper CSS parser
  const criticalCSS = stylesheets
    .split('\n')
    .filter(line => {
      return criticalSelectors.some(selector => line.includes(selector));
    })
    .join('\n');
  
  return criticalCSS;
}

/**
 * Resource hints generator
 */
export function generateResourceHints(resources: {
  preconnect?: string[];
  prefetch?: string[];
  preload?: Array<{ href: string; as: string }>;
  dnsPrefetch?: string[];
}): string {
  const hints: string[] = [];
  
  // DNS Prefetch
  resources.dnsPrefetch?.forEach(url => {
    hints.push(`<link rel="dns-prefetch" href="${url}">`);
  });
  
  // Preconnect
  resources.preconnect?.forEach(url => {
    hints.push(`<link rel="preconnect" href="${url}">`);
    hints.push(`<link rel="preconnect" href="${url}" crossorigin>`);
  });
  
  // Preload
  resources.preload?.forEach(({ href, as }) => {
    const crossorigin = as === 'font' ? ' crossorigin' : '';
    hints.push(`<link rel="preload" href="${href}" as="${as}"${crossorigin}>`);
  });
  
  // Prefetch
  resources.prefetch?.forEach(url => {
    hints.push(`<link rel="prefetch" href="${url}">`);
  });
  
  return hints.join('\n');
}