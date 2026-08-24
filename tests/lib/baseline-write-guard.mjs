/* DEF-59. A committed baseline may only be written by a GitHub runner.

   THE DEFECT THIS REMOVES. `tests/geometry-baseline.linux.json` is tracked;
   every other platform's file is gitignored. On a Mac the documented local
   command writes `geometry-baseline.darwin.json`, which nothing reads and
   nobody commits. On LINUX the identical command writes the committed
   authority, and until this file existed the only thing standing between that
   command and a laundered layout change was a sentence in a header comment.
   Worse, the run does not look wrong: geometry.spec.js skips its comparisons
   while UPDATE_GEOMETRY is set, so the developer sees a green-looking run that
   has just overwritten the gate. The PNG baselines have the same asymmetry —
   `*-darwin.png` ignored, `*-linux.png` tracked — and it has already bitten
   once, in reverse: commit d25b0fc, "Remove 54 laptop-generated visual
   baselines committed in error".

   THE KEY IS TRACKED-NESS, NOT THE PLATFORM. .gitignore's own comment argues
   this case: naming platforms one at a time "left any future one tracked by
   default, which is the wrong direction for a rule whose whole point is that
   only the linux file may be committed". So this file never mentions linux. It
   asks git whether the bytes it is about to write are under version control,
   and refuses if they are. A win32 baseline someone commits next year is
   protected the day it is committed, with no edit here.

   WHY GITHUB_ACTIONS AND NOT CI. `CI=true` is exported by many local tools and
   by shell profiles — playwright.config.js already reads it for an unrelated
   purpose — so keying the exemption on it hands the exemption to anyone whose
   machine happens to set it. `GITHUB_ACTIONS` is set only by a GitHub-hosted
   runner, which is the only place the sanctioned regeneration runs. GitHub
   documents it as "always set to true when GitHub Actions is running the
   workflow"; the value is compared loosely because a false NEGATIVE here would
   break gates.yml's workflow_dispatch regeneration, which is the one path that
   must never break.

   WHAT THIS DOES NOT DO, said here rather than left to be discovered. It stops
   a WRITE. It does not inspect a COMMIT, so it cannot see a baseline that was
   hand-edited, pulled in with `git checkout other-branch -- <path>`, or copied
   out of the wrong run's artifact. A commit-time provenance gate would cover
   those and is filed separately (docs/STATUS.md, D117) rather than bundled in,
   because every design for it needs a human-supplied escape that CI cannot
   verify today — the workflow's `permissions:` block grants `actions: none`.

   Every function takes its git lookup and its environment as arguments so the
   self-test can drive both directions without a tree and without a Linux box.
   tests/baseline-guard-selftest.mjs is that self-test; gates.yml runs it. */

import { execFileSync } from 'node:child_process';

/* Ask git which paths matching this pathspec are tracked. Returns null — not
   an empty list — when the question cannot be answered, so a caller can tell
   "nothing is tracked" apart from "there is no git here". The difference
   matters: the first is permission to write, the second is not. */
export function trackedPaths(pathspec) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--', pathspec], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

/* Loose on purpose. A false negative would refuse the write on a real runner
   and break the only sanctioned way to refresh a baseline; a false positive
   needs someone to export GITHUB_ACTIONS on their laptop, which is a
   deliberate, incriminatingly-named act rather than an accident. */
export const onGitHubRunner = (env) =>
  ['true', '1', 'yes'].includes(String(env.GITHUB_ACTIONS ?? '').toLowerCase());

const SANCTIONED =
  'Refresh it through gates.yml\'s workflow_dispatch instead: run the workflow with\n' +
  '  update_geometry_baseline (or update_visual_baselines) checked, download the\n' +
  '  artifact, and commit the file it produced.';

class BaselineWriteRefused extends Error {}

/* Where a geometry baseline write may land, or a throw saying why it may not.
   GEOMETRY_BASELINE_OUT is the escape a Linux developer needs and a Mac
   developer already has for free: point the write at a path git is not
   tracking and the local loop works again. `tests/geometry-baseline.local.json`
   is already covered by .gitignore's `tests/geometry-baseline.*.json` glob, so
   that escape costs no .gitignore change — verified with `git check-ignore -v`.
   The redirect target goes through the SAME tracked check, so it cannot be
   used to aim at a second committed file. */
