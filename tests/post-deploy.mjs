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
 *
 * SETTLE WAIT AND N-OF-M, STATED UP FRONT — required by correction row 281 in
 * docs/STATUS.md, after a post-deploy seam gate went red-then-green three times
 * on 2026-08-09 with the cause never established. That row's words: "a post-deploy
 * gate that goes red one run in three is worse than no gate", and any such check
 * "needs a settle wait and an N-of-M rule stated up front, NOT a bare retry."
 *
 *   SETTLE   SETTLE_MS before the first fetch, so a CDN that has not finished
 *            propagating is not mistaken for a broken deploy.
 *   N-OF-M   an asset is FAILED only if it fails all ATTEMPTS tries, spaced
 *            RETRY_MS apart. One bad response is a blip; three is a defect.
 *
 * This is a threshold, not a bare retry: the rule is fixed here, not tuned per
 * run, and a partial failure is reported as flapping rather than silently passed.
 */

import { readFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';

const SITE = process.env.SITE_URL ?? 'https://stackclimb.com';
const DIST = 'dist/index.html';

/* The N-of-M rule. Fixed constants, not flags — a threshold you can tune per run
   is not a threshold. Self-test overrides them to keep the suite fast. */
const ATTEMPTS = Number(process.env.PD_ATTEMPTS ?? 3);
const RETRY_MS = Number(process.env.PD_RETRY_MS ?? 1500);
const SETTLE_MS = Number(process.env.PD_SETTLE_MS ?? 0);
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

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

async function once(url) {
  try {
    // GET, not HEAD: a CDN can answer HEAD from an edge rule while GET 404s,
    // and it is the GET a visitor makes.
    const r = await fetch(url, { redirect: 'follow' });
    return { status: r.status, bytes: (await r.arrayBuffer()).byteLength };
  } catch (e) {
    return { status: 0, bytes: 0, error: e.message };
  }
}

/** N-of-M: only a unanimous failure counts. Reports flapping when it is mixed. */
async function head(url) {
  const seen = [];
  for (let i = 0; i < ATTEMPTS; i++) {
    if (i) await sleep(RETRY_MS);
    const r = await once(url);
    seen.push(r);
    if (r.status === 200 && r.bytes > 0) {
      return { ...r, attempts: i + 1, flapped: i > 0 };
    }
  }
  const last = seen[seen.length - 1];
  return { ...last, attempts: ATTEMPTS, flapped: false, allFailed: true };
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
  const flapped = [];
  for (const r of results) {
    if (r.allFailed) {
      const why = r.error ? ` — ${r.error}` : '';
      problems.push(`${r.status || 'ERR'}  ${r.p}  (failed all ${ATTEMPTS} attempts)${why}`);
    } else if (r.flapped) {
      // Recovered within the rule, so not a failure — but never silent. A gate
      // that hides flapping is how the 08-09 cause went unestablished.
      flapped.push(`${r.p} recovered on attempt ${r.attempts} of ${ATTEMPTS}`);
    }
  }
  return { problems, refs, stamp, results, flapped };
}

/* -------------------------------- main -------------------------------- */

const isSelfTest = process.argv.includes('--self-test');
if (isSelfTest) {
  // Imported lazily so a production run never loads the fixture server.
  const { selfTest } = await import('./lib/post-deploy-selftest.mjs');
  process.exit((await selfTest(check, assetRefs, buildStamp, ATTEMPTS)) ? 1 : 0);
}

let expectStamp = null;
if (existsSync(DIST)) {
  expectStamp = buildStamp(await readFile(DIST, 'utf8'));
} else {
  console.log(`note: no ${DIST} — checking reachability only, not build freshness.`);
}

if (SETTLE_MS) {
  console.log(`settling ${SETTLE_MS}ms before first fetch…`);
  await sleep(SETTLE_MS);
}

const { problems, refs, stamp, flapped } = await check({ expectStamp });
if (flapped?.length) {
  console.warn(`\n! ${flapped.length} asset(s) flapped but recovered within the ${ATTEMPTS}-attempt rule:`);
  for (const f of flapped) console.warn(`  ${f}`);
  console.warn('  Not a failure. Recorded because unexplained flapping is a cause, not noise.\n');
}
if (problems.length) {
  console.error(`\n✖ post-deploy: ${problems.length} problem(s) at ${SITE}\n`);
  for (const p of problems) console.error(`  ${p}`);
  console.error('\nA deploy that printed Success can still have shipped a hole — that is why');
  console.error('this exists. Re-run `wrangler pages deploy dist` and check again.\n');
  process.exit(1);
}
console.log(`✓ post-deploy: ${SITE} serves ${stamp}, all ${refs.length} referenced assets 200`);
