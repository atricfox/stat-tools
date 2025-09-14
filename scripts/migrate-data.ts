#!/usr/bin/env tsx

/**
 * 主数据迁移脚本
 * 协调执行所有数据迁移任务
 */

import { MigrationManager } from '../src/lib/migration/base';
import { CalculatorsMigration } from './migrations/001-calculators';
import { GlossaryMigration } from './migrations/002-glossary';
import { ContentMigration } from './migrations/003-content';
import { TopicsMigration } from './migrations/004-topics';
import { ContentEnhancementMigration } from './migrations/005-content-enhancement';
import { ContentDataMigration } from './migrations/006-content-data';
import { ContentSpecificMigration } from './migrations/007-content-specific';
import fs from 'fs';
import path from 'path';

interface MigrationOptions {
    dryRun?: boolean;
    skipBackup?: boolean;
    continueOnError?: boolean;
    verbose?: boolean;
}

class DataMigrator {
    private manager: MigrationManager;
    private options: MigrationOptions;

    constructor(options: MigrationOptions = {}) {
        this.manager = new MigrationManager();
        this.options = {
            dryRun: false,
            skipBackup: false,
            continueOnError: false,
            verbose: false,
            ...options
        };
    }

    /**
     * 初始化迁移管理器
     */
    private initialize(): void {
        this.manager = new MigrationManager();

        // 注册所有迁移任务
        this.manager.registerMigration(new CalculatorsMigration());
        this.manager.registerMigration(new GlossaryMigration());
        this.manager.registerMigration(new ContentMigration());
        this.manager.registerMigration(new TopicsMigration());
        this.manager.registerMigration(new ContentEnhancementMigration());
        this.manager.registerMigration(new ContentDataMigration());
        this.manager.registerMigration(new ContentSpecificMigration());
    }

    /**
     * 创建完整备份
     */
    private async createFullBackup(): Promise<string> {
        if (this.options.skipBackup) {
            console.log('⚠️  跳过备份创建');
            return '';
        }

        console.log('💾 创建完整数据备份...');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupDir = path.join(process.cwd(), 'backups');
        const backupPath = path.join(backupDir, `full-migration-${timestamp}.zip`);

        // 确保备份目录存在
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        // 创建数据目录备份
        const dataBackupPath = path.join(backupDir, `data-${timestamp}`);
        const dataDir = path.join(process.cwd(), 'data');

        if (fs.existsSync(dataDir)) {
            // 复制整个 data 目录
            const { execSync } = require('child_process');
            if (process.platform === 'win32') {
                execSync(`xcopy "${dataDir}" "${dataBackupPath}" /E /I /H /Y`);
            } else {
                execSync(`cp -r "${dataDir}" "${dataBackupPath}"`);
            }
        }

        console.log(`✅ 备份创建完成: ${dataBackupPath}`);
        return dataBackupPath;
    }

    /**
     * 验证环境
     */
    private async validateEnvironment(): Promise<void> {
        console.log('🔍 验证迁移环境...');

        // 检查必要的文件
        const requiredFiles = [
            'data/calculators.json',
            'data/glossary.json',
            'src/lib/hub/topics.ts'
        ];

        for (const file of requiredFiles) {
            const filePath = path.join(process.cwd(), file);
            if (!fs.existsSync(filePath)) {
                throw new Error(`缺少必要的数据文件: ${file}`);
            }
        }

        // 检查数据库连接
        try {
            const { getDatabase } = require('../src/lib/db/client');
            const db = getDatabase();
            db.prepare('SELECT 1').get();
            console.log('✅ 数据库连接正常');
        } catch (error) {
            throw new Error(`数据库连接失败: ${error.message}`);
        }

        console.log('✅ 环境验证通过');
    }

