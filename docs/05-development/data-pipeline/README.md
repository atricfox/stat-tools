# Data Pipeline (sqlite3 → calculators.json) Usage Guide

For: Statistics Calculator "Total Hub (Aggregated Navigation Page)" data source, using sqlite3 to maintain tool list, exported via build script to `data/calculators.json`, rendered by `/statistics-calculators/` page with SSR/SSG.

## Directory Structure
- `migrations/001_init.sql`: Table creation script (`calculator`, `group_meta`)
- `seeds/seed-calculators.sql`: Sample seed data
- `scripts/export-calculators.ts`: Export script (read sqlite → write `data/calculators.json`)
- `data/statcal.db`: sqlite database file (generated after migration)
- `data/calculators.json`: Export result (the only data source for pages)

## Dependencies & Environment
- Node.js 18+
- `sqlite3` command line (available locally or in CI)
- Optional (for export): `tsx` and `better-sqlite3`
  - Install: `npm i -D tsx better-sqlite3`

Available environment variables:
- `DATABASE_FILE` (default `./data/statcal.db`)

## Common Commands (configured in package.json)
- Initialize database and create tables:
  - `npm run db:migrate`
- Import sample seed data:
  - `npm run db:seed`
- Export calculators.json:
  - `npm run export:calculators`
- Auto-export before build (failure won't block build):
  - `npm run build` (triggers `prebuild` hook internally)

After successful export, generates: `data/calculators.json`, which `/statistics-calculators/` page will use for server-side rendering.

## Data Specification (Summary)
- URL must start with `/calculator/`; groups aggregated by `group_name`, display name from `group_meta.display_name`
- Sorting: group `sort_order` → item `sort_order` → name alphabetically
- `lastmod` is the maximum `calculator.updated_at`, used for sitemap/regeneration strategy

## CI Example (GitHub Actions snippet)
```yaml
name: Export Calculators JSON
on:
  push:
    paths:
      - 'migrations/**'
      - 'seeds/**'
      - 'scripts/export-calculators.ts'
      - 'package.json'
jobs:
  export:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - name: Install system sqlite3
        run: sudo apt-get update && sudo apt-get install -y sqlite3
      - name: Install deps
        run: npm ci
      - name: Migrate & Seed
        run: |
          npm run db:migrate
          npm run db:seed
      - name: Export JSON
        run: npm run export:calculators
      - name: Upload artifact
        uses: actions/upload-artifact@v4
        with:
          name: calculators-json
          path: data/calculators.json
```

> Note: If `tsx` and `better-sqlite3` are not installed in the project, `export:calculators` will fail. Please install these dependencies in the environment where export is needed (local or CI).

## Troubleshooting
- Error "url must start with /calculator/": Fix the `url` field in the corresponding database record
- Export script prompts missing dependencies: Run `npm i -D tsx better-sqlite3`
- `/statistics-calculators/` page blank or shows only fallback list: Check if `data/calculators.json` exists and is valid JSON

