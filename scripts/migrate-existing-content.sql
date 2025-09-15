-- 现有内容数据迁移和完善脚本
-- 执行方式: sqlite3 data/statcal.db < scripts/migrate-existing-content.sql
-- 目的: 完善现有9个内容项的数据，添加标签、质量评估等

-- ==========================================
-- 1. 完善现有内容项的基础字段
-- ==========================================

-- 标准化difficulty字段
UPDATE content_items SET difficulty = 'beginner' 
WHERE difficulty IS NULL OR difficulty = '' OR difficulty NOT IN ('beginner', 'intermediate', 'advanced');

-- 添加industry信息 (使用JSON格式)
UPDATE content_items SET industry = '["education", "general"]' 
WHERE industry IS NULL OR industry = '';

-- 为特定内容设置更精确的industry
UPDATE content_items SET industry = '["education", "academic"]' 
WHERE title LIKE '%GPA%' OR title LIKE '%grade%';

-- 关联target_tool字段到相应的计算器
UPDATE content_items SET target_tool = '/calculator/mean' 
WHERE (title LIKE '%mean%' OR title LIKE '%average%') AND target_tool IS NULL;

UPDATE content_items SET target_tool = '/calculator/median' 
WHERE title LIKE '%median%' AND target_tool IS NULL;

UPDATE content_items SET target_tool = '/calculator/standard-deviation' 
WHERE title LIKE '%standard deviation%' AND target_tool IS NULL;

UPDATE content_items SET target_tool = '/calculator/gpa' 
WHERE title LIKE '%GPA%' AND target_tool IS NULL;

-- 完善SEO关键词 (使用JSON格式)
UPDATE content_items SET seo_keywords = '["mean", "average", "statistics", "calculation"]'
WHERE title LIKE '%mean%' AND (seo_keywords IS NULL OR seo_keywords = '');

UPDATE content_items SET seo_keywords = '["median", "statistics", "middle value"]'
WHERE title LIKE '%median%' AND (seo_keywords IS NULL OR seo_keywords = '');

UPDATE content_items SET seo_keywords = '["standard deviation", "variance", "statistics", "dispersion"]'
WHERE title LIKE '%standard deviation%' AND (seo_keywords IS NULL OR seo_keywords = '');

UPDATE content_items SET seo_keywords = '["GPA", "grade point average", "academic", "calculation"]'
WHERE title LIKE '%GPA%' AND (seo_keywords IS NULL OR seo_keywords = '');

-- 完善SEO描述
UPDATE content_items SET seo_meta_description = 
    'Learn how to calculate ' || LOWER(title) || ' with step-by-step examples and explanations. Free online calculator and comprehensive guide.'
WHERE seo_meta_description IS NULL OR seo_meta_description = '';

-- 设置reading_time (基于内容长度估算)
UPDATE content_items SET reading_time = 
    CASE 
        WHEN LENGTH(content) < 1000 THEN 3
        WHEN LENGTH(content) < 2000 THEN 5
        WHEN LENGTH(content) < 3000 THEN 8
        ELSE 10
    END
WHERE reading_time IS NULL OR reading_time = 0;

-- ==========================================
-- 2. 为现有内容添加标签关联
-- ==========================================

-- FAQ内容的标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 9
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'students'
WHERE cty.type_name = 'faq';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'beginner'
WHERE cty.type_name = 'faq';

-- How-To内容的标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'step-by-step'
WHERE cty.type_name = 'howto';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'educators'
WHERE cty.type_name = 'howto';

-- Case Study内容的标签关联
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'case-study'
WHERE cty.type_name = 'case';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 9
FROM content_items ci
JOIN content_types cty ON ci.type_id = cty.id
JOIN content_tags ct ON ct.tag_name = 'professionals'
WHERE cty.type_name = 'case';

-- 基于内容标题添加主题标签
-- Mean相关内容
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'mean-average'
WHERE ci.title LIKE '%mean%' OR ci.title LIKE '%average%';

-- Median相关内容
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'median'
WHERE ci.title LIKE '%median%';

-- Standard Deviation相关内容
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'standard-deviation'
WHERE ci.title LIKE '%standard deviation%';

-- GPA相关内容
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 10
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'gpa-calculation'
WHERE ci.title LIKE '%GPA%';

-- 为所有内容添加计算器相关标签 (基于target_tool)
INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'mean-calculator'
WHERE ci.target_tool = '/calculator/mean';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'median-calculator'
WHERE ci.target_tool = '/calculator/median';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'std-dev-calculator'
WHERE ci.target_tool = '/calculator/standard-deviation';

