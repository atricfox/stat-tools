-- Migration 005: Create Full-Text Search
-- Description: Set up FTS5 virtual table for content search functionality
-- Version: 2025-09-19

-- Create FTS5 virtual table for content search
CREATE VIRTUAL TABLE IF NOT EXISTS content_search USING fts5(
    title,
    content,
    summary,
    tags,
    content='slim_content',
    content_rowid='id',
    tokenize='porter unicode61'
);

-- Populate FTS table with existing content
INSERT INTO content_search(rowid, title, content, summary, tags)
SELECT id, title, content, summary, tags
FROM slim_content
WHERE status = 'published';

-- Create triggers to keep FTS table in sync
-- Insert trigger
CREATE TRIGGER slim_content_ai AFTER INSERT ON slim_content BEGIN
  INSERT INTO content_search(rowid, title, content, summary, tags)
  VALUES (new.id, new.title, new.content, new.summary, new.tags);
END;

-- Update trigger
CREATE TRIGGER slim_content_au AFTER UPDATE ON slim_content BEGIN
  INSERT INTO content_search(content_search, rowid, title, content, summary, tags)
  VALUES('delete', old.id, old.title, old.content, old.summary, old.tags);
  INSERT INTO content_search(rowid, title, content, summary, tags)
  VALUES (new.id, new.title, new.content, new.summary, new.tags);
END;

-- Delete trigger
CREATE TRIGGER slim_content_ad AFTER DELETE ON slim_content BEGIN
  INSERT INTO content_search(content_search, rowid, title, content, summary, tags)
  VALUES('delete', old.id, old.title, old.content, old.summary, old.tags);
END;