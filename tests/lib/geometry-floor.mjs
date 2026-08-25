/* DEF-60. The geometry gate's ROW POPULATION FLOOR — the number that makes a
   shrinking population loud instead of quiet.

   THE HOLE THIS CLOSES. geometry-measure.mjs derives its structural rows from a
   PREDICATE, not a list: a flex or grid box inside a plate holding two or more
   children that are, or contain, a link or a button. Restyle such a row to
   `display: block` and it stops matching. The first run after that edit IS red
   — every `row.*` key reports "in the baseline but NOT measured". But the
   documented answer to a red geometry gate is to regenerate the baseline, and
   regenerating DELETES those keys. The row is then outside the gate for good,
   with an eight-line deletion in the diff as the only trace. A reviewer who
   reads that diff as "the contact row was simplified" is not wrong about the
   markup and is completely wrong about the coverage.

   WHY A FLOOR AND NOT A WIDER PREDICATE. Widening the predicate to include
   `block` would collect elements the gate does not measure today, which changes
   the recorded key set and forces a baseline regeneration on a runner. A floor
   measures EXACTLY the same elements and adds one hard-coded number the
   baseline cannot rewrite — the same trick geometry.spec.js already plays with
   `plateCount` and `docHeight`. Regenerate under `display: block` and the keys
   vanish as before, but the floor is still 7 and the gate still fails.

   ZERO HEADROOM, DELIBERATELY. type-floor.spec.js:77 sets its floors well under
   the measured value because it counts TEXT, and an ordinary copy edit moves
   that number. This counts STRUCTURE. Losing one row is precisely the event the
   floor exists to catch, so a floor of 5 against a measured 7 would sit through
   DEF-60's own mutation — measured: `.contact .ctas { display: block }` takes
   the home page from 7 rows / 26 children to 6 / 21, which clears a floor of 5
   comfortably. Counts get zero slack in geometry-compare.mjs for the same
   reason: a count cannot round. A route that legitimately loses a row edits one
   number here, in the same pull request, where it is read.

   MEASURED 2026-08-25 against the built site, all three widths (390, 768, 1440)
   and both Playwright projects — identical in all six combinations, because
   `kids.length` is DOM children, not painted children, and no media query moves
   a row in or out of the predicate. The earlier note at geometry-measure.mjs:78
   said "7 rows, 26 children" for the home page; re-measured, it is still
   exactly that.

   `stems` ARE NOT A THIRD COUNT — they are the answer to the one hole a
   cross-model review (codex-cli 0.149.1, a different model family, as AGENTS.md
   requires for a test change) found in the counts alone. An aggregate is
   SUBSTITUTABLE: restyle `.contact .ctas` to block AND add an unrelated
   five-link flex row in the same change, and 7 / 26 becomes 6 / 21 becomes
   7 / 26 again, with the five contact controls no longer measured and both
   counts green. Identities refuse that trade — the contact row leaving is red
   whatever arrives to replace it. Each string is the baselined key minus its
   `row.` prefix, so a key rename cannot leave this list stale without also
   failing the comparison.

   NO NEW FALSE POSITIVES, and that is checkable rather than hoped for. A stem
   is `<plate id>/<sorted class list>#<n>`, which is exactly what the baselined
   key is built from — so any edit that changes a stem ALREADY fails the key-set
   comparison in geometry-compare.mjs. Adding a class to `.ctas` was a
   regeneration before this list existed and is a regeneration plus one edited
   line here after it.

   THE LIMIT, stated rather than left to be found. A substitute row that lands
   in the SAME plate with the SAME class list takes the departed row's `#0` and
   satisfies this check. Narrower than the hole it closes, and the row's
   `.tags` and `.child.*` keys go red on the first run regardless, but it is
   not zero and nobody should read this list as proving row sameness. */
