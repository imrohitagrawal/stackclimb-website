// The two-ledger act (#proof) — package 4, D57 act 01, D60 as amended by D62.
//
// Hardened after the R-7 Codex pass (14 holes) and the built-result fan (18
// confirmed) — the contact.spec.js lesson repeating on a new file. Mutation
// record lives in docs/STATUS.md row D84: each named mutation was applied
// against a commit, the named assertion watched RED, then restored. Which
// change turns each red:
//   1 placement — delete <ProofPlate />; flex-reorder #systems above #proof
//     (boxes are compared, not only DOM order).
//   2 painted — #proof { opacity: 0 }, { display: none }, { filter:
//     opacity(0) }, or { position: absolute; left: -99999px } (checkVisibility
//     is ancestor-aware; filter and geometry are asserted separately).
//   3 definition — reword it in proof.js; render a decoy "StackClimb" earlier
//     (first-occurrence must BE the definition, case-insensitive).
//   4 adjacency — move the definition into the other column (horizontal
//     overlap required) or 600px away (vertical gap capped at 120).
//   5 footer — alter one word of a kept D60 sentence.
//   6 attribution — swap dt employers (dt itself is asserted, so a hidden
//     decoy elsewhere in the row cannot satisfy it); delete the Oracle row.
//   7 the invented figure — a 25% paired with release-validation in ANY
//     spelling (unicode dashes/spaces NFKC-folded before matching), or any
//     non-Amazon employer row carrying 25%.
//   8 label — delete or negate the self-reported h3 (full-string equality);
//     aria-hidden it (role query respects the accessibility tree).
//   9 drift — 767→771 in proof.js (token-bounded: 767→76 also red), a figure
//     absent from the strip, an unanchored sha (@df8cfc3BAD is red), a sha
//     absent from the evidence file, or a fifth/fourth-deleted built row.
//
// Rows are asserted from the SAME import the component renders — a third
// hardcoded copy would be the drift this gate exists to prevent.

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';
import { definition, employerRows, builtRows } from '../src/data/proof.js';
import { projects } from '../src/data/projects.js';

const DEFN =
  'StackClimb is where Rohit Agrawal builds independent AI systems — outside any employer.';
const KEPT2 = 'Independent projects are built outside any employer.';
const KEPT3 = 'Employer outcomes are attributed to their employer and marked approximate.';
const FOOTER_HEAD = 'StackClimb is where Rohit Agrawal builds independent AI systems.';

const norm = (s) => s.replace(/\s+/g, ' ').trim();
// NFKC-fold, unify every dash to '-', every space to ' ' — the unicode-hyphen
// evasion (U+2011) and NBSP both collapse before any bar is applied.
const fold = (s) => norm(s.normalize('NFKC').replace(/\p{Pd}/gu, '-').replace(/\s/gu, ' '));

test('proof.js carries the D62 definition verbatim, and exactly four built rows', () => {
  expect(definition).toBe(DEFN);
  // The heading says FOUR built systems; the denominator is asserted here so
  // a dropped row cannot rebalance itself against the employer ledger.
  expect(builtRows).toHaveLength(4);
  expect(employerRows).toHaveLength(4);
});

async function gotoReduced(page, path = '/') {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
}

// Painted = visible per the ancestor-aware check AND not filtered away AND
// laid out inside the page's horizontal flow (off-screen positioning passes
// checkVisibility — a Codex finding).
const painted = (loc) =>
  loc.evaluate((el) => {
    const r = el.getBoundingClientRect();
    return (
      el.checkVisibility({ opacityProperty: true, visibilityProperty: true }) &&
      getComputedStyle(el).filter === 'none' &&
      r.right > 0 &&
      r.left < document.documentElement.scrollWidth &&
      r.left >= 0
    );
  });

test('the act sits between the hero and the systems — in the DOM and on screen', async ({
  page,
}) => {
  await gotoReduced(page);
  const order = await page.evaluate(() => {
    const top = document.querySelector('#top');
    const proof = document.querySelector('#proof');
    const systems = document.querySelector('#systems');
    if (!top || !proof || !systems) return 'missing';
    const after = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    const t = (el) => el.getBoundingClientRect().top + window.scrollY;
    const domOk = after(top, proof) && after(proof, systems);
    const paintOk = t(top) < t(proof) && t(proof) < t(systems);
    return domOk && paintOk ? 'ok' : 'misplaced';
  });
  expect(order).toBe('ok');
  expect(await painted(page.locator('#proof'))).toBe(true);
  const h = await page.locator('#proof').evaluate((el) => el.getBoundingClientRect().height);
  expect(h).toBeGreaterThan(200);
});

