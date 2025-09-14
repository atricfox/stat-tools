/*
 * Export sqlite3 data as frontend-ready JSON (groups + lastmod)
 * Dependency: better-sqlite3 (install locally/CI: npm i -D better-sqlite3)
 * Usage: Execute with ts-node/tsx, or compile and run with node
 */

/* eslint-disable no-console */
import fs from 'node:fs';
import path from 'node:path';

// Lazy import to avoid build failure when dependency is not installed (provide friendly prompt)
let Database: any;
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  Database = require('better-sqlite3');
} catch {
  console.error('[export-calculators] better-sqlite3 not installed, please install: npm i -D better-sqlite3');
  process.exit(1);
}

const DB_FILE = process.env.DATABASE_FILE || path.resolve(process.cwd(), 'data', 'statcal.db');
const OUT_DIR = path.resolve(process.cwd(), 'data');
const OUT_FILE = path.join(OUT_DIR, 'calculators.json');

type CalcRow = {
  id: number;
  name: string;
  description: string | null;
  url: string;
  group_name: string | null;
  is_hot: number;
  is_new: number;
  sort_order: number | null;
  updated_at: string;
};

type GroupMetaRow = {
  group_name: string;
  display_name: string | null;
  sort_order: number | null;
};

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

function main() {
  const db = new Database(DB_FILE, { fileMustExist: true, readonly: true });

  const groupsMetaStmt = db.prepare<unknown, GroupMetaRow>('SELECT group_name, display_name, sort_order FROM group_meta');
  const calculatorsStmt = db.prepare<unknown, CalcRow>('SELECT * FROM calculator');

  const groupsMeta = groupsMetaStmt.all();
  const calculators = calculatorsStmt.all();

  // Validation & grouping
  const problems: string[] = [];
  const byGroup = new Map<string, { display_name?: string; sort_order?: number; items: CalcRow[] }>();
  const metaIndex = new Map(groupsMeta.map((m) => [m.group_name, m] as const));

  for (const c of calculators) {
    if (!c.name || !c.url) {
      problems.push(`ID ${c.id}: name/url cannot be empty`);
      continue;
    }
    if (!c.url.startsWith('/calculator/')) {
      problems.push(`ID ${c.id}: url must start with /calculator/, got ${c.url}`);
      continue;
    }
    const g = c.group_name || 'uncategorized';
    const meta = metaIndex.get(g);
    if (!byGroup.has(g)) {
      byGroup.set(g, { display_name: meta?.display_name ?? undefined, sort_order: meta?.sort_order ?? undefined, items: [] });
    }
    byGroup.get(g)!.items.push(c);
  }

  if (problems.length) {
    console.error('[export-calculators] Data validation failed:\n' + problems.join('\n'));
    process.exit(2);
  }

  // Sorting: groups & items within groups
  const groups = Array.from(byGroup.entries())
    .map(([group_name, data]) => {
      const items = data.items
        .sort((a, b) => {
          const soA = a.sort_order ?? 9999;
          const soB = b.sort_order ?? 9999;
          if (soA !== soB) return soA - soB;
          return a.name.localeCompare(b.name);
        })
        .map((r, idx) => ({
          name: r.name,
          url: r.url,
          description: r.description ?? '',
          is_hot: !!r.is_hot,
          is_new: !!r.is_new,
          sort_order: r.sort_order ?? idx + 1,
        }));
      return {
        group_name,
        display_name: data.display_name ?? group_name,
        sort_order: data.sort_order ?? 9999,
        items,
      };
    })
    .sort((a, b) => {
      if (a.sort_order !== b.sort_order) return (a.sort_order ?? 9999) - (b.sort_order ?? 9999);
      return a.display_name.localeCompare(b.display_name);
    });

  const lastmod = calculators.reduce<string>((acc, cur) => (acc > cur.updated_at ? acc : cur.updated_at), '1970-01-01T00:00:00Z');

  const payload = { groups, lastmod };

  ensureDir(OUT_DIR);
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  console.log(`[export-calculators] Export successful -> ${OUT_FILE}`);
}

try {
  main();
} catch (err: any) {
  console.error('[export-calculators] Failed:', err?.message || err);
  process.exit(1);
}