    /**
     * 显示迁移计划
     */
    private showMigrationPlan(): void {
        console.log('\n📋 数据迁移计划:');
        console.log('   ===============================================');
        console.log('   📊 数据规模:');
        console.log('      - 计算器分组: 4 个');
        console.log('      - 计算器工具: 12 个');
        console.log('      - 术语表: 10 个术语');
        console.log('      - 基础内容项目: 9 个 (4 FAQ, 4 How-to, 1 Case)');
        console.log('      - 增强内容项目: 9 个 (带丰富元数据和关系)');
        console.log('      - 主题: 4 个');
        console.log('      - 操作指南步骤: 29+ 个');
        console.log('      - SEO元数据: 9 项');
        console.log('      - 关系映射: 30+ 条');
        console.log('   ===============================================');
        console.log('   🎯 迁移任务:');
        console.log('      1. 计算器分组和工具数据迁移');
        console.log('      2. 术语表数据迁移');
        console.log('      3. 基础内容数据迁移 (FAQ, How-to, Cases)');
        console.log('      4. 主题数据迁移');
        console.log('      5. 内容数据库架构增强 (新增表和字段)');
        console.log('      6. Content文件夹JSON数据迁移');
        console.log('      7. 具体内容类型迁移 (FAQ, How-to, Case)');
        console.log('   ===============================================');
        console.log('   ⚙️  配置选项:');
        console.log(`      - 模拟运行: ${this.options.dryRun ? '是' : '否'}`);
        console.log(`      - 跳过备份: ${this.options.skipBackup ? '是' : '否'}`);
        console.log(`      - 继续执行: ${this.options.continueOnError ? '是' : '否'}`);
        console.log('   ===============================================');

        if (this.options.dryRun) {
            console.log('\n⚠️  模拟运行模式 - 不会实际执行数据迁移');
        }
    }

    /**
     * 执行预迁移检查
     */
    private async preMigrationChecks(): Promise<void> {
        console.log('\n🔍 执行预迁移检查...');

        // 验证数据文件格式
        const validationScript = path.join(process.cwd(), 'scripts', 'validate-test-data.ts');
        try {
            const { execSync } = require('child_process');
            execSync(`npx tsx "${validationScript}"`, { stdio: 'inherit' });
        } catch (error) {
            throw new Error('数据验证失败，请修复错误后再运行迁移');
        }

        // 检查磁盘空间
        const dataDir = path.join(process.cwd(), 'data');
        if (fs.existsSync(dataDir)) {
            const stats = fs.statSync(dataDir);
            console.log(`   📁 数据目录大小: ${Math.round(stats.size / 1024)}KB`);
        }

        console.log('✅ 预迁移检查通过');
    }

    /**
     * 执行迁移
     */
    async runMigration(): Promise<{
        success: boolean;
        results: any[];
        backupPath?: string;
    }> {
        console.log('🚀 开始数据迁移...');

        try {
            // 初始化
            this.initialize();

            // 显示迁移计划
            this.showMigrationPlan();

            // 验证环境
            await this.validateEnvironment();

            // 预迁移检查
            await this.preMigrationChecks();

            // 创建备份
            const backupPath = await this.createFullBackup();

            if (this.options.dryRun) {
                console.log('\n🎯 模拟运行完成 - 未执行实际迁移');
                return {
                    success: true,
                    results: [],
                    backupPath
                };
            }

            // 执行迁移
            console.log('\n🏃‍♂️ 开始执行迁移任务...');
            const results = await this.manager.runAllMigrations();

            // 分析结果
            const successful = results.filter(r => r.success).length;
            const failed = results.filter(r => !r.success).length;

            console.log('\n📊 迁移结果摘要:');
            console.log(`   ✅ 成功: ${successful} 个任务`);
            console.log(`   ❌ 失败: ${failed} 个任务`);
            console.log(`   📈 成功率: ${successful / (successful + failed) * 100}%`);

            if (failed > 0 && !this.options.continueOnError) {
                console.log('\n💥 有迁移任务失败，请检查日志并修复问题');
                return {
                    success: false,
                    results,
                    backupPath
                };
            }

            // 执行迁移后验证
            await this.postMigrationValidation();

            console.log('\n🎉 数据迁移成功完成！');
            return {
                success: true,
                results,
                backupPath
            };
        } catch (error) {
            console.error('\n💥 迁移过程中发生错误:', error);
            return {
                success: false,
                results: [],
                backupPath: undefined
            };
        }
    }

