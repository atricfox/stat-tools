#!/usr/bin/env tsx

/**
 * 计算器数据迁移脚本
 */

import { BaseMigration, MigrationResult } from '../../src/lib/migration/base';
import Database from 'better-sqlite3';
import { getDatabase } from '../../src/lib/db/client';
import fs from 'fs';
import path from 'path';

interface CalculatorGroup {
    group_name: string;
    display_name: string;
    sort_order: number;
    items: CalculatorItem[];
}

interface CalculatorItem {
    name: string;
    url: string;
    description: string;
    is_hot: boolean;
    is_new: boolean;
    sort_order: number;
}

export class CalculatorsMigration extends BaseMigration {
    private calculatorsData: any;

    constructor() {
        super();
        this.calculatorsData = this.loadCalculatorsData();
    }

    protected getDatabaseConnection(): Database.Database {
        return getDatabase();
    }

    getName(): string {
        return 'CalculatorsMigration';
    }

    getVersion(): string {
        return '1.0.0';
    }

    getDescription(): string {
        return '迁移计算器分组和工具数据从 JSON 到 SQLite 数据库';
    }

    /**
     * 加载计算器数据
     */
    private loadCalculatorsData(): any {
        const filePath = path.join(process.cwd(), 'data', 'calculators.json');
        const data = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(data);
    }

    /**
     * 验证数据格式
     */
    private validateData(): void {
        if (!this.calculatorsData || !Array.isArray(this.calculatorsData.groups)) {
            throw new Error('无效的计算器数据格式：缺少 groups 数组');
        }

        this.calculatorsData.groups.forEach((group: any, index: number) => {
            if (!group.group_name || !group.display_name) {
                throw new Error(`分组 ${index} 缺少必需字段：group_name 或 display_name`);
            }

            if (!Array.isArray(group.items)) {
                throw new Error(`分组 ${group.group_name} 缺少 items 数组`);
            }

            group.items.forEach((item: any, itemIndex: number) => {
                if (!item.name || !item.url || !item.description) {
                    throw new Error(`分组 ${group.group_name} 的项目 ${itemIndex} 缺少必需字段`);
                }

                if (!item.url.startsWith('/calculator/')) {
                    this.logger.logWarning(`计算器 URL 格式不规范: ${item.url}`);
                }
            });
        });

        this.logger.log('✅ 计算器数据验证通过');
    }

    /**
     * 迁移分组数据
     */
    private async migrateGroups(): Promise<void> {
        return this.safeExecute('迁移计算器分组', async () => {
            const groups = this.calculatorsData.groups;

            for (const group of groups) {
                const result = this.db.prepare(`
                    INSERT OR REPLACE INTO calculator_groups
                    (group_name, display_name, sort_order)
                    VALUES (?, ?, ?)
                `).run(
                    group.group_name,
                    group.display_name,
                    group.sort_order || 0
                );

                this.logger.log(`迁移分组: ${group.display_name} (ID: ${result.lastInsertRowid})`);
            }

            this.logger.log(`✅ 已迁移 ${groups.length} 个计算器分组`);
        });
    }

    /**
     * 迁移计算器数据
     */
    private async migrateCalculators(): Promise<void> {
        return this.safeExecute('迁移计算器工具', async () => {
            const groups = this.calculatorsData.groups;
            let totalCalculators = 0;

            for (const group of groups) {
                const groupId = this.db.prepare(`
                    SELECT id FROM calculator_groups WHERE group_name = ?
                `).get(group.group_name);

                if (!groupId) {
                    throw new Error(`找不到分组: ${group.group_name}`);
                }

                for (const item of group.items) {
                    const result = this.db.prepare(`
                        INSERT OR REPLACE INTO calculators
                        (group_id, name, url, description, is_hot, is_new, sort_order)
                        VALUES (?, ?, ?, ?, ?, ?, ?)
                    `).run(
                        groupId.id,
                        item.name,
                        item.url,
                        item.description,
                        item.is_hot ? 1 : 0,
                        item.is_new ? 1 : 0,
                        item.sort_order || 0
                    );

                    totalCalculators++;
                    this.logger.log(`迁移计算器: ${item.name} (ID: ${result.lastInsertRowid})`);
                }
            }

            this.logger.log(`✅ 已迁移 ${totalCalculators} 个计算器工具`);
        });
    }

