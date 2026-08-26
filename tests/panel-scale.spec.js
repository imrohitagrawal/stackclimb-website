// The artefact panels are the system's own output, shown whole and shown as
// they are — DESIGN.md's Lit-Surface Rule as the owner amended it on 2026-08-27.
//
// WHAT THIS GATE HELD, AND WHAT IT HOLDS NOW. DEF-70 measured two home panels
// at 0.41 and 0.30 of their natural size and D130 cropped both to a strip you
// could read, holding a floor of 0.5 here. The owner reviewed the renders and
// overruled the floor (D135): a strip that drops CiteVyn's left rail "does not
// make sense", because the whole application is what tells a reader what the
// system is; SaafSaans keeps its strip, widened to carry the app's header row.
// Scale is no longer the rule — the whole picture is — so the floor is gone,
// and this file keeps the two obligations that survive that ruling:
//   1. one panel per system, none missing, none duplicated;
//   2. no panel is blown UP past its own pixels (shot.css sets width: 100%, so
//      a crop narrower than the column would stretch and blur), and every
//      panel really loaded and is really painted.
//
// WHICH CHANGE TURNS IT RED — run as mutations before shipping, recorded in
// docs/STATUS.md D135:
//   1. Replace quorum-crop.webp with a 200px-wide copy — the CEILING partner
//      goes red (rendered 477px of 200px).
//   2. `.artefact-shot img { visibility: hidden }` — the PAINTED partner goes red.
//   3. Delete the `saafsaans` entry's `shot` — the build throws in Shot.astro
//      before this test runs; and a plate without a panel fails the per-system
//      check, proved by removing `<Shot>` from SystemPlate in a copy.
//
// WHAT IT DOES NOT COVER, said rather than left to be discovered:
//   - Legibility. The owner's ruling puts the whole capture on the desktop
//     plate at 0.41 (CiteVyn) and the header-to-chips strip at 0.39
//     (SaafSaans). Those numbers are recorded in D135 and are not gated.
//   - Whether the crop carries the RIGHT region: the alt text names what must
//     be in frame and the render is looked at (Definition of Done item 2).
//   - Opacity, `transform: scale()`, `srcset` downsamples — as before, shared
//     with every gate that reads computed geometry; none appears in src/.
//   - Project pages. They show the full capture on purpose (D62).

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';

/* Every system in projects.js ships a panel on the home page — SystemPlate.astro
   requires the image or throws at build. Derived from the data, not a count. */
const SYSTEMS = Object.keys(projects).sort();

test.skip(({ isMobile }) => isMobile, 'measured once, at 1440 — the ceiling does not depend on width');

const title = '/ at 1440 — every system shows one panel, loaded, painted, never larger than its own pixels';
test(title, async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto('/', { waitUntil: 'networkidle' });

  /* Lazy-loaded and below the fold: naturalWidth reads 0 until each image is
     scrolled into view and decoded. Both waits are bounded so a missing image
     fails the partner with its name, not the 30s test timeout with none. */
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

  expect(panels.map((p) => p.plate).sort(), 'plates carrying a panel — expected exactly the systems in projects.js')
    .toEqual(SYSTEMS);
  expect(
    panels.filter((p) => !(p.natural > 0)).map((p) => `${p.plate} ${p.src}`),
    'panels whose image never loaded (naturalWidth 0)',
  ).toEqual([]);
  expect(
    panels.filter((p) => !p.painted).map((p) => `${p.plate} ${p.src}`),
    'panels whose image is not painted (hidden, display: none, or a zero box)',
  ).toEqual([]);
  /* RED WHEN: a crop narrower than the 477px column is shipped. */
  expect(
    panels
      .filter((p) => p.rendered > p.natural + 0.5)
      .map((p) => `${p.plate} ${p.src}: ${Math.round(p.rendered)}px of ${p.natural}px`),
    'panels rendered LARGER than their own pixels — an upscaled, blurred crop',
  ).toEqual([]);
});
