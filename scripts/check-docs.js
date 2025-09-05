#!/usr/bin/env node
// Simple script to validate FRS headers and acceptance files
const fs = require('fs');
const path = require('path');

const frsDir = path.join(__dirname, '..', 'docs', '02-requirements');
const acceptanceDir = path.join(__dirname, '..', 'docs', '03-acceptance');

function readHeader(file) {
  const content = fs.readFileSync(file, 'utf8');
  const m = content.match(/^---\n([\s\S]*?)\n---/);
  if (!m) return null;
  const header = {};
  m[1].split('\n').forEach(line => {
    const idx = line.indexOf(':');
    if (idx>0) {
      const k = line.slice(0, idx).trim();
      const v = line.slice(idx+1).trim();
      header[k] = v.replace(/^\[(.*)\]$/, '$1');
    }
  });
  return header;
}

const files = fs.readdirSync(frsDir).filter(f=>f.endsWith('.md'));
let ok = true;
files.forEach(f => {
  const p = path.join(frsDir, f);
  const header = readHeader(p);
  if (!header) {
    console.error('MISSING_HEADER', f);
    ok = false;
    return;
  }
  const required = ['id','owner','acceptance','version','created','status','reviewers'];
  required.forEach(k=>{
    if (!header[k]) {
      console.error('MISSING_KEY', f, k);
      ok = false;
    }
  });
  if (header.acceptance) {
    const a = header.acceptance.replace(/^docs\//,'');
    const af = path.join(acceptanceDir, a.split('/').pop());
    if (!fs.existsSync(af)) {
      console.error('MISSING_ACCEPTANCE_FILE', f, af);
      ok = false;
    }
  }
});
process.exit(ok?0:2);
