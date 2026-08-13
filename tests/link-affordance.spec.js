import { test, expect } from '@playwright/test';

/* Package B2. Before it, global.css scoped the arrow mark to
 * a[target='_blank'], so the internal "The system" link rendered as plain text
 * in a row of arrowed links and read as unclickable — the defect the owner
 * found on the live site.
 *
 * WHICH CHANGE TURNS EACH RED (proved by mutation before shipping):
 *  - delete the internal-chevron rule from global.css → mark-exists and
 *    marks-differ both fail
 *  - point the internal rule at the same data-URI as the external one
 *    → marks-differ fails
 *  - set the ::after to width:0 or background:transparent → the painted-box
 *    assertions fail (a declared mask that renders nothing is no affordance —
 *    the lesson of locator.count() from contact.spec.js, applied to CSS)
 *
 * The mark is content:'' + mask, so computed `content` is "" on BOTH kinds of
 * link — asserting on it proves nothing. The distinguishing properties are the
 * mask images. */

const AFTER = (el) => {
  const s = getComputedStyle(el, '::after');
  return {
    mask: s.maskImage !== 'none' ? s.maskImage : s.webkitMaskImage,
    w: parseFloat(s.width) || 0,
    h: parseFloat(s.height) || 0,
    bgAlpha: (() => {
      const m = s.backgroundColor.match(/rgba?\(([^)]+)\)/);
      if (!m) return 0;
      const parts = m[1].split(',').map((x) => parseFloat(x));
      return parts.length === 4 ? parts[3] : 1;
    })(),
  };
};

test('internal and external links carry different, visibly painted marks', async ({ page }) => {
  await page.goto('/');

  const external = page.locator("#citevyn .links a[target='_blank']").first();
  const internal = page.locator("#citevyn .links a:not([target='_blank'])").first();
  await expect(external).toBeVisible();
  await expect(internal).toBeVisible();

  const ext = await external.evaluate(AFTER);
  const int = await internal.evaluate(AFTER);

  for (const [name, m] of [['external', ext], ['internal', int]]) {
    expect(m.mask, `${name} mark has no mask image`).toBeTruthy();
    expect(m.mask, `${name} mark mask is none`).not.toBe('none');
    expect(m.w, `${name} mark box has zero width`).toBeGreaterThan(0);
    expect(m.h, `${name} mark box has zero height`).toBeGreaterThan(0);
    expect(m.bgAlpha, `${name} mark paints nothing`).toBeGreaterThan(0);
  }
  expect(int.mask, 'internal and external marks are the same shape').not.toBe(ext.mask);
});

test('overview row links carry the internal mark too', async ({ page }) => {
  await page.goto('/');
  const rowLink = page.locator('#overview .ov-name a').first();
  await expect(rowLink).toBeVisible();
  const m = await rowLink.evaluate(AFTER);
  expect(m.mask).toBeTruthy();
  expect(m.mask).not.toBe('none');
  expect(m.w).toBeGreaterThan(0);
  expect(m.bgAlpha).toBeGreaterThan(0);
});
