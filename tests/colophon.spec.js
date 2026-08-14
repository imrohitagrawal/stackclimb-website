// The footer row — P-20 (owner, 2026-08-14): ONE ROW at desktop, the D62
// definition left at READING ALIGNMENT, © + the animation toggle grouped
// right; stacked with tightened spacing at 390. Layout gates only — the
// definition STRING is proof-act.spec.js's territory and untouched here.
//
// WHICH CHANGE TURNS EACH RED (all watched, per the repo rule; the full
// mutation ledger lives in docs/STATUS.md row D86):
//   one-row @1440      — delete .colophon-row's display:flex (stack returns)
//   right-flush @1440  — .colophon-defn flex-grow removed (flex: 0 1 auto):
//                        free space then packs after the legal group and it
//                        leaves the right edge. (The fan's justify-content
//                        mutation proved INERT — the grow keeps the row full
//                        at every width the 1240px frame cap allows, so
//                        space-between was dead code and was removed.)
//   alignment @both    — delete .colophon-row's width/margin/padding (the
//                        frame-geometry replication; the plate's outer
//                        padding alone misses by 94.6px at 1440)
//   no-jam @1024       — gap: 2rem → 0 (the grown defn's edge then touches
//                        the group; watched red exactly here). The unamended
//                        plan's 46rem refix goes red too, but at 1440's
//                        right-flush — no-shrink items overflow with the flex
//                        gap intact, so THIS assertion needs the gap switch.
//   stacked @390       — media (min-width: 901px) → (min-width: 0)
//   painted partners   — opacity: 0 on .colophon (geometry without paint
//                        certifies an invisible footer)

import { test, expect } from '@playwright/test';

const gotoReduced = async (page, path = '/') => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
};

// proof-act.spec.js's painted(): ancestor-aware for opacity/visibility via
// checkVisibility, plus the filter/clip-path ancestor walk it cannot do.
const painted = (loc) =>
  loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    const doc = document.documentElement;
    for (let a = el; a; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.filter !== 'none' || cs.clipPath !== 'none') return false;
    }
    return (
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      r.right > 0 &&
      r.left >= 0 &&
      r.left < doc.scrollWidth &&
      r.bottom > 0 &&
      r.top < doc.scrollHeight
    );
  });

const boxes = (page) =>
  page.evaluate(() => {
    const g = (s) => document.querySelector(s)?.getBoundingClientRect() ?? null;
    const row = document.querySelector('.colophon-row');
    const cs = row ? getComputedStyle(row) : null;
    return {
      footer: g('footer.colophon'),
      row: g('.colophon-row'),
      defn: g('footer .colophon-defn'),
      legal: g('.colophon-legal'),
      copyLeft: g('#top .plate-copy'),
      rowPadRight: cs ? parseFloat(cs.paddingRight) : null,
    };
  });

test('desktop 1440: one row — defn left at reading alignment, legal group right-flush', async ({
  page,
}) => {
  await gotoReduced(page);
  await page.setViewportSize({ width: 1440, height: 900 });
  const b = await boxes(page);
  expect(b.defn, 'defn missing').toBeTruthy();
  expect(b.legal, 'legal group missing').toBeTruthy();
  // One row: the two blocks share vertical space and the defn is leftmost.
  expect(Math.max(b.defn.top, b.legal.top), 'not one row').toBeLessThan(
    Math.min(b.defn.bottom, b.legal.bottom),
  );
  expect(b.defn.left, 'defn not left of the group').toBeLessThan(b.legal.left);
  // Reading alignment, the instruction's own words: the defn's left edge
  // sits where plate copy sits (hero copy as the reference), ±2px.
  expect(Math.abs(b.defn.left - b.copyLeft.left), 'defn off reading alignment').toBeLessThan(2);
  // Grouped RIGHT: flush to the row's content edge, ±2px. Survives nothing —
  // justify-content: flex-start parks the group mid-row and goes red here.
  expect(Math.abs(b.row.right - b.rowPadRight - b.legal.right), 'group not right-flush').toBeLessThan(
    2,
  );
  // Height partner: the stacked footer measured 209.59px; the row ~96px.
  expect(b.footer.height, 'footer regressed toward the stack').toBeLessThan(130);
});

test('desktop floor 1024: the row holds without jamming', async ({ page }) => {
  await gotoReduced(page);
  await page.setViewportSize({ width: 1024, height: 900 });
  const b = await boxes(page);
  expect(Math.max(b.defn.top, b.legal.top), 'not one row at 1024').toBeLessThan(
    Math.min(b.defn.bottom, b.legal.bottom),
  );
  // The unamended plan jammed here: 46rem defn + nowrap group exceeded the
  // content width below ~1250px and the gap hit 0. The defn must yield.
  expect(b.legal.left - b.defn.right, 'defn and group jammed').toBeGreaterThan(8);
  // Reading alignment holds at the width where the frame stops centering.
  expect(Math.abs(b.defn.left - b.copyLeft.left), 'defn off alignment at 1024').toBeLessThan(2);
});

test('390: stacked, tightened — defn above the legal group', async ({ page }) => {
  await gotoReduced(page);
  await page.setViewportSize({ width: 390, height: 844 });
  const b = await boxes(page);
  expect(b.defn.bottom, 'not stacked at 390').toBeLessThanOrEqual(b.legal.top + 1);
  // Height partner: 249.53px before; the tightened stack ~208px. Content
  // (the D62 string, the 44px toggle floor) sets the floor, spacing the rest.
  expect(b.footer.height, 'footer not tightened at 390').toBeLessThan(235);
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});

test('painted partners — geometry above certifies only painted boxes', async ({ page }) => {
  await gotoReduced(page);
  for (const sel of ['footer .colophon-defn', '.colophon-legal p', '#motion-toggle']) {
    expect(await painted(page.locator(sel)), `${sel} not painted`).toBe(true);
  }
});
