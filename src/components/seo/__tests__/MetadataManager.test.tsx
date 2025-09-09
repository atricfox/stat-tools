/**
 * MetadataManager测试文件
 * 测试SEO元数据生成、验证和优化功能
 */

import { MetadataManager, TOOL_SEO_CONFIGS, DEFAULT_SEO_CONFIG } from '../MetadataManager';

describe('MetadataManager', () => {
  let manager: MetadataManager;

  beforeEach(() => {
    manager = MetadataManager.getInstance();
  });

  describe('getInstance', () => {
    it('should return a singleton instance', () => {
      const instance1 = MetadataManager.getInstance();
      const instance2 = MetadataManager.getInstance();
      expect(instance1).toBe(instance2);
    });
  });

  describe('generateMetadata', () => {
    it('should generate default metadata when no tool specified', () => {
      const metadata = manager.generateMetadata();
      
      expect(metadata.title).toBe(DEFAULT_SEO_CONFIG.title);
      expect(metadata.description).toBe(DEFAULT_SEO_CONFIG.description);
      expect(metadata.keywords).toBe(DEFAULT_SEO_CONFIG.keywords.join(', '));
    });

    it('should generate tool-specific metadata', () => {
      const metadata = manager.generateMetadata('mean');
      
      expect(metadata.title).toBe(TOOL_SEO_CONFIGS.mean.title);
      expect(metadata.description).toBe(TOOL_SEO_CONFIGS.mean.description);
      expect(metadata.openGraph?.title).toBe(TOOL_SEO_CONFIGS.mean.openGraph?.title);
    });

    it('should merge custom configuration', () => {
      const customTitle = 'Custom Mean Calculator Title';
      const metadata = manager.generateMetadata('mean', {
        title: customTitle,
        keywords: ['custom', 'keyword']
      });
      
      expect(metadata.title).toBe(customTitle);
      expect(metadata.keywords).toContain('custom');
    });

    it('should include Open Graph metadata', () => {
      const metadata = manager.generateMetadata('standard-deviation');
      
      expect(metadata.openGraph).toBeDefined();
      expect(metadata.openGraph?.type).toBe('website');
      expect(metadata.openGraph?.siteName).toBe('StatCal');
      expect(metadata.openGraph?.images).toBeDefined();
    });

    it('should include Twitter Card metadata', () => {
      const metadata = manager.generateMetadata('gpa');
      
      expect(metadata.twitter).toBeDefined();
      expect(metadata.twitter?.card).toBe('summary_large_image');
      expect(metadata.twitter?.site).toBe('@StatCal');
    });

    it('should set correct robots configuration', () => {
      const metadata = manager.generateMetadata();
      
      expect(metadata.robots).toBeDefined();
      expect(metadata.robots?.index).toBe(true);
      expect(metadata.robots?.follow).toBe(true);
    });
  });

  describe('generateOptimizedTitle', () => {
    it('should generate optimized title for known tools', () => {
      const title = manager.generateOptimizedTitle('Mean');
      expect(title).toContain('Mean Calculator');
      expect(title).toContain('StatCal');
      expect(title.length).toBeLessThanOrEqual(60);
    });

    it('should handle unknown tools gracefully', () => {
      const title = manager.generateOptimizedTitle('Unknown Tool');
      expect(title).toContain('Unknown Tool Calculator');
      expect(title).toContain('StatCal');
    });

    it('should respect maximum title length', () => {
      const longToolName = 'Very Long Tool Name That Could Exceed Recommended Length';
      const title = manager.generateOptimizedTitle(longToolName);
      expect(title.length).toBeLessThanOrEqual(60);
    });
  });

  describe('generateOptimizedDescription', () => {
    it('should generate description for known tools', () => {
      const description = manager.generateOptimizedDescription('Standard Deviation');
      expect(description).toContain('standard deviation');
      expect(description.length).toBeLessThanOrEqual(160);
      expect(description).toContain('students, researchers');
    });

    it('should include features when provided', () => {
      const features = ['step-by-step', 'visualization', 'export'];
      const description = manager.generateOptimizedDescription('Mean', features);
      
      expect(description).toContain('Features:');
      expect(description).toContain('step-by-step');
      expect(description.length).toBeLessThanOrEqual(160);
    });

    it('should handle feature overflow gracefully', () => {
      const manyFeatures = [
        'feature1', 'feature2', 'feature3', 'feature4', 
        'feature5', 'feature6', 'feature7', 'feature8'
      ];
      const description = manager.generateOptimizedDescription('Test', manyFeatures);
      expect(description.length).toBeLessThanOrEqual(160);
    });
  });

  describe('generateKeywords', () => {
    it('should generate base keywords for any tool', () => {
      const keywords = manager.generateKeywords('TestTool');
      
      expect(keywords).toContain('testtool calculator');
      expect(keywords).toContain('online calculator');
      expect(keywords).toContain('statistics calculator');
    });

    it('should include tool-specific keywords', () => {
      const keywords = manager.generateKeywords('Mean');
      
      expect(keywords).toContain('average calculator');
      expect(keywords).toContain('arithmetic mean');
    });

    it('should merge additional keywords', () => {
      const additionalKeywords = ['custom1', 'custom2'];
      const keywords = manager.generateKeywords('GPA', additionalKeywords);
      
      expect(keywords).toContain('custom1');
      expect(keywords).toContain('custom2');
      expect(keywords).toContain('grade point average');
    });
  });

  describe('validateSEOConfig', () => {
    it('should validate correct configuration', () => {
      const result = manager.validateSEOConfig(TOOL_SEO_CONFIGS.mean);
      
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should detect title length issues', () => {
      const config = {
        ...TOOL_SEO_CONFIGS.mean,
        title: 'Very short'
      };
      
      const result = manager.validateSEOConfig(config);
      expect(result.warnings.some(w => w.includes('Title too short'))).toBe(true);
    });

    it('should detect description length issues', () => {
      const config = {
        ...TOOL_SEO_CONFIGS.mean,
        description: 'Too short description that does not meet the recommended length for SEO optimization'
      };
      
      const result = manager.validateSEOConfig(config);
      // 应该有关于描述长度的警告
      expect(result.warnings.length).toBeGreaterThan(0);
    });

    it('should detect missing required fields', () => {
      const config = {
        title: '',
        description: '',
        keywords: []
      };
      
      const result = manager.validateSEOConfig(config);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Title is required');
      expect(result.errors).toContain('Description is required');
      expect(result.errors).toContain('Keywords are required');
    });

    it('should detect keyword count issues', () => {
      const tooFewKeywords = {
        ...TOOL_SEO_CONFIGS.mean,
        keywords: ['only', 'two']
      };
      
      const tooManyKeywords = {
        ...TOOL_SEO_CONFIGS.mean,
        keywords: Array.from({length: 15}, (_, i) => `keyword${i}`)
      };
      
      const fewResult = manager.validateSEOConfig(tooFewKeywords);
      const manyResult = manager.validateSEOConfig(tooManyKeywords);
      
      expect(fewResult.warnings.some(w => w.includes('Too few keywords'))).toBe(true);
      expect(manyResult.warnings.some(w => w.includes('Too many keywords'))).toBe(true);
    });
  });

  describe('TOOL_SEO_CONFIGS', () => {
    it('should have configurations for all major tools', () => {
      expect(TOOL_SEO_CONFIGS.mean).toBeDefined();
      expect(TOOL_SEO_CONFIGS['standard-deviation']).toBeDefined();
      expect(TOOL_SEO_CONFIGS.gpa).toBeDefined();
    });

    it('should have valid configurations for all tools', () => {
      Object.values(TOOL_SEO_CONFIGS).forEach(config => {
        const result = manager.validateSEOConfig(config);
        expect(result.isValid).toBe(true);
      });
    });

    it('should have unique titles for each tool', () => {
      const titles = Object.values(TOOL_SEO_CONFIGS).map(c => c.title);
      const uniqueTitles = new Set(titles);
      expect(uniqueTitles.size).toBe(titles.length);
    });

    it('should have appropriate keyword targeting', () => {
      const meanConfig = TOOL_SEO_CONFIGS.mean;
      expect(meanConfig.keywords).toContain('mean calculator');
      expect(meanConfig.keywords).toContain('average calculator');
      
      const sdConfig = TOOL_SEO_CONFIGS['standard-deviation'];
      expect(sdConfig.keywords).toContain('standard deviation calculator');
      
      const gpaConfig = TOOL_SEO_CONFIGS.gpa;
      expect(gpaConfig.keywords).toContain('GPA calculator');
    });
  });

  describe('edge cases', () => {
    it('should handle undefined tool ID gracefully', () => {
      const metadata = manager.generateMetadata(undefined);
      expect(metadata).toBeDefined();
      expect(metadata.title).toBe(DEFAULT_SEO_CONFIG.title);
    });

    it('should handle empty custom config', () => {
      const metadata = manager.generateMetadata('mean', {});
      expect(metadata.title).toBe(TOOL_SEO_CONFIGS.mean.title);
    });

    it('should merge arrays correctly', () => {
      const metadata = manager.generateMetadata('mean', {
        keywords: ['additional1', 'additional2']
      });
      
      const keywordString = metadata.keywords as string;
      expect(keywordString).toContain('additional1');
      expect(keywordString).toContain('mean calculator'); // 原有关键词保留
    });
  });
});