PRAGMA foreign_keys = ON;
BEGIN;

-- 1) 计算器：分组与工具
CREATE TABLE IF NOT EXISTS calculator_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS calculators (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_id INTEGER REFERENCES calculator_groups(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  url TEXT UNIQUE NOT NULL,
  description TEXT,
  is_hot INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calculators_group_id ON calculators(group_id);
CREATE INDEX IF NOT EXISTS idx_calculators_url ON calculators(url);

-- 2) 瘦身内容主表
CREATE TABLE IF NOT EXISTS slim_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('faq','howto','case')),
  title TEXT NOT NULL,
  summary TEXT,
  content TEXT,
  status TEXT DEFAULT 'published',
  reading_time INTEGER,
  priority INTEGER DEFAULT 0,
  featured INTEGER DEFAULT 0,
  difficulty TEXT,
  industry TEXT,
  target_tool TEXT,
  tags TEXT DEFAULT '[]',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slim_content_slug ON slim_content(slug);
CREATE INDEX IF NOT EXISTS idx_slim_content_type ON slim_content(type);
CREATE INDEX IF NOT EXISTS idx_slim_content_updated ON slim_content(updated_at);

-- 3) 内容差异化详情（JSON）
CREATE TABLE IF NOT EXISTS slim_content_details (
  content_id INTEGER PRIMARY KEY REFERENCES slim_content(id) ON DELETE CASCADE,
  details TEXT
);

-- 4) 术语（如需保留）
CREATE TABLE IF NOT EXISTS glossary_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  definition TEXT NOT NULL,
  first_letter CHAR(1),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX IF NOT EXISTS idx_glossary_title ON glossary_terms(title);

-- 5) 静态内容类型映射（用于兼容 join）
CREATE TABLE IF NOT EXISTS content_types_static (
  id INTEGER PRIMARY KEY,
  type_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL
);

INSERT OR IGNORE INTO content_types_static(id, type_name, display_name) VALUES
  (1,'faq','FAQ'),
  (2,'howto','How-to'),
  (3,'case','Case Study');

COMMIT;

