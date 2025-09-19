import Database from 'better-sqlite3';
import path from 'path';
import fs from 'node:fs';
import { getVercelDb } from './vercel-db';

// Add debug logging
const debug = process.env.NODE_ENV === 'development';

// Global database connection
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  const defaultDbPath = process.env.DATABASE_URL?.replace('file:', '') || 
    path.join(process.cwd(), 'data', 'statcal.db');

  // Vercel serverless environment - always use in-memory database
  if (process.env.VERCEL === '1') {
    console.log('[DB] Detected Vercel environment, using in-memory database');
    return getVercelDb();
  }

  // Production environment (non-Vercel)
  if (process.env.NODE_ENV === 'production') {
    // Try build directory first (for standalone deployments)
    const buildDbPath = path.join(process.cwd(), '.next', 'data', 'statcal.db');
    if (fs.existsSync(buildDbPath)) {
      if (debug) console.log(`[DB] Using build directory database: ${buildDbPath}`);
      const db = new Database(buildDbPath, { readonly: true, fileMustExist: true });
      db.pragma('foreign_keys = ON');
      db.pragma('query_only = 1');
      return db;
    }
    
    // Try source directory (for cases where files are accessible)
    if (fs.existsSync(defaultDbPath)) {
      if (debug) console.log(`[DB] Using source directory database: ${defaultDbPath}`);
      const db = new Database(defaultDbPath, { readonly: true, fileMustExist: true });
      db.pragma('foreign_keys = ON');
      db.pragma('query_only = 1');
      return db;
    }
    
    // Fallback to in-memory database
    console.log('[DB] No database file found, using in-memory fallback');
    return getVercelDb();
  }

  if (!dbInstance) {
    const dbPath = defaultDbPath;
    if (debug) {
      console.log(`[DB] Connecting to database at: ${dbPath}`);
    }

    try {
      dbInstance = new Database(dbPath, {
        // Enable WAL mode for better concurrency
        readonly: false,
        fileMustExist: false, // Allow creation in Vercel environment
      });

      // Configure SQLite for better performance
      dbInstance.pragma('journal_mode = WAL');
      dbInstance.pragma('synchronous = NORMAL');
      dbInstance.pragma('cache_size = 1000');
      dbInstance.pragma('temp_store = memory');

      if (debug) {
        console.log('[DB] Database connected successfully');
      }

      // Cleanup on process exit
      process.on('exit', () => {
        if (dbInstance) {
          dbInstance.close();
          dbInstance = null;
        }
      });
    } catch (error) {
      console.error('[DB] Failed to connect to database:', error);
      throw error;
    }
  }
  return dbInstance;
}

export function closeDb(): void {
  if (dbInstance) {
    dbInstance.close();
    dbInstance = null;
  }
}

// Health check function
export function checkDbConnection(): boolean {
  try {
    const db = getDb();
    const result = db.prepare('SELECT 1 as test').get();
    return result !== null;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
}
