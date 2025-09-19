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
        db.exec(migrationSQL);
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
  // Detect whether the schema already has a description column
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
