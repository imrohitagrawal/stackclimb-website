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
import { siteRoutes } from './lib/routes.mjs';

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

  // Rule 1 (existence) is SITEWIDE — a declared ground can belong to a plate
  // on ANY route, not only '/'. Package 5 found this the hard way: the first
  // version of this file visited '/' alone, so a ground declared for a
  // plate that lives only on /experience or /how-i-build faulted "no plate
  // with that id exists" the moment it shipped, even though the plate was
  // real — the exact DEF-48 shape, one level down, the same blind spot
  // plate-height.spec.js's own history records for height. ROUTES is
  // shared with that file (tests/lib/routes.mjs) so neither can drift
  // narrower than the other.
  const routes = await siteRoutes();
  const allPlates = {};
  let homePlates = {};
  for (const route of routes) {
    await page.goto(route);
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
    Object.assign(allPlates, plates);
    if (route === '/') homePlates = plates;
  }

  const faults = [];
  for (const [id, value] of declared) {
    if (!(id in allPlates)) {
      faults.push(`palette styles #${id} but no plate with that id exists on any route (DEF-48 shape)`);
      continue;
    }
    if (allPlates[id].ground.toLowerCase() !== value.toLowerCase()) {
      faults.push(`#${id} declares ground ${value} but renders ${allPlates[id].ground}`);
    }
  }
  expect(faults, faults.join(' · ')).toEqual([]);

  // Rule 2 — no two declared grounds anywhere on the site collide. Stays
  // SITEWIDE deliberately: a hue collision is a defect wherever it lands.
  const values = [...declared.values()].map((v) => v.toLowerCase());
  const dupes = values.filter((v, i) => values.indexOf(v) !== i);
  expect(dupes, `palette declares the same ground twice: ${[...new Set(dupes)]}`).toEqual([]);

  // Rule 2b — the ladder SPANS, scoped to the HOME page specifically (D80's
  // zero-slack claim is about home). The expected count is home's OWN
  // declared grounds, not the sitewide total — a ground declared for a
  // plate that never renders on '/' must not inflate a threshold '/' can
  // never meet (the mutation this rewrite fixes: declaring two new,
  // off-home grounds broke this exact line before the fix, because the old
  // code compared home-scoped `rendered` against a sitewide `values.length`).
  const homeDeclaredCount = new Set(
    [...declared.keys()].filter((id) => id in homePlates).map((id) => declared.get(id).toLowerCase()),
  ).size;
  const rendered = new Set(Object.values(homePlates).map((p) => p.bg));
  expect(
    rendered.size,
    `home renders ${rendered.size} distinct grounds; it declares ${homeDeclaredCount} plus the default`,
  ).toBeGreaterThanOrEqual(homeDeclaredCount + 1);
});
