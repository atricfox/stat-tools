/**
 * Performance and Accessibility Tests
 */

import { test, expect } from '@playwright/test';
import { runA11yAudit, checkPerformanceBudget, PERFORMANCE_BUDGET } from '../src/lib/performance/lighthouse';

const PAGES_TO_TEST = [
  { name: 'Homepage', url: '/' },
  { name: 'Statistics Calculators Hub', url: '/statistics-calculators' },
  { name: 'Mean Calculator', url: '/calculator/mean' },
  { name: 'GPA Calculator', url: '/calculator/gpa' },
  { name: 'Glossary', url: '/glossary' },
  { name: 'FAQ', url: '/faq' },
  { name: 'Cases', url: '/cases' },
];

test.describe('Performance Tests', () => {
  test.describe.configure({ mode: 'parallel' });
  
  for (const pageInfo of PAGES_TO_TEST) {
    test(`${pageInfo.name} meets performance budget`, async ({ page }) => {
      // Navigate to page
      await page.goto(pageInfo.url);
      
      // Wait for page to be fully loaded
      await page.waitForLoadState('networkidle');
      
      // Check that page loads without errors
      const consoleErrors: string[] = [];
      page.on('console', msg => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text());
        }
      });
      
      // Measure performance metrics
      const metrics = await page.evaluate(() => {
        const perf = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
        return {
          domContentLoaded: perf.domContentLoadedEventEnd - perf.domContentLoadedEventStart,
          loadComplete: perf.loadEventEnd - perf.loadEventStart,
          domInteractive: perf.domInteractive - perf.fetchStart,
          firstByte: perf.responseStart - perf.requestStart,
        };
      });
      
      // Check metrics against budget
      expect(metrics.domContentLoaded).toBeLessThan(3000);
      expect(metrics.loadComplete).toBeLessThan(5000);
      expect(metrics.domInteractive).toBeLessThan(2000);
      expect(consoleErrors).toHaveLength(0);
    });
    
    test(`${pageInfo.name} has good Core Web Vitals`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Measure Core Web Vitals
      const vitals = await page.evaluate(() => {
        return new Promise<any>((resolve) => {
          const vitals = {
            lcp: 0,
            fid: 0,
            cls: 0,
          };
          
          // Observe LCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1] as any;
            vitals.lcp = lastEntry.renderTime || lastEntry.loadTime;
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // Observe CLS
          let clsValue = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!(entry as any).hadRecentInput) {
                clsValue += (entry as any).value;
              }
            }
            vitals.cls = clsValue;
          }).observe({ type: 'layout-shift', buffered: true });
          
          // Resolve after a delay to collect metrics
          setTimeout(() => resolve(vitals), 3000);
        });
      });
      
      // Check against thresholds
      expect(vitals.lcp).toBeLessThan(2500); // Good LCP
      expect(vitals.cls).toBeLessThan(0.1); // Good CLS
    });
  }
});

test.describe('Accessibility Tests', () => {
  test.describe.configure({ mode: 'parallel' });
  
  for (const pageInfo of PAGES_TO_TEST) {
    test(`${pageInfo.name} has no accessibility violations`, async ({ page }) => {
      const report = await runA11yAudit(page, pageInfo.url);
      
      // Check for violations
      const criticalViolations = report.violations.filter(v => v.impact === 'critical');
      const seriousViolations = report.violations.filter(v => v.impact === 'serious');
      
      // No critical violations allowed
      expect(criticalViolations).toHaveLength(0);
      
      // Limited serious violations
      expect(seriousViolations.length).toBeLessThanOrEqual(2);
      
      // Log violations for debugging
      if (report.violations.length > 0) {
        console.log(`Accessibility violations for ${pageInfo.name}:`);
        report.violations.forEach(v => {
          console.log(`- ${v.id}: ${v.help} (${v.impact})`);
        });
      }
    });
    
    test(`${pageInfo.name} has proper heading structure`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Check heading hierarchy
      const headings = await page.evaluate(() => {
        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4, h5, h6'));
        return headings.map(h => ({
          level: parseInt(h.tagName[1]),
          text: h.textContent?.trim() || '',
        }));
      });
      
      // Should have exactly one h1
      const h1Count = headings.filter(h => h.level === 1).length;
      expect(h1Count).toBe(1);
      
      // Headings should not skip levels
      let previousLevel = 0;
      for (const heading of headings) {
        if (previousLevel > 0) {
          expect(heading.level).toBeLessThanOrEqual(previousLevel + 1);
        }
        previousLevel = heading.level;
      }
    });
    
    test(`${pageInfo.name} has proper keyboard navigation`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Check that all interactive elements are keyboard accessible
      const nonAccessible = await page.evaluate(() => {
        const interactive = Array.from(document.querySelectorAll(
          'a, button, input, select, textarea, [role="button"], [role="link"]'
        ));
        
        return interactive.filter(el => {
          const tabindex = el.getAttribute('tabindex');
          return tabindex === '-1';
        }).length;
      });
      
      expect(nonAccessible).toBe(0);
      
      // Test tab navigation
      await page.keyboard.press('Tab');
      const firstFocused = await page.evaluate(() => document.activeElement?.tagName);
      expect(firstFocused).toBeTruthy();
      
      // Ensure skip links are present
      const skipLink = await page.$('[href="#main"], [href="#content"]');
      expect(skipLink).toBeTruthy();
    });
    
    test(`${pageInfo.name} has proper ARIA labels`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Check form inputs have labels
      const unlabeledInputs = await page.evaluate(() => {
        const inputs = Array.from(document.querySelectorAll('input, select, textarea'));
        return inputs.filter(input => {
          const id = input.id;
          const ariaLabel = input.getAttribute('aria-label');
          const ariaLabelledby = input.getAttribute('aria-labelledby');
          const label = id ? document.querySelector(`label[for="${id}"]`) : null;
          
          return !ariaLabel && !ariaLabelledby && !label;
        }).length;
      });
      
      expect(unlabeledInputs).toBe(0);
      
      // Check images have alt text
      const imagesWithoutAlt = await page.evaluate(() => {
        const images = Array.from(document.querySelectorAll('img'));
        return images.filter(img => !img.alt && !img.getAttribute('aria-label')).length;
      });
      
      expect(imagesWithoutAlt).toBe(0);
    });
  }
});

