// Focus must be VISIBLE, proven in pixels — not inferred from style properties.
//
// Why (DEF-13): the old check in dod.spec.js read outlineStyle, boxShadow and
// textDecorationLine, none of which is visibility. `outline: 2px solid
// transparent` passed it — proven by mutation 2026-08-09, the whole suite
// stayed green with every focus ring invisible. Styles describe intent;
// pixels are what a keyboard user gets.
//
// Method: Tab through the page the way a keyboard user does (element.focus()
// does not reliably trigger :focus-visible; a real Tab press does). At each
// stop, screenshot a clip around the element focused, blur, screenshot again,
// and require the pixels to DIFFER. In Chromium the sequential-focus start
// point survives blur(), so the next Tab resumes from the same element; the
// traversal guard below fails loudly if that ever stops being true.
//
// What turns it red: `:focus-visible { outline-color: transparent }`, an
// opaque ring painted in the exact colour beneath it, `outline: none` with no
// replacement, or a new control with no focus style. What it does NOT prove:
// a ring that changes pixels but at poor contrast — that is nav-contrast.mjs's
// job for the nav, and open work elsewhere.

import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/cv'];
const MAX_STOPS = 80; // hard stop for a traversal that never cycles

for (const route of ROUTES) {
  test(`${route} — every Tab stop visibly changes when focused`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    // Kill smooth-scroll and the plate cross-fade so clips are stable.
    await page.addStyleTag({
      content: '* { transition: none !important; } html { scroll-behavior: auto !important; }',
    });

    const invisible = [];
    const seen = new Set();
    let stops = 0;

    for (let i = 0; i < MAX_STOPS; i++) {
      await page.keyboard.press('Tab');
      const info = await page.evaluate(() => {
        const el = document.activeElement;
        if (!el || el === document.body) return null;
        el.scrollIntoView({ block: 'center', behavior: 'instant' });
        const r = el.getBoundingClientRect();
        return {
          sig: [el.tagName, el.id, el.className, (el.getAttribute('href') || '').slice(0, 40),
            Math.round(r.width)].join('|'),
          label: `${el.tagName} "${(el.textContent || '').trim().slice(0, 30)}"`,
          x: r.x, y: r.y, w: r.width, h: r.height,
        };
      });
      if (!info) break; // wrapped around to the body — traversal complete
      if (seen.has(info.sig)) break; // cycled
      seen.add(info.sig);
      stops++;

      if (info.w === 0 || info.h === 0) continue; // skip-link while hidden etc.

      // Clip padded past outline-offset + width (3px + 2px in global.css).
      const vp = page.viewportSize();
      const pad = 8;
      const clip = {
        x: Math.max(0, info.x - pad),
        y: Math.max(0, info.y - pad),
        width: Math.min(vp.width - Math.max(0, info.x - pad), info.w + pad * 2),
        height: Math.min(vp.height - Math.max(0, info.y - pad), info.h + pad * 2),
      };
      if (clip.width <= 0 || clip.height <= 0) continue;

      const focused = await page.screenshot({ clip });
      await page.evaluate(() => document.activeElement.blur());
      const blurred = await page.screenshot({ clip });
      if (focused.equals(blurred)) invisible.push(info.label);
    }

    // DENOMINATORS. Zero stops means Tab reached nothing — a page with a nav
    // and links cannot have that. A traversal that never grew past one element
    // means blur() broke the resume behaviour and the loop measured one stop
    // MAX_STOPS times; both read as broken measurement, not success.
    expect(stops, 'Tab reached no elements — this check measured nothing').toBeGreaterThan(3);

    expect(
      invisible,
      `${invisible.length} of ${stops} Tab stops show NO pixel change on focus`,
    ).toEqual([]);
  });
}
