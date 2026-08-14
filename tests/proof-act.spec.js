// The two-ledger act (#proof) — package 4, D57 act 01, D60 as amended by D62.
//
// Every assertion here was watched RED before it shipped (mutations run against
// a commit, per the repo rule). Which change turns each red:
//   1 placement/painted — delete <ProofPlate /> from index.astro, or add
//     `#proof { opacity: 0 }` / `display: none` to proof.css (checkVisibility
//     walks ancestors, so an opacity-0 wrapper cannot pass — the
//     contact.spec.js lesson).
//   2 definition — delete the definition line from proof.js, or reword it.
//   3 first-use — render another bare "StackClimb" in body text before the act.
//   4 adjacency — move the definition out of the built-systems column (grid
//     reorder counts: boxes are measured, not DOM order — global.css:444
//     already reorders visually at 390).
//   5 footer — alter one word of a kept D60 sentence in Layout.astro.
//   6 attribution — swap the Oracle/Mobileum row names in proof.js; delete the
//     Oracle root-cause row (the exactly-one existence partner fires).
//   7 the −25% bar — add a row "Manual release validation down 25%" (either
//     spelling: the regex accepts space or hyphen).
//   8 label — delete the "self-reported" h3, or opacity-0 its container.
//   9 drift — change 767 to 771 in proof.js while projects.js still says 767,
//     or point a sha at a value its evidence file does not contain.
//
// Numbers are asserted from the SAME import the component renders (a third
// hardcoded copy would be the drift this gate exists to prevent).

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

// The component and this file must agree on the sentence — proof.js is the one
// source. If proof.js drifts from D62's recorded line, this fails before any
// page is opened.
test('proof.js carries the D62 definition verbatim', () => {
  expect(definition).toBe(DEFN);
});

async function gotoReduced(page, path = '/') {
  // Plates fade in on scroll by design; reduced motion disables the reveal so
  // painted-ness is the plate's own, not the animation frame we caught.
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(path);
}

const painted = (loc) =>
  loc.evaluate((el) => el.checkVisibility({ opacityProperty: true, visibilityProperty: true }));

test('the act sits between the hero and the systems, painted', async ({ page }) => {
  await gotoReduced(page);
  const order = await page.evaluate(() => {
    const top = document.querySelector('#top');
    const proof = document.querySelector('#proof');
    const systems = document.querySelector('#systems');
    if (!top || !proof || !systems) return 'missing';
    const after = (a, b) => !!(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    return after(top, proof) && after(proof, systems) ? 'ok' : 'misplaced';
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
  // First-use: the first "StackClimb" in rendered body text is this sentence.
  const first = await page.evaluate(() => {
    const i = document.body.innerText.indexOf('StackClimb');
    return i < 0 ? '' : document.body.innerText.slice(i, i + 60);
  });
  expect(first.startsWith('StackClimb is where Rohit Agrawal')).toBe(true);
});

for (const width of [1440, 390]) {
  test(`the definition adjoins the built-systems heading at ${width}`, async ({ page }) => {
    await page.setViewportSize({ width, height: width > 700 ? 900 : 844 });
    await gotoReduced(page);
    const gap = await page.evaluate(() => {
      const h = document.getElementById('proof-b').getBoundingClientRect();
      const d = document.querySelector('#proof .proof-defn').getBoundingClientRect();
      return Math.min(Math.abs(d.top - h.bottom), Math.abs(h.top - d.bottom));
    });
    expect(gap, 'definition and heading drifted apart on screen').toBeLessThan(400);
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
    .map((f) => norm(readFileSync(f, 'utf8')));
  expect(pages.length).toBeGreaterThan(5);
  for (const html of pages) expect(/product studio/i.test(html)).toBe(false);
  // Partner: a bar over pages that lost the definition would count nothing.
  expect(pages.some((h) => h.includes(FOOTER_HEAD))).toBe(true);
});

test('employer outcomes carry exact attribution', async ({ page }) => {
  await gotoReduced(page);
  const rows = await page.locator('#proof .ledger .row').allInnerTexts();
  expect(rows.length).toBeGreaterThanOrEqual(8);
  const rc = rows.filter((r) => /root-cause analysis/i.test(r));
  expect(rc, 'exactly one root-cause analysis row').toHaveLength(1);
  expect(rc[0]).toMatch(/oracle/i);
  const rv = rows.filter((r) => /release[- ]validation/i.test(r));
  expect(rv, 'exactly one release-validation row').toHaveLength(1);
  expect(rv[0]).toMatch(/mobileum/i);
  // The fabricated figure the queue bars, in either spelling. cv.js holds only
  // the ~35% Mobileum figure; a 25 in this row is an invented claim.
  expect(rv[0], 'a 25% release-validation claim exists nowhere').not.toMatch(/25/);
});

test('the self-reported label is painted and labels a ledger with figures', async ({ page }) => {
  await gotoReduced(page);
  const label = page.locator('#proof h3', { hasText: /self-reported/i });
  await expect(label).toHaveCount(1);
  expect(await painted(label)).toBe(true);
  // Partner: the list it names must exist and carry at least one % figure.
  const id = await label.getAttribute('id');
  const rows = await page.locator(`#proof dl[aria-labelledby="${id}"] .row`).allInnerTexts();
  expect(rows.length).toBeGreaterThanOrEqual(employerRows.length);
  expect(rows.some((r) => r.includes('%'))).toBe(true);
});

test('both ledger headings are visible h3s bound to their lists', async ({ page }) => {
  await gotoReduced(page);
  const h3s = page.locator('#proof h3[id]');
  await expect(h3s).toHaveCount(2);
  for (const h of await h3s.all()) {
    expect(await painted(h)).toBe(true);
    const id = await h.getAttribute('id');
    await expect(page.locator(`#proof dl[aria-labelledby="${id}"]`)).toHaveCount(1);
  }
});

test('counted rows agree with the caption strips and their evidence files', () => {
  for (const row of builtRows) {
    const cell = projects[row.slug].strip.find((c) => c.t === row.cell);
    expect(cell, `${row.slug} has no '${row.cell}' strip cell`).toBeTruthy();
    const figures = row.d.replace(/@\w+/g, '').match(/\d[\d,]+/g) || [];
    expect(figures.length, `${row.slug} row carries no counted figure`).toBeGreaterThan(0);
    for (const n of figures) {
      expect(cell.d, `${row.slug}: ${n} not in strip '${cell.d}'`).toContain(n);
    }
    const sha = (row.d.match(/@([0-9a-f]{7})/) || [])[1];
    expect(sha, `${row.slug} row carries no sha`).toBeTruthy();
    const evidence = readFileSync(`docs/evidence/projects/${row.file}`, 'utf8');
    expect(evidence, `${sha} absent from ${row.file}`).toContain(sha);
  }
});

test('the counted rows render from the same data this file read', async ({ page }) => {
  await gotoReduced(page);
  const rendered = (await page.locator('#proof dl[aria-labelledby="proof-b"] .row').allInnerTexts())
    .map(norm);
  expect(rendered).toHaveLength(builtRows.length);
  for (const [i, row] of builtRows.entries()) {
    // dt renders under text-transform: uppercase, and innerText reports the
    // PAINTED text — compare case-insensitively so the wording (not the CSS
    // case treatment) is what is asserted.
    expect(rendered[i].toLowerCase()).toBe(norm(`${row.t} ${row.d}`).toLowerCase());
  }
});
