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
 * The project ceilings are NOT set to today's measurements plus a margin — that is
 * the fudge this file exists to prevent. They are set where a plate stops being
 * composed and starts being a scroll, and today's worst sits inside them: 1.43 at
 * desktop against 1.50, and 1.97 at mobile against 2.00.
 */
const LIMITS = [
  { name: 'desktop', width: 1440, height: 900, max: 1.0, deep: 1.5 },
  { name: 'mobile', width: 390, height: 844, max: 1.75, deep: 2.0 },
];

/* Every route with plates on it, derived from the data — not just `/`. The first
   version of this file checked the home page alone and the project pages shipped at
   1.21 viewports underneath it, which is the same blind spot the gate exists to
   close, one level down. */
const { projects } = await import('../src/data/projects.js');
const ROUTES = ['/', ...Object.keys(projects).map((s) => `/projects/${s}`)];

for (const { name, width, height, max: homeMax, deep } of LIMITS) {
  for (const route of ROUTES) {
  const max = route === '/' ? homeMax : deep;
  test(`${name} ${route} — every plate is composed to be seen whole`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(route, { waitUntil: 'networkidle' });

    const plates = await page.evaluate(() =>
      [...document.querySelectorAll('section.plate[id]')].map((e) => ({
        id: e.id,
        h: Math.round(e.getBoundingClientRect().height),
      })),
    );

    /* Partner assertion. Without it this file passes on a page with no plates at
       all, which is the same result an empty test gives — the hole a mutation
       audit found in contact.spec.js, and the reason AGENTS.md requires a check
       that counts nothing to prove the thing counted exists. */
    const floor = route === '/' ? 4 : 1;
    expect(plates.length, 'no plates found — this test would be measuring nothing').toBeGreaterThan(floor);

    const over = plates
      .filter((p) => !EXEMPT.has(p.id))
      .map((p) => ({ ...p, vh: +(p.h / height).toFixed(2) }))
      .filter((p) => p.vh > max);

    expect(
      over,
      over
        .map((p) => `${route} #${p.id} is ${p.h}px — ${p.vh} viewports at ${width}×${height}, ceiling ${max}`)
        .join('\n'),
    ).toEqual([]);
  });
  }
}
