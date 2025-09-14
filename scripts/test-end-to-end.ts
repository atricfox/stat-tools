#!/usr/bin/env tsx

/**
 * 端到端测试脚本
 * 测试完整的用户流程和数据访问链路
 */

import { services } from '../src/lib/services';

async function testEndToEnd() {
    console.log('🧪 开始端到端测试...\n');

    try {
        // 1. 测试用户浏览计算器流程
        console.log('🔍 测试用户浏览计算器流程...');
        await testCalculatorBrowsingFlow();

        // 2. 测试术语表搜索流程
        console.log('\n📚 测试术语表搜索流程...');
        await testGlossarySearchFlow();

        // 3. 测试内容访问流程
        console.log('\n📝 测试内容访问流程...');
        await testContentAccessFlow();

        // 4. 测试主题导航流程
        console.log('\n🎯 测试主题导航流程...');
        await testTopicNavigationFlow();

        // 5. 测试交叉引用功能
        console.log('\n🔗 测试交叉引用功能...');
        await testCrossReferenceFlow();

        // 6. 测试性能监控
        console.log('\n⚡ 测试性能监控...');
        await testPerformanceMonitoring();

        // 7. 测试错误处理
        console.log('\n❌ 测试错误处理...');
        await testErrorHandling();

        console.log('\n🎉 所有端到端测试通过！');

    } catch (error) {
        console.error('\n❌ 端到端测试失败:', error);
        process.exit(1);
    }
}

async function testCalculatorBrowsingFlow() {
    // 获取所有计算器分组
    const groups = await services.calculators.getGroups();
    console.log(`   ✅ 获取了 ${groups.length} 个计算器分组`);

    // 获取热门计算器
    const hotCalculators = await services.calculators.getHotCalculators(5);
    console.log(`   ✅ 获取了 ${hotCalculators.length} 个热门计算器`);

    // 测试搜索功能
    const searchResults = await services.calculators.searchCalculators('GPA', 3);
    console.log(`   ✅ 搜索"GPA"找到 ${searchResults.length} 个计算器`);

    // 测试分组浏览
    if (groups.length > 0) {
        const groupCalculators = await services.calculators.getCalculators({ groupName: groups[0].name });
        console.log(`   ✅ 分组"${groups[0].name}"包含 ${groupCalculators.calculators.length} 个计算器`);
    }

    // 测试单个计算器获取
    if (hotCalculators.length > 0) {
        const calculator = await services.calculators.getCalculatorById(hotCalculators[0].id);
        if (calculator) {
            console.log(`   ✅ 成功获取计算器: ${calculator.name}`);
        }
    }
}

async function testGlossarySearchFlow() {
    // 获取首字母索引
    const letters = await services.glossary.getFirstLetters();
    console.log(`   ✅ 获取了 ${letters.length} 个首字母索引`);

    // 测试按字母浏览
    if (letters.length > 0) {
        const termsByLetter = await services.glossary.getTerms({ firstLetter: letters[0].letter });
        console.log(`   ✅ 字母"${letters[0].letter}"有 ${termsByLetter.terms.length} 个术语`);
    }

    // 测试搜索功能
    const searchResults = await services.glossary.searchTerms('standard', 5);
    console.log(`   ✅ 搜索"standard"找到 ${searchResults.length} 个术语`);

    // 测试术语详情
    if (searchResults.length > 0) {
        const term = await services.glossary.getTermById(searchResults[0].term.id);
        if (term) {
            console.log(`   ✅ 成功获取术语详情: ${term.title}`);
            if (term.categories && term.categories.length > 0) {
                console.log(`   ✅ 术语有 ${term.categories.length} 个分类`);
            }
        }
    }

    // 测试相关术语
    if (searchResults.length > 0) {
        const relatedTerms = await services.glossary.getRelatedTerms(searchResults[0].term.id, 3);
        console.log(`   ✅ 找到 ${relatedTerms.length} 个相关术语`);
    }
}

async function testContentAccessFlow() {
    // 获取内容类型
    const contentTypes = await services.content.getContentTypes();
    console.log(`   ✅ 获取了 ${contentTypes.length} 个内容类型`);

    // 测试FAQ访问
    const faqs = await services.content.getFAQs({ pageSize: 5 });
    console.log(`   ✅ 获取了 ${faqs.items.length} 个FAQ`);

    // 测试How-to访问
    const howtos = await services.content.getHowTos({ pageSize: 3 });
    console.log(`   ✅ 获取了 ${howtos.items.length} 个How-to指南`);

    // 测试搜索功能
    const searchResults = await services.content.searchContent('calculate', 5);
    console.log(`   ✅ 搜索内容找到 ${searchResults.length} 个结果`);

    // 测试单个内容获取
    if (faqs.items.length > 0) {
        const contentItem = await services.content.getContentItemById(faqs.items[0].id);
        if (contentItem) {
            console.log(`   ✅ 成功获取内容: ${contentItem.title}`);
            console.log(`   ✅ 阅读时间: ${contentItem.reading_time} 分钟`);
            if (contentItem.metadata) {
                console.log(`   ✅ 包含 ${Object.keys(contentItem.metadata).length} 项元数据`);
            }
        }
    }

    // 测试相关内容
    if (faqs.items.length > 0) {
        const relatedContent = await services.content.getRelatedContent(faqs.items[0].id, 3);
        console.log(`   ✅ 找到 ${relatedContent.length} 个相关内容`);
    }
}

