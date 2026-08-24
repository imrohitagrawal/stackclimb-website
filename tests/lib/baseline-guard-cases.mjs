/* The fixture half of the DEF-59 self-test. Split out of
   baseline-guard-selftest.mjs because that file reached its D8 ceiling once the
   review round added six cases, and the rule is modularize, never trim.
   tests/lib/self-test-fixtures.mjs made the same split for the same reason.

   THE FIXTURES ANSWER THE QUESTION THEY ARE ASKED. That sounds obvious and was
   not true of the first version: `const TRACKED = () => [...]` ignored its
   argument and said "tracked" to everything. A reviewer that ran mutations
   instead of reading the file found four that left all 20 checks green, and the
   worst of them — querying `path` instead of the resolved `target` — re-opened
   DEF-59 exactly, because the escape hatch could then be aimed straight at the
   committed file. An argument-blind fixture cannot see a wrong argument. */

import { resolve } from 'node:path';
import {
  REPO_ROOT,
  resolveGeometryTarget,
  assertSnapshotUpdateAllowed,
  snapshotUpdateMode,
} from './baseline-write-guard.mjs';
import { wantsSnapshotUpdate } from './snapshot-flags.mjs';

/* resolveGeometryTarget returns the path it actually checked, resolved against
   the repo. Comparing against a bare relative string here would assert the old,
   broken contract — the one where the guard and the writer could disagree about
   which file a name meant. */
const abs = (p) => resolve(REPO_ROOT, p);

const GEO = 'tests/geometry-baseline.linux.json';
const DARWIN = 'tests/geometry-baseline.darwin.json';
const LOCAL = 'tests/geometry-baseline.local.json';
const FAMILY = 'tests/geometry-baseline.*.json';
const snaps = (p) => `tests/*.spec.js-snapshots/*-${p}.png`;

export const LAPTOP = {};
export const RUNNER = { GITHUB_ACTIONS: 'true' };

/* Answers only for the pathspecs it was given. The family pathspec resolves to
   the tracked geometry baselines, exactly as `git ls-files` would. */
const answers = (...tracked) => {
  const set = new Set(tracked);
  return (q) => (set.has(q) ? (q === FAMILY ? [GEO] : [q]) : []);
};
const NO_GIT = () => null;

const GEO_TRACKED = answers(GEO, FAMILY);
const NOTHING_TRACKED = answers();
const LINUX_SNAPS = answers(snaps('linux'));
const DARWIN_SNAPS = answers(snaps('darwin'));

const refuses = (fn) => {
  try {
    fn();
    return false;
  } catch (e) {
    return /refusing/.test(e.message);
  }
};

/* Direction 2 has to be throw-safe too. A guard mutated to refuse everything
   used to abort this file with a stack trace at the first allowed case, so the
   remaining checks never ran and the operator saw a crash instead of a verdict.
   Exit code was right, output was useless. */
const yields = (fn, expected) => {
  try {
    return fn() === expected;
  } catch {
    return false;
  }
};

/* Direction 1 — the guard bites. Every case here is a real defect, reproduced
   with an injected lookup so the Linux condition is drivable from a Mac. */
