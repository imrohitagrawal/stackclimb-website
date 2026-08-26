import { test, expect } from '@playwright/test';

/* One system, one screen — enforced.
 *
 * WHY THIS EXISTS. The One-Plate-One-Viewport Rule (DESIGN.md:228) is the oldest
 * rule in the design system and nothing has ever measured it. On 2026-08-12 the
 * home page shipped 7 of 8 plates over one viewport at 390px, and every gate was
 * green: contrast gates assert a floor, link gates assert resolution, and a plate
 * three screens tall clears both. The rule was prose, so it drifted.
 *
 * The ceilings differ by width because the rule is achievable at one and not the
 * other, and a bar nobody can meet gets deleted rather than met:
 *
 *   desktop  1.00 — measured: every project plate lands at exactly 900px.
 *   mobile   1.75 — the two columns stack, so a plate is copy PLUS figure. Reaching
 *                   1.00 would mean dropping the capture or the caption strip from
 *                   the phone entirely. Today's worst is 1.73; before this package
 *                   it was 2.33. The bar holds the improvement without pretending
 *                   the rule is met at 390.
 *
 * WHICH CHANGE TURNS IT RED: add one paragraph back to any project plate — put the
 * `.eng` line back into SystemPlate.astro, or a second entry from `page.body`. Both
 * were measured going red before this file shipped.
 *
 * AND, since DEF-68: retag one plate `<article class="plate" id>` and push it over its
 * ceiling. The population is `.plate[id]`, not `section.plate[id]`, because a tag change
 * must not be able to hide a plate from this gate. It could: measured on an isolated copy
 * with `#citevyn-record` retagged and set to 2200px, the section-scoped query passed
 * 28/28 while the widened one failed 4 — "2.61 viewports at 390x844, ceiling 2" and
 * "2.44 viewports at 1440x900, ceiling 1.1". A partial retag is the dangerous one; a
 * total retag trips the partner assertion below and fails honestly. Widening is neutral
 * on every route gated today — all seven carry identical counts under both queries at
 * both widths — so this closed a hole without moving a single number. RCA-008, D139.
 *
 * The hero is exempt and says so: it is the one plate the site deliberately lets
 * run long, and D27 records the decision. Exempting it here rather than silently
 * skipping it means the exemption is reviewable.
 */

const EXEMPT = new Set(['top']);

/* Two ceilings per width, because the two surfaces are read differently and one
 * number for both would be either unmeetable or meaningless.
 *
 *   HOME is the scan. PRODUCT.md:190 gives it "a two-minute skim", and the
 *   composed-whole rule is what makes a skim possible. 1.00 at desktop is met
 *   exactly — every project plate lands at 900px.
 *
 *   PROJECT PAGES are the read — "rewarded on a ten-minute read", same line. The
 *   record carries five items in each of three columns, and splitting that across
 *   two plates would break the parallel comparison that is the whole device.
 *
 * DESIGN.md:228 is written without qualification, so THIS SPLIT IS A DESIGN-SYSTEM
 * AMENDMENT AND NEEDS THE OWNER'S SIGN-OFF, recorded in DESIGN.md and STATUS.md.
 * It is written here as an explicit number with its reason rather than by quietly
 * scoping the gate to `/`, which is how the rule went unmeasured for a month.
 *
 * The desktop project ceiling was 1.50 and a reviewer was right that it caught
 * nothing — 38% above the worst real plate. The fix was not a smaller number but a
 * better layout: the record was three equal columns for 5 / 5 / 2-3 items, so the
 * short column stretched and the note sat in a band beside 647px of nothing. Two
 * columns with the two short elements paired in row 2 took the worst record plate
 * from 983px to 911px. The ceiling is now 1.10 against a measured worst of 1.05 —
 * a 5% margin, matching the 3-7% the other three carry.
 */
const LIMITS = [
  { name: 'desktop', width: 1440, height: 900, max: 1.0, deep: 1.1, cv: 4.55 },
  { name: 'mobile', width: 390, height: 844, max: 1.75, deep: 2.0, cv: 7.3 },
];

