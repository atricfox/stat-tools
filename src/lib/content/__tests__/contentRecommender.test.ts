/**
 * Unit tests for content recommender
 */

import { ContentRecommender } from '../contentRecommender';
import type { IndexedContent } from '../contentIndexer';

describe('ContentRecommender', () => {
  let recommender: ContentRecommender;
  let testContent: IndexedContent[];
  
  beforeEach(() => {
    recommender = new ContentRecommender();
    
    testContent = [
      {
        type: 'faq',
        slug: 'mean-median',
        title: 'Difference between mean and median',
        summary: 'Statistical measures comparison',
        tags: ['mean', 'median', 'statistics'],
        updated: '2024-01-15',
        url: '/faq#mean-median',
      },
      {
        type: 'howto',
        slug: 'calculate-mean',
        title: 'How to calculate mean',
        summary: 'Step by step mean calculation',
        tags: ['mean', 'calculation', 'tutorial'],
        updated: '2024-01-14',
        url: '/howto/calculate-mean',
      },
      {
        type: 'howto',
        slug: 'calculate-median',
        title: 'How to calculate median',
        summary: 'Finding the middle value',
        tags: ['median', 'calculation', 'tutorial'],
        updated: '2024-01-13',
        url: '/howto/calculate-median',
      },
      {
        type: 'case',
        slug: 'statistical-analysis',
        title: 'Statistical Analysis Case Study',
        summary: 'Real world statistics application',
        tags: ['statistics', 'analysis', 'case-study'],
        updated: '2024-01-12',
        url: '/cases/statistical-analysis',
      },
      {
        type: 'faq',
        slug: 'gpa-calculation',
        title: 'How is GPA calculated',
        summary: 'Understanding grade point average',
        tags: ['gpa', 'education', 'calculation'],
        updated: '2024-01-11',
        url: '/faq#gpa-calculation',
      },
    ];
    
    recommender.buildIndex(testContent);
  });
  
  describe('recommend', () => {
    it('should recommend related content based on tags', () => {
      const current = testContent[0]; // mean-median FAQ
      const recommendations = recommender.recommend(current, { limit: 3 });
      
      expect(recommendations.length).toBeLessThanOrEqual(3);
      expect(recommendations[0].slug).not.toBe(current.slug);
      
      // Should recommend content with overlapping tags
      const slugs = recommendations.map(r => r.slug);
      expect(slugs).toContain('calculate-mean'); // shares 'mean' tag
      expect(slugs).toContain('calculate-median'); // shares 'median' tag
    });
    
    it('should prioritize content with more tag overlaps', () => {
      const current = testContent[0]; // mean-median FAQ (tags: mean, median, statistics)
      const recommendations = recommender.recommend(current);
      
      // calculate-mean and calculate-median should be ranked higher than statistical-analysis
      const meanIndex = recommendations.findIndex(r => r.slug === 'calculate-mean');
      const statsIndex = recommendations.findIndex(r => r.slug === 'statistical-analysis');
      
      if (meanIndex !== -1 && statsIndex !== -1) {
        expect(meanIndex).toBeLessThan(statsIndex);
      }
    });
    
    it('should include type diversity when possible', () => {
      const current = testContent[0]; // FAQ type
      const recommendations = recommender.recommend(current, { limit: 4 });
      
      const types = recommendations.map(r => r.type);
      const uniqueTypes = new Set(types);
      
      // Should try to include different content types
      expect(uniqueTypes.size).toBeGreaterThan(1);
    });
    
    it('should respect limit parameter', () => {
      const current = testContent[0];
      const recommendations = recommender.recommend(current, { limit: 2 });
      
      expect(recommendations.length).toBeLessThanOrEqual(2);
    });
    
    it('should not recommend the same content', () => {
      const current = testContent[0];
      const recommendations = recommender.recommend(current);
      
      const slugs = recommendations.map(r => r.slug);
      expect(slugs).not.toContain(current.slug);
    });
    
    it('should handle content with no tags', () => {
      const contentNoTags: IndexedContent = {
        type: 'faq',
        slug: 'no-tags',
        title: 'Content without tags',
        summary: 'Summary text',
        tags: [],
        updated: '2024-01-10',
        url: '/faq#no-tags',
      };
      
      const recommendations = recommender.recommend(contentNoTags);
      
      // Should still return recommendations based on title/summary similarity
      expect(Array.isArray(recommendations)).toBe(true);
    });
  });
  
  describe('recommendByTags', () => {
    it('should recommend content matching provided tags', () => {
      const recommendations = recommender.recommendByTags(['mean', 'median']);
      
      expect(recommendations.length).toBeGreaterThan(0);
      
      // All recommendations should have at least one matching tag
      recommendations.forEach(rec => {
        const hasMatchingTag = rec.tags.some(tag => 
          ['mean', 'median'].includes(tag)
        );
        expect(hasMatchingTag).toBe(true);
      });
    });
    
    it('should prioritize content with more matching tags', () => {
      const recommendations = recommender.recommendByTags(['mean', 'statistics']);
      
      // mean-median FAQ has both tags, should be ranked high
      const meanMedianIndex = recommendations.findIndex(r => r.slug === 'mean-median');
      expect(meanMedianIndex).toBeLessThanOrEqual(1); // Should be in top 2
    });
    
    it('should exclude specific slugs when provided', () => {
      const recommendations = recommender.recommendByTags(
        ['mean'],
        { excludeSlugs: ['mean-median', 'calculate-mean'] }
      );
      
      const slugs = recommendations.map(r => r.slug);
      expect(slugs).not.toContain('mean-median');
      expect(slugs).not.toContain('calculate-mean');
    });
    
    it('should return empty array for non-existent tags', () => {
      const recommendations = recommender.recommendByTags(['nonexistent-tag']);
      expect(recommendations).toHaveLength(0);
    });
  });
  
  describe('recommendByType', () => {
    it('should only recommend content of specified type', () => {
      const recommendations = recommender.recommendByType('howto', testContent[0]);
      
      recommendations.forEach(rec => {
        expect(rec.type).toBe('howto');
      });
    });
    
    it('should still use relevance scoring within type', () => {
      const current = testContent[0]; // mean-median FAQ
      const recommendations = recommender.recommendByType('howto', current);
      
      // Should recommend howto guides about mean/median first
      const slugs = recommendations.map(r => r.slug);
      expect(slugs[0]).toMatch(/calculate-(mean|median)/);
    });
  });
  
  describe('recommendRecent', () => {
    it('should return content sorted by date', () => {
      const recommendations = recommender.recommendRecent({ limit: 3 });
      
      expect(recommendations).toHaveLength(3);
      
      // Check dates are in descending order
      for (let i = 1; i < recommendations.length; i++) {
        const prevDate = new Date(recommendations[i - 1].updated);
        const currDate = new Date(recommendations[i].updated);
        expect(prevDate.getTime()).toBeGreaterThanOrEqual(currDate.getTime());
      }
    });
    
    it('should exclude current content when provided', () => {
      const current = testContent[0];
      const recommendations = recommender.recommendRecent({ 
        limit: 5,
        excludeCurrent: current 
      });
      
      const slugs = recommendations.map(r => r.slug);
      expect(slugs).not.toContain(current.slug);
    });
  });
  
  describe('getSimilarContent', () => {
    it('should find similar content based on multiple factors', () => {
      const current = testContent[0]; // mean-median FAQ
      const similar = recommender.getSimilarContent(current, 3);
      
      expect(similar.length).toBeLessThanOrEqual(3);
      
      // Should find content about mean or median
      const allAboutStats = similar.every(s => 
        s.tags.some(tag => ['mean', 'median', 'statistics'].includes(tag)) ||
        s.title.toLowerCase().includes('mean') ||
        s.title.toLowerCase().includes('median')
      );
      
      expect(allAboutStats).toBe(true);
    });
  });
  
  describe('buildIndex', () => {
    it('should handle empty content array', () => {
      const emptyRecommender = new ContentRecommender();
      emptyRecommender.buildIndex([]);
      
      const recommendations = emptyRecommender.recommend({
        type: 'faq',
        slug: 'test',
        title: 'Test',
        summary: 'Test',
        tags: ['test'],
        updated: '2024-01-15',
        url: '/test',
      });
      
      expect(recommendations).toHaveLength(0);
    });
    
    it('should rebuild index with new content', () => {
      const newContent: IndexedContent[] = [
        {
          type: 'faq',
          slug: 'new-content',
          title: 'New Content',
          summary: 'New summary',
          tags: ['new'],
          updated: '2024-01-16',
          url: '/new',
        },
      ];
      
      recommender.buildIndex(newContent);
      const recommendations = recommender.recommendByTags(['new']);
      
      expect(recommendations).toHaveLength(1);
      expect(recommendations[0].slug).toBe('new-content');
    });
  });
});