import { test, expect } from '@playwright/test';

// Contact details must be labelled links a visitor can click, never text they
// have to copy by hand. Directive P-13 — raised twice, agreed once, dropped
// both times. This file is what stops it being dropped a third time.
//
// Rebuilt after three reviewers proved the first version could not fail for
// what it claimed. Nine holes, each closed by a named assertion below, each
// with the mutation that turns that assertion red.

const CONTACT = '#contact';

// The page ships seven plates (Nº 00–06). A floor, not an equality: adding a
// plate must not turn a gate red (the mistake DEF-15 records).
const MIN_PLATES = 7;

const EMAIL_ADDRESS = 'rohit.ra.agrawal@gmail.com';

// Token-bounded on both sides, so `user@example.com_backup` does NOT match.
const BARE_EMAIL =
  /(?<![A-Za-z0-9._%+-])[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}(?![A-Za-z0-9._%+-])/;

// Case-insensitive, so `LinkedIn.Com/in/rohitagrawal14` does NOT slip through.
const BARE_PROFILE = /(?<![A-Za-z0-9.-])(?:linkedin|github)\.com\/[A-Za-z0-9._~/-]+/i;

// Each destination is matched loosely, then its href is checked exactly. The
// loose test says "a link of this kind exists"; the exact one says "and it is
// addressed correctly" — `mailto:` and `mailto:typo@exmaple.com` fail it.
const DESTINATIONS = [
  {
    name: 'email',
    kind: /^mailto:/i,
    address: new RegExp(`^mailto:${EMAIL_ADDRESS.replace(/[.@]/g, '\\$&')}$`, 'i'),
  },
  {
    name: 'LinkedIn',
    kind: /linkedin\.com/i,
    address: /^https:\/\/(?:www\.)?linkedin\.com\/in\/[A-Za-z0-9._-]+\/?$/i,
  },
  {
    name: 'GitHub',
    kind: /github\.com/i,
    address: /^https:\/\/(?:www\.)?github\.com\/[A-Za-z0-9._-]+\/?$/i,
  },
];

// Reads every link inside a container and reports, per link, whether it is
// actually PAINTED and actually HITTABLE — not merely present in the DOM.
// `document.elementFromPoint` at the link's own centre is what catches an
// overlay, `pointer-events: none`, and a zero-sized box; `[inert]` is checked
// because an inert subtree still reports a normal box and a normal hit.
function readLinks(scope) {
  return scope.locator('a[href]').evaluateAll((els) =>
    els.map((el) => {
      const rect = el.getBoundingClientRect();
      const style = getComputedStyle(el);
      const hit = document.elementFromPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
      return {
        href: el.getAttribute('href') || '',
        label: (el.textContent || '').replace(/\s+/g, ' ').trim(),
        painted:
          rect.width > 0 &&
          rect.height > 0 &&
          style.visibility !== 'hidden' &&
          style.display !== 'none' &&
          Number.parseFloat(style.opacity) > 0,
        hittable:
          style.pointerEvents !== 'none' &&
          el.closest('[inert]') === null &&
          hit !== null &&
          (hit === el || el.contains(hit)),
      };
    }),
  );
}

test.describe('Contact details', () => {
  test('no contact detail is printed as text anywhere on the rendered page', async ({ page }) => {
    // RED WHEN: an address or profile URL is rendered as text instead of being
    // the href of a labelled link — including one split across sibling nodes,
    // because this reads each plate's RENDERED text, not its text nodes.
    await page.goto('/', { waitUntil: 'networkidle' });

    const plates = page.locator('section.plate[id]');
    const plateCount = await plates.count();

    // DENOMINATOR, tied to the page rather than to a round number: the scan
    // must have walked every plate the site ships. Delete the four project
    // plates and this fails instead of reporting a clean sweep of what is left.
    expect(plateCount, `only ${plateCount} plates found — the scan did not cover the page`)
      .toBeGreaterThanOrEqual(MIN_PLATES);

    const offenders = [];
    for (let i = 0; i < plateCount; i++) {
      const plate = plates.nth(i);
      const id = await plate.getAttribute('id');

      // A plate that is not RENDERED contributes nothing to the scan above.
      // `body { display: none }` used to pass this whole file; it now stops here.
      await expect(plate, `#${id} is in the DOM but is not visible`).toBeVisible();

      const text = (await plate.innerText()).trim();
      expect(text.length, `#${id} rendered no text — nothing was scanned`).toBeGreaterThan(0);

      const email = text.match(BARE_EMAIL);
      const profile = text.match(BARE_PROFILE);
      if (email) offenders.push(`#${id} prints the address "${email[0]}"`);
      if (profile) offenders.push(`#${id} prints the profile URL "${profile[0]}"`);
    }

    expect(offenders, `${offenders.length} contact detail(s) printed as text`).toEqual([]);
  });

  test('the contact plate itself carries three reachable, correctly addressed links', async ({
    page,
  }) => {
    // RED WHEN: the contact plate is deleted, hidden, covered, made inert, or
    // any of its three destinations loses its link or gains a wrong address.
    // Everything here is scoped to #contact, so a LinkedIn link somewhere else
    // on the page can no longer stand in for the contact plate's own.
    await page.goto('/', { waitUntil: 'networkidle' });

    const contact = page.locator(CONTACT);
    await expect(contact, 'no #contact plate on the page').toHaveCount(1);
    await contact.scrollIntoViewIfNeeded();
    await expect(contact, '#contact is present but not visible').toBeVisible();

    const links = await readLinks(contact);

    // DENOMINATOR: an empty contact plate must not pass by having nothing to fault.
    expect(links.length, 'no links inside #contact — this check measured nothing')
      .toBeGreaterThanOrEqual(DESTINATIONS.length);

    const faults = [];
    for (const dest of DESTINATIONS) {
      const matches = links.filter((l) => dest.kind.test(l.href));
      if (matches.length === 0) {
        faults.push(`no ${dest.name} link inside #contact`);
        continue;
      }
      for (const link of matches) {
        if (!dest.address.test(link.href)) faults.push(`${dest.name} href is wrong: "${link.href}"`);
        if (link.label.length === 0) faults.push(`${dest.name} link has no label`);
        if (!link.painted) faults.push(`${dest.name} link is not painted`);
        if (!link.hittable) faults.push(`${dest.name} link cannot be clicked where it is drawn`);
      }
    }

    expect(faults, `${faults.length} fault(s) in the contact plate`).toEqual([]);
  });

  test('every email call-to-action is labelled, visible, and says the same thing', async ({
    page,
  }) => {
    // RED WHEN: one CTA says something different from the others, or one loses
    // its label entirely. Two unlabelled links used to pass: ["", ""] has one
    // distinct value, so sameness alone certified nothing.
    await page.goto('/', { waitUntil: 'networkidle' });

    const ctas = page.locator('a[href^="mailto:"]');
    const count = await ctas.count();

    // DENOMINATOR: the nav, the hero, and the contact plate each carry one.
    expect(count, 'fewer than two email CTAs found — this check measured nothing')
      .toBeGreaterThan(1);

    const labels = [];
    for (let i = 0; i < count; i++) {
      const cta = ctas.nth(i);
      await expect(cta, `email CTA ${i + 1} of ${count} is not visible`).toBeVisible();
      labels.push((await cta.innerText()).replace(/\s+/g, ' ').trim());
    }

    const unlabelled = labels.filter((l) => l.length === 0);
    expect(unlabelled, `${unlabelled.length} of ${count} email CTAs have no label`).toEqual([]);
    expect(new Set(labels).size, `email CTAs disagree: ${JSON.stringify(labels)}`).toBe(1);
  });
});
