-- StatCal 数据库增量增强脚本
-- 执行方式: sqlite3 data/statcal.db < scripts/incremental-database-setup.sql
-- 原则: 只新增表和索引，不修改现有结构

-- ==========================================
-- 1. 内容标签系统 (新增)
-- ==========================================

-- 创建内容标签表
CREATE TABLE IF NOT EXISTS content_tags (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tag_name TEXT UNIQUE NOT NULL,
    tag_slug TEXT UNIQUE NOT NULL,
    tag_category TEXT NOT NULL CHECK(tag_category IN ('topic', 'difficulty', 'audience', 'format', 'calculator')),
    description TEXT,
    color_code TEXT DEFAULT '#6B7280',
    usage_count INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建内容-标签关联表
CREATE TABLE IF NOT EXISTS content_item_tags (
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES content_tags(id) ON DELETE CASCADE,
    relevance_score INTEGER DEFAULT 5 CHECK(relevance_score BETWEEN 1 AND 10),
    assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    assigned_by TEXT DEFAULT 'system',
    PRIMARY KEY (content_id, tag_id)
);

-- 标签系统索引
CREATE INDEX IF NOT EXISTS idx_content_tags_category ON content_tags(tag_category);
CREATE INDEX IF NOT EXISTS idx_content_tags_usage ON content_tags(usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_content_tags_featured ON content_tags(is_featured, usage_count DESC);
CREATE INDEX IF NOT EXISTS idx_content_item_tags_content ON content_item_tags(content_id);
CREATE INDEX IF NOT EXISTS idx_content_item_tags_tag ON content_item_tags(tag_id);
CREATE INDEX IF NOT EXISTS idx_content_item_tags_relevance ON content_item_tags(relevance_score DESC);

-- ==========================================
-- 2. 内容质量管理系统 (新增)
-- ==========================================

-- 创建质量评估记录表
CREATE TABLE IF NOT EXISTS content_quality_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    metric_type TEXT NOT NULL CHECK(metric_type IN ('readability', 'completeness', 'accuracy', 'seo', 'engagement', 'technical')),
    score INTEGER CHECK(score BETWEEN 0 AND 100),
    max_score INTEGER DEFAULT 100,
    evaluation_method TEXT DEFAULT 'system', -- 'system', 'manual', 'automated'
    evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    evaluator TEXT DEFAULT 'system',
    notes TEXT,
    improvement_suggestions TEXT,
    
    UNIQUE(content_id, metric_type, evaluation_date)
);

-- 创建内容反馈表
CREATE TABLE IF NOT EXISTS content_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    feedback_type TEXT NOT NULL CHECK(feedback_type IN ('user_rating', 'comment', 'improvement_suggestion', 'error_report')),
    rating INTEGER CHECK(rating BETWEEN 1 AND 5),
    feedback_text TEXT,
    user_identifier TEXT, -- 匿名标识或用户ID
    user_agent TEXT,
    ip_hash TEXT, -- 哈希后的IP用于防刷
    is_helpful BOOLEAN,
    is_public BOOLEAN DEFAULT FALSE,
    status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'reviewed', 'addressed', 'dismissed')),
    reviewed_by TEXT,
    reviewed_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 质量管理索引
CREATE INDEX IF NOT EXISTS idx_quality_metrics_content ON content_quality_metrics(content_id);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_type ON content_quality_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_score ON content_quality_metrics(score DESC);
CREATE INDEX IF NOT EXISTS idx_quality_metrics_date ON content_quality_metrics(evaluation_date DESC);
CREATE INDEX IF NOT EXISTS idx_content_feedback_content ON content_feedback(content_id);
CREATE INDEX IF NOT EXISTS idx_content_feedback_rating ON content_feedback(rating DESC);
CREATE INDEX IF NOT EXISTS idx_content_feedback_status ON content_feedback(status);
CREATE INDEX IF NOT EXISTS idx_content_feedback_date ON content_feedback(created_at DESC);

-- ==========================================
-- 3. 增强的内容关联系统 (新增)
-- ==========================================

