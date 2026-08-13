import { test, expect } from '@playwright/test';
import { projects } from '../src/data/projects.js';

/* The overview index — package B1, implementing D57's grouping and D60's order.
 *
 * WHICH CHANGE TURNS EACH RED (each proved by mutation before shipping):
 *  - delete <OverviewPlate /> from index.astro     → "six rows" and every test here
 *  - rename a group label, or reword the heading   → the exact-text assertions
 *  - swap Aegis and EvalAxis, or move NarraTwin
 *    off the last Being-built slot                 → the D60 order test
 *  - hardcode a state string in overview.js        → the derives-from-projects test
 *  - move #overview below the system plates        → the first-child test
 *
 * Locators are scoped inside #overview with exact text: "Being built"
 * substring-matches the #private plate's own prose ("still being built"), and
 * an unscoped match would pass with no overview at all. Rows assert
 * toBeVisible(), not count() — a display:none overview satisfies count(), the
 * hole found twice before (contact.spec.js, plate-height.spec.js). */

test.describe('overview index', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('six rows, all rendered, in two exactly-named groups', async ({ page }) => {
    const ov = page.locator('#overview');
    await expect(ov).toBeVisible();

    await expect(
      ov.getByRole('heading', { name: 'What you can use, and what is still being built', exact: true }),
    ).toBeVisible();
    await expect(ov.getByRole('heading', { name: 'Use them now', exact: true })).toBeVisible();
    await expect(ov.getByRole('heading', { name: 'Being built', exact: true })).toBeVisible();
    // Partner assertion: exactly two groups — a third group is drift from D57.
    await expect(ov.locator('.ov-group')).toHaveCount(2);

    const rows = ov.locator('.ov-row');
    await expect(rows).toHaveCount(6);
    for (let i = 0; i < 6; i++) await expect(rows.nth(i)).toBeVisible();
  });

  test('Being built is ordered Aegis → EvalAxis → NarraTwin (D60: closes on the No-Go)', async ({ page }) => {
    const names = await page
      .locator('#overview .ov-group:nth-of-type(2) .ov-row .ov-name')
      .allInnerTexts();
    expect(names).toEqual(['Aegis Contracts', 'EvalAxis', 'NarraTwin AI']);
  });

  test('an index, not a second copy of the cards (D57: home is the argument)', async ({ page }) => {
    const ov = page.locator('#overview');
    await expect(ov.locator('.record')).toHaveCount(0);
    // At most one figure per row — and the four public rows do carry one, so
    // the zero-count above is not measuring an empty plate.
    const rows = await ov.locator('.ov-row').all();
    let figures = 0;
    for (const row of rows) {
      const figs = row.locator('.ov-fig');
      const n = await figs.count();
      expect(n).toBeLessThanOrEqual(1);
      // Rendered, not merely present — count() passes with display:none
      // (found by the round-1 review fan injecting exactly that).
      if (n) await expect(figs).toBeVisible();
      figures += n;
    }
    expect(figures).toBe(5); // four public systems + EvalAxis; Aegis has none
  });

  test('public rows link to their pages; closed systems carry no link', async ({ page }) => {
    const links = page.locator('#overview .ov-name a');
    await expect(links).toHaveCount(4);
    const hrefs = await links.evaluateAll((as) => as.map((a) => a.getAttribute('href')));
    expect(hrefs.sort()).toEqual([
      '/projects/citevyn',
      '/projects/narratwin',
      '/projects/quorum',
      '/projects/saafsaans',
    ]);
    for (const closed of ['EvalAxis', 'Aegis Contracts']) {
      const row = page.locator('#overview .ov-row', { hasText: closed });
      await expect(row.locator('a')).toHaveCount(0);
    }
  });

  test('states derive from projects.js — a drifted copy goes red', async ({ page }) => {
    for (const slug of Object.keys(projects)) {
      const row = page.locator('#overview .ov-row', { hasText: projects[slug].name });
      await expect(row.locator('.ov-state')).toHaveText(projects[slug].state);
    }
  });

  test('the overview is the first plate inside #systems, so nav and CTA land on it', async ({ page }) => {
    const firstPlateId = await page
      .locator('#systems section.plate')
      .first()
      .getAttribute('id');
    expect(firstPlateId).toBe('overview');
  });

  test('row names are not headings — the outline lists each system once here', async ({ page }) => {
    await expect(page.locator('#overview .ov-row :is(h1,h2,h3,h4,h5,h6)')).toHaveCount(0);
  });
});
