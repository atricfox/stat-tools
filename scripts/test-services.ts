#!/usr/bin/env tsx

/**
 * 服务层测试脚本
 * 测试所有数据服务的功能
 */

import { services } from '../src/lib/services';

async function testServices() {
    console.log('🧪 开始测试数据服务...\n');

    try {
        // 测试计算器服务
        console.log('📊 测试计算器服务...');
        const calculatorsStats = await services.calculators.getStatistics();
        console.log(`   ✅ 计算器统计: ${calculatorsStats.totalCalculators} 个计算器, ${calculatorsStats.totalGroups} 个分组`);

        const hotCalculators = await services.calculators.getHotCalculators(3);
        console.log(`   ✅ 热门计算器: ${hotCalculators.map(c => c.name).join(', ')}`);

        // 测试术语表服务
        console.log('\n📚 测试术语表服务...');
        const glossaryStats = await services.glossary.getStatistics();
        console.log(`   ✅ 术语表统计: ${glossaryStats.totalTerms} 个术语, ${glossaryStats.totalCategories} 个分类`);

        const letters = await services.glossary.getFirstLetters();
        console.log(`   ✅ 首字母索引: ${letters.map(l => l.letter).join(', ')}`);

        // 测试内容服务
        console.log('\n📝 测试内容服务...');
        const contentStats = await services.content.getStatistics();
        console.log(`   ✅ 内容统计: ${contentStats.totalItems} 个内容项, ${contentStats.totalTypes} 个类型`);

        const faqs = await services.content.getFAQs({ pageSize: 3 });
        console.log(`   ✅ FAQ示例: ${faqs.items.slice(0, 2).map(f => f.title).join(', ')}`);

        // 测试主题服务
        console.log('\n🎯 测试主题服务...');
        const topicsStats = await services.topics.getStatistics();
        console.log(`   ✅ 主题统计: ${topicsStats.totalTopics} 个主题, ${topicsStats.totalGuides} 个指南`);

        const topics = await services.topics.getTopics({ pageSize: 3 });
        console.log(`   ✅ 主题示例: ${topics.topics.map(t => t.title).join(', ')}`);

        // 测试服务健康检查
        console.log('\n🏥 测试服务健康检查...');
        const health = await services.manager.healthCheck();
        console.log(`   ✅ 整体状态: ${health.status}`);
        Object.entries(health.services).forEach(([name, status]) => {
            console.log(`   ✅ ${name}: ${status.status}`);
        });

        // 测试缓存功能
        console.log('\n💾 测试缓存功能...');
        const firstCall = await services.calculators.getGroups();
        console.log(`   ✅ 首次调用获取了 ${firstCall.length} 个分组`);

        const secondCall = await services.calculators.getGroups(); // 应该从缓存获取
        console.log(`   ✅ 缓存调用获取了 ${secondCall.length} 个分组`);

        // 测试搜索功能
        console.log('\n🔍 测试搜索功能...');
        const searchResults = await services.calculators.searchCalculators('GPA', 3);
        console.log(`   ✅ 搜索"GPA"找到 ${searchResults.length} 个结果`);

        const glossarySearch = await services.glossary.searchTerms('standard', 3);
        console.log(`   ✅ 搜索术语"standard"找到 ${glossarySearch.length} 个结果`);

        const contentSearch = await services.content.searchContent('calculate', 3);
        console.log(`   ✅ 搜索内容"calculate"找到 ${contentSearch.length} 个结果`);

        // 获取所有统计信息
        console.log('\n📈 获取所有统计信息...');
        const allStats = await services.manager.getAllStatistics();
        console.log(`   ✅ 数据统计时间: ${allStats.timestamp}`);
        console.log(`   ✅ 计算器: ${allStats.calculators?.totalCalculators || 0} 个`);
        console.log(`   ✅ 术语: ${allStats.glossary?.totalTerms || 0} 个`);
        console.log(`   ✅ 内容: ${allStats.content?.totalItems || 0} 个`);
        console.log(`   ✅ 主题: ${allStats.topics?.totalTopics || 0} 个`);

        console.log('\n🎉 所有服务测试通过！');

    } catch (error) {
        console.error('\n❌ 服务测试失败:', error);
        process.exit(1);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    testServices().catch(error => {
        console.error('测试过程中发生错误:', error);
        process.exit(1);
    });
}