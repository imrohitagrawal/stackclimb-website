// /how-i-build — D57 clause 9. Every claim's key term is bound to a line
// that follows its evidence file's OWN `VERIFIED —` marker — a file-wide
// contains-check cannot tell a VERIFIED claim from a REPORTED one living in
// the same file (cross-review.md holds both; the reworded-cross-review-claim
// mutation this file watches red exists because of that exact gap).
//
// P2 (RCA-012) added the tests below the original two: a skill count DERIVED
// from skill-library.md rather than hand-typed, .github's removal from the
// "skills" framing, the two-vs-three OTel/Prometheus system count, the
// restored artefact-panel parenthetical/PROXY/34m31s content, its footer
// link to a pinned real file, and the evidence file's own second blockquote
// checked as a real (possibly elided) substring of the LIVE quorum-ai
// workflow file read fresh off disk — never a second hand-typed copy here.
//
// WHICH CHANGE TURNS EACH RED:
//   term missing           — a rendered term deleted from its VERIFIED span
//   term moved to REPORTED — the term's evidence-file line loses its
//                            VERIFIED marker (simulates a status downgrade)
//   cross-review leaks     — the barred phrase appears on the built page
//   quote drifts           — the artefact panel no longer matches its source
//   skill count stale      — page's digit no longer equals skill-library.md's
//   .github re-listed      — .github appears back in the public-skills list
//   three systems          — the OTel/Prometheus line reverts to three
//   PROXY/34m31s dropped   — the artefact panel loses either clause
//   footer link missing    — the artefact panel's citation loses its link
//   evidence quote fused   — failure-driven.md's blockquote stops being a
//                            real (marked-elision) substring of the live file

import { test, expect } from '@playwright/test';
import { readFileSync, existsSync } from 'node:fs';
import { homedir } from 'node:os';
import { painted } from './lib/painted.mjs';

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const deQuote = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');

/** Every line-range that follows a `VERIFIED` marker, up to the next
 *  status marker or heading. Anchoring, not a file-wide contains-check.
 *  Whitespace-normalized: the source markdown hard-wraps mid-sentence
 *  (e.g. "...the incident that\ncaused it:"), which a raw `\n`-joined
 *  substring check cannot see through — the newline splits the exact
 *  phrase the gate is trying to match, a false-red proved and fixed here. */
function verifiedSpans(text) {
  const lines = text.split('\n');
  const spans = [];
  let collecting = false;
  let buf = [];
  const flush = () => { if (buf.length) spans.push(buf.join(' ')); buf = []; };
  for (const line of lines) {
    if (/`VERIFIED`/.test(line)) {
      flush();
      collecting = true;
    } else if (/`REPORTED`|`UNVERIFIED`|`REFUTED`|^#/.test(line)) {
      flush();
      collecting = false;
    }
    if (collecting) buf.push(line);
  }
  flush();
  return norm(spans.join(' '));
}

const FILES = {
  'authored skill': 'docs/evidence/practice/skill-library.md',
  blocking: 'docs/evidence/practice/ci-discipline.md',
  'the incident that caused it': 'docs/evidence/practice/failure-driven.md',
  'explicitly not blind human labels': 'docs/evidence/practice/evals-observability.md',
  'alert on a floor breach': 'docs/evidence/practice/evals-observability.md',
  'before it leaves the process': 'docs/evidence/practice/evals-observability.md',
  'labelled full-eval': 'docs/evidence/practice/evals-observability.md',
};

test('every rendered term traces to a VERIFIED span in its evidence file', () => {
  for (const [term, file] of Object.entries(FILES)) {
    const text = readFileSync(file, 'utf8');
    const verified = verifiedSpans(text);
    expect(verified.toLowerCase(), `${term} absent from ${file}'s VERIFIED span`).toContain(
      term.toLowerCase(),
    );
  }
});

test('the page renders every term, bars cross-review, and quotes verbatim', async ({ page }) => {
  // Reduced motion: the scroll-linked entrance (motion.css:72) starts every
  // non-hero plate child at opacity:0 until scrolled into view.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/how-i-build');
  // WHOLE PAGE, not just plate 1 — terms now span #how-i-build and
  // #evals-observability, and a check scoped to one plate already let a
  // bar slip in unchecked on #published-skills once before (R-7 finding).
  const whole = norm(await page.locator('body').innerText()).toLowerCase();
  for (const term of Object.keys(FILES)) {
    expect(whole, `${term} not rendered`).toContain(term.toLowerCase());
  }
  expect(whole).not.toMatch(/review each other|reviews each other|grading its own homework/);

  const watchdogFile = readFileSync('docs/evidence/practice/failure-driven.md', 'utf8');
  const artefactText = norm(await page.locator('.artefact').innerText());
  // The two load-bearing sentences, checked against the source verbatim
  // (curly quotes normalised — the page renders typographic quotes).
  expect(watchdogFile).toContain(
    'main got a new commit but no deploy fired',
  );
  expect(deQuote(artefactText)).toContain('main got a new commit but no deploy fired');
  expect(deQuote(artefactText)).toContain('the deploy JOB');

  expect(await painted(page.locator('.artefact'))).toBe(true);
});

