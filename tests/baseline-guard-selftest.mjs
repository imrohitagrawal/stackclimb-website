/* Proves the DEF-59 baseline write guard can actually fail, and that all three
   of its wiring points are connected. gates.yml runs this in the cheap job.

   Why a self-test and not a Playwright spec: the guard's job is to refuse a
   write on a developer's LAPTOP, so CI never exercises it in anger — CI is the
   one machine it always lets through. Left unproved it would be a gate nobody
   has seen fail, which this repo has been bitten by before (geometry-selftest
   .mjs exists for the same reason, and DEF-57 records a self-test wired into
   nothing).

   Four directions. 1 and 2 live in tests/lib/baseline-guard-cases.mjs and run
   on injected fixtures, so the Linux condition is drivable from a Mac. 3 drives
   the REAL git lookup, including the failure branch, so the fixtures cannot
   drift from what git actually does. 4 exercises the three call sites rather
   than grepping for them.

   RED WHEN: delete the `resolveGeometryTarget` call from writeBaseline(), the
   `assertSnapshotUpdateAllowed` call from playwright.config.js, or the
   `updateSnapshots: snapshotUpdateMode(...)` line from the same file; or make
   any guard return instead of throwing on a tracked target; or query `path`
   instead of the resolved `target`; or hardcode a platform in the snapshot
   pathspec. Every one of those was run against this file — the last three
   because a review round found them passing, which is why the fixtures now
   answer the question they are asked. */

import { readFileSync, writeFileSync, linkSync, unlinkSync, existsSync } from 'node:fs';
import { resolveGeometryTarget, assertSnapshotUpdateAllowed, trackedPaths } from './lib/baseline-write-guard.mjs';
import { bites, allows, LAPTOP } from './lib/baseline-guard-cases.mjs';

