/**
 * Vercel-optimized database utilities
 * 
 * Since Vercel is serverless, we need to adapt our database approach:
 * 1. Use in-memory SQLite for development
 * 2. For production, consider using Vercel Postgres or external database
 * 3. Initialize database with migrations on first run
 */

import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

// Global database instance for serverless environment
let dbInstance: Database.Database | null = null;

export function getVercelDb(): Database.Database {
  if (!dbInstance) {
    const isProduction = process.env.NODE_ENV === 'production';
    const isVercel = process.env.VERCEL === '1';

    if (isVercel && isProduction) {
      // In Vercel production, use in-memory database
      console.log('[DB] Using in-memory database for Vercel production');
      dbInstance = new Database(':memory:');
      
      // Initialize schema and seed data
      initializeVercelDatabase(dbInstance);
    } else {
      // Local development - use file database
      const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 
                    path.join(process.cwd(), 'data', 'statcal.db');
      
      console.log(`[DB] Using file database: ${dbPath}`);
      
      // Ensure directory exists
      const dbDir = path.dirname(dbPath);
      if (!fs.existsSync(dbDir)) {
        fs.mkdirSync(dbDir, { recursive: true });
      }

      dbInstance = new Database(dbPath, {
        readonly: false,
        fileMustExist: false, // Create if not exists
      });
    }

    // Configure SQLite for better performance
    dbInstance.pragma('journal_mode = WAL');
    dbInstance.pragma('synchronous = NORMAL');
    dbInstance.pragma('cache_size = 1000');
    dbInstance.pragma('temp_store = memory');

    console.log('[DB] Database connected successfully');
  }

  return dbInstance;
}

function initializeVercelDatabase(db: Database.Database): void {
  console.log('[DB] Initializing Vercel in-memory database...');
  
  // Run all migrations
  const migrationsDir = path.join(process.cwd(), 'migrations');
  
  try {
    if (fs.existsSync(migrationsDir)) {
      const migrationFiles = fs.readdirSync(migrationsDir)
        .filter(file => file.endsWith('.sql'))
        .sort();

      for (const file of migrationFiles) {
        const migrationPath = path.join(migrationsDir, file);
        const migrationSQL = fs.readFileSync(migrationPath, 'utf-8');

        console.log(`[DB] Running migration: ${file}`);
        try {
          db.exec(migrationSQL);
        } catch (error: any) {
          // Ignore "duplicate column" errors which can happen with ALTER TABLE
          if (error.message && error.message.includes('duplicate column')) {
            console.log(`[DB] Column already exists, skipping: ${file}`);
          } else {
            // Re-throw other errors
            throw error;
          }
        }
      }
    }

    // Seed basic content data
    seedBasicContent(db);
    
    console.log('[DB] Vercel database initialized successfully');
  } catch (error) {
    console.error('[DB] Failed to initialize Vercel database:', error);
    throw error;
  }
}

function seedBasicContent(db: Database.Database): void {
  try {
    // Seed glossary terms first (essential for glossary pages)
    seedGlossaryTerms(db);
    
    // Seed basic how-to content
    seedHowToContent(db);
    
    // Seed basic slim_content data
    const columns = db.prepare(`PRAGMA table_info(slim_content)`).all() as Array<{ name: string }>;
    const hasDescriptionColumn = columns.some(column => column.name === 'description');

    const calculators = [
      {
        id: 1,
        type: 'calculator',
        title: 'Mean Calculator',
        slug: 'mean',
        description: 'Calculate the mean (average) of a set of numbers',
        status: 'published'
      },
      {
        id: 2,
        type: 'calculator',
        title: 'Median Calculator',
        slug: 'median',
        description: 'Find the median value of a dataset',
        status: 'published'
      },
      {
        id: 3,
        type: 'calculator',
        title: 'Standard Deviation Calculator',
        slug: 'standard-deviation',
        description: 'Calculate standard deviation and variance',
        status: 'published'
      },
      {
        id: 4,
        type: 'calculator',
        title: 'Weighted Mean Calculator',
        slug: 'weighted-mean',
        description: 'Calculate weighted average of values',
        status: 'published'
      },
      {
        id: 5,
        type: 'calculator',
        title: 'GPA Calculator',
        slug: 'gpa',
        description: 'Calculate your Grade Point Average',
        status: 'published'
      }
    ];

    const insertCalculator = hasDescriptionColumn
      ? db.prepare(`
          INSERT OR IGNORE INTO slim_content (id, type, title, slug, description, status)
          VALUES (@id, @type, @title, @slug, @description, @status)
        `)
      : db.prepare(`
          INSERT OR IGNORE INTO slim_content (id, type, title, slug, summary, status)
          VALUES (@id, @type, @title, @slug, @description, @status)
        `);

    for (const calculator of calculators) {
      insertCalculator.run(calculator);
    }

    console.log('[DB] Basic content seeded');
  } catch (error) {
    console.error('[DB] Error seeding basic content:', error);
  }
}

