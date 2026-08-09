#!/usr/bin/env node
// The fixed nav must stay readable at every scroll position, in every state.
//
// WHICH CHANGE TURNS IT RED: delete `background: var(--nav-ground)` from
// `.site-nav` in src/styles/global.css. Measured before that fix, the resting
// sweep reports 22 of 48 failing positions at 1.00:1 desktop and 26 of 78 at
// 1.03:1 mobile. Three more mutations are proved in the PR that added this.
//
// WHY THIS EXISTS SEPARATELY FROM THE OTHER CONTRAST CHECKS. The site had three
// and not one of them could see the defect this was written for:
//   - dod.spec.js scopes axe to `#${plateId}`, and the nav is outside every
//     plate. DEF-14 recorded that blind spot and it is still there.
//   - boundary-check.mjs samples plate SEAMS. It never looks at .site-nav.
//   - axe's color-contrast rule reads the DOM. A fixed bar with no background
//     computes to rgba(0,0,0,0); axe walks up for an ancestor colour and scores
//     against something that is not what renders under the bar.
// A fixed element has no fixed backdrop, so it can only be measured in PIXELS.
//
// HOW IT MEASURES — see tests/lib/rendered-contrast.mjs. It renders the bar
// three times per scroll position and reads the answer off the pixels, so it
// never has to guess where a backdrop is. Four earlier versions of this file
// tried to locate the backdrop by geometry and each produced a different false
// positive; DEF-46 records all four.
//
// Usage: node tests/nav-contrast.mjs http://localhost:4321

import { chromium } from 'playwright';
import { measureMany } from './lib/rendered-contrast.mjs';

const url = process.argv[2] || 'http://localhost:4321';
const AA = 4.5;
const STEP = 120;
const BAR_H = 80;          // the bar is 56px; 80 leaves room for its focus rings
const SEL = '.site-nav a';

const VIEWPORTS = [
  { width: 1440, height: 900, name: 'desktop' },
  { width: 390, height: 844, name: 'mobile' },
];

let exitCode = 0;
const summary = [];