-- 创建增强内容关联表 (补充现有的content_relationships)
CREATE TABLE IF NOT EXISTS content_relationships_enhanced (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    from_content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    to_content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    relationship_type TEXT NOT NULL CHECK(relationship_type IN ('prerequisite', 'follow_up', 'alternative', 'related', 'example', 'reference', 'contradiction')),
    relationship_strength INTEGER DEFAULT 5 CHECK(relationship_strength BETWEEN 1 AND 10),
    display_context TEXT, -- 显示上下文，如 "相关概念", "延伸阅读", "前置知识"
    sort_order INTEGER DEFAULT 0,
    is_bidirectional BOOLEAN DEFAULT FALSE,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    created_by TEXT DEFAULT 'system',
    verified_by TEXT,
    verified_at DATETIME,
    
    UNIQUE(from_content_id, to_content_id, relationship_type),
    CHECK(from_content_id != to_content_id) -- 防止自我关联
);

-- 增强关联索引
CREATE INDEX IF NOT EXISTS idx_content_rel_enhanced_from ON content_relationships_enhanced(from_content_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_content_rel_enhanced_to ON content_relationships_enhanced(to_content_id, relationship_type);
CREATE INDEX IF NOT EXISTS idx_content_rel_enhanced_strength ON content_relationships_enhanced(relationship_strength DESC);
CREATE INDEX IF NOT EXISTS idx_content_rel_enhanced_featured ON content_relationships_enhanced(is_featured, sort_order);

-- ==========================================
-- 4. SEO增强数据系统 (新增)
-- ==========================================

-- 创建结构化数据表
CREATE TABLE IF NOT EXISTS content_structured_data (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    schema_type TEXT NOT NULL CHECK(schema_type IN ('Article', 'HowTo', 'FAQ', 'QAPage', 'EducationalOrganization', 'WebPage')),
    structured_data TEXT NOT NULL, -- JSON-LD格式的结构化数据
    is_active BOOLEAN DEFAULT TRUE,
    generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
    validation_status TEXT DEFAULT 'pending' CHECK(validation_status IN ('pending', 'valid', 'invalid', 'warning')),
    validation_errors TEXT,
    
    UNIQUE(content_id, schema_type)
);

-- 创建内容性能指标表
CREATE TABLE IF NOT EXISTS content_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    metric_date DATE NOT NULL,
    
    -- 流量指标
    page_views INTEGER DEFAULT 0,
    unique_visitors INTEGER DEFAULT 0,
    time_on_page INTEGER DEFAULT 0, -- 秒
    bounce_rate DECIMAL(5,2) DEFAULT 0, -- 百分比
    exit_rate DECIMAL(5,2) DEFAULT 0,
    
    -- 搜索指标
    search_impressions INTEGER DEFAULT 0,
    search_clicks INTEGER DEFAULT 0,
    search_ctr DECIMAL(5,2) DEFAULT 0, -- 点击率
    avg_position DECIMAL(5,2) DEFAULT 0,
    
    -- 转化指标
    calculator_clicks INTEGER DEFAULT 0,
    related_content_clicks INTEGER DEFAULT 0,
    external_link_clicks INTEGER DEFAULT 0,
    
    -- 用户行为
    scroll_depth DECIMAL(5,2) DEFAULT 0, -- 滚动深度百分比
    shares INTEGER DEFAULT 0,
    bookmarks INTEGER DEFAULT 0,
    
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(content_id, metric_date)
);

-- SEO增强索引
CREATE INDEX IF NOT EXISTS idx_structured_data_content ON content_structured_data(content_id);
CREATE INDEX IF NOT EXISTS idx_structured_data_type ON content_structured_data(schema_type);
CREATE INDEX IF NOT EXISTS idx_structured_data_active ON content_structured_data(is_active, schema_type);
CREATE INDEX IF NOT EXISTS idx_performance_content_date ON content_performance_metrics(content_id, metric_date DESC);
CREATE INDEX IF NOT EXISTS idx_performance_views ON content_performance_metrics(page_views DESC);
CREATE INDEX IF NOT EXISTS idx_performance_date ON content_performance_metrics(metric_date DESC);

-- ==========================================
-- 5. 内容版本控制系统 (新增)
-- ==========================================

