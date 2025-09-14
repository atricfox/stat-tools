/**
 * 内容索引器和搜索
 * Sprint 13 - T006: 内容索引生成和轻量级搜索实现
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import type { 
  THowToFrontmatter, 
  TFAQFrontmatter, 
  TCaseFrontmatter,
  TContentIndex 
} from '@/lib/content/contentSchema';
import { 
  HowToFrontmatterSchema, 
  FAQFrontmatterSchema, 
  CaseFrontmatterSchema 
} from '@/lib/content/contentSchema';

// 搜索选项接口
export interface SearchOptions {
  query: string;
  types?: string[];
  tags?: string[];
  limit?: number;
  fuzzy?: boolean;
}

// 搜索结果接口
export interface SearchResult extends TContentIndex {
  relevanceScore: number;
  matchedFields: string[];
  highlights?: {
    title?: string;
    summary?: string;
  };
}

/**
 * 从文件系统构建内容索引
 */
export async function buildContentIndex(): Promise<TContentIndex[]> {
  const index: TContentIndex[] = [];
  const contentDir = path.resolve(process.cwd(), 'content');
  
  // 索引 HowTo 内容
  const howtoDir = path.join(contentDir, 'howto');
  try {
    const howtoFiles = await fs.readdir(howtoDir);
    for (const file of howtoFiles) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const content = await fs.readFile(path.join(howtoDir, file), 'utf-8');
        const json = JSON.parse(content);
        const parsed = HowToFrontmatterSchema.safeParse(json.frontmatter);
        
        if (parsed.success) {
          index.push({
            type: 'howto',
            slug: parsed.data.slug,
            title: parsed.data.title,
            summary: parsed.data.summary,
            tags: parsed.data.tags,
            updated: parsed.data.updated,
            url: `/how-to/${parsed.data.slug}`
          });
        }
      } catch (error) {
        console.error(`Error indexing HowTo file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading HowTo directory:', error);
  }
  
  // 索引 FAQ 内容
  const faqFile = path.join(contentDir, 'faq', 'statistics-faq.json');
  try {
    const content = await fs.readFile(faqFile, 'utf-8');
    const json = JSON.parse(content);
    
    for (const item of json.items) {
      const parsed = FAQFrontmatterSchema.safeParse(item.frontmatter);
      if (parsed.success) {
        index.push({
          type: 'faq',
          slug: parsed.data.slug,
          title: parsed.data.title,
          summary: parsed.data.summary,
          tags: parsed.data.tags,
          updated: parsed.data.updated,
          url: `/faq#${parsed.data.slug}`
        });
      }
    }
  } catch (error) {
    console.error('Error indexing FAQ content:', error);
  }
  
  // 索引 Case 内容
  const casesDir = path.join(contentDir, 'cases');
  try {
    const caseFiles = await fs.readdir(casesDir);
    for (const file of caseFiles) {
      if (!file.endsWith('.json')) continue;
      
      try {
        const content = await fs.readFile(path.join(casesDir, file), 'utf-8');
        const json = JSON.parse(content);
        const parsed = CaseFrontmatterSchema.safeParse(json.frontmatter);
        
        if (parsed.success) {
          index.push({
            type: 'case',
            slug: parsed.data.slug,
            title: parsed.data.title,
            summary: parsed.data.summary,
            tags: parsed.data.tags,
            updated: parsed.data.updated,
            url: `/cases/${parsed.data.slug}`
          });
        }
      } catch (error) {
        console.error(`Error indexing Case file ${file}:`, error);
      }
    }
  } catch (error) {
    console.error('Error reading Cases directory:', error);
  }
  
  // 按更新时间排序
  index.sort((a, b) => 
    new Date(b.updated).getTime() - new Date(a.updated).getTime()
  );
  
  return index;
}

/**
 * 保存索引到JSON文件
 */
export async function saveContentIndex(index: TContentIndex[]): Promise<void> {
  const indexPath = path.resolve(process.cwd(), 'data', 'content-index.json');
  await fs.writeFile(indexPath, JSON.stringify(index, null, 2), 'utf-8');
  console.log(`Content index saved: ${index.length} items`);
}

/**
 * 加载预构建的索引
 */
