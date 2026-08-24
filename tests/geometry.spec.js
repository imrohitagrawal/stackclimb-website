import { test, expect } from '@playwright/test';
import { siteRoutes } from './lib/routes.mjs';
import { measureGeometry, NEUTRALIZE_MOTION } from './lib/geometry-measure.mjs';
import { compareLeg, PX_TOLERANCE } from './lib/geometry-compare.mjs';
import { BASELINE, UPDATING, readBaseline, writeBaseline, expectedLegs } from './lib/geometry-baseline-io.mjs';

/* DEF-54. The blocking gate on this site's layout is now a NUMBER, not a
 * photograph.
 *
 * WHY. visual-baselines.spec.js:24 states its own job as "the nav's layout
 * shifts, a plate's box moves or resizes, or a seam gap changes". Every one of
 * those is a number, and comparing photographs is a lossy proxy for measuring
 * one. On this site the proxy is dominated by noise that is not layout at all:
 * measured on committed baselines against CI regeneration run 32711313743,
 * render noise on an untouched plate was 3.17% while a plate that gained a
 * whole button changed 2.42% — the noise EXCEEDS the signal, so no threshold
 * orders them correctly. The noise is text re-hinting flipping #f2ebdd to
 * #1b2440 at glyph edges, a maximal per-pixel delta, which is why sweeping the
 * colour threshold from >12 to >120 never separated them either.
 *
 * WHAT THIS REPLACES, AND WHAT IT DOES NOT. Precision is this file's job.
 * visual-baselines.spec.js stays as a coarse catastrophe net and as the PNG a
 * human can look at. Geometry cannot see colour, contrast, an overlay,
 * `opacity: 0`, or `color: transparent` — those are boundary-check.mjs,
 * nav-contrast.mjs, the axe sweep in dod.spec.js, and the pixel net. That
 * limit is written here rather than left for someone to discover.
 *
 * WHICH CHANGE TURNS EACH RED (every one run as a mutation before shipping):
 *   plate.<id>          move or resize any .plate[id] by more than the slack,
 *                       or change the seam gap above it
 *   nav                 change .site-nav's padding or type size
 *   row.*.count         add or delete a control in a CTA row (D112's copy
 *                       button: 4 -> 5), or stop drawing one that ships
 *   row.*.tags          reorder or retype a row's children — the only
 *                       assertion that sees two equal-width buttons swapped
 *   row.*.child.<i>     revert the .contact .ctas grid rule: at 390 thirteen
 *                       child numbers move, the largest by 180px
 *   key sets            a plate appears unbaselined, or a baselined plate
 *                       vanishes
 *   denominators        `.plate { display: none }`, `body { display: none }`,
 *                       or an empty baseline
 *
 * TOLERANCE, under its honest name. Pixel values are rounded once at capture
 * and compared with a slack of 1, so the real window reaches ~2px: two
 * measurements 1.999px apart can round to integers 1 apart. Calling that
 * "+/-1px" would be unearned precision. It is still an order of magnitude
 * under the signal — DEF-55 measured run-to-run noise at exactly 1px on
 * untouched plates (plate-citevyn-390 1305 -> 1306) while a real change moved
 * plate-top-390 by 40px. Counts and tag sequences get ZERO slack.
 *
 * WHICH WORLD IS RECORDED: JavaScript ON, in a secure context, with motion
 * neutralized (see geometry-measure.mjs) — the same world visual-baselines.spec.js
 * captures, except that this file sweeps the width while keeping each project's
 * own viewport HEIGHT, where that file pins 900 for both. Height is not cosmetic:
 * `.plate` is `min-height: 100svh`. It is also the world in which D112's copy
 * control is revealed — `copy-email.js` un-hides it
 * only when navigator.clipboard is reachable, and localhost IS secure. The
 * JS-off page is gated by contact.spec.js's own no-JS test, not here. Measured:
 * plate boxes are IDENTICAL with JS on and off; only the row's painted count
 * differs (5 vs 4), which the two-number count records.
 *
 * REGENERATE THE COMMITTED (linux) BASELINE: run gates.yml's
 * `update_geometry_baseline` dispatch, download the artifact, commit it. Never
 * hand-generate it on a laptop — a darwin run writes a DIFFERENT file that CI
 * never reads, and the 42px measurement above is why.
 * A local darwin baseline, for working on this gate on a Mac, is
 *   UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1
 * and it is gitignored. --workers=1 is enforced, not requested: the spec throws
 * without it, because parallel workers are separate processes and the last to
 * write would drop the others' legs.
 */

const WIDTHS = [390, 768, 1440];

const ROUTES = await siteRoutes();


/* Accumulated across every test in this run, then written whole. Never merged
   into the file on disk: a merge keeps a key for a plate that was deleted, and
   the gate would go on asserting geometry that no longer exists. */
const collected = {};

const legKey = (project, width, route) => `${project}/w${String(width).padStart(4, '0')}/${route}`;

const baseline = readBaseline(BASELINE);

