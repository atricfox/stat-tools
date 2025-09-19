/**
 * Vercel-optimized database utilities
 *
 * 简化版：Vercel 环境现在使用预构建的数据库快照
 * 不再需要运行时初始化
 */

import Database from 'better-sqlite3';
import { getDb } from './db-utils';

export function getVercelDb(): Database.Database {
  // 直接使用统一的 getDb() 函数
  // 它会自动处理 Vercel 环境的数据库加载
  return getDb();
}

// 保留这个函数用于兼容性
export function closeVercelDb(): void {
  // 由 db-utils.ts 中的 closeDb() 统一处理
}