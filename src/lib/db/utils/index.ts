import Database from 'better-sqlite3';
import { getDatabase } from '../client';

/**
 * 数据库工具函数集合
 */

/**
 * 执行事务
 * @param callback 事务回调函数
 * @returns 事务执行结果
 */
export function executeTransaction<T>(callback: (db: Database.Database) => T): T {
    const db = getDatabase();
    return db.transaction(callback)(db);
}

/**
 * 批量插入数据
 * @param tableName 表名
 * @param data 数据数组
 * @param columns 列名数组
 */
export function batchInsert(
    tableName: string,
    data: any[],
    columns: string[]
): void {
    const db = getDatabase();

    if (data.length === 0) return;

    const placeholders = columns.map(() => '?').join(', ');
    const sql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
    const stmt = db.prepare(sql);

    executeTransaction((txDb) => {
        const insertStmt = txDb.prepare(sql);
        const insertMany = txDb.transaction((items: any[]) => {
            for (const item of items) {
                const values = columns.map(col => item[col]);
                insertStmt.run(values);
            }
        });
        insertMany(data);
    });
}

/**
 * 安全执行 SQL 语句，处理错误
 * @param sql SQL 语句
 * @param params 参数
 * @returns 执行结果
 */
export function safeExecute(sql: string, params: any[] = []): any {
    const db = getDatabase();

    try {
        if (sql.trim().toUpperCase().startsWith('SELECT')) {
            return db.all(sql, params);
        } else {
            return db.run(sql, params);
        }
    } catch (error) {
        console.error(`执行 SQL 错误: ${sql}`, error);
        throw error;
    }
}

/**
 * 检查表是否存在
 * @param tableName 表名
 * @returns 是否存在
 */
export function tableExists(tableName: string): boolean {
    const db = getDatabase();
    const result = db.prepare(`
        SELECT name FROM sqlite_master
        WHERE type='table' AND name=?
    `).get(tableName);

    return !!result;
}

/**
 * 获取表的结构信息
 * @param tableName 表名
 * @returns 表结构信息
 */
export function getTableSchema(tableName: string): any[] {
    const db = getDatabase();
    return db.all(`PRAGMA table_info(${tableName})`);
}

/**
 * 创建备份
 * @param backupPath 备份路径
 */
export function createBackup(backupPath: string): void {
    const db = getDatabase();
    db.backup(backupPath);
    console.log(`数据库已备份到: ${backupPath}`);
}

/**
 * 数据验证工具
 */
export class DataValidator {
    /**
     * 验证字符串不为空
     */
    static nonEmpty(value: any, fieldName: string): void {
        if (!value || typeof value !== 'string' || value.trim() === '') {
            throw new Error(`${fieldName} 不能为空`);
        }
    }

    /**
     * 验证数字在有效范围内
     */
    static numberRange(value: any, fieldName: string, min: number, max: number): void {
        const num = Number(value);
        if (isNaN(num) || num < min || num > max) {
            throw new Error(`${fieldName} 必须在 ${min} 和 ${max} 之间`);
        }
    }

    /**
     * 验证 URL 格式
     */
    static url(value: any, fieldName: string): void {
        if (!value || typeof value !== 'string' || !value.startsWith('/')) {
            throw new Error(`${fieldName} 必须是以 / 开头的有效路径`);
        }
    }

    /**
     * 验证布尔值
     */
    static boolean(value: any, fieldName: string): void {
        if (value !== true && value !== false && value !== 0 && value !== 1) {
            throw new Error(`${fieldName} 必须是布尔值`);
        }
    }
}

/**
 * 性能监控工具
 */
export class PerformanceMonitor {
    private static metrics: Map<string, number[]> = new Map();

    /**
     * 记录查询性能
     */
    static recordQuery(queryName: string, duration: number): void {
        if (!this.metrics.has(queryName)) {
            this.metrics.set(queryName, []);
        }
        this.metrics.get(queryName)!.push(duration);
    }

    /**
     * 获取性能统计
     */
    static getStats(queryName: string): { avg: number; min: number; max: number; count: number } {
        const durations = this.metrics.get(queryName) || [];
        if (durations.length === 0) {
            return { avg: 0, min: 0, max: 0, count: 0 };
        }

        return {
            avg: durations.reduce((a, b) => a + b, 0) / durations.length,
            min: Math.min(...durations),
            max: Math.max(...durations),
            count: durations.length
        };
    }

    /**
     * 重置性能统计
     */
    static reset(): void {
        this.metrics.clear();
    }
}

/**
 * 执行带性能监控的查询
 */
export function executeWithMonitoring<T>(
    queryName: string,
    callback: () => T
): T {
    const startTime = Date.now();
    try {
        const result = callback();
        const duration = Date.now() - startTime;
        PerformanceMonitor.recordQuery(queryName, duration);
        return result;
    } catch (error) {
        const duration = Date.now() - startTime;
        PerformanceMonitor.recordQuery(`${queryName}_error`, duration);
        throw error;
    }
}

/**
 * 数据清理工具
 */
export class DataCleaner {
    /**
     * 清理字符串中的特殊字符
     */
    static cleanString(value: string): string {
        return value
            .trim()
            .replace(/[<>]/g, '') // 移除潜在的HTML标签
            .replace(/\s+/g, ' ') // 合并多余空格
            .replace(/['"]/g, '"'); // 统一引号
    }

    /**
     * 生成 URL 友好的 slug
     */
    static generateSlug(title: string): string {
        return title
            .toLowerCase()
            .replace(/[^\w\s-]/g, '') // 移除特殊字符
            .replace(/\s+/g, '-') // 空格替换为连字符
            .replace(/-+/g, '-') // 合并多个连字符
            .trim();
    }

    /**
     * 验证和清理 JSON 数据
     */
    static sanitizeJson(obj: any): any {
        if (typeof obj !== 'object' || obj === null) {
            return obj;
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.sanitizeJson(item));
        }

        const result: any = {};
        for (const [key, value] of Object.entries(obj)) {
            if (value === null || value === undefined) {
                continue; // 跳过 null/undefined 值
            }

            if (typeof value === 'string') {
                result[key] = this.cleanString(value);
            } else if (typeof value === 'object') {
                result[key] = this.sanitizeJson(value);
            } else {
                result[key] = value;
            }
        }

        return result;
    }
}

/**
 * 错误处理工具
 */
export class ErrorHandler {
    /**
     * 处理数据库错误
     */
    static handleDatabaseError(error: any, operation: string): never {
        console.error(`数据库操作错误 [${operation}]:`, error);

        if (error.code === 'SQLITE_CONSTRAINT') {
            if (error.message.includes('UNIQUE constraint failed')) {
                throw new Error('数据已存在，不能重复创建');
            } else if (error.message.includes('FOREIGN KEY constraint failed')) {
                throw new Error('关联数据不存在，请检查引用关系');
            }
        } else if (error.code === 'SQLITE_BUSY') {
            throw new Error('数据库繁忙，请稍后重试');
        } else if (error.code === 'SQLITE_LOCKED') {
            throw new Error('数据库被锁定，请稍后重试');
        }

        throw new Error(`数据库操作失败: ${error.message}`);
    }

    /**
     * 记录迁移错误
     */
    static logMigrationError(operation: string, data: any, error: any): void {
        const errorLog = {
            timestamp: new Date().toISOString(),
            operation,
            data: JSON.stringify(data, null, 2),
            error: {
                message: error.message,
                stack: error.stack,
                code: error.code
            }
        };

        console.error('迁移错误:', errorLog);

        // 可以选择将错误写入文件或数据库
        // this.writeErrorLog(errorLog);
    }
}