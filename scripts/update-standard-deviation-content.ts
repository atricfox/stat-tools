#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

function updateStandardDeviationContent() {
  const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
  const contentPath = path.join(process.cwd(), 'enhanced-standard-deviation-content.md');
  
  // Read the enhanced content
  const newContent = fs.readFileSync(contentPath, 'utf8');
  
  // Connect to database
  const db = new Database(dbPath);
  
  try {
    // Update the content
    const updateStmt = db.prepare(`
      UPDATE slim_content 
      SET content = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE slug = 'how-to-calculate-standard-deviation'
    `);
    
    const result = updateStmt.run(newContent);
    
    if (result.changes > 0) {
      console.log('✅ Successfully updated standard deviation content');
      console.log(`📊 Content length: ${newContent.length} characters`);
    } else {
      console.log('❌ No rows updated - check if slug exists');
    }
    
    // Verify the update
    const checkStmt = db.prepare(`
      SELECT LENGTH(content) as content_length, updated_at 
      FROM slim_content 
      WHERE slug = 'how-to-calculate-standard-deviation'
    `);
    
    const verification = checkStmt.get();
    console.log(`🔍 Verification: Content length now ${verification.content_length} characters`);
    console.log(`📅 Updated at: ${verification.updated_at}`);
    
  } catch (error) {
    console.error('❌ Error updating content:', error);
  } finally {
    db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  updateStandardDeviationContent();
}