    /**
     * 迁移后验证
     */
    private async postMigrationValidation(): Promise<void> {
        console.log('\n🔍 执行迁移后验证...');

        // 验证数据库记录数量
        const { getDatabase } = require('../src/lib/db/client');
        const db = getDatabase();

        const validations = [
            { table: 'calculator_groups', minExpected: 4 },
            { table: 'calculators', minExpected: 12 },
            { table: 'glossary_terms', minExpected: 10 },
            { table: 'content_items', minExpected: 9 },
            { table: 'topics', minExpected: 4 },
            { table: 'topic_guides', minExpected: 6 },
            { table: 'topic_faqs', minExpected: 5 },
            { table: 'howto_steps', minExpected: 29 }
        ];

        for (const validation of validations) {
            try {
                const count = db.prepare(`SELECT COUNT(*) as count FROM ${validation.table}`).get().count;
                console.log(`   📊 ${validation.table}: ${count} 条记录`);

                if (count < validation.minExpected) {
                    console.warn(`   ⚠️  ${validation.table} 记录数量少于预期 (至少 ${validation.minExpected})`);
                }
            } catch (error) {
                console.error(`   ❌ 验证 ${validation.table} 失败:`, error.message);
            }
        }

        console.log('✅ 迁移后验证完成');
    }

    /**
     * 生成迁移报告
     */
    private generateReport(results: any[], backupPath?: string): void {
        const timestamp = new Date().toISOString();
        const report = {
            timestamp,
            migration: 'StatCal Data Migration',
            version: '1.0.0',
            options: this.options,
            backupPath,
            results,
            summary: {
                total: results.length,
                successful: results.filter(r => r.success).length,
                failed: results.filter(r => !r.success).length,
                successRate: results.length > 0 ? (results.filter(r => r.success).length / results.length) * 100 : 0
            }
        };

        const reportPath = path.join(process.cwd(), 'data', `migration-report-${timestamp.replace(/[:.]/g, '-')}.json`);
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

        console.log(`📄 迁移报告已保存到: ${reportPath}`);
    }
}

/**
 * 解析命令行参数
 */
function parseOptions(): MigrationOptions {
    const args = process.argv.slice(2);
    const options: MigrationOptions = {};

    for (let i = 0; i < args.length; i += 2) {
        const flag = args[i];
        const value = args[i + 1];

        switch (flag) {
            case '--dry-run':
                options.dryRun = value !== 'false';
                break;
            case '--skip-backup':
                options.skipBackup = value !== 'false';
                break;
            case '--continue-on-error':
                options.continueOnError = value !== 'false';
                break;
            case '--verbose':
                options.verbose = value !== 'false';
                break;
            case '--help':
                showHelp();
                process.exit(0);
                break;
        }
    }

    return options;
}

/**
 * 显示帮助信息
 */
function showHelp(): void {
    console.log(`
StatCal 数据迁移脚本

用法: npx tsx scripts/migrate-data.ts [选项]

选项:
  --dry-run           模拟运行，不执行实际迁移
  --skip-backup       跳过备份创建
  --continue-on-error 遇到错误时继续执行其他任务
  --verbose           显示详细日志
  --help              显示此帮助信息

示例:
  npx tsx scripts/migrate-data.ts
  npx tsx scripts/migrate-data.ts --dry-run
  npx tsx scripts/migrate-data.ts --skip-backup --continue-on-error
`);
}

/**
 * 主执行函数
 */
async function main() {
    try {
        const options = parseOptions();
        const migrator = new DataMigrator(options);

        const result = await migrator.runMigration();

        if (result.success) {
            process.exit(0);
        } else {
            process.exit(1);
        }
    } catch (error) {
        console.error('💥 迁移失败:', error);
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

export { DataMigrator, MigrationOptions };