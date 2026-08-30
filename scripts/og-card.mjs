/* Renders the share card from the BUILT home page — to a DRAFT file, which is
 * watermarked by hand and copied to public/og.png. Nothing here writes the
 * shipped bytes. Generated so the card can never
 * again disagree with the site it advertises.
 *
 * WHY GENERATED, NOT HAND-MADE. The card shipped 2026-08-17 carried a bio, two
 * CTA labels ("WHAT HE BUILT", "CV") and an evidence device the site had since
 * replaced — a third-to-first-person voice change went out on every shared link
 * for weeks because nothing connected the asset to the page. Generating it from
 * dist/index.html closes that gap: the strings on the card are the strings in
 * the build at render time. That is not the same as "drift is impossible" — a
 * card not regenerated after a copy change is still stale until
 * tests/og-card-contract.spec.js catches it, which is why that gate exists and
 * why this script refuses to emit a partial card.
 *
 * WHY IT IS NOT A PLAIN SCREENSHOT. The hero is composed for a full viewport.
 * At 1200x630 it carries the nav and cuts through the practice table. The
 * injected CSS below recomposes it for a 1.9:1 card and nothing else — it adds
 * no text of its own, so it cannot introduce a claim the site does not make.
 *
 * WATERMARK IS A SEPARATE, MANUAL STEP — see tests/og-watermark.spec.js. This
 * writes the unwatermarked card; the credit furniture is applied by the Pillow
 * skill outside this repo (DEF-37: a Python dep here is the wrong trade).
 *
 *   node scripts/og-card.mjs            # writes og-card.draft.png (gitignored)
 *   OG_OUT=x.png node scripts/og-card.mjs
 *   node scripts/og-card.mjs --check    # renders and diffs, writes nothing
 */
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { serve } from './lib/static-server.mjs';
import { compose } from './lib/og-compose.mjs';

const W = 1200;
const H = 630;
/* NOT public/ — anything there is copied into dist/ and published. A draft
   card must not ship as a second, unreferenced asset while it is being
   reviewed. The reviewed card is promoted to public/og.png by hand, after the
   watermark step. */
const OUT = process.env.OG_OUT || 'og-card.draft.png';
if (path.resolve(OUT) === path.resolve('public/og.png')) {
  // og-watermark.spec.js states that no generator writes the shipped bytes —
  // they come from the hand watermark step. OG_OUT=public/og.png would make
  // that false and silently replace the approved card with an unwatermarked
  // draft, which the SHA pin would then report as corruption.
  console.error('refusing OG_OUT=public/og.png — that file is the WATERMARKED card.');
  console.error('render a draft, watermark it, then copy it into place by hand.');
  process.exit(1);
}
const ROOT = 'dist';


;

const check = process.argv.includes('--check');
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error(`${ROOT}/index.html missing — run \`npm run build\` first.`);
  process.exit(1);
}
const srv = await serve(ROOT, 4407);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('http://localhost:4407/', { waitUntil: 'networkidle' });
/* Mark the rows the card has no room for, by walking the CLASS-MATCHED list
   rather than trusting a CSS nth-of-type over div siblings. Keeping three of
   each is a composition decision recorded in lib/og-compose.mjs; the ledger's
   4th and 5th rows are "Led" and "Seeking — Senior / Principal", and dropping
   the latter is deliberate (owner's ruling, 2026-08-30): a share card leading
   with what he wants rather than what he has done reads as a campaign, which
   the voice rule bars. The card carries the record; the page carries the ask. */
await page.evaluate(() => {
  const top = document.getElementById('top');
  for (const sel of ['.practice-row', '.hero-ledger .ledger .row']) {
    [...top.querySelectorAll(sel)].slice(3).forEach((el) => el.setAttribute('data-og-hide', ''));
  }
});
await page.addStyleTag({ content: compose(H) });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });

/* The card's visible strings, harvested from the same composed DOM the
   screenshot was taken from. This is what makes the card CHECKABLE without
   OCR: tests/og-card-contract.spec.js asserts every one of these still appears
   in dist/index.html, so a copy change on the home page turns the gate red and
   says "regenerate the card" instead of letting the two drift apart for weeks,
   which is exactly what happened to the card this replaces. */
