#!/usr/bin/env tsx

/**
 * Migrated Data Validation Script
 * 迁移数据验证脚本，确保所有迁移的数据完整性和一致性
 */

import Database from 'better-sqlite3';
import { getDatabase } from '../src/lib/db/client';
import fs from 'node:fs/promises';
import path from 'node:path';

// 验证结果接口
interface ValidationResult {
    category: string;
    testName: string;
    status: 'pass' | 'fail' | 'warning';
    message: string;
    details?: any;
    severity: 'low' | 'medium' | 'high' | 'critical';
}

// 数据库统计接口
interface DatabaseStats {
    totalContentItems: number;
    contentByType: Record<string, number>;
    totalFAQItems: number;
    totalHowToItems: number;
    totalCaseItems: number;
    totalSteps: number;
    totalRelationships: number;
    totalSEOMetadata: number;
    totalCaseDetails: number;
}

class DataValidator {
    private db: Database.Database;
    private results: ValidationResult[] = [];

    constructor() {
        this.db = getDatabase();
        console.log('🔍 开始数据验证...');
    }

    /**
     * 运行所有验证
     */
    async runAllValidations(): Promise<void> {
        console.log('\n📊 开始数据库结构验证...');

        // 数据库结构验证
        await this.validateDatabaseSchema();

        // 数据完整性验证
        await this.validateDataIntegrity();

        // 关系完整性验证
        await this.validateRelationships();

        // 性能指标验证
        await this.validatePerformanceMetrics();

        // 业务逻辑验证
        await this.validateBusinessLogic();

        // 显示验证结果
        this.displayResults();

        // 生成验证报告
        await this.generateValidationReport();
    }

    /**
     * 验证数据库架构
     */
    private async validateDatabaseSchema(): Promise<void> {
        console.log('\n🏗️  验证数据库架构...');

        // 验证必需的表存在
        const requiredTables = [
            'content_types',
            'content_items',
            'seo_metadata',
            'howto_steps',
            'case_details',
            'content_relationships',
            'content_tool_relationships',
            'content_term_relationships',
            'content_search'
        ];

        for (const tableName of requiredTables) {
            try {
                const result = this.db.prepare(`
                    SELECT name FROM sqlite_master
                    WHERE type='table' AND name=?
                `).get(tableName);

                if (result) {
                    this.addResult('schema', `表 ${tableName} 存在`, 'pass', '表结构正确');
                } else {
                    this.addResult('schema', `表 ${tableName} 不存在`, 'fail', '缺少必需的表', {}, 'critical');
                }
            } catch (error) {
                this.addResult('schema', `检查表 ${tableName} 失败`, 'fail', error instanceof Error ? error.message : String(error), {}, 'critical');
            }
        }

        // 验证必需的索引
        const requiredIndexes = [
            'idx_content_items_slug_type',
            'idx_content_items_type_id',
            'idx_content_items_created_at',
            'idx_content_items_updated_at',
            'idx_seo_metadata_content_id'
        ];

        for (const indexName of requiredIndexes) {
            try {
                const result = this.db.prepare(`
                    SELECT name FROM sqlite_master
                    WHERE type='index' AND name=?
                `).get(indexName);

                if (result) {
                    this.addResult('schema', `索引 ${indexName} 存在`, 'pass', '索引结构正确');
                } else {
                    this.addResult('schema', `索引 ${indexName} 不存在`, 'warning', '可能影响查询性能', {}, 'medium');
                }
            } catch (error) {
                this.addResult('schema', `检查索引 ${indexName} 失败`, 'warning', error instanceof Error ? error.message : String(error), {}, 'low');
            }
        }
    }