export async function loadContentIndex(): Promise<TContentIndex[]> {
  try {
    const indexPath = path.resolve(process.cwd(), 'data', 'content-index.json');
    const content = await fs.readFile(indexPath, 'utf-8');
    return JSON.parse(content);
  } catch (error) {
    console.error('Error loading content index:', error);
    // 如果加载失败，尝试重新构建
    return await buildContentIndex();
  }
}

/**
 * 搜索内容
 */
export function searchContent(
  index: TContentIndex[],
  options: SearchOptions
): SearchResult[] {
  const {
    query,
    types = [],
    tags = [],
    limit = 20,
    fuzzy = true
  } = options;

  // 预处理查询
  const normalizedQuery = query.toLowerCase().trim();

  // 如果查询为空但有类型或标签过滤，返回所有匹配的项
  if (!normalizedQuery && (types.length > 0 || tags.length > 0)) {
    const results: SearchResult[] = [];

    for (const item of index) {
      // 类型过滤
      if (types.length > 0 && !types.includes(item.type)) continue;

      // 标签过滤
      if (tags.length > 0 && !tags.some(tag => item.tags.includes(tag))) continue;

      results.push({
        ...item,
        relevanceScore: 1,
        matchedFields: ['filter']
      });
    }

    return results.slice(0, limit);
  }

  // 如果查询为空且无过滤，返回空
  if (!normalizedQuery) return [];
  
  const queryWords = normalizedQuery.split(/\s+/);
  const results: SearchResult[] = [];
  
  for (const item of index) {
    // 类型过滤
    if (types.length > 0 && !types.includes(item.type)) continue;
    
    // 标签过滤
    if (tags.length > 0 && !tags.some(tag => item.tags.includes(tag))) continue;
    
    // 计算相关性分数
    let score = 0;
    const matchedFields: string[] = [];
    const highlights: SearchResult['highlights'] = {};
    
    // 标题匹配（权重最高）
    const titleLower = item.title.toLowerCase();
    if (titleLower === normalizedQuery) {
      score += 100; // 精确匹配
      matchedFields.push('title-exact');
    } else if (titleLower.includes(normalizedQuery)) {
      score += 50; // 包含完整查询
      matchedFields.push('title-contains');
      highlights.title = highlightText(item.title, normalizedQuery);
    } else if (fuzzy && queryWords.every(word => titleLower.includes(word))) {
      score += 30; // 包含所有查询词
      matchedFields.push('title-words');
      highlights.title = highlightText(item.title, queryWords);
    }
    
    // 摘要匹配
    const summaryLower = item.summary.toLowerCase();
    if (summaryLower.includes(normalizedQuery)) {
      score += 20;
      matchedFields.push('summary-contains');
      highlights.summary = highlightText(item.summary, normalizedQuery);
    } else if (fuzzy && queryWords.some(word => summaryLower.includes(word))) {
      score += 10 * queryWords.filter(word => summaryLower.includes(word)).length;
      matchedFields.push('summary-words');
      highlights.summary = highlightText(item.summary, queryWords);
    }
    
    // 标签匹配
    const matchingTags = item.tags.filter(tag => 
      tag.toLowerCase().includes(normalizedQuery) ||
      (fuzzy && queryWords.some(word => tag.toLowerCase().includes(word)))
    );
    if (matchingTags.length > 0) {
      score += 15 * matchingTags.length;
      matchedFields.push('tags');
    }
    
    // URL/slug 匹配
    if (item.slug.toLowerCase().includes(normalizedQuery)) {
      score += 10;
      matchedFields.push('slug');
    }
    
    // 如果有匹配，添加到结果
    if (score > 0) {
      results.push({
        ...item,
        relevanceScore: score,
        matchedFields,
        highlights: Object.keys(highlights).length > 0 ? highlights : undefined
      });
    }
  }
  
  // 按相关性排序
  results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  
  // 限制结果数量
  return results.slice(0, limit);
}

/**
 * 高亮匹配文本
 */
function highlightText(text: string, query: string | string[]): string {
  const queries = Array.isArray(query) ? query : [query];
  let highlighted = text;
  
  for (const q of queries) {
    const regex = new RegExp(`(${escapeRegex(q)})`, 'gi');
    highlighted = highlighted.replace(regex, '<mark>$1</mark>');
  }
  
  return highlighted;
}

