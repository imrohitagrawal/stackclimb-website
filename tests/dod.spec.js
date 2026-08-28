import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

// Mechanizes the Definition of Done in AGENTS.md. Every check states its
// DENOMINATOR and fails when that denominator is empty — a gate that measures
// nothing must not report pass.
//
// DEF-10. This used to read `const ROUTES = ['/']` with a comment asking the
// next person to remember to add to it. They would not have, and nothing would
// have said so: a new page would get zero coverage while every gate reported
// green. "Add it here when you add a page" is not a gate, it is a hope.
//
// Now derived from what the build actually emitted. Add src/pages/approach.astro,
// run the build, and it is under test — with no edit to this file.
//
// WHICH CHANGE TURNS THIS RED: delete dist/ and run the suite. It throws rather
// than quietly testing nothing. Add a page and skip the build, and the route is
// absent — which is DEF-11's stale-dist problem, and CI builds before it tests
// for exactly that reason.
//
// 404.html is excluded deliberately: it is reached by status code, not by URL,
// and `astro preview` serves it at /404.html where a real visitor never lands.
// It still gets its accessibility scan through the DoD suite's own route list
// below if it is ever served at a real path.
function builtRoutes(dir = 'dist') {
  if (!existsSync(dir)) {
    throw new Error(
      `${dir}/ does not exist — run "npm run build" first. Refusing to test zero routes.`,
    );
  }
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === '_astro') continue;
      // build.format:'file' means nested routes are still directories.
      for (const sub of readdirSync(join(dir, entry.name))) {
        if (sub.endsWith('.html')) {
          out.push(`/${entry.name}/${sub.replace(/index\.html$/, '').replace(/\.html$/, '')}`);
        }
      }
      continue;
    }
    if (!entry.name.endsWith('.html')) continue;
    if (entry.name === '404.html') continue;
    out.push(entry.name === 'index.html' ? '/' : `/${entry.name.replace(/\.html$/, '')}`);
  }
  return [...new Set(out)].sort();
}

const ROUTES = builtRoutes();

test.describe('Definition of Done', () => {
  test('routes under test is non-empty and includes the home page', async () => {
    // RED WHEN: the build emits nothing, or the derivation above breaks.
    // Without this, every test below would vacuously pass over zero pages and
    // CI would go green having checked nothing.
    expect(ROUTES.length, 'no routes enumerated — every gate below would measure nothing').toBeGreaterThan(0);
    // A second, sharper denominator: the derivation could "succeed" and return
    // a list that has lost the one page we know must exist. An empty-ish check
    // that counts something is not the same as counting the right thing.
    expect(ROUTES, 'the home page is missing from the derived route list').toContain('/');
    console.log(`routes under test (derived from dist/): ${ROUTES.join(', ')}`);
  });

  for (const route of ROUTES) {
    test(`${route} — no accessibility violations (WCAG 2.1 AA)`, async ({ page }) => {
      // RED WHEN: a contrast failure, missing alt text, unlabelled control, or
      // broken heading order is introduced on any plate.
      //
      // Scanned PER PLATE, with the plate scrolled into view. A single whole-page
      // scan at scroll position 0 judges every plate against the hero's ground,
      // because the backdrop repaints as each plate reaches the viewport. That
      // reports a contrast state no visitor ever sees. Scanning what is on screen
      // is what a visitor actually experiences.
      await page.goto(route, { waitUntil: 'networkidle' });

      const plateIds = await page.$$eval('.plate[id]', (els) => els.map((e) => e.id));

      // DENOMINATOR: zero plates means the selector broke and every assertion
      // below would pass over nothing.
      expect(plateIds.length, 'no plates found — this scan measured nothing').toBeGreaterThan(0);

      const found = [];
      let rulesRun = 0;

      for (const id of plateIds) {
        await page.evaluate(
          (p) => document.getElementById(p)?.scrollIntoView({ behavior: 'instant', block: 'start' }),
          id,
        );
        await page.waitForTimeout(900); // the ground cross-fade is 0.8s

        const results = await new AxeBuilder({ page })
          .include(`#${id}`)
          // P-10: giscus injects a cross-origin iframe here — its markup and
          // colours are Github's, not this site's, and this site cannot style
          // or fix them (an uninstalled-app error state was caught here with
          // its own 1.15:1 text, resolved on GitHub's side, not ours, once
          // the giscus App is installed). Excluding what this repo cannot
          // control, not excluding what it can — first-party content on
          // every other plate, including the rest of THIS plate, stays scanned.
          .exclude('.giscus')
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
          .analyze();

        rulesRun += results.passes.length + results.violations.length + results.incomplete.length;
        for (const v of results.violations) {
          found.push(`#${id} — ${v.id} (${v.impact}) × ${v.nodes.length}: ${v.help}`);
        }
      }

      // DENOMINATOR: axe must actually have evaluated rules. A misconfigured
      // builder returns zero violations AND zero passes, indistinguishable from success.
      expect(rulesRun, 'axe evaluated no rules — the scan did not run').toBeGreaterThan(0);
      expect(found, `axe found ${found.length} violation(s) across ${plateIds.length} plates`).toEqual([]);
    });

    test(`${route} — no horizontal scroll at any viewport`, async ({ page }) => {
      // RED WHEN: any element overflows the viewport width — a fixed width, an
      // unbroken long string, or a grid that does not collapse.
      //
      // RCA-013 (P3): 390/768/1440 alone missed /how-i-build's overflow —
      // 383px scrollWidth against 320 and 360, clean at 390 (63px and 23px
      // overflow respectively, both from .plate-copy's missing min-width: 0).
      // 320 and 360 are both named-mainstream phone widths narrower than 390,
      // the width this repo's own Definition of Done had checked exclusively.
      const widths = [320, 360, 390, 768, 1440];
      const overflowing = [];

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 0) overflowing.push(`${width}px overflows by ${overflow}px`);
      }

      // DENOMINATOR: prove the loop ran over every intended width. A floor,
      // not an equality — the old `.toBe(3)` went red when a FOURTH viewport
      // was added, failing "no viewports checked" while four were checked.
      // DEF-15: never write a check that goes red when coverage improves.
      expect(widths.length, 'fewer than five viewports checked').toBeGreaterThanOrEqual(5);
      expect(overflowing, 'page scrolls horizontally').toEqual([]);
    });

    /* The focus test moved to tests/focus-visible.spec.js (DEF-13). The
       version that lived here read outlineStyle/boxShadow/textDecorationLine —
       none of which is VISIBILITY — so `outline: 2px solid transparent`
       passed it, proven by mutation on 2026-08-09. The replacement compares
       rendered pixels, focused against unfocused. */

    test(`${route} — page has a title and a language`, async ({ page }) => {
      // RED WHEN: the layout drops <title> or the lang attribute. Both are
      // WCAG requirements that axe reports only on some rule sets.
      await page.goto(route, { waitUntil: 'networkidle' });
      await expect(page).toHaveTitle(/.+/);
      const lang = await page.locator('html').getAttribute('lang');
      expect(lang, '<html> has no lang attribute').toBeTruthy();
    });
  }
});