    /**
     * 验证数据完整性
     */
    private async validateDataIntegrity(): Promise<void> {
        console.log('\n🔗 验证数据完整性...');

        // 获取数据库统计信息
        const stats = this.getDatabaseStats();

        // 验证基本数据量
        if (stats.totalContentItems === 0) {
            this.addResult('integrity', '内容项数量', 'fail', '数据库中没有内容项', stats, 'critical');
        } else {
            this.addResult('integrity', '内容项数量', 'pass', `找到 ${stats.totalContentItems} 个内容项`, stats);
        }

        // 验证内容类型分布
        const contentTypes = Object.keys(stats.contentByType);
        if (contentTypes.length === 0) {
            this.addResult('integrity', '内容类型', 'fail', '没有找到任何内容类型', stats, 'high');
        } else {
            this.addResult('integrity', '内容类型', 'pass', `找到 ${contentTypes.length} 种内容类型`, stats);
        }

        // 验证SEO元数据覆盖率
        const seoCoverage = (stats.totalSEOMetadata / stats.totalContentItems) * 100;
        if (seoCoverage < 50) {
            this.addResult('integrity', 'SEO元数据覆盖率', 'warning', `SEO元数据覆盖率较低: ${seoCoverage.toFixed(1)}%`, { coverage: seoCoverage }, 'medium');
        } else {
            this.addResult('integrity', 'SEO元数据覆盖率', 'pass', `SEO元数据覆盖率: ${seoCoverage.toFixed(1)}%`, { coverage: seoCoverage });
        }

        // 验证案例详情完整性
        if (stats.totalCaseItems > 0) {
            const caseDetailsCoverage = (stats.totalCaseDetails / stats.totalCaseItems) * 100;
            if (caseDetailsCoverage < 80) {
                this.addResult('integrity', '案例详情完整性', 'warning', `案例详情覆盖率较低: ${caseDetailsCoverage.toFixed(1)}%`, { coverage: caseDetailsCoverage }, 'medium');
            } else {
                this.addResult('integrity', '案例详情完整性', 'pass', `案例详情覆盖率: ${caseDetailsCoverage.toFixed(1)}%`, { coverage: caseDetailsCoverage });
            }
        }

        // 验证步骤数据完整性
        if (stats.totalHowToItems > 0) {
            const stepsPerHowTo = stats.totalSteps / stats.totalHowToItems;
            if (stepsPerHowTo < 1) {
                this.addResult('integrity', 'How-to步骤完整性', 'warning', `平均每个How-to步骤数较少: ${stepsPerHowTo.toFixed(1)}`, { averageSteps: stepsPerHowTo }, 'low');
            } else {
                this.addResult('integrity', 'How-to步骤完整性', 'pass', `平均每个How-to ${stepsPerHowTo.toFixed(1)} 个步骤`, { averageSteps: stepsPerHowTo });
            }
        }
    }

    /**
     * 验证关系完整性
     */
    private async validateRelationships(): Promise<void> {
        console.log('\n🔗 验证关系完整性...');

        // 验证内容关系
        try {
            const invalidRelationships = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_relationships cr
                LEFT JOIN content_items ci1 ON cr.from_content_id = ci1.id
                LEFT JOIN content_items ci2 ON cr.to_content_id = ci2.id
                WHERE ci1.id IS NULL OR ci2.id IS NULL
            `).get() as any;

            if (invalidRelationships.count > 0) {
                this.addResult('relationships', '内容关系完整性', 'fail', `发现 ${invalidRelationships.count} 个无效的内容关系`, { invalidCount: invalidRelationships.count }, 'high');
            } else {
                this.addResult('relationships', '内容关系完整性', 'pass', '所有内容关系都有效');
            }
        } catch (error) {
            this.addResult('relationships', '内容关系验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'medium');
        }

        // 验证工具关系
        try {
            const invalidToolRelationships = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_tool_relationships ctr
                LEFT JOIN content_items ci ON ctr.content_id = ci.id
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidToolRelationships.count > 0) {
                this.addResult('relationships', '工具关系完整性', 'fail', `发现 ${invalidToolRelationships.count} 个无效的工具关系`, { invalidCount: invalidToolRelationships.count }, 'medium');
            } else {
                this.addResult('relationships', '工具关系完整性', 'pass', '所有工具关系都有效');
            }
        } catch (error) {
            this.addResult('relationships', '工具关系验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'low');
        }

        // 验证术语关系
        try {
            const invalidTermRelationships = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_term_relationships ctr
                LEFT JOIN content_items ci ON ctr.content_id = ci.id
                WHERE ci.id IS NULL
            `).get() as any;

            if (invalidTermRelationships.count > 0) {
                this.addResult('relationships', '术语关系完整性', 'fail', `发现 ${invalidTermRelationships.count} 个无效的术语关系`, { invalidCount: invalidTermRelationships.count }, 'medium');
            } else {
                this.addResult('relationships', '术语关系完整性', 'pass', '所有术语关系都有效');
            }
        } catch (error) {
            this.addResult('relationships', '术语关系验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'low');
        }
    }

