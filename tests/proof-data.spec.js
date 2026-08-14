// Node-side gates for src/data/proof.js — package 4B. Split from
// proof-act.spec.js when the D8 budget caught it at 255/250 (one concern:
// the data contract; the browser assertions stay in proof-act.spec.js).
// Mutation ledger: docs/STATUS.md row D85. In brief: thesis string locked
// (the Four ruling), five rows a side, every figure bound to ITS OWN cv.js
// Oracle point (cv.js carries 25 twice, 20 three times — token-anywhere
// passes swaps), no employer name inside any row, every capability term in
// both the rendered sentence and its evidence file.

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { definition, thesis, employerRows, capabilityRows } from '../src/data/proof.js';
import { experience } from '../src/data/cv.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const THESIS = 'Fourteen years I can tell you about. Four systems you can check yourself.';
const EMPLOYERS = /oracle|amazon|mobileum|snapdeal|subex|limeroad/i;
const norm = (t) => t.replace(/\s+/g, ' ').trim();
const fold = (t) => norm(t.normalize('NFKC').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '));
const FOOTER_HEAD = 'StackClimb is where Rohit Agrawal builds independent AI systems.';
const FIGURE = /(?<![\d,.])\d[\d,]*(?:\.\d+)?(?![\d,.])/g;

test('proof.js: D62 verbatim, thesis locked, five rows a side', () => {
  expect(definition).toBe(DEFN);
  expect(thesis).toBe(THESIS); // locks "Four" — the owner's named decision
  expect(employerRows).toHaveLength(5);
  expect(capabilityRows).toHaveLength(5);
});

test('every employer figure is bound to its own cv.js Oracle point', () => {
  const oracle = experience.find((j) => j.org === 'Oracle');
  for (const r of employerRows) {
    // The point regex CAPTURES the claim's own figure(s) — a row whose
    // figure matches a DIFFERENT figure in the same sentence stays red
    // (cv.js:68 carries 25% and 20% in one bullet; token-in-point passed a
    // swap, watched during this file's own mutation run).
    const captured = oracle.points
      .map((p) => p.match(r.point))
      .filter(Boolean)
      .flatMap((m) => m.slice(1));
    expect(captured.length, `${r.t}: no Oracle point matches ${r.point}`).toBeGreaterThan(0);
    const rowFigs = r.d.match(FIGURE) || [];
    // Set-equality: the merged Regression row's regex matches TWO bullets by
    // design (both 25%), so raw list equality was red at HEAD — caught by
    // the built-result fan, fixed here, the swap re-watched red after.
    expect([...new Set(captured)], `${r.t}: row figures ≠ captured`).toEqual(rowFigs);
    expect(rowFigs).toEqual(r.figures);
    // Cheap polarity bar (full direction-binding recorded as a residual):
    // an outcome may not flip to a worsening word with the figure intact.
    expect(fold(r.d).toLowerCase()).not.toMatch(/slower|more effort|worse|higher/);
    expect(EMPLOYERS.test(r.t + ' ' + r.d), `${r.t}: employer name inside a row`).toBe(false);
  }
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

