// RCA-015 (P5): two of the site's most persuasive passages sit past the
// bottom of a default phone screen. On /how-i-build the fold lands ON the
// words "This is a PROXY" — the reader gets the watchdog's claim and none of
// its stated limit. On /experience the closing sentence carrying the whole
// argument sits 70.6px below the fold, so six employers read as a bare list.
//
// WHY THIS FILE IS NOT CALLED "fold". `tests/lib/fold.mjs` is the repo's
// Unicode case-FOLDING helper, and content-model.spec.js already uses the
// phrase "above the fold" to mean DOM containment. A third meaning for one
// word is the name-that-lies class DEF-64 and DEF-67 are both about, so this
// asserts what it actually measures: an element must REACH above a stated
// viewport height.
//
// WHAT NOTHING ELSE CAUGHT, and why. geometry.spec.js compares boxes to a
// baseline and both routes MATCH it — a correctly-positioned element that
// happens to sit below the fold is not a geometry failure. dod.spec.js's
// overflow gate compares scrollWidth with clientWidth: horizontal only. axe
// reports 0 violations, because reading order below the fold is not an
// accessibility violation. The bottom<innerHeight IDIOM does exist here
// (boundary-check.mjs) but only as a filter for finding a visible node
// inside a seam-contrast probe; nothing ASSERTS where content sits.
//
// WHAT THIS GATE STILL DOES NOT CATCH, named because an unstated limit is
// the thing this site exists to argue against. The position, paint, height
// and text assertions together reject a deleted, hidden, blurred, clipped,
// off-screen, scaled, or shrunk target — all mutation-proved. They do NOT
// reject: an opaque element positioned over the target (needs hit-testing),
// `text-indent: -9999px` with the box intact, or transparent 1px descendant
// text inside a padded container that keeps the outer height. `mustSay` is
// also a PHRASE check, not a token one — the repo's own arize/summarize
// lesson applies, and `PROXYING` would satisfy it. Those are covered, if at
// all, by how-i-build.spec.js's content assertions and the visual baselines,
// not here.
//
// RED WHEN: revert either fix and this file fails.
//   - move `.artefact` back below the three .model-band blocks in
//     src/pages/how-i-build.astro -> the panel bottom returns to 1088.1px
//     against an 844px viewport.
//   - delete the `#evolution .plate-copy` flex/order block in experience.css
//     -> .era-closing returns to a 1034.3px bottom.
// Both measured on the pre-fix build, not assumed.

import { test, expect } from '@playwright/test';
import { NEUTRALIZE_MOTION } from './lib/geometry-measure.mjs';
import { waitForFonts } from './lib/viewport-clip.mjs';
import { painted } from './lib/painted.mjs';
import { platedRoutes } from './lib/routes.mjs';

/* The reference phone. NOT a Playwright project viewport — the projects are
   desktop 1440x900 and mobile Pixel 7 (412x839) — so it is stated here as a
   deliberate choice and checked at BOTH, because a fix that only clears the
   more generous of the two has not cleared the real device. 844 is also the
   URL-bar-HIDDEN height; a phone showing its chrome gives ~745px, which is
   why .plate uses min-height:100svh.

   745 IS ASSERTED, NOT ASSUMED. A first draft claimed in this comment that
   both targets clear 745 while only testing 844 and 839 — a stated fact no
   test enforced, which a different-model reviewer flagged as exactly the kind
   of claim this repo bars. It is now a third row, so the claim and the check
   are the same thing. */
const PHONES = [
  { name: 'reference-390', width: 390, height: 844 },
  { name: 'pixel7-412', width: 412, height: 839 },
  { name: 'url-bar-shown-390', width: 390, height: 745 },
];

/* Route -> what must reach above the fold on a phone. The default for a
   plated route with no entry is BREACH, not skip (see the audit below): a
   hand-typed map that silently passes for anything it forgot is the exact
   shape that failed twice here, recorded at routes.mjs and
   geometry-floor.mjs. */
