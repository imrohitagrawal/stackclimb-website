// RCA-013 (P3): `.plate-grid.one-col` / `.plate-copy.wide` were dead on
// /experience and /how-i-build — defined only in project.css, which neither
// page imported — so .plate-copy rendered at its 34rem fallback measure,
// 48.4% of the frame, instead of the near-full width the class names
// promise. Separately, `.era-org` used to carry its date range as an inline
// <span>, sharing one 52ch-capped wrapped run with the org/role text —
// orphaning the dates at narrow widths.
//
// A third item, `.plate-copy`'s missing `min-width: 0`, has its own targeted
// check below rather than a page-scrollWidth assertion: this page's only
// current unbreakable-content overflow risk is `.plate-title` (its own
// `overflow-wrap: anywhere` fix, RCA-013's addendum), which already closes
// page-level overflow on its own — a scrollWidth check can't isolate
// min-width's contribution while that mask is in place. The computed-style
// check below bites on exactly this property, independent of content.
//
// WHICH CHANGE TURNS EACH RED:
//   fill        revert the one-col.css import on either page (or delete
//               one-col.css's rules) — .plate-copy falls back to 34rem,
//               reproducing the 48.4% measurement in RCA-013.
//   min-width   remove `min-width: 0` from global.css's `.plate-copy` rule.
//   era-org     revert era-dates from a sibling <p> back to an inline <span>
//               inside era-org's own <p> — the nesting check goes red.
import { test, expect } from '@playwright/test';

const ONE_COL_ROUTES = ['/experience', '/how-i-build'];

test.describe('one-col grid fill — RCA-013', () => {
  for (const route of ONE_COL_ROUTES) {
    test(`${route}: .plate-grid.one-col reaches near-full frame width`, async ({ page }) => {
      // Desktop width, explicitly — RCA-013's own measurement was taken at
      // 1440px and this assertion means "the frame this class name promises
      // full width of", not whatever a project's default viewport happens
      // to be (both configured Playwright projects would otherwise run this
      // redundantly at two different widths).
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);

      const grids = page.locator('.plate-grid.one-col');
      const count = await grids.count();
      expect(count, `${route}: no .plate-grid.one-col element found — did the markup change?`)
        .toBeGreaterThan(0);

      for (let i = 0; i < count; i++) {
        const grid = grids.nth(i);
        const copy = grid.locator('.plate-copy').first();
        const copyBox = await copy.boundingBox();
        const frameBox = await grid.evaluate((el) => {
          const frame = el.closest('.plate-frame');
          const r = frame.getBoundingClientRect();
          return { width: r.width };
        });
        expect(copyBox, `${route} row ${i}: .plate-copy did not render`).toBeTruthy();
        const fill = copyBox.width / frameBox.width;
        expect(
          fill,
          `${route} row ${i}: .plate-copy fills only ${(fill * 100).toFixed(1)}% of the ` +
            `frame (${copyBox.width}px of ${frameBox.width}px) — the one-col class is dead again`,
        ).toBeGreaterThan(0.9);
      }
    });
  }
});

test.describe('.plate-copy min-width — RCA-013', () => {
  for (const route of ONE_COL_ROUTES) {
    test(`${route}: .plate-copy has min-width: 0, matching .plate-figure`, async ({ page }) => {
      // Direct property check, not a behavioral scrollWidth check — see the
      // header note on why a page-overflow assertion can't isolate this
      // fix's own contribution on this page's current content. EVERY
      // .plate-copy on the route, not just the first — both pages carry
      // more than one, and the rule is a single global class: checking one
      // instance would miss a regression scoped to another (self-review
      // finding, caught before it shipped).
      await page.goto(route, { waitUntil: 'networkidle' });
      const copies = page.locator('.plate-copy');
      const count = await copies.count();
      expect(count, `${route}: no .plate-copy element found`).toBeGreaterThan(0);
      for (let i = 0; i < count; i++) {
        const minWidth = await copies.nth(i).evaluate((el) => getComputedStyle(el).minWidth);
        expect(minWidth, `${route} .plate-copy #${i}: min-width is ${minWidth}, not 0px`).toBe('0px');
      }
    });
  }
});

test.describe('.era-org date range — RCA-013', () => {
  test('/experience: era-dates is a distinct row, not text wrapped inside era-org', async ({
    page,
  }) => {
    // A width narrow enough that the old combined "org — role  dates" phrase
    // would wrap mid-run and orphan the date range (RCA-013's finding).
    await page.setViewportSize({ width: 375, height: 900 });
    await page.goto('/experience', { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);

    const org = page.locator('.era-org').first();
    const dates = page.locator('.era-dates').first();

    // Structural: era-dates must not be a descendant of era-org — a
    // decoupled sibling cannot inherit era-org's 52ch cap and inline flow,
    // whatever the viewport width does to either box.
    const nested = await org.evaluate((el) => el.querySelector('.era-dates') !== null);
    expect(nested, '.era-dates is still nested inside .era-org — not decoupled').toBe(false);

    const orgBox = await org.boundingBox();
    const datesBox = await dates.boundingBox();
    expect(orgBox && datesBox, 'era-org or era-dates did not render').toBeTruthy();

    // Distinct row: the date range starts at or below era-org's own bottom —
    // it never shares a text line with the org/role run.
    expect(
      datesBox.y,
      `era-dates (y=${datesBox.y}) overlaps era-org (bottom=${orgBox.y + orgBox.height}) — ` +
        'still reads as one wrapped phrase',
    ).toBeGreaterThanOrEqual(orgBox.y + orgBox.height - 1);
  });
});
