// The self-test for painted()'s ink-alpha check.
//
// WHY IT EXISTS. painted() decides whether an element is really visible. It is
// called 20 times across seven spec files, and 17 of those calls assert the
// result inside expect(); the other three, all in content-model.spec.js,
// DISCARD it and therefore assert nothing at all (filed as DEF-79 — a
// pre-existing defect on main, not introduced here). Its old
// transparency guard split the computed colour on commas and slashes and tested
// for four components. That was right for the rgb()/rgba() world it was written
// in, and it became DEAD CODE the moment this site moved to `color-mix()`, which
// computes to `color(srgb 0 0 0 / 0)` — five components, so the branch never
// ran and fully invisible text was certified painted. Nothing went red, because
// a guard that stops firing goes quiet.
//
// RED WHEN: restore the old parse in tests/lib/painted.mjs — replace the canvas
// read with `getComputedStyle(el).color.replace(/rgba?\(|\)/g,'').split(/[,/]/)`
// and the `parts.length === 4 && parts[3] === 0` test. Executed: six of the eight
// HOLES flip to true. `color: transparent` does NOT flip, because it computes to
// `rgba(0, 0, 0, 0)`, which the old parse could still read — that one case is
// the reason the dead guard looked alive for so long, and it is kept in the
// table on purpose so the mutation's shape is visible rather than uniform.
//
// WHAT THIS FILE DOES NOT COVER, stated so no one infers it from silence. It
// tests the DECLARED fill on the located element only. It says nothing about a
// descendant's colour, nothing about contrast against a backdrop, and nothing
// about geometry, clipping or content-visibility. Those are open questions
// recorded against branch `harden-painted` in docs/STATUS.md, and this file must
// not be read as covering them.

import { test, expect } from '@playwright/test';
import { painted } from './lib/painted.mjs';

// Two shapes on purpose, and the pair is what makes the table discriminating.
// LEAF has NO child element. PARENT gives
// #t a real child ELEMENT while keeping the colour declaration on #t itself —
// without it, a guard narrowed to `el.childElementCount === 0` decides every
// fixture identically and the table cannot see the weakening. Real asserted
// callers (.artefact, .era-list, #proof) are all child-bearing.
// This is NOT the queued descendant-colour problem: here the transparent
// declaration is on the located element, which is squarely in this slice.
const LEAF = '<p id="t">Some real readable text</p>';
const PARENT = '<div id="t">Some real readable text<p>and a child element</p></div>';

// Every idiom here paints NO ink at all. painted() must return false.
const HOLES = [
  ['color: transparent (rgba path — the one the old parse could still read)', '#t{color:transparent}'],
  ['CHILD-BEARING container declaring transparent ON ITSELF', '#t{color:transparent}', PARENT],
  ['CHILD-BEARING container declaring color-mix 0% ON ITSELF',
   '#t{color:color-mix(in srgb,#111 0%,transparent)}', PARENT],
  ['color-mix 0% — THE SITE IDIOM the old guard could not parse',
   '#t{color:color-mix(in srgb,#111 0%,transparent)}'],
  ['color(srgb 0 0 0 / 0)', '#t{color:color(srgb 0 0 0 / 0)}'],
  ['oklch(0 0 0 / 0)', '#t{color:oklch(0 0 0 / 0)}'],
  ['lab(0 0 0 / 0)', '#t{color:lab(0 0 0 / 0)}'],
  ['-webkit-text-fill-color: transparent (paints the glyph interior)', '#t{-webkit-text-fill-color:transparent}'],
];

// Everything the site really paints. painted() must return true. These are the
// half that stops the check being "fixed" by making it stricter.
const KEEPERS = [
  ['plain opaque text', '#t{color:#111}'],
  ['opaque rgb() black — the case the FIRST regex false-redded', '#t{color:rgb(0,0,0)}'],
  ['color-mix 88% — the real translucent idiom this site ships',
   '#t{color:color-mix(in srgb,#111 88%,transparent)}'],
  ['color(srgb .. / 0.88) — the computed form of that idiom', '#t{color:color(srgb 0.07 0.07 0.07 / 0.88)}'],
  ['ochre on olive, the site minimum at 4.62:1', '#t{color:rgb(201,155,63);background:rgb(65,55,24)}'],
  ['11px type  [THE REFUSED FLOOR]', '#t{color:#111;font-size:11px}'],
  ['a nearly-transparent 0.02 alpha — still ink, still painted', '#t{color:rgba(0,0,0,0.02)}'],
  ['CHILD-BEARING container with ordinary opaque text', '#t{color:#111}', PARENT],
];

const page_ = async (page, extra, body = LEAF) =>
  page.setContent(
    // No background is set on purpose: this slice of painted() compares the
    // glyph's own alpha and never looks at a backdrop, so a fixture background
    // would be an unused literal rather than part of the test.
    `<!doctype html><html><head><style>body{margin:0;padding-top:200px;color:#111}` +
      `#t{font-size:16px}${extra}</style></head><body>${body}</body></html>`,
  );

test.describe('painted() ink-alpha — it rejects unpainted text in every colour syntax', () => {
  test('the fixture really renders readable text, and both tables are populated', async ({ page }) => {
    // The vacuity partner. Every assertion below is "no case leaked"; an empty
    // table or a blank fixture satisfies that and proves nothing.
    expect(HOLES.length, 'the HOLES table was emptied').toBeGreaterThanOrEqual(8);
    expect(KEEPERS.length, 'the KEEPERS table was emptied').toBeGreaterThanOrEqual(8);
    await page_(page, '');
    expect(await page.locator('#t').innerText()).toContain('readable');
    expect(await painted(page.locator('#t')), 'the untouched control must be painted').toBe(true);
  });

  test('HOLES — no unpainted colour syntax counts as painted', async ({ page }) => {
    const leaked = [];
    for (const [label, css, body] of HOLES) {
      await page_(page, css, body);
      if (await painted(page.locator('#t'))) leaked.push(label);
    }
    expect(leaked, `painted() certified ${leaked.length} of ${HOLES.length} unpainted elements`).toEqual([]);
  });

  test('KEEPERS — everything the site really paints stays painted', async ({ page }) => {
    const redded = [];
    for (const [label, css, body] of KEEPERS) {
      await page_(page, css, body);
      if (!(await painted(page.locator('#t')))) redded.push(label);
    }
    // If "[THE REFUSED FLOOR]" appears here, someone has added a minimum font
    // size to painted(). That is a DESIGN.md ruling reserved to the owner and
    // this package does not make it.
    expect(redded, `painted() false-redded ${redded.length} of ${KEEPERS.length} visible elements`).toEqual([]);
  });
});
