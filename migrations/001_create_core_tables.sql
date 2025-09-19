-- Migration 001: Create Core Tables
-- Description: Initialize core database schema with calculator groups, calculators, and basic infrastructure
-- Version: 2025-09-19

-- Enable foreign key constraints
PRAGMA foreign_keys = ON;

-- Calculator Groups
CREATE TABLE calculator_groups (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Calculators
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

-- Content Management System Tables
CREATE TABLE slim_content (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('faq','howto','case','calculator')),
  title TEXT NOT NULL,
  summary TEXT,
  description TEXT,
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

-- Content Details (JSON storage for complex data structures)
CREATE TABLE slim_content_details (
  content_id INTEGER PRIMARY KEY REFERENCES slim_content(id) ON DELETE CASCADE,
  details TEXT
);

-- Static Content Types Configuration
CREATE TABLE content_types_static (
  type TEXT PRIMARY KEY,
  display_name TEXT NOT NULL,
  description TEXT,
  template TEXT,
  enabled INTEGER DEFAULT 1
);

-- Glossary Terms
CREATE TABLE glossary_terms (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  short_description TEXT,
  definition TEXT NOT NULL,
  example TEXT,
  category TEXT,
  related_terms TEXT DEFAULT '[]',
  tags TEXT DEFAULT '[]',
  difficulty TEXT DEFAULT 'beginner',
  first_letter TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- How-to Steps (Extended schema)
CREATE TABLE howto_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  howto_slug TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  step_title TEXT NOT NULL,
  step_content TEXT NOT NULL,
  step_image TEXT,
  step_code TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(howto_slug, step_order)
);

-- How-to Metadata
CREATE TABLE howto_metadata (
  howto_slug TEXT PRIMARY KEY,
  total_steps INTEGER DEFAULT 0,
  estimated_time INTEGER,
  prerequisites TEXT DEFAULT '[]',
  tools_needed TEXT DEFAULT '[]',
  difficulty_level TEXT DEFAULT 'beginner',
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migration Log (for tracking database changes)
CREATE TABLE migration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL,
  howto_slug TEXT,
  operation TEXT NOT NULL,
  status TEXT DEFAULT 'pending',
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME
);

-- Create indexes for performance
CREATE INDEX idx_calculators_group_id ON calculators(group_id);
CREATE INDEX idx_calculators_url ON calculators(url);
CREATE INDEX idx_slim_content_slug ON slim_content(slug);
CREATE INDEX idx_slim_content_type ON slim_content(type);
CREATE INDEX idx_slim_content_updated ON slim_content(updated_at);
CREATE INDEX idx_glossary_slug ON glossary_terms(slug);
CREATE INDEX idx_glossary_title ON glossary_terms(title);
CREATE INDEX idx_howto_steps_slug ON howto_steps(howto_slug);
CREATE INDEX idx_howto_steps_order ON howto_steps(howto_slug, step_order);
CREATE INDEX idx_migration_log_status ON migration_log(status);
CREATE INDEX idx_migration_log_howto ON migration_log(howto_slug);

-- Insert content types configuration
INSERT INTO content_types_static (type, display_name, description, template, enabled) VALUES
('faq', 'FAQ', 'Frequently Asked Questions', 'faq', 1),
('howto', 'How-To Guide', 'Step-by-step tutorials', 'howto', 1),
('case', 'Case Study', 'Real-world application examples', 'case', 1),
('calculator', 'Calculator', 'Interactive calculation tools', 'calculator', 1);
