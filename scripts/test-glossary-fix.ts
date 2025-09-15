#!/usr/bin/env tsx
/**
 * 测试 Glossary FTS 修复
 */

import { glossaryService } from '../src/lib/services/glossary';

async function testGlossaryFix(): Promise<void> {
    console.log('🧪 测试 Glossary FTS 修复...\n');

    const testSlugs = ['mode', 'unweighted-gpa', 'weighted-gpa'];

    for (const slug of testSlugs) {
        try {
            console.log(`📖 测试术语: ${slug}`);
            
            // 测试直接通过 slug 获取
            const term = await glossaryService.getTermBySlug(slug);
            
            if (term) {
                console.log(`✓ 直接查询成功: ${term.title}`);
            } else {
                console.log(`❌ 直接查询失败: ${slug}`);
            }
            
            // 测试搜索功能
            const searchResults = await glossaryService.searchTerms(slug);
            console.log(`✓ 搜索结果: ${searchResults.length} 个匹配项`);
            
            console.log(''); // 空行
            
        } catch (error) {
            console.error(`❌ 测试失败 ${slug}:`, error);
        }
    }

    // 测试带连字符的搜索
    try {
        console.log('🔍 测试特殊字符搜索...');
        const searchResults = await glossaryService.getTerms({ search: 'weighted-gpa' });
        console.log(`✓ "weighted-gpa" 搜索结果: ${searchResults.terms.length} 个匹配项`);
        
        const searchResults2 = await glossaryService.searchTerms('unweighted-gpa');
        console.log(`✓ "unweighted-gpa" 搜索结果: ${searchResults2.length} 个匹配项`);
        
    } catch (error) {
        console.error('❌ 特殊字符搜索失败:', error);
    }
}

async function main(): Promise<void> {
    try {
        await testGlossaryFix();
        console.log('\n🎉 Glossary FTS 修复测试完成!');
    } catch (error) {
        console.error('❌ 测试失败:', error);
        process.exit(1);
    }
}

// 执行测试
if (require.main === module) {
    main();
}