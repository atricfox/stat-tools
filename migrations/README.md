# Database Migrations

This directory contains SQLite database migration files for the Stat Tools application.

## Migration Files Overview

### 001_create_core_tables.sql
- **Purpose**: Initialize core database schema
- **Tables**: calculator_groups, calculators, slim_content, slim_content_details, content_types_static, glossary_terms, howto_steps, howto_metadata, migration_log
- **Indexes**: Performance optimization indexes for all tables
- **Features**: Foreign key constraints, check constraints, default values

### 002_create_views.sql  
- **Purpose**: Create legacy compatibility views
- **Views**: v_content_items_legacy, v_howto_steps_from_details, v_case_details_from_details
- **Benefits**: Backward compatibility with existing code, enriched data access

### 003_seed_calculator_data.sql
- **Purpose**: Insert initial calculator configurations
- **Data**: 4 calculator groups, 13 individual calculators
- **Features**: Hot/new flags, sort ordering, URL routing

### 004_seed_glossary_terms.sql
- **Purpose**: Statistical terms and definitions
- **Data**: 20 core statistical terms with examples
- **Categories**: Central tendency, variability, distributions, hypothesis testing

### 005_create_fts_search.sql
- **Purpose**: Full-text search capabilities
- **Features**: FTS5 virtual table, automatic sync triggers
- **Benefits**: Fast content search across titles, content, summaries

### 006_seed_faq_content.sql
- **Purpose**: Frequently asked questions content
- **Data**: 5 comprehensive FAQ entries
- **Topics**: Mean vs median, when to use each, standard deviation, sampling

### 007_seed_howto_content.sql
- **Purpose**: Step-by-step tutorial content
- **Data**: 5 detailed how-to guides with steps
- **Features**: Structured steps, examples, metadata, prerequisites

### 008_seed_case_studies.sql
- **Purpose**: Real-world application examples
- **Data**: 5 comprehensive case studies
- **Industries**: Education, technology, manufacturing, laboratory science

## Migration Execution Order

Migrations must be executed in numerical order:
1. Core tables and structure
2. Views and compatibility layers  
3. Reference data (calculators, glossary)
4. Search functionality
5. Content (FAQs, tutorials, case studies)

## Database Schema Summary

### Core Tables
- **calculator_groups**: Calculator categorization
- **calculators**: Individual calculator configurations
- **slim_content**: Main content management table
- **slim_content_details**: JSON storage for complex data
- **glossary_terms**: Statistical definitions and examples

### Extended Features
- **howto_steps**: Detailed tutorial steps
- **howto_metadata**: Tutorial metadata and prerequisites
- **content_search**: FTS5 virtual table for search
- **migration_log**: Change tracking and audit trail

### Views
- **v_content_items_legacy**: Backward compatibility
- **v_howto_steps_from_details**: Enriched tutorial data
- **v_case_details_from_details**: Case study integration

## Key Features

### Performance Optimizations
- Strategic indexes on frequently queried columns
- FTS5 for fast full-text search
- Optimized join paths through views

### Data Integrity
- Foreign key constraints with appropriate cascade rules
- Check constraints for data validation
- Unique constraints on critical fields

### Flexibility
- JSON storage for complex, varying data structures
- Extensible content type system
- Modular migration approach

### Search Capabilities
- Full-text search across all content
- Tag-based filtering
- Category and difficulty-based queries

## Content Statistics

| Content Type | Count | Description |
|--------------|-------|-------------|
| Calculator Groups | 4 | Organized categories |
| Calculators | 13 | Individual tools |
| Glossary Terms | 20 | Statistical definitions |
| FAQ Entries | 5 | Common questions |
| How-To Guides | 5 | Step-by-step tutorials |
| Case Studies | 5 | Real-world examples |

## Version History

- **v2025-09-19**: Complete rebuild from existing database analysis
- **Features**: Modern schema design, performance optimization, comprehensive content
- **Compatibility**: Maintains compatibility with existing application code through views

## Usage Notes

### For Development
- Run migrations in order using database management tools
- Verify foreign key constraints are enabled: `PRAGMA foreign_keys = ON;`
- Use FTS5 search for content queries when possible

### For Production
- Backup existing database before running migrations
- Test migrations in staging environment first
- Monitor performance after schema changes

### Content Management
- Use slim_content table for main content
- Store complex data structures in slim_content_details as JSON
- Leverage views for backward compatibility during transitions

## Maintenance

### Regular Tasks
- Update FTS index when content changes (automated via triggers)
- Monitor query performance and adjust indexes as needed
- Archive old migration logs periodically

### Content Updates
- Follow established patterns for new content types
- Maintain referential integrity when adding related data
- Use migration_log table to track content changes