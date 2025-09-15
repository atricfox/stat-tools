/**
 * StatCal 内容管理系统数据模型
 *
 * 该文件定义了所有内容类型的数据结构，用于支持内容补充计划的实施
 * 基于Sprint 15建立的CMS架构进行扩展
 */

// ===== 1. 基础类型定义 =====

export interface ContentBase {
  id: number;
  slug: string;
  title: string;
  description: string;
  content: string;
  status: 'draft' | 'published' | 'archived';
  author_id: number;
  created_at: string;
  updated_at: string;
  published_at?: string;
  seo_metadata: SEOMetadata;
}

export interface SEOMetadata {
  meta_title: string;
  meta_description: string;
  keywords: string[];
  og_title?: string;
  og_description?: string;
  og_image?: string;
  canonical_url?: string;
  schema_type?: string;
  structured_data?: Record<string, any>;
}

// ===== 2. 术语表 (Glossary) 数据模型 =====

export interface GlossaryTerm extends ContentBase {
  term_name: string;
  english_term: string;
  pronunciation?: string;
  definition: string; // 80-150字的简明定义
  detailed_explanation: string; // 详细解释
  common_misconceptions: Misconception[];
  examples: TermExample[];
  related_calculators: RelatedCalculator[];
  related_terms: RelatedTerm[];
  category: TermCategory;
  difficulty_level: DifficultyLevel;
  learning_objectives: string[];
  key_formulas?: string[];
  practical_applications: string[];
}

export interface Misconception {
  id: number;
  misconception: string;
  clarification: string;
  importance: 'high' | 'medium' | 'low';
}

export interface TermExample {
  id: number;
  scenario: string;
  calculation: string;
  result: string;
  explanation: string;
}

export interface RelatedCalculator {
  calculator_id: number;
  calculator_name: string;
  calculator_url: string;
  relevance_score: number; // 0-1, 相关性评分
}

export interface RelatedTerm {
  term_id: number;
  term_name: string;
  relationship_type: 'synonym' | 'antonym' | 'related' | 'prerequisite' | 'advanced';
  relationship_description: string;
}

export type TermCategory =
  | 'basic_statistics'
  | 'descriptive_statistics'
  | 'inferential_statistics'
  | 'probability_theory'
  | 'educational_statistics'
  | 'business_statistics'
  | 'research_methods';

export type DifficultyLevel = 'beginner' | 'intermediate' | 'advanced';

// ===== 3. 使用指南 (How-To Guides) 数据模型 =====

export interface HowToGuide extends ContentBase {
  guide_type: GuideType;
  target_audience: TargetAudience[];
  estimated_reading_time: number; // 分钟
  difficulty_level: DifficultyLevel;
  prerequisites: string[];
  learning_objectives: string[];
  sections: GuideSection[];
  related_calculators: RelatedCalculator[];
  related_guides: RelatedGuide[];
  interactive_elements: InteractiveElement[];
  assessment_questions?: AssessmentQuestion[];
  next_steps: NextStep[];
  video_tutorial_url?: string;
  downloadable_resources: DownloadableResource[];
}

export type GuideType =
  | 'calculator_tutorial'
  | 'concept_explanation'
  | 'best_practices'
  | 'troubleshooting'
  | 'advanced_techniques';

export type TargetAudience =
  | 'students'
  | 'teachers'
  | 'researchers'
  | 'business_users'
  | 'data_analysts'
  | 'general_public';

export interface GuideSection {
  id: number;
  title: string;
  content: string;
  order: number;
  section_type: 'introduction' | 'main_content' | 'example' | 'tip' | 'warning' | 'conclusion';
  code_examples?: CodeExample[];
  screenshots?: Screenshot[];
  key_points: string[];
}

export interface CodeExample {
  id: number;
  language: string;
  code: string;
  explanation: string;
  output?: string;
}

export interface Screenshot {
  id: number;
  image_url: string;
  alt_text: string;
  caption?: string;
  highlighted_areas?: HighlightedArea[];
}

export interface HighlightedArea {
  x: number;
  y: number;
  width: number;
  height: number;
  annotation: string;
}

