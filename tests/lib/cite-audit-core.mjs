// Shared logic for the citation-form gate (DEF-71, RCA-018, docs/contracts/cite-audit.md).
// Split out of tests/cite-audit.mjs so the entry point can import the SAME functions the
// self-test drives — the whole point of C2's fix: one predicate, not two copies of it.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

export const ROOTS = ['src', 'tests', 'scripts', 'playwright.config.js', 'astro.config.mjs'];
export const SCANNED = /\.(js|mjs|cjs|ts|astro|css|html)$/;
export const FLOOR = 140; /* 150 files measured 2026-09-01; a collapsed glob must not pass. */
export const NAMED = [
  'src/data/cv.js', 'src/styles/global.css', 'src/pages/index.astro',
  'tests/file-budget.mjs', 'scripts/og-card.mjs',
  'playwright.config.js', 'astro.config.mjs',
];

/* The pattern, assembled from named parts (one line holding the whole thing breaches D8's
   120-char cap). TARGETS is an allowlist: a permissive "anything dot anything colon digits"
   floods on CSS contrast ratios written with a colon. */
const NAME = '[A-Za-z0-9_.-]+';
export const TARGETS = 'js|mjs|cjs|ts|astro|css|md|py|json|yml|html';
const SPAN = '[0-9]+(?:-[0-9]+)?';
const FILE_LINE = NAME + '\\.(?:' + TARGETS + '):' + SPAN;
/* Bare continuation, a comma-colon-digits form hung off a prior citation on the same line.
   Matches unconditionally — contract cell 31: an orphaned continuation with nothing before it
   still fires. Disclosed, not fixed; a real occurrence gets a manual EXEMPT entry like any
   other false positive. */
const CONTINUED = ',\\s*:' + SPAN;
/* The one extensionless in-repo path form that actually occurs. Does not match a nested
   `.githooks/<subdir>/name:NN` path (contract cell 34) — disclosed, not fixed. */
const HOOK = '\\.githooks/' + NAME + ':' + SPAN;
export const CITATION = new RegExp([FILE_LINE, CONTINUED, HOOK].join('|'), 'g');
/* Stripped first, so a port number or a URL-embedded path cannot match. Contract cell 33: a
   citation glued to a URL with no separating whitespace is still eaten by this strip —
   disclosed, not fixed. */
const URL = /[a-z][a-z0-9+.-]*:\/\/\S+/gi;

const cite = (name, span) => name + ':' + span;

/* HAND-WRITTEN, never generated. Each entry names the FULL SET of citations expected on that
   exact line, not one hit in isolation — the C1 fix. The old identity, (file, line, one hit),
   let a line's set change (a citation to a DIFFERENT real file appended, sharing the same
   stripped basename+span as something already excused) go undetected, because only the ALREADY
   -exempt hit was ever checked. Requiring the full set to match means any edit to a line's
   citations — added, removed, or swapped — drops exemption for every citation on that line
   until a maintainer updates this table on purpose. */
export const EXEMPT = [
  {
    file: 'playwright.config.js', line: 23, cites: [cite('expect.js', '12486')],
    reason: 'Points into Playwright\'s bundled expect source under node_modules. Untracked, '
      + 'not ours to sweep, and the comment beside it already says so.',
  },
  {
    file: 'playwright.config.js', line: 55, cites: [cite('index.js', '40')],
    reason: 'Points into the Astro CLI preview entry under node_modules. Untracked.',
  },
  {
    file: 'tests/geometry.spec.js', line: 124, cites: [cite('expect.js', '12486')],
    reason: 'The same bundled Playwright expect source under node_modules. Untracked.',
  },
  {
    file: 'tests/lib/viewport-clip.mjs', line: 140, cites: [cite('test.d.ts', '225')],
    reason: 'Playwright type definitions under node_modules. Untracked.',
  },
  {
    file: 'src/data/projects.js', line: 16, cites: [cite('file-budget.mjs', '16')],
    reason: 'QUEUED FOR THE OWNER, not resolved. In-repo and SHOULD be swept, but the '
      + 'autonomous run\'s invariant 3 bars any src/data/ change outright. Not permanent.',
  },
  {
    file: 'src/data/projects.js', line: 128, cites: [cite('main.py', '174-179')],
    reason: 'UNCHECKABLE — points into an external repository this gate cannot read, and it '
      + 'is the ONLY citation in this repo backing RENDERED copy. Re-verify BY HAND.',
  },
];

/* Order-independent, duplicate-count-sensitive equality: two citations that happen to be the
   same VALUE still both have to be present for a match. */
function sameMultiset(a, b) {
  if (a.length !== b.length) return false;
  const sa = [...a].sort();
  const sb = [...b].sort();
  return sa.every((v, i) => v === sb[i]);
}

/* One line in, every banned form on it out. */
export function citationsIn(line) {
  return line.replace(URL, ' ').match(CITATION) || [];
}

/* The audit walk. `exempt` is injectable so the self-test can drive it with a virtual table
   without ever touching the real EXEMPT constant. */
export function audit(files, read, exempt = EXEMPT) {
  const breaches = [];
  for (const file of files) {
    const lines = read(file).split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const hits = citationsIn(lines[i]);
      if (hits.length === 0) continue;
      const entry = exempt.find((e) => e.file === file && e.line === i + 1);
      const matches = entry ? sameMultiset(entry.cites, hits) : false;
      if (matches) continue;
      for (const hit of hits) breaches.push({ file, line: i + 1, hit });
    }
  }
  return breaches;
}

/* THE shared exit predicate. Both the self-test (Partner 4) and the real run at the bottom of
   tests/cite-audit.mjs call this SAME function — a typo in it breaks both identically, which is
   the direct answer to `.lenght`: the self-test used to check its OWN copy of this condition,
   not the gate's. */
export function hasBreach(breaches) {
  return breaches.length > 0;
}

export function scanFiles() {
  const args = ROOTS.map((r) => `'${r}'`).join(' ');
  return execSync(`git ls-files -co --exclude-standard -- ${args}`, { encoding: 'utf8' })
    .split('\n')
    .filter((f) => f && SCANNED.test(f));
}

export function readReal(file) {
  return readFileSync(file, 'utf8');
}
