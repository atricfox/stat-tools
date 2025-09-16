import Database from 'better-sqlite3';
import path from 'path';
import fs from 'node:fs';

let dbInstance: Database.Database | null = null;

/**
 * 获取数据库连接实例
 * 使用单例模式确保只有一个连接实例
 */
export function getDatabase(): Database.Database {
    if (dbInstance) return dbInstance;

    // Check if we're in a build/CI environment
    const isBuildEnvironment = process.env.NEXT_PHASE === 'phase-production-build' ||
                             process.argv.some(arg => arg.includes('next build'));

    // For development and build, always use local database
    // For production, use DATABASE_PATH if set, otherwise default to production path
    let dbPath: string;
    if (process.env.NODE_ENV === 'production' && !isBuildEnvironment) {
        dbPath = process.env.DATABASE_PATH || '/app/data/statcal.db';
    } else {
        dbPath = path.join(process.cwd(), 'data', 'statcal.db');
    }

    // Ensure data directory exists for development
    const dataDir = path.dirname(dbPath);
    if (process.env.NODE_ENV !== 'production' && !fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }

    // Check if database file exists before creating connection
    if (!fs.existsSync(dbPath)) {
        // In production environment, the database should already exist
        if (process.env.NODE_ENV === 'production') {
            throw new Error(`Database file not found: ${dbPath}`);
        }
        // In development, we'll let the database be created on first run
    }

    dbInstance = new Database(dbPath);

    // 启用外键约束
    dbInstance.pragma('foreign_keys = ON');

    // 性能优化配置
    dbInstance.pragma('journal_mode = WAL');     // Write-Ahead Logging 模式
    dbInstance.pragma('synchronous = NORMAL');    // 同步模式平衡性能和安全性
    dbInstance.pragma('cache_size = 1000');       // 缓存大小
    dbInstance.pragma('temp_store = MEMORY');      // 临时表存储在内存中
    dbInstance.pragma('mmap_size = 268435456');    // 256MB 内存映射

    return dbInstance;
}

/**
 * 关闭数据库连接
 */
export function closeDatabase(): void {
    if (dbInstance) {
        dbInstance.close();
        dbInstance = null;
    }
}

/**
 * 初始化数据库
 * 创建必要的表和索引
 */
export function initializeDatabase(): Database.Database {
    // 仅确保连接被创建并配置好 PRAGMA。
    // 注意：从现在起，所有 DDL 必须通过 migrations 执行，禁止在运行期创建/修改表结构。
    // 该方法保留以兼容旧调用方，但不再执行任何 DDL。
    return getDatabase();
}

// 应用关闭时清理数据库连接
if (typeof process !== 'undefined') {
    process.on('SIGINT', () => {
        closeDatabase();
        process.exit(0);
    });

    process.on('SIGTERM', () => {
        closeDatabase();
        process.exit(0);
    });

    process.on('exit', () => {
        closeDatabase();
    });
}

export { Database };
