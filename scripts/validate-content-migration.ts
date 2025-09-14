#!/usr/bin/env node

/**
 * Content Migration Validation Script
 * 验证内容迁移的完整性和数据质量
 */

import Database from 'better-sqlite3';
import path from 'path';

interface ValidationResult {
    success: boolean;
    contentCount: number;
    relationshipsCount: number;
    stepsCount: number;
    errors: string[];
    warnings: string[];
    performance: {
        queryTimes: number[];
        averageTime: number;
        maxTime: number;
        minTime: number;
    };
}

class ContentMigrationValidator {
    private db: Database.Database;

    constructor() {
        const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
        this.db = new Database(dbPath);
        this.db.pragma('foreign_keys = ON');
    }

    async validateMigration(): Promise<ValidationResult> {
        console.log('🔍 开始验证内容迁移...\n');

        const result: ValidationResult = {
            success: true,
            contentCount: 0,
            relationshipsCount: 0,
            stepsCount: 0,
            errors: [],
            warnings: [],
            performance: {
                queryTimes: [],
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity
            }
        };

        // 基础数据验证
        await this.validateBasicData(result);

        // 内容质量验证
        await this.validateContentQuality(result);

        // 关系完整性验证
        await this.validateRelationshipIntegrity(result);

        // 性能验证
        await this.validatePerformance(result);

  
        // 生成验证报告
        this.generateValidationReport(result);

        return result;
    }