    /**
     * 执行迁移
     */
    async migrate(): Promise<MigrationResult> {
        this.logger.log(`🚀 开始 ${this.getName()} 迁移...`);

        try {
            // 验证数据
            await this.validateData();

            // 执行迁移
            await this.migrateGroups();
            await this.migrateCalculators();

            // 验证迁移结果
            const isValid = await this.validate();

            if (!isValid) {
                throw new Error('迁移验证失败');
            }

            this.logger.logComplete(this.stats);
            return {
                success: true,
                message: '计算器数据迁移成功完成',
                stats: this.stats
            };
        } catch (error) {
            this.logger.logError('迁移失败', error, 0);
            return {
                success: false,
                message: error.message,
                stats: this.stats,
                error
            };
        }
    }

    /**
     * 验证迁移结果
     */
    async validate(): Promise<boolean> {
        return this.safeExecute('验证计算器迁移', async () => {
            const groups = this.calculatorsData.groups;
            let expectedTotalCalculators = 0;

            // 验证分组数量
            const dbGroupCount = this.getRecordCount('calculator_groups');
            if (dbGroupCount !== groups.length) {
                throw new Error(`分组数量不匹配: 期望 ${groups.length}, 实际 ${dbGroupCount}`);
            }

            // 验证每个分组
            for (const group of groups) {
                const dbGroup = this.db.prepare(`
                    SELECT * FROM calculator_groups WHERE group_name = ?
                `).get(group.group_name);

                if (!dbGroup) {
                    throw new Error(`找不到分组: ${group.group_name}`);
                }

                if (dbGroup.display_name !== group.display_name) {
                    throw new Error(`分组显示名称不匹配: ${group.group_name}`);
                }

                // 验证计算器
                expectedTotalCalculators += group.items.length;

                const dbCalculators = this.db.prepare(`
                    SELECT COUNT(*) as count FROM calculators WHERE group_id = ?
                `).get(dbGroup.id);

                if (dbCalculators.count !== group.items.length) {
                    throw new Error(`分组 ${group.group_name} 的计算器数量不匹配`);
                }

                // 验证每个计算器
                for (const item of group.items) {
                    const dbCalculator = this.db.prepare(`
                        SELECT * FROM calculators WHERE url = ? AND group_id = ?
                    `).get(item.url, dbGroup.id);

                    if (!dbCalculator) {
                        throw new Error(`找不到计算器: ${item.name}`);
                    }

                    if (dbCalculator.name !== item.name) {
                        throw new Error(`计算器名称不匹配: ${item.name}`);
                    }
                }
            }

            // 验证总计算器数量
            const dbTotalCalculators = this.getRecordCount('calculators');
            if (dbTotalCalculators !== expectedTotalCalculators) {
                throw new Error(`总计算器数量不匹配: 期望 ${expectedTotalCalculators}, 实际 ${dbTotalCalculators}`);
            }

            this.logger.log(`✅ 验证通过: ${groups.length} 个分组, ${expectedTotalCalculators} 个计算器`);
            return true;
        });
    }

    /**
     * 回滚迁移
     */
    async rollback(): Promise<boolean> {
        this.logger.log('🔄 开始回滚计算器迁移...');

        try {
            return this.safeExecute('回滚计算器迁移', async () => {
                // 删除计算器数据
                const calculatorCount = this.getRecordCount('calculators');
                this.db.exec('DELETE FROM calculators');
                this.logger.log(`已删除 ${calculatorCount} 个计算器`);

                // 删除分组数据
                const groupCount = this.getRecordCount('calculator_groups');
                this.db.exec('DELETE FROM calculator_groups');
                this.logger.log(`已删除 ${groupCount} 个分组`);

                // 验证回滚
                const remainingCalculators = this.getRecordCount('calculators');
                const remainingGroups = this.getRecordCount('calculator_groups');

                if (remainingCalculators > 0 || remainingGroups > 0) {
                    throw new Error('回滚不完整，仍有残留数据');
                }

                this.logger.log('✅ 计算器迁移回滚成功');
                return true;
            });
        } catch (error) {
            this.logger.logError('回滚失败', error, 0);
            return false;
        }
    }
}

/**
 * 主执行函数
 */
async function main() {
    const migration = new CalculatorsMigration();

    try {
        const result = await migration.migrate();

        if (result.success) {
            console.log('\n🎉 计算器迁移成功完成！');
            console.log(`📊 迁移统计: ${result.stats.getSuccessCount()} 个操作成功`);
            process.exit(0);
        } else {
            console.log('\n💥 计算器迁移失败:', result.message);
            process.exit(1);
        }
    } catch (error) {
        console.error('\n💥 迁移过程中发生异常:', error);
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

// 移除重复导出