#!/usr/bin/env tsx

/**
 * 性能基线测试脚本
 * 在迁移前建立性能基线，用于后续对比
 */

import { getDatabase } from '../src/lib/db/client';
import fs from 'fs';
import path from 'path';

interface BenchmarkResult {
    operation: string;
    duration: number;
    memory: number;
    success: boolean;
    error?: string;
}

interface BenchmarkReport {
    timestamp: string;
    environment: string;
    results: BenchmarkResult[];
    summary: {
        totalDuration: number;
        averageDuration: number;
        memoryUsage: number;
        successRate: number;
    };
}

class PerformanceBenchmark {
    private results: BenchmarkResult[] = [];
    private startTime: number;

    constructor() {
        this.startTime = Date.now();
        this.setupPerformanceMonitoring();
    }

    /**
     * 设置性能监控
     */
    private setupPerformanceMonitoring(): void {
        // 监控内存使用
        if (typeof process !== 'undefined') {
            setInterval(() => {
                const memoryUsage = process.memoryUsage();
                console.log(`内存使用: ${Math.round(memoryUsage.heapUsed / 1024 / 1024)}MB`);
            }, 5000);
        }
    }

    /**
     * 运行基准测试
     */
    async runBenchmarks(): Promise<BenchmarkReport> {
        console.log('🏃‍♂️ 开始性能基线测试...');

        try {
            // 数据库连接性能
            await this.benchmarkDatabaseConnection();

            // 空查询性能
            await this.benchmarkEmptyQueries();

            // 简单插入性能
            await this.benchmarkInsertOperations();

            // 简单查询性能
            await this.benchmarkSelectOperations();

            // 索引查询性能
            await this.benchmarkIndexedQueries();

            // 事务性能
            await this.benchmarkTransactions();

            // 批量操作性能
            await this.benchmarkBatchOperations();

            // FTS5 搜索性能
            await this.benchmarkFTSSearch();

            // 生成报告
            const report = this.generateReport();
            await this.saveReport(report);

            console.log('✅ 性能基线测试完成');
            this.printSummary(report);

            return report;
        } catch (error) {
            console.error('❌ 性能测试失败:', error);
            throw error;
        }
    }