    /**
     * 验证性能指标
     */
    private async validatePerformanceMetrics(): Promise<void> {
        console.log('\n⚡ 验证性能指标...');

        // 测试基础查询性能
        const startQuery = performance.now();
        try {
            const items = this.db.prepare('SELECT * FROM content_items LIMIT 100').all();
            const queryDuration = performance.now() - startQuery;

            if (queryDuration > 100) {
                this.addResult('performance', '基础查询性能', 'warning', `查询响应时间较慢: ${queryDuration.toFixed(2)}ms`, { duration: queryDuration }, 'medium');
            } else {
                this.addResult('performance', '基础查询性能', 'pass', `查询响应时间: ${queryDuration.toFixed(2)}ms`, { duration: queryDuration });
            }
        } catch (error) {
            this.addResult('performance', '基础查询性能', 'fail', error instanceof Error ? error.message : String(error), {}, 'high');
        }

        // 测试带连接的查询性能
        const startJoin = performance.now();
        try {
            const complexItems = this.db.prepare(`
                SELECT ci.*, ct.type_name
                FROM content_items ci
                JOIN content_types ct ON ci.type_id = ct.id
                LIMIT 50
            `).all();
            const joinDuration = performance.now() - startJoin;

            if (joinDuration > 200) {
                this.addResult('performance', '连接查询性能', 'warning', `连接查询响应时间较慢: ${joinDuration.toFixed(2)}ms`, { duration: joinDuration }, 'medium');
            } else {
                this.addResult('performance', '连接查询性能', 'pass', `连接查询响应时间: ${joinDuration.toFixed(2)}ms`, { duration: joinDuration });
            }
        } catch (error) {
            this.addResult('performance', '连接查询性能', 'fail', error instanceof Error ? error.message : String(error), {}, 'high');
        }

        // 测试全文搜索性能
        const startSearch = performance.now();
        try {
            // 使用一个常见的搜索词
            const searchResults = this.db.prepare(`
                SELECT * FROM content_search
                WHERE content_search MATCH 'statistics'
                LIMIT 20
            `).all();
            const searchDuration = performance.now() - startSearch;

            if (searchDuration > 300) {
                this.addResult('performance', '全文搜索性能', 'warning', `全文搜索响应时间较慢: ${searchDuration.toFixed(2)}ms`, { duration: searchDuration }, 'medium');
            } else {
                this.addResult('performance', '全文搜索性能', 'pass', `全文搜索响应时间: ${searchDuration.toFixed(2)}ms`, { duration: searchDuration });
            }
        } catch (error) {
            this.addResult('performance', '全文搜索性能', 'fail', error instanceof Error ? error.message : String(error), {}, 'high');
        }
    }

