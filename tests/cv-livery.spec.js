// /cv — RCA-014 items 2 and 4. Ochre carried six unrelated jobs on this page,
// and one of them (employer names, SPAN.org) was indistinguishable from the
// 11 real links two categories over: same color, and nothing else marked it
// as inert. Separately, a live census found 7 of 11 leaf font-sizes crammed
// into an 11.52-14.72px band, reading flatter than the scale actually is.
//
// WHICH CHANGE TURNS EACH RED:
//  - reverting .cv-job-head .org's color back to var(--accent) reproduces the
//    employer-name-looks-like-a-link defect (link-vs-fact test)
//  - removing text-transform:uppercase from .cv-state or .cv-gate-k removes
//    the one signal that still separates them from prose links (label test)
//  - reverting any of the six type-scale rules this package consolidated
//    (.cv-print-note, .cv-contact, .cv-note, .cv-scope, .cv-gate,
//    .cv-row dd) back to its original size re-crowds the band past this
//    test's floor

import { test, expect } from '@playwright/test';

async function probe(page, selector) {
  return page.evaluate((sel) => {
    const el = document.querySelector(sel);
    const cs = getComputedStyle(el);
    return {
      color: cs.color,
      decoration: cs.textDecorationLine,
      transform: cs.textTransform,
      weight: Number(cs.fontWeight),
    };
  }, selector);
}

test('employer names on /cv no longer masquerade as real links (RCA-014)', async ({ page }) => {
  await page.goto('/cv');
  const link = await probe(page, '.cv a');
  const org = await probe(page, '.cv-job-head .org');
  const state = await probe(page, '.cv-state');
  const gateKey = await probe(page, '.cv-gate-k');

  expect(org.color, 'employer name (.org) must not render in the real-link color').not.toBe(link.color);

  // State labels and gate-key labels are explicitly allowed to keep the
  // accent color (RCA-014's fix section) as long as they read as labels —
  // uppercase, letter-spaced, never underlined — rather than prose links.
  for (const [name, el] of [['.cv-state', state], ['.cv-gate-k', gateKey]]) {
    expect(el.decoration, `${name} must not carry the link's underline`).not.toBe('underline');
    expect(el.transform, `${name} must read as a label (uppercase), not prose`).toBe('uppercase');
  }

  // Generalized net: nothing outside <a> should render the exact real-link
  // color together with the real-link underline — that specific pairing is
  // what let .org pass as a link with no other signal.
  const impostors = await page.evaluate((linkColor) => {
    const bad = [];
    document.querySelectorAll('.cv *:not(a)').forEach((el) => {
      const cs = getComputedStyle(el);
      if (cs.color === linkColor && cs.textDecorationLine === 'underline') {
        bad.push(el.className || el.tagName);
      }
    });
    return bad;
  }, link.color);
  expect(impostors, `non-link elements rendering as links: ${impostors.join(', ')}`).toEqual([]);
});

test('/cv type scale is not overwhelmingly clustered into one band (RCA-014)', async ({ page }) => {
  await page.goto('/cv');
  const sizes = await page.evaluate(() => {
    const set = new Set();
    document.querySelectorAll('.cv *').forEach((el) => {
      if (el.children.length === 0 && el.textContent.trim()) {
        set.add(parseFloat(getComputedStyle(el).fontSize));
      }
    });
    return [...set].sort((a, b) => a - b);
  });

  // Slide a 3px window across every measured size; the worst (most crowded)
  // count is the metric. Fresh measurement here (not copied from the RCA)
  // found the current build's worst window holds 6 of 11 distinct sizes; a
  // floor of 4 requires a real, deliberate reduction without demanding an
  // artificially flat, mechanically-even scale.
  const MAX_IN_3PX_BAND = 4;
  let worst = 0;
  for (const start of sizes) {
    const count = sizes.filter((s) => s >= start && s <= start + 3).length;
    worst = Math.max(worst, count);
  }
  expect(worst, `worst 3px band holds ${worst} distinct sizes: ${sizes.join(', ')}`).toBeLessThanOrEqual(
    MAX_IN_3PX_BAND,
  );
});
