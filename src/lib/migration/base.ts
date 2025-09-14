import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { ErrorHandler, DataCleaner } from '../db/utils';

/**
 * 迁移基类
 * 提供迁移操作的基础功能
 */
export abstract class BaseMigration {
    protected db: Database.Database;
    protected logger: MigrationLogger;
    protected stats: MigrationStats;

    constructor() {
        this.db = this.getDatabaseConnection();
        this.logger = new MigrationLogger(this.constructor.name);
        this.stats = new MigrationStats();
    }

    /**
     * 获取数据库连接
     */
    protected getDatabaseConnection(): Database.Database {
        // 这个方法会在子类中重写，或者使用依赖注入
        throw new Error('子类必须实现 getDatabaseConnection 方法');
    }

    /**
     * 迁移入口方法
     */
    abstract async migrate(): Promise<MigrationResult>;

    /**
     * 回滚方法
     */
    abstract async rollback(): Promise<boolean>;

    /**
     * 验证迁移结果
     */
    abstract async validate(): Promise<boolean>;

    /**
     * 获取迁移名称
     */
    abstract getName(): string;

    /**
     * 获取迁移版本
     */
    abstract getVersion(): string;

    /**
     * 获取迁移描述
     */
    abstract getDescription(): string;

    /**
     * 安全执行操作
     */
    protected async safeExecute<T>(
        operation: string,
        callback: () => Promise<T>
    ): Promise<T> {
        const startTime = Date.now();
        this.logger.logStart(operation);

        try {
            const result = await callback();
            const duration = Date.now() - startTime;
            this.logger.logSuccess(operation, duration);
            this.stats.recordSuccess(operation, duration);
            return result;
        } catch (error) {
            const duration = Date.now() - startTime;
            this.logger.logError(operation, error, duration);
            this.stats.recordFailure(operation, error);
            throw error;
        }
    }

    /**
     * 执行事务
     */
    protected async executeTransaction<T>(callback: (db: Database.Database) => Promise<T>): Promise<T> {
        return this.safeExecute('数据库事务', () => {
            return this.db.transaction(callback)();
        });
    }

