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
