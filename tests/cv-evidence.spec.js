// P-9: every /cv project claim links to its proof or is labelled Approximate.
// Split from proof-cv.spec.js (D8: one concern per file) — that file covers
// employer-figure attribution; this one covers the independent-systems
// evidence mechanism, a different claim class with a different gate.
//
// R-7 (Codex, read-only) found five real holes in the first draft, fixed
// here: a slug existing ANYWHERE in project-pages.js was accepted, so a
// swapped link (Quorum -> citevyn) passed — this repo's own recorded
// contact.spec.js/project-plate1.spec.js class of hole, missed on the first
// write. `count()` on a closed <details> proves presence, never that the
// link becomes reachable once opened. `open="false"` is a truthy boolean
// attribute (opens the panel) but only `open=""` was rejected. Both
// Approximate checks matched the word alone, so "Not approximate" or "No
// award is approximate" would have passed. And matching visible text left
// an `aria-label` override — which is what a screen reader actually
// announces — unchecked.
//
// WHICH CHANGE TURNS EACH RED (watched; ledger: docs/STATUS.md):
//   missing evidence — an Evidence link points at a slug absent from
//                       project-pages.js
//   wrong evidence    — a project's link points at ANOTHER project's slug
//                       (the swapped-href class R-7 found)
//   never reachable   — the link/label exists in the DOM but isn't visible
//                       once its card is opened
//   fallback dropped  — EvalAxis's Approximate label removed while its gate
//                       text stays (the or-labelled assertion)
//   exemption broken  — Aegis given a fake evidence link
//   negated           — "Not approximate" / "No award is approximate" ships
//                       (both Approximate checks read the whole line)
//   note deleted      — the Recognition section's Approximate note removed
//   auto-expanded     — a `.cv-proj` ships `open` (attribute OR the boolean
//                       DOM property — `open="false"` still opens it)
//   label mismatch    — a <summary> swapped for generic text, or given an
//                       `aria-label` override, breaking the control's
//                       accessible name

import { test, expect } from '@playwright/test';
import { projects } from '../src/data/cv.js';
import { projects as siteProjects } from '../src/data/projects.js';
import { pages as projectPages } from '../src/data/project-pages.js';
import { fold } from './lib/fold.mjs';

// The test's own oracle — deliberately a SEPARATE map from cv.astro's, so a
// mutation to the render-time map still has something independent to check
// against. Must be kept in sync with EVIDENCE_SLUGS in src/pages/cv.astro.
const EXPECTED_SLUGS = {
  CiteVyn: 'citevyn',
  'Quorum-AI': 'quorum',
  SaafSaans: 'saafsaans',
  'NarraTwin AI': 'narratwin',
};

const NEGATED = /\b(?:not|never|no)\s+approximate/i;

test('/cv: every project claim links to its OWN evidence, reachably, or is labelled Approximate', async ({
  page,
}) => {
  await page.goto('/cv');
  const cards = page.locator('.cv-proj');
  await expect(cards).toHaveCount(projects.length);

  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const card = cards.nth(i);
    const claim = p.gate || p.rule;
    const expectedSlug = EXPECTED_SLUGS[p.name];

    if (!claim) {
      // Aegis today: no claim made, nothing to prove — no link, no label.
      await expect(card.locator('a', { hasText: 'Evidence' })).toHaveCount(0);
      await expect(card.getByText('Approximate', { exact: true })).toHaveCount(0);
      continue;
    }

    // Open the card — a link/label that only exists in a closed <details>
    // (display:none by the UA) has never actually been proven reachable.
    await card.locator('summary').click();

    const evidenceLink = card.locator('a', { hasText: 'Evidence' });
    const approximate = card.locator('.cv-gate', { hasText: 'Approximate' });
    const linkCount = await evidenceLink.count();
    const labelCount = await approximate.count();
    expect(
      linkCount + labelCount,
      `${p.name} makes a claim but has neither an Evidence link nor an Approximate label`,
    ).toBe(1);

    if (linkCount === 1) {
      await expect(evidenceLink, `${p.name}'s Evidence link never becomes visible`).toBeVisible();
      const href = await evidenceLink.getAttribute('href');
      const slug = new URL(href).pathname.replace('/projects/', '');
      expect(
        Object.prototype.hasOwnProperty.call(projectPages, slug),
        `${p.name}'s Evidence link (${href}) points at a slug project-pages.js doesn't have`,
      ).toBe(true);
      expect(
        slug,
        `${p.name}'s Evidence link points at "${slug}", not its own project page`,
      ).toBe(expectedSlug);
    } else {
      await expect(approximate, `${p.name}'s Approximate label never becomes visible`).toBeVisible();
      const text = fold(await approximate.innerText()).toLowerCase();
      expect(text, `${p.name}'s Approximate label reads as a negation`).not.toMatch(NEGATED);
    }
  }
});

