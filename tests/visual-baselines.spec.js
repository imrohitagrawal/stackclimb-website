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
// RED WHEN: the nav's layout shifts, a plate's box moves or resizes, or a
// seam gap changes — any pixel drift Playwright's default threshold catches.
const WIDTHS = [390, 768, 1440];

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
      await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important}',
      });
      await page.waitForTimeout(400);
      await expect(page.locator('.site-nav')).toHaveScreenshot(`nav-${width}.png`);
    });

    test(`plate boundaries at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.goto('/', { waitUntil: 'networkidle' });
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
        await expect(page.locator(`#${id}`)).toHaveScreenshot(`plate-${id}-${width}.png`);
      }
    });
  }
});
