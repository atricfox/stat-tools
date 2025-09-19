-- Create database views for backward compatibility and complex queries
-- Created: 2025-09-17
-- Description: Creates views for legacy compatibility and data extraction

-- Legacy content items view for backward compatibility
CREATE VIEW v_content_items_legacy AS
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

-- View for extracting how-to steps from JSON details
CREATE VIEW v_howto_steps_from_details AS
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

-- View for extracting case study details from JSON
CREATE VIEW v_case_details_from_details AS
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