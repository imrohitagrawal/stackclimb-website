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

const MANIFEST = 'tests/og-card.manifest.json';

/** dist/index.html as visible text: tags stripped, entities decoded, runs
 *  collapsed — the same shape the manifest strings were harvested in. */
function builtHomeText() {
  const html = readFileSync('dist/index.html', 'utf8');
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&mdash;/g, '—')
    .replace(/&middot;/g, '·')
    .replace(/&ldquo;/g, '“')
    .replace(/&rdquo;/g, '”')
    .replace(/\s+/g, ' ')
    .trim();
}

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
  });

  test('the built home page still contains every string the card shows', () => {
    const m = JSON.parse(readFileSync(MANIFEST, 'utf8'));
    const page = builtHomeText();
    // Guard the guard: if the extraction broke, `page` would be short and
    // every `includes` would fail for the wrong reason. Prove it read a page.
    expect(page.length, 'dist/index.html produced almost no text — the extractor is broken').toBeGreaterThan(3000);

    const missing = m.strings.filter((s) => !page.includes(s));
    expect(
      missing,
      `public/og.png shows ${missing.length} string(s) the built home page no longer contains:\n` +
        missing.map((s) => `  · "${s}"`).join('\n') +
        '\n\nThe card and the site have drifted. Regenerate:\n' +
        '  npm run build && node scripts/og-card.mjs\n' +
        '  # look at og-card.draft.png, then watermark it (see og-watermark.spec.js),\n' +
        '  # copy to public/og.png, and update the pin there.',
    ).toEqual([]);
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
        practiceFoot: top?.querySelectorAll('.practice-foot').length ?? 0,
        caps: top?.querySelectorAll('.caps').length ?? 0,
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
    // These two are hidden by the generator. If they vanish from the page, the
    // hiding rules are dead code pointing at nothing — a quiet rot the next
    // reader would have to rediscover by rendering.
    expect(counts.practiceFoot, '.practice-foot is hidden by the generator; it must still exist').toBe(1);
    expect(counts.caps, '.caps is hidden by the generator; it must still exist').toBe(1);
  });
});
