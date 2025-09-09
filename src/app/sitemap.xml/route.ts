/**
 * Dynamic Sitemap Generator
 * 自动生成XML站点地图，包含所有计算器页面和重要内容
 * Features: 动态URL、优先级、更新频率、多语言支持
 */

import { MetadataRoute } from 'next';
import { ChangeFrequency } from '@/types/seo';

// 站点配置
const SITE_URL = 'https://statcal.com';
const DEFAULT_CHANGE_FREQUENCY: ChangeFrequency = ChangeFrequency.WEEKLY;

// 计算器工具配置
interface ToolConfig {
  path: string;
  priority: number;
  changeFrequency: ChangeFrequency;
  lastModified?: Date;
}

const CALCULATOR_TOOLS: ToolConfig[] = [
  {
    path: '/calculator/mean',
    priority: 0.9,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-09-09')
  },
  {
    path: '/calculator/standard-deviation',
    priority: 0.9,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-09-09')
  },
  {
    path: '/calculator/gpa',
    priority: 0.9,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-09-09')
  },
  {
    path: '/calculator/weighted-mean',
    priority: 0.7,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-08-15')
  },
  {
    path: '/calculator/confidence-interval',
    priority: 0.7,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-08-15')
  }
];

// 静态页面配置
const STATIC_PAGES: ToolConfig[] = [
  {
    path: '/',
    priority: 1.0,
    changeFrequency: ChangeFrequency.DAILY,
    lastModified: new Date()
  },
  {
    path: '/calculator',
    priority: 0.8,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-09-09')
  },
  {
    path: '/hub',
    priority: 0.7,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-09-09')
  },
  {
    path: '/about',
    priority: 0.5,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-08-01')
  },
  {
    path: '/help',
    priority: 0.6,
    changeFrequency: ChangeFrequency.WEEKLY,
    lastModified: new Date('2025-08-15')
  },
  {
    path: '/privacy',
    priority: 0.3,
    changeFrequency: ChangeFrequency.YEARLY,
    lastModified: new Date('2025-08-01')
  }
];

// 内容页面配置 (如果有博客或帮助文章)
const CONTENT_PAGES: ToolConfig[] = [
  {
    path: '/guides/how-to-calculate-mean',
    priority: 0.6,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-08-20')
  },
  {
    path: '/guides/understanding-standard-deviation',
    priority: 0.6,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-08-20')
  },
  {
    path: '/guides/gpa-calculation-guide',
    priority: 0.6,
    changeFrequency: ChangeFrequency.MONTHLY,
    lastModified: new Date('2025-09-05')
  }
];

// 生成站点地图
export async function GET(): Promise<Response> {
  const sitemap = generateSitemap();
  
  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=43200' // 24小时缓存
    }
  });
}

function generateSitemap(): string {
  const allPages = [...STATIC_PAGES, ...CALCULATOR_TOOLS, ...CONTENT_PAGES];
  
  const urls = allPages.map(page => generateUrlEntry(page)).join('');
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls}
</urlset>`;
}

function generateUrlEntry(page: ToolConfig): string {
  const url = `${SITE_URL}${page.path}`;
  const lastmod = page.lastModified ? page.lastModified.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
  const changefreq = page.changeFrequency;
  const priority = page.priority;

  return `  <url>
    <loc>${url}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>
`;
}

// 导出类型给其他文件使用
export type { ToolConfig };
export { CALCULATOR_TOOLS, STATIC_PAGES, CONTENT_PAGES };