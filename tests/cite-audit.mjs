// The citation-form gate: a comment may cite a FILE, never a line inside it.
//
// WHY (DEF-71, RCA-007, RCA-018). A filename followed by a colon and a line number is a claim
// about another file that nothing revalidates; RCA-007 measured 57% already wrong. Citing the
// file stays legal; citing a line stops being possible, and the count cannot climb again.
//
// SCOPE IS THE OWNER'S RULING, 2026-08-27: sweep-and-gate on CODE ONLY. docs/ is absent from
// ROOTS (tests/lib/cite-audit-core.mjs) on purpose — see docs/contracts/cite-audit.md (e).
//
// REBUILT (RCA-018) against the converged contract after the old `cite-audit` branch queued
// itself on two CRITICAL_BLOCKERs: C1, the exemption identity dropped the citing PATH so a
// basename collision could hide a new breach behind an old exemption; C2, the self-test never
// drove the script's own exit decision, so a `breaches.length` → `breaches.lenght` typo passed
// 18 green assertions while a live breach went through with exit 0. A round-1 `codex exec
// --sandbox read-only` review found the FIRST attempt at C1 (a per-line SET of hits) still let a
// same-basename path swap through unnoticed, because the identity was still built from the
// regex's own already-truncated match. Fixed in tests/lib/cite-audit-core.mjs by keying
// exemption on the RAW LINE TEXT instead — see that file's EXEMPT comment. C2's fix is one
// shared `hasBreach()` predicate plus an end-to-end subprocess partner below.
//
// WHAT THIS CANNOT CATCH — disclosed, not fixed, per docs/contracts/cite-audit.md:
//   truth-checking a surviving citation; prose forms ("line 82", "#L82"); a citation glued to a
//   URL with no whitespace; a nested `.githooks/<subdir>/` path; same-line duplicate hits
//   collapsing to one identity slot; a partial subtree silently dropped from ROOTS; CI wiring
//   that pipes the real run through `--self-test` only or `|| true`.
//
// SELF-TEST. `--self-test` runs six partners over a mix of virtual and real fixtures, because a
// bare "breaches is empty" counts zero of anything.

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, unlinkSync, existsSync } from 'node:fs';
import {
  ROOTS, FLOOR, NAMED, EXEMPT, audit, citationsIn, hasBreach, scanFiles, readReal,
} from './lib/cite-audit-core.mjs';
import {
  FORM_FIXTURES, TRUNCATION_FIXTURES, EXEMPT_CASES, REQUIRED_FIXTURES,
} from './lib/cite-audit-fixtures.mjs';

function report(label, rows) {
  for (const [n, ok] of rows) console.log(`  ${ok ? 'PASS' : 'FAIL'}  ${label}: ${n}`);
  return rows.every(([, ok]) => ok);
}

/* Partner 6 — the end-to-end exit code, driven against the REAL script via a subprocess, over
   an untracked fixture file so `git ls-files -co` picks it up without ever being `git add`ed.
   This is the direct answer to C2: nothing here stands in for the real exit path.
   Round-1 review: the first version wrote this file unconditionally and could clobber and then
   DELETE a pre-existing file of the same name. `wx` (exclusive create) makes that a loud crash
   instead of silent data loss, and cleanup runs in `finally` so a mid-test throw still removes
   only the file THIS run created. */
function endToEnd() {
  const fixture = 'tests/__cite_audit_e2e_fixture__.mjs';
  if (existsSync(fixture)) {
    throw new Error(`${fixture} already exists — refusing to touch it. Remove it and re-run.`);
  }
  // Assembled at runtime, never written literally: this file is inside its own scan set.
  const unique = 'controlled-e2e-breach.js' + ':' + '1';
  let breachCaught = false;
  let breachStderr = '';
  try {
    writeFileSync(fixture, `// seeded for the cite-audit self-test only: ${unique}\n`, { flag: 'wx' });
    try {
      execSync('node tests/cite-audit.mjs', { encoding: 'utf8', stdio: 'pipe' });
    } catch (e) {
      breachCaught = e.status === 1;
      breachStderr = String(e.stderr || '');
    }
  } finally {
    if (existsSync(fixture)) unlinkSync(fixture);
  }
  let cleanOk = false;
  try {
    execSync('node tests/cite-audit.mjs', { encoding: 'utf8', stdio: 'pipe' });
    cleanOk = true;
  } catch {
    cleanOk = false;
  }
  return [
    ['seeded breach exits 1', breachCaught],
    ['seeded breach is named in stderr', breachStderr.includes(unique)],
    ['fixture removed, real tree exits 0', cleanOk],
  ];
}

