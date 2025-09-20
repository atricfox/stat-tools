import Database from 'better-sqlite3';
import path from 'path';
import fs from 'node:fs';
import { createHash } from 'crypto';

// Add debug logging
const debug = process.env.NODE_ENV === 'development' || process.env.DEBUG === 'true';

// Global database connection
let dbInstance: Database.Database | null = null;
// Track if cleanup handlers are registered
let cleanupRegistered = false;

/**
 * 获取数据库连接
 *
 * 优先级顺序:
 * 1. Vercel 环境：从 /tmp 加载（如果需要，从 public 复制）
 * 2. DATABASE_PATH 环境变量指定的路径
 * 3. .next/data/statcal.db (构建后的数据库)
 * 4. data/statcal.db (源码中的数据库)
 *
 * 生产环境强制只读模式
 */
export function getDb(): Database.Database {
  if (dbInstance) return dbInstance;

  // 确定数据库路径
  const dbPath = getDatabasePath();

  // 验证数据库文件存在
  if (!fs.existsSync(dbPath)) {
    const error = new Error(
      `Database not found at: ${dbPath}\n` +
      `Please run 'npm run db:prepare' to create the database snapshot.`
    );
    console.error('[DB] Fatal:', error.message);
    throw error;
  }

  const isProduction = process.env.NODE_ENV === 'production';
  const isVercel = process.env.VERCEL === '1';

  try {
    if (debug) {
      console.log(`[DB] Connecting to database: ${dbPath}`);
      console.log(`[DB] Mode: ${isProduction ? 'PRODUCTION (read-only)' : 'DEVELOPMENT'}`);
      console.log(`[DB] Platform: ${isVercel ? 'Vercel' : 'Standard'}`);
    }

    // 创建数据库连接
    dbInstance = new Database(dbPath, {
      readonly: isProduction,  // 生产环境只读
      fileMustExist: true      // 文件必须存在
    });

    // 配置优化
    if (isProduction) {
      dbInstance.pragma('query_only = 1');    // 强制只读
      dbInstance.pragma('foreign_keys = ON'); // 外键约束
    } else {
      // 开发环境优化
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
      dbInstance.pragma('cache_size = 1000');
      dbInstance.pragma('temp_store = memory');
      dbInstance.pragma('foreign_keys = ON');
    }

    // 健康检查
    validateDatabaseHealth(dbInstance);

    if (debug) {
      console.log('[DB] Database connected successfully');
    }

    // 清理钩子 - 只注册一次
    if (typeof process !== 'undefined' && !cleanupRegistered) {
      cleanupRegistered = true;

      // 使用 once 而不是 on 来避免重复监听器
      // 或者在添加前先移除旧的监听器
      process.removeListener('exit', closeDb);
      process.removeListener('SIGINT', closeDb);
      process.removeListener('SIGTERM', closeDb);

      process.once('exit', closeDb);
      process.once('SIGINT', () => {
        closeDb();
        process.exit(0);
      });
      process.once('SIGTERM', () => {
        closeDb();
        process.exit(0);
      });
    }

    return dbInstance;
  } catch (error: any) {
    console.error('[DB] Failed to connect:', error.message);
    throw error;
  }
}

/**
 * 获取数据库路径
 */
function getDatabasePath(): string {
  const isVercel = process.env.VERCEL === '1';
  const isProduction = process.env.NODE_ENV === 'production';

  // Vercel 环境特殊处理：使用 /tmp 目录
  if (isVercel && isProduction) {
    return ensureVercelDatabase();
  }

  // 获取正确的基础路径
  const basePath = process.cwd().includes('/.next/server/app')
    ? path.resolve(process.cwd(), '../../../')  // 从构建输出目录返回到项目根
    : process.cwd();

  // 1. 环境变量指定的路径（最高优先级）
  if (process.env.DATABASE_PATH) {
    const envPath = process.env.DATABASE_PATH.startsWith('/')
      ? process.env.DATABASE_PATH
      : path.join(basePath, process.env.DATABASE_PATH);

    if (fs.existsSync(envPath)) {
      return envPath;
    }
  }

  // 2. 构建目录（生产环境默认）
  const buildPath = path.join(basePath, '.next', 'data', 'statcal.db');
  if (fs.existsSync(buildPath)) {
    return buildPath;
  }

  // 3. 源码目录（开发环境默认）
  const sourcePath = path.join(basePath, 'data', 'statcal.db');
  if (fs.existsSync(sourcePath)) {
    return sourcePath;
  }

  // 4. 最后尝试 DATABASE_URL（兼容旧配置）
  if (process.env.DATABASE_URL) {
    const urlPath = process.env.DATABASE_URL.replace('file:', '');
    const resolvedUrlPath = urlPath.startsWith('/')
      ? urlPath
      : path.join(basePath, urlPath);

    if (fs.existsSync(resolvedUrlPath)) {
      return resolvedUrlPath;
    }
  }

  // 没有找到数据库
  return sourcePath; // 返回期望的路径用于错误消息
}

