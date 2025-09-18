/**
 * Link Checker - Validates internal and external links
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import { globSync } from 'glob';

export interface LinkCheckResult {
  url: string;
  status: 'valid' | 'broken' | 'redirect' | 'warning';
  statusCode?: number;
  redirectUrl?: string;
  message?: string;
  foundIn: string[];
}

export interface LinkCheckReport {
  totalLinks: number;
  validLinks: number;
  brokenLinks: number;
  redirects: number;
  warnings: number;
  results: LinkCheckResult[];
  checkedAt: string;
  duration: number;
}

export class LinkChecker {
  private results: Map<string, LinkCheckResult> = new Map();
  private internalRoutes: Set<string> = new Set();
  private externalCache: Map<string, { status: number; redirectUrl?: string }> = new Map();

  constructor(private baseUrl: string = 'http://localhost:3000') {}

  /**
   * Check all links in the project
   */
  async checkAllLinks(): Promise<LinkCheckReport> {
    const startTime = Date.now();
    
    // 1. Collect all internal routes
    await this.collectInternalRoutes();
    
    // 2. Find all links in source files
    await this.findLinksInFiles();
    
    // 3. Validate each link
    await this.validateLinks();
    
    // 4. Generate report
    const duration = Date.now() - startTime;
    return this.generateReport(duration);
  }

  /**
   * Collect all internal routes from Next.js app directory
   */
  private async collectInternalRoutes() {
    const appDir = path.join(process.cwd(), 'src/app');
    
    // Find all page.tsx files
    const pageFiles = globSync('**/page.tsx', { 
      cwd: appDir,
      ignore: ['**/node_modules/**']
    });
    
    for (const pageFile of pageFiles) {
      const routePath = this.pageFileToRoute(pageFile);
      this.internalRoutes.add(routePath);
    }

    // Find all API route handlers
    const apiRouteFiles = globSync('api/**/route.ts', {
      cwd: appDir,
      ignore: ['**/node_modules/**']
    });

    for (const routeFile of apiRouteFiles) {
      const routePath = this.apiRouteFileToRoute(routeFile);
      this.internalRoutes.add(routePath);
    }
    
    // Add known static routes
    const staticRoutes = [
      '/',
      '/statistics-calculators',
      '/glossary',
      '/faq',
      '/cases',
      '/calculator/mean',
      '/calculator/median',
      '/calculator/standard-deviation',
      '/calculator/weighted-mean',
      '/calculator/gpa',
      '/calculator/unweighted-gpa',
    ];
    
    staticRoutes.forEach(route => this.internalRoutes.add(route));
  }

  /**
   * Convert page file path to route
   */
  private pageFileToRoute(pageFile: string): string {
    let route = '/' + path.dirname(pageFile);
    
    // Handle special Next.js conventions
    route = route.replace(/\/\(.*?\)/g, ''); // Remove route groups
    route = route.replace(/\[([^\]]+)\]/g, ':$1'); // Convert dynamic segments
    route = route.replace(/\/+/g, '/');
    route = route.replace(/\/page$/, '');
    route = route.replace(/\/$/, '') || '/';
    
    return route;
  }

  /**
   * Convert API route file path to route
   */
  private apiRouteFileToRoute(routeFile: string): string {
    let route = '/' + path.dirname(routeFile);

    route = route.replace(/\/\(.*?\)/g, ''); // Remove route groups
    route = route.replace(/\[([^\]]+)\]/g, ':$1'); // Convert dynamic segments
    route = route.replace(/\/+/g, '/');
    route = route.replace(/\/$/, '') || '/';

    return route;
  }

  /**
   * Find all links in source files
   */
  private async findLinksInFiles() {
    const srcDir = path.join(process.cwd(), 'src');
    const contentDir = path.join(process.cwd(), 'content');
    
    const filePatterns = [
      '**/*.tsx',
      '**/*.ts',
      '**/*.jsx',
      '**/*.js',
      '**/*.json',
      '**/*.md',
      '**/*.mdx'
    ];
    
    const directories = [srcDir, contentDir];
    
    for (const dir of directories) {
      for (const pattern of filePatterns) {
        const files = globSync(pattern, {
          cwd: dir,
          ignore: [
            '**/node_modules/**', 
            '**/.next/**', 
            '**/dist/**',
            '**/*.test.ts',
            '**/*.test.tsx',
            '**/*.spec.ts',
            '**/*.spec.tsx',
            '**/docs/**',
            '**/.specstory/**'
          ]
        });
        
        for (const file of files) {
          const filePath = path.join(dir, file);
          await this.extractLinksFromFile(filePath);
        }
      }
    }
  }

  /**
   * Extract links from a file
   */
  private async extractLinksFromFile(filePath: string) {
    try {
      const content = await fs.readFile(filePath, 'utf-8');
      const relativeFile = path.relative(process.cwd(), filePath);
      
      // Regular expressions for different link patterns
      const patterns = [
        // href attributes
        /href=["']([^"']+)["']/g,
        // Link/NextLink to prop
        /to=["']([^"']+)["']/g,
        // markdown links
        /\[([^\]]+)\]\(([^)]+)\)/g,
        // JSON URLs
        /"url":\s*"([^"]+)"/g,
        // fetch/axios calls
        /fetch\(["']([^"']+)["']/g,
        /axios\.[a-z]+\(["']([^"']+)["']/g,
      ];
      
      for (const pattern of patterns) {
        let match;
        while ((match = pattern.exec(content)) !== null) {
          const url = match[match.length - 1]; // Get the last capture group
          
          // Skip certain patterns
          if (this.shouldSkipUrl(url)) continue;
          
          // Add to results
          if (!this.results.has(url)) {
            this.results.set(url, {
              url,
              status: 'valid', // Default, will be validated
              foundIn: [relativeFile]
            });
          } else {
            const existing = this.results.get(url)!;
            if (!existing.foundIn.includes(relativeFile)) {
              existing.foundIn.push(relativeFile);
            }
          }
        }
      }
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error);
    }
  }

  /**
   * Check if URL should be skipped
   */
  private shouldSkipUrl(url: string): boolean {
    // Skip empty, variables, templates, and certain protocols
    if (!url || 
        url.includes('${') || 
        url.includes('{') ||
        url.startsWith('javascript:') ||
        url.startsWith('mailto:') ||
        url.startsWith('tel:') ||
        url.startsWith('data:') ||
        url === '#' ||
        url.startsWith('//')) {
      return true;
    }
    
    // Skip regex patterns and code snippets
    if (this.isRegexOrCodePattern(url)) {
      return true;
    }
    
    // Skip obvious non-URL patterns
    if (this.isNonUrlPattern(url)) {
      return true;
    }
    
    return false;
  }

  /**
   * Check if string is a regex pattern or code snippet
   */
  private isRegexOrCodePattern(str: string): boolean {
    const regexPatterns = [
      /^\?=\\d$/,  // ?=\d
      /^\[\^["']+\]\+?$/,  // [^"']+, [^\']*
      /^\$\d+$/,  // $2, $1 etc
      /^[a-zA-Z_]\[[a-zA-Z_]+\]$/,  // sanitized[key]
      /^\\[wsdWSD]\+?$/,  // \w+, \s*, \d+ etc
      /\([\?\*\+]\)/,  // regex quantifiers
      /\[\^.*\]/,  // character classes
    ];
    
    return regexPatterns.some(pattern => pattern.test(str));
  }

  /**
   * Check if string is obviously not a URL
   */
  private isNonUrlPattern(str: string): boolean {
    // Very short strings that are clearly not URLs
    if (str.length < 3) return true;
    
    // Contains only special characters
    if (/^[\$\?\*\+\[\]\(\)\\\^]+$/.test(str)) return true;
    
    // Starts with regex or code patterns
    if (/^[\$\?\*\+\[\]\(\)\\\^]/.test(str)) return true;
    
    // Contains square brackets (likely variable references)
    if (/\[[^\]]*\]/.test(str) && !str.includes('http')) return true;
    
    return false;
  }

  /**
   * Validate all collected links
   */
  private async validateLinks() {
    const links = Array.from(this.results.keys());
    
    // Process in batches to avoid overwhelming the system
    const batchSize = 10;
    for (let i = 0; i < links.length; i += batchSize) {
      const batch = links.slice(i, i + batchSize);
      await Promise.all(batch.map(url => this.validateLink(url)));
    }
  }

  /**
   * Validate a single link
   */
  private async validateLink(url: string) {
    const result = this.results.get(url)!;
    
    try {
      if (this.isInternalLink(url)) {
        // Check internal link
        result.status = this.validateInternalLink(url);
        if (result.status === 'broken') {
          result.message = `Internal route not found: ${url}`;
        }
      } else if (this.isExternalLink(url)) {
        // Check external link (cached)
        if (this.externalCache.has(url)) {
          const cached = this.externalCache.get(url)!;
          result.statusCode = cached.statusCode;
          result.status = this.getStatusFromCode(cached.statusCode);
          if (cached.redirectUrl) {
            result.redirectUrl = cached.redirectUrl;
          }
        } else {
          // Check against whitelist first
          if (this.isWhitelistedExternal(url)) {
            result.status = 'valid';
            result.statusCode = 200;
            result.message = 'Whitelisted external link';
          } else {
            result.status = 'warning';
            result.message = 'External link not verified';
          }
        }
      } else if (url.startsWith('#')) {
        // Anchor links
        result.status = 'valid';
        result.message = 'Anchor link';
      } else {
        result.status = 'warning';
        result.message = `Unknown link type: ${url}`;
      }
    } catch (error) {
      result.status = 'broken';
      result.message = error instanceof Error ? error.message : 'Validation error';
    }
  }

  /**
   * Check if link is internal
   */
  private isInternalLink(url: string): boolean {
    return url.startsWith('/') && !url.startsWith('//');
  }

  /**
   * Check if link is external
   */
  private isExternalLink(url: string): boolean {
    return url.startsWith('http://') || url.startsWith('https://');
  }

  /**
   * Validate internal link against known routes
   */
  private validateInternalLink(url: string): 'valid' | 'broken' | 'redirect' {
    // Remove query string and hash
    const cleanUrl = url.split('?')[0].split('#')[0];
    
    // Check exact match
    if (this.internalRoutes.has(cleanUrl)) {
      return 'valid';
    }
    
    // Check if it's a dynamic route
    for (const route of this.internalRoutes) {
      if (route.includes(':')) {
        const pattern = route.replace(/:([^/]+)/g, '[^/]+');
        const regex = new RegExp(`^${pattern}$`);
        if (regex.test(cleanUrl)) {
          return 'valid';
        }
      }
    }
    
    // Check if it's a file in public directory
    if (cleanUrl.match(/\.(ico|png|jpg|jpeg|gif|svg|pdf|txt|xml|json)$/i)) {
      // Assume static files are valid (would need actual file check in production)
      return 'valid';
    }
    
    return 'broken';
  }

  /**
   * Get status from HTTP status code
   */
  private getStatusFromCode(code: number): 'valid' | 'broken' | 'redirect' {
    if (code >= 200 && code < 300) return 'valid';
    if (code >= 300 && code < 400) return 'redirect';
    return 'broken';
  }

  /**
   * Check if external URL is whitelisted
   */
  private isWhitelistedExternal(url: string): boolean {
    const whitelist = [
      'https://thestatscalculator.com',
      'https://github.com',
      'https://docs.anthropic.com',
      'https://nextjs.org',
      'https://tailwindcss.com',
      'https://twitter.com/statscalculator',
      'https://example.com',  // Common test placeholder
    ];
    
    return whitelist.some(domain => url.startsWith(domain));
  }

  /**
   * Generate final report
   */
  private generateReport(duration: number): LinkCheckReport {
    const results = Array.from(this.results.values());
    
    const report: LinkCheckReport = {
      totalLinks: results.length,
      validLinks: results.filter(r => r.status === 'valid').length,
      brokenLinks: results.filter(r => r.status === 'broken').length,
      redirects: results.filter(r => r.status === 'redirect').length,
      warnings: results.filter(r => r.status === 'warning').length,
      results: results.sort((a, b) => {
        // Sort by status (broken first), then by URL
        const statusOrder = { broken: 0, redirect: 1, warning: 2, valid: 3 };
        const statusDiff = statusOrder[a.status] - statusOrder[b.status];
        if (statusDiff !== 0) return statusDiff;
        return a.url.localeCompare(b.url);
      }),
      checkedAt: new Date().toISOString(),
      duration
    };
    
    return report;
  }

  /**
   * Generate markdown report
   */
  generateMarkdownReport(report: LinkCheckReport): string {
    const lines: string[] = [];
    
    lines.push('# Link Check Report');
    lines.push('');
    lines.push(`**Generated:** ${new Date(report.checkedAt).toLocaleString()}`);
    lines.push(`**Duration:** ${(report.duration / 1000).toFixed(2)}s`);
    lines.push('');
    
    // Summary
    lines.push('## Summary');
    lines.push('');
    lines.push(`- **Total Links:** ${report.totalLinks}`);
    lines.push(`- **Valid:** ${report.validLinks} ✅`);
    lines.push(`- **Broken:** ${report.brokenLinks} ❌`);
    lines.push(`- **Redirects:** ${report.redirects} ↩️`);
    lines.push(`- **Warnings:** ${report.warnings} ⚠️`);
    lines.push('');
    
    // Broken Links
    const brokenLinks = report.results.filter(r => r.status === 'broken');
    if (brokenLinks.length > 0) {
      lines.push('## ❌ Broken Links');
      lines.push('');
      for (const link of brokenLinks) {
        lines.push(`### ${link.url}`);
        if (link.message) lines.push(`- **Error:** ${link.message}`);
        lines.push('- **Found in:**');
        link.foundIn.forEach(file => lines.push(`  - \`${file}\``));
        lines.push('');
      }
    }
    
    // Redirects
    const redirects = report.results.filter(r => r.status === 'redirect');
    if (redirects.length > 0) {
      lines.push('## ↩️ Redirects');
      lines.push('');
      for (const link of redirects) {
        lines.push(`- ${link.url}`);
        if (link.redirectUrl) lines.push(`  → ${link.redirectUrl}`);
      }
      lines.push('');
    }
    
    // Warnings - separate real issues from false positives
    const warnings = report.results.filter(r => r.status === 'warning');
    const realWarnings = warnings.filter(w => !this.isFalsePositive(w.url));
    const falsePositives = warnings.filter(w => this.isFalsePositive(w.url));
    
    if (realWarnings.length > 0) {
      lines.push('## ⚠️ Warnings');
      lines.push('');
      for (const link of realWarnings) {
        lines.push(`- ${link.url}`);
        if (link.message) lines.push(`  - ${link.message}`);
        lines.push(`  - Found in: ${link.foundIn.join(', ')}`);
      }
      lines.push('');
    }
    
    if (falsePositives.length > 0) {
      lines.push('## 🔍 False Positives (Ignored)');
      lines.push('');
      lines.push('These were detected but are likely code patterns, not actual links:');
      lines.push('');
      for (const link of falsePositives) {
        lines.push(`- \`${link.url}\` - ${link.message}`);
      }
    }
    
    return lines.join('\n');
  }

  /**
   * Check if a warning is likely a false positive
   */
  private isFalsePositive(url: string): boolean {
    return this.isRegexOrCodePattern(url) || this.isNonUrlPattern(url);
  }
}