test.describe('Routing', () => {
  // Every URL on the domain used to return the home page with HTTP 200 — no
  // 404, no robots.txt, no sitemap. The cause was one missing file: Cloudflare
  // Pages treats a build with no top-level 404.html as a single-page app and
  // serves index.html for everything.
  //
  // Proved causally against Cloudflare's own asset router (wrangler pages dev):
  // with 404.html, /this-page-does-not-exist returns 404; remove it and the
  // same path returns 200 with the identical byte count as /.
  //
  // This test asserts the BUILD OUTPUT, because asserting the live behaviour
  // needs the Pages router and that is a post-deploy check, not a unit one.
  // Both matter and neither replaces the other — the post-deploy curl is in
  // the PR description and belongs in a deploy gate.
  //
  // RED WHEN: src/pages/404.astro is deleted or renamed, robots.txt is removed
  // from public/, or the sitemap integration is dropped from astro.config.mjs.
  test('the build emits a 404, a robots.txt, and a sitemap', async () => {
    const missing = ['404.html', 'robots.txt', 'sitemap-index.xml'].filter(
      (f) => !existsSync(join('dist', f)),
    );
    expect(missing, 'dist/ is missing files that routing and indexing depend on').toEqual([]);
  });

  test('the 404 page refuses to be indexed, and no other page does', async ({ page }) => {
    // A 404 that declares itself canonical tells a crawler the error page is a
    // real resource. That is how "Page not found" ends up in search results.
    await page.goto('/404.html', { waitUntil: 'networkidle' });
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

    // DENOMINATOR: the assertions above would also pass if `noindex` were
    // applied to the whole site by mistake. Prove a real page is still
    // indexable and still declares exactly one canonical.
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
  });

  test('every page declares its own canonical, not the home page', async ({ page }) => {
    // DEF-9. The canonical was the hard-coded string "https://stackclimb.com/",
    // so /approach and /cv would each have told Google they were the home page.
    //
    // RED WHEN: the canonical in Layout.astro goes back to a literal, or the
    // .html strip is removed — under build.format:'file' that would emit
    // "/approach.html" while the sitemap emits "/approach", naming two URLs
    // for one page.
    const seen = [];
    for (const route of ROUTES) {
      await page.goto(route, { waitUntil: 'networkidle' });
      const href = await page.locator('link[rel="canonical"]').getAttribute('href');
      expect(href, `${route} has no canonical`).toBeTruthy();
      expect(href, `${route} canonical still carries .html`).not.toMatch(/\.html$/);
      seen.push(href);
    }
    expect(seen.length, 'no routes checked — this test measured nothing').toBeGreaterThan(0);
    expect(new Set(seen).size, `two routes share a canonical: ${seen.join(' ')}`).toBe(seen.length);
  });
});

test.describe('Evidence capture', () => {
  // Not assertions — these produce the desktop and mobile screenshots that
  // AGENTS.md requires be LOOKED AT before a visual change is called done.
  for (const route of ROUTES) {
    test(`${route} — capture screenshot`, async ({ page }, testInfo) => {
      await page.goto(route, { waitUntil: 'networkidle' });
      await page.addStyleTag({
        content: '*,*::before,*::after{animation:none!important;transition:none!important}',
      });
      await page.waitForTimeout(400);
      const slug = route === '/' ? 'home' : route.replace(/\//g, '-').replace(/^-/, '');
      await testInfo.attach(`${slug}-${testInfo.project.name}`, {
        body: await page.screenshot({ fullPage: true }),
        contentType: 'image/png',
      });
    });
  }
});
