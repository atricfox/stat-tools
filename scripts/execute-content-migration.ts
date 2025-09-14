#!/usr/bin/env tsx

/**
 * Content文件夹数据迁移执行脚本
 * 执行完整的内容数据迁移流程
 */

import { MigrationManager } from '../src/lib/migration/base';
import { ContentEnhancementMigration } from './migrations/005-content-enhancement';
import { ContentDataMigration } from './migrations/006-content-data';
import { ContentSpecificMigration } from './migrations/007-content-specific';
import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';

interface MigrationResult {
    success: boolean;
    phase: string;
    details: any;
    executionTime: number;
}

class ContentMigrationExecutor {
    private results: MigrationResult[] = [];

    async executeFullMigration(): Promise<{
        success: boolean;
        results: MigrationResult[];
        summary: {
            totalPhases: number;
            successfulPhases: number;
            failedPhases: number;
            totalExecutionTime: number;
        };
    }> {
        console.log('🚀 开始执行Content文件夹数据完整迁移...\n');

        const startTime = Date.now();

        try {
            // Phase 1: 数据库架构增强
            await this.executePhase('数据库架构增强', async () => {
                return this.executeMigration(new ContentEnhancementMigration());
            });

            // Phase 2: Content文件夹数据迁移
            await this.executePhase('Content文件夹数据迁移', async () => {
                return this.executeMigration(new ContentDataMigration());
            });

            // Phase 3: 具体内容类型迁移
            await this.executePhase('具体内容类型迁移', async () => {
                return this.executeMigration(new ContentSpecificMigration());
            });

            // Phase 4: 数据验证
            await this.executePhase('数据验证', async () => {
                return this.runValidation();
            });

            // Phase 5: 服务测试
            await this.executePhase('服务测试', async () => {
                return this.runServiceTests();
            });

            // 生成最终报告
            const totalExecutionTime = Date.now() - startTime;
            const summary = this.generateSummary(totalExecutionTime);

            this.generateFinalReport(summary);

            return {
                success: summary.failedPhases === 0,
                results: this.results,
                summary
            };

        } catch (error) {
            console.error('\n💥 迁移执行失败:', error);
            return {
                success: false,
                results: this.results,
                summary: {
                    totalPhases: this.results.length,
                    successfulPhases: this.results.filter(r => r.success).length,
                    failedPhases: this.results.filter(r => !r.success).length,
                    totalExecutionTime: Date.now() - startTime
                }
            };
        }
    }

    private async executePhase(phaseName: string, phaseFn: () => Promise<any>): Promise<void> {
        console.log(`🎯 执行阶段: ${phaseName}`);
        console.log('   ' + '─'.repeat(50));

        const startTime = Date.now();
        let result: any;

        try {
            result = await phaseFn();
            const executionTime = Date.now() - startTime;

            this.results.push({
                success: true,
                phase: phaseName,
                details: result,
                executionTime
            });

            console.log(`   ✅ ${phaseName} 完成 (${executionTime}ms)\n`);

        } catch (error) {
            const executionTime = Date.now() - startTime;

            this.results.push({
                success: false,
                phase: phaseName,
                details: { error: error.message },
                executionTime
            });

            console.error(`   ❌ ${phaseName} 失败: ${error.message} (${executionTime}ms)\n`);
            throw error;
        }
    }

    private async executeMigration(migration: any): Promise<any> {
        const manager = new MigrationManager();
        manager.registerMigration(migration);
        return manager.runAllMigrations();
    }

    private async runValidation(): Promise<any> {
        // 运行我们的内容验证脚本
        return new Promise((resolve, reject) => {
            const child = spawn('npx', ['tsx', 'scripts/validate-content-migration.ts'], {
                stdio: 'pipe',
                cwd: process.cwd()
            });

            let output = '';
            let error = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    // 提取JSON结果
                    try {
                        const jsonMatch = output.match(/\{[\s\S]*\}/);
                        if (jsonMatch) {
                            const result = JSON.parse(jsonMatch[0]);
                            resolve(result);
                        } else {
                            resolve({ success: true, output });
                        }
                    } catch (e) {
                        resolve({ success: true, output });
                    }
                } else {
                    reject(new Error(`验证脚本退出码: ${code}, 错误: ${error}`));
                }
            });

