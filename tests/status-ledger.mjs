// DEF-77 — a gate that fails when two docs/STATUS.md rows claim the same
// ledger id. Exit 1 on any breach.
//
// Why: two parallel worktrees both computed "next free" ids from the same
// base and both independently claimed D164/D165/DEF-77 for unrelated
// content (docs/STATUS.md row DEF-77, docs/rca/RCA-020). Neither branch had
// merged, so nothing corrupted, but nothing would have stopped it either.
// AGENTS.md's own rule: "If a rule must ALWAYS hold, put it in CI/hooks,
// not in a doc." This is that. CI-only, matching tests/file-budget.mjs and
// tests/cite-audit.mjs — no pre-commit hook runs a full-tree scan; the
// hook only runs staged-file checks (no-pii --staged, secrets, inbox).
//
// Contract (full version: docs/rca/RCA-020-ledger-id-collision-gate.md):
//   - Population: a row's id is its FIRST table cell, matched at the start
//     of a physical line: /^\| *(id) *\|/. An id mentioned in prose or an
//     evidence column elsewhere in the file is NOT a row id.
//   - id shape: D<digits> or DEF-<digits>, optionally wrapped in Markdown
//     strikethrough (~~id~~) — this file's own convention for closed rows.
//   - Duplicate: the same id (strikethrough stripped) is the first cell of
//     TWO OR MORE rows, UNLESS every one of those rows is struck through
//     (round-1 review found "any struck exempts" too permissive — see below).
//   - OUT OF SCOPE, on purpose: a fenced (```) code block containing a
//     pipe-shaped line. Round 1 raised this as ADVISORY_DEBT and a first
//     attempt added fence tracking; round 2 review found that tracking
//     itself introduces a CRITICAL_BLOCKER — a line inside a real fence
//     that itself starts with three backticks but isn't a valid CommonMark
//     closing delimiter (e.g. an example fence nested in documentation)
//     desyncs the naive open/close toggle and can hide a REAL duplicate
//     past it. A correct fix needs a real CommonMark-aware parser, which is
//     disproportionate to this gate's actual population: verified today
//     that `docs/STATUS.md`'s one fenced block (the D12 install list) never
//     contains a line matching the row-id shape. Per the review-triage rule
//     "do not expand scope solely to satisfy advisory feedback," the fence
//     handling was REVERTED rather than patched further — removing the
//     feature removes the bug it introduced. If a future STATUS.md fence
//     ever contains a real id-shaped line, this gate will not see inside it;
//     that is a named, accepted residual, not a silent gap.
//
// Self-test: --self-test proves four directions without touching the tree
// outside a unique OS temp directory (cleaned up in a `finally`, so it
// survives a thrown assertion): an active duplicate is caught, the real
// DEF-8 split is not flagged, a closed id cannot be silently reused by a
// new active row, and a prose cross-reference to another row's id is not
// mistaken for a second row claiming it — plus a subprocess run that drives
// the real plain-mode exit branch (round-1 review found the in-process
// fixtures alone never exercised the `if (breaches.length)` exit decision
// the script actually ships with).
// Real-tree mutation that turns it red: retarget any active row's leading
// id to match another active row's id (e.g. change "| D173 |" to "| D174 |").

import { readFileSync, writeFileSync, mkdtempSync, rmSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROW_ID = /^\| *(~~)?(D\d+|DEF-\d+)(~~)? *\|/;

/**
 * @param {string} text  the full contents of a STATUS.md-shaped file
 * @returns {string[]}   breach descriptions, empty if none
 */
function findDuplicates(text) {
  const occurrences = new Map(); // id -> [{ line, struck }]

  const lines = text.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const m = ROW_ID.exec(lines[i]);
    if (!m) continue;
    const struck = Boolean(m[1] && m[3]);
    const id = m[2];
    if (!occurrences.has(id)) occurrences.set(id, []);
    occurrences.get(id).push({ line: i + 1, struck });
  }

  const breaches = [];
  for (const [id, rows] of occurrences) {
    if (rows.length < 2) continue;
    if (rows.every((r) => r.struck)) continue; // a legitimate closed split
    const at = rows.map((r) => r.line).join(', ');
    breaches.push(`${id} claimed by rows at lines ${at}`);
  }
  return breaches;
}