export interface RelatedGuide {
  guide_id: number;
  guide_title: string;
  relationship_type: 'prerequisite' | 'next_step' | 'related' | 'alternative';
}

export interface InteractiveElement {
  id: number;
  element_type: 'calculator' | 'quiz' | 'interactive_chart' | 'simulation';
  configuration: Record<string, any>;
  instructions: string;
}

export interface AssessmentQuestion {
  id: number;
  question: string;
  question_type: 'multiple_choice' | 'true_false' | 'short_answer';
  options?: string[];
  correct_answer: string | string[];
  explanation: string;
  difficulty: DifficultyLevel;
}

export interface NextStep {
  id: number;
  title: string;
  description: string;
  action_type: 'read_guide' | 'try_calculator' | 'watch_video' | 'practice_exercise';
  target_url?: string;
}

export interface DownloadableResource {
  id: number;
  filename: string;
  file_url: string;
  file_type: string;
  file_size: number;
  description: string;
}

// ===== 4. FAQ 数据模型 =====

export interface FAQItem extends ContentBase {
  question: string;
  answer: string;
  question_category: FAQCategory;
  target_audience: TargetAudience[];
  difficulty_level: DifficultyLevel;
  related_calculators: RelatedCalculator[];
  related_faqs: RelatedFAQ[];
  helpful_votes: number;
  total_votes: number;
  viewed_count: number;
  search_keywords: string[];
  solution_status: 'verified' | 'pending_review' | 'needs_improvement';
  last_verified_at: string;
  escalation_path?: string; // 当FAQ无法解决时的升级路径
}

export type FAQCategory =
  | 'technical_support'
  | 'concept_explanation'
  | 'usage_guidance'
  | 'troubleshooting'
  | 'billing_pricing'
  | 'account_management'
  | 'educational_use'
  | 'api_integration';

export interface RelatedFAQ {
  faq_id: number;
  question: string;
  relationship_type: 'similar' | 'follow_up' | 'alternative';
}

// ===== 5. 案例研究 (Case Studies) 数据模型 =====

export interface CaseStudy extends ContentBase {
  study_title: string;
  industry: Industry;
  use_case: UseCase;
  target_audience: TargetAudience[];
  difficulty_level: DifficultyLevel;
  estimated_reading_time: number;
  background: CaseStudyBackground;
  methodology: Methodology;
  data_description: DataDescription;
  analysis_process: AnalysisStep[];
  results: CaseStudyResults;
  insights: KeyInsight[];
  challenges: Challenge[];
  solutions: Solution[];
  best_practices: BestPractice[];
  related_calculators: RelatedCalculator[];
  downloadable_datasets: Dataset[];
  interactive_visualizations?: Visualization[];
  expert_testimonials?: Testimonial[];
  implementation_checklist: ChecklistItem[];
}

export type Industry =
  | 'education'
  | 'healthcare'
  | 'finance'
  | 'retail'
  | 'manufacturing'
  | 'technology'
  | 'research'
  | 'government'
  | 'non_profit'
  | 'general_business';

export type UseCase =
  | 'performance_analysis'
  | 'quality_control'
  | 'risk_assessment'
  | 'forecasting'
  | 'optimization'
  | 'reporting'
  | 'research'
  | 'teaching';

export interface CaseStudyBackground {
  organization?: string;
  industry_context: string;
  business_challenge: string;
  objectives: string[];
  scope: string;
  timeline: string;
  stakeholders: Stakeholder[];
}

export interface Stakeholder {
  role: string;
  responsibilities: string[];
  expectations: string[];
}

export interface Methodology {
  approach: string;
  statistical_methods_used: string[];
  tools_used: string[];
  data_collection_methods: string[];
  analysis_techniques: string[];
  limitations: string[];
}

export interface DataDescription {
  data_sources: string[];
  data_types: string[];
  sample_size: number;
  time_period: string;
  data_preprocessing: string[];
  data_quality_notes: string[];
  ethical_considerations?: string[];
}

export interface AnalysisStep {
  step_number: number;
  title: string;
  description: string;
  calculator_used: {
    calculator_id: number;
    calculator_name: string;
    configuration: Record<string, any>;
  };
  input_data: any;
  output_results: any;
  interpretation: string;
  screenshots?: Screenshot[];
}

