#!/usr/bin/env tsx

import Database from 'better-sqlite3';
import fs from 'node:fs';
import path from 'node:path';

interface ContentUpdate {
  slug: string;
  contentFile: string;
}

function updateRemainingContent() {
  const dbPath = path.join(process.cwd(), 'data', 'statcal.db');
  
  const updates: ContentUpdate[] = [
    {
      slug: 'how-to-calculate-range',
      contentFile: 'enhanced-range-content.md'
    },
    {
      slug: 'how-to-calculate-percent-error',
      contentFile: 'enhanced-percent-error-content.md'
    }
  ];
  
  // Connect to database
  const db = new Database(dbPath);
  
  try {
    for (const update of updates) {
      const contentPath = path.join(process.cwd(), update.contentFile);
      
      if (!fs.existsSync(contentPath)) {
        console.log(`❌ Content file not found: ${update.contentFile}`);
        continue;
      }
      
      // Read the enhanced content
      const newContent = fs.readFileSync(contentPath, 'utf8');
      
      // Update the content
      const updateStmt = db.prepare(`
        UPDATE slim_content 
        SET content = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE slug = ?
      `);
      
      const result = updateStmt.run(newContent, update.slug);
      
      if (result.changes > 0) {
        console.log(`✅ Successfully updated: ${update.slug}`);
        console.log(`📊 Content length: ${newContent.length} characters`);
        
        // Clear existing steps and migration logs for re-migration
        db.prepare('DELETE FROM howto_steps WHERE howto_slug = ?').run(update.slug);
        db.prepare('DELETE FROM migration_log WHERE howto_slug = ?').run(update.slug);
        console.log(`🗑️  Cleared old steps for: ${update.slug}`);
        
      } else {
        console.log(`❌ No rows updated for: ${update.slug} - check if slug exists`);
      }
    }
    
    console.log('\n🎉 Remaining content updates completed!');
    
  } catch (error) {
    console.error('❌ Error updating content:', error);
  } finally {
    db.close();
  }
}

// Execute if run directly
if (require.main === module) {
  updateRemainingContent();
}