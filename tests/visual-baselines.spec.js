import { test, expect } from '@playwright/test';

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
// on the same ubuntu-latest/chromium image gates.yml uses
// (`npx playwright test tests/visual-baselines.spec.js --update-snapshots`),
// and only that run's artifacts are committed. See the PR description for the
// run that generated the committed PNGs.
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
// RED WHEN: more than 15% of a plate's rendered area changes — a figure
// vanishes, the self-hosted fonts fail to load and metrics fall back to a
// system face, the ground colour inverts, or the page renders blank. Measured
// (DEF-54, df551e9 vs 2db0eb6): D112's copy button repainted 22.19% at 390px
// and 21.48% at 768px, both still red here; it repainted 0.82% at 1440px,
// which this gate cannot see and geometry.spec.js now owns.
//
// A LIMIT THIS DEMOTION DOES NOT FIX, stated rather than left to be
// rediscovered: a one-pixel SIZE difference still fails HARD and no ratio can
// absorb it, because Playwright rejects a size mismatch before any pixel
// comparison runs. That is the failure mode that cost D111 three CI rounds and
// left fourteen baselines stale by exactly 1px in DEF-55. Raising the ratio
// does nothing about it. The fix is to capture a fixed-size region instead of
// the element's own box (a viewport clip), which would also let this file see
// a plate MOVE — something an element crop never could. Deferred to its own
// change and recorded in docs/STATUS.md rather than bundled in here.
const WIDTHS = [390, 768, 1440];

// D109/D110 fallout: regenerating Linux baselines for a real change (the
// hero plate growing) exposed that this file had zero tolerance configured
// — Playwright's bare default. Three straight CI runs each failed a
// DIFFERENT plate (#proof, then #overview) at ~1-2% pixel drift with
// provably identical content (compared old vs. freshly-captured bytes and
// pixels directly — no visible difference). That is anti-aliasing/font-
// hinting jitter between separate headless-Chromium renders, not a
// regression: whack-a-mole patching whichever plate flaked that run would
// never converge. 0.03 sits comfortably above the worst noise observed
// (0.02) and far below any real content diff seen so far (0.31-0.56 for
// an actual hero-height change) — still catches a real regression, stops
// catching noise that was never a defect in the page.
//
// DEF-54 raised it 0.03 -> 0.15. This is NOT the rejected "tune the ratio"
// option, which tried to keep this gate precise by picking a better number and
// was refuted because noise exceeds signal at every number. It is the opposite
// move: this gate stops being the precise one, so the number is set to a level
// that cannot fire on render noise at all. 0.15 is 4.5x the worst noise ever
// observed here (3.28%) and still well under the 21-22% a real content change
// repaints. Precision moved to tests/geometry.spec.js.
const MAX_DIFF_PIXEL_RATIO = 0.15;

// A FOURTH run then failed differently: #private off by exactly 1px of
// height (1340 vs 1341) at two widths — a dimension mismatch, which
// maxDiffPixelRatio cannot absorb (Playwright refuses to pixel-compare
// unless the two images are the same size). Root cause traced to
// global.css's self-hosted variable fonts (Bodoni Moda, Archivo): `goto`'s
// `networkidle` waits for the font network request to finish, not for the
// browser to finish applying it to layout, so a screenshot can land either
// side of that reflow depending on how the CI run happens to schedule it —
// the same underlying race as the ratio-drift noise above, one plate's text
// wrap just happened to sit on a whole-pixel boundary. Waiting on
// `document.fonts.ready` closes the gap at its source instead of adding a
// fifth plate to a whack-a-mole list.
const waitForFonts = (page) => page.evaluate(() => document.fonts.ready);

test.describe('Visual baselines — home page nav and plate boundaries', () => {
  test('widths and plate ids under test are non-empty', async ({ page }) => {
    // DENOMINATOR: a screenshot loop over zero elements must not pass
    // vacuously. Prove both lists have members before any comparison runs.
    expect(WIDTHS.length, 'no viewport widths configured').toBeGreaterThan(0);
    await page.goto('/', { waitUntil: 'networkidle' });
    const plateIds = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));
    expect(plateIds.length, 'no plates found — this baseline would measure nothing').toBeGreaterThan(0);
  });

  for (const width of WIDTHS) {
    test(`nav at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await waitForFonts(page);
      await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important}',
      });
      await page.waitForTimeout(400);
      await expect(page.locator('.site-nav')).toHaveScreenshot(`nav-${width}.png`, {
        maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
      });
    });

    test(`plate boundaries at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
      await waitForFonts(page);
      await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important}',
      });
      await page.waitForTimeout(400);

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
        await expect(page.locator(`#${id}`)).toHaveScreenshot(`plate-${id}-${width}.png`, {
          maxDiffPixelRatio: MAX_DIFF_PIXEL_RATIO,
        });
      }
    });
  }
});