export function resolveGeometryTarget({ path, env, lsFiles = trackedPaths }) {
  const target = env.GEOMETRY_BASELINE_OUT || path;
  if (onGitHubRunner(env)) return target;

  const tracked = lsFiles(target);
  if (tracked === null) {
    throw new BaselineWriteRefused(
      `refusing to write ${target}: git could not say whether it is tracked, so this run\n` +
        `  cannot tell a local scratch file from the committed authority.\n  ${SANCTIONED}`,
    );
  }
  if (tracked.length > 0) {
    throw new BaselineWriteRefused(
      `refusing to write ${target}: it is TRACKED, which makes it the committed authority\n` +
        '  this gate compares against. A local run would overwrite the gate with whatever the\n' +
        '  page does right now, and the comparisons are skipped while UPDATE_GEOMETRY is set,\n' +
        `  so nothing would look wrong.\n  ${SANCTIONED}\n` +
        '  For a local scratch baseline instead:\n' +
        '    GEOMETRY_BASELINE_OUT=tests/geometry-baseline.local.json UPDATE_GEOMETRY=1 \\\n' +
        '      npx playwright test tests/geometry.spec.js --workers=1',
    );
  }
  return target;
}

/* Playwright writes the PNG baselines itself, so there is no call site of ours
   to guard. The config file is the seam: it is evaluated before any test runs
   and it can read the full command line. Verified by experiment, not assumed —
   a scratch config printed process.argv and saw `--update-snapshots=all` and
   the `-u` shorthand exactly as typed. */
export const wantsSnapshotUpdate = (argv) =>
  argv.some((a) => a === '-u' || a === '--update-snapshots' || a.startsWith('--update-snapshots='));

const snapshotPathspec = (platform) => `tests/*.spec.js-snapshots/*-${platform}.png`;

/* Throws when an explicit -u / --update-snapshots would rewrite snapshots that
   are tracked for THIS platform. Returns the reason it allowed the run
   otherwise, which the self-test asserts on so "allowed" cannot be confused
   with "never checked". */
export function assertSnapshotUpdateAllowed({ argv, platform, env, lsFiles = trackedPaths }) {
  if (!wantsSnapshotUpdate(argv)) return 'no-update-requested';
  if (onGitHubRunner(env)) return 'github-runner';

  const tracked = lsFiles(snapshotPathspec(platform));
  if (tracked === null) {
    throw new BaselineWriteRefused(
      `refusing --update-snapshots: git could not say which ${platform} snapshots are\n` +
        `  tracked, so this run cannot tell local scratch files from committed ones.\n  ${SANCTIONED}`,
    );
  }
  if (tracked.length > 0) {
    throw new BaselineWriteRefused(
      `refusing --update-snapshots: ${tracked.length} ${platform} snapshot(s) are TRACKED and\n` +
        '  would be overwritten with this machine\'s render. A different OS rasterizes the same\n' +
        `  fonts differently, so the result is not the file CI reads.\n  ${SANCTIONED}`,
    );
  }
  return 'untracked';
}

/* The other half of the PNG story, and the one no command line reveals.
   Playwright's default updateSnapshots is 'missing': a bare `npx playwright
   test` with no flags WRITES any snapshot that does not exist yet and passes.
   Add a plate on Linux and a laptop-rendered `-linux.png` appears, untracked,
   ready for the next `git add -A`. Pinning 'none' turns that silent write into
   a loud failure — but only where tracked snapshots for this platform already
   exist, so a Mac's first run still seeds its own gitignored `-darwin.png`
   set, and a runner is never touched. */
export function snapshotUpdateMode({ platform, env, lsFiles = trackedPaths }) {
  if (onGitHubRunner(env)) return undefined;
  const tracked = lsFiles(snapshotPathspec(platform));
  return tracked && tracked.length > 0 ? 'none' : undefined;
}
