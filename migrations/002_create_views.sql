-- Migration 002: Create Legacy Compatibility Views
-- Description: Create views for backward compatibility with legacy content systems
-- Version: 2025-09-19

-- Legacy content items view for backward compatibility
CREATE VIEW v_content_items_legacy AS
SELECT 
    sc.id,
    sc.slug,
    sc.type,
    sc.title,
    sc.summary,
    sc.content,
    sc.status,
    sc.reading_time,
    sc.priority,
    sc.featured,
    sc.difficulty,
    sc.industry,
    sc.target_tool,
    sc.tags,
    sc.created_at,
    sc.updated_at,
    scd.details
FROM slim_content sc
LEFT JOIN slim_content_details scd ON sc.id = scd.content_id
WHERE sc.status = 'published'
ORDER BY sc.priority DESC, sc.updated_at DESC;

-- How-to steps view with enriched data
CREATE VIEW v_howto_steps_from_details AS
SELECT 
    sc.id as content_id,
    sc.slug as howto_slug,
    sc.title,
    sc.summary,
    sc.difficulty,
    sc.reading_time,
    hs.id as step_id,
    hs.step_order,
    hs.step_title,
    hs.step_content,
    hs.step_image,
    hs.step_code,
    hm.total_steps,
    hm.estimated_time,
    hm.prerequisites,
    hm.tools_needed,
    hm.difficulty_level
FROM slim_content sc
JOIN howto_steps hs ON sc.slug = hs.howto_slug
LEFT JOIN howto_metadata hm ON sc.slug = hm.howto_slug
WHERE sc.type = 'howto' AND sc.status = 'published'
ORDER BY sc.slug, hs.step_order;

-- Case study details view with structured data
CREATE VIEW v_case_details_from_details AS
SELECT 
    sc.id as content_id,
    sc.slug,
    sc.title,
    sc.summary,
    sc.industry,
    sc.difficulty,
    sc.tags,
    sc.reading_time,
    scd.details as case_details,
    sc.created_at,
    sc.updated_at
FROM slim_content sc
JOIN slim_content_details scd ON sc.id = scd.content_id
WHERE sc.type = 'case' AND sc.status = 'published'
ORDER BY sc.priority DESC, sc.updated_at DESC;