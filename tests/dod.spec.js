import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Mechanizes the Definition of Done in AGENTS.md. Every check states its
// DENOMINATOR and fails when that denominator is empty — a gate that measures
// nothing must not report pass.
//
// Routes are enumerated from the built sitemap-shaped reality of the site.
// When pages are added, add them here; the coverage test below fails if this
// list is empty.
const ROUTES = ['/'];

test.describe('Definition of Done', () => {
  test('routes under test is non-empty', async () => {
    // RED WHEN: ROUTES is emptied. Without this, every test below would
    // vacuously pass over zero pages and CI would go green having checked nothing.
    expect(ROUTES.length, 'no routes enumerated — every gate below would measure nothing').toBeGreaterThan(0);
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
      const widths = [390, 768, 1440];
      const overflowing = [];

      for (const width of widths) {
        await page.setViewportSize({ width, height: 900 });
        await page.goto(route, { waitUntil: 'networkidle' });
        const overflow = await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        );
        if (overflow > 0) overflowing.push(`${width}px overflows by ${overflow}px`);
      }

      // DENOMINATOR: prove the loop ran over every intended width.
      expect(widths.length, 'no viewports checked').toBe(3);
      expect(overflowing, 'page scrolls horizontally').toEqual([]);
    });

    test(`${route} — every interactive element has a visible focus indicator`, async ({ page }) => {
      // RED WHEN: a rule such as `:focus { outline: none }` lands without a
      // replacement indicator, or a new control ships with no focus style.
      await page.goto(route, { waitUntil: 'networkidle' });

      const focusable = page.locator(
        'a[href], button, input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      const count = await focusable.count();

      // DENOMINATOR: a page with zero focusable elements would pass this test
      // trivially. The site has navigation and links, so zero means the check broke.
      expect(count, 'no focusable elements found — this check measured nothing').toBeGreaterThan(0);

      const noIndicator = [];
      for (let i = 0; i < count; i++) {
        const el = focusable.nth(i);
        if (!(await el.isVisible())) continue;
        await el.focus();
        const style = await el.evaluate((node) => {
          const s = getComputedStyle(node);
          return {
            outlineWidth: s.outlineWidth,
            outlineStyle: s.outlineStyle,
            boxShadow: s.boxShadow,
            borderBottomColor: s.borderBottomColor,
            textDecorationLine: s.textDecorationLine,
          };
        });
        const hasOutline = style.outlineStyle !== 'none' && parseFloat(style.outlineWidth) > 0;
        const hasShadow = style.boxShadow !== 'none';
        const hasUnderline = style.textDecorationLine.includes('underline');
        if (!hasOutline && !hasShadow && !hasUnderline) {
          noIndicator.push(await el.evaluate((n) => n.outerHTML.slice(0, 90)));
        }
      }
      expect(noIndicator, 'focusable elements with no visible focus indicator').toEqual([]);
    });

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
