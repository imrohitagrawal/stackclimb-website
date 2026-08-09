import { test, expect } from '@playwright/test';
import { readLinks } from './lib/read-links.mjs';

// Every email call-to-action, page-wide. Split from contact.spec.js on
// 2026-08-09 when that file crossed the D8 250-line budget — and the split is
// the right cut anyway: contact.spec owns the #contact plate, this file owns
// the CTAs wherever they appear.

const EMAIL_ADDRESS = 'rohit.ra.agrawal@gmail.com';

test.describe('Email CTAs', () => {
  test('every email call-to-action is labelled, reachable, and says the same thing', async ({
    page,
  }) => {
    // RED WHEN: one CTA says something different from the others, one loses
    // its label entirely, or NO email CTA can actually be reached at this
    // viewport. Two unlabelled links used to pass: ["", ""] has one distinct
    // value, so sameness alone certified nothing.
    //
    // AMENDED 2026-08-09 with the mobile menu (DEF-42). The header renders
    // ONE nav array into TWO surfaces — a row for wide viewports, a <details>
    // panel for narrow — so exactly one header chip is hidden at any width,
    // by design. "Every mailto link is visible" is therefore no longer the
    // rule; the rule is: every copy agrees on its label, and at least two
    // CTAs are REACHABLE — visible now, or revealed by opening the menu.
    // Reachable-by-activation, not present-in-DOM, is the standard DEF-41
    // and DEF-42 both taught.
    await page.goto('/', { waitUntil: 'networkidle' });

    const ctas = page.locator('a[href^="mailto:"]');
    const count = await ctas.count();

    // DENOMINATOR: the header (twice — row and panel), the hero, and the
    // contact plate each carry one.
    expect(count, 'fewer than three email CTAs found — this check measured nothing')
      .toBeGreaterThan(2);

    // Labels are read from textContent, which hidden copies still carry, so a
    // hidden twin cannot dodge the agreement check by being hidden.
    const labels = (
      await ctas.evaluateAll((els) => els.map((el) => (el.textContent || '')))
    ).map((l) => l.replace(/\s+/g, ' ').trim());
    const unlabelled = labels.filter((l) => l.length === 0);
    expect(unlabelled, `${unlabelled.length} of ${count} email CTAs have no label`).toEqual([]);
    expect(new Set(labels).size, `email CTAs disagree: ${JSON.stringify(labels)}`).toBe(1);

    // Codex round-1: the address check used to live only inside #contact, so a
    // typo'd header or hero mailto passed. Every copy on the page must carry
    // the one address.
    const hrefs = await ctas.evaluateAll((els) => els.map((el) => el.getAttribute('href')));
    for (const href of hrefs) {
      expect(href, `an email CTA is misaddressed: "${href}"`).toBe(`mailto:${EMAIL_ADDRESS}`);
    }

    // Codex round-1: a preventDefault()ed CTA passes every presence check —
    // DEF-28's lesson. A real navigation to mailto: cannot be observed in a
    // test browser, but whether the click SURVIVES to its default action can.
    const prevented = await ctas.evaluateAll((els) =>
      els.map((el) => {
        const ev = new MouseEvent('click', { bubbles: true, cancelable: true });
        el.dispatchEvent(ev);
        return ev.defaultPrevented;
      }),
    );
    expect(
      prevented.map((p, i) => (p ? `CTA ${i + 1} click is preventDefault()ed` : null)).filter(Boolean),
      'an email CTA swallows its own click',
    ).toEqual([]);

    // Every CTA OUTSIDE the twin-surface header must simply be visible — the
    // old rule, kept at full strength where the twin-surface excuse does not
    // apply (Codex round-1: hiding the hero CTA passed the ≥2 floor).
    const bodyCtas = page.locator('a[href^="mailto:"]:not(.site-nav a)');
    const bodyCount = await bodyCtas.count();
    expect(bodyCount, 'no email CTA outside the header — measured nothing').toBeGreaterThan(1);
    for (let i = 0; i < bodyCount; i++) {
      await expect(bodyCtas.nth(i), `body email CTA ${i + 1} is not visible`).toBeVisible();
    }

    // Reachability. Open the menu first if this viewport offers one; with the
    // panel open, every CTA that can be reached at this width is measurable.
    // Round-2 review: isVisible() reads boxes, not paint or pointer-events —
    // a fully transparent or tap-dead chip certified as reachable. Reuse
    // readLinks' painted+hittable standard (opacity, elementFromPoint, inert)
    // on the whole page instead.
    const summary = page.locator('.site-nav .menu > summary');
    if (await summary.isVisible()) {
      await summary.click();
      await expect(
        page.locator('.site-nav .menu a[href^="mailto:"]'),
        'the menu opened and its email CTA is still not visible',
      ).toBeVisible();
    }
    const readCtas = await readLinks(page.locator('body'));
    const mailtos = readCtas.filter((l) => /^mailto:/i.test(l.href));
    const reachable = mailtos.filter((l) => l.painted && l.hittable).length;
    expect(
      reachable,
      `only ${reachable} of ${mailtos.length} email CTAs are painted AND hittable at this viewport`,
    ).toBeGreaterThan(1);

    // And no CTA may be painted-but-dead. A floor of two live CTAs let a
    // pointer-events:none header chip pass in the round-2 mutation run — a
    // visible control that swallows taps is worse than a hidden one, because
    // the visitor sees it, taps it, and concludes the site is broken.
    const dead = mailtos.filter((l) => l.painted && !l.hittable);
    expect(
      dead.map((l) => l.label || l.href),
      `${dead.length} email CTA(s) are painted but cannot be clicked`,
    ).toEqual([]);
  });
});