test('the act defines the word where it is first used', async ({ page }) => {
  await gotoReduced(page);
  const defn = page.locator('#proof .proof-defn');
  await expect(defn).toHaveText(norm(DEFN), { useInnerText: true });
  expect(await painted(defn)).toBe(true);
  // The FIRST "StackClimb" in rendered body text (any case — innerText
  // reports transformed text, so an uppercase decoy still counts) must be
  // the definition element's own text, not merely similar text.
  const ok = await page.evaluate(() => {
    const body = document.body.innerText;
    const defnText = document.querySelector('#proof .proof-defn').innerText;
    const first = body.search(/stackclimb/i);
    const defnAt = body.indexOf(defnText);
    return first >= 0 && defnAt >= 0 && first >= defnAt && first < defnAt + defnText.length;
  });
  expect(ok, 'an earlier StackClimb occurrence is not the definition').toBe(true);
});

for (const width of [1440, 390]) {
  test(`the definition adjoins the built-systems heading at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 700 ? 900 : 844 });
    await gotoReduced(page);
    const gap = await page.evaluate(() => {
      const h = document.getElementById('proof-b').getBoundingClientRect();
      const d = document.querySelector('#proof .proof-defn').getBoundingClientRect();
      const vGap = Math.min(Math.abs(d.top - h.bottom), Math.abs(h.top - d.bottom));
      const hOverlap = Math.min(d.right, h.right) - Math.max(d.left, h.left);
      return { vGap, hOverlap };
    });
    // Same column (horizontal ranges overlap) and near (the real gap measures
    // ~6px; 120 leaves slack without accepting a screen of separation).
    expect(gap.hOverlap, 'definition left its heading’s column').toBeGreaterThan(0);
    expect(gap.vGap, 'definition drifted from its heading').toBeLessThan(120);
  });
}

test('the footer defines StackClimb in the owner’s kept words — home and a project page', async ({
  page,
}) => {
  for (const path of ['/', '/projects/citevyn']) {
    await gotoReduced(page, path);
    const foot = page.locator('footer .colophon-defn');
    const text = norm(await foot.innerText());
    expect(text).toContain(FOOTER_HEAD);
    expect(text).toContain(KEPT2);
    expect(text).toContain(KEPT3);
    expect(await painted(foot)).toBe(true);
  }
});

test('no built page says "product studio" — and the partner proves the definition ships', () => {
  const pages = ['dist', 'dist/projects']
    .flatMap((d) => readdirSync(d).filter((f) => f.endsWith('.html')).map((f) => `${d}/${f}`))
    // Tags become spaces and entities are decoded BEFORE the bar, so
    // `product <em>studio</em>` and `product&nbsp;studio` cannot slip past.
    .map((f) =>
      fold(
        readFileSync(f, 'utf8')
          .replace(/<[^>]+>/g, ' ')
          .replace(/&nbsp;|&#160;|&#32;/gi, ' '),
      ),
    );
  expect(pages.length).toBeGreaterThan(5);
  for (const html of pages) expect(/product\s+studio/i.test(html)).toBe(false);
  expect(pages.some((h) => h.includes(FOOTER_HEAD))).toBe(true);
});

// Rows read as {dt, dd} pairs so the attribution is asserted on the slot that
// carries it — a hidden decoy employer name elsewhere in the row cannot pass.
async function ledgerRows(page, labelledBy) {
  return page.locator(`#proof dl[aria-labelledby="${labelledBy}"] .row`).evaluateAll((rows) =>
    rows.map((r) => ({
      dt: r.querySelector('dt')?.innerText ?? '',
      dd: r.querySelector('dd')?.innerText ?? '',
      visible: r.checkVisibility({ opacityProperty: true, visibilityProperty: true }),
    })),
  );
}

