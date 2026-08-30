/* Renders public/og.png from the BUILT home page, so the share card can never
 * again disagree with the site it advertises.
 *
 * WHY GENERATED, NOT HAND-MADE. The card shipped 2026-08-17 carried a bio, two
 * CTA labels ("WHAT HE BUILT", "CV") and an evidence device the site had since
 * replaced — a third-to-first-person voice change went out on every shared link
 * for weeks because nothing connected the asset to the page. Generating it from
 * dist/index.html makes that class of drift impossible: the strings on the card
 * are the strings in the build, by construction.
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
import { createServer } from 'node:http';
import fs from 'node:fs';
import path from 'node:path';

const W = 1200;
const H = 630;
/* NOT public/ — anything there is copied into dist/ and published. A draft
   card must not ship as a second, unreferenced asset while it is being
   reviewed. The reviewed card is promoted to public/og.png by hand, after the
   watermark step. */
const OUT = process.env.OG_OUT || 'og-card.draft.png';
const ROOT = 'dist';

/* Recomposition only: hide chrome, fit the hero to 1.9:1. No text is added,
   moved between elements, or reworded here. */
const COMPOSE = `
  header, nav, .skip, .plate-index, footer { display: none !important; }
  *, *::before, *::after { animation: none !important; transition: none !important; }
  html, body { overflow: hidden !important; }
  #top { min-height: ${H}px !important; height: ${H}px !important; padding: 0 !important; }
  /* The top band is NOT decorative slack. apply_watermark.py refuses to place
     the credit line if no corner is quiet enough — it will not overlap content
     by guessing — so the card must leave it somewhere to land. The card that
     shipped in 2026-08 carried its credit in exactly this strip; an 18px
     margin all round was refused, and so was 42px. The number is derived, not
     guessed: the skill sizes its font at min(w,h)//28 = 22px here and probes a
     corner box of text_h + 2*MARGIN, about 50px tall, so the quiet band must
     exceed that. 62px clears it. Shrink this and the watermark step fails
     LOUDLY rather than stamping over content — which is the behaviour we
     want, and is why this comment records the arithmetic. */
  #top .plate-frame { margin: 62px 18px 18px !important; height: ${H - 80}px !important; overflow: hidden !important; }
  #top .plate-grid { padding: 18px 32px !important; gap: 22px !important; align-items: start !important; }
  #top h1 { font-size: 39px !important; line-height: 1.02 !important; margin-bottom: 10px !important; }
  #top .plate-copy p { font-size: 14.5px !important; line-height: 1.48 !important; }
  #top .ctas { margin-top: 14px !important; gap: 9px !important; }
  #top .ctas .btn { font-size: 10.5px !important; padding: 8px 13px !important; }
  #top .hero-ledger { margin-top: 14px !important; padding-top: 10px !important; }

  /* The practice table is the hero's evidence device and belongs on the card,
     but it has six rows and the card has room for four. Trim by WHOLE rows —
     a half-row reads as a rendering fault, and this card is the site's first
     impression. Hiding rows removes no claim: every row is still on the page
     the card links to, and the gate asserts the card says nothing the site
     does not. */
  #top .practice-row:nth-of-type(n+4) { display: none !important; }
  #top .practice-foot { display: none !important; }
  #top .practice-panel { overflow: hidden !important; }
  /* .caps sits below the panel and does not fit; the hero-ledger below the
     copy carries the same kind of credential line and does fit. */
  #top .caps { display: none !important; }
  #top .hero-ledger .ledger { font-size: 10.5px !important; line-height: 1.45 !important; }
  /* The ledger's rows are div.row wrappers, not bare dt/dd — a first attempt
     used dt:nth-of-type and silently matched nothing.
     Keeping THREE, and the cut is deliberate rather than a fit decision: row 5
     is "Seeking — Senior / Principal ...". The site is allowed to state
     availability as plain fact, but a share card that leads with what he wants
     rather than what he has done reads as a campaign, which AGENTS.md's voice
     rule bars. The card carries the record; the page carries the ask. */
  #top .hero-ledger .ledger .row:nth-of-type(n+4) { display: none !important; }
`;
;

function serve(root, port) {
  const srv = createServer((q, r) => {
    let f = decodeURIComponent(q.url.split('?')[0]);
    let p = path.join(root, f);
    if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
    if (!fs.existsSync(p)) p = path.join(root, f + '.html');
    if (!fs.existsSync(p)) { r.writeHead(404); return r.end('not found'); }
    const e = path.extname(p);
    const ct = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
                 '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml',
                 '.woff2': 'font/woff2', '.woff': 'font/woff' }[e] || 'application/octet-stream';
    r.writeHead(200, { 'content-type': ct });
    fs.createReadStream(p).pipe(r);
  });
  return new Promise((res) => srv.listen(port, () => res(srv)));
}

const check = process.argv.includes('--check');
if (!fs.existsSync(path.join(ROOT, 'index.html'))) {
  console.error(`${ROOT}/index.html missing — run \`npm run build\` first.`);
  process.exit(1);
}
const srv = await serve(ROOT, 4407);
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
await page.goto('http://localhost:4407/', { waitUntil: 'networkidle' });
await page.addStyleTag({ content: COMPOSE });
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(1200);
const buf = await page.screenshot({ clip: { x: 0, y: 0, width: W, height: H } });

/* The card's visible strings, harvested from the same composed DOM the
   screenshot was taken from. This is what makes the card CHECKABLE without
   OCR: tests/og-card-contract.spec.js asserts every one of these still appears
   in dist/index.html, so a copy change on the home page turns the gate red and
   says "regenerate the card" instead of letting the two drift apart for weeks,
   which is exactly what happened to the card this replaces. */
const strings = await page.evaluate(() => {
  const seen = new Set();
  const out = [];
  const walk = document.createTreeWalker(document.getElementById('top'), NodeFilter.SHOW_TEXT);
  let n;
  while ((n = walk.nextNode())) {
    const el = n.parentElement;
    if (!el || !el.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
    const r = el.getBoundingClientRect();
    if (r.width === 0 || r.height === 0 || r.top >= 630 || r.bottom <= 0) continue;
    const s = n.textContent.replace(/\s+/g, ' ').trim();
    if (s.length < 3 || seen.has(s)) continue;
    seen.add(s);
    out.push(s);
  }
  return out;
});
await browser.close();
srv.close();

if (check) {
  const same = fs.existsSync(OUT) && Buffer.compare(fs.readFileSync(OUT), buf) === 0;
  console.log(same ? `✓ ${OUT} matches a fresh render` : `✗ ${OUT} differs from a fresh render`);
  process.exit(same ? 0 : 1);
}
fs.writeFileSync(OUT, buf);
fs.writeFileSync('tests/og-card.manifest.json', JSON.stringify({
  note:
    'Generated by scripts/og-card.mjs. Every string here is visible on ' +
    'public/og.png and must still exist in the built home page — gated by ' +
    'tests/og-card-contract.spec.js.',
  width: W, height: H, strings,
}, null, 2) + '\n');
console.log(
  `✓ wrote ${OUT} (${W}x${H}, ${buf.length} bytes) and ` +
    `tests/og-card.manifest.json (${strings.length} strings)`,
);
console.log('  LOOK AT IT before promoting to public/og.png, then re-apply the watermark.');
