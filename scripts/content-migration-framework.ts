import Database from 'better-sqlite3';
import path from 'node:path';

/**
 * Content Migration Framework for How-To Guides
 * Converts unstructured markdown content to structured steps
 */

interface HowToStep {
  slug: string;
  name: string;
  description: string;
  tip?: string;
  warning?: string;
  image_url?: string;
  image_alt?: string;
}

interface HowToMetadata {
  prerequisites: string[];
  outcomes: string[];
  prefill_params: Record<string, any>;
  estimated_time?: number;
}

interface ParsedContent {
  introduction: string;
  steps: HowToStep[];
  metadata: HowToMetadata;
}

/**
 * Content Parser Class
 * Analyzes markdown content and extracts structured information
 */
export class HowToContentParser {
  
  /**
   * Parse markdown content into structured steps
   */
  parseContent(content: string, howtoSlug: string): ParsedContent {
    const lines = content.split('\n');
    let currentSection = '';
    let steps: HowToStep[] = [];
    let introduction = '';
    let prerequisites: string[] = [];
    let outcomes: string[] = [];
    
    let stepCounter = 0;
    let currentStep: Partial<HowToStep> = {};
    let currentDescription: string[] = [];
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      // Identify section headers
      if (line.startsWith('##')) {
        this.processCurrentStep(currentStep, currentDescription, steps, howtoSlug, stepCounter);
        currentStep = {};
        currentDescription = [];
        
        const headerText = line.replace(/^#+\s*/, '');
        
        if (this.isStepHeader(headerText)) {
          stepCounter++;
          currentStep.slug = `step-${stepCounter}`;
          currentStep.name = headerText;
          currentSection = 'step';
        } else {
          currentSection = headerText.toLowerCase();
        }
        continue;
      }
      
      // Process list items for steps, prerequisites, outcomes
      if (line.startsWith('-') || line.match(/^\d+\./)) {
        const listItem = line.replace(/^[-\d\.\s]+/, '').trim();
        
        if (currentSection === 'step' && listItem) {
          if (!currentStep.name) {
            stepCounter++;
            currentStep.slug = `step-${stepCounter}`;
            currentStep.name = listItem;
          } else {
            currentDescription.push(line);
          }
        } else if (currentSection.includes('prerequisite')) {
          prerequisites.push(listItem);
        } else if (currentSection.includes('outcome') || currentSection.includes('result')) {
          outcomes.push(listItem);
        }
        continue;
      }
      
      // Extract tips and warnings
      if (line.toLowerCase().includes('tip:') || line.toLowerCase().includes('💡')) {
        currentStep.tip = line.replace(/^.*?(tip:|💡)\s*/i, '');
        continue;
      }
      
      if (line.toLowerCase().includes('warning:') || line.toLowerCase().includes('⚠️')) {
        currentStep.warning = line.replace(/^.*?(warning:|⚠️)\s*/i, '');
        continue;
      }
      
      // Collect content for current section
      if (currentSection === 'step') {
        currentDescription.push(line);
      } else if (stepCounter === 0 && line) {
        introduction += line + '\n';
      }
    }
    
    // Process final step
    this.processCurrentStep(currentStep, currentDescription, steps, howtoSlug, stepCounter);
    
    return {
      introduction: introduction.trim(),
      steps,
      metadata: {
        prerequisites,
        outcomes,
        prefill_params: {},
        estimated_time: this.estimateTime(steps.length, content.length)
      }
    };
  }
  
  private isStepHeader(headerText: string): boolean {
    const stepPatterns = [
      /step\s*\d+/i,
      /method\s*\d+/i,
      /^(enter|click|select|choose|calculate|find|arrange)/i,
      /using.*calculator/i
    ];
    
    return stepPatterns.some(pattern => pattern.test(headerText));
  }
  
