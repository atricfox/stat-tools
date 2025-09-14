#!/usr/bin/env tsx

/**
 * Content Service Performance Test
 * 测试增强的内容服务性能和功能
 */

import { contentService } from '../src/lib/content/ContentService';
import { contentAdapter } from '../src/lib/content/DatabaseContentAdapter';
import { cachedContentService } from '../src/lib/content/ContentCacheService';

// 测试结果接口
interface TestResult {
    name: string;
    success: boolean;
    duration: number;
    error?: string;
    data?: any;
}

// 性能测试结果接口
interface PerformanceResult {
    operation: string;
    averageTime: number;
    minTime: number;
    maxTime: number;
    successRate: number;
    totalOperations: number;
}

/**
 * 内容服务测试类
 */
class ContentServiceTest {
    private results: TestResult[] = [];
    private performanceResults: PerformanceResult[] = [];

    constructor() {
        console.log('🚀 开始内容服务测试...');
    }

    /**
     * 运行所有测试
     */
    async runAllTests(): Promise<void> {
        console.log('\n📋 开始功能测试...');

        // 基础功能测试
        await this.testBasicQueries();
        await this.testSearchFunctionality();
        await this.testRelationshipQueries();
        await this.testContentStats();

        console.log('\n⚡ 开始性能测试...');

        // 性能测试
        await this.testQueryPerformance();
        await this.testCachePerformance();
        await this.testSearchPerformance();

        // 显示结果
        this.displayResults();
        this.displayPerformanceResults();
    }

    /**
     * 测试基础查询功能
     */
    private async testBasicQueries(): Promise<void> {
        console.log('\n🔍 测试基础查询功能...');

        // 测试获取所有内容
        await this.runTest('获取所有内容', async () => {
            const items = contentService.queryContent({ limit: 10 });
            return { count: items.length, firstItem: items[0]?.title };
        });

        // 测试根据类型查询
        await this.runTest('根据类型查询FAQ', async () => {
            const items = contentService.queryContent({ type: 'faq', limit: 5 });
            return { count: items.length, items: items.map(i => i.title) };
        });

        // 测试根据slug查询
        await this.runTest('根据slug查询', async () => {
            const item = contentService.getContentItemBySlug('difference-mean-median', 'faq');
            return { found: !!item, title: item?.title };
        });

        // 测试获取热门内容
        await this.runTest('获取热门内容', async () => {
            const items = contentService.getPopularContent(5);
            return { count: items.length, titles: items.map(i => i.title) };
        });

        // 测试获取最新内容
        await this.runTest('获取最新内容', async () => {
            const items = contentService.getLatestContent(5);
            return { count: items.length, titles: items.map(i => i.title) };
        });
    }

    /**
     * 测试搜索功能
     */
    private async testSearchFunctionality(): Promise<void> {
        console.log('\n🔍 测试搜索功能...');

        // 测试全文搜索
        await this.runTest('全文搜索', async () => {
            const items = contentService.searchContent('mean median');
            return { count: items.length, titles: items.map(i => i.title) };
        });

        // 测试模糊搜索
        await this.runTest('模糊搜索', async () => {
            const items = contentService.searchContent('standrd deviatin'); // 故意拼写错误
            return { count: items.length, titles: items.map(i => i.title) };
        });

        // 测试类型过滤搜索
        await this.runTest('类型过滤搜索', async () => {
            const items = contentService.queryContent({
                type: 'howto',
                tags: ['statistics'],
                limit: 5
            });
            return { count: items.length, titles: items.map(i => i.title) };
        });
    }

