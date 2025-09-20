import { BaseService } from './base';
import type { THowToFrontmatter, THowToStep } from '../content/contentSchema';

export interface HowToStepRow {
  id: number;
  howto_slug: string;
  step_order: number;
  step_title: string;
  step_content: string;
  step_image?: string;
  step_code?: string;
  created_at: string;
  updated_at: string;
}

export interface HowToMetadataRow {
  howto_slug: string;
  prerequisites: string; // JSON string
  outcomes: string; // JSON string
  prefill_params: string; // JSON string
  estimated_time?: number;
  created_at: string;
  updated_at: string;
}

export interface ContentItem {
  id: number;
  slug: string;
  type: string;
  title: string;
  summary?: string;
  content?: string;
  status: string;
  reading_time?: number;
  priority: number;
  featured: number;
  difficulty?: string;
  industry?: string;
  target_tool?: string;
  tags: string; // JSON string
  created_at: string;
  updated_at: string;
}

/**
 * Enhanced Content Service with structured How-To support
 * Handles both legacy and new structured content formats
 */
export class EnhancedContentService extends BaseService {
  private defaultCacheTTL = 12 * 60 * 1000; // 12 minutes

  constructor() {
    super();
  }

  /**
   * Get How-To guide with structured steps
   */
  async getHowToWithSteps(slug: string): Promise<{
    howto: THowToFrontmatter;
    steps: THowToStep[];
    content: string;
  } | null> {
    const cacheKey = this.generateCacheKey('howto:with-steps', slug);

    return this.queryWithCache(cacheKey, async () => {
      // Get main content
      const contentRow = this.db.prepare(`
        SELECT *
        FROM slim_content
        WHERE slug = ? AND type = 'howto' AND status = 'published'
      `).get(slug) as ContentItem | undefined;

      if (!contentRow) {
        return null;
      }

      // Get structured steps
      const stepRows = this.db.prepare(`
        SELECT *
        FROM howto_steps
        WHERE howto_slug = ?
        ORDER BY step_order ASC
      `).all(slug) as HowToStepRow[];

      // Get metadata
      const metadataRow = this.db.prepare(`
        SELECT *
        FROM howto_metadata
        WHERE howto_slug = ?
      `).get(slug) as HowToMetadataRow | undefined;

      // Convert database rows to frontend types
      const howto = this.convertToHowToFrontmatter(contentRow, metadataRow);
      const steps = this.convertToHowToSteps(stepRows);

      return {
        howto,
        steps,
        content: contentRow.content || ''
      };
    }, this.defaultCacheTTL);
  }

  /**
   * Get all How-To guides list
   */
  async getHowToList(): Promise<THowToFrontmatter[]> {
    const cacheKey = this.generateCacheKey('howto:list');

    return this.queryWithCache(cacheKey, async () => {
      const contentRows = this.db.prepare(`
        SELECT sc.*, 
               hm.prerequisites, hm.outcomes, hm.prefill_params, hm.estimated_time,
               COUNT(hs.id) as step_count
        FROM slim_content sc
        LEFT JOIN howto_metadata hm ON hm.howto_slug = sc.slug
        LEFT JOIN howto_steps hs ON hs.howto_slug = sc.slug
        WHERE sc.type = 'howto' AND sc.status = 'published'
        GROUP BY sc.slug
        ORDER BY sc.priority DESC, sc.updated_at DESC
      `).all() as (ContentItem & HowToMetadataRow & { step_count: number })[];

      return contentRows.map(row => this.convertToHowToFrontmatter(row, row));
    }, this.defaultCacheTTL);
  }

  /**
   * Check if How-To has structured steps
   */
  async hasStructuredSteps(slug: string): Promise<boolean> {
    const count = this.db.prepare(`
      SELECT COUNT(*) as count
      FROM howto_steps
      WHERE howto_slug = ?
    `).get(slug) as { count: number };

    return count.count > 0;
  }

