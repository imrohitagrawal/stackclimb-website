#!/usr/bin/env node
// Blocks personal contact details from reaching git or the built site.
//
// Why this exists: three times now, owner-supplied source material has carried
// personal details into this repo — visiting cards with a mobile number and a
// LinkedIn QR rendered as pixels (2026-08-07), and a CV containing a phone
// number (2026-08-09). D38 says the number never ships. A rule in a markdown
// file is not enforcement; this is.
//
// WHICH CHANGE TURNS IT RED: put the owner's phone number into any scanned
// file, or any Indian mobile-shaped number, and this exits 1. Prove it with
//   node tests/no-pii.mjs --self-test
// That self-test also covers DEF-37: a phone-shaped number embedded in a
// hand-built PDF or DOCX fixture (in memory, never written to disk) must be
// caught the same way a planted plain-text number is — reverting the .pdf/
// .docx extraction in tests/lib/extract-text.mjs turns those assertions red.
//
// Run:  node tests/no-pii.mjs            scan source, public, docs, dist
//       node tests/no-pii.mjs --staged   scan only what git has staged

import { execSync } from 'node:child_process';
import { existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { extractText } from './lib/extract-text.mjs';

const ROOTS = ['src', 'public', 'docs', 'dist', 'tests', 'assets'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', 'test-results', 'inbox']);
const SCAN_EXT = new Set([
  '.astro', '.html', '.css', '.js', '.mjs', '.ts', '.json', '.md', '.txt',
  '.svg', '.xml', '.yml', '.yaml', '.pdf', '.docx',
]);

const RULES = [
  // Indian mobile: 10 digits opening 6-9, with or without +91. Word boundaries
  // keep it out of hex hashes; unix seconds currently open with 1, ms with 17.
  { id: 'phone-in', re: /(?<![\w.])(?:\+?91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}(?![\w.])/g },
  // International, loose: a + then 11-15 digits with optional separators.
  { id: 'phone-intl', re: /(?<![\w.])\+\d[\d\s.-]{9,16}\d(?![\w.])/g },
  { id: 'aadhaar', re: /(?<![\w.])\d{4}[\s-]\d{4}[\s-]\d{4}(?![\w.])/g },
  { id: 'pan', re: /(?<![\w])[A-Z]{5}\d{4}[A-Z](?![\w])/g },
];

// Values that are allowed to look like a match.
const ALLOW = [
  /IST \(UTC\+5:30\)/,          // the site states its timezone
  /UTC\+\d/,
  /\+91[\s]?\(0\)/,             // never used, kept explicit
];

function files(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...files(p));
    else if (SCAN_EXT.has(extname(p))) out.push(p);
  }
  return out;
}

async function scan(list) {
  const hits = [];
  for (const f of list) {
    let text;
    try {
      text = await extractText(f);
    } catch (err) {
      console.error(`  ! skipped ${f}: extraction failed (${err.message})`);
      continue;
    }
    for (const rule of RULES) {
      for (const m of text.matchAll(rule.re)) {
        const ctx = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' ');
        if (ALLOW.some((a) => a.test(ctx))) continue;
        const line = text.slice(0, m.index).split('\n').length;
        hits.push({ file: f, line, rule: rule.id, match: m[0].trim() });
      }
    }
  }
  return hits;
}

if (process.argv.includes('--self-test')) {
  const { runSelfTest } = await import('./lib/self-test-fixtures.mjs');
  await runSelfTest(RULES, extractText);
  // runSelfTest exits the process itself once it has printed its verdict.
}

let list;
if (process.argv.includes('--staged')) {
  const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .split('\n').filter(Boolean).filter((f) => SCAN_EXT.has(extname(f)) && existsSync(f));
  list = staged;
} else {
  list = ROOTS.flatMap(files);
}

const hits = await scan(list);
if (hits.length) {
  console.error(`\n✖ PII gate: ${hits.length} match(es). D38 — personal contact details never ship.\n`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  [${h.rule}]  ${h.match}`);
  console.error('\nIf this is a false positive, add the surrounding context to ALLOW in tests/no-pii.mjs');
  console.error('and say in the commit message why it is safe. Do not delete the rule.\n');
  process.exit(1);
}
console.log(`✓ PII gate: ${list.length} files scanned, no personal contact details found`);