    /**
     * 测试关系查询
     */
    private async testRelationshipQueries(): Promise<void> {
        console.log('\n🔍 测试关系查询功能...');

        // 获取一个内容项用于测试
        const testItem = contentService.getContentItemBySlug('difference-mean-median', 'faq');
        if (!testItem) {
            console.warn('⚠️ 未找到测试内容项，跳过关系测试');
            return;
        }

        // 测试获取相关内容
        await this.runTest('获取相关内容', async () => {
            const related = contentService.getRelatedContent(testItem.id, 3);
            return { count: related.length, titles: related.map(r => r.title) };
        });

        // 测试获取How-to步骤
        await this.runTest('获取How-to步骤', async () => {
            const howtoItem = contentService.getContentItemBySlug('calculate-mean-step-by-step', 'howto');
            if (!howtoItem) return { found: false };

            const steps = contentService.getHowToSteps(howtoItem.id);
            return { found: true, stepCount: steps.length, firstStep: steps[0]?.name };
        });

        // 测试获取案例详情
        await this.runTest('获取案例详情', async () => {
            const caseItem = contentService.getContentItemBySlug('improving-gpa-strategy', 'case');
            if (!caseItem) return { found: false };

            const details = contentService.getCaseDetails(caseItem.id);
            return { found: !!details, problemLength: details?.problem?.length || 0 };
        });
    }

    /**
     * 测试内容统计
     */
    private async testContentStats(): Promise<void> {
        console.log('\n🔍 测试内容统计功能...');

        await this.runTest('获取内容统计', async () => {
            const stats = contentService.getContentStats();
            return {
                totalItems: stats.totalItems,
                byType: stats.byType,
                totalRelationships: stats.totalRelationships,
                totalSteps: stats.totalSteps
            };
        });
    }

    /**
     * 测试查询性能
     */
    private async testQueryPerformance(): Promise<void> {
        console.log('\n⚡ 测试查询性能...');

        const operations = 100;
        const times: number[] = [];

        for (let i = 0; i < operations; i++) {
            const start = performance.now();
            try {
                contentService.queryContent({ limit: 10 });
                times.push(performance.now() - start);
            } catch (error) {
                times.push(Infinity);
            }
        }

        this.recordPerformance('基础查询', times);
    }

    /**
     * 测试缓存性能
     */
    private async testCachePerformance(): Promise<void> {
        console.log('\n⚡ 测试缓存性能...');

        const operations = 100;
        const times: number[] = [];

        // 预热缓存
        cachedContentService.getPopularContent(5);

        for (let i = 0; i < operations; i++) {
            const start = performance.now();
            try {
                cachedContentService.getPopularContent(5);
                times.push(performance.now() - start);
            } catch (error) {
                times.push(Infinity);
            }
        }

        this.recordPerformance('缓存查询', times);
    }

    /**
     * 测试搜索性能
     */
    private async testSearchPerformance(): Promise<void> {
        console.log('\n⚡ 测试搜索性能...');

        const operations = 50; // 搜索操作较重，减少次数
        const times: number[] = [];

        for (let i = 0; i < operations; i++) {
            const start = performance.now();
            try {
                contentService.searchContent('mean median standard deviation');
                times.push(performance.now() - start);
            } catch (error) {
                times.push(Infinity);
            }
        }

        this.recordPerformance('全文搜索', times);
    }

    /**
     * 运行单个测试
     */
    private async runTest(name: string, testFn: () => Promise<any>): Promise<void> {
        const start = performance.now();
        let success = false;
        let data: any;
        let error: string | undefined;

        try {
            data = await testFn();
            success = true;
        } catch (err) {
            error = err instanceof Error ? err.message : String(err);
        }

        const duration = performance.now() - start;

        this.results.push({
            name,
            success,
            duration,
            error,
            data
        });

        const status = success ? '✅' : '❌';
        console.log(`  ${status} ${name} (${duration.toFixed(2)}ms)`);
    }

    /**
     * 记录性能结果
     */
    private recordPerformance(operation: string, times: number[]): void {
        const validTimes = times.filter(t => t !== Infinity);
        const successRate = (validTimes.length / times.length) * 100;

        const result: PerformanceResult = {
            operation,
            averageTime: validTimes.reduce((a, b) => a + b, 0) / validTimes.length || 0,
            minTime: Math.min(...validTimes) || 0,
            maxTime: Math.max(...validTimes) || 0,
            successRate,
            totalOperations: times.length
        };

        this.performanceResults.push(result);
    }

