// The two-ledger act (#proof) — package 4B (RCA-002), rescoped by RCA-005:
// the employer ledger depicts the CAREER, and NO employer name renders
// anywhere in the act (attribution is performed on /cv, derived per row).
// THE FULL MUTATION LEDGERS LIVE IN docs/STATUS.md ROWS D85 AND D87; every
// named mutation was applied against a commit, watched RED, restored.
// In brief: heading exact + whole-act employer bar; no rendered
// "self-reported" on / or /cv (with painted APPROXIMATE partners on both);
// no "No-Go" in the act (with the overview's painted "Phase 1 — No-Go" as
// the same-file partner); each figure bound to ITS OWN bullet in ITS OWN
// cv.js job (proof-data.spec.js), and /cv renders each row's job + figure;
// each capability term in the rendered sentence AND its evidence file;
// thesis locked by full string including the count; D62 definition verbatim
// at first use and in the footer. Evasions folded before matching (NFKC,
// dash-unify, tag/entity strip) — the U+2011 / entity / span-split lessons.

import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { employerRows, capabilityRows } from '../src/data/proof.js';
import { experience } from '../src/data/cv.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const KEPT3 = 'Employer outcomes are attributed to their employer and marked approximate.';
// Owner's ruling on the PR: the footer carries D62's FULL line, tail
// included; the old kept second sentence left as redundant once the tail
// arrived. DEFN is the exact string on every page's footer.
const FOOTER_HEAD = DEFN;
const THESIS = 'Fourteen years I can tell you about. Six practices you can check yourself.';
// DERIVED from cv.js, unioned with the legacy list — a hardcoded list let a
// renamed employer (cv.js org → 'Google') sail past every bar (Codex hole 10).
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const EMPLOYERS = new RegExp(
  [...new Set([...experience.map((j) => esc(j.org.toLowerCase())),
    'oracle', 'amazon', 'mobileum', 'snapdeal', 'subex', 'limeroad'])].join('|'),
  'i',
);

// norm/fold extracted to tests/lib/fold.mjs at 263/250 (D8: modularize).
import { norm, fold } from './lib/fold.mjs';
async function gotoReduced(page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
}

// Extracted to tests/lib/painted.mjs at 255/250 (D8: modularize, not trim).
import { painted } from './lib/painted.mjs';

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
  // Node identity, not string offsets — an earlier decoy carrying the same
  // uppercased heading text fooled indexOf (Codex finding). The first VISIBLE
  // text node containing the word must live in the heading or the definition.
  // (innerText cannot see aria-label/alt: the nav wordmark's alt="StackClimb"
  // precedes this for AT users — recorded exception, the wordmark IS the brand.)
  const owner = await page.evaluate(() => {
    const w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) =>
        /stackclimb/i.test(n.nodeValue) &&
        n.parentElement.checkVisibility({ opacityProperty: true, visibilityProperty: true })
          ? NodeFilter.FILTER_ACCEPT
          : NodeFilter.FILTER_SKIP,
    });
    const first = w.nextNode();
    if (!first) return 'none';
    const p = first.parentElement;
    return p.closest('#proof-b') || p.closest('.proof-defn') ? 'ok' : p.outerHTML.slice(0, 80);
  });
  expect(owner, 'first visible StackClimb is outside the heading+definition').toBe('ok');
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
    for (const s of [FOOTER_HEAD, KEPT3]) expect(text).toContain(s);
    expect(await painted(page.locator('footer .colophon-defn'))).toBe(true);
  }
});

test('approximate partner: the act meta, chained, exact and painted', async ({ page }) => {
  await gotoReduced(page);
  const dl = page.locator('#proof dl[aria-labelledby="proof-a proof-a-meta"]');
  await expect(dl).toHaveCount(1);
  const meta = page.locator('#proof-a-meta');
  // Full-string equality — 'Not approximate' passed a substring check.
  // RCA-005: the career qualifier; its two FACTS are gated against cv.js
  // in proof-data.spec.js (month-granular span, six distinct orgs). The
  // /cv side of this partnership lives in proof-cv.spec.js (D8 split).
  expect(fold(await meta.innerText()).toLowerCase()).toBe(
    'approximate · fourteen years, six employers',
  );
  expect(await painted(meta)).toBe(true);
});

test('the heading is exact, and no employer name renders anywhere in the act', async ({
  page,
}) => {
  await gotoReduced(page);
  // P-21's acceptance clause, gated positively — the absence bar alone
  // would pass 'Career numbers' (plan-fan finding).
  const heading = fold(await page.locator('#proof-a').innerText());
  expect(heading.toLowerCase()).toBe('employer outcomes');
  // innerText cannot see generated content — `#proof-a::after { content:
  // " — Oracle" }` re-suffixed the heading past both gates (Codex hole 11).
  const pseudo = await page.locator('#proof-a').evaluate((el) =>
    ['::before', '::after'].map((p) => getComputedStyle(el, p).content).join(''),
  );
  expect(pseudo.replace(/none|normal/g, ''), 'generated content on the heading').toBe('');
  const rows = await page.locator('#proof .proof-ledger .row').allInnerTexts();
  expect(rows.length).toBe(employerRows.length + capabilityRows.length);
  // The WHOLE act, heading included — RCA-005 removed the act's one
  // permitted employer name; there is no excuse zone left. fold() strips
  // the zero-width characters that split employer names past the regex.
  const act = fold(await page.locator('#proof').innerText());
  expect(EMPLOYERS.test(act), 'employer name inside the act').toBe(false);
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
  const caps = page.locator('#proof dl[aria-labelledby="proof-b"][aria-describedby="proof-nc"]');
  await expect(caps).toHaveCount(1);
  for (const dl of await page.locator('#proof dl').all()) {
    expect(await dl.evaluate((el) => !el.closest('[aria-hidden="true"]'))).toBe(true);
  }
  const nc = page.locator('#proof-nc');
  expect(fold(await nc.innerText()).toLowerCase().startsWith('not claimed -')).toBe(true);
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
        // aria-hidden rows keep innerText and checkVisibility — the dl-level
        // ancestry check could not see per-row hiding (Codex hole 12).
        atHidden: !!r.closest('[aria-hidden="true"]'),
      })),
    );
    expect(rows).toHaveLength(data.length);
    for (const [i, r] of data.entries()) {
      expect(rows[i].vis, `hidden row ${r.t}`).toBe(true);
      expect(rows[i].atHidden, `AT-hidden row ${r.t}`).toBe(false);
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
    ['Practices, enforced', '6'],
    ['Systems of my own', '6'],
    ['Blocked by its own gate', '1'],
  ]) {
    const cell = strip.locator('.cap', { hasText: t });
    await expect(cell).toHaveCount(1);
    // Exact value — '60/40/20' passed a substring check (Codex finding).
    expect(norm(await cell.locator('.d').innerText())).toBe(d);
    expect(await painted(cell)).toBe(true);
  }
});
