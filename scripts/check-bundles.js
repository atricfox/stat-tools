#!/usr/bin/env node
/* Simple bundle budget checker for Next.js .next/static/chunks */
const fs = require('fs')
const path = require('path')

const BUDGET_TOTAL = Number(process.env.JS_BUDGET_KB || 90) * 1024
const BUDGET_CHUNK = Number(process.env.CHUNK_BUDGET_KB || 30) * 1024

const chunksDir = path.join('.next', 'static', 'chunks')

if (!fs.existsSync(chunksDir)) {
  console.log(`[bundles] No chunks dir at ${chunksDir}; skipping.`)
  process.exit(0)
}

const files = fs.readdirSync(chunksDir).filter(f => f.endsWith('.js'))
let total = 0
let overs = []
for (const f of files) {
  const p = path.join(chunksDir, f)
  const size = fs.statSync(p).size
  total += size
  if (size > BUDGET_CHUNK) overs.push({ file: f, size })
}

console.log(`[bundles] Total JS: ${(total / 1024).toFixed(1)}KB (budget ${(BUDGET_TOTAL/1024).toFixed(0)}KB)`) 
overs.forEach(o => console.log(`[bundles] Oversized chunk: ${o.file} ${(o.size/1024).toFixed(1)}KB (budget ${(BUDGET_CHUNK/1024).toFixed(0)}KB)`))

if (total > BUDGET_TOTAL || overs.length) {
  console.error('[bundles] Budget exceeded')
  process.exit(2)
}

console.log('[bundles] Budget OK')