    /**
     * 显示测试结果
     */
    private displayResults(): void {
        console.log('\n📊 功能测试结果:');
        console.log('─'.repeat(60));

        const passed = this.results.filter(r => r.success).length;
        const total = this.results.length;

        console.log(`总计: ${passed}/${total} 测试通过 (${((passed / total) * 100).toFixed(1)}%)`);
        console.log('');

        this.results.forEach(result => {
            const status = result.success ? '✅' : '❌';
            const duration = result.duration.toFixed(2);
            const error = result.error ? ` - ${result.error}` : '';
            console.log(`${status} ${result.name} (${duration}ms)${error}`);
        });
    }

    /**
     * 显示性能结果
     */
    private displayPerformanceResults(): void {
        console.log('\n⚡ 性能测试结果:');
        console.log('─'.repeat(80));

        this.performanceResults.forEach(result => {
            console.log(`${result.operation}:`);
            console.log(`  平均时间: ${result.averageTime.toFixed(2)}ms`);
            console.log(`  最小时间: ${result.minTime.toFixed(2)}ms`);
            console.log(`  最大时间: ${result.maxTime.toFixed(2)}ms`);
            console.log(`  成功率: ${result.successRate.toFixed(1)}%`);
            console.log(`  操作次数: ${result.totalOperations}`);
            console.log('');
        });

        // 性能基准评估
        const avgQueryTime = this.performanceResults.find(r => r.operation === '基础查询')?.averageTime || 0;
        const avgCacheTime = this.performanceResults.find(r => r.operation === '缓存查询')?.averageTime || 0;
        const avgSearchTime = this.performanceResults.find(r => r.operation === '全文搜索')?.averageTime || 0;

        console.log('🎯 性能评估:');
        if (avgQueryTime < 10) {
            console.log('✅ 基础查询性能优秀 (< 10ms)');
        } else if (avgQueryTime < 50) {
            console.log('✅ 基础查询性能良好 (< 50ms)');
        } else {
            console.log('⚠️ 基础查询性能需要优化 (> 50ms)');
        }

        if (avgCacheTime < 5) {
            console.log('✅ 缓存查询性能优秀 (< 5ms)');
        } else if (avgCacheTime < 20) {
            console.log('✅ 缓存查询性能良好 (< 20ms)');
        } else {
            console.log('⚠️ 缓存查询性能需要优化 (> 20ms)');
        }

        if (avgSearchTime < 50) {
            console.log('✅ 全文搜索性能优秀 (< 50ms)');
        } else if (avgSearchTime < 200) {
            console.log('✅ 全文搜索性能良好 (< 200ms)');
        } else {
            console.log('⚠️ 全文搜索性能需要优化 (> 200ms)');
        }

        if (avgCacheTime < avgQueryTime) {
            const improvement = ((avgQueryTime - avgCacheTime) / avgQueryTime * 100).toFixed(1);
            console.log(`🚀 缓存带来 ${improvement}% 性能提升`);
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    try {
        // 预热缓存
        console.log('🔥 预热缓存...');
        await cachedContentService.warmupCache();

        // 运行测试
        const test = new ContentServiceTest();
        await test.runAllTests();

        console.log('\n🎉 内容服务测试完成！');

        // 显示缓存统计
        const cacheStats = cachedContentService.getCacheStats();
        console.log('\n📦 缓存统计:');
        console.log(`  总缓存条目: ${cacheStats.total}`);
        console.log(`  有效缓存: ${cacheStats.valid}`);
        console.log(`  过期缓存: ${cacheStats.expired}`);
        console.log(`  内存使用: ${(cacheStats.memoryUsage / 1024 / 1024).toFixed(2)} MB`);

        process.exit(0);
    } catch (error) {
        console.error('\n💥 测试过程中发生异常:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('执行过程中发生错误:', error);
        process.exit(1);
    });
}