#!/usr/bin/env tsx
/**
 * 数据库准备脚本
 * 用于在构建时生成完整的 SQLite 数据库快照
 *
 * 执行流程:
 * 1. 清理旧快照
 * 2. 创建新数据库
 * 3. 执行所有迁移
 * 4. 执行种子数据
 * 5. 验证数据完整性
 * 6. 输出到指定位置
 */

import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';

const PROJECT_ROOT = path.resolve(__dirname, '..');
const MIGRATIONS_DIR = path.join(PROJECT_ROOT, 'migrations');
const OUTPUT_DB_PATH = path.join(PROJECT_ROOT, 'data', 'statcal.db');
const BUILD_DB_PATH = path.join(PROJECT_ROOT, '.next', 'data', 'statcal.db');
const PUBLIC_DB_PATH = path.join(PROJECT_ROOT, 'public', 'db', 'statcal.db');

// 颜色输出
const log = {
  info: (msg: string) => console.log(`\x1b[36m[DB-PREPARE]\x1b[0m ${msg}`),
  success: (msg: string) => console.log(`\x1b[32m[DB-PREPARE]\x1b[0m ✓ ${msg}`),
  error: (msg: string) => console.error(`\x1b[31m[DB-PREPARE]\x1b[0m ✗ ${msg}`),
  warn: (msg: string) => console.warn(`\x1b[33m[DB-PREPARE]\x1b[0m ⚠ ${msg}`)
};

interface DBStats {
  tables: { name: string; count: number }[];
  totalRows: number;
  dbSize: number;
  checksum: string;
}

class DatabasePreparer {
  private db: Database.Database | null = null;

  async prepare(): Promise<void> {
    try {
      log.info('Starting database preparation...');

      // 步骤1: 清理旧快照
      this.cleanup();

      // 步骤2: 创建新数据库
      this.createDatabase();

      // 步骤3: 执行迁移
      await this.runMigrations();

      // 步骤4: 验证数据
      const stats = this.validateDatabase();

      // 步骤5: 复制到构建目录
      this.copyToBuildDirectory();

      // 步骤6: 复制到 public 目录
      this.copyToPublicDirectory();

      // 步骤7: 生成元数据
      this.generateMetadata(stats);

      log.success('Database preparation completed successfully!');
      this.printStats(stats);

    } catch (error) {
      log.error(`Database preparation failed: ${error}`);
      process.exit(1);
    } finally {
      this.closeDatabase();
    }
  }

  private cleanup(): void {
    log.info('Cleaning up old database snapshots...');

    // 确保数据目录存在
    const dataDir = path.dirname(OUTPUT_DB_PATH);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }

    // 删除旧的数据库文件
    if (fs.existsSync(OUTPUT_DB_PATH)) {
      fs.unlinkSync(OUTPUT_DB_PATH);
      log.info(`Removed old database: ${OUTPUT_DB_PATH}`);
    }

