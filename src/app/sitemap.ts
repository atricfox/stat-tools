import { MetadataRoute } from 'next'
import fs from 'node:fs/promises'
import path from 'node:path'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.SITE_URL || 'https://stattools.example.com'

  // 默认 lastmod
  let lastmodHub = new Date()
  let calculators: { url: string }[] = []

  // 从 calculators.json 读取 lastmod 和所有工具 URL
  try {
    const file = path.resolve(process.cwd(), 'data', 'calculators.json')
    const raw = await fs.readFile(file, 'utf-8')
    const json = JSON.parse(raw) as { lastmod?: string; groups?: { items: { url: string }[] }[] }
    if (json.lastmod) lastmodHub = new Date(json.lastmod)
    calculators = (json.groups || []).flatMap(g => g.items || [])
  } catch {
    // 忽略，使用默认 lastmod
  }

  const pages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1.0 },
    { url: `${baseUrl}/statistics-calculators/`, lastModified: lastmodHub, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/gpa/`, lastModified: lastmodHub, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/descriptive-statistics/`, lastModified: lastmodHub, changeFrequency: 'weekly', priority: 0.8 },
    // Legal pages (lower priority, less frequent changes)
    { url: `${baseUrl}/about/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/privacy-policy/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
    { url: `${baseUrl}/terms-of-service/`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.6 },
  ]

  // 计算器详情页
  for (const it of calculators) {
    pages.push({
      url: `${baseUrl}${it.url}`,
      lastModified: lastmodHub,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  return pages
}
