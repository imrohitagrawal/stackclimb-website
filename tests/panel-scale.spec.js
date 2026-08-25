// The artefact panels are evidence at a size you can read — DESIGN.md's
// Lit-Surface Rule, held as a number.
//
// WHY THIS EXISTS. DEF-70: at desktop two of the four home panels showed their
// full capture squeezed into the 477px figure column — CiteVyn's 1160px capture
// at 0.41 of its size, SaafSaans' 1600px capture at 0.30 — so a 16px line in
// the capture met the reader at ~6.6px, and mono caps at ~3.3px. "A picture of
// evidence rather than evidence", in the rule's own words. Quorum and NarraTwin
// had already been given a home crop, for plate HEIGHT rather than legibility,
// and rendered at 0.68 and 0.53. Nothing measured any of it.
//
// WHICH CHANGE TURNS IT RED — run as mutations before shipping, recorded in
// docs/STATUS.md D130:
//   1. Remove `homeCrop: true` from `citevyn` in src/data/projects.js — the
//      full capture returns to the home plate at 0.41.
//   2. Replace quorum-crop.webp with a 200px-wide copy — the CEILING partner
//      goes red: shot.css stretches any crop to the column, and a crop blown up
//      to 2.4x is the same picture-of-evidence, blurred (a reviewer's finding).
//   3. `.artefact-shot img { visibility: hidden }` — the PAINTED partner goes
//      red; a box with a width is not a picture anyone sees (cross-model).
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Mobile. At 390 the column is 270px and every panel, crop included, sits
//     at 0.30–0.39 — a floor there is either vacuous or unmeetable. The alt text
//     and the provenance line carry the claim on a phone (Shot.astro says so).
//     The test runs once, at 1440; the mobile project skips it rather than
//     measure the identical numbers a second time.
//   - Whether the crop carries the RIGHT region. Scale is a proxy for
//     legibility, not for truth; the alt text names what must be in frame and
//     the render is looked at (Definition of Done item 2).
//   - A `srcset` candidate that is itself a downsample of the full capture:
//     naturalWidth describes the file served, not the capture it came from.
//     `transform: scale()` on the image: the box grows, the text does not. Both
//     contrived, neither in src/ (grepped 2026-08-26); shared with every gate
//     that reads computed geometry.
//   - Opacity. The plate reveal starts every below-the-fold plate at
//     `opacity: 0`, so an opacity test would go red mid-animation on a healthy
//     page — the same reason type-floor-measure.mjs does not consult it. A
//     round-2 reviewer named `.artefact-shot img { opacity: 0 }`; recorded.
//   - Project pages. They show the full capture on purpose — D62 in
//     src/pages/projects/[slug].astro — and are read, not skimmed.

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';

/* Half its natural width. Measured 2026-08-26 before the fix: 0.41 and 0.30
   fail, 0.68 and 0.53 pass; after it, the two new strips land at 0.67 and 0.65.
   A margin of 0.03 on the tightest passing panel (NarraTwin's design at 0.53)
   is thin and deliberate — that panel is a labelled design, not a capture, and
   its text is drawn larger; raising the floor would demand a recut of an asset
   the owner approved (D67). Recorded, not rounded. */
const MIN_SCALE = 0.5;

/* Every system in projects.js ships a panel on the home page — SystemPlate.astro
   requires the image or throws at build. Derived from the data, not a count,
   so a missing panel cannot be covered by a duplicate under another plate (a
   cross-model finding against the first draft's "at least four"). */
const SYSTEMS = Object.keys(projects).sort();

test.skip(({ isMobile }) => isMobile, 'measured once, at 1440 — see the header');

test('/ at 1440 — every home artefact panel renders at half its natural width or more', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The panels are lazy-loaded and below the fold, so naturalWidth reads 0
     until each is scrolled into view and decoded — the first probe reported
     0x0 for three of the four and "Infinity" as their scale. Both waits are
     bounded: an image that never arrives must fail the PARTNER below with its
     name, not the 30s test timeout with none (a reviewer's probe). */
  const panels = await page.$$eval('.plate[id] .artefact-shot img', async (imgs) => {
    const bounded = (p, ms) => Promise.race([p, new Promise((r) => setTimeout(r, ms))]);
    for (const img of imgs) {
      img.scrollIntoView();
      if (!img.complete || !img.naturalWidth) {
        await bounded(new Promise((r) => { img.onload = r; img.onerror = r; }), 5000);
      }
      await bounded(img.decode().catch(() => {}), 5000);
    }
    return imgs.map((img) => {
      const cs = getComputedStyle(img);
      const r = img.getBoundingClientRect();
      return {
        plate: img.closest('.plate[id]').id,
        natural: img.naturalWidth,
        rendered: r.width,
        painted: cs.visibility === 'visible' && cs.display !== 'none' && r.width > 0 && r.height > 0,
        src: img.currentSrc.split('/').pop(),
      };
    });
  });

  /* PARTNERS FIRST. (1) One panel per system, by plate id — the population is
     the data, not a number. (2) Every image really loaded: naturalWidth 0
     divides to Infinity, a "pass" that measured nothing. (3) Every image is
     painted: a hidden box still has a width. (4) No image is blown UP past its
     own pixels — shot.css sets width: 100%, so a crop narrower than the column
     stretches and blurs, which is the defect wearing the opposite sign. */
  expect(panels.map((p) => p.plate).sort(), 'plates carrying a panel — expected exactly the systems in projects.js')
    .toEqual(SYSTEMS);
  expect(
    panels.filter((p) => !(p.natural > 0)).map((p) => `${p.plate} ${p.src}`),
    'panels whose image never loaded (naturalWidth 0) — scale cannot be measured',
  ).toEqual([]);
  expect(
    panels.filter((p) => !p.painted).map((p) => `${p.plate} ${p.src}`),
    'panels whose image is not painted (hidden, display: none, or a zero box)',
  ).toEqual([]);
  expect(
    panels
      .filter((p) => p.rendered > p.natural + 0.5)
      .map((p) => `${p.plate} ${p.src}: ${Math.round(p.rendered)}px of ${p.natural}px`),
    'panels rendered LARGER than their own pixels — an upscaled, blurred crop',
  ).toEqual([]);

  /* RED WHEN: a full capture is served where the crop should be — see the
     header. Reports the plate, the file and the ratio, not just "failed". */
  const small = panels
    .filter((p) => p.rendered / p.natural < MIN_SCALE)
    .map((p) => `#${p.plate} ${p.src}: ${Math.round(p.rendered)}px of ${p.natural}px` +
      ` = ${(p.rendered / p.natural).toFixed(2)}`);
  expect(small, `home panels rendered below ${MIN_SCALE} of natural width at 1440`).toEqual([]);
});
