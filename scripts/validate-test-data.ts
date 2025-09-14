#!/usr/bin/env tsx

/**
 * 测试数据验证脚本
 * 验证现有 JSON 数据的结构和完整性，为迁移做准备
 */

import fs from 'fs';
import path from 'path';

interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    stats: {
        calculators: number;
        groups: number;
        glossaryTerms: number;
        categories: Set<string>;
        topics: number;
    };
}

class DataValidator {
    private validationResults: ValidationResult = {
        isValid: true,
        errors: [],
        warnings: [],
        stats: {
            calculators: 0,
            groups: 0,
            glossaryTerms: 0,
            categories: new Set(),
            topics: 0
        }
    };

    /**
     * 验证所有数据文件
     */
    async validateAll(): Promise<ValidationResult> {
        console.log('🔍 开始验证测试数据...');

        await this.validateCalculators();
        await this.validateGlossary();
        await this.validateTopics();
        await this.validateContentIndex();

        this.generateSummary();
        return this.validationResults;
    }

    /**
     * 验证计算器数据
     */
    private async validateCalculators(): Promise<void> {
        try {
            const filePath = path.join(process.cwd(), 'data', 'calculators.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            if (!Array.isArray(data.groups)) {
                this.validationResults.errors.push('calculators.json 缺少 groups 数组');
                return;
            }

            this.validationResults.stats.groups = data.groups.length;

            for (const group of data.groups) {
                this.validateGroup(group);
            }

            console.log(`✅ 计算器数据验证完成: ${this.validationResults.stats.groups} 个分组, ${this.validationResults.stats.calculators} 个工具`);
        } catch (error) {
            this.validationResults.errors.push(`验证计算器数据失败: ${error.message}`);
            this.validationResults.isValid = false;
        }
    }

    /**
     * 验证单个分组
     */
    private validateGroup(group: any): void {
        const required = ['group_name', 'display_name', 'items'];
        for (const field of required) {
            if (!group[field]) {
                this.validationResults.errors.push(`分组缺少必需字段: ${field}`);
                this.validationResults.isValid = false;
            }
        }

        if (!Array.isArray(group.items)) {
            this.validationResults.errors.push(`分组 ${group.group_name} 缺少 items 数组`);
            this.validationResults.isValid = false;
            return;
        }

        for (const item of group.items) {
            this.validateCalculator(item);
            this.validationResults.stats.calculators++;
        }
    }

    /**
     * 验证单个计算器
     */
    private validateCalculator(calculator: any): void {
        const required = ['name', 'url', 'description'];
        for (const field of required) {
            if (!calculator[field]) {
                this.validationResults.errors.push(`计算器缺少必需字段: ${field}`);
                this.validationResults.isValid = false;
            }
        }

        if (!calculator.url.startsWith('/calculator/')) {
            this.validationResults.warnings.push(`计算器 URL 格式不规范: ${calculator.url}`);
        }

        if (typeof calculator.is_hot !== 'boolean') {
            this.validationResults.warnings.push(`计算器 is_hot 应该是布尔值: ${calculator.name}`);
        }

        if (typeof calculator.is_new !== 'boolean') {
            this.validationResults.warnings.push(`计算器 is_new 应该是布尔值: ${calculator.name}`);
        }
    }

    /**
     * 验证术语表数据
     */
    private async validateGlossary(): Promise<void> {
        try {
            const filePath = path.join(process.cwd(), 'data', 'glossary.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            if (!Array.isArray(data.terms)) {
                this.validationResults.errors.push('glossary.json 缺少 terms 数组');
                return;
            }

            this.validationResults.stats.glossaryTerms = data.terms.length;

            for (const term of data.terms) {
                this.validateTerm(term);
            }

            console.log(`✅ 术语表数据验证完成: ${this.validationResults.stats.glossaryTerms} 个术语, ${this.validationResults.stats.categories.size} 个分类`);
        } catch (error) {
            this.validationResults.errors.push(`验证术语表数据失败: ${error.message}`);
            this.validationResults.isValid = false;
        }
    }

    /**
     * 验证单个术语
     */
    private validateTerm(term: any): void {
        const required = ['slug', 'title', 'definition'];
        for (const field of required) {
            if (!term[field]) {
                this.validationResults.errors.push(`术语缺少必需字段: ${field}`);
                this.validationResults.isValid = false;
            }
        }

        if (term.categories && Array.isArray(term.categories)) {
            term.categories.forEach((cat: string) => {
                this.validationResults.stats.categories.add(cat);
            });
        }

        if (term.seeAlso && Array.isArray(term.seeAlso)) {
            term.seeAlso.forEach((related: string) => {
                if (typeof related !== 'string' || !related.trim()) {
                    this.validationResults.warnings.push(`术语 ${term.slug} 的 seeAlso 包含无效引用`);
                }
            });
        }

        if (term.relatedTools && Array.isArray(term.relatedTools)) {
            term.relatedTools.forEach((tool: string) => {
                if (!tool.startsWith('/calculator/')) {
                    this.validationResults.warnings.push(`术语 ${term.slug} 的相关工具 URL 格式不规范: ${tool}`);
                }
            });
        }
    }

