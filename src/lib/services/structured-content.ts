import { BaseService } from './base';

// How-to step interface
export interface HowtoStep {
  id: number;
  content_id: number;
  step_order: number;
  step_id: string;
  name: string;
  description: string;
  tip?: string;
  warning?: string;
}

// Case study details interface
export interface CaseDetails {
  content_id: number;
  problem: string;
  solution: string;
  results: string;
  lessons: string;
  tools_used: string;
  background: string;
  challenge: string;
  approach: string;
  results_detail: string;
  key_insights: string;
  recommendations: string;
}

// Enhanced content item with structured data
export interface StructuredContent {
  id: number;
  slug: string;
  type: 'howto' | 'case';
  title: string;
  summary: string;
  content: string;
  status: string;
  reading_time: number;
  created_at: string;
  updated_at: string;
  steps?: HowtoStep[];
  caseDetails?: CaseDetails;
}

/**
 * Service for accessing structured content data
 * Uses the database views to provide rich content with structured information
 */
export class StructuredContentService extends BaseService {
  private defaultCacheTTL = 15 * 60 * 1000; // 15 minutes

  constructor() {
    super();
  }

  /**
   * Get how-to content with structured steps
   */
  async getHowtoWithSteps(contentId: number): Promise<StructuredContent | null> {
    const cacheKey = this.generateCacheKey('structured:howto', contentId);

    return this.queryWithCache(cacheKey, () => {
      // Get the main content
      const contentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE id = ? AND type = 'howto'
      `);

      const content = contentQuery.get(contentId) as any;
      if (!content) return null;

      // Get the structured steps
      const stepsQuery = this.db.prepare(`
        SELECT id, content_id, step_order, step_id, name, description, tip, warning
        FROM v_howto_steps_from_details 
        WHERE content_id = ?
        ORDER BY step_order
      `);

      const steps = stepsQuery.all(contentId) as HowtoStep[];

      return {
        ...content,
        steps
      } as StructuredContent;
    }, this.defaultCacheTTL);
  }

  /**
   * Get case study with structured details
   */
  async getCaseStudyWithDetails(contentId: number): Promise<StructuredContent | null> {
    const cacheKey = this.generateCacheKey('structured:case', contentId);

    return this.queryWithCache(cacheKey, () => {
      // Get the main content
      const contentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE id = ? AND type = 'case'
      `);

      const content = contentQuery.get(contentId) as any;
      if (!content) return null;

      // Get the structured case details
      const detailsQuery = this.db.prepare(`
        SELECT content_id, problem, solution, results, lessons, tools_used,
               background, challenge, approach, results_detail, key_insights, recommendations
        FROM v_case_details_from_details 
        WHERE content_id = ?
      `);

      const caseDetails = detailsQuery.get(contentId) as CaseDetails | undefined;

      return {
        ...content,
        caseDetails
      } as StructuredContent;
    }, this.defaultCacheTTL);
  }

  /**
   * Get all how-to content with steps
   */
  async getAllHowtoWithSteps(): Promise<StructuredContent[]> {
    const cacheKey = this.generateCacheKey('structured:howto:all');

    return this.queryWithCache(cacheKey, () => {
      // Get all how-to content
      const contentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE type = 'howto' AND status = 'published'
        ORDER BY updated_at DESC
      `);

      const contents = contentQuery.all() as any[];
      
      // Get steps for all how-to content
      const allStepsQuery = this.db.prepare(`
        SELECT id, content_id, step_order, step_id, name, description, tip, warning
        FROM v_howto_steps_from_details 
        ORDER BY content_id, step_order
      `);

      const allSteps = allStepsQuery.all() as HowtoStep[];
      
      // Group steps by content_id
      const stepsByContent = new Map<number, HowtoStep[]>();
      for (const step of allSteps) {
        if (!stepsByContent.has(step.content_id)) {
          stepsByContent.set(step.content_id, []);
        }
        stepsByContent.get(step.content_id)!.push(step);
      }

      // Combine content with steps
      return contents.map(content => ({
        ...content,
        steps: stepsByContent.get(content.id) || []
      })) as StructuredContent[];
    }, this.defaultCacheTTL);
  }

  /**
   * Get all case studies with details
   */
  async getAllCaseStudiesWithDetails(): Promise<StructuredContent[]> {
    const cacheKey = this.generateCacheKey('structured:case:all');

    return this.queryWithCache(cacheKey, () => {
      // Get all case study content
      const contentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE type = 'case' AND status = 'published'
        ORDER BY updated_at DESC
      `);

      const contents = contentQuery.all() as any[];
      
      // Get details for all case studies
      const allDetailsQuery = this.db.prepare(`
        SELECT content_id, problem, solution, results, lessons, tools_used,
               background, challenge, approach, results_detail, key_insights, recommendations
        FROM v_case_details_from_details
      `);

      const allDetails = allDetailsQuery.all() as CaseDetails[];
      
      // Create a map for quick lookup
      const detailsByContent = new Map<number, CaseDetails>();
      for (const detail of allDetails) {
        detailsByContent.set(detail.content_id, detail);
      }

      // Combine content with details
      return contents.map(content => ({
        ...content,
        caseDetails: detailsByContent.get(content.id)
      })) as StructuredContent[];
    }, this.defaultCacheTTL);
  }

  /**
   * Get structured content by slug (works for both types)
   */
  async getStructuredContentBySlug(slug: string): Promise<StructuredContent | null> {
    const cacheKey = this.generateCacheKey('structured:slug', slug);

    return this.queryWithCache(cacheKey, async () => {
      // Get the main content first
      const contentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE slug = ? AND type IN ('howto', 'case')
      `);

      const content = contentQuery.get(slug) as any;
      if (!content) return null;

      if (content.type === 'howto') {
        return await this.getHowtoWithSteps(content.id);
      } else {
        return await this.getCaseStudyWithDetails(content.id);
      }
    }, this.defaultCacheTTL);
  }

  /**
   * Search structured content
   */
  async searchStructuredContent(query: string, type?: 'howto' | 'case'): Promise<StructuredContent[]> {
    const cacheKey = this.generateCacheKey('structured:search', query, type || 'all');

    return this.queryWithCache(cacheKey, () => {
      let whereClause = "type IN ('howto', 'case') AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)";
      const params = [`%${query}%`, `%${query}%`, `%${query}%`];

      if (type) {
        whereClause = "type = ? AND (title LIKE ? OR summary LIKE ? OR content LIKE ?)";
        params.unshift(type);
      }

      const searchQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, content, status, reading_time, created_at, updated_at
        FROM slim_content 
        WHERE ${whereClause} AND status = 'published'
        ORDER BY 
          CASE 
            WHEN title LIKE ? THEN 1
            WHEN summary LIKE ? THEN 2 
            ELSE 3 
          END,
          updated_at DESC
        LIMIT 20
      `);

      const searchParams = [...params, `%${query}%`, `%${query}%`];
      const contents = searchQuery.all(...searchParams) as any[];

      // For search results, we don't fetch detailed structured data to keep it fast
      // The structured data can be loaded on-demand when viewing individual items
      return contents as StructuredContent[];
    }, this.defaultCacheTTL / 2); // Shorter cache for search results
  }

  /**
   * Get statistics about structured content
   */
  async getStructuredContentStats(): Promise<{
    totalHowtos: number;
    totalCaseStudies: number;
    totalSteps: number;
    avgStepsPerHowto: number;
    recentlyUpdated: StructuredContent[];
  }> {
    const cacheKey = this.generateCacheKey('structured:stats');

    return this.queryWithCache(cacheKey, async () => {
      const statsQuery = this.db.prepare(`
        SELECT 
          SUM(CASE WHEN type = 'howto' THEN 1 ELSE 0 END) as total_howtos,
          SUM(CASE WHEN type = 'case' THEN 1 ELSE 0 END) as total_case_studies
        FROM slim_content 
        WHERE type IN ('howto', 'case') AND status = 'published'
      `);

      const stats = statsQuery.get() as any;

      const stepsStatsQuery = this.db.prepare(`
        SELECT COUNT(*) as total_steps
        FROM v_howto_steps_from_details
      `);

      const stepStats = stepsStatsQuery.get() as any;

      const recentQuery = this.db.prepare(`
        SELECT id, slug, type, title, summary, updated_at
        FROM slim_content 
        WHERE type IN ('howto', 'case') AND status = 'published'
        ORDER BY updated_at DESC
        LIMIT 5
      `);

      const recentlyUpdated = recentQuery.all() as StructuredContent[];

      return {
        totalHowtos: stats.total_howtos || 0,
        totalCaseStudies: stats.total_case_studies || 0,
        totalSteps: stepStats.total_steps || 0,
        avgStepsPerHowto: stats.total_howtos > 0 ? Math.round((stepStats.total_steps || 0) / stats.total_howtos * 10) / 10 : 0,
        recentlyUpdated
      };
    }, this.defaultCacheTTL);
  }

  /**
   * Clear structured content cache
   */
  clearStructuredContentCache(): void {
    this.clearCache('structured');
  }
}

// Export singleton instance
export const structuredContentService = new StructuredContentService();