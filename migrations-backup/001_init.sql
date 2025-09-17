-- sqlite3 initialization table structure: calculator and group_meta

CREATE TABLE IF NOT EXISTS calculator (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  url TEXT NOT NULL,
  group_name TEXT,
  is_hot INTEGER DEFAULT 0,
  is_new INTEGER DEFAULT 0,
  sort_order INTEGER,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS group_meta (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  group_name TEXT UNIQUE NOT NULL,
  display_name TEXT,
  sort_order INTEGER
);

