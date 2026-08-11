/**
 * Self-test for tests/post-deploy.mjs — extracted here because it is a separate
 * concern from the check, and because the D8 budget caught the combined file at
 * 254 lines against a 250 ceiling. The rule is "modularize, do not trim
 * comments", so the comments stayed and the file split.
 *
 * It plants each failure shape against a local fixture server and asserts the
 * checker reports it. A gate that has only ever seen a healthy site has proven
 * nothing, and this one has to prove four things:
 *
 *   1. a 404 asset on a 200 page       — the 2026-08-11 deploy defect
 *   2. production serving an older build than dist/
 *   3. one transient 503 RECOVERS      — the N-of-M rule not crying wolf
 *   4. a persistent failure still fails — the N-of-M rule still biting
 *
 * plus a denominator check: a checker that extracts zero assets would pass
 * everything silently, so the extraction count is asserted too.
 */
import { createServer } from 'node:http';

export async function fixture(html, { break404 = null } = {}) {
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

async function flakyFixture(html, path, failFirst) {
  let hits = 0;
  const srv = createServer((req, res) => {
    if (req.url === '/') { res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' }); return res.end(html); }
    if (req.url === path && hits++ < failFirst) { res.writeHead(503); return res.end('flap'); }
    res.writeHead(200, { 'content-type': 'application/octet-stream' }); res.end('x'.repeat(64));
  });
  await new Promise((r) => srv.listen(0, r));
  return { url: `http://localhost:${srv.address().port}`, stop: () => srv.close() };
}

export async function selfTest(check, assetRefs, buildStamp, ATTEMPTS) {
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

  // 4. THE N-OF-M RULE. One transient 503 must NOT fail the gate; three must.
  f = await flakyFixture(HTML, '/_astro/one.BBBB2222.webp', 1);
  r = await check({ site: f.url, expectStamp: '/_astro/Layout.AAAA1111.css' });
  say(r.problems.length === 0 && r.flapped.length === 1,
      'one transient 503 recovers and reports as flapping, not failure ' +
      `(problems ${r.problems.length}, flapped ${r.flapped.length})`);
  f.stop();

  f = await flakyFixture(HTML, '/_astro/one.BBBB2222.webp', 99);
  r = await check({ site: f.url, expectStamp: '/_astro/Layout.AAAA1111.css' });
  say(r.problems.some((p) => p.includes(`failed all ${ATTEMPTS} attempts`)),
      'a persistent failure still fails, after all attempts');
  f.stop();

  console.log(failed ? `\nSELF-TEST FAILED (${failed})` : '\nSELF-TEST PASS — the gate bites and does not cry wolf');
  return failed;
}