    private async validateBasicData(result: ValidationResult): Promise<void> {
        console.log('📊 验证基础数据...');

        // 验证内容项
        const start = Date.now();
        const contentCount = this.db.prepare('SELECT COUNT(*) as count FROM content_items').get() as any;
        const queryTime = Date.now() - start;
        this.updatePerformanceMetrics(result, queryTime);

        result.contentCount = contentCount.count;
        console.log(`  ✓ 内容项总数: ${contentCount.count}`);

        if (contentCount.count === 0) {
            result.errors.push('没有找到任何内容项');
            result.success = false;
            return;
        }

        // 按类型统计
        const typeStats = this.db.prepare(`
            SELECT ct.type_name as type, COUNT(ci.id) as count
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            GROUP BY ct.type_name
        `).all() as any[];

        console.log('  按类型分布:');
        for (const stat of typeStats) {
            console.log(`    ${stat.type}: ${stat.count} 项`);
        }

        // 验证关系数据
        const relationships = [
            { table: 'content_relationships', field: 'relationshipsCount' }
        ];

        for (const rel of relationships) {
            const start = Date.now();
            const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${rel.table}`).get() as any;
            const queryTime = Date.now() - start;
            this.updatePerformanceMetrics(result, queryTime);

            result[rel.field] = count.count;
            console.log(`  ✓ ${rel.table}: ${count.count} 条关系`);
        }

        // 验证扩展数据
        const extensions = [
            { table: 'howto_steps', field: 'stepsCount' }
        ];

        for (const ext of extensions) {
            const start = Date.now();
            const count = this.db.prepare(`SELECT COUNT(*) as count FROM ${ext.table}`).get() as any;
            const queryTime = Date.now() - start;
            this.updatePerformanceMetrics(result, queryTime);

            result[ext.field] = count.count;
            console.log(`  ✓ ${ext.table}: ${count.count} 条记录`);
        }
    }

    private async validateContentQuality(result: ValidationResult): Promise<void> {
        console.log('\n🔍 验证内容质量...');

        // 检查必需字段
        const requiredFields = ['slug', 'title', 'type_id'];
        for (const field of requiredFields) {
            const start = Date.now();
            const nullCount = this.db.prepare(`
                SELECT COUNT(*) as count
                FROM content_items
                WHERE ${field} IS NULL OR ${field} = ''
            `).get() as any;
            const queryTime = Date.now() - start;
            this.updatePerformanceMetrics(result, queryTime);

            if (nullCount.count > 0) {
                result.errors.push(`发现 ${nullCount.count} 个内容项缺少 ${field} 字段`);
                result.success = false;
            }
        }

        // 检查slug唯一性
        const start = Date.now();
        const duplicateSlugs = this.db.prepare(`
            SELECT slug, COUNT(*) as count
            FROM content_items
            GROUP BY slug
            HAVING COUNT(*) > 1
        `).all() as any[];
        const queryTime = Date.now() - start;
        this.updatePerformanceMetrics(result, queryTime);

        if (duplicateSlugs.length > 0) {
            result.errors.push(`发现重复的slug: ${duplicateSlugs.map(d => d.slug).join(', ')}`);
            result.success = false;
        }

        // 检查内容长度
        const start2 = Date.now();
        const emptyContent = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE (ci.content IS NULL OR ci.content = '') AND ct.type_name NOT IN ('faq')
        `).get() as any;
        const queryTime2 = Date.now() - start2;
        this.updatePerformanceMetrics(result, queryTime2);

        if (emptyContent.count > 0) {
            result.warnings.push(`发现 ${emptyContent.count} 个非FAQ内容项为空`);
        }

        // 检查阅读时间合理性
        const start3 = Date.now();
        const invalidReadingTime = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM content_items
            WHERE reading_time <= 0 OR reading_time > 120
        `).get() as any;
        const queryTime3 = Date.now() - start3;
        this.updatePerformanceMetrics(result, queryTime3);

        if (invalidReadingTime.count > 0) {
            result.warnings.push(`发现 ${invalidReadingTime.count} 个内容项的阅读时间不合理`);
        }

        console.log(`  ✓ 内容质量检查完成`);
    }

    private async validateRelationshipIntegrity(result: ValidationResult): Promise<void> {
        console.log('\n🔗 验证关系完整性...');

        // 验证外键完整性
        const relationships = [
            { table: 'content_relationships', field: 'from_content_id', name: '内容关系' },
            { table: 'content_relationships', field: 'to_content_id', name: '内容关系' },
            { table: 'howto_steps', field: 'content_id', name: '步骤' }
        ];

        for (const rel of relationships) {
            const start = Date.now();
            const invalidRelations = this.db.prepare(`
                SELECT COUNT(*) as count
                FROM ${rel.table} cr
                LEFT JOIN content_items ci ON cr.${rel.field} = ci.id
                WHERE ci.id IS NULL
            `).get() as any;
            const queryTime = Date.now() - start;
            this.updatePerformanceMetrics(result, queryTime);

            if (invalidRelations.count > 0) {
                result.errors.push(`${rel.name}中有 ${invalidRelations.count} 个无效的关系`);
                result.success = false;
            }
        }

        // 验证How-to步骤完整性
        const start2 = Date.now();
        const howToWithoutSteps = this.db.prepare(`
            SELECT COUNT(*) as count
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            LEFT JOIN howto_steps hs ON ci.id = hs.content_id
            WHERE ct.type_name = 'howto' AND hs.id IS NULL
        `).get() as any;
        const queryTime2 = Date.now() - start2;
        this.updatePerformanceMetrics(result, queryTime2);

        if (howToWithoutSteps.count > 0) {
            result.warnings.push(`发现 ${howToWithoutSteps.count} 个How-to内容没有步骤`);
        }

        console.log(`  ✓ 关系完整性检查完成`);
    }

    private async validatePerformance(result: ValidationResult): Promise<void> {
        console.log('\n⚡ 验证性能指标...');

        // 测试复杂查询性能
        const queries = [
            {
                name: '内容搜索',
                sql: `SELECT ci.*, ct.type_name as type FROM content_items ci JOIN content_types ct ON ci.type_id = ct.id WHERE ci.status = 'published' AND ct.type_name = 'howto' ORDER BY ci.reading_time DESC LIMIT 10`
            },
            {
                name: '关系查询',
                sql: `SELECT cr.*, ci.title FROM content_relationships cr JOIN content_items ci ON cr.to_content_id = ci.id WHERE cr.from_content_id = 1`
            },
            {
                name: '步骤查询',
                sql: `SELECT hs.*, ci.title FROM howto_steps hs JOIN content_items ci ON hs.content_id = ci.id ORDER BY hs.step_order LIMIT 10`
            },
            {
                name: '全文搜索',
                sql: `SELECT ci.slug, ci.title FROM content_items ci WHERE ci.title LIKE '%statistical%' OR ci.summary LIKE '%statistical%'`
            }
        ];

        for (const query of queries) {
            const start = Date.now();
            try {
                this.db.prepare(query.sql).all();
                const queryTime = Date.now() - start;
                this.updatePerformanceMetrics(result, queryTime);

                if (queryTime > 100) {
                    result.warnings.push(`${query.name}查询较慢: ${queryTime}ms`);
                }
            } catch (error) {
                result.errors.push(`${query.name}查询失败: ${error.message}`);
                result.success = false;
            }
        }

        // 计算平均查询时间
        if (result.performance.queryTimes.length > 0) {
            result.performance.averageTime = result.performance.queryTimes.reduce((a, b) => a + b, 0) / result.performance.queryTimes.length;
        }

        console.log(`  ✓ 平均查询时间: ${result.performance.averageTime.toFixed(2)}ms`);
        console.log(`  ✓ 最大查询时间: ${result.performance.maxTime}ms`);
        console.log(`  ✓ 最小查询时间: ${result.performance.minTime === Infinity ? 0 : result.performance.minTime}ms`);
    }

    private async validateSEOMetadata(result: ValidationResult): Promise<void> {
        console.log('\n🔍 验证SEO元数据...');

        // 检查SEO元数据覆盖率
        const start = Date.now();
        const seoStats = this.db.prepare(`
            SELECT
                COUNT(*) as total_content,
                SUM(CASE WHEN sm.meta_description IS NOT NULL THEN 1 ELSE 0 END) as with_description,
                SUM(CASE WHEN sm.keywords IS NOT NULL AND json_array_length(sm.keywords) > 0 THEN 1 ELSE 0 END) as with_keywords
            FROM content_items ci
            LEFT JOIN seo_metadata sm ON ci.id = sm.content_id
            WHERE ci.status = 'published'
        `).get() as any;
        const queryTime = Date.now() - start;
        this.updatePerformanceMetrics(result, queryTime);

        if (seoStats.total_content > 0) {
            const descriptionCoverage = (seoStats.with_description / seoStats.total_content) * 100;
            const keywordsCoverage = (seoStats.with_keywords / seoStats.total_content) * 100;

            console.log(`  ✓ SEO描述覆盖率: ${descriptionCoverage.toFixed(1)}%`);
            console.log(`  ✓ SEO关键词覆盖率: ${keywordsCoverage.toFixed(1)}%`);

            if (descriptionCoverage < 50) {
                result.warnings.push('SEO元描述覆盖率低于50%');
            }
            if (keywordsCoverage < 30) {
                result.warnings.push('SEO关键词覆盖率低于30%');
            }
        }

        // 检查重复的meta description
        const start2 = Date.now();
        const duplicateDescriptions = this.db.prepare(`
            SELECT meta_description, COUNT(*) as count
            FROM seo_metadata
            WHERE meta_description IS NOT NULL AND meta_description != ''
            GROUP BY meta_description
            HAVING COUNT(*) > 1
        `).all() as any[];
        const queryTime2 = Date.now() - start2;
        this.updatePerformanceMetrics(result, queryTime2);

        if (duplicateDescriptions.length > 0) {
            result.warnings.push(`发现 ${duplicateDescriptions.length} 个重复的meta description`);
        }

        console.log(`  ✓ SEO元数据验证完成`);
    }

    private updatePerformanceMetrics(result: ValidationResult, queryTime: number): void {
        result.performance.queryTimes.push(queryTime);
        result.performance.maxTime = Math.max(result.performance.maxTime, queryTime);
        result.performance.minTime = Math.min(result.performance.minTime, queryTime);
    }

    private generateValidationReport(result: ValidationResult): void {
        console.log('\n' + '='.repeat(50));
        console.log('📋 内容迁移验证报告');
        console.log('='.repeat(50));

        console.log(`\n📊 数据统计:`);
        console.log(`  内容项总数: ${result.contentCount}`);
        console.log(`  内容关系: ${result.relationshipsCount}`);
        console.log(`  How-to步骤: ${result.stepsCount}`);

        console.log(`\n⚡ 性能指标:`);
        console.log(`  平均查询时间: ${result.performance.averageTime.toFixed(2)}ms`);
        console.log(`  最大查询时间: ${result.performance.maxTime}ms`);
        console.log(`  最小查询时间: ${result.performance.minTime === Infinity ? 0 : result.performance.minTime}ms`);

        if (result.errors.length > 0) {
            console.log(`\n❌ 错误 (${result.errors.length}):`);
            result.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }

        if (result.warnings.length > 0) {
            console.log(`\n⚠️  警告 (${result.warnings.length}):`);
            result.warnings.forEach((warning, index) => {
                console.log(`  ${index + 1}. ${warning}`);
            });
        }

        console.log(`\n✅ 验证结果: ${result.success ? '通过' : '失败'}`);

        if (result.success) {
            console.log('\n🎉 内容迁移验证通过！所有数据完整性检查都已通过。');
        } else {
            console.log('\n❌ 内容迁移验证失败，请修复上述错误后重试。');
        }
    }

    close(): void {
        this.db.close();
    }
}

// 主函数
async function main() {
    const validator = new ContentMigrationValidator();

    try {
        const result = await validator.validateMigration();

        // 输出JSON格式的结果（供CI/CD使用）
        console.log('\n' + '='.repeat(50));
        console.log('📄 JSON格式的验证结果:');
        console.log('='.repeat(50));
        console.log(JSON.stringify(result, null, 2));

        // 根据验证结果设置退出码
        process.exit(result.success ? 0 : 1);
    } catch (error) {
        console.error('验证过程中发生错误:', error);
        process.exit(1);
    } finally {
        validator.close();
    }
}

// 运行主函数
if (require.main === module) {
    main();
}