test("the skill count on the page is DERIVED from skill-library.md, not hand-typed here", async ({
  page,
}) => {
  const evidence = readFileSync('docs/evidence/practice/skill-library.md', 'utf8');
  const match = evidence.match(/holds \*\*(\d+)\*\* authored skill directories/);
  expect(match, "skill-library.md's own count sentence not found — cannot derive a number")
    .not.toBeNull();
  const count = match[1];

  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/how-i-build');
  const whole = norm(await page.locator('body').innerText());
  expect(whole, `page does not render the derived count of ${count}`).toContain(
    `${count} authored skill`,
  );
});

test('.github is not characterized as a skill on the page', async ({ page }) => {
  await page.goto('/how-i-build');
  const repoItems = await page.locator('.skill-repos li').allInnerTexts();
  expect(repoItems.length, 'expected exactly one public skill repository listed').toBe(1);
  for (const item of repoItems) {
    expect(item).not.toContain('.github');
  }
  const whole = norm(await page.locator('body').innerText()).toLowerCase();
  expect(whole).toContain('one of the skills above is a public repository');
  expect(whole).not.toContain('two of the skills above are public repositories');
});

test('the OTel/Prometheus claim says two systems, matching evals-observability.md', async ({
  page,
}) => {
  const evidence = norm(readFileSync('docs/evidence/practice/evals-observability.md', 'utf8'));
  const paragraph = evidence.match(
    /narratwin-ai emits OpenTelemetry.*?with a matching Kibana dashboard defined in-repo/,
  );
  expect(paragraph, 'tracing paragraph not found in evals-observability.md').not.toBeNull();
  // The evidence file's own ground truth names two OTel/Prometheus systems
  // (narratwin-ai, evalaxis-ai) and one Elasticsearch/Kibana system
  // (saaf-saans) in the SAME paragraph — the red-herring this page's claim
  // must not be conflated with.
  expect(paragraph[0]).toContain('narratwin-ai emits OpenTelemetry');
  expect(paragraph[0]).toContain('evalaxis-ai runs the same OpenTelemetry/Prometheus');
  expect(paragraph[0]).toContain('saaf-saans logs model interactions to Elasticsearch');

  await page.goto('/how-i-build');
  const whole = norm(await page.locator('body').innerText()).toLowerCase();
  expect(whole).toContain('across two systems');
  expect(whole).not.toContain('across three systems');
});

test('the artefact panel restores the PROXY caveat, the 34m31s incident, and the dropped '
  + 'parenthetical', async ({ page }) => {
  await page.goto('/how-i-build');
  const artefactText = deQuote(norm(await page.locator('.artefact').innerText()));
  expect(artefactText).toContain(
    'a dropped Actions event / skipped-or-failed deploy gate / a flake',
  );
  expect(artefactText).toContain(
    'This is a PROXY: it cannot see a Deploy run that reported success while production did '
    + 'not actually roll',
  );
  expect(artefactText).toContain(
    'left production 34m31s behind while every passive probe stayed green',
  );
});

test('the artefact panel links to the real workflow file at a pinned SHA', async ({ page }) => {
  await page.goto('/how-i-build');
  const link = page.locator('.artefact footer a');
  await expect(link).toHaveCount(1);
  const href = await link.getAttribute('href');
  const expected = 'https://github.com/imrohitagrawal/quorum-ai/blob/'
    + '[0-9a-f]{40}/\\.github/workflows/deploy-drift-watchdog\\.yml';
  expect(href).toMatch(new RegExp(`^${expected}$`));
});

// The real, live source of truth — read fresh off disk, not a second
// hand-typed copy inside this test (that would just move the drift RCA-012
// found from the page to the test). Skips, rather than fails, when the
// quorum-ai checkout isn't present — this is a cross-repo integrity check,
// not something a CI runner without that sibling checkout can settle.
const QUORUM_WORKFLOW = `${homedir()}/Projects/quorum-ai/.github/workflows/deploy-drift-watchdog.yml`;

test("failure-driven.md's second blockquote is a real, marked-elision quote of the live "
  + 'quorum-ai workflow file', () => {
  test.skip(!existsSync(QUORUM_WORKFLOW), 'quorum-ai checkout not present at ' + QUORUM_WORKFLOW);

  const clean = (s) => norm(s.replace(/[`*"']/g, '')).toLowerCase();
  const real = clean(readFileSync(QUORUM_WORKFLOW, 'utf8').replace(/^#\s?/gm, ''));

  const doc = readFileSync('docs/evidence/practice/failure-driven.md', 'utf8');
  const quoteMatch = doc.match(/> "WHAT IT CHECKS[\s\S]*?stayed green\."/);
  expect(quoteMatch, 'the second blockquote was not found in failure-driven.md').not.toBeNull();
  const quote = clean(quoteMatch[0].replace(/^>\s?/gm, ''));

  const segments = quote.split('[...]').map((s) => s.trim()).filter(Boolean);
  expect(segments.length, 'no real (non-elided) text found in the blockquote').toBeGreaterThan(1);

  let cursor = 0;
  for (const segment of segments) {
    const idx = real.indexOf(segment, cursor);
    expect(
      idx,
      `segment is not a real, IN-ORDER, contiguous span of the live workflow file: "${segment}"`,
    ).toBeGreaterThanOrEqual(0);
    cursor = idx + segment.length;
  }
});
