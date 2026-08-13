import { test, expect } from '@playwright/test';
import { readLinks } from './lib/read-links.mjs';

// Contact details must be labelled links a visitor can click, never text they
// have to copy by hand. Directive P-13 — raised twice, agreed once, dropped
// both times. This file is what stops it being dropped a third time.
//
// Rebuilt after three reviewers proved the first version could not fail for
// what it claimed. Nine holes, each closed by a named assertion below, each
// with the mutation that turns that assertion red.

const CONTACT = '#contact';

// The page ships seven plates: hero, four systems, private, contact. A floor,
// not an equality: adding a plate must not turn a gate red (the mistake DEF-15
// records). BUMP THIS in the same change that adds a plate — it sat at 7 while
// 8 shipped, and the whole #private plate could be deleted with every gate
// green (found by the 2026-08-09 mutation audit).
//
// Lowered from 8 to 7 when #overview was removed: it listed all six systems and
// the four plates below it repeated four of them. Lowering a floor is the exact
// move that hid DEF-15, so it is stated here rather than done quietly — the
// count is 7 because seven plates ship, not because 8 was inconvenient.
//
// Raised back to 8 by package B: #overview returned as an index (rows, not the
// cards it used to restate). Bumped in the same change that adds the plate,
// exactly as the note above requires.
const MIN_PLATES = 8;

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

});
