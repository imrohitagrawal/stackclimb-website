// /how-i-build — D57 clause 9. Every claim's key term is bound to a line
// that follows its evidence file's OWN `VERIFIED —` marker — a file-wide
// contains-check cannot tell a VERIFIED claim from a REPORTED one living in
// the same file (cross-review.md holds both; the reworded-cross-review-claim
// mutation this file watches red exists because of that exact gap).
//
// WHICH CHANGE TURNS EACH RED:
//   term missing        — a rendered term deleted from its VERIFIED span
//   term moved to REPORTED — the term's evidence-file line loses its
//                          VERIFIED marker (simulates a status downgrade)
//   cross-review leaks  — the barred phrase appears on the built page
//   quote drifts        — the artefact panel no longer matches its source

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { painted } from './lib/painted.mjs';

const norm = (s) => s.replace(/\s+/g, ' ').trim();

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
  const deQuote = (s) => s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"');
  expect(watchdogFile).toContain(
    'main got a new commit but no deploy fired',
  );
  expect(deQuote(artefactText)).toContain('main got a new commit but no deploy fired');
  expect(deQuote(artefactText)).toContain('the deploy JOB');

  expect(await painted(page.locator('.artefact'))).toBe(true);
});