/**
 * 确保 Vercel 环境下的数据库可用
 * 从 public/db 复制到 /tmp 目录
 */
function ensureVercelDatabase(): string {
  const tmpDbPath = '/tmp/statcal.db';
  const tmpMetaPath = '/tmp/statcal.db.meta';

  // 检查是否已经复制过（使用元数据文件标记）
  if (fs.existsSync(tmpDbPath) && fs.existsSync(tmpMetaPath)) {
    try {
      const meta = JSON.parse(fs.readFileSync(tmpMetaPath, 'utf-8'));
      const dbStats = fs.statSync(tmpDbPath);

      // 验证数据库完整性（大小和时间戳）
      if (meta.size === dbStats.size &&
          Date.now() - meta.timestamp < 3600000) { // 1小时内有效
        if (debug) {
          console.log('[DB] Using cached database from /tmp');
        }
        return tmpDbPath;
      }
    } catch (e) {
      // 元数据损坏，重新复制
      console.warn('[DB] Metadata corrupted, re-copying database');
    }
  }

  // 需要从 public 目录复制
  const publicDbPath = path.join(process.cwd(), 'public', 'db', 'statcal.db');

  if (!fs.existsSync(publicDbPath)) {
    throw new Error(
      `Database not found in public directory: ${publicDbPath}\n` +
      `This is required for Vercel deployment. Run 'npm run db:prepare' locally.`
    );
  }

  try {
    if (debug) {
      console.log(`[DB] Copying database from ${publicDbPath} to ${tmpDbPath}`);
    }

    // 复制数据库文件
    const dbContent = fs.readFileSync(publicDbPath);
    fs.writeFileSync(tmpDbPath, dbContent);

    // 复制 WAL 和 SHM 文件（如果存在）
    const walPath = publicDbPath + '-wal';
    const shmPath = publicDbPath + '-shm';
    if (fs.existsSync(walPath)) {
      fs.copyFileSync(walPath, tmpDbPath + '-wal');
    }
    if (fs.existsSync(shmPath)) {
      fs.copyFileSync(shmPath, tmpDbPath + '-shm');
    }

    // 写入元数据
    const dbStats = fs.statSync(tmpDbPath);
    const meta = {
      size: dbStats.size,
      timestamp: Date.now(),
      checksum: calculateChecksum(dbContent)
    };
    fs.writeFileSync(tmpMetaPath, JSON.stringify(meta));

    if (debug) {
      console.log(`[DB] Database copied successfully (${(dbStats.size / 1024 / 1024).toFixed(2)} MB)`);
    }

    return tmpDbPath;
  } catch (error: any) {
    throw new Error(
      `Failed to copy database to /tmp: ${error.message}\n` +
      `This is required for Vercel serverless functions.`
    );
  }
}

/**
 * 计算文件校验和
 */
function calculateChecksum(content: Buffer): string {
  return createHash('sha256').update(content).digest('hex').substring(0, 16);
}

/**
 * 验证数据库健康状态
 */
function validateDatabaseHealth(db: Database.Database): void {
  try {
    // 基础连接测试
    const result = db.prepare('SELECT 1 as test').get() as any;
    if (!result || result.test !== 1) {
      throw new Error('Database connection test failed');
    }

    // 验证核心表存在
    const tables = db.prepare(`
      SELECT name FROM sqlite_master
      WHERE type='table' AND name NOT LIKE 'sqlite_%'
    `).all() as { name: string }[];

    const requiredTables = ['calculators', 'calculator_groups', 'slim_content', 'glossary_terms'];
    const tableNames = tables.map(t => t.name);

    for (const required of requiredTables) {
      if (!tableNames.includes(required)) {
        throw new Error(`Required table missing: ${required}`);
      }
    }

    // 检查数据完整性
    const counts: Record<string, number> = {};
    for (const table of requiredTables) {
      const row = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
      counts[table] = row.count;
    }

    // 验证最小数据要求
    if (counts.calculators < 5) {
      console.warn(`[DB] Warning: Low data in calculators table (${counts.calculators} rows)`);
    }
    if (counts.glossary_terms < 5) {
      console.warn(`[DB] Warning: Low data in glossary_terms table (${counts.glossary_terms} rows)`);
    }

    if (debug) {
      console.log('[DB] Health check passed:', counts);
    }
  } catch (error: any) {
    throw new Error(`Database health check failed: ${error.message}`);
  }
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    // Reset cleanup flag when closing
    cleanupRegistered = false;
  }
}

// Health check function
export function checkDbConnection(): boolean {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as test').get();
    return result !== null;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