if (process.argv.includes('--self-test')) {
  const forms = FORM_FIXTURES.map(([n, line, want]) => [n, citationsIn(line).length === want]);
  const truncations = TRUNCATION_FIXTURES.map(([n, line, wantHit]) => {
    const hits = citationsIn(line);
    return [n, hits.length === 1 && hits[0] === wantHit];
  });
  const exemptCases = EXEMPT_CASES.map((c) => {
    const files = { [c.file]: c.lines.join('\n') };
    const got = audit([c.file], (f) => files[f], c.exempt);
    return [c.id, got.length === c.wantBreaches];
  });

  const files = scanFiles();
  const bigEnough = files.length >= FLOOR;
  const named = NAMED.map((f) => [f, files.includes(f)]);

  /* Real-table liveness: THIS exact line text is still on THIS exact line, byte for byte — not
     "a citation is still somewhere on it", which would pass on a neighbour or a swapped path.
     Also cross-checks `cites` (the human-readable summary) actually appears in `text`, so the
     two fields cannot silently drift apart from each other. */
  const live = EXEMPT.map((e) => {
    let text = '';
    try { text = readFileSync(e.file, 'utf8').split('\n')[e.line - 1] || ''; } catch { text = ''; }
    const textOk = text === e.text;
    const citesOk = e.cites.every((c) => citationsIn(e.text).includes(c));
    return [`${e.file}:${e.line}`, textOk && citesOk];
  });

  const allIds = [
    ...FORM_FIXTURES.map((f) => f[0]), ...TRUNCATION_FIXTURES.map((f) => f[0]),
    ...EXEMPT_CASES.map((c) => c.id),
  ];
  const idsUnique = new Set(allIds).size === allIds.length;

  const control = audit(['x.js'], () => 'controlled-breach.js' + ':' + '1', []);
  const predicate = [
    ['hasBreach(1 seeded) === true', hasBreach(control) === true && control.length === 1],
    ['hasBreach([]) === false', hasBreach([]) === false],
  ];

  const okForms = report('form', forms);
  const okTrunc = report('truncated hit', truncations);
  const okExempt = report('exemption case', exemptCases);
  console.log(`  ${bigEnough ? 'PASS' : 'FAIL'}  scan set floor: ${files.length} (need ${FLOOR})`);
  const okNamed = report('scan set contains', named);
  const okLive = report('exemption still live', live);
  const okPredicate = report('exit predicate', predicate);
  const okE2E = report('end-to-end subprocess', endToEnd());

  const fixtureCount = FORM_FIXTURES.length + TRUNCATION_FIXTURES.length + EXEMPT_CASES.length;
  // EXACT, not a floor: a floor lets fixtures vanish until the count merely clears it (round-1
  // review, finding 5). REQUIRED_FIXTURES is bumped by hand in the same change as any addition.
  const countMet = fixtureCount === REQUIRED_FIXTURES;
  console.log(`  ${countMet ? 'PASS' : 'FAIL'}  fixture count: ${fixtureCount} (need exactly ${REQUIRED_FIXTURES})`);
  console.log(`  ${idsUnique ? 'PASS' : 'FAIL'}  fixture ids are unique: ${allIds.length} ids`);

  const all = okForms && okTrunc && okExempt && bigEnough && okNamed && okLive
    && okPredicate && okE2E && countMet && idsUnique;
  console.log(all ? 'SELF-TEST PASS — the scanner bites, the exit decision bites, the table is live'
    : 'SELF-TEST FAIL');
  process.exit(all ? 0 : 1);
}

const breaches = audit(scanFiles(), readReal);
if (hasBreach(breaches)) {
  console.error('CITATION FORM BREACH (DEF-71 — cite the file, never a line inside it):');
  for (const b of breaches) console.error(`  ${b.file}:${b.line}  ${b.hit}`);
  console.error(`${breaches.length} breaches. Drop the number and keep the filename.`);
  process.exit(1);
}
console.log(`✓ ${scanFiles().length} files scanned, ${ROOTS.length} roots, no line-number citations`);
