/**
 * 智能内部链接系统测试文件
 * 测试链接生成、相关性评分和SEO优化功能
 */

import {
  InternalLinkGenerator,
  SITE_PAGES,
  PageType,
  getPageInternalLinks,
  validateInternalLinks,
  internalLinkGenerator
} from '../internalLinks';

describe('InternalLinkGenerator', () => {
  let linkGenerator: InternalLinkGenerator;

  beforeEach(() => {
    linkGenerator = new InternalLinkGenerator(SITE_PAGES);
  });

  describe('generateLinksForPage', () => {
    it('should generate relevant links for mean calculator page', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      expect(links).toBeDefined();
      expect(links.length).toBeGreaterThan(0);
      expect(links.length).toBeLessThanOrEqual(5);
      
      // 应该包含相关的统计计算器
      const hasStatisticalTools = links.some(link => 
        link.url.includes('standard-deviation') || 
        link.url.includes('weighted-mean')
      );
      expect(hasStatisticalTools).toBe(true);
    });

    it('should return empty array for unknown page', () => {
      const links = linkGenerator.generateLinksForPage('/unknown-page', 5);
      expect(links).toEqual([]);
    });

    it('should not include current page in results', () => {
      const currentUrl = '/calculator/mean';
      const links = linkGenerator.generateLinksForPage(currentUrl, 5);
      
      const includesSelf = links.some(link => link.url === currentUrl);
      expect(includesSelf).toBe(false);
    });

    it('should respect maxLinks parameter', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 3);
      expect(links.length).toBeLessThanOrEqual(3);
    });

    it('should sort links by relevance score', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      for (let i = 1; i < links.length; i++) {
        expect(links[i-1].relevanceScore).toBeGreaterThanOrEqual(links[i].relevanceScore);
      }
    });
  });

  describe('relevance calculation', () => {
    it('should give high relevance to same category calculators', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      // Standard deviation应该有高相关性，因为同属descriptive-statistics分类
      const stdDevLink = links.find(link => link.url.includes('standard-deviation'));
      expect(stdDevLink).toBeDefined();
      expect(stdDevLink!.relevanceScore).toBeGreaterThan(0.6);
    });

    it('should assign appropriate priority levels', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      links.forEach(link => {
        expect(['high', 'medium', 'low']).toContain(link.priority);
        
        // 高相关性应该对应高优先级
        if (link.relevanceScore > 0.7) {
          expect(link.priority).toBe('high');
        }
      });
    });

    it('should filter out low relevance links', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 10);
      
      // 所有链接的相关性评分都应该 > 0.3
      links.forEach(link => {
        expect(link.relevanceScore).toBeGreaterThan(0.3);
      });
    });
  });

  describe('anchor text generation', () => {
    it('should generate diverse anchor texts', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      const anchorTexts = links.map(link => link.anchorText);
      const uniqueAnchors = new Set(anchorTexts);
      
      // 锚文本应该多样化
      expect(uniqueAnchors.size).toBe(anchorTexts.length);
    });

    it('should create SEO-friendly anchor texts', () => {
      const links = linkGenerator.generateLinksForPage('/calculator/mean', 5);
      
      links.forEach(link => {
        // 锚文本不应该为空
        expect(link.anchorText.trim().length).toBeGreaterThan(0);
        
        // 锚文本不应该过长
        expect(link.anchorText.length).toBeLessThan(100);
        
        // 不应该包含无意义的字符
        expect(link.anchorText).not.toMatch(/[<>{}]/);
      });
    });
  });

  describe('getRelatedByCategory', () => {
    it('should return same category tools', () => {
      const relatedLinks = linkGenerator.getRelatedByCategory('descriptive-statistics');
      
      expect(relatedLinks.length).toBeGreaterThan(0);
      
      // 所有链接都应该是相同分类
      relatedLinks.forEach(link => {
        const page = SITE_PAGES[link.url];
        expect(page.category).toBe('descriptive-statistics');
      });
    });

    it('should exclude specified URL', () => {
      const excludeUrl = '/calculator/mean';
      const relatedLinks = linkGenerator.getRelatedByCategory('descriptive-statistics', excludeUrl);
      
      const includesExcluded = relatedLinks.some(link => link.url === excludeUrl);
      expect(includesExcluded).toBe(false);
    });

    it('should assign high relevance to same category', () => {
      const relatedLinks = linkGenerator.getRelatedByCategory('descriptive-statistics');
      
      relatedLinks.forEach(link => {
        expect(link.relevanceScore).toBe(0.8);
        expect(link.priority).toBe('high');
      });
    });
  });

  describe('getBreadcrumbLinks', () => {
    it('should always include homepage', () => {
      const breadcrumbs = linkGenerator.getBreadcrumbLinks('/calculator/mean');
      
      const homeBreadcrumb = breadcrumbs.find(b => b.url === '/');
      expect(homeBreadcrumb).toBeDefined();
      expect(homeBreadcrumb!.anchorText).toBe('Home');
    });

    it('should include calculator hub for calculator pages', () => {
      const breadcrumbs = linkGenerator.getBreadcrumbLinks('/calculator/mean');
      
      const hubBreadcrumb = breadcrumbs.find(b => b.url === '/calculator');
      expect(hubBreadcrumb).toBeDefined();
      expect(hubBreadcrumb!.anchorText).toBe('Calculators');
    });

    it('should include hub for guide pages', () => {
      const breadcrumbs = linkGenerator.getBreadcrumbLinks('/guides/how-to-calculate-mean');
      
      const hubBreadcrumb = breadcrumbs.find(b => b.url === '/hub');
      expect(hubBreadcrumb).toBeDefined();
    });

    it('should maintain hierarchical order', () => {
      const breadcrumbs = linkGenerator.getBreadcrumbLinks('/calculator/mean');
      
      expect(breadcrumbs[0].url).toBe('/');
      if (breadcrumbs.length > 1) {
        expect(breadcrumbs[1].url).toBe('/calculator');
      }
    });
  });
});