INSERT OR IGNORE INTO content_item_tags (content_id, tag_id, relevance_score)
SELECT ci.id, ct.id, 8
FROM content_items ci
JOIN content_tags ct ON ct.tag_name = 'gpa-calculator'
WHERE ci.target_tool = '/calculator/gpa';

-- ==========================================
-- 3. 创建初始质量评估记录
-- ==========================================

-- 为所有现有内容创建基础质量评估
INSERT OR IGNORE INTO content_quality_metrics (content_id, metric_type, score, evaluation_method, evaluator, notes)
SELECT 
    id as content_id,
    'completeness' as metric_type,
    CASE 
        WHEN LENGTH(content) > 2000 AND summary IS NOT NULL AND seo_meta_description IS NOT NULL THEN 85
        WHEN LENGTH(content) > 1000 AND summary IS NOT NULL THEN 75
        WHEN LENGTH(content) > 500 THEN 65
        ELSE 55
    END as score,
    'automated' as evaluation_method,
    'migration_script' as evaluator,
    'Initial assessment based on content length and metadata completeness' as notes
FROM content_items;

-- 可读性评估 (基于内容长度和结构)
INSERT OR IGNORE INTO content_quality_metrics (content_id, metric_type, score, evaluation_method, evaluator, notes)
SELECT 
    id as content_id,
    'readability' as metric_type,
    CASE 
        WHEN content LIKE '%##%' AND content LIKE '%-%' THEN 80  -- 有标题和列表
        WHEN content LIKE '%##%' OR content LIKE '%-%' THEN 70   -- 有标题或列表
        ELSE 60
    END as score,
    'automated' as evaluation_method,
    'migration_script' as evaluator,
    'Assessment based on content structure (headers, lists)' as notes
FROM content_items;

-- SEO评估 (基于SEO字段完整性)
INSERT OR IGNORE INTO content_quality_metrics (content_id, metric_type, score, evaluation_method, evaluator, notes)
SELECT 
    id as content_id,
    'seo' as metric_type,
    CASE 
        WHEN seo_meta_description IS NOT NULL AND seo_keywords IS NOT NULL AND LENGTH(title) <= 60 THEN 90
        WHEN seo_meta_description IS NOT NULL OR seo_keywords IS NOT NULL THEN 70
        ELSE 50
    END as score,
    'automated' as evaluation_method,
    'migration_script' as evaluator,
    'Assessment based on SEO metadata completeness' as notes
FROM content_items;

-- ==========================================
-- 4. 建立内容关联关系
-- ==========================================

-- 创建FAQ和How-To之间的关联 (同主题内容)
INSERT OR IGNORE INTO content_relationships_enhanced (from_content_id, to_content_id, relationship_type, relationship_strength, display_context)
SELECT 
    faq.id as from_content_id,
    howto.id as to_content_id,
    'related' as relationship_type,
    8 as relationship_strength,
    '相关操作指南' as display_context
FROM content_items faq
JOIN content_types faq_type ON faq.type_id = faq_type.id
JOIN content_items howto ON (
    (faq.title LIKE '%mean%' AND howto.title LIKE '%mean%') OR
    (faq.title LIKE '%median%' AND howto.title LIKE '%median%') OR
    (faq.title LIKE '%standard deviation%' AND howto.title LIKE '%standard deviation%') OR
    (faq.title LIKE '%GPA%' AND howto.title LIKE '%GPA%')
)
JOIN content_types howto_type ON howto.type_id = howto_type.id
WHERE faq_type.type_name = 'faq' AND howto_type.type_name = 'howto'
AND faq.id != howto.id;

-- 创建基础统计概念之间的关联
INSERT OR IGNORE INTO content_relationships_enhanced (from_content_id, to_content_id, relationship_type, relationship_strength, display_context)
SELECT 
    mean_content.id as from_content_id,
    median_content.id as to_content_id,
    'related' as relationship_type,
    9 as relationship_strength,
    '其他集中趋势测量' as display_context
FROM content_items mean_content, content_items median_content
WHERE mean_content.title LIKE '%mean%' 
AND median_content.title LIKE '%median%'
AND mean_content.id != median_content.id;

-- ==========================================
-- 5. 生成初始结构化数据
-- ==========================================