/**
 * 转义正则表达式特殊字符
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 获取热门内容
 */
export function getPopularContent(
  index: TContentIndex[],
  limit: number = 5
): TContentIndex[] {
  // 这里可以基于访问量、更新频率等因素
  // 目前简单返回最近更新的内容
  return index
    .sort((a, b) => 
      new Date(b.updated).getTime() - new Date(a.updated).getTime()
    )
    .slice(0, limit);
}

/**
 * 获取相关搜索建议
 */
export function getSearchSuggestions(
  index: TContentIndex[],
  query: string,
  limit: number = 5
): string[] {
  const suggestions = new Set<string>();
  const normalizedQuery = query.toLowerCase().trim();
  
  if (!normalizedQuery) return [];
  
  // 从标题中提取建议
  for (const item of index) {
    const titleLower = item.title.toLowerCase();
    if (titleLower.includes(normalizedQuery) && titleLower !== normalizedQuery) {
      suggestions.add(item.title);
    }
  }
  
  // 从标签中提取建议
  for (const item of index) {
    for (const tag of item.tags) {
      if (tag.toLowerCase().includes(normalizedQuery)) {
        suggestions.add(tag);
      }
    }
  }
  
  return Array.from(suggestions).slice(0, limit);
}

/**
 * 按类型分组内容
 */
export function groupContentByType(index: TContentIndex[]): Map<string, TContentIndex[]> {
  const grouped = new Map<string, TContentIndex[]>();
  
  for (const item of index) {
    if (!grouped.has(item.type)) {
      grouped.set(item.type, []);
    }
    grouped.get(item.type)!.push(item);
  }
  
  return grouped;
}

/**
 * 按标签分组内容
 */
export function groupContentByTag(index: TContentIndex[]): Map<string, TContentIndex[]> {
  const grouped = new Map<string, TContentIndex[]>();

  for (const item of index) {
    for (const tag of item.tags) {
      if (!grouped.has(tag)) {
        grouped.set(tag, []);
      }
      grouped.get(tag)!.push(item);
    }
  }

  return grouped;
}

/**
 * 内容索引器类
 * 提供面向接口的索引和搜索功能
 */
export class ContentIndexer {
  private index: TContentIndex[] = [];

  constructor(preloadedIndex?: TContentIndex[]) {
    if (preloadedIndex) {
      this.index = preloadedIndex;
    }
  }

  /**
   * 索引内容
   */
  indexContent(contents: TContentIndex[]): void {
    this.index = contents;
  }

  /**
   * 搜索内容
   */
  search(query: string, options: { limit?: number; type?: string } = {}): TContentIndex[] {
    const searchOptions: SearchOptions = {
      query,
      limit: options.limit,
      types: options.type ? [options.type] : undefined
    };

    const results = searchContent(this.index, searchOptions);
    return results.map(r => ({
      type: r.type,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      tags: r.tags,
      updated: r.updated,
      url: r.url
    }));
  }

  /**
   * 带高亮的搜索
   */
  searchWithHighlight(query: string): Array<TContentIndex & { titleHighlighted?: string; summaryHighlighted?: string }> {
    const results = searchContent(this.index, { query });
    return results.map(r => ({
      type: r.type,
      slug: r.slug,
      title: r.title,
      summary: r.summary,
      tags: r.tags,
      updated: r.updated,
      url: r.url,
      titleHighlighted: r.highlights?.title,
      summaryHighlighted: r.highlights?.summary
    }));
  }

  /**
   * 根据类型获取内容
   */
  getByType(type: string): TContentIndex[] {
    return this.index.filter(item => item.type === type);
  }

  /**
   * 根据slug获取内容
   */
  getBySlug(slug: string): TContentIndex | undefined {
    return this.index.find(item => item.slug === slug);
  }

  /**
   * 获取统计信息
   */
  getStats(): { total: number; byType: Record<string, number> } {
    const stats = { total: this.index.length, byType: {} as Record<string, number> };

    for (const item of this.index) {
      stats.byType[item.type] = (stats.byType[item.type] || 0) + 1;
    }

    return stats;
  }
}