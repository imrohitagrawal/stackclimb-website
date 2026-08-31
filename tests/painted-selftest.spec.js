// The self-test for painted() — tests/lib/painted.mjs, the repo's standard
// "is this element actually visible" check.
//
// WHY THIS EXISTS. painted() is the most-imported assertion helper in the
// suite and it is the partner that stops a geometry or text check certifying
// something no visitor can see. Every one of its call sites asserts
// .toBe(true); not one asserts false. So nothing proved it CAN return false,
// and a check never proved to bite has proven nothing. Measured before this
// file existed: 22 of 24 invisibility idioms passed it. RCA-017.
//
// CONTAINER SCOPE IS THE POINT, AND ROUND 1 MISSED IT. The first version of
// this file tested only LEAF shape — a <p> holding its own text. Review
// measured that every colour and visibility hole came straight back one level
// down, because the real call sites are CONTAINERS: #proof is a whole plate
// section, .era-list is a list. So the tables below carry both shapes, and the
// container rows are the ones that would have shipped a false green.
//
// AT LEAST ONE, NEVER ALL. painted(el) is true when AT LEAST ONE text-bearing
// node under el is painted. An "every node must paint" rule false-reds a
// paragraph whose trailing span is zero-sized — a real reader sees the
// paragraph. That defect WAS in round 1 as a HOLE row; it is now the KEEPER
// labelled "a zero-sized span BESIDE visible text".
//
// THE KEEPERS ARE THE REFUSAL RECEIPT. The font-size floor is EXACTLY ZERO and
// stays there. How small this site sets a fact is a DESIGN.md ruling and the
// owner's under P-18. The keeper labelled "[THE REFUSED FLOOR]" turns red the
// moment anyone raises that floor to 11.5px — which reds 38 of 100 real
// call-site instances on the live build, and 54 at 12px.
//
// RED WHEN, in tests/lib/painted.mjs. MEASURED against the 27 HOLES / 12
// KEEPERS population that existed before this session's review round added
// ten more fixtures (now 33/16, closing a real gate-adversarial-review gap —
// several concrete-verdict matrix rows had no fixture at all). NOT re-run
// against the expanded table: a genuinely honest count needs re-executing
// all 14 mutations, not guessing whether a new fixture also flips under one.
// Two of the numbers below are near-certainly now stale ("delete the
// fill-alpha rejection" should include the new lab() fixture; "PARTNER raise
// the floor 4 -> 24" should include the new normal-height KEEPERS) — flagged
// rather than silently left to imply currency they don't have. Each mutation
// WAS grep-confirmed to land on a CODE line, never a comment, when measured.
//
//   mutation                                     holes flipped | keepers red
//   delete the 4px floor line                          9              0
//   lower the 4px floor 4 -> 2                         1              0
//   ancestor-overflow branch -> if (false)             4              0
//   drop the y-axis clip intersection                  3              0
//   drop the x-axis clip intersection                  1              0
//   narrow the ancestor walk to el.parentElement       1              0
//   delete the contentVisibility line                  1              0
//   delete the fontSize check in inked()               2              0
//   narrow textNodes to [el]                           6              1
//   delete the per-node seen(n) check                  2              0
//   delete the fill-alpha rejection                    4              0
//   delete the identity rejection                      3              0
//   delete the abandon guard                           0              1
//   PARTNER raise the floor 4 -> 24                    0             12
//   PARTNER raise the font floor === 0 -> < 11.5       0              1
//
// Two of those are worth reading twice. "narrow textNodes to [el]" is the
// round-1 defect itself: it flips all six CONTAINER holes AND false-reds the
// font-size:0 wrapper, so it fails in both directions at once. And the last
// two are the PARTNERS — a check that only ever counts holes at zero proves
// nothing, so raising the box floor must red every keeper, and raising the
// font floor must red the one labelled REFUSED and nothing else.
//
// FIXTURES ONLY, DELIBERATELY. Everything is page.setContent, so no route, no
// animation, no settle race. painted() is time-dependent on a bare goto with
// motion live (DEF-77), so a self-test that navigated a real route would be
// the flakiest file in the suite.

import { test, expect } from '@playwright/test';
import { painted } from './lib/painted.mjs';
import { HOLES, KEEPERS, BODIES } from './lib/painted-selftest-fixtures.mjs';

const build = (page, inline, extra, shape) =>
  page.setContent(
    `<!doctype html><html><head><style>
       body{margin:0;padding-top:200px;background:#fff;font-family:sans-serif;color:#111}
       #t{color:#111;font-size:16px;${inline}} ${extra}
     </style></head><body>${BODIES[shape] || BODIES.LEAF}</body></html>`,
  );

test.describe('painted() self-test — it rejects what it claims to, and keeps what the site paints', () => {
  // Fixed viewport in both projects. Nothing here depends on device width, and
  // a self-test whose verdict moves with the runner is not a self-test.
  test.use({ viewport: { width: 1440, height: 900 } });

  test('the harness really renders readable text, and both tables are populated', async ({ page }) => {
    // THE VACUITY PARTNERS. Both table assertions below are toEqual([]), which
    // an EMPTY table satisfies. These three lines are what stop this file
    // certifying nothing: the tables have rows, and the fixture builder really
    // produces a painted, text-bearing element.
    expect(HOLES.length, 'the HOLES table was emptied or shrank').toBeGreaterThanOrEqual(34);
    expect(KEEPERS.length, 'the KEEPERS table was emptied or shrank').toBeGreaterThanOrEqual(15);
    await build(page, '', '', null);
    const loc = page.locator('#t');
    await expect(loc).toHaveText(/Some real readable text/);
    const box = await loc.boundingBox();
    expect(box.height, 'the fixture paragraph must have a real box').toBeGreaterThan(10);
    expect(await painted(loc), 'the control fixture must be painted').toBe(true);
  });

  test('HOLES — not one invisibility idiom counts as painted', async ({ page }) => {
    const passed = [];
    for (const [label, inline, extra, shape] of HOLES) {
      await build(page, inline, extra, shape);
      if (await painted(page.locator('#t'))) passed.push(label);
    }
    expect(passed, `painted() certified ${passed.length} of ${HOLES.length} invisible elements`).toEqual([]);
  });

  test('KEEPERS — everything the site really paints stays painted', async ({ page }) => {
    const redded = [];
    for (const [label, inline, extra, shape] of KEEPERS) {
      await build(page, inline, extra, shape);
      if (!(await painted(page.locator('#t')))) redded.push(label);
    }
    // A false RED is the worse failure: it does not weaken a gate, it stops a
    // true one. "[THE REFUSED FLOOR]" in this list means someone enacted a type
    // ruling that is the owner's. Either sr-only keeper in it means someone
    // replaced the at-least-one rule with an every-node rule.
    expect(redded, `painted() false-redded ${redded.length} of ${KEEPERS.length} visible elements`).toEqual([]);
  });
});

