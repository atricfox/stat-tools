/**
 * Unit tests for content indexer
 */

import {
  ContentIndexer,
  searchContent,
  buildContentIndex,
  saveContentIndex,
  loadContentIndex,
  getPopularContent,
  getSearchSuggestions,
  groupContentByType,
  groupContentByTag
} from '../contentIndexer';
import type { TContentIndex } from '@/lib/content/contentSchema';

describe('ContentIndexer', () => {
  let indexer: ContentIndexer;
  
  beforeEach(() => {
    indexer = new ContentIndexer();
  });
  
  describe('indexContent', () => {
    it('should index a single content item', () => {
      const content: IndexedContent = {
        type: 'faq',
        slug: 'test-faq',
        title: 'Test FAQ Question',
        summary: 'This is a test FAQ answer',
        tags: ['test', 'faq'],
        updated: '2024-01-15',
        url: '/faq#test-faq',
      };
      
      indexer.indexContent([content]);
      const results = indexer.search('test');
      
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('test-faq');
    });
    
    it('should handle multiple content items', () => {
      const contents: IndexedContent[] = [
        {
          type: 'faq',
          slug: 'faq-1',
          title: 'First FAQ',
          summary: 'First answer',
          tags: ['first'],
          updated: '2024-01-15',
          url: '/faq#faq-1',
        },
        {
          type: 'howto',
          slug: 'howto-1',
          title: 'First How-To',
          summary: 'First guide',
          tags: ['first', 'guide'],
          updated: '2024-01-15',
          url: '/how-to/howto-1',
        },
      ];
      
      indexer.indexContent(contents);
      const results = indexer.search('first');
      
      expect(results).toHaveLength(2);
    });
  });
  
  describe('search', () => {
    beforeEach(() => {
      const contents: IndexedContent[] = [
        {
          type: 'faq',
          slug: 'mean-median',
          title: 'Difference between mean and median',
          summary: 'Mean is average, median is middle value',
          tags: ['statistics', 'mean', 'median'],
          updated: '2024-01-15',
          url: '/faq#mean-median',
        },
        {
          type: 'howto',
          slug: 'calculate-mean',
          title: 'How to calculate mean',
          summary: 'Step by step guide to calculate average',
          tags: ['mean', 'average', 'calculation'],
          updated: '2024-01-15',
          url: '/how-to/calculate-mean',
        },
        {
          type: 'case',
          slug: 'gpa-improvement',
          title: 'GPA Improvement Strategy',
          summary: 'Case study on improving GPA',
          tags: ['gpa', 'education', 'strategy'],
          updated: '2024-01-15',
          url: '/cases/gpa-improvement',
        },
      ];
      
      indexer.indexContent(contents);
    });
    
    it('should find content by title match', () => {
      const results = indexer.search('mean');
      expect(results).toHaveLength(2);
      expect(results.map(r => r.slug)).toContain('mean-median');
      expect(results.map(r => r.slug)).toContain('calculate-mean');
    });
    
    it('should find content by tag match', () => {
      const results = indexer.search('statistics');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('mean-median');
    });
    
    it('should find content by summary match', () => {
      const results = indexer.search('average');
      expect(results).toHaveLength(2);
    });
    
    it('should handle case-insensitive search', () => {
      const results = indexer.search('MEAN');
      expect(results).toHaveLength(2);
    });
    
    it('should handle partial matches', () => {
      const results = indexer.search('calc');
      expect(results).toHaveLength(1);
      expect(results[0].slug).toBe('calculate-mean');
    });
    
    it('should limit results when specified', () => {
      const results = indexer.search('mean', { limit: 1 });
      expect(results).toHaveLength(1);
    });
    
    it('should filter by type', () => {
      const results = indexer.search('', { type: 'faq' });
      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('faq');
    });
    
    it('should return empty array for no matches', () => {
      const results = indexer.search('nonexistent');
      expect(results).toHaveLength(0);
    });
  });
  
  describe('searchWithHighlight', () => {
    beforeEach(() => {
      const content: IndexedContent = {
        type: 'faq',
        slug: 'test',
        title: 'Understanding mean and median',
        summary: 'The mean is the average value',
        tags: ['mean', 'median'],
        updated: '2024-01-15',
        url: '/faq#test',
      };
      
      indexer.indexContent([content]);
    });
    
    it('should highlight search terms in results', () => {
      const results = indexer.searchWithHighlight('mean');
      expect(results).toHaveLength(1);
      
      const highlighted = results[0];
      expect(highlighted.titleHighlighted).toContain('<mark>mean</mark>');
      expect(highlighted.summaryHighlighted).toContain('<mark>mean</mark>');
    });
    
    it('should handle multiple occurrences', () => {
      const results = indexer.searchWithHighlight('mean');
      const highlighted = results[0];
      
      // Should highlight all occurrences
      const meanCount = (highlighted.titleHighlighted?.match(/<mark>mean<\/mark>/g) || []).length;
      expect(meanCount).toBeGreaterThan(0);
    });
  });
  
  describe('getByType', () => {
    beforeEach(() => {
      const contents: IndexedContent[] = [
        { type: 'faq', slug: 'faq-1', title: 'FAQ 1', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'faq', slug: 'faq-2', title: 'FAQ 2', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'howto', slug: 'howto-1', title: 'HowTo 1', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'case', slug: 'case-1', title: 'Case 1', summary: '', tags: [], updated: '2024-01-15', url: '' },
      ];
      
      indexer.indexContent(contents);
    });
    
    it('should return all content of specified type', () => {
      const faqs = indexer.getByType('faq');
      expect(faqs).toHaveLength(2);
      expect(faqs.every(c => c.type === 'faq')).toBe(true);
    });
    
    it('should return empty array for unknown type', () => {
      const results = indexer.getByType('unknown' as any);
      expect(results).toHaveLength(0);
    });
  });
  
  describe('getBySlug', () => {
    beforeEach(() => {
      const content: IndexedContent = {
        type: 'faq',
        slug: 'test-slug',
        title: 'Test Content',
        summary: 'Test summary',
        tags: [],
        updated: '2024-01-15',
        url: '/test',
      };
      
      indexer.indexContent([content]);
    });
    
    it('should return content by slug', () => {
      const result = indexer.getBySlug('test-slug');
      expect(result).toBeDefined();
      expect(result?.title).toBe('Test Content');
    });
    
    it('should return undefined for non-existent slug', () => {
      const result = indexer.getBySlug('non-existent');
      expect(result).toBeUndefined();
    });
  });
  
  describe('getStats', () => {
    it('should return correct statistics', () => {
      const contents: IndexedContent[] = [
        { type: 'faq', slug: '1', title: '', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'faq', slug: '2', title: '', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'howto', slug: '3', title: '', summary: '', tags: [], updated: '2024-01-15', url: '' },
        { type: 'case', slug: '4', title: '', summary: '', tags: [], updated: '2024-01-15', url: '' },
      ];
      
      indexer.indexContent(contents);
      const stats = indexer.getStats();
      
      expect(stats.total).toBe(4);
      expect(stats.byType.faq).toBe(2);
      expect(stats.byType.howto).toBe(1);
      expect(stats.byType.case).toBe(1);
    });
  });
});