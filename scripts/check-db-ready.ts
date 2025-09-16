#!/usr/bin/env tsx

/**
 * 检查数据库是否就绪，只在必要时运行迁移
 * 比盲目运行迁移更高效
 */

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

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
  try {
    const row = db.prepare("SELECT name FROM sqlite_master WHERE type IN ('table','view') AND name=?").get(name);
    return !!row;
  } catch {
    return false;
  }
}

function checkDatabaseReady(): boolean {
  const dbPath = getDbPath();
  
  // 如果数据库文件不存在，需要迁移
  if (!fs.existsSync(dbPath)) {
    console.log('[db-check] Database file not found, migration needed');
    return false;
  }

  try {
    const db = new Database(dbPath);
    
    // 检查关键表是否存在
    const requiredTables = [
      'slim_content',
      'slim_content_details', 
      'glossary_terms',
      'calculators'
    ];
    
    for (const table of requiredTables) {
      if (!tableExists(db, table)) {
        console.log(`[db-check] Missing table: ${table}, migration needed`);
        db.close();
        return false;
      }
    }
    
    // 检查是否有基本数据
    const contentCount = db.prepare('SELECT COUNT(*) as count FROM slim_content').get() as { count: number };
    const glossaryCount = db.prepare('SELECT COUNT(*) as count FROM glossary_terms').get() as { count: number };
    
    db.close();
    
    if (contentCount.count === 0 && glossaryCount.count === 0) {
      console.log('[db-check] Database is empty, seeding may be needed');
      // 但这不需要迁移，只是提醒
    }
    
    console.log(`[db-check] Database ready: ${contentCount.count} content items, ${glossaryCount.count} glossary terms`);
    return true;
    
  } catch (error) {
    console.log(`[db-check] Database check failed: ${error}, migration needed`);
    return false;
  }
}

async function runMigrationIfNeeded(): Promise<void> {
  if (checkDatabaseReady()) {
    console.log('[db-check] Database is ready, skipping migration');
    return;
  }
  
  console.log('[db-check] Running database migration...');
  
  // 动态导入并运行迁移脚本
  try {
    const { execSync } = await import('child_process');
    execSync('tsx scripts/run-migrations.ts', { 
      stdio: 'inherit',
      cwd: process.cwd()
    });
    console.log('[db-check] Migration completed');
  } catch (error) {
    console.error('[db-check] Migration failed:', error);
    process.exit(1);
  }
}

// 主函数
async function main() {
  const dbPath = getDbPath();
  ensureDir(dbPath);
  
  await runMigrationIfNeeded();
}

// 只在直接运行时执行
if (require.main === module) {
  main().catch(error => {
    console.error('[db-check] Error:', error);
    process.exit(1);
  });
}