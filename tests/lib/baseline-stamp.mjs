/* DEF-65. The local baseline set goes stale and nothing says so.
 *
 * WHY THIS EXISTS. This repo commits ONE platform's baselines (D117): the
 * linux PNGs and tests/geometry-baseline.linux.json. Every other platform's
 * set is local and gitignored. A regeneration therefore refreshes the LINUX
 * set and never touches the developer's, which then goes stale in silence —
 * and one cause tells TWO OPPOSITE LIES, both measured on 2026-08-27 against
 * a darwin set three src commits behind:
 *
 *   visual-baselines.spec.js -> 14 passed, 0 failed   it lies GREEN
 *   geometry.spec.js         -> 44 passed, 6 failed   it lies RED, and CI
 *                                                     cannot see those six
 *
 * WHAT IS WATCHED, AND WHY NOT THE SOURCE. A baseline is SUPPOSED to be older
 * than your build — that is what makes it a reference. So "older than my
 * build" is not the defect and must not be the trigger: hashing dist/ or src/
 * fires on your own work in progress, which is every informative run. The
 * defect is "seeded from a different generation than the committed set CI
 * reads", so the trigger is the COMMITTED BASELINE BLOBS moving. Measured over
 * 194 commits: this fires on 13% of them, a git-hook drain on 35%, and a
 * dist fingerprint on every run. RCA-009 carries the full comparison.
 *
 * `git ls-files -s`, NEVER `git ls-tree`. This is load-bearing and it was
 * reproduced before it was written: `git ls-tree -r HEAD --
 * 'tests/*.spec.js-snapshots/*.png'` returns ZERO entries and exit 0, so a
 * stamp built on it hashes the empty string forever and the gate never fires.
 * `git ls-files -s` over the same pathspec returns 61. hashAuthority() returns
 * null on an empty list for exactly this reason, and the caller REFUSES rather
 * than reporting fresh.
 *
 * REFUSES, DOES NOT DELETE. The mirror of DEF-59, and one rule in two halves:
 * DEF-59's guard refuses to WRITE a tracked baseline locally; this refuses to
 * TRUST an untracked baseline whose stamp does not match. Nothing here unlinks
 * anything, so no alias-safe unlink, no tracked-path filter and no dev+ino
 * check are needed — and a concurrent run cannot destroy a set another run is
 * comparing against.
 *
 * RED WHEN: see tests/baseline-stamp-selftest.mjs, which drives every state in
 * both directions with git and the filesystem injected, so a Mac can drive the
 * linux case. On the real tree: `git checkout <an older commit> --
 * tests/visual-baselines.spec.js-snapshots` moves the authority and the next
 * local run refuses; restore it and the run is quiet again.
 */

import { createHash } from 'node:crypto';

/* Every committed baseline, both kinds. The geometry glob is deliberately
   `.*.json` rather than `.linux.json`: if a second platform is ever tracked,
   it joins the authority automatically instead of being silently excluded —
   the DEF-10 / DEF-44 shape, where a hand-typed list quietly narrows a gate. */
export const AUTHORITY_PATHSPEC = ['tests/*.spec.js-snapshots/*.png', 'tests/geometry-baseline.*.json'];

const sha256 = (s) => createHash('sha256').update(s).digest('hex');

/* null for both "git could not answer" and "the list is empty". An empty list
   would hash to the digest of the empty string, which is a stable value that
   compares equal forever — a gate certifying sameness rather than coverage. */
export function hashAuthority(lines) {
  if (!Array.isArray(lines) || lines.length === 0) return null;
  return sha256(lines.join('\n'));
}

/* A browser bump re-rasterizes the self-hosted fonts and invalidates every
   local PNG while NO tracked file changes at all, so the authority alone is
   blind to it. Measured on this Mac: playwright-core 1.62.1 resolving
   chromium-1234, with chromium-1223 and chromium-1228 installed beside it. */
export const envFingerprint = ({ version, chromiumDir }) => sha256(`${version}\n${chromiumDir}`);

/* The whole decision, pure, so the self-test can drive every state without git,
   without a filesystem and without a browser.
 *
 *   foreign — this platform's baselines are COMMITTED, or we are on a runner.
 *             Inert by construction; no platform name appears in the code.
 *   refused — git could not answer, or the authority list is empty. Not
 *             knowing is not permission to certify.
 *   seed    — no local set exists. The sanctioned first-run path; untouched.
 *   fresh   — the stamp matches both the authority and the environment.
 *   stale   — a local set exists and the stamp is missing, unreadable, or
 *             disagrees. The comparisons are skipped and one test fails. */
export function resolveBaselineTrust({ tracked, onRunner, localCount, stamp, authority, env }) {
  if (tracked === null) return { state: 'refused', why: 'git could not list tracked baselines' };
  if (authority === null) return { state: 'refused', why: 'the tracked-baseline list is empty' };
  if (onRunner) return { state: 'foreign', why: 'on a CI runner' };
  if (tracked.length > 0) return { state: 'foreign', why: "this platform's baselines are committed" };
  if (!localCount) return { state: 'seed', why: 'no local baseline set exists yet' };
  if (!stamp) return { state: 'stale', why: 'no stamp recorded for the local set' };
  if (stamp.authority !== authority) {
    const moved = `${short(stamp.authority)} -> ${short(authority)}`;
    return { state: 'stale', why: `the committed baselines moved: ${moved}` };
  }
  if (stamp.env !== env) {
    return { state: 'stale', why: 'the browser or Playwright version changed since the set was recorded' };
  }
  return { state: 'fresh', why: 'the local set matches the committed generation' };
}

const short = (h) => (typeof h === 'string' ? h.slice(0, 8) : String(h));

/* The refusal a developer actually reads. It names the drift, says the
   comparisons were SKIPPED rather than passed, gives the one command that
   repairs the local set, and says plainly that the committed set is untouched —
   because the obvious reaction to a baseline message in this repo is to
   regenerate, and DEF-59 exists to refuse exactly that on a tracked file. */
const REMEDY = {
  geometry: (p) => `UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1  (${p})`,
  pixel: (p) => `rm tests/visual-baselines.spec.js-snapshots/*-${p}.png`
    + ' && npx playwright test tests/visual-baselines.spec.js',
};

export function refusalMessage(trust, kind) {
  const remedy = REMEDY[kind](trust.platform);
  return [
    `The local ${kind} baseline set for ${trust.platform} is STALE and was NOT trusted.`,
    `  why       ${trust.why}`,
    `  authority ${short(trust.authority)}   (the committed baselines, via git ls-files -s)`,
    `  local set ${trust.localCount} file(s), untracked and yours to write`,
    '',
    'The comparisons in this file were SKIPPED, not passed. Comparing against a set',
    'seeded from a different generation reports breaches that are not defects (DEF-65',
    'measured six) and absorbs the ones that are (it also measured 14 false greens).',
    '',
    'Refresh the LOCAL set:',
    `  ${remedy}`,
    '',
    "The committed linux baselines are untouched by this, and DEF-59's guard still",
    "refuses to write them from a laptop. Only gates.yml's dispatch regenerates those.",
  ].join('\n');
}
