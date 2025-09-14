#!/usr/bin/env node

/**
 * 构建内容索引脚本
 * 用法: npm run build:content-index
 */

import { buildContentIndex, saveContentIndex } from '../src/lib/content/contentIndexer';

async function main() {
  console.log('🔨 Building content index...');
  
  try {
    // 构建索引
    const index = await buildContentIndex();
    console.log(`✅ Found ${index.length} content items`);
    
    // 按类型统计
    const typeCount: Record<string, number> = {};
    for (const item of index) {
      typeCount[item.type] = (typeCount[item.type] || 0) + 1;
    }
    
    console.log('📊 Content breakdown:');
    for (const [type, count] of Object.entries(typeCount)) {
      console.log(`   - ${type}: ${count} items`);
    }
    
    // 保存索引
    await saveContentIndex(index);
    console.log('💾 Content index saved to data/content-index.json');
    
  } catch (error) {
    console.error('❌ Error building content index:', error);
    process.exit(1);
  }
}

// 执行脚本
main();