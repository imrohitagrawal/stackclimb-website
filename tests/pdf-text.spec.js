import { test, expect } from '@playwright/test';
import { createRequire } from 'node:module';

/* DEF-74. The CV's PDF must be READABLE BY A MACHINE, not only by a person.
 *
 * WHY THIS EXISTS. /cv tells its reader "printing it produces a PDF you can
 * forward", so the PDF is a product of this site and a recruiter's
 * applicant-tracking system is one of its readers. `letter-spacing` is a
 * typographic device for the SCREEN; carried into a PDF it becomes real
 * horizontal space between glyphs, and an extractor that sees a gap wider than
 * its threshold inserts a space. Measured before the fix, with nothing reset
 * under @media print:
 *
 *   'J U N E  2 0 1 4  —  A P R I L  2 0 1 5'   <- .cv-dates,  0.1em
 *   'T E S T  E N G I N E E R I N G'            <- .cv-row dt, 0.12em
 *
 * Dates are the expensive loss: date parsing drives an ATS's years-of-
 * experience calculation, so a CV whose dates do not parse can be scored as
 * having no verifiable history. And it is INVISIBLE — the PDF renders
 * perfectly, so no amount of proofreading finds it. RCA-010.
 *
 * SEVERITY VARIES BY READER, and this gate deliberately uses the engine a
 * RECRUITER would: pdf-parse wraps pdfjs, which is what Chrome's own PDF
 * viewer runs, so it reproduces exactly what the owner saw when he copied out
 * of his download — 'E X P E R I E N C E'. A different extractor (pypdf)
 * returns that heading clean while still mangling the dates. Same file, two
 * thresholds, one cause: gate the cause.
 *
 * WHICH CHANGE TURNS IT RED: put `letter-spacing` back on any `.cv-*` selector
 * without a print reset — or delete the reset block in cv.css — and the spaced
 * run it produces is caught here.
 */

const require = createRequire(import.meta.url);

/* A run of single characters separated by single spaces: "J U N E", "T E S T".
   Four or more in a row, so ordinary initialisms ("A B testing") do not trip
   it and a real sentence cannot. */
const SPACED_OUT = /(?:(?:^|\s)\S(?: \S){3,})(?=\s|$)/gm;

test('/cv: the PDF a recruiter forwards is machine-readable — no spaced-out text', async ({ page }) => {
  await page.goto('/cv', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const pdf = await page.pdf({ format: 'A4', printBackground: true });

  const { PDFParse } = require('pdf-parse');
  const { text } = await new PDFParse({ data: new Uint8Array(pdf) }).getText();

  /* DENOMINATOR FIRST. Everything below asserts an ABSENCE, and an absence is
     satisfied by an empty extraction — a gate that certifies sameness rather
     than correctness, the ["",""] shape this repo has been bitten by. Prove
     the extractor actually read the document before trusting what it did not
     find. */
  expect(text.length, 'the PDF extracted almost no text — the checks below prove nothing')
    .toBeGreaterThan(2000);
  for (const anchor of ['Rohit Agrawal', 'Oracle', 'Bengaluru']) {
    expect(text, `"${anchor}" missing — the extraction is not of this page`).toContain(anchor);
  }

  const spaced = [...text.matchAll(SPACED_OUT)].map((m) => m[0].trim());
  expect(
    spaced,
    'text that a machine cannot read, caused by letter-spacing reaching the PDF:\n' +
      `${spaced.map((s) => `  ${JSON.stringify(s)}`).join('\n')}\n\n` +
      'Reset letter-spacing to normal for these selectors inside @media print in cv.css.',
  ).toEqual([]);
});

test('/cv: the employment dates parse as dates', async ({ page }) => {
  /* The partner, and its scope is narrower than it first looks — stated so
     nobody mistakes it for a second mangling check. The test above asserts an
     ABSENCE (no spaced-out runs); this asserts a PRESENCE (real date ranges are
     there), so that emptying the dates cannot satisfy the first one by leaving
     nothing to mangle. It does NOT independently catch tracking: measured on a
     copy with the print reset deleted, the spaced-out test went red and THIS
     ONE STAYED GREEN. Different jobs. */
  await page.goto('/cv', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });
  const { PDFParse } = require('pdf-parse');
  const pdf = await page.pdf({ format: 'A4', printBackground: true });
  const { text } = await new PDFParse({ data: new Uint8Array(pdf) }).getText();

  /* The CV uppercases its date rows, so the month is APRIL, not April. Matching
     title case only found zero and looked like a site defect — it was this
     regex. Case-insensitive, anchored on a real month name so a bare "2019 —
     2026" cannot satisfy it. */
  const MONTH = '(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*';
  const ranges = text.match(new RegExp(`${MONTH}\\s+\\d{4}\\s*[—–-]\\s*(?:${MONTH}\\s+\\d{4}|present)`, 'gi')) ?? [];
  expect(ranges.length, `no parseable date range found in the PDF; got ${ranges.length}`)
    .toBeGreaterThan(4);
});

