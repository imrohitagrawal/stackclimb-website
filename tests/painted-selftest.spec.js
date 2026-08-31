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
// RED WHEN, in tests/lib/painted.mjs. These are MEASURED counts from the run,
// not predictions — an earlier draft of this block guessed five of them wrong,
// which is the same defect the round-2 review caught elsewhere in this change.
// Each mutation was grep-confirmed to land on a CODE line, never a comment.
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

const GRAD = '#wrap{background:linear-gradient(#f00,#00f)}';

/* [label, inline style on #t, extra CSS, shape]. Shapes are in build(). */
const HOLES = [
  // --- LEAF shape: #t is a <p> holding its own text ---
  ['white-on-white', 'color:#fff', ''],
  ['white-on-white over a coloured ancestor', 'color:#123456', '#wrap{background:#123456}'],
  ['1px tall + overflow hidden', 'height:1px;overflow:hidden', ''],
  // Pins the floor's LOWER bound. G1 only proves the floor is not absent;
  // without a case between 2 and 4px, lowering it to >= 2 stays green.
  ['3px tall — just under the 4px floor', 'height:3px;overflow:hidden', ''],
  ['ancestor overflow:hidden height:0', '', '#wrap{height:0;overflow:hidden}'],
  ['ancestor overflow:clip height:0', '', '#wrap{height:0;overflow:clip}'],
  // A plain wrapper sits between #t and the clipping ancestor: narrowing the
  // walk to the direct parent stays green without this row.
  ['GRANDPARENT overflow:hidden height:0', '', '#wrap{height:0;overflow:hidden}', 'NESTED'],
  // Horizontal clip. #t keeps its own 400px rect and overflows right, so the
  // x-axis intersection is the only thing that catches it.
  ['ancestor width:0 overflow:hidden, text overflowing right', 'width:400px', '#wrap{width:0;overflow:hidden}'],
  // The explicit height is load-bearing: a bare content-visibility:hidden
  // collapses the box, so the 4px floor catches it and this line's mutation
  // reports a false green.
  ['content-visibility:hidden WITH an explicit height', 'content-visibility:hidden;height:50px', ''],
  ['transform:scale(0)', 'transform:scale(0)', ''],
  ['transform:scale(0.02)', 'transform:scale(0.02)', ''],
  ['font-size:0 with padding, and a child element', 'font-size:0;padding:20px', ''],
  // No child element at all: with a child present, dropping `el` from the node
  // set still catches it via the child, and the mutation reports a false green.
  ['font-size:0 with padding, LEAF with no child element', 'font-size:0;padding:20px', '', 'BARE'],
  ['color:transparent (the legacy syntax)', 'color:transparent', ''],
  // These four MUST sit over a gradient. Over a flat backdrop the identity
  // check catches alpha-0 as a side effect, the fill-alpha mutation reports a
  // false green, and that line looks unnecessary.
  ['color(srgb 0 0 0 / 0) over a gradient', 'color:color(srgb 0 0 0 / 0)', GRAD],
  ['oklch(0 0 0 / 0) over a gradient', 'color:oklch(0 0 0 / 0)', GRAD],
  [
    'color-mix(in srgb, #111 0%, transparent) over a gradient — the site idiom',
    'color:color-mix(in srgb,#111 0%,transparent)',
    GRAD,
  ],
  ['-webkit-text-fill-color:transparent over a gradient', '-webkit-text-fill-color:transparent', GRAD],
  ['the sr-only 1x1 clip idiom', 'position:absolute;width:1px;height:1px;overflow:hidden', ''],
  // --- CONTAINER shape: #t is a <div> whose only text is in .inner ---
  ['CONTAINER, child color:transparent', '', '.inner{color:transparent}', 'CONTAINER'],
  [
    'CONTAINER, child color-mix 0% — the site idiom',
    '',
    '.inner{color:color-mix(in srgb,#111 0%,transparent)}',
    'CONTAINER',
  ],
  [
    'CONTAINER, child -webkit-text-fill-color:transparent',
    '',
    '.inner{-webkit-text-fill-color:transparent}',
    'CONTAINER',
  ],
  ['CONTAINER, child white-on-white', '', '.inner{color:#fff}', 'CONTAINER'],
  ['CONTAINER, child opacity:0', '', '.inner{opacity:0}', 'CONTAINER'],
  ['CONTAINER, child visibility:hidden', '', '.inner{visibility:hidden}', 'CONTAINER'],
  ['CONTAINER, child font-size:0 — all of its text', '', '.inner{font-size:0}', 'CONTAINER'],
  // DEF-80. Every prior CONTAINER fixture put the text one level below #t
  // (#t > .inner). A regression that narrows the descendant walk from
  // el.querySelectorAll('*') to ':scope > *' still passes every one of them,
  // because a direct child is still ':scope > *'. This one puts the text a
  // full GRANDCHILD down (#t > .mid > .inner), which only the wider,
  // unnarrowed walk can reach — the fixture pair the contract's row 5 exists
  // to require.
  ['GRANDCHILD, text two levels deep, transparent', '', '.inner{color:transparent}', 'GRANDCHILD'],
];