for (const vp of VIEWPORTS) {
  const browser = await chromium.launch();
  const page = await browser.newPage({
    viewport: { width: vp.width, height: vp.height },
    deviceScaleFactor: 1,
  });
  await page.goto(url, { waitUntil: 'networkidle' });

  const clip = { x: 0, y: 0, width: vp.width, height: BAR_H };
  const docHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const failures = [];
  let worst = Infinity;
  let worstAt = null;
  let samples = 0;
  let positions = 0;

  // ---- resting state, swept down the whole page ----
  // The sweep is what catches a nav with no ground of its own: that defect only
  // appears where a light plate passes beneath, so measuring one position would
  // miss it entirely. Three renders per POSITION, not per link — see measureMany.
  for (let y = 0; y + vp.height <= docHeight; y += STEP) {
    await page.evaluate((yy) => window.scrollTo({ top: yy, behavior: 'instant' }), y);
    await page.waitForTimeout(200);
    positions++;

    const rows = await measureMany(page, SEL, clip);
    const visible = rows.filter((r) => r.visible);

    // DENOMINATOR: a page with no visible nav links would pass this sweep by
    // measuring nothing. Deleting the nav must not read as success.
    if (!visible.length) {
      console.error(`✖ nav contrast: no visible ${SEL} at ${vp.name} y=${y} — this sweep measured nothing`);
      exitCode = 1;
      break;
    }

    for (const r of visible) {
      samples++;
      // A visible link that yields no measurable glyph is a FAILURE, not a
      // skip. Before the mask render existed, near-invisible text looked
      // exactly like no text and scored green.
      if (r.ratio === null) {
        failures.push({ y, text: r.text, ratio: 0, note: 'visible but no glyph rendered' });
        continue;
      }
      if (r.ratio < worst) {
        worst = r.ratio;
        worstAt = `y=${y} "${r.text}" fg=rgb(${r.fg}) bg=rgb(${r.bg})`;
      }
      if (r.ratio < AA) failures.push({ y, text: r.text, ratio: +r.ratio.toFixed(2), bg: `rgb(${r.bg})` });
    }
  }

  // ---- interactive states ----
  // DEF-46's original finding: the sweep above measures the RESTING state only,
  // so a low-contrast :hover or :focus-visible colour sails through it.
  // :focus-visible matters most — it is the state a keyboard user lives in, and
  // dod.spec.js only checks that a focus RING exists, never that the label
  // inside it stays readable.
  //
  // One scroll position is enough now that the bar carries its own ground: the
  // backdrop no longer changes with scroll. If that stops being true the
  // resting sweep goes red first, which is the right order.
  await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
  await page.waitForTimeout(200);

  for (const state of ['focus', 'hover']) {
    const count = await page.locator(SEL).count();
    for (let i = 0; i < count; i++) {
      const link = page.locator(SEL).nth(i);
      if (!(await link.isVisible())) continue;

      if (state === 'focus') {
        // Park the pointer off the bar first, or a lingering hover from the
        // previous pass gets measured as if it were the focus state.
        await page.mouse.move(Math.round(vp.width / 2), vp.height - 5);
        await link.focus();
      } else {
        await link.hover();
      }
      await page.waitForTimeout(140);

      const rows = await measureMany(page, SEL, clip);
      const r = rows[i];
      if (!r || !r.visible) continue;
      samples++;
      if (r.ratio === null) {
        failures.push({ y: `:${state}`, text: r.text, ratio: 0, note: 'visible but no glyph rendered' });
        continue;
      }
      if (r.ratio < worst) { worst = r.ratio; worstAt = `:${state} "${r.text}" fg=rgb(${r.fg}) bg=rgb(${r.bg})`; }
      if (r.ratio < AA) failures.push({ y: `:${state}`, text: r.text, ratio: +r.ratio.toFixed(2), bg: `rgb(${r.bg})` });
    }
  }

  // ---- the open menu panel (DEF-42 / D46) ----
  // The panel exists only below 900px and only while open, so neither sweep
  // above ever sees it. Playwright's isVisible() cannot either: it reads boxes
  // and display, not paint, so `opacity: 0` on the whole menu certified as
  // "reachable" in the adversarial review. Pixels or nothing.
  const summaryEl = page.locator('.site-nav .menu > summary');
  if (await summaryEl.isVisible()) {
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'instant' }));
    await summaryEl.click();
    await page.waitForTimeout(250);
    const panelClip = { x: 0, y: 0, width: vp.width, height: 420 };
    const rows = await measureMany(page, '.site-nav .menu > nav a, .site-nav .menu > summary', panelClip);
    const open = rows.filter((r) => r.visible);
    // DENOMINATOR: an open menu must expose the summary plus at least three
    // destinations; fewer means the panel did not open or lost its links.
    if (open.length < 4) {
      console.error(`✖ nav contrast: open menu exposed ${open.length} elements at ${vp.name} — panel missing or empty`);
      exitCode = 1;
    }
    for (const r of open) {
      samples++;
      if (r.ratio === null) {
        failures.push({ y: 'menu-open', text: r.text, ratio: 0, note: 'visible but no glyph rendered' });
        continue;
      }
      if (r.ratio < worst) { worst = r.ratio; worstAt = `menu-open "${r.text}" fg=rgb(${r.fg}) bg=rgb(${r.bg})`; }
      if (r.ratio < AA) failures.push({ y: 'menu-open', text: r.text, ratio: +r.ratio.toFixed(2), bg: `rgb(${r.bg})` });
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

  const failedKeys = new Set(failures.map((f) => f.y));
  const line =
    `${vp.name.padEnd(8)} ${positions} positions · ${samples} samples · ` +
    `${failedKeys.size} failing · worst ${worst === Infinity ? 'n/a' : worst.toFixed(2)}:1`;

  if (failures.length) {
    exitCode = 1;
    console.error(`✖ ${line}`);
    for (const f of failures.slice(0, 12)) {
      console.error(`    ${String(f.y).padStart(7)}  ${f.ratio}:1  ${f.note ?? `on ${f.bg}`}  "${f.text}"`);
    }
    if (failures.length > 12) console.error(`    … and ${failures.length - 12} more`);
  } else {
    console.log(`✓ ${line}`);
    if (worstAt) console.log(`    tightest: ${worstAt}`);
  }
  summary.push({ ...vp, worst, samples });
}

if (exitCode === 0) {
  const w = Math.min(...summary.map((s) => s.worst));
  console.log(`✓ nav contrast: every nav link ≥ ${AA}:1 at every scroll position, resting, hovered and focused. Worst ${w.toFixed(2)}:1`);
} else {
  console.error('\nThe fixed nav is unreadable somewhere on the page. See docs/rca/RCA-003-nav-has-no-ground.md.');
}
process.exit(exitCode);
