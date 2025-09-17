# Database Migrations

This directory contains database migration files for the Statistical Tools application.

## Migration Files

### Schema Migrations
1. **001_init_schema.sql** - Creates all core tables and indexes
2. **002_create_views.sql** - Creates database views for backward compatibility and complex queries

### Data Migrations  
3. **003_seed_core_data.sql** - Inserts core system data (calculator groups, calculators, content types)
4. **004_seed_content_data.sql** - Populates content library (FAQs, How-tos, Case Studies)
5. **005_seed_content_details.sql** - Inserts structured JSON data for complex content
6. **006_seed_glossary_terms.sql** - Populates glossary with statistical definitions

## Running Migrations

To initialize a fresh database, run migrations in order:

```bash
# Run each migration file against your SQLite database
sqlite3 your_database.db < migrations/001_init_schema.sql
sqlite3 your_database.db < migrations/002_create_views.sql
sqlite3 your_database.db < migrations/003_seed_core_data.sql
sqlite3 your_database.db < migrations/004_seed_content_data.sql
sqlite3 your_database.db < migrations/005_seed_content_details.sql  
sqlite3 your_database.db < migrations/006_seed_glossary_terms.sql
```

## Database Schema Overview

### Core Tables
- **calculator_groups**: Categories for organizing calculators
- **calculators**: Individual calculator definitions
- **slim_content**: FAQ, how-to, and case study content
- **slim_content_details**: JSON structured data for complex content
- **glossary_terms**: Statistical definitions and explanations
- **content_types_static**: Content type lookup table

### Views
- **v_content_items_legacy**: Backward compatibility for old content structure
- **v_howto_steps_from_details**: Extracts step-by-step instructions from JSON
- **v_case_details_from_details**: Extracts case study details from JSON

### Search
- **content_search**: Full-text search virtual table (FTS5)

## Backup Information

Previous migration files have been backed up to `migrations-backup/` directory.

## Notes

- Migration files are generated from current production database (2025-09-17)
- Content includes 34 articles and 20 glossary terms
- Schema supports both simple and complex content structures
- Full-text search is available on all content