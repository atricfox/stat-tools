import { MetadataRoute } from 'next'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://statcal.com'
  const now = new Date()

  // 静态页面
  const staticPages = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 1.0,
    },
    {
      url: `${baseUrl}/tools`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }
  ]

  // 计算器工具页面
  const calculatorTools = [
    {
      slug: 'mean',
      name: 'Mean Calculator',
      priority: 0.9
    },
    {
      slug: 'standard-deviation',
      name: 'Standard Deviation Calculator',
      priority: 0.8
    },
    {
      slug: 'weighted-mean',
      name: 'Weighted Mean Calculator',
      priority: 0.8
    },
    {
      slug: 'gpa',
      name: 'GPA Calculator',
      priority: 0.7
    }
  ]

  const calculatorPages = calculatorTools.map(tool => ({
    url: `${baseUrl}/calculator/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: tool.priority,
  }))

  // 工具页面（动态路由）
  const toolPages = calculatorTools.map(tool => ({
    url: `${baseUrl}/tool/${tool.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: tool.priority - 0.1,
  }))

  return [
    ...staticPages,
    ...calculatorPages,
    ...toolPages
  ]
}

