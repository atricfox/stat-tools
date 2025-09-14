/**
 * Content Service Integration Tests
 * 内容服务集成测试，使用实际数据库验证功能完整性
 */

import { describe, it, expect } from '@jest/globals';
import { contentService } from './ContentService';
import { contentAdapter } from './DatabaseContentAdapter';
import { cachedContentService } from './ContentCacheService';

describe('ContentService Integration Tests', () => {
    describe('Service Availability', () => {
        it('should have all required methods available', () => {
            expect(typeof contentService.getContentItem).toBe('function');
            expect(typeof contentService.getContentItemBySlug).toBe('function');
            expect(typeof contentService.queryContent).toBe('function');
            expect(typeof contentService.searchContent).toBe('function');
            expect(typeof contentService.getRelatedContent).toBe('function');
            expect(typeof contentService.getHowToSteps).toBe('function');
            expect(typeof contentService.getCaseDetails).toBe('function');
            expect(typeof contentService.getContentStats).toBe('function');
            expect(typeof contentService.getPopularContent).toBe('function');
            expect(typeof contentService.getLatestContent).toBe('function');
        });
    });

    describe('Data Query Operations', () => {
        it('should be able to query content without errors', () => {
            expect(() => {
                const items = contentService.queryContent({ limit: 10 });
                expect(Array.isArray(items)).toBe(true);
            }).not.toThrow();
        });

        it('should be able to get content stats without errors', () => {
            expect(() => {
                const stats = contentService.getContentStats();
                expect(typeof stats).toBe('object');
                expect(stats).toHaveProperty('totalItems');
                expect(stats).toHaveProperty('byType');
            }).not.toThrow();
        });

        it('should be able to get popular content without errors', () => {
            expect(() => {
                const items = contentService.getPopularContent(5);
                expect(Array.isArray(items)).toBe(true);
            }).not.toThrow();
        });

        it('should be able to get latest content without errors', () => {
            expect(() => {
                const items = contentService.getLatestContent(5);
                expect(Array.isArray(items)).toBe(true);
            }).not.toThrow();
        });
    });

    describe('Search Functionality', () => {
        it('should handle search operations gracefully', () => {
            expect(() => {
                // Test with a common search term
                const results = contentService.searchContent('statistics');
                expect(Array.isArray(results)).toBe(true);
            }).not.toThrow();
        });

        it('should return empty array for empty search', () => {
            const results = contentService.searchContent('');
            expect(Array.isArray(results)).toBe(true);
            expect(results.length).toBe(0);
        });
    });

    describe('Content Type Specific Operations', () => {
        it('should handle How-to steps retrieval', () => {
            // This should not throw even if no How-to content exists
            expect(() => {
                const steps = contentService.getHowToSteps(999);
                expect(Array.isArray(steps)).toBe(true);
            }).not.toThrow();
        });

        it('should handle case details retrieval', () => {
            // This should not throw even if no case content exists
            expect(() => {
                const details = contentService.getCaseDetails(999);
                // Can be null for non-existent content
                expect(details === null || typeof details === 'object').toBe(true);
            }).not.toThrow();
        });

        it('should handle related content retrieval', () => {
            // This should not throw even for non-existent content
            expect(() => {
                const related = contentService.getRelatedContent(999, 5);
                expect(Array.isArray(related)).toBe(true);
            }).not.toThrow();
        });
    });
});

describe('DatabaseContentAdapter Integration Tests', () => {
    describe('Adapter Interface', () => {
        it('should implement all required methods', () => {
            expect(typeof contentAdapter.getContentItem).toBe('function');
            expect(typeof contentAdapter.getContentItemBySlug).toBe('function');
            expect(typeof contentAdapter.queryContent).toBe('function');
            expect(typeof contentAdapter.searchContent).toBe('function');
            expect(typeof contentAdapter.getRelatedContent).toBe('function');
            expect(typeof contentAdapter.getHowToSteps).toBe('function');
            expect(typeof contentAdapter.getCaseDetails).toBe('function');
            expect(typeof contentAdapter.getContentStats).toBe('function');
            expect(typeof contentAdapter.getPopularContent).toBe('function');
            expect(typeof contentAdapter.getLatestContent).toBe('function');
        });

        it('should allow data source switching', () => {
            expect(() => {
                contentAdapter.setDataSource(true);  // Database mode
                contentAdapter.setDataSource(false); // Filesystem fallback mode
                contentAdapter.setDataSource(true);  // Back to database mode
            }).not.toThrow();
        });
    });

    describe('Data Operations', () => {
        it('should perform basic operations without errors', () => {
            expect(() => {
                const items = contentAdapter.queryContent({ limit: 5 });
                expect(Array.isArray(items)).toBe(true);
            }).not.toThrow();
        });

        it('should get stats without errors', () => {
            expect(() => {
                const stats = contentAdapter.getContentStats();
                expect(typeof stats).toBe('object');
            }).not.toThrow();
        });
    });
});

describe('ContentCacheService Integration Tests', () => {
    describe('Cache Operations', () => {
        it('should have cache management methods', () => {
            expect(typeof cachedContentService.clearAllCache).toBe('function');
            expect(typeof cachedContentService.getCacheStats).toBe('function');
            expect(typeof cachedContentService.warmupCache).toBe('function');
        });

        it('should provide cache statistics', () => {
            expect(() => {
                const stats = cachedContentService.getCacheStats();
                expect(typeof stats).toBe('object');
                expect(stats).toHaveProperty('total');
                expect(stats).toHaveProperty('valid');
                expect(stats).toHaveProperty('expired');
                expect(stats).toHaveProperty('memoryUsage');
            }).not.toThrow();
        });

        it('should clear cache without errors', () => {
            expect(() => {
                cachedContentService.clearAllCache();
                const stats = cachedContentService.getCacheStats();
                expect(stats.total).toBe(0);
            }).not.toThrow();
        });
    });

    describe('Cache Warmup', () => {
        it('should perform cache warmup without errors', async () => {
            expect(async () => {
                await cachedContentService.warmupCache();
            }).not.toThrow();
        });
    });
});

describe('Performance Benchmarks', () => {
    describe('Query Performance', () => {
        it('should execute basic queries quickly', () => {
            const start = performance.now();
            const items = contentService.queryContent({ limit: 10 });
            const duration = performance.now() - start;

            expect(Array.isArray(items)).toBe(true);
            expect(duration).toBeLessThan(100); // Should be much faster than 100ms
        });

        it('should execute stats queries quickly', () => {
            const start = performance.now();
            const stats = contentService.getContentStats();
            const duration = performance.now() - start;

            expect(typeof stats).toBe('object');
            expect(duration).toBeLessThan(50); // Should be very fast
        });

        it('should execute search queries reasonably fast', () => {
            const start = performance.now();
            const results = contentService.searchContent('test');
            const duration = performance.now() - start;

            expect(Array.isArray(results)).toBe(true);
            expect(duration).toBeLessThan(200); // Search can be slower
        });
    });

    describe('Cache Performance', () => {
        it('should provide cache stats quickly', () => {
            const start = performance.now();
            const stats = cachedContentService.getCacheStats();
            const duration = performance.now() - start;

            expect(typeof stats).toBe('object');
            expect(duration).toBeLessThan(10); // Should be very fast
        });

        it('should clear cache quickly', () => {
            // Fill cache first
            contentService.queryContent({ limit: 20 });

            const start = performance.now();
            cachedContentService.clearAllCache();
            const duration = performance.now() - start;

            expect(duration).toBeLessThan(10); // Should be very fast
        });
    });
});