    // 清理 WAL 和 SHM 文件
    const walPath = `${OUTPUT_DB_PATH}-wal`;
    const shmPath = `${OUTPUT_DB_PATH}-shm`;
    if (fs.existsSync(walPath)) fs.unlinkSync(walPath);
    if (fs.existsSync(shmPath)) fs.unlinkSync(shmPath);
  }

  private createDatabase(): void {
    log.info(`Creating new database at: ${OUTPUT_DB_PATH}`);

    this.db = new Database(OUTPUT_DB_PATH);

    // 优化设置
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('synchronous = NORMAL');
    this.db.pragma('cache_size = 1000');
    this.db.pragma('temp_store = memory');
    this.db.pragma('foreign_keys = ON');

    log.success('Database created successfully');
  }

  private async runMigrations(): Promise<void> {
    log.info('Running migrations...');

    if (!fs.existsSync(MIGRATIONS_DIR)) {
      throw new Error(`Migrations directory not found: ${MIGRATIONS_DIR}`);
    }

    // 获取所有迁移文件并排序
    const migrationFiles = fs.readdirSync(MIGRATIONS_DIR)
      .filter(file => file.endsWith('.sql'))
      .sort();

    if (migrationFiles.length === 0) {
      log.warn('No migration files found');
      return;
    }

    // 创建迁移历史表
    this.db!.exec(`
      CREATE TABLE IF NOT EXISTS migrations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        filename TEXT UNIQUE NOT NULL,
        applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        checksum TEXT
      )
    `);

    let appliedCount = 0;
    for (const file of migrationFiles) {
      const filePath = path.join(MIGRATIONS_DIR, file);
      const sql = fs.readFileSync(filePath, 'utf-8');

      // 计算校验和
      const checksum = this.calculateChecksum(sql);

      // 检查是否已应用
      const existing = this.db!.prepare(
        'SELECT * FROM migrations WHERE filename = ?'
      ).get(file) as any;

      if (existing) {
        if (existing.checksum !== checksum) {
          log.warn(`Migration ${file} has been modified since last run`);
        }
        continue;
      }

      try {
        log.info(`Applying migration: ${file}`);
        this.db!.exec(sql);

        // 记录迁移
        this.db!.prepare(
          'INSERT INTO migrations (filename, checksum) VALUES (?, ?)'
        ).run(file, checksum);

        appliedCount++;
      } catch (error: any) {
        // 处理某些可接受的错误
        if (this.isAcceptableError(error.message)) {
          log.warn(`Skipping ${file}: ${error.message}`);
          continue;
        }
        throw new Error(`Migration ${file} failed: ${error.message}`);
      }
    }

    log.success(`Applied ${appliedCount} new migrations (${migrationFiles.length} total)`);
  }

  private validateDatabase(): DBStats {
    log.info('Validating database integrity...');

    // 获取所有表
    const tables = this.db!.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
      ORDER BY name
    `).all() as { name: string }[];

    const stats: DBStats = {
      tables: [],
      totalRows: 0,
      dbSize: 0,
      checksum: ''
    };

    // 验证核心表存在
    const requiredTables = [
      'calculator_groups',
      'calculators',
      'slim_content',
      'glossary_terms'
    ];

    for (const required of requiredTables) {
      if (!tables.find(t => t.name === required)) {
        throw new Error(`Required table missing: ${required}`);
      }
    }

    // 统计每个表的行数
    for (const table of tables) {
      const count = (this.db!.prepare(
        `SELECT COUNT(*) as count FROM ${table.name}`
      ).get() as { count: number }).count;

      stats.tables.push({ name: table.name, count });
      stats.totalRows += count;
    }

    // 获取数据库文件大小
    const dbStats = fs.statSync(OUTPUT_DB_PATH);
    stats.dbSize = dbStats.size;

    // 计算数据库校验和
    const dbContent = fs.readFileSync(OUTPUT_DB_PATH);
    stats.checksum = this.calculateChecksum(dbContent.toString('base64'));

    // 验证关键数据
    const minRequirements = {
      calculators: 5,
      glossary_terms: 5,
      slim_content: 3
    };

    for (const [table, minCount] of Object.entries(minRequirements)) {
      const actual = stats.tables.find(t => t.name === table)?.count || 0;
      if (actual < minCount) {
        throw new Error(
          `Table ${table} has insufficient data: ${actual} rows (minimum: ${minCount})`
        );
      }
    }

    log.success('Database validation passed');
    return stats;
  }

  private copyToBuildDirectory(): void {
    const buildDir = path.dirname(BUILD_DB_PATH);

    // 创建构建目录
    if (!fs.existsSync(buildDir)) {
      fs.mkdirSync(buildDir, { recursive: true });
    }

    // 复制数据库文件
    log.info(`Copying database to build directory: ${BUILD_DB_PATH}`);
    fs.copyFileSync(OUTPUT_DB_PATH, BUILD_DB_PATH);

    log.success('Database copied to build directory');
  }

  private copyToPublicDirectory(): void {
    const publicDir = path.dirname(PUBLIC_DB_PATH);

    // 创建 public/db 目录
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    // 复制数据库文件到 public 目录
    log.info(`Copying database to public directory: ${PUBLIC_DB_PATH}`);
    fs.copyFileSync(OUTPUT_DB_PATH, PUBLIC_DB_PATH);

    // 复制 WAL 和 SHM 文件如果存在
    const walPath = `${OUTPUT_DB_PATH}-wal`;
    const shmPath = `${OUTPUT_DB_PATH}-shm`;
    if (fs.existsSync(walPath)) {
      fs.copyFileSync(walPath, `${PUBLIC_DB_PATH}-wal`);
    }
    if (fs.existsSync(shmPath)) {
      fs.copyFileSync(shmPath, `${PUBLIC_DB_PATH}-shm`);
    }

    // 验证文件大小
    const stats = fs.statSync(PUBLIC_DB_PATH);
    log.success(`Database copied to public directory (${(stats.size / 1024 / 1024).toFixed(2)} MB)`);
  }

  private generateMetadata(stats: DBStats): void {
    const metaPath = path.join(PROJECT_ROOT, 'data', 'db-meta.json');

    const metadata = {
      version: 1,
      generatedAt: new Date().toISOString(),
      stats,
      environment: {
        node: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };

    fs.writeFileSync(metaPath, JSON.stringify(metadata, null, 2));
    log.success(`Metadata saved to: ${metaPath}`);
  }

  private printStats(stats: DBStats): void {
    console.log('\n' + '='.repeat(50));
    console.log('DATABASE STATISTICS');
    console.log('='.repeat(50));
    console.log(`Total tables: ${stats.tables.length}`);
    console.log(`Total rows: ${stats.totalRows}`);
    console.log(`Database size: ${(stats.dbSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`Checksum: ${stats.checksum.substring(0, 16)}...`);
    console.log('\nTable row counts:');
    for (const table of stats.tables) {
      console.log(`  ${table.name.padEnd(30)} ${table.count} rows`);
    }
    console.log('='.repeat(50) + '\n');
  }

  private closeDatabase(): void {
    if (this.db) {
      // 确保 WAL 被合并
      this.db.pragma('wal_checkpoint(TRUNCATE)');
      this.db.close();
      this.db = null;
    }
  }

  private calculateChecksum(content: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(content).digest('hex');
  }

  private isAcceptableError(message: string): boolean {
    const acceptablePatterns = [
      'duplicate column',
      'already exists',
      'no such column', // 对于 ALTER TABLE 添加已存在的列
    ];

    return acceptablePatterns.some(pattern =>
      message.toLowerCase().includes(pattern)
    );
  }
}

// 执行
if (require.main === module) {
  const preparer = new DatabasePreparer();
  preparer.prepare().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}