export interface CaseStudyResults {
  key_findings: KeyFinding[];
  quantitative_results: QuantitativeResult[];
  qualitative_results: QualitativeResult[];
  impact_metrics: ImpactMetric[];
  visualizations: Visualization[];
}

export interface KeyFinding {
  finding: string;
  significance: string;
  supporting_evidence: string[];
}

export interface QuantitativeResult {
  metric: string;
  value: number;
  unit: string;
  comparison?: string;
  interpretation: string;
}

export interface QualitativeResult {
  theme: string;
  description: string;
  examples: string[];
  implications: string[];
}

export interface ImpactMetric {
  metric_name: string;
  before_value?: number;
  after_value?: number;
  improvement_percentage?: number;
  significance: string;
}

export interface Visualization {
  id: number;
  type: 'chart' | 'graph' | 'table' | 'diagram';
  title: string;
  description: string;
  data_url: string;
  interactive: boolean;
  configuration: Record<string, any>;
}

export interface KeyInsight {
  insight: string;
  category: 'strategic' | 'tactical' | 'operational';
  importance: 'high' | 'medium' | 'low';
  action_items: string[];
}

export interface Challenge {
  challenge: string;
  impact: string;
  solution_approach: string;
  lessons_learned: string[];
}

export interface Solution {
  solution: string;
  implementation: string;
  results: string;
  transferability: string;
}

export interface BestPractice {
  practice: string;
  rationale: string;
  implementation_steps: string[];
  benefits: string[];
}

export interface Dataset {
  id: number;
  name: string;
  description: string;
  file_url: string;
  file_type: string;
  file_size: number;
  variables: Variable[];
  usage_notes: string[];
  license_info?: string;
}

export interface Variable {
  name: string;
  type: string;
  description: string;
  unit?: string;
  range?: string;
}

export interface Testimonial {
  author: string;
  role: string;
  organization: string;
  quote: string;
  date: string;
  verified: boolean;
}

export interface ChecklistItem {
  item: string;
  completed: boolean;
  notes?: string;
}

// ===== 6. 内容关系和分类模型 =====

export interface ContentRelationship {
  id: number;
  source_type: 'glossary' | 'guide' | 'faq' | 'case_study';
  source_id: number;
  target_type: 'glossary' | 'guide' | 'faq' | 'case_study' | 'calculator';
  target_id: number;
  relationship_type: RelationshipType;
  strength_score: number; // 0-1
  created_at: string;
}

export type RelationshipType =
  | 'explains'
  | 'demonstrates'
  | 'relates_to'
  | 'prerequisite_for'
  | 'builds_on'
  | 'alternative_to'
  | 'applies'
  | 'references';

// ===== 7. 内容管理模型 =====

export interface ContentWorkflow {
  id: number;
  content_type: 'glossary' | 'guide' | 'faq' | 'case_study';
  content_id: number;
  status: WorkflowStatus;
  assigned_to: number;
  due_date: string;
  current_stage: WorkflowStage;
  stage_history: WorkflowStageHistory[];
  quality_checks: QualityCheck[];
  approvals: Approval[];
}

export type WorkflowStatus = 'draft' | 'in_review' | 'approved' | 'published' | 'archived';

export type WorkflowStage =
  | 'content_creation'
  | 'technical_review'
  | 'seo_optimization'
  | 'editorial_review'
  | 'final_approval'
  | 'published';

export interface WorkflowStageHistory {
  stage: WorkflowStage;
  started_at: string;
  completed_at?: string;
  duration_ms?: number;
  notes?: string;
  reviewer_id?: number;
}

export interface QualityCheck {
  id: number;
  check_type: QualityCheckType;
  status: 'passed' | 'failed' | 'warning';
  details: string;
  checked_by: number;
  checked_at: string;
}

export type QualityCheckType =
  | 'accuracy'
  | 'completeness'
  | 'clarity'
  | 'seo_optimization'
  | 'accessibility'
  | 'technical_validation'
  | 'link_validation';