/* DEF-58. THE PLATE POPULATION FLOOR, route-shaped. Same job as the row floor
   below and the same reason it lives here: it is a number the baseline cannot
   rewrite, and geometry-selftest.mjs can prove it bites without a browser.

   WHY IT STOPPED BEING A CONSTANT. geometry.spec.js asserted
   `plateCount > (route === '/' ? 4 : 1)`. /cv carries exactly ONE plate, so it
   failed that by construction — and that, not "no plates", is why the geometry
   gate never covered /cv. Route-shaped the way type-floor.spec.js's
   `minTextOwners` and plate-height.spec.js:80 already are.

   NOBODY ELSE GOT WEAKER. The old check was `>` a floor, this one is `>=` a
   minimum, and each number is the old one translated exactly: `/` was `> 4` and
   is `>= 5`; every other plate route was `> 1` and is `>= 2`. Only /cv is new.

   THE DEFAULT IS THE STRICT ONE, deliberately. A route added with no entry here
   gets 2, so forgetting a single-plate route fails LOUDLY instead of passing
   blindly — file-budget.mjs:12's property, the opposite of the DEF-10 / DEF-44
   allowlist trap. A route that legitimately carries one plate is one line here,
   in the pull request that adds it.

   MEASURED 2026-08-25 on the built site, both Playwright projects, at 390, 768
   and 1440: /cv reports plateCount 1 in all six combinations, with its two
   `<details>` panels open or closed. */
export const DEFAULT_MIN_PLATES = 2;
export const MIN_PLATES = { '/': 5, '/cv': 1 };
export const minPlates = (route, map = MIN_PLATES) => map[route] ?? DEFAULT_MIN_PLATES;

/* Returns breach strings, the shape rowFloorBreaches() and compareLeg() use.

   The vacuity guard rides INSIDE this function rather than beside it, so it
   cannot be called without it: a minimum of 0 would accept a page that rendered
   nothing, which is the exact hole DEF-54 was opened for, and `plateCount >= 0`
   is true of every page ever built.

   RED WHEN: a route renders fewer plates than its minimum — `class="cv plate"`
   losing the `plate` word takes /cv from 1 to 0 — or MIN_PLATES gives any route
   under test a minimum below 1. Both are driven in geometry-selftest.mjs.
   NOT this check's job: plates that are in the DOM and never painted. That is
   the spec's `unpainted` list, because `.plate { display: none }` leaves
   querySelectorAll's count untouched. */
export function plateFloorBreaches(route, plateCount, map = MIN_PLATES) {
  const min = minPlates(route, map);
  const breaches = [];
  if (!(min >= 1)) {
    breaches.push(
      `${route}: a minimum of ${min} plates would accept a page that rendered none — ` +
        'a floor of 0 certifies sameness, not coverage',
    );
  }
  if (plateCount < min) {
    breaches.push(
      `${route}: ${plateCount} plates measured, minimum is ${min}. This leg measured nothing, ` +
        'so every comparison below it would certify an empty page.',
    );
  }
  return breaches;
}

export const ROW_FLOOR = {
  '/': {
    rows: 7,
    children: 26,
    stems: ['top/plate-grid#0', 'top/ctas#0', 'citevyn/links#0', 'quorum/links#0',
      'saafsaans/links#0', 'narratwin/links#0', 'contact/ctas#0'],
  },
  '/projects/citevyn': { rows: 2, children: 5, stems: ['citevyn/links#0', 'citevyn-record/ctas.proj-back#0'] },
  '/projects/quorum': { rows: 2, children: 5, stems: ['quorum/links#0', 'quorum-record/ctas.proj-back#0'] },
  '/projects/saafsaans': {
    rows: 2, children: 5, stems: ['saafsaans/links#0', 'saafsaans-record/ctas.proj-back#0'],
  },
  '/projects/narratwin': {
    rows: 2, children: 4, stems: ['narratwin/links#0', 'narratwin-record/ctas.proj-back#0'],
  },
  '/experience': { rows: 1, children: 2, stems: ['evolution-record/ctas#0'] },
  '/how-i-build': {
    rows: 2, children: 4, stems: ['published-skills/skill-repos#0', 'published-skills/ctas#0'],
  },
  /* DEF-58. Measured 2026-08-25, identical in all TWELVE combinations — three
     widths, both projects, `<details>` open and closed. `.cv-contact` is the
     flex list of email / LinkedIn / GitHub plus three plain lines (6 children);
     `.cv-foot` is the two buttons plus the print note (3 children). The two
     `<details>` panels add no row either way: the links inside them sit in
     `<p class="cv-gate">`, which is neither flex nor grid. */
  '/cv': { rows: 2, children: 9, stems: ['cv/cv-contact#0', 'cv/cv-foot#0'] },
};