const REACH = {
  '/how-i-build': {
    selector: '.artefact',
    why: 'the verbatim watchdog quote, its PROXY limit and its citation',
    // Measured 501.3px at 390x844 after the hoist. The floor is deliberately
    // well under that: it must reject a shrunk panel, not pin a layout.
    //
    // KNOWN LIMIT, stated rather than implied: this is a tripwire, not a
    // correctness threshold. `min-height: 301px` around truncated content
    // would still pass, and a legitimately shorter quote would false-red.
    // The false red is acceptable because it is LOUD and self-announcing —
    // whoever shortens the text is the person who sees it — whereas the
    // silent version, a panel shrunk to fit, is the failure P-28 forbids.
    minHeight: 300,
    mustSay: 'This is a PROXY',
  },
  '/experience': {
    selector: '.era-closing',
    why: 'the sentence stating the throughline the six employers are evidence for',
    // 119.7px measured at 390x844. Same tripwire caveat as above; a much
    // terser rewrite could false-red, and that is the tolerable direction.
    minHeight: 80,
    mustSay: 'The thread through all six',
  },
};

/* Routes with no reach requirement, each with its reason. Being listed here
   is a DECISION; being absent from both maps is a breach. */
const NO_REQUIREMENT = {
  // CORRECTED 2026-08-30 (RCA-016). This read "its hero is already gated by
  // plate-height.spec.js" — which is FALSE, and it shipped. plate-height.spec.js's
  // `EXEMPT` set is `new Set(['top'])` and #top IS the hero: it is the one
  // plate that spec deliberately does not measure, per D27. So the excuse
  // cited as proof the single gate that exempts the thing it was excusing.
  // Nothing gates the home hero, and that is a recorded decision (D27 lets it
  // run long), not an oversight — but it must be stated as a decision, not
  // dressed up as coverage. Measured 2026-08-30 at 390x844: the hero is
  // 2483px = 2.94 viewports and .practice-panel runs y=814.9 to y=1914.2. A
  // first version of this comment said "entirely below the fold" — wrong by
  // 29px, and wrong in a comment whose whole subject is excuse strings that
  // overstate. Accurately: the panel's top edge crosses the fold, its head is
  // cut by it, and no practice ROW is above it (the first starts at y=917).
  // Whether that should change is the owner's call and is recorded in
  // RCA-016, not silently fixed here.
  '/':
    'D27 deliberately lets the home hero run long, and plate-height.spec.js EXEMPTS it, ' +
    'so nothing gates its reach. That is a decision, not coverage — see RCA-016.',
  '/cv': 'a document that prints, not a page with a fold (D31)',
  '/projects/citevyn':
    'a project page leads with its figure and states its claim in the opening plate; ' +
    'nothing below the fold carries the argument',
  '/projects/quorum': 'same shape as /projects/citevyn — figure first, claim in the opening plate',
  '/projects/saafsaans': 'same shape as /projects/citevyn — figure first, claim in the opening plate',
  '/projects/narratwin':
    'same shape as /projects/citevyn — figure first, and its No-Go gate line ' +
    'sits in the opening plate',
};

/* The audit's first run was RED and it was right: this map was typed with
   /projects/quorum-ai, /projects/saaf-saans and a /contact route, none of
   which exist. Precisely: it fired because the three REAL routes then had no
   entry, not because the three bogus keys were rejected — the stale-key check
   in the audit was added afterwards, when a reviewer pointed that out. That
   is the argument for defaulting an unmapped route to breach. */