    /**
     * 测试数据库连接性能
     */
    private async benchmarkDatabaseConnection(): Promise<void> {
        const operation = '数据库连接';
        const startMemory = this.getMemoryUsage();

        try {
            const startTime = Date.now();

            // 多次连接测试
            for (let i = 0; i < 10; i++) {
                const db = getDatabase();
                // 执行简单查询验证连接
                db.prepare('SELECT 1').get();
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试空查询性能
     */
    private async benchmarkEmptyQueries(): Promise<void> {
        const operation = '空查询';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            const startTime = Date.now();

            const stmt = db.prepare('SELECT 1');
            for (let i = 0; i < 1000; i++) {
                stmt.get();
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试插入操作性能
     */
    private async benchmarkInsertOperations(): Promise<void> {
        const operation = '插入操作';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            const startTime = Date.now();

            // 创建测试表
            db.exec(`
                CREATE TABLE IF NOT EXISTS benchmark_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL,
                    value INTEGER,
                    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
                )
            `);

            // 插入测试数据
            const stmt = db.prepare('INSERT INTO benchmark_test (name, value) VALUES (?, ?)');
            for (let i = 0; i < 100; i++) {
                stmt.run(`test_${i}`, Math.floor(Math.random() * 1000));
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试查询操作性能
     */
    private async benchmarkSelectOperations(): Promise<void> {
        const operation = '查询操作';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            // 创建测试数据
            db.exec(`
                CREATE TABLE IF NOT EXISTS benchmark_select_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    category TEXT,
                    value REAL,
                    description TEXT
                )
            `);

            const insertStmt = db.prepare('INSERT INTO benchmark_select_test (category, value, description) VALUES (?, ?, ?)');
            for (let i = 0; i < 100; i++) {
                insertStmt.run(
                    `category_${i % 10}`,
                    Math.random() * 100,
                    `Description for item ${i}`
                );
            }

            // 测试查询性能
            const startTime = Date.now();

            const selectStmt = db.prepare('SELECT * FROM benchmark_select_test WHERE category = ?');
            for (let i = 0; i < 50; i++) {
                selectStmt.all(`category_${i % 10}`);
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_select_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试索引查询性能
     */
    private async benchmarkIndexedQueries(): Promise<void> {
        const operation = '索引查询';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            // 创建测试表和索引
            db.exec(`
                CREATE TABLE IF NOT EXISTS benchmark_index_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    slug TEXT UNIQUE,
                    title TEXT NOT NULL,
                    content TEXT
                )
            `);

            db.exec('CREATE INDEX IF NOT EXISTS idx_benchmark_title ON benchmark_index_test(title)');

            // 插入测试数据
            const insertStmt = db.prepare('INSERT INTO benchmark_index_test (slug, title, content) VALUES (?, ?, ?)');
            for (let i = 0; i < 100; i++) {
                insertStmt.run(
                    `slug_${i}`,
                    `Title ${i}`,
                    `Content for item ${i} with some text to make it longer`
                );
            }

            // 测试索引查询
            const startTime = Date.now();

            const selectByTitle = db.prepare('SELECT * FROM benchmark_index_test WHERE title = ?');
            for (let i = 0; i < 50; i++) {
                selectByTitle.all(`Title ${i % 20}`);
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_index_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试事务性能
     */
    private async benchmarkTransactions(): Promise<void> {
        const operation = '事务操作';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            const startTime = Date.now();

            // 创建测试表
            db.exec(`
                CREATE TABLE IF NOT EXISTS benchmark_transaction_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT,
                    value INTEGER
                )
            `);

            // 测试事务性能
            for (let i = 0; i < 10; i++) {
                db.transaction(() => {
                    const stmt = db.prepare('INSERT INTO benchmark_transaction_test (name, value) VALUES (?, ?)');
                    for (let j = 0; j < 10; j++) {
                        stmt.run(`transaction_${i}_${j}`, Math.floor(Math.random() * 100));
                    }
                })();
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_transaction_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试批量操作性能
     */
    private async benchmarkBatchOperations(): Promise<void> {
        const operation = '批量操作';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            const startTime = Date.now();

            // 创建测试表
            db.exec(`
                CREATE TABLE IF NOT EXISTS benchmark_batch_test (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    data TEXT,
                    number INTEGER
                )
            `);

            // 批量插入
            const stmt = db.prepare('INSERT INTO benchmark_batch_test (data, number) VALUES (?, ?)');
            const batch = db.transaction((items: any[]) => {
                for (const item of items) {
                    stmt.run(item.data, item.number);
                }
            });

            const batchData = Array.from({ length: 100 }, (_, i) => ({
                data: `batch_item_${i}`,
                number: Math.floor(Math.random() * 1000)
            }));

            batch(batchData);

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_batch_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 测试 FTS5 搜索性能
     */
    private async benchmarkFTSSearch(): Promise<void> {
        const operation = 'FTS5 搜索';
        const startMemory = this.getMemoryUsage();
        const db = getDatabase();

        try {
            const startTime = Date.now();

            // 创建虚拟表和测试数据
            db.exec(`
                CREATE VIRTUAL TABLE IF NOT EXISTS benchmark_fts_test USING fts5(title, content)
            `);

            const insertStmt = db.prepare('INSERT INTO benchmark_fts_test (title, content) VALUES (?, ?)');
            for (let i = 0; i < 50; i++) {
                insertStmt.run(
                    `Title ${i} about ${['statistics', 'math', 'data', 'analysis'][i % 4]}`,
                    `This is content about ${['statistics', 'math', 'data', 'analysis'][i % 4]} with some additional text for testing`
                );
            }

            // 测试搜索性能
            const searchStmt = db.prepare('SELECT * FROM benchmark_fts_test WHERE benchmark_fts_test MATCH ?');
            const searchTerms = ['statistics', 'math', 'data', 'analysis'];

            for (const term of searchTerms) {
                searchStmt.all(term);
            }

            const duration = Date.now() - startTime;
            this.addResult(operation, duration, this.getMemoryDelta(startMemory), true);

            // 清理测试数据
            db.exec('DROP TABLE IF EXISTS benchmark_fts_test');
        } catch (error) {
            this.addResult(operation, 0, 0, false, error.message);
        }
    }

    /**
     * 获取当前内存使用量
     */
    private getMemoryUsage(): number {
        if (typeof process !== 'undefined') {
            return process.memoryUsage().heapUsed;
        }
        return 0;
    }

    /**
     * 计算内存使用增量
     */
    private getMemoryDelta(start: number): number {
        return this.getMemoryUsage() - start;
    }

    /**
     * 添加测试结果
     */
    private addResult(operation: string, duration: number, memory: number, success: boolean, error?: string): void {
        this.results.push({
            operation,
            duration,
            memory,
            success,
            error
        });
    }

    /**
     * 生成测试报告
     */
    private generateReport(): BenchmarkReport {
        const successfulResults = this.results.filter(r => r.success);
        const totalDuration = this.results.reduce((sum, r) => sum + r.duration, 0);
        const averageDuration = successfulResults.length > 0
            ? successfulResults.reduce((sum, r) => sum + r.duration, 0) / successfulResults.length
            : 0;
        const memoryUsage = this.results.reduce((sum, r) => sum + Math.abs(r.memory), 0);
        const successRate = (successfulResults.length / this.results.length) * 100;

        return {
            timestamp: new Date().toISOString(),
            environment: process.env.NODE_ENV || 'development',
            results: this.results,
            summary: {
                totalDuration,
                averageDuration,
                memoryUsage,
                successRate
            }
        };
    }

    /**
     * 保存报告到文件
     */
    private async saveReport(report: BenchmarkReport): Promise<void> {
        const reportPath = path.join(process.cwd(), 'data', 'performance-baseline.json');
        fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
        console.log(`📊 性能报告已保存到: ${reportPath}`);
    }

    /**
     * 打印测试摘要
     */
    private printSummary(report: BenchmarkReport): void {
        console.log('\n📈 性能基线测试摘要:');
        console.log(`   总执行时间: ${report.summary.totalDuration}ms`);
        console.log(`   平均操作时间: ${Math.round(report.summary.averageDuration)}ms`);
        console.log(`   内存使用: ${Math.round(report.summary.memoryUsage / 1024 / 1024)}MB`);
        console.log(`   成功率: ${report.summary.successRate.toFixed(1)}%`);

        console.log('\n📋 详细结果:');
        report.results.forEach((result, index) => {
            const status = result.success ? '✅' : '❌';
            console.log(`   ${index + 1}. ${status} ${result.operation}: ${result.duration}ms (${Math.round(result.memory / 1024)}KB)`);
        });
    }
}

/**
 * 主执行函数
 */
async function main() {
    const benchmark = new PerformanceBenchmark();

    try {
        const report = await benchmark.runBenchmarks();
        console.log('\n🎉 性能基线测试完成！');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 性能测试失败:', error);
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

export { PerformanceBenchmark, BenchmarkReport };