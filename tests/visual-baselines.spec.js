import { test, expect } from '@playwright/test';
import {
  CLIP_HEIGHT,
  NAV_BAND_HEIGHT,
  assertClipFits,
  clipOf,
  expectVisible,
  openHomePage,
} from './lib/viewport-clip.mjs';

// DEF-4. No visual regression baselines existed anywhere in the suite.
// dod.spec.js's "Evidence capture" block produces screenshots for a HUMAN to
// look at — it never compares a pixel to anything, so a plate shifting, the
// nav overlapping, or a seam gap changing passed every gate silently as long
// as no a11y rule or contrast threshold was crossed. This is a floor, not
// full-route coverage: the home page's nav and plate boundaries only.
//
// Viewport widths reuse dod.spec.js's own "no horizontal scroll" set — that
// test is what already establishes 390/768/1440 as this project's breakpoints,
// rather than inventing a fourth list or relying only on the two Playwright
// `projects` (desktop/mobile).
//
// Plate ids are derived from the DOM (DEF-10's pattern, not a hand-typed
// list) — see dod.spec.js:79 and boundary-check.mjs:64 for the same derivation.
//
// Baselines are NOT hand-generated on a laptop: they are produced by a CI run
// on the same ubuntu-latest/chromium image gates.yml uses, and only that run's
// artifacts are committed. DEF-59's guard now refuses the laptop write
// mechanically rather than asking nicely. See the PR description for the run
// that generated the committed PNGs.
//
// DEMOTED 2026-08-24 by DEF-54. This file is no longer the precise gate on
// layout — tests/geometry.spec.js is. Precision is now geometry's job, and
// this is a deliberately coarse catastrophe net plus the PNG a human can look
// at.
//
// WHY THE DEMOTION. The header above states this file's job as "a plate's box
// moves or resizes, or a seam gap changes". Every one of those is a NUMBER,
// and this file compares photographs of them. On a type-heavy site the noise
// in that photograph IS text: measured against CI regeneration run
// 32711313743, an untouched plate drifted 3.17% while a plate that gained a
// whole button changed 2.42% — the noise EXCEEDS the signal, so no threshold
// orders them correctly. Two options were refuted by measurement and must not
// be re-proposed: tuning this ratio, and raising the per-pixel colour
// threshold (swept >12 to >120; the noise is glyph re-hinting flipping
// #f2ebdd to #1b2440, a maximal delta, not soft anti-aliasing).
//
// RED WHEN: more than 15% of the captured frame changes — a figure vanishes,
// the self-hosted fonts fail to load and metrics fall back to a system face,
// the ground colour inverts, or the page renders blank. Measured (DEF-54,
// df551e9 vs 2db0eb6): D112's copy button repainted 22.19% at 390px and 21.48%
// at 768px, both still red here; it repainted 0.82% at 1440px, which this gate
// cannot see and geometry.spec.js now owns.
//
// RE-MEASURED UNDER THE FIXED CLIP, DEF-56. Three catastrophes were run as real
// page mutations and watched go red, and the numbers are Playwright's own:
//   body{display:none}      every capture red, on expectVisible() from
//                           lib/viewport-clip.mjs — ".site-nav is not visible",
//                           "#top is not visible". Its PIXEL ratio would NOT
//                           have carried it: with the html ground still painted
//                           dark, only 8 of the 30 frames crossed 0.15.
//   .plate ground -> #fff   red at all three widths — plate-contact-390 0.16,
//                           plate-contact-768 0.33, plate-proof-1440 0.30. The
//                           nav captures stay green, correctly: the bar's
//                           ground is a pinned :root constant and not
//                           var(--ground), per palette.css RCA-003.
//   .plate-figure hidden    red at 768 (plate-top 0.38) and 1440 (plate-top
//                           0.22); GREEN at 390, because at that width the
//                           figure sits below the copy and so below the fold of
//                           the clip. geometry.spec.js catches it there instead
//                           and says exactly what moved: 14 breaches at 390,
//                           including `plate.top 2486 -> 1082`.
// The 390px margins are thin (0.16 against a 0.15 threshold). That is the
// demotion working as designed, not a number to re-tune: DEF-54 refuted tuning
// by measurement, and precision belongs to geometry.spec.js.
//
// DEF-56, 2026-08-25 — WHAT THIS FILE NOW CAPTURES AND WHY.
// The mechanism and its evidence live in tests/lib/viewport-clip.mjs; this file
// owns what is captured and what counts as a catastrophe. In short: it captures
// a FIXED-SIZE VIEWPORT CLIP, not the element's own box. The clip
// is the whole reason: an element crop is as tall as the element, so a plate
// growing by one pixel changed the IMAGE SIZE, and Playwright rejects a size
// mismatch BEFORE any pixel comparison runs. MAX_DIFF_PIXEL_RATIO never
// executed. Measured on this branch, old capture against a plate made 1px
// taller: "Expected an image 390px by 1334px, received 390px by 1335px" — a
// hard error with no diff image and no ratio applied. That is the failure mode
// that cost D111 three CI rounds and left fourteen baselines stale by exactly
// 1px in DEF-55. Under the fixed clip the same mutation produced a pixel
// comparison the ratio absorbed. Every capture is now 390/768/1440 wide by
// CLIP_HEIGHT tall by construction, so a size mismatch cannot happen.
//
// A CLAIM THIS CHANGE DOES **NOT** DELIVER — corrected here rather than
// repeated. DEF-56's ledger row and the previous version of this header both
// said a fixed-size region "would also let this file see a plate MOVE". That is
// FALSE, and it was tested before being written down. The loop calls
// `scrollIntoView({ block: 'start' })` on every plate before capturing, so a
// plate pushed down the document still lands at the top of the viewport and the
// clip is unchanged. Measured, both mutations green on all six captures:
// `#quorum { margin-top: 200px }` (a middle plate) and
// `#contact { margin-top: 200px }` (the LAST plate — the scroll still reaches
// its top, because contact is at least as tall as the viewport at every width,
// so not even the end of the document makes a move visible).
// Seeing a plate move is geometry.spec.js's job and it does it exactly:
// the same mutation gives `plate.quorum [0,390,1361,0] -> [0,390,1361,200]
// (off by 200, slack 1)`.
//
// THE COVERAGE THIS COSTS, stated rather than smuggled in. An element crop was
// as tall as the plate; a viewport clip is CLIP_HEIGHT tall, so anything below
// the fold of a tall plate leaves this gate's view. Measured against a 900px
// clip on the heights of the committed linux baselines — all 27 plate captures
// are taller than the clip, 17 by more than 20px:
//
//    width  captures  worst case                          median seen
//    390    9 of 9    plate-top   2469px, 900px seen 36%   68%
//    768    9 of 9    plate-top   1597px, 900px seen 56%   80%
//    1440   9 of 9    plate-top   1019px, 900px seen 88%   99.9%
//
// At 1440 the other eight plates are 901px tall, so they lose one pixel and
// nothing else; at 390 and 768 the loss is real — plate-private-768 shows 59%,
// plate-proof-390 64%.
//
// THIS IS ACCEPTED, and it would not be for a precise gate. The reasons, in
// order: the file is a catastrophe net and every item in its RED WHEN list is
// page-wide rather than confined to one plate's lower half;
// tests/geometry.spec.js measures every plate box and row at full height with
// 1px slack and zero slack on counts, so the fold costs it nothing; and a
// coarse net that always RUNS beats a precise one that hard-errors on a size
// mismatch before it compares anything. The one case measured here where the
// fold does hide a real change — figures hidden at 390px — geometry.spec.js
// caught with 14 named breaches. If the fold ever starts hiding something
// geometry does NOT measure, this trade stops being acceptable and the answer
// is a taller CLIP_HEIGHT, not a second element crop.
//
// DEF-65 INTERACTION, reported not assumed. DEF-65 records that regenerating
// only the tracked linux set leaves the untracked local darwin set stale. Under
// the old element crop that staleness surfaced as six SIZE mismatches on this
// laptop (plate-top off by 46px at 390, 35px at 768, 28px at 1440). Under a
// fixed clip those become pixel comparisons. That is a real reduction in local
// noise and a real reduction in local signal, and the second half is why the
// darwin set is a developer convenience and never a gate: only the linux
// baselines are committed, only they are what CI reads, and gates.yml compares
// them on the runner that made them.
const WIDTHS = [390, 768, 1440];

