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
// DERIVED from cv.js, unioned with the legacy list — a hardcoded list let a
// renamed employer slip every bar (Codex hole 10; mirrored in proof-act).
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMPLOYERS = new RegExp(
  [...new Set([...experience.map((j) => esc(j.org.toLowerCase())),
    'oracle', 'amazon', 'mobileum', 'snapdeal', 'subex', 'limeroad'])].join('|'),
  'i',
);
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
    // The LABEL must describe the bullet it binds — 'Customer churn' over a
    // flaky-tests regex passed every figure check (R-7 recovery hole 1).
    // Every content word of the label appears in the matched bullet.
    const bullet = fold(job.points.find((p) => r.point.test(p))).toLowerCase();
    for (const w of fold(r.t).toLowerCase().split(/\s+/).filter((x) => !['in', 'of', 'the'].includes(x))) {
      expect(bullet, `${r.t}: label word '${w}' not in its own bullet`).toMatch(
        new RegExp(`\\b${esc(w)}`),
      );
    }
    const rowFigs = r.d.match(FIGURE) || [];
    expect([...new Set(captured)], `${r.t}: row figures ≠ captured`).toEqual(rowFigs);
    expect(rowFigs).toEqual(r.figures);
    // UNITS: every figure keeps its percent sign — '65 defects → 95
    // defects' sailed past the figure equality (R-7 recovery hole 2).
    for (const f of r.figures) expect(r.d, `${r.t}: ${f} lost its %`).toContain(`${f}%`);
    // Direction: an ALLOWLIST beside the denylist — 'additional effort'
    // reversed the outcome past the denylist (R-7 recovery hole 3); every
    // row must carry a positive-direction token, so a reworded direction
    // forces a conscious look here.
    expect(fold(r.d).toLowerCase()).toMatch(/less|fewer|faster|→|->/);
    expect(fold(r.d).toLowerCase()).not.toMatch(/slower|\bmore\b|worse|higher|additional|extra/);
    expect(EMPLOYERS.test(r.t + ' ' + r.d), `${r.t}: employer name inside a row`).toBe(false);
  }
});

test('the career claim has its denominators: jobs spanned, span, and count', () => {
  // The rows must SPAN the career for the unscoped heading to be true —
  // ≥3 distinct jobs, at least one starting before 2016 (Mobileum, April
  // 2015, is the earliest improvement-delta bullet cv.js holds; Subex's
  // one figure is a held 99% SLA level, Snapdeal carries none — the plan).
  const jobs = new Set(employerRows.map((r) => r.job));
  expect(jobs.size, 'rows collapsed back to fewer employers').toBeGreaterThanOrEqual(3);
  const years = employerRows.map((r) => {
    const j = experience.find((x) => x.org === r.job);
    return +j.from.match(/\d{4}/)[0];
  });
  expect(Math.min(...years), 'no pre-2016 job among the rows').toBeLessThanOrEqual(2015);
  // The qualifier's two facts derive from cv.js — a hardcoded date span
  // was rejected by the plan fan as unbindable. Partner: the string itself
  // (fold: the rendered pair carries an nbsp so 'six employers' cannot
  // orphan across the wrap — recruiter-lens finding).
  expect(fold(qualifier).toLowerCase()).toContain('fourteen years, six employers');
  // DISTINCT orgs, not entry count — a boomerang second stint would keep
  // length 6 while employers drop to five (built-fan finding).
  const orgs = new Set(experience.map((j) => j.org));
  expect(orgs.size, 'cv.js no longer carries six distinct employers').toBe(6);
  // MONTH-granular — year arithmetic left an ~11-month false-green window
  // ('April 2025' end reads as 14 by year math at 13y9m; Codex hole 6).
  const month = (s) => {
    const [m, y] = s.split(' ');
    return +y * 12 + 'January February March April May June July August September October November December'
      .split(' ').indexOf(m);
  };
  const from = Math.min(...experience.map((j) => month(j.from)));
  const to = Math.max(...experience.map((j) => month(j.to)));
  expect(to - from, 'career span under fourteen full years').toBeGreaterThanOrEqual(168);
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