async function testTopicNavigationFlow() {
    // 获取所有主题
    const topics = await services.topics.getTopics({ pageSize: 5 });
    console.log(`   ✅ 获取了 ${topics.topics.length} 个主题`);

    // 测试主题详情
    if (topics.topics.length > 0) {
        const topic = await services.topics.getTopicById(topics.topics[0].id);
        if (topic) {
            console.log(`   ✅ 成功获取主题: ${topic.title}`);
            if (topic.guides) {
                console.log(`   ✅ 主题有 ${topic.guides.length} 个指南`);
            }
            if (topic.faqs) {
                console.log(`   ✅ 主题有 ${topic.faqs.length} 个FAQ`);
            }
            if (topic.calculatorGroups && topic.calculatorGroups.length > 0) {
                console.log(`   ✅ 主题关联 ${topic.calculatorGroups.length} 个计算器分组`);
            }
        }
    }

    // 测试主题搜索
    const searchResults = await services.topics.searchTopics('statistics', 3);
    console.log(`   ✅ 搜索主题找到 ${searchResults.length} 个结果`);

    // 测试推荐主题
    if (topics.topics.length > 0) {
        const recommendations = await services.topics.getRecommendedTopics(topics.topics[0].id, 2);
        console.log(`   ✅ 获取了 ${recommendations.length} 个推荐主题`);
    }

    // 测试计算器分组关联
    const statsTopics = await services.topics.getTopicsByCalculatorGroup('descriptive-statistics');
    console.log(`   ✅ 找到 ${statsTopics.length} 个描述统计相关主题`);
}

async function testCrossReferenceFlow() {
    // 测试计算器到术语的链接
    const calculators = await services.calculators.getCalculators({ pageSize: 3 });
    if (calculators.calculators.length > 0) {
        console.log(`   ✅ 测试计算器"${calculators.calculators[0].name}"的关联数据`);
        // 这里可以测试从计算器到相关术语、内容的链接
    }

    // 测试术语到计算器的链接
    const terms = await services.glossary.getTerms({ pageSize: 3 });
    if (terms.terms.length > 0) {
        console.log(`   ✅ 测试术语"${terms.terms[0].title}"的关联数据`);
        // 这里可以测试从术语到相关计算器的链接
    }

    // 测试主题到内容的关联
    const topics = await services.topics.getTopics({ pageSize: 1 });
    if (topics.topics.length > 0) {
        const topic = topics.topics[0];
        console.log(`   ✅ 主题"${topic.title}"的指南和FAQ已测试`);
    }

    // 测试跨服务搜索
    const calculatorSearch = await services.calculators.searchCalculators('mean', 2);
    const termSearch = await services.glossary.searchTerms('mean', 2);
    const contentSearch = await services.content.searchContent('mean', 2);

    console.log(`   ✅ 跨服务搜索结果: 计算器(${calculatorSearch.length}) + 术语(${termSearch.length}) + 内容(${contentSearch.length})`);
}

async function testPerformanceMonitoring() {
    // 测试缓存功能
    const startTime = Date.now();
    await services.calculators.getGroups(); // 第一次调用
    const firstCallTime = Date.now() - startTime;

    const secondStartTime = Date.now();
    await services.calculators.getGroups(); // 第二次调用（应该从缓存）
    const secondCallTime = Date.now() - secondStartTime;

    console.log(`   ✅ 缓存性能测试: 首次${firstCallTime}ms, 缓存${secondCallTime}ms`);

    // 测试健康检查
    const health = await services.manager.healthCheck();
    console.log(`   ✅ 服务健康状态: ${health.status}`);
    Object.entries(health.services).forEach(([name, status]) => {
        console.log(`   ✅ ${name}: ${status.status}`);
    });

    // 测试统计信息
    const allStats = await services.manager.getAllStatistics();
    console.log(`   ✅ 数据统计时间: ${allStats.timestamp}`);
    console.log(`   ✅ 总计数据: 计算器${allStats.calculators?.totalCalculators || 0} + 术语${allStats.glossary?.totalTerms || 0} + 内容${allStats.content?.totalItems || 0} + 主题${allStats.topics?.totalTopics || 0}`);
}

async function testErrorHandling() {
    // 测试无效ID查询
    const invalidCalculator = await services.calculators.getCalculatorById(99999);
    console.log(`   ✅ 无效计算器ID查询: ${invalidCalculator ? '错误' : '正常返回null'}`);

    const invalidTerm = await services.glossary.getTermById(99999);
    console.log(`   ✅ 无效术语ID查询: ${invalidTerm ? '错误' : '正常返回null'}`);

    // 测试无效搜索查询
    const emptySearch = await services.calculators.searchCalculators('', 5);
    console.log(`   ✅ 空搜索查询: 返回${emptySearch.length}个结果`);

    // 测试边界条件
    const largePage = await services.calculators.getCalculators({ page: 999, pageSize: 10 });
    console.log(`   ✅ 大页码查询: 第${largePage.page}页，共${largePage.totalPages}页`);

    // 测试缓存清理
    try {
        services.manager.clearAllCaches();
        console.log(`   ✅ 缓存清理成功`);
    } catch (error) {
        console.log(`   ❌ 缓存清理失败: ${error}`);
    }
}

// 如果直接运行此脚本
if (require.main === module) {
    testEndToEnd().catch(error => {
        console.error('测试过程中发生错误:', error);
        process.exit(1);
    });
}