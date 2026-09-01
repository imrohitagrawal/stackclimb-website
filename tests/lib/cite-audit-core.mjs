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

/* HAND-WRITTEN, never generated. `text` is the FULL, EXACT line the exemption covers — not the
   stripped hit, not a set of hits. C1 ROUND-1 FIX (per-line SET of hits) closed the append
   case but a `codex exec --sandbox read-only` review round drove `audit()` directly and showed
   it still WASN'T CLOSED: a real path prefixed onto an exempted basename (the literal C1
   reproduction from the old branch's queue — an in-repo file sharing a name with the exempted
   node_modules one), and a column suffix or a malformed tail glued onto an exempted span (SPAN
   has no right boundary) all still returned ZERO breaches against the existing exemption,
   because the identity was still built from the ALREADY-TRUNCATED regex match, which throws
   away exactly the information that distinguishes them. Fixed by keying on the RAW LINE TEXT
   instead: an entry is live only if the line's CURRENT content is byte-identical to what it
   excuses. Any edit at all — a path swapped in, a column appended, a citation added or removed,
   even a wording change — drops exemption for every citation on that line until a maintainer
   reviews it and updates this table on purpose. This is deliberately the strict direction: the
   EXEMPT reasons below already say "re-verify by hand", and this makes that literal. `cites` is
   kept for a human reading the table, and cross-checked against `text` by Partner 3's liveness
   check, but `text` is what audit() actually keys on. */
export const EXEMPT = [
  {
    file: 'playwright.config.js', line: 23,
    text: '  // installed 1.62.1 (' + cite('expect.js', '12486') + ').',
    cites: [cite('expect.js', '12486')],
    reason: 'Points into Playwright\'s bundled expect source under node_modules. Untracked, '
      + 'not ours to sweep, and the comment beside it already says so.',
  },
  {
    file: 'playwright.config.js', line: 55,
    text: '    // command checks (node_modules/astro/dist/cli/preview/' + cite('index.js', '40')
      + ') to skip',
    cites: [cite('index.js', '40')],
    reason: 'Points into the Astro CLI preview entry under node_modules. Untracked.',
  },
  {
    file: 'tests/geometry.spec.js', line: 124,
    text: '       installed 1.62.1 source, ' + cite('expect.js', '12486') + '.) */',
    cites: [cite('expect.js', '12486')],
    reason: 'The same bundled Playwright expect source under node_modules. Untracked.',
  },
  {
    file: 'tests/lib/viewport-clip.mjs', line: 140,
    text: '   default is `"css"` (types/' + cite('test.d.ts', '225')
      + ', "Defaults to \\"css\\"") but it is a',
    cites: [cite('test.d.ts', '225')],
    reason: 'Playwright type definitions under node_modules. Untracked.',
  },
  {
    file: 'src/data/projects.js', line: 16,
    text: '   excepted — ' + cite('file-budget.mjs', '16')
      + ' says never raise a ceiling without a written reason. */',
    cites: [cite('file-budget.mjs', '16')],
    reason: 'QUEUED FOR THE OWNER, not resolved. In-repo and SHOULD be swept, but the '
      + 'autonomous run\'s invariant 3 bars any src/data/ change outright. Not permanent.',
  },
  {
    file: 'src/data/projects.js', line: 128,
    text: '         app\'s DEFAULT persona, age Adult (' + cite('main.py', '174-179')
      + '); a senior with asthma',
    cites: [cite('main.py', '174-179')],
    reason: 'UNCHECKABLE — points into an external repository this gate cannot read, and it '
      + 'is the ONLY citation in this repo backing RENDERED copy. Re-verify BY HAND.',
  },
];

/* One line in, every banned form on it out. */
export function citationsIn(line) {
  return line.replace(URL, ' ').match(CITATION) || [];
}

/* The audit walk. `exempt` is injectable so the self-test can drive it with a virtual table
   without ever touching the real EXEMPT constant. Exemption is BY EXACT LINE TEXT, not by hit —
   see the EXEMPT comment above for why. */
export function audit(files, read, exempt = EXEMPT) {
  const breaches = [];
  for (const file of files) {
    const lines = read(file).split('\n');
    for (let i = 0; i < lines.length; i += 1) {
      const hits = citationsIn(lines[i]);
      if (hits.length === 0) continue;
      const entry = exempt.find((e) => e.file === file && e.line === i + 1);
      if (entry && entry.text === lines[i]) continue;
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