-- 创建内容版本表
CREATE TABLE IF NOT EXISTS content_versions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    content_id INTEGER REFERENCES content_items(id) ON DELETE CASCADE,
    version_number TEXT NOT NULL, -- 语义版本号，如 "1.0.0", "1.1.0"
    version_type TEXT DEFAULT 'minor' CHECK(version_type IN ('major', 'minor', 'patch', 'hotfix')),
    
    -- 版本内容
    title TEXT NOT NULL,
    summary TEXT,
    content TEXT NOT NULL,
    
    -- 变更信息
    change_description TEXT,
    change_summary TEXT, -- 简短的变更说明
    breaking_changes TEXT, -- 破坏性变更说明
    
    -- 状态和审核
    status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'review', 'approved', 'published', 'archived')),
    created_by TEXT,
    reviewed_by TEXT,
    approved_by TEXT,
    
    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_at DATETIME,
    approved_at DATETIME,
    published_at DATETIME,
    
    UNIQUE(content_id, version_number)
);

-- 版本控制索引
CREATE INDEX IF NOT EXISTS idx_content_versions_content ON content_versions(content_id, version_number DESC);
CREATE INDEX IF NOT EXISTS idx_content_versions_status ON content_versions(status);
CREATE INDEX IF NOT EXISTS idx_content_versions_created ON content_versions(created_at DESC);

-- ==========================================
-- 6. 内容分析统计视图 (新增)
-- ==========================================

-- 创建内容质量分析视图
CREATE VIEW IF NOT EXISTS content_quality_analysis AS
SELECT 
    ci.id,
    ci.slug,
    ci.title,
    ci.status,
    ct.display_name as content_type,
    ci.difficulty,
    ci.featured,
    ci.priority,
    
    -- 质量评分
    COALESCE(AVG(cqm.score), 0) as avg_quality_score,
    COUNT(DISTINCT cqm.id) as quality_assessments_count,
    
    -- 用户反馈
    COALESCE(AVG(CASE WHEN cf.rating > 0 THEN cf.rating END), 0) as avg_user_rating,
    COUNT(DISTINCT cf.id) as feedback_count,
    
    -- 标签统计
    COUNT(DISTINCT cit.tag_id) as tags_count,
    
    -- 关联统计
    COUNT(DISTINCT cre.id) as relationships_count,
    
    -- 性能指标 (最近30天)
    COALESCE(AVG(cpm.page_views), 0) as avg_daily_views,
    COALESCE(AVG(cpm.time_on_page), 0) as avg_time_on_page,
    
    ci.created_at,
    ci.updated_at
    
FROM content_items ci
LEFT JOIN content_types ct ON ci.type_id = ct.id
LEFT JOIN content_quality_metrics cqm ON ci.id = cqm.content_id
LEFT JOIN content_feedback cf ON ci.id = cf.content_id AND cf.rating > 0
LEFT JOIN content_item_tags cit ON ci.id = cit.content_id
LEFT JOIN content_relationships_enhanced cre ON ci.id = cre.from_content_id
LEFT JOIN content_performance_metrics cpm ON ci.id = cpm.content_id 
    AND cpm.metric_date >= date('now', '-30 days')
GROUP BY ci.id;

-- 创建标签使用统计视图
CREATE VIEW IF NOT EXISTS tag_usage_stats AS
SELECT 
    ct.id,
    ct.tag_name,
    ct.tag_category,
    ct.color_code,
    ct.is_featured,
    COUNT(DISTINCT cit.content_id) as content_count,
    AVG(cit.relevance_score) as avg_relevance,
    MAX(cit.assigned_at) as last_used,
    ct.created_at
FROM content_tags ct
LEFT JOIN content_item_tags cit ON ct.id = cit.tag_id
LEFT JOIN content_items ci ON cit.content_id = ci.id AND ci.status = 'published'
GROUP BY ct.id
ORDER BY content_count DESC, ct.tag_name;

-- ==========================================
-- 7. 触发器和约束 (新增)
-- ==========================================

-- 更新标签使用计数的触发器
CREATE TRIGGER IF NOT EXISTS update_tag_usage_count_insert
AFTER INSERT ON content_item_tags
BEGIN
    UPDATE content_tags 
    SET usage_count = (
        SELECT COUNT(*) FROM content_item_tags cit2 
        JOIN content_items ci ON cit2.content_id = ci.id 
        WHERE cit2.tag_id = NEW.tag_id AND ci.status = 'published'
    )
    WHERE id = NEW.tag_id;
END;

CREATE TRIGGER IF NOT EXISTS update_tag_usage_count_delete
AFTER DELETE ON content_item_tags
BEGIN
    UPDATE content_tags 
    SET usage_count = (
        SELECT COUNT(*) FROM content_item_tags cit2 
        JOIN content_items ci ON cit2.content_id = ci.id 
        WHERE cit2.tag_id = OLD.tag_id AND ci.status = 'published'
    )
    WHERE id = OLD.tag_id;
