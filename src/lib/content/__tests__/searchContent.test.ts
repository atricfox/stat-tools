/**
 * Unit tests for content search functions
 */

import { 
  searchContent,
  getPopularContent,
  getSearchSuggestions,
  groupContentByType,
  groupContentByTag
} from '../contentIndexer';
import type { TContentIndex } from '@/lib/content/contentSchema';

describe('Content Search Functions', () => {
  const testIndex: TContentIndex[] = [
    {
      type: 'faq',
      slug: 'mean-median',
      title: 'Difference between mean and median',
      summary: 'Mean is average, median is middle value',
      tags: ['statistics', 'mean', 'median'],
      updated: '2024-01-15T00:00:00Z',
      url: '/faq#mean-median',
    },
    {
      type: 'howto',
      slug: 'calculate-mean',
      title: 'How to calculate mean',
      summary: 'Step by step mean calculation guide',
      tags: ['mean', 'calculation', 'tutorial'],
      updated: '2024-01-14T00:00:00Z',
      url: '/how-to/calculate-mean',
    },
    {
      type: 'case',
      slug: 'gpa-improvement',
      title: 'GPA Improvement Strategy',
      summary: 'Case study on improving GPA from 2.8 to 3.5',
      tags: ['gpa', 'education', 'strategy'],
      updated: '2024-01-13T00:00:00Z',
      url: '/cases/gpa-improvement',
    },
  ];
  
  describe('searchContent', () => {
    it('should find content by title match', () => {
      const results = searchContent(testIndex, { query: 'mean' });
      expect(results.length).toBeGreaterThan(0);
      
      const slugs = results.map(r => r.slug);
      expect(slugs).toContain('mean-median');
      expect(slugs).toContain('calculate-mean');
    });
    
    it('should find content by tag match', () => {
      const results = searchContent(testIndex, { query: 'statistics' });
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('mean-median');
    });
    
    it('should handle case-insensitive search', () => {
      const results = searchContent(testIndex, { query: 'MEAN' });
      expect(results.length).toBeGreaterThan(0);
    });
    
    it('should respect limit option', () => {
      const results = searchContent(testIndex, { query: 'mean', limit: 1 });
      expect(results).toHaveLength(1);
    });
    
    it('should filter by type', () => {
      const results = searchContent(testIndex, { query: 'test', types: ['faq'] });
      const faqResults = testIndex.filter(i => i.type === 'faq');
      expect(results.length).toBeLessThanOrEqual(faqResults.length);
    });
    
    it('should return empty results for no matches', () => {
      const results = searchContent(testIndex, { query: 'nonexistent' });
      expect(results).toHaveLength(0);
    });
    
    it('should include highlight in results when requested', () => {
      const results = searchContent(testIndex, { query: 'mean', fuzzy: true });
      expect(results.length).toBeGreaterThan(0);
      if (results[0].highlights) {
        expect(results[0].highlights.title || results[0].highlights.summary).toBeDefined();
      }
    });
  });
  
  describe('getPopularContent', () => {
    it('should return content sorted by recency', () => {
      const popular = getPopularContent(testIndex, 2);
      expect(popular).toHaveLength(2);
      
      // Check dates are in descending order
      const date1 = new Date(popular[0].updated);
      const date2 = new Date(popular[1].updated);
      expect(date1.getTime()).toBeGreaterThanOrEqual(date2.getTime());
    });
    
    it('should respect limit parameter', () => {
      const popular = getPopularContent(testIndex, 1);
      expect(popular).toHaveLength(1);
    });
    
    it('should handle limit larger than array', () => {
      const popular = getPopularContent(testIndex, 10);
      expect(popular).toHaveLength(testIndex.length);
    });
  });
  
  describe('getSearchSuggestions', () => {
    it('should return relevant suggestions for query', () => {
      const suggestions = getSearchSuggestions(testIndex, 'mea');
      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions).toContain('mean');
    });
    
    it('should limit number of suggestions', () => {
      const suggestions = getSearchSuggestions(testIndex, 'mean', 1);
      expect(suggestions).toHaveLength(1);
    });
    
    it('should return unique suggestions', () => {
      const suggestions = getSearchSuggestions(testIndex, 'mean');
      const unique = new Set(suggestions);
      expect(unique.size).toBe(suggestions.length);
    });
    
    it('should return empty array for no matches', () => {
      const suggestions = getSearchSuggestions(testIndex, 'xyz');
      expect(suggestions).toHaveLength(0);
    });
  });
  
  describe('groupContentByType', () => {
    it('should group content by type correctly', () => {
      const grouped = groupContentByType(testIndex);
      
      expect(grouped.size).toBe(3);
      expect(grouped.has('faq')).toBe(true);
      expect(grouped.has('howto')).toBe(true);
      expect(grouped.has('case')).toBe(true);
      
      expect(grouped.get('faq')?.length).toBe(1);
      expect(grouped.get('howto')?.length).toBe(1);
      expect(grouped.get('case')?.length).toBe(1);
    });
    
    it('should handle empty index', () => {
      const grouped = groupContentByType([]);
      expect(grouped.size).toBe(0);
    });
  });
  
  describe('groupContentByTag', () => {
    it('should group content by tags correctly', () => {
      const grouped = groupContentByTag(testIndex);
      
      expect(grouped.has('mean')).toBe(true);
      expect(grouped.has('statistics')).toBe(true);
      expect(grouped.has('gpa')).toBe(true);
      
      const meanContent = grouped.get('mean');
      expect(meanContent?.length).toBe(2);
    });
    
    it('should include content in multiple tag groups', () => {
      const grouped = groupContentByTag(testIndex);
      
      const meanContent = grouped.get('mean');
      const statisticsContent = grouped.get('statistics');
      
      // mean-median should be in both groups
      const meanMedianInMean = meanContent?.some(c => c.slug === 'mean-median');
      const meanMedianInStats = statisticsContent?.some(c => c.slug === 'mean-median');
      
      expect(meanMedianInMean).toBe(true);
      expect(meanMedianInStats).toBe(true);
    });
    
    it('should handle content with no tags', () => {
      const contentNoTags: TContentIndex[] = [
        {
          type: 'faq',
          slug: 'no-tags',
          title: 'No Tags Content',
          summary: 'Content without tags',
          tags: [],
          updated: '2024-01-15T00:00:00Z',
          url: '/test',
        },
      ];
      
      const grouped = groupContentByTag(contentNoTags);
      expect(grouped.size).toBe(0);
    });
  });
});