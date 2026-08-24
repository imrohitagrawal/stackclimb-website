// The 11px type floor — no text on this site renders smaller than 11px.
//
// WHY THIS EXISTS. The factual layer of the page — caption labels, ledger
// terms, status chips, the colophon, the systems table — is the layer that
// carries every number the site claims, and it was the SMALLEST type on the
// page. 73 elements on the home page and 130 across the seven plate routes
// rendered under 11px, the smallest at 9px, and the size list was identical at
// 1440 and 390 so a phone got no relief at all. Two consecutive design
// critiques raised it and it did not move, because the rule lived in prose:
// DESIGN.md:206 named the Label register as 0.6-0.78rem and 0.6rem IS 9.6px.
// The system was being followed correctly and the floor was the bug.
//
// This file is the floor as a number. AGENTS.md: if a rule must always hold it
// belongs in CI, not in a doc.
//
// WHICH CHANGE TURNS IT RED: set any of the label declarations back — e.g.
// `.cap-label { font-size: 0.66rem }` in src/styles/caps.css — and this goes red
// with the element listed by selector, route, width and computed size. Measured
// going red before the fix landed, at every route and both widths: 71 on the
// home page, 12 on each of the four project pages, 3 each on /experience,
// /how-i-build and /cv — 128 in total. Counting the two SVG figure labels this
// gate measures but does not gate, 130.
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Print. @media print type is measured by nobody; print.css and cv.css use
//     pt and em and are out of this gate's world (it runs a screen media query).
//   - Text that never paints. An element with no box, `visibility: hidden`, or
//     zero client rects renders no text, so it is skipped — which is why the
//     partner assertion below exists.
//   - Contrast, weight, and tracking. A legible SIZE is not a legible label;
//     boundary-check.mjs, nav-contrast.mjs and the axe sweep own those.

import { test, expect } from '@playwright/test';
import { siteRoutes } from './lib/routes.mjs';

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

/* Every route with plates, plus /cv. /cv is not a plate route so it is absent
   from siteRoutes(), and it is the one page a recruiter is most likely to
   print or squint at — leaving it out would exempt exactly the wrong page. */
const ROUTES = [...(await siteRoutes()), '/cv'];

/* Walks the RENDER, not the stylesheet, and the two things that made that
   necessary are both below: an SVG label whose declared 9 renders anywhere from
   6.26px to 14.37px depending on the viewBox scale, and a reveal animation that
   hides two thirds of the population from a naive visibility check. A grep over
   the CSS sees neither.

   WHAT THE WALK CANNOT SEE: pseudo-elements. createTreeWalker(SHOW_ELEMENT)
   visits elements, and ::before / ::after / ::marker / ::placeholder are not in
   the DOM tree, so a `content` string sized under the floor would pass this
   gate. Swept by hand across all eight routes at four widths on 2026-08-25 —
   six pseudo types, nothing under 11px — so nothing escapes today. Written here
   as a stated boundary rather than left for someone to discover, which is how a
   gate quietly narrows. */
