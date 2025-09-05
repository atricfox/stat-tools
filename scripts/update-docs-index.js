#!/usr/bin/env node
/**
 * 文档索引自动更新脚本
 * 扫描 docs/ 目录并生成文件索引
 */

const fs = require('fs');
const path = require('path');

const DOCS_DIR = path.join(__dirname, '..', 'docs');
const INDEX_FILE = path.join(DOCS_DIR, 'file-index.md');

/**
 * 递归扫描目录获取文件列表
 */
function scanDirectory(dir, basePath = '') {
  const items = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  entries.forEach(entry => {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.join(basePath, entry.name);
    
    if (entry.isDirectory()) {
      // 跳过一些目录
      if (['node_modules', '.git', 'coverage'].includes(entry.name)) {
        return;
      }
      
      items.push({
        type: 'directory',
        name: entry.name,
        path: relativePath,
        children: scanDirectory(fullPath, relativePath)
      });
    } else if (entry.isFile() && isDocumentFile(entry.name)) {
      items.push({
        type: 'file',
        name: entry.name,
        path: relativePath,
        ext: path.extname(entry.name),
        size: fs.statSync(fullPath).size
      });
    }
  });
  
  return items.sort((a, b) => {
    // 目录优先，然后按名称排序
    if (a.type !== b.type) {
      return a.type === 'directory' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
}

/**
 * 判断是否为文档文件
 */
function isDocumentFile(filename) {
  const docExtensions = ['.md', '.feature', '.json', '.txt'];
  return docExtensions.some(ext => filename.endsWith(ext));
}

/**
 * 生成 Markdown 格式的文件树
 */
function generateFileTree(items, indent = 0) {
  let output = '';
  const prefix = '  '.repeat(indent);
  
  items.forEach(item => {
    if (item.type === 'directory') {
      output += `${prefix}📁 **${item.name}/**\n`;
      if (item.children.length > 0) {
        output += generateFileTree(item.children, indent + 1);
      }
      output += '\n';
    } else {
      const icon = getFileIcon(item.ext);
      const size = formatFileSize(item.size);
      output += `${prefix}${icon} [${item.name}](${item.path}) _(${size})_\n`;
    }
  });
  
  return output;
}

/**
 * 根据文件扩展名返回图标
 */
function getFileIcon(ext) {
  const icons = {
    '.md': '📄',
    '.feature': '🧪', 
    '.json': '⚙️',
    '.txt': '📝'
  };
  return icons[ext] || '📄';
}

/**
 * 格式化文件大小
 */
function formatFileSize(bytes) {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

/**
 * 统计文档信息
 */
function generateStats(items) {
  const stats = {
    totalFiles: 0,
    totalDirectories: 0,
    filesByType: {},
    totalSize: 0
  };
  
  function countItems(items) {
    items.forEach(item => {
      if (item.type === 'directory') {
        stats.totalDirectories++;
        countItems(item.children);
      } else {
        stats.totalFiles++;
        stats.totalSize += item.size;
        stats.filesByType[item.ext] = (stats.filesByType[item.ext] || 0) + 1;
      }
    });
  }
  
  countItems(items);
  return stats;
}

/**
 * 生成索引文件内容
 */
function generateIndexContent(items, stats) {
  const currentDate = new Date().toISOString().split('T')[0];
  
  return `# 📇 文档文件索引 (自动生成)

> **最后更新**: ${currentDate}  
> **生成方式**: 自动扫描文档目录

## 📊 文档统计

- **文档文件**: ${stats.totalFiles} 个
- **目录数量**: ${stats.totalDirectories} 个  
- **总大小**: ${formatFileSize(stats.totalSize)}

### 按文件类型分布

${Object.entries(stats.filesByType)
  .map(([ext, count]) => `- **${ext}**: ${count} 个文件`)
  .join('\n')}

## 🗂️ 文档结构

${generateFileTree(items)}

## 🔍 文档导航

### 快速访问
- [📚 文档总览](./00-README.md)
- [🚀 快速开始](./01-getting-started/00-README.md)
- [📋 需求规范](./02-requirements/00-README.md)
- [✅ 验收测试](./03-acceptance/00-README.md)
- [📊 审计报告](./07-audit/)

### 开发相关
- [🔧 开发文档](./05-development/) _(待创建)_
- [🏗️ 架构设计](./04-architecture/) _(待创建)_
- [⚙️ 运维文档](./06-operations/) _(待创建)_

### 资源文件
- [🎨 资源文件](./assets/)
- [📝 文档模板](./08-templates/)
- [📦 归档文档](./09-archive/)

---

**注意**: 此文件由脚本自动生成，请勿手动编辑。如需更新，请运行:
\`\`\`bash
npm run update-docs-index
\`\`\``;
}

/**
 * 主函数
 */
function main() {
  try {
    console.log('🔍 扫描文档目录...');
    const items = scanDirectory(DOCS_DIR);
    
    console.log('📊 生成统计信息...');
    const stats = generateStats(items);
    
    console.log('📝 生成索引内容...');
    const content = generateIndexContent(items, stats);
    
    console.log('💾 保存索引文件...');
    fs.writeFileSync(INDEX_FILE, content, 'utf8');
    
    console.log('✅ 文档索引更新完成!');
    console.log(`   - 文档文件: ${stats.totalFiles} 个`);
    console.log(`   - 目录: ${stats.totalDirectories} 个`);
    console.log(`   - 索引文件: ${INDEX_FILE}`);
    
  } catch (error) {
    console.error('❌ 索引生成失败:', error.message);
    process.exit(1);
  }
}

// 运行脚本
if (require.main === module) {
  main();
}

module.exports = { scanDirectory, generateFileTree, generateStats };