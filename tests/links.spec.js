import { test, expect } from '@playwright/test';
import { readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

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

// Recurses. It used to read only the top level, so a nested page such as
// /projects/foo would never be tested and nothing would say so — the same
// silent-narrowing defect as DEF-10 and DEF-44, in a gate written to catch
// that class. Found by a cross-model review (Codex).
function builtRoutes(dir = 'dist', prefix = '') {
  if (!existsSync(dir)) throw new Error('dist/ missing — run "npm run build" first');
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (entry.name === '_astro') continue;
      out.push(...builtRoutes(join(dir, entry.name), `${prefix}/${entry.name}`));
      continue;
    }
    if (!entry.name.endsWith('.html') || entry.name === '404.html') continue;
    out.push(entry.name === 'index.html' ? `${prefix}/` : `${prefix}/${entry.name.replace(/\.html$/, '')}`);
  }
  return [...new Set(out.map((r) => (r === '' ? '/' : r)))].sort();
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

        // A bare "#" or "#" with nothing after it is a placeholder, not a
        // destination. It used to slip through both checks: path is '' so the
        // fetch is skipped, and frag is '' which is falsy so the id lookup is
        // skipped too. A link that goes nowhere passed a test called "every
        // internal link resolves". Found by a cross-model review (Codex).
        if (href === '#' || href === '') {
          broken.push(`${route}: "${text}" → "${href}" is a placeholder, not a destination`);
          continue;
        }

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

    test(`${route} — the skip link bypasses to THIS page`, async ({ page }) => {
      // The hole this closes, found by /impeccable critique and not by the test
      // above. The skip link read href="/#overview". That RESOLVES — `/` exists
      // and `#overview` is on it — so "every internal link resolves" passed
      // while the control was broken: on /cv it navigated the reader off the
      // page instead of bypassing the nav. Lighthouse scored skip-link 0 and it
      // was the whole 2-point accessibility gap on /cv. axe has no skip-link rule.
      //
      // A skip link is not just a link that works. It must land on the CURRENT
      // page, or it is not a bypass mechanism at all. That is the rule the
      // resolve test could not express, because it is about WHICH page.
      //
      // RED WHEN: the skip link points at another page, or at an id that is not
      // in this document.
      await page.goto(route, { waitUntil: 'networkidle' });

      const skip = page.locator('a.skip').first();
      await expect(skip, 'no skip link on this page').toHaveCount(1);

      const href = await skip.getAttribute('href');
      expect(href, 'skip link has no href').toBeTruthy();
      expect(href, `skip link "${href}" leaves this page — it must target an id on ${route}`)
        .toMatch(/^#/);

      const targetId = href.slice(1);
      await expect(
        page.locator(`[id="${targetId}"]`),
        `skip link targets #${targetId}, which is not on ${route}`,
      ).toHaveCount(1);

      // And it must actually be reachable: first Tab should land on it.
      await page.keyboard.press('Tab');
      const focusedIsSkip = await page.evaluate(
        () => document.activeElement?.classList.contains('skip') ?? false,
      );
      expect(focusedIsSkip, 'the skip link is not the first focusable element').toBe(true);

      // ACTIVATE IT. Everything above proves the link EXISTS, is focusable, and
      // points somewhere real — and a preventDefault() on its click handler
      // would satisfy all of it while the control did nothing. That is DEF-28's
      // lesson one level deeper: count() proves existence, never reachability,
      // and href proves intent, never behaviour. Found by a cross-model review.
      //
      // RED WHEN: something calls preventDefault() on the skip link, or the
      // target stops being scrollable/focusable.
      await page.keyboard.press('Enter');
      await page.waitForTimeout(300);

      const landed = await page.evaluate((id) => {
        const el = document.getElementById(id);
        if (!el) return { ok: false, hash: location.hash, focused: false };
        const active = document.activeElement;
        return {
          hash: location.hash,
          focused: active === el || el.contains(active),
          focusable: el.hasAttribute('tabindex'),
        };
      }, targetId);

      // MY FIRST VERSION OF THIS CHECK WAS VACUOUS and the mutation caught it:
      // it accepted "the page scrolled to the target", and #main sits at the
      // TOP of the document, so at scroll 0 that is trivially true whether or
      // not the link did anything. preventDefault() still passed.
      //
      // The hash is the signal that the DEFAULT ACTION actually ran, and it is
      // exactly what preventDefault() suppresses. Focus is the signal that the
      // link did its real job — and it only works because <main> carries
      // tabindex="-1"; a skip link pointing at a non-focusable target moves the
      // sequential focus origin but not activeElement, which is why so many
      // skip links are decorative.
      expect(
        landed.hash,
        `pressing Enter on the skip link did not navigate — the default action was suppressed`,
      ).toBe(`#${targetId}`);

      expect(
        landed.focused,
        `focus did not land in #${targetId}. The target needs tabindex="-1" or the skip link moves nothing for a screen reader`,
      ).toBe(true);
    });
  }
});
