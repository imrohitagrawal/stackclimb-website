// RCA-016 (P6): the share card that shipped 2026-08-17 drifted from the site
// for weeks. It carried a bio, two CTA labels ("WHAT HE BUILT", "CV") and an
// evidence device the home page had replaced — a third-to-first-person VOICE
// change went out on every shared link, and nothing noticed, because nothing
// connected the image to the page. og-watermark.spec.js pinned its BYTES,
// which is a different question: a pin proves the file has not changed, not
// that it is still true.
//
// The card is now generated from the built home page by scripts/og-card.mjs,
// which also emits tests/og-card.manifest.json — every string it rendered.
// This file asserts those strings still exist in dist/index.html. A copy edit
// on the home page therefore turns this RED with "regenerate the card"
// instead of letting the two quietly disagree.
//
// WHY STRINGS AND NOT A PINNED RENDER. Byte-comparing a fresh render against a
// committed one would be the stronger check, and it is the wrong one here:
// font rasterisation differs between this repo's darwin developers and its
// linux CI, so the gate would fail on platform, not on drift. Measured
// alternatives were considered and rejected rather than assumed.
//
// RED WHEN: change any copy on the home hero — a CTA label, the bio, a
// practice row title, a ledger term — without re-running scripts/og-card.mjs
// and re-applying the watermark. Proved by mutation, not asserted: see
// docs/STATUS.md D162.

import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';

const MANIFEST = 'tests/og-card.manifest.json';

/* HERO-SCOPED, and that is the whole correction. A first version flattened the
 * WHOLE built page, which produced demonstrated FALSE ACCEPTANCE: 4 of the 28
 * card strings also occur outside #top, so changing the hero's ledger term
 * "Experience" or its CTA "Email me" left the gate GREEN — the words still
 * existed, in the nav and the footer. The card renders #top only, so #top is
 * the only haystack that can answer "does the site still say this".
 * Reading the live DOM also removes the hand-written entity table the first
 * version needed, and with it a whole class of false red. */
const heroText = async (page) => {
  await page.goto('/', { waitUntil: 'networkidle' });
  return page.evaluate(() => {
    const top = document.getElementById('top');
    return (top?.textContent || '').replace(/\s+/g, ' ').trim();
  });
};

