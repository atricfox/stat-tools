/**
 * 内容推荐器
 * Sprint 13 - T005: 基于关系、标签、提及和更新时间的推荐系统
 */

import type { TContentFrontmatter, TContentIndex } from '@/lib/content/contentSchema';

// 推荐评分权重配置
const SCORE_WEIGHTS = {
  explicitRelation: 100,    // 显式关联（related字段）
  tagMatch: 30,            // 标签匹配
  mentionMatch: 20,        // 提及匹配
  categoryMatch: 15,       // 分类匹配
  recentUpdate: 10,        // 最近更新
  typeBonus: {             // 类型多样性奖励
    differentType: 5       // 不同类型内容
  }
};

// 推荐结果接口
export interface RecommendationResult {
  content: TContentIndex;
  score: number;
  reason: string[];
}

/**
 * 计算两个内容之间的相关性分数
 */
function calculateRelevanceScore(
  source: TContentFrontmatter,
  target: TContentIndex,
  allContent: TContentIndex[]
): { score: number; reasons: string[] } {
  let score = 0;
  const reasons: string[] = [];
  
  // 1. 检查显式关联
  if (source.related) {
    const relatedUrls = [
      ...(source.related.howto?.map(slug => `/how-to/${slug}`) || []),
      ...(source.related.faq?.map(slug => `/faq/${slug}`) || []),
      ...(source.related.cases?.map(slug => `/cases/${slug}`) || []),
      ...(source.related.tools || []),
      ...(source.related.glossary?.map(slug => `/glossary/${slug}`) || [])
    ];
    
    if (relatedUrls.includes(target.url)) {
      score += SCORE_WEIGHTS.explicitRelation;
      reasons.push('Directly related');
    }
  }
  
  // 2. 标签匹配
  const commonTags = source.tags.filter(tag => target.tags.includes(tag));
  if (commonTags.length > 0) {
    score += SCORE_WEIGHTS.tagMatch * commonTags.length;
    reasons.push(`${commonTags.length} common tags`);
  }
  
  // 3. 提及匹配
  if (source.mentions) {
    const mentionedTools = source.mentions.tools || [];
    const mentionedConcepts = source.mentions.concepts || [];
    
    // 检查目标内容是否被提及
    const targetSlug = target.url.split('/').pop();
    if (targetSlug && (mentionedTools.includes(targetSlug) || mentionedConcepts.includes(targetSlug))) {
      score += SCORE_WEIGHTS.mentionMatch;
      reasons.push('Mentioned in content');
    }
  }
  
  // 4. 类型多样性奖励
  if (source.type !== target.type) {
    score += SCORE_WEIGHTS.typeBonus.differentType;
    reasons.push('Different content type');
  }
  
  // 5. 最近更新奖励
  const daysSinceUpdate = Math.floor(
    (Date.now() - new Date(target.updated).getTime()) / (1000 * 60 * 60 * 24)
  );
  if (daysSinceUpdate <= 30) {
    const recencyScore = SCORE_WEIGHTS.recentUpdate * (1 - daysSinceUpdate / 30);
    score += recencyScore;
    reasons.push('Recently updated');
  }
  
  return { score, reasons };
}

/**
 * 获取推荐内容
 */
export function getRecommendations(
  source: TContentFrontmatter,
  allContent: TContentIndex[],
  options: {
    maxResults?: number;
    excludeTypes?: string[];
    minScore?: number;
    diversifyTypes?: boolean;
  } = {}
): RecommendationResult[] {
  const {
    maxResults = 6,
    excludeTypes = [],
    minScore = 0,
    diversifyTypes = true
  } = options;
  
  // 过滤掉自己和排除的类型
  const candidates = allContent.filter(content => 
    content.slug !== source.slug &&
    !excludeTypes.includes(content.type)
  );
  
  // 计算每个候选内容的分数
  const scored = candidates.map(content => {
    const { score, reasons } = calculateRelevanceScore(source, content, allContent);
    return {
      content,
      score,
      reason: reasons
    };
  });
  
  // 过滤最低分数
  const filtered = scored.filter(item => item.score >= minScore);
  
  // 排序
  filtered.sort((a, b) => b.score - a.score);
  
  // 如果需要类型多样化
  if (diversifyTypes) {
    return diversifyResults(filtered, maxResults);
  }
  
  return filtered.slice(0, maxResults);
}

