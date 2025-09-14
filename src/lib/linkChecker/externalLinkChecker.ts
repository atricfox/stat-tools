/**
 * External Link Checker - Validates external URLs with actual HTTP requests
 */

import https from 'node:https';
import http from 'node:http';
import { URL } from 'node:url';

export interface ExternalLinkCheckOptions {
  timeout?: number;
  maxRedirects?: number;
  userAgent?: string;
  concurrent?: number;
  retryAttempts?: number;
  retryDelay?: number;
}

export interface ExternalLinkResult {
  url: string;
  statusCode: number;
  status: 'valid' | 'broken' | 'redirect' | 'timeout' | 'error';
  redirectUrl?: string;
  redirectChain?: string[];
  responseTime?: number;
  error?: string;
  headers?: Record<string, string>;
}

export class ExternalLinkChecker {
  private options: Required<ExternalLinkCheckOptions>;
  
  constructor(options: ExternalLinkCheckOptions = {}) {
    this.options = {
      timeout: options.timeout ?? 10000,
      maxRedirects: options.maxRedirects ?? 5,
      userAgent: options.userAgent ?? 'Mozilla/5.0 (compatible; LinkChecker/1.0)',
      concurrent: options.concurrent ?? 5,
      retryAttempts: options.retryAttempts ?? 2,
      retryDelay: options.retryDelay ?? 1000,
    };
  }
  
  /**
   * Check a single external URL
   */
  async checkUrl(url: string): Promise<ExternalLinkResult> {
    const startTime = Date.now();
    
    for (let attempt = 0; attempt <= this.options.retryAttempts; attempt++) {
      if (attempt > 0) {
        // Wait before retry
        await new Promise(resolve => setTimeout(resolve, this.options.retryDelay));
      }
      
      try {
        const result = await this.checkUrlWithRedirects(url);
        result.responseTime = Date.now() - startTime;
        return result;
      } catch (error) {
        if (attempt === this.options.retryAttempts) {
          // Last attempt failed
          return {
            url,
            statusCode: 0,
            status: 'error',
            error: error instanceof Error ? error.message : 'Unknown error',
            responseTime: Date.now() - startTime,
          };
        }
        // Continue to next attempt
      }
    }
    
    // Should never reach here
    return {
      url,
      statusCode: 0,
      status: 'error',
      error: 'Max retries exceeded',
    };
  }
  
