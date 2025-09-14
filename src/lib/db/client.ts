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
    const db = getDatabase();

    // 创建表结构
    const schemaSQL = `
        -- 计算器分组
        CREATE TABLE IF NOT EXISTS calculator_groups (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 计算器/工具
        CREATE TABLE IF NOT EXISTS calculators (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            group_id INTEGER REFERENCES calculator_groups(id),
            name TEXT NOT NULL,
            url TEXT UNIQUE NOT NULL,
            description TEXT,
            is_hot BOOLEAN DEFAULT FALSE,
            is_new BOOLEAN DEFAULT FALSE,
            sort_order INTEGER DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 术语表术语
        CREATE TABLE IF NOT EXISTS glossary_terms (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            short_description TEXT,
            definition TEXT NOT NULL,
            first_letter CHAR(1),
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 用于组织内容的分类
        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 术语-分类关系
        CREATE TABLE IF NOT EXISTS term_categories (
            term_id INTEGER REFERENCES glossary_terms(id),
            category_id INTEGER REFERENCES categories(id),
            PRIMARY KEY (term_id, category_id)
        );

        -- 内容类型（操作指南、常见问题、案例）
        CREATE TABLE IF NOT EXISTS content_types (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_name TEXT UNIQUE NOT NULL,
            display_name TEXT NOT NULL
        );

        -- 内容项（操作指南、常见问题、案例研究）
        CREATE TABLE IF NOT EXISTS content_items (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type_id INTEGER REFERENCES content_types(id),
            slug TEXT NOT NULL,
            title TEXT NOT NULL,
            summary TEXT,
            content TEXT,
            status TEXT DEFAULT 'published',
            reading_time INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(type_id, slug)
        );

        -- 内容元数据
        CREATE TABLE IF NOT EXISTS content_metadata (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER REFERENCES content_items(id),
            meta_key TEXT NOT NULL,
            meta_value TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 操作指南步骤
        CREATE TABLE IF NOT EXISTS howto_steps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER REFERENCES content_items(id),
            step_order INTEGER NOT NULL,
            step_id TEXT NOT NULL,
            name TEXT NOT NULL,
            description TEXT NOT NULL,
            tip TEXT,
            warning TEXT,
            UNIQUE(content_id, step_order)
        );

        -- 主题中心
        CREATE TABLE IF NOT EXISTS topics (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            slug TEXT UNIQUE NOT NULL,
            title TEXT NOT NULL,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        -- 主题-指南关系
        CREATE TABLE IF NOT EXISTS topic_guides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER REFERENCES topics(id),
            title TEXT NOT NULL,
            description TEXT,
            icon TEXT,
            href TEXT,
            sort_order INTEGER DEFAULT 0
        );

        -- 主题-常见问题关系
        CREATE TABLE IF NOT EXISTS topic_faqs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            topic_id INTEGER REFERENCES topics(id),
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            href TEXT,
            sort_order INTEGER DEFAULT 0
        );

        -- 关系/链接表
        CREATE TABLE IF NOT EXISTS term_relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_term_id INTEGER REFERENCES glossary_terms(id),
            to_term_id INTEGER REFERENCES glossary_terms(id),
            relationship_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(from_term_id, to_term_id, relationship_type)
        );

        CREATE TABLE IF NOT EXISTS content_relationships (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            from_content_id INTEGER REFERENCES content_items(id),
            to_content_id INTEGER REFERENCES content_items(id),
            relationship_type TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(from_content_id, to_content_id, relationship_type)
        );

        CREATE TABLE IF NOT EXISTS content_calculator_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            content_id INTEGER REFERENCES content_items(id),
            calculator_id INTEGER REFERENCES calculators(id),
            link_type TEXT DEFAULT 'related',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(content_id, calculator_id, link_type)
        );

        CREATE TABLE IF NOT EXISTS term_calculator_links (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            term_id INTEGER REFERENCES glossary_terms(id),
            calculator_id INTEGER REFERENCES calculators(id),
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(term_id, calculator_id)
        );
    `;

    // 执行表创建
    db.exec(schemaSQL);

    // 创建索引
    const indexSQL = `
        -- 关键性能索引
        CREATE INDEX IF NOT EXISTS idx_glossary_terms_slug ON glossary_terms(slug);
        CREATE INDEX IF NOT EXISTS idx_glossary_terms_title ON glossary_terms(title);
        CREATE INDEX IF NOT EXISTS idx_content_items_slug ON content_items(slug);
        CREATE INDEX IF NOT EXISTS idx_content_items_type ON content_items(type_id);
        CREATE INDEX IF NOT EXISTS idx_calculators_url ON calculators(url);
        CREATE INDEX IF NOT EXISTS idx_term_categories_term_id ON term_categories(term_id);
        CREATE INDEX IF NOT EXISTS idx_calculators_group_id ON calculators(group_id);
        CREATE INDEX IF NOT EXISTS idx_glossary_terms_first_letter ON glossary_terms(first_letter);
    `;

    db.exec(indexSQL);

    // 创建全文搜索虚拟表
    const ftsSQL = `
        CREATE VIRTUAL TABLE IF NOT EXISTS content_search USING fts5(
            title,
            content,
            tokenize='porter unicode61'
        );
    `;

    db.exec(ftsSQL);

    // 创建触发器维护搜索索引
    const triggersSQL = `
        CREATE TRIGGER IF NOT EXISTS content_search_insert
        AFTER INSERT ON content_items
        BEGIN
            INSERT INTO content_search (rowid, title, content)
            VALUES (new.id, new.title, new.content);
        END;

        CREATE TRIGGER IF NOT EXISTS content_search_delete
        AFTER DELETE ON content_items
        BEGIN
            DELETE FROM content_search WHERE rowid = old.id;
        END;

        CREATE TRIGGER IF NOT EXISTS content_search_update
        AFTER UPDATE ON content_items
        BEGIN
            DELETE FROM content_search WHERE rowid = old.id;
            INSERT INTO content_search (rowid, title, content)
            VALUES (new.id, new.title, new.content);
        END;
    `;

    db.exec(triggersSQL);

    return db;
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