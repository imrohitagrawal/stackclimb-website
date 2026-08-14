// The two-ledger act (#proof) — package 4B, RCA-002's rulings gated.
// THE FULL MUTATION LEDGER LIVES IN docs/STATUS.md ROW D85; every named
// mutation was applied against a commit, its assertion watched RED, restored.
// In brief: rows carry no employer name (heading only); no rendered
// "self-reported" on / or /cv (with painted APPROXIMATE partners on both);
// no "No-Go" in the act (with the overview's painted "Phase 1 — No-Go" as
// the same-file partner); each figure bound to ITS OWN cv.js Oracle point
// (cv.js carries 25 twice and 20 three times — token-anywhere passes swaps);
// each capability term in the rendered sentence AND its evidence file;
// thesis locked by full string including the count; D62 definition verbatim
// at first use and in the footer. Evasions folded before matching (NFKC,
// dash-unify, tag/entity strip) — the U+2011 / entity / span-split lessons.

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { definition, thesis, employerRows, capabilityRows } from '../src/data/proof.js';
import { experience } from '../src/data/cv.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const KEPT2 = 'Independent projects are built outside any employer.';
const KEPT3 = 'Employer outcomes are attributed to their employer and marked approximate.';
const FOOTER_HEAD = 'StackClimb is where Rohit Agrawal builds independent AI systems.';
const THESIS = 'Fourteen years I can tell you about. Four systems you can check yourself.';
const EMPLOYERS = /oracle|amazon|mobileum|snapdeal|subex|limeroad/i;

const norm = (s) => s.replace(/\s+/g, ' ').trim();
const fold = (s) => norm(s.normalize('NFKC').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '));
const FIGURE = /(?<![\d,.])\d[\d,]*(?:\.\d+)?(?![\d,.])/g;

async function gotoReduced(page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
}

const painted = (loc) =>
  loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      getComputedStyle(el).filter === 'none' &&
      r.right > 0 &&
      r.left >= 0 &&
      r.left < document.documentElement.scrollWidth
    );
  });

test('the act sits between the hero and the systems — DOM and paint', async ({ page }) => {
  await gotoReduced(page);
  const order = await page.evaluate(() => {
    const [top, proof, systems] = ['#top', '#proof', '#systems'].map((s) =>
      document.querySelector(s),
    );
    if (!top || !proof || !systems) return 'missing';
    const after = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const t = (el) => el.getBoundingClientRect().top + window.scrollY;
    return after(top, proof) && after(proof, systems) && t(top) < t(proof) && t(proof) < t(systems)
      ? 'ok'
      : 'misplaced';
  });
  expect(order).toBe('ok');
  expect(await painted(page.locator('#proof'))).toBe(true);
});

test('the act defines the word where it is first used, beside its heading', async ({ page }) => {
  await gotoReduced(page);
  const defn = page.locator('#proof .proof-defn');
  await expect(defn).toHaveText(norm(DEFN), { useInnerText: true });
  expect(await painted(defn)).toBe(true);
  // D60's exact scenario: the word is first met at the ledger heading
  // ("Independent StackClimb systems") and the definition renders in the
  // same block, immediately after. The first rendered occurrence must be
  // that heading or the definition itself — nothing earlier on the page.
  const ok = await page.evaluate(() => {
    const body = document.body.innerText;
    const head = document.getElementById('proof-b').innerText;
    const defnText = document.querySelector('#proof .proof-defn').innerText;
    const first = body.search(/stackclimb/i);
    const headAt = body.indexOf(head);
    const defnEnd = body.indexOf(defnText) + defnText.length;
    return first >= 0 && headAt >= 0 && first >= headAt && first < defnEnd;
  });
  expect(ok, 'a StackClimb occurrence precedes the act’s heading+definition block').toBe(true);
  for (const width of [1440, 390]) {
    await page.setViewportSize({ width, height: width > 700 ? 900 : 844 });
    const gap = await page.evaluate(() => {
      const h = document.getElementById('proof-b').getBoundingClientRect();
      const d = document.querySelector('#proof .proof-defn').getBoundingClientRect();
      return {
        v: Math.min(Math.abs(d.top - h.bottom), Math.abs(h.top - d.bottom)),
        x: Math.min(d.right, h.right) - Math.max(d.left, h.left),
      };
    });
    expect(gap.x, `left its column at ${width}`).toBeGreaterThan(0);
    expect(gap.v, `drifted from its heading at ${width}`).toBeLessThan(120);
  }
});

test('footer definition on home and a project page', async ({ page }) => {
  for (const path of ['/', '/projects/citevyn']) {
    await gotoReduced(page, path);
    const text = norm(await page.locator('footer .colophon-defn').innerText());
    for (const s of [FOOTER_HEAD, KEPT2, KEPT3]) expect(text).toContain(s);
    expect(await painted(page.locator('footer .colophon-defn'))).toBe(true);
  }
});

