// Proves the DEF-54 geometry gate BITES, in both directions, without a
// browser and without touching the tree — the file-budget.mjs:95 idiom, using
// the pure `compare` seam in tests/lib/geometry-compare.mjs the same way
// `audit(files, read)` takes an injected reader.
//
// Every fixture below is virtual. No baseline on disk is ever read or written,
// so this runs in gates.yml's cheap job beside `node tests/file-budget.mjs
// --self-test`, with no build, no playwright install, and no server.
//
// Direction 1: each seeded mutation is caught.
// Direction 2: a clean pair passes, and the COMMITTED baseline is a real
//              baseline rather than an empty object that would certify
//              sameness instead of correctness.
//
// Real-tree mutation that turns the gate itself red:
//   revert the @media block at src/styles/global.css:436 and run
//   `npx playwright test tests/geometry.spec.js` — 390px goes red.

import { readFileSync } from 'node:fs';
import { compare } from './lib/geometry-compare.mjs';

/* Accepts --self-test so the invocation reads like its two siblings in
   gates.yml (`node tests/no-pii.mjs --self-test`). The script does nothing
   else, so the flag is optional rather than a mode switch. */

const LEG = 'desktop/w1440//';
const leg = (keys) => ({ [LEG]: keys });

/* A clean pair, and the base every mutation below is a single edit away from.
   Mirrors the real shape: a plate box, a two-number count, a tag sequence, a
   child box, and a hidden child. */
const CLEAN = {
  'plate.top': [0, 1440, 1046, 0],
  'plate.contact': [0, 1440, 900, 0],
  'row.contact/ctas#0.count': [5, 5],
  'row.contact/ctas#0.tags': 'a,button,a,a,a',
  'row.contact/ctas#0.child.0': [32, 0, 128, 51],
  'row.contact/ctas#0.child.4': 'hidden',
};
const edit = (patch) => ({ ...CLEAN, ...patch });