function runGateOn(filePath) {
  // Drives the REAL plain-mode entry point (the exit-decision branch below)
  // as a subprocess, not the in-process function — proves the shipped exit
  // code, not just the shipped logic.
  try {
    execFileSync('node', ['tests/status-ledger.mjs', filePath], { stdio: 'pipe' });
    return 0;
  } catch (e) {
    return e.status ?? 1;
  }
}

if (process.argv.includes('--self-test')) {
  // Direction 1: an active duplicate is caught.
  const dup = '| D999 | first claim |\n| D999 | second claim, different content |\n';
  const dupCaught = findDuplicates(dup).some((b) => b.startsWith('D999 claimed'));

  // Direction 2: the real DEF-8 split (both struck through) is NOT flagged.
  const closedSplit = '| ~~DEF-8~~ | closed one |\n| ~~DEF-8~~ | closed two, see above |\n';
  const closedClean = findDuplicates(closedSplit).length === 0;

  // Direction 3: a closed id reused by a new active row IS flagged — the
  // hole round-1 review found in the first cut of this contract.
  const reused = '| ~~D42~~ | closed thing |\n| D42 | brand new unrelated thing |\n';
  const reusedCaught = findDuplicates(reused).some((b) => b.startsWith('D42 claimed'));

  // Direction 4: a prose cross-reference to another row's id is not
  // mistaken for a second row claiming that id.
  const crossRef = '| D164 | some fix | cites D164 again in prose, and DEF-77 too |\n';
  const crossRefClean = findDuplicates(crossRef).length === 0;

  // Direction 5: the real plain-mode exit branch, driven as a subprocess
  // against a synthetic duplicate file — proves the SHIPPED exit code, so a
  // typo like `breaches.length` -> `breaches.length > 999` cannot pass.
  // A unique tmpdir plus `finally` (round-2 review: fixed filenames with no
  // `finally` could leak, collide, or truncate a real file on a thrown
  // assertion) keeps this "without touching the tree" even on failure.
  const dir = mkdtempSync(join(tmpdir(), 'status-ledger-selftest-'));
  let dupExit, cleanExit;
  try {
    const tmpDup = join(dir, 'dup.md');
    writeFileSync(tmpDup, dup);
    dupExit = runGateOn(tmpDup);
    const tmpClean = join(dir, 'clean.md');
    writeFileSync(tmpClean, '| D1 | fine |\n| D2 | also fine |\n');
    cleanExit = runGateOn(tmpClean);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
  const exitCodesCorrect = dupExit === 1 && cleanExit === 0;

  console.log(
    `self-test: active-dup caught=${dupCaught} struck-through split ignored=${closedClean} ` +
      `reused-closed-id caught=${reusedCaught} prose cross-ref ignored=${crossRefClean} ` +
      `subprocess exit codes correct=${exitCodesCorrect} (dup=${dupExit}, clean=${cleanExit})`,
  );

  const real = findDuplicates(readFileSync('docs/STATUS.md', 'utf8'));
  console.log(real.length === 0 ? 'self-test: real STATUS.md has no duplicate active ids' : real.join('\n'));

  if (dupCaught && closedClean && reusedCaught && crossRefClean && exitCodesCorrect && real.length === 0) {
    console.log('SELF-TEST PASS — the gate bites and docs/STATUS.md is clean');
    process.exit(0);
  }
  console.error('SELF-TEST FAIL');
  process.exit(1);
}

const target = process.argv[2] && !process.argv[2].startsWith('--') ? process.argv[2] : 'docs/STATUS.md';
const breaches = findDuplicates(readFileSync(target, 'utf8'));
if (breaches.length) {
  console.error(`DUPLICATE LEDGER IDS IN ${target} (DEF-77 — renumber one of them):`);
  for (const b of breaches) console.error(`  ${b}`);
  process.exit(1);
}
console.log(`✓ ${target} has no duplicate active ledger ids`);