const KEEPERS = [
  ['ordinary body text', '', ''],
  ['11px type  [THE REFUSED FLOOR]', 'font-size:11px', ''],
  ['11.52px small caps', 'font-size:11.52px;letter-spacing:.08em', ''],
  [
    'ochre on olive, 4.62:1 — the site\'s lowest real pair',
    'color:rgb(201,155,63)',
    '#wrap{background:rgb(65,55,24)}',
  ],
  ['an 18.4px-tall row — the site\'s smallest real box', 'font-size:11.52px;height:18.4px;overflow:hidden', ''],
  [
    'translucent color(srgb .. / .88) — the site\'s own colour idiom',
    'color:color(srgb 0.94902 0.921569 0.866667 / 0.88)',
    '#wrap{background:#16213c}',
  ],
  ['a real scroll container ancestor, not clipping to 0', '', '#wrap{height:400px;overflow:auto}'],
  ['a font-size:0 wrapper whose text lives in a sized child', 'font-size:0', '', 'EMPTYBOX'],
  // MOVED FROM HOLES in round 2. A reader sees "Some real readable text"; only
  // the trailing span is zero-sized. Shipping this as a HOLE baked a false red
  // into the receipt and is what forced the at-least-one rule.
  ['a zero-sized span BESIDE visible text', '', '#t span{font-size:0}'],
  // The container partner for the same rule. This site has NO sr-only class
  // (grep over src/styles, src/components, src/pages, src/layouts finds none
  // — the only hit is the words "screen-reader" in a prose comment), so this
  // fixture is synthetic on purpose: it is what stops someone "fixing" a
  // future finding with an every-node rule.
  ['CONTAINER whose visible text sits beside a HIDDEN child', '', '', 'SRONLY'],
  // Without the abandon guard these FALSE-RED: the backdrop walk finds no
  // opaque background-COLOR, falls through to the white page default, and
  // matches white-on-white. DEF-46's lesson inside one fixture.
  [
    'an ancestor painting a background-IMAGE behind the text',
    'color:#fff',
    '#wrap{background-image:linear-gradient(#000,#111)}',
  ],
  ['an ancestor carrying mix-blend-mode', 'color:#f2ebdd', '#wrap{background:#16213c;mix-blend-mode:overlay}'],
];

const BODIES = {
  LEAF: '<div id="wrap"><p id="t">Some real readable text <span>tail</span></p></div>',
  BARE: '<div id="wrap"><p id="t">Some real readable text</p></div>',
  EMPTYBOX: '<div id="wrap"><p id="t"><span style="font-size:16px">visible child text</span></p></div>',
  CONTAINER: '<div id="wrap"><div id="t"><p class="inner">real readable text</p></div></div>',
  GRANDCHILD:
    '<div id="wrap"><div id="t"><div class="mid"><p class="inner">real readable text</p></div></div></div>',
  NESTED: '<div id="wrap"><div class="mid"><p id="t">Some real readable text <span>tail</span></p></div></div>',
  SRONLY:
    '<div id="wrap"><div id="t"><p class="inner">real readable text</p>' +
    '<p class="hid" hidden>collapsed helper text</p></div></div>',
};

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
    expect(HOLES.length, 'the HOLES table was emptied').toBeGreaterThanOrEqual(26);
    expect(KEEPERS.length, 'the KEEPERS table was emptied').toBeGreaterThanOrEqual(12);
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