    /**
     * 验证业务逻辑
     */
    private async validateBusinessLogic(): Promise<void> {
        console.log('\n🏢 验证业务逻辑...');

        // 验证slug唯一性
        try {
            const duplicateSlugs = this.db.prepare(`
                SELECT slug, type_id, COUNT(*) as count
                FROM content_items
                GROUP BY slug, type_id
                HAVING COUNT(*) > 1
            `).all();

            if (duplicateSlugs.length > 0) {
                this.addResult('business', 'Slug唯一性', 'fail', `发现 ${duplicateSlugs.length} 组重复的slug`, { duplicates: duplicateSlugs }, 'high');
            } else {
                this.addResult('business', 'Slug唯一性', 'pass', '所有slug都是唯一的');
            }
        } catch (error) {
            this.addResult('business', 'Slug唯一性验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'medium');
        }

        // 验证内容状态
        try {
            const invalidStatuses = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_items
                WHERE status NOT IN ('published', 'draft', 'archived')
            `).get() as any;

            if (invalidStatuses.count > 0) {
                this.addResult('business', '内容状态有效性', 'warning', `发现 ${invalidStatuses.count} 个无效的内容状态`, { invalidCount: invalidStatuses.count }, 'medium');
            } else {
                this.addResult('business', '内容状态有效性', 'pass', '所有内容状态都有效');
            }
        } catch (error) {
            this.addResult('business', '内容状态验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'low');
        }

        // 验证必需字段
        try {
            const emptyTitles = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_items
                WHERE title IS NULL OR title = ''
            `).get() as any;

            if (emptyTitles.count > 0) {
                this.addResult('business', '标题完整性', 'fail', `发现 ${emptyTitles.count} 个空标题`, { emptyCount: emptyTitles.count }, 'high');
            } else {
                this.addResult('business', '标题完整性', 'pass', '所有内容都有标题');
            }
        } catch (error) {
            this.addResult('business', '标题完整性验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'medium');
        }

        // 验证阅读时间合理性
        try {
            const invalidReadingTimes = this.db.prepare(`
                SELECT COUNT(*) as count FROM content_items
                WHERE reading_time < 0 OR reading_time > 120
            `).get() as any;

            if (invalidReadingTimes.count > 0) {
                this.addResult('business', '阅读时间合理性', 'warning', `发现 ${invalidReadingTimes.count} 个不合理的阅读时间`, { invalidCount: invalidReadingTimes.count }, 'low');
            } else {
                this.addResult('business', '阅读时间合理性', 'pass', '所有阅读时间都合理');
            }
        } catch (error) {
            this.addResult('business', '阅读时间验证', 'warning', error instanceof Error ? error.message : String(error), {}, 'low');
        }
    }

    /**
     * 获取数据库统计信息
     */
    private getDatabaseStats(): DatabaseStats {
        const totalContentItems = this.db.prepare('SELECT COUNT(*) as count FROM content_items').get() as any;
        const contentByType = this.db.prepare(`
            SELECT ct.type_name, COUNT(ci.id) as count
            FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            GROUP BY ct.type_name
        `).all() as any[];

        const totalFAQItems = this.db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'faq'
        `).get() as any;

        const totalHowToItems = this.db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'howto'
        `).get() as any;

        const totalCaseItems = this.db.prepare(`
            SELECT COUNT(*) as count FROM content_items ci
            JOIN content_types ct ON ci.type_id = ct.id
            WHERE ct.type_name = 'case'
        `).get() as any;

        const totalSteps = this.db.prepare('SELECT COUNT(*) as count FROM howto_steps').get() as any;
        const totalRelationships = this.db.prepare(`
            SELECT COUNT(*) as count FROM (
                SELECT id FROM content_relationships
                UNION ALL
                SELECT id FROM content_tool_relationships
                UNION ALL
                SELECT id FROM content_term_relationships
            )
        `).get() as any;

        const totalSEOMetadata = this.db.prepare('SELECT COUNT(*) as count FROM seo_metadata').get() as any;
        const totalCaseDetails = this.db.prepare('SELECT COUNT(*) as count FROM case_details').get() as any;

        return {
            totalContentItems: totalContentItems.count,
            contentByType: contentByType.reduce((acc, item) => ({ ...acc, [item.type_name]: item.count }), {}),
            totalFAQItems: totalFAQItems.count,
            totalHowToItems: totalHowToItems.count,
            totalCaseItems: totalCaseItems.count,
            totalSteps: totalSteps.count,
            totalRelationships: totalRelationships.count,
            totalSEOMetadata: totalSEOMetadata.count,
            totalCaseDetails: totalCaseDetails.count
        };
    }

    /**
     * 添加验证结果
     */
    private addResult(category: string, testName: string, status: 'pass' | 'fail' | 'warning', message: string, details?: any, severity: 'low' | 'medium' | 'high' | 'critical' = 'medium'): void {
        this.results.push({
            category,
            testName,
            status,
            message,
            details,
            severity
        });
    }