test('bars: product studio and self-reported render on no built page', () => {
  const pages = ['dist', 'dist/projects']
    .flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => `${d}/${f}`))
    .map((f) =>
      fold(readFileSync(f, 'utf8').replace(/<[^>]+>/g, ' ').replace(/&nbsp;|&#160;|&#32;|&#8209;/gi, ' ')),
    );
  expect(pages.length).toBeGreaterThan(5);
  for (const html of pages) {
    expect(/product\s+studio/i.test(html)).toBe(false);
    expect(/self[\s-]*reported/i.test(html)).toBe(false);
  }
  expect(pages.some((h) => h.includes(FOOTER_HEAD))).toBe(true); // bar partner
});

test('approximate partners: act meta chained, /cv note painted, Amazon and Mobileum stay', async ({
  page,
}) => {
  await gotoReduced(page);
  const dl = page.locator('#proof dl[aria-labelledby="proof-a proof-a-meta"]');
  await expect(dl).toHaveCount(1);
  const meta = page.locator('#proof-a-meta');
  expect(fold(await meta.innerText()).toLowerCase()).toContain('approximate');
  expect(await painted(meta)).toBe(true);
  await gotoReduced(page, '/cv');
  const note = page.locator('.cv-note');
  expect(fold(await note.first().innerText()).toLowerCase()).toContain('approximate');
  expect(await painted(note.first())).toBe(true);
  const cv = fold(await page.locator('main').innerText());
  for (const s of ['Amazon', 'Mobileum', '35%', '25%']) expect(cv).toContain(s);
});

test('attribution lives in the heading alone; no employer inside the act rows', async ({
  page,
}) => {
  await gotoReduced(page);
  const heading = fold(await page.locator('#proof-a').innerText());
  expect(heading.toLowerCase()).toContain('oracle');
  const rows = await page.locator('#proof .proof-ledger .row').allInnerTexts();
  expect(rows.length).toBe(employerRows.length + capabilityRows.length);
  for (const r of rows) expect(EMPLOYERS.test(fold(r)), `employer name in row: ${r}`).toBe(false);
});

test('no No-Go in the act — and the overview still disparages nothing it holds', async ({
  page,
}) => {
  await gotoReduced(page);
  const act = fold(await page.locator('#proof').innerText());
  expect(/no[\s-]*go/i.test(act)).toBe(false);
  expect(/not\s+deployed/i.test(act)).toBe(false);
  // Partner: the disclosure stays painted and exposed one plate below.
  const state = page.locator('#overview .ov-state', { hasText: /No-Go/ });
  await expect(state).toHaveCount(1);
  expect(await painted(state)).toBe(true);
  expect(await state.evaluate((el) => !el.closest('[aria-hidden="true"]'))).toBe(true);
});

test('both columns: visible h3s, AT-exposed, lists bound; NOT CLAIMED describes', async ({
  page,
}) => {
  await gotoReduced(page);
  await expect(page.locator('#proof').getByRole('heading', { level: 3 })).toHaveCount(2);
  for (const id of ['proof-a', 'proof-b']) {
    expect(await painted(page.locator(`#${id}`))).toBe(true);
  }
  const caps = page.locator('#proof dl[aria-describedby="proof-nc"]');
  await expect(caps).toHaveCount(1);
  const nc = page.locator('#proof-nc');
  expect(fold(await nc.innerText()).toLowerCase()).toContain('not claimed');
  expect(await painted(nc)).toBe(true);
});

test('the rows render from the same data this file read', async ({ page }) => {
  await gotoReduced(page);
  for (const [sel, data] of [
    ['#proof dl[aria-labelledby="proof-a proof-a-meta"] .row', employerRows],
    ['#proof dl[aria-describedby="proof-nc"] .row', capabilityRows],
  ]) {
    const rows = await page.locator(sel).evaluateAll((els) =>
      els.map((r) => ({
        dt: r.querySelector('dt')?.innerText ?? '',
        dd: r.querySelector('dd')?.innerText ?? '',
        vis: r.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
      })),
    );
    expect(rows).toHaveLength(data.length);
    for (const [i, r] of data.entries()) {
      expect(rows[i].vis, `hidden row ${r.t}`).toBe(true);
      expect(rows[i].dt.toLowerCase()).toBe(r.t.toLowerCase()); // dt is CSS-uppercased
      expect(norm(rows[i].dd)).toBe(norm(r.d)); // dd exact, case and all
    }
  }
});

test('hero: thesis painted and exact, strip named by it, population cells kept', async ({
  page,
}) => {
  await gotoReduced(page);
  const th = page.locator('#hero-thesis');
  expect(norm(await th.innerText())).toBe(THESIS);
  expect(await painted(th)).toBe(true);
  const strip = page.locator('#top .caps');
  await expect(strip).toHaveAttribute('aria-labelledby', 'hero-thesis');
  expect(await strip.getAttribute('aria-label')).toBeNull();
  for (const [t, d] of [
    ['Systems of my own', '6'],
    ['Built', '4'],
    ['In progress', '2'],
  ]) {
    const cell = strip.locator('.cap', { hasText: t });
    await expect(cell).toHaveCount(1);
    expect(fold(await cell.innerText())).toContain(d);
    expect(await painted(cell)).toBe(true);
  }
});
