/**
 * Dynamic Robots.txt Generator
 * 自动生成robots.txt文件，控制搜索引擎爬取行为
 * Features: 用户代理控制、站点地图链接、爬取延迟配置
 */

const SITE_URL = 'https://statcal.com';

// 需要禁止爬取的路径
const DISALLOWED_PATHS = [
  '/api/',           // API 端点
  '/_next/',         // Next.js 内部文件
  '/admin/',         // 管理界面
  '/private/',       // 私有内容
  '/temp/',          // 临时文件
  '/test/',          // 测试页面
  '*.json',          // JSON 文件
  '*.xml',           // 除sitemap.xml外的XML文件
  '/search?*',       // 搜索结果页面的动态参数
];

// 需要特别允许的路径 (覆盖通配符禁止)
const ALLOWED_PATHS = [
  '/sitemap.xml',    // 站点地图
];

// 不同用户代理的特殊规则
const USER_AGENT_RULES = {
  // Google bot 特殊配置
  'Googlebot': {
    disallow: [
      '/api/',
      '/_next/',
      '/admin/'
    ],
    allow: [
      '/sitemap.xml',
      '/calculator/*',
      '/'
    ],
    crawlDelay: undefined // Google不需要爬取延迟
  },
  
  // Bing bot 配置
  'Bingbot': {
    disallow: [
      '/api/',
      '/_next/',
      '/admin/',
      '/temp/'
    ],
    allow: [
      '/sitemap.xml',
      '/calculator/*'
    ],
    crawlDelay: 1 // Bing建议1秒延迟
  },
  
  // 其他搜索引擎的通用配置
  '*': {
    disallow: DISALLOWED_PATHS,
    allow: ALLOWED_PATHS,
    crawlDelay: 2 // 通用2秒延迟，避免服务器压力
  }
};

export async function GET(): Promise<Response> {
  const robotsTxt = generateRobotsTxt();
  
  return new Response(robotsTxt, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=1800' // 1小时缓存
    }
  });
}

function generateRobotsTxt(): string {
  let robotsContent = '';
  
  // 为每个用户代理生成规则
  Object.entries(USER_AGENT_RULES).forEach(([userAgent, rules]) => {
    robotsContent += `User-agent: ${userAgent}\n`;
    
    // 添加允许规则
    if (rules.allow) {
      rules.allow.forEach(path => {
        robotsContent += `Allow: ${path}\n`;
      });
    }
    
    // 添加禁止规则
    if (rules.disallow) {
      rules.disallow.forEach(path => {
        robotsContent += `Disallow: ${path}\n`;
      });
    }
    
    // 添加爬取延迟
    if (rules.crawlDelay !== undefined) {
      robotsContent += `Crawl-delay: ${rules.crawlDelay}\n`;
    }
    
    robotsContent += '\n';
  });
  
  // 添加站点地图链接
  robotsContent += `Sitemap: ${SITE_URL}/sitemap.xml\n`;
  
  // 添加其他重要信息
  robotsContent += `\n# StatCal - Statistical Calculators\n`;
  robotsContent += `# Free online statistical tools for education and research\n`;
  robotsContent += `# Contact: https://statcal.com/contact\n`;
  robotsContent += `# Last updated: ${new Date().toISOString().split('T')[0]}\n`;
  
  return robotsContent;
}

// 验证robots.txt规则的辅助函数
export function validateRobotsRules(): {
  isValid: boolean;
  warnings: string[];
  suggestions: string[];
} {
  const warnings: string[] = [];
  const suggestions: string[] = [];
  
  // 检查是否有太多的disallow规则
  const totalDisallowRules = Object.values(USER_AGENT_RULES)
    .reduce((total, rules) => total + (rules.disallow?.length || 0), 0);
  
  if (totalDisallowRules > 20) {
    warnings.push(`Large number of disallow rules (${totalDisallowRules}). Consider consolidating.`);
  }
  
  // 检查爬取延迟设置
  Object.entries(USER_AGENT_RULES).forEach(([userAgent, rules]) => {
    if (rules.crawlDelay && rules.crawlDelay > 10) {
      warnings.push(`High crawl delay for ${userAgent} (${rules.crawlDelay}s). May slow down indexing.`);
    }
  });
  
  // 建议添加常见的优化
  if (!USER_AGENT_RULES['*']?.disallow?.includes('/search?*')) {
    suggestions.push('Consider blocking search result pages with parameters to avoid duplicate content.');
  }
  
  if (!USER_AGENT_RULES['Googlebot']) {
    suggestions.push('Consider adding specific rules for Googlebot for better optimization.');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  };
}

// 检查URL是否被robots.txt阻止
export function isUrlBlocked(url: string, userAgent: string = '*'): boolean {
  const path = new URL(url, SITE_URL).pathname;
  const rules = USER_AGENT_RULES[userAgent as keyof typeof USER_AGENT_RULES] || USER_AGENT_RULES['*'];
  
  // 先检查是否明确允许
  if (rules.allow?.some(allowedPath => matchesPattern(path, allowedPath))) {
    return false;
  }
  
  // 再检查是否被禁止
  return rules.disallow?.some(disallowedPath => matchesPattern(path, disallowedPath)) || false;
}

// 模式匹配辅助函数
function matchesPattern(path: string, pattern: string): boolean {
  // 简单的通配符匹配
  if (pattern.includes('*')) {
    const regexPattern = pattern
      .replace(/\*/g, '.*')
      .replace(/\?/g, '\\?');
    return new RegExp(`^${regexPattern}`).test(path);
  }
  
  // 精确匹配或前缀匹配
  return path === pattern || path.startsWith(pattern);
}

export { USER_AGENT_RULES, DISALLOWED_PATHS, ALLOWED_PATHS };