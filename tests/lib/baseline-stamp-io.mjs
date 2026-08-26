/* DEF-65, the half that touches git and the filesystem. The decision itself is
   pure and lives in baseline-stamp.mjs, so tests/baseline-stamp-selftest.mjs can
   drive every state without either — the same split geometry-compare.mjs and
   geometry-baseline-io.mjs already make, and for the same reason.

   Nothing here deletes anything. DEF-59's guard refuses to WRITE a tracked
   baseline from a laptop; this refuses to TRUST an untracked one whose stamp
   does not match. Two halves of one rule.

   ONE STAMP PER KIND, and that is not a detail — it was a real hole, found by
   running the thing rather than by reading it. A single shared stamp meant that
   refreshing the geometry baseline wrote a stamp which then certified the PNG
   set too, although those PNGs had never been regenerated: the mechanism
   certifying a set it had just refused, which is the exact failure it exists to
   prevent. Each kind now carries its own stamp and its own authority, so a
   PNG regeneration cannot vouch for the geometry file or the reverse. */

import { execFileSync } from 'node:child_process';
import { readFileSync, writeFileSync, renameSync, existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { createRequire } from 'node:module';
import { REPO_ROOT, trackedPaths, onGitHubRunner, snapshotPathspec } from './baseline-write-guard.mjs';
import { hashAuthority, envFingerprint, resolveBaselineTrust } from './baseline-stamp.mjs';

export { refusalMessage } from './baseline-stamp.mjs';

/* The two baseline kinds, each with the committed files that are its authority
   and the local files it owns. The geometry pathspec is `.*.json`, not
   `.linux.json`: if a second platform is ever tracked it joins the authority
   automatically rather than being silently excluded — the DEF-10 / DEF-44
   shape, where a hand-typed list quietly narrows a gate. */
export const KINDS = {
  geometry: {
    authority: () => ['tests/geometry-baseline.*.json'],
    tracked: (p) => `tests/geometry-baseline.${p}.json`,
    local: (p) => {
      const f = join(REPO_ROOT, `tests/geometry-baseline.${p}.json`);
      return existsSync(f) ? [f] : [];
    },
  },
  pixel: {
    authority: () => ['tests/*.spec.js-snapshots/*.png'],
    tracked: (p) => snapshotPathspec(p),
    local: (p) => {
      const dir = join(REPO_ROOT, 'tests', 'visual-baselines.spec.js-snapshots');
      try {
        return readdirSync(dir).filter((f) => f.endsWith(`-${p}.png`)).map((f) => join(dir, f));
      } catch {
        return []; // no directory on a fresh clone; that is `seed`, not a failure
      }
    },
  },
};

/* mode + blob sha + stage + path for this kind's committed baselines. Blob
   shas, so a regenerated file with an identical name still moves the authority.
   Returns null when git cannot answer — never [], because "no answer" and "no
   files" must not collapse into one value. */
export function authorityLines(kind, exec = execFileSync) {
  try {
    const out = exec('git', ['ls-files', '-s', '--', ...KINDS[kind].authority()], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    });
    return out.split('\n').filter(Boolean).sort();
  } catch {
    return null;
  }
}

/* Inside .git/, resolved by git itself so a linked worktree gets its own.
   Nothing under .git/ can be committed, so this can never repeat the accident
   that put 54 laptop baselines in a commit (D69), and it needs no .gitignore
   line to be safe. */
export function stampPath(kind, exec = execFileSync) {
  try {
    const p = exec('git', ['rev-parse', '--git-path', `baseline-stamp-${kind}.json`], {
      cwd: REPO_ROOT, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'],
    }).trim();
    return p.startsWith('/') ? p : join(REPO_ROOT, p);
  } catch {
    return null;
  }
}

export function readStamp(path) {
  if (!path || !existsSync(path)) return null;
  try {
    const s = JSON.parse(readFileSync(path, 'utf8'));
    return s && typeof s.authority === 'string' ? s : null;
  } catch {
    return null; // a corrupt stamp is an absent stamp: it must never read as fresh
  }
}

/* Temp plus rename because both Playwright projects reach this concurrently
   with identical content. */
export function writeStamp(path, stamp) {
  if (!path) return false;
  const tmp = `${path}.${process.pid}.tmp`;
  writeFileSync(tmp, `${JSON.stringify(stamp, null, 2)}\n`);
  renameSync(tmp, path);
  return true;
}

/* Resolves the two environment strings for real. Separate from the pure
   decision so the self-test never loads Playwright. Both lookups fail soft: an
   unresolvable browser yields a STABLE 'unknown', which cannot false-fire — it
   can only miss a bump, and missing is the safe direction. */
export function currentEnvIdentity() {
  let version = 'unknown';
  let chromiumDir = 'unknown';
  try {
    const pkg = join(REPO_ROOT, 'node_modules/playwright-core/package.json');
    version = JSON.parse(readFileSync(pkg, 'utf8')).version;
  } catch { /* left as 'unknown' */ }
  try {
    const { chromium } = createRequire(import.meta.url)('playwright-core');
    chromiumDir = chromium.executablePath().split('/').find((s) => s.startsWith('chromium-')) ?? 'unknown';
  } catch { /* left as 'unknown' */ }
  return { version, chromiumDir };
}

export function baselineTrust(kind, { platform = process.platform, env = process.env } = {}) {
  const { version, chromiumDir } = currentEnvIdentity();
  const tracked = trackedPaths(KINDS[kind].tracked(platform));
  const authority = hashAuthority(authorityLines(kind));
  const envHash = envFingerprint({ version, chromiumDir });
  const path = stampPath(kind);
  const local = KINDS[kind].local(platform);
  const trust = resolveBaselineTrust({
    tracked, onRunner: onGitHubRunner(env), localCount: local.length,
    stamp: readStamp(path), authority, env: envHash,
  });
  return { ...trust, kind, authority, env: envHash, path, localCount: local.length, platform };
}

/* Record what the local set was generated from — but only once it is
   demonstrably back on disk AND the run began from a trustworthy position.
 *
 * `startedAs` is the state at the START of the run, not the end, and that is
 * load-bearing. A `seed` run (no local set) ends with the files Playwright just
 * wrote on disk, so RE-deriving the state at teardown returns `stale` — no
 * stamp exists yet — and a mechanism keyed on the end state would never stamp a
 * freshly seeded set, leaving it permanently refused. Keying on the start state
 * also refuses the dangerous direction: a run that STARTED `stale` never
 * stamps, whatever it did afterwards, which is what stops the mechanism
 * certifying a set it has just refused. */
export function stampIfTrustworthy(kind, { updating = false, startedAs = null } = {}) {
  const began = startedAs ?? baselineTrust(kind).state;
  if (began === 'foreign' || began === 'refused') return null;
  if (!(began === 'fresh' || began === 'seed' || updating)) return null;
  const t = baselineTrust(kind);
  if (!t.localCount) return null; // nothing on disk to vouch for
  writeStamp(t.path, {
    authority: t.authority, env: t.env, platform: t.platform, kind,
    seededAt: process.env.GITHUB_SHA ?? 'local', written: new Date().toISOString(),
  });
  return t;
}

/* Evaluated once per spec process so each gate reads one decision, and per KIND
   so neither can vouch for the other. */
export const GEOMETRY_TRUST = baselineTrust('geometry');
export const PIXEL_TRUST = baselineTrust('pixel');