  /**
   * Check URL with redirect following
   */
  private async checkUrlWithRedirects(
    url: string,
    redirectCount = 0,
    redirectChain: string[] = []
  ): Promise<ExternalLinkResult> {
    if (redirectCount > this.options.maxRedirects) {
      return {
        url,
        statusCode: 0,
        status: 'error',
        error: 'Too many redirects',
        redirectChain,
      };
    }
    
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const requestOptions = {
          method: 'HEAD', // Use HEAD to avoid downloading content
          timeout: this.options.timeout,
          headers: {
            'User-Agent': this.options.userAgent,
            'Accept': '*/*',
          },
        };
        
        const req = protocol.request(parsedUrl, requestOptions, (res) => {
          const statusCode = res.statusCode || 0;
          
          // Handle redirects
          if (statusCode >= 300 && statusCode < 400 && res.headers.location) {
            const redirectUrl = new URL(res.headers.location, url).href;
            redirectChain.push(redirectUrl);
            
            // Follow redirect
            this.checkUrlWithRedirects(redirectUrl, redirectCount + 1, redirectChain)
              .then(resolve)
              .catch(error => resolve({
                url,
                statusCode,
                status: 'error',
                error: error.message,
                redirectChain,
              }));
            return;
          }
          
          // Determine status
          let status: ExternalLinkResult['status'];
          if (statusCode >= 200 && statusCode < 300) {
            status = 'valid';
          } else if (statusCode >= 300 && statusCode < 400) {
            status = 'redirect';
          } else if (statusCode === 0) {
            status = 'timeout';
          } else {
            status = 'broken';
          }
          
          resolve({
            url,
            statusCode,
            status,
            redirectChain: redirectChain.length > 0 ? redirectChain : undefined,
            headers: res.headers as Record<string, string>,
          });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({
            url,
            statusCode: 0,
            status: 'timeout',
            error: `Request timeout after ${this.options.timeout}ms`,
          });
        });
        
        req.on('error', (error) => {
          resolve({
            url,
            statusCode: 0,
            status: 'error',
            error: error.message,
          });
        });
        
        req.end();
      } catch (error) {
        resolve({
          url,
          statusCode: 0,
          status: 'error',
          error: error instanceof Error ? error.message : 'Invalid URL',
        });
      }
    });
  }
  
  /**
   * Check multiple URLs concurrently
   */
  async checkUrls(urls: string[]): Promise<Map<string, ExternalLinkResult>> {
    const results = new Map<string, ExternalLinkResult>();
    const queue = [...urls];
    const inProgress = new Set<Promise<void>>();
    
    while (queue.length > 0 || inProgress.size > 0) {
      // Start new checks up to concurrent limit
      while (inProgress.size < this.options.concurrent && queue.length > 0) {
        const url = queue.shift()!;
        const promise = this.checkUrl(url).then(result => {
          results.set(url, result);
          inProgress.delete(promise);
        });
        inProgress.add(promise);
      }
      
      // Wait for at least one to complete
      if (inProgress.size > 0) {
        await Promise.race(inProgress);
      }
    }
    
    return results;
  }
  
  /**
   * Validate a sitemap.xml file
   */
  async validateSitemap(sitemapUrl: string): Promise<{
    valid: boolean;
    urls: string[];
    errors: string[];
  }> {
    try {
      const response = await this.fetchUrl(sitemapUrl);
      
      if (!response.success) {
        return {
          valid: false,
          urls: [],
          errors: [`Failed to fetch sitemap: ${response.error}`],
        };
      }
      
      // Parse sitemap XML
      const urlMatches = response.content.matchAll(/<loc>([^<]+)<\/loc>/g);
      const urls = Array.from(urlMatches, m => m[1]);
      
      // Check if it's a sitemap index
      const sitemapMatches = response.content.matchAll(/<sitemap>[\s\S]*?<loc>([^<]+)<\/loc>[\s\S]*?<\/sitemap>/g);
      const sitemapUrls = Array.from(sitemapMatches, m => m[1]);
      
      if (sitemapUrls.length > 0) {
        // It's a sitemap index, fetch all referenced sitemaps
        const allUrls: string[] = [];
        const errors: string[] = [];
        
        for (const subsitemapUrl of sitemapUrls) {
          const result = await this.validateSitemap(subsitemapUrl);
          allUrls.push(...result.urls);
          errors.push(...result.errors);
        }
        
        return {
          valid: errors.length === 0,
          urls: allUrls,
          errors,
        };
      }
      
      return {
        valid: true,
        urls,
        errors: [],
      };
    } catch (error) {
      return {
        valid: false,
        urls: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }
  
  /**
   * Fetch URL content
   */
  private async fetchUrl(url: string): Promise<{
    success: boolean;
    content: string;
    error?: string;
  }> {
    return new Promise((resolve) => {
      try {
        const parsedUrl = new URL(url);
        const protocol = parsedUrl.protocol === 'https:' ? https : http;
        
        const req = protocol.get(url, {
          timeout: this.options.timeout,
          headers: {
            'User-Agent': this.options.userAgent,
          },
        }, (res) => {
          let data = '';
          
          res.on('data', chunk => {
            data += chunk;
          });
          
          res.on('end', () => {
            if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300) {
              resolve({ success: true, content: data });
            } else {
              resolve({
                success: false,
                content: '',
                error: `HTTP ${res.statusCode}`,
              });
            }
          });
        });
        
        req.on('timeout', () => {
          req.destroy();
          resolve({
            success: false,
            content: '',
            error: 'Timeout',
          });
        });
        
        req.on('error', (error) => {
          resolve({
            success: false,
            content: '',
            error: error.message,
          });
        });
      } catch (error) {
        resolve({
          success: false,
          content: '',
          error: error instanceof Error ? error.message : 'Invalid URL',
        });
      }
    });
  }
  
  /**
   * Check robots.txt compliance
   */
  async checkRobotsTxt(domain: string, userAgent = '*'): Promise<{
    allowed: string[];
    disallowed: string[];
    crawlDelay?: number;
    sitemap?: string[];
  }> {
    const robotsUrl = `${domain}/robots.txt`;
    const response = await this.fetchUrl(robotsUrl);
    
    if (!response.success) {
      // No robots.txt means everything is allowed
      return { allowed: ['*'], disallowed: [] };
    }
    
    const lines = response.content.split('\n');
    let currentAgent = '';
    const rules = {
      allowed: [] as string[],
      disallowed: [] as string[],
      crawlDelay: undefined as number | undefined,
      sitemap: [] as string[],
    };
    
    for (const line of lines) {
      const trimmedLine = line.trim();
      
      if (trimmedLine.startsWith('#') || !trimmedLine) {
        continue;
      }
      
      const [directive, ...valueParts] = trimmedLine.split(':');
      const value = valueParts.join(':').trim();
      
      switch (directive.toLowerCase()) {
        case 'user-agent':
          currentAgent = value;
          break;
        case 'allow':
          if (currentAgent === '*' || currentAgent.toLowerCase() === userAgent.toLowerCase()) {
            rules.allowed.push(value);
          }
          break;
        case 'disallow':
          if (currentAgent === '*' || currentAgent.toLowerCase() === userAgent.toLowerCase()) {
            rules.disallowed.push(value);
          }
          break;
        case 'crawl-delay':
          if (currentAgent === '*' || currentAgent.toLowerCase() === userAgent.toLowerCase()) {
            rules.crawlDelay = parseInt(value, 10);
          }
          break;
        case 'sitemap':
          rules.sitemap.push(value);
          break;
      }
    }
    
    return rules;
  }
}