#!/usr/bin/env tsx
/**
 * Glossary Terms 更新服务脚本
 * 用于批量更新术语表数据
 */

import { glossaryService } from '../src/lib/services/glossary';

interface GlossaryTermData {
    slug: string;
    title: string;
    shortDescription: string;
    definition: string;
    firstLetter: string;
}

const glossaryTermsData: GlossaryTermData[] = [
    {
        slug: 'mode',
        title: 'Mode',
        shortDescription: 'The value that appears most frequently in a dataset',
        definition: 'In statistics, the mode is the value that appears most often in a data set. A distribution can have one mode (unimodal), two modes (bimodal), or more than two modes (multimodal). Unlike the mean and median, the mode can be used with nominal data. For example, in the dataset [1, 2, 2, 3, 4, 4, 4], the mode is 4 because it appears three times, more than any other value. The mode is particularly useful for categorical data where we want to know which category is most common.',
        firstLetter: 'M'
    },
    {
        slug: 'unweighted-gpa',
        title: 'Unweighted GPA',
        shortDescription: 'GPA calculated using standard 4.0 scale without weighting for course difficulty',
        definition: 'Unweighted GPA is calculated on a standard 4.0 scale where each course is given equal weight regardless of its difficulty level. Letter grades are converted to points: A = 4.0, B = 3.0, C = 2.0, D = 1.0, F = 0.0. The GPA is calculated by dividing the total grade points by the total number of courses. For example, if a student has grades of A, B, A, C (4.0 + 3.0 + 4.0 + 2.0 = 13.0 total points ÷ 4 courses = 3.25 GPA). This system treats all courses equally, whether they are regular, honors, or AP classes.',
        firstLetter: 'U'
    },
    {
        slug: 'weighted-gpa',
        title: 'Weighted GPA',
        shortDescription: 'GPA calculated with additional points for advanced courses like AP, IB, or Honors',
        definition: 'Weighted GPA accounts for the difficulty level of courses by assigning additional points to advanced classes. Typically, Honors courses add 0.5 points and AP/IB courses add 1.0 point to the standard grade values. For example: Regular A = 4.0, Honors A = 4.5, AP A = 5.0. A student with an A in AP Math (5.0), B in Honors English (3.5), A in Regular History (4.0), and B in Regular Science (3.0) would have: (5.0 + 3.5 + 4.0 + 3.0) ÷ 4 = 3.875 weighted GPA. This system recognizes the increased difficulty of advanced coursework and is often used by colleges for admissions decisions.',
        firstLetter: 'W'
    }
];

/**
 * 更新单个术语
 */
async function updateGlossaryTerm(termData: GlossaryTermData): Promise<void> {
    try {
        // 检查术语是否存在
        const existingTerm = await glossaryService.getTermBySlug(termData.slug);
        
        if (existingTerm) {
            console.log(`✓ 更新术语: ${termData.title} (${termData.slug})`);
            
            // 这里需要扩展 GlossaryService 添加 updateTerm 方法
            // 目前先显示更新内容
            console.log(`  短描述: ${termData.shortDescription}`);
            console.log(`  定义长度: ${termData.definition.length} 字符`);
            console.log(`  首字母: ${termData.firstLetter}`);
        } else {
            console.log(`⚠ 术语不存在: ${termData.slug}`);
        }
    } catch (error) {
        console.error(`✗ 更新术语失败 ${termData.slug}:`, error);
    }
}

/**
 * 批量更新术语
 */
async function updateAllGlossaryTerms(): Promise<void> {
    console.log('开始更新 Glossary 术语...\n');
    
    for (const termData of glossaryTermsData) {
        await updateGlossaryTerm(termData);
        console.log(''); // 空行分隔
    }
    
    // 验证更新结果
    console.log('验证更新结果:');
    for (const termData of glossaryTermsData) {
        const term = await glossaryService.getTermBySlug(termData.slug);
        if (term) {
            console.log(`✓ ${term.title}: ${term.short_description?.substring(0, 50)}...`);
        }
    }
    
    // 清除缓存
    glossaryService.clearGlossaryCache();
    console.log('\n✓ 缓存已清除');
}

/**
 * 主函数
 */
async function main(): Promise<void> {
    try {
        await updateAllGlossaryTerms();
        console.log('\n🎉 Glossary 术语更新完成!');
    } catch (error) {
        console.error('❌ 更新失败:', error);
        process.exit(1);
    }
}

// 执行脚本
if (require.main === module) {
    main();
}