-- 为FAQ内容生成QAPage结构化数据
INSERT OR IGNORE INTO content_structured_data (content_id, schema_type, structured_data, validation_status)
SELECT 
    ci.id,
    'QAPage' as schema_type,
    json_object(
        '@context', 'https://schema.org',
        '@type', 'QAPage',
        '@id', 'https://thestatscalculator.com/content/' || ci.slug,
        'mainEntity', json_object(
            '@type', 'Question',
            'name', ci.title,
            'acceptedAnswer', json_object(
                '@type', 'Answer',
                'text', COALESCE(ci.summary, SUBSTR(ci.content, 1, 200) || '...')
            )
        ),
        'author', json_object(
            '@type', 'Organization',
            'name', 'The Stats Calculator',
            'url', 'https://thestatscalculator.com'
        ),
        'datePublished', ci.created_at,
        'dateModified', ci.updated_at
    ) as structured_data,
    'valid' as validation_status
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id
WHERE ct.type_name = 'faq';

-- 为How-To内容生成HowTo结构化数据
INSERT OR IGNORE INTO content_structured_data (content_id, schema_type, structured_data, validation_status)
SELECT 
    ci.id,
    'HowTo' as schema_type,
    json_object(
        '@context', 'https://schema.org',
        '@type', 'HowTo',
        '@id', 'https://thestatscalculator.com/content/' || ci.slug,
        'name', ci.title,
        'description', COALESCE(ci.summary, SUBSTR(ci.content, 1, 200) || '...'),
        'totalTime', 'PT' || COALESCE(ci.reading_time, 5) || 'M',
        'author', json_object(
            '@type', 'Organization',
            'name', 'The Stats Calculator',
            'url', 'https://thestatscalculator.com'
        ),
        'datePublished', ci.created_at,
        'dateModified', ci.updated_at
    ) as structured_data,
    'valid' as validation_status
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id
WHERE ct.type_name = 'howto';

-- 为Case Study内容生成Article结构化数据
INSERT OR IGNORE INTO content_structured_data (content_id, schema_type, structured_data, validation_status)
SELECT 
    ci.id,
    'Article' as schema_type,
    json_object(
        '@context', 'https://schema.org',
        '@type', 'Article',
        '@id', 'https://thestatscalculator.com/content/' || ci.slug,
        'headline', ci.title,
        'description', COALESCE(ci.summary, SUBSTR(ci.content, 1, 200) || '...'),
        'articleSection', 'Case Study',
        'wordCount', LENGTH(ci.content),
        'author', json_object(
            '@type', 'Organization',
            'name', 'The Stats Calculator',
            'url', 'https://thestatscalculator.com'
        ),
        'publisher', json_object(
            '@type', 'Organization',
            'name', 'The Stats Calculator'
        ),
        'datePublished', ci.created_at,
        'dateModified', ci.updated_at
    ) as structured_data,
    'valid' as validation_status
FROM content_items ci
JOIN content_types ct ON ci.type_id = ct.id
WHERE ct.type_name = 'case';

-- ==========================================
-- 6. 设置优先级内容
-- ==========================================

-- 将常用的基础概念设为特色内容
UPDATE content_items SET featured = 1, priority = 8
WHERE title LIKE '%mean%' OR title LIKE '%average%';

UPDATE content_items SET featured = 1, priority = 7
WHERE title LIKE '%median%';

UPDATE content_items SET featured = 1, priority = 6
WHERE title LIKE '%standard deviation%';

UPDATE content_items SET featured = 1, priority = 9
WHERE title LIKE '%GPA%';

-- ==========================================
-- 7. 输出迁移结果统计
-- ==========================================

SELECT 'Content Migration Summary:' as status;

SELECT 
    'Updated content items: ' || COUNT(*) as result
FROM content_items 
WHERE industry IS NOT NULL AND difficulty IS NOT NULL;

SELECT 
    'Created tag associations: ' || COUNT(*) as result
FROM content_item_tags;

SELECT 
    'Created quality metrics: ' || COUNT(*) as result
FROM content_quality_metrics;

SELECT 
    'Created relationships: ' || COUNT(*) as result
FROM content_relationships_enhanced;

SELECT 
    'Generated structured data: ' || COUNT(*) as result
FROM content_structured_data;

SELECT 
    'Featured content items: ' || COUNT(*) as result
FROM content_items 
WHERE featured = 1;

-- 显示每个内容项的完善情况
SELECT 
    ci.id,
    ci.title,
    ci.difficulty,
    ci.featured,
    ci.priority,
    COUNT(DISTINCT cit.tag_id) as tags_count,
    COUNT(DISTINCT cqm.id) as quality_metrics_count,
    COUNT(DISTINCT csd.id) as structured_data_count
FROM content_items ci
LEFT JOIN content_item_tags cit ON ci.id = cit.content_id
LEFT JOIN content_quality_metrics cqm ON ci.id = cqm.content_id
LEFT JOIN content_structured_data csd ON ci.id = csd.content_id
GROUP BY ci.id
ORDER BY ci.id;