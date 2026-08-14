// Node-side gates for src/data/proof.js — package 4B, rescoped by RCA-005
// (the ledger depicts the CAREER). Split from proof-act.spec.js when the D8
// budget caught it at 255/250 (one concern: the data contract; browser
// assertions stay in proof-act.spec.js). Mutation ledgers: docs/STATUS.md
// rows D85 and D87. In brief: thesis string locked (the Four ruling), five
// rows a side, every figure captured from ITS OWN bullet inside ITS OWN
// cv.js job (25/20/35 recur across jobs — token-anywhere passes swaps and
// a page-wide match passes wrong-job bindings), rows span ≥3 jobs with one
// pre-2016 start, the career qualifier's facts derived from cv.js, no
// employer name inside any row, every capability term in both the rendered
// sentence and its evidence file.

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { definition, thesis, qualifier, employerRows, capabilityRows } from '../src/data/proof.js';
import { experience } from '../src/data/cv.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const THESIS = 'Fourteen years I can tell you about. Four systems you can check yourself.';
const EMPLOYERS = /oracle|amazon|mobileum|snapdeal|subex|limeroad/i;
const norm = (t) => t.replace(/\s+/g, ' ').trim();
const fold = (t) =>
  norm(t.normalize('NFKC').replace(/\p{Cf}/gu, '').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '));
const FOOTER_HEAD =
  'StackClimb is where Rohit Agrawal builds independent AI systems - outside any employer.';
const FIGURE = /(?<![\d,.])\d[\d,]*(?:\.\d+)?(?![\d,.])/g;

test('proof.js: D62 verbatim, thesis locked, five rows a side', () => {
  expect(definition).toBe(DEFN);
  expect(thesis).toBe(THESIS); // locks "Four" — the owner's named decision
  expect(employerRows).toHaveLength(5);
  expect(capabilityRows).toHaveLength(5);
});

test('every employer figure is bound to its own bullet inside its own cv.js job', () => {
  for (const r of employerRows) {
    // RCA-005: the binding is per JOB — the row's (unrendered) job field
    // names the cv.js entry its regex must match inside. A regex matching
    // an equal figure in a DIFFERENT job is a wrong attribution and red.
    const job = experience.find((j) => j.org === r.job);
    expect(job, `${r.t}: job '${r.job}' not in cv.js`).toBeTruthy();
    // The point regex CAPTURES the claim's own figure(s) — a row whose
    // figure matches a DIFFERENT figure in the same sentence stays red
    // (one Oracle bullet carries 25% and 20%; token-in-point passed a
    // swap, watched during this file's own mutation run).
    const captured = job.points
      .map((p) => p.match(r.point))
      .filter(Boolean)
      .flatMap((m) => m.slice(1));
    expect(captured.length, `${r.t}: no ${r.job} point matches ${r.point}`).toBeGreaterThan(0);
    const rowFigs = r.d.match(FIGURE) || [];
    expect([...new Set(captured)], `${r.t}: row figures ≠ captured`).toEqual(rowFigs);
    expect(rowFigs).toEqual(r.figures);
    // Polarity bar. Widened by the plan fan: bare 'more' — '~25% more' —
    // matched nothing in the old /more effort/ alternation, so the promised
    // red was a green (four lenses independently; watched red after).
    expect(fold(r.d).toLowerCase()).not.toMatch(/slower|\bmore\b|worse|higher/);
    expect(EMPLOYERS.test(r.t + ' ' + r.d), `${r.t}: employer name inside a row`).toBe(false);
  }
});

test('the career claim has its denominators: jobs spanned, span, and count', () => {
  // The rows must SPAN the career for the unscoped heading to be true —
  // ≥3 distinct jobs, at least one starting before 2016 (Mobileum, April
  // 2015, is the earliest outcome-bearing bullet cv.js holds; Subex and
  // Snapdeal carry no outcome figures — recorded in the plan).
  const jobs = new Set(employerRows.map((r) => r.job));
  expect(jobs.size, 'rows collapsed back to fewer employers').toBeGreaterThanOrEqual(3);
  const years = employerRows.map((r) => {
    const j = experience.find((x) => x.org === r.job);
    return +j.from.match(/\d{4}/)[0];
  });
  expect(Math.min(...years), 'no pre-2016 job among the rows').toBeLessThanOrEqual(2015);
  // The qualifier's two facts derive from cv.js — a hardcoded date span
  // was rejected by the plan fan as unbindable. Partner: the string itself.
  expect(qualifier.toLowerCase()).toContain('fourteen years, six employers');
  expect(experience.length, 'cv.js no longer carries six employers').toBe(6);
  const from = Math.min(...experience.map((j) => +j.from.match(/\d{4}/)[0]));
  const to = Math.max(...experience.map((j) => +j.to.match(/\d{4}/)[0]));
  expect(to - from, 'career span shorter than the qualifier claims').toBeGreaterThanOrEqual(14);
});

test('every capability term traces to its sentence AND its evidence file', () => {
  for (const r of capabilityRows) {
    expect(fold(r.d).toLowerCase()).toContain(r.term.toLowerCase());
    const evidence = readFileSync(`docs/evidence/projects/${r.file}`, 'utf8');
    expect(evidence.toLowerCase(), `${r.term} absent from ${r.file}`).toContain(
      r.term.toLowerCase(),
    );
    expect(EMPLOYERS.test(r.d), `${r.t}: employer name in a capability sentence`).toBe(false);
    // Polarity bar, scoped: negation directly ahead of the evidence term is
    // the 'No moderated critique' evasion; contrastive negation elsewhere
    // ('not the city average', 'no reading') is honest copy and allowed.
    const negated = new RegExp(`\\b(no|not|never)\\s+(\\w+\\s+){0,2}${r.term}`, 'i');
    expect(fold(r.d)).not.toMatch(negated);
  }
});


// Generic numeric-entity decode for the raw-HTML bar scan.
const decodeEntities = (s) =>
  s
    .replace(/&#x([0-9a-f]+);/gi, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d))
    .replace(/&shy;/gi, '\u00ad')
    .replace(/&nbsp;/gi, ' ');


test('bars: product studio and self-reported render on no built page', () => {
  const pages = ['dist', 'dist/projects']
    .flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => `${d}/${f}`))
    .map((f) => fold(decodeEntities(readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' '))));
  expect(pages.length).toBeGreaterThan(5);
  for (const html of pages) {
    expect(/product\s+studio/i.test(html)).toBe(false);
    expect(/self[\s-]*reported/i.test(html)).toBe(false);
  }
  expect(pages.some((h) => h.includes(FOOTER_HEAD))).toBe(true); // bar partner
});