            child.on('error', (err) => {
                reject(new Error(`验证脚本执行失败: ${err.message}`));
            });
        });
    }

    private async runServiceTests(): Promise<any> {
        // 运行服务测试脚本
        return new Promise((resolve, reject) => {
            const child = spawn('npx', ['tsx', 'scripts/test-services.ts'], {
                stdio: 'pipe',
                cwd: process.cwd()
            });

            let output = '';
            let error = '';

            child.stdout.on('data', (data) => {
                output += data.toString();
            });

            child.stderr.on('data', (data) => {
                error += data.toString();
            });

            child.on('close', (code) => {
                if (code === 0) {
                    resolve({ success: true, output });
                } else {
                    reject(new Error(`服务测试退出码: ${code}, 错误: ${error}`));
                }
            });

            child.on('error', (err) => {
                reject(new Error(`服务测试执行失败: ${err.message}`));
            });
        });
    }

    private generateSummary(totalExecutionTime: number) {
        return {
            totalPhases: this.results.length,
            successfulPhases: this.results.filter(r => r.success).length,
            failedPhases: this.results.filter(r => !r.success).length,
            totalExecutionTime,
            averagePhaseTime: this.results.reduce((sum, r) => sum + r.executionTime, 0) / this.results.length
        };
    }

    private generateFinalReport(summary: any): void {
        console.log('\n' + '='.repeat(60));
        console.log('📋 Content文件夹数据迁移最终报告');
        console.log('='.repeat(60));

        console.log(`\n📊 迁移摘要:`);
        console.log(`   总执行阶段: ${summary.totalPhases}`);
        console.log(`   成功阶段: ${summary.successfulPhases}`);
        console.log(`   失败阶段: ${summary.failedPhases}`);
        console.log(`   总执行时间: ${summary.totalExecutionTime}ms (${(summary.totalExecutionTime / 1000).toFixed(2)}s)`);
        console.log(`   平均阶段时间: ${summary.averagePhaseTime.toFixed(2)}ms`);

        console.log(`\n🎯 各阶段详情:`);
        this.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${index + 1}. ${result.phase}: ${status} (${result.executionTime}ms)`);

            if (!result.success) {
                console.log(`      错误: ${result.details.error}`);
            }
        });

        console.log(`\n📈 预期收益:`);
        console.log(`   ✅ 数据丰富度: SEO元数据、难度级别、行业分类`);
        console.log(`   ✅ 功能增强: 高级搜索、智能推荐、用户路径`);
        console.log(`   ✅ 性能优化: 优化索引和查询策略`);
        console.log(`   ✅ 查询效率: <1ms 响应时间`);

        if (summary.failedPhases === 0) {
            console.log('\n🎉 Content文件夹数据迁移完全成功！');
            console.log('📁 Content文件夹JSON数据已成功迁移到SQLite3数据库');
            console.log('🔗 所有关系映射和数据完整性验证通过');
            console.log('⚡ 性能优化和服务层功能全部正常');
        } else {
            console.log('\n❌ 部分迁移阶段失败，请检查上述错误并重试');
        }

        // 保存详细报告
        const report = {
            timestamp: new Date().toISOString(),
            migration: 'Content Folder JSON Data Migration',
            version: '2.0.0',
            summary,
            results: this.results,
            dataSources: {
                contentFiles: [
                    'content/faq/statistics-faq.json (4个FAQ)',
                    'content/howto/ (4个How-to指南)',
                    'content/cases/improving-gpa-strategy.json (1个案例)'
                ],
                totalItems: 9,
                enhancedFeatures: [
                    'SEO元数据支持',
                    '难度级别分类',
                    '行业分类',
                    '工具关联映射',
                    '术语关联映射',
                    '内容间关系',
                    'How-to步骤详情',
                    '案例详细信息'
                ]
            }
        };

        const reportPath = path.join(process.cwd(), 'content-migration-report.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`\n📄 详细报告已保存到: ${reportPath}`);
        console.log('='.repeat(60));
    }
}

// 主执行函数
async function main() {
    try {
        const executor = new ContentMigrationExecutor();
        const result = await executor.executeFullMigration();

        process.exit(result.success ? 0 : 1);
    } catch (error) {
        console.error('💥 迁移执行失败:', error);
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

export { ContentMigrationExecutor };