// The one list of routes with plates, shared by plate-height.spec.js and
// palette-ladder.spec.js. Package 5's fan caught the risk before it landed:
// two specs hand-deriving "every route" independently is the DEF-10/DEF-44
// class (a route silently narrows in one file, not the other) one file away
// from happening again. Derived from projects.js, not hand-typed.
export async function siteRoutes() {
  const { projects } = await import('../../src/data/projects.js');
  return [
    '/',
    ...Object.keys(projects).map((s) => `/projects/${s}`),
    '/experience',
    '/how-i-build',
  ];
}

/* DEF-58. The GEOMETRY gate's routes: every plate route above, plus /cv.
   dist/cv.html carries exactly one plate — `<article class="cv plate" id="cv">`
   — so the note that excluded it ("it carries zero .plate[id]") was simply
   wrong. What actually kept it out was geometry.spec.js's old constant
   denominator, `plateCount > 1`, which a single-plate route fails by
   construction.

   /cv IS DELIBERATELY NOT IN siteRoutes(), and must not be moved there. Five
   files consume that list — type-floor.spec.js, palette-ladder.spec.js,
   geometry.spec.js, plate-height.spec.js, geometry-selftest.mjs. Two of them
   would change behaviour on the spot: type-floor.spec.js already composes
   `[...siteRoutes(), '/cv', '/404']`, so /cv would run TWICE there, and
   plate-height.spec.js and palette-ladder.spec.js would silently gain a route
   in a change that is about one gate.

   Composed HERE rather than inline in geometry.spec.js so the spec and
   geometry-selftest.mjs read the SAME list. Two files hand-deriving "every
   route" independently is exactly the DEF-10 / DEF-44 shape this file exists to
   refuse — the selftest's floorAudit() must audit the routes the spec runs, or
   a route can be added to one and stay ungated in the other. */
export async function geometryRoutes() {
  return [...(await siteRoutes()), '/cv'];
}
