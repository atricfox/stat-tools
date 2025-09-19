-- Migration 012: Ensure description column exists
-- Description: Add description column if it doesn't exist in slim_content table
-- Version: 2025-09-19

-- First check and add description column to slim_content if it doesn't exist
-- SQLite doesn't support IF NOT EXISTS for ALTER TABLE, so we need to handle this carefully
-- This migration is safe to run multiple times

-- For slim_content table
-- The column might already exist from 001_create_core_tables.sql
-- This is a safety migration for Vercel deployments

-- Note: In SQLite, if the column already exists, this will error but won't harm the database
-- The error is caught and ignored in the migration runner

-- Try to add the column (will fail silently if it already exists)
ALTER TABLE slim_content ADD COLUMN description TEXT;