const results = [];
const check = (name, ok, detail = '') => {
  results.push({ name, ok });
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${name}${detail ? ` — ${detail}` : ''}`);
};
const run = ([name, fn]) => {
  try {
    check(name, fn() === true);
  } catch (e) {
    check(name, false, `threw: ${e.message.split('\n')[0]}`);
  }
};
const refuses = (fn) => {
  try {
    fn();
    return false;
  } catch (e) {
    return /refusing/.test(e.message);
  }
};

for (const c of bites) run(c);
for (const c of allows) run(c);

/* ── Direction 3: the real git lookup ─────────────────────────────────────
   The partner check first. Everything above runs on fixtures, and a
   fixture-only suite would pass just as happily if git tracked nothing at all
   — a guard over an empty population certifies sameness, not correctness. */

const realGeometry = trackedPaths('tests/geometry-baseline.*.json') ?? [];
const realSnapshots = trackedPaths('tests/*.spec.js-snapshots/*-linux.png') ?? [];

check(
  'the population is not empty — git really tracks the files being protected',
  realGeometry.length > 0 && realSnapshots.length > 0,
  `${realGeometry.length} geometry baseline(s), ${realSnapshots.length} linux snapshot(s)`,
);

check(
  'the real tracked geometry baseline is refused on a laptop',
  realGeometry.length > 0 && realGeometry.every((p) => refuses(() => resolveGeometryTarget({ path: p, env: LAPTOP }))),
  realGeometry.join(', '),
);

check(
  'the real tracked linux snapshots are refused on a laptop',
  refuses(() => assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'linux', env: LAPTOP })),
  `${realSnapshots.length} files`,
);

/* git pathspecs are cwd-relative, and the lookup used to inherit whatever
   directory the process happened to start in. `cd tests && npx playwright test
   --config ../playwright.config.js --update-snapshots=all` then found nothing
   tracked and the guard waved the write through. Found by a cross-model review.
   Asserting from a different cwd is the check that keeps the fix honest. */
const here = process.cwd();
process.chdir('tests');
const fromElsewhere = trackedPaths('tests/*.spec.js-snapshots/*-linux.png') ?? [];
process.chdir(here);
check(
  'the lookup is anchored to the repo, not to the current directory',
  fromElsewhere.length === realSnapshots.length && realSnapshots.length > 0,
  `${fromElsewhere.length} from tests/, ${realSnapshots.length} from the root`,
);

/* Drives the catch block for real rather than through a fixture. An invalid
   pathspec magic makes git exit non-zero, which is the same shape as git being
   absent. It used to return [] here, which reads as "nothing is tracked" and is
   permission to write. */
check(
  'a git lookup that fails returns null, not an empty list',
  trackedPaths(':(nosuchmagic)anything') === null,
);

/* A hard link is a second name for the same bytes, and git answers about
   names, so this is the case the guard's dev+ino comparison exists for. A
   symlink and, on a case-insensitive volume, a different spelling are the same
   mechanism; the hard link is used here because it behaves identically on every
   filesystem, including the Linux runner this has to pass on.

   The name is dedicated to this check and it is only removed if this check
   created it. The first version reused `geometry-baseline.local.json` — the
   scratch name the guard's own message recommends — and deleted it in the
   finally whether or not it had made it, so running the self-test destroyed a
   developer's working file. Found by a cross-model review. */
const ALIAS = 'tests/geometry-baseline.selftest-alias.json';
let aliasRefused = false;
let mine = false;
try {
  if (!existsSync(ALIAS) && realGeometry.length > 0) {
    linkSync(realGeometry[0], ALIAS);
    mine = true;
    aliasRefused = refuses(() => resolveGeometryTarget({ path: ALIAS, env: LAPTOP }));
  }
} finally {
  if (mine && existsSync(ALIAS)) unlinkSync(ALIAS);
}
check('a hard link pointed at the committed baseline is refused', aliasRefused, ALIAS);

/* ── Direction 4: the call sites ──────────────────────────────────────────
   A guard nothing calls is DEF-57 with a different name.

   writeBaseline() is driven against the real committed baseline: if the guard
   is wired it throws before touching disk. The bytes are read first and
   restored in a finally, so the one case where this file could damage the tree
   — someone having removed the guard — repairs itself and still reports FAIL.
   `git checkout -- tests/geometry-baseline.linux.json` is the manual undo if a
   crash ever lands between the two.

   Both call sites read process.env directly, and this file runs ON a runner in
   gates.yml — where the guard is supposed to say yes. So GITHUB_ACTIONS is
   cleared for the length of this section and put back afterwards. Without that
   the checks below would pass on a laptop and fail in CI, which is the worst
   possible way round. */

const realGitHubActions = process.env.GITHUB_ACTIONS;

/* Both directions at the writeBaseline call site, because only the pair pins
   down that it passes the REAL environment. Hardcoding `env: {}` there refuses
   on a runner and breaks gates.yml's regeneration — the one path that must not
   break — and the refuse-only check could not see it. Found by a mutation
   reviewer. The runner arm really does write, so the bytes are captured first
   and restored in a finally that covers both calls. */
const { writeBaseline } = await import('./lib/geometry-baseline-io.mjs');
const victim = realGeometry[0];
const before = victim ? readFileSync(victim) : null;
let wired = false;
let runnerAllowed = false;
try {
  process.env.GITHUB_ACTIONS = 'true';
  runnerAllowed = Boolean(victim) && !refuses(() => writeBaseline(victim, {}, new Set()));
  delete process.env.GITHUB_ACTIONS;
  wired = Boolean(victim) && refuses(() => writeBaseline(victim, {}, new Set()));
} finally {
  delete process.env.GITHUB_ACTIONS;
  if (before && !readFileSync(victim).equals(before)) writeFileSync(victim, before);
}
check('writeBaseline() consults the guard', wired, victim);
check('writeBaseline() passes the real environment — a runner is still allowed to write', runnerAllowed);

/* playwright.config.js runs before any test and it is a plain module, so it can
   be imported with a doctored argv. process.platform is forced to linux because
   that is the condition under test and this machine is not it.

   The CLEAN import comes first and asserts the config's resolved
   updateSnapshots. That line is the half of the PNG fix no command line
   reveals, and deleting it left every check green until a review round caught
   it. The refusing import follows with a cache-busting query, because a module
   that throws while evaluating stays cached as an error and would otherwise
   report the first import's outcome. */
const realPlatform = process.platform;
const realArgv = process.argv;
Object.defineProperty(process, 'platform', { value: 'linux', configurable: true });
let pinned = null;
let configWired = false;
let configRunnerOk = false;
try {
  /* The runner arm first, and the same reasoning as above: hardcoding `env: {}`
     at the config call site throws on a runner with --update-snapshots=all,
     which is exactly what the sanctioned visual regeneration runs. */
  process.env.GITHUB_ACTIONS = 'true';
  process.argv = [...realArgv, '--update-snapshots=all'];
  await import('../playwright.config.js?runner=1');
  configRunnerOk = true;
  delete process.env.GITHUB_ACTIONS;
  process.argv = realArgv;
  pinned = (await import('../playwright.config.js')).default.updateSnapshots;
  process.argv = [...realArgv, '--update-snapshots=all'];
  await import('../playwright.config.js?refuse=1');
} catch (e) {
  configWired = /refusing/.test(e.message);
} finally {
  Object.defineProperty(process, 'platform', { value: realPlatform, configurable: true });
  process.argv = realArgv;
  if (realGitHubActions !== undefined) process.env.GITHUB_ACTIONS = realGitHubActions;
}
check('playwright.config.js refuses an update flag', configWired);
check('playwright.config.js passes the real environment — a runner is not blocked', configRunnerOk);
check(
  'playwright.config.js pins updateSnapshots where this platform has committed snapshots',
  pinned === 'none',
  `resolved to ${pinned}`,
);

const failed = results.filter((r) => !r.ok);
if (failed.length) {
  console.error(`\nSELF-TEST FAIL — ${failed.length} of ${results.length} checks failed`);
  process.exit(1);
}
console.log(`\nSELF-TEST PASS — ${results.length} checks; the guard bites and the sanctioned path stays open`);
