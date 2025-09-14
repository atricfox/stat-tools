#!/usr/bin/env tsx

/**
 * 性能对比测试脚本
 * 对比优化前后的数据库性能差异
 */

import { services } from '../src/lib/services';

class PerformanceComparator {
    private results: Map<string, number[]> = new Map();

    /**
     * 测量函数执行时间
     */
    private async measureTime<T>(name: string, fn: () => Promise<T>): Promise<T> {
        const start = Date.now();
        const result = await fn();
        const end = Date.now();
        const duration = end - start;

        if (!this.results.has(name)) {
            this.results.set(name, []);
        }
        this.results.get(name)!.push(duration);

        console.log(`   ${name}: ${duration}ms`);
        return result;
    }

    /**
     * 执行多次测量获取平均值
     */
    private async getAverageTime(name: string, fn: () => Promise<any>, iterations = 5): Promise<number> {
        const times: number[] = [];

        console.log(`\n📊 测试 ${name} (${iterations} 次平均):`);

        for (let i = 0; i < iterations; i++) {
            const start = Date.now();
            await fn();
            const end = Date.now();
            times.push(end - start);
        }

        const average = times.reduce((sum, time) => sum + time, 0) / times.length;
        console.log(`   平均: ${average.toFixed(2)}ms (最快: ${Math.min(...times)}ms, 最慢: ${Math.max(...times)}ms)`);

        return average;
    }

    /**
     * 测试计算器服务性能
     */
    async testCalculatorsPerformance() {
        console.log('🔧 测试计算器服务性能...');

        // 测试分组获取性能
        await this.getAverageTime('获取计算器分组', () => services.calculators.getGroups());

        // 测试热门计算器获取性能
        await this.getAverageTime('获取热门计算器', () => services.calculators.getHotCalculators(6));

        // 测试搜索性能
        await this.getAverageTime('搜索计算器(GPA)', () => services.calculators.searchCalculators('GPA', 5));

        // 测试列表获取性能
        await this.getAverageTime('获取计算器列表(分页)', () => services.calculators.getCalculators({ page: 1, pageSize: 10 }));

        // 测试单个计算器获取性能
        await this.measureTime('获取单个计算器(首次)', async () => {
            const calculators = await services.calculators.getCalculators({ pageSize: 1 });
            if (calculators.calculators.length > 0) {
                return await services.calculators.getCalculatorById(calculators.calculators[0].id);
            }
            return null;
        });

        // 测试缓存性能
        await this.measureTime('获取单个计算器(缓存)', async () => {
            const calculators = await services.calculators.getCalculators({ pageSize: 1 });
            if (calculators.calculators.length > 0) {
                return await services.calculators.getCalculatorById(calculators.calculators[0].id);
            }
            return null;
        });
    }

    /**
     * 测试术语表服务性能
     */
    async testGlossaryPerformance() {
        console.log('\n📚 测试术语表服务性能...');

        // 测试首字母索引性能
        await this.getAverageTime('获取首字母索引', () => services.glossary.getFirstLetters());

        // 测试术语获取性能
        await this.getAverageTime('获取术语列表', () => services.glossary.getTerms({ pageSize: 10 }));

        // 测试FTS搜索性能
        await this.getAverageTime('FTS搜索术语(standard)', () => services.glossary.searchTerms('standard', 5));

        // 测试分类过滤性能
        await this.getAverageTime('按分类过滤术语', async () => {
            const categories = await services.glossary.getCategories();
            if (categories.length > 0) {
                return await services.glossary.getTerms({ categoryId: categories[0].id });
            }
            return null;
        });

        // 测试相关术语获取性能
        await this.measureTime('获取相关术语(首次)', async () => {
            const terms = await services.glossary.getTerms({ pageSize: 1 });
            if (terms.terms.length > 0) {
                return await services.glossary.getRelatedTerms(terms.terms[0].id, 3);
            }
            return [];
        });

        await this.measureTime('获取相关术语(缓存)', async () => {
            const terms = await services.glossary.getTerms({ pageSize: 1 });
            if (terms.terms.length > 0) {
                return await services.glossary.getRelatedTerms(terms.terms[0].id, 3);
            }
            return [];
        });
    }

    /**
     * 测试内容服务性能
     */
    async testContentPerformance() {
        console.log('\n📝 测试内容服务性能...');

        // 测试内容类型获取性能
        await this.getAverageTime('获取内容类型', () => services.content.getContentTypes());

        // 测试FAQ获取性能
        await this.getAverageTime('获取FAQ列表', () => services.content.getFAQs({ pageSize: 10 }));

        // 测试How-to获取性能
        await this.getAverageTime('获取How-to列表', () => services.content.getHowTos({ pageSize: 5 }));

        // 测试内容搜索性能
        await this.getAverageTime('搜索内容(calculate)', () => services.content.searchContent('calculate', 5));

        // 测试单个内容获取性能
        await this.measureTime('获取单个内容(首次)', async () => {
            const faqs = await services.content.getFAQs({ pageSize: 1 });
            if (faqs.items.length > 0) {
                return await services.content.getContentItemById(faqs.items[0].id);
            }
            return null;
        });

        await this.measureTime('获取单个内容(缓存)', async () => {
            const faqs = await services.content.getFAQs({ pageSize: 1 });
            if (faqs.items.length > 0) {
                return await services.content.getContentItemById(faqs.items[0].id);
            }
            return null;
        });
    }