test.describe('SEO Tests', () => {
  for (const pageInfo of PAGES_TO_TEST) {
    test(`${pageInfo.name} has proper meta tags`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Check title
      const title = await page.title();
      expect(title).toBeTruthy();
      expect(title.length).toBeGreaterThan(10);
      expect(title.length).toBeLessThan(60);
      
      // Check meta description
      const metaDescription = await page.$eval(
        'meta[name="description"]',
        el => el.getAttribute('content')
      ).catch(() => null);
      
      expect(metaDescription).toBeTruthy();
      expect(metaDescription!.length).toBeGreaterThan(50);
      expect(metaDescription!.length).toBeLessThan(160);
      
      // Check Open Graph tags
      const ogTitle = await page.$eval(
        'meta[property="og:title"]',
        el => el.getAttribute('content')
      ).catch(() => null);
      
      expect(ogTitle).toBeTruthy();
      
      // Check canonical URL
      const canonical = await page.$eval(
        'link[rel="canonical"]',
        el => el.getAttribute('href')
      ).catch(() => null);
      
      expect(canonical).toBeTruthy();
    });
    
    test(`${pageInfo.name} has structured data`, async ({ page }) => {
      await page.goto(pageInfo.url);
      
      // Check for JSON-LD structured data
      const structuredData = await page.evaluate(() => {
        const scripts = Array.from(document.querySelectorAll('script[type="application/ld+json"]'));
        return scripts.map(script => {
          try {
            return JSON.parse(script.textContent || '{}');
          } catch {
            return null;
          }
        }).filter(Boolean);
      });
      
      expect(structuredData.length).toBeGreaterThan(0);
      
      // Validate basic structure
      for (const data of structuredData) {
        expect(data['@context']).toBeTruthy();
        expect(data['@type']).toBeTruthy();
      }
    });
  }
});

test.describe('Mobile Responsiveness', () => {
  const devices = [
    { name: 'iPhone 12', viewport: { width: 390, height: 844 } },
    { name: 'iPad', viewport: { width: 768, height: 1024 } },
    { name: 'Desktop', viewport: { width: 1920, height: 1080 } },
  ];
  
  for (const device of devices) {
    test(`Homepage renders correctly on ${device.name}`, async ({ page }) => {
      await page.setViewportSize(device.viewport);
      await page.goto('/');
      
      // Check no horizontal scroll
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBe(false);
      
      // Check text is readable
      const smallText = await page.evaluate(() => {
        const elements = Array.from(document.querySelectorAll('*'));
        return elements.filter(el => {
          const styles = window.getComputedStyle(el);
          const fontSize = parseFloat(styles.fontSize);
          return fontSize > 0 && fontSize < 12; // Less than 12px
        }).length;
      });
      
      expect(smallText).toBe(0);
      
      // Check touch targets are large enough for mobile
      if (device.viewport.width < 768) {
        const smallTargets = await page.evaluate(() => {
          const targets = Array.from(document.querySelectorAll('a, button, input, select'));
          return targets.filter(el => {
            const rect = el.getBoundingClientRect();
            return rect.width < 44 || rect.height < 44; // iOS recommended minimum
          }).length;
        });
        
        expect(smallTargets).toBe(0);
      }
    });
  }
});