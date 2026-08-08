#!/usr/bin/env node
// The fixed nav must stay readable at every scroll position, on every plate.
//
// WHICH CHANGE TURNS IT RED: delete `background: var(--nav-ground)` from
// `.site-nav` in src/styles/global.css. Measured before the fix, that state
// reports 22 of 48 failing positions at 1.00:1 on desktop and 26 of 78 at
// 1.03:1 on mobile. Re-adding `html[data-theme='light'] .site-nav { color:
// var(--ink) }` on its own still leaves 8 of 48 failing — both halves of
// RCA-003's fix are required, and this gate proves it.
//
// WHY THIS EXISTS SEPARATELY FROM THE OTHER CONTRAST CHECKS. The site had
// three and not one of them could see this defect:
//   - dod.spec.js scopes axe to `#${plateId}`, and the nav is outside every
//     plate. DEF-14 recorded that blind spot and it is still there.
//   - boundary-check.mjs samples plate SEAMS. It never looks at .site-nav.
//   - axe's color-contrast rule reads the DOM. A fixed bar with no background
//     computes to rgba(0,0,0,0); axe walks up for an ancestor colour and
//     scores against something that is not what renders under the bar.
// A fixed element has no fixed backdrop, so it can only be measured in
// PIXELS, at many scroll positions. That is what this does.
//
// It also sees what a DOM reader structurally cannot: global.css paints a
// mix-blend-mode grain layer over every ground, which moves real luminance.
//
// Usage: node tests/nav-contrast.mjs http://localhost:4321

import { chromium } from 'playwright';

const url = process.argv[2] || 'http://localhost:4321';
const AA = 4.5;
const STEP = 120;

// A colour transition on the nav would make a short wait report phantom
// failures mid-fade. The fix removed the transition; the wait stays as
// insurance against one being reintroduced without this gate being updated.
const SETTLE = 250;

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' },
];

const PAGE_HELPERS = `
  window.__rel = (c) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
    return 0.2126 * f(c[0]) + 0.7152 * f(c[1]) + 0.0722 * f(c[2]);
  };
  window.__ratio = (a, b) => {
    const l = [window.__rel(a), window.__rel(b)].sort((x, y) => y - x);
    return (l[0] + 0.05) / (l[1] + 0.05);
  };
  window.__sample = async (dataUrl, pts) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = dataUrl; });
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    return pts.map((p) => {
      const d = ctx.getImageData(p.x, p.y, 1, 1).data;
      return { ...p, bg: [d[0], d[1], d[2]] };
    });
  };
`;

let exitCode = 0;
const summary = [];

for (const vp of VIEWPORTS) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.addScriptTag({ content: PAGE_HELPERS });

  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const failures = [];
  let worst = Infinity;
  let worstAt = null;
  let samples = 0;
  let positions = 0;

  for (let y = 0; y + vp.height <= docHeight; y += STEP) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(SETTLE);
    positions++;

    const links = await page.evaluate(() => {
      const out = [];
      for (const a of document.querySelectorAll('.site-nav a')) {
        const r = a.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const cs = getComputedStyle(a);
        if (cs.visibility === 'hidden' || cs.display === 'none' || cs.opacity === '0') continue;
        out.push({
          text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 20),
          // 3px above the glyph box, horizontal centre: that is bar backdrop,
          // not the text itself.
          x: Math.round(Math.min(window.innerWidth - 2, Math.max(1, r.x + r.width / 2))),
          y: Math.round(Math.max(1, Math.min(78, r.y - 3))),
          fg: cs.color.match(/[\d.]+/g).slice(0, 3).map(Number),
        });
      }
      return out;
    });

    // DENOMINATOR: a page with no visible nav links would pass this whole
    // sweep by measuring nothing. Deleting the nav must not read as success.
    if (!links.length) {
      console.error(`✖ nav contrast: no visible .site-nav links at ${vp.name} y=${y} — this sweep measured nothing`);
      exitCode = 1;
      break;
    }

    const shot = await page.screenshot({ clip: { x: 0, y: 0, width: vp.width, height: 80 } });
    const dataUrl = `data:image/png;base64,${shot.toString('base64')}`;
    const sampled = await page.evaluate(
      ([du, pts]) => window.__sample(du, pts).then((s) => s.map((p) => ({ ...p, r: window.__ratio(p.fg, p.bg) }))),
      [dataUrl, links],
    );

    for (const s of sampled) {
      samples++;
      if (s.r < worst) {
        worst = s.r;
        worstAt = `y=${y} "${s.text}" fg=rgb(${s.fg}) bg=rgb(${s.bg})`;
      }
      if (s.r < AA) {
        failures.push({ y, text: s.text, ratio: +s.r.toFixed(2), bg: `rgb(${s.bg})` });
      }
    }
  }

  await browser.close();

  // DENOMINATOR: prove the sweep actually walked the page. A zero-height
  // document or a broken selector would otherwise report a clean pass.
  if (samples === 0) {
    console.error(`✖ nav contrast: 0 samples taken at ${vp.name} — the sweep did not run`);
    exitCode = 1;
    continue;
  }

  const failedPositions = new Set(failures.map((f) => f.y));
  const line =
    `${vp.name.padEnd(8)} ${positions} positions · ${samples} samples · ` +
    `${failedPositions.size} failing · worst ${worst.toFixed(2)}:1`;

  if (failures.length) {
    exitCode = 1;
    console.error(`✖ ${line}`);
    for (const f of failures.slice(0, 12)) {
      console.error(`    y=${String(f.y).padStart(5)}  ${f.ratio}:1  on ${f.bg}  "${f.text}"`);
    }
    if (failures.length > 12) console.error(`    … and ${failures.length - 12} more`);
  } else {
    console.log(`✓ ${line}`);
  }
  summary.push({ ...vp, worst, samples, failed: failedPositions.size });
}

if (exitCode === 0) {
  const w = Math.min(...summary.map((s) => s.worst));
  console.log(`✓ nav contrast: every nav link ≥ ${AA}:1 at every scroll position. Worst ${w.toFixed(2)}:1`);
} else {
  console.error('\nThe fixed nav is unreadable somewhere on the page. See docs/rca/RCA-003-nav-has-no-ground.md.');
}
process.exit(exitCode);