  private processCurrentStep(
    currentStep: Partial<HowToStep>,
    currentDescription: string[],
    steps: HowToStep[],
    howtoSlug: string,
    stepCounter: number
  ) {
    if (currentStep.name && currentDescription.length > 0) {
      steps.push({
        slug: currentStep.slug || `step-${stepCounter}`,
        name: currentStep.name,
        description: currentDescription.join('\n').trim(),
        tip: currentStep.tip,
        warning: currentStep.warning,
        image_url: currentStep.image_url,
        image_alt: currentStep.image_alt
      });
    }
  }
  
  private estimateTime(stepCount: number, contentLength: number): number {
    // Base time calculation: 2-3 minutes per step + reading time
    const baseTime = stepCount * 2.5;
    const readingTime = Math.ceil(contentLength / 200); // ~200 chars per minute
    return Math.ceil(baseTime + readingTime);
  }
}

/**
 * Database Migration Class
 * Handles the actual migration of content to new schema
 */
export class HowToMigrationManager {
  private db: Database.Database;
  private parser: HowToContentParser;
  
  constructor(dbPath: string) {
    this.db = new Database(dbPath);
    this.parser = new HowToContentParser();
    
    // Enable foreign keys
    this.db.pragma('foreign_keys = ON');
  }
  
  /**
   * Migrate all How-To content to structured format
   */
  async migrateAllContent(): Promise<void> {
    const howtos = this.db.prepare(`
      SELECT slug, title, content, target_tool, difficulty, reading_time
      FROM slim_content 
      WHERE type = 'howto' AND content IS NOT NULL
    `).all() as any[];
    
    console.log(`Found ${howtos.length} How-To guides to migrate`);
    
    for (const howto of howtos) {
      await this.migrateContent(howto);
    }
  }
  
  /**
   * Migrate single How-To content
   */
  async migrateContent(howto: any): Promise<void> {
    const { slug, content, target_tool, difficulty, reading_time } = howto;
    
    try {
      // Log migration start
      this.logMigration(slug, 'processing');
      
      // Parse content
      const parsed = this.parser.parseContent(content, slug);
      
      // Insert steps
      const stepInsert = this.db.prepare(`
        INSERT INTO howto_steps (slug, howto_slug, step_order, name, description, tip, warning, image_url, image_alt)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `);
      
      for (let i = 0; i < parsed.steps.length; i++) {
        const step = parsed.steps[i];
        stepInsert.run(
          step.slug,
          slug,
          i + 1,
          step.name,
          step.description,
          step.tip || null,
          step.warning || null,
          step.image_url || null,
          step.image_alt || null
        );
      }
      
      // Insert metadata
      this.db.prepare(`
        INSERT OR REPLACE INTO howto_metadata 
        (howto_slug, prerequisites, outcomes, prefill_params, estimated_time)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        slug,
        JSON.stringify(parsed.metadata.prerequisites),
        JSON.stringify(parsed.metadata.outcomes),
        JSON.stringify(parsed.metadata.prefill_params),
        parsed.metadata.estimated_time
      );
      
      // Update introduction in slim_content
      this.db.prepare(`
        UPDATE slim_content 
        SET content = ?
        WHERE slug = ?
      `).run(parsed.introduction, slug);
      
      // Log success
      this.logMigration(slug, 'completed', parsed.steps.length);
      
      console.log(`✅ Migrated ${slug}: ${parsed.steps.length} steps`);
      
    } catch (error) {
      this.logMigration(slug, 'failed', 0, error instanceof Error ? error.message : 'Unknown error');
      console.error(`❌ Failed to migrate ${slug}:`, error);
    }
  }
  
  private logMigration(slug: string, status: string, stepsExtracted = 0, errorMessage?: string) {
    this.db.prepare(`
      INSERT INTO migration_log (migration_name, howto_slug, status, steps_extracted, error_message)
      VALUES (?, ?, ?, ?, ?)
    `).run('howto_structure_migration', slug, status, stepsExtracted, errorMessage || null);
  }
  
  /**
   * Get migration status report
   */
  getMigrationReport(): any {
    return this.db.prepare(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(steps_extracted) as total_steps
      FROM migration_log 
      WHERE migration_name = 'howto_structure_migration'
      GROUP BY status
    `).all();
  }
  
  close(): void {
    this.db.close();
  }
}