/**
 * 多样化推荐结果，确保类型分布均衡
 */
function diversifyResults(
  results: RecommendationResult[],
  maxResults: number
): RecommendationResult[] {
  const diversified: RecommendationResult[] = [];
  const typeCount: Record<string, number> = {};
  const maxPerType = Math.ceil(maxResults / 3); // 假设有3种主要类型
  
  // 第一轮：每种类型取最高分的
  const types = ['howto', 'faq', 'case', 'tool', 'glossary'];
  for (const type of types) {
    const bestOfType = results.find(r => 
      r.content.type === type && 
      !diversified.includes(r)
    );
    if (bestOfType) {
      diversified.push(bestOfType);
      typeCount[type] = 1;
    }
  }
  
  // 第二轮：按分数填充剩余位置
  for (const result of results) {
    if (diversified.length >= maxResults) break;
    if (diversified.includes(result)) continue;
    
    const type = result.content.type;
    if ((typeCount[type] || 0) < maxPerType) {
      diversified.push(result);
      typeCount[type] = (typeCount[type] || 0) + 1;
    }
  }
  
  // 如果还没满，继续填充
  for (const result of results) {
    if (diversified.length >= maxResults) break;
    if (!diversified.includes(result)) {
      diversified.push(result);
    }
  }
  
  return diversified;
}

/**
 * 获取相似内容（基于标签和分类）
 */
export function getSimilarContent(
  source: TContentFrontmatter,
  allContent: TContentIndex[],
  maxResults: number = 4
): TContentIndex[] {
  const similar = allContent
    .filter(content => content.slug !== source.slug && content.type === source.type)
    .map(content => ({
      content,
      score: source.tags.filter(tag => content.tags.includes(tag)).length
    }))
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, maxResults)
    .map(item => item.content);
  
  return similar;
}

/**
 * 获取工具页面的相关内容推荐
 */
export function getToolRelatedContent(
  toolSlug: string,
  allContent: TContentIndex[],
  options: {
    maxResults?: number;
    prioritizeHowTo?: boolean;
  } = {}
): RecommendationResult[] {
  const {
    maxResults = 6,
    prioritizeHowTo = true
  } = options;
  
  const recommendations: RecommendationResult[] = [];
  
  // 查找明确关联到该工具的内容
  for (const content of allContent) {
    let score = 0;
    const reasons: string[] = [];
    
    // 检查是否在工具的related中
    const relatedTools = (content as any).related?.tools || [];
    if (relatedTools.includes(`/calculator/${toolSlug}`)) {
      score += 100;
      reasons.push('Specifically for this tool');
    }
    
    // 检查是否在mentions中
    const mentionedTools = (content as any).mentions?.tools || [];
    if (mentionedTools.includes(toolSlug)) {
      score += 50;
      reasons.push('Mentions this tool');
    }
    
    // 检查标签匹配
    if (content.tags.includes(toolSlug)) {
      score += 30;
      reasons.push('Related topic');
    }
    
    // HowTo内容优先级加成
    if (prioritizeHowTo && content.type === 'howto') {
      score += 20;
      reasons.push('Step-by-step guide');
    }
    
    if (score > 0) {
      recommendations.push({ content, score, reason: reasons });
    }
  }
  
  // 排序并返回
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, maxResults);
}

/**
 * 批量获取内容推荐（用于预生成）
 */
export function batchGetRecommendations(
  contents: TContentFrontmatter[],
  allContent: TContentIndex[]
): Map<string, RecommendationResult[]> {
  const recommendationsMap = new Map<string, RecommendationResult[]>();
  
  for (const content of contents) {
    const recommendations = getRecommendations(content, allContent, {
      maxResults: 6,
      diversifyTypes: true
    });
    recommendationsMap.set(content.slug, recommendations);
  }
  
  return recommendationsMap;
}