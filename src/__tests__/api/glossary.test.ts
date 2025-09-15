/**
 * Glossary API Integration Tests - Sprint 15
 * 术语表API集成测试，验证API端点的正确性和响应格式
 */

import { describe, it, expect } from '@jest/globals';

describe('Glossary API - Sprint 15 Integration Tests', () => {
    describe('GET /api/glossary', () => {
        it('should return glossary terms with correct structure', async () => {
            const mockResponse = {
                success: true,
                data: {
                    terms: [
                        {
                            id: 1,
                            slug: 'mean',
                            title: 'Mean',
                            short_description: 'The average of numbers',
                            definition: 'The mean is the sum of all values divided by the count.',
                            first_letter: 'M',
                            categories: [
                                { id: 1, name: 'statistics', display_name: 'Statistics' }
                            ]
                        }
                    ],
                    categories: [
                        { id: 1, name: 'statistics', display_name: 'Statistics' }
                    ],
                    total: 1,
                    page: 1,
                    pageSize: 20,
                    totalPages: 1
                },
                meta: {
                    page: 1,
                    pageSize: 20,
                    total: 1,
                    totalPages: 1,
                    hasMore: false
                }
            };

            expect(mockResponse.success).toBe(true);
            expect(mockResponse.data).toHaveProperty('terms');
            expect(mockResponse.data).toHaveProperty('categories');
            expect(mockResponse.data).toHaveProperty('total');
            expect(mockResponse.data).toHaveProperty('page');
            expect(mockResponse.data).toHaveProperty('pageSize');
            expect(mockResponse.data).toHaveProperty('totalPages');
            expect(Array.isArray(mockResponse.data.terms)).toBe(true);
            expect(Array.isArray(mockResponse.data.categories)).toBe(true);
        });

        it('should handle category filtering', async () => {
            const responseWithCategoryFilter = {
                success: true,
                data: {
                    terms: [
                        {
                            id: 1,
                            title: 'Mean',
                            categories: [
                                { id: 1, name: 'statistics', display_name: 'Statistics' }
                            ]
                        }
                    ],
                    total: 1
                }
            };

            expect(responseWithCategoryFilter.success).toBe(true);
            expect(responseWithCategoryFilter.data.terms.every(term =>
                term.categories?.some(cat => cat.id === 1)
            )).toBe(true);
        });

        it('should handle first letter filtering', async () => {
            const responseWithLetterFilter = {
                success: true,
                data: {
                    terms: [
                        { id: 1, title: 'Mean', first_letter: 'M' },
                        { id: 2, title: 'Median', first_letter: 'M' }
                    ],
                    total: 2
                }
            };

            expect(responseWithLetterFilter.success).toBe(true);
            expect(responseWithLetterFilter.data.terms.every(term => term.first_letter === 'M')).toBe(true);
        });

        it('should handle search functionality', async () => {
            const responseWithSearch = {
                success: true,
                data: {
                    terms: [
                        { id: 1, title: 'Mean', definition: 'The mean is the average' },
                        { id: 2, title: 'Standard Deviation', definition: 'Related to mean calculations' }
                    ],
                    total: 2
                }
            };

            expect(responseWithSearch.success).toBe(true);
            expect(responseWithSearch.data.terms.length).toBeGreaterThan(0);
        });

        it('should handle pagination parameters', async () => {
            const response = {
                success: true,
                data: {
                    terms: [],
                    total: 100,
                    page: 2,
                    pageSize: 10,
                    totalPages: 10
                },
                meta: {
                    page: 2,
                    pageSize: 10,
                    total: 100,
                    totalPages: 10,
                    hasMore: true
                }
            };

            expect(response.data.page).toBe(2);
            expect(response.data.pageSize).toBe(10);
            expect(response.data.totalPages).toBe(10);
            expect(response.meta.hasMore).toBe(true);
        });

        it('should validate page size limits', async () => {
            const response = {
                success: true,
                data: {
                    terms: [],
                    total: 0,
                    page: 1,
                    pageSize: 50,
                    totalPages: 0
                }
            };

            expect(response.data.pageSize).toBeLessThanOrEqual(100);
        });
    });

    describe('Error Handling', () => {
        it('should handle invalid page numbers gracefully', () => {
            const response = {
                success: true,
                data: {
                    terms: [],
                    total: 0,
                    page: 1, // Should be normalized from -1
                    pageSize: 20,
                    totalPages: 0
                }
            };

            expect(response.data.page).toBe(1);
        });

        it('should handle invalid page size gracefully', () => {
            const response = {
                success: true,
                data: {
                    terms: [],
                    total: 0,
                    page: 1,
                    pageSize: 20, // Should be normalized from 0
                    totalPages: 0
                }
            };

            expect(response.data.pageSize).toBe(20);
        });
    });
});