async function reachOf(page, route, spec, width, height) {
  const { selector, minHeight, mustSay } = spec;
  await page.setViewportSize({ width, height });
  await page.goto(route, { waitUntil: 'networkidle' });
  await page.addStyleTag({ content: NEUTRALIZE_MOTION });
  await waitForFonts(page);
  const loc = page.locator(selector);
  // THE VACUITY PARTNER. boundingBox() returns null for a missing or hidden
  // element, so a bare "bottom < height" with a null-guard would certify a
  // DELETED element as reaching above the fold — a check that goes green when
  // the thing it protects is gone. Existence and paintedness are asserted
  // first, so the number below can only be read off something a visitor sees.
  await expect(loc, `${selector} must exist on ${route}`).toHaveCount(1);
  expect(await painted(loc), `${selector} must be painted on ${route}`).toBe(true);
  const box = await loc.boundingBox();
  expect(box, `${selector} must have a box on ${route}`).not.toBeNull();

  // THE SHRINK-TO-FIT PARTNER, and it is the whole reason this file is not
  // just `bottom < height`. A purely positional assertion passes on an
  // element made to fit by being unreadable: measured, `height: 1px;
  // overflow: hidden` on .artefact puts its bottom at 279.3px against an
  // 844px screen and the position check goes GREEN, as do `font-size: 1px`,
  // `transform: scale(0.02)` and `content-visibility: hidden` — none of
  // which painted() rejects, because it has no size floor.
  //
  // That is not a theoretical hole. Owner ruling P-28 is that the quote is
  // NOT shortened — the panel moves instead. Without these two assertions
  // this gate would go green on exactly the fix he refused.
  expect(
    box.height,
    `${route}: ${selector} is only ${box.height.toFixed(1)}px tall. It is not above the fold ` +
      `because it was composed to fit — it is above the fold because it was shrunk.`,
  ).toBeGreaterThan(minHeight);
  // toContainText reads textContent, which INCLUDES hidden text — so this
  // assertion alone cannot catch a hidden paragraph. Measured: hiding the
  // PROXY paragraph leaves toContainText green and is caught only by the
  // height floor above (246.7px < 300). The two are partners, not
  // alternatives; neither is redundant, and removing either opens a hole.
  await expect(
    loc,
    `${route}: ${selector} must still carry "${mustSay}" — the words this gate exists to keep visible`,
  ).toContainText(mustSay);
  return box;
}

test.describe('viewport reach — the passage that carries the argument is visible without scrolling', () => {
  for (const [route, { selector, why }] of Object.entries(REACH)) {
    for (const phone of PHONES) {
      test(`${route} — ${selector} reaches above ${phone.width}x${phone.height} (${phone.name})`, async ({
        page,
      }) => {
        const box = await reachOf(page, route, REACH[route], phone.width, phone.height);
        expect(
          box.y + box.height,
          `${route}: ${selector} holds ${why}. Its bottom is ${(box.y + box.height).toFixed(1)}px ` +
            `against a ${phone.height}px screen, so a visitor must scroll to finish reading it.`,
        ).toBeLessThan(phone.height);
      });
    }
  }

  /* THE AUDIT. Without it this file is a list of two routes that happens to
     pass, and a new plated route would join the site with no requirement and
     no failure. A route must appear in exactly one of the two maps. */
  test('every plated route is either required to reach or excused, with a reason', async () => {
    const routes = await platedRoutes();
    expect(routes.length, 'platedRoutes() must find routes at all').toBeGreaterThan(2);
    const unaccounted = routes.filter((r) => !(r in REACH) && !(r in NO_REQUIREMENT));
    expect(
      unaccounted,
      `these plated routes appear in neither REACH nor NO_REQUIREMENT: ${unaccounted.join(', ')}. ` +
        'Add a reach requirement or an excuse with its reason — silence is a breach, not a pass.',
    ).toEqual([]);
    for (const [route, reason] of Object.entries(NO_REQUIREMENT)) {
      expect(reason.length, `${route}'s excuse must state a reason`).toBeGreaterThan(20);
    }
    // Two ways the audit above still passed while being wrong, both found by
    // an adversarial reviewer running the maps through it: a route listed in
    // BOTH maps (a contradiction — required and excused at once), and a stale
    // excuse for a route that no longer exists, which lets dead entries
    // accumulate unnoticed. Neither is caught by the unaccounted-for check,
    // because that only looks at real routes missing from both maps.
    const contradictory = Object.keys(NO_REQUIREMENT).filter((r) => r in REACH);
    expect(
      contradictory,
      `these routes are both required to reach and excused: ${contradictory.join(', ')}`,
    ).toEqual([]);
    const stale = Object.keys(NO_REQUIREMENT).filter((r) => !routes.includes(r));
    expect(
      stale,
      `these excused routes do not exist: ${stale.join(', ')}. A dead excuse is not a decision.`,
    ).toEqual([]);
  });
});
