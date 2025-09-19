-- Initial database schema migration
-- Created: 2025-09-17
-- Description: Creates all core tables and indexes

-- Calculator groups table
CREATE TABLE calculator_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calculators table
CREATE TABLE calculators (
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

-- Indexes for calculators
CREATE INDEX idx_calculators_group_id ON calculators(group_id);
CREATE INDEX idx_calculators_url ON calculators(url);

-- Content management tables
CREATE TABLE slim_content (
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

-- Indexes for content
CREATE INDEX idx_slim_content_slug ON slim_content(slug);
CREATE INDEX idx_slim_content_type ON slim_content(type);
CREATE INDEX idx_slim_content_updated ON slim_content(updated_at);

-- Content details table for complex structured data
CREATE TABLE slim_content_details (
  content_id INTEGER PRIMARY KEY REFERENCES slim_content(id) ON DELETE CASCADE,
  details TEXT
);

-- Glossary terms table
CREATE TABLE glossary_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  definition TEXT NOT NULL,
  first_letter CHAR(1),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for glossary
CREATE INDEX idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_title ON glossary_terms(title);

-- Content types lookup table
CREATE TABLE content_types_static (
  id INTEGER PRIMARY KEY,
  type_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL
);

-- Full-text search table
CREATE VIRTUAL TABLE content_search USING fts5(
  title,
  summary,
  content,
  tokenize='porter unicode61'
);