const card = await page.evaluate(() => {
  const top = document.getElementById('top');
  const visible = (el) => {
    if (!el) return false;
    if (!el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.top < 630 && r.bottom > 0;
  };
  const text = (el) => (el?.textContent || '').replace(/\s+/g, ' ').trim();
  const many = (sel) => [...top.querySelectorAll(sel)].filter(visible).map(text).filter(Boolean);

  /* STRUCTURED, not a flat scrape — and that is the whole point. A flat list
     regenerated by this same script is circular: hide the CTAs and their
     strings simply leave the manifest, so a gate checking only "every listed
     string still exists" would still pass while the card lost its buttons.
     Naming the regions lets the gate assert HOW MANY of each the card must
     show, which is a claim the generator cannot quietly weaken. */
  const regions = {
    headline: text(top.querySelector('h1')),
    /* Same trap: the bio paragraph nests a <strong> for the name, so its
       textContent runs "Rohit Agrawal— principal engineer" with no space where
       the flattened HTML has one. Harvest the paragraph's own first text node
       instead, which is what actually reads as prose on the card. */
    bio: (() => {
      const el = [...top.querySelectorAll('.plate-copy p')].filter(visible)[0];
      if (!el) return '';
      const tn = [...el.childNodes].find((n) => n.nodeType === 3 && n.textContent.trim().length > 12);
      return tn ? tn.textContent.replace(/\s+/g, ' ').trim() : '';
    })(),
    ctas: many('.ctas .btn'),
    ledgerRows: [...top.querySelectorAll('.hero-ledger .ledger .row')].filter(visible).map((r) => ({
      term: text(r.querySelector('dt')), value: text(r.querySelector('dd')),
    })),
    /* The row TITLE, not the row's textContent. textContent concatenates the
       title straight onto the description — "…before promotionA retrieval
       suite…" — which the gate's flattened HTML never matches, because
       stripping a tag leaves a space where textContent leaves nothing. Caught
       by running the gate, not by reading it. */
    practiceRows: [...top.querySelectorAll('.practice-row')]
      .filter(visible)
      .map((r) => text(r.querySelector('.practice-row-title'))),
    thesis: many('.hero-thesis'),
    /* Recorded so the guard below can refuse a card caught mid-animation. */
    pendingVisible: [...top.querySelectorAll('.chip-pending, .state-pending')].some(visible),
    resolvedVisible: [...top.querySelectorAll('.chip-resolved, .state-done')].some(visible),
  };

  /* The flat list stays as a secondary check — every visible string, with NO
     length floor. A first version skipped strings under 3 characters, which
     would have missed "CV" — one of the exact stale labels this gate exists to
     catch. */
  const seen = new Set();
  const strings = [];
  const walk = document.createTreeWalker(top, NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    if (!visible(n.parentElement)) continue;
    const s = n.textContent.replace(/\s+/g, ' ').trim();
    if (!s || seen.has(s)) continue;
    seen.add(s);
    strings.push(s);
  }
  return { regions, strings };
});

/* Refuse to write a partial card rather than record one. Without this the
   script exits 0 having produced an image missing its evidence device and a
   manifest that honestly describes the wreck. */
const R = card.regions;
const shortfall = [];
if (!R.headline) shortfall.push('headline');
if (R.ctas.length < 3) shortfall.push(`ctas (${R.ctas.length}, need 3)`);
if (R.ledgerRows.length < 3) shortfall.push(`ledgerRows (${R.ledgerRows.length}, need 3)`);
if (R.practiceRows.length < 3) shortfall.push(`practiceRows (${R.practiceRows.length}, need 3)`);
// The panel must be captured in its RESTED state, not mid-flight. See the
// fast-forward note in COMPOSE: getting this wrong put "CHECKING" on a card
// whose every row said "ENFORCED".
if (R.pendingVisible) shortfall.push('panel is still showing its PENDING state');
if (!R.resolvedVisible) shortfall.push('panel is not showing its RESOLVED state');
if (shortfall.length) {
  console.error(`refusing to write a partial card — missing: ${shortfall.join(', ')}`);
  console.error('the composition CSS is hiding something it should not, or the markup moved.');
  process.exit(1);
}

await browser.close();
srv.close();

/* `--check` used to diff the render against OUT, which defaults to a
   GITIGNORED draft — so on any clean checkout it could never pass, and no CI
   job called it. Removed rather than left as dead code that always fails:
   tests/og-card-contract.spec.js is the real check, and it runs in CI. */
if (check) {
  console.error('--check was removed; tests/og-card-contract.spec.js is the gate.');
  process.exit(2);
}

fs.writeFileSync(OUT, buf);
fs.writeFileSync('tests/og-card.manifest.json', JSON.stringify({
  note:
    'Generated by scripts/og-card.mjs. Every string here is visible on ' +
    'public/og.png and must still exist in the built home page — gated by ' +
    'tests/og-card-contract.spec.js.',
  width: W, height: H,
  // Always null here. Only scripts/og-promote.mjs stamps it, when the
  // watermarked card is actually copied into public/og.png — so a manifest
  // regenerated without promoting the image stays RED. See the contract spec.
  pngSha256: null,
  regions: card.regions, strings: card.strings,
}, null, 2) + '\n');
console.log(
  `✓ wrote ${OUT} (${W}x${H}, ${buf.length} bytes) and ` +
    `tests/og-card.manifest.json (${card.strings.length} strings)`,
);
console.log('  LOOK AT IT before promoting to public/og.png, then re-apply the watermark.');
