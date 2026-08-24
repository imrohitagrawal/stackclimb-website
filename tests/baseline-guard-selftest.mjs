/* Proves the DEF-59 baseline write guard can actually fail, and that both of
   its call sites are wired to it. gates.yml runs this in the cheap job.

   Why a self-test and not a Playwright spec: the guard's whole job is to refuse
   a write on a developer's LAPTOP, so CI never exercises it in anger — CI is
   the one machine the guard always lets through. Left unproved, it would be a
   gate nobody has ever seen fail, which this repo has been bitten by before
   (geometry-selftest.mjs exists for the same reason, and DEF-57 records a
   self-test that was written and wired into nothing).

   The interesting direction is Linux, and this runs on a Mac. Both are covered
   because the guard takes its git lookup and its environment as arguments, so
   the Linux condition is reproducible anywhere: a lookup that says "tracked".
   Direction 3 then re-checks the same logic against the REAL tree, so the
   fixtures cannot drift away from what git actually reports.

   RED WHEN: delete the `resolveGeometryTarget` call from writeBaseline(), or
   the `assertSnapshotUpdateAllowed` call from playwright.config.js, or make
   either guard return instead of throwing on a tracked target. Watched, not
   assumed — see docs/STATUS.md D117 for the run output. */

import { readFileSync, writeFileSync } from 'node:fs';
import {
  resolveGeometryTarget,
  assertSnapshotUpdateAllowed,
  snapshotUpdateMode,
  trackedPaths,
  wantsSnapshotUpdate,
} from './lib/baseline-write-guard.mjs';

const LAPTOP = {}; // no GITHUB_ACTIONS
const RUNNER = { GITHUB_ACTIONS: 'true' };
const TRACKED = () => ['tests/geometry-baseline.linux.json'];
const UNTRACKED = () => [];
const NO_GIT = () => null;

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok, detail });
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};

const refuses = (fn) => {
  try {
    fn();
    return false;
  } catch (e) {
    return /refusing/.test(e.message);
  }
};

/* ── Direction 1: the guard bites ─────────────────────────────────────────
   Each of these is the real defect, reproduced with an injected lookup. */

check(
  'geometry: a tracked target on a laptop is refused',
  refuses(() => resolveGeometryTarget({ path: 'tests/geometry-baseline.linux.json', env: LAPTOP, lsFiles: TRACKED })),
);

const AIMED_AT_TRACKED = { GEOMETRY_BASELINE_OUT: 'tests/geometry-baseline.linux.json' };
check(
  'geometry: the GEOMETRY_BASELINE_OUT escape cannot aim at a tracked file either',
  refuses(() =>
    resolveGeometryTarget({ path: 'tests/geometry-baseline.darwin.json', env: AIMED_AT_TRACKED, lsFiles: TRACKED }),
  ),
);

check(
  'geometry: an unanswerable git lookup is refused, not waved through',
  refuses(() => resolveGeometryTarget({ path: 'tests/geometry-baseline.linux.json', env: LAPTOP, lsFiles: NO_GIT })),
);

check(
  'snapshots: -u against tracked snapshots on a laptop is refused',
  refuses(() => assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'linux', env: LAPTOP, lsFiles: TRACKED })),
);

const UPDATE_ALL = ['--update-snapshots=all'];
check(
  'snapshots: --update-snapshots=all is refused the same way',
  refuses(() => assertSnapshotUpdateAllowed({ argv: UPDATE_ALL, platform: 'linux', env: LAPTOP, lsFiles: TRACKED })),
);

check(
  'snapshots: a bare run on a platform with tracked snapshots cannot silently write a missing one',
  snapshotUpdateMode({ platform: 'linux', env: LAPTOP, lsFiles: TRACKED }) === 'none',
);

/* ── Direction 2: the guard does not over-fire ────────────────────────────
   Direction 1 alone would be satisfied by a guard that refuses everything,
   which would break the only sanctioned way to refresh a baseline. These are
   the cells that must stay open, and the runner cells are the ones that keep
   gates.yml's workflow_dispatch regeneration working. */

check(
  'geometry: an untracked target on a laptop is allowed (the Mac local loop)',
  resolveGeometryTarget({ path: 'tests/geometry-baseline.darwin.json', env: LAPTOP, lsFiles: UNTRACKED }) ===
    'tests/geometry-baseline.darwin.json',
);

const AIMED_AT_LOCAL = { GEOMETRY_BASELINE_OUT: 'tests/geometry-baseline.local.json' };
check(
  'geometry: the local escape path is honoured',
  resolveGeometryTarget({ path: 'tests/geometry-baseline.linux.json', env: AIMED_AT_LOCAL, lsFiles: UNTRACKED }) ===
    'tests/geometry-baseline.local.json',
);

check(
  'geometry: a tracked target ON A RUNNER is allowed — the sanctioned dispatch path',
  resolveGeometryTarget({ path: 'tests/geometry-baseline.linux.json', env: RUNNER, lsFiles: TRACKED }) ===
    'tests/geometry-baseline.linux.json',
);

