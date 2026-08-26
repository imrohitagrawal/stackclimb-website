// The /cv attribution partners for the two-ledger act — split from
// proof-act.spec.js at 257/250 (D8: modularize, never trim). One concern:
// the act renders NO employer name (RCA-005/P-21), so /cv must perform the
// attribution the footer promises — every act figure's own bullet, under
// its own employer, painted, with an approximate note that is not negated.
//
// WHICH CHANGE TURNS EACH RED (watched; ledger: docs/STATUS.md row D87):
//   note negation   — the /cv note reworded 'not approximate' (the bare
//                     contain passed it — Codex R-7's vacuous partner)
//   bullet renders  — cv.astro filters out LimeRoad's payment bullet (its
//                     25% survived via another bullet under figure-in-job,
//                     and a bare contain matched inside '125%' — Codex
//                     holes 7+8, the built fan's confirmed material find)
//   entry painted   — .cv-job { opacity: 0 } (allInnerTexts still returns
//                     every figure — Codex hole 9)

import { test, expect } from '@playwright/test';
import { employerRows } from '../src/data/proof.js';
import { fold } from './lib/fold.mjs';
import { painted } from './lib/painted.mjs';

test('/cv: no approximate disclaimer anywhere; every act figure attributed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cv');
  /* P-25 (owner's explicit directive, 2026-08-27). This assertion is the
     REVERSE of the one it replaces, not the deletion of it. Until today this
     file required /cv to carry an approximate note; he ruled the disclaimers
     off the route entirely — screen and print — because a caveat boxed beside
     the achievement it qualifies costs a recruiter's confidence and says
     nothing a CV reader wants.

     Flipped rather than dropped, so the directive is ENFORCED instead of
     merely recorded: reinstating either note turns this red.

     SCOPE, deliberately narrow. It matches the DISCLAIMER SENTENCES, not the
     bare word: the P-9 evidence label on a project card and the site-wide
     colophon line are different devices with different jobs, and the colophon
     does not print. P-16's approximate marking still governs the HOME PAGE
     act, which tests/proof-act.spec.js gates and this change does not touch.

     RED WHEN: put either sentence back on /cv. */
  const body = fold(await page.locator('main').innerText()).toLowerCase();
  for (const banned of [
    'every figure in this section is approximate',
    'every award naming a figure or a placement is approximate',
    'cannot be verified from outside them',
  ]) {
    expect(body, `/cv still carries the disclaimer "${banned}" — P-25 removed it`).not.toContain(banned);
  }
  /* The partner. An empty or unrendered page would satisfy every check above
     by carrying nothing at all, which certifies sameness rather than the
     removal. Prove the page is really there and really painted. */
  expect(body.length, '/cv rendered almost no text — the checks above prove nothing')
    .toBeGreaterThan(2000);
  expect(await painted(page.locator('.cv-job').first())).toBe(true);
  // DERIVED per act row: the row's own POINT REGEX must match the rendered
  // job block — proving the exact claimed bullet renders, boundary-anchored
  // by its own phrase. Scoped per job: 'Amazon' in the awards list once
  // satisfied a page-wide match (watched in 4B's mutation run).
  const jobLocs = page.locator('.cv-job');
  const jobTexts = (await jobLocs.allInnerTexts()).map(fold);
  expect(jobTexts.length, 'no experience entries on /cv').toBeGreaterThan(0);
  for (const r of employerRows) {
    const i = jobTexts.findIndex((t) => t.includes(r.job));
    expect(i, `${r.job} missing from /cv experience`).toBeGreaterThanOrEqual(0);
    expect(jobTexts[i], `${r.job}'s own bullet missing from its entry`).toMatch(r.point);
    expect(await painted(jobLocs.nth(i)), `${r.job}'s entry not painted`).toBe(true);
  }
});