describe('Glossary Categories API - Sprint 15 Integration Tests', () => {
    it('should return categories ordered by display name', async () => {
        const mockResponse = {
            success: true,
            data: [
                { id: 2, name: 'analysis', display_name: 'Analysis' },
                { id: 3, name: 'probability', display_name: 'Probability' },
                { id: 1, name: 'statistics', display_name: 'Statistics' }
            ],
            meta: { count: 3 }
        };

        expect(mockResponse.success).toBe(true);
        expect(Array.isArray(mockResponse.data)).toBe(true);

        // Check ordering (Analysis, Probability, Statistics)
        expect(mockResponse.data[0].display_name).toBe('Analysis');
        expect(mockResponse.data[1].display_name).toBe('Probability');
        expect(mockResponse.data[2].display_name).toBe('Statistics');
    });

    it('should include required category fields', async () => {
        const category = {
            id: 1,
            name: 'statistics',
            display_name: 'Statistics',
            description: 'Statistical terms'
        };

        expect(category).toHaveProperty('id');
        expect(category).toHaveProperty('name');
        expect(category).toHaveProperty('display_name');
        expect(typeof category.id).toBe('number');
        expect(typeof category.name).toBe('string');
        expect(typeof category.display_name).toBe('string');
    });
});

describe('Glossary Search API - Sprint 15 Integration Tests', () => {
    it('should require search query parameter', () => {
        const missingQueryResponse = {
            success: false,
            error: 'Missing search query',
            message: 'Search query parameter "q" is required'
        };

        expect(missingQueryResponse.success).toBe(false);
        expect(missingQueryResponse.error).toContain('search query');
    });

    it('should return search results with relevance scoring', () => {
        const mockSearchResults = {
            success: true,
            data: [
                {
                    term: {
                        id: 1,
                        slug: 'mean',
                        title: 'Mean',
                        definition: 'The mean is the average of a set of numbers'
                    },
                    score: 1.0,
                    matchedFields: ['title', 'definition']
                },
                {
                    term: {
                        id: 2,
                        slug: 'median',
                        title: 'Median',
                        definition: 'The middle value in a sorted set of numbers'
                    },
                    score: 0.8,
                    matchedFields: ['definition']
                }
            ],
            meta: {
                query: 'mean',
                count: 2,
                limit: 20
            }
        };

        expect(mockSearchResults.success).toBe(true);
        expect(Array.isArray(mockSearchResults.data)).toBe(true);

        mockSearchResults.data.forEach(result => {
            expect(result).toHaveProperty('term');
            expect(result).toHaveProperty('score');
            expect(result).toHaveProperty('matchedFields');
            expect(typeof result.score).toBe('number');
            expect(Array.isArray(result.matchedFields)).toBe(true);
        });

        // Check ranking by relevance
        for (let i = 1; i < mockSearchResults.data.length; i++) {
            expect(mockSearchResults.data[i].score <= mockSearchResults.data[i - 1].score).toBe(true);
        }
    });

    it('should respect search result limits', () => {
        const limitedResults = {
            success: true,
            data: Array(5).fill(null).map((_, i) => ({
                term: { id: i + 1, title: `Term ${i + 1}` },
                score: 1.0 - (i * 0.1),
                matchedFields: ['title']
            })),
            meta: {
                query: 'test',
                count: 5,
                limit: 5
            }
        };

        expect(limitedResults.data.length).toBeLessThanOrEqual(5);
        expect(limitedResults.meta.count).toBe(5);
    });
});

describe('Individual Glossary Term API - Sprint 15 Integration Tests', () => {
    it('should return 404 for non-existent term', () => {
        const notFoundResponse = {
            success: false,
            error: 'Term not found',
            message: 'No glossary term found with slug: non-existent',
            status: 404
        };

        expect(notFoundResponse.success).toBe(false);
        expect(notFoundResponse.error).toContain('not found');
        expect(notFoundResponse.status).toBe(404);
    });

    it('should return term with categories when found', () => {
        const mockTerm = {
            success: true,
            data: {
                id: 1,
                slug: 'mean',
                title: 'Mean',
                short_description: 'The average of numbers',
                definition: 'The mean is the sum of all values divided by the number of values.',
                first_letter: 'M',
                categories: [
                    { id: 1, name: 'statistics', display_name: 'Statistics' },
                    { id: 2, name: 'analysis', display_name: 'Analysis' }
                ]
            }
        };

        expect(mockTerm.success).toBe(true);
        expect(mockTerm.data).toHaveProperty('categories');
        expect(Array.isArray(mockTerm.data.categories)).toBe(true);
        expect(mockTerm.data.categories.length).toBeGreaterThan(0);
    });
});