    /**
     * 批量插入数据
     */
    protected async batchInsert(
        table: string,
        data: any[],
        columns: string[]
    ): Promise<void> {
        return this.safeExecute(`批量插入 ${table}`, async () => {
            if (data.length === 0) return;

            const placeholders = columns.map(() => '?').join(', ');
            const sql = `INSERT OR REPLACE INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
            const stmt = this.db.prepare(sql);

            await this.executeTransaction(async (txDb) => {
                const insertStmt = txDb.prepare(sql);
                const insertMany = txDb.transaction((items: any[]) => {
                    for (const item of items) {
                        const values = columns.map(col => {
                            const value = item[col];
                            return value === undefined ? null : value;
                        });
                        insertStmt.run(values);
                    }
                });
                insertMany(data);
            });

            this.logger.log(`批量插入完成: ${data.length} 条记录到 ${table}`);
        });
    }

    /**
     * 清理和验证数据
     */
    protected cleanData(data: any): any {
        return DataCleaner.sanitizeJson(data);
    }

    /**
     * 检查表是否存在
     */
    protected tableExists(table: string): boolean {
        const result = this.db.prepare(`
            SELECT name FROM sqlite_master
            WHERE type='table' AND name=?
        `).get(table);
        return !!result;
    }

    /**
     * 获取记录数量
     */
    protected getRecordCount(table: string): number {
        const result = this.db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get();
        return result.count;
    }

    /**
     * 创建备份
     */
    protected createBackup(): string {
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupPath = path.join(process.cwd(), 'backups', `migration-${this.getName()}-${timestamp}.db`);

        // 确保备份目录存在
        const backupDir = path.dirname(backupPath);
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        this.db.backup(backupPath);
        this.logger.log(`创建备份: ${backupPath}`);
        return backupPath;
    }

    /**
     * 获取统计信息
     */
    getStats(): MigrationStats {
        return this.stats;
    }

    /**
     * 获取日志
     */
    getLogs(): MigrationLog[] {
        return this.logger.getLogs();
    }
}

/**
 * 迁移结果接口
 */
export interface MigrationResult {
    success: boolean;
    message: string;
    stats: MigrationStats;
    backupPath?: string;
    error?: any;
}

/**
 * 迁移统计信息
 */
export class MigrationStats {
    private successes: Map<string, number> = new Map();
    private failures: Map<string, any> = new Map();
    private startTime: number = Date.now();

    recordSuccess(operation: string, duration: number): void {
        this.successes.set(operation, duration);
    }

    recordFailure(operation: string, error: any): void {
        this.failures.set(operation, error);
    }

    getSuccessCount(): number {
        return this.successes.size;
    }

    getFailureCount(): number {
        return this.failures.size;
    }

    getTotalDuration(): number {
        return Array.from(this.successes.values()).reduce((sum, duration) => sum + duration, 0);
    }

    getAverageDuration(): number {
        const successes = Array.from(this.successes.values());
        return successes.length > 0 ? successes.reduce((sum, duration) => sum + duration, 0) / successes.length : 0;
    }

    getElapsedTime(): number {
        return Date.now() - this.startTime;
    }

    getSummary(): any {
        return {
            successes: this.successes.size,
            failures: this.failures.size,
            totalDuration: this.getTotalDuration(),
            averageDuration: this.getAverageDuration(),
            elapsedTime: this.getElapsedTime(),
            successRate: this.successes.size / (this.successes.size + this.failures.size) * 100
        };
    }
}

/**
 * 迁移日志记录器
 */
export class MigrationLogger {
    private logs: MigrationLog[] = [];
    private migrationName: string;

    constructor(migrationName: string) {
        this.migrationName = migrationName;
    }

    log(message: string): void {
        const log: MigrationLog = {
            timestamp: new Date().toISOString(),
            level: 'info',
            migration: this.migrationName,
            message
        };
        this.logs.push(log);
        console.log(`[${log.timestamp}] [${this.migrationName}] ${message}`);
    }

    logStart(operation: string): void {
        this.log(`🚀 开始: ${operation}`);
    }

    logSuccess(operation: string, duration: number): void {
        this.log(`✅ 成功: ${operation} (${duration}ms)`);
    }

    logError(operation: string, error: any, duration: number): void {
        this.log(`❌ 失败: ${operation} (${duration}ms) - ${error.message}`);
    }

    logWarning(message: string): void {
        this.log(`⚠️  警告: ${message}`);
    }

    logComplete(stats: MigrationStats): void {
        this.log(`🎉 完成: 成功 ${stats.getSuccessCount()} 个, 失败 ${stats.getFailureCount()} 个`);
    }

    getLogs(): MigrationLog[] {
        return [...this.logs];
    }

    exportLogs(filePath: string): void {
        fs.writeFileSync(filePath, JSON.stringify(this.logs, null, 2));
        this.log(`日志已导出到: ${filePath}`);
    }
}

/**
 * 迁移日志接口
 */
export interface MigrationLog {
    timestamp: string;
    level: 'info' | 'warning' | 'error';
    migration: string;
    message: string;
}

/**
 * 迁移管理器
 */
export class MigrationManager {
    private migrations: BaseMigration[] = [];
    private logger: MigrationLogger;

    constructor() {
        this.logger = new MigrationLogger('MigrationManager');
    }

    /**
     * 注册迁移
     */
    registerMigration(migration: BaseMigration): void {
        this.migrations.push(migration);
        this.logger.log(`注册迁移: ${migration.getName()} v${migration.getVersion()}`);
    }

    /**
     * 执行所有迁移
     */
    async runAllMigrations(): Promise<MigrationResult[]> {
        this.logger.log('🚀 开始执行所有迁移...');

        const results: MigrationResult[] = [];

        for (const migration of this.migrations) {
            try {
                this.logger.log(`\n📋 执行迁移: ${migration.getName()}`);
                const result = await this.runMigration(migration);
                results.push(result);

                if (!result.success) {
                    this.logger.logError(`迁移失败: ${migration.getName()}`, new Error(result.message), 0);
                    // 可以选择是否继续执行其他迁移
                    // break;
                }
            } catch (error) {
                this.logger.logError(`迁移异常: ${migration.getName()}`, error, 0);
                results.push({
                    success: false,
                    message: error.message,
                    stats: new MigrationStats(),
                    error
                });
            }
        }

        this.logger.logComplete(this.getOverallStats(results));
        return results;
    }

    /**
     * 执行单个迁移
     */
    async runMigration(migration: BaseMigration): Promise<MigrationResult> {
        try {
            // 创建备份
            const backupPath = migration.createBackup();

            // 执行迁移
            await migration.migrate();

            // 验证迁移结果
            const isValid = await migration.validate();

            if (!isValid) {
                throw new Error('迁移验证失败');
            }

            return {
                success: true,
                message: `迁移 ${migration.getName()} 成功完成`,
                stats: migration.getStats(),
                backupPath
            };
        } catch (error) {
            return {
                success: false,
                message: error.message,
                stats: migration.getStats(),
                error
            };
        }
    }

    /**
     * 回滚迁移
     */
    async rollbackMigration(migration: BaseMigration): Promise<boolean> {
        this.logger.log(`🔄 回滚迁移: ${migration.getName()}`);

        try {
            const success = await migration.rollback();
            if (success) {
                this.logger.log(`✅ 回滚成功: ${migration.getName()}`);
            } else {
                this.logger.logError(`回滚失败: ${migration.getName()}`, new Error('回滚操作返回失败'), 0);
            }
            return success;
        } catch (error) {
            this.logger.logError(`回滚异常: ${migration.getName()}`, error, 0);
            return false;
        }
    }

    /**
     * 获取总体统计信息
     */
    private getOverallStats(results: MigrationResult[]): MigrationStats {
        const stats = new MigrationStats();

        results.forEach(result => {
            if (result.success) {
                stats.recordSuccess(result.message, result.stats.getTotalDuration());
            } else {
                stats.recordFailure(result.message, result.error);
            }
        });

        return stats;
    }
}