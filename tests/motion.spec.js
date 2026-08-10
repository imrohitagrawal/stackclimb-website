// Phase 2 motion + the footer toggle (D55 / `resilient-hatching-peacock.md`
// item 5) shipped with no automated coverage — this file is that gate. It
// was written RED-first: before src/scripts/motion-toggle.js existed, or if
// the button loses aria-pressed/id, or if motion.css's [data-motion='off']
// rule is deleted, every test below fails.
//
// What turns each case red:
// - default state: removing `aria-pressed="false"` from Layout.astro, or
//   changing motion-toggle.js's initial sync().
// - persistence: deleting the localStorage.setItem/getItem calls in
//   motion-toggle.js, or the inline head script in Layout.astro.
// - keyboard access: swapping the <button> for a <div onclick> (no native
//   focus/activation), or removing the id="motion-toggle" the script binds to.
// - reduced motion: deleting motion.css's `@media (prefers-reduced-motion:
//   reduce)` block, or scoping it so a toggled-ON visitor still gets motion.
// - default-visible fallback: deleting the `html:not(.motion-ready)` rule
//   in motion.css (DEF-1's shape — a control that dies with the script must
//   never take content down with it).

import { test, expect } from '@playwright/test';

test.describe('motion toggle — default state and keyboard access', () => {
  test('defaults to ON, aria-pressed="false", and is a real focusable button', async ({
    page,
  }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('#motion-toggle');

    await expect(toggle).toHaveJSProperty('tagName', 'BUTTON');
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await expect(toggle.locator('[data-motion-label]')).toHaveText('on');

    // Real keyboard focus, not merely focusable via .focus() — Tab to it.
    await page.keyboard.press('Tab'); // skip link
    let reached = false;
    for (let i = 0; i < 40; i++) {
      const isToggle = await page.evaluate(
        () => document.activeElement?.id === 'motion-toggle',
      );
      if (isToggle) {
        reached = true;
        break;
      }
      await page.keyboard.press('Tab');
    }
    expect(reached).toBe(true);
  });

  test('Enter activates the toggle and flips aria-pressed', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('#motion-toggle');
    await toggle.focus();
    await page.keyboard.press('Enter');
    await expect(toggle).toHaveAttribute('aria-pressed', 'true');
    await expect(toggle.locator('[data-motion-label]')).toHaveText('off');
  });
});

test.describe('motion toggle — persistence', () => {
  test('turning motion off survives a reload via localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('#motion-toggle').click();
    await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');

    const stored = await page.evaluate(() => localStorage.getItem('motion'));
    expect(stored).toBe('off');

    await page.reload({ waitUntil: 'networkidle' });

    // No flash of the wrong state: the inline head script already set this
    // on <html> before first paint.
    const dataMotion = await page.evaluate(
      () => document.documentElement.dataset.motion,
    );
    expect(dataMotion).toBe('off');
    await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('[data-motion-label]')).toHaveText('off');
  });

  test('turning motion back on clears localStorage', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const toggle = page.locator('#motion-toggle');
    await toggle.click(); // off
    await toggle.click(); // on again
    const stored = await page.evaluate(() => localStorage.getItem('motion'));
    expect(stored).toBeNull();
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
  });
});

test.describe('motion toggle — content never hidden by default', () => {
  test('below-the-fold plate content is visible with JavaScript disabled', async ({
    browser,
  }) => {
    // DEF-1's shape: a control that dies (or, here, never runs at all)
    // must never take content down with it. reveal.js is the only thing
    // that ever sets the opacity/transform that makes an entry animation
    // possible — with no JS, `.motion-ready` is never added, so motion.css's
    // `html:not(.motion-ready) …` fallback must show every plate assembled.
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    const firstChild = page.locator('.plate:not(.hero) .plate-grid > *').first();
    await expect(firstChild).toBeVisible();
    // toBeVisible() alone does not catch `opacity: 0` (Playwright treats a
    // zero-opacity element as visible) — the actual DEF-1 failure shape is
    // an element with a box but no ink, so assert the computed opacity too.
    const opacity = await firstChild.evaluate((el) => getComputedStyle(el).opacity);
    expect(opacity).toBe('1');
    await ctx.close();
  });
});

test.describe('prefers-reduced-motion overrides the toggle', () => {
  // `test.use({ reducedMotion: 'reduce' })` measured NOT to apply the media
  // query reliably in this project's config (Playwright 1.62.1, this repo's
  // `devices['Desktop Chrome']` spread) — confirmed by logging
  // `matchMedia(...).matches` and getting `false` on repeat runs.
  // `browser.newContext({ reducedMotion: 'reduce' })` measured to work every
  // time, so the context is built explicitly here instead of via fixture.
  test('motion stays off even with the toggle left ON', async ({ browser, baseURL }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto(baseURL + '/', { waitUntil: 'networkidle' });
    // Toggle is untouched (still ON / aria-pressed=false) — the OS setting
    // alone must suppress motion.
    await expect(page.locator('#motion-toggle')).toHaveAttribute('aria-pressed', 'false');

    const target = page.locator('.plate:not(.hero) .plate-grid > *').first();
    const transition = await target.evaluate(
      (el) => getComputedStyle(el).transitionDuration,
    );
    // '0s' (or a list of all-zero durations) — no animated entry regardless
    // of the persisted preference.
    expect(transition.split(',').every((d) => parseFloat(d) === 0)).toBe(true);
    await expect(target).toBeVisible();
    await context.close();
  });
});
