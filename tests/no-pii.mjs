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
//
// Run:  node tests/no-pii.mjs            scan source, public, docs, dist
//       node tests/no-pii.mjs --staged   scan only what git has staged

import { execSync } from 'node:child_process';
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';

const ROOTS = ['src', 'public', 'docs', 'dist', 'tests', 'assets'];
const SKIP_DIRS = new Set(['node_modules', '.git', '.astro', 'test-results', 'inbox']);
const SCAN_EXT = new Set(['.astro', '.html', '.css', '.js', '.mjs', '.ts', '.json', '.md', '.txt', '.svg', '.xml', '.yml', '.yaml']);

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

function scan(list) {
  const hits = [];
  for (const f of list) {
    let text;
    try { text = readFileSync(f, 'utf8'); } catch { continue; }
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
  // Assembled at runtime, never written literally. Two reasons, both learned
  // on the first run: a real number here made the gate fail on itself, and a
  // synthetic one did too. Excluding this file from the scan would have left a
  // hole big enough to hide a number in. Building the digits instead keeps the
  // scanner honest — no file in the repo contains a phone-shaped string.
  const d = [9, 8, 7, 6, 5, 4, 3, 2, 1, 0].join('');
  const planted = [`Call me on ${d} any time`, `tel: +91 ${d.slice(0, 5)} ${d.slice(5)}`];
  const found = planted.filter((t) => RULES.some((r) => (r.re.lastIndex = 0, r.re.test(t))));
  const clean = ['Bengaluru, India · IST (UTC+5:30)', 'commit df8cfc3', '52 golden cases', '© 2026'];
  const falsePos = clean.filter((t) => RULES.some((r) => (r.re.lastIndex = 0, r.re.test(t))));
  console.log(`self-test: ${found.length}/${planted.length} planted numbers caught`);
  console.log(`self-test: ${falsePos.length} false positives on known-good strings ${falsePos.length ? JSON.stringify(falsePos) : ''}`);
  const ok = found.length === planted.length && falsePos.length === 0;
  console.log(ok ? 'SELF-TEST PASS — the gate bites and does not cry wolf' : 'SELF-TEST FAIL');
  process.exit(ok ? 0 : 1);
}

let list;
if (process.argv.includes('--staged')) {
  const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .split('\n').filter(Boolean).filter((f) => SCAN_EXT.has(extname(f)) && existsSync(f));
  list = staged;
} else {
  list = ROOTS.flatMap(files);
}

const hits = scan(list);
if (hits.length) {
  console.error(`\n✖ PII gate: ${hits.length} match(es). D38 — personal contact details never ship.\n`);
  for (const h of hits) console.error(`  ${h.file}:${h.line}  [${h.rule}]  ${h.match}`);
  console.error('\nIf this is a false positive, add the surrounding context to ALLOW in tests/no-pii.mjs');
  console.error('and say in the commit message why it is safe. Do not delete the rule.\n');
  process.exit(1);
}
console.log(`✓ PII gate: ${list.length} files scanned, no personal contact details found`);
