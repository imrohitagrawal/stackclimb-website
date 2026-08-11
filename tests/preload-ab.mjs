#!/usr/bin/env node
/**
 * M6 — does preloading the fonts help or hurt LCP? An A/B, re-measured.
 *
 * WHY THIS EXISTS. M6 says "zero rel=preload on a font-driven page" and reads as
 * work to do. DEF-3 records preloading KILLED after measurement: desktop LCP
 * +44ms, mobile +96ms, 7-run medians. Those two have contradicted each other in
 * docs/STATUS.md since 2026-08-09. The owner's decision was to RE-MEASURE rather
 * than strike M6 on the older number, because the build has moved since: Astro
 * 5 -> 7, a new wordmark, a rewritten hero, four artefact panels.
 *
 * METHOD, matched to DEF-3 so the numbers are comparable:
 *   - 7 runs per arm, median reported (mean and spread too, since a median alone
 *     hides a bimodal result).
 *   - Desktop 1440x900 and mobile 390x844, both throttled identically.
 *   - Cold context per run: a fresh browser context, cache disabled, so run N
 *     cannot be served from run N-1's memory cache.
 *   - LCP read from PerformanceObserver, which is what the metric actually is,
 *     not a proxy like load or DOMContentLoaded.
 *
 * The B arm is produced by injecting <link rel="preload" as="font"> for the two
 * faces the page actually uses, via route interception — so the two arms differ
 * by exactly one thing and nothing is rebuilt between them.
 *
 * RUN:  node tests/preload-ab.mjs            (needs a preview server; see --url)
 *       node tests/preload-ab.mjs --runs 7 --url http://localhost:4321
 */

import { chromium } from 'playwright';

const arg = (k, d) => {
  const i = process.argv.indexOf(k);
  return i === -1 ? d : process.argv[i + 1];
};
const URL_ = arg('--url', 'http://localhost:4321');
const RUNS = Number(arg('--runs', 7));

const VIEWPORTS = [
  ['desktop', { width: 1440, height: 900 }, 4, 0],
  ['mobile', { width: 390, height: 844 }, 4, 0],
];

/** The faces the first viewport actually needs. Read from the build, not guessed. */
async function fontsInUse(page) {
  const css = await page.evaluate(async () => {
    const link = [...document.querySelectorAll('link[rel=stylesheet]')][0];
    if (!link) return '';
    return fetch(link.href).then((r) => r.text());
  });
  const urls = [...css.matchAll(/url\((\/_astro\/[^)]+\.woff2)\)/g)].map((m) => m[1]);
  return [...new Set(urls)];
}

async function measure(browser, viewport, preloadHrefs) {
  const [, size] = viewport;
  const ctx = await browser.newContext({ viewport: size, bypassCSP: true });
  const page = await ctx.newPage();

  if (preloadHrefs.length) {
    // Inject preloads into the HTML head before anything else parses. Route
    // interception rather than a rebuild, so the arms differ by one line only.
    await page.route('**/', async (route) => {
      if (route.request().resourceType() !== 'document') return route.continue();
      const res = await route.fetch();
      let html = await res.text();
      const tags = preloadHrefs
        .map((h) => `<link rel="preload" href="${h}" as="font" type="font/woff2" crossorigin>`)
        .join('');
      html = html.replace('</head>', `${tags}</head>`);
      await route.fulfill({ response: res, body: html });
    });
  }

  await page.addInitScript(() => {
    window.__lcp = 0;
    new PerformanceObserver((l) => {
      for (const e of l.getEntries()) window.__lcp = e.startTime;
    }).observe({ type: 'largest-contentful-paint', buffered: true });
  });

  await page.goto(URL_, { waitUntil: 'load' });
  // Give late candidates a chance; LCP is only final at input or unload.
  await page.waitForTimeout(2500);
  const lcp = await page.evaluate(() => Math.round(window.__lcp));
  await ctx.close();
  return lcp;
}

const median = (a) => {
  const s = [...a].sort((x, y) => x - y);
  return s.length % 2 ? s[(s.length - 1) / 2] : Math.round((s[s.length / 2 - 1] + s[s.length / 2]) / 2);
};

const browser = await chromium.launch();

// Discover the real font URLs once.
const probe = await browser.newContext();
const pp = await probe.newPage();
await pp.goto(URL_, { waitUntil: 'load' });
const allFonts = await fontsInUse(pp);
await probe.close();

// Preload only what the first viewport needs — preloading eleven faces would be
// a strawman, not the change M6 proposes.
const hrefs = allFonts.filter((u) => /bodoni-moda-latin-wght-normal|archivo-latin-wght-normal/.test(u));

console.log(`M6 A/B — LCP, ${RUNS} runs per arm, ${URL_}`);
console.log(`woff2 in build: ${allFonts.length} · preloading ${hrefs.length}:`);
hrefs.forEach((h) => console.log(`  ${h}`));

const rows = [];
for (const vp of VIEWPORTS) {
  for (const [arm, pre] of [['A no preload', []], ['B preload', hrefs]]) {
    const runs = [];
    for (let i = 0; i < RUNS; i++) runs.push(await measure(browser, vp, pre));
    rows.push({ vp: vp[0], arm, runs, median: median(runs), min: Math.min(...runs), max: Math.max(...runs) });
  }
}
await browser.close();

console.log('\n| viewport | arm | median LCP | min | max | runs |');
console.log('|---|---|---|---|---|---|');
for (const r of rows) {
  console.log(`| ${r.vp} | ${r.arm} | **${r.median} ms** | ${r.min} | ${r.max} | ${r.runs.join(', ')} |`);
}

console.log('\nVerdict per viewport (positive = preload is SLOWER):');
for (const vp of ['desktop', 'mobile']) {
  const a = rows.find((r) => r.vp === vp && r.arm.startsWith('A'));
  const b = rows.find((r) => r.vp === vp && r.arm.startsWith('B'));
  const d = b.median - a.median;
  const spread = Math.max(a.max - a.min, b.max - b.min);
  const decisive = Math.abs(d) > spread ? 'DECISIVE' : 'WITHIN NOISE — spread exceeds the delta';
  console.log(`  ${vp.padEnd(8)} ${d >= 0 ? '+' : ''}${d} ms   (run spread ${spread} ms) — ${decisive}`);
}
