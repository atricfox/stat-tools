#!/usr/bin/env tsx
/**
 * 测试 Glossary API 端点脚本
 */

import { glossaryService } from '../src/lib/services/glossary';

async function testGlossaryTerms(): Promise<void> {
    console.log('🧪 测试 Glossary API 端点...\n');

    const testTerms = ['mode', 'unweighted-gpa', 'weighted-gpa'];

    for (const slug of testTerms) {
        try {
            console.log(`📖 测试术语: ${slug}`);
            
            // 测试通过 slug 获取术语
            const term = await glossaryService.getTermBySlug(slug);
            
            if (term) {
                console.log(`✓ ID: ${term.id}`);
                console.log(`✓ 标题: ${term.title}`);
                console.log(`✓ 短描述: ${term.short_description}`);
                console.log(`✓ 定义长度: ${term.definition.length} 字符`);
                console.log(`✓ 首字母: ${term.first_letter}`);
                console.log(`✓ 分类数量: ${term.categories?.length || 0}`);
                
                // 测试搜索功能
                const searchResults = await glossaryService.searchTerms(term.title);
                console.log(`✓ 搜索结果: ${searchResults.length} 个匹配项`);
                
            } else {
                console.log(`❌ 术语未找到: ${slug}`);
            }
            
            console.log(''); // 空行
            
        } catch (error) {
            console.error(`❌ 测试失败 ${slug}:`, error);
        }
    }

    // 测试获取所有术语
    try {
        console.log('📋 测试获取所有术语...');
        const allTerms = await glossaryService.getTerms({ pageSize: 50 });
        console.log(`✓ 总术语数: ${allTerms.total}`);
        console.log(`✓ 当前页术语数: ${allTerms.terms.length}`);
        console.log(`✓ 分类数: ${allTerms.categories.length}`);
    } catch (error) {
        console.error('❌ 获取所有术语失败:', error);
    }

    // 测试统计信息
    try {
        console.log('\n📊 测试统计信息...');
        const stats = await glossaryService.getStatistics();
        console.log(`✓ 总术语数: ${stats.totalTerms}`);
        console.log(`✓ 总分类数: ${stats.totalCategories}`);
        console.log(`✓ 总关系数: ${stats.totalRelationships}`);
        console.log(`✓ 字母分布: ${stats.letterCounts.length} 个字母`);
    } catch (error) {
        console.error('❌ 获取统计信息失败:', error);
    }
}

async function main(): Promise<void> {
    try {
        await testGlossaryTerms();
        console.log('\n🎉 Glossary API 测试完成!');
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 执行测试
if (require.main === module) {
    main();
}