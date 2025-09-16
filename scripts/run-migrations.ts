import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

function log(msg: string) {
  console.log(`[migrate] ${msg}`);
}

function getDbPath(): string {
  const isBuildEnv = process.env.NEXT_PHASE === 'phase-production-build' ||
    (process.argv || []).some(arg => arg.includes('next build'));

  if (process.env.NODE_ENV === 'production' && !isBuildEnv) {
    return process.env.DATABASE_PATH || '/app/data/statcal.db';
  }
  return path.join(process.cwd(), 'data', 'statcal.db');
}

function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

function tableExists(db: Database.Database, name: string): boolean {
  const row = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name=?").get(name);
  return !!row;
}

function execSQL(db: Database.Database, sql: string, label: string) {
  try {
    db.exec(sql);
    log(`OK: ${label}`);
  } catch (err: any) {
    throw new Error(`Failed executing ${label}: ${err.message}`);
  }
}

function readFileSafe(file: string): string {
  if (!fs.existsSync(file)) throw new Error(`SQL file not found: ${file}`);
  return fs.readFileSync(file, 'utf8');
}

function run002(db: Database.Database) {
  const file = path.join(process.cwd(), 'migrations', '002_slim_schema.sql');
  const sql = readFileSafe(file);
  execSQL(db, sql, '002_slim_schema.sql');
}

function run003(db: Database.Database) {
  const file = path.join(process.cwd(), 'migrations', '003_migrate_content_data.sql');
  const full = readFileSafe(file);

  const segments = full.split(/-- \[SEGMENT\] /g).map(s => s.trim());
  // segments[0] may contain header comments; skip if it doesn't start with MIGRATE_
  const parts = segments.filter(s => s.startsWith('MIGRATE_'));

  const hasContentItems = tableExists(db, 'content_items') && tableExists(db, 'content_types');
  const hasMetadata = tableExists(db, 'content_metadata'); // optional
  const hasSteps = tableExists(db, 'howto_steps');
  const hasCase = tableExists(db, 'case_details');

  for (const part of parts) {
    const [nameLine, ...rest] = part.split('\n');
    const name = nameLine.trim();
    const sql = rest.join('\n');

    if (name === 'MIGRATE_CONTENT_MAIN') {
      if (hasContentItems) {
        execSQL(db, sql, '003 MIGRATE_CONTENT_MAIN');
      } else {
        log('Skip MIGRATE_CONTENT_MAIN (no legacy content tables)');
      }
    } else if (name === 'MIGRATE_STEPS') {
      if (hasContentItems && hasSteps) {
        execSQL(db, sql, '003 MIGRATE_STEPS');
      } else {
        log('Skip MIGRATE_STEPS (no howto_steps or content tables)');
      }
    } else if (name === 'MIGRATE_CASE') {
      if (hasContentItems && hasCase) {
        execSQL(db, sql, '003 MIGRATE_CASE');
      } else {
        log('Skip MIGRATE_CASE (no case_details or content tables)');
      }
    }
  }
}

function run004(db: Database.Database) {
  const file = path.join(process.cwd(), 'migrations', '004_compat_views.sql');
  const sql = readFileSafe(file);
  // Execute statement by statement to locate faults
  const statements = sql
    .split(/;\s*\n/) // split on ; end-of-line
    .map(s => s.trim())
    .filter(s => s.length > 0);

  // open a transaction boundary tracking; but statements include BEGIN/COMMIT
  let idx = 0;
  let canUseContentSearch = true; // assume ok until proven otherwise
  for (const stmt of statements) {
    const labeled = stmt.length > 80 ? stmt.slice(0, 80) + '...' : stmt;
    const touchesContentSearch = /content_search/i.test(stmt);
    if (touchesContentSearch && !canUseContentSearch) {
      log(`Skip: 004 part ${idx + 1} (content_search disabled) ${labeled}`);
      idx++;
      continue;
    }
    try {
      db.exec(stmt + ';');
      idx++;
      log(`OK: 004 part ${idx}: ${labeled}`);
      if (/CREATE\s+VIRTUAL\s+TABLE[^]*content_search[^]*fts5/i.test(stmt)) {
        canUseContentSearch = true;
      }
    } catch (err: any) {
      // If content_search causes issues (e.g., FTS5/DB anomalies), disable it and continue
      if (touchesContentSearch) {
        canUseContentSearch = false;
        log(`Warn: disable content_search due to error: ${err.message}`);
        idx++;
        continue;
      }
      throw new Error(`Failed executing 004 part ${idx + 1}: ${labeled} => ${err.message}`);
    }
  }
}

function main() {
  const dbPath = getDbPath();
  ensureDir(dbPath);
  log(`Using database at: ${dbPath}`);
  const db = new Database(dbPath);

  // PRAGMA tuning
  db.pragma('foreign_keys = ON');
  db.pragma('journal_mode = WAL');
  db.pragma('synchronous = NORMAL');
  db.pragma('cache_size = 1000');
  db.pragma('temp_store = MEMORY');
  db.pragma('mmap_size = 268435456');

  try {
    run002(db);
    run003(db);
    run004(db);
    log('All migrations completed successfully.');
  } catch (err: any) {
    console.error('[migrate] ERROR:', err.message);
    process.exitCode = 1;
  } finally {
    db.close();
  }
}

main();
