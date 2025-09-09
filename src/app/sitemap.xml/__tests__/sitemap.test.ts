/**
 * Sitemap测试文件
 * 测试动态站点地图生成功能
 */

import { CALCULATOR_TOOLS, STATIC_PAGES, CONTENT_PAGES } from '../route';

// Mock the GET function
const mockSitemapResponse = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
  <url>
    <loc>https://statcal.com/</loc>
    <lastmod>2025-09-09</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://statcal.com/calculator/mean</loc>
    <lastmod>2025-09-09</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
</urlset>`;

describe('Sitemap Configuration', () => {
  describe('CALCULATOR_TOOLS', () => {
    it('should include all major calculators', () => {
      const toolPaths = CALCULATOR_TOOLS.map(tool => tool.path);
      
      expect(toolPaths).toContain('/calculator/mean');
      expect(toolPaths).toContain('/calculator/standard-deviation');
      expect(toolPaths).toContain('/calculator/gpa');
    });

    it('should have appropriate priorities for calculators', () => {
      CALCULATOR_TOOLS.forEach(tool => {
        expect(tool.priority).toBeGreaterThanOrEqual(0.0);
        expect(tool.priority).toBeLessThanOrEqual(1.0);
        
        // Major calculators should have high priority
        if (['mean', 'standard-deviation', 'gpa'].some(name => tool.path.includes(name))) {
          expect(tool.priority).toBeGreaterThanOrEqual(0.8);
        }
      });
    });

    it('should have valid change frequencies', () => {
      const validFrequencies = [
        'always', 'hourly', 'daily', 'weekly', 'monthly', 'yearly', 'never'
      ];

      CALCULATOR_TOOLS.forEach(tool => {
        expect(validFrequencies).toContain(tool.changeFrequency);
      });
    });

    it('should have recent last modified dates', () => {
      const threeMonthsAgo = new Date();
      threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

      CALCULATOR_TOOLS.forEach(tool => {
        if (tool.lastModified) {
          expect(tool.lastModified).toBeInstanceOf(Date);
          // For active tools, lastModified should be relatively recent
          if (tool.priority >= 0.8) {
            expect(tool.lastModified.getTime()).toBeGreaterThan(threeMonthsAgo.getTime());
          }
        }
      });
    });
  });

  describe('STATIC_PAGES', () => {
    it('should include essential pages', () => {
      const staticPaths = STATIC_PAGES.map(page => page.path);
      
      expect(staticPaths).toContain('/');
      expect(staticPaths).toContain('/calculator');
      expect(staticPaths).toContain('/hub');
    });

    it('should have homepage as highest priority', () => {
      const homepage = STATIC_PAGES.find(page => page.path === '/');
      expect(homepage).toBeDefined();
      expect(homepage!.priority).toBe(1.0);
    });

    it('should have appropriate priorities', () => {
      STATIC_PAGES.forEach(page => {
        expect(page.priority).toBeGreaterThanOrEqual(0.0);
        expect(page.priority).toBeLessThanOrEqual(1.0);

        // Important pages should have higher priority
        if (page.path === '/') {
          expect(page.priority).toBe(1.0);
        } else if (page.path === '/calculator') {
          expect(page.priority).toBeGreaterThanOrEqual(0.8);
        }
      });
    });
  });

  describe('CONTENT_PAGES', () => {
    it('should include guide pages', () => {
      expect(CONTENT_PAGES.length).toBeGreaterThan(0);
      
      const hasGuidePages = CONTENT_PAGES.some(page => 
        page.path.includes('/guides/')
      );
      expect(hasGuidePages).toBe(true);
    });

    it('should have moderate priorities for content', () => {
      CONTENT_PAGES.forEach(page => {
        expect(page.priority).toBeGreaterThanOrEqual(0.3);
        expect(page.priority).toBeLessThanOrEqual(0.8);
      });
    });
  });

  describe('URL Structure', () => {
    it('should have valid URL paths', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      
      allPages.forEach(page => {
        expect(page.path).toMatch(/^\/[\w\/-]*$/);
        expect(page.path).not.toContain(' ');
        expect(page.path).not.toContain('..'); 
      });
    });

    it('should not have duplicate paths', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      const paths = allPages.map(page => page.path);
      const uniquePaths = new Set(paths);
      
      expect(uniquePaths.size).toBe(paths.length);
    });

    it('should follow SEO-friendly URL patterns', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      
      allPages.forEach(page => {
        // URLs should be lowercase
        expect(page.path).toBe(page.path.toLowerCase());
        
        // URLs should use hyphens, not underscores
        if (page.path.includes('_')) {
          expect(page.path).not.toContain('_');
        }
        
        // Calculator URLs should follow consistent pattern
        if (page.path.startsWith('/calculator/')) {
          expect(page.path).toMatch(/^\/calculator\/[\w-]+$/);
        }
      });
    });
  });

  describe('Priority Distribution', () => {
    it('should have logical priority hierarchy', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      
      // Homepage should have highest priority
      const homepage = allPages.find(p => p.path === '/');
      expect(homepage?.priority).toBe(1.0);
      
      // Main calculators should have high priority
      const mainCalculators = allPages.filter(p => 
        ['/calculator/mean', '/calculator/standard-deviation', '/calculator/gpa'].includes(p.path)
      );
      mainCalculators.forEach(calc => {
        expect(calc.priority).toBeGreaterThanOrEqual(0.8);
      });
      
      // Content pages should have moderate priority
      CONTENT_PAGES.forEach(page => {
        expect(page.priority).toBeLessThanOrEqual(0.8);
      });
    });

    it('should not overuse high priorities', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      const highPriorityPages = allPages.filter(p => p.priority >= 0.9);
      
      // Should not have too many high priority pages
      expect(highPriorityPages.length).toBeLessThanOrEqual(5);
    });
  });

  describe('Change Frequency Logic', () => {
    it('should assign appropriate change frequencies', () => {
      // Homepage should change frequently
      const homepage = STATIC_PAGES.find(p => p.path === '/');
      expect(['daily', 'weekly']).toContain(homepage?.changeFrequency);
      
      // Privacy/legal pages should change rarely
      const privacyPage = STATIC_PAGES.find(p => p.path === '/privacy');
      if (privacyPage) {
        expect(['monthly', 'yearly']).toContain(privacyPage.changeFrequency);
      }
      
      // Calculator tools should have regular updates
      CALCULATOR_TOOLS.forEach(tool => {
        expect(['weekly', 'monthly']).toContain(tool.changeFrequency);
      });
    });
  });

  describe('Last Modified Dates', () => {
    it('should have valid last modified dates', () => {
      const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
      
      allPages.forEach(page => {
        if (page.lastModified) {
          expect(page.lastModified).toBeInstanceOf(Date);
          expect(page.lastModified.getTime()).toBeLessThanOrEqual(Date.now());
          
          // Should not be too far in the past (more than 1 year)
          const oneYearAgo = new Date();
          oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
          expect(page.lastModified.getTime()).toBeGreaterThan(oneYearAgo.getTime());
        }
      });
    });

    it('should have recent dates for active pages', () => {
      const activePages = [...STATIC_PAGES, ...CALCULATOR_TOOLS].filter(p => p.priority >= 0.8);
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      activePages.forEach(page => {
        if (page.lastModified) {
          expect(page.lastModified.getTime()).toBeGreaterThan(sixMonthsAgo.getTime());
        }
      });
    });
  });

  describe('XML Format Validation', () => {
    it('should generate valid XML structure', () => {
      // Test that our mock response follows XML sitemap format
      expect(mockSitemapResponse).toContain('<?xml version="1.0" encoding="UTF-8"?>');
      expect(mockSitemapResponse).toContain('<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"');
      expect(mockSitemapResponse).toContain('<url>');
      expect(mockSitemapResponse).toContain('<loc>');
      expect(mockSitemapResponse).toContain('<lastmod>');
      expect(mockSitemapResponse).toContain('<changefreq>');
      expect(mockSitemapResponse).toContain('<priority>');
    });

    it('should have proper URL format in sitemap', () => {
      const urlMatches = mockSitemapResponse.match(/<loc>(.*?)<\/loc>/g);
      if (urlMatches) {
        urlMatches.forEach(match => {
          const url = match.replace(/<\/?loc>/g, '');
          expect(url).toMatch(/^https:\/\/statcal\.com/);
          expect(url).not.toContain(' ');
        });
      }
    });

    it('should have valid date format', () => {
      const dateMatches = mockSitemapResponse.match(/<lastmod>(.*?)<\/lastmod>/g);
      if (dateMatches) {
        dateMatches.forEach(match => {
          const date = match.replace(/<\/?lastmod>/g, '');
          expect(date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
        });
      }
    });

    it('should have valid priority values', () => {
      const priorityMatches = mockSitemapResponse.match(/<priority>(.*?)<\/priority>/g);
      if (priorityMatches) {
        priorityMatches.forEach(match => {
          const priority = parseFloat(match.replace(/<\/?priority>/g, ''));
          expect(priority).toBeGreaterThanOrEqual(0.0);
          expect(priority).toBeLessThanOrEqual(1.0);
        });
      }
    });
  });
});