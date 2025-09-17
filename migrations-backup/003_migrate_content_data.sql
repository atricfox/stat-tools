-- This migration copies legacy content data into the new slim tables.
-- It is executed conditionally by the migration runner depending on
-- the existence of legacy tables. Do not run blindly in environments
-- without legacy tables.

-- [SEGMENT] MIGRATE_CONTENT_MAIN
-- Copies rows from content_items + content_types + optional content_metadata(tags)
-- into slim_content. Fields not present in legacy schema are defaulted.
PRAGMA foreign_keys = ON;
BEGIN;

INSERT INTO slim_content (
  slug, type, title, summary, content, status, reading_time,
  priority, featured, difficulty, industry, target_tool, tags,
  created_at, updated_at
)
SELECT
  ci.slug,
  ct.type_name,
  ci.title,
  ci.summary,
  ci.content,
  COALESCE(ci.status, 'published'),
  ci.reading_time,
  COALESCE(ci.priority, 0),
  COALESCE(ci.featured, 0),
  ci.difficulty,
  ci.industry,
  ci.target_tool,
  COALESCE(
    CASE WHEN ci.tags IS NOT NULL THEN ci.tags END,
    (SELECT meta_value FROM content_metadata cm
      WHERE cm.content_id = ci.id AND cm.meta_key = 'tags' LIMIT 1),
    '[]'
  ),
  COALESCE(ci.created_at, CURRENT_TIMESTAMP),
  COALESCE(ci.updated_at, CURRENT_TIMESTAMP)
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id
WHERE NOT EXISTS (SELECT 1 FROM slim_content sc WHERE sc.slug = ci.slug);

COMMIT;

-- [SEGMENT] MIGRATE_STEPS
-- Aggregates howto_steps into slim_content_details.details.steps (JSON array)
PRAGMA foreign_keys = ON;
BEGIN;

INSERT OR REPLACE INTO slim_content_details(content_id, details)
SELECT
  sc.id AS content_id,
  json_set(
    COALESCE(d.details, '{}'),
    '$.steps',
    COALESCE((
      SELECT json_group_array(
        json_object(
          'stepId', hs.step_id,
          'name', hs.name,
          'description', hs.description,
          'tip', hs.tip,
          'warning', hs.warning,
          'stepOrder', hs.step_order
        )
      )
      FROM howto_steps hs
      WHERE hs.content_id = ci.id
      ORDER BY hs.step_order
    ), json('[]'))
  ) AS details
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id AND ct.type_name = 'howto'
JOIN slim_content sc ON sc.slug = ci.slug
LEFT JOIN slim_content_details d ON d.content_id = sc.id;

COMMIT;

-- [SEGMENT] MIGRATE_CASE
-- Copies case_details into slim_content_details.details.case (JSON object)
PRAGMA foreign_keys = ON;
BEGIN;

INSERT OR REPLACE INTO slim_content_details(content_id, details)
SELECT
  sc.id AS content_id,
  json_set(
    COALESCE(d.details, '{}'),
    '$.case',
    json_object(
      'problem', cd.problem,
      'solution', cd.solution,
      'results', COALESCE(cd.results, '[]'),
      'lessons', COALESCE(cd.lessons, '[]'),
      'toolsUsed', COALESCE(cd.tools_used, '[]'),
      'background', cd.background,
      'challenge', cd.challenge,
      'approach', COALESCE(cd.approach, '{}'),
      'resultsDetail', COALESCE(cd.results_detail, '{}'),
      'keyInsights', COALESCE(cd.key_insights, '[]'),
      'recommendations', COALESCE(cd.recommendations, '[]')
    )
  ) AS details
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id AND ct.type_name = 'case'
JOIN case_details cd ON cd.content_id = ci.id
JOIN slim_content sc ON sc.slug = ci.slug
LEFT JOIN slim_content_details d ON d.content_id = sc.id;

COMMIT;

