#!/usr/bin/env tsx

import path from 'node:path';
import { HowToMigrationManager, HowToContentParser } from './content-migration-framework';
import Database from 'better-sqlite3';

/**
 * How-To Content Migration Script
 * Usage: npm run migrate:howto [options]
 * 
 * Options:
 *   --dry-run     Show what would be migrated without making changes
 *   --priority    Migrate only high-priority content (first 5 items)
 *   --single=slug Migrate only specific slug
 *   --force       Force re-migration of already migrated content
 */

interface MigrationOptions {
  dryRun: boolean;
  priority: boolean;
  single?: string;
  force: boolean;
  verbose: boolean;
}

function parseArgs(): MigrationOptions {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    priority: args.includes('--priority'),
    single: args.find(arg => arg.startsWith('--single='))?.split('=')[1],
    force: args.includes('--force'),
    verbose: args.includes('--verbose') || args.includes('-v')
  };
}

function getDbPath(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DATABASE_PATH || '/app/data/statcal.db';
  }
  return path.join(process.cwd(), 'data', 'statcal.db');
}

async function runMigration(): Promise<void> {
  const options = parseArgs();
  const dbPath = getDbPath();
  
  console.log('🚀 How-To Content Migration Starting...');
  console.log('📍 Database:', dbPath);
  console.log('⚙️  Options:', JSON.stringify(options, null, 2));
  
  // Apply schema changes first
  console.log('\n📋 Applying schema changes...');
  await applySchemaChanges(dbPath);
  
  if (options.dryRun) {
    console.log('\n🔍 DRY RUN MODE - No changes will be made');
    await performDryRun(dbPath, options);
    return;
  }
  
  // Perform actual migration
  const manager = new HowToMigrationManager(dbPath);
  
  try {
    if (options.single) {
      await migrateSingle(manager, options.single, options);
    } else if (options.priority) {
      await migratePriority(manager, options);
    } else {
      await migrateAll(manager, options);
    }
    
    // Print summary report
    console.log('\n📊 Migration Summary:');
    const report = manager.getMigrationReport();
    console.table(report);
    
  } finally {
    manager.close();
  }
  
  console.log('\n✅ Migration completed!');
}

async function applySchemaChanges(dbPath: string): Promise<void> {
  const db = new Database(dbPath);
  
  try {
    // Check if schema already exists
    const tableExists = db.prepare(`
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='howto_steps'
    `).get();
    
    if (tableExists) {
      console.log('   ℹ️  Schema already exists, skipping...');
      return;
    }
    
    // Read and execute schema
    const fs = await import('node:fs');
    const schemaPath = path.join(process.cwd(), 'migrations', '007_howto_steps_schema.sql');
    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    
    db.exec(schemaSql);
    console.log('   ✅ Schema applied successfully');
    
  } catch (error) {
    console.error('   ❌ Schema application failed:', error);
    throw error;
  } finally {
    db.close();
  }
}

async function performDryRun(dbPath: string, options: MigrationOptions): Promise<void> {
  const db = new Database(dbPath);
  const parser = new HowToContentParser();
  
  try {
    let query = `
      SELECT slug, title, LENGTH(content) as content_length, target_tool
      FROM slim_content 
      WHERE type = 'howto' AND content IS NOT NULL
    `;
    
    if (options.single) {
      query += ` AND slug = '${options.single}'`;
    } else if (options.priority) {
      const prioritySlugs = [
        'how-to-use-median-calculator',
        'how-calculate-mean', 
        'how-to-calculate-variance',
        'how-to-calculate-standard-deviation',
        'how-to-import-data-from-excel'
      ];
      query += ` AND slug IN (${prioritySlugs.map(s => `'${s}'`).join(',')})`;
    }
    
    const howtos = db.prepare(query).all() as any[];
    
    console.log(`\n📝 Would process ${howtos.length} How-To guides:`);
    
    for (const howto of howtos) {
      console.log(`\n🔍 Analyzing: ${howto.slug}`);
      console.log(`   📊 Content length: ${howto.content_length} characters`);
      
      if (options.verbose) {
        const content = db.prepare('SELECT content FROM slim_content WHERE slug = ?').get(howto.slug) as any;
        const parsed = parser.parseContent(content.content, howto.slug);
        
        console.log(`   📋 Would extract: ${parsed.steps.length} steps`);
        console.log(`   ⏱️  Estimated time: ${parsed.metadata.estimated_time} minutes`);
        console.log(`   📚 Prerequisites: ${parsed.metadata.prerequisites.length}`);
        console.log(`   🎯 Outcomes: ${parsed.metadata.outcomes.length}`);
        
        if (parsed.steps.length > 0) {
          console.log('   📝 Steps preview:');
          parsed.steps.slice(0, 3).forEach((step, i) => {
            console.log(`      ${i + 1}. ${step.name}`);
          });
          if (parsed.steps.length > 3) {
            console.log(`      ... and ${parsed.steps.length - 3} more`);
          }
        }
      }
    }
    
  } finally {
    db.close();
  }
}

async function migrateSingle(manager: HowToMigrationManager, slug: string, options: MigrationOptions): Promise<void> {
  console.log(`\n🎯 Migrating single item: ${slug}`);
  
  const db = (manager as any).db;
  const howto = db.prepare(`
    SELECT slug, title, content, target_tool, difficulty, reading_time
    FROM slim_content 
    WHERE type = 'howto' AND slug = ?
  `).get(slug);
  
  if (!howto) {
    console.error(`❌ How-To guide '${slug}' not found`);
    return;
  }
  
  await manager.migrateContent(howto);
}

async function migratePriority(manager: HowToMigrationManager, options: MigrationOptions): Promise<void> {
  console.log(`\n⭐ Migrating high-priority content (5 items)`);
  
  const prioritySlugs = [
    'how-to-use-median-calculator',
    'how-calculate-mean', 
    'how-to-calculate-variance',
    'how-to-calculate-standard-deviation',
    'how-to-import-data-from-excel'
  ];
  
  const db = (manager as any).db;
  
  for (const slug of prioritySlugs) {
    const howto = db.prepare(`
      SELECT slug, title, content, target_tool, difficulty, reading_time
      FROM slim_content 
      WHERE type = 'howto' AND slug = ?
    `).get(slug);
    
    if (howto) {
      console.log(`\n🔄 Processing: ${howto.title}`);
      await manager.migrateContent(howto);
    } else {
      console.log(`⚠️  Priority item not found: ${slug}`);
    }
  }
}

async function migrateAll(manager: HowToMigrationManager, options: MigrationOptions): Promise<void> {
  console.log(`\n🔄 Migrating all How-To content`);
  await manager.migrateAllContent();
}

// Execute if run directly
if (require.main === module) {
  runMigration()
    .then(() => {
      console.log('\n🎉 Migration script completed successfully');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 Migration script failed:', error);
      process.exit(1);
    });
}