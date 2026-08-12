// DEF-8, second half. cv.css already inverts /cv for paper; nothing proved
// the other seven plates did the same. No print-emulation gate existed
// anywhere in the repo before this file — confirmed by
// `grep -rln emulateMedia tests/` returning nothing.
//
// What turns it red: deleting or commenting out the `.plate:not(.cv), .plate
// :not(.cv) *` block in src/styles/print.css. Without it the plate keeps its
// screen background (bone text painted ON a colour), and under print
// emulation the ground goes transparent by default (html,body rule alone),
// so bone text sits directly on white paper — the DEF-8 failure this file
// exists to catch. Watched it fail before the fix: reverting print.css to
// its pre-fix state (no .plate rule) turned every assertion below red.
//
// backgroundColor has a CSS transition (global.css .btn, and other plate
// elements); querying getComputedStyle immediately after emulateMedia can
// catch a mid-transition frame, not the print value. The settle() wait below
// exists for exactly that — found by an early false-negative in this same
// file, not by assuming instant.

import { test, expect } from '@playwright/test';

/* `overview` came off this list when that plate was removed: the four systems it
   listed now carry their own Gate line, and the list said the same six things a
   second time. The four project ids stay, so the /#citevyn assertion below is
   untouched. */
const PLATES = ['citevyn', 'quorum', 'saafsaans', 'narratwin', 'private', 'contact'];

async function settle(page) {
  await page.waitForTimeout(3200); // past the ~3s smooth-scroll (DEF-21)
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400); // past the background-color transition
}

for (const id of PLATES) {
  test(`/ #${id} — plate text is ink, not bone-on-transparent, under print`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await settle(page);
    const color = await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).color);
    // --ink is #16213c → rgb(22, 33, 60). --bone (#f2ebdd) is the failure
    // mode this asserts against: bone text on a now-transparent ground.
    expect(color).toBe('rgb(22, 33, 60)');
  });

  test(`/ #${id} — plate background is transparent under print`, async ({ page }) => {
    await page.goto(`/#${id}`);
    await settle(page);
    const bg = await page.locator(`#${id}`).evaluate((el) => getComputedStyle(el).backgroundColor);
    expect(bg).toBe('rgba(0, 0, 0, 0)');
  });
}

test('/ — body::before (paint-grain layer) is hidden under print', async ({ page }) => {
  await page.goto('/');
  await page.emulateMedia({ media: 'print' });
  const display = await page.evaluate(() => getComputedStyle(document.body, '::before').display);
  expect(display).toBe('none');
});

test('/ #citevyn — a plate link resolves its href to visible text under print', async ({ page }) => {
  await page.goto('/#citevyn');
  await settle(page);
  const content = await page
    .locator('.links a', { hasText: 'Source' })
    .first()
    .evaluate((el) => getComputedStyle(el, '::after').content);
  expect(content).toContain('github.com/imrohitagrawal/citevyn');
});

test('/cv — unaffected: still governed by cv.css alone, not print.css', async ({ page }) => {
  await page.goto('/cv');
  await page.emulateMedia({ media: 'print' });
  await page.waitForTimeout(400);
  const color = await page.locator('.cv').evaluate((el) => getComputedStyle(el).color);
  expect(color).toBe('rgb(22, 33, 60)');
});
