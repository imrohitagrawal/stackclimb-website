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

test('/cv: approximate note painted and unnegated; every act figure attributed', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/cv');
  const note = page.locator('.cv-note');
  const noteText = fold(await note.first().innerText()).toLowerCase();
  expect(noteText).toContain('approximate');
  expect(noteText).not.toMatch(/\b(?:not|never|no)\s+approximate/);
  expect(await painted(note.first())).toBe(true);
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
