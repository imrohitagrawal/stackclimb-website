/* Proves the DEF-65 baseline-trust check BITES, in both directions, without a
   browser and without touching the tree — the file-budget.mjs idiom, using
   injected git and filesystem answers so a Mac can drive the linux case.
 *
 * Real-tree mutation that turns the gate itself red:
 *   git checkout 5cc9766 -- tests/visual-baselines.spec.js-snapshots
 * (a real commit that moved the committed baselines), then run any local
 * Playwright baseline spec: the authority moves and the run refuses. Restore
 * the authority and it is quiet again.
 */

import { AUTHORITY_PATHSPEC, envFingerprint, hashAuthority, resolveBaselineTrust } from './lib/baseline-stamp.mjs';
import { KINDS, authorityLines, baselineTrust, stampPath } from './lib/baseline-stamp-io.mjs';

let failures = 0;
const ok = (cond, label, detail = '') => {
  if (cond) console.log(`ok    ${label}${detail ? ` — ${detail}` : ''}`);
  else { console.log(`FAIL  ${label}${detail ? ` — ${detail}` : ''}`); failures++; }
};
const A = 'authority-one', B = 'authority-two', E = 'env-one', F = 'env-two';
const base = { tracked: [], onRunner: false, localCount: 60, stamp: null, authority: A, env: E };
const state = (over) => resolveBaselineTrust({ ...base, ...over }).state;

console.log('self-test: injected git and fs, no browser, no file written\n');

/* ---- the gate BITES ---------------------------------------------------- */
ok(state({ stamp: { authority: B, env: E } }) === 'stale', 'the committed baselines moving is caught');
ok(state({ stamp: { authority: A, env: F } }) === 'stale', 'a browser or Playwright bump is caught');
ok(state({ stamp: null }) === 'stale', 'a local set with no stamp at all is caught');
ok(state({ stamp: { env: E } }) === 'stale', 'a stamp with no authority field is caught');
ok(state({ stamp: { authority: undefined, env: E } }) === 'stale', 'an undefined authority in the stamp is caught');

/* ---- it REFUSES rather than guessing ----------------------------------- */
ok(state({ tracked: null }) === 'refused', 'an unanswerable git lookup refuses, it does not certify');
ok(state({ authority: null }) === 'refused', 'an EMPTY authority list refuses — the git ls-tree trap');
ok(hashAuthority([]) === null, 'hashAuthority([]) is null, not the digest of the empty string');
ok(hashAuthority(null) === null, 'hashAuthority(null) is null');
ok(hashAuthority(['a']) !== hashAuthority(['b']), 'two different authority lists hash differently');

/* ---- it ALLOWS the sanctioned paths ------------------------------------ */
ok(state({ stamp: { authority: A, env: E } }) === 'fresh', 'a matching stamp is trusted');
ok(state({ localCount: 0 }) === 'seed', 'a fresh clone with no local set is not a failure');
ok(state({ localCount: 0, stamp: null }) === 'seed', 'and it does not need a stamp to get there');
ok(state({ onRunner: true }) === 'foreign', 'a CI runner is inert — CI behaviour is unchanged');
ok(state({ tracked: ['tests/x-linux.png'] }) === 'foreign', "a platform whose set is COMMITTED is inert");
ok(state({ tracked: ['tests/x-linux.png'], stamp: { authority: B, env: F } }) === 'foreign',
  'and it stays inert even with a stamp that disagrees — the committed set is the authority, not the stamp');

/* ---- order of precedence: a wrong order would silently disable the gate -- */
ok(state({ tracked: null, onRunner: true }) === 'refused', 'an unanswerable lookup outranks the runner exemption');
ok(state({ localCount: 0, tracked: ['x'] }) === 'foreign', 'tracked outranks seed');

/* ---- env fingerprint --------------------------------------------------- */
ok(envFingerprint({ version: '1.62.1', chromiumDir: 'chromium-1234' })
   !== envFingerprint({ version: '1.62.1', chromiumDir: 'chromium-1228' }),
  'the chromium build is part of the fingerprint');
ok(envFingerprint({ version: '1.62.1', chromiumDir: 'chromium-1234' })
   !== envFingerprint({ version: '1.61.0', chromiumDir: 'chromium-1234' }),
  'the Playwright version is part of the fingerprint');
ok(envFingerprint({ version: '1.62.1', chromiumDir: 'chromium-1234' })
   === envFingerprint({ version: '1.62.1', chromiumDir: 'chromium-1234' }),
  'and it is stable for the same inputs');

/* ---- the two kinds cannot vouch for each other -------------------------
       This was a REAL hole, found by running the gate rather than reading it:
       one shared stamp meant an UPDATE_GEOMETRY run wrote a stamp that then
       certified the PNG set, which had never been regenerated. ------------- */
ok(Object.keys(KINDS).length === 2, 'there are exactly two baseline kinds', Object.keys(KINDS).join(', '));
ok(String(stampPath('geometry')) !== String(stampPath('pixel')),
  'each kind stamps a DIFFERENT file, so one cannot certify the other');
const geoAuth = authorityLines('geometry');
const pixAuth = authorityLines('pixel');
ok(geoAuth.every((l) => l.endsWith('.json')), 'the geometry authority contains only the geometry baseline');
ok(pixAuth.every((l) => l.endsWith('.png')), 'the pixel authority contains only PNG baselines');
ok(hashAuthority(geoAuth) !== hashAuthority(pixAuth), 'and the two authorities hash differently');
ok(KINDS.geometry.local('nosuchplatform').length === 0, 'a geometry set for an absent platform counts zero');
ok(KINDS.pixel.local('nosuchplatform').length === 0, 'a pixel set for an absent platform counts zero');

/* ---- THE PARTNER. Half the checks above count nothing, so prove the thing
       counted exists. A gate driven only by fixtures can pass over an empty
       real population — the ["",""] hole one level up. ------------------- */
const real = [...authorityLines('geometry'), ...authorityLines('pixel')].sort();
ok(Array.isArray(real) && real.length > 0,
  'git really tracks the baselines being watched', `${real ? real.length : 0} entries`);
ok(hashAuthority(real) !== null, 'the real authority hashes to a value');
ok(AUTHORITY_PATHSPEC.length === 2, 'both baseline kinds are in the pathspec', AUTHORITY_PATHSPEC.join(' + '));
ok(real.some((l) => l.endsWith('.png')), 'the real authority contains PNG baselines');
ok(real.some((l) => l.endsWith('.json')), 'the real authority contains the geometry baseline');
ok(String(stampPath('geometry')).endsWith('baseline-stamp-geometry.json'),
  'the stamp resolves to a per-kind file name');
ok(String(stampPath('pixel')).includes('/.git/'),
  'and it really is under .git/, so it can never be committed');

/* The real decision on this machine, both kinds, exercised end to end. */
for (const kind of Object.keys(KINDS)) {
  const t = baselineTrust(kind);
  ok(['foreign', 'seed', 'fresh', 'stale', 'refused'].includes(t.state),
    `${kind}: the real decision resolves to a known state`, `${t.state} (${t.localCount} local)`);
}

console.log('');
if (failures) { console.log(`SELF-TEST FAIL — ${failures} check(s)`); process.exit(1); }
console.log('SELF-TEST PASS — the trust check bites, refuses when it cannot know, and leaves CI alone');
