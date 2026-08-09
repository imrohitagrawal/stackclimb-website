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
  // Composite the foreground over the sampled backdrop before comparing.
  // Text at opacity 0.2 on a dark bar is not the colour that computed style
  // reports -- it is that colour blended 20% into what is behind it, which is
  // what a reader actually sees. (No backticks in this comment: it lives
  // inside a template literal, and one closed the string on the first try.)
  window.__ratio = (fg, bg, alpha = 1) => {
    const composited = alpha >= 1 ? fg : fg.map((c, i) => c * alpha + bg[i] * (1 - alpha));
    const l = [window.__rel(composited), window.__rel(bg)].sort((x, y) => y - x);
    return (l[0] + 0.05) / (l[1] + 0.05);
  };
  // Samples the element's OWN padding-box corners, not a point above it.
  //
  // The first version took one pixel 3px above the glyph box, assuming the
  // backdrop is whatever is behind the element. That is true for a bare link
  // and FALSE for anything with a background of its own. The "Email me" chip
  // fills with ochre on hover and sets dark ink text; sampling above it
  // compared that ink against the dark bar and reported 1.16:1 for a pair that
  // actually measures about 6:1. A false positive, found by the hover pass the
  // cross-model review asked for.
  //
  // Corners inset from the padding box are background in both cases: a chip's
  // own fill, or the bar behind a bare link. Text is centred, so corners are
  // the least likely place to hit a glyph. The MEDIAN of the four rejects the
  // odd corner that catches a descender or a rounded border.
  // WHERE the backdrop is depends on whether the element paints one itself.
  // Two sampling bugs, both found by the interactive-state pass:
  //   1. Sampling 3px ABOVE the box read the bar behind the "Email me" chip
  //      instead of the chip's own ochre fill -- 1.16:1 reported for a pair
  //      that measures about 6:1. A false positive.
  //   2. Sampling the bounding-box CORNERS then read the ochre focus ring,
  //      because the chip is border-radius:999px and a pill's bounding corners
  //      are OUTSIDE the shape. 2.65:1, also false.
  // So: ask whether the element has a non-transparent background. If it does,
  // sample inside its padding at MID-HEIGHT, where a pill is widest. If it does
  // not, the backdrop really is what is behind it, so sample above.
  // WHERE the backdrop is. Three sampling bugs got me here, each a new
  // geometry edge case:
  //   1. Sampling 3px ABOVE the box read the bar behind the "Email me" chip
  //      instead of the chip's own ochre fill -- 1.16:1 for a pair that really
  //      measures about 6:1.
  //   2. Sampling the bounding-box CORNERS read the focus ring, because the
  //      chip is a 999px pill and a pill's bounding corners are outside it.
  //   3. Sampling a fixed 3px outside landed exactly on the ring again, since
  //      the ring sits at outline-offset 3px.
  // Patching the geometry a fourth time was the wrong move. The correct model
  // is simpler: if an element paints its own background, THAT background is the
  // backdrop -- composited over whatever is behind it if it is translucent.
  // Only when the element paints nothing does the question "what is behind it"
  // arise, and then one clear sample outside the ring answers it.
  // No inside-sampling, so no pill, padding or outline geometry to get wrong.
  window.__ownBackground = (el) => {
    const m = (getComputedStyle(el).backgroundColor.match(/[\d.]+/g) || []).map(Number);
    if (m.length < 3) return null;
    const a = m.length >= 4 ? m[3] : 1;
    return a <= 0.05 ? null : { rgb: m.slice(0, 3), a };
  };

  window.__backdropPoints = (el, r) => {
    const cs = getComputedStyle(el);
    const ow = parseFloat(cs.outlineWidth) || 0;
    const oo = parseFloat(cs.outlineOffset) || 0;
    const gap = Math.max(3, oo + ow + 3);
    const midY = r.y + r.height / 2;
    return [
      [r.x + r.width / 2, r.y - gap], [r.x + r.width / 2, r.bottom + gap],
      [r.x - gap, midY], [r.right + gap, midY],
    ].map(([x, y]) => [
      Math.max(1, Math.min(window.innerWidth - 2, Math.round(x))),
      Math.max(1, Math.min(78, Math.round(y))),
    ]);
  };

  window.__sample = async (dataUrl, pts) => {
    const img = new Image();
    await new Promise((r) => { img.onload = r; img.src = dataUrl; });
    const cv = document.createElement('canvas');
    cv.width = img.width; cv.height = img.height;
    const ctx = cv.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const at = (x, y) => {
      const d = ctx.getImageData(Math.max(0, Math.min(cv.width - 1, x)), Math.max(0, Math.min(cv.height - 1, y)), 1, 1).data;
      return [d[0], d[1], d[2]];
    };
    return pts.map((p) => {
      const cands = p.corners.map(([x, y]) => at(x, y));
      const lum = (c) => 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
      const sorted = cands.slice().sort((a, b) => lum(a) - lum(b));
      const behind = sorted[Math.floor(sorted.length / 2)];
      // The element's own fill sits between its text and whatever is behind.
      const bg = p.own
        ? p.own.rgb.map((c, i) => c * p.own.a + behind[i] * (1 - p.own.a))
        : behind;
      return { ...p, bg, behind };
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
      // CUMULATIVE OPACITY. Found by a cross-model review (Codex), which is the
      // reason AGENTS.md requires one on any test change.
      //
      // The hole: this read getComputedStyle(a).color and nothing else, and
      // `color` is unaffected by `opacity`. So `.site-nav a { opacity: 0.2 }`
      // would render the nav nearly invisible while this gate reported 15.60:1
      // — the exact defect DEF-38 was, passing the gate written to catch it.
      //
      // opacity also inherits multiplicatively down the tree, so a 0.5 on the
      // <header> and a 0.5 on the link is 0.25 effective. Walk to the root.
      const effectiveOpacity = (el) => {
        let o = 1;
        for (let n = el; n && n !== document.documentElement; n = n.parentElement) {
          const v = parseFloat(getComputedStyle(n).opacity);
          if (!Number.isNaN(v)) o *= v;
        }
        return o;
      };

      const out = [];
      for (const a of document.querySelectorAll('.site-nav a')) {
        const r = a.getBoundingClientRect();
        if (r.width < 2 || r.height < 2) continue;
        const cs = getComputedStyle(a);
        if (cs.visibility === 'hidden' || cs.display === 'none') continue;
        const op = effectiveOpacity(a);
        // Fully transparent is "not shown", which is a different question from
        // "shown badly". Anything above zero is on screen and must be readable.
        if (op === 0) continue;
        out.push({
          text: a.textContent.trim().replace(/\s+/g, ' ').slice(0, 20),
          // Four points just inside the element's own box. See __sample.
          corners: window.__backdropPoints(a, r),
          own: window.__ownBackground(a),
          fg: cs.color.match(/[\d.]+/g).slice(0, 3).map(Number),
          // The alpha on `color` itself, times every ancestor opacity.
          alpha: (parseFloat(cs.color.match(/[\d.]+/g)[3] ?? '1') || 1) * op,
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
      ([du, pts]) => window.__sample(du, pts).then((s) =>
        s.map((p) => ({ ...p, r: window.__ratio(p.fg, p.bg, p.alpha) }))),
      [dataUrl, links],
    );

    for (const s of sampled) {
      samples++;
      if (s.r < worst) {
        worst = s.r;
        worstAt = `y=${y} "${s.text}" fg=rgb(${s.fg})${s.alpha < 1 ? ` @${s.alpha.toFixed(2)} opacity` : ''} bg=rgb(${s.bg})`;
      }
      if (s.r < AA) {
        failures.push({ y, text: s.text, ratio: +s.r.toFixed(2), bg: `rgb(${s.bg})` });
      }
    }
  }

  // THE INTERACTIVE-STATE PASS IS NOT HERE, AND THAT IS DELIBERATE.
  //
  // Codex's cross-model review found a real hole: this sweep measures the
  // RESTING state only, so a low-contrast :hover or :focus-visible colour sails
  // through. The finding stands and is recorded as DEF-46.
  //
  // I attempted the fix four times and each attempt produced a NEW false
  // positive of its own, all from the same root cause -- deciding where an
  // element's backdrop is by geometry:
  //   1. sampling 3px above the box read the bar behind the "Email me" chip
  //      instead of the chip's ochre fill: 1.16:1 for a pair that is ~6:1
  //   2. sampling bounding-box corners read the focus ring, because the chip is
  //      a 999px pill and a pill's bounding corners fall outside it: 2.65:1
  //   3. sampling a fixed distance outside landed on the ring again, since the
  //      ring sits at outline-offset 3px: 2.15:1
  //   4. compositing the element's own background over the sample looked right
  //      and still reported own=null while the same probe read the background
  //      as ochre -- unexplained, and I stopped rather than guess a fifth time
  //
  // AGENTS.md's circuit breaker says to stop when two fixes in a row each
  // introduce a defect. Four did. Shipping a gate that cries wolf is worse than
  // shipping none: it trains the reader to ignore it, and this file's whole
  // argument is that a green gate over a real defect is the expensive kind.
  //
  // What a correct version needs, written down so the next attempt starts ahead
  // of this one: resolve the backdrop by COMPOSITING the stack of computed
  // background colours from the element up to the first opaque ancestor, and
  // use pixels only for the page behind that stack. Do not try to find a
  // glyph-free pixel inside an arbitrarily-shaped element.
  //
  // :focus-visible is the half that matters most -- it is the state a keyboard
  // user lives in, and dod.spec.js only checks that a focus RING exists, never
  // that the label inside it stays readable.

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
