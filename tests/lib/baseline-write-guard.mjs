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
   purpose — so keying the exemption on it hands the exemption out by accident.
   `GITHUB_ACTIONS` is set whenever GitHub Actions runs a workflow, hosted or
   self-hosted, and by very little else. It is still an ordinary environment
   variable and anyone can export it, which is stated plainly rather than
   dressed up: this exemption is not authorization, it is a way of telling an
   accident apart from a decision. Whether `act` sets it locally is UNVERIFIED
   here — `which act` finds nothing on this machine. The
   value is compared loosely because a false NEGATIVE here would break
   gates.yml's workflow_dispatch regeneration, the one path that must not break.

   WHAT THIS DOES NOT DO. It guards two writers. It is not a proof of where a
   committed baseline came from, and three routes get past it, all of them
   deliberate acts rather than the documented command misfiring:

     - `npx playwright test --ui`, then picking "Update snapshots -> All" in the
       UI. The UI sends the mode to the test server as a command-line override
       after this file has already run, and a CLI override outranks the config.
     - a second Playwright config that does not import this one.
     - a test calling `page.screenshot({ path: testInfo.snapshotPath(...) })`,
       which writes a baseline with no update mode involved at all.
     - an ALIAS on the PNG side. The geometry half compares device and inode, so
       a symlink, a hard link or a case-different spelling is caught. The
       snapshot half asks git about a pathspec and does not, so a gitignored
       `*-darwin.png` linked at a tracked `*-linux.png` is reported untracked
       and `-u` is allowed. Named here rather than quietly fixed, because the
       review round that found it was the second in a row to find this same
       class, and the rule when that happens is to stop and write it down.

   Closing those needs a check on the COMMIT rather than the write. That was
   designed and rejected for now; the reasons are in docs/STATUS.md's rejected
   table, and the short version is that every version of it needs a
   human-supplied escape CI cannot verify, because gates.yml's `permissions:`
   block grants `actions: none`.

   Every function takes its git lookup and its environment as arguments so the
   self-test can drive both directions without a tree and without a Linux box.
   tests/baseline-guard-selftest.mjs is that self-test; gates.yml runs it. */

import { execFileSync } from 'node:child_process';
import { statSync } from 'node:fs';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { wantsSnapshotUpdate } from './snapshot-flags.mjs';

/* git pathspecs are relative to the CWD, not to the repo. A cross-model review
   found the hole that opens: `cd tests && npx playwright test --config
   ../playwright.config.js ... --update-snapshots=all` left the lookup returning
   nothing, so the guard said "untracked" and waved through a write to the real
   tracked files. Playwright resolves its own paths against the CONFIG, so the
   guard has to as well. Pinning the cwd here fixes it once for every caller. */
export const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));

/* Ask git which paths matching this pathspec are tracked. Returns null — not
   an empty list — when the question cannot be answered, so a caller can tell
   "nothing is tracked" apart from "there is no git here". The difference
   matters: the first is permission to write, the second is not. */