export interface Approval {
  id: number;
  approver_id: number;
  approval_type: 'technical' | 'editorial' | 'seo' | 'final';
  status: 'approved' | 'rejected' | 'pending';
  comments?: string;
  approved_at?: string;
}

// ===== 8. 性能和分析模型 =====

export interface ContentAnalytics {
  content_id: number;
  content_type: 'glossary' | 'guide' | 'faq' | 'case_study';
  metrics: ContentMetrics;
  user_engagement: UserEngagement;
  seo_performance: SEOPerformance;
  user_feedback: UserFeedback[];
  trends: MetricTrend[];
}

export interface ContentMetrics {
  views: number;
  unique_visitors: number;
  avg_time_on_page: number; // 秒
  bounce_rate: number; // 0-1
  scroll_depth: number; // 0-1
  social_shares: number;
  bookmarks: number;
  exit_rate: number; // 0-1
}

export interface UserEngagement {
  clicks_on_related_calculators: number;
  clicks_on_related_content: number;
  comments_count: number;
  helpful_votes: number;
  completion_rate: number; // 0-1
  return_visits: number;
}

export interface SEOPerformance {
  organic_traffic: number;
  keyword_rankings: KeywordRanking[];
  backlinks: number;
  ctr: number; // 0-1
  impressions: number;
  position_average: number;
}

export interface KeywordRanking {
  keyword: string;
  position: number;
  volume: number;
  difficulty: number;
  url: string;
}

export interface UserFeedback {
  id: number;
  user_id?: number;
  feedback_type: 'rating' | 'comment' | 'suggestion' | 'report';
  content: string;
  rating?: number; // 1-5
  sentiment: 'positive' | 'neutral' | 'negative';
  created_at: string;
  resolved: boolean;
  resolution_notes?: string;
}

export interface MetricTrend {
  metric_name: string;
  time_period: string;
  value: number;
  change_percentage: number;
  trend_direction: 'up' | 'down' | 'stable';
}

// ===== 9. 导出和实用类型 =====

export type ContentType = 'glossary' | 'guide' | 'faq' | 'case_study';

export interface ContentSearchResult {
  id: number;
  type: ContentType;
  title: string;
  description: string;
  relevance_score: number;
  category?: string;
  difficulty_level?: DifficultyLevel;
  url: string;
  last_updated: string;
}

export interface ContentFilterOptions {
  type?: ContentType;
  category?: string;
  difficulty_level?: DifficultyLevel;
  target_audience?: TargetAudience;
  status?: WorkflowStatus;
  author_id?: number;
  date_range?: {
    start: string;
    end: string;
  };
  tags?: string[];
}

export interface ContentBulkOperation {
  operation: 'publish' | 'archive' | 'delete' | 'update_category';
  content_ids: number[];
  parameters?: Record<string, any>;
  requested_by: number;
  scheduled_at?: string;
}

// ===== 10. 数据库模式映射 =====

export const DatabaseSchemaMapping = {
  // 内容表
  content_items: {
    columns: [
      'id', 'slug', 'title', 'description', 'content', 'status',
      'author_id', 'created_at', 'updated_at', 'published_at',
      'content_type', 'category_id', 'difficulty_level'
    ]
  },

  // 术语表
  glossary_terms: {
    columns: [
      'id', 'content_id', 'term_name', 'english_term', 'pronunciation',
      'definition', 'detailed_explanation', 'category', 'pronunciation_url'
    ]
  },

  // 关系表
  content_relationships: {
    columns: [
      'id', 'source_type', 'source_id', 'target_type', 'target_id',
      'relationship_type', 'strength_score', 'created_at'
    ]
  },

  // 分析表
  content_analytics: {
    columns: [
      'id', 'content_id', 'content_type', 'date', 'metrics',
      'user_engagement', 'seo_performance'
    ]
  }
};

export default {
  // 主要模型导出
  GlossaryTerm,
  HowToGuide,
  FAQItem,
  CaseStudy,
  ContentRelationship,
  ContentAnalytics,

  // 工具类型导出
  ContentType,
  DifficultyLevel,
  TargetAudience,
  RelationshipType,

  // 实用工具
  DatabaseSchemaMapping
};