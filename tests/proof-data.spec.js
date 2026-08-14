// Node-side gates for src/data/proof.js — package 4B. Split from
// proof-act.spec.js when the D8 budget caught it at 255/250 (one concern:
// the data contract; the browser assertions stay in proof-act.spec.js).
// Mutation ledger: docs/STATUS.md row D85. In brief: thesis string locked
// (the Four ruling), five rows a side, every figure bound to ITS OWN cv.js
// Oracle point (cv.js carries 25 twice, 20 three times — token-anywhere
// passes swaps), no employer name inside any row, every capability term in
// both the rendered sentence and its evidence file.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { definition, thesis, employerRows, capabilityRows } from '../src/data/proof.js';
import { experience } from '../src/data/cv.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const THESIS = 'Fourteen years I can tell you about. Four systems you can check yourself.';
const EMPLOYERS = /oracle|amazon|mobileum|snapdeal|subex|limeroad/i;
const norm = (t) => t.replace(/\s+/g, ' ').trim();
const fold = (t) => norm(t.normalize('NFKC').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '));
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
    const points = oracle.points.filter((p) => r.point.test(p));
    expect(points.length, `${r.t}: no Oracle point matches ${r.point}`).toBeGreaterThan(0);
    const rowFigs = r.d.match(FIGURE) || [];
    expect(rowFigs, `${r.t}: row carries no figure`).not.toHaveLength(0);
    for (const n of rowFigs) {
      const bound = points.some((p) => (p.match(FIGURE) || []).includes(n));
      expect(bound, `${r.t}: figure ${n} not in its own point(s): ${points}`).toBe(true);
    }
    expect(rowFigs).toEqual(r.figures);
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
  }
});

