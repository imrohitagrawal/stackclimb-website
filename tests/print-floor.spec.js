// The 11px type floor, ON PAPER — the half tests/type-floor.spec.js says out
// loud it does not cover.
//
// WHY THIS EXISTS. D118 set an 11px floor for every piece of HTML text on
// screen and gated it. Its own scope line said "on screen", because the one
// place text went under the floor on paper was out of reach of that gate
// twice over: print.css reveals every link's destination in an ::after, which
// is not a DOM node and so invisible to an element walker, and it does so
// only under @media print, which no test emulated for type. Measured on
// 2026-08-26, before the fix: 45 revealed hrefs under 11px across the nine
// routes — 21 on the home page alone — at 8.76px, 8.99px and 10.60px, because
// the reveal was sized `0.72em` and inherited three different link sizes.
// /cv was already clean: cv.css sizes its reveal at 8.5pt, which is 11.33px.
//
// The rule this gate holds is DESIGN.md's Print-Floor Rule: under print,
// no text — pseudo-elements included — renders below 0.6875rem (11px, 8.25pt),
// and a revealed href prints in the case its href has.
//
// WHICH CHANGE TURNS IT RED — the exact edits, run as mutations before
// shipping and recorded in docs/STATUS.md D129:
//   1. `src/styles/print.css` `.plate-copy a::after { font-size: 0.72em }` —
//      the floor check goes red on every route but /cv.
//   2. Delete that whole `.plate-copy a::after` block — the PARTNER goes red
//      on every plate route, because the revealed-href population vanishes.
//   3. Remove `text-transform: none` from that block — the case check goes red
//      on every plate route.
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Page breaks, margins, and what the printer does with colour. This gate
//     reads computed style under print emulation; it does not rasterize a
//     sheet. print.spec.js owns the ink-on-transparent contract.
//   - ::marker and ::placeholder. Neither carries text here (swept by hand,
//     2026-08-26); the walker reads ::before and ::after only.
//   - Screen. type-floor.spec.js owns it, and its pseudo-element gap is
//     measured empty there.

import { test, expect } from '@playwright/test';
import { siteRoutes } from './lib/routes.mjs';
import { measureTypeFloor, SVG_EXEMPT } from './lib/type-floor-measure.mjs';
import { measurePseudoFloor } from './lib/print-floor-measure.mjs';

/* The same number as the screen floor, on purpose: one floor, one sentence to
   explain it. On paper 11px is 8.25pt; cv.css's own reveal at 8.5pt already
   clears it, so the rule changed nothing that was right. */
const FLOOR_PX = 11;

/* Every route with plates, plus /cv and /404 — the same population
   type-floor.spec.js gates, for the same reasons it gives. */
const ROUTES = [...(await siteRoutes()), '/cv', '/404'];

/* Two populations, two partners. The element floor proves the page rendered
   (type-floor.spec.js:77 reasoning, same numbers). The PSEUDO floor proves
   the revealed hrefs exist: without it, deleting the reveal rule would leave
   an empty `under` list that certifies nothing. Measured 2026-08-26: home 25
   pseudos, /cv 10, project pages 4-5, /experience 2, /how-i-build 3, /404 2. */
const minTextOwners = (route) => (route === '/' ? 100 : route === '/404' ? 5 : 20);
const minPseudos = (route) => (route === '/' ? 10 : route === '/cv' ? 5 : 0);

for (const route of ROUTES) {
  test(`${route} — under print, no text renders below ${FLOOR_PX}px, pseudo-elements included`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    await page.emulateMedia({ media: 'print' });
    /* print.spec.js found a mid-transition frame on backgroundColor after
       emulateMedia; font-size has no transition here, but the wait is cheap
       and the false negative was real. */
    await page.waitForTimeout(400);

    const elements = await page.evaluate(measureTypeFloor, { floorPx: FLOOR_PX, svgExempt: SVG_EXEMPT });
    const pseudos = await page.evaluate(measurePseudoFloor, { floorPx: FLOOR_PX });

    /* PARTNERS FIRST — both checks below count nothing when all is well. */
    expect(
      elements.measured,
      `only ${elements.measured} elements own visible text on ${route} under print — ` +
        `expected more than ${minTextOwners(route)}; this test measured nothing`,
    ).toBeGreaterThan(minTextOwners(route));
    expect(
      pseudos.pseudos,
      `only ${pseudos.pseudos} text-carrying pseudo-elements on ${route} under print — ` +
        `expected more than ${minPseudos(route)}; the revealed-href population is missing, so an empty ` +
        `violation list proves nothing`,
    ).toBeGreaterThan(minPseudos(route));

    /* RED WHEN: any print rule sizes text under 0.6875rem, or a screen size
       that print inherits drops below it. */
    expect(
      elements.under.map((u) => `${u.px}px  ${u.sel}  "${u.text}"`),
      `${elements.under.length} of ${elements.measured} text elements render under ${FLOOR_PX}px on ${route} in print`,
    ).toEqual([]);
    expect(
      pseudos.under.map((u) => `${u.px}px  ${u.sel}  "${u.text}"`),
      `${pseudos.under.length} of ${pseudos.pseudos} pseudo-elements render under ${FLOOR_PX}px on ${route} in print`,
    ).toEqual([]);

    /* RED WHEN: `text-transform: none` leaves the reveal rule. The screen
       label is tracked uppercase and the reveal inherits it, so `/cv`
       printed as `/CV` — a different path on a case-sensitive host. */
    expect(
      pseudos.transformed.map((t) => `${t.transform}  ${t.sel}  "${t.text}"`),
      `${pseudos.transformed.length} revealed hrefs on ${route} print in a case their href does not have`,
    ).toEqual([]);
  });
}
