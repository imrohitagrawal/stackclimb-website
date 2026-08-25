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
import { ROW_FLOOR, floorAudit, minPlates, plateFloorBreaches, rowFloorBreaches } from './lib/geometry-floor.mjs';
import { geometryRoutes } from './lib/routes.mjs';

/* NO --self-test FLAG, and that is a deliberate deviation from the plan's
   acceptance item 2, which asked for "the repo's existing idiom (--self-test,
   as file-budget.mjs does)". Those siblings are gates with two modes, and the
   flag picks one. The geometry gate is a Playwright spec: it is run by
   `npx playwright test`, cannot receive argv, and has no second mode to select.
   A flag here would be inert decoration that reads like a switch, so the
   self-test is its own browserless entry point instead — the same split
   post-deploy-selftest.mjs already makes. Stated rather than quietly dropped. */

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
  // The count moves by exactly 1 — inside the PIXEL slack, so this goes red
  // only because counts are exempt from it. Deleting the exemption turns THIS
  // case and the [6,6] case above red together; both depend on it, and neither
  // isolates it alone.
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
     can fire. It reports two breaches, one per side, so it pins the guard PAIR
     rather than either side alone. Proved by mutation: delete both and this
     goes red. */
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

/* DEF-60's row-population floor, proved here for the same reason the
   comparison is: it is a pure function, so it needs no browser, no build and
   no server, and the gate that stops a row leaving the population should not
   be the one nobody has watched fail.

   The floor is what survives a baseline REGENERATION. Restyle a row to
   `display: block` and the run is red either way the first time — the keys
   report "in the baseline but NOT measured". Regenerate and those keys are
   gone, the comparison is clean, and only these numbers still object. */
const home = ROW_FLOOR['/'];
const all = home.stems;
const lost = all.filter((s) => s !== 'contact/ctas#0');
say(home.rows === 7 && home.children === 26 && all.length === 7,
    `the home floor is the measured population (${home.rows} rows, ${home.children} children, ${all.length} named)`);

// Direction 1: a shrinking population is caught, in every check.
say(rowFloorBreaches('/', home.rows - 1, home.children - 5, lost).length === 3,
    'a row restyled out of the flex/grid predicate is caught — DEF-60 (6 rows, 21 children)');
say(rowFloorBreaches('/', home.rows, home.children - 1, all).some((b) => b.includes('row children')),
    'a control deleted from a row that KEEPS its row is caught by the child count alone');
say(rowFloorBreaches('/', 0, 0, []).length === 3, 'a page with no rows at all is caught');
say(rowFloorBreaches('/no-such-route', 99, 99, all).length === 1,
    'a route with no floor is a breach, not a silent pass');
/* The hole the counts alone cannot see, found by codex-cli 0.149.1 — a
   different model family, as AGENTS.md requires for any test change. Both
   totals come back to 7 / 26; only the identities object. */
say(rowFloorBreaches('/', home.rows, home.children, [...lost, 'top/resource-links#0'])
      .some((b) => b.includes('contact/ctas#0')),
    'a lost row REPLACED by an unrelated row of the same size is caught by identity');

// Direction 2: the floor does not cry wolf.
say(rowFloorBreaches('/', home.rows, home.children, all).length === 0, 'the measured population passes');
say(rowFloorBreaches('/', home.rows + 1, home.children + 4, [...all, 'top/extra#0']).length === 0,
    'an ADDED row passes');

/* DEF-58's PLATE minimum, browserless. It replaced the constant
   `plateCount > (route === '/' ? 4 : 1)`, which /cv failed by construction with
   its single plate. The first two cases are the promise of a route-shaped
   denominator: /cv is relaxed and NOTHING ELSE IS. RED WHEN: any MIN_PLATES
   value drops below 1, or DEFAULT_MIN_PLATES stops being the strict 2. */
const routes = await geometryRoutes();
const wasStrict = (r) => (r === '/' ? 4 : 1) + 1; // the old `> floor`, as `>= min`
say(routes.filter((r) => r !== '/cv').every((r) => minPlates(r) === wasStrict(r)),
    'every route gated before DEF-58 keeps its old strictness exactly');