  /**
   * Get migration status for all How-To guides
   */
  async getMigrationStatus(): Promise<{
    total: number;
    migrated: number;
    pending: number;
    failed: number;
    details: Array<{
      slug: string;
      title: string;
      status: string;
      steps_count: number;
      has_structured_steps: boolean;
    }>;
  }> {
    const details = this.db.prepare(`
      SELECT 
        sc.slug,
        sc.title,
        COALESCE(ml.status, 'pending') as migration_status,
        COALESCE(ml.steps_extracted, 0) as steps_extracted,
        COUNT(hs.id) as current_steps_count
      FROM slim_content sc
      LEFT JOIN migration_log ml ON ml.howto_slug = sc.slug 
        AND ml.migration_name = 'howto_structure_migration'
      LEFT JOIN howto_steps hs ON hs.howto_slug = sc.slug
      WHERE sc.type = 'howto'
      GROUP BY sc.slug
      ORDER BY sc.title ASC
    `).all() as Array<{
      slug: string;
      title: string;
      migration_status: string;
      steps_extracted: number;
      current_steps_count: number;
    }>;

    const stats = details.reduce(
      (acc, item) => {
        acc.total++;
        const hasSteps = item.current_steps_count > 0;
        
        if (hasSteps && item.migration_status === 'completed') {
          acc.migrated++;
        } else if (item.migration_status === 'failed') {
          acc.failed++;
        } else {
          acc.pending++;
        }
        
        return acc;
      },
      { total: 0, migrated: 0, pending: 0, failed: 0 }
    );

    return {
      ...stats,
      details: details.map(item => ({
        slug: item.slug,
        title: item.title,
        status: item.migration_status,
        steps_count: item.steps_extracted,
        has_structured_steps: item.current_steps_count > 0
      }))
    };
  }

  /**
   * Convert database row to THowToFrontmatter
   */
  private convertToHowToFrontmatter(
    contentRow: ContentItem,
    metadataRow?: HowToMetadataRow | null
  ): THowToFrontmatter {
    const tags = this.parseJsonSafely(contentRow.tags, []);
    const prerequisites = metadataRow ? this.parseJsonSafely(metadataRow.prerequisites, []) : [];
    const outcomes = metadataRow ? this.parseJsonSafely(metadataRow.outcomes, []) : [];
    const prefillParams = metadataRow ? this.parseJsonSafely(metadataRow.prefill_params, {}) : {};

    return {
      type: 'howto',
      slug: contentRow.slug,
      title: contentRow.title,
      summary: contentRow.summary || '',
      tags: tags,
      status: contentRow.status as 'draft' | 'published' | 'archived',
      created: contentRow.created_at,
      updated: contentRow.updated_at,
      readingTime: contentRow.reading_time,
      targetTool: contentRow.target_tool,
      difficulty: contentRow.difficulty as 'beginner' | 'intermediate' | 'advanced' | undefined,
      prerequisites: prerequisites.length > 0 ? prerequisites : undefined,
      outcomes: outcomes.length > 0 ? outcomes : undefined,
      prefillParams: Object.keys(prefillParams).length > 0 ? prefillParams : undefined,
      // Add other required fields with defaults
      related: undefined,
      mentions: undefined,
      seo: undefined,
      author: undefined
    };
  }

  /**
   * Convert database rows to THowToStep[]
   */
  private convertToHowToSteps(stepRows: HowToStepRow[]): THowToStep[] {
    return stepRows.map((row) => ({
      id: `step-${row.id}`, // Use database ID for stable, unique IDs
      name: row.step_title,
      description: row.step_content,
      tip: undefined, // No tip field in database
      warning: undefined, // No warning field in database
      image: row.step_image
        ? { url: row.step_image, alt: row.step_title }
        : undefined
    }));
  }

  /**
   * Safely parse JSON string
   */
  private parseJsonSafely<T>(jsonString: string | null | undefined, defaultValue: T): T {
    if (!jsonString) return defaultValue;
    
    try {
      return JSON.parse(jsonString);
    } catch {
      return defaultValue;
    }
  }
}