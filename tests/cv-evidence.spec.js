// P-9: every /cv project claim links to its proof or is labelled Approximate.
// Split from proof-cv.spec.js (D8: one concern per file) — that file covers
// employer-figure attribution; this one covers the independent-systems
// evidence mechanism, a different claim class with a different gate.
//
// WHICH CHANGE TURNS EACH RED (watched; ledger: docs/STATUS.md):
//   missing evidence — an Evidence link points at a slug absent from
//                       project-pages.js (route-existence check, not a
//                       hardcoded list, so a page removed there reddens too)
//   fallback dropped  — EvalAxis's Approximate label removed while its gate
//                       text stays (the or-labelled assertion)
//   exemption broken  — Aegis given a fake evidence link (locks that a
//                       gate-less project stays link-less and label-less)
//   note deleted      — the Recognition section's Approximate note removed
//   auto-expanded     — a `.cv-proj` ships with `open` set (defeats the
//                       collapsed-by-default scan-fast design)
//   label mismatch    — a <summary> swapped for generic text ("Details"),
//                       breaking the control's accessible name

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/cv.js';
import { pages as projectPages } from '../src/data/project-pages.js';
import { fold } from './lib/fold.mjs';

test('/cv: every project claim links to its evidence or is labelled Approximate', async ({
  page,
}) => {
  await page.goto('/cv');
  const cards = page.locator('.cv-proj');
  await expect(cards).toHaveCount(projects.length);

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const card = cards.nth(i);
    const claim = p.gate || p.rule;

    if (!claim) {
      // Aegis today: no claim made, nothing to prove — no link, no label.
      await expect(card.locator('a', { hasText: 'Evidence' })).toHaveCount(0);
      await expect(card.getByText('Approximate', { exact: true })).toHaveCount(0);
      continue;
    }

    const evidenceLink = card.locator('a', { hasText: 'Evidence' });
    const approximate = card.getByText('Approximate', { exact: true });
    const linkCount = await evidenceLink.count();
    const labelCount = await approximate.count();
    expect(
      linkCount + labelCount,
      `${p.name} makes a claim but has neither an Evidence link nor an Approximate label`,
    ).toBe(1);

    if (linkCount === 1) {
      const href = await evidenceLink.getAttribute('href');
      const slug = href.replace('/projects/', '');
      expect(
        Object.prototype.hasOwnProperty.call(projectPages, slug),
        `${p.name}'s Evidence link (${href}) points at a slug project-pages.js doesn't have`,
      ).toBe(true);
    }
  }
});

test('/cv: the Recognition section carries its own Approximate note', async ({ page }) => {
  await page.goto('/cv');
  const note = page.locator('#s-awards ~ .cv-note, section:has(#s-awards) .cv-note');
  const text = fold(await note.first().innerText()).toLowerCase();
  expect(text).toContain('approximate');
});

test('/cv: project cards are collapsed by default with an accurate control label', async ({
  page,
}) => {
  await page.goto('/cv');
  const cards = page.locator('.cv-proj');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    await expect(card, `project card ${i} ships open`).not.toHaveAttribute('open', '');
    const summaryText = fold(await card.locator('summary').innerText());
    const name = fold(projects[i].name);
    expect(summaryText, `card ${i}'s summary doesn't name its own project`).toContain(name);
  }
});
