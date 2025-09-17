-- Compatibility views and minimal search index for transition.
PRAGMA foreign_keys = ON;
BEGIN;

-- 1) Legacy-like content view (old content_items + content_types join)
CREATE VIEW IF NOT EXISTS v_content_items_legacy AS
SELECT
  sc.id,
  cts.id AS type_id,
  sc.slug,
  sc.title,
  sc.summary,
  sc.content,
  sc.status,
  sc.reading_time,
  sc.created_at,
  sc.updated_at,
  sc.difficulty,
  sc.featured,
  sc.priority,
  sc.industry,
  sc.target_tool,
  sc.tags,
  cts.type_name,
  cts.display_name AS type_display_name
FROM slim_content sc
JOIN content_types_static cts ON cts.type_name = sc.type;

-- 2) Expose howto_steps from slim_content_details (read-only)
CREATE VIEW IF NOT EXISTS v_howto_steps_from_details AS
SELECT
  (scd.content_id * 100000) + CAST(je.key AS INTEGER) + 1 AS id,
  scd.content_id AS content_id,
  CAST(je.key AS INTEGER) + 1 AS step_order,
  json_extract(je.value, '$.stepId') AS step_id,
  json_extract(je.value, '$.name') AS name,
  json_extract(je.value, '$.description') AS description,
  json_extract(je.value, '$.tip') AS tip,
  json_extract(je.value, '$.warning') AS warning
FROM slim_content_details scd,
     json_each(scd.details, '$.steps') je;

-- 3) Expose case_details from slim_content_details (read-only)
CREATE VIEW IF NOT EXISTS v_case_details_from_details AS
SELECT
  scd.content_id AS content_id,
  json_extract(scd.details, '$.case.problem') AS problem,
  json_extract(scd.details, '$.case.solution') AS solution,
  COALESCE(json_extract(scd.details, '$.case.results'), '[]') AS results,
  COALESCE(json_extract(scd.details, '$.case.lessons'), '[]') AS lessons,
  COALESCE(json_extract(scd.details, '$.case.toolsUsed'), '[]') AS tools_used,
  json_extract(scd.details, '$.case.background') AS background,
  json_extract(scd.details, '$.case.challenge') AS challenge,
  COALESCE(json_extract(scd.details, '$.case.approach'), '{}') AS approach,
  COALESCE(json_extract(scd.details, '$.case.resultsDetail'), '{}') AS results_detail,
  COALESCE(json_extract(scd.details, '$.case.keyInsights'), '[]') AS key_insights,
  COALESCE(json_extract(scd.details, '$.case.recommendations'), '[]') AS recommendations
FROM slim_content_details scd;
-- 4) Minimal FTS5 index (manual refresh, no triggers)
-- Recreate safely to avoid historical mismatches
DROP TABLE IF EXISTS content_search;

CREATE VIRTUAL TABLE IF NOT EXISTS content_search USING fts5(
  title,
  summary,
  content,
  tokenize='porter unicode61'
);

DELETE FROM content_search;
INSERT INTO content_search(rowid, title, summary, content)
SELECT sc.id, sc.title, sc.summary, sc.content
FROM slim_content sc;

COMMIT;