function seedGlossaryTerms(db: Database.Database): void {
  console.log('[DB] Seeding glossary terms...');
  const glossaryColumns = db.prepare(`PRAGMA table_info(glossary_terms)`).all() as Array<{ name: string }>;

  if (glossaryColumns.length === 0) {
    db.exec(`
      CREATE TABLE IF NOT EXISTS glossary_terms (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        short_description TEXT,
        definition TEXT NOT NULL,
        first_letter CHAR(1),
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('[DB] Created glossary_terms table for Vercel seed');
  } else if (!glossaryColumns.some(column => column.name === 'short_description')) {
    db.exec('ALTER TABLE glossary_terms ADD COLUMN short_description TEXT');
    console.log('[DB] Added missing short_description column to glossary_terms');
  }

  const terms = [
    {
      id: 1,
      slug: 'mean',
      title: 'Mean (Average)',
      short_description: 'The arithmetic average of a set of values',
      definition: 'The arithmetic average of a set of values, calculated by adding all values and dividing by the number of values.',
      first_letter: 'M'
    },
    {
      id: 2,
      slug: 'median',
      title: 'Median',
      short_description: 'The middle value in a dataset',
      definition: 'The middle value in a dataset when values are arranged in ascending order. For even numbers of values, it\'s the average of the two middle values.',
      first_letter: 'M'
    },
    {
      id: 3,
      slug: 'mode',
      title: 'Mode',
      short_description: 'The most frequently occurring value',
      definition: 'The value that appears most frequently in a dataset. A dataset can have one mode, multiple modes, or no mode.',
      first_letter: 'M'
    },
    {
      id: 4,
      slug: 'standard-deviation',
      title: 'Standard Deviation',
      short_description: 'A measure of variability',
      definition: 'A measure of variability that indicates how spread out data points are from the mean. Lower values indicate data points are closer to the mean.',
      first_letter: 'S'
    },
    {
      id: 5,
      slug: 'variance',
      title: 'Variance',
      short_description: 'The average of squared differences from the mean',
      definition: 'The average of squared differences from the mean. It measures the spread of data points around the mean.',
      first_letter: 'V'
    }
  ];

  const insertTerm = db.prepare(`
    INSERT OR IGNORE INTO glossary_terms (id, slug, title, short_description, definition, first_letter, created_at, updated_at)
    VALUES (@id, @slug, @title, @short_description, @definition, @first_letter, datetime('now'), datetime('now'))
  `);

  for (const term of terms) {
    insertTerm.run(term);
  }

  console.log(`[DB] Seeded ${terms.length} glossary terms`);
}

function seedHowToContent(db: Database.Database): void {
  console.log('[DB] Seeding how-to content...');
  
  const howToGuides = [
    {
      id: 1,
      slug: 'how-calculate-mean',
      type: 'howto',
      title: 'How to Calculate the Mean',
      summary: 'Learn to calculate the arithmetic mean step by step',
      description: 'A comprehensive guide on calculating the mean (average) of a dataset.',
      content: 'The mean is calculated by adding all values and dividing by the count of values.',
      status: 'published',
      reading_time: 5,
      priority: 1,
      difficulty: 'beginner'
    },
    {
      id: 2,
      slug: 'how-to-calculate-percent-error',
      type: 'howto',
      title: 'How to Calculate Percent Error',
      summary: 'Step-by-step guide for calculating percentage error',
      description: 'Learn how to measure the accuracy of your measurements using percent error.',
      content: 'Percent error = |measured - actual| / actual × 100%',
      status: 'published',
      reading_time: 7,
      priority: 2,
      difficulty: 'intermediate'
    },
    {
      id: 3,
      slug: 'how-to-calculate-range',
      type: 'howto',
      title: 'How to Calculate Range',
      summary: 'Simple guide to finding the range of a dataset',
      description: 'Understanding how to calculate the range as a measure of data spread.',
      content: 'Range = Maximum value - Minimum value',
      status: 'published',
      reading_time: 3,
      priority: 3,
      difficulty: 'beginner'
    }
  ];

  // Check if slim_content has description column
  const columns = db.prepare(`PRAGMA table_info(slim_content)`).all() as Array<{ name: string }>;
  const hasDescriptionColumn = columns.some(column => column.name === 'description');

  const insertHowTo = hasDescriptionColumn
    ? db.prepare(`
        INSERT OR IGNORE INTO slim_content (id, slug, type, title, summary, description, content, status, reading_time, priority, difficulty, created_at, updated_at)
        VALUES (@id, @slug, @type, @title, @summary, @description, @content, @status, @reading_time, @priority, @difficulty, datetime('now'), datetime('now'))
      `)
    : db.prepare(`
        INSERT OR IGNORE INTO slim_content (id, slug, type, title, summary, content, status, reading_time, priority, difficulty, created_at, updated_at)
        VALUES (@id, @slug, @type, @title, @summary, @content, @status, @reading_time, @priority, @difficulty, datetime('now'), datetime('now'))
      `);

  for (const guide of howToGuides) {
    insertHowTo.run(guide);
  }

  console.log(`[DB] Seeded ${howToGuides.length} how-to guides`);
}

export function closeVercelDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
    console.log('[DB] Database connection closed');
  }
}

// Cleanup on process termination
if (typeof process !== 'undefined') {
  process.on('exit', closeVercelDb);
  process.on('SIGINT', closeVercelDb);
  process.on('SIGTERM', closeVercelDb);
}
