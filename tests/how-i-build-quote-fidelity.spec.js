// Split out of how-i-build.spec.js (Codex review round: that file breached
// the 250-line budget at 254). One concern: is the deploy-drift-watchdog
// quote — on the page AND in its evidence file — a REAL excerpt of
// quorum-ai's real file, not an invented paraphrase wearing quotation marks.
//
// Codex's review round also found the ORIGINAL version of this check always
// skipped in CI: it read `~/Projects/quorum-ai` off the runner's disk, which
// only exists on a developer laptop. CI never verified the quote at all, and
// a local check would have compared against whatever the sibling checkout's
// CURRENT tree held — not the exact revision `how-i-build.astro` cites via
// WATCHDOG_SHA. Fixed by committing a pinned FIXTURE: the real file's exact
// content AT `ec4a4b98` (`git show ec4a4b98:.github/workflows/
// deploy-drift-watchdog.yml`, fetched from the local quorum-ai checkout,
// 2026-08-28). The fixture is what "real" means here — it IS the cited
// revision — so the two quote checks below run unconditionally, in CI and
// locally, with no skip. A THIRD check (below, still skip-when-absent,
// since it needs the sibling repo) guards against the fixture itself ever
// drifting from what quorum-ai's real history says commit ec4a4b98 held.
//
// WHICH CHANGE TURNS EACH RED:
//   evidence quote fused — failure-driven.md's blockquote stops being a
//                          real (marked-elision) substring of the fixture
//   page quote fused     — the artefact panel's second quote stops being a
//                          real (marked-elision) substring of the fixture
//   fixture forged        — (local only) the committed fixture no longer
//                          matches quorum-ai's real content at WATCHDOG_SHA

import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { execFileSync } from 'node:child_process';

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const deQuote = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

const FIXTURE = 'tests/fixtures/quorum-ai-deploy-drift-watchdog.yml';
const WATCHDOG_SHA = 'ec4a4b987b22214b74bd11d03d4c682aed317271';

/** A "[...]"-elided quote is honest only if every segment BETWEEN the
 * elision markers is a real, in-order, contiguous span of the source —
 * never a paraphrase or invented wording wearing quotation marks. Round 1
 * of review (Codex, static-analysis) caught exactly that: the astro page's
 * artefact quote had been rewritten with invented text ("Added later:",
 * a restructured question) after a later trim for plate-height, while a
 * fragment-only containment check let it pass. This is the general form of
 * that check, shared by both the evidence file's blockquote and the page's
 * own rendered quote below — one root cause, one fix, not two. */
function assertRealElidedQuote(quoteText, realText, label) {
  const clean = (s) => norm(s.replace(/[`*"'‘’“”]/g, '')).toLowerCase();
  const real = clean(realText);
  const segments = clean(quoteText).split('[...]').map((s) => s.trim()).filter(Boolean);
  expect(segments.length, `${label}: no real (non-elided) text found`).toBeGreaterThan(1);
  let cursor = 0;
  for (const segment of segments) {
    const idx = real.indexOf(segment, cursor);
    expect(
      idx,
      `${label}: segment is not a real, IN-ORDER, contiguous span of the source: "${segment}"`,
    ).toBeGreaterThanOrEqual(0);
    cursor = idx + segment.length;
  }
}

test("failure-driven.md's second blockquote is a real, marked-elision quote of the pinned "
  + 'quorum-ai fixture', () => {
  const real = readFileSync(FIXTURE, 'utf8').replace(/^#\s?/gm, '');

  const doc = readFileSync('docs/evidence/practice/failure-driven.md', 'utf8');
  const quoteMatch = doc.match(/> "WHAT IT CHECKS[\s\S]*?stayed green\."/);
  expect(quoteMatch, 'the second blockquote was not found in failure-driven.md').not.toBeNull();
  const quote = quoteMatch[0].replace(/^>\s?/gm, '');

  assertRealElidedQuote(quote, real, 'failure-driven.md');
});

test("the artefact panel's second quote is a real, marked-elision quote of the pinned "
  + 'quorum-ai fixture, not a paraphrase in quotation marks', async ({ page }) => {
  const real = readFileSync(FIXTURE, 'utf8').replace(/^#\s?/gm, '');

  await page.goto('/how-i-build');
  const paragraphs = await page.locator('.artefact p').allInnerTexts();
  const secondQuote = deQuote(norm(paragraphs[1] || ''));
  expect(secondQuote, 'the artefact panel does not carry a second paragraph').not.toBe('');

  assertRealElidedQuote(secondQuote, real, "the artefact panel's second quote");
});

test('the pinned fixture matches quorum-ai\'s real history at WATCHDOG_SHA (local-only '
  + 'authenticity guard)', async ({ page }) => {
  const QUORUM_REPO = `${homedir()}/Projects/quorum-ai`;
  test.skip(!existsSync(QUORUM_REPO), 'quorum-ai checkout not present at ' + QUORUM_REPO);

  expect(() => execFileSync('git', ['-C', QUORUM_REPO, 'cat-file', '-e', `${WATCHDOG_SHA}^{commit}`]),
    `${WATCHDOG_SHA} is not a real commit in the local quorum-ai checkout`).not.toThrow();

  const real = execFileSync('git', ['-C', QUORUM_REPO, 'show',
    `${WATCHDOG_SHA}:.github/workflows/deploy-drift-watchdog.yml`]).toString('utf8');
  const fixture = readFileSync(FIXTURE, 'utf8');
  expect(fixture, `${FIXTURE} no longer matches quorum-ai's real content at ${WATCHDOG_SHA} — `
    + 're-fetch it with: git -C ~/Projects/quorum-ai show '
    + `${WATCHDOG_SHA}:.github/workflows/deploy-drift-watchdog.yml > ${FIXTURE}`).toBe(real);

  await page.goto('/how-i-build');
  const link = page.locator('.artefact footer a');
  const href = await link.getAttribute('href');
  expect(href, "the page's pinned SHA no longer matches this test's WATCHDOG_SHA constant")
    .toContain(WATCHDOG_SHA);
});
