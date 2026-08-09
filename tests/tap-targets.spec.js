// Every interactive element must give a finger a real target — measured on
// the rendered page at a coarse pointer, never inferred from a CSS allowlist.
//
// Why: touch.css is a hand-maintained selector list, and BOTH surfaces built
// on 09 Aug silently opted out of it (.ov-name a at 29px, .cv-contact a at
// 15px) — the third instance of a hand-typed list quietly narrowing a gate
// after DEF-10 (routes) and DEF-44 (plate ids). This gate derives its
// population from the DOM, so a new component is under it the moment it
// renders.
//
// The bar, and which rule it is: 24px is WCAG 2.5.8 AA and is a HARD FAIL.
// 44px is the Apple HIG figure touch.css aims for; it is enforced for
// standalone controls (block/flex/grid display) and NOT for inline links in
// running prose, where a 44px box would break the text flow — the same
// carve-out WCAG itself makes. An inline-displayed control dodges the 44px
// bar by construction; that is recorded here rather than hidden.
//
// What turns it red: removing touch.css from Layout.astro (16 targets drop
// under 44px), or shipping a new component whose links are under 24px tall.

import { test, expect } from '@playwright/test';

const ROUTES = ['/', '/cv'];
const WCAG_MIN = 24; // WCAG 2.5.8 AA — hard floor for everything
const HIG_MIN = 44; // Apple HIG — standalone controls only

for (const route of ROUTES) {
  test(`${route} — every target meets 24px, standalone controls meet 44px`, async ({
    page,
  }, testInfo) => {
    test.skip(!testInfo.project.use.hasTouch, 'coarse-pointer rule; mobile project only');

    await page.goto(route, { waitUntil: 'networkidle' });
    // Open the menu so its targets are measured too — a closed panel measures 0x0.
    const summary = page.locator('.site-nav .menu > summary');
    if (await summary.isVisible()) await summary.click();

    const targets = await page.evaluate(
      ({ wcagMin, higMin }) => {
        const els = document.querySelectorAll(
          'a[href], button, summary, input, select, textarea, [role="button"]',
        );
        const faults = [];
        let measured = 0;
        for (const el of els) {
          const r = el.getBoundingClientRect();
          if (r.width === 0 || r.height === 0) continue; // hidden twin surfaces
          const cs = getComputedStyle(el);
          if (cs.visibility === 'hidden') continue;
          measured++;
          const text = (el.textContent || '').trim().slice(0, 28);
          const label =
            `<${el.tagName.toLowerCase()}> "${text}" ${Math.round(r.width)}x${Math.round(r.height)}`;
          const size = Math.min(r.width, r.height);
          if (size < wcagMin) {
            faults.push(`${label} — under the ${wcagMin}px WCAG 2.5.8 floor`);
            continue;
          }
          // Inline links in prose keep the text flow; everything else is a
          // control and owes a finger 44px.
          const inline = cs.display === 'inline';
          if (!inline && r.height < higMin) {
            faults.push(`${label} — standalone control under ${higMin}px`);
          }
        }
        return { faults, measured };
      },
      { wcagMin: WCAG_MIN, higMin: HIG_MIN },
    );

    // DENOMINATOR: the page has a nav, CTAs and contact links; measuring
    // almost nothing means the selector or the visibility filter broke.
    expect(targets.measured, 'fewer than 5 targets measured — check the derivation').toBeGreaterThan(5);

    expect(
      targets.faults,
      `${targets.faults.length} of ${targets.measured} targets too small for a finger`,
    ).toEqual([]);
  });
}
