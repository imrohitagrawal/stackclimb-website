import { test, expect } from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';

// Every internal link must actually go somewhere.
//
// WHY THIS EXISTS. The nav read href="#work" for months. With one page that
// worked. The moment /cv existed those became fragments that do not exist on
// that page, so "Systems" and "Contact" silently did nothing — no navigation,
// no console error, and nothing red. The links were present, visible,
// focusable and correctly labelled, so every existing gate passed them:
// dod.spec.js checks focus indicators, axe checks contrast and naming, and
// contact.spec.js checks the contact plate. None of them asks whether a link
// ARRIVES anywhere.
//
// That is the general shape of the bug this file exists for: a link is the one
// element whose whole purpose is invisible to the DOM. `count()` proves
// existence, never reachability — a lesson this repo already paid for once, in
// DEF-28's cross-model review.
//
// WHICH CHANGE TURNS IT RED: point any internal href at a path that does not
// build, or at a #fragment whose id is not on the destination page. Revert the
// nav to bare "#work" and the fragment check fails on /cv.

function builtRoutes(dir = 'dist') {
  if (!existsSync(dir)) throw new Error('dist/ missing — run "npm run build" first');
  return readdirSync(dir)
    .filter((f) => f.endsWith('.html') && f !== '404.html')
    .map((f) => (f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`))
    .sort();
}

const ROUTES = builtRoutes();

test.describe('Internal links', () => {
  for (const route of ROUTES) {
    test(`${route} — every internal link resolves`, async ({ page, baseURL }) => {
      await page.goto(route, { waitUntil: 'networkidle' });

      const links = await page.$$eval('a[href]', (as) =>
        as.map((a) => ({ href: a.getAttribute('href'), text: a.textContent.trim().slice(0, 30) })),
      );

      // DENOMINATOR: a page with no links, or a broken selector, must not pass.
      expect(links.length, `${route} has no links — this check measured nothing`).toBeGreaterThan(0);

      const broken = [];
      let internalChecked = 0;

      for (const { href, text } of links) {
        if (!href) continue;
        if (/^(mailto:|tel:|https?:)/.test(href)) continue; // external, not ours to guarantee
        internalChecked++;

        // Split "/path#frag" into the page to load and the id to find on it.
        const [path, frag] = href.split('#');
        const target = path === '' ? route : path;

        if (path !== '') {
          const res = await page.request.get(new URL(target, baseURL).href);
          if (!res.ok()) {
            broken.push(`${route}: "${text}" → ${href} returned ${res.status()}`);
            continue;
          }
        }

        if (frag) {
          // Load the destination and look for the id there — NOT on the current
          // page. That distinction is the whole bug: "#work" resolved against
          // /cv, found nothing, and did nothing.
          if (target !== route) await page.goto(target, { waitUntil: 'domcontentloaded' });
          // An attribute selector, not `#${frag}`: CSS.escape is a browser API
          // and this runs in Node, and an unescaped id with a dot or digit
          // start would silently build a selector that matches nothing — a
          // check that reports "broken" for a link that is fine.
          const found = await page.locator(`[id="${frag}"]`).count();
          if (found === 0) broken.push(`${route}: "${text}" → ${href} — no #${frag} on ${target}`);
          if (target !== route) await page.goto(route, { waitUntil: 'domcontentloaded' });
        }
      }

      // DENOMINATOR: if every link were external this would pass having checked
      // nothing. The site's own nav is internal, so zero means the filter broke.
      expect(internalChecked, `${route}: no internal links checked`).toBeGreaterThan(0);
      expect(broken, `internal links that do not arrive:\n${broken.join('\n')}`).toEqual([]);
    });
  }
});