test('/cv: the Recognition section carries NO approximate disclaimer — P-25', async ({
  page,
}) => {
  await page.goto('/cv');
  /* Flipped on 2026-08-27 by the owner's explicit directive. This test used to
     require the note; it now refuses it. The awards themselves are untouched —
     what left is the sentence disclaiming them. RED WHEN: the note comes back.
     Partnered below, because "no note" is satisfied by an empty section. */
  const section = page.locator('section:has(#s-awards)');
  const text = fold(await section.innerText()).toLowerCase();
  expect(text).not.toContain('approximate');
  expect(text).not.toContain('cannot be verified');
  const awards = section.locator('li');
  expect(await awards.count(), 'no awards render — the check above proves nothing')
    .toBeGreaterThan(2);
});

test('/cv: project cards are collapsed by default with an accurate, unlabelled control', async ({
  page,
}) => {
  await page.goto('/cv');
  const cards = page.locator('.cv-proj');
  const count = await cards.count();
  for (let i = 0; i < count; i++) {
    const card = cards.nth(i);
    // The `open` IDL attribute is the real boolean — the content attribute
    // is truthy for ANY string, including `open="false"`.
    expect(
      await card.evaluate((el) => el.open),
      `project card ${i} ships open`,
    ).toBe(false);
    const summary = card.locator('summary');
    // An aria-label would override what AT announces even if the visible
    // text still names the project — the accessible name must come from
    // the visible text itself, not a parallel label.
    expect(
      await summary.getAttribute('aria-label'),
      `card ${i}'s summary has an aria-label overriding its visible text`,
    ).toBeNull();
    const summaryText = fold(await summary.innerText());
    const name = fold(projects[i].name);
    expect(summaryText, `card ${i}'s summary doesn't name its own project`).toContain(name);
  }
});

// RCA-012, item 4: /cv's cv.js and /'s projects.js each carry the same
// system's availability `state` independently, and CiteVyn had drifted —
// 'Live' on /cv, 'Live — cold-starts' on /. Generalized to any project
// name appearing in both files, not just CiteVyn, so a future drift on a
// different system is caught the same way. Names are normalized because
// projects.js spells some with a Unicode non-breaking hyphen (Quorum‑AI)
// where cv.js uses a plain one (Quorum-AI) — a real, harmless typographic
// difference this parity check must not mistake for two different systems.
//
// RED WHEN: any shared system's state string differs between the two files.
test("/cv and / describe every project they both list with the SAME state string", () => {
  const normName = (s) => s.replace(/[-‑–—]/g, '-').toLowerCase().trim();
  const siteByName = new Map(
    Object.values(siteProjects).map((p) => [normName(p.name), p.state]),
  );

  let checked = 0;
  for (const p of projects) {
    const key = normName(p.name);
    if (!siteByName.has(key)) continue;
    checked += 1;
    expect(
      p.state,
      `${p.name}: /cv says "${p.state}" but / says "${siteByName.get(key)}" for the same system`,
    ).toBe(siteByName.get(key));
  }
  expect(checked, 'no project name is shared between cv.js and projects.js — this check '
    + 'verified nothing').toBeGreaterThan(0);
});