test.describe('Geometry baselines — DEF-54', () => {
  test('the baseline itself is a real baseline', async ({}, testInfo) => {
    /* RED WHEN: tests/geometry-baseline.json is deleted, emptied to {}, or
       regenerated against a broken page. This runs before any comparison
       because two empty sets compare equal: a gate that reports "0 breaches"
       against an empty baseline has certified sameness, not correctness — the
       ["",""] hole a cross-model review found in contact.spec.js, one level up.
       Playwright's own toHaveScreenshot writes a missing snapshot and passes;
       that behaviour is deliberately NOT copied here. */
    test.skip(UPDATING, 'the baseline is being written by this run');
    expect(
      baseline,
      `no ${BASELINE}. On linux, that file is committed and its absence is a real failure. ` +
        'On any other platform it is gitignored and yours to generate: ' +
        'UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1',
    ).not.toBeNull();

    /* Derived from the config, not typed as a number: add a third Playwright
       project and this expects its legs the same day, rather than passing on a
       matrix that silently lost a third of its coverage. It is also what makes
       the update path's leg-pruning safe to trust — a route or width removed
       without regenerating shows up here as a count mismatch. */
    const nProjects = testInfo.config.projects.length;
    const legs = Object.keys(baseline);
    expect(legs.length, `the baseline records ${legs.length} legs, not ${WIDTHS.length * ROUTES.length * nProjects}`)
      .toBe(WIDTHS.length * ROUTES.length * nProjects);

    const empty = legs.filter((l) => Object.keys(baseline[l]).length === 0);
    expect(empty, `legs recorded with nothing in them:\n${empty.join('\n')}`).toEqual([]);

    /* A denominator for the denominator: the home page must carry more keys
       than any other route, or the baseline was captured against a page that
       did not render. */
    const home = legs.filter((l) => l.endsWith('//'));
    expect(home.length, 'no home-page legs in the baseline').toBe(WIDTHS.length * nProjects);
    for (const leg of home) {
      expect(Object.keys(baseline[leg]).length, `${leg} records too little to be the home page`)
        .toBeGreaterThan(20);
    }
  });

  for (const width of WIDTHS) {
    for (const route of ROUTES) {
      test(`${width}px ${route} — geometry matches the baseline`, async ({ page }, testInfo) => {
        /* RED WHEN: any plate, nav height, seam gap or CTA row on this route at
           this width moves, resizes, gains a child, loses a child, or has its
           children reordered. */
        if (UPDATING && testInfo.config.workers !== 1) {
          throw new Error(
            'UPDATE_GEOMETRY needs --workers=1. Parallel workers are separate processes and ' +
              'the last one to write would silently drop the others\' legs — a truncated ' +
              'baseline that then passes vacuously.',
          );
        }

        /* Sweep the width, keep the project's own height. Height is not
           cosmetic here: global.css gives .plate `min-height: 100svh`, so every
           plate's height is a direct function of it. plate-height.spec.js:72
           pins both axes for the same reason. Derived from the project rather
           than a hand-typed map, so a third project is measured the day it is
           added instead of crashing on a missing entry. */
        const height = testInfo.project.use.viewport?.height;
        expect(height, `project ${testInfo.project.name} configures no viewport height`).toBeTruthy();
        await page.setViewportSize({ width, height });

        await page.goto(route, { waitUntil: 'networkidle' });
        /* Not decoration. `networkidle` waits for the font REQUEST to finish,
           not for the browser to apply it to layout — D111 paid three CI rounds
           to learn that, and DEF-54 records fourteen baselines left stale by
           exactly 1px because of it. Fonts change glyph metrics, metrics change
           wrap points, wrap points change block heights. This is the single
           most load-bearing wait in the file. */
        await page.evaluate(() => document.fonts.ready);
        await page.addStyleTag({ content: NEUTRALIZE_MOTION });

        const first = await page.evaluate(measureGeometry);
        /* Quiescence proved, not slept for. Two captures 250ms apart must agree
           before either is trusted — a check with a denominator instead of a
           magic number. */
        await page.waitForTimeout(250);
        const { keys, plateCount, docHeight } = await page.evaluate(measureGeometry);
        expect(JSON.stringify(first.keys), 'the page was still settling — two captures disagreed')
          .toBe(JSON.stringify(keys));

        /* DENOMINATORS. Each is hard-coded on purpose: it is the one thing the
           baseline cannot corrupt. Regenerate while `.plate { display: none }`
           is in force and every recorded number is 0, after which "matches the
           baseline" passes forever — DEF-54's own failure, one level up. */
        const floor = route === '/' ? 4 : 1;
        expect(plateCount, `only ${plateCount} plates on ${route} — this test measured nothing`)
          .toBeGreaterThan(floor);
        expect(docHeight, `${route} is ${docHeight}px tall — the page did not render`)
          .toBeGreaterThan(height);

        /* Counting NODES is not counting PLATES: `body { display: none }` leaves
           every plate in the DOM, still enumerable, still reporting its children,
           with every box at 0. Measured, not reasoned. Note this deliberately
           does NOT skip zero-sized elements the way tap-targets.spec.js:47 does —
           that line is correct there and fatal here, because under
           `body { display: none }` everything is zero-sized, everything would be
           skipped, and the gate would find no faults in a blank page. */
        const unpainted = Object.entries(keys)
          .filter(([k, v]) => k.startsWith('plate.') && (v[1] < 100 || v[2] < 200))
          .map(([k, v]) => `${k} is ${v[1]}x${v[2]}`);
        expect(unpainted, `plates in the DOM but not rendered:\n${unpainted.join('\n')}`).toEqual([]);

        const leg = legKey(testInfo.project.name, width, route);
        if (UPDATING) {
          collected[leg] = keys;
          test.skip(true, `recorded ${leg}`);
          return;
        }

        const breaches = compareLeg(leg, baseline?.[leg], keys);
        expect(
          breaches,
          `${breaches.length} geometry breach(es) — slack ${PX_TOLERANCE}px, zero on counts and tags:\n` +
            `${breaches.join('\n')}\n\n` +
            'If this is intended, regenerate and review the diff:\n' +
            '  UPDATE_GEOMETRY=1 npx playwright test tests/geometry.spec.js --workers=1',
        ).toEqual([]);
      });
    }
  }

  test.afterAll(({}, testInfo) => {
    if (!UPDATING || Object.keys(collected).length === 0) return;
    writeBaseline(BASELINE, collected, expectedLegs(testInfo.config.projects, WIDTHS, ROUTES, legKey));
  });
});
