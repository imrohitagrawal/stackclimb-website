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
// WHICH CHANGE TURNS IT RED — run as a mutation before shipping, recorded in
// docs/STATUS.md D130: remove `homeCrop: true` from `citevyn` in
// src/data/projects.js — the full capture returns to the home plate at 0.41.
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Mobile. At 390 the column is 270px and every panel, crop included, sits
//     at 0.30–0.39 — a floor there is either vacuous or unmeetable. The alt text
//     and the provenance line carry the claim on a phone (Shot.astro says so).
//   - Whether the crop carries the RIGHT region. Scale is a proxy for
//     legibility, not for truth; the alt text names what must be in frame and
//     the render is looked at (Definition of Done item 2).
//   - Project pages. They show the full capture on purpose — D62 in
//     src/pages/projects/[slug].astro — and are read, not skimmed.

import { test, expect } from '@playwright/test';

/* Half its natural width. Measured 2026-08-26 before the fix: 0.41 and 0.30
   fail, 0.68 and 0.53 pass; after it, the two new strips land at 0.67 and 0.66.
   A margin of 0.03 on the tightest passing panel (NarraTwin's design at 0.53)
   is thin and deliberate — that panel is a labelled design, not a capture, and
   its text is drawn larger; raising the floor would demand a recut of an asset
   the owner approved (D67). Recorded, not rounded. */
const MIN_SCALE = 0.5;

/* Every system on the home page ships a panel — SystemPlate.astro requires the
   image or throws at build. The floor is a DENOMINATOR: four systems, four
   panels; a count under it means the walk found nothing and its empty
   violation list proves nothing. */
const MIN_PANELS = 4;

test('/ at 1440 — every home artefact panel renders at half its natural width or more', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  /* The panels are lazy-loaded and below the fold, so naturalWidth reads 0
     until each is scrolled into view and decoded — the first probe reported
     0x0 for three of the four and "Infinity" as their scale. */
  const panels = await page.$$eval('.plate[id] .artefact-shot img', async (imgs) => {
    for (const img of imgs) {
      img.scrollIntoView();
      if (!img.complete || !img.naturalWidth) {
        await new Promise((r) => { img.onload = r; img.onerror = r; setTimeout(r, 5000); });
      }
      try { await img.decode(); } catch { /* a decode error still leaves naturalWidth to read */ }
    }
    return imgs.map((img) => ({
      plate: img.closest('.plate[id]').id,
      natural: img.naturalWidth,
      rendered: img.getBoundingClientRect().width,
      src: img.currentSrc.split('/').pop(),
    }));
  });

  /* PARTNER FIRST: the population exists and every image really loaded. An
     image that never decoded has naturalWidth 0 and would divide to Infinity —
     a "pass" that measured nothing. */
  expect(panels.length, `only ${panels.length} home panels found — expected at least ${MIN_PANELS}`)
    .toBeGreaterThanOrEqual(MIN_PANELS);
  expect(
    panels.filter((p) => !(p.natural > 0)).map((p) => `${p.plate} ${p.src}`),
    'panels whose image never loaded (naturalWidth 0) — scale cannot be measured',
  ).toEqual([]);

  /* RED WHEN: a full capture is served where the crop should be — see the
     header. Reports the plate, the file and the ratio, not just "failed". */
  const small = panels
    .filter((p) => p.rendered / p.natural < MIN_SCALE)
    .map((p) => `#${p.plate} ${p.src}: ${Math.round(p.rendered)}px of ${p.natural}px` +
      ` = ${(p.rendered / p.natural).toFixed(2)}`);
  expect(small, `home panels rendered below ${MIN_SCALE} of natural width at 1440`).toEqual([]);
});