/* THE PARTNER, per AGENTS.md: "a check that counts nothing needs a partner
   proving the thing counted exists". `rowCount >= floor` is trivially true when
   the floor is 0 or missing, so a hand-typed map is exactly the DEF-10 / DEF-44
   shape — a list that quietly narrows a gate. This refuses both: a route with
   no entry is a breach, not a skip, and a floor under 1 is a breach even if the
   page matches it.

   The map is a PARAMETER with ROW_FLOOR as its default — the injected-reader
   seam file-budget.mjs:61 uses — so geometry-selftest.mjs can drive a broken
   map in memory instead of editing this file and putting it back.

   RED WHEN: a route is added to tests/lib/routes.mjs and not given a floor
   here, any floor in ROW_FLOOR is edited down to 0, or a route's `stems` list
   is emptied or shortened below its row floor. DEF-58 adds the plate minimum to
   the same sweep, for the same reason: `plateCount >= 0` is true of every page
   that ever built. */
export function floorAudit(routes, map = ROW_FLOOR, plates = MIN_PLATES) {
  const breaches = [];
  for (const route of routes) {
    const min = minPlates(route, plates);
    if (!(min >= 1)) {
      breaches.push(`${route}: plate minimum is ${min} — a page with no plates would pass its denominator`);
    }
  }
  if (Object.keys(map).length === 0) {
    breaches.push('ROW_FLOOR is empty — every per-route floor below it would pass on nothing');
  }
  for (const route of routes) {
    if (!map[route]) breaches.push(`${route} is under test but has no ROW_FLOOR entry — it would be ungated`);
  }
  for (const [route, f] of Object.entries(map)) {
    if (!(f?.rows >= 1) || !(f?.children >= 1)) {
      breaches.push(
        `${route}: floor ${JSON.stringify(f)} counts nothing — a floor of 0 certifies sameness, not coverage`,
      );
    }
    /* An empty `stems` list would make the subset check below vacuously true —
       `[].every()` is the same hole as `[].every()` in geometry-compare.mjs, in
       a different costume. The list must also be at least as long as the row
       floor, or a route could name one row and leave the rest anonymous. */
    if (!Array.isArray(f?.stems) || f.stems.length < 1 || f.stems.length < f?.rows) {
      breaches.push(
        `${route}: ${f?.stems?.length ?? 0} row identities named for a floor of ${f?.rows} rows — ` +
          'an unnamed row can be swapped for any other and both counts stay green',
      );
    }
  }
  return breaches;
}

/* One route's floor. Returns breach strings so the caller can report them all
   at once, the shape compareLeg() already uses.

   RED WHEN: a structural row leaves the predicate — `.contact .ctas` restyled
   to `display: block`, a CTA row deleted from a plate, or a row dropping to one
   link/button child. Measured on this tree: that one CSS line takes `/` from
   7 rows / 26 children to 6 / 21, and all three checks below fire. */
export function rowFloorBreaches(route, rowCount, rowChildCount, rowStems = []) {
  const floor = ROW_FLOOR[route];
  if (!floor) return [`${route}: no ROW_FLOOR entry — this route's row population is ungated`];
  const breaches = [];
  const measured = new Set(rowStems);
  const missing = floor.stems.filter((s) => !measured.has(s));
  if (missing.length) {
    breaches.push(
      `${route}: these rows are no longer measured — ${missing.join(', ')}. A named row left the gate, ` +
        'and no arriving row substitutes for it however the totals come out.',
    );
  }
  if (rowCount < floor.rows) {
    breaches.push(
      `${route}: ${rowCount} structural rows measured, floor is ${floor.rows}. A row left the gate's ` +
        'population — it was deleted, or restyled out of the flex/grid predicate (DEF-60).',
    );
  }
  if (rowChildCount < floor.children) {
    breaches.push(
      `${route}: ${rowChildCount} row children measured, floor is ${floor.children}. Controls left the ` +
        "gate's population, or a whole row did.",
    );
  }
  return breaches;
}
