import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://thestatscalculator.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',          // 禁止爬取API路由
          '/_next/',        // 禁止爬取Next.js内部文件
          '/admin/',        // 禁止爬取管理后台
          '/private/',      // 禁止爬取私有目录
          '/*.json',        // 禁止爬取JSON文件
          '/health',        // 禁止爬取健康检查端点
        ],
      },
      // 主要搜索引擎爬虫优化
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/', '/health'],
        crawlDelay: 1,    // Google爬虫延迟1秒
      },
      {
        userAgent: 'Bingbot', 
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/', '/health'],
        crawlDelay: 2,    // Bing爬虫延迟2秒
      },
      {
        userAgent: 'Slurp',  // Yahoo爬虫
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/', '/health'],
        crawlDelay: 3,
      },
      // 禁止AI训练爬虫
      {
        userAgent: 'GPTBot',
        disallow: '/',      // 禁止OpenAI训练爬虫
      },
      {
        userAgent: 'ChatGPT-User',
        disallow: '/',      // 禁止ChatGPT用户爬虫
      },
      {
        userAgent: 'CCBot',
        disallow: '/',      // 禁止CommonCrawl AI训练
      },
      {
        userAgent: 'anthropic-ai',
        disallow: '/',      // 禁止Anthropic AI训练
      },
      {
        userAgent: 'Claude-Web',
        disallow: '/',      // 禁止Claude网络爬虫
      },
      {
        userAgent: 'PerplexityBot',
        disallow: '/',      // 禁止Perplexity AI爬虫
      },
      {
        userAgent: 'YouBot',
        disallow: '/',      // 禁止You.com AI爬虫
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}