describe('Utility Functions', () => {
  describe('getPageInternalLinks', () => {
    it('should return all types of links for calculator page', () => {
      const result = getPageInternalLinks('/calculator/mean');
      
      expect(result.relatedLinks).toBeDefined();
      expect(result.breadcrumbLinks).toBeDefined();
      expect(result.categoryLinks).toBeDefined();
      
      expect(result.relatedLinks.length).toBeGreaterThan(0);
      expect(result.breadcrumbLinks.length).toBeGreaterThan(0);
      expect(result.categoryLinks.length).toBeGreaterThan(0);
    });

    it('should return empty category links for pages without category', () => {
      const result = getPageInternalLinks('/');
      
      expect(result.relatedLinks).toBeDefined();
      expect(result.breadcrumbLinks).toBeDefined();
      expect(result.categoryLinks).toEqual([]);
    });

    it('should handle unknown pages gracefully', () => {
      const result = getPageInternalLinks('/unknown');
      
      expect(result.relatedLinks).toEqual([]);
      expect(result.breadcrumbLinks.length).toBeGreaterThan(0); // 至少有首页
      expect(result.categoryLinks).toEqual([]);
    });
  });

  describe('validateInternalLinks', () => {
    it('should validate good quality links', () => {
      const goodLinks = [
        {
          url: '/calculator/mean',
          title: 'Mean Calculator',
          anchorText: 'Mean Calculator',
          relevanceScore: 0.8,
          priority: 'high' as const,
          context: 'Related tool',
          pageType: PageType.CALCULATOR,
          keywords: ['mean', 'calculator']
        },
        {
          url: '/calculator/standard-deviation',
          title: 'Standard Deviation Calculator',
          anchorText: 'Standard Deviation Calculator',
          relevanceScore: 0.7,
          priority: 'high' as const,
          context: 'Related tool',
          pageType: PageType.CALCULATOR,
          keywords: ['standard deviation', 'calculator']
        }
      ];

      const validation = validateInternalLinks(goodLinks);
      
      expect(validation.isValid).toBe(true);
      expect(validation.warnings).toHaveLength(0);
    });

    it('should warn about too many links', () => {
      const tooManyLinks = Array(10).fill({
        url: '/test',
        title: 'Test',
        anchorText: 'Test',
        relevanceScore: 0.5,
        priority: 'medium' as const,
        context: 'Test',
        pageType: PageType.CALCULATOR,
        keywords: ['test']
      });

      const validation = validateInternalLinks(tooManyLinks);
      
      expect(validation.warnings.some(w => w.includes('Too many'))).toBe(true);
    });

    it('should detect duplicate anchor texts', () => {
      const duplicateAnchors = [
        {
          url: '/calculator/mean',
          title: 'Mean Calculator',
          anchorText: 'Calculator',
          relevanceScore: 0.8,
          priority: 'high' as const,
          context: 'Test',
          pageType: PageType.CALCULATOR,
          keywords: ['mean']
        },
        {
          url: '/calculator/std-dev',
          title: 'Standard Deviation',
          anchorText: 'Calculator',
          relevanceScore: 0.7,
          priority: 'high' as const,
          context: 'Test',
          pageType: PageType.CALCULATOR,
          keywords: ['std-dev']
        }
      ];

      const validation = validateInternalLinks(duplicateAnchors);
      
      expect(validation.warnings.some(w => w.includes('Duplicate anchor'))).toBe(true);
    });

    it('should suggest more links for low count', () => {
      const fewLinks = [
        {
          url: '/calculator/mean',
          title: 'Mean Calculator',
          anchorText: 'Mean Calculator',
          relevanceScore: 0.8,
          priority: 'high' as const,
          context: 'Test',
          pageType: PageType.CALCULATOR,
          keywords: ['mean']
        }
      ];

      const validation = validateInternalLinks(fewLinks);
      
      expect(validation.suggestions.some(s => s.includes('more relevant'))).toBe(true);
    });

    it('should flag low relevance scores', () => {
      const lowRelevanceLinks = [
        {
          url: '/calculator/mean',
          title: 'Mean Calculator',
          anchorText: 'Mean Calculator',
          relevanceScore: 0.2, // 低相关性
          priority: 'low' as const,
          context: 'Test',
          pageType: PageType.CALCULATOR,
          keywords: ['mean']
        },
        {
          url: '/calculator/gpa',
          title: 'GPA Calculator',
          anchorText: 'GPA Calculator',
          relevanceScore: 0.3,
          priority: 'low' as const,
          context: 'Test',
          pageType: PageType.CALCULATOR,
          keywords: ['gpa']
        }
      ];

      const validation = validateInternalLinks(lowRelevanceLinks);
      
      expect(validation.suggestions.some(s => s.includes('low relevance'))).toBe(true);
    });
  });
});