    /**
     * 测试主题服务性能
     */
    async testTopicsPerformance() {
        console.log('\n🎯 测试主题服务性能...');

        // 测试主题获取性能
        await this.getAverageTime('获取主题列表', () => services.topics.getTopics({ pageSize: 10 }));

        // 测试主题搜索性能
        await this.getAverageTime('搜索主题(statistics)', () => services.topics.searchTopics('statistics', 3));

        // 测试主题详情获取性能
        await this.measureTime('获取主题详情(首次)', async () => {
            const topics = await services.topics.getTopics({ pageSize: 1 });
            if (topics.topics.length > 0) {
                return await services.topics.getTopicById(topics.topics[0].id);
            }
            return null;
        });

        await this.measureTime('获取主题详情(缓存)', async () => {
            const topics = await services.topics.getTopics({ pageSize: 1 });
            if (topics.topics.length > 0) {
                return await services.topics.getTopicById(topics.topics[0].id);
            }
            return null;
        });

        // 测试推荐主题获取性能
        await this.getAverageTime('获取推荐主题', async () => {
            const topics = await services.topics.getTopics({ pageSize: 1 });
            if (topics.topics.length > 0) {
                return await services.topics.getRecommendedTopics(topics.topics[0].id, 3);
            }
            return [];
        });
    }

    /**
     * 测试跨服务集成性能
     */
    async testCrossServicePerformance() {
        console.log('\n🔗 测试跨服务集成性能...');

        // 测试健康检查性能
        await this.getAverageTime('服务健康检查', () => services.manager.healthCheck());

        // 测试全量统计获取性能
        await this.getAverageTime('获取全量统计', () => services.manager.getAllStatistics());

        // 测试缓存清理性能
        await this.getAverageTime('缓存清理', () => {
            services.manager.clearAllCaches();
            return Promise.resolve();
        });
    }

    /**
     * 生成性能报告
     */
    generateReport() {
        console.log('\n📋 性能对比报告\n');

        console.log('📊 各项操作平均响应时间:');
        const sortedResults = Array.from(this.results.entries())
            .sort(([,a], [,b]) => {
                const avgA = a.reduce((sum, time) => sum + time, 0) / a.length;
                const avgB = b.reduce((sum, time) => sum + time, 0) / b.length;
                return avgA - avgB;
            });

        sortedResults.forEach(([name, times]) => {
            const average = times.reduce((sum, time) => sum + time, 0) / times.length;
            const min = Math.min(...times);
            const max = Math.max(...times);
            console.log(`   ${name}:`);
            console.log(`     平均: ${average.toFixed(2)}ms`);
            console.log(`     范围: ${min}ms - ${max}ms`);
            console.log(`     样本数: ${times.length}`);
            console.log();
        });

        console.log('⚡ 性能优化建议:');

        // 分析缓存效果
        const cacheTests = [
            ['获取单个计算器(首次)', '获取单个计算器(缓存)'],
            ['获取相关术语(首次)', '获取相关术语(缓存)'],
            ['获取单个内容(首次)', '获取单个内容(缓存)'],
            ['获取主题详情(首次)', '获取主题详情(缓存)']
        ];

        cacheTests.forEach(([first, cached]) => {
            const firstTimes = this.results.get(first);
            const cachedTimes = this.results.get(cached);

            if (firstTimes && cachedTimes) {
                const firstAvg = firstTimes.reduce((sum, time) => sum + time, 0) / firstTimes.length;
                const cachedAvg = cachedTimes.reduce((sum, time) => sum + time, 0) / cachedTimes.length;
                const improvement = ((firstAvg - cachedAvg) / firstAvg) * 100;

                console.log(`   ${cached} 缓存提升: ${improvement.toFixed(1)}%`);
            }
        });

        console.log('\n✅ 性能测试完成！');
    }

    /**
     * 执行完整性能对比测试
     */
    async runComparison(): Promise<void> {
        try {
            console.log('🚀 开始性能对比测试...\n');

            // 清理缓存以确保公平测试
            services.manager.clearAllCaches();
            console.log('🧹 已清理所有缓存\n');

            await this.testCalculatorsPerformance();
            await this.testGlossaryPerformance();
            await this.testContentPerformance();
            await this.testTopicsPerformance();
            await this.testCrossServicePerformance();

            this.generateReport();

        } catch (error) {
            console.error('\n❌ 性能测试失败:', error);
            throw error;
        }
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    const comparator = new PerformanceComparator();
    comparator.runComparison().catch(error => {
        console.error('性能测试过程中发生错误:', error);
        process.exit(1);
    });
}

export { PerformanceComparator };