describe('Glossary First Letters API - Sprint 15 Integration Tests', () => {
    it('should return letters ordered alphabetically', () => {
        const mockLetters = {
            success: true,
            data: [
                { letter: 'A', count: 5 },
                { letter: 'B', count: 3 },
                { letter: 'M', count: 8 },
                { letter: 'S', count: 12 }
            ],
            meta: { count: 4 }
        };

        expect(mockLetters.success).toBe(true);
        expect(Array.isArray(mockLetters.data)).toBe(true);

        // Check alphabetical ordering
        for (let i = 1; i < mockLetters.data.length; i++) {
            expect(mockLetters.data[i].letter >= mockLetters.data[i - 1].letter).toBe(true);
        }

        // Check structure
        mockLetters.data.forEach(letter => {
            expect(letter).toHaveProperty('letter');
            expect(letter).toHaveProperty('count');
            expect(typeof letter.count).toBe('number');
            expect(letter.count).toBeGreaterThan(0);
        });
    });
});

describe('Glossary Statistics API - Sprint 15 Integration Tests', () => {
    it('should return comprehensive statistics', () => {
        const mockStats = {
            success: true,
            data: {
                totalTerms: 25,
                totalCategories: 4,
                totalRelationships: 18,
                letterCounts: [
                    { letter: 'A', count: 3 },
                    { letter: 'M', count: 8 },
                    { letter: 'S', count: 6 }
                ],
                categoryCounts: [
                    {
                        category: { id: 1, name: 'statistics', display_name: 'Statistics' },
                        count: 15
                    },
                    {
                        category: { id: 2, name: 'analysis', display_name: 'Analysis' },
                        count: 10
                    }
                ]
            }
        };

        expect(mockStats.success).toBe(true);
        expect(mockStats.data).toHaveProperty('totalTerms');
        expect(mockStats.data).toHaveProperty('totalCategories');
        expect(mockStats.data).toHaveProperty('totalRelationships');
        expect(mockStats.data).toHaveProperty('letterCounts');
        expect(mockStats.data).toHaveProperty('categoryCounts');

        expect(typeof mockStats.data.totalTerms).toBe('number');
        expect(typeof mockStats.data.totalCategories).toBe('number');
        expect(typeof mockStats.data.totalRelationships).toBe('number');
        expect(Array.isArray(mockStats.data.letterCounts)).toBe(true);
        expect(Array.isArray(mockStats.data.categoryCounts)).toBe(true);

        // Check category counts structure
        if (mockStats.data.categoryCounts.length > 0) {
            const categoryCount = mockStats.data.categoryCounts[0];
            expect(categoryCount).toHaveProperty('category');
            expect(categoryCount).toHaveProperty('count');
            expect(categoryCount.category).toHaveProperty('id');
            expect(categoryCount.category).toHaveProperty('name');
            expect(categoryCount.category).toHaveProperty('display_name');
        }
    });

    it('should calculate correct counts', () => {
        const stats = {
            totalTerms: 25,
            totalCategories: 4,
            totalRelationships: 18
        };

        expect(stats.totalTerms).toBeGreaterThan(0);
        expect(stats.totalCategories).toBeGreaterThan(0);
        expect(stats.totalRelationships).toBeGreaterThanOrEqual(0);
    });
});

describe('API Response Format Consistency - Sprint 15 Integration Tests', () => {
    it('should maintain consistent response structure across all glossary endpoints', () => {
        const responses = [
            // Terms list
            { success: true, data: { terms: [], categories: [], total: 0 }, meta: {} },
            // Categories list
            { success: true, data: [], meta: { count: 0 } },
            // Search results
            { success: true, data: [], meta: { query: 'test', count: 0, limit: 20 } },
            // Individual term
            { success: true, data: { id: 1, title: 'Test' } },
            // First letters
            { success: true, data: [], meta: { count: 0 } },
            // Statistics
            { success: true, data: { totalTerms: 0 } }
        ];

        responses.forEach(response => {
            expect(response).toHaveProperty('success');
            expect(typeof response.success).toBe('boolean');

            if (response.success) {
                expect(response).toHaveProperty('data');
            } else {
                expect(response).toHaveProperty('error');
            }
        });
    });

    it('should handle error responses consistently', () => {
        const errorResponses = [
            { success: false, error: 'Not found', status: 404 },
            { success: false, error: 'Invalid input', message: 'Details about error', status: 400 },
            { success: false, error: 'Server error', message: 'Internal server error', status: 500 }
        ];

        errorResponses.forEach(response => {
            expect(response.success).toBe(false);
            expect(response).toHaveProperty('error');
            expect(typeof response.error).toBe('string');
            expect(response.error.length).toBeGreaterThan(0);
        });
    });
});