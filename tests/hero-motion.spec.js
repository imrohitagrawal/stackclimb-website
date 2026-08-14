// The hero entrance (package 4B) — split from motion.spec.js when the D8
// budget caught it at 277/250: one concern, the guarded reversal of the old
// hero animation exclusion. Mutation ledger: docs/STATUS.md row D85.

import { test, expect } from '@playwright/test';

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
      const s = await page.locator(sel).evaluate((el) => ({
        name: getComputedStyle(el).animationName,
        dur: parseFloat(getComputedStyle(el).animationDuration),
        vis: el.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
      }));
      expect(s.name, `${sel} should run hero-rise`).toBe('hero-rise');
      // The effect, not just the name: a 0s duration or a display:none
      // element kept the name and passed (Codex findings).
      expect(s.dur, `${sel} duration gutted`).toBeGreaterThanOrEqual(0.3);
      expect(s.vis, `${sel} hidden while 'animating'`).toBe(true);
    }
    // The keyframes must actually hide-then-rise: the from frame carries
    // opacity 0 (a same-start-end no-op keeps the name and passes).
    const fromHidden = await page.evaluate(() => {
      for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules || []) {
          if (rule.type === CSSRule.KEYFRAMES_RULE && rule.name === 'hero-rise') {
            for (const kf of rule.cssRules) {
              if (kf.keyText === '0%' || kf.keyText === 'from') return kf.style.opacity === '0';
            }
          }
        }
      }
      return false;
    });
    expect(fromHidden, 'hero-rise from-frame must be opacity 0').toBe(true);
    for (const sel of ['.hero h1', '.hero .hero-thesis', '.hero .lede', '.hero .ctas']) {
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
    // On every #hash landing plates.js sets html.no-anim for ~400ms while
    // the head script has already set hero-anim. The rule that holds the
    // hero still is global.css's kill-all (`html.no-anim * { animation:
    // none !important }`) — deleting its animation line turns this red
    // (watched; motion.css's own no-anim hero selectors were proven
    // redundant by mutation, M4, and removed rather than kept as dead code).
    await page.goto('/#contact', { waitUntil: 'domcontentloaded' });
    const state = await page.evaluate(() => ({
      noAnim: document.documentElement.classList.contains('no-anim'),
      heroAnim: document.documentElement.classList.contains('hero-anim'),
      anims: ['.hero .hero-ledger', '.hero .hero-quote', '.hero .caps'].map(
        (s) => getComputedStyle(document.querySelector(s)).animationName,
      ),
    }));
    // Partner: the window must actually have been observed — no-anim holds
    // for ~400ms after the pre-paint scripts, far longer than DCL-to-here.
    expect(state.noAnim, 'no-anim window missed — test observed nothing').toBe(true);
    expect(state.heroAnim).toBe(true);
    for (const a of state.anims) {
      expect(a, 'entrance must hold still during an anchor jump').toBe('none');
    }
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
