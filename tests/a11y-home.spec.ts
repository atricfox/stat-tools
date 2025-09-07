import { test, expect } from '@playwright/test'

test.describe('A11y: Home page', () => {
  test('has no serious/critical violations', async ({ page }) => {
    await page.goto('/')
    // Inject axe from node_modules; requires devDependency 'axe-core'
    // Playwright will bypass CSP per config to allow injection in tests
    const axePath = require.resolve('axe-core')
    await page.addScriptTag({ path: axePath })
    const result = await page.evaluate(async () => {
      // @ts-ignore
      return await (window as any).axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa'] } })
    })
    const violations = result.violations.filter((v: any) => ['serious', 'critical'].includes(v.impact))
    if (violations.length) {
      console.error('A11y violations:', violations.map((v: any) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length })))
    }
    expect(violations).toHaveLength(0)
  })
})

