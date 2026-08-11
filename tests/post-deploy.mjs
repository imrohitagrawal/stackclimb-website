#!/usr/bin/env node
/**
 * Post-deploy gate. The only check in this repo that looks at PRODUCTION.
 *
 * WHY THIS EXISTS. On 2026-08-11 a `wrangler pages deploy` printed
 * "✨ Success! Uploaded 13 files (20 already uploaded)" and shipped a broken
 * site: `citevyn-demo.B8TdRMpf.webp` returned 404 while every other asset
 * served. Cloudflare's content-hash dedup had reported it as already uploaded
 * when it was not, and wrangler never reads back what it skips — so a wrong
 * answer from the server is indistinguishable from a right one.
 *
 * Every gate in gates.yml runs against a local `astro preview` of a freshly
 * built dist/. The file was CORRECT in dist/ (30,430 bytes, referenced
 * correctly). Nothing was wrong at build time. The failure happened during
 * upload, which no existing check observes. The page returned 200 throughout.
 *
 * RED WHEN: production serves a different build than the local dist/, or any
 * asset the live HTML references is not fetchable. Both were true after that
 * deploy; both are checked here.
 *
 * PROVE IT BITES (both directions, per AGENTS.md):
 *   node tests/post-deploy.mjs --self-test
 * That plants each failure shape against a local fixture server and asserts the
 * checker reports it — a gate that has only ever seen a healthy site has proven
 * nothing.
 *
 * Deliberately NOT a Playwright test: it must run against a real origin with no
 * browser, so it can sit in a deploy step or a cron without a runner image.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { createServer } from 'node:http';

const SITE = process.env.SITE_URL ?? 'https://stackclimb.com';
const DIST = 'dist/index.html';

/** Every same-origin build asset the document references. */
export function assetRefs(html) {
  // Hashed build output only. Deliberately not <a href> — a link to another
  // page is not an asset, and a 404 there is a different defect with a
  // different gate (links.spec.js).
  const out = new Set();
  for (const m of html.matchAll(/["'(]\s*(\/_astro\/[A-Za-z0-9._-]+)\s*["')]/g)) out.add(m[1]);
  for (const m of html.matchAll(/srcset="([^"]+)"/g)) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url.startsWith('/_astro/')) out.add(url);
    }
  }
  return [...out].sort();
}

/** The build's fingerprint: its hashed stylesheet. Changes on any source change. */
export function buildStamp(html) {
  return html.match(/\/_astro\/[A-Za-z0-9._-]*\.css/)?.[0] ?? null;
}

async function head(url) {
  try {
    // GET, not HEAD: a CDN can answer HEAD from an edge rule while GET 404s,
    // and it is the GET a visitor makes.
    const r = await fetch(url, { redirect: 'follow' });
    return { status: r.status, bytes: (await r.arrayBuffer()).byteLength };
  } catch (e) {
    return { status: 0, bytes: 0, error: e.message };
  }
}

export async function check({ site = SITE, expectStamp = null } = {}) {
  const problems = [];
  const res = await fetch(site, { redirect: 'follow' }).catch((e) => ({ ok: false, err: e.message }));
  if (!res || res.err || !res.ok) {
    problems.push(`${site} did not answer (${res?.err ?? res?.status})`);
    return { problems, refs: [], stamp: null };
  }
  const html = await res.text();
  const stamp = buildStamp(html);

  if (expectStamp && stamp !== expectStamp) {
    problems.push(
      `production is a different build\n      live:  ${stamp}\n      local: ${expectStamp}`,
    );
  }

  const refs = assetRefs(html);
  if (refs.length === 0) problems.push('no hashed assets referenced — the page may not have built');

  const results = await Promise.all(refs.map(async (p) => ({ p, ...(await head(site + p)) })));
  for (const r of results) {
    if (r.status !== 200) problems.push(`${r.status || 'ERR'}  ${r.p}${r.error ? ` (${r.error})` : ''}`);
    else if (r.bytes === 0) problems.push(`200 but empty  ${r.p}`);
  }
  return { problems, refs, stamp, results };
}

/* ------------------------------ self-test ------------------------------ */

async function fixture(html, { break404 = null } = {}) {
  const srv = createServer((req, res) => {
    if (req.url === '/') {
      res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    if (break404 && req.url === break404) {
      res.writeHead(404, { 'content-type': 'text/plain' });
      return res.end('not found');
    }
    res.writeHead(200, { 'content-type': 'application/octet-stream' });
    res.end('x'.repeat(64));
  });
  await new Promise((r) => srv.listen(0, r));
  return { url: `http://localhost:${srv.address().port}`, stop: () => srv.close() };
}

async function selfTest() {
  const HTML =
    '<link rel="stylesheet" href="/_astro/Layout.AAAA1111.css">' +
    '<img src="/_astro/one.BBBB2222.webp">' +
    '<picture><source srcset="/_astro/two.CCCC3333.webp"></picture>';
  let failed = 0;
  const say = (ok, what) => { console.log(`  ${ok ? 'ok  ' : 'FAIL'} ${what}`); if (!ok) failed++; };

  // Extraction — the denominator. A checker that finds zero assets passes everything.
  const refs = assetRefs(HTML);
  say(refs.length === 3, `extracts all 3 refs (got ${refs.length}) — incl. srcset inside <picture>`);
  say(buildStamp(HTML) === '/_astro/Layout.AAAA1111.css', 'reads the build stamp');

  // 1. Healthy site: must be silent. Guards against crying wolf.
  let f = await fixture(HTML);
  let r = await check({ site: f.url, expectStamp: '/_astro/Layout.AAAA1111.css' });
  say(r.problems.length === 0, `healthy site reports nothing (got ${r.problems.length})`);
  say(r.refs.length === 3, 'healthy site still counted 3 assets');
  f.stop();

  // 2. THE REAL DEFECT: one asset 404s while the page is 200.
  f = await fixture(HTML, { break404: '/_astro/one.BBBB2222.webp' });
  r = await check({ site: f.url, expectStamp: '/_astro/Layout.AAAA1111.css' });
  say(r.problems.some((p) => p.includes('404') && p.includes('one.BBBB2222')),
      'catches a 404 asset on a 200 page — the 2026-08-11 deploy defect');
  f.stop();

  // 3. Stale production: page fine, every asset fine, wrong build.
  f = await fixture(HTML);
  r = await check({ site: f.url, expectStamp: '/_astro/Layout.ZZZZ9999.css' });
  say(r.problems.some((p) => p.includes('different build')),
      'catches production serving an older build than dist/');
  f.stop();

  console.log(failed ? `\nSELF-TEST FAILED (${failed})` : '\nSELF-TEST PASS — the gate bites and does not cry wolf');
  return failed;
}

/* -------------------------------- main -------------------------------- */

const isSelfTest = process.argv.includes('--self-test');
if (isSelfTest) {
  process.exit((await selfTest()) ? 1 : 0);
}

let expectStamp = null;
if (existsSync(DIST)) {
  expectStamp = buildStamp(await readFile(DIST, 'utf8'));
} else {
  console.log(`note: no ${DIST} — checking reachability only, not build freshness.`);
}

const { problems, refs, stamp } = await check({ expectStamp });
if (problems.length) {
  console.error(`\n✖ post-deploy: ${problems.length} problem(s) at ${SITE}\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nA deploy that printed Success can still have shipped a hole — that is why');
  console.error('this exists. Re-run `wrangler pages deploy dist` and check again.\n');
  process.exit(1);
}
console.log(`✓ post-deploy: ${SITE} serves ${stamp}, all ${refs.length} referenced assets 200`);