say(minPlates('/cv') === 1 && plateFloorBreaches('/cv', 1).length === 0,
    "/cv's one measured plate passes at a minimum of 1 — DEF-58's whole point");
say(routes.every((r) => plateFloorBreaches(r, 0).length === 1),
    `a route rendering ZERO plates is caught on all ${routes.length} routes, /cv included`);
say(plateFloorBreaches('/', 4).length === 1 && plateFloorBreaches('/projects/citevyn', 1).length === 1,
    'the home page at 4 plates and a project page at 1 are still caught — the relaxation did not leak');
say(plateFloorBreaches('/newly-added', 1).length === 1,
    'an unlisted route inherits the strict default of 2, so forgetting one fails loudly');
/* Vacuity, via the injected map: `plateCount >= 0` holds for every page built. */
say(plateFloorBreaches('/cv', 0, { '/cv': 0 }).some((b) => b.includes('rendered none')),
    'a plate minimum of 0 is caught inside the check itself');
say(floorAudit(routes, ROW_FLOOR, { '/cv': 0 }).some((b) => b.includes('plate minimum is 0')),
    'a plate minimum of 0 is caught by the audit as well — every other route falls back to the strict 2');
const cv = ROW_FLOOR['/cv']; // D125's row floor, extended to /cv by DEF-58
say(rowFloorBreaches('/cv', cv.rows, cv.children, cv.stems).length === 0,
    `/cv's measured row population passes (${cv.rows} rows, ${cv.children} children)`);
say(rowFloorBreaches('/cv', 1, 3, ['cv/cv-foot#0']).length === 3,
    "/cv losing its .cv-contact row is caught by identity and both counts");

/* THE PARTNER — per AGENTS.md, a check that counts nothing needs one proving
   the thing counted exists. `rowCount >= floor` is trivially true against a
   floor of 0 or a route the map never heard of, and ROW_FLOOR is hand-typed,
   which is the DEF-10 / DEF-44 shape exactly.
   RED WHEN: a route is added to routes.mjs with no ROW_FLOOR entry, or any
   floor is edited down to 0. Both proved directly below. `routes` is the
   geometry gate's own list, /cv included — auditing siteRoutes() here would
   leave /cv's floor unaudited while the spec ran it. */
say(routes.length >= 8, `${routes.length} routes under test — the audit below has a population`);
const gaps = floorAudit(routes);
say(gaps.length === 0, `every route under test has a floor${gaps.length ? `:\n    ${gaps.join('\n    ')}` : ''}`);
/* Isolated to the one route, not `[...routes, '/unfloored']`: a count assertion
   over the whole list goes red for ANY map defect, so it would certify the
   wrong cause the moment a real floor was edited to 0. */
say(floorAudit(['/unfloored']).some((b) => b.includes('/unfloored')),
    'a new route with no floor is caught by the audit');
say(Object.values(ROW_FLOOR).every((f) => f.rows >= 1 && f.children >= 1),
    'no floor in the map is 0 — a floor of 0 would certify sameness, not coverage');
/* The audit's own mutations, driven through the injected map rather than by
   editing geometry-floor.mjs and putting it back. An empty `stems` list makes
   the identity check vacuously true — `[].every()` in a different costume — so
   it has to be a breach in its own right. */
say(floorAudit(['/'], { '/': { rows: 7, children: 26, stems: [] } })
      .some((b) => b.includes('row identities')),
    'a route that names NO rows is caught — an empty list would certify sameness');
say(floorAudit(['/'], { '/': { rows: 7, children: 26, stems: ['top/ctas#0'] } })
      .some((b) => b.includes('row identities')),
    'a route that names fewer rows than its floor is caught');
say(floorAudit(['/'], { '/': { rows: 0, children: 0, stems: [] } }).length === 2,
    'a floor of 0 with no named rows is caught twice, once per partner');
say(floorAudit([], {}).length === 1, 'an emptied ROW_FLOOR is caught');

if (failed === 0) {
  console.log('SELF-TEST PASS — the gate bites in both directions and rejects a vacuous baseline');
  process.exit(0);
}
console.error(`SELF-TEST FAIL — ${failed} case(s)`);
process.exit(1);
