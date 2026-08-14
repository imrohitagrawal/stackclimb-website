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

/* ---- Package 4B: the hero entrance (the reversal of motion.css's old hero
   exclusion, with its guard). What turns each red:
   - animates: delete the `html.hero-anim .hero .hero-ledger` rule, or the
     head-script line that adds `hero-anim`.
   - headline instant: add the h1/.hero-thesis to the animated selector list.
   - reduced motion: delete the hero block inside the reduce media query.
   - toggle off: delete the [data-motion='off'] hero selectors, or make the
     head script add hero-anim unconditionally.
   - no-JS fallback: make the hide a plain CSS default instead of gated on
     the script-set `hero-anim` class (DEF-1's shape). */
test.describe('hero entrance — 4B', () => {
  const ELS = ['.hero .hero-ledger', '.hero .hero-quote', '.hero .caps'];

  test('secondary hero elements animate; headline and thesis never do', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveClass(/hero-anim/);
    for (const sel of ELS) {
      const name = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
      expect(name, `${sel} should run hero-rise`).toBe('hero-rise');
    }
    for (const sel of ['.hero h1', '.hero .hero-thesis', '.hero .lede']) {
      const name = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
      expect(name, `${sel} must paint instantly`).toBe('none');
    }
    // And the animation must END visible — at each element's DESIGNED
    // opacity (the quote is 0.85 by rule), so assert legible, not exactly 1.
    await page.waitForTimeout(900);
    for (const sel of ELS) {
      const op = await page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      expect(op, `${sel} should end visible`).toBeGreaterThan(0.5);
    }
  });

  test('prefers-reduced-motion: hero elements static and visible', async ({ browser }) => {
    const ctx = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto('/', { waitUntil: 'networkidle' });
    for (const sel of ELS) {
      const s = await page.locator(sel).evaluate((el) => ({
        anim: getComputedStyle(el).animationName,
        op: getComputedStyle(el).opacity,
      }));
      expect(s.anim, `${sel} under reduced motion`).toBe('none');
      expect(parseFloat(s.op)).toBeGreaterThan(0.5);
    }
    await ctx.close();
  });

  test('reduced-motion flipped AFTER load still kills the entrance (the CSS block)', async ({
    page,
  }) => {
    // The head script path is covered above (it never sets hero-anim under a
    // reduce context). This covers the belt-and-braces CSS: hero-anim IS set,
    // then the preference flips mid-visit — only the @media block can stop
    // the animation then. Deleting that block turns exactly this red
    // (watched: the first version of this file missed it, M2).
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).toHaveClass(/hero-anim/);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    for (const sel of ELS) {
      const name = await page.locator(sel).evaluate((el) => getComputedStyle(el).animationName);
      expect(name, `${sel} after a mid-visit reduce flip`).toBe('none');
    }
  });

  test('anchor deep-link: no-anim suppresses the entrance while it holds', async ({ page }) => {
    // The [data-motion=off]/no-anim CSS matters when a suppressor coexists
    // with hero-anim — which happens on every #hash landing: plates.js sets
    // html.no-anim for ~400ms while the head script has already set
    // hero-anim. Deleting those selectors turns this red (watched: the
    // toggle-preset test could not see them deleted, M4).
    await page.goto('/#contact', { waitUntil: 'domcontentloaded' });
    const state = await page.evaluate(() => ({
      noAnim: document.documentElement.classList.contains('no-anim'),
      heroAnim: document.documentElement.classList.contains('hero-anim'),
      anim: getComputedStyle(document.querySelector('.hero .hero-ledger')).animationName,
    }));
    // Partner: the window must actually have been observed — no-anim holds
    // for ~400ms after the pre-paint scripts, far longer than DCL-to-here.
    expect(state.noAnim, 'no-anim window missed — test observed nothing').toBe(true);
    expect(state.heroAnim).toBe(true);
    expect(state.anim, 'entrance must hold still during an anchor jump').toBe('none');
  });

  test('persisted toggle-off: hero-anim never set, elements visible', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('motion', 'off'));
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('html')).not.toHaveClass(/hero-anim/);
    for (const sel of ELS) {
      const op = await page.locator(sel).evaluate((el) => parseFloat(getComputedStyle(el).opacity));
      expect(op, `${sel} with motion off`).toBeGreaterThan(0.5);
    }
  });

  test('JavaScript disabled: everything visible (DEF-1)', async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    await page.goto('/');
    for (const sel of [...ELS, '.hero h1', '.hero .hero-thesis']) {
      const s = await page.locator(sel).evaluate((el) => ({
        op: getComputedStyle(el).opacity,
        anim: getComputedStyle(el).animationName,
      }));
      expect(parseFloat(s.op), `${sel} with JS off`).toBeGreaterThan(0.5);
      expect(s.anim).toBe('none');
    }
    await ctx.close();
  });
});