describe('SITE_PAGES Configuration', () => {
  it('should have valid page configurations', () => {
    Object.entries(SITE_PAGES).forEach(([url, page]) => {
      // URL应该匹配键
      expect(page.url).toBe(url);
      
      // 标题不应为空
      expect(page.title.trim().length).toBeGreaterThan(0);
      
      // 描述不应为空
      expect(page.description.trim().length).toBeGreaterThan(0);
      
      // 页面类型应该有效
      expect(Object.values(PageType)).toContain(page.pageType);
      
      // 关键词不应为空
      expect(page.keywords.length).toBeGreaterThan(0);
      
      // 相关主题不应为空
      expect(page.relatedTopics.length).toBeGreaterThan(0);
    });
  });

  it('should have appropriate categorization', () => {
    const calculatorPages = Object.values(SITE_PAGES).filter(
      page => page.pageType === PageType.CALCULATOR
    );
    
    // 大部分计算器页面应该有分类
    const categorizedCalculators = calculatorPages.filter(page => page.category);
    expect(categorizedCalculators.length).toBeGreaterThan(calculatorPages.length * 0.8);
  });

  it('should have SEO-optimized titles and descriptions', () => {
    Object.values(SITE_PAGES).forEach(page => {
      // 标题长度应该适合SEO (< 60字符)
      expect(page.title.length).toBeLessThan(60);
      
      // 描述长度应该适合SEO (80-160字符，允许一定灵活性)
      expect(page.description.length).toBeGreaterThan(80);
      expect(page.description.length).toBeLessThan(160);
    });
  });

  it('should have diverse and relevant keywords', () => {
    Object.values(SITE_PAGES).forEach(page => {
      // 每个页面应该有2-5个关键词
      expect(page.keywords.length).toBeGreaterThanOrEqual(2);
      expect(page.keywords.length).toBeLessThanOrEqual(6);
      
      // 关键词不应该重复
      const uniqueKeywords = new Set(page.keywords);
      expect(uniqueKeywords.size).toBe(page.keywords.length);
      
      // 关键词应该小写
      page.keywords.forEach(keyword => {
        expect(keyword).toBe(keyword.toLowerCase());
      });
    });
  });
});

describe('Integration Tests', () => {
  it('should generate complete internal link ecosystem', () => {
    const testUrls = [
      '/',
      '/calculator/mean',
      '/calculator/standard-deviation',
      '/calculator/gpa',
      '/calculator',
      '/hub'
    ];

    testUrls.forEach(url => {
      const linkData = getPageInternalLinks(url);
      
      // 每个页面都应该有一些内部链接
      const totalLinks = linkData.relatedLinks.length + 
                        linkData.breadcrumbLinks.length + 
                        linkData.categoryLinks.length;
      
      expect(totalLinks).toBeGreaterThan(0);
      
      // 验证链接质量
      const allLinks = [...linkData.relatedLinks, ...linkData.categoryLinks];
      if (allLinks.length > 0) {
        const validation = validateInternalLinks(allLinks);
        // 至少不应该有严重错误
        expect(validation.warnings.length).toBeLessThan(3);
      }
    });
  });

  it('should create bidirectional linking between related pages', () => {
    // Mean Calculator应该链接到Standard Deviation
    const meanLinks = internalLinkGenerator.generateLinksForPage('/calculator/mean', 10);
    const hasStdDev = meanLinks.some(link => link.url.includes('standard-deviation'));
    
    // Standard Deviation应该链接到Mean Calculator
    const stdDevLinks = internalLinkGenerator.generateLinksForPage('/calculator/standard-deviation', 10);
    const hasMean = stdDevLinks.some(link => link.url.includes('mean'));
    
    expect(hasStdDev).toBe(true);
    expect(hasMean).toBe(true);
  });

  it('should maintain link consistency across similar tools', () => {
    const descriptiveStatsTools = ['/calculator/mean', '/calculator/standard-deviation', '/calculator/weighted-mean'];
    
    descriptiveStatsTools.forEach(toolUrl => {
      const links = internalLinkGenerator.generateLinksForPage(toolUrl, 5);
      
      // 每个描述性统计工具都应该链接到其他同类工具
      const hasRelatedTools = links.some(link => 
        descriptiveStatsTools.some(otherTool => 
          otherTool !== toolUrl && link.url === otherTool
        )
      );
      
      expect(hasRelatedTools).toBe(true);
    });
  });
});