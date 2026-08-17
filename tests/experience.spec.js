// /experience — D57 clause 8. Package 5's plan v2: NO build-time PDF (v1's
// design collided with DEF-37 round 8's unconditional PDF/DOCX block, an
// owner ruling, not a gate to tune) — this page links to /cv instead.
//
// WHICH CHANGE TURNS EACH RED:
//   org set       — drop or add an era vs cv.js's six employers
//   chronology    — reorder an era out of oldest→newest
//   zero digits   — a figure planted in any era line or the closing line
//   CV link       — the /cv link removed or duplicated
//   painted       — opacity:0 on .era-list

import { test, expect } from '@playwright/test';
import { eras, closing } from '../src/data/eras.js';
import { experience } from '../src/data/cv.js';
import { painted } from './lib/painted.mjs';

test('eras.js: org set matches cv.js, oldest to newest, zero digits', () => {
  const orgs = eras.map((e) => e.org);
  expect(new Set(orgs), 'era orgs must equal cv.js orgs exactly').toEqual(
    new Set(experience.map((j) => j.org)),
  );
  expect(orgs.length, 'an org repeated or dropped').toBe(experience.length);

  // Oldest → newest: each era's job.from must be <= the next era's job.from.
  const toDate = (s) => {
    const [m, y] = s.split(' ');
    const idx = 'January February March April May June July August September October November December'
      .split(' ').indexOf(m);
    return +y * 12 + idx;
  };
  for (let i = 1; i < eras.length; i++) {
    expect(
      toDate(eras[i].job.from),
      `${eras[i].org} does not follow ${eras[i - 1].org} chronologically`,
    ).toBeGreaterThanOrEqual(toDate(eras[i - 1].job.from));
  }

  // Zero digits — a figure belongs on /cv, capture-bound, not restated here.
  for (const e of eras) {
    expect(e.line, `${e.org}'s era line carries a digit`).not.toMatch(/\d/);
  }
  expect(closing, 'closing line carries a digit').not.toMatch(/\d/);
});

test('the page renders, links to /cv exactly once IN THE BODY, and is painted', async ({
  page,
}) => {
  // Reduced motion: plate 2 sits below the fold and the scroll-linked
  // entrance (motion.css:72) starts every non-hero plate child at
  // opacity:0 until an IntersectionObserver reveals it — reduced-motion
  // is the repo's own way of asserting painted() without a real scroll
  // (every other spec's `gotoReduced` does the same).
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/experience');
  const eraLocs = page.locator('.era');
  await expect(eraLocs).toHaveCount(eras.length);
  // Rendered org/dates/line BOUND to eras.js by position — count-only
  // proved nothing about WHICH era rendered where (R-7 finding).
  const rendered = await eraLocs.evaluateAll((els) =>
    els.map((el) => ({
      org: el.querySelector('.era-org').textContent,
      line: el.querySelector('.era-line').textContent.trim(),
    })),
  );
  for (const [i, e] of eras.entries()) {
    expect(rendered[i].org, `era ${i} org mismatch`).toContain(e.org);
    expect(rendered[i].line, `era ${i} line mismatch`).toBe(e.line);
  }
  // Scoped to the page's own content — the nav also links /cv (Layout.astro,
  // flat row + mobile menu), which is not this page's claim to make.
  const cvLinks = page.locator('#evolution-record a[href="/cv"]');
  await expect(cvLinks).toHaveCount(1);
  expect(await painted(page.locator('.era-list'))).toBe(true);
  expect(await painted(cvLinks.first())).toBe(true);

  // The closing line — argued for in the plan as the page's own destination
  // (what /cv cannot give), rendered and painted, not just digit-free data.
  const closingLoc = page.locator('.era-closing');
  await expect(closingLoc).toHaveText(closing);
  expect(await painted(closingLoc)).toBe(true);

  // Layout.astro's multi-line `description` prop (wrapped for the 120-char
  // line ceiling) baked its literal source newlines into the built <meta
  // content>. Normalized once, at the source; this proves it stays that way.
  const desc = await page.locator('meta[name="description"]').getAttribute('content');
  expect(desc, 'description meta carries a raw newline').not.toMatch(/\n|\s{2,}/);
});
