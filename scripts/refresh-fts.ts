import Database from 'better-sqlite3';
import path from 'node:path';
import fs from 'node:fs';

function getDbPath(): string {
  const isBuild = process.env.NEXT_PHASE === 'phase-production-build' || (process.argv || []).some(a => a.includes('next build'));
  if (process.env.NODE_ENV === 'production' && !isBuild) {
    return process.env.DATABASE_PATH || '/app/data/statcal.db';
  }
  return path.join(process.cwd(), 'data', 'statcal.db');
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function main() {
  const dbPath = getDbPath();
  ensureDir(dbPath);
  const db = new Database(dbPath);
  db.pragma('foreign_keys = ON');
  try {
    // Drop and recreate FTS table safely
    db.exec(`
      DROP TABLE IF EXISTS content_search;
      CREATE VIRTUAL TABLE IF NOT EXISTS content_search USING fts5(
        title, summary, content, tokenize='porter unicode61'
      );
      DELETE FROM content_search;
      INSERT INTO content_search(rowid, title, summary, content)
      SELECT id, title, summary, content FROM slim_content;
    `);
    console.log('[fts] Rebuilt content_search from slim_content.');
  } catch (err: any) {
    console.error('[fts] Failed to rebuild index:', err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();

