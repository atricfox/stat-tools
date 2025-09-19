-- Migration 007: HowTo Steps Schema Extension
-- Created: 2025-09-18
-- Description: Adds structured step support for How-To guides

-- HowTo steps table for structured step-by-step instructions
CREATE TABLE howto_steps (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL,           -- step identifier (e.g., step-1, step-2)
  howto_slug TEXT NOT NULL,     -- references slim_content.slug
  step_order INTEGER NOT NULL, -- 1, 2, 3...
  name TEXT NOT NULL,           -- step title
  description TEXT NOT NULL,    -- step content (supports markdown)
  tip TEXT,                     -- optional tip
  warning TEXT,                 -- optional warning
  image_url TEXT,               -- optional image
  image_alt TEXT,               -- image alt text
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (howto_slug) REFERENCES slim_content(slug) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_howto_steps_slug ON howto_steps(howto_slug);
CREATE INDEX idx_howto_steps_order ON howto_steps(howto_slug, step_order);
CREATE UNIQUE INDEX idx_howto_steps_unique ON howto_steps(howto_slug, step_order);

-- HowTo metadata table for additional structured data
CREATE TABLE howto_metadata (
  howto_slug TEXT PRIMARY KEY,
  prerequisites TEXT DEFAULT '[]',  -- JSON array of prerequisites
  outcomes TEXT DEFAULT '[]',       -- JSON array of expected outcomes  
  prefill_params TEXT DEFAULT '{}', -- JSON object for calculator prefill
  estimated_time INTEGER,           -- estimated completion time in minutes
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (howto_slug) REFERENCES slim_content(slug) ON DELETE CASCADE
);

-- Migration status tracking
CREATE TABLE migration_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  migration_name TEXT NOT NULL,
  howto_slug TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
  steps_extracted INTEGER DEFAULT 0,
  error_message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_migration_log_status ON migration_log(status);
CREATE INDEX idx_migration_log_howto ON migration_log(howto_slug);