check(
  'snapshots: --update-snapshots ON A RUNNER is allowed — the sanctioned dispatch path',
  assertSnapshotUpdateAllowed({ argv: UPDATE_ALL, platform: 'linux', env: RUNNER, lsFiles: TRACKED }) ===
    'github-runner',
);

check(
  'snapshots: a run that asked for no update is never blocked',
  assertSnapshotUpdateAllowed({ argv: ['test'], platform: 'linux', env: LAPTOP, lsFiles: TRACKED }) ===
    'no-update-requested',
);

check(
  'snapshots: -u where nothing is tracked for this platform is allowed (the Mac seeding run)',
  assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'darwin', env: LAPTOP, lsFiles: UNTRACKED }) === 'untracked',
);

check(
  'snapshots: a runner keeps Playwright default write-missing behaviour',
  snapshotUpdateMode({ platform: 'linux', env: RUNNER, lsFiles: TRACKED }) === undefined,
);

check(
  'flag parsing does not match an unrelated --update-* option',
  wantsSnapshotUpdate(['--update-source-method=patch']) === false && wantsSnapshotUpdate(['-u']) === true,
);

/* ── Direction 3: the real tree ───────────────────────────────────────────
   The partner check. Everything above runs on fixtures, and a fixture-only
   suite would pass just as happily if git tracked nothing at all — a guard
   over an empty population certifies sameness, not correctness. So: count what
   git really reports, require it to be non-empty, and then re-run the refusal
   against those real paths. */

const realGeometry = trackedPaths('tests/geometry-baseline.*.json') ?? [];
const realSnapshots = trackedPaths('tests/*.spec.js-snapshots/*-linux.png') ?? [];

check(
  'the population is not empty — git really tracks the files being protected',
  realGeometry.length > 0 && realSnapshots.length > 0,
  `${realGeometry.length} geometry baseline(s), ${realSnapshots.length} linux snapshot(s)`,
);

check(
  'the real tracked geometry baseline is refused on a laptop',
  realGeometry.every((p) => refuses(() => resolveGeometryTarget({ path: p, env: LAPTOP }))),
  realGeometry.join(', '),
);

check(
  'the real tracked linux snapshots are refused on a laptop',
  refuses(() => assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'linux', env: LAPTOP })),
  `${realSnapshots.length} files`,
);

check(
  "this machine's own platform is not blocked from its gitignored local baseline",
  trackedPaths(`tests/geometry-baseline.${process.platform}.json`)?.length > 0 ||
    resolveGeometryTarget({ path: `tests/geometry-baseline.${process.platform}.json`, env: LAPTOP }) !== null,
  process.platform,
);

/* ── Direction 4: the call sites ──────────────────────────────────────────
   A guard nothing calls is DEF-57 with a different name, so both call sites
   are EXERCISED rather than grepped for.

   writeBaseline() is driven against the real committed baseline: if the guard
   is wired it throws before touching disk. The bytes are read first and
   restored in a finally, so the one case where this file could damage the tree
   — someone having removed the guard — repairs itself and still reports FAIL.
   `git checkout -- tests/geometry-baseline.linux.json` is the manual undo if a
   crash ever lands between the two.

   Both call sites read process.env directly, and this file runs ON a runner in
   gates.yml — where the guard is supposed to say yes. So GITHUB_ACTIONS is
   cleared for the length of this section and put back afterwards. Without that
   the two checks below would pass on a laptop and fail in CI, which is the
   worst possible way round. */

const realGitHubActions = process.env.GITHUB_ACTIONS;
delete process.env.GITHUB_ACTIONS;

const { writeBaseline } = await import('./lib/geometry-baseline-io.mjs');
const victim = realGeometry[0];
const before = readFileSync(victim);
let wired = false;
try {
  wired = refuses(() => writeBaseline(victim, {}, new Set()));
} finally {
  if (!readFileSync(victim).equals(before)) writeFileSync(victim, before);
}
check('writeBaseline() consults the guard', wired, victim);

/* playwright.config.js runs before any test, and it is a plain module, so it
   can be imported with a doctored argv. process.platform is forced to linux
   because that is the condition under test and this machine is not it. */
const realPlatform = process.platform;
const realArgv = process.argv;
Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
process.argv = [...realArgv, '--update-snapshots=all'];
let configWired = false;
try {
  await import('../playwright.config.js');
} catch (e) {
  configWired = /refusing/.test(e.message);
} finally {
  Object.defineProperty(process, 'platform', { value: realPlatform, configurable: true });
  process.argv = realArgv;
  if (realGitHubActions !== undefined) process.env.GITHUB_ACTIONS = realGitHubActions;
}
check('playwright.config.js consults the guard', configWired);

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nSELF-TEST FAIL — ${failed.length} of ${results.length} checks failed`);
  process.exit(1);
}
console.log(`\nSELF-TEST PASS — ${results.length} checks; the guard bites and the sanctioned path stays open`);
