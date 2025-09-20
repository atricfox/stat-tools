import { MetadataRoute } from 'next'
import fs from 'node:fs/promises'
import path from 'node:path'
import { contentService } from '@/lib/content/ContentService'
import { glossaryService } from '@/lib/services/glossary'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawBaseUrl = process.env.SITE_URL || 'https://thestatscalculator.com'
  const baseUrl = rawBaseUrl.replace(/\/+$/, '')
  const toAbsoluteUrl = (pathname: string) => new URL(pathname, `${baseUrl}/`).toString()

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

  const now = new Date()
  const staticRoutes: Array<{
    path: string
    changeFrequency: MetadataRoute.Sitemap[0]['changeFrequency']
    priority: number
    lastModified?: Date
  }> = [
    { path: '/', changeFrequency: 'weekly', priority: 1.0, lastModified: now },
    { path: '/statistics-calculators', changeFrequency: 'weekly', priority: 0.9, lastModified: lastmodHub },
    { path: '/gpa', changeFrequency: 'weekly', priority: 0.8, lastModified: lastmodHub },
    { path: '/descriptive-statistics', changeFrequency: 'weekly', priority: 0.8, lastModified: lastmodHub },
    { path: '/tools', changeFrequency: 'weekly', priority: 0.7, lastModified: lastmodHub },
    { path: '/faq', changeFrequency: 'weekly', priority: 0.7, lastModified: lastmodHub },
    { path: '/how-to', changeFrequency: 'weekly', priority: 0.7, lastModified: lastmodHub },
    { path: '/cases', changeFrequency: 'weekly', priority: 0.7, lastModified: lastmodHub },
    { path: '/glossary', changeFrequency: 'weekly', priority: 0.7, lastModified: lastmodHub },
    { path: '/about', changeFrequency: 'monthly', priority: 0.6, lastModified: now },
    { path: '/privacy-policy', changeFrequency: 'monthly', priority: 0.5, lastModified: now },
    { path: '/terms-of-service', changeFrequency: 'monthly', priority: 0.5, lastModified: now },
    { path: '/health', changeFrequency: 'monthly', priority: 0.3, lastModified: now },
    { path: '/structured-content-demo', changeFrequency: 'monthly', priority: 0.3, lastModified: now },
  ]

  const pages: MetadataRoute.Sitemap = staticRoutes.map(route => ({
    url: toAbsoluteUrl(route.path),
    lastModified: route.lastModified ?? now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }))

  // 计算器详情页
  for (const it of calculators) {
    pages.push({
      url: toAbsoluteUrl(it.url),
      lastModified: lastmodHub,
      changeFrequency: 'monthly',
      priority: 0.8,
    })
  }

  // How-to 指南
  try {
    const howTos = contentService.getContentByType('howto')
    for (const howTo of howTos) {
      pages.push({
        url: toAbsoluteUrl(`/how-to/${howTo.slug}`),
        lastModified: howTo.updatedAt ? new Date(howTo.updatedAt) : lastmodHub,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.warn('[sitemap] Failed to load how-to content:', error)
  }

  // Case Studies
  try {
    const cases = contentService.getContentByType('case')
    for (const caseItem of cases) {
      pages.push({
        url: toAbsoluteUrl(`/cases/${caseItem.slug}`),
        lastModified: caseItem.updatedAt ? new Date(caseItem.updatedAt) : lastmodHub,
        changeFrequency: 'monthly',
        priority: 0.7,
      })
    }
  } catch (error) {
    console.warn('[sitemap] Failed to load case content:', error)
  }

  // Glossary Terms
  try {
    const glossary = await glossaryService.getTerms({ pageSize: 500 })
    for (const term of glossary.terms) {
      pages.push({
        url: toAbsoluteUrl(`/glossary/${term.slug}`),
        lastModified: term.updated_at ? new Date(term.updated_at) : lastmodHub,
        changeFrequency: 'monthly',
        priority: 0.6,
      })
    }
  } catch (error) {
    console.warn('[sitemap] Failed to load glossary terms:', error)
  }

  return pages
}