    /**
     * 显示验证结果
     */
    private displayResults(): void {
        console.log('\n📊 验证结果:');
        console.log('─'.repeat(80));

        // 按严重程度分组
        const bySeverity = {
            critical: this.results.filter(r => r.severity === 'critical'),
            high: this.results.filter(r => r.severity === 'high'),
            medium: this.results.filter(r => r.severity === 'medium'),
            low: this.results.filter(r => r.severity === 'low')
        };

        // 显示关键问题
        if (bySeverity.critical.length > 0) {
            console.log('\n🚨 关键问题:');
            bySeverity.critical.forEach(result => {
                console.log(`  ❌ ${result.testName}: ${result.message}`);
            });
        }

        // 显示高优先级问题
        if (bySeverity.high.length > 0) {
            console.log('\n⚠️  高优先级问题:');
            bySeverity.high.forEach(result => {
                console.log(`  ❌ ${result.testName}: ${result.message}`);
            });
        }

        // 显示中优先级问题
        if (bySeverity.medium.length > 0) {
            console.log('\n⚡ 中优先级问题:');
            bySeverity.medium.filter(r => r.status === 'fail' || r.status === 'warning').forEach(result => {
                const icon = result.status === 'fail' ? '❌' : '⚠️';
                console.log(`  ${icon} ${result.testName}: ${result.message}`);
            });
        }

        // 统计
        const passed = this.results.filter(r => r.status === 'pass').length;
        const failed = this.results.filter(r => r.status === 'fail').length;
        const warnings = this.results.filter(r => r.status === 'warning').length;
        const total = this.results.length;

        console.log('\n📈 统计汇总:');
        console.log(`  总计: ${total} 个验证项目`);
        console.log(`  ✅ 通过: ${passed} (${((passed / total) * 100).toFixed(1)}%)`);
        console.log(`  ❌ 失败: ${failed} (${((failed / total) * 100).toFixed(1)}%)`);
        console.log(`  ⚠️  警告: ${warnings} (${((warnings / total) * 100).toFixed(1)}%)`);

        // 总体评估
        if (bySeverity.critical.length > 0) {
            console.log('\n🔴 总体评估: 存在关键问题，需要立即修复');
        } else if (bySeverity.high.length > 0) {
            console.log('\n🟡 总体评估: 存在高优先级问题，建议尽快修复');
        } else if (failed > 0) {
            console.log('\n🟡 总体评估: 存在一些问题，建议修复');
        } else if (warnings > 0) {
            console.log('\n🟢 总体评估: 基本正常，有一些优化建议');
        } else {
            console.log('\n🟢 总体评估: 所有验证都通过，数据质量良好');
        }
    }

    /**
     * 生成验证报告
     */
    private async generateValidationReport(): Promise<void> {
        const reportPath = path.resolve(process.cwd(), 'data', 'validation-report.json');

        const report = {
            timestamp: new Date().toISOString(),
            summary: {
                total: this.results.length,
                passed: this.results.filter(r => r.status === 'pass').length,
                failed: this.results.filter(r => r.status === 'fail').length,
                warnings: this.results.filter(r => r.status === 'warning').length,
                critical: this.results.filter(r => r.severity === 'critical').length,
                high: this.results.filter(r => r.severity === 'high').length,
                medium: this.results.filter(r => r.severity === 'medium').length,
                low: this.results.filter(r => r.severity === 'low').length
            },
            results: this.results,
            recommendations: this.generateRecommendations()
        };

        try {
            await fs.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
            console.log(`\n📄 验证报告已保存到: ${reportPath}`);
        } catch (error) {
            console.error(`\n❌ 保存验证报告失败: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * 生成修复建议
     */
    private generateRecommendations(): string[] {
        const recommendations: string[] = [];

        const criticalIssues = this.results.filter(r => r.severity === 'critical');
        const highIssues = this.results.filter(r => r.severity === 'high');
        const mediumIssues = this.results.filter(r => r.severity === 'medium' && r.status !== 'pass');

        if (criticalIssues.length > 0) {
            recommendations.push('立即修复所有关键问题，这些可能影响系统基本功能');
        }

        if (highIssues.length > 0) {
            recommendations.push('优先修复高优先级问题，避免潜在的功能故障');
        }

        const schemaIssues = this.results.filter(r => r.category === 'schema' && r.status !== 'pass');
        if (schemaIssues.length > 0) {
            recommendations.push('检查并修复数据库架构问题，确保所有必需的表和索引都存在');
        }

        const performanceIssues = this.results.filter(r => r.category === 'performance' && r.status !== 'pass');
        if (performanceIssues.length > 0) {
            recommendations.push('优化数据库查询性能，考虑添加适当的索引和优化查询语句');
        }

        const relationshipIssues = this.results.filter(r => r.category === 'relationships' && r.status !== 'pass');
        if (relationshipIssues.length > 0) {
            recommendations.push('清理无效的关系数据，确保数据完整性');
        }

        if (recommendations.length === 0) {
            recommendations.push('数据质量良好，继续监控和维护');
        }

        return recommendations;
    }
}

/**
 * 主执行函数
 */
async function main() {
    try {
        const validator = new DataValidator();
        await validator.runAllValidations();

        console.log('\n🎉 数据验证完成！');

        process.exit(0);
    } catch (error) {
        console.error('\n💥 验证过程中发生异常:', error);
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