// The D8 file budget, as a gate instead of prose. Exit 1 on any breach.
//
// Why: AGENTS.md capped global.css at a grandfathered 500 lines in writing,
// and the file reached 505 with nobody noticing (DEF-47) — the handoff even
// recorded it at 498. AGENTS.md's own rule: "If a rule must ALWAYS hold, put
// it in CI/hooks, not in a doc." This is that.
//
// Budget (D8, inherited from NarraTwin ADR/0047:55):
//   new module or test:  250 lines · 32,000 bytes · 120 chars per line
//
// POPULATION IS DERIVED — every tracked file under src/ and tests/ — so a new
// file is under the budget the moment it exists. The EXCEPTIONS table below
// is the opposite of the hand-maintained-allowlist trap (DEF-10, DEF-44,
// touch.css): forgetting a file here makes the gate STRICTER, never blind.
// Each entry is a recorded ceiling, measured 2026-08-09, that its file may
// shrink under but never grow past. Shrink one and lower its number in the
// same change. Never raise one without a written reason in docs/STATUS.md.
//
// The 40-line entry-point cap from the ADR is not enforced: an Astro site
// has no single entry point to point it at. Recorded rather than silently
// dropped.
//
// Self-test: --self-test proves both directions without touching the tree.
// Real-tree mutation that turns it red: add six lines to src/styles/global.css.

import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const LINES = 250;
const BYTES = 32_000;
const LINE_LEN = 120;

/* file → { lines, lineLen } ceilings. Shrink-only. Measured 2026-08-09. */
const EXCEPTIONS = {
  // D8's named grandfather: pre-existing, ceiling 500, may not grow past it.
  // Was 505 on 09 Aug; the nav extraction brought it to 433.
  'src/styles/global.css': { lines: 500, lineLen: 260 },
  // Over-budget on the day this gate arrived. Frozen at measurement, not
  // forgiven: each is standing debt (see STATUS.md DEF-47) and the ceiling
  // drops when the file is modularized.
  'src/pages/index.astro': { lines: 484, lineLen: 212 },
  'tests/lib/rendered-contrast.mjs': { lines: 314, lineLen: 128 },
  'tests/dod.spec.js': { lines: 259, lineLen: 112 },
  // Under 250 lines but over 120 chars somewhere — long URLs and evidence
  // strings in comments and data. Line-length frozen, line count on budget.
  'src/data/cv.js': { lineLen: 260 },
  'src/layouts/Layout.astro': { lineLen: 230 },
  'src/pages/cv.astro': { lineLen: 237 },
  'src/components/Overview.astro': { lineLen: 127 },
  'src/components/figures/NarraTwinFigure.astro': { lineLen: 234 },
  'src/components/figures/PrivateFigure.astro': { lineLen: 136 },
  'tests/links.spec.js': { lineLen: 128 },
  'tests/nav-contrast.mjs': { lineLen: 142 },
  'tests/boundary-check.mjs': { lineLen: 153 },
  'tests/no-pii.mjs': { lineLen: 136 },
};

function audit(files, read) {
  const breaches = [];
  for (const file of files) {
    const body = read(file);
    const lines = body.split('\n');
    const nLines = lines.length - (body.endsWith('\n') ? 1 : 0);
    const nBytes = Buffer.byteLength(body);
    const longest = lines.reduce((m, l) => Math.max(m, l.length), 0);
    const cap = EXCEPTIONS[file] ?? {};
    const lineCap = cap.lines ?? LINES;
    const lenCap = cap.lineLen ?? LINE_LEN;
    if (nLines > lineCap) breaches.push(`${file}: ${nLines} lines (ceiling ${lineCap})`);
    if (nBytes > BYTES) breaches.push(`${file}: ${nBytes} bytes (ceiling ${BYTES})`);
    if (longest > lenCap) breaches.push(`${file}: a ${longest}-char line (ceiling ${lenCap})`);
  }
  return breaches;
}

function realFiles() {
  // -co --exclude-standard: tracked AND untracked-but-not-ignored, repo-wide.
  // Round-2 review: `git ls-files -- src tests` let a 600-line file escape two
  // ways — by not being `git add`ed yet, and by living in a new top-level
  // directory. The population is now everything the repo would ship or run,
  // filtered by CODE extension so docs and workflows stay out of a budget
  // written for modules and tests (D8's own scope).
  return execSync('git ls-files -co --exclude-standard', { encoding: 'utf8' })
    .split('\n')
    .filter((f) => /\.(js|mjs|cjs|ts|css|astro)$/.test(f))
    // Dot-directories are vendored tooling (.agents/, .claude/ skill scripts —
    // third-party code with its own norms), not modules this project authors.
    // Everything else in the repo, tracked or not, is in scope.
    .filter((f) => !f.startsWith('.'));
}

if (process.argv.includes('--self-test')) {
  // Direction 1: an over-budget file is caught. Fixtures are virtual — no
  // oversized file ever exists in the tree.
  const fat = Array.from({ length: 251 }, (_, i) => `line ${i}`).join('\n');
  const wide = `short\n${'x'.repeat(121)}\n`;
  const virtual = { 'src/fat.js': fat, 'src/wide.js': wide, 'src/ok.js': 'fine\n' };
  const caught = audit(Object.keys(virtual), (f) => virtual[f]);
  const fatHit = caught.some((b) => b.startsWith('src/fat.js: 251 lines'));
  const wideHit = caught.some((b) => b.startsWith('src/wide.js: a 121-char line'));
  const cleanOk = !caught.some((b) => b.startsWith('src/ok.js'));
  // Direction 2: the real tree passes — otherwise the gate is red on arrival
  // and trains people to ignore it.
  const real = audit(realFiles(), (f) => readFileSync(f, 'utf8'));
  console.log(`self-test: over-lines caught=${fatHit} over-length caught=${wideHit} clean passes=${cleanOk}`);
  console.log(real.length === 0 ? 'self-test: real tree within budget' : real.join('\n'));
  if (fatHit && wideHit && cleanOk && real.length === 0) {
    console.log('SELF-TEST PASS — the gate bites and the tree is within its ceilings');
    process.exit(0);
  }
  console.error('SELF-TEST FAIL');
  process.exit(1);
}

const breaches = audit(realFiles(), (f) => readFileSync(f, 'utf8'));
if (breaches.length) {
  console.error('FILE BUDGET EXCEEDED (D8 — modularize, do not trim comments):');
  for (const b of breaches) console.error(`  ${b}`);
  process.exit(1);
}
console.log(`✓ ${realFiles().length} files within the D8 budget`);
