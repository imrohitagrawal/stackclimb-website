// Measures text-vs-painted-ground contrast at every plate boundary.
//   node boundary-check.mjs http://localhost:4321 [--legacy]
// --legacy strips every plate's own ground so the pre-DEF-30 state can be
// measured without editing a file.
//
// Parses BOTH rgb()/rgba() and color(srgb r g b / a). The srgb form uses 0-1
// channels; reading those as 0-255 turns bone into near-black and invents
// failures that are not there.
import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:4321';
const LEGACY = process.argv.includes('--legacy');

function parse(s) {
  if (!s) return null;
  const srgb = s.match(/color\(srgb\s+([\d.]+)\s+([\d.]+)\s+([\d.]+)(?:\s*\/\s*([\d.]+))?\)/i);
  if (srgb) {
    return {
      rgb: [+srgb[1] * 255, +srgb[2] * 255, +srgb[3] * 255],
      a: srgb[4] === undefined ? 1 : +srgb[4],
    };
  }
  const n = (s.match(/[\d.]+/g) || []).map(Number);
  if (n.length < 3) return null;
  return { rgb: n.slice(0, 3), a: n.length > 3 ? n[3] : 1 };
}

const over = (fg, bg) => fg.rgb.map((c, i) => c * fg.a + bg.rgb[i] * (1 - fg.a));

const lum = ([r, g, b]) => {
  const f = (c) => {
    c /= 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
};
const ratio = (a, b) => {
  const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(URL, { waitUntil: 'networkidle' });
if (LEGACY) {
  // Was `.js-ground .plate{...}`. That class was deleted with DEF-6, so the
  // selector matched nothing and --legacy silently measured the FIXED page
  // while reporting it as the legacy one — a flag that proved the opposite of
  // what it claimed. Targets .plate directly now.
  await page.addStyleTag({ content: '.plate{background:transparent !important}' });
  await page.waitForTimeout(300);
}

// Derived from the DOM, not hand-typed. It used to be
//   const IDS = ['top','work','quorum','saafsaans','narratwin','private','contact'];
// and renaming ONE plate (`work` -> `citevyn`, DEF-34) made getElementById
// return null, which reached getComputedStyle as `null` and crashed the gate
// with "parameter 1 is not of type 'Element'". CI caught it; a local run that
// skipped this gate did not. Same defect class as DEF-10, in a third file.
//
// A crash is the lucky outcome. Had the id merely been REMOVED rather than
// renamed, this would have measured six boundaries instead of seven and
// reported AA ok — a silently narrower gate.
const IDS = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));

// DENOMINATOR: zero plates means the selector broke and every boundary below
// would pass over nothing.
if (IDS.length < 2) {
  console.error(`✖ boundary check: found ${IDS.length} plate(s) — need at least 2 to have a seam`);
  await browser.close();
  process.exit(1);
}

const tops = await page.evaluate(
  (ids) =>
    ids.map((id) => {
      const el = document.getElementById(id);
      return { id, top: el ? el.getBoundingClientRect().top + window.scrollY : null };
    }),
  IDS
);

const rows = [];
for (let i = 1; i < tops.length; i++) {
  const seam = tops[i].top;
  if (seam == null) continue;
  await page.evaluate((y) => window.scrollTo({ top: y, behavior: 'instant' }), seam - 450);
  await page.waitForTimeout(900);

  const probe = await page.evaluate((prev) => {
    const painted = getComputedStyle(document.documentElement).backgroundColor;
    const el = document.getElementById(prev);
    const own = getComputedStyle(el).backgroundColor;
    const nodes = [...el.querySelectorAll('h2, .cap .d, .plate-copy p, .ledger dt, .q')];
    const vis = nodes.find((n) => {
      const r = n.getBoundingClientRect();
      return r.top > 0 && r.bottom < window.innerHeight && n.textContent.trim();
    });
    return {
      painted,
      own,
      text: vis ? getComputedStyle(vis).color : null,
      sample: vis ? vis.textContent.trim().slice(0, 30) : null,
    };
  }, tops[i - 1].id);

  if (!probe.text) continue;
  const own = parse(probe.own);
  const opaque = own && own.a > 0.99;
  const behind = opaque ? own : parse(probe.painted);
  const fg = parse(probe.text);
  rows.push({
    boundary: `${tops[i - 1].id} → ${tops[i].id}`,
    paints_own: opaque ? 'yes' : 'NO',
    ratio: ratio(over(fg, behind), behind.rgb).toFixed(2),
    sample: probe.sample,
  });
}

await browser.close();
console.log(LEGACY ? '--- BEFORE (old transparent-plate rule) ---' : '--- AFTER (each plate paints itself) ---');
console.table(rows);

// DENOMINATOR: plates with no sampled text produce no rows, and Math.min of an
// empty array is Infinity — which would have printed "AA ok" over nothing.
if (!rows.length) {
  console.error('✖ boundary check: no boundaries measured — the probe found no text');
  process.exit(1);
}

const worst = Math.min(...rows.map((r) => Number(r.ratio)));
console.log(`WORST: ${worst.toFixed(2)}:1  ${worst < 4.5 ? '*** below AA ***' : 'AA ok'}`);

// DEF-44. This script used to END here. It printed "*** below AA ***" and
// exited 0, so `.github/workflows/gates.yml`'s "plate seams stay above AA" step
// could never fail for the thing it measures. It failed today only because the
// script CRASHED on a renamed plate id — the worst combination: red for the
// wrong reason, green for the wrong reason.
//
// The standing debt in AGENTS.md cites "Contrast passes on all 7 plates" as
// DONE on the strength of this gate. It was true when measured by hand; it was
// never enforced.
//
// --legacy is exempt because its whole job is to demonstrate the pre-DEF-30
// failure. It says so rather than exiting quietly.
if (LEGACY) {
  console.log('(--legacy: demonstrating the pre-fix state, so a failure here is the point)');
  process.exit(0);
}
if (worst < 4.5) {
  console.error(`\n✖ plate seam contrast is below WCAG AA. Worst ${worst.toFixed(2)}:1 at "${rows.find((r) => Number(r.ratio) === worst).boundary}".`);
  process.exit(1);
}
console.log('✓ every plate seam is at or above AA');