    /**
     * 验证主题数据
     */
    private async validateTopics(): Promise<void> {
        try {
            const topicsDir = path.join(process.cwd(), 'data', 'topics');
            const files = fs.readdirSync(topicsDir).filter(f => f.endsWith('.json'));

            for (const file of files) {
                await this.validateTopicFile(path.join(topicsDir, file));
                this.validationResults.stats.topics++;
            }

            console.log(`✅ 主题数据验证完成: ${this.validationResults.stats.topics} 个主题文件`);
        } catch (error) {
            this.validationResults.errors.push(`验证主题数据失败: ${error.message}`);
            this.validationResults.isValid = false;
        }
    }

    /**
     * 验证主题文件
     */
    private async validateTopicFile(filePath: string): Promise<void> {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            const required = ['slug', 'title', 'guides', 'faqs'];
            for (const field of required) {
                if (!data[field]) {
                    this.validationResults.errors.push(`主题文件 ${path.basename(filePath)} 缺少必需字段: ${field}`);
                    this.validationResults.isValid = false;
                }
            }

            if (data.guides && Array.isArray(data.guides)) {
                data.guides.forEach((guide: any, index: number) => {
                    if (!guide.title || !guide.href) {
                        this.validationResults.warnings.push(`主题 ${data.slug} 的指南 ${index + 1} 缺少标题或链接`);
                    }
                });
            }

            if (data.faqs && Array.isArray(data.faqs)) {
                data.faqs.forEach((faq: any, index: number) => {
                    if (!faq.question || !faq.answer) {
                        this.validationResults.errors.push(`主题 ${data.slug} 的 FAQ ${index + 1} 缺少问题或答案`);
                        this.validationResults.isValid = false;
                    }
                });
            }
        } catch (error) {
            this.validationResults.errors.push(`验证主题文件失败 ${filePath}: ${error.message}`);
            this.validationResults.isValid = false;
        }
    }

    /**
     * 验证内容索引
     */
    private async validateContentIndex(): Promise<void> {
        try {
            const filePath = path.join(process.cwd(), 'data', 'content-index.json');
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));

            if (!data.content || !Array.isArray(data.content)) {
                this.validationResults.errors.push('content-index.json 缺少 content 数组');
                this.validationResults.isValid = false;
                return;
            }

            for (const item of data.content) {
                if (!item.type || !item.slug || !item.title) {
                    this.validationResults.errors.push('内容索引项缺少必需字段 (type, slug, title)');
                    this.validationResults.isValid = false;
                }
            }

            console.log('✅ 内容索引验证完成');
        } catch (error) {
            this.validationResults.errors.push(`验证内容索引失败: ${error.message}`);
            this.validationResults.isValid = false;
        }
    }

    /**
     * 生成验证摘要
     */
    private generateSummary(): void {
        console.log('\n📊 数据验证摘要:');
        console.log(`   分组数量: ${this.validationResults.stats.groups}`);
        console.log(`   计算器数量: ${this.validationResults.stats.calculators}`);
        console.log(`   术语数量: ${this.validationResults.stats.glossaryTerms}`);
        console.log(`   分类数量: ${this.validationResults.stats.categories.size}`);
        console.log(`   主题数量: ${this.validationResults.stats.topics}`);
        console.log(`   错误数量: ${this.validationResults.errors.length}`);
        console.log(`   警告数量: ${this.validationResults.warnings.length}`);

        if (this.validationResults.errors.length > 0) {
            console.log('\n❌ 错误列表:');
            this.validationResults.errors.forEach((error, index) => {
                console.log(`   ${index + 1}. ${error}`);
            });
        }

        if (this.validationResults.warnings.length > 0) {
            console.log('\n⚠️  警告列表:');
            this.validationResults.warnings.forEach((warning, index) => {
                console.log(`   ${index + 1}. ${warning}`);
            });
        }

        if (this.validationResults.isValid) {
            console.log('\n🎉 所有数据验证通过！可以开始迁移。');
        } else {
            console.log('\n⛔ 数据验证失败，请修复错误后再进行迁移。');
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    const validator = new DataValidator();
    const result = await validator.validateAll();

    // 将结果写入文件供后续使用
    const resultPath = path.join(process.cwd(), 'data', 'validation-result.json');
    fs.writeFileSync(resultPath, JSON.stringify(result, null, 2));

    process.exit(result.isValid ? 0 : 1);
}

// 如果直接运行此脚本
if (require.main === module) {
    main().catch(error => {
        console.error('验证过程中发生错误:', error);
        process.exit(1);
    });
}

export { DataValidator, ValidationResult };