END;

-- 内容状态变更时更新结构化数据的触发器
CREATE TRIGGER IF NOT EXISTS update_structured_data_on_publish
AFTER UPDATE OF status ON content_items
WHEN NEW.status = 'published' AND OLD.status != 'published'
BEGIN
    UPDATE content_structured_data 
    SET last_updated = CURRENT_TIMESTAMP 
    WHERE content_id = NEW.id;
END;

-- ==========================================
-- 8. 初始化预定义数据
-- ==========================================

-- 插入预定义的内容标签
INSERT OR IGNORE INTO content_tags (tag_name, tag_slug, tag_category, description, color_code, is_featured) VALUES
-- 主题标签
('mean-average', 'mean-average', 'topic', '平均数和均值相关内容', '#3B82F6', 1),
('standard-deviation', 'standard-deviation', 'topic', '标准差相关内容', '#8B5CF6', 1),
('variance', 'variance', 'topic', '方差相关内容', '#6366F1', 1),
('median', 'median', 'topic', '中位数相关内容', '#10B981', 1),
('mode', 'mode', 'topic', '众数相关内容', '#F59E0B', 1),
('gpa-calculation', 'gpa-calculation', 'topic', 'GPA计算相关内容', '#059669', 1),
('weighted-average', 'weighted-average', 'topic', '加权平均相关内容', '#DC2626', 1),
('error-analysis', 'error-analysis', 'topic', '误差分析相关内容', '#7C2D12', 1),
('range-statistics', 'range-statistics', 'topic', '极差统计相关内容', '#1E40AF', 0),
('percentile', 'percentile', 'topic', '百分位数相关内容', '#7C3AED', 0),

-- 难度标签
('beginner', 'beginner', 'difficulty', '初学者水平', '#22C55E', 1),
('intermediate', 'intermediate', 'difficulty', '中级水平', '#F59E0B', 1),
('advanced', 'advanced', 'difficulty', '高级水平', '#EF4444', 1),

-- 受众标签
('students', 'students', 'audience', '学生群体', '#6366F1', 1),
('educators', 'educators', 'audience', '教育工作者', '#8B5CF6', 1),
('researchers', 'researchers', 'audience', '研究人员', '#059669', 1),
('professionals', 'professionals', 'audience', '专业人士', '#DC2626', 1),
('parents', 'parents', 'audience', '家长群体', '#7C2D12', 0),

-- 格式标签
('step-by-step', 'step-by-step', 'format', '分步指导格式', '#3B82F6', 1),
('interactive', 'interactive', 'format', '交互式内容', '#8B5CF6', 0),
('case-study', 'case-study', 'format', '案例研究格式', '#10B981', 1),
('quick-reference', 'quick-reference', 'format', '快速参考格式', '#F59E0B', 1),
('comprehensive', 'comprehensive', 'format', '全面详细格式', '#6366F1', 0),

-- 计算器标签
('mean-calculator', 'mean-calculator', 'calculator', '均值计算器相关', '#3B82F6', 1),
('std-dev-calculator', 'std-dev-calculator', 'calculator', '标准差计算器相关', '#8B5CF6', 1),
('gpa-calculator', 'gpa-calculator', 'calculator', 'GPA计算器相关', '#10B981', 1),
('variance-calculator', 'variance-calculator', 'calculator', '方差计算器相关', '#6366F1', 1),
('median-calculator', 'median-calculator', 'calculator', '中位数计算器相关', '#059669', 1),
('weighted-mean-calculator', 'weighted-mean-calculator', 'calculator', '加权平均计算器相关', '#DC2626', 1),
('range-calculator', 'range-calculator', 'calculator', '极差计算器相关', '#7C2D12', 1),
('percent-error-calculator', 'percent-error-calculator', 'calculator', '百分比误差计算器相关', '#1E40AF', 1);

-- 输出创建完成信息
SELECT 'StatCal 数据库增量增强完成!' as status,
       (SELECT COUNT(*) FROM content_tags) as created_tags,
       (SELECT COUNT(*) FROM sqlite_master WHERE type='table' AND name LIKE 'content_%' AND name NOT IN ('content_items', 'content_types')) as new_tables;