const measure = (floorPx) => {
  const out = { measured: 0, under: [], svgText: [] };

  /* Element -> the shortest CSS path a human can act on. `.cap-label` beats
     `body > div:nth-child(2) > ...` when the failure message is the whole
     point of the gate. */
  const describe = (el) => {
    const tag = el.tagName.toLowerCase();
    const id = el.id ? `#${el.id}` : '';
    const cls = (el.getAttribute('class') || '').trim().split(/\s+/).filter(Boolean);
    return `${tag}${id}${cls.length ? '.' + cls.join('.') : ''}`;
  };

  const SKIP = new Set(['SCRIPT', 'STYLE', 'TITLE', 'NOSCRIPT', 'TEMPLATE', 'HEAD', 'META', 'LINK']);

  const walker = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_ELEMENT);
  const all = [document.documentElement];
  while (walker.nextNode()) all.push(walker.currentNode);

  for (const el of all) {
    if (SKIP.has(el.tagName.toUpperCase())) continue;

    /* OWN text only. Counting every ancestor of a text node would report <body>
       and <html> as text-owners and make the population meaningless. */
    let ownText = '';
    for (const n of el.childNodes) if (n.nodeType === Node.TEXT_NODE) ownText += n.nodeValue;
    if (!ownText.trim()) continue;

    /* Text with no box is text nobody reads, so `display: none` and
       `visibility: hidden` are out. OPACITY IS DELIBERATELY NOT CHECKED. The
       plate reveal starts every below-the-fold plate at `opacity: 0` until it
       is scrolled into view, and an opacity-aware filter therefore measured
       only the first screen: it reported 28 violations on the home page where
       the real number is 73. A label is 9px whether or not it has faded in
       yet, so the floor does not wait for the animation. */
    if (typeof el.checkVisibility === 'function') {
      if (!el.checkVisibility({ visibilityProperty: true })) continue;
    }
    const rects = el.getClientRects();
    if (rects.length === 0) continue;
    let boxed = false;
    for (const r of rects) if (r.width > 0 && r.height > 0) boxed = true;
    if (!boxed) continue;

    const cs = getComputedStyle(el);
    const px = parseFloat(cs.fontSize);
    if (!Number.isFinite(px)) continue;

    /* SVG text is measured but NOT gated, and both halves of that need saying.
       MEASURED CORRECTLY: getComputedStyle on an SVG <text> reports USER UNITS,
       not rendered pixels, so the private figure's two name tags read 9 and 9.5
       there and render at whatever the viewBox scale makes them. Measured across
       the width sweep, they are the smallest text on the site and they are NOT
       clear at desktop either:
           390   6.26 / 6.60      1024   8.11 / 8.56
           768  13.62 / 14.37     1440  10.70 / 11.29     1920  10.56 / 11.15
       1024 is the worst desktop case, and neither width this gate samples sees
       it. The screen CTM scale is applied so the number reported is the one a
       reader meets.
       NOT GATED: the rule is the SVG namespace, not a list of elements — a list
       is what quietly narrowed a gate twice on this repo (DEF-10, DEF-44) and a
       namespace check cannot forget a new component. Those two strings are drawn
       artwork inside a `role="img"` figure whose accessible name comes from its
       <title>, and both names are also rendered as real HTML text on the same
       plate, above the floor. Clearing 11px at EVERY width needs 12.2 user units
       against name-tag rectangles 72px and 96px wide — a redraw of the
       illustration, not a type change. Recorded as an open defect in
       docs/STATUS.md rather than silently exempted. */
    if (el.namespaceURI === 'http://www.w3.org/2000/svg') {
      const ctm = typeof el.getScreenCTM === 'function' ? el.getScreenCTM() : null;
      const scale = ctm ? Math.hypot(ctm.a, ctm.b) : 1;
      const rendered = Math.round(px * scale * 100) / 100;
      out.svgText.push({ sel: describe(el), px: rendered, text: ownText.trim().slice(0, 40) });
      continue;
    }

    out.measured++;
    /* Rounded to 2dp before comparing. 0.6875rem * 16 is exactly 11, but a
       clamp() or an em chain lands on 10.999999999999998 and a bare `< 11`
       would fail the very value this gate asks for. */
    if (Math.round(px * 100) / 100 < floorPx) {
      out.under.push({ sel: describe(el), px: Math.round(px * 100) / 100, text: ownText.trim().slice(0, 40) });
    }
  }
  return out;
};

/* The population floor. A count of violations that reads 0 against a page that
   rendered nothing is not a pass, it is a measurement of nothing — the ["",""]
   hole a cross-model review found in contact.spec.js. Two numbers, the same
   shape plate-height.spec.js:80 uses, because the home page carries five times
   the text of a project page and one number would be either unmeetable there or
   meaningless here. Measured 2026-08-25: home 242 at 390 / 246 at 1440;
   the thinnest route, /how-i-build, 36 at 390. The floors sit well under both so
   an ordinary copy edit never touches them, while `body { display: none }` or a
   build that ships an empty page fails HERE rather than passing the floor
   vacuously. */
const minTextOwners = (route) => (route === '/' ? 100 : 20);

for (const { width, height } of WIDTHS) {
  for (const route of ROUTES) {
    test(`${width}px ${route} — no text renders under ${FLOOR_PX}px`, async ({ page }) => {
      /* RED WHEN: any font-size in src/styles/ that this package raised goes
         back under 0.6875rem, or a new component ships a label below it. The
         population is derived from the DOM, so a new surface is under this gate
         the moment it renders — no allowlist to forget (DEF-10, DEF-44). */
      await page.setViewportSize({ width, height });
      await page.goto(route, { waitUntil: 'networkidle' });
      /* Fonts change glyph metrics and metrics change nothing about font-size —
         but they change WRAP points, and an element that has not wrapped yet can
         still be mid-layout with no client rects. D111 paid three CI rounds for
         skipping this wait in geometry.spec.js. */
      await page.evaluate(() => document.fonts.ready);

      const { measured, under } = await page.evaluate(measure, FLOOR_PX);

      /* PARTNER ASSERTION, first, because the check below it is a check that
         counts nothing. This one proves the thing counted exists. */
      const floor = minTextOwners(route);
      expect(
        measured,
        `only ${measured} elements own visible text on ${route} at ${width}px — ` +
          `expected more than ${floor}. This test measured nothing, so its "0 violations" means nothing.`,
      ).toBeGreaterThan(floor);

      expect(
        under.map((u) => `${u.px}px  ${u.sel}  "${u.text}"`),
        `${under.length} of ${measured} text elements render under ${FLOOR_PX}px on ${route} at ${width}px`,
      ).toEqual([]);
    });
  }
}
