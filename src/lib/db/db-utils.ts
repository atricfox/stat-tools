import Database from 'better-sqlite3';
import path from 'path';
import { getVercelDb } from './vercel-db';

// Add debug logging
const debug = process.env.NODE_ENV === 'development';

// Global database connection
let dbInstance: Database.Database | null = null;

export function getDb(): Database.Database {
  // Use Vercel-optimized database in Vercel environment
  if (process.env.VERCEL === '1') {
    return getVercelDb();
  }

  if (!dbInstance) {
    const dbPath = process.env.DATABASE_URL?.replace('file:', '') || 
                  path.join(process.cwd(), 'data', 'statcal.db');
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