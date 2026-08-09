// The value ladder must actually LAND. Two rules, both derived from the
// shipped artifact, nothing hand-typed:
//
//   1. Every `#id { --ground: … }` rule in the built CSS must match a plate
//      in the built HTML, and that plate must render its OWN ground — not the
//      :root fallback.
//   2. The rendered plates must span the ladder: at least as many distinct
//      grounds as the palette declares. Flattening five grounds to one colour
//      made every contrast gate GREENER (DEF-16 — floors reward flattening),
//      so a floor cannot hold this; only a distinctness count can.
//
// Why this exists (DEF-48): palette.css styled `#work` for a full day after
// DEF-34 renamed the plate to `citevyn`. The selector matched zero elements,
// CiteVyn silently fell back to the navy default, four of eight plates painted
// the same ground, and every gate stayed green. A palette rule that matches
// nothing is indistinguishable from a palette rule that works — unless
// something counts.
//
// What turns it red: renaming a plate id without its palette rule (rule 1) —
// the exact DEF-48 mutation; deleting a plate that has a palette entry
// (rule 1); setting five grounds to one colour (rule 2, the DEF-16 mutation).

import { test, expect } from '@playwright/test';
import { readFileSync, readdirSync } from 'node:fs';

function declaredGrounds() {
  // Parse the CSS that SHIPS, not the source that builds it — the lesson of
  // the project-doc-skills correction in STATUS.md.
  const dir = 'dist/_astro';
  const css = readdirSync(dir)
    .filter((f) => f.endsWith('.css'))
    .map((f) => readFileSync(`${dir}/${f}`, 'utf8'))
    .join('\n');
  const out = new Map();
  // #id{...--ground:value...} — minified or not.
  for (const m of css.matchAll(/#([a-z][\w-]*)\s*\{[^}]*--ground:\s*([^;}]+)[;}]/gi)) {
    out.set(m[1], m[2].trim());
  }
  return out;
}

test('every palette ground rule lands on a real plate', async ({ page }) => {
  const declared = declaredGrounds();
  // DENOMINATOR: a build with no per-plate grounds at all must not pass as
  // "nothing to check".
  expect(declared.size, 'no #id --ground rules found in the built CSS').toBeGreaterThan(3);

  await page.goto('/');
  const plates = await page.evaluate(() =>
    Object.fromEntries(
      [...document.querySelectorAll('.plate[id]')].map((pl) => [
        pl.id,
        {
          ground: getComputedStyle(pl).getPropertyValue('--ground').trim(),
          bg: getComputedStyle(pl).backgroundColor,
        },
      ]),
    ),
  );
  const rootGround = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.plate')).getPropertyValue('--ground'),
  );

  const faults = [];
  for (const [id, value] of declared) {
    if (!(id in plates)) {
      faults.push(`palette styles #${id} but no plate with that id exists (DEF-48 shape)`);
      continue;
    }
    if (plates[id].ground.toLowerCase() !== value.toLowerCase()) {
      faults.push(`#${id} declares ground ${value} but renders ${plates[id].ground}`);
    }
  }
  expect(faults, faults.join(' · ')).toEqual([]);

  // Rule 2 — the ladder spans. First attempt derived the expected count from
  // the declared values and was refuted by its own mutation: flattening four
  // grounds to one colour shrank "declared" and "rendered" together, so the
  // check chased the defect downward and passed (the same self-reference that
  // makes floors reward flattening, DEF-16). The invariant that does not move
  // with the mutation is the ladder's own premise: EVERY plate has its own
  // ground, so declared values must be pairwise distinct.
  const values = [...declared.values()].map((v) => v.toLowerCase());
  const dupes = values.filter((v, i) => values.indexOf(v) !== i);
  expect(dupes, `palette declares the same ground twice: ${[...new Set(dupes)]}`).toEqual([]);

  // And the render must carry them: declared grounds plus the shared default.
  const rendered = new Set(Object.values(plates).map((p) => p.bg));
  expect(
    rendered.size,
    `plates render ${rendered.size} distinct grounds; the palette declares ${values.length} plus the default`,
  ).toBeGreaterThanOrEqual(new Set(values).size + 1);

  void rootGround; // read for debugging output on failure traces
});