test.describe('og card contract — the share card says nothing the site does not', () => {
  test('the manifest exists and is not empty', () => {
    expect(existsSync(MANIFEST), `${MANIFEST} missing — run: node scripts/og-card.mjs`).toBe(true);
    const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    // THE VACUITY PARTNER. Every assertion below is "this string is present".
    // An empty manifest passes all of them and proves nothing, so the count is
    // floored — and floored well above zero, because the card demonstrably
    // renders a headline, three CTAs, three ledger rows and three practice
    // rows. 20 is under the 28 measured on 2026-08-30, so ordinary copy
    // tightening does not trip it, but a manifest that collapsed would.
    expect(m.strings.length, 'the card manifest collapsed — it should carry ~28 strings').toBeGreaterThan(20);
    expect(m.width).toBe(1200);
    expect(m.height).toBe(630);

    // THE ANTI-CIRCULARITY ASSERTIONS, and they are the load-bearing ones.
    // The manifest is produced by the same script that renders the card, so a
    // gate that only checked "every listed string still exists" would be
    // self-fulfilling: hide the CTAs in the generator's CSS and their strings
    // simply leave the manifest, leaving 25 of 28 — comfortably over any
    // aggregate floor — while the card silently lost its buttons. A reviewer
    // demonstrated exactly that. Naming the regions and their counts is a
    // claim the generator cannot quietly weaken.
    expect(m.regions.headline, 'the card must show the headline').toBeTruthy();
    expect(m.regions.ctas, 'the card must show all three calls to action').toHaveLength(3);
    expect(m.regions.ledgerRows, 'the card must show three record rows').toHaveLength(3);
    expect(m.regions.practiceRows, 'the card must show three practice rows').toHaveLength(3);
    for (const row of m.regions.ledgerRows) {
      expect(row.term, 'every ledger row needs its term').toBeTruthy();
      expect(row.value, 'every ledger row needs its value').toBeTruthy();
    }
  });

  test('the built home page still contains every string the card shows', async ({ page: pw }) => {
    const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    const page = await heroText(pw);
    // Guard the guard: if the extraction broke, `page` would be short and
    // every `includes` would fail for the wrong reason. Prove it read a page.
    expect(page.length, '#top produced almost no text — the hero moved or the read broke').toBeGreaterThan(600);

    // Region strings are checked first and by name, so a failure says WHICH
    // part of the card went stale rather than only that some string did.
    const regionStrings = [
      m.regions.headline,
      ...m.regions.ctas,
      ...m.regions.ledgerRows.flatMap((r) => [r.term, r.value]),
      ...m.regions.practiceRows,
    ].filter(Boolean);
    const staleRegions = regionStrings.filter((s) => !page.includes(s));
    expect(
      staleRegions,
      'the card shows these, and the built home page no longer does:\n' +
        staleRegions.map((s) => `  · "${s}"`).join('\n'),
    ).toEqual([]);

    const missing = m.strings.filter((s) => !page.includes(s));
    expect(
      missing,
      `public/og.png shows ${missing.length} string(s) the built home page no longer contains:\n` +
        missing.map((s) => `  · "${s}"`).join('\n') +
        '\n\nThe card and the site have drifted. Regenerate:\n' +
        '  npm run build && npm run og-card\n' +
        '  # look at og-card.draft.png, watermark it, then: npm run og-card:promote',
    ).toEqual([]);
  });

  test('the manifest describes the card that actually shipped', () => {
    // WITHOUT THIS, the cheapest way to clear a red is the WRONG fix. Copy
    // changes on the hero turn the contract red; re-running the generator
    // rewrites the manifest to match the new build and writes a GITIGNORED
    // draft png. Commit that manifest and both gates go green while
    // public/og.png is still the old, stale card. A reviewer walked exactly
    // that path. The generator therefore writes pngSha256: null, and only the
    // promote step — which copies the watermarked card into place — stamps the
    // real hash. A regenerated-but-unpromoted manifest stays RED.
    const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    expect(
      m.pngSha256,
      'the manifest was regenerated but the card was never promoted.\n' +
        'Watermark og-card.draft.png, then run: npm run og-card:promote',
    ).not.toBeNull();
    const actual = createHash('sha256').update(readFileSync('public/og.png')).digest('hex');
    expect(
      m.pngSha256,
      'the manifest describes a different image than public/og.png — they were promoted apart',
    ).toBe(actual);
  });

  test('the selectors the generator composes against still exist', async ({ page }) => {
    // The manifest check catches changed WORDS. This catches changed MARKUP:
    // rename .practice-row or .hero-ledger and the generator would silently
    // render a card missing its evidence device, with a manifest that still
    // matched because the remaining strings are all real.
    await page.goto('/', { waitUntil: 'networkidle' });
    const counts = await page.evaluate(() => {
      const top = document.getElementById('top');
      return {
        hero: top ? 1 : 0,
        frame: top?.querySelectorAll('.plate-frame').length ?? 0,
        h1: top?.querySelectorAll('h1').length ?? 0,
        ctas: top?.querySelectorAll('.ctas .btn').length ?? 0,
        ledgerRows: top?.querySelectorAll('.hero-ledger .ledger .row').length ?? 0,
        practiceRows: top?.querySelectorAll('.practice-row').length ?? 0,
      };
    });
    expect(counts.hero, '#top (the hero) is what the card renders').toBe(1);
    expect(counts.frame, '.plate-frame is resized by the generator').toBe(1);
    expect(counts.h1, 'the headline').toBe(1);
    expect(counts.ctas, 'the CTA row the card shows').toBeGreaterThanOrEqual(3);
    // The generator hides rows past the 3rd of each. If a list SHRINKS below
    // what the card displays, the card silently loses a row — so the floor is
    // what the card needs, not what the page happens to have.
    expect(counts.ledgerRows, 'the card shows 3 ledger rows').toBeGreaterThanOrEqual(3);
    expect(counts.practiceRows, 'the card shows 3 practice rows').toBeGreaterThanOrEqual(3);
    // A first version also asserted `.practice-foot` and `.caps` exist,
    // because the generator hides them. Removed on review: deleting either
    // leaves the card pixel-identical, so the assertion locked unrelated page
    // markup and could only ever produce a false red. A CSS rule that matches
    // nothing is harmless; assert only what must remain VISIBLE on the card.
  });
});