export const bites = [
  ['geometry: a tracked target on a laptop is refused', () =>
    refuses(() => resolveGeometryTarget({ path: GEO, env: LAPTOP, lsFiles: GEO_TRACKED }))],

  ['geometry: the GEOMETRY_BASELINE_OUT escape cannot aim at a tracked file either', () =>
    refuses(() =>
      resolveGeometryTarget({ path: DARWIN, env: { GEOMETRY_BASELINE_OUT: GEO }, lsFiles: GEO_TRACKED }),
    )],

  ['geometry: an unanswerable git lookup is refused, not waved through', () =>
    refuses(() => resolveGeometryTarget({ path: GEO, env: LAPTOP, lsFiles: NO_GIT }))],

  ['snapshots: -u against tracked snapshots on a laptop is refused', () =>
    refuses(() => assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS }))],

  ['snapshots: --update-snapshots=all is refused the same way', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({
        argv: ['--update-snapshots=all'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS,
      }),
    )],

  /* -uall is a real Playwright spelling and the first version of the parser
     missed it, so the guard reported "no update requested" while the run
     rewrote every tracked snapshot. Found by a cross-model review, confirmed by
     running `npx playwright test --list -uall`, which Playwright accepts. */
  ['snapshots: the attached short form -uall is refused', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({ argv: ['-uall'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS }),
    )],

  /* The bare long form, and the flag in the MIDDLE of a realistic argv that
     also carries a spec filename — which is exactly what gates.yml runs. Both
     spellings were free before: every case put `--update-snapshots=all` last
     and alone, so a parser that only matched the `=` form, or only looked at
     the last argument, passed every check. */
  ['snapshots: the bare --update-snapshots form is refused', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({
        argv: ['--update-snapshots'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS,
      }),
    )],

  ['snapshots: the flag is found mid-argv, next to a spec filename', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({
        argv: ['test', 'tests/visual-baselines.spec.js', '--update-snapshots=all', '--workers=1'],
        platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS,
      }),
    )],

  ['snapshots: -uchanged is refused too', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({ argv: ['-uchanged'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS }),
    )],

  /* The pathspec must follow the platform it was given. Hardcoding -linux.png
     passed every check in the first version while killing the Mac seeding run
     and printing a message that named the wrong platform. */
  ['snapshots: the pathspec follows the platform rather than naming linux', () =>
    refuses(() =>
      assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'darwin', env: LAPTOP, lsFiles: DARWIN_SNAPS }),
    )],

  ['snapshots: a bare run on a platform with tracked snapshots cannot silently write a missing one', () =>
    snapshotUpdateMode({ platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS }) === 'none'],

  /* Not knowing is not permission to write. This consumer used to return
     undefined here, which restores Playwright's write-missing default. */
  ['snapshots: an unanswerable git lookup pins none rather than failing open', () =>
    snapshotUpdateMode({ platform: 'linux', env: LAPTOP, lsFiles: NO_GIT }) === 'none'],
];

/* Direction 2 — the guard does not over-fire. Direction 1 alone is satisfied by
   a guard that refuses everything, which would break the only sanctioned way to
   refresh a baseline. The two RUNNER cases are what keep gates.yml's
   workflow_dispatch regeneration working. */
export const allows = [
  ['geometry: an untracked target on a laptop is allowed (the Mac case)', () =>
    yields(() => resolveGeometryTarget({ path: DARWIN, env: LAPTOP, lsFiles: NOTHING_TRACKED }), abs(DARWIN))],

  /* GEO_TRACKED, not an empty tree, because the realistic state is that the
     committed baseline IS tracked — and that is what makes this case able to
     catch a guard that consults `path` instead of the resolved `target`. With
     an all-untracked fixture the mutation passed here: the redirect looked
     honoured because nothing was tracked to refuse. */
  ['geometry: the scratch-file redirect is honoured even though the default target is tracked', () =>
    yields(
      () => resolveGeometryTarget({ path: GEO, env: { GEOMETRY_BASELINE_OUT: LOCAL }, lsFiles: GEO_TRACKED }),
      abs(LOCAL),
    )],

  ['geometry: a tracked target ON A RUNNER is allowed — the sanctioned dispatch path', () =>
    yields(() => resolveGeometryTarget({ path: GEO, env: RUNNER, lsFiles: GEO_TRACKED }), abs(GEO))],

  ['snapshots: --update-snapshots ON A RUNNER is allowed — the sanctioned dispatch path', () =>
    yields(
      () =>
        assertSnapshotUpdateAllowed({
          argv: ['--update-snapshots=all'], platform: 'linux', env: RUNNER, lsFiles: LINUX_SNAPS,
        }),
      'github-runner',
    )],

  ['snapshots: a run that asked for no update is never blocked', () =>
    yields(
      () => assertSnapshotUpdateAllowed({ argv: ['test'], platform: 'linux', env: LAPTOP, lsFiles: LINUX_SNAPS }),
      'no-update-requested',
    )],

  ['snapshots: -u where nothing is tracked for this platform is allowed (the Mac seeding run)', () =>
    yields(
      () => assertSnapshotUpdateAllowed({ argv: ['-u'], platform: 'darwin', env: LAPTOP, lsFiles: NOTHING_TRACKED }),
      'untracked',
    )],

  ['snapshots: a runner keeps Playwright default write-missing behaviour', () =>
    yields(() => snapshotUpdateMode({ platform: 'linux', env: RUNNER, lsFiles: LINUX_SNAPS }), undefined)],

  ['flag parsing does not match an unrelated --update-* option', () =>
    wantsSnapshotUpdate(['--update-source-method=patch']) === false && wantsSnapshotUpdate(['-u']) === true],

  /* `none` cannot overwrite anything, so refusing it would be friction with no
     safety in it. Both spellings. */
  ['flag parsing lets --update-snapshots=none and -unone through', () =>
    wantsSnapshotUpdate(['--update-snapshots=none']) === false && wantsSnapshotUpdate(['-unone']) === false],
];
