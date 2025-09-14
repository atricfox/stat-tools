/**
 * Unit tests for content recommendation functions
 */

import {
  getRecommendations,
  getSimilarContent,
  getToolRelatedContent,
  batchGetRecommendations
} from '../contentRecommender';
import type { TContentIndex } from '@/lib/content/contentSchema';

describe('Content Recommendation Functions', () => {
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
      title: 'How to calculate mean step by step',
      summary: 'Comprehensive guide to calculating mean',
      tags: ['mean', 'calculation', 'tutorial'],
      updated: '2024-01-14T00:00:00Z',
      url: '/how-to/calculate-mean',
    },
    {
      type: 'howto',
      slug: 'calculate-median',
      title: 'How to calculate median',
      summary: 'Finding the middle value in your data',
      tags: ['median', 'calculation', 'tutorial'],
      updated: '2024-01-13T00:00:00Z',
      url: '/how-to/calculate-median',
    },
    {
      type: 'case',
      slug: 'statistical-analysis',
      title: 'Statistical Analysis in Business',
      summary: 'Using statistics for business decisions',
      tags: ['statistics', 'business', 'analysis'],
      updated: '2024-01-12T00:00:00Z',
      url: '/cases/statistical-analysis',
    },
    {
      type: 'faq',
      slug: 'gpa-calculation',
      title: 'How is GPA calculated',
      summary: 'Understanding grade point average calculation',
      tags: ['gpa', 'education', 'calculation'],
      updated: '2024-01-11T00:00:00Z',
      url: '/faq#gpa-calculation',
    },
  ];
  
  describe('getRecommendations', () => {
    it('should recommend related content based on tags', () => {
      const current = testIndex[0]; // mean-median FAQ
      const recommendations = getRecommendations(current, testIndex);
      
      expect(recommendations.recommendations.length).toBeGreaterThan(0);
      
      // Should not include itself
      const slugs = recommendations.recommendations.map(r => r.slug);
      expect(slugs).not.toContain(current.slug);
      
      // Should include content with overlapping tags
      const hasRelatedContent = recommendations.recommendations.some(r =>
        r.tags.some(tag => current.tags.includes(tag))
      );
      expect(hasRelatedContent).toBe(true);
    });
    
    it('should respect max limit', () => {
      const current = testIndex[0];
      const recommendations = getRecommendations(current, testIndex, { max: 2 });
      
      expect(recommendations.recommendations.length).toBeLessThanOrEqual(2);
    });
    
    it('should provide reasoning for recommendations', () => {
      const current = testIndex[0];
      const recommendations = getRecommendations(current, testIndex);
      
      expect(recommendations.recommendations[0].reason).toBeDefined();
      expect(typeof recommendations.recommendations[0].reason).toBe('string');
    });
    
    it('should handle content with no tags', () => {
      const noTagsContent: TContentIndex = {
        type: 'faq',
        slug: 'no-tags',
        title: 'Content without tags',
        summary: 'This content has no tags',
        tags: [],
        updated: '2024-01-10T00:00:00Z',
        url: '/faq#no-tags',
      };
      
      const recommendations = getRecommendations(noTagsContent, testIndex);
      
      // Should still provide recommendations based on other factors
      expect(Array.isArray(recommendations.recommendations)).toBe(true);
    });
    
    it('should diversify content types in recommendations', () => {
      const current = testIndex[0]; // FAQ type
      const recommendations = getRecommendations(current, testIndex, { max: 3 });
      
      const types = recommendations.recommendations.map(r => r.type);
      const uniqueTypes = new Set(types);
      
      // Should include different content types when possible
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
  });
  
  describe('getSimilarContent', () => {
    it('should find similar content based on slug', () => {
      const similar = getSimilarContent('mean-median', testIndex);
      
      expect(similar.length).toBeGreaterThan(0);
      
      // Should not include the content itself
      const slugs = similar.map(s => s.slug);
      expect(slugs).not.toContain('mean-median');
    });
    
    it('should prioritize content with similar tags', () => {
      const similar = getSimilarContent('mean-median', testIndex);
      
      // calculate-mean and calculate-median should be among top results
      const topSlugs = similar.slice(0, 2).map(s => s.slug);
      expect(topSlugs).toContain('calculate-mean');
    });
    
    it('should handle non-existent slug', () => {
      const similar = getSimilarContent('non-existent', testIndex);
      
      // Should return empty array or all content as fallback
      expect(Array.isArray(similar)).toBe(true);
    });
    
    it('should respect limit parameter', () => {
      const similar = getSimilarContent('mean-median', testIndex, 2);
      expect(similar.length).toBeLessThanOrEqual(2);
    });
  });
  
  describe('getToolRelatedContent', () => {
    it('should find content related to a calculator tool', () => {
      const related = getToolRelatedContent('mean', testIndex);
      
      expect(related.length).toBeGreaterThan(0);
      
      // Should include content about mean
      const hasMeanContent = related.some(r =>
        r.tags.includes('mean') ||
        r.title.toLowerCase().includes('mean') ||
        r.summary.toLowerCase().includes('mean')
      );
      
      expect(hasMeanContent).toBe(true);
    });
    
    it('should respect limit parameter', () => {
      const related = getToolRelatedContent('mean', testIndex, 2);
      expect(related.length).toBeLessThanOrEqual(2);
    });
    
    it('should return empty array for unknown tool', () => {
      const related = getToolRelatedContent('unknown-tool', testIndex);
      expect(related.length).toBe(0);
    });
    
    it('should include diverse content types', () => {
      const related = getToolRelatedContent('mean', testIndex, 5);
      
      const types = related.map(r => r.type);
      const uniqueTypes = new Set(types);
      
      // Should include FAQs and How-tos when available
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
  });
  
  describe('batchGetRecommendations', () => {
    it('should get recommendations for multiple items', () => {
      const items = [testIndex[0], testIndex[1]];
      const batchResults = batchGetRecommendations(items, testIndex);
      
      expect(batchResults.size).toBe(2);
      expect(batchResults.has(items[0].slug)).toBe(true);
      expect(batchResults.has(items[1].slug)).toBe(true);
    });
    
    it('should respect options for each item', () => {
      const items = [testIndex[0]];
      const batchResults = batchGetRecommendations(items, testIndex, { max: 1 });
      
      const recommendations = batchResults.get(items[0].slug);
      expect(recommendations?.recommendations.length).toBeLessThanOrEqual(1);
    });
    
    it('should handle empty input array', () => {
      const batchResults = batchGetRecommendations([], testIndex);
      expect(batchResults.size).toBe(0);
    });
    
    it('should not include self-references in batch results', () => {
      const items = testIndex.slice(0, 2);
      const batchResults = batchGetRecommendations(items, testIndex);
      
      // Check first item's recommendations don't include itself
      const firstRecs = batchResults.get(items[0].slug);
      const firstRecSlugs = firstRecs?.recommendations.map(r => r.slug) || [];
      expect(firstRecSlugs).not.toContain(items[0].slug);
      
      // Check second item's recommendations don't include itself
      const secondRecs = batchResults.get(items[1].slug);
      const secondRecSlugs = secondRecs?.recommendations.map(r => r.slug) || [];
      expect(secondRecSlugs).not.toContain(items[1].slug);
    });
  });
});