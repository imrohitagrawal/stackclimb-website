// Walks the site the way a visitor does and captures one image per step.
// The images are the deliverable; a reviewer judges them under
// docs/skills/visual-review.md WITHOUT reading any source.
//
// Run: node tests/visual-walkthrough.mjs   (serves dist/ itself)

import { chromium } from '@playwright/test';
import { spawn } from 'node:child_process';
import { mkdirSync, rmSync, writeFileSync } from 'node:fs';

const PORT = 4399;
const BASE = `http://localhost:${PORT}`;
const OUT = new URL('./shots/', import.meta.url).pathname;
// DEF-10 (second file). This used to be a hand-typed
//   const PLATES = ['top', 'work', 'quorum', 'saafsaans', 'narratwin', 'private', 'contact'];
// — the exact defect dod.spec.js:9-21 already fixed once, in a sibling file
// the 08-09 fix never touched. It was already wrong when read: 'overview'
// does not appear (zero coverage, no error), and 'work' does not exist as a
// plate id (renamed to 'citevyn' — see boundary-check.mjs:58-59) so every
// `?at=work` screenshot silently showed whatever the query string fell back
// to instead of the plate it claimed to capture.
//
// Now derived from the DOM the same way dod.spec.js scans plates per route
// (`page.$$eval('.plate[id]', ...)`) and boundary-check.mjs derives its seam
// ids — filled in below, after the browser launches and the server is up.
//
// WHICH CHANGE TURNS THIS RED: `if (PLATES.length === 0)` below fires if the
// selector ever matches nothing — add a plate/section without the `.plate`
// class or an id, and this throws rather than quietly walking zero plates.
let PLATES = [];
const DESKTOP = { width: 1440, height: 900 };
const MOBILE = { width: 390, height: 844 };

const steps = [];
let n = 0;

async function shot(page, label, why) {
  const id = String(++n).padStart(2, '0');
  const file = `${id}-${label.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.png`;
  await page.screenshot({ path: OUT + file });
  steps.push({ image: file, step: label, why });
  process.stdout.write(`  ${id} ${label}\n`);
}

async function settle(page) {
  await page.waitForLoadState('networkidle').catch(() => {});
  await page.waitForTimeout(450);
}

const server = spawn('npx', ['astro', 'preview', '--port', String(PORT)], {
  cwd: new URL('..', import.meta.url).pathname,
  stdio: 'ignore',
});
process.on('exit', () => server.kill());

try {
  rmSync(OUT, { recursive: true, force: true });
  mkdirSync(OUT, { recursive: true });

  // wait for the server rather than sleeping a fixed amount
  const browser = await chromium.launch();
  for (let i = 0; i < 40; i++) {
    try {
      const r = await fetch(BASE);
      if (r.ok) break;
    } catch {}
    await new Promise((r) => setTimeout(r, 500));
  }

  // Derive the plate list from the DOM, not from a hand-typed array (DEF-10).
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE);
    PLATES = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));
    await ctx.close();
  }
  // DENOMINATOR: zero plates means the selector broke and every plate step
  // below would silently walk nothing.
  if (PLATES.length === 0) {
    throw new Error('no plates found on the home page — the .plate[id] selector matched nothing');
  }

  // 1 — first paint, before any scrolling
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await settle(page);
    await shot(page, 'first-paint-desktop', 'what a visitor sees in the first second');
    await ctx.close();
  }

  // 2 & 3 — every plate, both viewports
  for (const [vpName, vp] of [['desktop', DESKTOP], ['mobile', MOBILE]]) {
    const ctx = await browser.newContext({ viewport: vp });
    const page = await ctx.newPage();
    for (const id of PLATES) {
      await page.goto(`${BASE}/?at=${id}`);
      await settle(page);
      await shot(page, `plate-${id}-${vpName}`, `the ${id} plate as composed at ${vpName}`);
    }
    await ctx.close();
  }

  // 4 — the signature interaction: a caption cell hovered
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?at=citevyn`);
    await settle(page);
    const cell = page.locator('#citevyn .cap').first();
    if (await cell.count()) {
      await cell.hover();
      await page.waitForTimeout(700);
      await shot(page, 'caption-hovered', 'a caption cell hovered — a static billing cell, nothing is drawn');
    }
    await ctx.close();
  }

  // 5 — keyboard focus, walked with the Tab key like a real user
  {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await settle(page);
    for (let i = 1; i <= 6; i++) {
      await page.keyboard.press('Tab');
      await page.waitForTimeout(200);
      await shot(page, `focus-tab-${i}`, `focus ring on tab stop ${i} — is it visible?`);
    }
    await ctx.close();
  }

  // 6 — JavaScript disabled: the static truth the server actually ships
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, javaScriptEnabled: false });
    const page = await ctx.newPage();
    for (const id of ['top', 'private', 'contact']) {
      await page.goto(`${BASE}/?at=${id}`);
      await page.waitForTimeout(700);
      await shot(page, `nojs-${id}`, `${id} plate with JavaScript disabled`);
    }
    await ctx.close();
  }

  // 7 — reduced motion
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, reducedMotion: 'reduce' });
    const page = await ctx.newPage();
    await page.goto(`${BASE}/?at=citevyn`);
    await settle(page);
    await shot(page, 'reduced-motion', 'does the page still communicate without motion');
    await ctx.close();
  }

  // 8 — the opposite colour scheme
  {
    const ctx = await browser.newContext({ viewport: DESKTOP, colorScheme: 'light' });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await settle(page);
    await shot(page, 'scheme-light', 'rendering under a light system preference');
    await ctx.close();
  }

  // 9 — user text scaling, where reflow and overlap show up
  for (const zoom of [2, 0.5]) {
    const ctx = await browser.newContext({ viewport: DESKTOP });
    const page = await ctx.newPage();
    await page.goto(BASE);
    await page.addStyleTag({ content: `html{font-size:${16 * zoom}px}` });
    await settle(page);
    await shot(page, `text-zoom-${String(zoom).replace('.', '-')}x`, `text scaled ${zoom}× — reflow and overlap`);
    await ctx.close();
  }

  await browser.close();

  writeFileSync(OUT + 'manifest.json', JSON.stringify({ captured: steps.length, steps }, null, 2));
  console.log(`\n${steps.length} images -> tests/shots/`);
  console.log('Review them under docs/skills/visual-review.md. Images only — no source.');

  // Denominator: a run that captures nothing must fail, not report success.
  if (steps.length === 0) {
    console.error('FAIL: zero images captured — the walkthrough measured nothing');
    process.exitCode = 1;
  }
} finally {
  server.kill();
}
