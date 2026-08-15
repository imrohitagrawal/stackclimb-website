// Every nav destination must be REACHABLE BY ACTIVATION at every viewport —
// not merely present in the DOM.
//
// Why this exists (DEF-42, RCA-004): below 900px the nav links were
// display:none with nothing in their place. Every existing check passed them:
// links.spec.js resolves hrefs, which display:none does not change;
// nav-contrast.mjs scores what is visible, so it scored two elements and
// called them green; axe has no rule for an emptied menu. count() proves
// existence, href proves intent, neither proves a finger can get there.
// This gate clicks.
//
// What turns it red: hiding the menu at any tested viewport (re-add
//   `.site-nav .menu { display:none }` under max-width: 900px), hiding the
//   desktop row without a replacement, a destination whose activation goes
//   nowhere, or the panel failing to open. Watch-it-fail run is recorded in
//   the commit that adds this file.
//
// Destinations are DERIVED from the rendered header, never typed here — a
// hand-maintained list in a gate is how DEF-10, DEF-44 and touch.css each
// went quietly narrow. The one literal below ('/cv') is not a route list; it
// is the partner assertion AGENTS.md requires so that "every destination
// passed" can never be satisfied by an empty set.

import { test, expect } from '@playwright/test';

/* Collect unique internal destinations from BOTH nav surfaces, visible or
   not. mailto is excluded: activating it opens a mail client, and links.spec
   already covers its shape. */
async function destinations(page) {
  return page.evaluate(() => {
    const links = document.querySelectorAll('.site-nav a[href]');
    const out = new Map();
    for (const a of links) {
      const href = a.getAttribute('href');
      if (!href || href.startsWith('mailto:')) continue;
      if (href === '/') continue; // the brand; "go home" is links.spec's job
      out.set(href, a.textContent.trim());
    }
    return [...out.entries()].map(([href, label]) => ({ href, label }));
  });
}

/* Activate the destination the way a visitor does: if no link for it is
   visible, open the disclosure menu first. Returns what happened. */
async function activate(page, href) {
  const link = page.locator(`.site-nav a[href="${href}"]:visible`).first();
  if ((await link.count()) === 0) {
    const summary = page.locator('.site-nav .menu > summary');
    await expect(summary, `no visible link for ${href} and no menu to open`).toBeVisible();
    await summary.click();
    await expect(
      page.locator(`.site-nav a[href="${href}"]:visible`).first(),
      `opened the menu and ${href} is still not visible`,
    ).toBeVisible();
  }
  await page.locator(`.site-nav a[href="${href}"]:visible`).first().click();
}

// D57's nav has no CV item (package 5). RCA-004's concern — the CV must
// stay reachable by activation, not merely present — travels a different
// path now: the home act's own "The full record" link (ProofPlate.astro,
// unchanged by this package) and /experience's own CV link. Proved both
// directions when this shipped: deleting every /cv link on '/' reds this;
// the nav no longer needing to carry it does not.
test('/ — the CV stays reachable by activation, off the act, not the nav', async ({ page }) => {
  await page.goto('/');
  const link = page.locator('a[href="/cv"]:visible').first();
  await expect(link, 'no visible path to /cv anywhere on the home page').toBeVisible();
  await link.click();
  await expect(page, 'clicking the CV link did not navigate to /cv').toHaveURL(/\/cv$/);
});

for (const route of ['/', '/cv']) {
  test(`${route} — every nav destination is reachable by activation`, async ({ page }) => {
    await page.goto(route);
    const dests = await destinations(page);

    // The partner assertion: an emptied nav must not pass as "all reachable".
    expect(dests.length, 'the nav lists no internal destinations at all').toBeGreaterThan(0);
    // D57's nav drops /cv (package 5) — the O-30SEC concern this literal
    // protected now travels a different path: the standalone CV-reachability
    // test below, off the home act and /experience instead of the nav.
    // Round-2 review: deleting Systems and Contact from the NAV array passed —
    // a derived population shrinks with the mutilation it should catch.
    // RCA-004's damage statement names TWO must-reach surfaces: the CV and the
    // contact plate. Both are partner literals now; the rest stays derived.
    expect(
      dests.map((d) => d.href),
      'no route to the contact plate — RCA-004 names it as must-reach',
    ).toContain('/#contact');

    // Codex round-1 finding: pointing every label at ONE href would collapse
    // the Map to a single destination and "every destination reachable" would
    // pass over a nav where Systems, CV and Contact all go the same place.
    // Distinct labels must map to distinct destinations — derived, not typed.
    const labelCount = await page.evaluate(
      () =>
        new Set(
          [...document.querySelectorAll('.site-nav a[href]:not([href^="mailto:"])')]
            .filter((a) => a.getAttribute('href') !== '/')
            .map((a) => a.textContent.trim()),
        ).size,
    );
    expect(dests.length, 'nav labels outnumber destinations — labels share an href').toBe(
      labelCount,
    );

    for (const { href, label } of dests) {
      await page.goto(route);
      await activate(page, href);

      const url = new URL(href, page.url());
      if (url.hash) {
        // A fragment arrives when the target element is at the viewport top.
        // The page smooth-scrolls (~3s on a 12,000px page), so poll.
        const id = url.hash.slice(1);
        await page.waitForFunction(
          (fid) => {
            const el = document.getElementById(fid);
            return el && Math.abs(el.getBoundingClientRect().top) < window.innerHeight;
          },
          id,
          { timeout: 8000 },
        ).catch(() => {
          throw new Error(
            `"${label}" (${href}) activated from ${route} but #${id} never arrived in view`,
          );
        });
        expect(page.url(), `"${label}" did not navigate`).toContain(url.hash);
      } else {
        await expect(page, `"${label}" (${href}) did not leave ${route}`).toHaveURL(
          new RegExp(`${url.pathname.replace(/\//g, '\\/')}$`),
        );
      }
    }
  });

  test(`${route} — the page scrolls at all`, async ({ page }) => {
    // Round-2 review: `html, body { overflow: hidden }` froze the page on one
    // plate of fourteen and every gate stayed green — fragment links still
    // "arrive" because scrollIntoView repositions even inside a clipped box.
    // A page whose content is taller than the viewport must move under the
    // wheel, or no amount of reachable links helps.
    await page.goto(route);
    const taller = await page.evaluate(
      () => document.documentElement.scrollHeight > window.innerHeight * 1.5,
    );
    test.skip(!taller, 'page fits in one viewport; nothing to scroll');
    await page.mouse.wheel(0, 1200);
    await page.waitForTimeout(400);
    const y = await page.evaluate(() => window.scrollY);
    expect(y, 'a wheel of 1200px moved the page 0px — scrolling is broken').toBeGreaterThan(0);
  });

  test(`${route} — exactly one nav entry point is offered`, async ({ page }) => {
    await page.goto(route);
    // Two rendered copies exist by design (one array, two surfaces), and CSS
    // must expose exactly one entry point per viewport: the flat row OR the
    // menu button, never both (a visitor offered two menus) and never neither
    // (DEF-42 again). A closed <details> hides its panel via the element's own
    // semantics, so the entry points are the right thing to probe — not the
    // panels' computed display.
    const row = await page.locator('.site-nav > nav').isVisible();
    const menuButton = await page.locator('.site-nav .menu > summary').isVisible();
    expect(
      { row, menuButton },
      row && menuButton ? 'both nav surfaces are offered at once' : 'no nav surface is offered',
    ).toEqual(row ? { row: true, menuButton: false } : { row: false, menuButton: true });
  });
}