// D109/D110 fallout: regenerating Linux baselines for a real change (the
// hero plate growing) exposed that this file had zero tolerance configured
// — Playwright's bare default. Three straight CI runs each failed a
// DIFFERENT plate (#proof, then #overview) at ~1-2% pixel drift with
// provably identical content (compared old vs. freshly-captured bytes and
// pixels directly — no visible difference). That is anti-aliasing/font-
// hinting jitter between separate headless-Chromium renders, not a
// regression: whack-a-mole patching whichever plate flaked that run would
// never converge.
//
// DEF-54 raised it 0.03 -> 0.15. This is NOT the rejected "tune the ratio"
// option, which tried to keep this gate precise by picking a better number and
// was refuted because noise exceeds signal at every number. It is the opposite
// move: this gate stops being the precise one, so the number is set to a level
// that cannot fire on render noise at all. 0.15 is 4.5x the worst noise ever
// observed here (3.28%) and still well under the 21-22% a real content change
// repaints. Precision moved to tests/geometry.spec.js.
const MAX_DIFF_PIXEL_RATIO = 0.15;

test.describe('Visual baselines — home page nav and plate boundaries', () => {
  // DENOMINATOR: a screenshot loop over zero elements must not pass
  // vacuously. Prove both lists have members before any comparison runs.
  // RED WHEN: empty WIDTHS, or change the `.plate[id]` selector to one the
  // page has none of — proved on this branch with `.plate-does-not-exist[id]`.
  test('widths and plate ids under test are non-empty', async ({ page }) => {
    expect(WIDTHS.length, 'no viewport widths configured').toBeGreaterThan(0);
    await page.goto('/', { waitUntil: 'networkidle' });
    const plateIds = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));
    expect(plateIds.length, 'no plates found — this baseline would measure nothing').toBeGreaterThan(0);
  });

  for (const width of WIDTHS) {
    // RED WHEN: the nav bar loses its ground, its wordmark, or its links; or
    // NAV_BAND_HEIGHT drops below the bar's height so part of it leaves frame.
    test(`nav at ${width}px`, async ({ page }) => {
      await openHomePage(page, width);
      await assertClipFits(page, width, NAV_BAND_HEIGHT);
      await expectVisible(page, '.site-nav');
      await expect(page).toHaveScreenshot(`nav-${width}.png`, clipOf(width, NAV_BAND_HEIGHT, MAX_DIFF_PIXEL_RATIO));
    });

    // RED WHEN: more than 15% of any plate's top CLIP_HEIGHT pixels repaint, or
    // a plate stops being visible. Proved on this branch by mutation, with the
    // ratios in the RE-MEASURED block at the top of this file:
    // `body{display:none}`, `.plate { --ground: #fff }`, and
    // `.plate-figure { display: none }` (the last one at 768 and 1440 only —
    // that gap is stated in the coverage block above, not hidden).
    test(`plate boundaries at ${width}px`, async ({ page }) => {
      await openHomePage(page, width);
      await assertClipFits(page, width, CLIP_HEIGHT);

      const plateIds = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));
      // DENOMINATOR, per-test: the selector could break independently of the
      // list-level check above, over just this page/width.
      expect(plateIds.length, 'no plates found — this baseline would measure nothing').toBeGreaterThan(0);

      for (const id of plateIds) {
        await page.evaluate(
          (p) => document.getElementById(p)?.scrollIntoView({ behavior: 'instant', block: 'start' }),
          id,
        );
        await page.waitForTimeout(900); // the ground cross-fade is 0.8s, per dod.spec.js
        await expectVisible(page, `#${id}`);
        const name = `plate-${id}-${width}.png`;
        await expect(page).toHaveScreenshot(name, clipOf(width, CLIP_HEIGHT, MAX_DIFF_PIXEL_RATIO));
      }
    });
  }
});
