// Accessibility scan of everything that is NOT a plate — nav, skip link,
// footer, and any future chrome.
//
// Why (DEF-14): dod.spec.js scans per plate with `.include('#<id>')`, which is
// right for contrast (each plate must be judged on its own ground) and blind
// to everything outside. Proven by mutation 2026-08-09: an alt-less <img> and
// an empty <a href="/cv"> planted in the nav passed the whole suite. This
// file is the complement: one unscoped pass per route with `.plate` excluded,
// so every element is covered exactly once between the two files.
//
// What turns it red: replant that mutation — an <img> with no alt or an
// unlabelled link in Layout.astro's header or footer.

import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readdirSync } from 'node:fs';

// Routes derived from the build, the DEF-10 rule — never hand-typed.
const ROUTES = readdirSync('dist')
  .filter((f) => f.endsWith('.html') && f !== '404.html')
  .map((f) => (f === 'index.html' ? '/' : `/${f.replace(/\.html$/, '')}`));

test('route derivation found the build', () => {
  expect(ROUTES, 'no routes derived — was dist/ built?').toContain('/');
});

for (const route of ROUTES) {
  test(`${route} — page chrome has no accessibility violations`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });

    // DENOMINATOR: the exclusion must leave something to scan. A page whose
    // whole body were plates would make this file measure nothing.
    const chromeEls = await page.locator('body :not(.plate):not(.plate *)').count();
    expect(chromeEls, 'nothing outside .plate to scan — measured nothing').toBeGreaterThan(3);

    const results = await new AxeBuilder({ page })
      .exclude('.plate')
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    const rulesRun = results.passes.length + results.violations.length + results.incomplete.length;
    expect(rulesRun, 'axe evaluated no rules — the scan did not run').toBeGreaterThan(0);

    const found = results.violations.map(
      (v) => `${v.id} (${v.impact}) × ${v.nodes.length}: ${v.help}`,
    );
    expect(found, `axe found ${found.length} violation(s) outside the plates`).toEqual([]);
  });
}
