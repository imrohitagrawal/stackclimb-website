// Measures text-vs-painted-ground contrast at every plate boundary.
//   node boundary-check.mjs http://localhost:4321 [--legacy]
// --legacy re-injects the old `.js-ground .plate { background: transparent }`
// rule so the pre-fix state can be measured without editing any file.
//
// Parses BOTH rgb()/rgba() and color(srgb r g b / a). The srgb form uses 0-1
// channels; reading those as 0-255 turns bone into near-black and invents
// failures that are not there.
import { chromium } from 'playwright';

const URL = process.argv[2] || 'http://localhost:4321';
const LEGACY = process.argv.includes('--legacy');
const IDS = ['top', 'work', 'quorum', 'saafsaans', 'narratwin', 'private', 'contact'];

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
  await page.addStyleTag({ content: '.js-ground .plate{background:transparent !important}' });
  await page.waitForTimeout(300);
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
const worst = Math.min(...rows.map((r) => Number(r.ratio)));
console.log(`WORST: ${worst.toFixed(2)}:1  ${worst < 4.5 ? '*** below AA ***' : 'AA ok'}`);
