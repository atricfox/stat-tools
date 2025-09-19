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
  // Insert basic calculator content
  const insertCalculator = db.prepare(`
    INSERT OR IGNORE INTO slim_content (id, type, title, slug, description, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  const calculators = [
    [1, 'calculator', 'Mean Calculator', 'mean', 'Calculate the mean (average) of a set of numbers', 'published'],
    [2, 'calculator', 'Median Calculator', 'median', 'Find the median value of a dataset', 'published'],
    [3, 'calculator', 'Standard Deviation Calculator', 'standard-deviation', 'Calculate standard deviation and variance', 'published'],
    [4, 'calculator', 'Weighted Mean Calculator', 'weighted-mean', 'Calculate weighted average of values', 'published'],
    [5, 'calculator', 'GPA Calculator', 'gpa', 'Calculate your Grade Point Average', 'published'],
  ];

  for (const calc of calculators) {
    insertCalculator.run(...calc);
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