export function trackedPaths(pathspec) {
  try {
    const out = execFileSync('git', ['ls-files', '-z', '--', pathspec], {
      cwd: REPO_ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\0').filter(Boolean);
  } catch {
    return null;
  }
}

export const onGitHubRunner = (env) =>
  ['true', '1', 'yes'].includes(String(env.GITHUB_ACTIONS ?? '').toLowerCase());

const SANCTIONED =
  'Refresh it through gates.yml\'s workflow_dispatch instead: run the workflow with\n' +
  '  update_geometry_baseline (or update_visual_baselines) checked, download the\n' +
  '  artifact, and commit the file it produced.';

class BaselineWriteRefused extends Error {}

const refuse = (msg) => {
  throw new BaselineWriteRefused(msg);
};

/* A path is not a file. `git ls-files` answers about the NAME it is given, and
   several different names reach the same bytes: a symlink, a hard link, and —
   on a case-insensitive volume — `tests/GEOMETRY-BASELINE.LINUX.JSON`, which
   git reports as untracked while the OS opens the committed file.

   This compares device and inode, which identifies the FILE. The first version
   compared `realpathSync` output, which identifies the NAME after symlinks
   only, and a second review round proved it through this module's own
   documented escape hatch: `ln tests/geometry-baseline.linux.json
   tests/geometry-baseline.local.json` followed by the GEOMETRY_BASELINE_OUT
   command emptied the committed baseline while the guard said yes. The comment
   at the time claimed the gap was closed. dev+ino closes all three names.

   `ino === 0` is Windows' "not known". Treating that as a match would refuse
   unrelated writes, so it is excluded. A target that does not exist yet cannot
   be an alias, and statSync throws on it, which is why the failure is
   swallowed here rather than raised. */
const sameFile = (a, b) => {
  try {
    const x = statSync(a);
    const y = statSync(b);
    return x.ino !== 0 && x.dev === y.dev && x.ino === y.ino;
  } catch {
    return false;
  }
};

/* Where a geometry baseline write may land, or a throw saying why it may not.
   GEOMETRY_BASELINE_OUT points the write at a path git is not tracking.
   `tests/geometry-baseline.local.json` is already covered by .gitignore's
   `tests/geometry-baseline.*.json` glob, so it costs no .gitignore change —
   verified with `git check-ignore -v`.

   BE PRECISE ABOUT WHAT THAT BUYS, because an earlier version of this comment
   called it "the local loop" and a review proved that wrong. It redirects the
   WRITE only. geometry.spec.js reads BASELINE unconditionally, so every
   comparison still runs against the committed authority — which is the correct
   behaviour and the opposite of the snapshotPathTemplate trap, where moving
   the write moves the read too and the gate ends up grading itself. What a
   developer gets is a scratch file of the numbers this page produces right
   now, to `diff` against the committed one. A Linux developer has no local
   loop, and saying so is better than implying one.
   The redirect target goes through the SAME checks, so it cannot be used to
   aim at a second committed file, or at an alias of one. */
export function resolveGeometryTarget({ path, env, lsFiles = trackedPaths }) {
  /* Resolved ONCE, against the repo, and the resolved path is what is returned.
     A second review round proved why: the guard was checking the string against
     REPO_ROOT while writeBaseline handed the same string to writeFileSync, which
     resolves against process.cwd(). Run from tests/,
     `GEOMETRY_BASELINE_OUT=geometry-baseline.linux.json` had the guard clear a
     root-level path that does not exist while the writer truncated the
     committed baseline. Two roots for one name is the whole bug, and returning
     the resolved path removes it rather than patching the instance — the caller
     can no longer resolve it differently from the checker. */
  const target = resolve(REPO_ROOT, env.GEOMETRY_BASELINE_OUT || path);
  if (onGitHubRunner(env)) return target;

  const named = lsFiles(target);
  const family = lsFiles('tests/geometry-baseline.*.json');
  if (named === null || family === null) {
    refuse(
      `refusing to write ${target}: git could not say whether it is tracked, so this run\n` +
        `  cannot tell a local scratch file from the committed authority.\n  ${SANCTIONED}`,
    );
  }
  const alias = family.find((f) => sameFile(resolve(REPO_ROOT, f), target));
  if (named.length > 0 || alias) {
    refuse(
      `refusing to write ${target}: it is TRACKED${alias && !named.length ? ` — it resolves to ${alias}` : ''},\n` +
        '  which makes it the committed authority this gate compares against. A local run would\n' +
        '  overwrite the gate with whatever the page does right now, and the comparisons are\n' +
        '  skipped while UPDATE_GEOMETRY is set, so nothing would look wrong.\n' +
        `  ${SANCTIONED}\n  For a local scratch baseline instead:\n` +
        '    GEOMETRY_BASELINE_OUT=tests/geometry-baseline.local.json UPDATE_GEOMETRY=1 \\\n' +
        '      npx playwright test tests/geometry.spec.js --workers=1',
    );
  }
  return target;
}

export const snapshotPathspec = (platform) => `tests/*.spec.js-snapshots/*-${platform}.png`;

/* Throws when an explicit update flag would rewrite snapshots that are tracked
   for THIS platform. Returns the reason it allowed the run otherwise, so the
   self-test can tell "allowed" apart from "never checked". */
export function assertSnapshotUpdateAllowed({ argv, platform, env, lsFiles = trackedPaths }) {
  if (!wantsSnapshotUpdate(argv)) return 'no-update-requested';
  if (onGitHubRunner(env)) return 'github-runner';

  const tracked = lsFiles(snapshotPathspec(platform));
  if (tracked === null) {
    refuse(
      `refusing --update-snapshots: git could not say which ${platform} snapshots are\n` +
        `  tracked, so this run cannot tell local scratch files from committed ones.\n  ${SANCTIONED}`,
    );
  }
  if (tracked.length > 0) {
    refuse(
      `refusing --update-snapshots: ${tracked.length} ${platform} snapshot(s) are TRACKED and\n` +
        '  would be overwritten with this machine\'s render. A different OS rasterizes the same\n' +
        `  fonts differently, so the result is not the file CI reads.\n  ${SANCTIONED}`,
    );
  }
  return 'untracked';
}

/* The other half of the PNG story, and the one no command line reveals.
   Playwright's default updateSnapshots is 'missing': a bare `npx playwright
   test` WRITES any snapshot that does not exist yet. It then fails that run —
   an earlier version of this comment said it passes, which a cross-model
   review corrected against the installed 1.62.1 source — but the file is on
   disk either way, and a red first run followed by a green second one is
   exactly how 54 laptop-rendered PNGs reached a commit (d25b0fc). Pinning
   'none' makes the missing snapshot a failure with nothing written.

   Only where tracked snapshots for this platform already exist, so a Mac's
   first run still seeds its own gitignored `-darwin.png` set. A runner is
   never touched. An unanswerable git lookup pins 'none' too: the module's own
   rule is that not knowing is not permission to write. */
export function snapshotUpdateMode({ platform, env, lsFiles = trackedPaths }) {
  if (onGitHubRunner(env)) return undefined;
  const tracked = lsFiles(snapshotPathspec(platform));
  return tracked === null || tracked.length > 0 ? 'none' : undefined;
}
