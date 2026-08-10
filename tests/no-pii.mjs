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
  // Unchanged since before round 6: a human-formatted number carries AT MOST
  // one separator, at the natural 5+5 grouping point (space, dot, or dash).
  { id: 'phone-in', re: /(?<![\w.])(?:\+?91[\s.-]?)?[6-9]\d{4}[\s.-]?\d{5}(?![\w.])/g },
  // Round 6: a DOCX footnote with a phone number split across separate XML
  // runs turns tag-stripping's tag-to-space replacement into a RUN OF
  // SEVERAL spaces at each seam (one space per stripped tag; a run boundary
  // is at least 2 tags, so at least 2 spaces) — the digit groups land spread
  // apart by multiple spaces each. The rule above requires contiguous digit
  // groups and misses it. (Fixture spelled out digit-by-digit in
  // tests/lib/self-test-round6.mjs, not here — that exact shape would
  // itself match the rule this comment is describing.)
  //
  // This second rule catches that shape WITHOUT reopening the "any digits
  // near any whitespace" hole: a gap is only accepted here if it is 2-4
  // whitespace/separator characters — never a single bare space. A single
  // space is deliberately left unmatched by this rule (the first rule above
  // already owns that one legitimate case, at the fixed 5+5 point), which is
  // exactly what keeps this rule from firing on ordinary single-space-
  // separated numbers — SVG/CSS coordinate lists ("76 102 54 130"),
  // pagination, dates. Measured directly: with a 1-char gap allowed, this
  // rule matched real coordinate strings in PrivateFigure.astro and
  // QuorumFigure.astro; tightening the floor from {0,4} to {2,4} clears both
  // while still catching the round-6 footnote fixture, whose stripped-tag
  // gap is 4 spaces.
  //
  // Round 7: the {2,4} width alone does not distinguish a real split phone
  // number from a 3-space-aligned table of single-digit columns (scores,
  // coordinates) that happens to total 10 digits starting 6-9 — both have
  // gap widths inside the same range. What differs is HOW MANY gaps: the
  // round-6 footnote fixture splits into 4 multi-digit runs (987, 65, 432,
  // 10), joined by exactly 3 gaps, because Word/XML run boundaries are
  // relatively rare. A table split digit-by-digit needs a gap between every
  // column: 9 gaps for 10 digits. `filter` rejects a match with more than 3
  // gaps, which keeps the real fixture (measured: 3 gaps) and drops the
  // digit-by-digit table shape (measured: 9 gaps). See
  // tests/lib/self-test-fixtures.mjs's `tableRow` fixture.
  {
    id: 'phone-in-split',
    re: /(?<![\w.])(?:\+?91[\s.-]?)?[6-9](?:(?:[\s.-]{2,4})?\d){9}(?![\w.])/g,
    filter: (m) => (m.match(/[\s.-]{2,4}/g) || []).length <= 3,
  },
  // International, loose: a + then 11-15 digits with optional separators.
  // Already tolerant of whitespace anywhere in the run (round 6: no change
  // needed here — [\d\s.-] already spans stripped-tag gaps).
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

// Extension check is case-insensitive: resume.PDF must scan the same as
// resume.pdf. extname() itself is case-preserving, so callers normalise here.
function extOf(p) {
  return extname(p).toLowerCase();
}

function files(dir) {
  if (!existsSync(dir)) return [];
  const out = [];
  for (const name of readdirSync(dir)) {
    if (SKIP_DIRS.has(name)) continue;
    const p = join(dir, name);
    const st = statSync(p);
    if (st.isDirectory()) out.push(...files(p));
    else if (SCAN_EXT.has(extOf(p))) out.push(p);
  }
  return out;
}

async function scan(list) {
  const hits = [];
  for (const f of list) {
    let result;
    try {
      result = await extractText(f);
    } catch (err) {
      // A corrupted or password-encrypted PDF/DOCX cannot be text-scanned —
      // same structural gap as an embedded image, so it gets the same
      // fail-closed treatment: a hit that fails the gate, not a skip that
      // lets an unreadable file through as if it had been checked. DEF-37
      // round 3: this used to `continue`, which meant the file that most
      // needed a human's eyes was the one the gate said nothing about.
      if (extOf(f) === '.pdf' || extOf(f) === '.docx') {
        hits.push({
          file: f,
          line: 0,
          rule: 'extraction-failed',
          match: `could not be read (${err.message}) — cannot be text-scanned; `
            + 'treated as a failure, needs manual review',
        });
      } else {
        console.error(`  ! skipped ${f}: extraction failed (${err.message})`);
      }
      continue;
    }
    const { text, hasImages, cannotVerify, reason } = result;
    // A PDF/DOCX with an embedded image, OR one whose object streams are
    // compressed (PDF 1.5+ /ObjStm — an image XObject dictionary can live
    // inside one, invisible to the raw-byte /Subtype /Image regex), OR one
    // that parsed without error but handed back implausibly little text (a
    // corrupted content stream or a stripped document body pdf-parse/mammoth
    // silently gave up on — round 4), cannot be text-scanned for PII with
    // confidence. Fail closed: flag it for a human instead of passing it
    // silently, which is what let the two real DEF-37 DOCX files through in
    // round 1, and what a silently-degraded parse would have let through
    // here.
    if (hasImages || cannotVerify) {
      let rule;
      let match;
      if (hasImages) {
        rule = 'embedded-image';
        match = 'contains an embedded image — cannot be text-scanned; needs manual review';
      } else if (reason === 'sparse-text') {
        rule = 'sparse-extraction';
        match = 'extraction returned implausibly little text for this document — the parse may '
          + 'have silently degraded instead of failing; cannot be verified clean; needs manual review';
      } else {
        rule = 'compressed-object-stream';
        match = 'uses compressed object streams (/ObjStm) — an image could be hidden inside; '
          + 'cannot be fully verified; needs manual review';
      }
      hits.push({ file: f, line: 0, rule, match });
    }
    for (const rule of RULES) {
      for (const m of text.matchAll(rule.re)) {
        if (rule.filter && !rule.filter(m[0])) continue;
        const ctx = text.slice(Math.max(0, m.index - 40), m.index + m[0].length + 40).replace(/\s+/g, ' ');
        if (ALLOW.some((a) => a.test(ctx))) continue;
        const line = text.slice(0, m.index).split('\n').length;
        hits.push({ file: f, line, rule: rule.id, match: m[0].trim() });
      }
    }
  }
  return hits;
}

export { scan };

if (process.argv.includes('--self-test')) {
  const { runSelfTest } = await import('./lib/self-test-fixtures.mjs');
  await runSelfTest(RULES, extractText, scan);
  // runSelfTest exits the process itself once it has printed its verdict.
}

let list;
if (process.argv.includes('--staged')) {
  const staged = execSync('git diff --cached --name-only --diff-filter=ACM', { encoding: 'utf8' })
    .split('\n').filter(Boolean).filter((f) => SCAN_EXT.has(extOf(f)) && existsSync(f));
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
