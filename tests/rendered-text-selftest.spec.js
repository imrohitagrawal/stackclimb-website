// The self-test for D163's autonomy boundary.
//
// tests/lib/rendered-text.mjs decides whether an autonomous package may merge
// itself: if the rendered text of every route is byte-identical before and
// after a change, P-18 is not engaged and the package self-merges. That makes
// it the single most load-bearing check in docs/practices/autonomous-run.md —
// and a gate that has never been proved to bite proves nothing.
//
// This session shipped that exact defect twice (a gate asserting coverage it
// did not have; a generator that made its artifact contradict the site), so
// this helper does not go near an autonomous run until it is shown to catch
// each class of change it claims to catch, by execution.
//
// RED WHEN: renderedText() stops seeing a text change — e.g. someone adds a
// visibility filter, restricts it to one element, or trims whitespace to
// nothing. Each case below fails independently and says which.

import { test, expect } from '@playwright/test';
import { renderedText, renderedTextByRoute, diffRoutes } from './lib/rendered-text.mjs';
import { siteRoutes } from './lib/routes.mjs';

test.describe('rendered-text — the autonomy boundary catches what it claims to', () => {
  test('it reads a real page, not an empty string', async ({ page }) => {
    // The vacuity partner. Every assertion below is "a change was detected";
    // an extractor returning "" detects every change and means nothing.
    await page.goto('/', { waitUntil: 'networkidle' });
    const text = await renderedText(page);
    expect(text.length, 'the home page produced almost no text — the extractor is broken').toBeGreaterThan(2000);
    expect(text, 'the headline must be in the extracted text').toContain('refuse');
  });

  test('it EXCLUDES script and style content', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const before = await renderedText(page);
    await page.evaluate(() => {
      const s = document.createElement('script');
      s.type = 'application/json';
      s.textContent = 'SENTINEL_SCRIPT_TEXT_MUST_NOT_APPEAR';
      document.body.appendChild(s);
      const st = document.createElement('style');
      st.textContent = '.sentinel::after { content: "SENTINEL_STYLE_TEXT"; }';
      document.body.appendChild(st);
    });
    const after = await renderedText(page);
    expect(after).not.toContain('SENTINEL_SCRIPT_TEXT_MUST_NOT_APPEAR');
    expect(after).not.toContain('SENTINEL_STYLE_TEXT');
    expect(after, 'adding only script/style must not change the visible text').toBe(before);
  });

  test('it CATCHES a reworded claim — the case P-18 exists for', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const before = await renderedText(page);
    const changed = await page.evaluate(() => {
      const el = [...document.querySelectorAll('#top .ctas .btn')][0];
      const was = el.textContent;
      el.textContent = 'What he built'; // the exact drift og.png shipped for weeks
      return was;
    });
    const after = await renderedText(page);
    expect(changed, 'the fixture must have found a real CTA').toBeTruthy();
    expect(after, 'a reworded CTA MUST change the rendered text').not.toBe(before);
  });

  test('it CATCHES text that was hidden becoming shown', async ({ page }) => {
    // og.png shipped reading CHECKING because a generator revealed an element
    // the page hides. A visibility filter here would call that "no change",
    // which is why renderedText() deliberately has none. This test is what
    // stops someone "optimising" one in.
    await page.goto('/', { waitUntil: 'networkidle' });
    const before = await renderedText(page);
    await page.evaluate(() => {
      const el = document.createElement('p');
      el.hidden = true;
      el.textContent = 'SENTINEL_HIDDEN_BUT_PRESENT';
      document.body.appendChild(el);
    });
    const after = await renderedText(page);
    expect(after, 'hidden text is still text — it must be in the extraction').toContain(
      'SENTINEL_HIDDEN_BUT_PRESENT',
    );
    expect(after).not.toBe(before);
  });

  test('it IGNORES a pure styling change — so gate work can self-merge', async ({ page }) => {
    // The other half of the contract. If restyling registered as a text
    // change, every eligible package would queue and the boundary would be
    // useless in the safe direction rather than the dangerous one.
    await page.goto('/', { waitUntil: 'networkidle' });
    const before = await renderedText(page);
    await page.evaluate(() => {
      const el = document.querySelector('#top .ctas .btn');
      el.style.color = 'magenta';
      el.style.transform = 'translateY(40px)';
      el.style.fontSize = '9px';
    });
    const after = await renderedText(page);
    expect(after, 'colour, transform and size changes must NOT register as text drift').toBe(before);
  });

  test('diffRoutes reports the route and the first differing line', async () => {
    const before = { '/a': 'one\ntwo\nthree', '/b': 'same' };
    const after = { '/a': 'one\nTWO\nthree', '/b': 'same' };
    const d = diffRoutes(before, after);
    expect(d).toHaveLength(1);
    expect(d[0].route).toBe('/a');
    expect(d[0].firstDiffLine).toBe(1);
    expect(d[0].before).toBe('two');
    expect(d[0].after).toBe('TWO');
    // And it must report nothing when nothing changed, or it would queue every
    // package forever.
    expect(diffRoutes(before, before)).toEqual([]);
  });

  test('it covers every site route, and each one has real text', async ({ page }) => {
    const routes = await siteRoutes();
    expect(routes.length, 'siteRoutes() must find routes at all').toBeGreaterThan(3);
    const map = await renderedTextByRoute(page, routes);
    expect(Object.keys(map).sort()).toEqual([...routes].sort());
    for (const [route, text] of Object.entries(map)) {
      expect(text.length, `${route} produced almost no text`).toBeGreaterThan(400);
    }
  });
});
