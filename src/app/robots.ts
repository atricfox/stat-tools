import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://statcal.com'

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/admin/',
          '/private/',
          '*.json',
          '/health'
        ],
      },
      // 针对搜索引擎爬虫的特殊规则
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/', '/health'],
        crawlDelay: 1
      },
      {
        userAgent: 'Bingbot', 
        allow: '/',
        disallow: ['/api/', '/_next/', '/admin/', '/private/', '/health'],
        crawlDelay: 2
      }
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl
  }
}

