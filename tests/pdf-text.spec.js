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