const cases = [
  // ---- Direction 1: the gate bites -------------------------------------
  ['1px over the slack caught', leg(CLEAN), leg(edit({ 'plate.contact': [0, 1440, 902, 0] })), true],
  ['a 40px move caught', leg(CLEAN), leg(edit({ 'plate.contact': [0, 1440, 900, 40] })), true],
  // D112's exact direction: the baseline predates the button, the page has it.
  ['a child ADDED and unbaselined caught', leg(CLEAN),
    leg({ ...CLEAN, 'row.contact/ctas#0.child.5': [0, 0, 90, 51] }), true],
  ['a plate that VANISHED caught', leg(CLEAN),
    leg(Object.fromEntries(Object.entries(CLEAN).filter(([k]) => k !== 'plate.top'))), true],
  ['a count change caught with zero slack', leg(CLEAN),
    leg(edit({ 'row.contact/ctas#0.count': [6, 6] })), true],
  // The count moves by exactly 1 — inside the PIXEL slack, so this only goes
  // red because counts are exempt from it. Delete that exemption and this case
  // is the one that turns red.
  ['a control that ships but is never painted caught', leg(CLEAN),
    leg(edit({ 'row.contact/ctas#0.count': [5, 4] })), true],
  ['a reorder with identical boxes caught', leg(CLEAN),
    leg(edit({ 'row.contact/ctas#0.tags': 'button,a,a,a,a' })), true],
  ['a child flipping painted<->hidden caught', leg(CLEAN),
    leg(edit({ 'row.contact/ctas#0.child.4': [0, 60, 112, 51] })), true],
  /* This fixture is deliberately `null` in the slot whose baseline value is 0.
     An earlier version used [0,1440,null,0] and passed for the WRONG reason:
     |900 - null| is 900, which the drift branch catches without the finiteness
     guard at all. Here |0 - null| is 0 — inside the slack — so ONLY the guard
     can catch it. Proved by mutation: delete the guard and this case goes red. */
  ['a non-numeric value in a zero slot caught', leg(CLEAN),
    leg(edit({ 'plate.contact': [null, 1440, 900, 0] })), true],
  /* Arity, isolated. The direction matters: a SHORTER baseline against a longer
     measurement is the only shape the arity check alone can catch, because every
     index the baseline has still matches and is still finite. Written the other
     way round ([0,1440] measured against a 4-number baseline) the finiteness
     guard catches it first and the arity check proves nothing.
     Proved by mutation: delete the arity check and this case goes red. */
  ['a value changing arity caught', leg({ ...CLEAN, 'plate.contact': [0, 1440] }),
    leg(edit({ 'plate.contact': [0, 1440, 900, 0] })), true],
  /* An empty RECORDED value. `[].every(...)` is vacuously true, so two empty
     arrays compare clean — the ["",""] shape at the value level. It has to be
     empty on BOTH sides, or the arity check catches it instead and this proves
     nothing. Proved by mutation: delete the empty-value guard and this goes red. */
  ['a value recorded as empty on both sides rejected',
    leg({ ...CLEAN, 'plate.contact': [] }), leg({ ...CLEAN, 'plate.contact': [] }), true],
  /* The ["",""] shape at the LEG level: present on both sides, empty on both, so
     there are no key-set differences to breach on and only the empty-leg guards
     can fire. Proved by mutation: delete them and this goes red. */
  ['a leg empty on BOTH sides rejected', leg({}), leg({}), true],
  /* Object.keys("abcdefghij") is ["0".."9"], so a corrupted baseline holding a
     string where a leg belongs compares clean against the same string.
     Proved by mutation: delete the plain-object guard and this goes red. */
  ['a leg that is not an object rejected', { [LEG]: 'abcdefghij' }, { [LEG]: 'abcdefghij' }, true],
  ['an empty baseline REJECTED, not passed', {}, {}, true],
  ['an empty leg against a real page rejected', leg({}), leg(CLEAN), true],
  ['a real baseline against a blank page rejected', leg(CLEAN), leg({}), true],
  // A whole leg missing must not be silently skipped: the gate would lose a
  // third of its matrix and still report zero breaches.
  ['a whole leg missing caught', leg(CLEAN), {}, true],

  // ---- Direction 2: the gate does not cry wolf -------------------------
  ['an identical pair passes', leg(CLEAN), leg(CLEAN), false],
  ['drift inside the slack passes', leg(CLEAN), leg(edit({ 'plate.contact': [1, 1441, 901, 1] })), false],
  ['an unchanged hidden child passes', leg(CLEAN), leg(edit({ 'row.contact/ctas#0.child.4': 'hidden' })), false],
];

let failed = 0;
const say = (ok, what) => {
  console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${what}`);
  if (!ok) failed++;
};

console.log(`self-test: ${cases.length} virtual cases, no browser, no file written`);
for (const [name, want, got, shouldBreach] of cases) {
  const breaches = compare(want, got);
  say(breaches.length > 0 === shouldBreach, `${name} (${breaches.length} breach(es))`);
}

/* Direction 2, the half that matters most: the COMMITTED baseline must not be
   an empty object. `compare({}, {})` returning breaches is proved above, but a
   committed `{}` would still have to be caught by something that reads the real
   file — otherwise a truncated baseline sails through every virtual case. */
try {
  /* Always the LINUX file, whatever host this runs on: that is the committed
     authority and the only one CI compares against. A darwin file is gitignored
     and must never be what a self-test certifies. */
  const real = JSON.parse(readFileSync(new URL('./geometry-baseline.linux.json', import.meta.url), 'utf8'));
  const legs = Object.keys(real);
  const keys = legs.reduce((n, l) => n + Object.keys(real[l]).length, 0);
  say(legs.length >= 6, `the committed baseline records ${legs.length} legs`);
  say(keys >= 100, `the committed baseline records ${keys} measured elements`);
  say(
    legs.every((l) => Object.keys(real[l]).length > 0),
    'no leg in the committed baseline is empty',
  );
  /* Self-comparison must be clean, or the gate is red on arrival and trains
     people to ignore it. */
  say(compare(real, real).length === 0, 'the committed baseline compares clean against itself');
} catch (err) {
  say(false, `could not read the committed baseline: ${err.message}`);
}

if (failed === 0) {
  console.log('SELF-TEST PASS — the gate bites in both directions and rejects a vacuous baseline');
  process.exit(0);
}
console.error(`SELF-TEST FAIL — ${failed} case(s)`);
process.exit(1);