/* THE /cv CEILING IS A RATCHET, NOT A DESIGN BAR — owner's ruling, 2026-08-27
   (D142). /cv is ONE plate and a CV is a document, so the One-Plate-One-Viewport
   Rule is not met there and this number does not pretend it is. Measured on the
   ec6c881 build: 5835px = 6.91 viewports at 390x844, and 3884px = 4.32 at
   1440x900. The ceilings are those plus 5%, the same margin the other three
   carry. What it buys is the only thing it claims: the page cannot grow without
   someone deciding that it should.

   RECORDED SLACK, because it is deliberate and not an accident. Three changes
   that SHORTEN /cv are approved and not yet built — a section index, a
   collapsible Technical block, and four condensed roles, together worth roughly
   1.4 viewports. The owner ruled that the ratchet stays at today's height rather
   than being re-tightened afterwards ("keep the ratchet at the current, do not
   minimize it"). So once those land this ceiling will carry about 1.8 viewports
   of slack at 390 and will not catch a regression smaller than that. That was
   raised before it was set; it is his call, and it is written here rather than
   discovered later.

   /cv IS NOT IN siteRoutes() — see the Rejected table (D126) and routes.mjs. It
   arrives through platedRoutes(), which is the list the geometry gate already
   uses. */
const ceilingFor = (route, limits) =>
  (route === '/' ? limits.max : route === '/cv' ? limits.cv : limits.deep);

/* Route-shaped, the way D126 made the geometry floor route-shaped. NOT a
   constant: /cv renders exactly ONE plate, and the old `> 1` refused it — that
   is blocker 2, and the reason widening the selector alone left /cv red.
   Asserted with >= so each number reads as the real minimum rather than one
   less than it. No entry may be 0: a floor of 0 certifies sameness rather than
   coverage, and the audit below refuses one. */
const PLATE_FLOOR = { '/': 5, '/cv': 1 };
const DEFAULT_PLATE_FLOOR = 2;
const floorFor = (route) => PLATE_FLOOR[route] ?? DEFAULT_PLATE_FLOOR;

/* Every route with plates on it, derived from the data — not just `/`. The first
   version of this file checked the home page alone and the project pages shipped at
   1.21 viewports underneath it, which is the same blind spot the gate exists to
   close, one level down. */
import { platedRoutes } from './lib/routes.mjs';
const ROUTES = await platedRoutes();

for (const { name, width, height, max: homeMax, deep, cv } of LIMITS) {
  for (const route of ROUTES) {
  const max = ceilingFor(route, { max: homeMax, deep, cv });
  test(`${name} ${route} — every plate is composed to be seen whole`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(route, { waitUntil: 'networkidle' });

    const plates = await page.evaluate(() =>
      [...document.querySelectorAll('.plate[id]')].map((e) => ({
        id: e.id,
        h: Math.round(e.getBoundingClientRect().height),
      })),
    );

    /* Partner assertion. Without it this file passes on a page with no plates at
       all, which is the same result an empty test gives — the hole a mutation
       audit found in contact.spec.js, and the reason AGENTS.md requires a check
       that counts nothing to prove the thing counted exists. */
    const floor = floorFor(route);
    expect(floor, `${route} has a plate floor of 0 — that certifies sameness, not coverage`).toBeGreaterThan(0);
    expect(plates.length, `${route}: ${plates.length} plate(s), floor ${floor} — this test would be measuring nothing`)
      .toBeGreaterThanOrEqual(floor);

    /* Counting NODES is not counting PLATES. `.plate { display: none }` leaves every
       node in the DOM at 0px, so a height ceiling passes while the page renders
       nothing — the same shape as the `body { display: none }` hole a cross-model
       review found in contact.spec.js. Assert the plates were actually painted. */
    const unpainted = plates.filter((p) => p.h < 200).map((p) => `#${p.id} is ${p.h}px`);
    expect(unpainted, `plates present in the DOM but not rendered:\n${unpainted.join('\n')}`).toEqual([]);

    /* Compare the RAW ratio, then round only for the message. Rounding first let a
       904px plate pass a 900px ceiling as "1.00" — a reviewer's finding, and the
       kind of hole that makes a gate decorative. */
    const over = plates
      .filter((p) => !EXEMPT.has(p.id))
      .map((p) => ({ ...p, raw: p.h / height, vh: +(p.h / height).toFixed(2) }))
      .filter((p) => p.raw > max);

    expect(
      over,
      over
        .map((p) => `${route} #${p.id} is ${p.h}px — ${p.vh} viewports at ${width}×${height}, ceiling ${max}`)
        .join('\n'),
    ).toEqual([]);
  });
  }
}