test('employer outcomes carry exact attribution', async ({ page }) => {
  await gotoReduced(page);
  const rows = await ledgerRows(page, 'proof-a');
  expect(rows).toHaveLength(employerRows.length);
  for (const r of rows) expect(r.visible, `hidden row: ${r.dt}`).toBe(true);
  const rc = rows.filter((r) => /root-cause analysis/i.test(fold(r.dd)));
  expect(rc, 'exactly one root-cause analysis row').toHaveLength(1);
  expect(rc[0].dt.toLowerCase()).toBe('oracle');
  const rv = rows.filter((r) => /release[- ]?validation/i.test(fold(r.dd)));
  expect(rv, 'exactly one release-validation row').toHaveLength(1);
  expect(rv[0].dt.toLowerCase()).toBe('mobileum');
  expect(fold(rv[0].dd), 'a 25% release-validation claim exists nowhere').not.toMatch(/25/);
  // The only 25% this ledger may carry is Amazon's coverage figure (cv.js:80).
  for (const r of rows.filter((r) => /25\s*%/.test(fold(r.dd)))) {
    expect(r.dt.toLowerCase(), `unexpected 25% under ${r.dt}`).toBe('amazon');
    expect(fold(r.dd)).toMatch(/coverage/i);
  }
});

test('the self-reported label is painted, exposed, and labels a ledger with figures', async ({
  page,
}) => {
  await gotoReduced(page);
  // Role query — respects the accessibility tree, so aria-hidden on the
  // heading or any ancestor fails here even while paint checks pass.
  const label = page.getByRole('heading', { level: 3, name: /self-reported/i });
  await expect(label).toHaveCount(1);
  expect(await painted(label)).toBe(true);
  // Full-string equality (case-folded for the CSS uppercase transform), so
  // "not self-reported" or a reworded label cannot satisfy a substring match.
  expect(norm(await label.innerText()).toLowerCase()).toBe(
    'employer record — self-reported, approximate',
  );
  const id = await label.getAttribute('id');
  const rows = await ledgerRows(page, id);
  expect(rows.length).toBeGreaterThanOrEqual(employerRows.length);
  expect(rows.some((r) => r.dd.includes('%'))).toBe(true);
});

test('both ledger headings are visible h3s, exposed to AT, bound to their lists', async ({
  page,
}) => {
  await gotoReduced(page);
  // Two level-3 headings must exist in the ACCESSIBILITY TREE inside #proof.
  const exposed = page.locator('#proof').getByRole('heading', { level: 3 });
  await expect(exposed).toHaveCount(2);
  const h3s = page.locator('#proof h3[id]');
  await expect(h3s).toHaveCount(2);
  for (const h of await h3s.all()) {
    expect(await painted(h)).toBe(true);
    const id = await h.getAttribute('id');
    await expect(page.locator(`#proof dl[aria-labelledby="${id}"]`)).toHaveCount(1);
  }
});

// Token-bounded on both sides — '76' must not pass against '767' (the arize/
// summarize lesson: a substring is not a token), and single-digit or decimal
// figures may not escape the net.
const FIGURE = /(?<![\d,.])\d[\d,]*(?:\.\d+)?(?![\d,.])/g;

test('counted rows agree with the caption strips and their evidence files', () => {
  for (const row of builtRows) {
    const cell = projects[row.slug].strip.find((c) => c.t === row.cell);
    expect(cell, `${row.slug} has no '${row.cell}' strip cell`).toBeTruthy();
    const stripTokens = new Set(cell.d.match(FIGURE) || []);
    const figures = row.d.replace(/@[0-9a-z]+/gi, '').match(FIGURE) || [];
    expect(figures.length, `${row.slug} row carries no counted figure`).toBeGreaterThan(0);
    for (const n of figures) {
      expect(stripTokens.has(n), `${row.slug}: token '${n}' not in strip '${cell.d}'`).toBe(true);
    }
    // Anchored: @<exactly seven hex><end-of-token> — '@df8cfc3BAD' fails.
    const sha = (row.d.match(/@([0-9a-f]{7})(?![0-9a-zA-Z])/) || [])[1];
    expect(sha, `${row.slug} row carries no clean 7-hex sha`).toBeTruthy();
    const evidence = readFileSync(`docs/evidence/projects/${row.file}`, 'utf8');
    expect(evidence, `${sha} absent from ${row.file}`).toContain(sha);
  }
});

test('the counted rows render from the same data this file read', async ({ page }) => {
  await gotoReduced(page);
  const rows = await ledgerRows(page, 'proof-b');
  expect(rows).toHaveLength(builtRows.length);
  for (const [i, row] of builtRows.entries()) {
    expect(rows[i].visible, `hidden row: ${row.t}`).toBe(true);
    // dt renders under text-transform: uppercase (compare case-folded); dd
    // has no case transform, so it is compared EXACTLY — the sha and No-Go
    // stay the plan's exact painted assertion.
    expect(rows[i].dt.toLowerCase()).toBe(row.t.toLowerCase());
    expect(norm(rows[i].dd)).toBe(norm(row.d));
  }
});
