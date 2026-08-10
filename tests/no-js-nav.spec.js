// DEF-2. `?at=<plate-id>` needs JavaScript to read location.search and jump
// — a static site cannot read a query string before paint without it.
// `#<plate-id>` needs none: the browser resolves a real fragment against a
// real `id` before any script runs. AGENTS.md used to document the JS-only
// mechanism as THE interface; this file is the proof for the corrected one.
//
// Manual finding this codifies (session evidence, javaScriptEnabled:false):
// after global.css's ~3s smooth-scroll settles, `/#citevyn` lands the plate
// at boundingBox y ≈ 0 with zero JS. `/?at=citevyn` under the same no-JS
// context never scrolls at all. Both assertions below are that finding, as
// a gate instead of a one-off manual check.
//
// What turns the positive assertion red: removing the `id` attribute from a
// plate section, or anything that makes /#id stop being a real fragment
// link (e.g. a JS router intercepting navigation). The negative assertion
// is the partner AGENTS.md requires — without it, "fixed" could mean quietly
// making ?at= start working via new server infrastructure instead of
// documenting #id as the real no-JS path, which is explicitly out of scope
// (no functions/ dir, no wrangler.toml — astro.config.mjs is pure
// output:'static').

import { test, expect } from '@playwright/test';

const SETTLE_MS = 3200; // past scroll-behavior: smooth (DEF-21), no JS to short-circuit it

test('/ #citevyn — lands the plate in view with JavaScript disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/#citevyn');
  await page.waitForTimeout(SETTLE_MS);
  const box = await page.locator('#citevyn').boundingBox();
  // Measured flake, not a real one: self-hosted fonts (fontsource) racing
  // the anchor jump shift the sticky nav's height by a few dozen px
  // depending on whether the swap lands before or after scroll settles —
  // seen at both 0.09px and -53.9px across repeated runs against the SAME
  // build. 100px keeps a wide margin below the unscrolled baseline (1655px,
  // measured the same way) while tolerating that font-swap jitter.
  expect(Math.abs(box.y)).toBeLessThan(100);
  await ctx.close();
});

test('/ ?at=citevyn — does NOT reach the plate with JavaScript disabled', async ({ browser }) => {
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const page = await ctx.newPage();
  await page.goto('/?at=citevyn');
  await page.waitForTimeout(SETTLE_MS);
  const box = await page.locator('#citevyn').boundingBox();
  // Still far down the page — ?at= is confirmed JS-only, not silently fixed.
  expect(box.y).toBeGreaterThan(500);
  await ctx.close();
});

// plates.js extension: a JS-enabled visitor arriving via #id gets the same
// instant jump ?at= always gave, instead of riding the 3s smooth-scroll.
// What turns this red: reverting plates.js to read only location.search.
test('/ #citevyn — JavaScript-enabled visitors get the instant jump, not the 3s ride', async ({ page }) => {
  await page.goto('/#citevyn');
  await page.waitForTimeout(200); // well under the ~3s smooth-scroll duration
  const box = await page.locator('#citevyn').boundingBox();
  expect(Math.abs(box.y)).toBeLessThan(100); // see font-swap note above
});
