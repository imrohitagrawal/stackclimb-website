import { test, expect } from '@playwright/test';

// Contact details must be labelled links, never printed as text a visitor has
// to copy by hand. Directive P-13 — raised twice, agreed once, dropped both
// times. This gate is what stops it being dropped a third time.
//
// Written BEFORE the fix and watched fail. A check written afterwards passes
// immediately and cannot be told apart from a broken one.

const EMAIL = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/;
const PROFILE_URL = /\b(?:linkedin\.com|github\.com)\/[a-zA-Z0-9._/-]+/;

test.describe('Contact details', () => {
  test('no bare email or profile URL is printed as text', async ({ page }) => {
    // RED WHEN: an address or profile URL is rendered as a text node instead of
    // being the href of a labelled link.
    await page.goto('/', { waitUntil: 'networkidle' });

    const offenders = await page.evaluate(
      ({ emailSrc, urlSrc }) => {
        const email = new RegExp(emailSrc);
        const url = new RegExp(urlSrc);
        const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
        const found = [];
        let scanned = 0;
        let node;
        while ((node = walker.nextNode())) {
          const text = node.textContent.trim();
          if (!text) continue;
          scanned++;
          if (email.test(text) || url.test(text)) {
            found.push({ text: text.slice(0, 60), parent: node.parentElement?.tagName });
          }
        }
        return { found, scanned };
      },
      { emailSrc: EMAIL.source, urlSrc: PROFILE_URL.source },
    );

    // DENOMINATOR: a page that rendered nothing would pass this trivially.
    expect(offenders.scanned, 'no text nodes found — the page did not render').toBeGreaterThan(50);

    expect(
      offenders.found,
      `${offenders.found.length} contact detail(s) printed as text instead of linked`,
    ).toEqual([]);
  });

  test('the contact destinations are reachable as links', async ({ page }) => {
    // RED WHEN: the mailto or a profile link is removed. Without this, the test
    // above could be satisfied by deleting contact details altogether — the
    // cheapest way to pass a "no bare text" check is to have no contact at all.
    await page.goto('/', { waitUntil: 'networkidle' });

    const mailto = page.locator('a[href^="mailto:"]');
    const linkedin = page.locator('a[href*="linkedin.com"]');
    const github = page.locator('a[href*="github.com"]');

    expect(await mailto.count(), 'no mailto: link on the page').toBeGreaterThan(0);
    expect(await linkedin.count(), 'no LinkedIn link on the page').toBeGreaterThan(0);
    expect(await github.count(), 'no GitHub link on the page').toBeGreaterThan(0);
  });

  test('every email call-to-action uses the same label', async ({ page }) => {
    // RED WHEN: one CTA says something different from the others. The nav and
    // hero say "Email me"; the contact plate said "Email Rohit" — same action,
    // two labels, which reads as carelessness.
    await page.goto('/', { waitUntil: 'networkidle' });

    const labels = await page
      .locator('a[href^="mailto:"]')
      .evaluateAll((els) => els.map((e) => e.textContent.trim()));

    expect(labels.length, 'no email CTAs found — this check measured nothing').toBeGreaterThan(1);
    expect(new Set(labels).size, `email CTAs disagree: ${JSON.stringify(labels)}`).toBe(1);
  });
});
