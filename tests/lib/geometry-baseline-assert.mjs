/* The DEF-54 geometry baseline's own integrity checks, kept pure so they can be
   self-tested without a browser — the `audit(files, read)` seam file-budget.mjs
   uses, and the same split geometry-compare.mjs makes for the same reason.

   Extracted from geometry.spec.js in D140. Not a refactor for tidiness: that
   file stood at exactly 250 lines against D8's 250-line ceiling, so the DEF-65
   stamp could not add a line until one was paid for first. The rule is
   modularize, never trim the comments.

   WHY THESE CHECKS EXIST AT ALL. Two empty sets compare equal, so a gate
   reporting "0 breaches" against an empty baseline has certified sameness, not
   correctness — the ["",""] hole a cross-model review found in contact.spec.js,
   one level up. Everything here is the partner that proves the thing counted
   exists.

   RED WHEN: delete a leg from the baseline, empty one to {}, or regenerate
   against a page that did not render. Driven in both directions by
   tests/geometry-selftest.mjs, which needs no browser and writes no file. */

/* Returns a list of human-readable problems. Empty means the baseline is real.
   `baseline` may be null — that is the caller's case to report, not this one's,
   because "no file at all" and "a file that certifies nothing" want different
   messages and different remedies. */
export function baselineIntegrityProblems(baseline, { widths, routes, nProjects }) {
  if (!baseline) return ['no baseline object was passed'];
  const problems = [];
  const legs = Object.keys(baseline);

  /* Derived from the config, not typed as a number: add a third Playwright
     project and this expects its legs the same day, rather than passing on a
     matrix that silently lost a third of its coverage. It is also what makes
     the update path's leg-pruning safe to trust — a route or width removed
     without regenerating shows up here as a count mismatch. */
  const expected = widths.length * routes.length * nProjects;
  if (legs.length !== expected) {
    problems.push(`the baseline records ${legs.length} legs, not ${expected}`);
  }

  const empty = legs.filter((l) => Object.keys(baseline[l]).length === 0);
  if (empty.length) problems.push(`legs recorded with nothing in them:\n${empty.join('\n')}`);

  /* A denominator for the denominator: the home page must carry more keys than
     any other route, or the baseline was captured against a page that did not
     render. */
  const home = legs.filter((l) => l.endsWith('//'));
  if (home.length !== widths.length * nProjects) {
    problems.push(`no home-page legs in the baseline — found ${home.length}, expected ${widths.length * nProjects}`);
  }
  for (const leg of home) {
    const n = Object.keys(baseline[leg]).length;
    if (n <= 20) problems.push(`${leg} records too little to be the home page — ${n} keys`);
  }

  return problems;
}