/* RCA-011. The two tests above prove the PDF's text is well-formed. Neither ever asserted it was
 * COMPLETE: both anchor on 'Rohit Agrawal', 'Oracle', 'Bengaluru' — all outside any <details> — so
 * a closed <details>'s content could vanish entirely and both would stay green. It did: Chrome
 * hides a closed <details>'s body via `content-visibility` on the internal `::details-content`
 * box, a mechanism `cv-print.css`'s `display: block` override does not reach, so Independent
 * Systems prints as six bare name/status rows with no description, no Gate/Rule, no Visit or
 * Evidence link — and 'NarraTwin AI — PHASE 1 — NO-GO' prints with nothing around it to explain
 * what NarraTwin is.
 *
 * MARGIN MATTERS. Both tests above call `page.pdf()` with no `margin`, which Playwright defaults
 * to 0 on every side. Chrome's own default when a person actually prints is 0.4in — measured
 * page-1 ink fill is 78% at Playwright's default and 38% at Chrome's real one, because the extra
 * 0.4in on every side leaves less room to absorb the padding/min-height defect below. This test
 * prints at 0.4in so it sees what a recruiter's own "Print" dialog produces.
 *
 * RED WHEN: `.cv-proj:not([open])::details-content` loses its `content-visibility: visible`
 * override (the presence probes fail); `.cv.plate`'s padding/min-height/display reset loses
 * enough specificity for `global.css`'s `.plate` rule to win again (the page-1 floor fails). */
test('/cv: the printed PDF carries Independent Systems — description, Gate, Evidence, not just name', async ({
  page,
}) => {
  await page.goto('/cv', { waitUntil: 'networkidle' });
  await page.emulateMedia({ media: 'print' });

  // The root cause of the page-1 defect, asserted directly: the screen plate's
  // vertical centring must not survive into print.
  const style = await page.locator('.cv').evaluate((el) => {
    const cs = getComputedStyle(el);
    return { paddingTop: cs.paddingTop, minHeight: cs.minHeight, display: cs.display };
  });
  expect(style.paddingTop, '.cv still carries the screen plate\'s padding under print media').toBe('0px');
  expect(style.minHeight, '.cv still carries the screen plate\'s min-height under print media').toBe('0px');
  expect(style.display, '.cv still renders as the screen plate\'s grid under print media').not.toBe('grid');

  const pdf = await page.pdf({
    format: 'A4',
    printBackground: true,
    margin: { top: '0.4in', bottom: '0.4in', left: '0.4in', right: '0.4in' },
  });
  const { PDFParse } = require('pdf-parse');
  const result = await new PDFParse({ data: new Uint8Array(pdf) }).getText();

  expect(result.text.length, 'the PDF extracted almost no text — the checks below prove nothing')
    .toBeGreaterThan(2000);
  // Anchors from four of the six project cards, not one or two — a fix scoped narrowly enough to
  // restore some cards but not others (e.g. a selector that only matches the first `<details>`)
  // must not read as complete. Delhi-NCR/SaafSaans, citevyn.stackclimb.com/CiteVyn's Visit link,
  // 'Grounded walkthrough generation'/NarraTwin's own body (the card whose bare NO-GO this fix
  // exists for), 'faithfulness, answer relevancy'/EvalAxis.
  for (const anchor of [
    'Delhi-NCR',
    'citevyn.stackclimb.com',
    'Grounded walkthrough generation',
    'faithfulness, answer relevancy',
  ]) {
    expect(result.text, `"${anchor}" missing — Independent Systems' body content did not print`).toContain(anchor);
  }
  // Substring, not token — the same trap docs/evidence/README.md already records: a prior probe
  // reported this label PRESENT by matching 'gates' inside an unrelated summary paragraph. Counted,
  // not just present: four projects carry a Gate claim (CiteVyn, Quorum-AI, NarraTwin, EvalAxis), so
  // a fix that restores only one card's Gate line must not pass as complete.
  const gateHits = result.text.match(/\bGATE\b/g) ?? [];
  expect(
    gateHits.length,
    `expected 4 Gate labels, found ${gateHits.length} — some project cards are still not printing their claim`,
  ).toBeGreaterThanOrEqual(4);
  // SaafSaans is the one card with a Rule instead of a Gate — a fix that only restores `.cv-gate`
  // paragraphs sharing markup with the Gate label could still miss this one.
  expect(/\bRULE\b/.test(result.text), 'no Rule label printed — SaafSaans\' disclosure rule did not print').toBe(true);

  // The page-1 fill floor. Measured before the fix: page 1 carries 946 characters against page 2's
  // 2183. Measured after, on both the desktop (1440x900) and mobile (412x915) Playwright projects —
  // page.pdf() renders print layout independently of viewport, so both give the same figure: 2122.
  // 1500 sits with margin on both sides of that gap, so a regression that only partially restores
  // the fix still fails this.
  const page1 = result.pages.find((p) => p.num === 1)?.text ?? '';
  expect(
    page1.length,
    `page 1 carries only ${page1.length} chars — the screen plate's dead space is still eating the top of the page`,
  ).toBeGreaterThan(1500);
});
