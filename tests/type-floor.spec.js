// The 11px type floor — no text on this site renders smaller than 11px.
//
// WHY THIS EXISTS. The factual layer of the page — caption labels, ledger
// terms, status chips, the colophon, the systems table — is the layer that
// carries every number the site claims, and it was the SMALLEST text on the
// page. 128 elements owned visible text under 11px, the smallest HTML text at
// 9.44px, and the size list was identical at 1440 and 390 so a phone got no
// relief at all. Two consecutive design critiques raised it and it did not
// move, because the rule lived in prose: DESIGN.md named the Label register as
// 0.6-0.78rem and 0.6rem IS 9.6px. The system was being followed correctly and
// the floor was the bug.
//
// This file is the floor as a number. AGENTS.md: if a rule must always hold it
// belongs in CI, not in a doc.
//
// WHICH CHANGE TURNS IT RED — the exact edit, run as a mutation before
// shipping: `src/styles/caps.css` `.cap .t { font-size: 0.66rem }`. The gate
// names the element, route, width and computed size. Measured going red at
// every route and both widths before the fix landed: 71 on the home page, 12 on
// each of the four project pages, 3 each on /experience, /how-i-build and /cv.
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Pseudo-elements. createTreeWalker(SHOW_ELEMENT) visits elements, and
//     ::before / ::after / ::marker / ::placeholder are not in the DOM tree.
//     Swept by hand across every route at four widths on 2026-08-25 — six
//     pseudo types, nothing under 11px — so nothing escapes today. Stated here
//     rather than left to be discovered, which is how a gate quietly narrows.
//   - Print. @media print type is measured by nobody; print.css and cv.css use
//     pt and em and are out of this gate's world.
//   - Structural loss. The population floor below is a DENOMINATOR — it proves
//     the page rendered, not that all of it did. A deleted section is caught by
//     geometry.spec.js, which reports a baselined plate as "in the baseline but
//     NOT measured", and by plate-height.spec.js's unpainted check.
//   - Contrast, weight, and tracking. A legible SIZE is not a legible label;
//     boundary-check.mjs, nav-contrast.mjs and the axe sweep own those.

import { test, expect } from '@playwright/test';
import { siteRoutes } from './lib/routes.mjs';
import { measureTypeFloor, SVG_EXEMPT } from './lib/type-floor-measure.mjs';

/* 11px, in the unit the CSS is written in: root is 16px, so the floor is
   0.6875rem. Stated as px because that is what getComputedStyle returns and
   what a reader's eye actually meets. */
const FLOOR_PX = 11;

/* Both widths, because the size list used to be IDENTICAL at 1440 and 390 —
   there was no responsive relief, and a floor that only held at one width
   would let the other drift back. */
const WIDTHS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];

/* Every route with plates, plus /cv and /404. /cv is the page a recruiter is
   most likely to squint at, and /404 is a real shipped page that a first draft
   of this file left out entirely — a reviewer's finding, and exactly the shape
   of gap DEF-10 records. Both are absent from siteRoutes(), which is the plate
   list. */
const ROUTES = [...(await siteRoutes()), '/cv', '/404'];

/* The population floor. A count of violations that reads 0 against a page that
   rendered nothing is not a pass, it is a measurement of nothing — the ["",""]
   hole a cross-model review found in contact.spec.js. Route-shaped, the same
   way plate-height.spec.js:80 is, because the home page carries five times the
   text of a project page and one number would be either unmeetable there or
   meaningless here. Measured 2026-08-25: home 242 at 390 / 246 at 1440; the
   thinnest plate route, /how-i-build, 36 at 390. The floors sit well under
   those so an ordinary copy edit never touches them, while `body { display:
   none }` or a build that ships an empty page fails HERE. */
const minTextOwners = (route) => (route === '/' ? 100 : route === '/404' ? 5 : 20);

for (const { width, height } of WIDTHS) {
  for (const route of ROUTES) {
    test(`${width}px ${route} — no text renders under ${FLOOR_PX}px`, async ({ page }) => {
      /* RED WHEN: any font-size this package raised goes back under 0.6875rem,
         or a new component ships a label below it. The population is derived
         from the DOM, so a new surface is under this gate the moment it renders
         — no allowlist to forget (DEF-10, DEF-44). */
      await page.setViewportSize({ width, height });
      await page.goto(route, { waitUntil: 'networkidle' });
      /* Fonts change wrap points, and an element mid-layout can still have no
         client rects. D111 paid three CI rounds for skipping this wait. */
      await page.evaluate(() => document.fonts.ready);

      const { measured, under, svgSeen, details } = await page.evaluate(measureTypeFloor, {
        floorPx: FLOOR_PX,
        svgExempt: SVG_EXEMPT,
      });

      /* PARTNER ASSERTION, first, because the check below it is a check that
         counts nothing. This one proves the thing counted exists. */
      const floor = minTextOwners(route);
      expect(
        measured,
        `only ${measured} elements own visible text on ${route} at ${width}px — ` +
          `expected more than ${floor}. This test measured nothing, so its "0 violations" means nothing.`,
      ).toBeGreaterThan(floor);

      /* The disclosures were really opened. Without this the walker's open step
         could stop working and /cv would go back to measuring only its summary
         lines, silently — the hole it was added to close. */
      if (route === '/cv') {
        expect(details, '/cv ships closed <details> panels; none were opened, so their text went unmeasured')
          .toBeGreaterThan(0);
      }

      /* The SVG exemption is COUNTED, not trusted. A blanket namespace pass let
         `<svg><text style="font-size:1px">` through in a reviewer's mutation.
         Only the two private-figure labels are exempt, they are pinned by their
         own text, and a third one fails here rather than being waved past. */
      const exempt = svgSeen.filter((s) => SVG_EXEMPT.includes(s.text)).map((s) => s.text).sort();
      const strayLow = svgSeen.filter((s) => !SVG_EXEMPT.includes(s.text) && s.px < FLOOR_PX);
      expect(strayLow.map((s) => `${s.px}px ${s.sel} "${s.text}"`), 'SVG text under the floor').toEqual([]);
      if (route === '/') {
        expect(exempt, 'the DEF-63 exemption changed — it covers exactly two illustration labels')
          .toEqual([...SVG_EXEMPT].sort());
      }

      expect(
        under.map((u) => `${u.px}px  ${u.sel}  "${u.text}"`),
        `${under.length} of ${measured} text elements render under ${FLOOR_PX}px on ${route} at ${width}px`,
      ).toEqual([]);
    });
  }
}
